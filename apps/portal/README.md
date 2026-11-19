# Northline Portal — First UI increment

A separately buildable React + TypeScript + Vite frontend for the customer overview and operations case-review preview.

## Run

From this directory:

```sh
npm install
npm run dev
```

Build with `npm run build`.

## Important scope boundary

This increment is presentation and safe local interaction only. Every record is synthetic and marked as sample/illustrative. It does not connect customer identity, application, underwriting, document, ledger, payment, KYC or provider services. No approval, disbursement, repayment or withdrawal can be performed. Do not treat the preview as a production lending interface.

The customer/operations switch, case search, status filter, case selection and informational notices are local UI interactions. Replace fixtures with a typed API client only after the relevant backend contracts, authorization and acceptance tests exist.
