# Global Digital Lending Platform — Implementation Plan

**Plan version:** 1.0  
**Plan date:** 2026-11-19  
**Delivery status:** Planning baseline published; Stage 1 verification in progress  
**Authoritative scope:** Master Development Specification and AI Implementation Handbook supplied by the project owner

## 1. Purpose and delivery rules

Build a functioning, secure digital lending platform with a customer portal, a separate administrative command centre, versioned APIs, persistent database state, auditable workflows, integration adapters, automated tests, and reproducible operations documentation. The target scope is the complete 60-feature register and the 12 staged acceptance gates in the master specification. This plan does not imply that any unimplemented feature is complete.

Development is continuous and evidence-driven. Preserve the supplied Stage 1 implementation and its established stack. Prefer an evolvable modular monolith with explicit domain boundaries over premature microservices. Each change must be reviewable, tested, documented, and reflected in the feature register. Do not progress past a gate by relabeling a failed or unavailable check.

### Non-negotiable safety and correctness rules

- Keep the platform and all country/currency/product corridors disabled for actual lending until the relevant legal, compliance, operational, and provider approvals have been documented. Country reference rows are not evidence of legal coverage.
- Do not fabricate identity checks, bank verification, payment success, settlement, balances, or loan approvals. Adapters may expose honest sandbox/test behavior, clearly labelled as such.
- Use exact decimal or integer minor-unit arithmetic for money. No binary floating-point money calculations. Every posted journal is balanced in its currency context, immutable, idempotent, and corrected by reversal/compensating entries.
- Do not make spendable balances independently editable. Balances must be projections of valid ledger entries and account rules; pending, available, reserved, and restricted funds remain distinct.
- Preserve signed agreements and accepted term snapshots. Amend by creating a new authorized version; never overwrite the historical signed record.
- Enforce server-side role/permission checks, least privilege, maker-checker separation for designated actions, transaction boundaries, audit trails, idempotency, and secure handling of personal data.
- Synthetic tests must not create real financial obligations or initiate real payment-provider actions. No production secret, private key, identity evidence, or customer data may enter Git.
- Record uncertainty honestly. A successful static check does not establish type safety, database behavior, remote CI success, provider availability, legal readiness, or production readiness.

## 2. Starting point and verified repository baseline

Repository: [`stannmoye/Loan`](https://github.com/stannmoye/Loan), default branch `main`.

The repository initially contains a Stage 1 ZIP archive and a placeholder root README. The archive contains a Node.js 22+/TypeScript/Fastify API, MySQL 8.4-compatible InnoDB migrations, Zod validation, Vitest unit tests, a catalogue seed, an RS256 permission-claim admin-auth plugin, product routes/services, static invariant scripts, a MySQL integration script, and a GitHub Actions workflow. Its own `README.md` and `STAGE_1_STATUS.md` are the first project-specific documents to consult.

The starter describes implemented catalogue foundations: 19 categories and 66 product types; configurable/versioned loan terms; disabled-by-default country/currency eligibility; maker-checker product approval; audit writes; and migration/seed tooling. It expressly does **not** implement identity, customer or admin portals, applications, KYC, underwriting, contracts, loan servicing, ledger, wallets/balances, disbursements, withdrawals, notifications, support, or live provider connections.

Baseline checks were executed from the extracted starter on 2026-11-19:

- `python3 test/catalogue-integrity.py` — **PASS** (19 categories, 66 unique product types, valid category references).
- `python3 test/stage1-invariants.py` — **PASS** (static seed-safety/transaction, product/category, publication/approval uniqueness, decision, timing and API-validation invariants).
- Node.js available: v22.23.4.
- `node_modules` absent; no dependency installation or full type-check/Vitest run has yet been completed.
- MySQL CLI exists, but no running/configured isolated MySQL 8.4 instance has been demonstrated. Migration/seed/integration assertions remain unverified.
- The starter's prior status report says registry DNS prevented dependency installation and live DB tests; this is historical starter evidence, not a fresh rerun.
- Remote GitHub Actions status has not been checked; do not claim CI passed.

**Stage 1 progress as of 2026-11-19:** the archived source has been adopted at the repository root; the ZIP and starter README/status records are retained. The complete TypeScript build, all nine current Vitest tests, both static checks, and the full npm dependency audit pass. A strict-unknown error in the admin-auth handler was corrected, and Vitest was upgraded to 5.1.1 to resolve the vulnerabilities reported in its prior 3.x dependency tree. Stage 1 remains open because no isolated MySQL 8.4 server is configured, database integration checks have not run, and GitHub Actions status has not been checked. These results and remaining blockers are also recorded in `progress.md` and `STAGE_1_STATUS.md`.

## 3. Architecture and design decisions

### 3.1 Initial architecture

Use the existing Fastify API and MySQL/InnoDB as the persistent system of record. Keep domain modules in a modular monolith. Add customer and admin React/TypeScript frontends only after confirming whether the archive/repository contains any existing UI or project-specific instructions. Do not create separate deployable services without an evidenced need.

Logical backend boundaries (initially in-process modules):

1. Identity/access and sessions.
2. Customer profiles, consents, devices and security events.
3. Country, currency, legal entity and lending policy.
4. Loan category, product, product versions and eligibility.
5. Applications and dynamic form snapshots.
6. Workflow definitions, versions, instances and transitions.
7. Secure documents and reviews.
8. Identity verification/provider cases.
9. Credit, risk, fraud and underwriting.
10. Offers, contracts, signatures and amendments.
11. Loan accounts, repayment schedules and servicing.
12. Payments, collections and payouts.
13. Chart of accounts, double-entry ledger and wallets.
14. Bank directory and independent validation/payout capabilities.
15. Notifications and customer support.
16. Administration, analytics, audit, integration adapters and operational controls.

External services are called only through narrow provider interfaces. Provider-specific mapping, auth, retries, timeouts, idempotency, webhook verification and error handling belong in adapters, not domain handlers. Use a transactional outbox or equivalent where an in-transaction state change must reliably trigger an external side effect.

### 3.2 Data/API conventions

- MySQL 8.4 / InnoDB, foreign keys, unique constraints, appropriate indexes, transactional multi-record changes, explicit archival/retention rules. Do not cascade-delete financial history, audit history, or signed contracts.
- Versioned REST endpoints under `/api/v1/`; every route defines authentication, authorization, validation, response/error schema, rate limits where appropriate, and audit expectations.
- Store precise monetary values and an explicit currency precision policy; interest models must specify calculation basis, day-count convention, compounding, rounding, and contract snapshot.
- Snapshot the effective product/form/workflow/policy/credit-model/contract versions used when a customer enters a process or accepts terms.
- Every mutating administrative or financial operation records actor, action, target, reason, timestamp, correlation ID, prior/next state where appropriate, and approval evidence.
- Treat IP-derived location as an estimate only, never proof of residence or identity. Make customer-correctable country selection explicit.

## 4. Stage-by-stage roadmap and acceptance gates

Stages are sequential at acceptance-gate level; within a stage, independent documentation, tests, and modules can proceed in parallel. A stage's completion evidence is recorded in `docs/FEATURE_STATUS.md` and `progress.md`.

### Stage 1 — Existing project verification and adoption

**Work:** inventory repository/archive; read every README/status/instruction file; preserve archived starter; extract and integrate source without overwriting project-specific documentation; map APIs/models/migrations/seeds/tests/CI; run current tests; inspect dependency, migration and security posture; record baseline and gaps. Resolve reproducible setup and lockfile/dependency installation if network permits; never apply migrations to an unconfirmed/non-disposable database.

**Gate:** source inventory, feature map, dependency assessment, migration/data review, reproducible test baseline and architecture assessment accurately describe the actual repository. Static tests, build/unit tests, and MySQL integration results are reported separately.

### Stage 2 — Foundation, identity, permissions and audit

**Features:** 01–04, 08 and identity/access pieces of 50, 56, 59. Implement customer registration/onboarding, contact verification flow, password setup/reset, MFA/session lifecycle, security events, consent capture, profile controls, staff/customer separation, policy-backed authorization, rate limits, audited sensitive changes and safe environment configuration. Integrate an external identity system only through an adapter; no fabricated OTP/KYC pass.

**Gate:** automated tests demonstrate unauthorized customer/staff cross-access is denied, sessions and authorization are enforced server-side, account recovery controls work, and sensitive actions are auditable. Production identity provider setup remains separately evidenced.

### Stage 3 — Product catalogue and jurisdiction controls

**Features:** 09–16 and policy settings of 54. Preserve all 19 categories/66 product types; implement admin configuration, min/max amount, currency, rate/fee/tax models, duration/frequency/grace settings, explicit country and product eligibility, disclosures, product version history and comparisons. Publish only with explicit eligibility and separate maker-checker approval.

**Gate:** catalogue integrity tests pass; all 66 product types retain distinct identity; invalid limits/model combinations fail server-side; country/currency default-deny remains; accepted offers reference immutable terms snapshots; unapproved product cannot be published.

### Stage 4 — Customer portal foundations

**Features:** 03–08, 19, customer-facing parts of 49. Build responsive customer React/TypeScript portal with design tokens, navigation, onboarding/profile/security, dashboard, application tracking shell and persistent notification inbox. Dashboard values must derive from authoritative application, servicing and ledger records; show a clear empty state before relevant records exist.

**Gate:** user can complete available registration/authentication flows, sees only own data and authorized actions, responsive layouts work across target widths, keyboard/accessibility checks are performed, and no demo amount is presented as actual customer money.

### Stage 5 — Administrative command centre

**Features:** 49–56, operations views for 23/30–32. Build separate staff portal/navigation, server-protected customer/product/role/workflow tools, customer search and review, audit history, dashboard, operational reports and controlled settings. Permission checks are not merely UI hiding.

**Gate:** integration tests prove privilege boundaries for every privileged route and administrative changes require proper role/reason/audit; maker-checker prevents self-approval where configured; financial history is not editable via admin tools.

### Stage 6 — Applications, documents and workflow engine

**Features:** 17–24. Implement versioned dynamic application forms; submission and customer tracking; versioned configurable workflow definitions, instances and transitions; required documents, private uploads, validation, classification, review, rejection/re-submission and expiry; review and appeal records. Preserve each application's form and workflow definition version.

**Gate:** end-to-end synthetic application progresses through configured stages with persisted, auditable transitions and permissions; required-document conditions and unauthorized transitions are rejected; secure file access and metadata are tested.

### Stage 7 — Verification, credit/risk and underwriting

**Features:** 25–32. Add provider adapters and provider-result persistence; KYC/document authenticity cases; configurable and versioned credit assessment/risk model, explanation records, affordability signals, fraud case investigation, manual underwriting and maker-checker controls. AI assistance may summarize/suggest, but cannot silently make high-impact lending decisions.

**Gate:** source/provider, model/policy version, confidence/limitations, authorized reviewer and decision explanation are traceable; human review and appeal controls exist; sandbox outcomes are labeled, and no live provider is claimed without a successful provider-specific test.

### Stage 8 — Offers, signatures, servicing and calculations

**Features:** 33–40. Generate offers only from approved versioned terms; include costs, payment schedule and expiry. Generate versioned contracts; integrate a signature adapter with integrity/evidence storage; create loan accounts only from authorized accepted agreements; implement deterministic schedule/interest/fee calculations, payment allocations, arrears, hardship/restructuring and immutable amendments.

**Gate:** reproducible calculation tests cover boundary dates, day counts, compounding, currency rounding, early repayment and repayment allocations; accepted agreement survives later product edits; signatures are honest sandbox or verifiable provider-backed records.

### Stage 9 — Financial ledger and payment operations

**Features:** 41–48. Add chart of accounts, currency-scoped balanced journals, immutable posting/reversals, idempotency, currency wallets and balance projections; integrate payment/payout provider adapters; disbursement/repayment/withdrawal state machines; independent bank-directory, account-validation and payout capability; settlement reconciliation and financial reports.

**Gate:** automated invariant suite proves balanced journals, duplicate-event safety, failure does not create available funds, reversal preserves history, pending/restricted funds are excluded from available balances, accepted terms remain fixed and payment allocations reconcile. Sandbox scenarios cannot issue actual payments.

### Stage 10 — Integrations and advanced operations

**Features:** 06, 07, 25–29, 46–48, 57–58. Add configured email/SMS/push adapters, support tickets/messages/attachments, provider health/monitoring and webhook flows; AI-assisted summaries/classification with human accountability; fraud investigation, analytics and partner API contracts. Evaluate actual provider coverage, data handling, price and operational capability before selecting production providers.

**Gate:** each enabled integration has contract tests and verified sandbox/production evidence recorded individually; unsupported provider/market remains disabled and documented. Webhook signature, retries and duplicate delivery cases pass.

### Stage 11 — Security, privacy and production readiness

**Features:** 59–60 and cross-cutting requirements. Threat modeling; encryption in transit/at-rest strategy; secure file controls; retention/deletion/anonymization policy; data subject and consent controls; backup/restore drills; security, dependency, performance, accessibility and migration testing; observability, structured logs, alerts, incident response, deployment, rollback and operations runbooks. Confirm jurisdiction legal/licensing/compliance review independently of engineering tests.

**Gate:** no known unresolved critical security or financial-integrity defect; reproducible backups restore; deployment/rollback are exercised; monitoring/incident procedures are validated; no launch jurisdiction or product is enabled without named approval evidence.

### Stage 12 — Final release and handover

Consolidate source, migrations, seeds, customer/admin portals, integration documentation, OpenAPI/API docs, security/operations runbooks, deployment and rollback instructions, known limitations, test evidence, and complete 60-feature register. Demonstrate the full synthetic sandbox scenario from customer registration through application, document review, test verification, authorization, contract, sandbox disbursement, ledger posting, repayment, allocation, reconciliation, and customer/admin histories.

**Gate:** every final acceptance item from the master specification is supported by reproducible evidence; CI is observed passing for the exact release commit; external production services are explicitly separated from sandbox coverage; every feature is honestly classified; release signoff and unresolved limitations are recorded.

## 5. Feature coverage and traceability

The complete feature-to-state/evidence matrix is maintained in [`FEATURE_STATUS.md`](FEATURE_STATUS.md). It covers customer accounts (01–08), catalogue (09–16), applications/workflows (17–24), KYC/risk (25–32), offers/servicing (33–40), financial infrastructure (41–48), administration (49–56), and advanced infrastructure (57–60). Update the matrix as part of each implementation increment.

Allowed feature states only:

- `NOT STARTED`
- `IN PROGRESS`
- `IMPLEMENTED — NOT VERIFIED`
- `VERIFIED IN TEST ENVIRONMENT`
- `AVAILABLE IN PRODUCTION`

Evidence must cite concrete source/tests/provider or approval records. Do not mark `AVAILABLE IN PRODUCTION` for an adapter, mock, seed, local pass, or unconfigured provider.

## 6. Required test and quality strategy

### Unit tests

Interest and fee calculations; schedules and allocations; eligibility; workflow transitions; exact money arithmetic; balance projections; product validation; permissions; country/currency policy; version snapshots; idempotency keys and webhook event handling.

### Integration tests

Migration and seed from a clean isolated MySQL database; rollback and constraints; authentication/session; permission checks; product create/approval/publication; application and document lifecycle; underwriting; contract acceptance; ledger posting and reversal; payment state transitions; webhook duplicate/signature behavior; withdrawals; reconciliation. DB tests must never point at an unknown, shared, staging, or production database.

### End-to-end sandbox journey

Use synthetic fixture identities and sandbox-only providers: create demo customer; register/verify test contact; sign in; browse eligible product; apply; upload test documents; staff review; record test verification; approve; generate/accept offer; execute test contract; authorize sandbox disbursement; simulate clearly labelled settlement; post balanced journal; display projected balance; generate repayment schedule; record sandbox repayment; allocate; reconcile; verify customer and admin audit/history views. Assert no real payment or customer obligation can be created.

### Quality reporting

For every test run, report command/environment, pass/fail/skip/block counts, and external-service status. Record CI link/status only after actually checking it. Review migration forwards/rollback implications, seed idempotency, access boundaries, mobile layouts, keyboard access, secrets scan, dependency/security advisories, query performance and log privacy.

## 7. Initial execution sequence

1. Publish this plan, AI contributor guidance, feature matrix, root README and progress baseline to GitHub before application source changes.
2. Extract the archived Stage 1 source into the repository root, retain the original ZIP as provenance, and merge rather than overwrite the useful starter README and `STAGE_1_STATUS.md`.
3. Run static tests at the adopted root. Restore package-registry access and install exact dependencies/lockfile, then run typecheck/build and Vitest. Do not conceal a registry blocker.
4. Provision or access a disposable MySQL 8.4 database, verify its identity/configuration before applying migrations, then run migration, seed and integration test. Never use production/shared data.
5. Inspect CI results for the exact commit; fix real failures. Review Stage 1 security and database immutability/privilege requirements before moving to Stage 2.
6. Work through roadmap with small commits, updating plan/status/progress and tests as part of each increment.

## 8. Scope and dependency boundaries

Some decisions require operator input or external review before activation, but should not block safe platform scaffolding: lender/marketplace operating model; initial licensed jurisdictions; legal entities; disclosure/affordability/collections rules; identity and signature vendor; payment-collection/payout providers; support and notification vendors; data residency/retention; production hosting, domains and environment ownership. Until decided and evidenced, implement adapter contracts/configuration only, keep coverage disabled, and list the missing decision as a blocker.

## 9. Definition of done for each increment

An increment is done only when: acceptance criteria are explicit; implementation is connected to real persisted application behavior; relevant automated tests pass; migrations are safe and reproducible; permissions/audit/security implications are covered; docs and feature evidence are updated; secrets and real customer/payment data are absent; and the completion report clearly distinguishes done from blocked/unverified work.
