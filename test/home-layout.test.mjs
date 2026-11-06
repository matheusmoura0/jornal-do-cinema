import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import worker from '../src/worker.mjs';
test('homepage prioritizes photography without repeating or losing stories across pagination',async t => {
  const original=globalThis.fetch;
  t.after(() => {globalThis.fetch=original;});
  const items=Array.from({length:15},(_,i) => ({id:i+1,title:`Cinema story ${i+1}`,category:'noticias',image_url:i%4 ? `https://images.example.com/${i}.jpg` : '',published_at:'2026-11-06T10:00:00Z'}));
  globalThis.fetch=async url => {
    if (String(url).includes('by-domain/articles')) return Response.json(items);
    throw new Error('No external source in layout test');
  };
  const response=await worker.fetch(new Request('https://jornaldocinema.com.br/'),{});
  const {document}=parseHTML(await response.text());
  assert.ok(document.querySelector('.lead img'));
  assert.equal(document.querySelectorAll('.secondary-card img').length,2);
  const paths=[...document.querySelectorAll('main a[href^="/materia/"]')].map(node => node.getAttribute('href'));
  assert.equal(paths.length,12);
  assert.equal(new Set(paths).size,12);
  assert.equal(document.querySelector('.lead img').getAttribute('loading'),'eager');
  assert.ok(document.querySelector('.story-meta time'));
  const page2=await worker.fetch(new Request('https://jornaldocinema.com.br/?pagina=2'),{});
  const doc2=parseHTML(await page2.text()).document;
  const remaining=[...doc2.querySelectorAll('main a[href^="/materia/"]')].map(node => node.getAttribute('href'));
  assert.equal(remaining.length,3);
  assert.equal(new Set([...paths,...remaining]).size,15);
});
