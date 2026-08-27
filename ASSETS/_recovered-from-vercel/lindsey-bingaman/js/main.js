/**
 * Lindsey Bingaman – main.js
 * Requires: GSAP 3, ScrollTrigger, ScrollToPlugin (loaded via CDN in index.html)
 */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // REGISTER GSAP PLUGINS
  // ============================================

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // ============================================
  // NAVIGATION — scroll state + mobile toggle
  // ============================================

  const nav       = document.getElementById('nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');

  // Add scrolled class after 80px
  ScrollTrigger.create({
    start: 80,
    onEnter:      () => nav.classList.add('is-scrolled'),
    onLeaveBack:  () => nav.classList.remove('is-scrolled'),
  });

  // Mobile menu toggle
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on any link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ============================================
  // SMOOTH ANCHOR SCROLLING
  // ============================================

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      gsap.to(window, {
        duration: 1.2,
        scrollTo: { y: target, offsetY: 80 },
        ease: 'power3.inOut',
      });
    });
  });

  // ============================================
  // HERO — entrance animation
  // ============================================

  const heroTl = gsap.timeline({ delay: 0.25 });

  heroTl
    .to('.hero-eyebrow', {
      opacity: 1, y: 0,
      duration: 0.8,
      ease: 'power3.out',
    })
    .to('.hero-word', {
      opacity: 1, y: 0,
      duration: 1,
      stagger: 0.14,
      ease: 'power4.out',
    }, '-=0.45')
    .to('.hero-sub', {
      opacity: 1, y: 0,
      duration: 0.9,
      ease: 'power3.out',
    }, '-=0.55')
    .to('.hero-ctas', {
      opacity: 1, y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.55')
    .to('.hero-scroll', {
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
    }, '-=0.4');

  // ============================================
  // HERO — parallax on scroll
  // ============================================

  gsap.to('.hero-content', {
    yPercent: 28,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2,
    },
  });

  gsap.to('.hero-bg', {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 2,
    },
  });

  // ============================================
  // PROBLEM — split quote word-by-word reveal
  // ============================================

  const quoteEl = document.querySelector('.problem-quote[data-split]');
  if (quoteEl) {
    // Split text into wrapped words
    const raw   = quoteEl.textContent.trim();
    const words = raw.split(/\s+/);
    quoteEl.innerHTML = words.map(w =>
      `<span class="word"><span class="word-inner">${w}</span></span>\u00A0`
    ).join('');

    gsap.fromTo(
      quoteEl.querySelectorAll('.word-inner'),
      { y: '110%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.75,
        stagger: 0.028,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: quoteEl,
          start: 'top 78%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  // ============================================
  // GENERIC SCROLL REVEALS
  // ============================================

  // Utility: reveal elements matching a selector
  function revealEl(selector, overrides = {}) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    els.forEach(el => {
      gsap.to(el, {
        opacity: 1, x: 0, y: 0,
        duration: overrides.duration ?? 0.9,
        ease: overrides.ease ?? 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: overrides.start ?? 'top 86%',
          toggleActions: 'play none none none',
        },
      });
    });
  }

  revealEl('.reveal-up');
  revealEl('.reveal-left');
  revealEl('.reveal-right');

  // ============================================
  // PACKAGE LIST — staggered slide-in
  // ============================================

  const packageItems = document.querySelectorAll('.package-item');
  packageItems.forEach((item, i) => {
    gsap.to(item, {
      opacity: 1, x: 0,
      duration: 0.65,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 89%',
        toggleActions: 'play none none none',
      },
      delay: i * 0.06,
    });
  });

  // ============================================
  // WHO LIST — staggered slide-in
  // ============================================

  const whoItems = document.querySelectorAll('.who-item');
  whoItems.forEach((item, i) => {
    gsap.to(item, {
      opacity: 1, x: 0,
      duration: 0.55,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 89%',
        toggleActions: 'play none none none',
      },
      delay: i * 0.07,
    });
  });

  // ============================================
  // ABOUT — image subtle parallax
  // ============================================

  gsap.to('.about-image-frame', {
    yPercent: -6,
    ease: 'none',
    scrollTrigger: {
      trigger: '.about',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.8,
    },
  });

  // ============================================
  // CONTACT — background parallax glow
  // ============================================

  gsap.to('.contact-glow', {
    yPercent: -22,
    ease: 'none',
    scrollTrigger: {
      trigger: '.contact',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 2.5,
    },
  });

  // ============================================
  // PROGRESS BAR (optional polish)
  // ============================================

  // Create and inject a thin scroll progress bar at the top
  const bar = document.createElement('div');
  bar.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'height:2px',
    'width:0%',
    'background:linear-gradient(90deg, #00c8ba, #c8a45a)',
    'z-index:200',
    'pointer-events:none',
    'transition:width 0.05s linear',
  ].join(';');
  document.body.appendChild(bar);

  ScrollTrigger.create({
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: self => {
      bar.style.width = (self.progress * 100).toFixed(2) + '%';
    },
  });

});
