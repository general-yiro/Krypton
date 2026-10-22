import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Sparkles, CreditCard, Smartphone, Building2, MapPin, DollarSign, Globe2 } from 'lucide-react';
import { AccountRecord, SupportedLanguage } from '../types/account';
import { validateAccountInput, parseRawAccountSnippet, detectCardNetwork } from '../utils/validator';
import { BottomSheet } from './BottomSheet';
import { translations } from '../utils/i18n';

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Partial<AccountRecord>) => void;
  initialAccount?: AccountRecord | null;
  currentLanguage: SupportedLanguage;
}

export const AccountFormModal: React.FC<AccountFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAccount,
  currentLanguage,
}) => {
  const t = translations[currentLanguage];

  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orgName, setOrgName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState<SupportedLanguage>(currentLanguage);
  const [memo, setMemo] = useState('');
  const [currentBalance, setCurrentBalance] = useState<number>(0);

  // ATM Module state
  const [hasAtm, setHasAtm] = useState(false);
  const [atmNumber, setAtmNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [atmPin, setAtmPin] = useState('');
  const [expiry, setExpiry] = useState('');
  const [showAtmPin, setShowAtmPin] = useState(false);
  const [showCvv, setShowCvv] = useState(false);

  // Mobile Banking state
  const [hasMobileBanking, setHasMobileBanking] = useState(false);
  const [mobileBankingPin, setMobileBankingPin] = useState('');
  const [appIdentifier, setAppIdentifier] = useState('');
  const [showMobilePin, setShowMobilePin] = useState(false);

  // Smart Parser state
  const [showSmartPaste, setShowSmartPaste] = useState(false);
  const [rawPasteText, setRawPasteText] = useState('');
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialAccount) {
      setName(initialAccount.name || '');
      setAccountNumber(initialAccount.accountNumber || '');
      setPhoneNumber(initialAccount.phoneNumber || '');
      setOrgName(initialAccount.orgName || '');
      setBranchName(initialAccount.branchName || '');
      setCurrency(initialAccount.currency || 'USD');
      setLanguage(initialAccount.language || currentLanguage);
      setMemo(initialAccount.memo || '');
      setCurrentBalance(initialAccount.currentBalance || 0);

      setHasAtm(initialAccount.atm?.hasAtm || false);
      setAtmNumber(initialAccount.atm?.atmNumber || '');
      setCvv(initialAccount.atm?.cvv || '');
      setAtmPin(initialAccount.atm?.atmPin || '');
      setExpiry(initialAccount.atm?.expiry || '');

      setHasMobileBanking(initialAccount.mobileBanking?.hasMobileBanking || false);
      setMobileBankingPin(initialAccount.mobileBanking?.mobileBankingPin || '');
      setAppIdentifier(initialAccount.mobileBanking?.appIdentifier || '');
    } else {
      resetForm();
    }
  }, [initialAccount, isOpen, currentLanguage]);

  const resetForm = () => {
    setName('');
    setAccountNumber('');
    setPhoneNumber('');
    setOrgName('');
    setBranchName('');
    setCurrency('USD');
    setLanguage(currentLanguage);
    setMemo('');
    setCurrentBalance(0);
    setHasAtm(false);
    setAtmNumber('');
    setCvv('');
    setAtmPin('');
    setExpiry('');
    setHasMobileBanking(false);
    setMobileBankingPin('');
    setAppIdentifier('');
    setShowSmartPaste(false);
    setRawPasteText('');
    setPasteNotice(null);
    setErrors({});
  };

  const handleSmartParse = () => {
    if (!rawPasteText.trim()) return;
    const parsed = parseRawAccountSnippet(rawPasteText);
    if (parsed.name) setName(parsed.name);
    if (parsed.accountNumber) setAccountNumber(parsed.accountNumber);
    if (parsed.phoneNumber) setPhoneNumber(parsed.phoneNumber);
    if (parsed.orgName) setOrgName(parsed.orgName);
    if (parsed.currency) setCurrency(parsed.currency);
    if (parsed.currentBalance !== undefined) setCurrentBalance(parsed.currentBalance);

    if (parsed.atm?.hasAtm) {
      setHasAtm(true);
      if (parsed.atm.atmNumber) setAtmNumber(parsed.atm.atmNumber);
      if (parsed.atm.cvv) setCvv(parsed.atm.cvv);
      if (parsed.atm.atmPin) setAtmPin(parsed.atm.atmPin);
    }

    if (parsed.mobileBanking?.hasMobileBanking) {
      setHasMobileBanking(true);
      if (parsed.mobileBanking.mobileBankingPin) setMobileBankingPin(parsed.mobileBanking.mobileBankingPin);
    }

    setPasteNotice('Parsed fields populated into secure form! Verify details below.');
    setTimeout(() => setPasteNotice(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const candidateAccount: Partial<AccountRecord> = {
      name: name.trim(),
      accountNumber: accountNumber.trim(),
      phoneNumber: phoneNumber.trim(),
      orgName: orgName.trim(),
      branchName: branchName.trim(),
      currency,
      language,
      memo: memo.trim(),
      currentBalance: Number(currentBalance) || 0,
      atm: {
        hasAtm,
        atmNumber: hasAtm ? atmNumber.trim() : undefined,
        cvv: hasAtm ? cvv.trim() : undefined,
        atmPin: hasAtm ? atmPin.trim() : undefined,
        expiry: hasAtm ? expiry.trim() : undefined,
        cardNetwork: hasAtm && atmNumber ? detectCardNetwork(atmNumber) : undefined,
      },
      mobileBanking: {
        hasMobileBanking,
        mobileBankingPin: hasMobileBanking ? mobileBankingPin.trim() : undefined,
        appIdentifier: hasMobileBanking ? appIdentifier.trim() : undefined,
      },
      transactions: initialAccount?.transactions || [],
    };

    const validation = validateAccountInput(candidateAccount);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave(candidateAccount);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialAccount ? 'Edit Account' : t.newAccount}
      subtitle={t.tagline}
      maxHeight="max-h-[92vh]"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pb-6">
        {/* Smart Paste Accordion Button */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
          <button
            type="button"
            onClick={() => setShowSmartPaste(!showSmartPaste)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">
                Smart Auto-Parser (Paste Bank SMS / Notification)
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">
              {showSmartPaste ? 'Collapse' : 'Expand'}
            </span>
          </button>

          {showSmartPaste && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
              <textarea
                value={rawPasteText}
                onChange={(e) => setRawPasteText(e.target.value)}
                placeholder="e.g. Chase Bank Alert: Account #987654321 holder Sarah J. Phone: +15551234567. Bal: $2,500.00. ATM Card 4111222233334444 PIN 4321..."
                rows={3}
                className="w-full text-xs bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Parses client-side. Zero plaintext leaks.
                </span>
                <button
                  type="button"
                  onClick={handleSmartParse}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                >
                  Auto-Populate Form
                </button>
              </div>
              {pasteNotice && (
                <p className="text-xs text-emerald-400 font-medium animate-fade-in">
                  {pasteNotice}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ================= SECTION 1: REQUIRED CORE IDENTIFIERS ================= */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            Core Identifiers (Required)
          </h4>

          {/* Account Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t.accountName} <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="e.g. Premier Business Checking, Personal Savings"
              className={`w-full h-11 px-3.5 rounded-xl bg-slate-900 border ${
                errors.name ? 'border-red-500' : 'border-slate-800'
              } text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`}
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          {/* Account Number & Phone Number Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.accountNumber} <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  if (errors.accountNumber) setErrors({ ...errors, accountNumber: '' });
                }}
                placeholder="e.g. 100084920491"
                className={`w-full h-11 px-3.5 rounded-xl bg-slate-900 border ${
                  errors.accountNumber ? 'border-red-500' : 'border-slate-800'
                } text-slate-100 placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`}
              />
              {errors.accountNumber && (
                <p className="text-xs text-red-400 mt-1">{errors.accountNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.phoneNumber} <span className="text-emerald-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' });
                }}
                placeholder="e.g. +251 911 234567"
                className={`w-full h-11 px-3.5 rounded-xl bg-slate-900 border ${
                  errors.phoneNumber ? 'border-red-500' : 'border-slate-800'
                } text-slate-100 placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`}
              />
              {errors.phoneNumber && (
                <p className="text-xs text-red-400 mt-1">{errors.phoneNumber}</p>
              )}
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: ATM MODULE ================= */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-semibold text-slate-200">{t.atmModule}</p>
                <p className="text-[10px] text-slate-400">Includes physical/virtual debit card & ATM PIN</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasAtm}
                onChange={(e) => setHasAtm(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {hasAtm && (
            <div className="space-y-3 pt-3 border-t border-slate-800/80 animate-fade-in">
              {/* ATM Card Number */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t.atmCardNumber} <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={atmNumber}
                  onChange={(e) => {
                    setAtmNumber(e.target.value);
                    if (errors.atmNumber) setErrors({ ...errors, atmNumber: '' });
                  }}
                  placeholder="4111 2222 3333 4444"
                  maxLength={23}
                  className={`w-full h-11 px-3.5 rounded-xl bg-slate-950 border ${
                    errors.atmNumber ? 'border-red-500' : 'border-slate-700/80'
                  } text-slate-100 placeholder-slate-500 text-sm font-mono tracking-wider focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`}
                />
                {errors.atmNumber && <p className="text-xs text-red-400 mt-1">{errors.atmNumber}</p>}
              </div>

              {/* CVV, PIN & Expiry Row */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* CVV */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t.cvv} <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCvv ? 'text' : 'password'}
                      value={cvv}
                      onChange={(e) => {
                        setCvv(e.target.value);
                        if (errors.cvv) setErrors({ ...errors, cvv: '' });
                      }}
                      placeholder="•••"
                      maxLength={4}
                      className={`w-full h-11 px-3 rounded-xl bg-slate-950 border ${
                        errors.cvv ? 'border-red-500' : 'border-slate-700/80'
                      } text-slate-100 placeholder-slate-500 text-sm font-mono text-center focus:outline-none focus:border-emerald-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCvv(!showCvv)}
                      aria-label="Toggle CVV visibility"
                      className="absolute right-2 top-3 text-slate-400 hover:text-white"
                    >
                      {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.cvv && <p className="text-[10px] text-red-400 mt-0.5">{errors.cvv}</p>}
                </div>

                {/* ATM PIN */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t.atmPin} <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showAtmPin ? 'text' : 'password'}
                      value={atmPin}
                      onChange={(e) => {
                        setAtmPin(e.target.value);
                        if (errors.atmPin) setErrors({ ...errors, atmPin: '' });
                      }}
                      placeholder="••••"
                      maxLength={8}
                      className={`w-full h-11 px-3 rounded-xl bg-slate-950 border ${
                        errors.atmPin ? 'border-red-500' : 'border-slate-700/80'
                      } text-slate-100 placeholder-slate-500 text-sm font-mono text-center focus:outline-none focus:border-emerald-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAtmPin(!showAtmPin)}
                      aria-label="Toggle ATM PIN visibility"
                      className="absolute right-2 top-3 text-slate-400 hover:text-white"
                    >
                      {showAtmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.atmPin && <p className="text-[10px] text-red-400 mt-0.5">{errors.atmPin}</p>}
                </div>

                {/* Expiry */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="12/29"
                    maxLength={5}
                    className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm font-mono text-center focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= SECTION 3: MOBILE BANKING MODULE ================= */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-semibold text-slate-200">{t.mobileBankingModule}</p>
                <p className="text-[10px] text-slate-400">Mobile banking app PIN & digital transfer access</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasMobileBanking}
                onChange={(e) => setHasMobileBanking(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {hasMobileBanking && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 animate-fade-in">
              {/* Mobile PIN */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t.mobileBankingPin} <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showMobilePin ? 'text' : 'password'}
                    value={mobileBankingPin}
                    onChange={(e) => {
                      setMobileBankingPin(e.target.value);
                      if (errors.mobileBankingPin) setErrors({ ...errors, mobileBankingPin: '' });
                    }}
                    placeholder="••••"
                    maxLength={8}
                    className={`w-full h-11 px-3.5 rounded-xl bg-slate-950 border ${
                      errors.mobileBankingPin ? 'border-red-500' : 'border-slate-700/80'
                    } text-slate-100 placeholder-slate-500 text-sm font-mono tracking-widest focus:outline-none focus:border-emerald-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowMobilePin(!showMobilePin)}
                    aria-label="Toggle Mobile Banking PIN visibility"
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showMobilePin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.mobileBankingPin && (
                  <p className="text-xs text-red-400 mt-1">{errors.mobileBankingPin}</p>
                )}
              </div>

              {/* Mobile App Identifier */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  App / Service Name
                </label>
                <input
                  type="text"
                  value={appIdentifier}
                  onChange={(e) => setAppIdentifier(e.target.value)}
                  placeholder="e.g. CBE Birr, Telebirr, Chase Mobile"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* ================= SECTION 4: METADATA & FINANCIAL TRACKING ================= */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Metadata & Balance Tracking
          </h4>

          {/* Bank Org Name & Branch Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.bankOrgName}
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Bank of Abyssinia, Chase, CBE"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.originBranch}
              </label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. Bole Medhanealem Branch"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Currency, Balance & Language */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-emerald-500"
              >
                <option value="USD">USD ($)</option>
                <option value="ETB">ETB (Birr)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">{t.currentBalance}</label>
              <input
                type="number"
                step="0.01"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">{t.language}</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="en">English</option>
                <option value="am">አማርኛ (Amharic)</option>
                <option value="om">Afaan Oromoo</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>

          {/* Memo & Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">{t.memo}</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              placeholder="Private memo, swift code, routing info, emergency contact..."
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Shield className="w-4 h-4" />
            <span>{t.saveAccount}</span>
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
