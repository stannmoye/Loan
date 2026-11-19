import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
  customerOnboardingSchema,
  updateCustomerProfileSchema,
} from '../domain/customer-account.js';
import { env } from '../config/env.js';
import {
  CustomerAuthError,
  extractBearerToken,
  verifyCustomerAccessToken,
  type CustomerIdentity,
  type CustomerTokenConfig,
} from '../plugins/customer-auth.js';
import {
  CustomerAccountError,
  findActiveCustomerContext,
  getCustomerProfile,
  listCustomerSessions,
  onboardCustomer,
  revokeCustomerSession,
  updateCustomerProfile,
  type CustomerConsentVersions,
  type CustomerContext,
} from '../services/customer-identity.js';

export type CustomerAccountService = {
  onboard: typeof onboardCustomer;
  findContext: typeof findActiveCustomerContext;
  getProfile: typeof getCustomerProfile;
  updateProfile: typeof updateCustomerProfile;
  listSessions: typeof listCustomerSessions;
  revokeSession: typeof revokeCustomerSession;
};

export type CustomerAccountRouteOptions = {
  tokenConfig: CustomerTokenConfig | null;
  profileEncryptionKeyHex: string | null;
  consentVersions: CustomerConsentVersions | null;
  verifyToken?: typeof verifyCustomerAccessToken;
  service?: CustomerAccountService;
};

function publicRouteError(message: string, statusCode: number): Error {
  const error = new Error(message);
  Object.assign(error, { statusCode });
  return error;
}

function configuredOptions(): CustomerAccountRouteOptions {
  const tokenReady = Boolean(
    env.CUSTOMER_JWT_ISSUER &&
    env.CUSTOMER_JWT_AUDIENCE &&
    env.CUSTOMER_JWT_PUBLIC_KEY_PEM,
  );

  return {
    tokenConfig: tokenReady ? {
      issuer: env.CUSTOMER_JWT_ISSUER!,
      audience: env.CUSTOMER_JWT_AUDIENCE!,
      publicKeyPem: env.CUSTOMER_JWT_PUBLIC_KEY_PEM!,
    } : null,
    profileEncryptionKeyHex: env.CUSTOMER_PROFILE_ENCRYPTION_KEY_HEX ?? null,
    consentVersions: env.CUSTOMER_PRIVACY_NOTICE_VERSION && env.CUSTOMER_TERMS_OF_SERVICE_VERSION
      ? {
        privacyNoticeVersion: env.CUSTOMER_PRIVACY_NOTICE_VERSION,
        termsOfServiceVersion: env.CUSTOMER_TERMS_OF_SERVICE_VERSION,
      }
      : null,
  };
}

export function buildCustomerAccountRoutes(options: CustomerAccountRouteOptions) {
  const verifyToken = options.verifyToken ?? verifyCustomerAccessToken;
  const service: CustomerAccountService = options.service ?? {
    onboard: onboardCustomer,
    findContext: findActiveCustomerContext,
    getProfile: getCustomerProfile,
    updateProfile: updateCustomerProfile,
    listSessions: listCustomerSessions,
    revokeSession: revokeCustomerSession,
  };

  async function requireIdentity(request: FastifyRequest): Promise<CustomerIdentity> {
    if (!options.tokenConfig) {
      throw new CustomerAuthError('Customer identity provider is not configured', 503);
    }
    const token = extractBearerToken(request.headers.authorization);
    return verifyToken(token, options.tokenConfig);
  }

  function requireProfileEncryptionKey(): string {
    if (!options.profileEncryptionKeyHex) {
      throw new CustomerAccountError('Customer profile encryption is not configured', 503);
    }
    return options.profileEncryptionKeyHex;
  }

  async function requireContext(identity: CustomerIdentity): Promise<CustomerContext> {
    return service.findContext(identity);
  }

  return async function customerAccountRoutes(app: FastifyInstance): Promise<void> {
    app.post('/api/v1/customer/onboarding', {
      config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    }, async (request, reply) => {
      const identity = await requireIdentity(request);
      const encryptionKey = requireProfileEncryptionKey();
      if (!options.consentVersions) {
        throw publicRouteError('Versioned customer privacy and terms documents are not configured', 503);
      }
      const parsed = customerOnboardingSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Customer onboarding information is invalid',
          details: parsed.error.flatten(),
        });
      }

      const result = await service.onboard(identity, parsed.data, options.consentVersions, encryptionKey);
      return reply.code(result.created ? 201 : 200).send({
        data: {
          customerId: result.customerId,
          created: result.created,
          onboardingStatus: 'completed',
        },
      });
    });

    app.get('/api/v1/customer/me', async (request) => {
      const identity = await requireIdentity(request);
      const context = await requireContext(identity);
      return { data: await service.getProfile(context, requireProfileEncryptionKey()) };
    });

    app.patch('/api/v1/customer/me/profile', async (request, reply) => {
      const identity = await requireIdentity(request);
      const context = await requireContext(identity);
      const parsed = updateCustomerProfileSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Customer profile update is invalid',
          details: parsed.error.flatten(),
        });
      }
      const profile = await service.updateProfile(context, parsed.data, requireProfileEncryptionKey());
      return { data: { customerId: context.customerId, profile } };
    });

    app.get('/api/v1/customer/me/sessions', async (request) => {
      const identity = await requireIdentity(request);
      const context = await requireContext(identity);
      return { data: await service.listSessions(context) };
    });

    app.post<{ Params: { sessionId: string } }>('/api/v1/customer/me/sessions/:sessionId/revoke', async (request, reply) => {
      const identity = await requireIdentity(request);
      const context = await requireContext(identity);
      const parsed = z.string().uuid().safeParse(request.params.sessionId);
      if (!parsed.success) return reply.code(400).send({ error: 'Invalid session identifier' });
      const result = await service.revokeSession(context, parsed.data);
      return { data: result };
    });


    app.post('/api/v1/customer/me/applications', async (request, reply) => {
      const identity = await requireIdentity(request);
      const context = await requireContext(identity);
      const parsed = createCustomerLoanApplicationSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: 'Invalid loan application', details: parsed.error.flatten() });
      const result = await createCustomerApplication(context, parsed.data);
      return reply.code(201).send({ data: result });
    });

    app.get('/api/v1/customer/me/applications', async (request) => {
      const identity = await requireIdentity(request);
      const context = await requireContext(identity);
      return { data: await listCustomerApplications(context) };
    });

    app.get<{ Params: { applicationId: string } }>('/api/v1/customer/me/applications/:applicationId', async (request, reply) => {
      const identity = await requireIdentity(request);
      const context = await requireContext(identity);
      const parsed = applicationIdSchema.safeParse(request.params.applicationId);
      if (!parsed.success) return reply.code(400).send({ error: 'Invalid application identifier' });
      return { data: await getCustomerApplication(context, parsed.data) };
    });

    app.post<{ Params: { applicationId: string } }>('/api/v1/customer/me/applications/:applicationId/submit', async (request, reply) => {
      const identity = await requireIdentity(request);
      const context = await requireContext(identity);
      const parsed = applicationIdSchema.safeParse(request.params.applicationId);
      if (!parsed.success) return reply.code(400).send({ error: 'Invalid application identifier' });
      return { data: await submitCustomerApplication(context, parsed.data) };
    });

    app.post<{ Params: { applicationId: string } }>('/api/v1/customer/me/applications/:applicationId/withdraw', async (request, reply) => {
      const identity = await requireIdentity(request);
      const context = await requireContext(identity);
      const parsed = applicationIdSchema.safeParse(request.params.applicationId);
      if (!parsed.success) return reply.code(400).send({ error: 'Invalid application identifier' });
      return { data: await withdrawCustomerApplication(context, parsed.data) };
    });
\n    app.post('/api/v1/customer/auth/logout', async (request) => {
      const identity = await requireIdentity(request);
      const context = await requireContext(identity);
      const result = await service.revokeSession(context, context.currentSessionId);
      return { data: { loggedOut: result.revoked || result.currentSession } };
    });
  };
}

export const customerAccountRoutes = buildCustomerAccountRoutes(configuredOptions());
