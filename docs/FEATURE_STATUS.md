# Feature Status and Evidence Register

**As of:** 2026-11-19  
**Rule:** This is a delivery register, not a feature promise. Change a state only when concrete implementation and test/provider evidence support it. See [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) for definitions and stage gates.

## Summary

- Features in scope: 60
- `NOT STARTED`: 39
- `IN PROGRESS`: 21
- `IMPLEMENTED — NOT VERIFIED`: 0
- `VERIFIED IN TEST ENVIRONMENT`: 0
- `AVAILABLE IN PRODUCTION`: 0
- Production lending/provider status: no production service evidenced; all lending jurisdictions/corridors must remain disabled.

The starter archive and project have been adopted at repository root. Catalogue-related items remain `IN PROGRESS` until their individual acceptance tests pass. Stage 1 CI run [44564294708](https://github.com/stannmoye/Loan/actions/runs/44564294708) passed on portal source head `a6f9a19e33992e674fecf44bb8530884689a1c25`, including backend build, root unit tests, static checks, MySQL 8.4 migrations, seed and integration tests. Portal CI run [44578577612](https://github.com/stannmoye/Loan/actions/runs/44578577612) passed the latest client-source revision: frontend TypeScript/Vite build, 18 tests across 3 test files, and 9 Playwright desktop/mobile checks (one desktop-only mobile-navigation case intentionally skipped). Browser artifact [14557817445](https://github.com/stannmoye/Loan/actions/runs/44578577612/artifacts/14557817445) was uploaded. Stage 1 CI [44578577610](https://github.com/stannmoye/Loan/actions/runs/44578577610) passed backend build, 41 tests across 5 files, static checks, MySQL 8.4 migration, seed and integration. A subsequent docs-only revision's Stage 1 CI [44578722065](https://github.com/stannmoye/Loan/actions/runs/44578722065) also passed; its Portal CI rerun is pending. These results verify a presentation shell and test environment only; they do not establish a complete or production-ready lending service.

## A. Customer accounts and experience

| # | Feature | State | Current evidence / gap |
|---|---|---|---|
| 01 | Customer registration and onboarding | IN PROGRESS | Stage 2 API foundation adds token-authenticated onboarding, provider-derived identity, profile creation, versioned privacy/terms acknowledgement and audit/security events. No real identity provider, registration UI flow or provider sandbox configuration is active. |
| 02 | Secure authentication | IN PROGRESS | Separate customer RS256 token validation enforces issuer, audience, customer principal, verified email, subject/session claims, issued-at and a 15-minute maximum token lifetime. Local session records support list/revoke/logout. External provider, JWKS rotation, MFA, recovery, back-channel logout and authenticated portal wiring are not configured. |
| 03 | Customer profile management | IN PROGRESS | Customer GET/PATCH profile API supports a narrow allow-list and AES-256-GCM encrypted profile persistence. Provider email/verification cannot be changed by profile payloads. No authenticated portal connection, data-subject workflow or key-rotation tooling exists. |
| 04 | Country-aware onboarding | NOT STARTED | Country/currency reference catalogue is not customer country detection or residence proof. |
| 05 | Customer dashboard | IN PROGRESS | Expanded responsive customer workspace under `apps/portal/` includes eight customer views, photographic welcome area, synthetic application journey, empty-state My loans account centre, document guidance (uploads disabled), sample-only Notifications inbox, FAQ, planned security/profile guidance and searchable educational finance discovery across 19 planned categories/66 product types. Portal CI run [44564294820](https://github.com/stannmoye/Loan/actions/runs/44564294820) passed TypeScript/Vite build, 10 component tests, and 9 desktop/mobile Playwright checks (one desktop-only mobile-navigation check skipped). Full-page Overview, My loans and Notifications screenshots were inspected at desktop and mobile sizes; automated image-loading and no-overflow assertions passed. The eight-view portal includes a My loans empty account centre and sample-only Notifications inbox. The 19-category/66-type discovery catalogue and all customer content remain synthetic, with no authenticated customer API or authoritative financial projection. |
| 06 | Customer notifications | IN PROGRESS | Customer portal has a sample-only Notifications centre with four types, category filters, top-bar bell/sidebar navigation and links into related sections. Portal CI covers filtering/routing and desktop/mobile browser navigation. No real notification event store, delivery provider, preference/consent service or delivery status exists. |
| 07 | Customer support | IN PROGRESS | Customer portal includes a plain-language FAQ, support guidance and secure-channel safety content. No live ticket, messaging, attachment or support-routing service exists. |
| 08 | Customer security settings | IN PROGRESS | Backend exposes current-customer session listing, per-account session revocation and local logout with security/audit events. No customer-facing live settings view, MFA enrollment, device trust, sign-in alerts or provider-wide revocation is configured. |

## B. Loan marketplace and product management

| # | Feature | State | Current evidence / gap |
|---|---|---|---|
| 09 | Loan marketplace | IN PROGRESS | Starter describes published catalogue API filtered by enabled country/currency corridors. No customer marketplace UI; API/database behavior awaits runtime tests. |
| 10 | Complete loan catalogue (19 categories/66 types) | IN PROGRESS | Starter includes catalogue seed; extracted static `test/catalogue-integrity.py` passed 19/66 uniqueness/reference checks. Root adoption and broader persistence/API tests remain. |
| 11 | Product amount configuration | IN PROGRESS | Starter domain/service describes configured ranges; static/API/runtime validation not fully verified. |
| 12 | Interest and fee configuration | IN PROGRESS | Product terms include interest model/rate configuration; full fee/tax/APR/jurisdiction calculations and disclosures absent. |
| 13 | Loan duration configuration | IN PROGRESS | Product terms include duration/frequency configuration; grace/maturity/calculation coverage remains. |
| 14 | Country and currency eligibility | IN PROGRESS | Starter describes disabled-by-default corridors and publication checks; MySQL/API enforcement awaits live integration tests. |
| 15 | Product version history | IN PROGRESS | Starter describes versioned terms and publication constraints; immutability/accepted-offer snapshot tests are not yet established. |
| 16 | Product comparison | NOT STARTED | No comparison/customer UI or total-cost comparison calculation. |

## C. Application and workflow engine

| # | Feature | State | Current evidence / gap |
|---|---|---|---|
| 17 | Digital loan applications | NOT STARTED | No application domain identified. |
| 18 | Dynamic application forms | NOT STARTED | No versioned form builder. |
| 19 | Application tracking | IN PROGRESS | Customer portal includes a synthetic sample journey and staged timeline with direct navigation. No authoritative application domain, workflow API, event history or authenticated customer tracking exists. |
| 20 | Configurable workflow stages | NOT STARTED | Product approval workflow is not a general application workflow builder. |
| 21 | Customer-specific workflows | NOT STARTED | No per-customer workflow instance. |
| 22 | Document collection and resubmission | NOT STARTED | No secure document lifecycle. |
| 23 | Application verification and review | NOT STARTED | No application review/verification workspace. |
| 24 | Application decisions and appeals | NOT STARTED | Product approval decisions do not implement customer application decisions/appeals. |

## D. KYC, credit and risk

| # | Feature | State | Current evidence / gap |
|---|---|---|---|
| 25 | KYC integration | NOT STARTED | No identity provider adapters/cases. |
| 26 | Document authenticity checks | NOT STARTED | No document verification capability. |
| 27 | Credit scoring | NOT STARTED | No credit data/model service. |
| 28 | Automated risk assessment | NOT STARTED | Product risk-review metadata is not customer assessment. |
| 29 | Fraud detection | NOT STARTED | No fraud signals/cases/investigation. |
| 30 | Manual underwriting | NOT STARTED | No underwriting workspace. |
| 31 | Maker-checker approval | IN PROGRESS | Starter has maker-checker workflow for product publication and a static invariant check; full financial/underwriting sensitive-action separation and DB integration verification remain. |
| 32 | Customer risk profiles | NOT STARTED | No controlled customer risk profile. |

## E. Contracts and loan servicing

| # | Feature | State | Current evidence / gap |
|---|---|---|---|
| 33 | Digital loan offers | NOT STARTED | No offer lifecycle. |
| 34 | Electronic contracts and signatures | NOT STARTED | No contract/signature provider or execution records. |
| 35 | Contract version management | NOT STARTED | No contracts or immutable amendments. |
| 36 | Disbursement management | NOT STARTED | No disbursement or settlement workflow. |
| 37 | Repayment scheduling | NOT STARTED | No schedules. |
| 38 | Interest and fee calculations | NOT STARTED | No servicing calculations/day-count/rounding suite. |
| 39 | Overdue account management | NOT STARTED | No arrears/collections records. |
| 40 | Restructuring and hardship | NOT STARTED | No hardship or restructuring lifecycle. |

## F. Financial infrastructure

| # | Feature | State | Current evidence / gap |
|---|---|---|---|
| 41 | Double-entry financial ledger | NOT STARTED | No chart of accounts, journals, postings, reversals, or reconciliation. |
| 42 | Multi-currency wallet | NOT STARTED | No wallet/balance projections. |
| 43 | Balance state management | NOT STARTED | No pending/available/reserved/restricted transitions. |
| 44 | Statements and transaction history | NOT STARTED | No customer financial history. |
| 45 | Withdrawals | NOT STARTED | No withdrawal/payout workflow. |
| 46 | Bank directory and account verification | NOT STARTED | Country/currency reference seed is not a bank directory or account validation. |
| 47 | Payment-provider integrations | NOT STARTED | No payment provider adapter/webhook. |
| 48 | Reconciliation and financial reporting | NOT STARTED | No settlement reconciliation/financial reporting. |

## G. Administration and operations

| # | Feature | State | Current evidence / gap |
|---|---|---|---|
| 49 | Administrative command centre | IN PROGRESS | Initial operations case-review UI exists under `apps/portal/`; it uses synthetic cases and has no staff authentication, live customer records, underwriting decisions or financial actions. |
| 50 | Staff roles and permissions | IN PROGRESS | Product routes use RS256 JWT permission claims; identity, roles, lifecycle, granular staff administration and route-wide tests absent. |
| 51 | Branch and legal-entity management | NOT STARTED | No entity/branch tenancy model. |
| 52 | Administrative workflow builder | NOT STARTED | Existing product approval sequence is not a configurable workflow builder. |
| 53 | Customer administration | NOT STARTED | No customer records/admin tools. |
| 54 | Platform settings | IN PROGRESS | Product/country/currency configuration foundations exist; no general governed platform settings/feature flags. |
| 55 | Analytics and reporting | NOT STARTED | No dashboards or authoritative portfolio reports. |
| 56 | Immutable administrative audit history | IN PROGRESS | Starter describes audit-event writes for product operations and static invariants; DB-enforced append-only privileges and broad audit coverage remain unverified. |

## H. Advanced infrastructure

| # | Feature | State | Current evidence / gap |
|---|---|---|---|
| 57 | AI-assisted administration | NOT STARTED | No AI assist; future use must be bounded, auditable, and non-decisional for high-impact lending. |
| 58 | API and partner integrations | IN PROGRESS | Versioned Fastify REST `/api/v1` product routes exist in Stage 1 starter; partner API contracts, adapters, auth coverage and monitoring remain. |
| 59 | Security, privacy and disaster recovery | IN PROGRESS | Starter includes selected API hardening and RS256 checks; end-to-end privacy, encryption, retention, backup/recovery and security evidence absent. |
| 60 | Testing, deployment and monitoring | IN PROGRESS | Root TypeScript/Vitest/static and MySQL 8.4 CI are rerun for every Stage 2 identity increment. The latest revision adds migration 004 and case-sensitive identity integration checks; its exact-head CI is pending. Production monitoring, key custody, performance, rollback and restore evidence remain. |

## Evidence updates

| Date | Evidence | Outcome |
|---|---|---|
| 2026-11-19 | `npm run test:static` at repository root | PASS: 19 categories, 66 unique product types, valid references, and starter static invariants. |
| 2026-11-19 | `npm run build` at repository root | PASS after fixing strict-unknown handling in the admin auth error handler. |
| 2026-11-19 | `npm test` at repository root with Vitest 5.1.1 | PASS: 1 file, 9 tests. |
| 2026-11-19 | `npm audit` | PASS: zero reported vulnerabilities after upgrading Vitest from the vulnerable 3.x line to 5.1.1. |
| 2026-11-19 | Local `npm run db:migrate`, `npm run db:seed`, `npm run test:mysql` | NOT RUN: no local MySQL server is listening. |
| 2026-11-19 | GitHub Actions `Stage 1 CI` for `78cdea4602c68c79e375daee386a531f2db139eb` | PASS: workflow provisions MySQL 8.4 and runs build, unit/static tests, migrations, seed, and `test:mysql`. [Run 44539756823](https://github.com/stannmoye/Loan/actions/runs/44539756823). |

| 2026-11-19 | Portal UI source on `feat/customer-operations-portal-shell` (PR #1) | IMPLEMENTED PREVIEW ONLY: enriched customer-first overview, photographic adviser image, four local SVG finance-category illustrations, sample application progress, support/privacy content, responsive styling and retained operations case-review UI. Portal CI PASS on source commit 0d1d86df498b57991ba4d4d57a22ee38e95c6f9 (run 44558312757); TypeScript type-check and Vite build passed. Browser inspection remains pending; no live domain integration is claimed. |

| 2026-11-19 | Portal CI after customer design enrichment | PASS: dependencies installed, TypeScript type-check and Vite production build completed successfully for 0d1d86df498b57991ba4d4d57a22ee38e95c6f9. [Run 44558312757](https://github.com/stannmoye/Loan/actions/runs/44558312757). |
| 2026-11-19 | Stage 1 CI rerun with portal branch update | PASS: API build, unit tests, static checks, MySQL 8.4 migrations, seed and integration tests passed. [Run 44558312945](https://github.com/stannmoye/Loan/actions/runs/44558312945). |


| 2026-11-19 | Stage 2 customer identity and account foundation on PR #1 | IN PROGRESS: customer onboarding/profile/session APIs, provider-specific RS256 token validation, encrypted profile storage, versioned consent records, local session revocation and security/audit events added. External identity provider and production configuration are intentionally absent. |
| 2026-11-19 | Customer identity hardening | IN PROGRESS: required `iat`, five-second clock tolerance and 15-minute maximum token lifetime added; profile/consent APIs tested; audit metadata no longer stores provider issuer; MySQL migration 004 enforces case-sensitive issuer/subject identifiers. The exact-head migration/integration CI is still running and must pass before verification evidence is upgraded. |
