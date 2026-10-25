import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateNewsletter, publicationDecision } from '../scripts/newsletter.mjs';
const data = JSON.parse(await readFile('data/newsletter.json'));
const catalog = JSON.parse(await readFile('data/catalog.json'));

test('newsletter dates, sources, catalog links and publication thresholds are valid', () => {
  validateNewsletter(data, catalog);
  const duplicate = structuredClone(data);
  duplicate.issues[0].itemIds.push(duplicate.issues[0].itemIds[0]);
  assert.throws(() => validateNewsletter(duplicate, catalog));
  const outside = structuredClone(data);
  outside.items.find((i) => i.id === outside.issues[0].itemIds[0]).date = '2025-01-01';
  assert.throws(() => validateNewsletter(outside, catalog), /Outside issue window/);
  const unsafe = structuredClone(data);
  unsafe.items[0].sources[0].url = 'javascript:alert(1)';
  assert.throws(() => validateNewsletter(unsafe, catalog));
});

test('weekly publication carries small batches forward and excludes previously covered items', () => {
  const next = structuredClone(data);
  const base = next.items[0];
  for (let n = 1; n <= 3; n++)
    next.items.push({ ...base, id: `new-${n}`, scope: n === 3 ? 'direct' : 'adjacent' });
  assert.equal(publicationDecision(next, ['new-1', 'new-2']).ready, false);
  assert.equal(publicationDecision(next, ['new-1', 'new-1', 'new-2']).ready, false);
  assert.equal(publicationDecision(next, ['new-1', 'new-2', data.items[0].id]).ready, false);
  assert.equal(publicationDecision(next, ['new-1', 'new-2', 'new-3']).ready, true);
  next.items.find((i) => i.id === 'new-3').scope = 'adjacent';
  assert.equal(publicationDecision(next, ['new-1', 'new-2', 'new-3']).ready, false);
  assert.throws(() => publicationDecision(next, ['unknown']), /Unknown pending update/);
});

test('issues appear in the archive, homepage, feeds, sitemap and exports', async () => {
  const archive = await readFile('dist/newsletter/index.html', 'utf8');
  const home = await readFile('dist/index.html', 'utf8');
  const feed = await readFile('dist/newsletter/feed.xml', 'utf8');
  const siteFeed = await readFile('dist/feed.xml', 'utf8');
  const sitemap = await readFile('dist/sitemap.xml', 'utf8');
  assert.deepEqual(JSON.parse(await readFile('dist/newsletter.json')), data);
  assert.equal([...feed.matchAll(/<entry>/g)].length, data.issues.length);
  for (const issue of data.issues) {
    const path = `/newsletter/${issue.id}/`;
    for (const output of [archive, feed, siteFeed, sitemap]) assert.ok(output.includes(path));
    const page = await readFile(`dist${path}index.html`, 'utf8');
    for (const id of [...issue.itemIds, ...issue.contextIds])
      assert.ok(page.includes(`id="${id}"`));
    assert.ok(page.includes('aria-current="page">Newsletter'));
  }
  assert.ok(home.includes(`/newsletter/${data.issues.at(-1).id}/`));
  assert.ok(home.includes(`<strong>${catalog.length}</strong><span>catalog sources</span>`));
});
