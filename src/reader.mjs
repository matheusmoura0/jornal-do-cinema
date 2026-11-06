import {escapeHtml as esc,htmlResponse} from './site.mjs';
export function readerTools(path,title) {
  return `<div class="reader-tools"><button type="button" data-save-url="${esc(path)}" data-save-title="${esc(title)}" aria-pressed="false" hidden title="Salvar leitura"><img src="/icons/bookmark.svg" width="18" height="18" alt=""><span>Salvar leitura</span></button><a href="/salvos">Minhas leituras</a><span class="reader-status" role="status"></span></div>`;
}
export function savedPage() {
  return htmlResponse('Minhas leituras',`<section class="saved-page"><p class="article-kicker">PARA LER DEPOIS</p><h1>Minhas leituras</h1><p class="saved-note">Sua lista fica neste navegador e não é sincronizada entre dispositivos.</p><div data-saved-list aria-live="polite"><p>Nenhuma leitura carregada.</p></div><noscript><p>Ative o JavaScript para consultar as leituras salvas neste navegador.</p></noscript><a class="text-link" href="/">Voltar às notícias</a></section>`,{path:'/salvos',noindex:true});
}
