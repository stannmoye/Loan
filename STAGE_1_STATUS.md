# Stage 1 — Foundation status

**Date:** 2026-11-18
**State:** In progress; local scaffold only; not committed to GitHub.

## Implemented
- Fastify/TypeScript API starter with Helmet security headers, explicit CORS origin, rate limiting, a bounded request body and loopback-only default binding.
- MySQL/InnoDB schema for currencies, countries, country-currency corridors, 19 loan categories, all 66 requested product types, loan products, versioned product terms, country eligibility and audit events.
- Seed examples for USD, EUR, JPY, GBP, CNY, CHF and NGN. Country and country-currency availability remains disabled by default.
- Draft product configuration and transactional creation with amount/duration ranges, rate model, rate basis points, repayment frequency, country scope and risk-review flag.
- RS256 JWT permission checks for product creation, submission and approval actions.
- Maker-checker submission, approval queue and approve/reject endpoints. The submitter cannot approve their own request; a rejection requires a reason.
- Publication-time checks for current country/currency eligibility, plus row-count checks on all protected status transitions.
- Database constraints for product-type/category matching, a single published version per product, one pending approval per product, valid approval decision metadata and approval/version ownership consistency.
- Catalogue retrieval filters on active product state, published version, enabled country/currency corridor and version effective dates.
- Transactional seed runner that does not overwrite administrator-controlled currency enablement on reruns.
- Migration runner uses a MySQL advisory lock so multiple app instances cannot race to apply the same migration.
- CI workflow provisions MySQL 8.4 and runs TypeScript build, Vitest, static checks, migrations, seed data and a dedicated database integration script; live CI has not yet run.

## Checks completed in this environment
- `npm run test:static`: passed — 19 categories, 66 unique product types, all category references valid, plus Stage 1 source/schema invariants.
- TypeScript transpilation: passed syntax-only transpilation for all 10 TypeScript files.
- ZIP integrity: passed for the Stage 1 and combined packages.
- Latest follow-up: migration runner advisory-lock change passed both static invariant scripts; TypeScript syntax-only transpilation passed for all 9 source files. The MySQL integration script was added and passed Node.js syntax validation; its assertions have not run against a live MySQL instance.

## Checks blocked / not performed
- `npm install` could not download packages because DNS resolution for `registry.npmjs.org` failed with `EAI_AGAIN`.
- `tsc --noEmit` was attempted but dependencies and Node type declarations are absent; the output therefore does not establish whether application types are correct.
- Vitest has not run because dependencies are unavailable.
- No MySQL 8.4 server is available in this environment. Migrations, seed execution, generated-key uniqueness, foreign keys, rollback behaviour and API/DB integration are not yet verified against a live database. The new integration script is wired into GitHub Actions but awaits its first CI execution.
- GitHub reports repository push permission, but no commit or branch has been created.

## Security and product boundaries
- No loan product is automatically activated; country and currency corridors begin disabled.
- Seeded country/currency rows are reference examples, not evidence of supported payment rails or permission to lend in those jurisdictions.
- Regulated or high-cost loan types remain catalogue metadata until jurisdictional licensing, product legality, affordability, disclosures and responsible-lending requirements are reviewed.
- Money uses decimal strings and SQL `DECIMAL`; do not use floating-point arithmetic for monetary amounts.
- Customer pending/available balances, lending decisions, KYC, banking, disbursements and withdrawals are not implemented. Any future spendable balance must be backed by reconciled ledger entries, not an admin action.
- The JWT issuer is external to this slice and must mint RS256 tokens with trusted issuer, audience, subject and permission claims.

## Next Stage 1 gates
1. Restore package-registry access; install dependencies, generate a lockfile, and pass a full TypeScript check and Vitest suite.
2. Run migrations and seeds on an isolated MySQL 8.4 database; execute the new integration test, then extend it to cover API-level country/currency filtering, category/type mismatch rejection and audit event writes.
3. Enforce published-term immutability with appropriate DB privileges or audited version-transition controls; use separate migration and runtime database roles.
4. Run CI and dependency/security checks successfully.
5. Decide the initial lender/marketplace operating model and launch jurisdiction before enabling any country or product.

**Stage 1 is not complete and is not production-ready.** Customer/admin portals and customer money features remain subsequent stages.


## Follow-up — 2026-11-19 repository adoption and verification

The archived Stage 1 source has been adopted at the repository root; the source ZIP and starter README are retained. Current verification at repository root:

- `npm run test:static` — PASS.
- `npm run build` — PASS after correcting strict-unknown error handling in `src/plugins/admin-auth.ts`.
- `npm test` — PASS: 9 tests using Vitest 5.1.1.
- `npm audit` — PASS: zero reported vulnerabilities after upgrading Vitest from 3.x.
- MySQL server — not running locally; migrations, seeds and MySQL integration assertions remain unexecuted.
- GitHub Actions — status not yet checked.

These results do not close Stage 1. Configure and positively identify a disposable MySQL 8.4 database before running migrations, seed, or integration tests. Check CI for the exact pushed commit. Stage 1 is not production-ready, and no customer lending or real payment capability is established.
