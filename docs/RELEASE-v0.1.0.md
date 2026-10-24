# v0.1.0 — SQPE field guide

First release of a source-backed resource for Semantic Query Processing Engines.

## Included

- 32 static content pages plus a custom 404.
- 22 research profiles and three official industry-platform profiles.
- Search, combined category/year filters, sorting, and up to three system comparisons.
- Fundamentals, operator taxonomy, evaluation guidance and reading paths.
- Explicit evidence levels, primary citations, review dates and limitations.
- Editorial and contribution policies, authorship disclosure, open JSON catalog, sitemap and Atom feed.
- Responsive layout, keyboard focus, semantic navigation and reduced-motion support.
- Dependency-free static build, content integrity checks and GitHub Actions.

## Validation

`npm run check` passed locally and in GitHub Actions. Browser checks passed for search, zero-results/reset, combined benchmark/year filtering, the three-system selection limit, rendered comparison data, mobile menu/navigation and 390px layout without horizontal overflow. No browser console errors were observed in those tested flows. Public Cloudflare deployment returned HTTPS 200 with the configured security headers.

## Hosting

Cloudflare Worker: `sqpe-dev` (static assets only).
Public endpoint: https://sqpe-dev.oktieh.workers.dev
Custom production domain: https://sqpe.dev
Initial Cloudflare deployment version prefix: `d7673cb3`.

Cloudflare dashboard deployment is manual. GitHub Actions validates and uploads the build artifact but does not yet auto-deploy. Use an authenticated Wrangler installation or the dashboard for subsequent releases; do not commit credentials.

## Limits and next work

This is a curated first edition, not comprehensive coverage. Publication records and abstracts were checked; experiments were not independently reproduced. Future releases should add full-paper reviews, runnable examples and reproducible benchmark reports. Vendor availability remains subject to current documentation.
