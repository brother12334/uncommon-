// Palette-indexed pixel sprites for Daisy and Bean, plus the pose timeline.
// Pure data and functions with no imports, so scripts/export-still.mjs can
// load this file directly with Node's type stripping.

export const SPRITE = 32;
export const STAGE_W = 68;
export const STAGE_H = 50;
export const FPS = 10;

/** Stage placement of each 32×32 sprite, in art px. */
export const DAISY_AT = { x: 2, y: 16 };
export const BEAN_AT = { x: 34, y: 16 };

export const PALETTE = [
  "", // 0 transparent
  "#45313d", // 1 outline
  "#b6a0d5", // 2 petal
  "#a891cb", // 3 petal shade
  "#725d85", // 4 plum
  "#f2d377", // 5 face
  "#e8a780", // 6 bean
  "#d8936d", // 7 bean shade
  "#f5e8d3", // 8 cream
  "#df947e", // 9 blush
  "#f8f3e9", // 10 highlight
] as const;

export const SHADOW_ALPHA = 0.12;

const O = 1,
  PETAL = 2,
  PETAL_SH = 3,
  PLUM = 4,
  FACE = 5,
  BEAN = 6,
  BEAN_SH = 7,
  CREAM = 8,
  BLUSH = 9,
  HI = 10;

export type Eyes = "open" | "blink" | "squeeze" | "happy";
export type Look = -1 | 0 | 1;
export type DaisyBody = "front" | "side" | "back" | "sideBack" | "crouch" | "squash";
export type BeanArm = "rest" | "mid" | "up" | "tilt";

export type DaisyFrame = { body: DaisyBody; look: Look; eyes: Eyes; bob: 0 | 1 };
export type BeanFrame = { arm: BeanArm; look: Look; eyes: Eyes; bob: 0 | 1 };

class Grid {
  px = new Uint8Array(SPRITE * SPRITE);
  set(x: number, y: number, c: number) {
    if (x < 0 || y < 0 || x >= SPRITE || y >= SPRITE) return;
    this.px[y * SPRITE + x] = c;
  }
  get(x: number, y: number) {
    if (x < 0 || y < 0 || x >= SPRITE || y >= SPRITE) return 0;
    return this.px[y * SPRITE + x];
  }
  /**
   * Stamp a filled shape with a 1 px outline ring around it. `inside` tests
   * pixel centers; `tone` picks the fill color for each inside pixel.
   */
  shape(inside: (x: number, y: number) => boolean, tone: (x: number, y: number) => number) {
    const mask = new Uint8Array(SPRITE * SPRITE);
    for (let y = 0; y < SPRITE; y++)
      for (let x = 0; x < SPRITE; x++) if (inside(x + 0.5, y + 0.5)) mask[y * SPRITE + x] = 1;
    const at = (x: number, y: number) =>
      x >= 0 && y >= 0 && x < SPRITE && y < SPRITE && mask[y * SPRITE + x] === 1;
    for (let y = 0; y < SPRITE; y++)
      for (let x = 0; x < SPRITE; x++) {
        if (at(x, y)) continue;
        if (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)) this.set(x, y, O);
      }
    for (let y = 0; y < SPRITE; y++)
      for (let x = 0; x < SPRITE; x++) if (at(x, y)) this.set(x, y, tone(x + 0.5, y + 0.5));
  }
  /** Fill without an outline, for markings that sit inside a form. */
  fill(inside: (x: number, y: number) => boolean, c: number) {
    for (let y = 0; y < SPRITE; y++)
      for (let x = 0; x < SPRITE; x++) if (inside(x + 0.5, y + 0.5)) this.set(x, y, c);
  }
}

const ellipse = (cx: number, cy: number, rx: number, ry: number) => (x: number, y: number) =>
  ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;

/** Lower-right falloff, the same light direction for every form. */
const shaded = (cx: number, cy: number, r: number, base: number, shade: number) => (x: number, y: number) =>
  (x - cx) * 0.55 + (y - cy) * 0.83 > r * 0.42 ? shade : base;

function eyes(g: Grid, xs: number[], y: number, kind: Eyes) {
  for (const x of xs) {
    if (kind === "open") {
      g.set(x, y, HI); // glint
      g.set(x + 1, y, O);
      g.set(x, y + 1, O);
      g.set(x + 1, y + 1, O);
    } else if (kind === "blink") {
      g.set(x, y + 1, O);
      g.set(x + 1, y + 1, O);
    } else {
      // squeeze and happy: a small ^ over the eye spot
      g.set(x - 1, y + 1, O);
      g.set(x, y, O);
      g.set(x + 1, y, O);
      g.set(x + 2, y + 1, O);
    }
  }
}

function smile(g: Grid, cx: number, y: number, wide: boolean) {
  g.set(cx - 2, y, O);
  g.set(cx - 1, y + 1, O);
  g.set(cx, y + 1, O);
  g.set(cx + 1, y, O);
  if (wide) {
    g.set(cx - 3, y - 1, O);
    g.set(cx + 2, y - 1, O);
    g.set(cx - 1, y, BLUSH);
    g.set(cx, y, BLUSH);
  }
}

export function buildDaisy(f: DaisyFrame): Uint8Array {
  const g = new Grid();
  const squash = f.body === "squash";
  const crouch = f.body === "crouch";
  const lift = (crouch ? -1 : 0) + (squash ? -2 : 0) - f.bob;
  const cx = 16;
  const cy = 13 - lift;
  const ringX = squash ? 9.5 : f.body === "side" || f.body === "sideBack" ? 4.6 : 8.5;
  const ringY = squash || crouch ? 7.5 : 8.5;

  // Legs and stem arms first, so petals sit on top of them.
  const footY = 30;
  g.shape(ellipse(13.2, footY, 2.2, 1.3), () => PLUM);
  g.shape(ellipse(18.8, footY, 2.2, 1.3), () => PLUM);
  for (let y = cy + 9; y <= footY - 1; y++) {
    g.set(15, y, PLUM);
    g.set(16, y, PLUM);
    g.set(14, y, O);
    g.set(17, y, O);
  }
  const armY = Math.min(cy + 11, 27);
  for (const [dx, dy] of [
    [-3, 0],
    [-4, -1],
    [-5, -2],
  ])
    g.set(cx + dx, armY + dy, PLUM);
  for (const [dx, dy] of [
    [2, 0],
    [3, -1],
    [4, -2],
  ])
    g.set(cx + dx, armY + dy, PLUM);
  for (const [dx, dy] of [
    [-3, -1],
    [-4, -2],
    [-5, -3],
    [-6, -2],
    [-4, 0],
    [-5, -1],
    [2, -1],
    [3, -2],
    [4, -3],
    [5, -2],
    [3, 0],
    [4, -1],
  ])
    if (g.get(cx + dx, armY + dy) === 0) g.set(cx + dx, armY + dy, O);

  // Eight rounded petals around the face.
  const petalR = squash ? 3.4 : 3.6;
  const order = [4, 3, 5, 2, 6, 1, 7, 0]; // back petals first
  for (const i of order) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const px = cx + Math.cos(a) * ringX;
    const py = cy + Math.sin(a) * ringY;
    const rx = f.body === "side" || f.body === "sideBack" ? petalR * 0.78 : petalR;
    g.shape(ellipse(px, py, rx, petalR), shaded(px, py, petalR, PETAL, PETAL_SH));
    // one highlight pixel on the upper-left petals
    if (i >= 5 && f.body !== "back" && f.body !== "sideBack") g.set(Math.round(px - 1.5), Math.round(py - 1.5), HI);
  }

  const happy = f.eyes === "happy";
  if (f.body === "back") {
    g.shape(ellipse(cx, cy, 5.2, 5.2), shaded(cx, cy, 5.2, PETAL_SH, PLUM));
    g.set(cx - 2, cy - 3, HI);
    return g.px;
  }
  if (f.body === "sideBack") {
    g.shape(ellipse(cx - 2.2, cy, 3.2, 5.6), (x) => (x > cx - 2.2 ? PLUM : PETAL_SH));
    return g.px;
  }
  if (f.body === "side") {
    const fx = cx + 2.2;
    g.shape(ellipse(fx, cy, 3.6, 6.1), () => FACE);
    g.set(Math.round(fx - 1.5), cy - 3, HI);
    eyes(g, [Math.round(fx)], cy - 1, f.eyes);
    g.set(Math.round(fx) + 1, cy + 2, O);
    g.set(Math.round(fx), cy + 3, O);
    g.set(Math.round(fx) + 2, cy + 2, BLUSH);
    return g.px;
  }

  // Front, crouch and squash share the full face.
  const fx = cx + f.look;
  const rx = squash ? 7.1 : 6.1;
  const ry = squash ? 5.3 : 6.1;
  g.shape(ellipse(fx, cy, rx, ry), () => FACE);
  g.set(Math.round(fx - 3), cy - 4, HI);
  g.set(Math.round(fx - 4), cy - 3, HI);
  const ex = Math.round(fx) + f.look;
  eyes(g, [ex - 3, ex + 2], cy - 1, f.eyes);
  smile(g, Math.round(fx), cy + 2, happy || f.eyes === "squeeze");
  for (const [x, y] of [
    [Math.round(fx) - 5, cy + 1],
    [Math.round(fx) - 4, cy + 1],
    [Math.round(fx) + 4, cy + 1],
    [Math.round(fx) + 5, cy + 1],
  ])
    g.set(x, y, BLUSH);
  return g.px;
}

export function buildBean(f: BeanFrame): Uint8Array {
  const g = new Grid();
  const lift = f.bob;
  const top = ellipse(16.6, 16.8 - lift, 6.2, 6.4);
  const low = ellipse(15.6, 23.4 - lift, 7.3, 6.4);
  const cx = 16;
  const cy = 20 - lift;

  // Feet
  g.shape(ellipse(12.8, 30, 2, 1.2), () => BEAN_SH);
  g.shape(ellipse(19, 30, 2, 1.2), () => BEAN_SH);

  // Left arm stays at rest; the right arm carries the wave.
  g.shape(ellipse(8.2, 22.5 - lift, 1.7, 2), shaded(8.2, 22.5 - lift, 1.7, BEAN, BEAN_SH));
  const arm =
    f.arm === "rest"
      ? { x: 23.6, y: 22.5 }
      : f.arm === "mid"
        ? { x: 24.6, y: 19.5 }
        : f.arm === "up"
          ? { x: 25, y: 15.5 }
          : { x: 26.4, y: 16.8 };
  g.shape(ellipse(arm.x, arm.y - lift, 1.7, 2), shaded(arm.x, arm.y - lift, 1.7, BEAN, BEAN_SH));

  // One continuous bean silhouette.
  g.shape(
    (x, y) => top(x, y) || low(x, y),
    (x, y) => ((x - cx) * 0.62 + (y - cy) * 0.78 > 4.4 ? BEAN_SH : BEAN),
  );
  g.set(12, 12 - lift, HI);
  g.set(11, 13 - lift, HI);

  // Cream face patch, shifted with the look.
  const fx = 16.4 + f.look;
  const fy = 19 - lift;
  g.fill(ellipse(fx, fy + 0.3, 5.3, 4.1), CREAM);
  const ex = Math.round(fx) + f.look;
  eyes(g, [ex - 3, ex + 1], fy - 2, f.eyes);
  smile(g, Math.round(fx), fy + 1, f.eyes === "happy" || f.eyes === "squeeze");
  g.set(Math.round(fx) - 6, fy + 1, BLUSH);
  g.set(Math.round(fx) - 6, fy + 2, BLUSH);
  g.set(Math.round(fx) + 5, fy + 1, BLUSH);
  g.set(Math.round(fx) + 6, fy + 1, BLUSH);
  return g.px;
}

export const SPARKLE = [
  [0, 1, 0],
  [1, 1, 1],
  [0, 1, 0],
];
export const HEART = [
  [0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0],
];

/* ---------------------------------------------------------------- timeline */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Repeating blink schedules, in whole frames, from seed 26. */
const BLINK_CYCLE = 600; // 60 s
function blinkSchedule(rand: () => number, start: number) {
  const starts: number[] = [];
  let f = start;
  while (f < BLINK_CYCLE - 30) {
    starts.push(f);
    f += 30 + Math.floor(rand() * 21); // 3–5 s
  }
  return starts;
}
const rand = mulberry32(26);
const DAISY_BLINKS = blinkSchedule(rand, 14);
const BEAN_BLINKS = blinkSchedule(rand, 31);
const SPARKLE_SPOTS = Array.from({ length: 6 }, (_, i) => {
  const r = rand();
  const s = rand();
  // around Daisy's head, alternating left and right of the petals
  return {
    x: DAISY_AT.x + (i % 2 === 0 ? 1 + Math.floor(r * 6) : 24 + Math.floor(r * 6)),
    y: DAISY_AT.y - 2 + Math.floor(s * 14) - (i < 2 ? 4 : 0),
    color: i % 2 === 0 ? 5 : 2,
    delay: i % 3,
  };
});

function blinking(frame: number, starts: number[]) {
  const f = ((frame % BLINK_CYCLE) + BLINK_CYCLE) % BLINK_CYCLE;
  return starts.some((s) => f >= s && f < s + 2);
}

export type InputState = {
  /** false when motion is off or prefers-reduced-motion is reduce */
  animated: boolean;
  /** last LOOK direction (-1 left, 1 right) and when it was set, in s */
  look: Look;
  lookAt: number;
  nudgeAt: number;
  boopDaisyAt: number;
  boopBeanAt: number;
};

export const IDLE_INPUT: InputState = {
  animated: false,
  look: 0,
  lookAt: -Infinity,
  nudgeAt: -Infinity,
  boopDaisyAt: -Infinity,
  boopBeanAt: -Infinity,
};

export type Pose = {
  daisy: DaisyFrame & { hop: number; mirror: boolean };
  bean: BeanFrame;
  daisyShadow: number; // shadow half-width in art px
  sparkles: { x: number; y: number; color: number; dot: boolean }[];
  hearts: { x: number; y: number }[];
};

const DAISY_HOP = [0, 3, 5, 6, 4, 0];
const DAISY_TURN: DaisyBody[] =["crouch", "side", "back", "sideBack", "front", "squash"];
const BEAN_WAVE: BeanArm[] = ["mid", "up", "tilt", "up", "tilt", "up", "tilt", "mid"];

/** The pose at time t (s), from t and the latest input events alone. */
export function poseAt(t: number, input: InputState): Pose {
  const frame = Math.floor(t * FPS + 1e-6);
  const pose: Pose = {
    daisy: { body: "front", look: 0, eyes: "open", bob: 0, hop: 0, mirror: false },
    bean: { arm: "rest", look: 0, eyes: "open", bob: 0 },
    daisyShadow: 10,
    sparkles: [],
    hearts: [],
  };
  const since = (at: number) => t - at;

  if (!input.animated) {
    const happy = since(input.nudgeAt) >= 0 && since(input.nudgeAt) < 0.6;
    if (happy || (since(input.boopDaisyAt) >= 0 && since(input.boopDaisyAt) < 0.6)) pose.daisy.eyes = "happy";
    if (happy || (since(input.boopBeanAt) >= 0 && since(input.boopBeanAt) < 0.6)) pose.bean.eyes = "happy";
    return pose;
  }

  const bob = (Math.floor(frame / 10) % 2) as 0 | 1;
  pose.daisy.bob = bob;
  pose.bean.bob = bob;
  if (blinking(frame, DAISY_BLINKS)) pose.daisy.eyes = "blink";
  if (blinking(frame, BEAN_BLINKS)) pose.bean.eyes = "blink";

  if (input.look !== 0 && since(input.lookAt) < 8) {
    pose.daisy.look = input.look;
    pose.bean.look = input.look;
  }

  for (const [at, who] of [
    [input.boopDaisyAt, pose.daisy],
    [input.boopBeanAt, pose.bean],
  ] as const) {
    const s = since(at);
    if (s >= 0 && s < 0.3) who.eyes = "squeeze";
  }
  for (const [at, hx, hy] of [
    [input.boopDaisyAt, DAISY_AT.x + 13, DAISY_AT.y - 2],
    [input.boopBeanAt, BEAN_AT.x + 13, BEAN_AT.y + 6],
  ] as const) {
    const s = since(at);
    if (s >= 0 && s < 0.5) {
      // rises 6 px over 0.5 s, flickers on the 4th frame to fade out
      const f = Math.floor(s * FPS + 1e-6);
      if (f !== 3) pose.hearts.push({ x: hx, y: hy - Math.min(6, Math.round((f + 1) * 1.2)) });
    }
  }

  const n = since(input.nudgeAt);
  if (n >= 0) {
    const f = Math.floor(n * FPS + 1e-6);
    if (f < DAISY_TURN.length) {
      const body = DAISY_TURN[f]!;
      pose.daisy.body = body;
      pose.daisy.hop = DAISY_HOP[f];
      pose.daisy.bob = 0;
      pose.daisy.look = 0;
      pose.daisy.mirror = body === "sideBack";
      if (body === "squash" || body === "crouch") pose.daisy.eyes = "squeeze";
      else if (pose.daisy.eyes === "blink") pose.daisy.eyes = "open";
      pose.daisyShadow = 10 - Math.round(DAISY_HOP[f] / 2);
    }
    const bf = f - 2;
    if (bf >= 0 && bf < BEAN_WAVE.length) {
      pose.bean.arm = BEAN_WAVE[bf];
      if (pose.bean.eyes !== "blink") pose.bean.eyes = "happy";
    }
    const sf = f - 5;
    if (sf >= 0)
      for (const s of SPARKLE_SPOTS) {
        const k = sf - s.delay;
        if (k < 0 || k >= 6 || k === 3 || k === 5) continue; // blink out
        pose.sparkles.push({ x: s.x, y: s.y - Math.round(((k + 1) / 6) * 8), color: s.color, dot: k >= 4 });
      }
  }
  return pose;
}

/** Every sprite frame the timeline can request, for pre-rendering at mount. */
export function allDaisyFrames(): DaisyFrame[] {
  const out: DaisyFrame[] = [];
  const bodies: DaisyBody[] = ["front", "side", "back", "sideBack", "crouch", "squash"];
  const eyesAll: Eyes[] = ["open", "blink", "squeeze", "happy"];
  for (const body of bodies)
    for (const look of [-1, 0, 1] as Look[])
      for (const e of eyesAll) for (const bob of [0, 1] as const) out.push({ body, look, eyes: e, bob });
  return out;
}
export function allBeanFrames(): BeanFrame[] {
  const out: BeanFrame[] = [];
  const eyesAll: Eyes[] = ["open", "blink", "squeeze", "happy"];
  for (const arm of ["rest", "mid", "up", "tilt"] as BeanArm[])
    for (const look of [-1, 0, 1] as Look[])
      for (const e of eyesAll) for (const bob of [0, 1] as const) out.push({ arm, look, eyes: e, bob });
  return out;
}
export const daisyKey = (f: DaisyFrame) => `${f.body}|${f.look}|${f.eyes}|${f.bob}`;
export const beanKey = (f: BeanFrame) => `${f.arm}|${f.look}|${f.eyes}|${f.bob}`;

/** Shadow mask: 2 = solid, 1 = dithered edge. Centered on (cx, cy). */
export function shadowPixels(cx: number, cy: number, half: number) {
  const pts: { x: number; y: number }[] = [];
  for (let y = -2; y < 2; y++)
    for (let x = -half; x < half; x++) {
      const d = ((x + 0.5) / half) ** 2 + ((y + 0.5) / 2) ** 2;
      if (d > 1) continue;
      const edge = d > 0.55;
      if (edge && (x + y) % 2 !== 0) continue;
      pts.push({ x: cx + x, y: cy + y });
    }
  return pts;
}

/**
 * Compose the full stage for a pose into a 1× RGBA buffer. Used by the still
 * exporter and the palette check; the live renderer draws pre-rendered frames.
 */
export function composeStage(pose: Pose): Uint8ClampedArray {
  const out = new Uint8ClampedArray(STAGE_W * STAGE_H * 4);
  const put = (x: number, y: number, hex: string, alpha = 1) => {
    if (x < 0 || y < 0 || x >= STAGE_W || y >= STAGE_H) return;
    const i = (y * STAGE_W + x) * 4;
    out[i] = parseInt(hex.slice(1, 3), 16);
    out[i + 1] = parseInt(hex.slice(3, 5), 16);
    out[i + 2] = parseInt(hex.slice(5, 7), 16);
    out[i + 3] = Math.round(alpha * 255);
  };
  for (const p of shadowPixels(DAISY_AT.x + 16, DAISY_AT.y + 31, pose.daisyShadow)) put(p.x, p.y, PALETTE[1], SHADOW_ALPHA);
  for (const p of shadowPixels(BEAN_AT.x + 16, BEAN_AT.y + 31, 9)) put(p.x, p.y, PALETTE[1], SHADOW_ALPHA);
  const blit = (px: Uint8Array, ox: number, oy: number, mirror: boolean) => {
    for (let y = 0; y < SPRITE; y++)
      for (let x = 0; x < SPRITE; x++) {
        const c = px[y * SPRITE + (mirror ? SPRITE - 1 - x : x)];
        if (c) put(ox + x, oy + y, PALETTE[c]);
      }
  };
  blit(buildDaisy(pose.daisy), DAISY_AT.x, DAISY_AT.y - pose.daisy.hop, pose.daisy.mirror);
  blit(buildBean(pose.bean), BEAN_AT.x, BEAN_AT.y, false);
  for (const s of pose.sparkles) {
    if (s.dot) put(s.x + 1, s.y + 1, PALETTE[s.color]);
    else SPARKLE.forEach((row, y) => row.forEach((v, x) => v && put(s.x + x, s.y + y, PALETTE[s.color])));
  }
  for (const h of pose.hearts) HEART.forEach((row, y) => row.forEach((v, x) => v && put(h.x + x, h.y + y, PALETTE[9])));
  return out;
}
