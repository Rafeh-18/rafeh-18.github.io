/* ========================================================
   main.js — Rafeh Maddouri Portfolio
   ======================================================== */

/* ── Active nav on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

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
    const group    = btn.dataset.collapseToggle;
    const hidden   = () => document.querySelectorAll(`[data-collapse-hidden="${group}"]`);
    const all      = () => document.querySelectorAll(`[data-collapsible="${group}"] [data-collapse-item]`);
    const container = document.querySelector(`[data-collapsible="${group}"]`);
    const noun     = (container && container.dataset.collapseNoun) || 'items';
    const label    = btn.querySelector('.show-toggle-label');

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
    const noun  = badge.dataset.countNoun || 'items';
    const total = document.querySelectorAll(`[data-collapsible="${group}"] [data-collapse-item]`).length;
    badge.textContent = `${total} ${noun}`;
  });
}

/* ── Contact form ── */
function initContactForm() {
  const form       = document.getElementById('contact-form');
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
});
