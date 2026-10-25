# sqpe.dev

[![Checks](https://github.com/sqpe-dev/sqpe.dev/actions/workflows/check.yml/badge.svg)](https://github.com/sqpe-dev/sqpe.dev/actions/workflows/check.yml)

A reference site for semantic query processing: research engines, semantic operators, optimization methods, and evaluation. The site combines explanatory articles with source-linked profiles and a searchable bibliography.

The [newsletter](https://sqpe.dev/newsletter/) provides dated research and industry reports with an [Atom feed](https://sqpe.dev/newsletter/feed.xml). Sources are checked weekly; issues are published when at least three substantive developments, including one directly relevant to semantic query processing, have accumulated. See [newsletter maintenance](docs/NEWSLETTER.md) for source verification, pending updates and production publication.

**[Read the field guide](https://sqpe.dev)** · **[Browse the catalog](https://sqpe.dev/catalog/)** · **[Suggest a source](https://github.com/sqpe-dev/catalog/issues/new/choose)**

## Website and catalog

This repository contains the website implementation. Bibliographic records, editorial profiles, and their review history are maintained in the separate [SQPE catalog](https://github.com/sqpe-dev/catalog).

The website consumes a pinned catalog commit. Its HTML pages and BibTeX, CSV, and JSON exports are generated from the same snapshot. Imported references awaiting metadata verification are labeled separately from reviewed profiles. Inclusion does not imply endorsement or independent reproduction; see the [editorial policy](https://sqpe.dev/about/).

## Development

Use Node.js 22 or later.

```sh
npm ci
npm run build
npm run dev
```

Open [localhost:4173](http://127.0.0.1:4173). The preview server serves `dist/`; rebuild after editing templates or browser assets. The production site has no runtime dependencies or server application. Prettier is a pinned development dependency used to keep source formatting consistent.

```sh
npm run format        # Format maintained source and documentation
npm run check         # Check formatting, build, and run tests
npm run newsletter:status # Inspect pending updates and publication readiness
```

The checks cover catalog integrity, citation provenance, safe source URLs, generated links, metadata, sitemap coverage, and exports. Browser verification remains necessary for interaction and layout changes.

## Repository layout

| Path                           | Purpose                                                      |
| ------------------------------ | ------------------------------------------------------------ |
| `scripts/build.mjs`            | Static page generation, metadata, sitemap, feed, and exports |
| `scripts/catalog-page.mjs`     | Bibliography layout and citation rendering                   |
| `scripts/validate-catalog.mjs` | Shared validation for updates and builds                     |
| `scripts/update-catalog.mjs`   | Fetch and pin an upstream catalog commit                     |
| `src/`                         | Browser interactions and styles                              |
| `data/`                        | Catalog snapshot, checksums, and reference reconciliation    |
| `public/`                      | Static assets and response headers                           |
| `test/`                        | Content, rendering, and validation checks                    |
| `docs/`                        | Design, deployment verification, and release documentation   |
| `references/`                  | Historical research input; not the maintained catalog        |

## Updating the catalog

Review an upstream catalog commit and its validation results, then run:

```sh
npm run catalog:update -- <full-40-character-commit-sha>
npm run check
```

The updater validates both downloaded files before replacing the snapshot. Commit the data and `data/catalog.lock.json` together. Builds verify checksums and validate the rendering contract before generating pages; they require no network access. Propose record changes in the public catalog repository instead of editing the snapshot here.

## Deployment

Production uses **Cloudflare Workers Static Assets**, with `sqpe.dev` as its custom domain. The configuration is in `wrangler.jsonc`; the build output is `dist/`.

GitHub Actions checks changes and saves the static build artifact. Production deployment currently uses the Cloudflare dashboard: open the existing `sqpe-dev` Worker, choose **New deployment**, and upload the contents of the checked `dist/` directory. An authenticated Wrangler installation can also deploy using the repository configuration.

After deployment, verify the live page and exported catalog against the checked build. A successful CI run alone does not establish that production has changed. See [search and production verification](docs/SEARCH.md) for the broader checks.

## Contributing

[CONTRIBUTING.md](CONTRIBUTING.md) distinguishes website changes from catalog contributions and describes validation expectations. [Design notes](docs/DESIGN.md) explain the typography, information architecture, and accessibility choices.

Catalog data and editorial annotations retain the [upstream reuse terms](https://github.com/sqpe-dev/catalog#reuse). Linked papers and third-party materials retain their own rights; those catalog terms do not license this repository's website implementation.
