# Global Digital Lending Platform

This repository contains the implementation of a global digital lending platform, developed in evidence-based stages. Its complete scope, architecture, safety boundaries, acceptance gates, test strategy and delivery order are documented in the [Implementation Plan](docs/IMPLEMENTATION_PLAN.md). AI and human contributors must first read [AGENTS.md](AGENTS.md), the [Feature Status and Evidence Register](docs/FEATURE_STATUS.md), and [progress.md](progress.md).

## Current status

The Stage 1 starter has been adopted at the repository root; its original archive remains as `loan-platform-stage1-mysql-ci.zip`. The starter is a Node.js 22+/TypeScript/Fastify API foundation, MySQL 8.4/InnoDB product catalogue and approval workflow, with static checks. It does not constitute a complete lending system. The React/TypeScript portal under `apps/portal/` on `feat/customer-operations-portal-shell` now has eight distinct customer views (overview, finance explorer, sample application journey, My loans account centre, document guidance, Notifications centre, help centre, and security/profile guidance), a searchable educational catalogue covering the planned 19 categories and 66 product types, responsive desktop/mobile navigation, original finance illustrations, component tests, and Playwright browser checks. The synthetic operations case-review workspace remains available. The portal itself still uses local sample data and is not connected to a live customer sign-in flow. Separately, the backend now contains a Stage 2 customer-account API foundation: provider-issued RS256 customer token validation, onboarding/profile/session routes, encrypted customer profile storage, versioned consent records and security/audit events. No external identity provider, customer keys, production privacy/terms documents or authenticated portal session is configured. This does not implement KYC, underwriting, lending decisions, contracts, loan servicing, ledger, balances, payments or production operations. The typed customer API client has passed the frontend build and tests, enforces HTTPS for remote API origins, and remains unwired to screens pending an approved identity-provider integration.

Initial checks run against the extracted starter on 2026-11-19:

| Check | Result |
|---|---|
| `python3 test/catalogue-integrity.py` | PASS: 19 categories, 66 unique types and valid references |
| `npm run test:static` | PASS: catalogue integrity and Stage 1 static invariants |
| `npm run build` | PASS: TypeScript production build |
| `npm test` | Historical Stage 1 baseline: PASS, 9 Vitest tests; current expanded suite is checked in the latest Stage 1 CI run |
| `npm audit` | PASS: zero reported vulnerabilities |
| MySQL migrations, seed and integration test | NOT RUN: no local server; disposable MySQL 8.4 is still required |
| GitHub Actions `Stage 1 CI` on `78cdea4602c68c79e375daee386a531f2db139eb` | PASS, including MySQL 8.4 migration, seed and integration steps |

These results are a baseline only. Static tests do not verify database runtime behavior, production readiness, provider connectivity, licensing, or legal approval. Lending and country/currency activation must remain disabled until the required approvals are documented.

## Documentation map

- [AI Contributor Instructions](AGENTS.md) — mandatory read-first and implementation rules.
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) — full staged delivery plan and acceptance gates.
- [Design Direction](docs/DESIGN_DIRECTION.md) — owner-requested premium financial-institution visual system.
- [`apps/portal/README.md`](apps/portal/README.md) — first UI preview scope and run instructions.
- [AI Contributor Presentation Script](docs/AI_CONTRIBUTOR_PRESENTATION_SCRIPT.md) — spoken briefing on the plan, architecture, design and evidence rules.
- [Feature Status](docs/FEATURE_STATUS.md) — evidence-backed state for all 60 features.
- [Progress log](progress.md) — dated work, checks and blockers.
- `loan-platform-stage1-mysql-ci.zip` — preserved original Stage 1 source archive and provenance.

## Stage 1 setup

The starter README and status report are retained with the adopted source. Its baseline setup requires Node.js 22 LTS and MySQL 8.4. Follow the starter's dependency, environment, migration and seed instructions only after verifying the target database is a disposable development/test database. Never point migration or integration-test commands at production or shared customer data. Do not commit `.env`, private keys, customer records or identity documents.
