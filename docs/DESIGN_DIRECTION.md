# Product Design Direction — Financial Institution, Not Generic Fintech

**Status:** Approved project direction from the product owner, 2026-11-19
**Reference:** User-provided Dribbble transaction-portal screenshot. Use it as visual inspiration for tone and information hierarchy; do not copy its brand, assets, or layout verbatim.

## 1. Design objective

The product should feel like a trusted, established international financial institution: precise, calm, secure, premium, and highly legible. Avoid the familiar generic SaaS/fintech treatment of oversized gradients, neon accents, decorative blobs, generic dashboard cards, or meaningless graphs.

The supplied reference is primarily white and light grey, with compact left navigation, a small restrained header, a focused operational workspace, a case list/timeline, carefully aligned transaction facts, attachment rows, clear status chips, and a distinct green approval action. Preserve that operational clarity while giving the product its own recognisable banking identity.

The customer portal should feel reassuring and private; the administrative portal should feel like a serious financial operations suite. Both use the same tokens and icon language, with layouts tailored to the user's task.

## 2. Visual principles

1. **Institutional clarity:** spacious but not wasteful layouts, quiet surfaces, strong typography hierarchy, precise financial values, and meaningful grouping.
2. **Trust through restraint:** controlled colour, real status semantics, no celebratory effects on sensitive financial events, no fake account totals, and no decorative charts without authoritative data.
3. **Operational hierarchy:** make the current customer, product, case, transaction, amount, date, owner and next permitted action easy to identify. Put evidence, timeline, messages, attachments and history within reach.
4. **Deliberate banking iconography:** use a single high-quality outline/duotone icon family with consistent stroke, size, baseline and semantic mapping. Use icons to aid scanability, never as ambiguous decoration or the only carrier of meaning.
5. **Purposeful imagery:** use premium, art-directed financial imagery or bespoke illustrations for onboarding, product discovery and empty states. Keep imagery out of dense operations tables and case-detail regions where it competes with evidence. No stock piles of cash, misleading account screenshots, fictional bank logos, or imagery implying deposit protection, licensing or provider affiliation.
6. **Accessible by default:** keyboard operable, readable contrast, visible focus, scalable type, screen-reader labels and text/status labels in addition to colour. Respect reduced motion.

## 3. Shared token palette

Use the master specification palette as the initial token source and review contrast before implementation:

| Token | Value | Use |
|---|---|---|
| Institutional navy | `#14243D` | Primary shell, headings, navigation emphasis |
| Primary blue | `#2563EB` | Links, selected navigation, primary neutral actions |
| Pale blue | `#DBEAFE` | Soft selection and information surfaces |
| Page canvas | `#F6F8FC` | Quiet app background |
| Surface | `#FFFFFF` | Cards, tables, drawers and forms |
| Main text | `#172033` | High-emphasis text |
| Secondary text | `#64748B` | Metadata and supporting copy |
| Border | `#E2E8F0` | Table rules, dividers and control outlines |
| Success | `#15803D` | Settled, approved or completed state, only with explicit text/icon |
| Warning | `#D97706` | Pending review, upcoming or attention-required |
| Danger | `#DC2626` | Failed, rejected, restricted or destructive actions |
| Heritage gold | `#B8892E` | Small premium accent only; not a status or body-text default |

Keep the majority of the UI on white and cool-neutral surfaces. Use navy for institutional weight; blue for navigation and safe primary actions; reserve green for positive financial/workflow states and explicitly labelled approvals. Never use colour alone to communicate status. Do not use gold for balances or yield claims.

## 4. Typography, spacing and financial data

Use a readable, modern sans-serif with a calm institutional character. Use a restrained display weight for page titles, clear medium-weight section headings, and highly legible body/metadata styles. Financial amounts use tabular numerals, consistent currency precision, aligned columns and explicit currency codes/symbols. Distinguish amounts from percentages, rates, dates and identifiers.

Define spacing, elevation, border-radius and focus tokens once. Use low-elevation surfaces, fine borders, restrained shadows, and consistent alignment; avoid floating cards piled on gradients. Dense admin tables may use compact spacing but must remain touch- and keyboard-usable. Empty, loading, error, restricted and success states are first-class designs.

## 5. Banking icon system

Adopt one consistent family (for example, a Lucide-style outline set if compatible with the eventual React implementation) and wrap it in shared accessible components. Define a small set of sizes, stroke weights and semantic color rules. Prioritize unmistakable concepts: institution/branch, customer/profile, security/shield, loan/contract, verified document, wallet, card, transfer, repayment, statement/receipt, transaction, reconciliation, risk/alert, support, audit/history and settings.

Choose icons by action and domain meaning—not by visual novelty. Pair unfamiliar icons with visible labels/tooltips. Decorative large icons may appear in a carefully designed empty state or product explainer; never inside financial values as a substitute for labels.

## 6. Image and illustration direction

Build a small art-directed image library for customer-facing use: approachable but credible people and small businesses; secure document and onboarding concepts; home, education, healthcare, vehicle, business and equipment finance themes; subtle architectural/material details associated with institutional service; and custom illustrations for genuinely empty states. Use authentic, inclusive photography or bespoke illustration, with a consistent neutral color grade and generous negative space. Avoid unverified badges, provider marks, cash imagery, false product promises, generic AI-generated charts, or photographs that obscure disclosures.

Admin operations should prioritize case evidence, timelines, metadata, attachment previews and data visualisation. Use imagery sparingly there. Any asset must have an owner-approved licence, correct alt text (or decorative treatment), responsive crop guidance, and documented source. Use vector icons for interactive controls; do not render icon glyphs as text or emoji.

## 7. Layout inspired by the supplied portal

### Admin transaction and case workspace

Use a compact persistent sidebar with institution wordmark and task-oriented navigation; a restrained top bar for global search, notifications and staff identity; and a focused main workspace. On detail pages, use a clear case header with case identifier, customer/merchant, amount, key dates, current status and permitted actions. Arrange the evidence as a readable timeline, latest response/message, supporting attachment list, and internal notes, with clear separation between customer-visible and staff-only content. Put primary approval actions at predictable locations and require confirmation/reason where the operation warrants it. Never show controls the staff member lacks permission to perform.

### Customer portal

Create a reassuring account home with clear next steps, actual application/loan status, upcoming obligations and recent activity. Use secure, plain-language disclosures and prominent support/security entry points. Product discovery can use curated finance-category images, but rates, fees, eligibility and repayment terms remain the visual focus and must be backed by versioned data. No invented balances, chart series, testimonials or approval promises.

### Responsive behavior

Use the master breakpoints (320–375, 390–430, 768, 1024–1440, 1600+ px) as test widths. At mobile widths, convert sidebar navigation to a compact, accessible drawer or bottom navigation, stack transaction facts and detail panels, keep the next action reachable, and use cards or controlled horizontal scrolling for dense tables. Never hide status, currency, errors, disclosures or action permission at narrow widths. Verify no ordinary page-level horizontal overflow.

## 8. Implementation checklist for the design stage

Before implementing individual screens, establish design tokens, typography, spacing, icon wrappers, navigation, forms, tables, status/alert system, timeline/attachment components, responsive behavior and accessibility rules. Review the customer and admin portals separately against the same token set. Test realistic content density and long currency values—not only empty mockups.

The first UI delivery should contain one representative customer screen and one representative admin case-detail screen, connected only to available legitimate data or clearly labelled test fixtures. Get those foundations reviewed before cloning patterns across all routes. Design work does not make backend features complete, and the feature register must continue to describe actual functionality rather than screen coverage.
