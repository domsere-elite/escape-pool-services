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

  /* ─── 1. Smooth scroll #quote into view ─── */
  // On mobile we use block:'start' so the form's TOP lands below the sticky header,
  // not behind the keyboard. On desktop we center the form for visual balance.
  const quoteForm = document.getElementById('quote');
  const isMobile = () => window.matchMedia('(max-width: 760px)').matches;
  if (quoteForm) {
    document.querySelectorAll('a[href="#quote"]').forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const block = isMobile() ? 'start' : 'center';
        try {
          quoteForm.scrollIntoView({ behavior: 'smooth', block });
        } catch (_) {
          quoteForm.scrollIntoView();
        }
        if (history.replaceState) history.replaceState(null, '', '#quote');
        // Don't auto-focus on mobile — popping the keyboard before the user
        // sees the form context can be jarring. Desktop: focus first input.
        if (!isMobile()) {
          setTimeout(() => {
            const firstInput = quoteForm.querySelector('input:not([type="hidden"]):not(.hp-field input), select, textarea');
            if (firstInput) firstInput.focus({ preventScroll: true });
          }, 600);
        }
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
  function renderZipResult(container, zip, isCovered, baseClass) {
    container.textContent = '';
    container.className = baseClass + ' ' + (isCovered ? 'is-yes' : 'is-no');

    if (isCovered) {
      container.appendChild(document.createTextNode('✓ Yes — we cover '));
      const zipNode = document.createElement('strong');
      zipNode.textContent = zip;
      container.appendChild(zipNode);
      container.appendChild(document.createTextNode('.'));
    } else {
      container.appendChild(document.createTextNode('We may still cover '));
      const zipNode = document.createElement('strong');
      zipNode.textContent = zip;
      container.appendChild(zipNode);
      container.appendChild(document.createTextNode('. '));
      const link = document.createElement('a');
      link.href = 'tel:+18327646224';
      link.textContent = 'Call to confirm →';
      link.dataset.conversion = 'call';
      container.appendChild(link);
    }
  }

  /* Areas-section ZIP checker (in the dark "Service area" panel) */
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
      renderZipResult(zipResult, zip, SERVICED_ZIPS.has(zip), 'areas__zip-result');
    });
  }

  /* Hero-form inline ZIP feedback — qualifies the lead before the rest of
     the form is filled. Soft check: never blocks submit, just informs. */
  const heroZip = document.getElementById('formZip');
  const heroZipFeedback = document.getElementById('zipFeedback');
  if (heroZip && heroZipFeedback) {
    const checkHeroZip = () => {
      const zip = (heroZip.value || '').trim();
      if (!/^\d{5}$/.test(zip)) {
        heroZipFeedback.textContent = '';
        heroZipFeedback.className = 'zip-feedback';
        return;
      }
      renderZipResult(heroZipFeedback, zip, SERVICED_ZIPS.has(zip), 'zip-feedback');
    };
    heroZip.addEventListener('input', checkHeroZip);
    heroZip.addEventListener('blur', checkHeroZip);
  }

  /* ─── 5. Engagement tracking ─────────────────────────────
     The form-submit Ads conversion fires automatically on /thank-you.html
     page-load (URL-contains rule). The events below are GA4 engagement
     signals only — useful for diagnosing CTR mix but not Ads conversions.
     ───────────────────────────────────────────────────────── */
  function fireEngagement(type) {
    if (typeof gtag === 'function') {
      try {
        gtag('event', 'lp_action', { event_category: 'engagement', event_label: type });
      } catch (_) {}
    }
  }

  document.querySelectorAll('[data-conversion]').forEach(el => {
    el.addEventListener('click', function () {
      fireEngagement(this.dataset.conversion || 'click');
    });
  });

  // Form submit — fire engagement event then let Netlify handle the POST + redirect.
  const form = document.getElementById('quoteForm');
  if (form) {
    form.addEventListener('submit', function () {
      fireEngagement('form_submit');
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
