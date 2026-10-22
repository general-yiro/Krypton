/**
 * Krypton Vault - Zero-Knowledge Cryptography Engine
 * Web Crypto API (SubtleCrypto) implementation for client-side encryption.
 * Master keys and raw secrets NEVER leave the user's browser device.
 */

// Helper to convert Uint8Array to Base64
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert Base64 to Uint8Array
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives an AES-GCM 256-bit encryption key from a master passphrase and salt
 * using PBKDF2 with SHA-256 and 100,000 iterations.
 */
export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Computes a salted SHA-256 verification digest to verify master password
 * without storing or exposing the plain passphrase.
 */
export async function computePassphraseVerifier(
  passphrase: string,
  salt: Uint8Array
): Promise<string> {
  const enc = new TextEncoder();
  const data = new Uint8Array(enc.encode(passphrase).length + salt.length);
  data.set(enc.encode(passphrase));
  data.set(salt, enc.encode(passphrase).length);

  const digest = await window.crypto.subtle.digest('SHA-256', data as unknown as BufferSource);
  return bufferToBase64(digest);
}

/**
 * Encrypts an arbitrary object using AES-256-GCM with a fresh 12-byte IV.
 */
export async function encryptZeroKnowledgePayload(
  data: Record<string, any>,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const enc = new TextEncoder();
  const encodedData = enc.encode(JSON.stringify(data));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    encodedData
  );

  return {
    ciphertext: bufferToBase64(cipherBuffer),
    iv: bufferToBase64(iv),
  };
}

/**
 * Decrypts an AES-256-GCM ciphertext payload.
 */
export async function decryptZeroKnowledgePayload<T = Record<string, any>>(
  ciphertext: string,
  iv: string,
  key: CryptoKey
): Promise<T> {
  const cipherBuffer = base64ToBuffer(ciphertext);
  const ivBuffer = base64ToBuffer(iv);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer as unknown as BufferSource,
    },
    key,
    cipherBuffer as unknown as BufferSource
  );

  const dec = new TextDecoder();
  return JSON.parse(dec.decode(decryptedBuffer)) as T;
}

/**
 * Generates a random cryptographic salt (16 bytes).
 */
export function generateSalt(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Generates an encrypted backup payload for export.
 */
export async function createEncryptedVaultBackup(
  vaultData: any,
  key: CryptoKey,
  salt: Uint8Array
): Promise<string> {
  const { ciphertext, iv } = await encryptZeroKnowledgePayload(vaultData, key);
  const backup = {
    app: 'KryptonVault',
    version: 1,
    exportedAt: new Date().toISOString(),
    salt: bufferToBase64(salt),
    iv,
    ciphertext,
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Decrypts and restores an encrypted backup file using the master password.
 */
export async function restoreEncryptedVaultBackup(
  backupJson: string,
  passphrase: string
): Promise<{ data: any; salt: Uint8Array }> {
  const parsed = JSON.parse(backupJson);
  if (!parsed.salt || !parsed.iv || !parsed.ciphertext) {
    throw new Error('Invalid backup file format.');
  }

  const salt = base64ToBuffer(parsed.salt);
  const key = await deriveKeyFromPassphrase(passphrase, salt);
  const data = await decryptZeroKnowledgePayload(parsed.ciphertext, parsed.iv, key);
  return { data, salt };
}

/**
 * WebAuthn Passkey Registration & Assertion helper for Biometric Unlock.
 * Uses browser's navigator.credentials API.
 */
export async function checkBiometricAvailability(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}
