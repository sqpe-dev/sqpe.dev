# sqpe.dev

An independent, source-backed field guide to Semantic Query Processing Engines.

Published on Cloudflare Workers Static Assets: https://sqpe-dev.oktieh.workers.dev. Custom domain: https://sqpe.dev.

Current catalog: 132 bibliographic and resource records, including 28 research profiles and three industry profiles, a fundamentals guide, searchable research library, system comparison, evaluation guide, and editorial policy.

## Local development

Requires Node.js 22 or newer. No runtime or build dependencies.

```sh
npm run build
npm run dev
```

Visit http://127.0.0.1:4173. Rebuild after changing content or templates.

```sh
npm run check
```

## Structure

- `data/catalog.json`: pinned snapshot of the public catalog, including editorial profiles.
- `data/catalog.lock.json`: upstream commit and SHA-256 checksums.
- `data/reference-inventory.json`: reconciliation of the original bibliography.
- `scripts/build.mjs`: static HTML generation, metadata, sitemap, Atom feed.
- `src/`: stylesheet and progressive browser interactions.
- `public/`: favicon and Cloudflare security headers.
- `test/`: content integrity and generated-link checks.
- `references/state-of-the-art.md`: original supplied research input; not fully independently verified.

Every profile has a source, review date, and evidence limitation. Record/abstract review is not independent experimental reproduction. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Deployment

Run `npm run check`, then deploy `dist/` to Cloudflare Workers Static Assets or Pages. Build command: `npm run build`; output directory: `dist`. `wrangler.jsonc` configures a static Worker. No server, API keys, or paid model calls are needed.

For an authenticated Wrangler installation: `npx wrangler deploy`. Bind `sqpe.dev` through Workers → Settings → Domains & Routes → Add custom domain. The domain must belong to the same Cloudflare account. Review existing DNS before binding.

CI checks every push and pull request. Production deployment currently uses the Cloudflare dashboard; connecting automatic production deployment is a separate configuration step.

## Search visibility

See [Search visibility](docs/SEARCH.md) for implemented metadata, validation, production indexing checks, and search-performance measurement.

## Editorial boundaries

This is a curated first release, not an exhaustive bibliography. Claims are traceable to primary records or vendor documentation. No cross-paper speedup leaderboard is presented. Some indexed work is coauthored by Oktie Hassanzadeh; see the public editorial disclosure.

## Design

The design is a technical field journal: warm neutral background, dark blue ink, restrained serif display headings, compact monospace metadata, and a diagram of a semantic query plan. See [docs/DESIGN.md](docs/DESIGN.md).

## Public catalog

The authoritative data and contribution tracker live at https://github.com/sqpe-dev/catalog. The website renders `/catalog/` and exports JSON, CSV and BibTeX from the same snapshot. `/profiles.json` retains the profile-only representation for comparison. Bibliography imports do not imply metadata verification.

To update, review a validated upstream commit, then run `npm run catalog:update -- <full-40-character-commit-sha>` followed by `npm run check`. Commit the snapshot and lock together. Builds verify checksums and need no network access. Changes to records belong in the public catalog repository; do not edit the vendored snapshot directly.

The original survey is retained as historical research input. New citations belong in the catalog. Coverage checks prevent original bibliography entries from disappearing silently. The public repository contains its own review policy, reuse terms, contribution forms and validation. Website repository visibility is independent of catalog access.
