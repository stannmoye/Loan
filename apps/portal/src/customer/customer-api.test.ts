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
    const requests: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      requests.push({ input, init });
      return response(201, {
        data: { customerId: "customer-sample-001", created: true, onboardingStatus: "completed" },
      });
    };
    const api = createCustomerApiClient({
      baseUrl: "https://api.example.test",
      getAccessToken: async () => "signed-customer-access-token",
      fetchImpl,
    });
    const input = {
      displayName: "Sample Customer",
      declaredResidenceCountryCode: "NG",
      preferredLocale: "en-NG",
      privacyNoticeAccepted: true as const,
      termsOfServiceAccepted: true as const,
    };

    await expect(api.onboard(input)).resolves.toMatchObject({ created: true });
    const request = requests[0];
    expect(request?.input).toBe("https://api.example.test/api/v1/customer/onboarding");
    expect(request?.init?.method).toBe("POST");
    expect(request?.init?.body).toBe(JSON.stringify(input));
    expect((request?.init?.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });

  it("requests a fresh token from the provider adapter for every API call", async () => {
    const getAccessToken = vi.fn(async () => "short-lived-customer-token");
    const api = createCustomerApiClient({
      baseUrl: "https://api.example.test",
      getAccessToken,
      fetchImpl: vi.fn(async () => response(200, { data: account })) as unknown as typeof fetch,
    });
    await api.getMe();
    await api.getMe();
    expect(getAccessToken).toHaveBeenCalledTimes(2);
  });

  it("does not expose identity-provider callback errors to callers", async () => {
    const api = createCustomerApiClient({
      baseUrl: "https://api.example.test",
      getAccessToken: async () => { throw new Error("sensitive provider detail"); },
      fetchImpl: vi.fn() as unknown as typeof fetch,
    });
    const error = await api.getMe().catch((value: unknown) => value);
    expect(error).toMatchObject({ statusCode: 503 });
    expect((error as Error).message).not.toContain("sensitive provider detail");
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

  it("supports allow-listed profile updates, session listing and local logout", async () => {
    const requests: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
    const payloads: unknown[] = [
      { customerId: "customer-sample-001", profile: account.profile },
      [{ id: "session-001", createdAt: "2026-11-19T10:00:00.000Z", lastSeenAt: "2026-11-19T10:01:00.000Z", expiresAt: "2026-11-19T10:05:00.000Z", revokedAt: null, current: true }],
      { loggedOut: true },
    ];
    const fetchImpl: typeof fetch = async (input, init) => {
      requests.push({ input, init });
      return response(200, { data: payloads.shift() });
    };
    const api = createCustomerApiClient({
      baseUrl: "https://api.example.test",
      getAccessToken: async () => "fresh-customer-token",
      fetchImpl,
    });

    await api.updateProfile({ displayName: "Updated Sample", preferredLocale: "en" });
    await api.listSessions();
    await expect(api.logout()).resolves.toEqual({ loggedOut: true });

    expect(requests[0]?.init?.method).toBe("PATCH");
    expect(requests[0]?.init?.body).toBe(JSON.stringify({ displayName: "Updated Sample", preferredLocale: "en" }));
    expect(requests[1]?.init?.method).toBe("GET");
    expect(requests[1]?.input).toBe("https://api.example.test/api/v1/customer/me/sessions");
    expect(requests[2]?.init?.method).toBe("POST");
    expect(requests[2]?.input).toBe("https://api.example.test/api/v1/customer/auth/logout");
  });

  it("rejects unsafe API base URLs and invalid response envelopes", async () => {
    expect(() => createCustomerApiClient({
      baseUrl: "javascript:alert(1)",
      getAccessToken: async () => "token",
    })).toThrow(/HTTPS except for local loopback/i);
    expect(() => createCustomerApiClient({
      baseUrl: "http://api.example.test",
      getAccessToken: async () => "token",
    })).toThrow(/HTTPS except for local loopback/i);
    expect(() => createCustomerApiClient({
      baseUrl: "http://localhost:3000",
      getAccessToken: async () => "token",
    })).not.toThrow();

    const api = createCustomerApiClient({
      baseUrl: "https://api.example.test",
      getAccessToken: async () => "token",
      fetchImpl: vi.fn(async () => response(200, { success: true })) as unknown as typeof fetch,
    });
    await expect(api.getMe()).rejects.toMatchObject({ statusCode: 502 });
  });
});
