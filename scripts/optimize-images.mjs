// One-time asset pipeline: generate WebP variants of the photo assets.
// Run: node scripts/optimize-images.mjs   (outputs committed to the repo)
import sharp from "sharp";
import { statSync } from "node:fs";

const JOBS = [
  ["hero-pool-aerial.jpg", 1600],
  ["hero-pool-aerial-mobile.jpg", 760],
  ["pool-before.jpg", 1200],
  ["pool-after.jpg", 1200],
];

for (const [file, width] of JOBS) {
  const src = `public/assets/${file}`;
  const out = `public/assets/${file.replace(/\.jpg$/, ".webp")}`;
  await sharp(src)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(out);
  const a = Math.round(statSync(src).size / 1024);
  const b = Math.round(statSync(out).size / 1024);
  console.log(`${file}: ${a}KB -> ${out.split("/").pop()}: ${b}KB`);
}
