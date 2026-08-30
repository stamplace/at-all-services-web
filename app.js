(() => {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileDock = document.getElementById('mobileDock');
  const heroCta = document.getElementById('heroCta');
  const form = document.getElementById('serviceForm');
  const status = document.getElementById('formStatus');
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
  const track = (name, detail = {}) => { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: name, ...detail }); };
  document.querySelectorAll('.track-call').forEach(el => el.addEventListener('click', () => track('call_click')));
  document.querySelectorAll('.track-whatsapp').forEach(el => el.addEventListener('click', () => track('whatsapp_click')));
  document.querySelectorAll('.track-email').forEach(el => el.addEventListener('click', () => track('email_click')));
  document.querySelectorAll('.track-request').forEach(el => el.addEventListener('click', () => track('service_request_start')));
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileNav.hidden = open;
    menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    menuButton.querySelector('use')?.setAttribute('href', open ? '#i-menu' : '#i-close');
  });
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileNav.hidden = true; menuButton?.setAttribute('aria-expanded', 'false'); menuButton?.querySelector('use')?.setAttribute('href', '#i-menu');
  }));
  if ('IntersectionObserver' in window && heroCta && mobileDock) {
    const observer = new IntersectionObserver(([entry]) => mobileDock.classList.toggle('is-visible', !entry.isIntersecting && window.innerWidth <= 820), { threshold: 0.2 });
    observer.observe(heroCta);
  }
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); if (status) status.textContent = 'Please complete the required fields.'; return; }
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const city = String(data.get('city') || '').trim();
    const serviceNeeded = String(data.get('serviceNeeded') || '').trim();
    const problem = String(data.get('problem') || '').trim();
    const message = ['Hi At All Services LLC, I need help with my garage door.',`Name: ${name}`,`Phone: ${phone}`,`City: ${city}`,serviceNeeded ? `Service Needed: ${serviceNeeded}` : '',`Problem: ${problem}`].filter(Boolean).join('\n');
    const url = `https://wa.me/16514436062?text=${encodeURIComponent(message)}`;
    track('service_request_submit', { city, service: serviceNeeded || 'unknown' });
    if (status) status.textContent = 'Your request is ready in WhatsApp. Review it, then send when you are ready.';
    window.open(url, '_blank', 'noopener');
  });
})();