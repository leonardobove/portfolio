/**
 * Leonardo Bove — Quantum Portfolio
 * Three.js particle field + GSAP scroll animations
 * ES module; GSAP + ScrollTrigger loaded as UMD scripts before this module.
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

// ─── Grab globals injected by UMD scripts ─────────────────────────────────
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

// ─── Nav scroll effect ─────────────────────────────────────────────────────
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ─── Mobile nav toggle ─────────────────────────────────────────────────────
const navToggle  = document.querySelector('.nav-toggle');
const navMobile  = document.querySelector('.nav-mobile');
const mobileLinks = navMobile ? navMobile.querySelectorAll('a') : [];

function closeMenu() {
  navToggle.classList.remove('open');
  navMobile.classList.remove('open');
  document.body.style.overflow = '';
}

navToggle?.addEventListener('click', () => {
  const open = navMobile.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

// ─── Three.js Particle Field ───────────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.z = 80;

  // Config
  const COUNT     = 150;
  const SPREAD    = 100;
  const CONN_DSQ  = 225;  // connection threshold² (≈15 units)
  const MAX_LINES = COUNT * COUNT; // upper bound for line segments

  // Particle colours: 60 % cyan, 40 % violet
  const cyan   = new THREE.Color(0x00F5FF);
  const violet = new THREE.Color(0x8B5CF6);

  // ── Particles ──
  const positions = new Float32Array(COUNT * 3);
  const colors    = new Float32Array(COUNT * 3);
  const velocities = [];
  const phaseX = [], phaseY = [], phaseZ = [];

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 0.4;

    const c = Math.random() < 0.6 ? cyan : violet;
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    velocities.push(
      (Math.random() - 0.5) * 0.015,
      (Math.random() - 0.5) * 0.015,
      0
    );
    phaseX.push(Math.random() * Math.PI * 2);
    phaseY.push(Math.random() * Math.PI * 2);
    phaseZ.push(Math.random() * Math.PI * 2);
  }

  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  ptGeo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const ptMat = new THREE.PointsMaterial({
    size: 1.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true
  });

  const points = new THREE.Points(ptGeo, ptMat);
  scene.add(points);

  // ── Connection lines ──
  const linePositions = new Float32Array(MAX_LINES * 2 * 3);
  const lineColors    = new Float32Array(MAX_LINES * 2 * 3);

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('color',    new THREE.BufferAttribute(lineColors, 3));
  lineGeo.setDrawRange(0, 0);

  const lineMat = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.25
  }));
  scene.add(lineMat);

  // ── Resize ──
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // ── Mouse tilt ──
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ── Animation loop ──
  let frame = 0;
  const group = new THREE.Group();
  group.add(points);
  group.add(lineMat);
  scene.add(group);
  scene.remove(points);
  scene.remove(lineMat);

  function animate() {
    requestAnimationFrame(animate);
    frame++;
    const t = frame * 0.008;

    // Float particles
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     += velocities[i * 3]     + Math.sin(t + phaseX[i]) * 0.004;
      positions[i * 3 + 1] += velocities[i * 3 + 1] + Math.cos(t + phaseY[i]) * 0.004;

      // Wrap particles back into view
      for (let ax = 0; ax < 2; ax++) {
        const half = ax === 0 ? SPREAD / 2 : SPREAD / 2;
        if (positions[i * 3 + ax] >  half) positions[i * 3 + ax] -= SPREAD;
        if (positions[i * 3 + ax] < -half) positions[i * 3 + ax] += SPREAD;
      }
    }
    ptGeo.attributes.position.needsUpdate = true;

    // Build connection lines
    let lineCount = 0;
    for (let a = 0; a < COUNT - 1; a++) {
      const ax = positions[a * 3], ay = positions[a * 3 + 1], az = positions[a * 3 + 2];
      for (let b = a + 1; b < COUNT; b++) {
        if (lineCount >= MAX_LINES) break;
        const dx = ax - positions[b * 3];
        const dy = ay - positions[b * 3 + 1];
        const dz = az - positions[b * 3 + 2];
        const dsq = dx * dx + dy * dy + dz * dz;
        if (dsq < CONN_DSQ) {
          const alpha = 1 - dsq / CONN_DSQ;
          const li = lineCount * 6;
          linePositions[li]     = ax; linePositions[li + 1] = ay; linePositions[li + 2] = az;
          linePositions[li + 3] = positions[b * 3]; linePositions[li + 4] = positions[b * 3 + 1]; linePositions[li + 5] = positions[b * 3 + 2];

          const ca = colors[a * 3], cb = colors[b * 3];
          lineColors[li]     = ca * alpha;   lineColors[li + 1] = colors[a * 3 + 1] * alpha; lineColors[li + 2] = colors[a * 3 + 2] * alpha;
          lineColors[li + 3] = cb * alpha;   lineColors[li + 4] = colors[b * 3 + 1] * alpha; lineColors[li + 5] = colors[b * 3 + 2] * alpha;

          lineCount++;
        }
      }
      if (lineCount >= MAX_LINES) break;
    }
    lineGeo.setDrawRange(0, lineCount * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;

    // Subtle mouse tilt
    group.rotation.y = mouseX * 0.08;
    group.rotation.x = mouseY * 0.04;

    renderer.render(scene, camera);
  }

  animate();
})();

// ─── GSAP Scroll Animations ────────────────────────────────────────────────
(function initScrollAnimations() {
  if (!gsap || !ScrollTrigger) return;

  const defaults = {
    opacity: 0,
    y: 30,
    duration: 0.75,
    ease: 'power2.out'
  };

  // Section headers
  document.querySelectorAll('.section-header').forEach(el => {
    gsap.from(el, {
      ...defaults,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    });
  });

  // About grid
  const aboutGrid = document.querySelector('.about-grid');
  if (aboutGrid) {
    gsap.from(aboutGrid.querySelector('.about-img-wrap'), {
      ...defaults,
      x: -40,
      y: 0,
      scrollTrigger: { trigger: aboutGrid, start: 'top 85%', toggleActions: 'play none none none' }
    });
    gsap.from(aboutGrid.querySelector('.about-text'), {
      ...defaults,
      x: 40,
      y: 0,
      delay: 0.15,
      scrollTrigger: { trigger: aboutGrid, start: 'top 85%', toggleActions: 'play none none none' }
    });
  }

  // Timeline items
  document.querySelectorAll('.timeline-item').forEach((el, i) => {
    gsap.from(el, {
      ...defaults,
      x: -20,
      delay: i * 0.1,
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Project cards
  document.querySelectorAll('.project-card').forEach((el, i) => {
    gsap.from(el, {
      ...defaults,
      delay: (i % 3) * 0.1,
      scrollTrigger: {
        trigger: el,
        start: 'top 92%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Skill groups
  document.querySelectorAll('.skill-group').forEach((el, i) => {
    gsap.from(el, {
      ...defaults,
      delay: (i % 3) * 0.08,
      scrollTrigger: {
        trigger: el,
        start: 'top 92%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Education + extras cards
  document.querySelectorAll('.edu-card, .extras-card').forEach((el, i) => {
    gsap.from(el, {
      ...defaults,
      delay: (i % 2) * 0.1,
      scrollTrigger: {
        trigger: el,
        start: 'top 92%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Contact section
  const contactWrap = document.querySelector('.contact-wrap');
  if (contactWrap) {
    gsap.from(contactWrap, {
      ...defaults,
      scrollTrigger: {
        trigger: contactWrap,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  }
})();
