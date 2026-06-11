// Injects the prerendered app HTML into dist/index.html so paid traffic
// gets a fully-painted page before React loads. Runs as the last build step:
//   vite build && vite build --ssr src/entry-server.jsx --outDir dist-server && node scripts/prerender.mjs
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const serverEntry = pathToFileURL(resolve("dist-server/entry-server.js")).href;
const { render } = await import(serverEntry);

const html = render();
const indexPath = resolve("dist/index.html");
const template = readFileSync(indexPath, "utf8");

const MOUNT = '<div id="root"></div>';
if (!template.includes(MOUNT)) {
  throw new Error("prerender: mount point not found in dist/index.html");
}
let out = template.replace(MOUNT, `<div id="root">${html}</div>`);

// Inline the built stylesheet: the <link> was the last render-blocking
// request on the LCP critical path (~500ms on slow 4G). The CSS file stays
// in dist/assets but nothing references it after this.
const cssLink = out.match(/<link rel="stylesheet"[^>]*href="(\/assets\/style-[^"]+\.css)"[^>]*>/);
if (!cssLink) {
  throw new Error("prerender: built stylesheet link not found in dist/index.html");
}
const css = readFileSync(resolve(`dist${cssLink[1]}`), "utf8");
out = out.replace(cssLink[0], `<style>${css}</style>`);

writeFileSync(indexPath, out);
rmSync(resolve("dist-server"), { recursive: true, force: true });
console.log(`prerender: injected ${Math.round(html.length / 1024)}KB static HTML + ${Math.round(css.length / 1024)}KB inline CSS into dist/index.html`);
