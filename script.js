/**
 * RNW Bookkeeping Solutions — Main Script
 *
 * All functionality is organized into named init functions
 * and called from a single init() on DOMContentLoaded.
 */

/* =============================================
   1. Testimonials — Dots, Observer & Arrows
   ============================================= */
function initTestimonials() {
  const wrapper = document.querySelector('.testimonials-wrapper');
  const cards = wrapper ? wrapper.querySelectorAll('.testimonial-card') : [];
  const dotsContainer = document.getElementById('dots-container');
  const leftArrow = document.querySelector('.testimonial-arrow--left');
  const rightArrow = document.querySelector('.testimonial-arrow--right');

  // Guard: exit if required elements are missing
  if (!wrapper || !cards.length || !dotsContainer) return;

  // --- Create dots ---
  // Clear any pre-existing dots (e.g. from a duplicate wrapper)
  dotsContainer.innerHTML = '';

  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('dot');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to review ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.dot');

  // --- Dot click handlers ---
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      scrollToCard(i);
    });
  });

  // --- IntersectionObserver to sync dots + active card ---
  const observerOptions = { root: wrapper, threshold: 0.6 };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = Array.from(cards).indexOf(entry.target);
        dots.forEach((d) => d.classList.remove('active'));
        if (dots[index]) dots[index].classList.add('active');
      }
    });
  }, observerOptions);

  cards.forEach((card) => observer.observe(card));

  // Snap to first card on load
  wrapper.scrollTo({ left: 0, behavior: 'instant' });

  // --- Arrow navigation ---
  function scrollToCard(index) {
    if (!wrapper || !cards[index]) return;
    const card = cards[index];
    const scrollLeft = card.offsetLeft - (wrapper.offsetWidth - card.offsetWidth) / 2;
    wrapper.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }

  function getCurrentCardIndex() {
    const containerRect = wrapper.getBoundingClientRect();
    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, i) => {
      const cardRect = card.getBoundingClientRect();
      const distance = Math.abs(cardRect.left - containerRect.left);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });

    return closestIndex;
  }

  if (leftArrow) {
    leftArrow.addEventListener('click', () => {
      const current = getCurrentCardIndex();
      const prev = Math.max(0, current - 1);
      scrollToCard(prev);
    });
  }

  if (rightArrow) {
    rightArrow.addEventListener('click', () => {
      const current = getCurrentCardIndex();
      const next = Math.min(cards.length - 1, current + 1);
      scrollToCard(next);
    });
  }
}

/* =============================================
   2. Smooth Scroll — Anchor link navigation
   ============================================= */
function scrollToTarget(hash) {
  if (!hash) return;
  const target = document.querySelector(hash);
  if (!target) return;

  // Account for the sticky nav height
  const nav = document.querySelector('.navbar');
  const navHeight = nav ? nav.offsetHeight : 0;
  const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 10;

  window.scrollTo({ top: targetPosition, behavior: 'smooth' });
}

function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const hash = anchor.getAttribute('href');
    if (hash === '#') return;

    e.preventDefault();
    scrollToTarget(hash);

    // Update URL without causing a scroll jump
    if (history.pushState) {
      history.pushState(null, '', hash);
    }
  });
}

/* =============================================
   3. Count-Up Animation — Stat Numbers
   ============================================= */
function initCountUp() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          const prefix = el.getAttribute('data-prefix') || '';
          const duration = 1500; // ms
          const startTime = performance.now();

          if (isNaN(target)) return; // skip non-numeric

          function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(eased * target);

            el.textContent = prefix + currentValue + suffix;

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              el.textContent = prefix + target + suffix;
            }
          }

          requestAnimationFrame(animate);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.3 }
  );

  statNumbers.forEach((el) => observer.observe(el));
}

/* =============================================
   4. Back-to-Top Button
   ============================================= */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const handleScroll = () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Check initial state
  handleScroll();
}

/* =============================================
   5. Scroll Reveal — Fade-in-up animations
   ============================================= */
function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.card, .testimonial-card, .stat-number, .section-light h2, .section-gray h2'
  );

  if (!elements.length) return;

  elements.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => observer.observe(el));
}

/* =============================================
   6. Form — Loading state on submit
   ============================================= */
function initForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', () => {
    const btn = form.querySelector('.btn');
    if (btn) btn.classList.add('loading');
  });
}

/* =============================================
   7. Mobile Navigation — Hamburger Menu
   ============================================= */
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (!hamburger || !navbar) return;

  // Helper function to close the menu
  function closeMobileNav() {
    navbar.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  // Toggle menu on hamburger click
  hamburger.addEventListener('click', () => {
    const isOpen = navbar.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', isOpen.toString());
  });

  // Close menu when a nav link is clicked
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navbar.classList.contains('nav-open')) {
      closeMobileNav();
    }
  });
}

/* =============================================
   Master Initializer
   ============================================= */
function init() {
  initTestimonials();
  initSmoothScroll();
  initCountUp();
  initBackToTop();
  initScrollReveal();
  initForm();
  initMobileNav();
}

// Kick off once the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}