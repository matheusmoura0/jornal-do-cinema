import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import worker from '../src/worker.mjs';
import {content} from '../src/cineclube.mjs';
import {readerTools} from '../src/reader.mjs';
test('quiz and glossary have complete, sourced content and work without the news upstream',async () => {
  const response=await worker.fetch(new Request('https://jornaldocinema.com.br/cineclube'),{});
  const {document}=parseHTML(await response.text());
  assert.equal(response.status,200);
  assert.equal(document.querySelectorAll('[data-question]').length,8);
  assert.equal(document.querySelectorAll('.glossary-term').length,12);
  assert.equal(document.querySelectorAll('noscript details').length,8);
  for (const item of content.questions) {
    assert.ok(Number.isInteger(item.answer) && item.answer>=0 && item.answer<item.options.length);
    assert.equal(new Set(item.options).size,item.options.length);
    assert.match(item.source,/^https:\/\/(filmanalysis\.yale\.edu|www\.festival-cannes\.com)\//);
  }
});
test('server glossary search is accent-insensitive and query text is escaped',async () => {
  const response=await worker.fetch(new Request('https://jornaldocinema.com.br/cineclube?termo=camera'),{});
  const {document}=parseHTML(await response.text());
  assert.equal(document.querySelectorAll('.glossary-term:not([hidden])').length,1);
  assert.match(document.querySelector('.glossary-term:not([hidden])').textContent,/Caméra/);
  assert.match(response.headers.get('x-robots-tag'),/noindex/);
  const malicious=await worker.fetch(new Request('https://jornaldocinema.com.br/cineclube?termo=%22%3E%3Cscript%3E'),{});
  assert.ok((await malicious.text()).includes('&quot;&gt;&lt;script&gt;'));
});
test('saved list is private to the browser and safe toolbar markup is escaped',async () => {
  const response=await worker.fetch(new Request('https://jornaldocinema.com.br/salvos'),{});
  assert.match(response.headers.get('x-robots-tag'),/noindex/);
  assert.match(await response.text(),/neste navegador/);
  const markup=readerTools('/materia/1','"<script>');
  assert.ok(markup.includes('&quot;&lt;script&gt;'));
  assert.doesNotMatch(markup,/<script>/);
  const cookies=await worker.fetch(new Request('https://jornaldocinema.com.br/cookies'),{});
  assert.match(await cookies.text(),/localStorage/);
});
