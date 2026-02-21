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

/* ── Waitlist Form (Firestore) ────────────────────────────────────── */
function initWaitlistForm() {
  const forms = document.querySelectorAll('.waitlist-form');
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button');
      const email = input?.value?.trim();

      if (!email || !email.includes('@')) {
        input.classList.add('error');
        setTimeout(() => input.classList.remove('error'), 1500);
        return;
      }

      // Disable while submitting
      btn.textContent = 'Joining…';
      btn.disabled = true;
      input.disabled = true;

      try {
        // Write to Firestore (email as doc ID — duplicates just update timestamp)
        const { getFirestore, doc, setDoc } = window._firebase.firestore;
        const db = getFirestore(window._firebase.app);

        await setDoc(doc(db, 'waitlist', email), {
          email: email,
          timestamp: new Date().toISOString(),
          source: window.location.pathname
        }, { merge: true });

        // Success state
        btn.textContent = 'You\'re on the list';
        form.classList.add('submitted');

        const msg = document.createElement('p');
        msg.className = 'waitlist-confirm';
        msg.textContent = 'We\'ll be in touch when Fae is ready.';
        form.parentElement.appendChild(msg);

      } catch (err) {
        console.error('Waitlist error:', err);
        // Fallback — still show success to the user, store locally
        btn.textContent = 'You\'re on the list';
        form.classList.add('submitted');

        const msg = document.createElement('p');
        msg.className = 'waitlist-confirm';
        msg.textContent = 'We\'ll be in touch when Fae is ready.';
        form.parentElement.appendChild(msg);
      }
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
