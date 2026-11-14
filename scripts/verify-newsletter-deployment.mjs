import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { newestIssues } from './newsletter.mjs';

const data = JSON.parse(await readFile('data/newsletter.json', 'utf8'));
const issueId = process.argv[2] ?? newestIssues(data)[0]?.id;
assert.ok(
  data.issues.some((issue) => issue.id === issueId),
  'Unknown newsletter issue',
);
assert.match(issueId, /^\d{4}-\d{2}-\d{2}$/);
const issuePath = `newsletter/${issueId}/`;
const targets = [
  [issuePath, `${issuePath}index.html`],
  ['newsletter/', 'newsletter/index.html'],
  ['newsletter/feed.xml', 'newsletter/feed.xml'],
  ['feed.xml', 'feed.xml'],
  ['catalog-version.json', 'catalog-version.json'],
  ['catalog.json', 'catalog.json'],
];
for (const [path, file] of targets) {
  const expected = await readFile(`dist/${file}`);
  if (path === 'newsletter/' || path.endsWith('.xml')) {
    assert.ok(expected.includes(Buffer.from(`/${issuePath}`)), `${file} omits issue`);
  }
  const response = await fetch(`https://sqpe.dev/${path}`, {
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  const actual = Buffer.from(await response.arrayBuffer());
  assert.ok(actual.equals(expected), `${path}: production differs from checked build`);
  console.log(`${path}: HTTP 200, matches checked build`);
}
console.log(`Verified newsletter ${issueId}. Deployment state was not modified.`);
