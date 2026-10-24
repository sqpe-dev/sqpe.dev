import { bibtexEntry } from './bibtex.mjs';

// Render imported citation links without interpreting arbitrary HTML.
export function citationHtml(text, esc) {
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let html = '',
    last = 0;
  for (const match of text.matchAll(pattern)) {
    html += esc(text.slice(last, match.index));
    html += /* HTML */ `<a href="${esc(match[2])}">${esc(match[1])}</a>`;
    last = match.index + match[0].length;
  }
  return html + esc(text.slice(last));
}
export function catalogPage({ bibliography, repo, catalogLock, esc, correctionLink, linkRecord }) {
  const pending = bibliography.filter(
    (r) => r.reviewStatus === 'Metadata pending verification',
  ).length;
  const options = (values) =>
    [...new Set(values.filter(Boolean))]
      .sort()
      .map((v) => /* HTML */ `<option>${esc(v)}</option>`)
      .join('');
  const metadata = (r) => {
    const citation = r.provenance[0]?.citation;
    if (!citation) return '';
    // Keep the imported author/venue text intact; the title is already above it.
    const tail = citation.startsWith('[')
      ? citation.replace(/^\[[^\]]+\]\(https?:\/\/[^)]+\)\.?\s*/, '')
      : citation.startsWith(r.title)
        ? citation.slice(r.title.length).replace(/^\.\s*/, '')
        : '';
    return tail ? /* HTML */ `<p class="citation-line">${citationHtml(tail, esc)}</p>` : '';
  };
  return /* HTML */ `<div class="wrap catalog-page">
    <section class="catalog-intro">
      <div>
        <span class="eyebrow">THE SQPE BIBLIOGRAPHY</span>
        <h1>Open catalog<span>.</span></h1>
        <p>
          Research, systems, and the methods behind semantic query processing. Browse the
          literature, follow the evidence, and contribute a source.
        </p>
        <div class="actions">
          <a class="btn" href="${repo}/issues/new?template=source.yml"
            >Suggest a source <span aria-hidden="true">↗</span></a
          ><a class="text-link" href="${repo}">Explore the repository ↗</a>
        </div>
      </div>
      <aside class="catalog-overview" aria-label="Collection overview">
        <div><strong>${bibliography.length}</strong><span>sources in the collection</span></div>
        <dl>
          <div>
            <dt>With editorial profiles</dt>
            <dd>${bibliography.filter((r) => r.profile).length}</dd>
          </div>
          <div>
            <dt>Awaiting metadata verification</dt>
            <dd>${pending}</dd>
          </div>
        </dl>
        <p>
          Version <a href="${repo}/tree/${catalogLock.commit}">${catalogLock.commit.slice(0, 12)}</a
          ><br /><a href="${repo}/commits/main/">View change history →</a>
        </p>
      </aside>
    </section>
    <section data-catalog aria-label="Browse the bibliography">
      <div class="catalog-controls">
        <div class="catalog-search-row">
          <label class="search-wrap"
            ><span class="sr-only">Search bibliography</span
            ><svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 5 5" /></svg
            ><input
              id="search"
              type="search"
              placeholder="Search titles, authors, or ideas…" /></label
          ><label class="sort-label"
            >Sort by<select id="sort">
              <option value="editorial">Catalog order</option>
              <option value="newest">Newest first</option>
              <option value="name">Title A–Z</option>
            </select></label
          >
        </div>
        <div class="catalog-filters">
          <label
            >Year<select id="year">
              <option value="all">All years</option>
              ${options(bibliography.map((r) => r.year))}
              <option value="unknown">Year unresolved</option>
            </select></label
          ><label
            >Source type<select data-extra-filter="type">
              <option value="all">All types</option>
              ${options(bibliography.map((r) => r.sourceType))}
            </select></label
          ><label
            >Review status<select data-extra-filter="status">
              <option value="all">All review statuses</option>
              ${options(bibliography.map((r) => r.reviewStatus))}
            </select></label
          ><label
            >Relevance<select data-extra-filter="relevance">
              <option value="all">All relevance levels</option>
              ${options(bibliography.map((r) => r.relevance))}
            </select></label
          >
        </div>
        <div class="catalog-filter-footer">
          <a href="/catalog/?status=Metadata+pending+verification"
            >Browse the verification queue →</a
          ><button id="reset" type="button">Clear filters</button>
        </div>
      </div>
      <div class="catalog-results">
        <span id="result-count" role="status" aria-live="polite"
          >${bibliography.length} records</span
        >
        <div class="catalog-downloads">
          <span>Download collection</span><a href="/catalog.bib" download>BibTeX ↓</a
          ><a href="/catalog.csv" download>CSV ↓</a><a href="/catalog.json" download>JSON ↓</a>
        </div>
      </div>
      <div class="catalog bibliography">
        ${bibliography
          .map(
            (r) =>
              /* HTML */ `<article
                id="${r.id}"
                class="bibliography-record"
                data-record="${r.id}"
                data-category="${esc(r.category)}"
                data-year="${r.year || 'unknown'}"
                data-type="${esc(r.sourceType)}"
                data-status="${esc(r.reviewStatus)}"
                data-relevance="${esc(r.relevance)}"
                data-search="${esc([r.title, r.name, ...r.tags, ...r.provenance.map((p) => p.citation)].join(' ').toLowerCase())}"
              >
                <div class="bibliography-year">${r.year || 'Undated'}</div>
                <div class="bibliography-body">
                  <div class="bibliography-type">
                    ${esc(r.sourceType)}${r.resourceName ? ' · ' + esc(r.resourceName) : ''}
                  </div>
                  <h2>
                    ${r.url ? /* HTML */ `<a href="${esc(r.url)}">${esc(r.title)}</a>` : esc(r.title)}
                  </h2>
                  ${metadata(r)}${r.summary ? /* HTML */ `<p class="bibliography-summary">${esc(r.summary)}</p>` : ''}${!r.url ? '<p class="source-unresolved">Primary source link awaiting verification.</p>' : ''}
                  <div class="bibliography-links">
                    ${r.url ? /* HTML */ `<a href="${esc(r.url)}">View source ↗</a>` : ''}${r.profile ? /* HTML */ `<a href="${linkRecord(r)}">Read profile →</a>` : ''}<a
                      href="/catalog/#${r.id}"
                      >Permalink</a
                    ><button
                      type="button"
                      data-copy-bibtex="${esc(bibtexEntry(r, catalogLock.commit))}"
                      aria-label="Copy BibTeX for ${esc(r.title)}"
                      hidden
                    >
                      Copy BibTeX</button
                    ><a href="${esc(correctionLink(r))}">Suggest a correction</a>
                  </div>
                  <div class="bibtex-feedback" hidden>
                    <p role="status" aria-live="polite"></p>
                    <label hidden>
                      BibTeX entry
                      <textarea readonly rows="8" spellcheck="false"></textarea>
                    </label>
                  </div>
                  ${
                    r.provenance.length
                      ? /* HTML */ `<details class="citation-details">
                          <summary>
                            Citation history
                            <span
                              >${r.provenance.length > 1 ? r.provenance.length + ' references' : 'Original reference'}</span
                            >
                          </summary>
                          <div class="citation-history">
                            ${r.provenance
                              .map(
                                (p) =>
                                  /* HTML */ `<div>
                                    <p>${citationHtml(p.citation, esc)}</p>
                                    <small
                                      >${esc(p.section || 'Research input')}${p.line ? ' · line ' + p.line : ''}</small
                                    >
                                  </div>`,
                              )
                              .join('')}
                            <p class="citation-note">
                              Transcribed from the research input. Retained for provenance; imported
                              metadata may require correction.
                            </p>
                          </div>
                        </details>`
                      : ''
                  }
                </div>
                <aside class="bibliography-evidence">
                  <span
                    class="review-label ${r.reviewStatus === 'Metadata pending verification' ? 'review-pending' : ''}"
                    >${r.reviewStatus === 'Metadata pending verification' ? 'Awaiting verification' : esc(r.reviewStatus)}</span
                  >
                  <p>${esc(r.relevance)}</p>
                  ${r.verifiedDate ? /* HTML */ `<small>Checked ${esc(r.verifiedDate)}</small>` : ''}
                </aside>
              </article>`,
          )
          .join('')}
      </div>
      <div class="empty" hidden>
        <h3>No matching records.</h3>
        <p>Try a broader search or clear the filters above.</p>
      </div>
    </section>
    <section class="catalog-colophon">
      <div>
        <span class="eyebrow">READING THE CATALOG</span>
        <h2>Scope and evidence</h2>
        <p>
          This collection accounts for the maintained bibliography, including related methods and
          references awaiting verification. Inclusion is not endorsement. Publication-record review,
          full-paper review, implementation inspection, and reproduction are distinct.
        </p>
        <a href="/about/">Read the evidence policy →</a>
      </div>
      <div>
        <span class="eyebrow">A SHARED REFERENCE</span>
        <h2>Contribute and reuse</h2>
        <p>
          Suggest a primary source and explain its relevance, or propose a correction to any record.
          Original editorial content and dataset organization are available under CC BY 4.0. Linked
          publications retain their own rights.
        </p>
        <a href="${repo}/blob/main/CONTRIBUTING.md">Contribution guide ↗</a
        ><a href="${repo}/blob/main/README.md">Reuse terms ↗</a
        ><a href="/reference-inventory.json">Reference reconciliation ↓</a>
      </div>
    </section>
  </div>`;
}
