// Writes public/images/pixel-friends.png: the idle frame of the pixel friends
// at 1 art px per image px. CSS scales it with image-rendering: pixelated.
// Usage: node scripts/export-still.mjs [outPath] [scale]
import { deflateSync } from "node:zlib";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import {
  STAGE_W,
  STAGE_H,
  IDLE_INPUT,
  composeStage,
  poseAt,
} from "../src/components/pixel-friends/sprites.ts";

const out = process.argv[2] ?? "public/images/pixel-friends.png";
const scale = Number(process.argv[3] ?? 1);

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "ascii");
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, tail]);
};

export function encodePng(rgba, width, height) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * width * 4, width * 4).copy(
      raw,
      y * (width * 4 + 1) + 1,
    );
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const art = composeStage(poseAt(0, IDLE_INPUT));
const w = STAGE_W * scale;
const h = STAGE_H * scale;
const rgba = new Uint8ClampedArray(w * h * 4);
for (let y = 0; y < h; y++)
  for (let x = 0; x < w; x++) {
    const s = ((Math.floor(y / scale) * STAGE_W + Math.floor(x / scale)) * 4);
    rgba.set(art.subarray(s, s + 4), (y * w + x) * 4);
  }
await mkdir(dirname(out), { recursive: true });
await writeFile(out, encodePng(rgba, w, h));
console.log(`wrote ${out} (${w}×${h})`);
