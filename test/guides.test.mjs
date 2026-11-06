import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import {guides, guideByline} from '../src/guides.mjs';
test('only approved guides are rendered, with honest attribution and canonical',async () => {
  assert.equal(guides.length,3);
  for (const guide of guides) {
    const path = `/guias/${guide.slug}`;
    const response = await worker.fetch(new Request(`https://jornaldocinema.com.br${path}`),{});
    const html = await response.text();
    assert.equal(response.status,200);
    assert.ok(html.includes(guideByline));
    assert.ok(html.includes(`rel="canonical" href="https://jornaldocinema.com.br${path}"`));
    assert.match(html,/2026-11-06/);
    assert.doesNotMatch(html,/Status: rascunho|Revisão necessária:|Resumo proposto:|name="robots" content="noindex/);
    assert.doesNotMatch(html,/adsbygoogle\.js/);
    assert.match(html,/<h2>/);
    assert.match(html,/<a href="https:\/\//);
    const scripts = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)];
    assert.equal(JSON.parse(scripts[0][1]).editor.name,'Matheus Moura');
  }
  assert.equal((await worker.fetch(new Request('https://jornaldocinema.com.br/guias/inexistente'),{})).status,404);
});
