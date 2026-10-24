# Contributing to sqpe.dev

For bibliography additions, corrections, and editorial profile changes, use the [public catalog](https://github.com/sqpe-dev/catalog). Its structured issue forms require only a primary source and relevance explanation; pull requests may edit the records directly. See its CONTRIBUTING.md for evidence standards and reuse terms.

For website changes, edit templates in scripts/build.mjs and browser assets in src/. Run npm run check and inspect wide and narrow layouts after visual changes.

The files data/catalog.json and data/reference-inventory.json are versioned snapshots, not independent editorial sources. Update them with npm run catalog:update -- <full catalog commit SHA>. Commit the lock file with the data. The build rejects checksum mismatches. Historical references/state-of-the-art.md is research input; new bibliography contributions belong upstream.
