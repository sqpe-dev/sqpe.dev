const bibEscape = (s) =>
  String(s)
    .replace(/[\\{}%&#_$]/g, (c) => '\\' + c)
    .replaceAll('~', '\\textasciitilde{}')
    .replaceAll('^', '\\textasciicircum{}');

export function bibtexEntry(r, commit) {
  return (
    '@misc{' +
    r.id +
    ',\n  title = {' +
    bibEscape(r.title) +
    '},' +
    (r.year ? '\n  year = {' + r.year + '},' : '') +
    (r.url ? '\n  url = {' + bibEscape(r.url) + '},' : '') +
    '\n  note = {' +
    bibEscape(r.reviewStatus + '; SQPE catalog ' + commit.slice(0, 12)) +
    '}\n}'
  );
}
