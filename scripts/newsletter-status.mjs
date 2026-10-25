import { readFile } from 'node:fs/promises';
import { validateNewsletter, publicationDecision, newestIssues } from './newsletter.mjs';
const data = JSON.parse(await readFile('data/newsletter.json'));
const state = JSON.parse(await readFile('data/newsletter-state.json'));
validateNewsletter(data, JSON.parse(await readFile('data/catalog.json')));
const result = publicationDecision(data, state.pendingItemIds);
console.log(
  JSON.stringify(
    {
      lastChecked: state.lastChecked,
      lastDeployedIssue: state.lastDeployedIssue,
      latestIssue: newestIssues(data)[0]?.id,
      ready: result.ready,
      pendingUpdates: result.candidates.map((i) => ({ id: i.id, date: i.date, title: i.title })),
    },
    null,
    2,
  ),
);
