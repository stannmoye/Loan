# AI Contributor Briefing — Presentation Script

**Audience:** AI coding agents joining the Global Digital Lending Platform repository
**Format:** Spoken narration with section timing cues; not a slide deck
**Estimated delivery:** 10–12 minutes
**Companion references:** [`AGENTS.md`](../AGENTS.md), [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md), [`FEATURE_STATUS.md`](FEATURE_STATUS.md), [`progress.md`](../progress.md)

---

## Opening — 45 seconds

“Welcome to the Global Digital Lending Platform project. This is an implementation effort, not a design exercise. The goal is a connected application with a customer portal, an administrative command centre, backend services, persistent data, financial controls, provider adapters, tests, and operational documentation.

Our scope is broad: sixty core features, delivered through twelve gated stages. That scope is not a claim that all sixty features exist today. The feature register is the evidence ledger. Read it before choosing work, and update it only when code and tests justify a status change.

Your first action on every task is to read `AGENTS.md`, this implementation plan, the feature register, the progress log, and the relevant existing source or migration. Preserve the working implementation. Do not replace the stack or create a mock interface and call it a platform.”

## Where the project stands — 60 seconds

“The repository is `stannmoye/Loan`. Its original Stage 1 archive has been retained, and its source has been adopted at the repository root. The starter uses Node.js 22, TypeScript, Fastify, MySQL 8.4 with InnoDB, Zod, and Vitest. It provides the beginning of a loan-product catalogue and product approval workflow: nineteen categories, sixty-six product types, versioned terms, default-deny country and currency corridors, and maker-checker product publication.

It does not yet provide customer or staff identity journeys, portals, applications, KYC, underwriting, contracts, loan servicing, a ledger, wallets, payment operations, withdrawals, support, or production provider integrations. Do not infer those features from a roadmap, seed, route placeholder, or README description.

The current foundation passes the TypeScript build, nine Vitest tests, static catalogue and invariant checks, and dependency audit. GitHub Actions `Stage 1 CI` also passed for commit `78cdea4602c68c79e375daee386a531f2db139eb`, including isolated MySQL 8.4 migration, seed, and integration steps. The local environment has no running MySQL server, so local database execution remains unavailable; the passing CI run is separate evidence and must be tied to that exact commit.”

## The architecture in one picture — 90 seconds

“Think of the platform as a modular monolith with explicit domain boundaries. The customer portal and the staff command centre are separate experiences, but both call the same versioned API under `/api/v1/`. The API applies authentication, authorization, validation, and domain rules before it persists changes to MySQL. MySQL and InnoDB are the system of record—not a browser cache or a dashboard number.

Inside the backend, keep boundaries clear: identity and access; customers and consent; country, currency, and legal policy; catalogue; applications and forms; workflows; documents; verification and risk; underwriting; offers and contracts; loan servicing; payments; ledger and wallets; banking; notifications and support; administration, audit, and reporting.

External providers sit behind narrow adapters. A KYC vendor, signature service, email sender, bank-validation service, or payment rail must not leak provider-specific behavior into every route. The adapter owns authentication, request and response mapping, timeouts, retries, webhook verification, idempotency, and error translation. Use sandbox behavior during development and label it plainly. A fake adapter is useful for tests; it is never evidence of a real integration.”

## Visual identity and interaction design — 75 seconds

“The product owner has selected a premium financial-institution direction, using a transaction-portal screenshot as inspiration. That means a clean white and cool-neutral canvas, compact task-oriented navigation, clear case context, precise transaction facts, timeline and evidence panels, labeled status indicators, and a distinct action area. We are not copying another product's brand or screen; we are carrying forward its operational clarity.

Use the shared palette from `DESIGN_DIRECTION.md`: institutional navy and restrained blue, with green, amber and red reserved for explicit success, pending and failure states. Use tabular numerals and aligned amounts with clear currency codes. Adopt one coherent accessible banking-icon family—wallet, card, transfer, repayment, institution, security, verified document, statement and reconciliation—and pair icons with text wherever meaning is not obvious.

Use quality financial imagery purposefully in customer onboarding and product discovery; keep operational admin workspaces data-first. Do not fill an admin queue with decorative stock photos, use cash clichés, invent charts or account values, or let images distract from disclosures. Build shared tokens and components first, then validate one representative customer screen and one admin case-detail screen at mobile and desktop widths. Accessibility, responsive behavior, correct data, and permitted actions are part of the design—not polish to add later.”

## Data integrity and safety — 90 seconds

“This is financial software, so correctness rules shape the design from day one. Never calculate money with binary floating point. Use integer minor units or exact decimal arithmetic with explicit currency precision and rounding rules. Specify the interest model, day-count convention, compounding, and contract terms used in each calculation.

When the ledger is introduced, each journal must balance within its currency context, carry an idempotency key, and become immutable once posted. Correct mistakes with compensating entries; do not rewrite history. A customer’s available balance is a projection of valid ledger activity, not an administrator-editable field. Pending, reserved, restricted, and available funds are different states.

Accepted product terms and signed contracts are snapshots. Later catalogue edits must not change the agreement already accepted by a customer. Amendments create new versions and preserve the original.

Security is enforced server-side. Hiding a button is not authorization. Use least privilege, separate customer and staff roles, record sensitive changes, and require maker-checker separation where policy demands it. Test fixtures must be synthetic and sandbox-only. Never put production secrets, identity evidence, or customer data in Git.”

## The twelve-stage path — 2 minutes

“The delivery sequence is a set of acceptance gates, not a checklist to skip through.

Stage one verifies and adopts the existing project. Inventory source, instructions, migrations, seeds, APIs, tests, CI, and dependencies. Establish what really passes and what remains unknown.

Stage two builds secure identity, sessions, MFA, permissions, consent, and audit foundations. Stage three completes product configuration and legal-country controls. Stage four builds the customer experience; stage five builds the protected staff command centre.

Stage six adds applications, document handling, and a versioned workflow engine. Stage seven adds identity and risk adapters, credit assessment, fraud cases, and human underwriting. Stage eight creates versioned offers and contracts, signatures, repayment schedules, and servicing calculations.

Stage nine is the financial engine: ledger, wallets, payment state machines, disbursements, repayments, withdrawals, and reconciliation. Stage ten connects operational integrations and advanced analytics or AI assistance. Stage eleven proves security, privacy, recovery, performance, accessibility, monitoring, deployment, and rollback. Stage twelve completes the end-to-end sandbox journey and final handover.

Each stage has explicit evidence in `IMPLEMENTATION_PLAN.md`. Do not mark a gate complete because its screens load. The data transitions and acceptance tests must work.”

## How to contribute safely — 75 seconds

“Choose one bounded change that advances the earliest open acceptance gate. Before editing, inspect current code and tests; do not assume the starter’s architecture from memory. Define the behavior and its test first. Make the smallest compatible implementation, add or update migrations when persistence changes, and keep authorization and audit requirements in scope.

Run the narrow tests while developing, then the relevant root checks. For database work, positively identify a disposable MySQL 8.4 target before applying migrations. Never run test fixtures against shared or production data. If a dependency, provider, jurisdiction, or environment is unavailable, isolate the boundary and document the blocker instead of pretending it succeeded.

For every increment, update `progress.md` and the affected rows in `FEATURE_STATUS.md`. Report the exact commands run, results, and anything blocked, skipped, or not run. A local test pass is not a CI pass; a CI pass for one commit does not prove a later commit; a sandbox provider response is not production service availability.”

## Jurisdiction and launch controls — 45 seconds

“Global reference data is not global permission to lend. Country rows, currency codes, and bank names do not prove licensing, payment coverage, or customer eligibility. Keep product corridors disabled until the responsible operators have documented legal, disclosure, affordability, collections, privacy, and payment requirements for the relevant jurisdiction. Customer country selection must be correctable; IP location is only an estimate, not proof of residence or identity.

If provider credentials or launch decisions are missing, build the safe interface and document the dependency. Do not activate a regulated product by default.”

## Closing — 30 seconds

“The project’s north star is a real, reproducible, auditable system—not the appearance of completeness. Make it feel worthy of a trusted financial institution, but let visual polish serve clarity, accessibility, and honest financial information. Preserve what works. Build in stages. Keep financial and security invariants explicit. Test the persisted behavior. Tell the truth about the evidence.

Start by reading `AGENTS.md`, `IMPLEMENTATION_PLAN.md`, `FEATURE_STATUS.md`, and `DESIGN_DIRECTION.md`. Then select the earliest open acceptance gate, make a small verified contribution, and update the record so the next AI contributor can continue without guessing.”

---

## Presenter quick notes

- Keep the emphasis on the distinction between roadmap and delivered functionality.
- When describing status, tie the CI statement specifically to commit `78cdea4602c68c79e375daee386a531f2db139eb`; check Actions again before reusing this script after newer pushes.
- If the presentation is shortened, retain the sections on actual project status, modular-monolith architecture, financial integrity, and evidence-based stage gates.
- This script is explanatory only. The repository instructions and implementation plan remain authoritative if wording here is condensed or becomes stale.
