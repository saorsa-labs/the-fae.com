/**
 * Fae Website — Shared Interactions
 * Navigation, scroll animations, mobile menu, waitlist form.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavScroll();
  initMobileMenu();
  initScrollAnimations();
  initWaitlistForm();
  initSmoothScroll();
});

/* ── Sticky Nav ──────────────────────────────────────────────────── */
function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => {
    if (window.scrollY > 40) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Mobile Menu ─────────────────────────────────────────────────── */
function initMobileMenu() {
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    links.classList.toggle('is-open');
    const isOpen = links.classList.contains('is-open');
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });
}

/* ── Scroll Animations (IntersectionObserver) ────────────────────── */
function initScrollAnimations() {
  const els = document.querySelectorAll('[data-animate]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.animateDelay || 0;
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  els.forEach(el => observer.observe(el));
}

/* ── Waitlist Form ───────────────────────────────────────────────── */
function initWaitlistForm() {
  const forms = document.querySelectorAll('.waitlist-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button');
      const email = input?.value?.trim();

      if (!email || !email.includes('@')) {
        input.classList.add('error');
        setTimeout(() => input.classList.remove('error'), 1500);
        return;
      }

      // Store locally (no backend yet)
      const stored = JSON.parse(localStorage.getItem('fae_waitlist') || '[]');
      if (!stored.includes(email)) {
        stored.push(email);
        localStorage.setItem('fae_waitlist', JSON.stringify(stored));
      }

      // Success state
      btn.textContent = 'You\'re on the list';
      btn.disabled = true;
      input.disabled = true;
      form.classList.add('submitted');

      // Show confirmation
      const msg = document.createElement('p');
      msg.className = 'waitlist-confirm';
      msg.textContent = 'We\'ll be in touch when Fae is ready.';
      form.parentElement.appendChild(msg);
    });
  });
}

/* ── Smooth Scroll for Anchor Links ──────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}
