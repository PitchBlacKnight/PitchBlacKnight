/* ============================================================
   EMPATHY BOOTCAMP — Page JS
   FAQ accordion + category nav highlight + scroll reveals
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. FAQ Accordion ──────────────────────────────────── */
  const faqItems = document.querySelectorAll('.eb-faq-question');

  faqItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen   = btn.getAttribute('aria-expanded') === 'true';
      const panel    = document.getElementById(btn.getAttribute('aria-controls'));

      // Close all others first
      faqItems.forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          const otherPanel = document.getElementById(other.getAttribute('aria-controls'));
          if (otherPanel) otherPanel.style.maxHeight = '0';
        }
      });

      // Toggle this one
      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = '0';
      } else {
        btn.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });

    // Keyboard: space / enter already fire click on <button>
    // Also handle resize — recalculate open panel heights
    window.addEventListener('resize', () => {
      if (btn.getAttribute('aria-expanded') === 'true') {
        const panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ── 2. Category Nav — active link on scroll ───────────── */
  const catLinks   = document.querySelectorAll('.eb-cat-link[href^="#"]');
  const sections   = Array.from(catLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const activateLink = (id) => {
    catLinks.forEach(link => {
      const matches = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('eb-cat-link--active', matches);
    });
  };

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) activateLink(entry.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );
    sections.forEach(sec => obs.observe(sec));
  }

  // Smooth scroll for category links
  catLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        const offset = 120; // nav + category bar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── 3. Reveal on scroll (reuses main site pattern) ───── */
  const revealEls = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right'
  );

  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(el => revealObs.observe(el));
  } else {
    // Fallback — just show everything
    revealEls.forEach(el => el.classList.add('revealed'));
  }

  /* ── 4. Nav scroll state ───────────────────────────────── */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── 5. Mobile nav toggle ──────────────────────────────── */
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      navLinks.classList.toggle('nav-links--open', !expanded);
    });
  }

  /* ── 6. Open first FAQ by default ─────────────────────── */
  const firstBtn = document.querySelector('.eb-faq-question');
  if (firstBtn) {
    firstBtn.click();
  }

});
