import { ORIGIN, PUBLISHER, categories, cinemaCategory, fetchArticles, escapeHtml as esc, safeUrl, jsonForHtml, htmlResponse, errorPage } from './site.mjs';
import { pages } from './institutional.mjs';
import {guides, guideListing, guideIndex, guidePage} from './guides.mjs';

function card(item, className='card', heading='h3') {
  const image = safeUrl(item.image_url);
  return `<a class="${className}" href="/materia/${item.id}">${image ? `<img src="${esc(image)}" alt="" loading="lazy" width="800" height="500">` : ''}<div><span>${esc(categories[cinemaCategory(item)])}</span><${heading}>${esc(item.title)}</${heading}>${item.description ? `<p>${esc(item.description)}</p>` : ''}</div></a>`;
}
function home(items, url) {
  const query = (url.searchParams.get('q') || '').trim().slice(0,160);
  const section = url.searchParams.get('editoria') || '';
  if (section && !Object.hasOwn(categories, section)) return errorPage(404);
  const list = items.filter(item => (!section || cinemaCategory(item) === section) && (!query || `${item.title} ${item.description || ''}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))));
  const requested = Number(url.searchParams.get('pagina') || 1);
  const page = Number.isSafeInteger(requested) && requested > 0 ? requested : 1;
  if (page > Math.max(1, Math.ceil(list.length / 12))) return errorPage(404);
  const shown = list.slice((page-1)*12,page*12);
  const pageUrl = number => {const params = new URLSearchParams();if(query)params.set('q',query);if(section)params.set('editoria',section);params.set('pagina',number);return `/?${params}#arquivo`;};
  const lead = list[0];
  const content = `${page === 1 && lead ? `<section class="front-page"><article class="lead">${card(lead,'lead-link','h1')}</article><div class="secondary-leads">${list.slice(1,3).map(item => card(item,'secondary-card','h2')).join('')}</div><aside class="briefs"><h2>Mais leituras</h2>${list.slice(3,8).map(item => card(item,'brief')).join('') || '<a href="/politica-editorial">Conheça a política editorial</a>'}</aside></section>` : ''}<section class="journal-section" id="arquivo"><header><div><span>ARQUIVO DA EDIÇÃO</span><h2>${esc(section ? categories[section] : 'Notícias e leituras')}</h2></div></header><form class="archive-search" role="search" action="/#arquivo"><label for="q">Pesquisar no jornal</label><div><input id="q" name="q" type="search" value="${esc(query)}" maxlength="160" placeholder="Título ou assunto">${section ? `<input type="hidden" name="editoria" value="${esc(section)}">` : ''}<button type="submit">Buscar</button><a href="/#arquivo">Limpar</a></div></form><p>${list.length} ${list.length === 1 ? 'matéria encontrada' : 'matérias encontradas'}</p><div class="archive-grid">${shown.map(item => card(item)).join('') || '<p>Nenhuma matéria encontrada nesta seleção.</p>'}</div><nav class="pagination" aria-label="Paginação">${page > 1 ? `<a href="${esc(pageUrl(page-1))}">Anterior</a>` : ''}${page*12 < list.length ? `<a href="${esc(pageUrl(page+1))}">Próxima</a>` : ''}</nav></section>`;
  return htmlResponse('Jornal do Cinema',(!query && !section && page === 1 ? guideListing() : '')+content,{path:section ? `/?editoria=${encodeURIComponent(section)}` : '/',noindex:!!query || (!list.length && (section || !guides.length)) || page > 1,meta:'<meta name="description" content="Notícias e leituras sobre cinema, com autoria e fontes identificadas.">'});
}
function articlePage(item) {
  const source = safeUrl(item.source_url);
  const canonical = safeUrl(item.canonical_url);
  const local = canonical && new URL(canonical).origin === ORIGIN;
  const image = safeUrl(item.image_url);
  const date = new Date(item.published_at);
  const dateValid = item.published_at && !Number.isNaN(+date);
  const content = String(item.content || '').trim();
  const schema = {'@context':'https://schema.org','@type':'NewsArticle',headline:item.title,publisher:{'@type':'Organization',name:'Jornal do Cinema'},...(item.author ? {author:{'@type':'Person',name:item.author}} : {}),...(dateValid ? {datePublished:date.toISOString()} : {}),...(image ? {image:[image]} : {}),...(source ? {isBasedOn:source} : {})};
  return htmlResponse(item.title, `<article class="article-page"><a href="/">Início</a><p class="article-kicker">${esc(categories[cinemaCategory(item)])}</p><h1>${esc(item.title)}</h1><p class="article-deck">${esc(item.description)}</p><div class="article-byline"><span>${esc(item.author || item.publisher || 'Autoria não informada pela fonte')}</span>${dateValid ? `<time datetime="${date.toISOString()}">${esc(new Intl.DateTimeFormat('pt-BR',{dateStyle:'long',timeZone:'America/Sao_Paulo'}).format(date))}</time>` : ''}</div>${image ? `<figure><img class="article-image" src="${esc(image)}" alt=""><figcaption>${esc(item.image_credit || '')}</figcaption></figure>` : ''}<div class="article-body">${content.split(/\n{2,}/).filter(Boolean).map(part => `<p>${esc(part).replace(/\n/g,'<br>')}</p>`).join('') || '<p>O texto está indisponível.</p>'}</div>${!local && source ? `<aside class="source-note"><p>${esc(item.credit || `Publicado originalmente por ${item.publisher || 'outra publicação'}`)}</p><a href="${esc(source)}" rel="noopener">Consultar a publicação original</a></aside>` : ''}</article>`,{path:`/materia/${item.id}`,noindex:!local || content.length < 300,meta:`<meta name="description" content="${esc(item.description || '')}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(item.title)}">${image ? `<meta property="og:image" content="${esc(image)}">` : ''}<script type="application/ld+json">${jsonForHtml(schema)}</script>`});
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
    if (url.hostname === 'www.jornaldocinema.com.br') return Response.redirect(`${ORIGIN}${url.pathname}${url.search}`,301);
    if (url.pathname === '/index.html') return Response.redirect(`${ORIGIN}/${url.search}`,301);
    if (url.pathname === '/materia.html') {
      const id = url.searchParams.get('id');
      return /^\d+$/.test(id || '') ? Response.redirect(`${ORIGIN}/materia/${id}`,301) : errorPage(404);
    }
    if (url.pathname === '/ads.txt') return new Response(`google.com, ${PUBLISHER.replace('ca-','')}, DIRECT, f08c47fec0942fa0\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
    if (url.pathname === '/robots.txt') return new Response(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${ORIGIN}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
    const pageKey = url.pathname.slice(1).replace(/\/$/,'');
    if (url.pathname === '/guias') return guideIndex();
    const guideMatch = url.pathname.match(/^\/guias\/([a-z0-9-]+)\/?$/);
    if (guideMatch) {
      const guide = guides.find(item => item.slug === guideMatch[1]);
      return guide ? guidePage(guide) : errorPage(404);
    }
    const page = Object.hasOwn(pages, pageKey) ? pages[pageKey] : null;
    if (page) return htmlResponse(page.title,`<section class="article-page legal-page"><h1>${esc(page.title)}</h1><div class="article-body">${page.body}</div></section>`,{path:url.pathname});
    if (['/styles.css','/app.js','/icons/menu.svg','/icons/LICENSE'].includes(url.pathname)) return env.ASSETS.fetch(request);
    const match = url.pathname.match(/^\/materia\/(\d+)\/?$/);
    if (url.pathname !== '/' && !match && !['/api/articles','/sitemap.xml'].includes(url.pathname)) return errorPage(404);
    let items;
    try { items = await fetchArticles(); } catch { return url.pathname === '/api/articles' ? Response.json({error:'Temporariamente indisponível'},{status:503,headers:{'Cache-Control':'no-store'}}) : errorPage(503); }
    if (url.pathname === '/api/articles') return Response.json(items,{headers:{'Cache-Control':'public, max-age=60'}});
    if (url.pathname === '/sitemap.xml') {
      const paths = ['/','/guias',...guides.map(guide => `/guias/${guide.slug}`),...Object.keys(pages).map(path => `/${path}`),...items.filter(item => safeUrl(item.canonical_url) === `${ORIGIN}/materia/${item.id}` && String(item.content || '').length >= 300).map(item => `/materia/${item.id}`)];
      return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${ORIGIN}${esc(path)}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
    }
    if (match) {const item = items.find(item => String(item.id) === match[1]);return item ? articlePage(item) : errorPage(404);}
    return home(items,url);
  }
};
