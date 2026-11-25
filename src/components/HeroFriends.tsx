import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "motion/react";
import { buildFrameBank, drawFriends, type FrameBank } from "./pixel-friends/draw";
import {
  BEAN_AT,
  DAISY_AT,
  FPS,
  IDLE_INPUT,
  SPRITE,
  STAGE_H,
  STAGE_W,
  type InputState,
} from "./pixel-friends/sprites";

type FriendProps = {
  enabled: boolean;
  nudge: number;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
};

type Layout = { S: number; css: number; left: number; top: number };

const LOOK_THRESHOLD = 6;
const STILL_HAPPY_MS = 610;

/** Whole-number scale: 8× art px above 700 px wide, 5× below. */
function layoutFor(width: number, height: number, dpr: number): Layout {
  const wide = width > 700;
  // 5× needs 340 px; the narrowest phones drop to 4× rather than clip.
  const scale = wide ? 8 : STAGE_W * 5 <= width ? 5 : 4;
  const S = Math.max(1, Math.round(scale * dpr)); // device px per art px
  const css = S / dpr;
  const stageW = STAGE_W * css;
  const stageH = STAGE_H * css;
  const cx = wide ? width * 0.655 : width / 2;
  const bottom = wide ? height * 0.83 : Math.min(height * 0.56, 490);
  const snap = (v: number) => Math.round(v * dpr) / dpr;
  return { S, css, left: snap(cx - stageW / 2), top: snap(bottom - stageH) };
}

export default function HeroFriends({ enabled, nudge, pointerX }: FriendProps) {
  const container = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bank = useRef<FrameBank | null>(null);
  const layout = useRef<Layout | null>(null);
  const input = useRef<InputState>({ ...IDLE_INPUT });
  const t0 = useRef(performance.now());
  const lastFrame = useRef(-1);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const animated = enabled && !reduced;
  const now = () => (performance.now() - t0.current) / 1000;

  const draw = () => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx || !layout.current) return;
    bank.current ??= buildFrameBank();
    drawFriends(ctx, now(), input.current, layout.current.S, bank.current);
    if (!ready) setReady(true);
  };
  const drawRef = useRef(draw);
  drawRef.current = draw;

  // Size the stage so every art pixel is a whole number of device pixels.
  useEffect(() => {
    const fit = () => {
      const box = container.current;
      const el = stage.current;
      const cv = canvas.current;
      if (!box || !el || !cv) return;
      const next = layoutFor(box.clientWidth, box.clientHeight, Math.min(window.devicePixelRatio || 1, 2));
      layout.current = next;
      cv.width = STAGE_W * next.S;
      cv.height = STAGE_H * next.S;
      Object.assign(el.style, {
        left: `${next.left}px`,
        top: `${next.top}px`,
        width: `${STAGE_W * next.css}px`,
        height: `${STAGE_H * next.css}px`,
      });
      lastFrame.current = -1;
      drawRef.current();
    };
    const observer = new ResizeObserver(fit);
    if (container.current) observer.observe(container.current);
    window.addEventListener("resize", fit);
    fit();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  // Pause offscreen and in hidden tabs.
  useEffect(() => {
    let visible = true;
    const sync = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { rootMargin: "80px" },
    );
    if (container.current) observer.observe(container.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  // One rAF loop; it redraws only when the 10 fps frame index changes.
  useEffect(() => {
    input.current.animated = animated;
    lastFrame.current = -1;
    if (!animated || !active) {
      drawRef.current();
      return;
    }
    let raf = 0;
    const tick = () => {
      const frame = Math.floor(now() * FPS);
      if (frame !== lastFrame.current) {
        lastFrame.current = frame;
        drawRef.current();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated, active]);

  // Still mode: show the happy face, then return to idle.
  const stillTimer = useRef(0);
  const pokeStill = () => {
    if (input.current.animated) return;
    drawRef.current();
    window.clearTimeout(stillTimer.current);
    stillTimer.current = window.setTimeout(() => drawRef.current(), STILL_HAPPY_MS);
  };
  useEffect(() => () => window.clearTimeout(stillTimer.current), []);

  // NUDGE from the existing hero button.
  const firstNudge = useRef(nudge);
  useEffect(() => {
    if (nudge === firstNudge.current) return;
    input.current.nudgeAt = now();
    lastFrame.current = -1;
    pokeStill();
  }, [nudge]);

  // LOOK: App only feeds pointerX for mouse and pen, never touch.
  useEffect(
    () =>
      pointerX.on("change", (value) => {
        const look = value < -LOOK_THRESHOLD ? 1 : value > LOOK_THRESHOLD ? -1 : 0;
        input.current.look = look;
        input.current.lookAt = now();
      }),
    [pointerX],
  );

  // BOOP: a click or tap on a friend's 32×32 box anywhere in the hero.
  useEffect(() => {
    const hero = container.current?.closest<HTMLElement>(".hero");
    if (!hero) return;
    const hit = (event: PointerEvent) => {
      const rect = canvas.current?.getBoundingClientRect();
      if (!rect?.width) return null;
      const x = ((event.clientX - rect.left) / rect.width) * STAGE_W;
      const y = ((event.clientY - rect.top) / rect.height) * STAGE_H;
      const inBox = (at: { x: number; y: number }) =>
        x >= at.x && x < at.x + SPRITE && y >= at.y && y < at.y + SPRITE;
      return inBox(DAISY_AT) ? "daisy" : inBox(BEAN_AT) ? "bean" : null;
    };
    const blocked = (event: Event) =>
      (event.target as Element | null)?.closest("button, a, input, textarea, select, [role='button']");
    const onDown = (event: PointerEvent) => {
      if (event.button > 0 || blocked(event)) return;
      const who = hit(event);
      if (!who) return;
      if (who === "daisy") input.current.boopDaisyAt = now();
      else input.current.boopBeanAt = now();
      lastFrame.current = -1;
      pokeStill();
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      hero.style.cursor = !blocked(event) && hit(event) ? "pointer" : "";
    };
    hero.addEventListener("pointerdown", onDown);
    hero.addEventListener("pointermove", onMove);
    return () => {
      hero.removeEventListener("pointerdown", onDown);
      hero.removeEventListener("pointermove", onMove);
      hero.style.cursor = "";
    };
  }, []);

  return (
    <div
      className={`hero-friends ${ready ? "is-ready" : ""}`}
      ref={container}
      data-rendering={ready && animated && active ? "animated" : "still"}
    >
      <div className="pixel-stage" ref={stage}>
        <img
          className="hero-photo"
          src={`${import.meta.env.BASE_URL}images/pixel-friends.png`}
          alt="Two pixel-art friends on a cream stage: Daisy, a lilac daisy with a sunny face, and Bean, a small apricot bean"
          width={STAGE_W}
          height={STAGE_H}
          fetchPriority="high"
        />
        <canvas className="friends-canvas" ref={canvas} aria-hidden="true" />
      </div>
    </div>
  );
}
