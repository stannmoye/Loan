# Global Digital Lending Platform

This repository contains the implementation of a global digital lending platform, developed in evidence-based stages. Its complete scope, architecture, safety boundaries, acceptance gates, test strategy and delivery order are documented in the [Implementation Plan](docs/IMPLEMENTATION_PLAN.md). AI and human contributors must first read [AGENTS.md](AGENTS.md), the [Feature Status and Evidence Register](docs/FEATURE_STATUS.md), and [progress.md](progress.md).

## Current status

The repository initially contains the Stage 1 starter as `loan-platform-stage1-mysql-ci.zip`. The archive describes a Node.js 22+/TypeScript/Fastify API foundation, MySQL 8.4/InnoDB product catalogue and approval workflow, and static checks. It does not constitute a complete lending system. Customer/staff identity, portals, applications, verification, underwriting, contracts, loan servicing, ledger, balances, payment integrations and production operations are not yet evidenced as implemented.

Initial checks run against the extracted starter on 2026-11-19:

| Check | Result |
|---|---|
| `python3 test/catalogue-integrity.py` | PASS: 19 categories, 66 unique types and valid references |
| `python3 test/stage1-invariants.py` | PASS: static source/schema invariants |
| TypeScript build and Vitest | NOT RUN: dependencies are not installed |
| MySQL migrations, seed and integration test | NOT RUN: isolated configured MySQL was not demonstrated |
| GitHub Actions | NOT CHECKED |

These results are a baseline only. Static tests do not verify database runtime behavior, production readiness, provider connectivity, licensing, or legal approval. Lending and country/currency activation must remain disabled until the required approvals are documented.

## Documentation map

- [AI Contributor Instructions](AGENTS.md) — mandatory read-first and implementation rules.
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) — full staged delivery plan and acceptance gates.
- [Feature Status](docs/FEATURE_STATUS.md) — evidence-backed state for all 60 features.
- [Progress log](progress.md) — dated work, checks and blockers.
- `loan-platform-stage1-mysql-ci.zip` — original Stage 1 source archive and provenance.

## Stage 1 setup

The starter README and status report are retained with the adopted source. Its baseline setup requires Node.js 22 LTS and MySQL 8.4. Follow the starter's dependency, environment, migration and seed instructions only after verifying the target database is a disposable development/test database. Never point migration or integration-test commands at production or shared customer data. Do not commit `.env`, private keys, customer records or identity documents.
