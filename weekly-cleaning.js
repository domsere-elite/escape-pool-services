/* ═══════════════════════════════════════════════════════════════
   ESCAPE POOL SERVICES — Weekly Cleaning LP
   Minimal interactivity:
     1. Hero caustics canvas (water light effect)
     2. Sticky CTA visibility on scroll
     3. Reveal-on-scroll for sections
     4. ZIP code area checker
     5. Conversion tracking hooks (calls, SMS, form submit)
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── 1. Hero caustics — subtle water-light background ─── */
  const canvas = document.getElementById('causticsCanvas');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let w, h, t = 0;
    const points = [];

    function resize() {
      w = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      h = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      points.length = 0;
      const count = Math.max(20, Math.floor((w * h) / 80000));
      for (let i = 0; i < count; i++) {
        points.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: 60 + Math.random() * 80
        });
      }
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      points.forEach(p => {
        p.x += p.vx + Math.sin(t * 0.001 + p.y * 0.01) * 0.4;
        p.y += p.vy + Math.cos(t * 0.001 + p.x * 0.01) * 0.4;
        if (p.x < -p.r) p.x = w + p.r;
        if (p.x > w + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = h + p.r;
        if (p.y > h + p.r) p.y = -p.r;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        grad.addColorStop(0, 'rgba(107, 196, 196, 0.18)');
        grad.addColorStop(1, 'rgba(107, 196, 196, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      t++;
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ─── 1.5. Smooth scroll #quote into center of viewport ─── */
  // Native CSS scroll-margin handles anchor offset, but for true vertical
  // centering we override the click and use scrollIntoView({block:'center'}).
  // Falls back to default browser behavior if unsupported.
  const quoteForm = document.getElementById('quote');
  if (quoteForm) {
    document.querySelectorAll('a[href="#quote"]').forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        try {
          quoteForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (_) {
          quoteForm.scrollIntoView();
        }
        // Update URL hash without triggering another scroll
        if (history.replaceState) history.replaceState(null, '', '#quote');
        // Focus the first input shortly after scroll settles — UX win on mobile.
        setTimeout(() => {
          const firstInput = quoteForm.querySelector('input:not([type="hidden"]), select, textarea');
          if (firstInput) firstInput.focus({ preventScroll: true });
        }, 600);
      });
    });
  }

  /* ─── 2. Sticky CTA visibility — show after hero ─── */
  const stickyCta = document.getElementById('stickyCta');
  const hero = document.querySelector('.hero');
  if (stickyCta && hero) {
    const showAfter = () => {
      const heroBottom = hero.getBoundingClientRect().bottom;
      const shouldShow = heroBottom < 0;
      stickyCta.classList.toggle('is-visible', shouldShow);
      stickyCta.setAttribute('aria-hidden', String(!shouldShow));
    };
    window.addEventListener('scroll', showAfter, { passive: true });
    showAfter();
  }

  /* ─── 3. Reveal-on-scroll ─── */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* ─── 4. ZIP code service area checker ─── */
  // Covered ZIPs — extend this list as routes grow.
  const SERVICED_ZIPS = new Set([
    '77386', '77389', '77373', '77379', '77380', '77381', '77382', '77384',  // Spring / Woodlands
    '77302', '77303', '77304', '77385', '77301', '77306',                    // Conroe
    '77375', '77377',                                                         // Tomball / Klein
    '77318', '77378',                                                         // Willis
    '77320', '77340', '77341',                                                // Huntsville
    '77358'                                                                   // New Waverly
  ]);

  // Build a result message safely from validated ZIP + a pre-baked link.
  // Using DOM methods (textContent + appendChild) — never innerHTML with user input.
  function renderZipResult(container, zip, isCovered) {
    container.textContent = '';
    container.className = 'areas__zip-result ' + (isCovered ? 'is-yes' : 'is-no');

    if (isCovered) {
      container.appendChild(document.createTextNode('✓ Yes — we cover '));
      const zipNode = document.createElement('strong');
      zipNode.textContent = zip;
      container.appendChild(zipNode);
      container.appendChild(document.createTextNode('. '));
      const link = document.createElement('a');
      link.href = '#quote';
      link.textContent = 'Get your quote →';
      link.style.color = 'inherit';
      link.style.textDecoration = 'underline';
      container.appendChild(link);
    } else {
      container.appendChild(document.createTextNode('We may still cover '));
      const zipNode = document.createElement('strong');
      zipNode.textContent = zip;
      container.appendChild(zipNode);
      container.appendChild(document.createTextNode('. '));
      const link = document.createElement('a');
      link.href = 'tel:+18327646224';
      link.textContent = 'Call us to confirm →';
      link.style.color = 'inherit';
      link.style.textDecoration = 'underline';
      link.dataset.conversion = 'call';
      container.appendChild(link);
    }
  }

  const zipForm = document.getElementById('zipForm');
  const zipInput = document.getElementById('zipCheck');
  const zipResult = document.getElementById('zipResult');
  if (zipForm && zipInput && zipResult) {
    zipForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const zip = (zipInput.value || '').trim();
      if (!/^\d{5}$/.test(zip)) {
        zipResult.textContent = 'Please enter a 5-digit ZIP code.';
        zipResult.className = 'areas__zip-result is-no';
        return;
      }
      renderZipResult(zipResult, zip, SERVICED_ZIPS.has(zip));
    });
  }

  /* ─── 5. Conversion tracking ─────────────────────────────
     [REPLACE] — when you add your Google Ads conversion ID/label
     in weekly-cleaning.html, this will fire events automatically.
     Until then it just no-ops.
     ───────────────────────────────────────────────────────── */
  function fireConversion(type) {
    if (typeof gtag_report_conversion === 'function') {
      try { gtag_report_conversion(); } catch (_) {}
    }
    if (typeof gtag === 'function') {
      try {
        gtag('event', 'lp_action', { event_category: 'engagement', event_label: type });
      } catch (_) {}
    }
  }

  document.querySelectorAll('[data-conversion]').forEach(el => {
    el.addEventListener('click', function () {
      fireConversion(this.dataset.conversion || 'click');
    });
  });

  // Form submit — fire before navigation. Netlify handles the actual POST.
  const form = document.getElementById('quoteForm');
  if (form) {
    form.addEventListener('submit', function () {
      fireConversion('form_submit');
      const btn = document.getElementById('submitBtn');
      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.7';
        const label = btn.querySelector('span');
        if (label) label.textContent = 'Sending…';
      }
    });
  }

  /* ─── 6. Count-up animation on numbers (e.g. $199 price reveal) ─── */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const countTargets = document.querySelectorAll('.count-up');
  if (countTargets.length && 'IntersectionObserver' in window) {
    const animateCount = (el) => {
      const target = parseInt(el.dataset.target || el.textContent, 10);
      if (Number.isNaN(target)) return;
      if (reduceMotion) { el.textContent = String(target); return; }
      const duration = parseInt(el.dataset.duration, 10) || 1200;
      const start = performance.now();
      const startVal = 0;
      const ease = (t) => 1 - Math.pow(1 - t, 3);  // easeOutCubic
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const v = Math.round(startVal + (target - startVal) * ease(t));
        el.textContent = String(v);
        if (t < 1) requestAnimationFrame(step);
      };
      el.textContent = '0';
      requestAnimationFrame(step);
    };

    const countObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    countTargets.forEach(el => countObs.observe(el));
  }

})();
