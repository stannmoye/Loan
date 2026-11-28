import type { FastifyInstance, FastifyRequest } from 'fastify';
import { importSPKI, jwtVerify } from 'jose';
import { env } from '../config/env.js';

async function getPublicKey() {
  if (!env.JWT_PUBLIC_KEY_PEM || !env.JWT_ISSUER || !env.JWT_AUDIENCE) {
    const error = new Error('Administrator authentication is not configured');
    Object.assign(error, { statusCode: 503 });
    throw error;
  }
  return importSPKI(env.JWT_PUBLIC_KEY_PEM.replace(/\\n/g, '\n'), 'RS256');
}

export async function requirePermission(request: FastifyRequest, permission: string): Promise<string> {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    const error = new Error('Authentication required');
    Object.assign(error, { statusCode: 401 });
    throw error;
  }
  const token = authorization.slice(7);
  let verified;
  try {
    verified = await jwtVerify(token, await getPublicKey(), {
      issuer: env.JWT_ISSUER!,
      audience: env.JWT_AUDIENCE!,
      algorithms: ['RS256'],
    });
  } catch {
    const error = new Error('Invalid or expired authentication token');
    Object.assign(error, { statusCode: 401 });
    throw error;
  }
  const permissions = verified.payload.permissions;
  if (!Array.isArray(permissions) || !permissions.includes(permission)) {
    const error = new Error('Insufficient permission');
    Object.assign(error, { statusCode: 403 });
    throw error;
  }
  if (typeof verified.payload.sub !== 'string' || verified.payload.sub.length === 0) {
    const error = new Error('Authenticated administrator subject is required');
    Object.assign(error, { statusCode: 401 });
    throw error;
  }
  return verified.payload.sub;
}

export function registerAuthErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, _request, reply) => {
    const status = (error as Error & { statusCode?: number }).statusCode ?? 500;
    const message = error instanceof Error ? error.message : 'Request failed';
    if (status >= 500) app.log.error(error);
    reply.code(status).send({ error: status >= 500 ? 'Internal server error' : message });
  });
}
