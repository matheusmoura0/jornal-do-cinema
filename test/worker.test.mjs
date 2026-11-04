import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import {selectCinema, safeUrl} from '../src/site.mjs';

const item = {id:2333,title:'Cinema & cultura',author:'Rodrigo Fonseca',source_url:'https://www.correiodamanha.com.br/cultura/cinema/2026/09/filme.html',content:'Texto de cinema. '.repeat(30),image_url:'https://images.example.com/filme.jpg',image_credit:'Fotografia: Divulgação',published_at:'2026-09-20T12:00:00Z'};
const request = path => new Request(`https://jornaldocinema.com.br${path}`);
test('cinema selection does not repurpose unrelated stories', () => {
  assert.deepEqual(selectCinema([item,item,{id:2,title:'Economia',source_url:'https://www.cm.com.br/economia/noticia.html'}]),[item]);
  assert.equal(safeUrl('javascript:alert(1)'), '');
  assert.equal(safeUrl('https://user:password@example.com'), '');
});
test('public routes and rendering', async t => {
  const original = globalThis.fetch;
  t.after(() => {globalThis.fetch = original;});
  globalThis.fetch = async url => {
    assert.match(String(url),/by-domain\/articles\?domain=jornaldocinema.com.br$/);
    return Response.json([item,{id:999,title:'Not cinema',category:null}]);
  };
  await t.test('server renders content and verification without advertising scripts', async () => {
    const response = await worker.fetch(request('/'),{});
    const html = await response.text();
    assert.equal(response.status,200);
    assert.match(html,/Cinema &amp; cultura/);
    assert.match(html,/ca-pub-7037572686437222/);
    assert.match(html,/id="arquivo"/);
    assert.doesNotMatch(html,/adsbygoogle\.js|Not cinema/);
  });
  await t.test('syndicated article retains source, author and image credits', async () => {
    const response = await worker.fetch(request('/materia/2333'),{});
    const html = await response.text();
    assert.match(html,/Rodrigo Fonseca/);
    assert.match(html,/Fotografia: Divulgação/);
    assert.match(html,/Consultar a publicação original/);
    assert.match(html,/application\/ld\+json/);
    assert.match(response.headers.get('x-robots-tag'),/noindex/);
    assert.equal((await worker.fetch(request('/materia/999'),{})).status,404);
  });
  await t.test('search is escaped, empty selections not indexed', async () => {
    const response = await worker.fetch(request('/?q=%22%3E%3Cscript%3E'),{});
    const html = await response.text();
    assert.match(html,/&quot;&gt;&lt;script&gt;/);
    assert.doesNotMatch(html,/<script>/);
    assert.match(response.headers.get('x-robots-tag'),/noindex/);
  });
  await t.test('institutional pages, sitemap, ads.txt, redirects and errors', async () => {
    for (const path of ['/sobre','/contato','/privacidade','/cookies','/politica-editorial']) {
      const response = await worker.fetch(request(path),{});
      assert.equal(response.status,200);
      assert.match(await response.text(),/cmdev072@gmail.com/);
    }
    assert.equal((await worker.fetch(request('/missing'),{})).status,404);
    assert.equal((await worker.fetch(request('/constructor'),{})).status,404);
    const redirect = await worker.fetch(request('/materia.html?id=2333'),{});
    assert.equal(redirect.status,301);
    assert.equal(redirect.headers.get('location'),'https://jornaldocinema.com.br/materia/2333');
    assert.equal(await (await worker.fetch(request('/ads.txt'),{})).text(),'google.com, pub-7037572686437222, DIRECT, f08c47fec0942fa0\n');
    assert.doesNotMatch(await (await worker.fetch(request('/sitemap.xml'),{})).text(),/materia\/2333/);
    assert.match(await (await worker.fetch(request('/robots.txt'),{})).text(),/Sitemap:/);
  });
  await t.test('upstream failures return retryable errors, not fake successful pages', async () => {
    globalThis.fetch = async () => {throw new Error('offline');};
    const response = await worker.fetch(request('/'),{});
    assert.equal(response.status,503);
    assert.equal(response.headers.get('cache-control'),'no-store');
    assert.equal(response.headers.get('retry-after'),'120');
    assert.equal((await worker.fetch(request('/contato'),{})).status,200);
  });
});
