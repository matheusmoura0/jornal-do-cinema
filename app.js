const root=document;document.getElementById("today").textContent=new Intl.DateTimeFormat("pt-BR",{dateStyle:"long"}).format(new Date()).toUpperCase();
const el=(tag,text,className)=>{const node=document.createElement(tag);if(className)node.className=className;node.textContent=text||"";return node};
const safeUrl=value=>{try{const u=new URL(value,location.origin);return ["http:","https:"].includes(u.protocol)?u.href:""}catch{return""}};
const slotOf=item=>item.slot_key||item.slot||"";
function link(article,className,titleTag="h3"){const a=el("a","",className);a.href=`materia.html?id=${Number(article.id)}`;if(article.image_url){const img=document.createElement("img");img.src=safeUrl(article.image_url);img.alt="";img.loading="lazy";a.append(img)}const copy=el("div");copy.append(el("span",(article.category||"Cinema").replaceAll("-"," ")),el(titleTag,article.title));if(article.description)copy.append(el("p",article.description));a.append(copy);return a}
function render(items){if(!items.length)return false;const bySlot=new Map(items.filter(x=>slotOf(x)).map(x=>[slotOf(x),x])),used=new Set();const take=(slot,fallback=[])=>{const exact=bySlot.get(slot);if(exact&&!used.has(exact.id)){used.add(exact.id);return exact}const item=fallback.find(x=>!used.has(x.id))||items.find(x=>!used.has(x.id));if(item)used.add(item.id);return item};const takeMany=(prefix,count,fallback=[],offset=0)=>Array.from({length:count},(_,i)=>take(`${prefix}_${i+1+offset}`,fallback)).filter(Boolean);
const lead=take("jc_lead"),leadRoot=document.querySelector(".lead");leadRoot.classList.remove("placeholder");leadRoot.replaceChildren();if(lead.image_url){const img=document.createElement("img");img.src=safeUrl(lead.image_url);img.alt="";leadRoot.append(img)}leadRoot.append(el("span",(lead.category||"Em destaque").replaceAll("-"," ")),el("h1",lead.title),el("p",lead.description));leadRoot.onclick=()=>location.href=`materia.html?id=${Number(lead.id)}`;
document.getElementById("secondary-leads").replaceChildren(...takeMany("jc_secondary",2).map(x=>link(x,"secondary-card","h2")));
document.getElementById("briefs").replaceChildren(...takeMany("jc_brief",5).map(x=>link(x,"brief")));
const by=slug=>items.filter(x=>x.category===slug);
document.getElementById("critica-list").replaceChildren(...takeMany("jc_critique",5,by("critica")).map(x=>link(x,"list-article")));
document.getElementById("ensaios-list").replaceChildren(...takeMany("jc_essay",4,by("ensaios")).map(x=>link(x,"card")));
document.getElementById("entrevistas-list").replaceChildren(...takeMany("jc_festival",2,by("entrevistas")).map(x=>link(x,"card")));
document.getElementById("festival-list").replaceChildren(...takeMany("jc_festival",2,by("festivais"),2).map(x=>link(x,"card")));
document.getElementById("front-page").setAttribute("aria-busy","false");return true}
function showLoadError(){const front=document.getElementById("front-page");front.setAttribute("aria-busy","false");document.querySelector(".lead p").textContent="A edição não pôde ser atualizada agora. Tente novamente em alguns instantes."}
async function load(){try{const r=await fetch("https://correio-content-hub.onrender.com/api/v1/sites/by-domain/articles?domain=jornaldocinema.com.br",{cache:"no-store",signal:AbortSignal.timeout(9000)});if(!r.ok)throw new Error("api");const p=await r.json();if(!render(Array.isArray(p)?p:p.articles||[]))showLoadError()}catch{showLoadError()}}load();

const menu=document.querySelector(".menu"),nav=document.getElementById("main-nav");
menu?.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open))});
