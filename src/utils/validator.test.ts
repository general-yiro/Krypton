import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAccountInput,
  safeSearchAccounts,
  detectCardNetwork,
  maskCardNumber,
  auditPinStrength,
  parseRawAccountSnippet,
} from './validator';
import { AccountRecord } from '../types/account';

test('validateAccountInput rejects missing required fields', () => {
  const result = validateAccountInput({
    name: '',
    accountNumber: '',
    phoneNumber: '',
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.accountNumber);
  assert.ok(result.errors.phoneNumber);
});

test('validateAccountInput enforces ATM module required fields when hasAtm is true', () => {
  const resultWithoutAtmDetails = validateAccountInput({
    name: 'Personal Checking',
    accountNumber: '100029384756',
    phoneNumber: '+15551234567',
    atm: {
      hasAtm: true,
      atmNumber: '',
      cvv: '',
      atmPin: '',
    },
  });

  assert.equal(resultWithoutAtmDetails.isValid, false);
  assert.ok(resultWithoutAtmDetails.errors.atmNumber);
  assert.ok(resultWithoutAtmDetails.errors.cvv);
  assert.ok(resultWithoutAtmDetails.errors.atmPin);

  const resultWithValidAtm = validateAccountInput({
    name: 'Personal Checking',
    accountNumber: '100029384756',
    phoneNumber: '+15551234567',
    atm: {
      hasAtm: true,
      atmNumber: '4111222233334444',
      cvv: '123',
      atmPin: '8492',
    },
  });

  assert.equal(resultWithValidAtm.isValid, true);
  assert.equal(Object.keys(resultWithValidAtm.errors).length, 0);
});

test('validateAccountInput enforces Mobile Banking PIN when hasMobileBanking is true', () => {
  const invalidResult = validateAccountInput({
    name: 'Mobile Wallet',
    accountNumber: 'MW-99182',
    phoneNumber: '+251911223344',
    mobileBanking: {
      hasMobileBanking: true,
      mobileBankingPin: '',
    },
  });

  assert.equal(invalidResult.isValid, false);
  assert.ok(invalidResult.errors.mobileBankingPin);

  const validResult = validateAccountInput({
    name: 'Mobile Wallet',
    accountNumber: 'MW-99182',
    phoneNumber: '+251911223344',
    mobileBanking: {
      hasMobileBanking: true,
      mobileBankingPin: '4821',
    },
  });

  assert.equal(validResult.isValid, true);
});

test('SECURITY LAW 2: safeSearchAccounts NEVER searches or matches against PIN fields', () => {
  const sampleAccounts: AccountRecord[] = [
    {
      id: 'acc-1',
      name: 'Chase Sapphire Reserve',
      accountNumber: '987654321',
      phoneNumber: '+14155550199',
      orgName: 'Chase Bank',
      branchName: 'Downtown Seattle',
      currency: 'USD',
      language: 'en',
      memo: 'Primary travel rewards',
      currentBalance: 5200.5,
      transactions: [],
      atm: {
        hasAtm: true,
        atmNumber: '4111888899991234',
        cvv: '891',
        atmPin: '7412', // Sensitive ATM PIN
      },
      mobileBanking: {
        hasMobileBanking: true,
        mobileBankingPin: '9358', // Sensitive Mobile Banking PIN
      },
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  // 1. Searching by Name works
  assert.equal(safeSearchAccounts(sampleAccounts, 'Sapphire').length, 1);
  // 2. Searching by Account Number works
  assert.equal(safeSearchAccounts(sampleAccounts, '987654321').length, 1);
  // 3. Searching by Org Name works
  assert.equal(safeSearchAccounts(sampleAccounts, 'Chase').length, 1);
  // 4. Searching by Branch works
  assert.equal(safeSearchAccounts(sampleAccounts, 'Seattle').length, 1);
  // 5. Searching by Phone works
  assert.equal(safeSearchAccounts(sampleAccounts, '0199').length, 1);

  // CRITICAL SECURITY ENFORCEMENT:
  // Searching for the secret ATM PIN ("7412") MUST return 0 results!
  assert.equal(safeSearchAccounts(sampleAccounts, '7412').length, 0);

  // Searching for the secret Mobile PIN ("9358") MUST return 0 results!
  assert.equal(safeSearchAccounts(sampleAccounts, '9358').length, 0);

  // Searching for secret CVV ("891") MUST return 0 results!
  assert.equal(safeSearchAccounts(sampleAccounts, '891').length, 0);
});

test('maskCardNumber properly obfuscates card numbers', () => {
  assert.equal(maskCardNumber('4111222233334821'), '•••• •••• •••• 4821');
  assert.equal(maskCardNumber(''), '•••• •••• •••• ••••');
});

test('detectCardNetwork identifies prefixes correctly', () => {
  assert.equal(detectCardNetwork('4111222233334444'), 'visa');
  assert.equal(detectCardNetwork('5500112233445566'), 'mastercard');
  assert.equal(detectCardNetwork('378282246310005'), 'amex');
});

test('auditPinStrength flags weak patterns', () => {
  assert.equal(auditPinStrength('0000').score, 1);
  assert.equal(auditPinStrength('1234').score, 1);
  assert.equal(auditPinStrength('7492').score, 4);
  assert.equal(auditPinStrength('849201').score, 5);
});

test('parseRawAccountSnippet extracts fields from banking notification text', () => {
  const text = `Chase Bank Alert: Account #987654321 holder John Doe. Phone: +15551234567. Bal: $2,500.00. ATM Card 4111222233334444 PIN 4321 CVV 123.`;
  const parsed = parseRawAccountSnippet(text);

  assert.equal(parsed.accountNumber, '987654321');
  assert.equal(parsed.orgName, 'Chase');
  assert.equal(parsed.currentBalance, 2500);
  assert.equal(parsed.atm?.hasAtm, true);
  assert.equal(parsed.atm?.atmNumber, '4111222233334444');
  assert.equal(parsed.atm?.atmPin, '4321');
});
