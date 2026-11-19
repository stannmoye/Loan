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

The workspace switch, navigation notices, case search, status filter and case selection are local UI interactions only. Replace fixtures with typed API clients only after the corresponding backend contracts, authentication, authorization, audit controls and acceptance tests are implemented.
