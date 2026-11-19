# Northline Portal

A responsive React + TypeScript + Vite application containing the customer experience preview and a separate operations case-review preview.

## Run locally

From this directory:

\`\`\`sh
npm install
npm run dev
\`\`\`

Build and type-check:

\`\`\`sh
npm run build
\`\`\`

Run component tests:

\`\`\`sh
npm test
\`\`\`

Run the desktop and mobile Chromium browser checks (after installing Playwright's browser):

\`\`\`sh
npx playwright install chromium
npm run test:e2e
\`\`\`

## Customer experience design

The customer home uses an institutional, customer-first design system: restrained navy and blue, generous white surfaces, precise typography, accessible Lucide outline icons, visible workflow states, responsive navigation and clear privacy language.

The current customer preview includes:
- A photographic welcome area using \`public/images/customer-adviser.jpg\`.
- Dedicated customer views for overview, finance explorer, My applications, My loans, Documents, Help centre, and Security & profile.
- A clear sample application-progress timeline and next-step panel.
- A loan account centre with an intentional empty state, repayment and statement sections clearly marked not connected, and no fabricated balances or payment dates.
- Privacy and support guidance, recent activity and customer navigation.
- Searchable educational finance explorer for all 19 planned categories and 66 planned product types, with comparison guides and custom SVG illustrations.
- Mobile, tablet and desktop layouts, keyboard focus states and reduced-motion support.

## Operations preview

The operations workspace retains synthetic case search, status filtering, case selection, a case timeline and an evidence checklist. It does not expose decision, approval or financial transaction actions.

## Important scope boundary

This is still a presentation-only preview. All sample records and statuses are fictional. It does not connect customer identity, applications, underwriting, document storage, KYC, contracts, loan servicing, a ledger, balances, payments or provider services. It does not make lending decisions, accept applications, approve loans, disburse funds, collect repayments or process withdrawals.

Do not enter personal, identity, banking or other sensitive information into this preview. Customer-facing rates, fees, eligibility and repayment terms must come from approved, versioned, country-specific product data before they are displayed as offers.

The workspace switch, seven-view customer navigation, empty loan-account centre, catalogue filters/guides, FAQ accordion, navigation notices, case search, status filter and case selection are local UI interactions only. Application status and product categories are illustrative education, not live customer or lending data. Replace fixtures with typed API clients only after the corresponding backend contracts, authentication, authorization, privacy controls, immutable audit, and acceptance tests are implemented.


## Latest verification (2026-11-19)

The exact portal revision `1b7f6340ce67e7ea721754240ec94676e0020a69` passed [Portal CI run 44563163473](https://github.com/stannmoye/Loan/actions/runs/44563163473): TypeScript/Vite production build, 9 component tests, and Playwright Chromium checks (7 passed, 1 intentionally skipped for the desktop-only mobile-navigation scenario). Coverage now includes the My loans empty account centre and navigation. The CI artifact contains desktop/mobile screenshots and the Playwright report: [browser QA artifact](https://github.com/stannmoye/Loan/actions/runs/44563163473/artifacts/14551077157). The earlier screenshots were reviewed at 1440×1050 and 412×915; the new My loans route is included in the passing E2E journey. The companion [Stage 1 CI run 44563163330](https://github.com/stannmoye/Loan/actions/runs/44563163330) passed backend build, root unit/static checks, and MySQL 8.4 migration, seed and integration steps.

These checks verify the UI preview and Stage 1 baseline only; they do not verify a complete live lending workflow or production operation.
