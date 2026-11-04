# Jornal do Cinema

Cloudflare Worker for https://jornaldocinema.com.br. HTML is rendered on the server from the Hub's site-specific feed. Static assets are built into `public/`; the old Vercel files are not deployed by this configuration.

## Validation and deployment

Run dependencies, tests and builds on the VPS only, not locally:

```sh
npm install
npm test
npm run build
npx wrangler deploy --dry-run
```

Cloudflare production deployment must use `npx wrangler deploy`, with this repository's `wrangler.jsonc`. Do not pass `--assets .`, which would expose source files. Preserve the existing `jornal-do-cinema` Worker and its domain bindings. Validate the deployment and keep the previous version available for rollback.

`scripts/preview-vps.mjs` is an isolated VPS-only preview adapter, not the production server.

## Editorial and AdSense status

See [readiness checklist](docs/adsense-readiness.md). Verification metadata and ads.txt do not activate ads or guarantee approval.
