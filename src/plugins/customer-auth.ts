import { importSPKI, jwtVerify } from 'jose';
import { z } from 'zod';

export type CustomerTokenConfig = {
  issuer: string;
  audience: string;
  publicKeyPem: string;
};

export type CustomerIdentity = {
  issuer: string;
  subject: string;
  sessionId: string;
  email: string;
  expiresAt: Date;
};

export class CustomerAuthError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = 'CustomerAuthError';
    this.statusCode = statusCode;
  }
}

const emailSchema = z.string().email().max(254);
// Customer API access tokens are intentionally short-lived. The identity provider
// may choose a shorter lifetime, but tokens longer than this are rejected.
export const MAX_CUSTOMER_ACCESS_TOKEN_LIFETIME_SECONDS = 15 * 60;
const CLOCK_TOLERANCE_SECONDS = 5;
const identityField = z.string().min(1).max(255).refine(
  (value) => !/[\u0000-\u001f\u007f]/.test(value),
  'Identity claim contains unsupported control characters',
);

export function extractBearerToken(authorization: string | undefined): string {
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  if (!match || match[1]!.length > 8192) {
    throw new CustomerAuthError('A valid bearer token is required');
  }
  return match[1]!;
}

export async function verifyCustomerAccessToken(
  token: string,
  config: CustomerTokenConfig,
  now = Date.now(),
): Promise<CustomerIdentity> {
  if (!config.issuer || !config.audience || !config.publicKeyPem) {
    throw new CustomerAuthError('Customer identity is not configured', 503);
  }
  if (token.length > 8192) {
    throw new CustomerAuthError('Invalid customer access token');
  }

  try {
    const publicKey = await importSPKI(config.publicKeyPem.replace(/\\n/g, '\n'), 'RS256');
    const { payload } = await jwtVerify(token, publicKey, {
      issuer: config.issuer,
      audience: config.audience,
      algorithms: ['RS256'],
      clockTolerance: CLOCK_TOLERANCE_SECONDS,
      requiredClaims: ['sub', 'iat', 'exp'],
    });

    if (payload.principal_type !== 'customer') {
      throw new CustomerAuthError('Customer identity token required');
    }
    if (payload.email_verified !== true) {
      throw new CustomerAuthError('A verified customer email is required');
    }

    const subject = identityField.safeParse(payload.sub);
    const sessionId = identityField.safeParse(payload.sid);
    const email = emailSchema.safeParse(payload.email);
    if (!subject.success || !sessionId.success || !email.success) {
      throw new CustomerAuthError('Customer identity token is missing required claims');
    }
    const nowSeconds = Math.floor(now / 1000);
    if (typeof payload.iat !== 'number' || !Number.isSafeInteger(payload.iat)) {
      throw new CustomerAuthError('Customer identity token issued-at claim is invalid');
    }
    if (payload.iat > nowSeconds + CLOCK_TOLERANCE_SECONDS) {
      throw new CustomerAuthError('Customer identity token issued-at time is in the future');
    }
    if (typeof payload.exp !== 'number' || !Number.isSafeInteger(payload.exp) || payload.exp <= nowSeconds) {
      throw new CustomerAuthError('Customer identity token has expired');
    }
    if (payload.exp <= payload.iat || payload.exp - payload.iat > MAX_CUSTOMER_ACCESS_TOKEN_LIFETIME_SECONDS) {
      throw new CustomerAuthError('Customer identity token lifetime exceeds the allowed limit');
    }
    if (typeof payload.iss !== 'string' || payload.iss !== config.issuer) {
      throw new CustomerAuthError('Customer identity token issuer is invalid');
    }

    return {
      issuer: payload.iss,
      subject: subject.data,
      sessionId: sessionId.data,
      email: email.data.trim().toLowerCase(),
      expiresAt: new Date(payload.exp * 1000),
    };
  } catch (error) {
    if (error instanceof CustomerAuthError) throw error;
    throw new CustomerAuthError('Invalid or expired customer identity token');
  }
}
