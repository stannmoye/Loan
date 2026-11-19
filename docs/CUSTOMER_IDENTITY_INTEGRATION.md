# Customer identity and account integration contract

**Stage:** Stage 2 foundation slice  
**Status:** API/database scaffolding implemented; external identity provider and production secrets not configured  
**Applies to:** /api/v1/customer/*  
**Last updated:** 2026-11-19

This document defines the boundary between this API and a future customer identity provider. It is an implementation contract, not a claim that an identity provider, customer authentication, KYC, or a lending jurisdiction is live.

## 1. Responsibilities and trust boundary

The platform does not collect or verify customer passwords, issue one-time passwords, implement password reset, or perform multi-factor authentication in this increment. Those authentication and account-recovery responsibilities belong to a separately selected and configured identity provider.

The platform accepts only a signed customer access token from a separately configured customer issuer. The API independently validates its signature, issuer, audience, algorithm, expiration, customer-principal marker, verified email claim, subject and provider session identifier. An admin access token is not a customer token and must be rejected, even if it was signed by the same organisation.

The provider must:
- Use a dedicated RS256 signing key and a customer-specific issuer/audience configuration. Do not reuse the admin API's token audience or signing key.
- Issue access tokens for an authenticated customer only after the provider's own login and any configured MFA/recovery controls have succeeded.
- Set principal_type to exactly customer.
- Set sub to a stable, opaque provider subject. It must not contain a name, email address, phone number or other directly identifying information.
- Set sid to a stable, opaque per-provider-session identifier with at least 128 bits of unpredictability. This identifies a provider session; it is not an account number or a human-readable device name.
- Set email to a syntactically valid email address and email_verified to the boolean true only after the provider has verified ownership.
- Include iss, aud, iat and exp standard claims. Access-token lifetime should be short and governed by provider policy. The API enforces the signed expiration and allows only a small clock tolerance.
- Publish public-key rotation information operationally. Rotation requires a coordinated overlap of trusted public keys; this first increment accepts a configured SPKI public key and does not yet implement remote JWKS discovery or automatic key rotation.

The API never accepts customer identity, subject, verified-email flag, or session ID from a request body. Those fields are derived exclusively from the verified token.

## 2. Customer identity claims

Required signed JWT claims:

| Claim | Required value | Purpose |
|---|---|---|
| iss | Exact configured customer issuer | Trust-domain binding |
| aud | Exact configured customer API audience | Prevent token reuse at the admin API or another service |
| sub | Stable opaque provider subject | Link an external identity to one internal customer |
| exp | Future Unix timestamp | Bound token lifetime |
| principal_type | customer | Enforce customer/admin principal separation |
| sid | Stable opaque provider-session ID | Link requests to a revocable application session |
| email | Valid email address | Provider-asserted verified contact |
| email_verified | Boolean true | Do not trust an unverified address |

RS256 is the only accepted signing algorithm. Algorithm negotiation, none, HS256, token-supplied keys, unsigned claims and request-body identity overrides are not supported.

The current API validates a configured PEM public key. It does not yet fetch provider JWKS, handle multiple simultaneous signing keys, query provider introspection, or receive provider back-channel logout events. These must be addressed before a provider rotation or global revocation policy is deployed.

## 3. Required environment configuration

Customer routes are disabled unless the separate identity and data-protection settings are supplied. Example names are documented in .env.example:

| Variable | Required before enabling | Notes |
|---|---|---|
| CUSTOMER_JWT_ISSUER | Yes | Exact customer token issuer |
| CUSTOMER_JWT_AUDIENCE | Yes | Dedicated customer API audience |
| CUSTOMER_JWT_PUBLIC_KEY_PEM | Yes | Customer provider SPKI public key only |
| CUSTOMER_PROFILE_ENCRYPTION_KEY_HEX | Yes | Dedicated random 32-byte AES-256 key, represented by 64 hex characters |
| CUSTOMER_PRIVACY_NOTICE_VERSION | Yes | Exact published document identifier |
| CUSTOMER_TERMS_OF_SERVICE_VERSION | Yes | Exact published document identifier |

Store actual keys in a secret manager or protected deployment secret store. Never commit real key material, a .env file, production tokens or customer information. Do not reuse the admin JWT key as the customer key, and do not reuse the profile-encryption key for token signing, session hashing or unrelated cryptographic uses.

Configuration being syntactically present does not constitute legal approval. The privacy notice and terms versions must resolve to final documents approved by the actual contracting entity and reviewed for the intended jurisdiction. Country codes in a customer's profile are self-declared and are not evidence of residence, identity, eligibility or permission to lend.

## 4. Customer API routes

All routes require Authorization: Bearer <customer-access-token> except for a route that explicitly reports the feature is not configured. Missing, malformed, expired, invalid-signature, wrong-issuer, wrong-audience, wrong-principal or unverified-email tokens are denied.

| Method | Path | Purpose |
|---|---|---|
| POST | /api/v1/customer/onboarding | Create or resume a customer profile from a verified external identity and record the current required document acknowledgements |
| GET | /api/v1/customer/me | Return the authenticated customer's own profile, account state and acknowledgement history |
| PATCH | /api/v1/customer/me/profile | Update supported profile fields only |
| GET | /api/v1/customer/me/sessions | List recent sessions linked to the authenticated customer's account |
| POST | /api/v1/customer/me/sessions/:sessionId/revoke | Revoke one session belonging to the authenticated customer |
| POST | /api/v1/customer/auth/logout | Revoke the current local customer session |

The onboarding route is rate-limited. Unsupported fields are rejected; identity subject, email and verification status cannot be set through the onboarding body. Privacy notice and terms acknowledgements are required before account creation.

GET /me, profile update, session list, revoke and logout first resolve the internal account using both the verified identity link and a non-revoked session record. They do not accept a customer ID from the caller. Session revocation is scoped by both session ID and the authenticated customer's own internal account ID.

Logout revokes the application's local session. It does not claim to terminate the external identity-provider browser session or revoke provider-issued tokens. Provider logout/back-channel logout is a later integration requirement.

## 5. Data model and privacy handling

Migration 003_customer_identity_and_accounts.sql creates:
- customer_accounts: internal UUID account ID and lifecycle state.
- customer_identity_links: unique (issuer, external_subject) link to the internal account.
- customer_profiles: encrypted profile blob and encryption format version.
- customer_sessions: internal session record, SHA-256 hash of issuer + provider session ID, expiration, activity timestamp and local revocation timestamp.
- customer_consents: immutable acknowledgement rows tied to a customer and session, with document type, version and acceptance time.
- customer_security_events: append-only application events for account creation, session start/revocation and profile/consent changes.

Profile fields are encrypted with AES-256-GCM using a random nonce for each encryption. The internal customer UUID is authenticated as additional data so a ciphertext copied to a different account cannot be decrypted successfully. The database stores ciphertext, not the profile's email, display name, declared country or preferred locale in clear text.

The issuer and external subject are stored to support account resolution and remain pseudonymous identity data that must be protected as personal data. Do not place either value, email addresses, tokens, passwords, document contents or encryption keys in application logs or audit metadata.

Audit and security events record action type and changed-field names, not the sensitive field values. The customer runtime database role must receive only the minimum required SELECT, INSERT and narrowly scoped UPDATE privileges for the relevant tables; security-event and audit-event tables should be append-only to the runtime role. Database grants and retention controls are deployment work and have not been established by CI.

The current encrypted-record format uses version 1. Production operation requires a documented key custody, backup, rotation, recovery and re-encryption process. Replacing the key without re-encrypting records would make customer profiles unreadable. Key rotation tooling is not part of this increment.

## 6. Account and session behavior

- New accounts begin active as account records only. This does not mean a customer has passed KYC, credit assessment, affordability review or loan approval.
- A unique database constraint on (issuer, external_subject) prevents the same provider identity from creating two internal accounts at the same issuer.
- Accounts linked through different identity providers are not automatically merged. Account linking, duplicate-person resolution and assisted recovery require a separate verified process.
- A session record is associated with a provider's opaque sid. The database stores a one-way SHA-256 digest of issuer plus session ID, not the raw session claim.
- A valid, fresh, signed token can refresh the local session expiration. A locally revoked session remains revoked even if a token has not yet expired.
- A suspended or closed account is denied.
- Customers can list their own recent sessions and revoke only sessions attached to their own account.
- Profile updates are limited to display name, self-declared residence country and preferred locale. Email and email-verification state come from the provider and cannot be edited here.
- Customer activity and account changes produce an audit event and, where relevant, a security event in the same transaction as the underlying write.

This increment does not yet show IP address, device fingerprint or geographic session metadata. It does not implement provider introspection, global token revocation, device trust, MFA enrollment, password changes, password reset, contact-verification messaging or recovery review.

## 7. Consent and jurisdiction boundaries

The database records the exact privacy-notice and terms-of-service document versions acknowledged during onboarding. This is an acknowledgement record, not an engineering determination of the lawful basis for processing personal data. Legal counsel must determine the appropriate lawful bases, mandatory disclosures, data subject rights, retention periods, cross-border transfers, age/eligibility requirements and consumer protections for each operating entity and jurisdiction.

The customer-declared residence country is a profile field only. It must not enable a product, country/currency corridor, bank payout route or lending decision. The platform's seeded country and currency catalogue remains disabled by default and is not regulatory or provider coverage.

## 8. Verification performed

The Stage 1 CI pipeline now runs the numbered MySQL migrations and the customer schema integration checks against a disposable MySQL 8.4 service. The expanded integration script uses synthetic identifiers inside a transaction that is rolled back. It checks unique provider identity mappings, customer-session mapping uniqueness, consent version uniqueness, profile-row persistence, security-event recording and session revocation.

The Vitest suite covers signed RS256 customer token validation, admin/customer principal separation, verified-email requirements, issuer/audience/expiry checks, bearer parsing, AES-256-GCM round trips, ciphertext tampering and customer-ID AAD isolation. Fastify route tests cover configuration-off behavior, onboarding consent gates, authenticated profile/session views, profile patch validation, session revocation and logout.

Passing test and CI results do not mean a real identity provider, production keys, privacy notice, terms, legal review, MFA, KYC or lending country is configured. This integration boundary must remain disabled until the provider, keys, documents, grants, privacy and jurisdiction controls are deliberately configured and independently reviewed.

## 9. Remaining Stage 2 work

1. Select and review a customer identity provider, configure a dedicated customer audience/key and validate real provider sandbox-issued tokens through the adapter.
2. Add provider JWKS/key rotation, provider logout/back-channel revocation and a documented access-token/session-lifetime policy.
3. Complete MFA, recovery and contact-change assurance through the selected provider, with support-assisted recovery controls where required.
4. Add secure device/session metadata, sign-in notification integration and customer security preferences without over-collecting location/device data.
5. Implement a tested database-role and secret-management deployment profile, append-only audit/security-event grants, encryption-key rotation/re-encryption and restore drills.
6. Complete privacy, retention, data-subject-rights and cross-border-transfer design with legal/privacy review for the first authorised operating entity and jurisdiction.
7. Add a privacy-safe security/audit history view and support workflow for disputed or suspended identities.
8. Keep all lending corridors disabled until the separate jurisdiction, provider, product and financial-control gates are approved.
