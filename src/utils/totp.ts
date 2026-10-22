/**
 * Krypton Vault - Built-in TOTP Authenticator (RFC 6238)
 * Generates rotating 6-digit 2FA codes directly in the client using Web Crypto API.
 */

// Base32 Alphabet RFC 4648
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32ToBytes(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/[\s=-]/g, '');
  const bytes: number[] = [];
  let buffer = 0;
  let bitsLeft = 0;

  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean[i]);
    if (val === -1) continue;
    buffer = (buffer << 5) | val;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      bitsLeft -= 8;
      bytes.push((buffer >> bitsLeft) & 0xff);
    }
  }

  return new Uint8Array(bytes);
}

/**
 * Computes 6-digit TOTP code for a secret and current epoch timestamp
 */
export async function generateTOTPCode(secret: string, timestampMs: number = Date.now()): Promise<{ code: string; secondsRemaining: number }> {
  try {
    const epochSeconds = Math.floor(timestampMs / 1000);
    const timeStep = 30; // standard 30 second step
    const counter = Math.floor(epochSeconds / timeStep);
    const secondsRemaining = timeStep - (epochSeconds % timeStep);

    const secretBytes = base32ToBytes(secret);
    if (secretBytes.length === 0) {
      return { code: '000000', secondsRemaining };
    }

    // Convert counter to 8-byte big-endian buffer
    const counterBuffer = new ArrayBuffer(8);
    const counterView = new DataView(counterBuffer);
    counterView.setUint32(4, counter, false);

    // Import HMAC key
    const key = await window.crypto.subtle.importKey(
      'raw',
      secretBytes as unknown as BufferSource,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );

    // Sign counter
    const signature = await window.crypto.subtle.sign('HMAC', key, counterBuffer);
    const hash = new Uint8Array(signature);

    // Dynamic truncation
    const offset = hash[hash.length - 1] & 0x0f;
    const binary =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    const otp = binary % 1000000;
    const code = otp.toString().padStart(6, '0');

    return { code, secondsRemaining };
  } catch {
    return { code: '------', secondsRemaining: 30 };
  }
}
