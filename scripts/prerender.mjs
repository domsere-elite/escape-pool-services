// Prerenders the homepage AND one message-matched STAG landing page per
// entry in src/skags.js, so paid traffic gets a fully-painted, on-message
// page before React loads. Runs as the last build step:
//   vite build && vite build --ssr src/entry-server.jsx --outDir dist-server && node scripts/prerender.mjs
import { readFileSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const serverEntry = pathToFileURL(resolve("dist-server/entry-server.js")).href;
const { render, SKAGS } = await import(serverEntry);

const indexPath = resolve("dist/index.html");
const template = readFileSync(indexPath, "utf8");

const MOUNT = '<div id="root"></div>';
if (!template.includes(MOUNT)) {
  throw new Error("prerender: mount point not found in dist/index.html");
}

// The built stylesheet link is the last render-blocking request on the LCP
// critical path; inline it (same file is reused across every page).
const cssLink = template.match(/<link rel="stylesheet"[^>]*href="(\/assets\/style-[^"]+\.css)"[^>]*>/);
if (!cssLink) {
  throw new Error("prerender: built stylesheet link not found in dist/index.html");
}
const css = readFileSync(resolve(`dist${cssLink[1]}`), "utf8");

// Build one page's HTML from the shared template. skag=null → homepage
// (byte-identical to the original single-page prerender). skag set → a
// landing page with its own <head> meta + inlined window.__SKAG.
function buildPage(html, skag) {
  let out = template.replace(MOUNT, `<div id="root">${html}</div>`);
  out = out.replace(cssLink[0], `<style>${css}</style>`);
  if (skag) {
    out = out
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${skag.title}</title>`)
      .replace(/<meta name="description" content="[\s\S]*?">/, `<meta name="description" content="${skag.description}">`)
      .replace(/<meta name="robots" content="[\s\S]*?">/, `<meta name="robots" content="noindex, follow">`)
      .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="https://escapepoolservices.com/lp/${skag.slug}/">`)
      // Inlined before </head> so it's defined when the app bundle runs.
      .replace("</head>", `<script>window.__SKAG=${JSON.stringify(skag).replace(/</g, "\\u003c")}</script>\n</head>`);
  }
  return out;
}

// Homepage (unchanged behavior).
writeFileSync(indexPath, buildPage(render(), null));

// STAG landing pages → dist/lp/<slug>/index.html (clean URL /lp/<slug>/).
for (const skag of SKAGS) {
  const dir = resolve(`dist/lp/${skag.slug}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "index.html"), buildPage(render(skag), skag));
}

rmSync(resolve("dist-server"), { recursive: true, force: true });
console.log(
  `prerender: homepage + ${SKAGS.length} landing pages ` +
  `(${SKAGS.map((s) => "/lp/" + s.slug).join(", ")}) + ${Math.round(css.length / 1024)}KB inline CSS`
);
