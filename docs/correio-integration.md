# Correio cinema integration

Requested by the owner on 6 November 2026. AdSense submission paused; no account settings changed.

- Read only Correio's public cinema Atom feed and section page. No Hub backend or data changes.
- Keep the site-specific Hub feed as an additional source/fallback. Deduplicate by source path and order by publication date.
- Current source index is cached for five minutes through Cloudflare fetch caching. No scheduled job, credentials or new infrastructure.
- Stable `/correio/YYYY/MM/id-slug` links read the original public article independently of feed membership. Only official Correio HTTPS hosts and cinema paths are accepted.
- Read article body, author, publication date, photograph and actual image credit; never import source scripts, ad tags, forms or navigation.
- `content/correio-edits.json` holds deliberate headline/deck adjustments. Body reporting, quotes and source bylines are preserved. Automatic rewriting is not enabled.
- Imported stories remain credited republications and noindex; minor edits do not establish original-content eligibility for AdSense.
- AI production mentions were removed from public guide bylines and About at the owner's request. Internal revision history is preserved. The public byline is now `Jornal do Cinema — revisão editorial: Matheus Moura`.
- News leads the homepage; guides follow the news archive. The public source may publish legitimate articles without a photograph; do not substitute unrelated imagery.

VPS-only tests cover URL restrictions, actual Atom data, text and photo-credit extraction, stable story links, escaping, attribution and guide output. Validate desktop/mobile and the deployed Cloudflare Worker before calling deployment complete.
