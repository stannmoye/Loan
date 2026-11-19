# Feature Status and Evidence Register

**As of:** 2026-11-19  
**Rule:** This is a delivery register, not a feature promise. Change a state only when concrete implementation and test/provider evidence support it. See [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) for definitions and stage gates.

## Summary

- Features in scope: 60
- `NOT STARTED`: 46
- `IN PROGRESS`: 14
- `IMPLEMENTED — NOT VERIFIED`: 0
- `VERIFIED IN TEST ENVIRONMENT`: 0
- `AVAILABLE IN PRODUCTION`: 0
- Production lending/provider status: no production service evidenced; all lending jurisdictions/corridors must remain disabled.

The starter archive and project have been adopted at repository root. Catalogue-related items remain `IN PROGRESS` until their individual acceptance tests pass. Static, build, unit-test and dependency-audit checks have run, but MySQL integration, CI and production readiness remain unverified.

## A. Customer accounts and experience

| # | Feature | State | Current evidence / gap |
|---|---|---|---|
| 01 | Customer registration and onboarding | NOT STARTED | No customer identity/onboarding routes identified in Stage 1 inventory. |
| 02 | Secure authentication | NOT STARTED | Starter has RS256 JWT permission-claim checking for admin product operations; no customer login, session lifecycle, MFA, or staff authentication flow. |
| 03 | Customer profile management | NOT STARTED | No profile domain/routes. |
| 04 | Country-aware onboarding | NOT STARTED | Country/currency reference catalogue is not customer country detection or residence proof. |
| 05 | Customer dashboard | NOT STARTED | No portal or authoritative customer financial projection. |
| 06 | Customer notifications | NOT STARTED | No notification records or providers. |
| 07 | Customer support | NOT STARTED | No ticket/message/attachment module. |
| 08 | Customer security settings | NOT STARTED | No device/session/customer security controls. |

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
| 19 | Application tracking | NOT STARTED | No customer application lifecycle/UI. |
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
| 49 | Administrative command centre | NOT STARTED | API has admin product endpoints; no administrative frontend/command centre. |
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
| 60 | Testing, deployment and monitoring | IN PROGRESS | Static checks pass against extracted starter. Unit/build/MySQL/CI/security/performance/monitoring/rollback evidence not yet established. |

## Evidence updates

| Date | Evidence | Outcome |
|---|---|---|
| 2026-11-19 | `npm run test:static` at repository root | PASS: 19 categories, 66 unique product types, valid references, and starter static invariants. |
| 2026-11-19 | `npm run build` at repository root | PASS after fixing strict-unknown handling in the admin auth error handler. |
| 2026-11-19 | `npm test` at repository root with Vitest 5.1.1 | PASS: 1 file, 9 tests. |
| 2026-11-19 | `npm audit` | PASS: zero reported vulnerabilities after upgrading Vitest from the vulnerable 3.x line to 5.1.1. |
| 2026-11-19 | `npm run db:migrate`, `npm run db:seed`, `npm run test:mysql` | NOT RUN: no MySQL server is listening locally; do not proceed until a disposable isolated MySQL 8.4 target is configured. |
| 2026-11-19 | Remote GitHub Actions | NOT CHECKED. |
