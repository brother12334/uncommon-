import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  MoveHorizontal,
  MousePointer2,
  RotateCw,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type ExperimentInfo = {
  id: number;
  name: string;
  category: string;
  technology: string;
  description: string;
  mechanic: string;
  restraint: string;
  code: string;
};
export const experiments: ExperimentInfo[] = [
  {
    id: 1,
    name: "Type with an attitude",
    category: "Type",
    technology: "MOTION / TYPE",
    description:
      "Typography is the interaction, not a caption beneath it. A little resistance turns an ordinary headline into something you want to touch.",
    mechanic:
      "Pointer position drives a spring-based horizontal offset and skew. Click or press Enter to remix the message.",
    restraint:
      "The words remain readable. No character scrambling, no screen-reader noise, no movement when reduced motion is enabled.",
    code: "const x = useMotionValue(0);\nconst spring = useSpring(x, {\n  stiffness: 140, damping: 16\n});\nconst skew = useTransform(spring,\n  [-30, 30], [-8, 8]);\n\n<motion.span style={{ x: spring, skewX: skew }}>\n  a little happy wiggle.\n</motion.span>",
  },
  {
    id: 2,
    name: "A little resistance",
    category: "Cursor",
    technology: "POINTER / PHYSICS",
    description:
      "An orderly grid with an independent streak. Particles move away from your pointer, then settle back into place when you leave.",
    mechanic:
      "One bounding-box measurement per pointer event. A distance-based falloff displaces nearby dots; CSS transitions provide the return.",
    restraint:
      "The effect stays inside its own surface. Keyboard focus produces the same field, and arrow keys let you move it.",
    code: "const distance = Math.hypot(dx, dy);\nconst force = Math.max(0, 1 - distance / 110);\nconst displacement = force * 42;\n\ndot.style.transform = `translate(\n  ${dx / distance * displacement}px,\n  ${dy / distance * displacement}px\n)`;\n// Guard against distance === 0.",
  },
  {
    id: 3,
    name: "Out of the ordinary",
    category: "Drag",
    technology: "MOTION / DRAG",
    description:
      "A photographic deck with the weight of something real. Pull it sideways and let go. The next frame takes its place.",
    mechanic:
      "Axis-locked dragging, elastic constraints, spring return, and a small rotational response. Previous and next buttons are always available.",
    restraint:
      "Vertical touch scrolling still works. Images cannot trigger native ghost dragging. No content is available only through a gesture.",
    code: '<motion.div\n  drag="x"\n  dragConstraints={{ left: -90, right: 90 }}\n  dragElastic={0.15}\n  dragSnapToOrigin\n  onDragEnd={(_, { offset }) => {\n    if (Math.abs(offset.x) > 35) {\n      changeSlide(offset.x < 0 ? 1 : -1);\n    }\n  }}\n/>',
  },
  {
    id: 4,
    name: "A different perspective",
    category: "Cursor",
    technology: "CLIP PATH / REVEAL",
    description:
      "The same photograph, seen differently. A lens reveals a warmer visual world without making the image or its story disappear.",
    mechanic:
      "A circular CSS clip-path follows spring-smoothed local pointer coordinates over two aligned versions of the same photograph.",
    restraint:
      "Click to expand the lens. Touch and keyboard users get the complete reveal. The effect never gates important information.",
    code: 'const lens = useMotionTemplate\n  `circle(85px at ${x}px ${y}px)`;\n\n<motion.div style={{ clipPath: lens }}>\n  <img src={image} alt="" />\n</motion.div>\n// Give the base image the meaningful alt.\n// Add a click-to-reveal alternative.',
  },
  {
    id: 5,
    name: "Down the rabbit hole",
    category: "Scroll",
    technology: "GSAP / SCROLLTRIGGER",
    description:
      "A tunnel built from very little. Repeated frames rotate in sequence as the page moves, creating depth without a heavy 3D scene.",
    mechanic:
      "One scrubbed ScrollTrigger timeline transforms nested frames. Click to replay a second, time-based variation.",
    restraint:
      "Native scrolling stays native. No wheel capture, unnecessary pinning, or scroll traps. The static tunnel still communicates depth.",
    code: 'gsap.to(".tunnel-frame", {\n  rotation: (i) => i * 9 + 30,\n  ease: "none",\n  scrollTrigger: {\n    trigger: container.current,\n    start: "top bottom",\n    end: "bottom top",\n    scrub: 0.8\n  }\n});\n// Scope in useGSAP and clean up.',
  },
  {
    id: 6,
    name: "Never quite the same",
    category: "Cursor",
    technology: "SVG / SHAPE MORPH",
    description:
      "One shape, a few different personalities. A small geometric idea becomes a tactile, playful brand signature.",
    mechanic:
      "An SVG path morphs between equal-point silhouettes. Spring rotation and pointer tilt add a physical response.",
    restraint:
      "A meaningful button label and visible state count keep this accessible. The shape switches instantly with reduced motion.",
    code: '<motion.path\n  animate={{ d: shapes[shapeIndex] }}\n  transition={{\n    type: "spring",\n    stiffness: 120,\n    damping: 14\n  }}\n/>\n// Paths need compatible point counts.\n// Use a real button to change state.',
  },
];

function KineticType({ enabled }: { enabled: boolean }) {
  const [remixed, setRemixed] = useState(false);
  const x = useMotionValue(0);
  const spring = useSpring(x, { stiffness: 140, damping: 16 });
  const skew = useTransform(spring, [-35, 35], [-9, 9]);
  return (
    <button
      className="demo demo-type"
      aria-label="Remix the kinetic typography. Move your pointer or click."
      onPointerMove={(event) => {
        if (!enabled) return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(((event.clientX - rect.left) / rect.width - 0.5) * 55);
      }}
      onPointerLeave={() => x.set(0)}
      onClick={() => setRemixed(!remixed)}
    >
      <span className="demo-top-label">WORDS WITH A LITTLE WIGGLE.</span>
      <motion.span
        className="kinetic-words"
        style={enabled ? { x: spring, skewX: skew } : {}}
      >
        <span>{remixed ? "stay" : "a little"}</span>
        <span>{remixed ? "a little" : "happy"}</span>
        <span>{remixed ? "curious." : "wiggle."}</span>
      </motion.span>
      <span className="demo-instruction">
        <MousePointer2 size={11} /> CLICK TO REMIX
      </span>
      <span className="type-coordinate">[ T{remixed ? "02" : "01"} ]</span>
    </button>
  );
}

function MagneticField({ enabled }: { enabled: boolean }) {
  const root = useRef<HTMLButtonElement>(null);
  const position = useRef({ x: 0.5, y: 0.5 });
  const [pulse, setPulse] = useState(0);
  const move = (px: number, py: number) => {
    if (!enabled || !root.current) return;
    const rect = root.current.getBoundingClientRect();
    const points = root.current.querySelectorAll<HTMLSpanElement>(".field-dot");
    position.current = { x: px, y: py };
    points.forEach((dot, i) => {
      const dx = (((i % 12) / 11) * 0.84 + 0.08 - px) * rect.width;
      const dy = ((Math.floor(i / 12) / 7) * 0.76 + 0.12 - py) * rect.height;
      const distance = Math.max(Math.hypot(dx, dy), 0.1);
      const force = Math.max(0, 1 - distance / 115) * 45;
      dot.style.transform = `translate(${(dx / distance) * force}px, ${(dy / distance) * force}px)`;
      dot.style.opacity = `${Math.max(0.2, 1 - force / 65)}`;
    });
  };
  const reset = () =>
    root.current
      ?.querySelectorAll<HTMLSpanElement>(".field-dot")
      .forEach((dot) => {
        dot.style.transform = "";
        dot.style.opacity = "";
      });
  useEffect(() => {
    if (!enabled) reset();
  }, [enabled]);
  const keyDown = (event: KeyboardEvent) => {
    const directions: Record<string, [number, number]> = {
      ArrowUp: [0, -0.09],
      ArrowDown: [0, 0.09],
      ArrowLeft: [-0.09, 0],
      ArrowRight: [0.09, 0],
    };
    const direction = directions[event.key];
    if (direction) {
      event.preventDefault();
      move(
        Math.max(0.05, Math.min(0.95, position.current.x + direction[0])),
        Math.max(0.05, Math.min(0.95, position.current.y + direction[1])),
      );
    }
  };
  return (
    <button
      ref={root}
      className="demo demo-field"
      aria-label="Magnetic particle field. Move your pointer, click to pulse, or use arrow keys."
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        move(
          (event.clientX - rect.left) / rect.width,
          (event.clientY - rect.top) / rect.height,
        );
      }}
      onPointerLeave={reset}
      onFocus={() => move(0.5, 0.5)}
      onBlur={reset}
      onKeyDown={keyDown}
      onClick={() => {
        setPulse(pulse + 1);
        move(0.5, 0.5);
      }}
    >
      <span className="demo-top-label">ORDER MEETS INSTINCT.</span>
      <span className="field-dots">
        {Array.from({ length: 96 }, (_, i) => (
          <span
            className="field-dot"
            style={{
              left: `${((i % 12) / 11) * 84 + 8}%`,
              top: `${(Math.floor(i / 12) / 7) * 76 + 12}%`,
            }}
            key={i}
          />
        ))}
      </span>
      <motion.svg
        className="field-asterisk"
        viewBox="0 0 100 100"
        animate={{ rotate: pulse * 90 }}
        transition={{ type: "spring", stiffness: 90, damping: 13 }}
        aria-hidden="true"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <rect
            key={i}
            x="44"
            y="0"
            width="12"
            height="100"
            transform={`rotate(${i * 36} 50 50)`}
          />
        ))}
      </motion.svg>
      <span className="demo-instruction">
        <MousePointer2 size={11} /> PUSH THE FIELD
      </span>
    </button>
  );
}

const photographs = [
  `${import.meta.env.BASE_URL}images/pottery-01.jpg`,
  `${import.meta.env.BASE_URL}images/pottery-02.jpg`,
  `${import.meta.env.BASE_URL}images/pottery-03.jpg`,
];
function ElasticGallery({ enabled }: { enabled: boolean }) {
  const [index, setIndex] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-90, 90], [-10, 10]);
  const change = (direction: number) =>
    setIndex((value) => (value + direction + 3) % 3);
  return (
    <div className="demo demo-gallery">
      <span className="demo-top-label">GOOD THINGS, COLLECTED SLOWLY.</span>
      <motion.div
        className="gallery-deck"
        style={enabled ? { x, rotate } : {}}
        drag={enabled ? "x" : false}
        dragConstraints={{ left: -90, right: 90 }}
        dragElastic={0.15}
        dragSnapToOrigin
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 35) change(info.offset.x < 0 ? 1 : -1);
        }}
        whileDrag={{ cursor: "grabbing" }}
        aria-label="Handmade ceramics photograph deck"
      >
        <AnimateDeck index={index} />
      </motion.div>
      <div className="gallery-controls">
        <button onClick={() => change(-1)} aria-label="Previous photograph">
          <ArrowLeft size={14} />
        </button>
        <span>
          0{index + 1}
          <span className="gallery-divider"> / </span>03
        </span>
        <button onClick={() => change(1)} aria-label="Next photograph">
          <ArrowRight size={14} />
        </button>
      </div>
      <span className="demo-instruction">
        <MoveHorizontal size={13} /> DRAG TO DISCOVER
      </span>
    </div>
  );
}

function AnimateDeck({ index }: { index: number }) {
  return (
    <>
      {photographs.map((photo, i) => {
        const order = (i - index + 3) % 3;
        const positions = [
          { x: 0, y: -5, rotate: -5 },
          { x: 49, y: 7, rotate: 12 },
          { x: -43, y: 12, rotate: -16 },
        ];
        return (
          <motion.div
            key={photo}
            className="fan-photo"
            animate={positions[order]}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            style={{ zIndex: 3 - order }}
          >
            <img
              src={photo}
              alt={`A sunlit study of handmade ceramics, photograph ${i + 1}`}
              draggable={false}
              loading="lazy"
            />
            <span>A LITTLE STILL LIFE / 0{i + 1}</span>
          </motion.div>
        );
      })}
    </>
  );
}

function RevealLens({ enabled }: { enabled: boolean }) {
  const x = useMotionValue(180);
  const y = useMotionValue(160);
  const springX = useSpring(x, { stiffness: 180, damping: 25 });
  const springY = useSpring(y, { stiffness: 180, damping: 25 });
  const [expanded, setExpanded] = useState(false);
  const radius = useSpring(85, { stiffness: 100, damping: 22 });
  const clipPath = useMotionTemplate`circle(${radius}px at ${springX}px ${springY}px)`;
  return (
    <button
      className="demo demo-lens"
      aria-label="Reveal a different perspective. Click to expand or collapse the lens."
      aria-pressed={expanded}
      onPointerMove={(event) => {
        if (!enabled || expanded) return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left);
        y.set(event.clientY - rect.top);
      }}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const next = !expanded;
        setExpanded(next);
        if (next) {
          if (enabled) {
            x.set(rect.width / 2);
            y.set(rect.height / 2);
          } else {
            x.jump(rect.width / 2);
            y.jump(rect.height / 2);
          }
        }
        if (enabled)
          radius.set(next ? Math.hypot(rect.width, rect.height) : 85);
        else radius.jump(next ? Math.hypot(rect.width, rect.height) : 85);
      }}
    >
      <img
        className="lens-base"
        src={`${import.meta.env.BASE_URL}images/pottery-03.jpg`}
        alt="A handmade pottery still life seen through a warm-colored circular lens"
        loading="lazy"
      />
      <motion.span className="lens-reveal" style={{ clipPath }}>
        <img src={`${import.meta.env.BASE_URL}images/pottery-03.jpg`} alt="" loading="lazy" />
      </motion.span>
      <span className="demo-top-label">SAME WORLD. DIFFERENT LENS.</span>
      <span className="lens-type">
        look
        <br />
        closer<span>.</span>
      </span>
      <span className="demo-instruction">
        <MousePointer2 size={11} /> MOVE TO REVEAL
      </span>
    </button>
  );
}

function ScrollTunnel({ enabled }: { enabled: boolean }) {
  const container = useRef<HTMLButtonElement>(null);
  const [replay, setReplay] = useState(0);
  useGSAP(
    () => {
      if (!enabled) return;
      if (replay > 0) {
        gsap.fromTo(
          ".tunnel-frame",
          { rotation: (i) => i * -5 },
          {
            rotation: (i) => i * 9 + 30,
            duration: 1.5,
            stagger: 0.035,
            ease: "power3.inOut",
          },
        );
      } else {
        gsap.fromTo(
          ".tunnel-frame",
          { rotation: (i) => i * -5 },
          {
            rotation: (i) => i * 9 + 30,
            ease: "none",
            scrollTrigger: {
              trigger: container.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      }
    },
    { scope: container, dependencies: [enabled, replay], revertOnUpdate: true },
  );
  return (
    <button
      ref={container}
      className="demo demo-tunnel"
      aria-label="Scroll-driven geometric tunnel. Click to replay the animation."
      onClick={() => setReplay(replay + 1)}
    >
      <span className="demo-top-label">A LITTLE FURTHER IN.</span>
      <span className="tunnel-frames">
        {Array.from({ length: 11 }, (_, i) => (
          <span
            key={i}
            className="tunnel-frame"
            style={{
              width: `${82 - i * 6}%`,
              height: `${86 - i * 6.4}%`,
              opacity: 1 - i * 0.045,
              transform: `rotate(${i * 4}deg)`,
            }}
          />
        ))}
      </span>
      <span className="tunnel-center">
        go
        <br />
        deeper.
      </span>
      <span className="demo-instruction">
        <RotateCw size={11} /> SCROLL OR CLICK TO REPLAY
      </span>
    </button>
  );
}

function shapePath(type: number) {
  const count = 48;
  return (
    Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const radius =
        type === 0
          ? i % 2
            ? 71
            : 93
          : type === 1
            ? i % 6 < 3
              ? 59
              : 97
            : 75 + Math.sin(angle * 4) * 18;
      return `${i === 0 ? "M" : "L"}${(110 + Math.cos(angle) * radius).toFixed(2)},${(110 + Math.sin(angle) * radius).toFixed(2)}`;
    }).join(" ") + " Z"
  );
}

function ShapeShift({ enabled }: { enabled: boolean }) {
  const [shape, setShape] = useState(0);
  const [hovered, setHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 130, damping: 15 });
  const sy = useSpring(y, { stiffness: 130, damping: 15 });
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (!enabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.12);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.12);
  };
  return (
    <button
      className="demo demo-shape"
      onPointerMove={move}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
        setHovered(false);
      }}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onClick={() => setShape((shape + 1) % 3)}
      aria-label={`Morph the geometric shape. Shape ${shape + 1} of 3. Click for the next shape.`}
    >
      <span className="demo-top-label">IDENTITY ISN'T STATIC.</span>
      <span className="shape-orbit" />
      <motion.svg
        className="morph-shape"
        viewBox="0 0 220 220"
        style={enabled ? { x: sx, y: sy } : {}}
        animate={{
          rotate: shape * 90 + (hovered && enabled ? 20 : 0),
          scale: hovered && enabled ? 1.08 : 1,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        aria-hidden="true"
      >
        <motion.path
          fill="currentColor"
          animate={{ d: shapePath(shape) }}
          transition={{ duration: enabled ? 0.6 : 0, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.svg>
      <span className="shape-state">
        0{shape + 1}
        <span> / 03</span>
      </span>
      <span className="demo-instruction">
        <MousePointer2 size={11} /> CLICK TO CHANGE YOUR SHAPE
      </span>
    </button>
  );
}

export function Experiment({ id, enabled }: { id: number; enabled: boolean }) {
  switch (id) {
    case 1:
      return <KineticType enabled={enabled} />;
    case 2:
      return <MagneticField enabled={enabled} />;
    case 3:
      return <ElasticGallery enabled={enabled} />;
    case 4:
      return <RevealLens enabled={enabled} />;
    case 5:
      return <ScrollTunnel enabled={enabled} />;
    default:
      return <ShapeShift enabled={enabled} />;
  }
}
