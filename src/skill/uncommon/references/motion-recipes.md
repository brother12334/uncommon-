# Motion Engineering: A Small Set of Reliable Patterns

These are original starting patterns, not a complete component library. Match them to the installed framework and current official documentation. Use semantic markup first. Keep essential content visible in baseline CSS so animation failure cannot erase the page.

## Ownership and Lifecycle

- Assign each property on each element to one animation system.
- Put GSAP scroll movement on an outer wrapper and Motion pointer response on an inner wrapper.
- Scope GSAP selectors to the component root. Avoid global selectors in reusable components.
- Use `useGSAP` from the separately installed `@gsap/react` package, or use a context and explicitly revert it.
- Revert animations and ScrollTriggers when the component unmounts or when an animation dependency needs rebuilding.
- Wrap delayed GSAP event handlers in `contextSafe`, or create and clean them up in a scoped effect.
- Remove manually attached event listeners; cancel animation frames, timers, and observers.
- Do not add a new perpetual ticker for each interactive element.
- For Anime.js, keep the animation, timeline, scope, and scroll-observer instances and call `revert()` during teardown so original styles and listeners are restored.

Install only what is needed, using the project's package manager. For the GSAP recipes: `npm install gsap @gsap/react`. For Motion: `npm install motion`. Verify these commands against the official docs and local lockfile when integrating.

## Recipe 1: A Scoped Scroll Chapter

The wrapper remains stable; only the image and title move. The reduced-motion state is immediately readable. Native scrolling is not intercepted.

```tsx
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function MaterialChapter() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add({
      desktop: '(min-width: 900px)',
      reduce: '(prefers-reduced-motion: reduce)',
    }, (context) => {
      const { desktop, reduce } = context.conditions as {
        desktop: boolean;
        reduce: boolean;
      };

      if (reduce) return;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });

      timeline.fromTo('.chapter-image',
        { scale: 1.08, yPercent: desktop ? -6 : -2 },
        { scale: 1, yPercent: desktop ? 6 : 2, ease: 'none' },
      ).fromTo('.chapter-title',
        { y: desktop ? 24 : 12 },
        { y: 0, ease: 'none' }, 0,
      );
    });

    return () => media.revert();
  }, { scope: root });

  return (
    <section ref={root} className="chapter">
      <div className="chapter-media">
        <img className="chapter-image"
          src="/images/material.jpg"
          width={1600} height={1000}
          alt="Close detail of the product's woven material" />
      </div>
      <h2 className="chapter-title">Made for the long way.</h2>
    </section>
  );
}
```

The media wrapper needs `overflow: hidden`; the image needs responsive sizing. The path and description must match a real project asset. If a user motion preference exists, include it in your setup dependencies and skip/revert animation when disabled. Do not give a parent of a pinned element a transform without understanding containing blocks.

## Recipe 2: A Stable Hit Area With Magnetic Feedback

Use a stable outer button and animate an inner visual. The control never escapes the pointer or changes its layout footprint. Touch and keyboard activation stay native.

```tsx
import type { ReactNode } from 'react';
import {
  motion, useMotionValue, useReducedMotion, useSpring,
} from 'motion/react';

export function MagneticAction({ children, onClick }: {
  children: ReactNode;
  onClick: () => void;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 19 });
  const springY = useSpring(y, { stiffness: 180, damping: 19 });

  return (
    <button type="button" onClick={onClick}
      className="magnetic-hit-area"
      onPointerMove={(event) => {
        if (reduce || event.pointerType !== 'mouse') return;
        const box = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - box.left - box.width / 2) * 0.08);
        y.set((event.clientY - box.top - box.height / 2) * 0.12);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}>
      <motion.span className="magnetic-visual"
        style={reduce ? undefined : { x: springX, y: springY }}>
        {children}
      </motion.span>
    </button>
  );
}
```

Keep the visual inside a padded hit area with `display: inline-flex`. Add visible focus to the actual button. Do not place an anchor or another button inside. For navigation use an anchor equivalent rather than a fake button link. Mirror an explicit site motion preference as well as the OS preference.

## Recipe 3: Elastic, Axis-Locked Gallery

A drag changes a real index. A gesture is optional because previous and next controls are present. Keep item keys stable and announce only completed changes.

```tsx
import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

type Photo = { src: string; alt: string; id: string };

export function PhotoDeck({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  if (photos.length === 0) return <p>No photographs yet.</p>;

  const change = (direction: number) => {
    setIndex((value) => (
      value + direction + photos.length
    ) % photos.length);
  };
  const photo = photos[index % photos.length];

  return (
    <section aria-label="Selected photographs">
      <motion.div className="photo-deck"
        drag={reduce ? false : 'x'}
        dragConstraints={{ left: -80, right: 80 }}
        dragElastic={0.15}
        dragSnapToOrigin
        onDragEnd={(_, { offset }) => {
          if (Math.abs(offset.x) > 35) {
            change(offset.x < 0 ? 1 : -1);
          }
        }}>
        <img src={photo.src} alt={photo.alt}
          draggable={false} width={800} height={1000} />
      </motion.div>
      <div className="deck-controls">
        <button onClick={() => change(-1)}
          aria-label="Previous photograph">Previous</button>
        <span role="status" aria-live="polite">
          {index % photos.length + 1} of {photos.length}
        </span>
        <button onClick={() => change(1)}
          aria-label="Next photograph">Next</button>
      </div>
    </section>
  );
}
```

Set `.photo-deck { touch-action: pan-y; }` and make the image responsive. When reduced motion is enabled, buttons still change the photograph instantly. A production collection that can shrink should normalize its index when data changes. Do not mount this in a scaled parent without checking Motion's coordinate-space guidance.

## Recipe 4: Context-Safe GSAP Interaction

```tsx
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from 'motion/react';

gsap.registerPlugin(useGSAP);

export function PlayMark() {
  const root = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const { contextSafe } = useGSAP({ scope: root });

  const play = contextSafe(() => {
    if (reduce) return;
    gsap.to('.mark', {
      rotation: '+=90',
      duration: 0.65,
      ease: 'back.out(1.4)',
      overwrite: 'auto',
    });
  });

  return <button ref={root} onClick={play}
    aria-label="Rotate the decorative mark">
    <span className="mark" aria-hidden="true">*</span>
    <span>Play</span>
  </button>;
}
```

The visible button label remains useful without the mark moving. If the action represents application state, update that state rather than making animation the only evidence of activation. The mark needs `display: inline-block` for transforms.

## Recipe 5: A Bounded Pointer Field

For a modest grid, store DOM refs and perform one container measurement in each pointer handler. For larger fields, record the latest pointer coordinates in a ref and render once per animation frame. A library motion value is preferable when it already provides scheduling.

```ts
const distance = Math.max(Math.hypot(dx, dy), 0.001);
const falloff = Math.max(0, 1 - distance / influenceRadius);
const force = falloff * falloff * maxDisplacement;
const offsetX = dx / distance * force;
const offsetY = dy / distance * force;
```

The distance guard prevents invalid transforms at the exact center. Reset on pointer leave. Keep node count bounded. Avoid reading every particle's bounding box after writing transforms in the same frame; compute positions from the grid instead.

If you introduce a requestAnimationFrame loop, cancel it on unmount and pause it when hidden or offscreen. Use IntersectionObserver for visibility, document visibility events for background tabs, and a user preference for persistent motion. Do not continue simulating an invisible full-resolution canvas.

## Recipe 6: A Scoped Anime.js Sequence

Anime.js v4 fits compact choreography: targets first, parameters second, staggering and scroll observers built in. Verify the current API in the official docs, import only the modules used, and revert everything on teardown.

```ts
import { animate, createScope, createTimeline, stagger, utils } from 'animejs';
import { onScroll } from 'animejs/events';

export function installSequence(root: HTMLElement) {
  const scope = createScope({
    mediaQueries: { reduce: '(prefers-reduced-motion: reduce)' },
  }).add(({ matches }) => {
    if (matches.reduce) {
      utils.set('.panel', { opacity: 1, y: 0 });
      return;
    }

    createTimeline()
      .add('.panel-title', { opacity: [0, 1], duration: 600 }, 0)
      .add('.panel-body', {
        opacity: [0, 1],
        y: [18, 0],
        duration: 600,
        delay: stagger(60),
      }, '<120');

    animate('.frame', {
      rotate: (index: number) => index * 9 + 30,
      ease: 'none',
      autoplay: onScroll({ target: root, sync: true }),
    });
  });

  return () => scope.revert();
}
```

Call the returned function on unmount or when the sequence must be rebuilt. `onScroll` receives a target and container rather than a wheel listener, so native scrolling stays native. Scope the selector root to the component in the current documented way, and confirm the exact `createScope`, `mediaQueries`, and `revert()` options against animejs.com before shipping; v3 and v4 APIs differ.

For state-driven components, branch reduced motion before creating any animation, and never let an animation be the only evidence that a control changed state.

## CSS Baseline and Reduced Motion

```css
.interactive-media { overflow: hidden; }
.interactive-media img { display: block; width: 100%; height: auto; }
.gesture-surface { touch-action: pan-y; }
.control:focus-visible { outline: 2px solid currentColor; outline-offset: 4px; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .ambient-loop { animation: none; }
  .decorative-parallax { transform: none; }
}
```

CSS alone does not stop JS-controlled animation. Branch in the animation controller too. Motion's reduced-motion configuration primarily affects transform and layout animation; explicitly handle non-transform properties such as clip paths, SVG morphing, filters, and other effects. Test the actual behavior.

## Timing as a Physical Language

Use a small shared vocabulary. A deliberate entrance can have a fast attack and a soft arrival. A dragged object should resist, overshoot slightly, and settle. A navigation highlight should respond immediately rather than perform a long show.

Tune actual springs in context. High stiffness with insufficient damping produces restless jitter; low stiffness with high mass can feel unresponsive. Do not apply the same spring to a tiny cursor dot and a full-screen panel.

Avoid default `ease-in-out` on every movement. Use a consistent family with exceptions that serve a purpose. An interface feels authored when its motion has rules, not when every easing is different.