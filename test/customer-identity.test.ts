import { beforeAll, describe, expect, it } from 'vitest';
import { exportSPKI, generateKeyPair, SignJWT } from 'jose';
import {
  extractBearerToken,
  verifyCustomerAccessToken,
  type CustomerTokenConfig,
} from '../src/plugins/customer-auth.js';
import {
  decryptCustomerProfile,
  encryptCustomerProfile,
} from '../src/services/customer-profile-crypto.js';
import type { CustomerProfile } from '../src/domain/customer-account.js';

const issuer = 'https://identity.test.example/';
const audience = 'loan-platform-customer-api';
let privateKey: Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];
let config: CustomerTokenConfig;

beforeAll(async () => {
  const keys = await generateKeyPair('RS256');
  privateKey = keys.privateKey;
  config = {
    issuer,
    audience,
    publicKeyPem: await exportSPKI(keys.publicKey),
  };
});

async function tokenFor(
  claims: Record<string, unknown> = {},
  overrides: { issuer?: string; audience?: string; expiresAt?: number } = {},
) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    principal_type: 'customer',
    email_verified: true,
    email: 'Customer.Sample@Example.test',
    sid: 'provider-session-0001',
    ...claims,
  })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(overrides.issuer ?? issuer)
    .setAudience(overrides.audience ?? audience)
    .setSubject('provider-subject-0001')
    .setIssuedAt(now)
    .setExpirationTime(overrides.expiresAt ?? now + 300)
    .sign(privateKey);
}

describe('customer access token verification', () => {
  it('accepts a verified customer principal and normalises the email address', async () => {
    const token = await tokenFor();
    const identity = await verifyCustomerAccessToken(token, config);

    expect(identity).toEqual({
      issuer,
      subject: 'provider-subject-0001',
      sessionId: 'provider-session-0001',
      email: 'customer.sample@example.test',
      expiresAt: expect.any(Date),
    });
  });

  it('rejects an administrator token even when it has a valid signature and same issuer', async () => {
    const token = await tokenFor({ principal_type: 'administrator', permissions: ['loan_products:write'] });
    await expect(verifyCustomerAccessToken(token, config)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects identities whose email is not explicitly verified', async () => {
    const token = await tokenFor({ email_verified: false });
    await expect(verifyCustomerAccessToken(token, config)).rejects.toThrow(/verified customer email/i);
  });

  it('rejects tokens with no provider session identifier', async () => {
    const token = await tokenFor({ sid: undefined });
    await expect(verifyCustomerAccessToken(token, config)).rejects.toThrow(/required claims/i);
  });

  it('rejects a mismatched issuer or audience', async () => {
    const wrongIssuer = await tokenFor({}, { issuer: 'https://untrusted.example/' });
    const wrongAudience = await tokenFor({}, { audience: 'admin-api' });
    await expect(verifyCustomerAccessToken(wrongIssuer, config)).rejects.toMatchObject({ statusCode: 401 });
    await expect(verifyCustomerAccessToken(wrongAudience, config)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects an expired signed token', async () => {
    const token = await tokenFor({}, { expiresAt: Math.floor(Date.now() / 1000) - 30 });
    await expect(verifyCustomerAccessToken(token, config)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('requires a bearer token and rejects oversized token material', () => {
    expect(() => extractBearerToken(undefined)).toThrow(/bearer token/i);
    expect(() => extractBearerToken('Basic abc')).toThrow(/bearer token/i);
    expect(() => extractBearerToken('Bearer ' + 'x'.repeat(9000))).toThrow(/bearer token/i);
  });
});

describe('encrypted customer profile storage', () => {
  const key = '4a'.repeat(32);
  const customerId = 'a48d7f98-4da7-4550-a1a3-38c32ed5b4e6';
  const profile: CustomerProfile = {
    email: 'customer.sample@example.test',
    emailVerified: true,
    displayName: 'Sample Customer',
    declaredResidenceCountryCode: 'NG',
    preferredLocale: 'en-NG',
  };

  it('round-trips the complete profile with AES-256-GCM', () => {
    const encrypted = encryptCustomerProfile(profile, key, customerId);
    expect(decryptCustomerProfile(encrypted, key, customerId)).toEqual(profile);
  });

  it('does not store readable profile values in the ciphertext', () => {
    const encrypted = encryptCustomerProfile(profile, key, customerId);
    expect(encrypted.includes(Buffer.from(profile.email))).toBe(false);
    expect(encrypted.includes(Buffer.from(profile.displayName))).toBe(false);
  });

  it('authenticates the customer ID as additional data', () => {
    const encrypted = encryptCustomerProfile(profile, key, customerId);
    expect(() => decryptCustomerProfile(
      encrypted,
      key,
      'fcb8b249-699f-413a-8879-1cd7f0ec5a01',
    )).toThrow();
  });

  it('rejects modified ciphertext and invalid encryption keys', () => {
    const encrypted = encryptCustomerProfile(profile, key, customerId);
    const changed = Buffer.from(encrypted);
    changed[changed.length - 1] = changed[changed.length - 1]! ^ 0x01;
    expect(() => decryptCustomerProfile(changed, key, customerId)).toThrow();
    expect(() => encryptCustomerProfile(profile, 'too-short', customerId)).toThrow(/32 bytes/i);
  });
});
