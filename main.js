
'use strict';


function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }


(function initNavbar() {
  const navbar     = qs('.navbar');
  const toggle     = qs('.nav-toggle');
  const mobileMenu = qs('.mobile-menu');
  const closeBtn   = qs('.mobile-close');
  const mobileLinks = qsa('.mobile-menu a');

  if (!navbar) return;

  // Scroll effect
  const updateNavbar = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // Mobile menu open
  const openMenu = () => {
    mobileMenu.removeAttribute('hidden');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  // Mobile menu close
  const closeMenu = () => {
    mobileMenu.setAttribute('hidden', '');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on backdrop click
  mobileMenu?.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMenu();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.hasAttribute('hidden')) closeMenu();
  });
})();

(function initFAQ() {
  qsa('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer   = qs(`#${answerId}`);

      if (!answer) return;

      // Collapse others
      qsa('.faq-question').forEach(otherBtn => {
        if (otherBtn === btn) return;
        const otherId  = otherBtn.getAttribute('aria-controls');
        const otherAns = qs(`#${otherId}`);
        otherBtn.setAttribute('aria-expanded', 'false');
        if (otherAns) otherAns.hidden = true;
      });

      // Toggle this
      btn.setAttribute('aria-expanded', String(!expanded));
      answer.hidden = expanded;
    });
  });
})();


/* ============================================================
   CONTACT FORM — validation + pseudo-submission
   ============================================================ */
(function initContactForm() {
  const form       = qs('#contact-form');
  if (!form) return;

  const submitBtn  = qs('#form-submit', form);
  const btnText    = qs('.btn-text', submitBtn);
  const btnLoading = qs('.btn-loading', submitBtn);
  const successMsg = qs('.form-success', form);

  // Validate a single field
  function validateField(field) {
    const group    = field.closest('.form-group');
    const errorEl  = qs('.form-error', group);
    let error = '';

    if (field.required && !field.value.trim()) {
      error = 'Este campo es obligatorio.';
    } else if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      error = 'Por favor ingresa un correo válido.';
    }

    group?.classList.toggle('form-group--error', !!error);
    if (errorEl) errorEl.textContent = error;
    return !error;
  }

  // Live validation on blur
  qsa('input[required], input[type="email"]', form).forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.closest('.form-group')?.classList.contains('form-group--error')) {
        validateField(field);
      }
    });
  });

  // Submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all required fields
    const requiredFields = qsa('input[required]', form);
    const valid = requiredFields.map(f => validateField(f)).every(Boolean);
    if (!valid) return;

    // Show loading state
    btnText.hidden = true;
    btnLoading.removeAttribute('hidden');
    submitBtn.disabled = true;

    // Simulate network request
    await new Promise(r => setTimeout(r, 1600));

    // Show success
    form.style.display = 'none';
    successMsg.removeAttribute('hidden');

    // Track (if analytics available)
    if (typeof gtag === 'function') {
      gtag('event', 'form_submit', { event_category: 'contact', event_label: 'monarca_ulje' });
    }
  });
})();


/* ============================================================
   SCROLL REVEAL — Intersection Observer
   ============================================================ */
(function initScrollReveal() {
  const elements = qsa('.reveal');
  if (!elements.length) return;

  // Respect reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();


/* ============================================================
   AUTO-APPLY REVEAL CLASSES to key elements
   ============================================================ */
(function applyRevealClasses() {
  const targets = [
    { sel: '.section-header', delay: 0 },
    { sel: '.benefit-card',   delay: 1 },
    { sel: '.ingredient-item',delay: 1 },
    { sel: '.product-card',   delay: 1 },
    { sel: '.testimonial-card',delay: 1 },
    { sel: '.transform-card', delay: 1 },
    { sel: '.stat-item',      delay: 1 },
    { sel: '.timeline-item',  delay: 1 },
    { sel: '.faq-item',       delay: 0 },
    { sel: '.founder-visual', delay: 0 },
    { sel: '.founder-text',   delay: 1 },
  ];

  targets.forEach(({ sel, delay }) => {
    qsa(sel).forEach((el, i) => {
      el.classList.add('reveal');
      if (delay && i < 5) {
        el.classList.add(`reveal-delay-${i + 1}`);
      }
    });
  });

  // Re-init observer after applying classes
  const elements = qsa('.reveal');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  elements.forEach(el => observer.observe(el));
})();


/* ============================================================
   SMOOTH SCROLL for anchor links with offset for fixed navbar
   ============================================================ */
(function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const target = qs(anchor.getAttribute('href'));
    if (!target) return;

    e.preventDefault();
    const offset = 80; // navbar height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: 'smooth' });
  });
})();


/* ============================================================
   MARQUEE PAUSE ON HOVER / FOCUS
   ============================================================ */
(function initMarquee() {
  const band  = qs('.ticker');
  const track = qs('.ticker-track');
  if (!band || !track) return;

  band.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
  band.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
})();


/* ============================================================
   PRODUCT CARD HOVER — subtle tilt (desktop only)
   ============================================================ */
(function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  qsa('.product-card, .testimonial-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-6px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.22,0.61,0.36,1)';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
})();
