# Blitz Cloud preview deployment

This repository is prepared to publish the **presentation-only portal preview** from the root `Dockerfile`.

## Deploy

1. Sign in to blitz.cloud and choose **Host something new** → **My own code**.
2. Connect GitHub and grant access to the public repository `stannmoye/Loan`.
3. Select the branch `feat/customer-operations-portal-shell` (do not select `main` for this preview yet).
4. Keep the build folder at the repository root so Blitz Cloud detects the root `Dockerfile`.
5. Name the app and start the first build.
6. In app settings, leave **Deploy every push** enabled. New commits pushed to this branch will then publish automatically.

The container builds `apps/portal/` with Node.js 22 and serves its production output through unprivileged Nginx on port 8080. Client-side routes fall back to `index.html`.

## What the preview contains

- Customer portal: overview, loan discovery, applications preview, loan account centre, documents guidance, notifications, help, and security/profile guidance.
- Operations workspace: synthetic case review and local sample search/filter interactions.
- Responsive desktop, tablet and mobile layouts.

## Important limitations

This is a visual/product preview, not a live lending service. Customer and case content is illustrative. The portal is not connected to a configured identity provider or live customer session. Do not enter real personal, identity, banking or financial information.

The backend API and MySQL database are not included in this static preview container. Authentication, KYC, underwriting, contracts, loan servicing, balances, payments, disbursement and production integrations are not activated.

## Update workflow

Make one coherent change, commit it to `feat/customer-operations-portal-shell`, and push. Blitz Cloud builds the newest commit and keeps the currently running version online until the new version starts successfully. Check the app's build/activity log if an update does not appear.
