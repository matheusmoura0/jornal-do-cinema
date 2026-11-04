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
