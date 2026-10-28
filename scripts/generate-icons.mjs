// Regenerates src/app/favicon.ico and src/app/apple-icon.png from src/app/icon.png
// Run: node scripts/generate-icons.mjs
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const SRC = new URL("../src/app/icon.png", import.meta.url);

// Trim any transparent padding so the artwork fills the tile,
// then fit it into a perfectly square MASTER canvas with an optical margin.
// (resize and extend run in two passes because sharp applies extend AFTER resize.)
const MASTER = 512;
const srcBuf = await readFile(SRC);
const artwork = await sharp(srcBuf).trim({ threshold: 25 }).toBuffer();
const inner = Math.round(MASTER * 0.86); // ~7% margin on each side
const scaled = await sharp(artwork).resize(inner, inner, { fit: "inside" }).png().toBuffer();
const sm = await sharp(scaled).metadata();
const padX = Math.floor((MASTER - sm.width) / 2);
const padY = Math.floor((MASTER - sm.height) / 2);
const master = await sharp(scaled)
  .extend({
    top: padY,
    bottom: MASTER - sm.height - padY,
    left: padX,
    right: MASTER - sm.width - padX,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

// keep the trimmed+balanced master as icon.png itself
// (sharp applies extend after resize, so the final canvas is MASTER + 2*margin)
await writeFile(SRC, master);

// --- favicon.ico: transparent PNG entries at 16 / 32 / 48 ------------------
const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map((s) => sharp(master).resize(s, s).png().toBuffer()),
);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4); // image count

const entries = [];
let offset = 6 + sizes.length * 16;
for (let i = 0; i < sizes.length; i++) {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], 0); // width
  e.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], 1); // height
  e.writeUInt8(0, 2); // palette
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // color planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(pngs[i].length, 8); // data size
  e.writeUInt32LE(offset, 12); // data offset
  entries.push(e);
  offset += pngs[i].length;
}

await writeFile(
  new URL("../src/app/favicon.ico", import.meta.url),
  Buffer.concat([header, ...entries, ...pngs]),
);

// --- apple-icon.png: 180x180, kept transparent ------------------------------
// iOS renders transparency on black, which gives this light artwork strong
// contrast; no tile needed.
const apple = await sharp(master).resize(180, 180).png().toBuffer();
await writeFile(new URL("../src/app/apple-icon.png", import.meta.url), apple);

const finalMeta = await sharp(master).metadata();
console.log(`icons generated: icon.png (${finalMeta.width}x${finalMeta.height} master) + favicon.ico (16/32/48) + apple-icon.png (180)`);
