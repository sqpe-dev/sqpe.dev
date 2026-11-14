# Newsletter maintenance

The newsletter is a dated editorial report, separate from the website release log. The archive is `/newsletter/`, issues have stable date-based URLs, and `/newsletter/feed.xml` provides an Atom subscription. The general site feed also includes issues. No email subscription or delivery service is configured.

## Sources and state

`data/newsletter.json` contains source-linked developments, issues and the publication threshold. Each development has a stable ID for the specific event, an event date, research/product classification, direct/adjacent relevance, original summaries and catalog links. A preprint, journal publication and substantial revision can be distinct events, but mirrored announcements and repeated discovery of the same event are not.

`data/newsletter-state.json` records the last completed check, pending development IDs and the last issue verified on production. Run `npm run newsletter:status` to inspect whether the pending batch meets the threshold. Never advance `lastDeployedIssue` merely because a build, commit or upload succeeded.

## Weekly procedure

1. Read the latest issue, pending queue, catalog snapshot, upstream catalog changes and project editorial standards. Check arXiv publication records, publisher pages, author repositories and official vendor release notes. Shared reports are discovery leads; verify their claims against primary sources.
2. Deduplicate by DOI, arXiv ID, aliases, release URL and event. Preserve discovery dates separately from publication and announcement dates. Check revisions for substantive changes. Do not count a new profile of an old paper as a new research result.
3. Add or correct bibliographic records in `sqpe-dev/catalog`, run its validation, publish the catalog change and pin the resulting commit with `npm run catalog:update -- <sha>`. Preserve stable IDs and original provenance. Publication-record review, full-paper review, code inspection and reproduction remain distinct.
4. Add verified developments to `items` and their IDs to `pendingItemIds`. Retain smaller batches between checks. Include dates, status (such as preprint or public preview), primary links, relevance and specific limitations. Attribute reported measurements; omit unverified numerical claims.
5. Publish when at least **three substantive developments**, including **one directly relevant development**, have accumulated since the last issue. Adjacent items alone cannot trigger publication. Previously covered events do not count again. Do not manufacture an issue to meet a weekly cadence. Older discoveries can be labeled background; they do not count toward the threshold.
6. Create one issue with the actual issue date, coverage bounds, introduction and selected item IDs. Cover the period since the previous issue, widening the start only when needed to include clearly dated late discoveries and explaining that choice. Put older context in `contextIds`. Keep published issue URLs and contents stable, apart from explicitly described factual corrections.
7. Run `npm run check`; inspect desktop and mobile layouts when presentation changes. The build validates dates, source URLs, catalog references, duplicate coverage and the publication threshold. Review the complete diff, including exports, before publishing.
8. Deploy the checked `dist/` to the existing `sqpe-dev` Cloudflare Worker using `wrangler.jsonc`, through authenticated Wrangler or the established dashboard workflow. Do not create an alternate site or change its audience. Verify the issue, archive, Atom feed and catalog version on `https://sqpe.dev`. Only then update `lastDeployedIssue` and remove covered pending IDs. If publication fails, retain the prepared issue and retry it before creating another one.
9. Persist the completed check date and queue. Stay quiet when nothing actionable changes. Report new publications, substantive corrections, verification failures or deployment blockers.

The weekly schedule runs in the existing project chat. It requires the desktop app and local project to be available, and production publication requires valid Cloudflare access. It is independent of the separate research-discovery task.

## Deployment recovery and verification

Publication is authorized as part of the weekly check; do not stop after preparing an issue or ask for a manual retry. Resolve any prepared, undeployed issue before researching another issue. Run `npm run check` before uploading and preserve unrelated work.

Try authenticated Wrangler with the existing `wrangler.jsonc`. If Wrangler is unauthenticated, use the established Cloudflare dashboard session through browser automation. Open the existing Worker at `https://dash.cloudflare.com/a0056c52ae92c5e1f260436604aa5669/workers/services/view/sqpe-dev/production`, complete ordinary sign-in with the existing account if available, and select **New deployment**. Upload the checked `dist/` folder. Confirm assets directory `/`, HTML handling `auto-trailing-slash` and not-found handling `404-page`, then deploy. This fallback successfully published the November 8 issue on November 14, 2026. Do not extract browser credentials, create temporary accounts, create another Worker, or change access controls. If interactive authentication requires the maintainer, report the exact blocker.

After deployment, run `npm run newsletter:verify -- YYYY-MM-DD` (defaults to the latest issue). It requires HTTP 200 and exact agreement with the checked build for the issue, archive, both feeds and catalog exports, and confirms the archive and feeds include the issue URL. A redirect, timeout, missing issue or content mismatch fails the command. Inspect the live issue in the browser as well. A successful dashboard upload alone is insufficient.

For transient upload or verification failures, retry up to twice within the same run, allowing a short propagation delay. Before uploading again, verify whether the first deployment actually succeeded. Do not repeatedly retry authentication or validation failures. Keep the prepared issue and pending IDs on failure; never advance `lastDeployedIssue`. On success, record the deployed issue, remove only its covered pending IDs, and commit and push the state update. Report any unresolved research verification, build, catalog synchronization, authentication, deployment, production verification or state-persistence failure with the affected issue, failed step and necessary recovery action. The next weekly run retries the prepared issue first.
