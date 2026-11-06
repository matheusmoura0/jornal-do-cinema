import {DOMParser, parseHTML} from 'linkedom';
import edits from '../content/correio-edits.json' with {type:'json'};

const hosts = new Set(['www.cm.com.br','cm.com.br','www.correiodamanha.com.br','correiodamanha.com.br']);
const articlePath = /^\/cultura\/cinema\/(\d{4}\/\d{2}\/\d+-[a-z0-9-]+)\.html$/;
export function sourceUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !hosts.has(url.hostname) || url.username || url.password || url.port) return '';
    if (!articlePath.test(url.pathname)) return '';
    return `https://www.cm.com.br${url.pathname}`;
  } catch {return '';}
}
function localPath(url) {return `/correio/${new URL(url).pathname.match(articlePath)[1]}`;}
function cleanText(value) {return String(value || '').replace(/\s+/g,' ').trim();}
function displayTitle(value) {return cleanText(value).replace(/\btelasdo\b/g,'telas do');}
function editorialCopy(url,title,description) {
  const id = new URL(url).pathname.match(/\/(\d+)-/)[1];
  return {title:edits[id]?.title || displayTitle(title),description:edits[id]?.description || cleanText(description)};
}
async function readSource(url) {
  for (let redirects=0;redirects<4;redirects++) {
    const current = new URL(url);
    if (!hosts.has(current.hostname) || current.protocol !== 'https:') throw new Error('Untrusted source');
    const response = await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(8000),headers:{Accept:'text/html,application/atom+xml'},cf:{cacheTtl:300,cacheEverything:true}});
    if ([301,302,303,307,308].includes(response.status)) {url=new URL(response.headers.get('location'),url).href;continue;}
    if (!response.ok) {const error = new Error('Correio unavailable');error.status=response.status;throw error;}
    const text = await response.text();
    if (text.length > 3_000_000) throw new Error('Source too large');
    return text;
  }
  throw new Error('Too many source redirects');
}
export function parseEdition(xml, html='') {
  const feed = new DOMParser().parseFromString(xml,'text/xml');
  const {document} = parseHTML(html);
  const images = new Map();
  for (const link of document.querySelectorAll('article a[href]')) {
    const url = sourceUrl(link.getAttribute('href'));
    const image = link.querySelector('img');
    if (url && image?.getAttribute('src')) images.set(url,image.getAttribute('src'));
  }
  const items = new Map();
  for (const entry of feed.querySelectorAll('entry')) {
    const url = sourceUrl(entry.querySelector('link[rel="alternate"]')?.getAttribute('href') || entry.querySelector('id')?.textContent);
    const title = displayTitle(entry.querySelector('title')?.textContent);
    if (!url || !title) continue;
    items.set(url,{
      id:`cm-${new URL(url).pathname.match(/\/(\d+)-/)[1]}`,path:localPath(url),
      ...editorialCopy(url,title,entry.querySelector('content')?.textContent),category:'noticias',
      author:cleanText(entry.querySelector('author name')?.textContent),
      published_at:entry.querySelector('published')?.textContent || entry.querySelector('updated')?.textContent,
      image_url:images.get(url) || '',source_url:url,canonical_url:url,publisher:'Correio da Manhã',
      credit:'Publicado originalmente por Correio da Manhã'
    });
  }
  return [...items.values()].sort((a,b) => (Date.parse(b.published_at)||0)-(Date.parse(a.published_at)||0)).slice(0,40);
}
export async function fetchCorreioEdition() {
  const results = await Promise.allSettled([
    readSource('https://www.cm.com.br/cultura/cinema/sitemap-rss.xml'),
    readSource('https://www.cm.com.br/cultura/cinema/')
  ]);
  if (results[0].status !== 'fulfilled') throw results[0].reason;
  const items = parseEdition(results[0].value,results[1].status === 'fulfilled' ? results[1].value : '');
  if (!items.length) throw new Error('Cinema feed empty');
  return items;
}
export function parseArticle(html,url) {
  const {document} = parseHTML(html);
  const meta = name => document.querySelector(`meta[property="${name}"],meta[name="${name}"]`)?.getAttribute('content') || '';
  const body = document.querySelector('.cm-article-body,[itemprop="articleBody"]');
  if (!body) throw new Error('Article body missing');
  for (const node of body.querySelectorAll('script,style,iframe,form,nav,.ad-unit')) node.remove();
  for (const br of body.querySelectorAll('br')) br.replaceWith(document.createTextNode('\n'));
  const paragraphs = [...body.querySelectorAll('p,h2,h3,li')].map(node => node.textContent.trim()).filter(Boolean);
  const content = paragraphs.join('\n\n');
  if (!content) throw new Error('Empty article body');
  return {
    ...editorialCopy(url,document.querySelector('h1.cm-article-title,h1')?.textContent || meta('og:title'),meta('description')),
    author:cleanText(meta('author') || meta('article:author')),
    published_at:meta('article:published_time'),image_url:document.querySelector('.cm-article-media img')?.getAttribute('src') || meta('og:image'),
    image_credit:cleanText(document.querySelector('.cm-article-media-caption-credit')?.textContent || document.querySelector('.cm-article-media figcaption')?.textContent),
    content,category:'noticias',source_url:url,canonical_url:url,publisher:'Correio da Manhã',
    credit:'Publicado originalmente por Correio da Manhã. Apresentação e formatação adaptadas pelo Jornal do Cinema.'
  };
}
export async function fetchCorreioArticle(path) {
  const url = sourceUrl(`https://www.cm.com.br/cultura/cinema/${path}.html`);
  if (!url) {const error = new Error('Invalid article path');error.status=404;throw error;}
  return {...parseArticle(await readSource(url),url),path:`/correio/${path}`};
}
