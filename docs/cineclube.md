# Cineclube and saved reading

Added on 6 November 2026 at the owner's request for richer content and entertainment.

## Public features

- `/cineclube`: eight multiple-choice questions, per-answer explanations, source references, final score and replay. No fake leaderboard, reward, daily-refresh promise or stored score.
- Twelve searchable film-language/festival definitions. Server-side GET search and answer disclosures remain available without JavaScript.
- Save/remove controls on source articles and guides. `/salvos` is a browser-local reading list, noindex and excluded from sitemap. No account or cross-device sync.
- The homepage includes a Cineclube entry point; navigation includes Cineclube and Salvos.

## Storage and safety

Only explicit save/remove actions write `jornal-cinema-reading-list-v1` in localStorage. Values contain article titles and same-site reading paths, up to 50 entries. They persist until removed or browser site data is cleared. No score, personal identifier or reading-list content is sent to a backend by this feature.

Stored data is validated on every read. Invalid/external paths are discarded and titles render through textContent, not innerHTML. Storage refusal, malformed JSON and write failures are handled. No advertising or analytics added. Cookies and privacy disclosures updated.

## Sources and editing

Question and glossary data are in `content/cineclube.json`. Every question has one answer index, an explanation and a primary reference. Source text is summarized, not reproduced as an article. References: Yale Film Analysis (cinematography, editing, sound) and official Festival de Cannes submission guidance. No new reporting, interviews, biographies or film recommendations are fabricated.

## VPS-only validation

- `npm test`: SSR content completeness, valid answer keys, source URLs, escaping, glossary search and private saved route, alongside existing regression coverage.
- `scripts/check-engagement-vps.cjs`: full quiz/replay, correct/wrong answers, accent-insensitive filtering, save/reload/remove, blocked storage, no-JavaScript fallback and screenshots at 1440, 768, 390 and 320 pixels.
- `scripts/check-vps.cjs`: original news, images, article/guide layout, navigation and search regression checks.

No AdSense account changes or additional review request is required or performed by these features.
