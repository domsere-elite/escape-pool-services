/* ═══════════════════════════════════════════════════════════════
   ESCAPE POOL SERVICES — Main Script
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ═══════════════════════════════════════════════════════════════
     CAUSTICS RENDERER
     Renders realistic underwater caustic light patterns on canvas.
     Uses sine wave interference at multiple angles to create the
     characteristic bright-line network pattern.
     ═══════════════════════════════════════════════════════════════ */
  class CausticsRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      // Render at low resolution for performance — CSS scales it up
      this.renderWidth = 160;
      this.renderHeight = 100;
      this.canvas.width = this.renderWidth;
      this.canvas.height = this.renderHeight;
      this.running = false;
      this.startTime = performance.now();
    }

    render(timestamp) {
      const { ctx, renderWidth: w, renderHeight: h } = this;
      const time = (timestamp - this.startTime) / 1000;
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;

      const freq = 0.045;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          // Sum sine waves at different angles for caustic interference
          const t = time * 0.35;
          let v = 0;
          v += Math.sin(x * freq * 1.3 + y * freq * 0.4 + t);
          v += Math.sin(x * freq * -0.7 + y * freq * 1.2 + t * 1.25);
          v += Math.sin(x * freq * 0.4 + y * freq * -1.3 + t * 0.85);
          v += Math.sin(x * freq * 1.1 + y * freq * 0.9 + t * 1.1);
          v += Math.sin((x + y) * freq * 0.5 + t * 0.7) * 0.6;

          // Normalize to 0–1 and sharpen into bright caustic lines
          v = (v + 4.6) / 9.2;
          v = Math.pow(v, 5) * 3.5;
          v = Math.min(v, 1);

          const idx = (y * w + x) * 4;
          // Teal-white caustic color
          data[idx]     = Math.floor(70 + v * 185);  // R
          data[idx + 1] = Math.floor(160 + v * 95);  // G
          data[idx + 2] = Math.floor(170 + v * 85);  // B
          data[idx + 3] = Math.floor(v * 100);        // A — subtle overlay
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }

    start() {
      if (this.running) return;
      this.running = true;
      this.startTime = performance.now();
      const loop = (ts) => {
        if (!this.running) return;
        this.render(ts);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }

    stop() {
      this.running = false;
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     CRACK REVEAL ANIMATION
     Orchestrates the dramatic light-breaking-through-water sequence.
     Timeline:
       0.0s — Dark overlay visible
       0.3s — Crack line begins expanding
       0.5s — Light rays shoot outward, glow expands
       1.2s — Overlay dissolves, caustics fade in
       1.6s — Hero content begins entering
       2.2s — All content visible, ambient caustics loop
     ═══════════════════════════════════════════════════════════════ */
  function runCrackReveal() {
    const overlay = document.getElementById('crackOverlay');
    const canvas = document.getElementById('causticsCanvas');

    if (!overlay || !canvas) return;

    const crackLine = overlay.querySelector('.crack-line');
    const crackGlow = overlay.querySelector('.crack-glow');
    const rays = overlay.querySelectorAll('.ray');

    // Initialize caustics renderer
    const caustics = new CausticsRenderer(canvas);

    // Phase 1 (0.3s): Start the crack line
    setTimeout(() => {
      if (crackLine) crackLine.classList.add('animating');
    }, 300);

    // Phase 2 (0.5s): Start glow expansion and light rays
    setTimeout(() => {
      if (crackGlow) crackGlow.classList.add('animating');
      rays.forEach(ray => ray.classList.add('animating'));
    }, 500);

    // Phase 3 (1.2s): Start caustics, dissolve overlay
    setTimeout(() => {
      caustics.start();
      canvas.classList.add('active');
      overlay.classList.add('dissolving');
    }, 1200);

    // Phase 4 (2.0s): Clean up overlay from DOM
    setTimeout(() => {
      overlay.classList.add('done');
    }, 2000);

    // Pause caustics when tab is hidden to save CPU
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        caustics.stop();
      } else {
        caustics.start();
      }
    });
  }

  // Launch the crack reveal sequence
  runCrackReveal();


  /* ═══════════════════════════════════════════════════════════════
     SITE FUNCTIONALITY
     ═══════════════════════════════════════════════════════════════ */

  /* ─── Header scroll behavior ─── */
  const header = document.getElementById('siteHeader');
  const mobileCta = document.getElementById('mobileCta');
  let lastScroll = 0;

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 60);
    if (mobileCta) {
      mobileCta.classList.toggle('visible', y > 500);
    }
    lastScroll = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─── Mobile menu toggle ─── */
  const toggle = document.getElementById('mobileToggle');
  const nav = document.getElementById('mainNav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ─── Smooth scroll for anchor links ─── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ─── Mobile CTA smooth scroll ─── */
  const mobileQuoteBtn = document.querySelector('.mobile-cta-quote');
  if (mobileQuoteBtn) {
    mobileQuoteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector('#contact');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ─── Scroll reveal (Intersection Observer) ─── */
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const parent = entry.target.parentElement;
          const siblings = parent ? Array.from(parent.querySelectorAll('.reveal')) : [];
          const siblingIndex = siblings.indexOf(entry.target);
          const delay = siblingIndex >= 0 ? siblingIndex * 80 : 0;

          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  /* ─── Select label fix ─── */
  const serviceSelect = document.getElementById('formService');
  if (serviceSelect) {
    serviceSelect.addEventListener('change', () => {
      serviceSelect.classList.toggle('has-value', serviceSelect.value !== '');
    });
  }

  /* ─── Form validation & submission ─── */
  const form = document.getElementById('quoteForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));

      let valid = true;

      const name = document.getElementById('formName');
      if (!name.value.trim()) {
        name.closest('.form-group').classList.add('error');
        valid = false;
      }

      const phone = document.getElementById('formPhone');
      const phoneVal = phone.value.replace(/\D/g, '');
      if (phoneVal.length < 10) {
        phone.closest('.form-group').classList.add('error');
        valid = false;
      }

      const email = document.getElementById('formEmail');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value)) {
        email.closest('.form-group').classList.add('error');
        valid = false;
      }

      const service = document.getElementById('formService');
      if (!service.value) {
        service.closest('.form-group').classList.add('error');
        valid = false;
      }

      if (!valid) {
        const firstError = form.querySelector('.form-group.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        if (formSuccess) {
          formSuccess.classList.add('show');
        }

        // Google Ads conversion tracking (placeholder)
        // gtag('event', 'conversion', { 'send_to': 'AW-YOUR_CONVERSION_ID/YOUR_CONVERSION_LABEL' });

        form.reset();
        if (serviceSelect) serviceSelect.classList.remove('has-value');
      }, 1500);
    });

    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('input', () => {
        field.closest('.form-group').classList.remove('error');
      });
      field.addEventListener('change', () => {
        field.closest('.form-group').classList.remove('error');
      });
    });
  }

  /* ─── Phone number formatting ─── */
  const phoneInput = document.getElementById('formPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let digits = e.target.value.replace(/\D/g, '');
      if (digits.length > 10) digits = digits.slice(0, 10);

      if (digits.length >= 7) {
        e.target.value = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
      } else if (digits.length >= 4) {
        e.target.value = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
      } else if (digits.length > 0) {
        e.target.value = `(${digits}`;
      }
    });
  }

  /* ─── Active nav highlighting ─── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

});
