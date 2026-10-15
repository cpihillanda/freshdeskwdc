import { startLandscape } from './landscape.js';

// Each page owns its listeners and animation resources so navigation can clean them up.
export function initializePage() {
  const controller = new AbortController();
  const options = {signal: controller.signal};
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  let stopLandscape;
  const filters = document.querySelectorAll('[data-filter]');
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    let count = 0;
    document.querySelectorAll('[data-category]').forEach(card => {
      card.classList.remove('filter-enter');
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
      if (!card.hidden) { count++; if (!reducedMotion.matches) requestAnimationFrame(() => {if(card.isConnected)card.classList.add('filter-enter');}); }
    });
    document.querySelector('#filter-count').textContent = `${count} ${count === 1 ? 'company' : 'companies'}`;
  }, options));

  const email = (import.meta.env.VITE_CONTACT_EMAIL ?? 'aka.connct@darkconsolidated.uk').trim();
  const emailConfigured = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.href = emailConfigured ? `mailto:${email}` : '/contact/';
    link.textContent = emailConfigured ? `${email} ↗` : 'Prepare an enquiry ↗';
  });
  const form = document.querySelector('#contact-form');
  if (form) {
    const topic = new URLSearchParams(location.search).get('topic');
    if ([...form.elements.topic.options].some(option => option.value === topic)) form.elements.topic.value = topic;
    if (!emailConfigured) {
      document.querySelector('#contact-notice').textContent = 'Enquiry delivery is not connected. Save a text draft to your device; no message will be sent.';
      document.querySelector('#submit-enquiry').innerHTML = 'Save enquiry draft <span aria-hidden="true">↗</span>';
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      const subject = `Website enquiry: ${data.topic}`;
      const body = `Name: ${data.name.trim()}\nEmail: ${data.email.trim()}\nInterest: ${data.topic}\n\n${data.message.trim()}`;
      if (emailConfigured) {
        location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        document.querySelector('#form-status').textContent = 'Email draft requested. Review and send it in your email application to complete your enquiry.';
      } else {
        const url = URL.createObjectURL(new Blob([`${subject}\n\n${body}`], {type:'text/plain;charset=utf-8'}));
        const link = document.createElement('a');link.href=url;link.download='dark-consolidated-enquiry.txt';link.click();
        setTimeout(()=>URL.revokeObjectURL(url),1000);
        document.querySelector('#form-status').textContent='Draft saved to your device. It has not been sent.';
      }
    }, options);
  }
  document.querySelectorAll('.accordions details').forEach(detail=>detail.addEventListener('toggle',()=>{
    if(detail.open)document.querySelectorAll('.accordions details').forEach(other=>{if(other!==detail)other.open=false;});
  },options));
  if(document.querySelector('#landscape'))stopLandscape=startLandscape();
  if(!reducedMotion.matches && 'IntersectionObserver' in window){
    observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08});
    document.querySelectorAll('.insight-section,.editorial-grid,.principle-grid,.company-capabilities,.page-cta,.home-manifesto').forEach(section=>{
      if(section.getBoundingClientRect().top>innerHeight){section.classList.add('scroll-reveal');observer.observe(section);}
    });
    reducedMotion.addEventListener('change',event=>{if(event.matches){observer.disconnect();document.querySelectorAll('.scroll-reveal').forEach(el=>el.classList.add('is-visible'));}},options);
  }
  return ()=>{controller.abort();observer?.disconnect();stopLandscape?.();};
}
