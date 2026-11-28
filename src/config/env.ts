import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().default('127.0.0.1'),
  DATABASE_URL: z.string().min(1),
  // Optional at startup; protected administrator routes fail closed until configured.
  JWT_ISSUER: z.string().min(1).optional(),
  JWT_AUDIENCE: z.string().min(1).optional(),
  JWT_PUBLIC_KEY_PEM: z.string().min(1).optional(),
  CORS_ORIGIN: z.string().url(),
});

export const env = envSchema.parse(process.env);
