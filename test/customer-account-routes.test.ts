import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { describe, expect, it, vi } from 'vitest';
import type { CustomerProfile } from '../src/domain/customer-account.js';
import type { CustomerIdentity } from '../src/plugins/customer-auth.js';
import {
  buildCustomerAccountRoutes,
  type CustomerAccountRouteOptions,
  type CustomerAccountService,
  type CustomerApplicationRouteService,
} from '../src/routes/customer-accounts.js';

const identity: CustomerIdentity = {
  issuer: 'https://identity.test.example/',
  subject: 'customer-subject-test',
  sessionId: 'customer-session-test',
  email: 'sample.customer@example.test',
  expiresAt: new Date(Date.now() + 5 * 60_000),
};
const customerContext = {
  customerId: 'a48d7f98-4da7-4550-a1a3-38c32ed5b4e6',
  currentSessionId: 'd22127f3-b26d-4658-bcc8-e79eebc185f7',
};
const profile: CustomerProfile = {
  email: identity.email,
  emailVerified: true,
  displayName: 'Sample Customer',
  declaredResidenceCountryCode: 'NG',
  preferredLocale: 'en-NG',
};

function makeService(): CustomerAccountService {
  return {
    onboard: vi.fn(async () => ({
      customerId: customerContext.customerId,
      sessionId: customerContext.currentSessionId,
      created: true,
    })),
    findContext: vi.fn(async () => customerContext),
    getProfile: vi.fn(async () => ({
      customerId: customerContext.customerId,
      status: 'active',
      createdAt: new Date(),
      profile,
      consents: [],
    })),
    updateProfile: vi.fn(async (_context, patch) => ({ ...profile, ...patch })),
    listSessions: vi.fn(async () => [{
      id: customerContext.currentSessionId,
      createdAt: new Date(),
      lastSeenAt: new Date(),
      expiresAt: identity.expiresAt,
      revokedAt: null,
      current: true,
    }]),
    revokeSession: vi.fn(async (_context, sessionId) => ({
      sessionId,
      revoked: true,
      currentSession: sessionId === customerContext.currentSessionId,
    })),
  };
}

function makeOptions(overrides: Partial<CustomerAccountRouteOptions> = {}) {
  const service = overrides.service ?? makeService();
  const applicationService = overrides.applicationService ?? ({
    create: vi.fn(async () => ({ id: 'a48d7f98-4da7-4550-a1a3-38c32ed5b4e6', status: 'draft' })),
    get: vi.fn(async () => ({ id: 'a48d7f98-4da7-4550-a1a3-38c32ed5b4e6', status: 'draft', timeline: [] })),
    list: vi.fn(async () => []),
    submit: vi.fn(async () => ({ id: 'a48d7f98-4da7-4550-a1a3-38c32ed5b4e6', status: 'submitted' })),
    withdraw: vi.fn(async () => ({ id: 'a48d7f98-4da7-4550-a1a3-38c32ed5b4e6', status: 'withdrawn' })),
  } as unknown as CustomerApplicationRouteService);
  const options: CustomerAccountRouteOptions = {
    tokenConfig: {
      issuer: identity.issuer,
      audience: 'loan-platform-customer-api',
      publicKeyPem: 'test-public-key-not-used-by-verifier-stub',
    },
    profileEncryptionKeyHex: '4a'.repeat(32),
    applicationDeclarationVersion: 'declaration-v1',
    consentVersions: {
      privacyNoticeVersion: 'privacy-test-v1',
      termsOfServiceVersion: 'terms-test-v1',
    },
    verifyToken: vi.fn(async (token) => {
      if (token !== 'valid-customer-test-token') {
        throw Object.assign(new Error('Invalid customer identity token'), { statusCode: 401 });
      }
      return identity;
    }),
    service,
    applicationService,
    ...overrides,
  };
  return { options, service };
}

async function createApp(options: CustomerAccountRouteOptions) {
  const app = Fastify({ logger: false });
  await app.register(rateLimit);
  await app.register(buildCustomerAccountRoutes(options));
  await app.ready();
  return app;
}

describe('customer account API route contracts', () => {
  it('rejects requests without a bearer token', async () => {
    const { options } = makeOptions();
    const app = await createApp(options);
    const response = await app.inject({ method: 'GET', url: '/api/v1/customer/me' });
    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it('keeps customer routes disabled when a trusted customer issuer is not configured', async () => {
    const { options } = makeOptions({ tokenConfig: null });
    const app = await createApp(options);
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/customer/onboarding',
      headers: { authorization: 'Bearer valid-customer-test-token' },
      payload: {},
    });
    expect(response.statusCode).toBe(503);
    await app.close();
  });

  it('requires affirmative, versioned consent acknowledgements for onboarding', async () => {
    const { options, service } = makeOptions();
    const app = await createApp(options);
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/customer/onboarding',
      headers: { authorization: 'Bearer valid-customer-test-token' },
      payload: {
        displayName: 'Sample Customer',
        declaredResidenceCountryCode: 'NG',
        preferredLocale: 'en-NG',
        privacyNoticeAccepted: false,
        termsOfServiceAccepted: true,
      },
    });
    expect(response.statusCode).toBe(400);
    expect(service.onboard).not.toHaveBeenCalled();
    await app.close();
  });

  it('rate limits repeated customer onboarding attempts', async () => {
    const { options, service } = makeOptions();
    const app = await createApp(options);
    const payload = {
      displayName: 'Sample Customer',
      declaredResidenceCountryCode: 'NG',
      preferredLocale: 'en-NG',
      privacyNoticeAccepted: true,
      termsOfServiceAccepted: true,
    };
    const responses = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      responses.push(await app.inject({
        method: 'POST',
        url: '/api/v1/customer/onboarding',
        headers: { authorization: 'Bearer valid-customer-test-token' },
        payload,
      }));
    }
    expect(responses.slice(0, 5).every((response) => response.statusCode === 201)).toBe(true);
    expect(responses[5]?.statusCode).toBe(429);
    expect(service.onboard).toHaveBeenCalledTimes(5);
    await app.close();
  });

  it('onboards only from a verified customer identity and records accepted document versions', async () => {
    const { options, service } = makeOptions();
    const app = await createApp(options);
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/customer/onboarding',
      headers: { authorization: 'Bearer valid-customer-test-token' },
      payload: {
        displayName: 'Sample Customer',
        declaredResidenceCountryCode: 'NG',
        preferredLocale: 'en-NG',
        privacyNoticeAccepted: true,
        termsOfServiceAccepted: true,
      },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json().data).toMatchObject({
      customerId: customerContext.customerId,
      created: true,
      onboardingStatus: 'completed',
    });
    expect(service.onboard).toHaveBeenCalledWith(
      identity,
      expect.objectContaining({ displayName: 'Sample Customer' }),
      { privacyNoticeVersion: 'privacy-test-v1', termsOfServiceVersion: 'terms-test-v1' },
      '4a'.repeat(32),
    );
    await app.close();
  });

  it('returns only the authenticated customer profile and their own session list', async () => {
    const { options, service } = makeOptions();
    const app = await createApp(options);
    const profileResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/customer/me',
      headers: { authorization: 'Bearer valid-customer-test-token' },
    });
    const sessionsResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/customer/me/sessions',
      headers: { authorization: 'Bearer valid-customer-test-token' },
    });
    expect(profileResponse.statusCode).toBe(200);
    expect(profileResponse.json().data.profile.email).toBe(identity.email);
    expect(sessionsResponse.statusCode).toBe(200);
    expect(sessionsResponse.json().data).toHaveLength(1);
    expect(service.findContext).toHaveBeenCalledTimes(2);
    await app.close();
  });

  it('updates only supported profile fields for the authenticated customer', async () => {
    const { options, service } = makeOptions();
    const app = await createApp(options);
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/v1/customer/me/profile',
      headers: { authorization: 'Bearer valid-customer-test-token' },
      payload: { displayName: 'Updated Sample Customer', preferredLocale: 'en' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().data.profile).toMatchObject({
      email: identity.email,
      displayName: 'Updated Sample Customer',
      preferredLocale: 'en',
    });
    expect(service.updateProfile).toHaveBeenCalledWith(
      customerContext,
      { displayName: 'Updated Sample Customer', preferredLocale: 'en' },
      '4a'.repeat(32),
    );
    await app.close();
  });

  it('rejects empty or unsupported profile patches', async () => {
    const { options, service } = makeOptions();
    const app = await createApp(options);
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/v1/customer/me/profile',
      headers: { authorization: 'Bearer valid-customer-test-token' },
      payload: { email: 'attacker@example.test', emailVerified: true },
    });
    expect(response.statusCode).toBe(400);
    expect(service.updateProfile).not.toHaveBeenCalled();
    await app.close();
  });

  it('validates session identifiers before invoking the revocation service', async () => {
    const { options, service } = makeOptions();
    const app = await createApp(options);
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/customer/me/sessions/not-a-uuid/revoke',
      headers: { authorization: 'Bearer valid-customer-test-token' },
    });
    expect(response.statusCode).toBe(400);
    expect(service.revokeSession).not.toHaveBeenCalled();
    await app.close();
  });

  it('allows a customer to revoke a session belonging to their own account', async () => {
    const { options, service } = makeOptions();
    const app = await createApp(options);
    const otherSessionId = 'bd2d3408-ec69-4b77-8de6-71ac22542f98';
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/customer/me/sessions/' + otherSessionId + '/revoke',
      headers: { authorization: 'Bearer valid-customer-test-token' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().data).toMatchObject({
      sessionId: otherSessionId,
      revoked: true,
      currentSession: false,
    });
    expect(service.revokeSession).toHaveBeenCalledWith(customerContext, otherSessionId);
    await app.close();
  });

  it('revokes the current session through logout', async () => {
    const { options, service } = makeOptions();
    const app = await createApp(options);
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/customer/auth/logout',
      headers: { authorization: 'Bearer valid-customer-test-token' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().data.loggedOut).toBe(true);
    expect(service.revokeSession).toHaveBeenCalledWith(customerContext, customerContext.currentSessionId);
    await app.close();
  });
});
