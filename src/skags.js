/* ============================================================
   STAG landing-page registry — single source of truth.

   Each entry generates one prerendered, message-matched landing
   page at /lp/<slug>/ (see scripts/prerender.mjs). The page reuses
   the full V2Page design; only the eyebrow + hero H1 + <head> meta
   change so the search term → ad headline → page headline match.

   Data is JSON-serializable (plain strings only): the prerender
   inlines it as window.__SKAG so the client hydrates identically.
   h1Lead = plain lead text; h1Em = the emphasized (italic) tail.

   The homepage (no SKAG) is unaffected — V2Page falls back to its
   angle-based HEADLINES when no skag prop is passed.
   ============================================================ */

export const SKAGS = [
  {
    slug: "pool-cleaning-service",
    adGroup: "Pool Cleaning / Service – Near Me",
    eyebrow: "Now booking · Spring & North Houston",
    h1Lead: "Pool cleaning service,",
    h1Em: "done right.",
    title: "Pool Cleaning Service Near You — $199/mo Flat | Escape Pool Services",
    description:
      "Local weekly pool cleaning service — $199/mo flat, all chemicals included, free filter clean for new customers ($125 value). Same tech every week. Licensed, insured, no contracts.",
  },
  {
    slug: "weekly-pool-service",
    adGroup: "Weekly / Recurring",
    eyebrow: "Now booking · Spring, TX",
    h1Lead: "Weekly pool service.",
    h1Em: "$199 a month, flat.",
    title: "Weekly Pool Service — $199/mo Flat, Chemicals Included | Escape Pool Services",
    description:
      "Weekly pool service for $199/mo flat — same technician every week, all chemicals included, photo report after every visit. Free filter clean for new customers. No contracts.",
  },
  {
    slug: "pool-service-spring-tx",
    adGroup: "Spring, TX",
    eyebrow: "Now booking · Spring, TX",
    h1Lead: "Pool service in",
    h1Em: "Spring, TX.",
    title: "Pool Service in Spring, TX — $199/mo Flat | Escape Pool Services",
    description:
      "Weekly pool service in Spring, TX — $199/mo flat, chemicals included, free filter clean for new customers. Family-owned since 2020, 300+ pools weekly. Licensed & insured, no contracts.",
  },
  {
    slug: "pool-service-the-woodlands",
    adGroup: "The Woodlands",
    eyebrow: "Now booking · The Woodlands, TX",
    h1Lead: "Pool service in",
    h1Em: "The Woodlands.",
    title: "Pool Service in The Woodlands — $199/mo Flat | Escape Pool Services",
    description:
      "Weekly pool service in The Woodlands — $199/mo flat, chemicals included, free filter clean for new customers. Family-owned since 2020. Same tech every week, photo report, no contracts.",
  },
  {
    slug: "pool-service-conroe-tx",
    adGroup: "Conroe, TX",
    eyebrow: "Now booking · Conroe, TX",
    h1Lead: "Pool service in",
    h1Em: "Conroe, TX.",
    title: "Pool Service in Conroe, TX — $199/mo Flat | Escape Pool Services",
    description:
      "Weekly pool service in Conroe, TX — $199/mo flat, chemicals included, free filter clean for new customers. Family-owned since 2020. Same tech every week, photo report, no contracts.",
  },
];
