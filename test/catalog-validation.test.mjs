import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateCatalog } from '../scripts/validate-catalog.mjs';
import { citationHtml } from '../scripts/catalog-page.mjs';

const records = JSON.parse(await readFile('data/catalog.json', 'utf8'));
const inventory = JSON.parse(await readFile('data/reference-inventory.json', 'utf8'));

test('the pinned catalog meets the rendering contract', () => {
  assert.doesNotThrow(() => validateCatalog(records, inventory));
});

test('catalog validation rejects unsafe paths and executable source URLs', () => {
  for (const change of [
    (r) => {
      r.id = '../index';
    },
    (r) => {
      r.url = 'javascript:alert(1)';
    },
    (r) => {
      r.resources = [{ label: 'Code', url: 'data:text/html,test' }];
    },
  ]) {
    const copy = structuredClone(records);
    change(copy[0]);
    assert.throws(() => validateCatalog(copy, inventory));
  }
});

test('catalog validation rejects fabricated review dates and lost provenance', () => {
  const pending = structuredClone(records);
  pending.find((r) => r.reviewStatus === 'Metadata pending verification').verifiedDate =
    '2026-10-23';
  assert.throws(() => validateCatalog(pending, inventory), /cannot claim a review date/);
  const invalidDate = structuredClone(records);
  invalidDate[0].verifiedDate = '2026-02-30';
  assert.throws(() => validateCatalog(invalidDate, inventory), /invalid review date/);
  const incomplete = structuredClone(records);
  incomplete.find((r) => r.id === inventory[0].recordId).provenance = [];
  assert.throws(() => validateCatalog(incomplete, inventory), /Missing citation provenance/);
});

test('citation rendering escapes markup while retaining ordinary source links', () => {
  const escape = (s) =>
    s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  const rendered = citationHtml(
    '<script>alert(1)</script> [Paper](https://example.org/?q="test")',
    escape,
  );
  assert.ok(!rendered.includes('<script>'));
  assert.ok(rendered.includes('&lt;script&gt;'));
  assert.ok(rendered.includes('href="https://example.org/?q=&quot;test&quot;"'));
  assert.ok(!citationHtml('[bad](javascript:alert(1))', escape).includes('<a'));
});
