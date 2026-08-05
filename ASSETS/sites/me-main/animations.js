/* ─── PBK Animation Engine ─── */
(function () {
  'use strict';

  /* Respect reduced motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── Device detection ─────────────────────────── */
  var isTouch  = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  var isMobile = window.innerWidth < 860;

  /* ══════════════════════════════════════════════
     1. CUSTOM CURSOR
  ══════════════════════════════════════════════ */
  if (!isTouch) {
    var dot  = document.createElement('div');
    var ring = document.createElement('div');
    dot.className  = 'pbk-cursor-dot';
    ring.className = 'pbk-cursor-ring';
    document.body.appendChild(ring);
    document.body.appendChild(dot);

    var mx = -300, my = -300;
    var rx = -300, ry = -300;

    /* Dot snaps to mouse immediately */
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });

    /* Ring lags behind with lerp */
    (function lerpRing() {
      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(lerpRing);
    })();

    /* Hover expand */
    document.addEventListener('mouseover', function (e) {
      var el = e.target.closest(
        'a, button, .project-card, .mix-card, .svc-card, [role="button"]'
      );
      ring.classList.toggle('hover', !!el);
    });

    /* Click shrink */
    document.addEventListener('mousedown', function () { ring.classList.add('clicking'); });
    document.addEventListener('mouseup',   function () { ring.classList.remove('clicking'); });

    /* Hide when leaving window */
    document.addEventListener('mouseleave', function () {
      dot.style.opacity  = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      dot.style.opacity  = '';
      ring.style.opacity = '';
    });
  }

  /* ══════════════════════════════════════════════
     2. SCROLL REVEAL — individual elements
  ══════════════════════════════════════════════ */
  var REVEAL_SELECTORS = [
    /* Main site */
    '.sec-head', '.sec-intro',
    '.hero-disciplines', '.hero-bio', '.hero-tags',
    '.prac-header', '.prac-key', '.prac-val',
    '.contact-hed', '.contact-body',
    /* Case studies */
    '.hero-dek', '.meta-strip', '.skills',
    'h2.sec-title', '.sec-label',
    '.prose', '.pull', '.pillar', '.smallnote',
    '.cs-list', '.cs-footer',
  ];

  var STAGGER_SELECTORS = [
    /* Main site grids — stagger children */
    '.music-grid',
    '.services-grid',
    '.caps-grid',
    /* Case study grids */
    '.two-col',
    '.stats',
  ];

  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el    = entry.target;
        var delay = parseInt(el.dataset.pbkDelay || '0', 10);
        setTimeout(function () {
          el.classList.add('pbk-visible');
        }, delay);
        revealObs.unobserve(el);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -48px 0px' });

  REVEAL_SELECTORS.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      /* Skip elements inside modals */
      if (!el.closest('.modal-overlay, .modal-panel')) {
        el.classList.add('pbk-hidden');
        revealObs.observe(el);
      }
    });
  });

  /* ── Stagger grid children ────────────────────── */
  STAGGER_SELECTORS.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (container) {
      var children = Array.from(container.children);
      children.forEach(function (child, i) {
        child.classList.add('pbk-hidden');
        child.style.transitionDelay = (i * 75) + 'ms';
      });

      var obs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          children.forEach(function (child) { child.classList.add('pbk-visible'); });
          obs.unobserve(container);
        }
      }, { threshold: 0.05 });
      obs.observe(container);
    });
  });

  /* ── Project grid — stagger but with slight scale ── */
  document.querySelectorAll('.project-grid').forEach(function (grid) {
    var cards = Array.from(grid.children);
    /* Don't hide DS-cards (they navigate on click); still stagger them */
    cards.forEach(function (card, i) {
      card.classList.add('pbk-hidden');
      card.style.transitionDelay = (i * 60) + 'ms';
    });

    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        cards.forEach(function (card) { card.classList.add('pbk-visible'); });
        obs.unobserve(grid);
      }
    }, { threshold: 0.04 });
    obs.observe(grid);
  });

  /* ── Figure (case study images) ──────────────── */
  document.querySelectorAll('figure').forEach(function (fig) {
    fig.classList.add('pbk-hidden');
    revealObs.observe(fig);
  });

  /* ══════════════════════════════════════════════
     3. HERO ENTRANCE
  ══════════════════════════════════════════════ */

  /* ── Case study pages ── */
  var csHero = document.querySelector('.hero');
  if (csHero) {
    var csItems = csHero.querySelectorAll(
      '.hero-eyebrow, .title, .hero-dek, .meta-strip, .skills, .impact-row'
    );
    csItems.forEach(function (el, i) {
      el.style.animationDelay = (i * 130) + 'ms';
      el.classList.add('pbk-hero-item');
    });
  }

  /* ── Main portfolio hero ── */
  var mainHero = document.getElementById('hero');
  if (mainHero) {
    var heroSeq = [
      '.hero-overline',
      '.hero-name',
      '.hero-disciplines',
      '.hero-bio',
      '.hero-tags',
    ];
    heroSeq.forEach(function (sel, i) {
      var el = mainHero.querySelector(sel);
      if (el) {
        el.style.animationDelay = (i * 145) + 'ms';
        el.classList.add('pbk-hero-item');
      }
    });
  }

  /* ══════════════════════════════════════════════
     4. COUNT-UP — impact-row & stats numbers
  ══════════════════════════════════════════════ */
  function runCountUp(el) {
    /* First child text node holds the number */
    var node = el.firstChild;
    if (!node || node.nodeType !== 3 /* TEXT_NODE */) return;
    var raw = node.textContent.trim();
    var num = parseFloat(raw.replace(/,/g, ''));
    if (isNaN(num) || num <= 0 || num > 50000) return;

    var dur   = Math.min(1400, 500 + num * 6);
    var start = null;

    (function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      /* Ease-out cubic */
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = Math.round(eased * num);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        node.textContent = raw; /* restore exact original */
      }
    })(performance.now());
  }

  var countObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.n').forEach(runCountUp);
        countObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  document.querySelectorAll('.impact-row, .stats').forEach(function (el) {
    countObs.observe(el);
  });

  /* ══════════════════════════════════════════════
     5. SIDEBAR NAV ACTIVE STATE (main portfolio)
  ══════════════════════════════════════════════ */
  var sidebarLinks = document.querySelectorAll('.nav-index a');
  if (sidebarLinks.length) {
    var navIds = Array.from(sidebarLinks)
      .map(function (a) { return (a.getAttribute('href') || '').replace('#', ''); })
      .filter(Boolean);

    var updateNav = function () {
      var thresh  = window.innerHeight * 0.45;
      var current = navIds[0];
      navIds.forEach(function (id) {
        var s = document.getElementById(id);
        if (s && s.getBoundingClientRect().top <= thresh) current = id;
      });
      sidebarLinks.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
      });
    };
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  /* ══════════════════════════════════════════════
     6. MAGNETIC / TILT HOVER on cards
  ══════════════════════════════════════════════ */
  if (!isTouch) {
    document.querySelectorAll(
      '.project-card, .mix-card, .svc-card'
    ).forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r   = card.getBoundingClientRect();
        var cx  = r.left + r.width  / 2;
        var cy  = r.top  + r.height / 2;
        var dx  = (e.clientX - cx) / (r.width  / 2); /* -1 … 1 */
        var dy  = (e.clientY - cy) / (r.height / 2);
        var tx  = dx * 3.5;   /* px nudge */
        var ty  = dy * 2.5;
        card.style.transform = 'translate(' + tx + 'px,' + ty + 'px) translateY(var(--card-lift,0px))';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ══════════════════════════════════════════════
     7. SECTION NAV ACTIVE (case study pages)
  ══════════════════════════════════════════════ */
  /* Each case study page already has its own section-nav JS that tracks
     active state. This engine leaves it alone; the CSS handles the visual. */

})();
