/* ============================================================
   Tracking + attribution layer.

   All runtime IDs live in window.__EPS (set in index.html):
     AW_ID          Google Ads tag id            e.g. "AW-18124405751"
     AW_LEAD_LABEL  conversion label: lead form  e.g. "AbC-dEfGhIjK"
     AW_CALL_LABEL  conversion label: call click
     GA4_ID         GA4 measurement id           e.g. "G-XXXXXXX"

   Every event is sent via gtag(); GA4 (when configured) receives all
   of them with { page_variant, angle } params, Ads receives only the
   explicit conversion events. Attribution (gclid/utm/referrer/...)
   is captured on first touch, persisted in sessionStorage, and
   attached to the lead submitted to Netlify Forms.
   ============================================================ */

export const DEFAULT_ANGLE = "price";
export const VALID_ANGLES = new Set(["local", "price", "offer", "outcome"]);
export const PAGE_VARIANT = "v2";

const ATTR_KEY = "eps_attr";

function cfg() {
  return (typeof window !== "undefined" && window.__EPS) || {};
}

export function getAttribution() {
  if (typeof window === "undefined") {
    return { angle: DEFAULT_ANGLE };
  }
  const p = new URLSearchParams(window.location.search);
  let stored = {};
  try {
    stored = JSON.parse(sessionStorage.getItem(ATTR_KEY)) || {};
  } catch (_) {}

  const pick = (key) => p.get(key) || stored[key] || "";
  const rawAngle = p.get("angle") || stored.angle || "";
  const attr = {
    gclid: pick("gclid"),
    utm_source: pick("utm_source"),
    utm_medium: pick("utm_medium"),
    utm_campaign: pick("utm_campaign"),
    utm_term: pick("utm_term"),
    utm_content: pick("utm_content"),
    angle: VALID_ANGLES.has(rawAngle) ? rawAngle : DEFAULT_ANGLE,
    referrer: stored.referrer ?? (document.referrer || ""),
    landing: stored.landing ?? window.location.pathname + window.location.search,
    device: stored.device ?? (/Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop"),
  };
  try {
    sessionStorage.setItem(ATTR_KEY, JSON.stringify(attr));
  } catch (_) {}
  return attr;
}

export function track(name, params = {}) {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", name, {
        page_variant: PAGE_VARIANT,
        angle: getAttribution().angle,
        ...params,
      });
      // Click-to-call / click-to-text count as Ads conversions once the
      // label exists in the account (see window.__EPS in index.html).
      const c = cfg();
      if ((name === "call_click" || name === "sms_click") && c.AW_ID && c.AW_CALL_LABEL) {
        window.gtag("event", "conversion", {
          send_to: `${c.AW_ID}/${c.AW_CALL_LABEL}`,
        });
      }
    }
  } catch (_) {}
}

// Called right before the redirect to /thank-you.html. The thank-you page
// reads these to (a) fire the lead conversion exactly once per real submit
// and (b) attach hashed enhanced-conversion user data for better Ads match.
export function handoffLead({ name, phone, zip }) {
  try {
    const digits = phone.replace(/\D/g, "");
    sessionStorage.setItem("eps_lead_submitted", "1");
    sessionStorage.setItem(
      "eps_lead",
      JSON.stringify({
        name,
        phoneE164: digits.length === 10 ? `+1${digits}` : "",
        zip,
      })
    );
  } catch (_) {}
}
