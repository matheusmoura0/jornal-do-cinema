import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sourceUrl,parseEdition,parseArticle} from '../src/correio.mjs';
import worker from '../src/worker.mjs';

const url = 'https://www.cm.com.br/cultura/cinema/2026/11/332622-entre-areias-e-telas-do-marrocos.html';
const html = `<meta name="author" content="Rodrigo Fonseca"><meta property="article:published_time" content="2026-11-06T01:00:00-03:00"><h1 class="cm-article-title">Entre areias e telasdo Marrocos</h1><figure class="cm-article-media"><img src="https://www.cm.com.br/foto.jpg"><figcaption><span class="cm-article-media-caption-credit">Crédito: Divulgação</span></figcaption></figure><div class="cm-article-body"><p>Primeiro parágrafo.<br>Outra linha.</p><script>notArticle()</script><p>Segundo parágrafo.</p></div><aside>Not part of story</aside>`;
test('source URLs only allow cinema articles on official HTTPS hosts', () => {
  assert.equal(sourceUrl(url),url);
  for (const value of ['http://www.cm.com.br/cultura/cinema/2026/11/1-title.html','https://evil.com/cultura/cinema/2026/11/1-title.html','https://www.cm.com.br/economia/2026/11/1-title.html','https://user:pass@www.cm.com.br/cultura/cinema/2026/11/1-title.html']) assert.equal(sourceUrl(value),'');
});
test('real feed parsing, thumbnail joins, dates and stable links',async () => {
  const xml = await readFile(new URL('./fixtures/correio-cinema.xml',import.meta.url),'utf8');
  const list = parseEdition(xml,`<article><a href="${url}"><img src="https://www.cm.com.br/foto.jpg"></a></article>`);
  assert.ok(list.length>2);
  const item = list.find(item => item.source_url === url);
  assert.ok(item);
  assert.equal(item.title,'Festival de Marrakech reúne estrelas e cinema autoral no Marrocos');
  assert.equal(item.image_url,'https://www.cm.com.br/foto.jpg');
  assert.equal(item.path,'/correio/2026/11/332622-entre-areias-e-telas-do-marrocos');
});
test('article text is extracted without scripts, navigation or fabricated credits',() => {
  const article = parseArticle(html,url);
  assert.equal(article.author,'Rodrigo Fonseca');
  assert.equal(article.image_credit,'Crédito: Divulgação');
  assert.match(article.content,/Primeiro parágrafo\.\nOutra linha/);
  assert.doesNotMatch(article.content,/notArticle|Not part/);
  assert.equal(parseArticle(html.replace(/<figcaption>[\s\S]*?<\/figcaption>/,''),url).image_credit,'');
});
test('permalink works independently of the latest feed and remains a credited republication', async t => {
  const original = globalThis.fetch;
  t.after(() => {globalThis.fetch=original;});
  globalThis.fetch = async target => {assert.equal(target,url);return new Response(html);};
  const response = await worker.fetch(new Request('https://jornaldocinema.com.br/correio/2026/11/332622-entre-areias-e-telas-do-marrocos'),{});
  const page = await response.text();
  assert.equal(response.status,200);
  assert.match(page,/Rodrigo Fonseca/);
  assert.match(page,/Crédito: Divulgação/);
  assert.match(page,/Publicado originalmente por Correio da Manhã/);
  assert.match(response.headers.get('x-robots-tag'),/noindex/);
});
