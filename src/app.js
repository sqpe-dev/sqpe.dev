const menu = document.querySelector('.menu-toggle');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  document.querySelector('.nav').classList.toggle('open', open);
});
const catalog = document.querySelector('[data-catalog]');
if (catalog) {
  const input = document.querySelector('#search'),
    year = document.querySelector('#year'),
    sort = document.querySelector('#sort'),
    chips = [...document.querySelectorAll('[data-filter]')],
    grid = document.querySelector('.catalog'),
    cards = [...grid.children];
  const extraFilters = [...document.querySelectorAll('[data-extra-filter]')];
  let category = 'All';
  const params = new URLSearchParams(location.search);
  input.value = params.get('q') || '';
  extraFilters.forEach((f) => {
    if ([...f.options].some((o) => o.value === params.get(f.dataset.extraFilter)))
      f.value = params.get(f.dataset.extraFilter);
  });
  if ([...year.options].some((o) => o.value === params.get('year')))
    year.value = params.get('year');
  if ([...sort.options].some((o) => o.value === params.get('sort')))
    sort.value = params.get('sort');
  if (chips.some((c) => c.dataset.filter === params.get('category')))
    category = params.get('category');
  function filter(updateUrl = true) {
    const term = input.value.trim().toLowerCase();
    let count = 0;
    const ordered = [...cards].sort((a, b) =>
      sort.value === 'newest'
        ? (Number(b.dataset.year) || 0) - (Number(a.dataset.year) || 0)
        : sort.value === 'name'
          ? a.querySelector('h2').textContent.localeCompare(b.querySelector('h2').textContent)
          : cards.indexOf(a) - cards.indexOf(b),
    );
    for (const card of ordered) {
      card.hidden = !(
        card.dataset.search.includes(term) &&
        (year.value === 'all' || card.dataset.year === year.value) &&
        (category === 'All' || card.dataset.category === category) &&
        extraFilters.every(
          (f) => f.value === 'all' || card.dataset[f.dataset.extraFilter] === f.value,
        )
      );
      if (!card.hidden) count++;
      grid.append(card);
    }
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === category)));
    document.querySelector('#result-count').textContent =
      `${count} ${count === 1 ? 'record' : 'records'}`;
    document.querySelector('.empty').hidden = count !== 0;
    if (updateUrl) {
      const p = new URLSearchParams();
      if (input.value.trim()) p.set('q', input.value.trim());
      if (year.value !== 'all') p.set('year', year.value);
      if (category !== 'All') p.set('category', category);
      if (sort.value !== 'editorial') p.set('sort', sort.value);
      extraFilters.forEach((f) => {
        if (f.value !== 'all') p.set(f.dataset.extraFilter, f.value);
      });
      history.replaceState(null, '', location.pathname + (p.size ? '?' + p : '') + location.hash);
    }
  }
  extraFilters.forEach((f) => f.addEventListener('change', () => filter()));
  input.addEventListener('input', () => filter());
  year.addEventListener('change', () => filter());
  sort.addEventListener('change', () => filter());
  chips.forEach((c) =>
    c.addEventListener('click', () => {
      category = c.dataset.filter;
      filter();
    }),
  );
  document.querySelector('#reset')?.addEventListener('click', () => {
    input.value = '';
    year.value = 'all';
    sort.value = 'editorial';
    category = 'All';
    extraFilters.forEach((f) => (f.value = 'all'));
    filter();
    input.focus();
  });
  filter(false);
  const selected = new Set(),
    checks = [...document.querySelectorAll('[data-compare]')],
    bar = document.querySelector('.compare-bar'),
    comparison = document.querySelector('#comparison');
  let data;
  function updateComparison() {
    if (!bar) return;
    bar.hidden = !selected.size;
    document.querySelector('#compare-status').textContent =
      `${selected.size} of 3 selected${selected.size === 3 ? ' · limit reached' : ''}`;
    checks.forEach((c) => {
      c.checked = selected.has(c.dataset.compare);
      c.disabled = selected.size >= 3 && !c.checked;
    });
    comparison.hidden = true;
  }
  checks.forEach((c) =>
    c.addEventListener('change', () => {
      if (c.checked && selected.size < 3) selected.add(c.dataset.compare);
      else selected.delete(c.dataset.compare);
      updateComparison();
    }),
  );
  document.querySelector('#clear-compare')?.addEventListener('click', () => {
    selected.clear();
    updateComparison();
  });
  document.querySelector('#show-compare')?.addEventListener('click', async () => {
    const button = document.querySelector('#show-compare');
    button.disabled = true;
    try {
      if (!data) {
        const response = await fetch('/profiles.json');
        if (!response.ok) throw new Error('Catalog unavailable');
        data = await response.json();
      }
      const rows = data.filter((r) => selected.has(r.id));
      const table = document.createElement('table'),
        thead = table.createTHead(),
        heading = thead.insertRow();
      for (const text of ['Documented approach', ...rows.map((r) => r.name)]) {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = text;
        heading.append(th);
      }
      const body = table.createTBody();
      for (const [key, label] of [
        ['category', 'Type'],
        ['interface', 'Interface / focus'],
        ['summary', 'Approach'],
        ['caveat', 'Limitations'],
        ['evidence', 'Evidence'],
        ['verifiedDate', 'Last checked'],
        ['url', 'Primary source'],
      ]) {
        const tr = body.insertRow();
        const th = document.createElement('th');
        th.scope = 'row';
        th.textContent = label;
        tr.append(th);
        for (const record of rows) {
          const td = tr.insertCell();
          if (key === 'url') {
            const a = document.createElement('a');
            a.href = record.url;
            a.textContent = 'Open source ↗';
            td.append(a);
          } else td.textContent = record[key];
        }
      }
      document.querySelector('#comparison-table').replaceChildren(table);
      comparison.hidden = false;
      comparison.focus();
      comparison.scrollIntoView({
        block: 'start',
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    } catch {
      document.querySelector('#compare-status').textContent =
        'Could not load comparison data. Please try again.';
    } finally {
      button.disabled = false;
    }
  });
}
