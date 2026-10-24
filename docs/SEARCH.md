# Search visibility

The site targets model-backed semantic query processing: operators, execution engines, optimization, and evaluation. Titles should describe the particular page; publication titles and evidence qualifications must remain faithful to the sources.

## Implemented

All substantive content and related-profile links are rendered in static HTML. Each indexable page has a unique title, description, canonical URL, social metadata, and JSON-LD describing the website and page. Profiles identify their cited source as the subject of a page; they do not claim to be the original paper. Breadcrumb metadata follows the research or systems navigation. The error page is marked noindex.

The sitemap includes canonical content pages only. It omits lastmod because source-review dates and build dates do not reliably identify the last substantive page edit. Add lastmod only with maintained per-page modification dates. Query-string search results use their collection page's canonical URL.

Run `npm run check` before publishing. Checks cover sitemap completeness, canonical metadata, structured-data references, source identity, and local links. These checks do not establish indexing or eligibility for a particular search presentation.

## Production and measurement

Production uses Cloudflare Workers Static Assets, as configured in `wrangler.jsonc`; deployment currently uses the Cloudflare dashboard. After deploying the checked `dist/` directory:

1. Verify HTTPS responses for the home page, a profile, robots.txt, and sitemap.xml. Confirm that an unknown path returns HTTP 404. Check that the deployed HTML contains the updated titles and JSON-LD.
2. Verify ownership of `sqpe.dev` in Google Search Console and Bing Webmaster Tools using the actual verification record supplied by those services. Do not add placeholder verification tokens.
3. Submit `https://sqpe.dev/sitemap.xml`. Inspect the home page, fundamentals guide, systems directory, and representative profiles. Request indexing after publication when appropriate.
4. Use Google's Rich Results Test to inspect breadcrumb eligibility. Schema validity does not guarantee a rich result.
5. Record a baseline of impressions, clicks, query terms, and indexed pages. Track “semantic query processing,” “semantic query processing engines,” and relevant system/operator queries. Compare performance after enough impressions accumulate; avoid interpreting daily ranking fluctuations as causal evidence.

Search Console access and sitemap submission are account operations, not build features. A successful build does not mean the production site has been deployed, crawled, or indexed.

## Editorial priorities

Expand substantive coverage where readers have unanswered questions: worked query plans, source-backed comparisons of operators and engines, and reproducible evaluation reports when experiments actually exist. Keep distinctions from text-to-SQL, retrieval, and RDF/SPARQL explicit. Invite relevant research projects to cite useful material through ordinary scholarly outreach; do not buy links, manufacture endorsements, or publish keyword variants as duplicate pages.

## References

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Breadcrumb documentation](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Sitemap documentation](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

## Deployment and search setup — October 23, 2026

Published the checked static build through the existing Cloudflare dashboard deployment flow. Production version prefix: `10c8ff3e` (100% traffic, Ready). The homepage, fundamentals guide, systems directory, LOTUS profile, robots.txt, and sitemap.xml returned HTTP 200 and matched the local build byte for byte. An unknown URL returned HTTP 404. All seven local checks passed before deployment.

Google Search Console domain ownership for `sqpe.dev` was verified through a TXT record in Cloudflare DNS. Google processed the sitemap successfully and discovered all 38 canonical pages. Initial URL inspection reported the homepage and fundamentals guide as discovered but not yet indexed. Indexing requests for the homepage and fundamentals guide were accepted into the priority crawl queue. Performance and indexing reports were still processing, so no impressions, clicks, or ranking baseline was available.

Google's live smartphone Rich Results Test fetched the LOTUS profile successfully and detected a valid breadcrumb item and the cited ScholarlyArticle. The latter has optional headline, author, and image notices; it identifies the external paper, not authorship of the profile. No invented author or image metadata was added to suppress those notices.

Bing Webmaster Tools access was established and the site verified using its supplied DNS-only CNAME record. The sitemap was submitted and was processing at the time of the check. All 38 canonical page URLs were also accepted through URL Submission (38 submitted, 62 of the daily quota remaining). Retain both DNS verification records to preserve ownership verification. These DNS records are managed in Cloudflare, independently of the static build.
