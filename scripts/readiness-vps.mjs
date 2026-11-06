import assert from 'node:assert/strict';
import {writeFile, mkdir} from 'node:fs/promises';
import {ORIGIN, PUBLISHER, selectCinema, safeUrl} from '../src/site.mjs';
import {guides} from '../src/guides.mjs';

// Run on the VPS. This report checks public responses, not editorial quality or account eligibility.
const checks = [];
async function check(name, fn) {
  try {await fn();checks.push({name,status:'pass'});}
  catch (error) {checks.push({name,status:'fail',detail:error.message});}
}
async function get(path) {
  return fetch(`${ORIGIN}${path}`,{signal:AbortSignal.timeout(15000)});
}
for (const path of ['/','/sobre','/contato','/politica-editorial','/privacidade','/cookies','/guias',...guides.map(guide => `/guias/${guide.slug}`)]) {
  await check(`Public page ${path}`,async () => {
    const response = await get(path);
    assert.equal(response.status,200);
    const html = await response.text();
    assert.ok(html.includes(PUBLISHER),'Publisher verification missing');
    assert.match(html,/cmdev072@gmail.com/);
    assert.doesNotMatch(html,/adsbygoogle\.js|googletagmanager\.com/,'Ads or analytics unexpectedly active');
  });
}
await check('ads.txt direct seller',async () => {
  const response = await get('/ads.txt');
  assert.equal(response.status,200);
  assert.equal((await response.text()).trim(),'google.com, pub-7037572686437222, DIRECT, f08c47fec0942fa0');
});
await check('robots and sitemap accessible',async () => {
  const robots = await get('/robots.txt');
  assert.equal(robots.status,200);
  assert.ok((await robots.text()).includes(`${ORIGIN}/sitemap.xml`));
  const sitemap = await get('/sitemap.xml');
  assert.equal(sitemap.status,200);
  assert.match(await sitemap.text(),/<urlset/);
});
await check('Unknown URLs return 404',async () => {
  assert.equal((await get('/verificacao-pagina-inexistente')).status,404);
});
let inventory = null;
await check('Inventory from publication-specific Hub feed',async () => {
  const response = await fetch('https://hub.cm.com.br/api/v1/sites/by-domain/articles?domain=jornaldocinema.com.br',{signal:AbortSignal.timeout(15000)});
  assert.equal(response.status,200);
  const raw = await response.json();
  assert.ok(Array.isArray(raw));
  const items = selectCinema(raw);
  inventory = {
    feedRecords:raw.length,
    cinemaRecords:items.length,
    originalCanonicalRecords:items.filter(item => safeUrl(item.canonical_url) === `${ORIGIN}/materia/${item.id}`).length,
    articles:items.map(item => ({id:item.id,title:item.title,source:item.source_url,author:item.author || null,imageCredit:item.image_credit || null,imageRightsConfirmed:item.image_rights_confirmed === true}))
  };
});
const report = {
  checkedAt:new Date().toISOString(),site:ORIGIN,checks,inventory,publishedGuides:guides.map(guide => ({title:guide.title,url:`${ORIGIN}/guias/${guide.slug}`})),
  technicalChecksPassed:checks.every(check => check.status === 'pass'),
  submissionReady:false,
  pendingManualReview:[
    'Evaluate the full site editorial value; three approved guides do not guarantee AdSense eligibility.',
    'Confirm actual publisher identity and institutional/privacy disclosures.',
    'Confirm rights for republished articles and images, regardless of feed flags.',
    'Configure certified consent management where required before advertising activation.',
    'Check site ownership and account setup inside AdSense; no review submitted by this script.'
  ]
};
await mkdir('review-output',{recursive:true});
await writeFile('review-output/readiness.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if (!report.technicalChecksPassed) process.exitCode=1;
