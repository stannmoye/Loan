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
- A clear sample application-progress timeline and next-step panel.
- Privacy and support guidance, recent activity and customer navigation.
- Original SVG illustrations for personal, education, home and business finance discovery.
- Mobile, tablet and desktop layouts, keyboard focus states and reduced-motion support.

## Operations preview

The operations workspace retains synthetic case search, status filtering, case selection, a case timeline and an evidence checklist. It does not expose decision, approval or financial transaction actions.

## Important scope boundary

This is still a presentation-only preview. All sample records and statuses are fictional. It does not connect customer identity, applications, underwriting, document storage, KYC, contracts, loan servicing, a ledger, balances, payments or provider services. It does not make lending decisions, accept applications, approve loans, disburse funds, collect repayments or process withdrawals.

Do not enter personal, identity, banking or other sensitive information into this preview. Customer-facing rates, fees, eligibility and repayment terms must come from approved, versioned, country-specific product data before they are displayed as offers.

The workspace switch, customer navigation, catalogue filters/guides, FAQ accordion, navigation notices, case search, status filter and case selection are local UI interactions only. Application status and product categories are illustrative education, not live customer or lending data. Replace fixtures with typed API clients only after the corresponding backend contracts, authentication, authorization, privacy controls, immutable audit, and acceptance tests are implemented.


## Latest verification (2026-11-19)

The exact feature-branch head `5ff59000864f22b102538beb754e993eba8bc3e3` passed [Portal CI run 44562250414](https://github.com/stannmoye/Loan/actions/runs/44562250414): TypeScript/Vite production build, 8 component tests, and Playwright Chromium desktop/mobile checks (7 passed, 1 intentionally skipped for the desktop-only mobile-menu scenario). The Playwright artifact includes desktop and mobile screenshots and an HTML report: [browser QA artifact](https://github.com/stannmoye/Loan/actions/runs/44562250414/artifacts/14550491683). Screenshots were inspected at 1440×1050 and 412×915. The companion [Stage 1 CI run 44562250541](https://github.com/stannmoye/Loan/actions/runs/44562250541) passed backend build, unit/static checks, and MySQL 8.4 migration, seed and integration steps.

These checks verify the UI preview and Stage 1 baseline only; they do not verify a complete live lending workflow or production operation.
