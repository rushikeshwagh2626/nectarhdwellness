/* =========================================================
   Nectar Heart & Diabetes Wellness Center – Home page script
   ========================================================= */

/* ===== SITE CONFIG – edit these to re-brand ===== */
const SITE = {
  brandName: 'Nectar',
  brandSub: 'Heart & Diabetes Wellness',
  brandFull: 'Nectar Heart & Diabetes Wellness Center',
  phone: '+91 70581 07107',
  phoneHref: 'tel:+917058107107',
  email: 'nectarwellness@yahoo.com',
  emailHref: 'mailto:nectarwellness@yahoo.com',
  whatsappNumber: '917058107107', // digits only, with country code
  designer: 'YourName'
};
SITE.whatsappHref = 'https://wa.me/' + SITE.whatsappNumber;

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ----- Apply config ----- */
  $$('[data-site]').forEach(el => { const v = SITE[el.dataset.site]; if (v) el.textContent = v; });
  $$('[data-site-href]').forEach(el => { const v = SITE[el.dataset.siteHref]; if (v) el.setAttribute('href', v); });
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- Header shadow + back-to-top ----- */
  const header = $('#siteHeader');
  const toTop = $('#backToTop');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 50);
    toTop.classList.toggle('show', y > 400);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ----- Mobile drawer ----- */
  const drawer = $('#mobileDrawer');
  const overlay = $('#drawerOverlay');
  const burger = $('#hamburger');

  function openDrawer() {
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('show'));
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
    $('#drawerClose').focus();
  }
  function closeDrawer() {
    overlay.classList.remove('show');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
    setTimeout(() => { overlay.hidden = true; }, 300);
  }
  burger.addEventListener('click', openDrawer);
  $('#drawerClose').addEventListener('click', () => { closeDrawer(); burger.focus(); });
  overlay.addEventListener('click', closeDrawer);
  $$('a', drawer).forEach(a => a.addEventListener('click', closeDrawer));

  /* ----- Enquiry modal ----- */
  const modal = $('#enquiryModal');
  const form = $('#enquiryForm');
  const success = $('#formSuccess');
  let lastFocus = null;

  function openModal(e) {
    if (e) e.preventDefault();
    if (drawer.classList.contains('open')) closeDrawer();
    lastFocus = document.activeElement;
    form.hidden = false;
    success.hidden = true;
    modal.hidden = false;
    document.body.classList.add('no-scroll');
    setTimeout(() => $('#fName').focus(), 50);
  }
  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('no-scroll');
    if (lastFocus) lastFocus.focus();
  }
  $$('[data-open-modal]').forEach(b => b.addEventListener('click', openModal));
  $$('[data-close-modal]').forEach(b => b.addEventListener('click', closeModal));

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!modal.hidden) closeModal();
    else if (drawer.classList.contains('open')) { closeDrawer(); burger.focus(); }
  });

  // Keep keyboard focus inside the open modal
  modal.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const f = $$('button, input, select, textarea, a[href]', modal).filter(el => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ----- Form validation ----- */
  function setError(input, msg) {
    const row = input.closest('.form-row');
    row.classList.toggle('invalid', !!msg);
    $('.error', row).textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  function validate() {
    const name = form.name.value.trim();
    const phone = form.phone.value.replace(/[\s()-]/g, '');
    const email = form.email.value.trim();
    const dept = form.department.value;
    let ok = true;
    ok = setError(form.name, name.length < 2 ? 'Please enter your name.' : '') && ok;
    ok = setError(form.phone, !/^\+?\d{10,13}$/.test(phone) ? 'Please enter a valid phone number.' : '') && ok;
    ok = setError(form.email, email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Please enter a valid email address.' : '') && ok;
    ok = setError(form.department, !dept ? 'Please choose a program.' : '') && ok;
    return ok;
  }
  ['input', 'change'].forEach(evt => form.addEventListener(evt, e => {
    if (e.target.closest('.form-row.invalid')) validate();
  }));

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) { const bad = $('.invalid input, .invalid select', form); if (bad) bad.focus(); return; }

    // Send the enquiry to the clinic's WhatsApp (no server needed)
    const lines = [
      'New enquiry from the website',
      'Name: ' + form.name.value.trim(),
      'Phone: ' + form.phone.value.trim(),
      form.email.value.trim() ? 'Email: ' + form.email.value.trim() : '',
      'Program: ' + form.department.value,
      form.message.value.trim() ? 'Message: ' + form.message.value.trim() : ''
    ].filter(Boolean).join('\n');
    window.open(SITE.whatsappHref + '?text=' + encodeURIComponent(lines), '_blank', 'noopener');

    form.reset();
    form.hidden = true;
    success.hidden = false;
  });

  /* ----- Smooth scroll for in-page anchors + active link ----- */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2 || a.hasAttribute('data-open-modal')) return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  }));

  const navLinks = $$('.main-nav .nav-link[href^="#"]');
  // Watch every top-level section so the highlight clears on sections not in the menu
  const sections = $$('main > section[id], footer[id]');
  if ('IntersectionObserver' in window && navLinks.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        navLinks.forEach(l => {
          const on = l.getAttribute('href') === '#' + en.target.id;
          l.classList.toggle('active', on);
          if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ----- Scroll reveal (with stagger) ----- */
  $$('.stagger').forEach(group => {
    $$(':scope > .reveal', group).forEach((el, i) => el.style.setProperty('--i', i));
  });
  const revealEls = $$('.reveal, .reveal-left, .reveal-right');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ----- Count-up stats ----- */
  const counters = $$('.stat-num[data-count]');
  counters.forEach(el => {
    // "Years of care" stays correct every year
    if (el.dataset.since) el.dataset.count = new Date().getFullYear() - parseInt(el.dataset.since, 10);
  });
  const finalText = el => el.dataset.count + (el.dataset.suffix || '');
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 2000;
    const start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  if (reduceMotion || !('IntersectionObserver' in window)) {
    counters.forEach(el => { el.textContent = finalText(el); });
  } else {
    const co = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (en.isIntersecting) { countUp(en.target); obs.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => co.observe(el));
  }

  /* ----- Marquee: duplicate items for a seamless loop ----- */
  const track = $('.marquee-track');
  if (track && !reduceMotion) {
    $$('.logo-item', track).forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

  /* ----- Sliders (Swiper) ----- */
  function initSliders() {
    if (typeof Swiper === 'undefined') {
      // CDN unavailable: still show the first hero slide's text
      const first = $('.hero-slide');
      if (first) first.classList.add('swiper-slide-active');
      return;
    }

    new Swiper('.hero-swiper', {
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 1000,
      loop: true,
      autoplay: reduceMotion ? false : { delay: 5000, disableOnInteraction: false },
      navigation: { prevEl: '.hero-prev', nextEl: '.hero-next' },
      pagination: { el: '.hero-pagination', clickable: true },
      keyboard: { enabled: true },
      a11y: { enabled: true }
    });

    new Swiper('.news-swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      grabCursor: true,
      autoplay: reduceMotion ? false : { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true },
      navigation: { prevEl: '.news-prev', nextEl: '.news-next' },
      pagination: { el: '.news-pagination', clickable: true },
      breakpoints: {
        768: { slidesPerView: 2 },
        1200: { slidesPerView: 3 }
      },
      a11y: { enabled: true }
    });
  }
  initSliders(); // scripts are deferred, so Swiper is already loaded here
})();
