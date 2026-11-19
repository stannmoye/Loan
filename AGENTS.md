# AI Contributor Instructions

This repository implements a regulated, multi-jurisdiction digital lending platform. Treat `docs/IMPLEMENTATION_PLAN.md` as the authoritative delivery plan, `docs/DESIGN_DIRECTION.md` as the owner-approved visual identity and interaction guidance, `docs/FEATURE_STATUS.md` as the evidence-based feature register, and `progress.md` as the chronological implementation record. Read those files and the Stage 1 README/status report before changing code. The `docs/AI_CONTRIBUTOR_PRESENTATION_SCRIPT.md` is a spoken onboarding brief, not a substitute for the authoritative documents. The detailed master specification supplied with the project is summarized in the plan; do not assume a feature exists just because it is listed there.

## Working contract

1. Inspect the existing source, migrations, tests, CI, and all Markdown guidance before modifying behavior. Preserve compatible working functionality and retain the Node.js 22, TypeScript, Fastify, MySQL 8.4/InnoDB, Zod, and Vitest stack unless a concrete, documented technical reason requires a change.
2. Implement real, connected behavior in small, reviewable increments. Do not substitute static mockups, in-memory fake financial balances, fabricated provider success, or documentation-only delivery for working functionality.
3. Work through the 12 stages and their acceptance gates in the implementation plan. Keep code, migration, tests, documentation, and status evidence together. Do not mark a gate complete until its stated checks pass.
4. Never describe a provider integration as live unless its actual provider configuration and end-to-end evidence exist. Use isolated sandbox adapters and label them accurately. No test may initiate a real payment or create a real credit obligation.
5. Never use binary floating point for money. Use integer minor units or exact decimal arithmetic. Posted ledger entries and signed agreements are immutable; corrections use compensating entries or versioned amendments. Enforce idempotency, transaction boundaries, balanced entries, least privilege, and server-side authorization.
6. Keep lending disabled by default. Reference country/currency data is not legal approval, provider coverage, bank connectivity, or permission to lend. Require documented jurisdictional review before activation.
7. Never commit secrets, private keys, customer/identity evidence, production data, or `.env` files. Do not print credential material. Keep test fixtures synthetic and unmistakably sandbox-only.
8. Run the narrow relevant tests after each change and the available quality gates before a commit. Report passed, failed, skipped, blocked, and not-run checks separately. A local pass is not a CI pass; syntax transpilation is not type checking; an unrun database test is not verified.
9. Update `docs/FEATURE_STATUS.md` only with evidence and one of the specified states. Update `progress.md` with date, changes, tests and remaining blockers. Maintain the known-limitations list.
10. Do not claim production readiness until all final acceptance conditions in the plan are met and evidence is recorded. Do not silently skip difficult features or relax acceptance criteria.

## Before any task

- Read this file, `README.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/DESIGN_DIRECTION.md`, `docs/FEATURE_STATUS.md`, `progress.md`, `STAGE_1_STATUS.md`, and relevant files under `docs/`.
- Confirm current branch and worktree status; do not discard unrelated changes.
- Inspect current migrations and determine whether a migration is additive and safe before applying it.
- Identify the scope and acceptance test for the specific change.

## Completion note format

For each increment, record: implementation summary; changed files/migrations; tests executed and exact results; tests blocked/not run and why; feature states affected; provider/jurisdiction assumptions; and next gate. Make claims no broader than the evidence.
