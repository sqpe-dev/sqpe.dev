# sqpe.dev

An independent, source-backed field guide to Semantic Query Processing Engines.

Published on Cloudflare Workers Static Assets: https://sqpe-dev.oktieh.workers.dev. Custom domain: https://sqpe.dev.

First edition: 22 research profiles, three industry profiles, a fundamentals guide, searchable research library, system comparison, evaluation guide, and editorial policy.

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

- `data/research.json`: reviewed publication records and limitations.
- `data/industry.json`: official product documentation profiles.
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

## Editorial boundaries

This is a curated first release, not an exhaustive bibliography. Claims are traceable to primary records or vendor documentation. No cross-paper speedup leaderboard is presented. Some indexed work is coauthored by Oktie Hassanzadeh; see the public editorial disclosure.

## Design

The design is a technical field journal: warm neutral background, dark blue ink, restrained serif display headings, compact monospace metadata, and a diagram of a semantic query plan. See [docs/DESIGN.md](docs/DESIGN.md).
