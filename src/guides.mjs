import guides from '../.generated/guides.mjs';
import {ORIGIN, escapeHtml as esc, jsonForHtml, htmlResponse} from './site.mjs';
export {guides};
export const guideByline = 'Jornal do Cinema — revisão editorial: Matheus Moura';
export function guideListing() {
  return `<section class="journal-section" id="guias"><header><div><span>LEITURA E LINGUAGEM</span><h2>Guias de cinema</h2></div></header><div class="archive-grid">${guides.map(guide => `<a class="card guide-card" href="/guias/${guide.slug}"><span>GUIA EDITORIAL</span><h3>${esc(guide.title)}</h3><p>${esc(guide.description)}</p></a>`).join('')}</div></section>`;
}
export function guideIndex() {
  return htmlResponse('Guias de cinema',`<h1 class="guides-heading">Guias de cinema</h1><p>Leituras para entender a crítica, acompanhar festivais e observar a linguagem dos filmes.</p>${guideListing()}`,{path:'/guias',meta:'<meta name="description" content="Guias editoriais de cinema sobre crítica, festivais, imagem, montagem e som.">'});
}
export function guidePage(guide) {
  const path = `/guias/${guide.slug}`;
  const schema = {'@context':'https://schema.org','@type':'Article',headline:guide.title,description:guide.description,datePublished:guide.publishedAt,author:{'@type':'Organization',name:'Jornal do Cinema',url:ORIGIN},editor:{'@type':'Person',name:'Matheus Moura'},publisher:{'@type':'Organization',name:'Jornal do Cinema'},mainEntityOfPage:`${ORIGIN}${path}`};
  return htmlResponse(guide.title,`<article class="article-page"><a href="/guias">Guias de cinema</a><p class="article-kicker">Guia editorial</p><h1>${esc(guide.title)}</h1><p class="article-deck">${esc(guide.description)}</p><div class="article-byline"><span>${esc(guideByline)}</span><time datetime="${guide.publishedAt}">Publicado em 6 de novembro de 2026</time></div><div class="article-body guide-body">${guide.html}</div><aside class="source-note"><a href="/politica-editorial">Política editorial e correções</a> · <a href="/guias">Todos os guias</a></aside></article>`,{path,meta:`<meta name="description" content="${esc(guide.description)}"><script type="application/ld+json">${jsonForHtml(schema)}</script>`});
}
