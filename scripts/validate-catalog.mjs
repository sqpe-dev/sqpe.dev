import assert from 'node:assert/strict';

const reviewStatuses = new Set([
  'Metadata pending verification',
  'Publication record checked',
  'Documentation checked',
  'Full paper reviewed',
]);

function requireText(value, field) {
  assert.ok(typeof value === 'string' && value.trim(), `${field}: expected nonempty text`);
}

function requireSourceUrl(value, field) {
  requireText(value, field);
  const url = new URL(value);
  assert.equal(url.protocol, 'https:', `${field}: expected HTTPS source`);
  assert.ok(!url.username && !url.password, `${field}: credentials are not permitted`);
}

/** Validate the fields consumed by the website before updating or rendering a snapshot. */
export function validateCatalog(records, inventory) {
  assert.ok(Array.isArray(records) && records.length, 'Expected a nonempty catalog');
  assert.ok(Array.isArray(inventory), 'Expected a reference inventory');
  const ids = new Set();

  for (const record of records) {
    requireText(record.id, 'id');
    assert.match(record.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Unsafe record ID');
    assert.ok(!ids.has(record.id), `Duplicate record ID: ${record.id}`);
    ids.add(record.id);
    for (const field of ['title', 'name', 'category', 'sourceType', 'relevance', 'evidence']) {
      requireText(record[field], `${record.id}.${field}`);
    }
    assert.ok(reviewStatuses.has(record.reviewStatus), `${record.id}: unknown review status`);
    assert.equal(typeof record.profile, 'boolean', `${record.id}: missing profile flag`);
    assert.ok(
      record.year === null ||
        (Number.isInteger(record.year) && record.year >= 1900 && record.year <= 2100),
      `${record.id}: invalid year`,
    );
    assert.ok(Array.isArray(record.tags), `${record.id}: missing tags`);
    for (const tag of record.tags) requireText(tag, `${record.id}.tags`);
    assert.ok(Array.isArray(record.aliases), `${record.id}: missing aliases`);
    if (record.url !== null) requireSourceUrl(record.url, `${record.id}.url`);
    for (const alias of record.aliases) requireSourceUrl(alias, `${record.id}.aliases`);
    for (const resource of record.resources || []) {
      requireText(resource.label, `${record.id}.resources.label`);
      requireSourceUrl(resource.url, `${record.id}.resources.url`);
    }
    assert.ok(Array.isArray(record.provenance), `${record.id}: missing provenance`);
    for (const reference of record.provenance)
      requireText(reference.citation, `${record.id}.provenance`);

    if (record.reviewStatus === 'Metadata pending verification') {
      assert.equal(
        record.verifiedDate,
        null,
        `${record.id}: pending record cannot claim a review date`,
      );
    } else {
      assert.match(
        record.verifiedDate || '',
        /^\d{4}-\d{2}-\d{2}$/,
        `${record.id}: missing review date`,
      );
      const date = new Date(record.verifiedDate);
      assert.ok(
        !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === record.verifiedDate,
        `${record.id}: invalid review date`,
      );
      requireSourceUrl(record.url, `${record.id}.url`);
    }
    if (record.reviewStatus === 'Full paper reviewed')
      requireText(record.reviewReport, `${record.id}.reviewReport`);
    if (record.profile) {
      for (const field of ['summary', 'interface', 'caveat'])
        requireText(record[field], `${record.id}.${field}`);
      assert.ok(record.tags.length, `${record.id}: profile needs at least one topic tag`);
    }
  }
  for (const reference of inventory) {
    const record = records.find((item) => item.id === reference.recordId);
    assert.ok(record, `Unresolved inventory entry: ${reference.recordId}`);
    assert.ok(
      record.provenance.some(
        (item) => item.line === reference.line && item.citation === reference.citation,
      ),
      `Missing citation provenance: ${reference.recordId}`,
    );
  }
}
