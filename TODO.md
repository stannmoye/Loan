# First UI Increment — Outcome Checklist

This checklist covers the initial actual-design increment only. Keep the criteria with each outcome and mark it complete only when the behavior is implemented and evidence exists. API/domain features not available in the existing backend remain outside this UI increment.

## Shared institutional visual system

- [ ] Implement a premium financial-institution look, not a generic fintech/SaaS dashboard: white and cool-neutral work surfaces, institutional navy `#14243D`, controlled blue `#2563EB`, restrained status colors, fine dividers, useful whitespace, precise hierarchy, and no oversized gradients or decorative clutter.
- [ ] Implement shared typography, spacing, border, focus, status and elevation tokens. Financial values use aligned tabular numerals and explicit currency labels. State is never indicated by color alone.
- [ ] Implement a distinctive provisional product identity and accessible, consistent outline banking icons for institution, customers, security, loan, documents, wallet, transfers, repayment, statements, cases, support, audit and settings. Pair unclear icons with text; use no emoji as icons.
- [ ] Implement accessible component states: default, hover, focus, active, disabled, loading, empty, error, restricted and success; keyboard interaction and reduced motion must be respected.

## Customer banking overview

- [ ] Provide a customer view that communicates application/loan progress, the next permitted step, recent activity and product discovery in clear language.
- [ ] Any customer examples or amounts are conspicuously labelled sample/illustrative and must not appear to be a real balance, approval, disbursement, or payment.
- [ ] Use purposeful, appropriately licensed/art-directed financial imagery only in customer-facing onboarding or product discovery; avoid cash clichés, false guarantees, fabricated provider marks and imagery that obscures disclosures.

## Administrative transaction/case workspace

- [ ] Provide a real responsive browser screen inspired by the supplied transaction portal's operational clarity: compact navigation, restrained top bar, case/transaction context, clearly labeled status, timeline, latest response, attachments/evidence and a distinct action area.
- [ ] Use only synthetic, visibly illustrative cases. Any controls must either perform a safe local sample interaction or remain clearly disabled; they must not report a real approval, rejection, payment or settlement.
- [ ] Keep customer-visible messages distinct from staff-only notes. Do not reveal internal notes in customer mode.
- [ ] Make case facts and amounts easy to scan with dates, identifiers, status words and currency explicitly labeled.

## Responsive navigation and interaction

- [ ] Provide working navigation between the customer and operations views with clear active location and accessible labels.
- [ ] Provide a functional sample search/filter interaction whose results are limited to synthetic fixture data and whose empty/no-match state is clear.
- [ ] At 320–375px, 390–430px, 768px and desktop sizes, navigation adapts, content remains readable, important status/disclosure/actions stay available, and no ordinary page-level horizontal overflow occurs.

## Integration and delivery discipline

- [ ] Keep the frontend in a separately buildable React/TypeScript app under `apps/portal/`, without breaking the existing Fastify project scripts, API, migrations or tests.
- [ ] Create `public/manus-routes.json` before starting the WebDev development server, and keep it synchronized with implemented page routes.
- [ ] Label demo fixtures as non-production; do not invent customer API endpoints, ledger data or provider success. Use a typed API boundary for later integration.
- [ ] Run frontend diagnostics/build and existing backend build, Vitest and static checks; record each result and report anything blocked or unrun honestly.
- [ ] Commit/push verified progress to the existing `stannmoye/Loan` repository and update `docs/FEATURE_STATUS.md` and `progress.md` without claiming backend feature completion from UI coverage.
