# Contributing to sqpe.dev

Submit an issue or pull request with a primary publication or official documentation link. Include the contribution, system or operator family, relevant limitations, and any author or vendor relationship.

## Catalog entries

Edit `data/research.json` or `data/industry.json`. Required fields: stable lowercase `id`, `name`, exact `title`, `year`, `category`, `interface`, concise original `summary`, primary `url`, `tags`, ISO `verifiedDate`, accurate `evidence`, and a specific `caveat`.

Research year means initial cited record; industry year means documentation review year. Do not infer peer review from an arXiv listing. Verify IDs against titles. Keep paper metadata distinct from current software capabilities. Do not copy abstracts wholesale.

Evidence levels:

1. Primary source reviewed: publication record and abstract checked. Do not imply full-paper review or reproduction.
2. Vendor documentation reviewed: official feature documentation checked; not independent validation.
3. Reproduced: reserved for an accompanying report with environment, artifacts, datasets, methodology, results and limitations. No initial entries use this label.

Only advance a review date after checking the source. If a source becomes unavailable, retain history and flag the uncertainty rather than silently replacing the citation. Quantitative claims need experimental context. Declare authorship or commercial relationships. Contributor-authored work receives no special prominence.

Run `npm run check`. Preview wide and narrow screens; verify search, category/year filters, sorting, navigation and system comparison. Document substantive changes in the updates page and feed.
