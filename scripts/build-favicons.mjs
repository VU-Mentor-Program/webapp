// Generates the favicon / app icons from the white 2026-2027 logo on the theme gradient.
//   node scripts/build-favicons.mjs
// Writes public/favicon.ico, public/favicon-192.png, public/apple-touch-icon.png, public/icon-512.png
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const LOGO = resolve(here, "../public/assets/images/logos/2026-2027.png");
const OUT = resolve(here, "../public");

// Same gradient as the 2026-27 brand image: light green → teal → navy.
const gradientSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c8f6c1"/>
      <stop offset="0.3" stop-color="#3fa682"/>
      <stop offset="0.5" stop-color="#1c7f83"/>
      <stop offset="0.75" stop-color="#1e3f8f"/>
      <stop offset="1" stop-color="#161f6b"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#g)"/>
</svg>`;

async function render(size, { round = false } = {}) {
  const logoSize = Math.round(size * 0.7);
  const logo = await sharp(LOGO).trim().resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  let img = sharp(Buffer.from(gradientSvg(size))).composite([{ input: logo, gravity: "centre" }]);
  if (round) {
    const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`);
    img = sharp(await img.png().toBuffer()).composite([{ input: mask, blend: "dest-in" }]);
  }
  return img.png().toBuffer();
}

/** ICO container holding a single PNG-encoded image (supported by all modern browsers). */
function pngToIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // planes
  entry.writeUInt16LE(32, 6); // bpp
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(6 + 16, 12); // offset
  return Buffer.concat([header, entry, png]);
}

const ico = await render(256, { round: true });
writeFileSync(resolve(OUT, "favicon.ico"), pngToIco(ico, 256));
writeFileSync(resolve(OUT, "favicon-192.png"), await render(192, { round: true }));
writeFileSync(resolve(OUT, "apple-touch-icon.png"), await render(180));
writeFileSync(resolve(OUT, "icon-512.png"), await render(512));
console.log("Wrote favicon.ico, favicon-192.png, apple-touch-icon.png, icon-512.png");
