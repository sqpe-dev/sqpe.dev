import assert from 'node:assert/strict';

const text = (value) => assert.ok(typeof value === 'string' && value.trim());
const date = (value) => {
  assert.match(value, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(new Date(value).toISOString().slice(0, 10), value);
};
export function validateNewsletter(data, catalog) {
  const records = new Set(catalog.map((r) => r.id));
  const ids = new Set();
  for (const key of ['minimumUpdates', 'minimumDirectUpdates'])
    assert.ok(Number.isInteger(data.policy[key]) && data.policy[key] > 0);
  assert.ok(data.policy.minimumDirectUpdates <= data.policy.minimumUpdates);
  for (const item of data.items) {
    assert.match(item.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!ids.has(item.id), `Duplicate update: ${item.id}`);
    ids.add(item.id);
    date(item.date);
    for (const key of ['title', 'summary', 'implication']) text(item[key]);
    assert.ok(['Research', 'Product'].includes(item.kind));
    assert.ok(['direct', 'adjacent'].includes(item.scope));
    assert.ok(item.sources.length);
    for (const source of item.sources) {
      text(source.label);
      const url = new URL(source.url);
      assert.equal(url.protocol, 'https:');
      assert.ok(!url.username && !url.password);
    }
    for (const id of item.recordIds) assert.ok(records.has(id), `Unknown catalog record: ${id}`);
  }
  const issueIds = new Set(),
    covered = new Set();
  for (const issue of data.issues) {
    date(issue.id);
    assert.ok(!issueIds.has(issue.id), `Duplicate issue: ${issue.id}`);
    issueIds.add(issue.id);
    for (const key of ['date', 'windowStart', 'windowEnd']) date(issue[key]);
    assert.equal(issue.id, issue.date);
    assert.ok(issue.windowStart <= issue.windowEnd && issue.windowEnd <= issue.date);
    for (const key of ['title', 'summary', 'introduction']) text(issue[key]);
    assert.ok(issue.itemIds.length >= data.policy.minimumUpdates);
    const members = [...issue.itemIds, ...issue.contextIds];
    assert.equal(new Set(members).size, members.length);
    for (const id of members) assert.ok(ids.has(id), `Unknown update: ${id}`);
    for (const id of issue.itemIds) {
      assert.ok(!covered.has(id), `Update repeated in an issue: ${id}`);
      const item = data.items.find((i) => i.id === id);
      assert.ok(
        item.date >= issue.windowStart && item.date <= issue.windowEnd,
        `Outside issue window: ${id}`,
      );
    }
    for (const id of issue.contextIds)
      assert.ok(
        data.items.find((i) => i.id === id).date < issue.windowStart,
        `Context is not older: ${id}`,
      );
    assert.ok(
      issue.itemIds.filter((id) => data.items.find((i) => i.id === id).scope === 'direct').length >=
        data.policy.minimumDirectUpdates,
    );
    members.forEach((id) => covered.add(id));
  }
}

export function publicationDecision(data, pendingItemIds) {
  const covered = new Set(data.issues.flatMap((i) => [...i.itemIds, ...i.contextIds]));
  const candidates = [...new Set(pendingItemIds)]
    .map((id) => {
      const item = data.items.find((i) => i.id === id);
      assert.ok(item, `Unknown pending update: ${id}`);
      return item;
    })
    .filter((i) => !covered.has(i.id));
  return {
    candidates,
    ready:
      candidates.length >= data.policy.minimumUpdates &&
      candidates.filter((i) => i.scope === 'direct').length >= data.policy.minimumDirectUpdates,
  };
}

export const issuePath = (issue) => `/newsletter/${issue.id}/`;
export const newestIssues = (data) => [...data.issues].sort((a, b) => b.date.localeCompare(a.date));
export const displayDate = (date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date + 'T12:00:00Z'));

export function newsletterIndex(data, esc) {
  return `<div class="wrap newsletter-index"><div class="page-head"><span class="eyebrow">RESEARCH &amp; INDUSTRY</span><h1>SQPE newsletter</h1><p>Dated reports on semantic query processing research, systems and product developments.</p></div>
  <div class="newsletter-intro"><p>Sources are checked weekly. Issues appear when at least ${data.policy.minimumUpdates} substantive updates have accumulated, including at least ${data.policy.minimumDirectUpdates} directly relevant to semantic query processing. Each issue distinguishes new developments from older background reading.</p><a class="text-link" href="/newsletter/feed.xml">Subscribe via Atom →</a></div>
  <div class="newsletter-archive">${newestIssues(data)
    .map(
      (i) =>
        `<article class="newsletter-issue"><span class="eyebrow">${esc(displayDate(i.date))} · ${i.itemIds.length} updates</span><h2><a href="${issuePath(i)}">${esc(i.title)}</a></h2><p>${esc(i.summary)}</p><a class="text-link" href="${issuePath(i)}">Read issue →</a></article>`,
    )
    .join('')}</div></div>`;
}

export function newsletterIssue(issue, data, catalog, esc) {
  const renderItems = (ids) =>
    ids
      .map((id) => {
        const item = data.items.find((i) => i.id === id);
        return `<article class="newsletter-item" id="${item.id}"><div class="newsletter-item-meta"><span>${esc(item.kind)}${item.scope === 'adjacent' ? ' · Adjacent' : ''}</span><time datetime="${item.date}">${esc(displayDate(item.date))}</time></div><h3>${esc(item.title)}</h3><p>${esc(item.summary)}</p><p>${esc(item.implication)}</p><div class="newsletter-sources">${item.sources.map((s) => `<a href="${esc(s.url)}">${esc(s.label)} ↗</a>`).join('')}${item.recordIds
          .map((id) => {
            const r = catalog.find((r) => r.id === id);
            return `<a href="${r.profile ? `/research/${r.id}/` : `/catalog/#${r.id}`}">${esc(r.name)} ${r.profile ? 'profile' : 'record'} →</a>`;
          })
          .join('')}</div></article>`;
      })
      .join('');
  return `<div class="wrap"><div class="page-head newsletter-title"><a class="eyebrow" href="/newsletter/">SQPE NEWSLETTER</a><h1>${esc(issue.title)}</h1><p><time datetime="${issue.date}">${esc(displayDate(issue.date))}</time> · ${issue.itemIds.length} updates<br>Coverage: ${esc(displayDate(issue.windowStart))}–${esc(displayDate(issue.windowEnd))}</p></div><div class="article-layout"><aside class="toc"><a href="#research">Research</a><a href="#products">Products</a>${issue.contextIds.length ? '<a href="#background">Earlier work &amp; context</a>' : ''}<a href="/newsletter/feed.xml">Atom feed ↗</a></aside><div class="prose newsletter-body"><p class="newsletter-lead">${esc(issue.introduction)}</p><p class="caption">Research summaries are based on publication records and abstracts; product summaries are based on official announcements. Reported performance is attributed to the source. These checks do not constitute full-paper review, implementation inspection or independent reproduction.</p>${[
    ['Research', 'research', 'Research'],
    ['Product', 'products', 'Product developments'],
  ]
    .map(
      ([kind, id, title]) =>
        `<section id="${id}"><h2>${title}</h2>${renderItems(issue.itemIds.filter((id) => data.items.find((i) => i.id === id).kind === kind))}</section>`,
    )
    .join(
      '',
    )}${issue.contextIds.length ? `<section id="background"><h2>Earlier work &amp; context</h2><p>These sources extend the site’s coverage but precede this issue’s reporting window. They are not counted among its new developments.</p>${renderItems(issue.contextIds)}</section>` : ''}<p><a href="/newsletter/">All newsletter issues →</a></p></div></div></div>`;
}

export function newsletterFeed(data, esc) {
  const issues = newestIssues(data);
  return `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>SQPE newsletter</title><id>https://sqpe.dev/newsletter/</id><link href="https://sqpe.dev/newsletter/feed.xml" rel="self"/><link href="https://sqpe.dev/newsletter/"/><updated>${issues[0].date}T12:00:00Z</updated><author><name>sqpe.dev</name></author>${issues.map((i) => `<entry><id>https://sqpe.dev${issuePath(i)}</id><title>${esc(i.title)}</title><link href="https://sqpe.dev${issuePath(i)}"/><updated>${i.date}T12:00:00Z</updated><summary>${esc(i.summary)}</summary></entry>`).join('')}</feed>`;
}
