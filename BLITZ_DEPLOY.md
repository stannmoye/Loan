# Blitz Cloud deployment

The repository's default deployment branch is **main**. The root `Dockerfile` builds the customer and operations portal preview from `apps/portal/` and serves it with unprivileged Nginx on port 8080.

## Deploy from GitHub

1. In Blitz Cloud, open the existing application settings.
2. Select repository `stannmoye/Loan`.
3. Set the branch to `main`.
4. Set the build context / Dockerfile location to the repository root.
5. Use the root `Dockerfile` (do not select `apps/portal` as the Docker build context).
6. Set the application/container port to **8080**.
7. Save and trigger a new deployment. Keep automatic deploy-on-push enabled for `main`.

The Dockerfile builds the Vite production bundle and configures Nginx to serve `index.html`NaN`DATABASE_URL` and `CORS_ORIGIN`. Administrator JWT issuer, audience and RS256 public key are optional at startup so health checks can run; protected administrator routes fail closed with HTTP 503 until the real identity-provider values are configured. Customer identity settings are also optional until a dedicated customer identity provider and approved legal-document versions are configured.

Never use random placeholder keys for authentication. Never put private keys, API tokens, database passwords or encryption master keys in frontend code, browser storage, or Git. Configure backend secrets only in the hosting provider's protected environment settings.

## Verification

The API CI workflow checks the backend build, tests, static checks, migrations and MySQL integration. The portal CI workflow checks the frontend TypeScript/Vite build, component tests, Docker image build and desktop/mobile Playwright flows. A successful static-site build does not enable backend authentication or financial operations.
