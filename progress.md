# Project Progress

## 2026-11-20 — Customer application tracking integration increment (CI pending)

### Implemented on `feat/customer-operations-portal-shell`

- Extended the typed customer API client with authenticated application list/detail/submit/withdraw operations. Each request obtains a fresh provider token through the existing injected callback; identifiers are URL-encoded, cookies are omitted, caching is disabled, and redirects are rejected.
- Added typed application status, product-term snapshot and timeline contracts matching the customer application API response.
- Replaced the illustrative application journey with a live-record view when a trusted application API adapter is injected: loading, error/retry, empty, list/detail, immutable product-term context, recorded status timeline and eligible withdrawal states.
- Kept the existing sample journey strictly as a preview fallback when no authenticated application adapter is supplied. No fabricated record is represented as a real customer account.
- Exposed an optional application API adapter at the portal composition root. The app still does not instantiate one because no external identity provider/token callback has been selected or configured.
- Added API-client and component tests for customer-authenticated requests, application history, empty states and withdrawal refresh behavior.
- Added responsive styles for application records, status labels, timeline, empty/loading/error/success states.

### Security and product boundaries

- The application UI is not live in the default preview: no identity provider, customer token callback, API origin, JWT verification key or encryption key has been configured.
- Application creation remains outside this UI increment because the backend requires an approved declaration version and a server-owned product/country/currency corridor. No application is submitted by this interface increment.
- Withdrawal is shown only for backend-eligible statuses (draft, submitted and awaiting documents); the backend remains authoritative and may reject a stale transition.
- This does not implement KYC, underwriting, loan offers, contracts, disbursement, servicing, balances, payments or ledger operations.

### Verification

- Verification is pending for the new branch head. Do not treat earlier successful Portal CI / Stage 1 CI runs as validation of this increment.
- Next: run Portal CI and Stage 1 CI against the exact updated head, resolve all failures, then re-run. Keep PR #1 draft and unmerged until review and branch reconciliation are complete.

---

## 2026-11-20 — Customer loan application API foundation (verification pending)

### Implemented on `feat/customer-operations-portal-shell`

- Added migration `005_customer_loan_applications.sql` for customer-owned loan applications and append-only application timeline events. The application references the exact product-version row and stores a JSON snapshot of the published terms used at creation.
- Added strict Zod request validation: positive decimal amount with at most four fractional digits, supported currency-code shape, bounded duration, explicit affirmative declaration, and rejection of extra client-controlled fields such as `customerId` and `status`.
- Added authenticated customer endpoints to create a draft, list own applications, retrieve one own application with timeline, submit a draft, and withdraw only eligible pre-review applications.
- Server derives customer scope from the verified customer token and persisted session context. Reads and state changes filter by that customer ID; the client cannot select another customer.
- Product creation guard checks active product, published/effective product version, currency, active product-country corridor, enabled country/currency corridor, the encrypted profile's declared residence country, and published amount/duration bounds.
- Application creation and state transitions write application timeline and general audit records in the same transaction as the data change.
- Added mutation rate limits and a server-configured declaration-version gate. Creation remains disabled until the approved declaration version is configured.
- Made application service dependencies injectable into route tests; added route tests for authenticated-context use, invalid client identity/status overrides, stale declaration rejection and invalid application IDs.

### Verification state and limitations

- The earlier Stage 1 CI run `44602917837` failed at TypeScript compilation on an intermediate revision, with an invalid character in `src/routes/customer-accounts.ts`. The route source was subsequently normalized and corrected.
- Portal CI passed on the earlier revision, but it does not verify the new backend migration or application APIs.
- No successful CI run for the current head is evidenced yet. The GitHub Actions runs visible during this update still correspond to earlier commits; do not treat them as current-head verification.
- The new MySQL migration and service queries have not yet passed a current-head MySQL 8.4 integration run. Product-version locking, foreign keys, SQL compatibility, and transactional audit behavior remain unverified at runtime.
- The customer portal still displays sample application content and is not connected to these endpoints.
- This increment does not approve loans, make underwriting decisions, create contracts, disburse funds, create balances, or process repayments.

### Next acceptance gates

1. Run current-head backend TypeScript build and route/domain tests.
2. Run all migrations and seed against disposable MySQL 8.4, then add integration coverage for draft creation, submit/withdraw transitions, customer isolation, product limits, country/currency corridor checks, immutable product snapshots and audit rollback.
3. Correct every failure and repeat the full checks against the exact final head.
4. Only after those gates pass, add the typed portal application API integration with explicit loading, error, empty and disabled states; keep fixture mode clearly separate.
5. Keep PR #1 draft and unmerged pending review.


## 2026-11-19 — Plan publication and Stage 1 adoption

### Completed and published

- Identified `stannmoye/Loan` as the correct repository because it contains `loan-platform-stage1-mysql-ci.zip`; checked `stannmoye/Fintech` and found only a placeholder README there.
- Published the complete implementation plan, AI contributor rules, evidence-based 60-feature status register, project overview, and progress baseline first in commit `112d134` (`docs: publish lending platform implementation plan`).
- Preserved the original Stage 1 ZIP and copied its source into the repository root. Retained the starter README at `docs/STAGE_1_STARTER_README.md` and the starter status report as `STAGE_1_STATUS.md`.
- Installed project dependencies and generated `package-lock.json` for reproducible installation.
- Fixed a strict TypeScript error in `src/plugins/admin-auth.ts`: the handler now safely handles unknown thrown values rather than accessing `.message` on `unknown`.
- Upgraded the direct Vitest dependency to 5.1.1 after `npm audit` found one moderate and two critical transitive test-runner vulnerabilities in the original Vitest 3.x dependency tree.

### Checks executed

| Command | Result |
|---|---|
| `npm run test:static` | PASS — 19 categories, 66 unique types, and Stage 1 static invariants |
| `npm run build` | PASS — TypeScript production build |
| `npm test` | PASS — 1 file, 9 tests |
| `npm audit` | PASS — 0 vulnerabilities after the Vitest upgrade |
| MySQL ping | BLOCKED — no local MySQL server listening |
| Migrations, seed, MySQL integration test | NOT RUN — requires a disposable isolated MySQL 8.4 database |
| GitHub Actions | NOT CHECKED |

The original static-only test run passed before dependencies were installed. The full TypeScript build initially failed on `error.message` being accessed on an `unknown` value; that source defect was corrected and the build then passed.

### Still outstanding

- The current Stage 1 adoption and source changes are not yet committed/pushed as of this entry.
- No isolated MySQL 8.4 instance has been configured; database migrations, seeds, integration behavior and constraints are unverified.
- Remote CI status has not been checked.
- This is still a Stage 1 foundation, not the complete lending platform. There is no customer/admin portal, customer authentication, application workflow, KYC, underwriting, contract servicing, ledger, wallet, payments, withdrawals, or production provider integration.
- No jurisdictional legal approvals, production provider configuration, production deployment, or production financial service is evidenced.

### Next actions

1. Commit and push the adopted Stage 1 project, lockfile, source fix, and updated status documentation.
2. Obtain/configure a disposable MySQL 8.4 test database; run migrations, seed and MySQL integration tests after verifying the target.
3. Check GitHub Actions for the exact commit and resolve any failures.
4. Review the existing schema/auth/audit constraints, then begin Stage 2 only with its acceptance criteria and evidence.


## 2026-11-19 — CI confirmation and contributor/design guidance

GitHub Actions `Stage 1 CI` completed successfully for commit `78cdea4602c68c79e375daee386a531f2db139eb` (run [44539756823](https://github.com/stannmoye/Loan/actions/runs/44539756823)). Its workflow provisioned MySQL 8.4 and passed build, unit/static checks, migrations, seed, and `test:mysql`. This supersedes the earlier entry's pending/unchecked CI note; local MySQL still is not running in this sandbox.

Prepared `docs/AI_CONTRIBUTOR_PRESENTATION_SCRIPT.md` as an 8–10 minute spoken onboarding for other AI contributors, covering the plan, modular-monolith/API architecture, financial integrity, 12 acceptance-gated stages, and actual status evidence. Added `docs/DESIGN_DIRECTION.md` from the product owner's screenshot reference: premium financial-institution surfaces, restrained navy/blue/status palette, purposeful licensed imagery, coherent semantic banking icons, data-first admin case views, customer reassurance, accessibility and mobile behavior. The implementation plan, contributor instructions, README, feature register and Stage 1 report now point to or reflect these choices and the exact CI evidence.

These are documented design constraints, not implemented frontend screens or generated image assets. No customer/admin web UI exists yet. The UI work will follow the design system and be introduced at the planned portal stages.


## 2026-11-19 — First actual UI design stage opened

### Preparation published before application source

- Published the stage-specific implementation plan and full outcomes checklist in commit `eae1abf` before UI implementation; the repository worktree was clean after that push.
- Initialized the managed WebDev project `loanportal` for actual responsive React/TypeScript interface work and live preview. It has no managed server or database. The WebDev workspace is not the user's existing GitHub repository; `stannmoye/Loan` remains the authoritative source and progress destination.
- Registered the Sandbox-managed TypeScript diagnostics for the WebDev workspace before application source edits (`registered: true`, language `typescript`).
- Generated one original editorial finance-consultation image for the planned customer product-discovery panel. It contains no text, bank/provider marks, fabricated account evidence, cash, or approval promise. The 2368×1776 generated PNG was normalized to a 1600×1200, 193 KiB progressive JPEG at `apps/portal/public/images/customer-adviser.jpg`; the same image was uploaded into WebDev storage at `/manus-storage/customer-adviser_3f68ba2e.jpg`.
- Updated `plan.md` to record the actual preview/source relationship and existing repository sync requirement.

### Checks and blockers at this point

- Existing origin remains `https://github.com/stannmoye/Loan.git`; branch `main` was clean at the start of this stage.
- Sandbox versions are Node.js `v22.23.4`, npm `10.9.9`, and pnpm `11.25.0`. Registry metadata lookup for Vite succeeded.
- **No React application source, UI routes, backend route, or dev server has been created or started yet.** No new frontend build/tests or existing API tests have run for this UI stage.
- The first UI is confined to synthetic view data and presentation. The customer identity, applications, case management, ledger, balances, payments, approvals and provider integrations remain absent until separately implemented and evidenced.

### Next

Implement the customer overview and operations queue/case-detail interface in the managed preview workspace, synchronize identical source and evidence to `stannmoye/Loan`, run relevant quality checks, and record observed desktop/mobile preview results before the UI milestone commit.


## 2026-11-19 — First customer and operations portal source committed to GitHub feature branch

### Implemented in `feat/customer-operations-portal-shell`

- Added a separately buildable React 19 / TypeScript / Vite frontend under `apps/portal/`, preserving the existing root Fastify package and scripts.
- Added the route manifest before any dev-server start.
- Added a shared Northline provisional product identity, responsive application shell, institutional navy/blue design direction, semantic Lucide icon usage, keyboard focus styles and reduced-motion support.
- Added a customer overview with a clearly disclosed synthetic application journey, next-step information, sample activity and product discovery entry point.
- Added an operations case-review workspace with synthetic case fixtures, selectable case details, local text search, status filtering, timeline and evidence checklist.
- Added responsive layouts for mobile, tablet and desktop widths in CSS. No live balance, customer record, credit decision, approval, KYC result or payment is fabricated.
- Added a portal README with setup and scope boundaries.

### Files added

`apps/portal/package.json`, `index.html`, `tsconfig.json`, `vite.config.ts`, `public/manus-routes.json`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `src/data/fixtures.ts`, and `README.md`.

### Verification status

- GitHub create-file operations succeeded on the feature branch.
- Frontend dependency installation, TypeScript build, Vite build, browser preview and responsive visual inspection have **not yet been run**.
- No backend routes, customer identity, live application data, KYC, underwriting, contracts, ledger, balances, payments or bank integrations were added.
- Existing API build/tests are not claimed to have been rerun in this increment.
- The UI TODO checklist remains open until build, diagnostics and responsive inspection evidence are available.

### Next

Add a frontend CI workflow, run its build/type-check gate, fix any compiler or bundler failures, then continue with the next connected backend/customer identity stage. Keep all sample fixtures isolated until real authenticated API contracts exist.


## 2026-11-19 — Customer portal visual design enrichment

### Implemented on \`feat/customer-operations-portal-shell\`

- Reworked the customer overview into a richer, customer-first financial workspace with a photographic welcome area, clearer hierarchy, application-progress visualization, next-step guidance, privacy/security messaging, activity and support sections.
- Added a four-category illustrated discovery area for personal, education, home/property and business finance. The category artwork is bespoke local SVG; the existing customer-adviser JPEG is reused from the repository.
- Expanded customer navigation with applications, loans, documents, help and security/profile entry points. Unimplemented destinations remain informative notices rather than pretending to be connected features.
- Standardized the visual treatment around the approved institutional design direction: navy and blue, restrained heritage-gold accents, white and cool-neutral surfaces, Lucide financial iconography, accessible labels, visible focus, responsive layouts and reduced-motion handling.
- Retained and restyled the operations case-review preview rather than removing it.
- Kept the sample-data disclosure visible. No real balance, account, product offer, rate, loan decision, uploaded document or financial transaction is represented.

### Files changed

- Reworked \`apps/portal/src/App.tsx\` and \`apps/portal/src/styles.css\`.
- Added \`apps/portal/public/images/personal-finance.svg\`, \`education-finance.svg\`, \`home-finance.svg\` and \`business-finance.svg\`.
- Reused \`apps/portal/public/images/customer-adviser.jpg\`.
- Updated portal instructions, the root README and the evidence/status register.

### Verification

- The latest visual-enrichment Portal CI passed (run 44558312757). Stage 1 CI also passed again (run 44558312945), including backend build, unit/static checks, MySQL migrations, seed and integration tests.
- Portal CI completed successfully for frontend source commit 0d1d86df498b57991ba4d4d57a22ee38e95c6f9 (run 44558312757): dependency installation, TypeScript type-check and Vite production build all passed.
- No browser-based visual inspection or device screenshot test has been performed in this increment. The responsive rules are implemented, but rendering must still be reviewed in an actual browser.
- No backend integration or production-lending feature is claimed.

### Next

Perform browser-based visual QA at mobile, tablet and desktop widths, including keyboard navigation, image loading/cropping, narrow-screen overflow and readable content density. Keep the customer dashboard feature in progress until that inspection and later authenticated API integration are evidenced.


## 2026-11-19 — Customer portal expansion: dedicated customer journeys and finance explorer

### Implemented on `feat/customer-operations-portal-shell`

- Replaced the original single-screen customer preview with six distinct customer areas: overview, finance explorer, application journey, document guidance, help centre, and security/profile guidance.
- Implemented customer-section navigation with stable URLs, browser back/forward handling and a responsive mobile navigation drawer.
- Expanded the finance explorer to the complete planned taxonomy: 19 categories and 66 product types. Product types are included in search; category filters, product-type counts and comparison guides are available locally.
- Added category detail guides describing product structures and due-diligence questions. Jurisdiction-specific product names are labelled as programme-dependent; no rates, prices, offers, eligibility or credit decisions are fabricated.
- Built an application journey page with clearly synthetic milestones; document guidance with uploads disabled; FAQ and impersonation-safety guidance; and a security/profile page that marks all controls as planned/not connected.
- Added additional original SVG finance illustrations for medical and vehicle categories, with the existing photographic customer-adviser asset and illustrated assets retained.
- Added Vitest + Testing Library interaction tests and explicit DOM cleanup. Root Stage 1 Vitest now excludes `apps/portal/**` so each workspace owns its dependencies and test suite.
- Added Playwright Chromium browser coverage for desktop/mobile overview rendering, adviser-image loading, responsive overflow, direct navigation, section routing, catalogue details, and disabled document upload. CI uploads browser QA result/report artifacts.

### Verification evidence and remaining gates

- A pre-taxonomy portal revision passed `tsc --noEmit`, Vite production build and all 7 component interaction tests in Portal CI run [44561236303](https://github.com/stannmoye/Loan/actions/runs/44561236303).
- The same pre-taxonomy revision passed Stage 1 CI run [44561246459](https://github.com/stannmoye/Loan/actions/runs/44561246459) after test-suite isolation.
- The latest taxonomy and Playwright additions are undergoing fresh GitHub Actions verification; do not treat earlier passing runs as verification of those later commits.
- Browser tests are intended to replace the prior manual-only screenshot QA gap. A successful latest Playwright run and its uploaded artifacts are required before marking the visual browser QA evidence as passed.
- All customer data remains fictional. There is no live authentication, account profile, application service, document upload/storage, support ticket service, finance offer, underwriting, contract, ledger, balance or payment connection.
- No feature is marked fully implemented or production available. Jurisdiction licensing, provider selection, privacy, security, ledger/reconciliation and human-review gates remain outstanding.


## 2026-11-19 — Portal cross-device browser QA and Stage 1 regression verified

### Exact branch revision

- Verified PR head: `5ff59000864f22b102538beb754e993eba8bc3e3` on `feat/customer-operations-portal-shell`.
- Draft PR: [#1 — expand customer portal and finance explorer](https://github.com/stannmoye/Loan/pull/1). It remains open and unmerged; `main` is unchanged by this feature branch.

### Portal CI — PASS

[Portal CI run 44562250414](https://github.com/stannmoye/Loan/actions/runs/44562250414) completed successfully for the exact PR head.

- Frontend dependency installation passed.
- `tsc --noEmit` and Vite production build passed.
- Component tests: 2 files, 8 tests passed.
- Playwright Chromium browser checks: 7 passed, 1 skipped. The single skip is the mobile-navigation-only case under the desktop Chromium project; the mobile Chromium version passed.
- Browser coverage verifies adviser image loading, responsive layout without horizontal overflow, finance catalogue count and category rendering, section navigation, product-type search and guide dialog, document-upload disabled state, and mobile menu behavior.
- The CI browser artifact contains desktop/mobile screenshots and the Playwright report: [customer-portal-browser-qa artifact](https://github.com/stannmoye/Loan/actions/runs/44562250414/artifacts/14550491683).
- Screenshots were separately inspected at desktop 1440×1050 and mobile 412×915. Both layouts were visually reviewed; the adviser image rendered, content reflowed to mobile, and the automated overflow assertion passed.

### Stage 1 regression CI — PASS

[Stage 1 CI run 44562250541](https://github.com/stannmoye/Loan/actions/runs/44562250541) completed successfully for the same branch head. It passed the backend build, root unit tests, static checks, MySQL 8.4 migration, seed and MySQL integration tests. Root tests exclude the portal workspace so Stage 1 and portal test dependencies remain isolated.

### Delivery boundary

The customer portal is a tested presentation layer using fictional fixtures, not a live lending service. No customer authentication, profile service, live application API, credit/underwriting decision, offer, KYC, contract, secure document upload/storage, support tickets, ledger, account balance, disbursement, repayment, payment or withdrawal has been activated. The 19-category/66-product catalogue is an educational preview; it does not represent country availability, live products, rates or eligibility.

Feature #05 remains `IN PROGRESS`: a verified responsive UI shell is not a complete authenticated customer dashboard. Features #07 and #19 remain `IN PROGRESS` for help guidance and a sample journey only, not live support or application workflow services. No feature is marked production available.


## 2026-11-19 — Customer My loans account centre

### Implemented on `feat/customer-operations-portal-shell`

- Added the seventh customer-facing view, **My loans**, with a dedicated route at `/customer/loans`, sidebar active state, direct route resolution and browser history navigation.
- Built a premium account-centre layout with a secure account-information hero, intentional empty-account state, and structured cards for account overview, repayment schedule, statements/receipts, and support.
- The empty state clearly says no loan accounts are connected. Repayment, statement and account details remain marked not connected; no principal, outstanding balance, due date, payment history or loan status is fabricated.
- Connected the page's safe next steps to the finance learning catalogue, sample application journey and help centre.
- Added a component test for the empty account state and its route action, plus a Playwright journey assertion for My loans.

### Latest verification — PASS

The current portal source head `1b7f6340ce67e7ea721754240ec94676e0020a69` passed [Portal CI run 44563163473](https://github.com/stannmoye/Loan/actions/runs/44563163473): TypeScript/Vite production build, 9 component tests, and 7 Playwright desktop/mobile checks passed with one intentionally skipped desktop-project mobile-menu case. The browser suite includes My loans navigation and empty-state assertions. [Browser QA artifact](https://github.com/stannmoye/Loan/actions/runs/44563163473/artifacts/14551077157).

[Stage 1 CI run 44563163330](https://github.com/stannmoye/Loan/actions/runs/44563163330) passed on the same source revision, including backend build, root tests, static checks and MySQL migration/seed/integration tests.

This remains a tested presentation layer. The real account service, ledger-backed balances, servicing schedules, statements, payments, receipts, customer authentication and support ticket service are not implemented or connected.


## 2026-11-19 — Customer notifications centre and full-page visual QA

### Implemented

- Added the eighth customer view, **Notifications**, with a direct `/customer/notifications` route, sidebar entry and top-bar bell navigation.
- Added a sample inbox with four visibly labelled examples across Application, Documents, Security and Learning categories.
- Added category filters and contextual links into the relevant customer sections. The notices are clearly marked fictional examples; no live message delivery, unread state, sender identity or customer notification preference is represented.
- Added responsive desktop/mobile inbox artwork, type-specific icons, sample labels and privacy guidance describing the controls required for a real notification provider.
- Added component tests for filtering and routing plus a Playwright end-to-end check from the header bell into a relevant customer section.
- Expanded the Playwright artifact to include full-page screenshots for the Overview, My loans and Notifications views at desktop and mobile breakpoints.

### Latest verification — PASS

- Current branch head: `a6f9a19e33992e674fecf44bb8530884689a1c25`.
- [Portal CI 44564294820](https://github.com/stannmoye/Loan/actions/runs/44564294820): frontend production build passed; 10 component tests passed; 9 Playwright browser checks passed and one desktop-only mobile-navigation test was intentionally skipped.
- [Stage 1 CI 44564294708](https://github.com/stannmoye/Loan/actions/runs/44564294708): backend build, root tests, static checks, MySQL 8.4 migration, seed and integration tests passed.
- [Browser QA artifact](https://github.com/stannmoye/Loan/actions/runs/44564294820/artifacts/14549567947) includes overview, My loans and notifications desktop/mobile full-page screenshots and the Playwright report. Screenshots were inspected; both new screens were legible and responsive, with no horizontal overflow.

### Boundaries

The notifications inbox is sample-only, not a live message system. It has no event store, delivery worker, email/SMS/push provider, delivery receipts, customer preferences, consent checks or sender verification service. The My loans centre has no live account data, ledger balance, repayment schedule, statements or payment history. Both screens remain UI previews.


## 2026-11-19 — Stage 2 customer-account API and identity security foundation

### Implemented on `feat/customer-operations-portal-shell`

- Added the first customer-account domain: strict onboarding/profile schemas, country/locale field validation, mandatory affirmative privacy/terms acknowledgements and rejection of identity/email claims supplied by a request body.
- Added dedicated customer RS256 access-token verification separate from the administrative JWT contract. It enforces the exact configured issuer/audience, `principal_type=customer`, verified email, subject/session claims, `iat`, signed expiry and a 15-minute maximum token lifetime with five seconds of clock tolerance.
- Added customer account/session API routes: onboarding, authenticated `/me`, profile patch, session list, per-customer session revocation and local logout. Customer routes remain disabled unless a distinct customer identity configuration is supplied.
- Added customer-account persistence for external identity links, active/suspended/closed lifecycle, encrypted profile blobs, hashed provider-session identifiers, versioned consent acknowledgements and security events.
- Added AES-256-GCM profile encryption with random 96-bit nonce, authenticated customer-ID context and envelope version marker. Profile email/verification are provider-owned; profile patches cannot override them.
- Removed the provider issuer from account-created audit/security metadata; only a non-identifying boolean and encryption version are recorded.
- Added migration 004 to store issuer and subject strings under a binary collation, preserving exact case-sensitive identity matching. The MySQL integration script now proves that identity pairs differing by issuer/subject case remain distinct while exact duplicate identities remain rejected.
- Added route-level onboarding rate-limit coverage (five per minute), explicit Vitest imports for the new domain test, and stronger signed-token lifetime tests.

### Test and integration notes

- Customer test coverage includes verified email, provider/admin principal separation, issuer/audience/expiry/issued-at checks, maximum token lifetime, bearer parsing, AES-GCM tampering/AAD isolation, onboarding consent gates, profile patch allow-lists, session ownership/revocation and logout.
- Root CI on commit `d3f90c84198189fb1eb735342ca43a2453fa3275` passed after fixing the Vitest test file's missing explicit imports. Stage 1 CI on commit `bc530cebe1540e207de061deee258ed7a9a0dd30` also passed with the enforced JWT `iat` and 15-minute lifetime rules.
- Two subsequent database CI attempts exposed migration-delimiter issues: a semicolon in a migration comment was split by the existing migration runner; a pre-collation integration test correctly failed because migration 004 had not yet been applied. The migration comment is now delimiter-safe, and a new exact-head CI run is in progress for `7d3085f9d46afe9057a4a9812d59f70cc834976a`. Do not mark the database change verified until that run completes.
- Portal CI on commit `de77a645a12737ba63fe15935ff19047a9612917` passed frontend build, component tests and Playwright browser checks; the Stage 1 database migration on that same revision failed, and is being rerun against the corrected migration revision.

### Explicit boundaries and remaining gaps

- No external customer identity provider has been selected or configured. The API expects a provider-issued token but does not issue passwords, OTPs, MFA, recovery challenges or authentication tokens itself.
- Customer identity keys, profile encryption key, privacy-notice version and terms-of-service version remain unset. Customer onboarding routes therefore remain unavailable by default.
- There is no live login/registration UI, no customer token storage in the browser and no portal-to-account API connection.
- JWKS/key rotation, provider introspection/back-channel logout, MFA/recovery, provider contact-change reconciliation, device metadata, security settings UI, database privilege grants, encryption-key rotation, retention controls and data-subject rights remain future work.
- The customer-declared country is not residence proof or lending eligibility. No lending product/country corridor is enabled; KYC, underwriting, contract, ledger, disbursement and payment functionality remain unimplemented.


## 2026-11-19 — Typed customer API client added to the portal

- Added `apps/portal/src/customer/customer-api.ts` with typed onboarding, profile read/update, session list/revoke and logout methods matching the Stage 2 Fastify contracts.
- The client resolves an access token through an injected callback for every request; it does not issue or persist credentials. Requests explicitly use `credentials: "omit"`, `cache: "no-store"` and `redirect: "error"`.
- Added response-envelope validation, safe error mapping, URL validation and session ID path encoding.
- Added `customer-api.test.ts` covering token callback refresh, authorization headers, safe callback errors, no-token behavior, onboarding field payloads, encoded session IDs, and malformed API responses.
- This API client is not yet connected to portal views because there is no configured customer identity provider or production identity/consent secrets. The customer UI remains sample-only and does not collect passwords or store access tokens.
- The first portal typecheck found a narrow test-mock inference issue; the test now uses a typed request recorder rather than an untyped mock call tuple. Exact-head Portal CI [44579153905](https://github.com/stannmoye/Loan/actions/runs/44579153905) passed: frontend TypeScript/Vite production build, 19 tests across 3 files, and 9 Playwright desktop/mobile checks passed with one desktop-only mobile-menu case intentionally skipped. The browser QA artifact [14556354151](https://github.com/stannmoye/Loan/actions/runs/44579153905/artifacts/14556354151) was uploaded. Stage 1 CI [44579153914](https://github.com/stannmoye/Loan/actions/runs/44579153914) passed the root TypeScript build, 41 tests across 5 files, static checks, MySQL 8.4 migrations, seed and customer identity integration. The customer API client now rejects remote HTTP API URLs, allows only HTTPS in remote environments and permits HTTP solely for local loopback development.


## 2026-11-19 — Stage 3 customer loan application foundation (verification pending)

- Added migration 005 for customer loan applications and append-only application timeline events, with ownership/product-version/currency foreign keys, constrained states, amount/duration checks and review-queue indexes.
- Added strict customer application input validation, including positive decimal amounts at four-decimal precision, bounded product/duration identifiers, affirmative declaration acknowledgement and rejection of client-supplied customer IDs or status.
- Added authenticated customer endpoints to create drafts, list and retrieve only the signed-in customer's applications, submit drafts and withdraw only permitted pre-decision states.
- Server-side creation checks the active published product version, effective dates, exact currency, enabled country/currency corridor, the customer's encrypted declared-residence country, and configured amount/duration limits. It persists an immutable terms snapshot so later product edits do not rewrite the application terms.
- Creation, submission and withdrawal write application timeline and audit records in the same database transaction. No customer endpoint can set an approval, decline, funding or funded status.
- Added domain tests for strict payload allow-lists, declaration acceptance, amount precision, UUIDs and withdrawal eligibility.
- CI is being rerun after early compile failures exposed escaped newline characters in generated source. Do not mark this stage verified until Stage 1 CI passes the TypeScript build, unit/static checks and MySQL migration/integration checks on the exact latest feature-branch head. Portal CI should also pass to confirm no regression.
- Remaining: staff review/decision workflow with permission separation and maker-checker, secure document collection, full customer application form and live portal integration, idempotency, applicant country verification, underwriting, offer/contract, ledger/funding and repayment servicing. Declared country is customer-provided profile data, not verified residency or KYC.
