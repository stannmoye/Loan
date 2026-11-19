import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().default('127.0.0.1'),
  DATABASE_URL: z.string().min(1),
  JWT_ISSUER: z.string().min(1),
  JWT_AUDIENCE: z.string().min(1),
  JWT_PUBLIC_KEY_PEM: z.string().min(1),
  CUSTOMER_JWT_ISSUER: z.string().min(1).optional(),
  CUSTOMER_JWT_AUDIENCE: z.string().min(1).optional(),
  CUSTOMER_JWT_PUBLIC_KEY_PEM: z.string().min(1).optional(),
  CUSTOMER_PROFILE_ENCRYPTION_KEY_HEX: z.string().regex(/^[a-fA-F0-9]{64}$/).optional(),
  CUSTOMER_PRIVACY_NOTICE_VERSION: z.string().regex(/^[A-Za-z0-9._-]{1,64}$/).optional(),
  CUSTOMER_TERMS_OF_SERVICE_VERSION: z.string().regex(/^[A-Za-z0-9._-]{1,64}$/).optional(),
  CORS_ORIGIN: z.string().url(),
});

export const env = envSchema.parse(process.env);
