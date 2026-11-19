import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import type { CustomerProfile } from '../domain/customer-account.js';

const NONCE_BYTES = 12;
const TAG_BYTES = 16;
const VERSION = 1;

function getKey(keyHex: string): Buffer {
  if (!/^[a-fA-F0-9]{64}$/.test(keyHex)) {
    throw new Error('Customer profile encryption key must be exactly 32 bytes encoded as 64 hexadecimal characters');
  }
  return Buffer.from(keyHex, 'hex');
}

/**
 * AES-256-GCM encrypts the complete customer profile. The customer ID is
 * authenticated as additional data so a ciphertext cannot be copied to a
 * different account and successfully decrypted.
 */
export function encryptCustomerProfile(
  profile: CustomerProfile,
  keyHex: string,
  customerId: string,
): Buffer {
  const key = getKey(keyHex);
  const nonce = randomBytes(NONCE_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  cipher.setAAD(Buffer.from(customerId, 'utf8'));
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(profile), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([Buffer.from([VERSION]), nonce, tag, ciphertext]);
}

export function decryptCustomerProfile(
  encrypted: Buffer,
  keyHex: string,
  customerId: string,
): CustomerProfile {
  if (!Buffer.isBuffer(encrypted) || encrypted.length < 1 + NONCE_BYTES + TAG_BYTES + 2) {
    throw new Error('Encrypted customer profile is malformed');
  }
  if (encrypted[0] !== VERSION) {
    throw new Error('Unsupported customer profile encryption version');
  }

  const key = getKey(keyHex);
  const nonceStart = 1;
  const tagStart = nonceStart + NONCE_BYTES;
  const ciphertextStart = tagStart + TAG_BYTES;
  const nonce = encrypted.subarray(nonceStart, tagStart);
  const tag = encrypted.subarray(tagStart, ciphertextStart);
  const ciphertext = encrypted.subarray(ciphertextStart);

  const decipher = createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAAD(Buffer.from(customerId, 'utf8'));
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  const value: unknown = JSON.parse(plaintext.toString('utf8'));

  if (!value || typeof value !== 'object') {
    throw new Error('Decrypted customer profile is invalid');
  }
  const profile = value as Partial<CustomerProfile>;
  if (
    typeof profile.email !== 'string' ||
    profile.emailVerified !== true ||
    typeof profile.displayName !== 'string' ||
    typeof profile.declaredResidenceCountryCode !== 'string' ||
    typeof profile.preferredLocale !== 'string'
  ) {
    throw new Error('Decrypted customer profile is invalid');
  }

  return profile as CustomerProfile;
}
