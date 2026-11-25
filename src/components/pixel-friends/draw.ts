import {
  BEAN_AT,
  DAISY_AT,
  HEART,
  PALETTE,
  SHADOW_ALPHA,
  SPARKLE,
  SPRITE,
  STAGE_H,
  STAGE_W,
  allBeanFrames,
  allDaisyFrames,
  beanKey,
  buildBean,
  buildDaisy,
  daisyKey,
  poseAt,
  shadowPixels,
  type InputState,
} from "./sprites";

export type FrameBank = {
  daisy: Map<string, HTMLCanvasElement>;
  bean: Map<string, HTMLCanvasElement>;
};

const RGB = PALETTE.map((hex) =>
  hex
    ? [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
      ]
    : [0, 0, 0],
);

function toCanvas(px: Uint8Array) {
  const canvas = document.createElement("canvas");
  canvas.width = SPRITE;
  canvas.height = SPRITE;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(SPRITE, SPRITE);
  px.forEach((c, i) => {
    if (!c) return;
    image.data.set([...RGB[c], 255], i * 4);
  });
  ctx.putImageData(image, 0, 0);
  return canvas;
}

/** Pre-render every sprite frame once, at 1 art px per canvas px. */
export function buildFrameBank(): FrameBank {
  const daisy = new Map<string, HTMLCanvasElement>();
  const bean = new Map<string, HTMLCanvasElement>();
  for (const f of allDaisyFrames()) daisy.set(daisyKey(f), toCanvas(buildDaisy(f)));
  for (const f of allBeanFrames()) bean.set(beanKey(f), toCanvas(buildBean(f)));
  return { daisy, bean };
}

/**
 * Draw the stage for time t (s) from t and the latest input events alone.
 * `S` is device pixels per art pixel and is always a whole number.
 */
export function drawFriends(
  ctx: CanvasRenderingContext2D,
  t: number,
  input: InputState,
  S: number,
  bank: FrameBank,
) {
  const pose = poseAt(t, input);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, STAGE_W * S, STAGE_H * S);

  const dot = (x: number, y: number, c: number) => {
    ctx.fillStyle = PALETTE[c];
    ctx.fillRect(x * S, y * S, S, S);
  };

  ctx.globalAlpha = SHADOW_ALPHA;
  for (const p of shadowPixels(DAISY_AT.x + 16, DAISY_AT.y + 31, pose.daisyShadow))
    dot(p.x, p.y, 1);
  for (const p of shadowPixels(BEAN_AT.x + 16, BEAN_AT.y + 31, 9)) dot(p.x, p.y, 1);
  ctx.globalAlpha = 1;

  const daisy = bank.daisy.get(daisyKey(pose.daisy))!;
  const dy = (DAISY_AT.y - pose.daisy.hop) * S;
  if (pose.daisy.mirror) {
    ctx.save();
    ctx.translate((DAISY_AT.x + SPRITE) * S, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(daisy, 0, 0, SPRITE * S, SPRITE * S);
    ctx.restore();
  } else {
    ctx.drawImage(daisy, DAISY_AT.x * S, dy, SPRITE * S, SPRITE * S);
  }
  ctx.drawImage(
    bank.bean.get(beanKey(pose.bean))!,
    BEAN_AT.x * S,
    BEAN_AT.y * S,
    SPRITE * S,
    SPRITE * S,
  );

  for (const s of pose.sparkles) {
    if (s.dot) dot(s.x + 1, s.y + 1, s.color);
    else
      SPARKLE.forEach((row, y) =>
        row.forEach((v, x) => v && dot(s.x + x, s.y + y, s.color)),
      );
  }
  for (const h of pose.hearts)
    HEART.forEach((row, y) => row.forEach((v, x) => v && dot(h.x + x, h.y + y, 9)));
}
