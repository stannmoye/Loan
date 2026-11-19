# First Actual UI Increment — Plan

## Purpose and current context

Implement the first real browser interface for the Global Digital Lending Platform. The repository currently has a verified Fastify/TypeScript/MySQL foundation and no customer or admin frontend. The owner-approved visual direction is in `docs/DESIGN_DIRECTION.md`; this increment must implement an actual responsive UI, not a static image/mockup. Keep all records clearly marked as illustrative sandbox/design fixtures until real APIs and domain records exist. Do not portray fictional money, approvals, customer history, or provider activity as live facts.

The persistent application stack remains Node.js 22, TypeScript, Fastify, MySQL 8.4/InnoDB, Zod, and Vitest. The UI should use React with TypeScript and a standard modern bundler as a separately buildable frontend under `apps/portal/`, while consuming the existing versioned API through a typed client/configured base URL when real backend routes are available. This initial visual increment does not require new backend/database infrastructure and must not invent financial backend routes or fake successful transactions. Any demo data is synthetic, non-sensitive, explicitly labelled “Sample workspace” or “Illustrative data”.

## Scope

Deliver two representative, browser-rendered product surfaces under one shared visual system:

1. A customer banking overview: account/application context, a next-step panel, application/loan status, recent activity, and a product-discovery entry point. Any amounts shown must be conspicuously sample-only and never suggest a live balance. Prefer activity and status over fabricated total balances.
2. An administrative transaction/case workspace inspired by the supplied reference: compact institutional navigation, restrained top bar, queue/list context, transaction/case facts, labeled status, timeline, latest response, evidence/attachment rows, and a clear permission-aware action area. Sample case records are synthetic and actions must not claim to approve, disburse, or settle real financial events.

Add shared navigation between Customer and Operations demo spaces, explicit active states, responsive mobile navigation, functional sample search/filter controls, keyboard focus, semantic labels, empty/loading/error/restricted states where appropriate, and realistic long values/currency formatting. Use original, licensed/art-directed customer-facing imagery only where it improves the product-discovery or onboarding experience. Use an established semantic outline icon library wrapped in accessible reusable components; do not use emoji or random glyphs as financial icons.

## Design system

Follow `docs/DESIGN_DIRECTION.md` and the user’s supplied Dribbble transaction portal as inspiration only; do not copy its brand/layout/assets. Use white/cool-neutral working surfaces, navy `#14243D`, blue `#2563EB`, muted supporting text, fine borders, and status colors with explicit textual labels. Align money and numeric columns with tabular numerals. Use restrained shadows, strong information hierarchy, meaningful space, case-focused admin content, a reassuring customer experience, and purposeful imagery rather than decorative gradients. Make the UI usable at 320–375px, 390–430px, 768px, laptop, and large desktop widths with no ordinary page-level horizontal overflow. Ensure accessible focus, contrast, keyboard operation and reduced-motion support.

### Detailed style

- **Design movement:** contemporary private-banking editorial minimalism, informed by transaction-operations software rather than consumer fintech marketing.
- **Core principles:** institutional clarity; evidence before decoration; financial precision; accessibility without sacrificing density.
- **Color philosophy:** navy communicates institutional trust; white and cool grey preserve clarity; blue marks navigation and neutral action; green/amber/red are reserved for explicitly named states. Signature brand color is institutional navy `#14243D`; gold is a restrained accent, never a financial promise.
- **Layout paradigm:** an operations “workbench”: compact left rail and quiet utility header framing a broad, asymmetric case workspace; customer surfaces use a distinct simpler navigation and sequential next-action focus. Avoid one centered grid of generic metric cards.
- **Signature elements:** restrained navy rail with a fine heritage-gold locator; transaction/case timeline on a clean rule; tabular, aligned monetary values with currency labels.
- **Interaction philosophy:** direct, calm, reversible where possible. Make state and consequence visible before action. Sensitive actions require reason/confirmation when wired to real services; demo controls never fake completion.
- **Animation:** short, low-amplitude transitions for navigation/drawer/state reveal only; no count-up balances or celebratory financial effects. Respect `prefers-reduced-motion`.
- **Typography:** Inter (or a close system fallback) for UI; optional restrained serif accent only for selected customer-facing headline/brand expression. Use tabular numerals for amount/date columns; keep body and controls compact and readable.
- **Brand essence:** “A clear, accountable lending service for customers and the teams who serve them.” Personality: composed, exact, dependable.
- **Brand voice:** factual, plain-language, respectful. Example headlines: “A clear view of what comes next.” “Review the evidence before you decide.” Buttons state specific actions such as “Open application” or “Review case”.
- **Wordmark/logo concept:** custom text wordmark “Northline” with a simple paired-column/ledger-line emblem, no fabricated regulated-bank seal, shield-of-approval, or deposit guarantee. Use this as a provisional interface identity and label it as a product concept.
- **Signature color:** institutional navy `#14243D`.

## Architecture and repository structure

```text
apps/
  portal/
    index.html
    public/
      manus-routes.json
      images/                 # original customer-facing assets, if generated
    src/
      app/                    # route selection, app shell and view composition
      components/             # banking icons, navigation, chips, buttons, list rows
      customer/               # customer overview and activity view
      operations/             # case queue and transaction detail
      data/                   # synthetic illustrative fixtures only
      styles/                 # tokens, reset, responsive layout and theme
      lib/                    # safe money/date formatting, accessibility helpers
    package.json
    tsconfig.json
```

Use React/TypeScript in the interface; keep API contracts explicit and separate from demo fixture types. Prefer the existing repo’s top-level Node package for backend and tests; make frontend install/build/test scripts clear and avoid overwriting current API package scripts. Static design fixtures must be isolated, typed and visibly branded as samples. When actual API contracts become available, replace fixture reads with a typed client without changing financial rules in presentation components.

The user has directed that implementation be written directly to the existing GitHub repository. `stannmoye/Loan` is therefore the source of record. A separate preview workspace is optional and must never be treated as a substitute for committed GitHub source or as production integration. Do not claim visual inspection or a preview run unless it actually occurred.

## Work sequence

1. Establish this plan and `TODO.md` in GitHub before coding; preserve the existing implementation and check branch state.
2. Generate only planned customer-facing art assets before application coding. Use semantic vector banking icons in source, not generated icon rasters.
3. Create the route manifest and frontend source directly in a dedicated GitHub feature branch before any preview run.
4. Implement shared tokens, typography, provisional identity, accessible icon wrappers, app shell, responsive navigation, sample-state disclosure and customer/operations views directly in `apps/portal/`.
5. Connect views through functional navigation and safe local sample search/filter behavior. Do not implement backend actions against nonexistent routes.
6. Add a dedicated frontend CI workflow and run frontend build/type checks plus existing API build/tests/static checks. If no browser preview tool is available, explicitly leave visual inspection pending.
7. Commit meaningful increments to `stannmoye/Loan` on a feature branch, open a reviewable PR, and update `TODO.md`, `docs/FEATURE_STATUS.md`, `README.md`, and `progress.md`. Report exact commit, CI and preview status separately.

## Project files

- `docs/DESIGN_DIRECTION.md` — owner-approved visual requirements.
- `docs/IMPLEMENTATION_PLAN.md` — end-to-end 12-stage platform plan.
- `docs/AI_CONTRIBUTOR_PRESENTATION_SCRIPT.md` — contributor briefing script.
- `TODO.md` — outcome-level implementation clauses for this UI increment.
- `progress.md` — dated implementation evidence and blockers.
