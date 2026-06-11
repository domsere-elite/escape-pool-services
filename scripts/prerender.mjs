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
writeFileSync(indexPath, template.replace(MOUNT, `<div id="root">${html}</div>`));
rmSync(resolve("dist-server"), { recursive: true, force: true });
console.log(`prerender: injected ${Math.round(html.length / 1024)}KB of static HTML into dist/index.html`);
