/* ========================================================
   main.js — Rafeh Maddouri Portfolio
   ======================================================== */

/* ── Active nav on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

/* ── Smooth nav click ── */
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const id = link.getAttribute('href').slice(1);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ── Scroll reveal ── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger').forEach(el => {
  revealObs.observe(el);
});

/* ── Generic collapsible system ──────────────────────────
 *
 * How to use in HTML:
 *   Add data-collapsible="GROUP_ID" to any container element.
 *   Mark items that should be hidden by default with data-collapse-hidden="GROUP_ID".
 *   A toggle button with data-collapse-toggle="GROUP_ID" will be auto-initialised.
 *
 * The toggle button must exist in the HTML with these attributes:
 *   <button class="show-toggle" data-collapse-toggle="GROUP_ID">
 *     <span class="show-toggle-label"></span>
 *     <span class="show-toggle-arrow">&#9660;</span>
 *   </button>
 *
 * The label text is built automatically from data-collapse-noun (default "items")
 * on the container, e.g. data-collapse-noun="projects".
 * ────────────────────────────────────────────────────── */

function initCollapsibles() {
  document.querySelectorAll('[data-collapse-toggle]').forEach(btn => {
    const group = btn.dataset.collapseToggle;
    const hidden = () => document.querySelectorAll(`[data-collapse-hidden="${group}"]`);
    const all = () => document.querySelectorAll(`[data-collapsible="${group}"] [data-collapse-item]`);
    const container = document.querySelector(`[data-collapsible="${group}"]`);
    const noun = (container && container.dataset.collapseNoun) || 'items';
    const label = btn.querySelector('.show-toggle-label');

    /* Count total items for the label */
    const total = all().length;

    /* Initially hide items marked hidden */
    hidden().forEach(el => el.classList.add('collapsible-hidden'));

    /* Set initial label */
    const hiddenCount = hidden().length;
    if (hiddenCount === 0) {
      btn.style.display = 'none'; /* nothing to expand, hide button */
    } else {
      if (label) label.textContent = `Show all ${total} ${noun}`;
    }

    btn.addEventListener('click', () => {
      const isOpen = btn.classList.contains('open');

      if (isOpen) {
        /* Collapse: re-hide */
        document.querySelectorAll(`[data-collapse-hidden="${group}"]`).forEach(el => {
          el.classList.add('collapsible-hidden');
        });
        btn.classList.remove('open');
        if (label) label.textContent = `Show all ${total} ${noun}`;
      } else {
        /* Expand: show everything */
        document.querySelectorAll(`[data-collapse-hidden="${group}"]`).forEach(el => {
          el.classList.remove('collapsible-hidden');
        });
        btn.classList.add('open');
        if (label) label.textContent = `Show less`;
      }
    });
  });
}

/* ── Update count badges (e.g. cert count pill) ── */
function initCountBadges() {
  document.querySelectorAll('[data-count-badge]').forEach(badge => {
    const group = badge.dataset.countBadge;
    const noun = badge.dataset.countNoun || 'items';
    const total = document.querySelectorAll(`[data-collapsible="${group}"] [data-collapse-item]`).length;
    badge.textContent = `${total} ${noun}`;
  });
}

/* ── Contact form ── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch('https://formspree.io/f/mblakabe', {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        form.reset();
        successMsg.style.display = 'block';
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    }

    btn.textContent = 'Send Message';
    btn.disabled = false;
  });
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  initCollapsibles();
  initCountBadges();
  initContactForm();
  initCertsScroll();
});
/* ── Neural Network Background ── */
(function () {
  const canvas = document.getElementById('neural-bg');
  const ctx = canvas.getContext('2d');
  let W, H, mouse = { x: -9999, y: -9999 };

  const SYMBOLS = ['∑ xᵢ', '∂L/∂w', 'ŷ = σ(Wx)', '∇J(θ)', 'P(y|x)', 'e⁻ˣ²', 'argmax', 'softmax', '‖w‖₂', 'tanh(z)', 'ReLU', 'KL(p‖q)', '𝔼[X]', 'Var(X)', 'N(μ, σ²)', 'p̂', 'cov(X,Y)', 'F1-score',
    'ROC ↗', 'AUC', 'R²', 'f(x) = mx + b', '[1 0 1]', '[0 1 0]', '[x₁, x₂, …]',];
  const NODE_COUNT = 55;
  const PARTICLE_COUNT = 40;
  const CONNECTION_DIST = 160;
  const REPEL_DIST = 120;
  const REPEL_FORCE = 0.012;

  let nodes = [], particles = [], symbols = [], pulses = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randRange(a, b) { return a + Math.random() * (b - a); }

  function initNodes() {
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: randRange(0, W), y: randRange(0, H),
      vx: randRange(-0.18, 0.18), vy: randRange(-0.18, 0.18),
      r: randRange(2, 4.5),
      color: Math.random() < 0.5 ? '#3b82f6' : Math.random() < 0.5 ? '#06b6d4' : '#7c6cf7',
      pulse: 0
    }));
  }

  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: randRange(0, W), y: randRange(0, H),
      vx: randRange(-0.3, 0.3), vy: randRange(-0.3, 0.3),
      alpha: randRange(0.08, 0.22),
      r: randRange(1, 2.2)
    }));
  }

  function initSymbols() {
    symbols = Array.from({ length: 18 }, () => ({
      x: randRange(0, W), y: randRange(0, H),
      vx: randRange(-0.06, 0.06), vy: randRange(-0.06, 0.06),
      text: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      alpha: randRange(0.04, 0.10),
      size: randRange(13, 18)
    }));
  }

  function spawnPulse() {
    const connected = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < CONNECTION_DIST) connected.push([i, j]);
      }
    }
    if (connected.length) {
      const pair = connected[Math.floor(Math.random() * connected.length)];
      pulses.push({ from: pair[0], to: pair[1], t: 0, speed: randRange(0.008, 0.018) });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* connections */
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECTION_DIST) {
          const alpha = (1 - d / CONNECTION_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(124,108,247,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    /* pulses along connections */
    pulses = pulses.filter(p => {
      p.t += p.speed;
      if (p.t > 1) { nodes[p.to].pulse = 8; return false; }
      const nx = nodes[p.from].x + (nodes[p.to].x - nodes[p.from].x) * p.t;
      const ny = nodes[p.from].y + (nodes[p.to].y - nodes[p.from].y) * p.t;
      ctx.beginPath();
      ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6,182,212,0.7)';
      ctx.fill();
      return true;
    });

    /* nodes */
    nodes.forEach(n => {
      const glow = n.pulse > 0 ? n.pulse / 8 : 0;
      if (glow > 0) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 6 * glow, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6,182,212,${0.18 * glow})`;
        ctx.fill();
        n.pulse--;
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.color + 'cc';
      ctx.fill();
    });

    /* particles */
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99,179,237,${p.alpha})`;
      ctx.fill();
    });

    /* math symbols */
    symbols.forEach(s => {
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.font = `300 ${s.size}px 'Inter', system-ui, sans-serif`;
      ctx.fillStyle = '#c4b5fd';
      ctx.filter = 'none';
      ctx.letterSpacing = '0.05em';
      ctx.fillText(s.text, s.x, s.y);
      ctx.restore();
    });
  }

  function update() {
    nodes.forEach(n => {
      const dx = n.x - mouse.x, dy = n.y - mouse.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < REPEL_DIST && d > 0) {
        n.vx += (dx / d) * REPEL_FORCE;
        n.vy += (dy / d) * REPEL_FORCE;
      }
      n.vx *= 0.995; n.vy *= 0.995;
      const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (spd > 0.5) { n.vx = n.vx / spd * 0.5; n.vy = n.vy / spd * 0.5; }
      n.x += n.vx; n.y += n.vy;
      if (n.x < -10) n.x = W + 10;
      if (n.x > W + 10) n.x = -10;
      if (n.y < -10) n.y = H + 10;
      if (n.y > H + 10) n.y = -10;
    });

    particles.forEach(p => {
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 80 && d > 0) { p.vx += (dx / d) * 0.004; p.vy += (dy / d) * 0.004; }
      p.vx *= 0.99; p.vy *= 0.99;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    });

    symbols.forEach(s => {
      s.x += s.vx; s.y += s.vy;
      if (s.x < -40) s.x = W + 40; if (s.x > W + 40) s.x = -40;
      if (s.y < -20) s.y = H + 20; if (s.y > H + 20) s.y = -20;
    });
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); initNodes(); initParticles(); initSymbols(); });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  resize();
  initNodes();
  initParticles();
  initSymbols();

  setInterval(spawnPulse, 800);
  loop();
})();


function initCertsScroll() {
  const certs = [
    { abbr: 'NV', cls: 'nvidia', name: 'Fundamentals of Deep Learning', issuer: 'NVIDIA', year: '2024', desc: 'Neural network basics, CNNs, RNNs, and training best practices using the NVIDIA DLI platform.', tags: ['Deep Learning', 'PyTorch', 'GPU'] },
    { abbr: 'NV', cls: 'nvidia', name: 'Generative AI with Diffusion Models', issuer: 'NVIDIA', year: '2024', desc: 'Diffusion model architectures, DDPM, and latent diffusion for image generation.', tags: ['Diffusion Models', 'GenAI', 'PyTorch'] },
    { abbr: 'KG', cls: 'kaggle', name: 'Intro to Machine Learning', issuer: 'Kaggle', year: '2023', desc: 'Decision trees, random forests, model validation, and missing values with scikit-learn.', tags: ['scikit-learn', 'ML', 'Python'] },
    { abbr: 'CS', cls: 'generic', name: 'Baccalaureate — Computer Science', issuer: '2024', year: '', desc: 'National diploma with a specialisation in Computer Science and Mathematics.', tags: ['Computer Science', 'Maths'] },
    { abbr: 'U', cls: 'generic', name: 'Intro to AI and Gen AI', issuer: 'Udacity', year: '2024', desc: 'AI fundamentals, prompt engineering, and practical applications of generative AI tools.', tags: ['AI', 'Prompt Engineering'] },
    { abbr: 'CC', cls: 'generic', name: 'Cisco AI Technical Practitioner', issuer: 'Cisco', year: '2024', desc: 'AITECH v1.0 — AI/ML concepts, responsible AI, and industry use-cases.', tags: ['AI', 'Networking', 'Cisco'] },
    { abbr: 'DC', cls: 'generic', name: 'AI Engineer for Data Scientists Associate', issuer: 'DataCamp', year: '2025', desc: 'Building, deploying, and evaluating AI-powered solutions as a data scientist.', tags: ['AI Engineering', 'MLOps', 'DataCamp'] },
  ];

  const track = document.getElementById('certs-track');
  if (!track) return;

  [...certs, ...certs].forEach((c, i) => {
    const el = document.createElement('div');
    el.className = 'cert-item';
    el.dataset.idx = i % certs.length;
    el.style.cursor = 'pointer';
    el.innerHTML = `
      <div class="cert-logo ${c.cls}">${c.abbr}</div>
      <div class="cert-info">
        <div class="cert-name">${c.name}</div>
        <div class="cert-issuer">${c.issuer}${c.year ? ' · ' + c.year : ''}</div>
      </div>`;
    track.appendChild(el);
  });

  const modal = document.getElementById('cert-modal');
  const close = document.getElementById('cert-modal-close');

  const openModal = c => {
    document.getElementById('cm-logo').className = 'cert-modal-logo ' + c.cls;
    document.getElementById('cm-logo').textContent = c.abbr;
    document.getElementById('cm-title').textContent = c.name;
    document.getElementById('cm-issuer').textContent = c.issuer + (c.year ? ' · ' + c.year : '');
    document.getElementById('cm-desc').textContent = c.desc;
    document.getElementById('cm-tags').innerHTML = c.tags.map(t => `<span class="cert-modal-tag">${t}</span>`).join('');
    modal.classList.add('open');
  };

  track.addEventListener('click', e => {
    const chip = e.target.closest('.cert-item');
    if (chip) openModal(certs[+chip.dataset.idx]);
  });

  close.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
}