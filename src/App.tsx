import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Maximize2,
  Menu,
  Minus,
  Pause,
  Play,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Dialog } from "./components/Dialog";
import {
  Experiment,
  experiments,
  type ExperimentInfo,
} from "./components/Experiments";
import { downloadSkill, skillFiles } from "./skill";
import HeroFriends from "./components/HeroFriends";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function moveTab(event: KeyboardEvent<HTMLElement>) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  const tabs = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
  );
  const current = tabs.findIndex((tab) => tab === document.activeElement);
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? tabs.length - 1
        : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
          tabs.length;
  event.preventDefault();
  tabs[next]?.focus();
  tabs[next]?.click();
}

function Star({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
    >
      {Array.from({ length: 7 }, (_, i) => (
        <ellipse
          key={i}
          cx="50"
          cy="24"
          rx="14"
          ry="23"
          transform={`rotate(${i * (360 / 7)} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="19" fill="#f8f3e9" />
      <circle cx="44" cy="48" r="2.4" />
      <circle cx="56" cy="48" r="2.4" />
      <path
        d="M44 56 Q50 61 56 56"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MagneticButton({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick: () => void;
}) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 18 });
  const springY = useSpring(y, { stiffness: 200, damping: 18 });
  return (
    <motion.button
      type="button"
      className={`magnetic-button ${className}`}
      style={{ x: springX, y: springY }}
      onPointerMove={(event) => {
        if (
          reduced ||
          event.pointerType === "touch" ||
          document.documentElement.dataset.motion === "reduced"
        )
          return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left - rect.width / 2) * 0.13);
        y.set((event.clientY - rect.top - rect.height / 2) * 0.18);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

function CopyButton({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(false);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      setError(true);
    }
  };
  return (
    <button className={`copy-button ${className}`} type="button" onClick={copy}>
      {copied ? <Check size={15} /> : <Copy size={15} />}
      <span aria-live="polite">
        {error ? "Select text to copy" : copied ? "Copied" : label}
      </span>
    </button>
  );
}

const processSteps = [
  {
    title: "Research, never regurgitate.",
    text: "Claude browses the real thing: Skiper UI, GSAP, Motion, Anime.js, Bklit UI, Land-book, Codrops, and, for an approved 3D mark, 3D Logo Lab. It also studies independent creative work. It compares interactions, checks the source and license, then chooses what actually belongs in your project.",
    note: "REFERENCE WITH INTENTION",
  },
  {
    title: "Have a point of view.",
    text: "Before a single component, define the tension: a type system, a visual world, a deliberate rhythm. The skill trades generic gradients and interchangeable layouts for a coherent creative direction.",
    note: "ART DIRECTION BEFORE IMPLEMENTATION",
  },
  {
    title: "Make the motion mean it.",
    text: "Build a motion score, not a bag of effects. One signature interaction, purposeful transitions, physical feedback, and quiet space between the big moments. Every movement earns its place.",
    note: "CHOREOGRAPH, THEN CODE",
  },
  {
    title: "Sweat the last 10%.",
    text: "Keyboard controls. Real mobile layouts. Reduced-motion alternatives. Cleanup, frame budgets, and working buttons. The difference between an impressive demo and a site someone actually wants to use.",
    note: "FINISH WHAT YOU START",
  },
];

const sources = [
  {
    name: "Skiper UI",
    detail: "Uncommon components. Unexpected possibilities.",
    tag: "THE COMPONENTS",
    url: "https://skiper-ui.com/components",
  },
  {
    name: "GSAP",
    detail: "Precision timelines. Scroll with a storyline.",
    tag: "THE CHOREOGRAPHY",
    url: "https://gsap.com/docs/v3/",
  },
  {
    name: "Anime.js",
    detail: "One small engine. Timelines, stagger, and SVG.",
    tag: "THE TIMELINE",
    url: "https://animejs.com/documentation/",
  },
  {
    name: "Motion",
    detail: "Springs, gestures, and things that feel physical.",
    tag: "THE FEELING",
    url: "https://motion.dev/docs/react",
  },
  {
    name: "Bklit UI",
    detail: "Charts that speak the interface's own language.",
    tag: "THE DATA LAYER",
    url: "https://ui.bklit.com/docs",
  },
  {
    name: "Land-book",
    detail: "Real sites, studied for composition first.",
    tag: "THE COMPOSITION",
    url: "https://land-book.com/",
  },
  {
    name: "Codrops",
    detail: "Creative experiments from the edges of the web.",
    tag: "THE EXPERIMENTS",
    url: "https://tympanus.net/codrops/",
  },
  {
    name: "3D Logo Lab",
    detail: "A little dimension for a mark with personality.",
    tag: "OPTIONAL / 3D LOGOS",
    url: "https://www.3dlogolab.io/",
  },
];

function SkillContent({
  initialTab = "install",
}: {
  initialTab?: "install" | "read";
}) {
  const [tab, setTab] = useState(initialTab);
  const [platform, setPlatform] = useState<"code" | "web">("code");
  const [file, setFile] = useState("SKILL.md");
  const [downloaded, setDownloaded] = useState(false);
  const download = () => {
    downloadSkill();
    setDownloaded(true);
  };
  const command =
    "mkdir -p .claude/skills\nunzip ~/Downloads/uncommon.zip -d .claude/skills";
  return (
    <div className="skill-dialog-content">
      <div
        className="dialog-tabs"
        role="tablist"
        aria-label="Skill content"
        onKeyDown={moveTab}
      >
        <button
          id="skill-install-tab"
          type="button"
          role="tab"
          aria-selected={tab === "install"}
          aria-controls="skill-panel"
          tabIndex={tab === "install" ? 0 : -1}
          onClick={() => setTab("install")}
        >
          Get the skill <ArrowDownRight size={16} />
        </button>
        <button
          id="skill-read-tab"
          type="button"
          role="tab"
          aria-selected={tab === "read"}
          aria-controls="skill-panel"
          tabIndex={tab === "read" ? 0 : -1}
          onClick={() => setTab("read")}
        >
          Read the playbook <ArrowUpRight size={16} />
        </button>
      </div>
      {tab === "install" ? (
        <div
          className="install-content"
          id="skill-panel"
          role="tabpanel"
          aria-labelledby="skill-install-tab"
        >
          <p className="dialog-intro">
            Better instincts. In one small download.
            <br />A real Claude skill, not another wall of prompting.
          </p>
          <div
            className="platform-switch"
            role="group"
            aria-label="Installation platform"
          >
            <button
              aria-pressed={platform === "code"}
              className={platform === "code" ? "active" : ""}
              onClick={() => setPlatform("code")}
            >
              Claude Code
            </button>
            <button
              aria-pressed={platform === "web"}
              className={platform === "web" ? "active" : ""}
              onClick={() => setPlatform("web")}
            >
              Claude.ai
            </button>
          </div>
          <ol className="install-steps">
            <li>
              <span>01</span>
              <div>
                <h3>Download the complete skill.</h3>
                <p>
                  {Object.keys(skillFiles).length} readable files. Art
                  direction, research workflows, motion recipes, and the details
                  that matter.
                </p>
                <button className="button button-orange" onClick={download}>
                  {downloaded ? "Download again" : "Download uncommon"}
                  <Download size={17} />
                </button>
                {downloaded && (
                  <p className="download-confirmation" role="status">
                    Your ZIP is ready. Check your browser downloads.
                  </p>
                )}
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>
                  {platform === "code"
                    ? "Give it a home in your project."
                    : "Add it to your Claude skills."}
                </h3>
                {platform === "code" ? (
                  <>
                    <p>
                      From your project root, extract the ZIP into your skills
                      directory. Adjust the download path if needed.
                    </p>
                    <div className="command-block">
                      <pre>{command}</pre>
                      <CopyButton text={command} />
                    </div>
                    <p className="small-note">
                      The file should end up at .claude/skills/uncommon/SKILL.md
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Open Claude.ai, go to Customize &gt; Skills, and upload
                      the downloaded ZIP. Enable the skill. Menu labels can vary
                      by account.
                    </p>
                    <a
                      className="text-link"
                      href="https://claude.com/docs/skills/how-to"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Official installation guide <ArrowUpRight size={15} />
                    </a>
                  </>
                )}
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Start with an actual idea.</h3>
                <div className="prompt-example">
                  <p>
                    {platform === "code"
                      ? "/uncommon "
                      : "Use the uncommon skill. "}
                    Build a site for an independent sound studio. Make it feel
                    tactile, raw, and a little unexpected. Research references
                    before you build.
                  </p>
                  <CopyButton
                    text={`${platform === "code" ? "/uncommon " : "Use the uncommon skill. "}Build a site for an independent sound studio. Make it feel tactile, raw, and a little unexpected. Research references before you build.`}
                    label="Copy prompt"
                  />
                </div>
              </div>
            </li>
          </ol>
          <p className="install-footnote">
            Free to use and adapt. Browser research requires browsing tools in
            your Claude environment. Third-party components keep their own
            licenses.
          </p>
        </div>
      ) : (
        <div
          className="read-content"
          id="skill-panel"
          role="tabpanel"
          aria-labelledby="skill-read-tab"
        >
          <div className="file-selector">
            <label htmlFor="skill-file">INSIDE THE SKILL</label>
            <select
              id="skill-file"
              value={file}
              onChange={(event) => setFile(event.target.value)}
            >
              {Object.keys(skillFiles).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <CopyButton text={skillFiles[file]} label="Copy file" />
          </div>
          <pre
            className="skill-reader"
            tabIndex={0}
            role="region"
            aria-label={`Contents of ${file}`}
          >
            {skillFiles[file]}
          </pre>
          <button className="button button-orange" onClick={download}>
            Download all {Object.keys(skillFiles).length} files{" "}
            <Download size={17} />
          </button>
        </div>
      )}
    </div>
  );
}

function ExperimentContent({
  item,
  enabled,
}: {
  item: ExperimentInfo;
  enabled: boolean;
}) {
  return (
    <div className="experiment-detail">
      <div className="expanded-experiment">
        <Experiment id={item.id} enabled={enabled} />
      </div>
      <div className="experiment-explanation">
        <span className="eyebrow">THE THINKING BEHIND THE FEELING</span>
        <p>{item.description}</p>
        <div className="recipe-note">
          <span>THE MECHANIC</span>
          <p>{item.mechanic}</p>
        </div>
        <div className="recipe-note">
          <span>THE RESTRAINT</span>
          <p>{item.restraint}</p>
        </div>
        <div className="recipe-code">
          <div>
            <span>STARTING POINT</span>
            <CopyButton text={item.code} label="Copy recipe" />
          </div>
          <pre>{item.code}</pre>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const titleInner = useRef<HTMLSpanElement>(null);
  const systemReduced = useReducedMotion();
  const [motionEnabled, setMotionEnabled] = useState(() => {
    try {
      return (
        localStorage.getItem("uncommon-motion") !== "off" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    } catch {
      return true;
    }
  });
  const [mobileMenu, setMobileMenu] = useState(false);
  const [filter, setFilter] = useState("All");
  const [activeStep, setActiveStep] = useState<number | null>(0);
  const [skillModal, setSkillModal] = useState<"install" | "read" | null>(null);
  const [selectedExperiment, setSelectedExperiment] =
    useState<ExperimentInfo | null>(null);
  const [nudge, setNudge] = useState(0);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 45, damping: 25 });
  const springY = useSpring(pointerY, { stiffness: 45, damping: 25 });
  // Whole device pixels, so the pixel-art friends never resample.
  const toDevicePx = (v: number) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    return Math.round(v * dpr) / dpr;
  };
  const photoX = useTransform(springX, toDevicePx);
  const photoY = useTransform(springY, toDevicePx);

  useEffect(() => {
    if (systemReduced) setMotionEnabled(false);
  }, [systemReduced]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      if (media.matches) setMotionEnabled(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = motionEnabled
      ? "full"
      : "reduced";
    try {
      localStorage.setItem("uncommon-motion", motionEnabled ? "on" : "off");
    } catch {
      /* Storage is optional. */
    }
    if (!motionEnabled) {
      pointerX.set(0);
      pointerY.set(0);
    }
  }, [motionEnabled, pointerX, pointerY]);

  useEffect(() => {
    const surfaces =
      root.current?.querySelectorAll<HTMLElement>("[data-ambient]");
    if (!surfaces) return;
    const visibility = new Map<HTMLElement, boolean>();
    const sync = () =>
      visibility.forEach((visible, element) =>
        element.style.setProperty(
          "--ambient-play",
          visible && !document.hidden && motionEnabled ? "running" : "paused",
        ),
      );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          visibility.set(entry.target as HTMLElement, entry.isIntersecting),
        );
        sync();
      },
      { threshold: 0.05 },
    );
    surfaces.forEach((surface) => observer.observe(surface));
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [motionEnabled, filter]);

  useEffect(() => {
    const fitTitle = () => {
      if (title.current && titleInner.current)
        title.current.style.setProperty(
          "--title-scale",
          `${title.current.clientWidth / titleInner.current.offsetWidth}`,
        );
    };
    fitTitle();
    const observer = new ResizeObserver(fitTitle);
    if (title.current) observer.observe(title.current);
    document.fonts.ready.then(fitTitle);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setTimeout(
      () => ScrollTrigger.refresh(),
      motionEnabled ? 600 : 0,
    );
    return () => clearTimeout(timer);
  }, [filter, activeStep, motionEnabled]);

  useGSAP(
    () => {
      if (!motionEnabled) return;
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro
        .from(".hero-letter", {
          yPercent: 110,
          rotation: 4,
          stagger: 0.045,
          duration: 1.2,
          delay: 0.05,
        })
        .from(
          ".hero-copy > *",
          { y: 28, opacity: 0, stagger: 0.12, duration: 0.85 },
          0.55,
        )
        .from(
          ".hero-friends",
          { opacity: 0, duration: 1.4, ease: "power2.out" },
          0.1,
        )
        .from(".hero-scroll", { opacity: 0, y: -15, duration: 0.7 }, 1.1);
      gsap.to(".hero-photo-parallax", {
        yPercent: 17,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });
      gsap.to(".hero-title", {
        y: 70,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(".scroll-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "max",
          scrub: 0.2,
        },
      });
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((element) =>
        gsap.from(element, {
          y: 45,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 91%", once: true },
        }),
      );
      gsap.fromTo(
        ".manifesto-word",
        { opacity: 0.22 },
        {
          opacity: 1,
          stagger: 0.13,
          ease: "none",
          scrollTrigger: {
            trigger: ".manifesto-statement",
            start: "top 82%",
            end: "bottom 48%",
            scrub: 0.5,
          },
        },
      );
      gsap.to(".process-star", {
        rotation: 180,
        ease: "none",
        scrollTrigger: {
          trigger: ".process-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      });
      gsap.from(".outro-line span", {
        yPercent: 110,
        stagger: 0.12,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".outro-title",
          start: "top 85%",
          once: true,
        },
      });
      let alive = true;
      document.fonts.ready.then(() => {
        if (alive) ScrollTrigger.refresh();
      });
      return () => {
        alive = false;
      };
    },
    { scope: root, dependencies: [motionEnabled], revertOnUpdate: true },
  );

  const goTo = (id: string) => {
    setMobileMenu(false);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: motionEnabled ? "smooth" : "instant" });
  };
  const filtered = experiments.filter(
    (experiment) => filter === "All" || experiment.category === filter,
  );
  const categories = ["All", "Cursor", "Scroll", "Drag", "Type"];

  return (
    <MotionConfig reducedMotion={motionEnabled ? "user" : "always"}>
      <div className="site" ref={root}>
        <a href="#playground" className="skip-link">
          Skip to the playground
        </a>
        <div className="scroll-progress" aria-hidden="true" />
        <header className="header">
          <a className="wordmark" href="#" aria-label="uncommon home">
            <Star />
            uncommon
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            <button onClick={() => goTo("the-skill")}>
              The skill<span>01</span>
            </button>
            <button onClick={() => goTo("playground")}>
              Playground<span>02</span>
            </button>
            <button onClick={() => goTo("the-process")}>
              The process<span>03</span>
            </button>
            <button
              className="quick-motion"
              aria-label={
                motionEnabled ? "Pause playful motion" : "Resume playful motion"
              }
              title={
                motionEnabled ? "Pause playful motion" : "Resume playful motion"
              }
              onClick={() => setMotionEnabled(!motionEnabled)}
            >
              {motionEnabled ? <Pause size={13} /> : <Play size={13} />}
            </button>
          </nav>
          <button className="nav-cta" onClick={() => setSkillModal("install")}>
            Get the skill <ArrowUpRight size={17} />
          </button>
          <button
            className="mobile-menu-toggle"
            aria-label={mobileMenu ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenu}
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </header>
        <AnimatePresence>
          {mobileMenu && (
            <motion.nav
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mobile-nav"
              aria-label="Mobile navigation"
            >
              <button onClick={() => goTo("the-skill")}>
                The skill <span>01</span>
              </button>
              <button onClick={() => goTo("playground")}>
                Playground <span>02</span>
              </button>
              <button onClick={() => goTo("the-process")}>
                The process <span>03</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenu(false);
                  setSkillModal("install");
                }}
              >
                Get uncommon <ArrowUpRight />
              </button>
            </motion.nav>
          )}
        </AnimatePresence>

        <main>
          <section
            className="hero"
            onPointerMove={(event) => {
              if (!motionEnabled || event.pointerType === "touch") return;
              const rect = event.currentTarget.getBoundingClientRect();
              pointerX.set((event.clientX / rect.width - 0.5) * -22);
              pointerY.set(
                ((event.clientY - rect.top) / rect.height - 0.5) * -15,
              );
            }}
            onPointerLeave={() => {
              pointerX.set(0);
              pointerY.set(0);
            }}
          >
            <div className="hero-photo-parallax">
              <motion.div
                className="hero-photo-motion"
                style={{ x: photoX, y: photoY }}
              >
                <HeroFriends
                  enabled={motionEnabled}
                  nudge={nudge}
                  pointerX={pointerX}
                  pointerY={pointerY}
                />
              </motion.div>
            </div>

            <div className="hero-brand">
              <div className="hero-topline">
                <span>A LITTLE SKILL FOR A MORE HUMAN WEB</span>
                <span>MADE FOR CLAUDE. MADE FOR YOU.</span>
              </div>
              <h1 className="hero-title" ref={title} aria-label="uncommon">
                <span
                  className="hero-title-inner"
                  ref={titleInner}
                  aria-hidden="true"
                >
                  {"uncommon".split("").map((letter, i) => (
                    <span className="hero-letter" key={i}>
                      {letter}
                    </span>
                  ))}
                </span>
              </h1>
            </div>
            <div className="hero-bottom">
              <div className="hero-copy">
                <h2>
                  Less ordinary.
                  <br />
                  More <em>you.</em>
                </h2>
                <p>
                  A creative development skill for Claude.
                  <br className="desktop-break" />
                  Thoughtful websites. Playful interactions.
                  <br className="desktop-break" />A little happy magic.
                </p>
                <div className="hero-actions">
                  <MagneticButton
                    className="button button-orange"
                    onClick={() => setSkillModal("install")}
                  >
                    Get the skill <ArrowUpRight size={20} />
                  </MagneticButton>
                  <button
                    className="hero-explore"
                    onClick={() => goTo("playground")}
                  >
                    Explore the playground <ArrowDown size={16} />
                  </button>
                </div>
              </div>
              <button
                className="hero-scroll"
                data-ambient
                onClick={() => setNudge((value) => value + 1)}
                aria-label="Say hello to the pixel friends"
              >
                <span aria-live="polite">
                  {nudge > 0 ? "hello, friend!" : "give us a little nudge"}
                </span>
                <span className="scroll-circle">
                  <Sparkles size={20} />
                </span>
              </button>
            </div>
          </section>

          <div
            className="marquee"
            role="img"
            data-ambient
            aria-label="A little unexpected. Very much you. Nice things, made thoughtfully."
          >
            <div className="marquee-track" aria-hidden="true">
              {Array.from({ length: 4 }, (_, i) => (
                <span className="marquee-set" key={i}>
                  <span>a little unexpected</span>
                  <Star />
                  <span>very much you.</span>
                  <Star />
                  <span>nice things, made thoughtfully</span>
                  <Star />
                </span>
              ))}
            </div>
          </div>

          <section className="manifesto section-light" id="the-skill">
            <div className="section-meta">
              <span>
                <i />
                01 / THE SKILL
              </span>
              <span>NOT A TEMPLATE. A NEW INSTINCT.</span>
            </div>
            <div className="manifesto-layout">
              <div className="manifesto-aside reveal">
                <span className="eyebrow">
                  A little different
                  <br />
                  looks good on you.
                </span>
                <Star className="manifesto-friend" />
              </div>
              <div>
                <h2 className="manifesto-statement">
                  {"More feeling. ".split(" ").map((word, i) => (
                    <span className="manifesto-word" key={i}>
                      {word}{" "}
                    </span>
                  ))}
                  <br />
                  <span className="orange">
                    {"Less same-same.".split(" ").map((word, i) => (
                      <span className="manifesto-word" key={i}>
                        {word}{" "}
                      </span>
                    ))}
                  </span>
                </h2>
                <div className="manifesto-description reveal">
                  <p>
                    uncommon gives Claude a creative point of view. The
                    references, art direction, and thoughtful motion that turn a
                    website into something that feels distinctly yours.
                  </p>
                  <button
                    className="text-link"
                    onClick={() => setSkillModal("read")}
                  >
                    Take a peek inside <ArrowUpRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="playground section-dark" id="playground">
            <div className="section-meta">
              <span>
                <i />
                02 / THE PLAYGROUND
              </span>
              <span>A SMALL COLLECTION OF HAPPY ACCIDENTS.</span>
            </div>
            <div className="section-heading reveal">
              <h2>
                Come on in.
                <br />
                <span className="orange">
                  <em>Have a little play.</em>
                </span>
              </h2>
              <div className="section-intro">
                <span className="live-indicator" data-ambient>
                  <i />
                  LITTLE MOMENTS, LIVE
                </span>
                <p>
                  Every little experiment is live.
                  <br />
                  Hover, drag, and follow your curiosity.
                </p>
              </div>
            </div>
            <div className="playground-toolbar">
              <div
                className="filter-tabs"
                role="tablist"
                aria-label="Filter experiments"
                onKeyDown={moveTab}
              >
                {categories.map((category) => (
                  <button
                    id={`filter-${category.toLowerCase()}`}
                    role="tab"
                    aria-selected={filter === category}
                    aria-controls="experiment-results"
                    tabIndex={filter === category ? 0 : -1}
                    className={filter === category ? "active" : ""}
                    onClick={() => setFilter(category)}
                    key={category}
                  >
                    {category}
                    <sup>
                      {String(
                        category === "All"
                          ? experiments.length
                          : experiments.filter(
                              (item) => item.category === category,
                            ).length,
                      ).padStart(2, "0")}
                    </sup>
                    {filter === category && (
                      <motion.span
                        className="tab-indicator"
                        layoutId="filter-indicator"
                      />
                    )}
                  </button>
                ))}
              </div>
              <span className="toolbar-note">
                ORIGINAL EXPLORATIONS / OPEN TO PLAY
              </span>
            </div>
            <motion.div
              className="experiment-grid"
              id="experiment-results"
              role="tabpanel"
              aria-labelledby={`filter-${filter.toLowerCase()}`}
              layout
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((item) => (
                  <motion.article
                    className="experiment-item"
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: motionEnabled ? 0.45 : 0 }}
                  >
                    <div
                      className={`experiment-stage experiment-stage-${item.id}`}
                      data-ambient
                    >
                      <Experiment id={item.id} enabled={motionEnabled} />
                      <button
                        className="expand-button"
                        onClick={() => setSelectedExperiment(item)}
                        aria-label={`Expand ${item.name} experiment`}
                      >
                        <Maximize2 size={16} />
                      </button>
                    </div>
                    <button
                      className="experiment-caption"
                      onClick={() => setSelectedExperiment(item)}
                    >
                      <span className="experiment-number">0{item.id}</span>
                      <span className="caption-title">{item.name}</span>
                      <span className="experiment-tech">{item.technology}</span>
                      <ArrowUpRight className="caption-arrow" size={19} />
                    </button>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
            <div className="playground-footnote">
              <span>A LITTLE PLAY GOES A LONG WAY.</span>
              <p>Made with intention. Best enjoyed with curiosity.</p>
              <Star />
            </div>
          </section>

          <section className="process-section section-light" id="the-process">
            <div className="section-meta">
              <span>
                <i />
                03 / THE PROCESS
              </span>
              <span>THINK FIRST. MAKE IT MOVE SECOND.</span>
            </div>
            <div className="process-layout">
              <div className="process-title reveal">
                <h2>
                  A little method.
                  <br />
                  A lot of
                  <br />
                  <span className="orange">
                    <em>feeling.</em>
                  </span>
                </h2>
                <p>
                  A thoughtful process behind
                  <br />
                  all the playful bits.
                </p>
                <Star className="process-star" />
              </div>
              <div className="process-accordion">
                {processSteps.map((step, i) => (
                  <div
                    className={`process-step ${activeStep === i ? "is-open" : ""}`}
                    key={step.title}
                  >
                    <h3>
                      <button
                        id={`process-trigger-${i}`}
                        aria-expanded={activeStep === i}
                        aria-controls={`process-panel-${i}`}
                        onClick={() =>
                          setActiveStep(activeStep === i ? null : i)
                        }
                      >
                        <span className="step-number">0{i + 1}</span>
                        <span>{step.title}</span>
                        {activeStep === i ? (
                          <Minus size={19} />
                        ) : (
                          <Plus size={19} />
                        )}
                      </button>
                    </h3>
                    <div id={`process-panel-${i}`}>
                      <AnimatePresence initial={false}>
                        {activeStep === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: motionEnabled ? 0.35 : 0 }}
                            className="process-panel"
                          >
                            <p>{step.text}</p>
                            <span>{step.note}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
                <button
                  className="text-link"
                  onClick={() => setSkillModal("read")}
                >
                  Read the complete playbook <ArrowUpRight size={18} />
                </button>
              </div>
            </div>
          </section>

          <section className="sources-section section-dark" id="sources">
            <div className="section-meta">
              <span>
                <i />
                04 / THE SOURCE MATERIAL
              </span>
              <span>GOOD TASTE DOES ITS HOMEWORK.</span>
            </div>
            <div className="sources-heading reveal">
              <h2>
                Good company.
                <br />
                <span className="outline-text">Great possibilities.</span>
              </h2>
              <p>
                A few favorite places to get curious.
                <br />
                The right tool, for the right little detail.
                <br />
                <span>References, not a dependency list.</span>
              </p>
            </div>
            <div className="source-list">
              {sources.map((source, i) => (
                <a
                  className="source-row"
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  key={source.name}
                >
                  <span className="source-index">0{i + 1}</span>
                  <h3>{source.name}</h3>
                  <p>{source.detail}</p>
                  <span className="source-tag">{source.tag}</span>
                  <ArrowUpRight size={30} strokeWidth={1.4} />
                </a>
              ))}
            </div>
            <p className="source-disclaimer">
              Borrow the principle. Respect the license. Never copy the
              personality.
            </p>
          </section>

          <section className="outro">
            <div className="section-meta">
              <span>
                <i />
                YOUR NEXT CHAPTER
              </span>
              <span>LESS PREDICTABLE STARTS HERE.</span>
            </div>
            <div className="outro-layout">
              <h2 className="outro-title">
                <span className="outro-line">
                  <span>Make something</span>
                </span>
                <span className="outro-line">
                  <span>
                    <em>uncommon.</em>
                  </span>
                </span>
              </h2>
              <div className="outro-copy">
                <Star className="outro-star" />
                <p>
                  Your next website could feel
                  <br />
                  a little more like you.
                  <br />
                  <strong>Shall we make it happen?</strong>
                </p>
                <MagneticButton
                  className="button button-black"
                  onClick={() => setSkillModal("install")}
                >
                  Get the skill <ArrowUpRight size={21} />
                </MagneticButton>
                <span className="outro-note">
                  ONE SKILL. BETTER CREATIVE INSTINCTS. FREE.
                </span>
              </div>
            </div>
          </section>
        </main>
        <footer className="footer">
          <a className="wordmark" href="#" aria-label="Back to top">
            <Star />
            uncommon
          </a>
          <p>A SMALL SKILL. A MORE HUMAN WEB.</p>
          <div className="footer-actions">
            <button
              className={`motion-toggle ${motionEnabled ? "is-on" : ""}`}
              aria-pressed={motionEnabled}
              onClick={() => setMotionEnabled(!motionEnabled)}
            >
              <span className="toggle-track">
                <span />
              </span>
              Motion {motionEnabled ? "on" : "off"}
            </button>
            <button
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: motionEnabled ? "smooth" : "instant",
                })
              }
              aria-label="Back to top"
            >
              Back to top <ArrowUpRight size={15} />
            </button>
          </div>
        </footer>
        <Dialog
          open={skillModal !== null}
          onClose={() => setSkillModal(null)}
          title="A little uncommon goes a long way."
          eyebrow="uncommon / THE CLAUDE SKILL"
          wide
        >
          {skillModal && <SkillContent initialTab={skillModal} />}
        </Dialog>
        <Dialog
          open={selectedExperiment !== null}
          onClose={() => setSelectedExperiment(null)}
          title={selectedExperiment?.name.toUpperCase() ?? ""}
          eyebrow={`EXPERIMENT 0${selectedExperiment?.id ?? 1} / LIVE & INTERACTIVE`}
          wide
        >
          {selectedExperiment && (
            <ExperimentContent
              item={selectedExperiment}
              enabled={motionEnabled}
            />
          )}
        </Dialog>
      </div>
    </MotionConfig>
  );
}
