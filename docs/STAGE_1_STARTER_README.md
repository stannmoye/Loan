# Loan Platform — Stage 1 Foundation

This is the first implementation slice: relational foundation and configurable loan-product catalogue/API. It is not a production lending system and does not approve applications, disburse funds, maintain customer balances, or perform KYC yet.

## Stack
- Node.js + TypeScript
- Fastify API
- MySQL 8.4 LTS-compatible InnoDB schema
- Zod validation, Vitest tests

## Scope delivered
- 19 loan categories and all 66 product types supplied in the requirements.
- Product configuration with amount range, duration range, currency, interest model/rate, repayment frequency, country availability and risk flags.
- Versioned product terms; products begin as drafts and require maker-checker approval (submitter and approver must differ) before customer visibility.
- Approval decisions and submissions are recorded in the audit log; migration `002_product_approval_workflow.sql` adds the approval queue.
- Transactional draft creation and audit-event writes in the same transaction as each change.
- Database constraints enforce category/type matching, one published version per product, one pending approval per product, and approval/version ownership consistency.
- Seed reruns preserve administrator-controlled currency enablement; seed execution is transactional.
- Country/currency-filtered published catalogue endpoint; countries and currency corridors remain disabled until an explicit launch approval.
- Admin write endpoint protected by RS256 JWT permission claim.

## Not yet implemented
User authentication/identity provider, country/currency eligibility policy, FX, KYC, bank directory/provider connectivity, loan applications, underwriting, contracts, ledger, disbursements, withdrawals, notifications and customer/admin UI. Do not treat the seeded currencies/countries as live service coverage.

## Setup
1. Install Node.js LTS and MySQL 8.4 LTS.
2. Create a database and least-privilege application user.
3. Copy `.env.example` to `.env`, configure a real database URL, JWT issuer/audience, RS256 public key and allowed frontend origin.
4. Run `npm install`, then `npm run db:migrate` and `npm run db:seed`. The migration runner applies numbered SQL migrations in order.
5. Run `npm test`, `npm run test:static`, `npm run build`, then `npm run dev`. A live MySQL 8.4 database is required for migration/seed execution.

The API deliberately binds to `127.0.0.1` by default. Configure a trusted reverse proxy before exposing it. Never commit `.env`, private keys, KYC evidence or customer data.

## Product administration API (Stage 1)
- `POST /api/v1/admin/loan-products` — create a draft; requires `loan_products:write`.
- `GET /api/v1/admin/loan-product-approvals?limit=50` — list pending approval requests; requires `loan_products:approve`.
- `POST /api/v1/admin/loan-products/:productId/submit` — submit a draft for review; requires `loan_products:submit`.
- `POST /api/v1/admin/loan-products/:productId/decision` — body `{ "decision": "approve" | "reject", "note"?: "..." }` (a rejection requires a reason of at least five characters); requires `loan_products:approve`.
- `GET /api/v1/loan-products?country=US&currency=USD` — list only active products with published terms in an enabled country/currency corridor.

Approval rechecks current country/currency eligibility. A submitter cannot approve their own request. These controls are necessary governance foundations, not a substitute for jurisdiction-specific licensing, APR/fee disclosure, affordability, underwriting or compliance review. In production, use a dedicated migration role and a least-privilege runtime DB role; grant the runtime role only `SELECT` and `INSERT` on `audit_events` so the application cannot rewrite audit history.


## Stage 1 verification

Run the static catalogue and schema-invariant checks with `npm run test:static`. After installing dependencies and configuring the required environment variables, run `npm run build` and `npm test`. For a disposable MySQL 8.4 database, apply `npm run db:migrate`, run `npm run db:seed`, then execute `npm run test:mysql`. The MySQL integration script checks seeded catalogue counts, disabled-by-default country/currency corridors, uniqueness constraints for published product versions and pending approvals, and transaction rollback. It inserts one clearly named `IT_PRODUCT_001` fixture; use a fresh test database rather than a production database.

The GitHub Actions workflow provisions MySQL 8.4 and runs the migration, seed, and integration checks after the TypeScript, unit, and static checks. A successful local static run does not imply that remote CI or a live database has passed.
