import { describe, expect, it, vi } from "vitest";
import {
  createCustomerApiClient,
  CustomerApiError,
  type CustomerAccount,
} from "./customer-api";

const account: CustomerAccount = {
  customerId: "customer-sample-001",
  status: "active",
  createdAt: "2026-11-19T10:00:00.000Z",
  profile: {
    email: "customer@example.test",
    emailVerified: true,
    displayName: "Sample Customer",
    declaredResidenceCountryCode: "NG",
    preferredLocale: "en-NG",
  },
  consents: [],
};

function response(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}

describe("customer API client", () => {
  it("resolves a fresh bearer token for each request and disables browser credential/cache reuse", async () => {
    const fetchImpl = vi.fn(async () => response(200, { data: account }));
    const getAccessToken = vi.fn(async () => "signed-customer-access-token");
    const api = createCustomerApiClient({
      baseUrl: "https://api.example.test/",
      getAccessToken,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(api.getMe()).resolves.toEqual(account);
    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/customer/me",
      expect.objectContaining({
        method: "GET",
        credentials: "omit",
        cache: "no-store",
        redirect: "error",
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer signed-customer-access-token",
        }),
      }),
    );
  });

  it("submits only the supported onboarding fields to the provider-backed route", async () => {
    const fetchImpl = vi.fn(async () => response(201, {
      data: { customerId: "customer-sample-001", created: true, onboardingStatus: "completed" },
    }));
    const api = createCustomerApiClient({
      baseUrl: "https://api.example.test",
      getAccessToken: async () => "signed-customer-access-token",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const input = {
      displayName: "Sample Customer",
      declaredResidenceCountryCode: "NG",
      preferredLocale: "en-NG",
      privacyNoticeAccepted: true as const,
      termsOfServiceAccepted: true as const,
    };

    await expect(api.onboard(input)).resolves.toMatchObject({ created: true });
    const init = fetchImpl.mock.calls[0]?.[1];
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe(JSON.stringify(input));
    expect((init?.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });

  it("never sends a request without a current access token", async () => {
    const fetchImpl = vi.fn();
    const api = createCustomerApiClient({
      baseUrl: "https://api.example.test",
      getAccessToken: async () => null,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(api.getMe()).rejects.toMatchObject({ statusCode: 401 });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("surfaces safe API status/message without echoing bearer credentials", async () => {
    const secretToken = "sensitive-access-token-value";
    const api = createCustomerApiClient({
      baseUrl: "https://api.example.test",
      getAccessToken: async () => secretToken,
      fetchImpl: vi.fn(async () => response(401, { error: "Invalid or expired customer identity token" })) as unknown as typeof fetch,
    });

    const error = await api.getMe().catch((value: unknown) => value);
    expect(error).toBeInstanceOf(CustomerApiError);
    expect(error).toMatchObject({ statusCode: 401 });
    expect((error as Error).message).not.toContain(secretToken);
  });

  it("encodes session identifiers before building revoke/logout calls", async () => {
    const fetchImpl = vi.fn(async () => response(200, {
      data: { sessionId: "session/with/slash", revoked: true, currentSession: false },
    }));
    const api = createCustomerApiClient({
      baseUrl: "https://api.example.test",
      getAccessToken: async () => "signed-customer-access-token",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await api.revokeSession("session/with/slash");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/customer/me/sessions/session%2Fwith%2Fslash/revoke",
      expect.any(Object),
    );
  });

  it("rejects unsafe API base URLs and invalid response envelopes", async () => {
    expect(() => createCustomerApiClient({
      baseUrl: "javascript:alert(1)",
      getAccessToken: async () => "token",
    })).toThrow(/HTTP or HTTPS/i);

    const api = createCustomerApiClient({
      baseUrl: "https://api.example.test",
      getAccessToken: async () => "token",
      fetchImpl: vi.fn(async () => response(200, { success: true })) as unknown as typeof fetch,
    });
    await expect(api.getMe()).rejects.toMatchObject({ statusCode: 502 });
  });
});
