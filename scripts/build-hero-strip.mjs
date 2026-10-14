// Builds the faint photo columns behind the homepage hero (components/HeroPhotoColumns.tsx).
//   node scripts/build-hero-strip.mjs
// Takes the home carousel photos plus the first two photos of every current-season gallery, crops them to 4:5,
// turns them into small teal duotone thumbnails (≈10 KB each) in public/assets/images/hero-strip/,
// and lists them in src/data/heroStrip.json. Re-run it after adding new event photos.
import sharp from "sharp";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const EVENTS = resolve(here, "../public/assets/images/events");
const OUT_DIR = resolve(here, "../public/assets/images/hero-strip");
const MANIFEST = resolve(here, "../src/data/heroStrip.json");
const SEASON = "2026-2027";
const PER_GALLERY = 2;
const WIDTH = 320;
const HEIGHT = 400;
// duotone: shadows → navy, highlights → light teal
const DARK = [15, 23, 42]; // #0f172a
const LIGHT = [94, 234, 212]; // #5eead4

const duotone = async (src) => {
  const { data, info } = await sharp(src)
    .rotate() // respect EXIF orientation
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgb = Buffer.alloc(info.width * info.height * 3);
  for (let i = 0; i < info.width * info.height; i++) {
    const t = data[i * info.channels] / 255;
    for (let c = 0; c < 3; c++) rgb[i * 3 + c] = Math.round(DARK[c] + (LIGHT[c] - DARK[c]) * t);
  }
  return sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } });
};

const isPhoto = (f) => /\.(jpe?g|png|webp)$/i.test(f);
const photosIn = (dir) => readdirSync(dir).filter(isPhoto).sort().map((f) => join(dir, f));

const sources = [
  ...photosIn(join(EVENTS, "homecaroussel")),
  ...readdirSync(join(EVENTS, SEASON), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => photosIn(join(EVENTS, SEASON, d.name)).slice(0, PER_GALLERY)),
];

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const files = [];
for (const [i, src] of sources.entries()) {
  const name = `strip-${String(i + 1).padStart(2, "0")}.webp`;
  await (await duotone(src)).webp({ quality: 50 }).toFile(join(OUT_DIR, name));
  files.push(`/webapp/assets/images/hero-strip/${name}`);
}

writeFileSync(MANIFEST, JSON.stringify(files, null, 2) + "\n");
console.log(`hero strip: ${files.length} thumbnails → ${OUT_DIR}`);
