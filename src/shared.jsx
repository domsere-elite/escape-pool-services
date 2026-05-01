import React, { useState, useEffect } from "react";

export const PHONE_DISPLAY = "(832) 764-6224";
export const PHONE_TEL = "+18327646224";
export const SMS_BODY = "Hi%20Escape%20Pool%2C%20I'd%20like%20a%20weekly%20cleaning%20quote.";

export function trackConv(type) {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "lp_action", { event_category: "engagement", event_label: type });
    }
  } catch (_) {}
  if (typeof console !== "undefined") console.log("[conversion]", type);
}

export function PhoneLink({ className, children, kind = "call", style }) {
  const href = kind === "sms" ? `sms:${PHONE_TEL}?&body=${SMS_BODY}` : `tel:${PHONE_TEL}`;
  return (
    <a
      href={href}
      className={className}
      style={style}
      onClick={() => trackConv(kind)}
    >
      {children}
    </a>
  );
}

export function PhotoPlaceholder({ label, ratio = "16 / 10", tone = "blue", style = {} }) {
  const tones = {
    blue:   { bg: "#0a2540", stripe: "#102f53", ink: "#7fb3ff" },
    cream:  { bg: "#efe7d6", stripe: "#e3d8c0", ink: "#7a6a4a" },
    ink:    { bg: "#1a1a1a", stripe: "#222", ink: "#888" },
    white:  { bg: "#f4f4f0", stripe: "#e8e8e0", ink: "#7a7a72" },
    teal:   { bg: "#063a3a", stripe: "#0a4a4a", ink: "#7fd4d4" },
  };
  const t = tones[tone] || tones.blue;
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: ratio,
        background: `repeating-linear-gradient(135deg, ${t.bg} 0 14px, ${t.stripe} 14px 28px)`,
        color: t.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
        fontSize: 11,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        textAlign: "center",
        padding: 16,
        overflow: "hidden",
        ...style,
      }}
    >
      <span style={{ opacity: 0.85, lineHeight: 1.5 }}>{label}</span>
    </div>
  );
}

export function LeadForm({ theme = "light", compact = false, ctaLabel = "Get my free quote", onSubmitted, accent = "#FF6A1A" }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zip, setZip] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [zipMsg, setZipMsg] = useState(null);

  const SERVICED = new Set([
    "77386","77389","77373","77379","77380","77381","77382","77384",
    "77302","77303","77304","77385","77301","77306",
    "77375","77377","77318","77378","77320","77340","77341","77358",
  ]);

  useEffect(() => {
    if (zip.length === 5) {
      setZipMsg(SERVICED.has(zip)
        ? { ok: true, text: `✓ Yes — we cover ${zip}.` }
        : { ok: false, text: `We may still cover ${zip}. Call to confirm.` });
    } else {
      setZipMsg(null);
    }
  }, [zip]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !/^[0-9\-\s\(\)]{7,}$/.test(phone) || !/^\d{5}$/.test(zip)) return;
    trackConv("form_submit");
    if (onSubmitted) onSubmitted({ name, phone, zip });
    setSubmitted(true);

    // POST to Netlify Forms endpoint. The form name "weekly-quote" is
    // registered via the static-HTML shim in index.html. Any non-2xx is
    // logged but does not block the redirect — the Ads conversion still
    // needs to fire on the thank-you page.
    try {
      const body = new URLSearchParams({
        "form-name": "weekly-quote",
        "bot-field": "",
        name,
        phone,
        zip,
      });
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
    } catch (err) {
      console.error("[lead-submit] netlify post failed:", err);
    }

    if (typeof window !== "undefined") {
      window.location.href = "/thank-you.html";
    }
  }

  const dark = theme === "dark";
  const inputBase = {
    width: "100%",
    padding: compact ? "12px 14px" : "16px 16px",
    borderRadius: 10,
    border: dark ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(0,0,0,0.16)",
    background: dark ? "rgba(255,255,255,0.06)" : "#fff",
    color: dark ? "#fff" : "#111",
    fontSize: 16,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "32px 8px" }}>
        <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 12 }}>✓</div>
        <h3 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800 }}>Got it, {name.split(" ")[0]}.</h3>
        <p style={{ margin: 0, opacity: 0.75, fontSize: 15 }}>
          We'll text you a quote within an hour.
        </p>
        <p style={{ margin: "16px 0 0", fontSize: 14 }}>
          Need it now?{" "}
          <PhoneLink kind="call" style={{ color: accent, fontWeight: 700 }}>
            Call {PHONE_DISPLAY}
          </PhoneLink>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
      <input
        style={inputBase}
        type="text"
        placeholder="Full name"
        autoComplete="name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        style={inputBase}
        type="tel"
        placeholder="Phone number"
        autoComplete="tel"
        inputMode="tel"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        style={inputBase}
        type="text"
        placeholder="ZIP code"
        autoComplete="postal-code"
        inputMode="numeric"
        pattern="[0-9]{5}"
        maxLength={5}
        required
        value={zip}
        onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
      />
      {zipMsg && (
        <div style={{
          fontSize: 13,
          padding: "6px 10px",
          borderRadius: 6,
          color: zipMsg.ok ? "#0a7a3a" : "#a06000",
          background: zipMsg.ok ? "rgba(20,160,80,0.10)" : "rgba(220,140,30,0.12)",
        }}>{zipMsg.text}</div>
      )}
      <button
        type="submit"
        style={{
          width: "100%",
          padding: "16px 20px",
          borderRadius: 10,
          border: "none",
          background: accent,
          color: "#0A1B2E",
          fontSize: 17,
          fontWeight: 800,
          fontFamily: "inherit",
          cursor: "pointer",
          letterSpacing: "0.01em",
          boxShadow: `0 6px 20px -8px ${accent}`,
          transition: "transform .08s ease, filter .15s ease",
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(1px)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
      >
        {ctaLabel} →
      </button>
      <p style={{
        margin: 0,
        fontSize: 11,
        lineHeight: 1.5,
        opacity: dark ? 0.55 : 0.55,
        textAlign: "center",
      }}>
        Real person texts you back within an hour. By submitting you consent to call/text contact about your quote. STOP to opt-out.
      </p>
    </form>
  );
}

export function StickyCTA({ accent = "#FF6A1A", scrollTarget = "#quote", style = "split" }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (style === "call-only") {
    return (
      <div className="sticky-cta-bar" data-visible={visible} style={{ "--accent": accent }}>
        <PhoneLink kind="call" className="sticky-pill sticky-pill--full" style={{ background: accent }}>
          📞  Call {PHONE_DISPLAY}
        </PhoneLink>
      </div>
    );
  }

  return (
    <div className="sticky-cta-bar" data-visible={visible} style={{ "--accent": accent }}>
      <PhoneLink kind="call" className="sticky-pill sticky-pill--ghost">
        <CallIcon /> Call
      </PhoneLink>
      <PhoneLink kind="sms" className="sticky-pill sticky-pill--ghost">
        <TextIcon /> Text
      </PhoneLink>
      <a href={scrollTarget} className="sticky-pill sticky-pill--primary" style={{ background: accent }}>
        Free Quote →
      </a>
    </div>
  );
}

export function CallIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

export function TextIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

export function CheckIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function StarRow({ size = 14, color = "#FFB300" }) {
  return (
    <span style={{ color, letterSpacing: "1px", fontSize: size }}>★★★★★</span>
  );
}
