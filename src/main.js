import { initializePage } from './page.js';
import { setupNavigation } from './navigation.js';
const menu = document.querySelector('#site-menu');
const menuButton = document.querySelector('.menu-button');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let closeTimer;
function closeMenu(animate = true) {
  clearTimeout(closeTimer);
  if (!animate || reducedMotion.matches) { menu.close(); return; }
  menu.classList.add('is-closing');
  closeTimer = setTimeout(() => menu.close(), 160);
}
menuButton.addEventListener('click', () => { clearTimeout(closeTimer);menu.classList.remove('is-closing');menu.showModal();menuButton.setAttribute('aria-expanded','true'); });
document.querySelector('.menu-close').addEventListener('click', () => closeMenu());
menu.addEventListener('cancel', event => {event.preventDefault();closeMenu();});
menu.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu(false);
  if (event.target === menu) {const r=menu.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeMenu();}
});
menu.addEventListener('close', () => {menuButton.setAttribute('aria-expanded','false');menu.classList.remove('is-closing');});

setupNavigation({initializePage, closeMenu});
