# Contributing

## Sources and editorial corrections

Propose bibliography additions, metadata corrections, and profile changes in the [public catalog](https://github.com/sqpe-dev/catalog/issues/new/choose). A primary source and a short explanation of relevance are enough to submit a suggestion. Its contribution guide defines review standards and reuse terms.

The files in `data/` are pinned snapshots. Update them with `npm run catalog:update -- <full catalog commit SHA>` and commit the lock file with the data. Historical material in `references/` is retained for provenance; new references belong in the catalog.

## Website changes

Open an issue describing the affected page and expected behavior, or submit a focused pull request. For visual problems, include the viewport size and relevant browser when available. For proposed features, explain the reader's task and how the change supports it.

1. Install the pinned development dependencies with `npm ci`.
2. Make the change, keeping source titles, evidence statements, and review dates faithful to the catalog.
3. Run `npm run format` and `npm run check`.
4. For visual or interactive changes, inspect desktop and narrow layouts, keyboard focus, navigation, filters, and any affected comparison behavior.
5. Describe the resulting behavior and relevant validation in the pull request.

Keep changes proportionate to the problem. Tests should cover meaningful failure cases and public behavior. Do not introduce tracking, external runtime scripts, or unsupported editorial claims. Deployment must be verified separately from a successful build.
