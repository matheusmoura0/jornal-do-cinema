const menu = document.querySelector('.menu');
const nav = document.querySelector('#main-nav');
if (menu && nav) {
  const close = () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); };
  menu.addEventListener('click', () => {
    const expanded = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(expanded));
  });
  nav.addEventListener('click', close);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
}

const savedKey='jornal-cinema-reading-list-v1';
const validReading=item => item && typeof item.url==='string' && /^\/(?:materia\/\d+|correio\/\d{4}\/\d{2}\/\d+-[a-z0-9-]+|guias\/[a-z0-9-]+)$/.test(item.url) && typeof item.title==='string' && item.title.length>0 && item.title.length<=500;
function readSaved() {
  try {
    const data=JSON.parse(localStorage.getItem(savedKey) || '[]');
    if (!Array.isArray(data)) return [];
    const seen=new Set();
    return data.filter(item => validReading(item) && !seen.has(item.url) && seen.add(item.url)).slice(0,50);
  } catch {return [];}
}
function saveReadings(items) {
  try {localStorage.setItem(savedKey,JSON.stringify(items));return true;}
  catch {return false;}
}
function updateSaved() {
  const items=readSaved();
  document.querySelectorAll('[data-save-url]').forEach(button => {
    const saved=items.some(item => item.url===button.dataset.saveUrl);
    button.hidden=false;
    button.setAttribute('aria-pressed',String(saved));
    button.querySelector('span').textContent=saved ? 'Leitura salva' : 'Salvar leitura';
    button.title=saved ? 'Remover das leituras salvas' : 'Salvar leitura';
  });
  const root=document.querySelector('[data-saved-list]');
  if (!root) return;
  root.replaceChildren();
  if (!items.length) {
    const empty=document.createElement('p');empty.textContent='Nenhuma leitura salva ainda.';root.append(empty);return;
  }
  const list=document.createElement('ul');list.className='saved-list';
  for (const item of items) {
    const row=document.createElement('li');
    const link=document.createElement('a');link.href=item.url;link.textContent=item.title;
    const remove=document.createElement('button');remove.type='button';remove.title='Remover leitura';remove.setAttribute('aria-label',`Remover: ${item.title}`);
    const icon=document.createElement('img');icon.src='/icons/trash-2.svg';icon.alt='';icon.width=18;icon.height=18;remove.append(icon);
    remove.addEventListener('click',() => {
      if (saveReadings(readSaved().filter(entry => entry.url!==item.url))) {updateSaved();root.querySelector('button,a')?.focus();}
      else {const error=document.createElement('p');error.textContent='Não foi possível atualizar a lista neste navegador.';root.prepend(error);}
    });
    row.append(link,remove);list.append(row);
  }
  root.append(list);
}
document.querySelectorAll('[data-save-url]').forEach(button => {
  button.addEventListener('click',() => {
    const item={url:button.dataset.saveUrl,title:button.dataset.saveTitle};
    const status=button.closest('.reader-tools').querySelector('.reader-status');
    if (!validReading(item)) {status.textContent='Esta leitura não pode ser salva.';return;}
    const current=readSaved();
    const saved=current.some(entry => entry.url===item.url);
    if (!saved && current.length>=50) {status.textContent='Sua lista tem 50 leituras. Remova uma para salvar outra.';return;}
    const next=saved ? current.filter(entry => entry.url!==item.url) : [item,...current];
    if (!saveReadings(next)) {status.textContent='Não foi possível salvar neste navegador.';return;}
    updateSaved();status.textContent=saved ? 'Leitura removida da lista.' : 'Leitura salva neste navegador.';
  });
});
updateSaved();
window.addEventListener('storage',event => {if(event.key===savedKey) updateSaved();});

const quiz=document.querySelector('[data-quiz]');
if (quiz) {
  const data=JSON.parse(document.querySelector('#quiz-data').textContent);
  const fields=[...quiz.querySelectorAll('fieldset')];
  const form=quiz.querySelector('form');
  const progress=quiz.querySelector('progress');
  const label=quiz.querySelector('[data-quiz-progress]');
  const feedback=quiz.querySelector('[data-quiz-feedback]');
  const check=quiz.querySelector('[data-quiz-check]');
  const next=quiz.querySelector('[data-quiz-next]');
  const restart=quiz.querySelector('[data-quiz-restart]');
  let index=0,score=0,answered=false;
  function showQuestion(focus=false) {
    fields.forEach((field,i) => {field.hidden=i!==index;field.tabIndex=-1;});
    label.textContent=`Pergunta ${index+1} de ${data.length}`;
    progress.hidden=false;progress.value=index;
    feedback.replaceChildren();feedback.className='quiz-feedback';
    check.hidden=false;next.hidden=true;restart.hidden=true;answered=false;
    if (focus) fields[index].focus();
  }
  form.addEventListener('submit',event => {
    event.preventDefault();
    if (answered) return;
    const selected=fields[index].querySelector('input:checked');
    if (!selected) {feedback.textContent='Selecione uma resposta.';feedback.focus();return;}
    answered=true;
    const correct=Number(selected.value)===data[index].answer;
    if (correct) score++;
    fields[index].querySelectorAll('input').forEach(input => {input.disabled=true;});
    const result=document.createElement('strong');result.textContent=correct ? 'Acertou!' : `Resposta: ${data[index].options[data[index].answer]}`;
    const explanation=document.createElement('p');explanation.textContent=data[index].explanation;
    const source=document.createElement('a');source.href=data[index].source;source.textContent='Consultar referência';source.target='_blank';source.rel='noopener noreferrer';
    feedback.replaceChildren(result,explanation,source);feedback.classList.add(correct ? 'correct' : 'incorrect');
    progress.value=index+1;check.hidden=true;next.hidden=false;
    next.textContent=index===data.length-1 ? 'Ver resultado' : 'Próxima pergunta';
    feedback.focus();
  });
  next.addEventListener('click',() => {
    if (!answered) return;
    if (index<data.length-1) {index++;showQuestion(true);return;}
    fields.forEach(field => {field.hidden=true;});next.hidden=true;restart.hidden=false;
    label.textContent='Rodada concluída';
    const title=document.createElement('strong');title.textContent=`Você acertou ${score} de ${data.length}`;
    const copy=document.createElement('p');copy.textContent=score===data.length ? 'Olhar afiado! Que tal explorar os guias?' : 'Toda sessão ensina algo novo. O glossário está logo abaixo.';
    feedback.replaceChildren(title,copy);feedback.className='quiz-feedback quiz-result';feedback.focus();
  });
  restart.addEventListener('click',() => {
    index=0;score=0;form.reset();fields.forEach(field => field.querySelectorAll('input').forEach(input => {input.disabled=false;}));showQuestion(true);
  });
  showQuestion();
}
const glossary=document.querySelector('[data-glossary-form]');
if (glossary) {
  const input=glossary.querySelector('input');
  const terms=[...document.querySelectorAll('[data-term]')];
  const empty=document.querySelector('[data-glossary-empty]');
  function filterTerms() {
    const query=input.value.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim();
    terms.forEach(term => {term.hidden=!term.dataset.term.includes(query);});
    empty.hidden=terms.some(term => !term.hidden);
  }
  glossary.addEventListener('submit',event => {event.preventDefault();filterTerms();});
  input.addEventListener('input',filterTerms);
}
