import React, { useEffect, useMemo, useRef, useState } from "react";
import { PHONE_DISPLAY, PHONE_TEL, SMS_BODY } from "./shared.jsx";
import { track, getAttribution, handoffLead, DEFAULT_ANGLE } from "./track.js";
import "./v2.css";

/* ============================================================
   Production landing page.
   - Prerendered to static HTML at build time (see entry-server.jsx)
     and hydrated on the client.
   - Conversion mechanics: full attribution on every lead, visible
     inline validation, phone auto-formatting, instrumented funnel
     (form_start / form_error / zip_check / scroll_depth / cta_click).
   ============================================================ */

function Phone({ kind = "call", placement, className, children }) {
  const href = kind === "sms" ? `sms:${PHONE_TEL}?&body=${SMS_BODY}` : `tel:${PHONE_TEL}`;
  return (
    <a href={href} className={className} onClick={() => track(`${kind}_click`, { placement })}>
      {children}
    </a>
  );
}

function QuoteLink({ placement, className, children }) {
  return (
    <a href="#quote" className={className} onClick={() => track("cta_click", { placement })}>
      {children}
    </a>
  );
}

function Check({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CallGlyph({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function SmsGlyph({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function Logo() {
  return (
    <a href="/" className="v2-logo" aria-label="Escape Pool Services">
      <svg viewBox="0 0 60 60" width="34" height="34" fill="none" aria-hidden="true">
        <line x1="18" y1="10" x2="20.5" y2="14.8" stroke="#DD9A2B" strokeWidth="3" strokeLinecap="round" />
        <line x1="30" y1="5" x2="30" y2="11" stroke="#DD9A2B" strokeWidth="3" strokeLinecap="round" />
        <line x1="42" y1="10" x2="39.5" y2="14.8" stroke="#DD9A2B" strokeWidth="3" strokeLinecap="round" />
        <circle cx="30" cy="24" r="9" fill="#DD9A2B" />
        <path d="M6 42 Q14 38, 22 42 T38 42 T54 42" stroke="#0E8C9E" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M6 50 Q14 46, 22 50 T38 50 T54 50" stroke="#0E8C9E" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
      </svg>
      <span className="v2-logo-word">
        <b>Escape</b>
        <span>Pool Services</span>
      </span>
    </a>
  );
}

/* ---------- lead form: the "service ticket" ---------- */

const SERVICED_ZIPS = new Set([
  "77386", "77389", "77373", "77379", "77380", "77381", "77382", "77384",
  "77302", "77303", "77304", "77385", "77301", "77306",
  "77375", "77377", "77318", "77378", "77320", "77340", "77341", "77358",
]);

function formatPhone(value) {
  const d = value.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function TicketForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zip, setZip] = useState("");
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const startedRef = useRef(false);

  function onFirstFocus() {
    if (!startedRef.current) {
      startedRef.current = true;
      track("form_start");
    }
  }

  useEffect(() => {
    if (zip.length === 5) track("zip_check", { in_area: SERVICED_ZIPS.has(zip), zip });
  }, [zip]);

  const zipChip = zip.length === 5
    ? SERVICED_ZIPS.has(zip)
      ? { ok: true, text: `Yes — ${zip} is on our routes.` }
      : { ok: false, text: `${zip} may be in range — call to confirm.` }
    : null;

  function validate() {
    const e = {};
    if (!name.trim()) e.name = "Tell us who to text back.";
    if (phone.replace(/\D/g, "").length !== 10) e.phone = "Enter a 10-digit phone number.";
    if (!/^\d{5}$/.test(zip)) e.zip = "Enter your 5-digit ZIP.";
    setErrors(e);
    if (Object.keys(e).length) track("form_error", { fields: Object.keys(e).join(",") });
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate() || sending) return;
    setSending(true);
    track("form_submit");
    handoffLead({ name, phone, zip });

    const attr = getAttribution();
    try {
      const body = new URLSearchParams({
        "form-name": "weekly-quote",
        "bot-field": "",
        name,
        phone,
        zip,
        variant: "v2",
        ...attr,
      });
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
    } catch (err) {
      console.error("[lead-submit] netlify post failed:", err);
    }
    window.location.href = "/thank-you.html";
  }

  return (
    <aside className="v2-ticket v2-rise v2-rise-5" id="quote">
      <div className="v2-stamp">Filter clean incl.<br />$125 value</div>
      <div className="v2-ticket-head">
        <h2>Free quote</h2>
        <small>~30 seconds</small>
      </div>
      <div className="v2-ticket-perf" aria-hidden="true" />
      <div className="v2-ticket-body">
        <p className="v2-ticket-lede">
          <b>A real person texts you a flat-rate quote</b> within the hour, Mon–Sat business hours. No site visit needed for most pools.
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="v2-field">
            <label htmlFor="v2-name">Your name</label>
            <input
              id="v2-name"
              type="text"
              autoComplete="name"
              placeholder="First and last"
              value={name}
              aria-invalid={!!errors.name}
              onFocus={onFirstFocus}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <span className="v2-field-err" role="alert">{errors.name}</span>}
          </div>
          <div className="v2-field">
            <label htmlFor="v2-phone">Mobile number</label>
            <input
              id="v2-phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="(832) 555-0123"
              value={phone}
              aria-invalid={!!errors.phone}
              onFocus={onFirstFocus}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
            />
            {errors.phone && <span className="v2-field-err" role="alert">{errors.phone}</span>}
          </div>
          <div className="v2-field">
            <label htmlFor="v2-zip">ZIP code</label>
            <input
              id="v2-zip"
              type="text"
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={5}
              placeholder="77386"
              value={zip}
              aria-invalid={!!errors.zip}
              onFocus={onFirstFocus}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
            />
            {errors.zip && <span className="v2-field-err" role="alert">{errors.zip}</span>}
            {zipChip && (
              <span className={`v2-zip-chip ${zipChip.ok ? "v2-zip-chip--ok" : "v2-zip-chip--maybe"}`}>
                {zipChip.ok ? "✓ " : ""}{zipChip.text}
              </span>
            )}
          </div>
          <button type="submit" className="v2-btn v2-btn--primary" disabled={sending}>
            {sending ? "Sending…" : "Text me my quote"}
          </button>
          <p className="v2-consent">
            By submitting you agree to receive a call/text about your quote. Reply STOP to opt out. No spam, ever.
          </p>
        </form>
        <div className="v2-ticket-alt">
          <Phone kind="call" placement="ticket"><CallGlyph /> Call instead</Phone>
          <Phone kind="sms" placement="ticket"><SmsGlyph /> Text us</Phone>
        </div>
      </div>
    </aside>
  );
}

/* ---------- before/after slider ---------- */

function BeforeAfter() {
  const [pos, setPos] = useState(58);
  const draggedRef = useRef(false);
  function onDrag(v) {
    setPos(v);
    if (!draggedRef.current) {
      draggedRef.current = true;
      track("ba_slider");
    }
  }
  return (
    <div>
      <div className="v2-ba" style={{ "--pos": `${pos}%` }}>
        <img src="/assets/pool-before.webp" alt="Pool before Escape's service — green, algae-filled water" loading="lazy" />
        <img className="v2-ba-after" src="/assets/pool-after.webp" alt="The same pool after two weeks of weekly service — clear blue water" loading="lazy" />
        <span className="v2-ba-tag v2-ba-tag--before">Before</span>
        <span className="v2-ba-tag v2-ba-tag--after">After · 2 weeks</span>
        <div className="v2-ba-divider">
          <span className="v2-ba-knob" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 7 3 12 8 17" /><polyline points="16 7 21 12 16 17" /></svg>
          </span>
        </div>
        <input
          className="v2-ba-range"
          type="range"
          min="0"
          max="100"
          value={pos}
          aria-label="Drag to compare the pool before and after service"
          onChange={(e) => onDrag(Number(e.target.value))}
        />
      </div>
      <p className="v2-ba-credit">Lauren P.'s pool in Spring — taken over green, swimmable in two weeks. Drag to compare.</p>
    </div>
  );
}

/* ---------- sticky mobile dock ---------- */

function Dock() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const hero = document.querySelector(".v2-hero");
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting));
    io.observe(hero);
    return () => io.disconnect();
  }, []);
  return (
    <nav className="v2-dock" data-visible={visible} aria-label="Quick contact">
      <Phone kind="call" placement="dock"><CallGlyph /> Call</Phone>
      <Phone kind="sms" placement="dock"><SmsGlyph /> Text</Phone>
      <QuoteLink placement="dock" className="is-primary">Free quote</QuoteLink>
    </nav>
  );
}

/* ---------- scroll-depth instrumentation ---------- */

function useScrollDepth() {
  useEffect(() => {
    const marks = [25, 50, 75, 90];
    const fired = new Set();
    const onScroll = () => {
      const h = document.documentElement;
      const pct = ((h.scrollTop + window.innerHeight) / h.scrollHeight) * 100;
      for (const m of marks) {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          track("scroll_depth", { percent: m });
        }
      }
      if (fired.size === marks.length) window.removeEventListener("scroll", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

/* ---------- page ---------- */

const HEADLINES = {
  price: <>Weekly pool care. <em>$199 a month,</em> flat.</>,
  outcome: <>Swim-ready. <em>Every single week.</em></>,
  offer: <>Start weekly service, get a <em>$125 filter clean</em> free.</>,
  local: <>Spring's <em>neighborhood</em> pool service.</>,
};

const RECEIPT_ITEMS = [
  ["Skim & net surface", "leaves, debris, bugs"],
  ["Brush walls & tile", "stops algae & waterline"],
  ["Vacuum the floor", "manual or robotic"],
  ["Empty all baskets", "skimmer + pump"],
  ["Test & balance water", "pH, chlorine, alkalinity"],
  ["All standard chemicals", "no upcharges"],
  ["Equipment check", "pump, filter, heater"],
  ["Photo report, texted", "after every visit"],
];

const FAQS = [
  ["What's actually included for $199?", "Skim, brush, vacuum, balance, all standard chemicals (chlorine, stabilizer, balancers), an equipment check, and a photo service report texted after every visit. Same flat rate every month — chemicals never show up as a surprise line item."],
  ["Are there contracts or cancellation fees?", "No. Month-to-month, cancel any time, no fees. Most customers stay because they want to."],
  ["How fast can you start?", "Most new pools are on a weekly schedule within the same week. After your quote we set a service day and start."],
  ["What if my pool is green or in rough shape?", "We quote a one-time recovery (\"green to clear\") first, then weekly service kicks in at the standard rate. The before/after above was exactly that."],
];

function V2Page() {
  const angle = useMemo(() => getAttribution().angle, []);
  useScrollDepth();

  return (
    <div className="v2">
      <div className="v2-topbar">
        Booking spring routes — <strong>limited capacity</strong><span className="v2-topbar-zips"> in 77386, 77381 &amp; 77382</span> · <Phone kind="call" placement="topbar">Reserve a slot</Phone>
      </div>

      <header className="v2-header">
        <div className="v2-container v2-header-row">
          <Logo />
          <div className="v2-header-cta">
            <Phone kind="call" placement="header" className="v2-header-phone">
              <CallGlyph size={17} />
              <span>
                <small>Call or text</small>
                <span className="v2-hp-num">{PHONE_DISPLAY}</span>
              </span>
            </Phone>
            <QuoteLink placement="header" className="v2-btn v2-btn--primary">Free quote</QuoteLink>
          </div>
        </div>
      </header>

      <section className="v2-hero">
        <div className="v2-container">
          <div className="v2-hero-grid">
            <div>
              <div className="v2-eyebrow v2-rise v2-rise-1">Now booking · Spring, TX</div>
              <h1 className="v2-h1 v2-rise v2-rise-2">{HEADLINES[angle] || HEADLINES[DEFAULT_ANGLE]}</h1>
              <p className="v2-hero-sub v2-rise v2-rise-3">
                Skim, brush, vacuum, balance, inspect — <strong>same technician, every week</strong>, chemicals included.
                New customers get a free filter cleaning ($125 value). No contracts.
              </p>
              <div className="v2-hero-ctas v2-rise v2-rise-4">
                <QuoteLink placement="hero" className="v2-btn v2-btn--primary">Get my free quote</QuoteLink>
                <Phone kind="call" placement="hero" className="v2-btn v2-btn--ghost"><CallGlyph /> {PHONE_DISPLAY}</Phone>
              </div>
              <div className="v2-ticks v2-rise v2-rise-4">
                <span><Check /> Family-owned since 2020</span>
                <span><Check /> Licensed &amp; insured</span>
                <span><Check /> Same-week start</span>
                <span><Check /> No contracts</span>
              </div>
            </div>
            <TicketForm />
          </div>
        </div>
      </section>

      <section className="v2-band" aria-label="A pool we service in Spring, Texas">
        <svg className="v2-band-wave" viewBox="0 0 1440 56" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,28 C240,56 480,0 720,18 C960,36 1200,8 1440,30 L1440,56 L0,56 Z" fill="#0A5A66" opacity="0.15" />
          <path d="M0,38 C240,62 480,10 720,28 C960,46 1200,18 1440,40 L1440,0 L0,0 Z" fill="#FBF8F1" />
        </svg>
        <div className="v2-band-photo">
          <picture>
            <source srcSet="/assets/hero-pool-aerial-mobile.webp" media="(max-width: 720px)" type="image/webp" />
            <source srcSet="/assets/hero-pool-aerial.webp" type="image/webp" />
            <img src="/assets/hero-pool-aerial.jpg" alt="Aerial view of a clear backyard pool maintained by Escape Pool Services" loading="lazy" />
          </picture>
          <div className="v2-band-chip"><b>This clear, every week</b> — Spring, TX</div>
        </div>
      </section>

      <div className="v2-stats">
        <div className="v2-container">
          <div className="v2-stats-card">
            <div className="v2-stat"><b>300+</b><span>Pools weekly</span></div>
            <div className="v2-stat"><b>5.0★</b><span>On Google</span></div>
            <div className="v2-stat"><b>&lt;1 hr</b><span>Text-back time</span></div>
            <div className="v2-stat"><b>$0</b><span>Contracts or fees</span></div>
          </div>
        </div>
      </div>

      <section className="v2-section">
        <div className="v2-container">
          <div className="v2-value-grid">
            <div>
              <div className="v2-kicker">What $199 covers</div>
              <h2 className="v2-h2">Every visit, <em>itemized.</em></h2>
              <p className="v2-lede">
                No chemical upcharges, no fuel fees, no fine print. If it's on the ticket, it's in the rate — here's the whole receipt.
              </p>
              <div className="v2-receipt" aria-label="Weekly visit checklist">
                <div className="v2-receipt-head">
                  <b>Weekly visit</b>
                  <span>Escape Pool Services · Spring, TX</span>
                </div>
                {RECEIPT_ITEMS.map(([item, detail]) => (
                  <div className="v2-receipt-row" key={item}>
                    <span className="l">{item}</span>
                    <span className="d">{detail}</span>
                    <span className="dots" aria-hidden="true" />
                    <span className="p">incl.</span>
                  </div>
                ))}
                <div className="v2-receipt-total">
                  <b>Your flat rate</b>
                  <span className="amt">$199<small>/mo</small></span>
                </div>
                <p className="v2-receipt-note">Starting rate for most pools · no contracts · cancel anytime</p>
              </div>
            </div>
            <div>
              <div className="v2-kicker">Proof, not promises</div>
              <h2 className="v2-h2">A text after <em>every</em> visit.</h2>
              <p className="v2-lede">
                You shouldn't have to walk out back to check our work. Every visit ends with a photo and the water numbers, texted to your phone.
              </p>
              <div className="v2-phone" aria-label="Example of the photo service report you receive by text">
                <div className="v2-phone-screen">
                  <div className="v2-phone-top">
                    <b>Escape Pool Services</b>
                    <span>{PHONE_DISPLAY}</span>
                  </div>
                  <div className="v2-phone-msgs">
                    <div className="v2-phone-time">Today 2:14 PM</div>
                    <div className="v2-bubble v2-bubble--img">
                      <img src="/assets/pool-after.webp" alt="Photo of a serviced pool, sent as part of a service report" loading="lazy" />
                    </div>
                    <div className="v2-bubble">
                      All done for the week! Skimmed, brushed &amp; vacuumed. pH 7.4 · Chlorine 3.0 · Alkalinity 95. Gate latched behind us. — Will
                    </div>
                  </div>
                </div>
              </div>
              <p className="v2-phone-caption">Actual report format — photo + water chemistry, every week.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="v2-section v2-ba-wrap">
        <div className="v2-container">
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 40px" }}>
            <div className="v2-kicker">Green to clear</div>
            <h2 className="v2-h2">Rough shape? <em>We've seen worse.</em></h2>
          </div>
          <BeforeAfter />
        </div>
      </section>

      <section className="v2-section">
        <div className="v2-container">
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 52px" }}>
            <div className="v2-kicker">How it works</div>
            <h2 className="v2-h2">Quote to clean in <em>three days.</em></h2>
          </div>
          <div className="v2-steps">
            <div className="v2-step">
              <div className="v2-step-n">1</div>
              <div>
                <h3>Tell us about your pool</h3>
                <p>30-second form, or just call. Your ZIP and any concerns is all we need.</p>
              </div>
            </div>
            <div className="v2-step">
              <div className="v2-step-n">2</div>
              <div>
                <h3>Flat-rate quote by text</h3>
                <p>Within the hour during business hours. No site visit needed for most pools.</p>
              </div>
            </div>
            <div className="v2-step">
              <div className="v2-step-n">3</div>
              <div>
                <h3>First clean this week</h3>
                <p>Same technician every visit, photo report after each one.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-container">
          <div style={{ textAlign: "center", marginBottom: 26 }}>
            <div className="v2-kicker">What homeowners say</div>
          </div>
          <blockquote className="v2-pull">
            "We had a green pool when they took over. Two weeks later you could see the bottom drain. Same crew every visit, super respectful of the dogs and the gate."
          </blockquote>
          <div className="v2-pull-by">
            <span className="v2-stars" aria-label="5 out of 5 stars">★★★★★</span> &nbsp;<b>Lauren P.</b> · Spring, TX · Weekly customer
          </div>
          <div className="v2-review-grid">
            <article className="v2-review">
              <span className="v2-stars" aria-label="5 out of 5 stars">★★★★★</span>
              <p>"Honestly the easiest thing I've outsourced. Will and his team show up like clockwork — pool's never been clearer, and chemicals stopped being something I think about."</p>
              <div className="v2-review-by">
                <div><b>Marcus R.</b><span>Klein, TX · Weekly customer</span></div>
                <span className="v2-gbadge">Google review</span>
              </div>
            </article>
            <article className="v2-review">
              <span className="v2-stars" aria-label="5 out of 5 stars">★★★★★</span>
              <p>"Switched from a national chain after years of inconsistency. Pricing is straightforward, the techs actually communicate, and they caught a pump leak before it became a $2k repair."</p>
              <div className="v2-review-by">
                <div><b>David T.</b><span>The Woodlands, TX · Weekly customer</span></div>
                <span className="v2-gbadge">Google review</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="v2-section v2-offer">
        <div className="v2-container">
          <div className="v2-offer-badge">New customer welcome</div>
          <h2 className="v2-h2">A $125 filter clean, <em>on the house.</em></h2>
          <p>
            Full disassembly, hose-out, inspection and reassembly — free with your first month of weekly service. It's the single best thing you can do for your water.
          </p>
          <div className="v2-offer-ctas">
            <QuoteLink placement="offer" className="v2-btn v2-btn--light">Claim my free filter clean</QuoteLink>
            <Phone kind="call" placement="offer" className="v2-btn v2-btn--ghost"><CallGlyph /> {PHONE_DISPLAY}</Phone>
          </div>
        </div>
      </section>

      <section className="v2-section">
        <div className="v2-container">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div className="v2-kicker">Common questions</div>
            <h2 className="v2-h2">Before you sign up.</h2>
          </div>
          <div className="v2-faq">
            {FAQS.map(([q, a]) => (
              <details key={q} onToggle={(e) => e.currentTarget.open && track("faq_open", { question: q })}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="v2-section v2-final">
        <div className="v2-container">
          <h2 className="v2-h2">Get back to <em>enjoying</em> your pool.</h2>
          <p>Free quote in under an hour. Same-week start. $125 filter clean included.</p>
          <div className="v2-final-ctas">
            <QuoteLink placement="final" className="v2-btn v2-btn--primary">Get my free quote</QuoteLink>
            <Phone kind="call" placement="final" className="v2-btn v2-btn--ghost"><CallGlyph /> {PHONE_DISPLAY}</Phone>
          </div>
        </div>
      </section>

      <footer className="v2-footer">
        <div className="v2-container">
          <div className="v2-footer-row">
            <div>© 2026 Escape Pool Services · Spring, TX · Family-owned since 2020 · Licensed &amp; Insured</div>
            <div style={{ display: "flex", gap: 18 }}>
              <a href="/privacy.html">Privacy</a>
              <a href="/terms.html">Terms</a>
              <Phone kind="call" placement="footer">{PHONE_DISPLAY}</Phone>
            </div>
          </div>
          <div className="v2-footer-areas">
            Serving Spring · Klein · The Woodlands · Conroe · Tomball · Willis · Huntsville
          </div>
        </div>
      </footer>

      <Dock />
    </div>
  );
}

export default V2Page;
