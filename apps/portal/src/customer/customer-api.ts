export type CustomerProfile = {
  email: string;
  emailVerified: true;
  displayName: string;
  declaredResidenceCountryCode: string;
  preferredLocale: string;
};

export type CustomerConsentRecord = {
  type: "privacy_notice" | "terms_of_service";
  documentVersion: string;
  acceptedAt: string;
};

export type CustomerAccount = {
  customerId: string;
  status: "active" | "suspended" | "closed";
  createdAt: string;
  profile: CustomerProfile;
  consents: CustomerConsentRecord[];
};

export type CustomerSession = {
  id: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  revokedAt: string | null;
  current: boolean;
};

export type CustomerOnboardingInput = {
  displayName: string;
  declaredResidenceCountryCode: string;
  preferredLocale?: string;
  privacyNoticeAccepted: true;
  termsOfServiceAccepted: true;
};

export type CustomerProfilePatch = Partial<
  Pick<CustomerProfile, "displayName" | "declaredResidenceCountryCode" | "preferredLocale">
>;


export type CustomerApplicationStatus =
  | "draft" | "submitted" | "under_review" | "awaiting_documents"
  | "approved_conditionally" | "declined" | "withdrawn" | "cancelled"
  | "funding_pending" | "funded";

export type CustomerApplicationProductSnapshot = {
  productId: number;
  productCode: string;
  productName: string;
  productVersionId: number;
  versionNumber: number;
  currencyCode: string;
  minimumAmount: string;
  maximumAmount: string;
  minimumDurationDays: number;
  maximumDurationDays: number;
  interestModel: string;
  annualInterestRateBps: number;
  repaymentFrequency: string;
  requiresCollateral: boolean;
  requiresGuarantor: boolean;
  riskReviewRequired: boolean;
  effectiveFrom: string | null;
  effectiveUntil: string | null;
};

export type CustomerApplicationEvent = {
  event_type: string;
  from_status: CustomerApplicationStatus | null;
  to_status: CustomerApplicationStatus | null;
  created_at: string;
};

export type CustomerApplication = {
  id: string;
  status: CustomerApplicationStatus;
  requested_amount: string;
  currency_code: string;
  requested_duration_days: number;
  product_terms_snapshot: CustomerApplicationProductSnapshot;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  timeline?: CustomerApplicationEvent[];
};

export type CustomerApplicationApi = {
  listApplications(): Promise<CustomerApplication[]>;
  getApplication(applicationId: string): Promise<CustomerApplication>;
  submitApplication(applicationId: string): Promise<{ id: string; status: CustomerApplicationStatus }>;
  withdrawApplication(applicationId: string): Promise<{ id: string; status: CustomerApplicationStatus }>;
};

export class CustomerApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "CustomerApiError";
  }
}

type ApiEnvelope<T> = { data: T };

export type CustomerApiClientOptions = {
  /** API origin/base path, for example https://api.example.com */
  baseUrl: string;
  /** Resolve a current access token from the configured identity SDK on each request. */
  getAccessToken: () => Promise<string | null>;
  /** Injectable fetch implementation for tests and controlled runtimes. */
  fetchImpl?: typeof fetch;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createCustomerApiClient(options: CustomerApiClientOptions) {
  const parsedBase = new URL(options.baseUrl);
  const isLoopback = parsedBase.hostname === "localhost" ||
    parsedBase.hostname === "127.0.0.1" ||
    parsedBase.hostname === "[::1]" ||
    parsedBase.hostname === "::1";
  if (parsedBase.protocol !== "https:" && !(parsedBase.protocol === "http:" && isLoopback)) {
    throw new Error("Customer API base URL must use HTTPS except for local loopback development");
  }
  if (parsedBase.username || parsedBase.password || parsedBase.search || parsedBase.hash) {
    throw new Error("Customer API base URL must not contain credentials, query parameters or fragments");
  }
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const fetchImpl = options.fetchImpl ?? fetch;

  async function request<T>(
    path: string,
    method: "GET" | "POST" | "PATCH",
    body?: unknown,
  ): Promise<T> {
    let token: string | null;
    try {
      token = await options.getAccessToken();
    } catch {
      throw new CustomerApiError("Customer session could not be verified", 503);
    }
    if (!token || token.trim() !== token || /\s/.test(token)) {
      throw new CustomerApiError("A signed-in customer session is required", 401);
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: "Bearer " + token,
    };
    const init: RequestInit = {
      method,
      headers,
      credentials: "omit",
      cache: "no-store",
      redirect: "error",
    };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetchImpl(baseUrl + path, init);
    } catch {
      throw new CustomerApiError("Customer service could not be reached", 503);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message = isRecord(payload) && typeof payload.error === "string"
        ? payload.error
        : "Customer service request failed";
      throw new CustomerApiError(message, response.status);
    }

    if (!isRecord(payload) || !("data" in payload)) {
      throw new CustomerApiError("Customer service returned an invalid response", 502);
    }
    return (payload as ApiEnvelope<T>).data;
  }

  return {
    onboard(input: CustomerOnboardingInput) {
      return request<{ customerId: string; created: boolean; onboardingStatus: "completed" }>(
        "/api/v1/customer/onboarding", "POST", input,
      );
    },
    getMe() {
      return request<CustomerAccount>("/api/v1/customer/me", "GET");
    },
    updateProfile(input: CustomerProfilePatch) {
      return request<{ customerId: string; profile: CustomerProfile }>(
        "/api/v1/customer/me/profile", "PATCH", input,
      );
    },
    listSessions() {
      return request<CustomerSession[]>("/api/v1/customer/me/sessions", "GET");
    },
    revokeSession(sessionId: string) {
      return request<{ sessionId: string; revoked: boolean; currentSession: boolean }>(
        "/api/v1/customer/me/sessions/" + encodeURIComponent(sessionId) + "/revoke", "POST",
      );
    },
    listApplications() {
      return request<CustomerApplication[]>("/api/v1/customer/me/applications", "GET");
    },
    getApplication(applicationId: string) {
      return request<CustomerApplication>(
        "/api/v1/customer/me/applications/" + encodeURIComponent(applicationId), "GET",
      );
    },
    submitApplication(applicationId: string) {
      return request<{ id: string; status: CustomerApplicationStatus }>(
        "/api/v1/customer/me/applications/" + encodeURIComponent(applicationId) + "/submit", "POST",
      );
    },
    withdrawApplication(applicationId: string) {
      return request<{ id: string; status: CustomerApplicationStatus }>(
        "/api/v1/customer/me/applications/" + encodeURIComponent(applicationId) + "/withdraw", "POST",
      );
    },
    logout() {
      return request<{ loggedOut: boolean }>("/api/v1/customer/auth/logout", "POST");
    },
  };
}
