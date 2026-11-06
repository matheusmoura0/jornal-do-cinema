# Homepage layout refresh

6 November 2026. Scope: existing Jornal do Cinema layout only; content ownership, source integration and AdSense settings unchanged.

Changes:

- White background, charcoal text, red masthead and stronger story typography.
- Lead story and two photo-led secondary stories; text-only stories appear in the edition briefs instead of empty image slots.
- Feature stories are selected only from the first pagination slice. Featured stories are not repeated in the archive, and later pages retain every remaining story.
- Original publication dates and the lead byline are visible; no claim that the edition order reflects readership rankings.
- Lead image is eagerly loaded with high priority. Other photos remain lazy-loaded.
- Compact mobile news rows, visible search, mobile navigation and a separate guide section.
- Desktop/tablet/mobile, source articles, guides, privacy and no-JavaScript search checked in VPS containers, never locally.

Automated layout regression test covers unique story links across pages, photo prioritization and lead image priority. Visual capture and overflow/image checks cover 1440, 768, 390 and 320 pixel widths through `scripts/check-vps.cjs`.
