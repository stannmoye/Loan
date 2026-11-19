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
- Eight dedicated customer views: overview, finance explorer, My applications, My loans, Documents, Notifications, Help centre, and Security & profile.
- A clear sample application-progress timeline and next-step panel.
- A loan account centre with an intentional empty state, repayment and statement sections clearly marked not connected, and no fabricated balances or payment dates.
- A sample-only notifications inbox with category filters and navigation to related customer guidance; no real notifications or delivery status are implied.
- Privacy and support guidance, recent activity and customer navigation.
- Searchable educational finance explorer for all 19 planned categories and 66 planned product types, with comparison guides and custom SVG illustrations.
- Mobile, tablet and desktop layouts, keyboard focus states and reduced-motion support.

## Operations preview

The operations workspace retains synthetic case search, status filtering, case selection, a case timeline and an evidence checklist. It does not expose decision, approval or financial transaction actions.

## Important scope boundary

This is still a presentation-only preview. All sample records and statuses are fictional. It does not connect customer identity, applications, underwriting, document storage, KYC, contracts, loan servicing, a ledger, balances, payments or provider services. It does not make lending decisions, accept applications, approve loans, disburse funds, collect repayments or process withdrawals.

Do not enter personal, identity, banking or other sensitive information into this preview. Customer-facing rates, fees, eligibility and repayment terms must come from approved, versioned, country-specific product data before they are displayed as offers.

The workspace switch, eight-view customer navigation, empty loan-account centre, sample notifications inbox, catalogue filters/guides, FAQ accordion, navigation notices, case search, status filter and case selection are local UI interactions only. Application status and product categories are illustrative education, not live customer or lending data. Replace fixtures with typed API clients only after the corresponding backend contracts, authentication, authorization, privacy controls, immutable audit, and acceptance tests are implemented.


## Latest verification (2026-11-19)

The latest PR source head `a6f9a19e33992e674fecf44bb8530884689a1c25` passed [Portal CI run 44564294820](https://github.com/stannmoye/Loan/actions/runs/44564294820): TypeScript/Vite production build, 10 component tests, and Playwright Chromium checks (9 passed, 1 intentionally skipped for the desktop-only mobile-navigation scenario). The browser suite covers the overview, finance explorer, My loans empty account centre, notifications filters, help/security navigation, product-type search and upload-disabled state. The CI artifact contains desktop/mobile screenshots of the overview, My loans and Notifications pages and the Playwright report: [browser QA artifact](https://github.com/stannmoye/Loan/actions/runs/44564294820/artifacts/14549567947). Those screenshots were visually inspected at desktop and mobile widths; images rendered and no-overflow assertions passed.

The companion [Stage 1 CI run 44564294708](https://github.com/stannmoye/Loan/actions/runs/44564294708) passed backend build, root unit/static checks, and MySQL 8.4 migration, seed and integration steps on the same revision.

These checks verify the UI preview and Stage 1 baseline only; they do not verify a complete live lending workflow or production operation.


## Typed customer API client — provider wiring pending

`src/customer/customer-api.ts` provides a typed client for the Stage 2 customer account API:
- onboarding and versioned-consent submission;
- authenticated customer profile retrieval and allow-listed profile patch;
- customer-owned session listing and revocation;
- local API-session logout.

The client resolves a current access token through an injected `getAccessToken` callback on every call. It does not implement authentication, persist tokens, use localStorage/cookies, or select an identity provider. It sends requests with `credentials: "omit"`, `cache: "no-store"` and `redirect: "error"`, and refuses to send requests without a token. Callback/network errors are mapped to generic safe errors rather than exposing provider details.

Unit tests cover token resolution, sensitive header handling, no-token behavior, error mapping, URL validation, request payload scope, session-ID encoding and invalid API envelopes. The client is not yet wired into the customer screens; they remain in clearly marked sample mode until the identity provider is selected, configured and reviewed.


## Latest customer API client verification

The customer API client and its typed request recorder passed [Portal CI 44578577612](https://github.com/stannmoye/Loan/actions/runs/44578577612): production TypeScript/Vite build, 18 tests across 3 files, and Playwright Chromium checks (9 passed, 1 desktop-only mobile navigation case skipped). [Browser QA artifact 14557817445](https://github.com/stannmoye/Loan/actions/runs/44578577612/artifacts/14557817445).

The companion [Stage 1 CI 44578577610](https://github.com/stannmoye/Loan/actions/runs/44578577610) passed backend build, 41 tests across 5 files, static checks, MySQL 8.4 migration, seed, and customer identity integration checks. The documentation-only follow-up Stage 1 run [44578722065](https://github.com/stannmoye/Loan/actions/runs/44578722065) also passed. Portal CI for the documentation-only head remains the current outstanding run.

This still verifies a typed client and backend API foundation, not a live sign-in experience. No identity provider is configured, and the portal views remain in sample mode.
