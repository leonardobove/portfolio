/**
 * Leonardo Bove — Academic Portfolio
 * Main JS: Terminal typewriter, constellation canvas,
 *          research filter, theme toggle, nav mobile, copy BibTeX
 */

// ─── Utility ──────────────────────────────────────────────────────────────────
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function initTheme() {
  const btn = $('#theme-toggle');
  const icon = $('.theme-icon', btn);
  const stored = localStorage.getItem('theme') || 'light';

  document.documentElement.setAttribute('data-theme', stored);
  updateThemeIcon(icon, stored);

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(icon, next);
  });
}

function updateThemeIcon(icon, theme) {
  icon.textContent = theme === 'dark' ? '◐' : '◑';
}

// ─── Mobile Nav ───────────────────────────────────────────────────────────────
function initMobileNav() {
  const toggle = $('.nav__toggle');
  const menu   = $('.nav__menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !expanded);
    menu.classList.toggle('nav__menu--open', !expanded);
  });

  // Close on nav link click
  $$('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('nav__menu--open');
    });
  });
}

// ─── Terminal Typewriter ───────────────────────────────────────────────────────
function initTerminal() {
  const el = $('#terminal-text');
  if (!el) return;

  const lines = [
    'python qubase.py --experiment t1_relaxation',
    'fpga_init --platform rfsoc4x2 --clock 6.144GHz',
    'qick.measure(qubit=0, readout_freq=5.32e9)',
    'calibrate --all-qubits --shots 10000',
  ];

  let lineIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let pauseCount = 0;

  const PAUSE_AFTER = 30; // frames at end of line

  function tick() {
    const line = lines[lineIdx];
    if (!deleting) {
      if (charIdx < line.length) {
        el.textContent = line.slice(0, ++charIdx);
      } else {
        if (pauseCount++ < PAUSE_AFTER) return;
        pauseCount = 0;
        deleting = true;
      }
    } else {
      if (charIdx > 0) {
        el.textContent = line.slice(0, --charIdx);
      } else {
        deleting = false;
        lineIdx = (lineIdx + 1) % lines.length;
      }
    }
  }

  setInterval(tick, 55);
}

// ─── Constellation Canvas ─────────────────────────────────────────────────────
function initConstellation() {
  const canvas = $('#constellation-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const POINT_COUNT = 70;
  const CONNECT_DIST = 130;
  const SPEED = 0.25;

  let points = [];
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomPoint() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
    };
  }

  function init() {
    resize();
    points = Array.from({ length: POINT_COUNT }, randomPoint);
  }

  function getColor() {
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'dark' ? '96, 165, 250' : '29, 78, 216';
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const col = getColor();

    // Update & wrap
    points.forEach(p => {
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
    });

    // Connections
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.35;
          ctx.strokeStyle = `rgba(${col}, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }
      }
    }

    // Dots
    points.forEach(p => {
      ctx.fillStyle = `rgba(${col}, 0.5)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  init();
  draw();
  window.addEventListener('resize', () => { resize(); });
}

// ─── Research Filter ──────────────────────────────────────────────────────────
function initFilter() {
  const btns  = $$('.filter-btn');
  const cards = $$('.paper-card');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      btns.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      cards.forEach(card => {
        if (filter === 'all') {
          card.removeAttribute('data-hidden');
        } else {
          const tags = (card.dataset.tags || '').split(' ');
          if (tags.includes(filter)) {
            card.removeAttribute('data-hidden');
          } else {
            card.setAttribute('data-hidden', 'true');
          }
        }
      });
    });
  });
}

// ─── Copy BibTeX ──────────────────────────────────────────────────────────────
function initCopyBibtex() {
  $$('.bibtex-copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.dataset.target;
      const pre = $(`#${targetId}`);
      if (!pre) return;

      try {
        await navigator.clipboard.writeText(pre.textContent.trim());
        const original = btn.textContent;
        btn.textContent = 'copied!';
        btn.style.color = 'var(--success)';
        setTimeout(() => {
          btn.textContent = original;
          btn.style.color = '';
        }, 2000);
      } catch (_) {
        btn.textContent = 'failed';
      }
    });
  });
}

// ─── Nav scroll style ─────────────────────────────────────────────────────────
function initNavScroll() {
  const nav = $('.nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('nav--scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ─── Active nav link on scroll ────────────────────────────────────────────────
function initScrollSpy() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav__link');
  if (!sections.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('nav__link--active', active);
          link.style.color = active ? 'var(--accent)' : '';
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => obs.observe(s));
}

// ─── Formspree form handling ───────────────────────────────────────────────────
function initContactForm() {
  const form   = $('#contact-form');
  const status = $('#form-status');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(form);
    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        status.textContent = '✓ Message sent. I\'ll respond soon.';
        status.style.color = 'var(--success)';
        form.reset();
      } else {
        status.textContent = '✗ Something went wrong. Please email directly.';
        status.style.color = 'var(--warn)';
      }
    } catch (_) {
      status.textContent = '✗ Network error. Please email directly.';
      status.style.color = 'var(--warn)';
    }
  });
}

// ─── Section entrance animations ─────────────────────────────────────────────
function initReveal() {
  const els = $$('.paper-card, .pub-item, .timeline__item, .about__interests-card, .about__equation-block');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  els.forEach(el => {
    if (!prefersReduced) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
    }
    obs.observe(el);
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  initTerminal();
  initConstellation();
  initFilter();
  initCopyBibtex();
  initNavScroll();
  initScrollSpy();
  initContactForm();
  initReveal();
});
