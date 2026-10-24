# Design and information architecture

The site's core task is helping readers move from an unfamiliar idea to a credible source.

## Routes

- `/`: orientation, query-plan illustration, reading paths, editorial promise.
- `/learn/`: working definition, six operator concepts, architecture, trade-offs, reading sequence.
- `/systems/`: research and commercial profiles, filters, comparison of documented approaches.
- `/research/`: searchable paper library.
- `/research/:id/`: contribution, caveat, source type, review date, direct primary source.
- `/benchmarks/`: evaluation studies and a comparison protocol; no unsupported leaderboard.
- `/about/`: evidence standards, scope, contributor disclosure, privacy and corrections.
- `/updates/`: dated release history.

## Visual system

Dark blue ink #253448; warm paper #faf9f6; primary #2d4059; neutral highlight #edf0f3. Georgia headlines create an editorial tone; native sans-serif body avoids font downloads. A compact monospaced layer distinguishes metadata. Fine borders and generous whitespace create hierarchy without decorative imagery.

Responsive cards collapse from three columns to two to one. Mobile navigation uses an explicit menu. Native labels, keyboard focus indicators, a skip link, live result counts, semantic headings, reduced-motion handling and horizontally scrollable comparison tables are part of the base design. No client JavaScript is required to read the content or follow sources.

## Implementation rationale

Static HTML keeps the first release fast, indexable, portable and inexpensive. The generator has no third-party dependencies. JavaScript adds browser-local search/filter/sort and comparison; it sends no query to a model or analytics service. A structured catalog can later support richer bibliographic metadata and reproduced experiments without rebuilding the information architecture.

## Next editorial milestones

Extend verified coverage beyond the initial selection; add full-paper reviews and runnable examples; add authors, versions and venues only after verification; produce benchmark reports under a common protocol. Do not promote proposed work to completed features.
