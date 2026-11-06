export const ORIGIN = 'https://jornaldocinema.com.br';
export const CONTACT = 'cmdev072@gmail.com';
export const TAX_ID = '49.858.328/0001-32';
export const PUBLISHER = 'ca-pub-7037572686437222';
export const categories = {critica:'Crítica',ensaios:'Ensaios',entrevistas:'Entrevistas',festivais:'Festivais','historia-do-cinema':'História do Cinema',industria:'Indústria',noticias:'Notícias de cinema'};
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const jsonForHtml = value => JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
export function safeUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; }
  catch { return ''; }
}
export function cinemaCategory(item) {
  if (Object.hasOwn(categories, item.category)) return item.category;
  const source = safeUrl(item.source_url);
  if (source) {
    const url = new URL(source);
    if (['www.correiodamanha.com.br','correiodamanha.com.br','www.cm.com.br','cm.com.br'].includes(url.hostname) && url.pathname.startsWith('/cultura/cinema/')) return 'noticias';
  }
  return '';
}
export function selectCinema(items) {
  const seen = new Set();
  return items.filter(item => item && /^\d+$/.test(String(item.id)) && item.title && cinemaCategory(item) && !seen.has(String(item.id)) && seen.add(String(item.id)));
}
export async function fetchArticles() {
  const url = 'https://hub.cm.com.br/api/v1/sites/by-domain/articles?domain=jornaldocinema.com.br';
  const response = await fetch(url, {headers:{Accept:'application/json'}, signal:AbortSignal.timeout(8000), cf:{cacheTtl:60,cacheEverything:true}});
  if (!response.ok) throw new Error('Hub unavailable');
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Invalid Hub response');
  return selectCinema(data);
}
export function layout(title, content, {path='/', noindex=false, meta=''} = {}) {
  const nav = [['/','Capa'],['/guias','Guias'],['/#arquivo','Arquivo'],['/sobre','Sobre o jornal'],['/contato','Contato']].map(([href,label]) => `<a href="${href}">${label}</a>`).join('');
  const institutional = [['sobre','Sobre'],['contato','Contato'],['politica-editorial','Política editorial'],['privacidade','Privacidade'],['cookies','Cookies']];
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} | Jornal do Cinema</title><meta name="google-adsense-account" content="${PUBLISHER}">${noindex ? '<meta name="robots" content="noindex,follow">' : `<link rel="canonical" href="${ORIGIN}${escapeHtml(path)}">`}<link rel="stylesheet" href="/styles.css"><script defer src="/app.js"></script>${meta}</head><body><a class="skip-link" href="#conteudo">Ir para o conteúdo</a><header class="masthead"><div class="edition-line"><span>EDIÇÃO DIGITAL</span><span>CINEMA · CULTURA · INFORMAÇÃO</span></div><div class="brand-row"><button class="menu" aria-label="Abrir menu" aria-controls="main-nav" aria-expanded="false"><img src="/icons/menu.svg" alt="" width="24" height="24"></button><a class="brand" href="/"><small>JORNAL DO</small><strong>CINEMA</strong></a><a class="search" href="/#arquivo">PESQUISAR</a></div><nav id="main-nav" aria-label="Editorias">${nav}</nav></header><main id="conteudo">${content}</main><footer><a class="brand" href="/"><small>JORNAL DO</small><strong>CINEMA</strong></a><p>Informação e leitura sobre cinema.</p><nav class="footer-nav" aria-label="Institucional">${institutional.map(([href,label]) => `<a href="/${href}">${label}</a>`).join('')}</nav><small>CNPJ ${TAX_ID} · <a href="mailto:${CONTACT}">${CONTACT}</a></small><small>© ${new Date().getFullYear()} Jornal do Cinema</small></footer></body></html>`;
}
export function htmlResponse(title, content, {status=200,...options} = {}) {
  return new Response(layout(title,content,options), {status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':status === 200 ? 'public, max-age=0, s-maxage=60' : 'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'strict-origin-when-cross-origin',...(options.noindex ? {'X-Robots-Tag':'noindex, follow'} : {}),...(status === 503 ? {'Retry-After':'120'} : {})}});
}
export function errorPage(status) {
  const title = status === 404 ? 'Página não encontrada' : 'Conteúdo temporariamente indisponível';
  return htmlResponse(title, `<section class="article-page"><h1>${title}</h1><p>${status === 404 ? 'O endereço pode ter mudado ou a matéria não está publicada nesta edição.' : 'Não foi possível consultar a edição. Tente novamente em instantes.'}</p><a href="/">Voltar ao início</a></section>`, {status,noindex:true});
}
