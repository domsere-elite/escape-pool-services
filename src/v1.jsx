import React, { useMemo } from "react";
import {
  PhoneLink,
  LeadForm,
  StickyCTA,
  PhotoPlaceholder,
  CallIcon,
  TextIcon,
  CheckIcon,
  StarRow,
  PHONE_DISPLAY,
} from "./shared.jsx";

// Pivot point: change this single literal to flip the default headline angle.
// Valid values: "price" | "offer" | "outcome" | "local"
// Currently price-led for cold paid-search traffic. Override per-ad via ?angle=…
const DEFAULT_HEADLINE_ANGLE = "price";
const VALID_ANGLES = new Set(["local", "price", "offer", "outcome"]);

function HeroPhoto() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#0a2a48" }}>
      <picture>
        <source srcSet="/assets/hero-pool-aerial-mobile.jpg" media="(max-width: 720px)" />
        <img
          src="/assets/hero-pool-aerial.jpg"
          alt=""
          loading="eager"
          fetchpriority="high"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center",
            animation: "v1-kenburns 32s ease-in-out infinite alternate",
            transformOrigin: "55% 55%",
          }}
        />
      </picture>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(100deg, rgba(8,22,40,0.78) 0%, rgba(8,22,40,0.55) 28%, rgba(8,22,40,0.22) 55%, rgba(8,22,40,0.05) 80%, rgba(8,22,40,0) 100%)",
      }} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 220,
        background: "linear-gradient(180deg, rgba(8,22,40,0.55) 0%, rgba(8,22,40,0) 100%)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

const v1Theme = {
  ink: "#0A1B2E",
  ink2: "#152A45",
  ink3: "#3A4D6B",
  paper: "#FBFAF6",
  paperDeep: "#F2EEE4",
  gold: "#C9A35B",
  goldDeep: "#A6823F",
  goldSoft: "#E8D9B4",
  trust: "#0F6B3F",
  rule: "rgba(10,27,46,0.10)",
  rule2: "rgba(10,27,46,0.06)",
};

function readAngleFromURL() {
  if (typeof window === "undefined") return DEFAULT_HEADLINE_ANGLE;
  const param = new URLSearchParams(window.location.search).get("angle");
  return param && VALID_ANGLES.has(param) ? param : DEFAULT_HEADLINE_ANGLE;
}

function V1Page() {
  const t = v1Theme;
  const headline = useMemo(readAngleFromURL, []);
  const showUrgency = true;

  const heroH1 = {
    outcome: <>Your pool, <span style={{ color: t.gold, fontStyle: "italic", fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400 }}>this clean.</span> Every week.</>,
    price: <>Weekly pool care, <span style={{ color: t.gold, fontStyle: "italic", fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400 }}>from $199</span> a month.</>,
    offer: <>A weekly pool service with a <span style={{ color: t.gold, fontStyle: "italic", fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400 }}>$125 welcome</span>.</>,
    local: <>Spring's <span style={{ color: t.gold, fontStyle: "italic", fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400 }}>weekly</span> pool service.</>,
  }[headline];

  return (
    <div className="v1" style={{
      background: t.paper,
      color: t.ink,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      fontFeatureSettings: '"ss01", "cv11"',
    }}>
      {showUrgency && (
        <div style={{
          background: t.ink, color: t.goldSoft, textAlign: "center",
          fontSize: 12.5, fontWeight: 500, padding: "9px 16px",
          letterSpacing: "0.02em", borderBottom: `1px solid rgba(201,163,91,0.18)`,
        }}>
          <span style={{ color: t.gold, marginRight: 8 }}>◆</span>
          Booking spring routes — limited capacity in 77386, 77381, 77382.{" "}
          <PhoneLink kind="call" style={{ color: t.gold, textDecoration: "underline", textUnderlineOffset: 3, textDecorationThickness: 1, marginLeft: 4 }}>
            Reserve a slot →
          </PhoneLink>
        </div>
      )}

      <header style={{
        position: "absolute", top: showUrgency ? 36 : 0, left: 0, right: 0, zIndex: 40,
        padding: "18px 0",
      }}>
        <div className="v1-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <a href="/" aria-label="Escape Pool Services" style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none", color: "#fff" }}>
            <svg viewBox="0 0 60 60" width="36" height="36" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
              <line x1="18" y1="10" x2="20.5" y2="14.8" stroke={t.gold} strokeWidth="3" strokeLinecap="round" />
              <line x1="30" y1="5"  x2="30"   y2="11"   stroke={t.gold} strokeWidth="3" strokeLinecap="round" />
              <line x1="42" y1="10" x2="39.5" y2="14.8" stroke={t.gold} strokeWidth="3" strokeLinecap="round" />
              <circle cx="30" cy="24" r="9" fill={t.gold} />
              <path d="M6 42 Q14 38, 22 42 T38 42 T54 42" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M6 50 Q14 46, 22 50 T38 50 T54 50" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.55" />
            </svg>
            <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 26,
                letterSpacing: "-0.025em",
                color: "#fff",
              }}>Escape</span>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: 9,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: t.gold,
                opacity: 0.85,
                marginTop: 5,
              }}>Pool Services</span>
            </span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <PhoneLink kind="call" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontWeight: 600, fontSize: 14.5, color: "#fff", textDecoration: "none",
              opacity: 0.92,
            }}>
              <CallIcon size={16} /> {PHONE_DISPLAY}
            </PhoneLink>
            <a href="#v1-quote" style={{
              background: t.gold, color: t.ink, padding: "10px 18px",
              borderRadius: 8, fontWeight: 600, fontSize: 13.5, textDecoration: "none",
              letterSpacing: "0.005em",
            }}>Free Quote</a>
          </div>
        </div>
      </header>

      <section style={{ position: "relative", overflow: "hidden", color: "#fff", paddingTop: showUrgency ? 96 : 60, paddingBottom: 80, minHeight: 720 }}>
        <HeroPhoto />

        <div className="v1-container" style={{ position: "relative", zIndex: 2, paddingTop: 60 }}>
          <div className="v1-hero-grid">
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "6px 12px 6px 8px", borderRadius: 100,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: 12, fontWeight: 500, letterSpacing: "0.06em",
                textTransform: "uppercase", marginBottom: 26,
                color: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
                whiteSpace: "nowrap",
              }}>
                <span style={{ position: "relative", width: 7, height: 7 }}>
                  <span style={{ position: "absolute", inset: 0, borderRadius: 999, background: t.gold }} />
                  <span style={{ position: "absolute", inset: -4, borderRadius: 999, background: t.gold, opacity: 0.4, animation: "v1-pulse 2.4s ease-out infinite" }} />
                </span>
                Now booking · Spring, TX
              </div>
              <h1 style={{
                fontSize: "clamp(40px, 5.6vw, 68px)", lineHeight: 1.02,
                margin: "0 0 22px", fontWeight: 700, letterSpacing: "-0.025em",
                textWrap: "balance",
                fontFamily: "'Inter', sans-serif",
              }}>
                {heroH1}
              </h1>
              <p style={{
                fontSize: 18, lineHeight: 1.55, margin: "0 0 32px", maxWidth: 520,
                color: "rgba(255,255,255,0.78)",
              }}>
                Skim, brush, vacuum, balance, inspect — same technician, every week.
                A complimentary filter cleaning <em style={{ color: t.goldSoft, fontStyle: "normal", fontWeight: 500 }}>($125 value)</em> for new customers. No contracts.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
                <a href="#v1-quote" style={{
                  background: t.gold, color: t.ink,
                  padding: "16px 26px", borderRadius: 10,
                  fontWeight: 700, fontSize: 15.5, textDecoration: "none",
                  letterSpacing: "0.005em",
                  boxShadow: "0 14px 32px -10px rgba(201,163,91,0.55)",
                  display: "inline-flex", alignItems: "center", gap: 10,
                }}>
                  Get my free quote <span aria-hidden style={{ marginTop: -1 }}>→</span>
                </a>
                <PhoneLink kind="call" style={{
                  background: "rgba(255,255,255,0.06)", color: "#fff",
                  padding: "16px 24px", borderRadius: 10,
                  fontWeight: 600, fontSize: 15, textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.16)",
                  display: "inline-flex", alignItems: "center", gap: 10,
                  backdropFilter: "blur(8px)",
                }}>
                  <CallIcon size={16} /> {PHONE_DISPLAY}
                </PhoneLink>
              </div>

              <div style={{
                display: "flex", gap: 26, flexWrap: "wrap",
                fontSize: 13, fontWeight: 500,
                color: "rgba(255,255,255,0.7)",
                paddingTop: 24,
                borderTop: "1px solid rgba(255,255,255,0.12)",
              }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <span style={{ color: t.gold }}><CheckIcon size={14} /></span> Licensed &amp; insured
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <span style={{ color: t.gold }}><CheckIcon size={14} /></span> Same-week start
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <span style={{ color: t.gold }}><CheckIcon size={14} /></span> No contracts
                </span>
              </div>
            </div>

            <aside id="v1-quote" style={{
              background: "rgba(255,255,255,0.97)",
              color: t.ink, borderRadius: 14,
              padding: 28,
              boxShadow: "0 40px 90px -30px rgba(0,0,0,0.55), 0 1px 0 0 rgba(255,255,255,0.6) inset",
              position: "relative",
              border: "1px solid rgba(255,255,255,0.6)",
            }}>
              <div style={{
                position: "absolute", top: -1, left: 24, right: 24,
                height: 2, background: `linear-gradient(90deg, transparent, ${t.gold}, transparent)`,
              }} />
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: t.goldSoft, color: t.goldDeep,
                padding: "5px 11px", borderRadius: 6,
                fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                marginBottom: 14,
              }}>
                <span>◆</span> Free filter clean — $125 value
              </div>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.015em" }}>Get your free quote</h2>
              <p style={{ margin: "0 0 18px", fontSize: 13.5, color: t.ink3 }}>
                Real person texts you back within an hour during business hours.
              </p>
              <LeadForm theme="light" accent={t.gold} ctaLabel="Get my free quote" />
              <div style={{ margin: "16px 0 10px", textAlign: "center", fontSize: 11, color: t.ink3, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                <span style={{ background: "#fff", padding: "0 12px", position: "relative", zIndex: 1 }}>or contact directly</span>
                <div style={{ height: 1, background: t.rule, marginTop: -7, position: "relative", zIndex: 0 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PhoneLink kind="call" style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "12px 14px", border: `1px solid ${t.rule}`, borderRadius: 9,
                  fontWeight: 600, color: t.ink, textDecoration: "none", fontSize: 14,
                  background: t.paper,
                }}><CallIcon size={14} /> Call</PhoneLink>
                <PhoneLink kind="sms" style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "12px 14px", border: `1px solid ${t.rule}`, borderRadius: 9,
                  fontWeight: 600, color: t.ink, textDecoration: "none", fontSize: 14,
                  background: t.paper,
                }}><TextIcon size={14} /> Text</PhoneLink>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section style={{ background: t.paper, borderBottom: `1px solid ${t.rule2}` }}>
        <div className="v1-container" style={{ padding: "30px 0", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {[
            { n: "300+", l: "Pools serviced" },
            { n: "5.0★", l: "Average rating" },
            { n: "<1hr", l: "Quote response" },
            { n: "0", l: "Long-term contracts" },
          ].map((s, i) => (
            <div key={s.l} style={{
              textAlign: "center",
              borderLeft: i === 0 ? "none" : `1px solid ${t.rule2}`,
              padding: "0 8px",
            }}>
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 500, lineHeight: 1, color: t.ink, letterSpacing: "-0.02em" }}>{s.n}</div>
              <div style={{ fontSize: 11.5, fontWeight: 500, color: t.ink3, marginTop: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "96px 0", background: t.paper }}>
        <div className="v1-container">
          <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 64, alignItems: "start" }} className="v1-included">
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.goldDeep, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14 }}>What's included</div>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400, margin: "0 0 18px", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                Every visit. Every week. <em style={{ color: t.gold, fontStyle: "italic" }}>One flat rate.</em>
              </h2>
              <p style={{ fontSize: 16.5, lineHeight: 1.65, color: t.ink3, maxWidth: 520, margin: "0 0 32px" }}>
                No hidden fees. No chemical upcharges. No nickel-and-diming. Here's exactly what your pool gets every time we show up.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 28px" }}>
                {[
                  ["Skim &amp; net", "Surface debris, leaves, bugs"],
                  ["Brush walls &amp; tile", "Stops algae &amp; waterlines"],
                  ["Vacuum the floor", "Manual or robotic"],
                  ["Empty all baskets", "Skimmer + pump"],
                  ["Test &amp; balance water", "pH, chlorine, alkalinity"],
                  ["All standard chemicals", "Included in monthly rate"],
                  ["Equipment check", "Pump, filter, heater"],
                  ["Photo service report", "Texted after every visit"],
                ].map(([h, p]) => (
                  <div key={h} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{
                      flex: "0 0 22px", width: 22, height: 22, borderRadius: 999,
                      background: t.goldSoft, color: t.goldDeep,
                      display: "grid", placeItems: "center", marginTop: 2,
                    }}><CheckIcon size={12} /></div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14.5, letterSpacing: "-0.005em" }} dangerouslySetInnerHTML={{ __html: h }} />
                      <div style={{ fontSize: 13, color: t.ink3, marginTop: 1 }}>{p}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside style={{
              background: t.ink, color: "#fff", borderRadius: 14, padding: 36,
              position: "relative", overflow: "hidden",
              boxShadow: "0 30px 60px -30px rgba(10,27,46,0.4)",
            }}>
              <div aria-hidden style={{
                position: "absolute", inset: 0,
                background: `radial-gradient(circle at 90% 0%, rgba(201,163,91,0.18) 0, transparent 50%)`,
              }} />
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.gold, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 12 }}>Weekly Service Plan</div>
                <div style={{ fontSize: 13, opacity: 0.65, marginBottom: 4 }}>Starting at</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, fontWeight: 500, lineHeight: 0.9, letterSpacing: "-0.04em", fontFamily: "'Fraunces', Georgia, serif" }}>
                  <span style={{ fontSize: 28, opacity: 0.7 }}>$</span>
                  <span style={{ fontSize: 86 }}>199</span>
                  <span style={{ fontSize: 18, opacity: 0.7, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>/mo</span>
                </div>
                <div style={{ fontSize: 13, opacity: 0.65, marginTop: 10, marginBottom: 22 }}>
                  Flat rate · No contracts · Cancel anytime
                </div>
                <div style={{
                  background: "rgba(201,163,91,0.10)",
                  border: `1px solid rgba(201,163,91,0.3)`,
                  borderRadius: 10, padding: "13px 14px", marginBottom: 24,
                  display: "flex", alignItems: "center", gap: 12, fontSize: 13.5,
                }}>
                  <span style={{ fontSize: 18, color: t.gold }}>◆</span>
                  <span><strong style={{ color: t.gold, fontWeight: 700 }}>New customer:</strong> complimentary filter clean — <em style={{ color: t.goldSoft, fontStyle: "normal" }}>$125 value</em></span>
                </div>
                <a href="#v1-quote" style={{
                  display: "block", textAlign: "center",
                  background: t.gold, color: t.ink, padding: "15px 18px",
                  borderRadius: 10, fontWeight: 700, fontSize: 15.5, textDecoration: "none",
                  marginBottom: 10,
                }}>Get my free quote →</a>
                <PhoneLink kind="call" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "12px", borderRadius: 10, fontWeight: 600, fontSize: 14,
                  color: "#fff", textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}><CallIcon size={15} /> Or call {PHONE_DISPLAY}</PhoneLink>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section style={{ padding: "88px 0", background: t.paperDeep, borderTop: `1px solid ${t.rule2}`, borderBottom: `1px solid ${t.rule2}` }}>
        <div className="v1-container">
          <div style={{ textAlign: "center", marginBottom: 48, maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.goldDeep, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14 }}>How it works</div>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 400, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
              From quote to clean in <em style={{ color: t.gold, fontStyle: "italic" }}>three days</em>.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, position: "relative" }} className="v1-steps">
            {[
              { n: "01", h: "Tell us about your pool", p: "Quick form or call. Share your ZIP and any concerns. 30 seconds." },
              { n: "02", h: "Flat-rate quote in <1 hour", p: "We text you back during business hours. No site visit needed for most pools." },
              { n: "03", h: "First clean within the week", p: "Same tech every visit. Photo + service report after each one." },
            ].map((s) => (
              <div key={s.n} style={{ background: "#fff", borderRadius: 12, padding: 28, border: `1px solid ${t.rule2}`, position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 500, color: t.gold, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.n}</span>
                  <span style={{ flex: 1, height: 1, background: t.rule2 }} />
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>{s.h}</h3>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: t.ink3 }}>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "88px 0", background: t.paper }}>
        <div className="v1-container">
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.goldDeep, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14 }}>What homeowners say</div>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(28px, 3.6vw, 40px)", fontWeight: 400, margin: 0, letterSpacing: "-0.02em" }}>
              Hassle-free, neighborly, on time.
            </h2>
          </div>

          <article style={{
            background: "#fff", border: `1px solid ${t.rule2}`, borderRadius: 16,
            overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1.3fr",
            marginBottom: 24,
          }} className="v1-feat-testi">
            <PhotoPlaceholder label={"Before / After photo\nof Marcus R.'s pool\n(replace with real)"} ratio="4 / 3" tone="blue" />
            <div style={{ padding: "36px 38px" }}>
              <StarRow size={15} color={t.gold} />
              <blockquote style={{ margin: "14px 0 22px", fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, lineHeight: 1.4, fontWeight: 400, letterSpacing: "-0.005em", color: t.ink }}>
                "Honestly the easiest thing I've outsourced. Will and his team show up like clockwork — pool's never been clearer, and chemicals stopped being something I think about."
              </blockquote>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>Marcus R.</div>
              <div style={{ fontSize: 13, color: t.ink3 }}>Klein, TX · Weekly customer since 2024</div>
            </div>
          </article>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="v1-testi-grid">
            {[
              { name: "Lauren P.", loc: "Spring, TX", body: "We had a green pool when they took over. Two weeks later, you could see the bottom drain. Same crew every visit, super respectful of the dogs and the gate." },
              { name: "David T.", loc: "The Woodlands, TX", body: "Switched from a national chain after years of inconsistency. Pricing is straightforward, the techs actually communicate, and they caught a pump leak before it became a $2k repair." },
            ].map((q) => (
              <article key={q.name} style={{ background: "#fff", border: `1px solid ${t.rule2}`, borderRadius: 14, padding: 26 }}>
                <StarRow size={13} color={t.gold} />
                <p style={{ margin: "12px 0 16px", fontSize: 15, lineHeight: 1.6, color: t.ink2 }}>"{q.body}"</p>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{q.name}</div>
                <div style={{ fontSize: 12.5, color: t.ink3 }}>{q.loc} · Weekly customer</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "76px 0", background: t.ink, color: "#fff", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 0%, rgba(201,163,91,0.18) 0, transparent 55%)`,
        }} />
        <div className="v1-container" style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(201,163,91,0.12)", color: t.gold,
            border: "1px solid rgba(201,163,91,0.3)",
            padding: "6px 14px", borderRadius: 100, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 22,
          }}>◆ New customer welcome</div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 400, margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            Free filter cleaning. <em style={{ color: t.gold, fontStyle: "italic" }}>$125 value.</em>
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.78)", maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.6 }}>
            A complete deep clean — full disassembly, hose-out, inspection, reassembly — at no charge for new customers, scheduled in your first month.
          </p>
          <div style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="#v1-quote" style={{
              background: t.gold, color: t.ink, padding: "16px 28px",
              borderRadius: 10, fontWeight: 700, fontSize: 15.5, textDecoration: "none",
              boxShadow: `0 14px 32px -10px rgba(201,163,91,0.5)`,
            }}>Claim my free cleaning →</a>
            <PhoneLink kind="call" style={{
              background: "rgba(255,255,255,0.06)", color: "#fff",
              padding: "16px 28px", borderRadius: 10, fontWeight: 600, fontSize: 15.5,
              textDecoration: "none", border: "1px solid rgba(255,255,255,0.16)",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}><CallIcon size={16} /> {PHONE_DISPLAY}</PhoneLink>
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 0", background: t.paper }}>
        <div className="v1-container" style={{ maxWidth: 760 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.goldDeep, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 12 }}>Common questions</div>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(28px, 3.6vw, 38px)", fontWeight: 400, margin: 0, letterSpacing: "-0.02em" }}>
              Before you sign up.
            </h2>
          </div>
          {[
            ["What's actually included for $199?", "Skim, brush, vacuum, balance, all standard chemicals (chlorine, stabilizer, balancers), equipment check, and a photo service report. Same flat rate every month."],
            ["Are there contracts or cancellation fees?", "No. Month-to-month, cancel any time, no fees. Most customers stay because they want to."],
            ["How fast can you start?", "Most new pools are on a weekly schedule within the same week. After your quote we set a service day and start."],
            ["What if my pool is green or in rough shape?", "We quote a one-time recovery (\"green to clear\") first, then weekly service kicks in at the standard rate."],
          ].map(([q, a]) => (
            <details key={q} style={{ borderTop: `1px solid ${t.rule2}`, padding: "20px 4px" }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 16.5, listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, letterSpacing: "-0.005em" }}>
                {q}
                <span style={{ color: t.gold, fontWeight: 400, fontSize: 24, lineHeight: 1, fontFamily: "'Fraunces', Georgia, serif" }}>+</span>
              </summary>
              <p style={{ margin: "12px 0 4px", fontSize: 15, lineHeight: 1.65, color: t.ink3 }}>{a}</p>
            </details>
          ))}
          <div style={{ borderTop: `1px solid ${t.rule2}` }} />
        </div>
      </section>

      <section style={{ background: t.ink, color: "#fff", padding: "72px 0", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 100%, rgba(201,163,91,0.15) 0, transparent 60%)`,
        }} />
        <div className="v1-container" style={{ position: "relative" }}>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 400, margin: "0 0 14px", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            Get back to <em style={{ color: t.gold, fontStyle: "italic" }}>enjoying</em> your pool.
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.78)", margin: "0 0 28px" }}>
            Free quote in under an hour. Same-week start.
          </p>
          <div style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="#v1-quote" style={{
              background: t.gold, color: t.ink, padding: "16px 26px",
              borderRadius: 10, fontWeight: 700, fontSize: 15.5, textDecoration: "none",
            }}>Get my free quote →</a>
            <PhoneLink kind="call" style={{
              background: "transparent", color: "#fff", padding: "16px 26px",
              borderRadius: 10, fontWeight: 600, fontSize: 15.5, textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.22)",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}><CallIcon size={16} /> {PHONE_DISPLAY}</PhoneLink>
          </div>
        </div>
      </section>

      <footer style={{ padding: "30px 0", background: "#06121F", color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
        <div className="v1-container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>© 2026 Escape Pool Services · Spring, TX · Licensed &amp; Insured</div>
          <div style={{ display: "flex", gap: 18 }}>
            <a href="/privacy.html" style={{ color: "inherit" }}>Privacy</a>
            <a href="/terms.html" style={{ color: "inherit" }}>Terms</a>
            <PhoneLink kind="call" style={{ color: "inherit" }}>{PHONE_DISPLAY}</PhoneLink>
          </div>
        </div>
      </footer>

      <StickyCTA accent={t.gold} scrollTarget="#v1-quote" />
    </div>
  );
}

export default V1Page;
