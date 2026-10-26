import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  useVelocity,
} from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  analyticsRoadmap,
  certifications,
  content,
  dataProjects,
  education,
  experience,
  profile,
  projects,
  site,
  skills,
} from "./data";
import type { Project } from "./data/projects";
import { motionConfig, motionSeconds } from "./config/motion";

type IconName = "arrow" | "moon" | "sun" | "close" | "external" | "download";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    moon: <path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5 8.5 8.5 0 1 0 20.5 14.3Z" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    external: (
      <>
        <path d="M14 3h7v7m0-7L10 14" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5" />
        <path d="M5 17v3h14v-3" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

function trackResumeDownload() {
  window.dispatchEvent(
    new CustomEvent("portfolio:resume-download", { detail: { path: site.resumePath } }),
  );
}

function AnimatedStat({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reducedMotion = useReducedMotion();
  const [count, setCount] = useState(value);

  useEffect(() => {
    if (!inView || reducedMotion) return;
    const start = performance.now();
    let frame = 0;
    const update = (time: number) => {
      const progress = Math.min((time - start) / 700, 1);
      setCount(Math.round(value * progress));
      if (progress < 1) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [inView, reducedMotion, value]);

  return (
    <span className="stat-number" ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

function useSmoothScroll() {
  useEffect(() => {
    if (
      !motionConfig.enabled.smoothScroll ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 768px), (pointer: coarse)").matches
    ) {
      return;
    }
    let cancelled = false;
    let destroyLenis = () => {};
    void import("lenis")
      .then(({ default: Lenis }) => {
        if (cancelled) return;
        const lenis = new Lenis({
          duration: motionSeconds("smoothScroll", false),
          smoothWheel: true,
          anchors: true,
          autoRaf: true,
        });
        destroyLenis = () => lenis.destroy();
      })
      .catch((error: unknown) => {
        if (!cancelled) console.error("Unable to initialize smooth scrolling:", error);
      });
    return () => {
      cancelled = true;
      destroyLenis();
    };
  }, []);
}

function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("portfolio-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    const initial = stored === "light" || stored === "dark" ? stored : preferred;
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("portfolio-theme", next);
  };

  return { theme, toggle };
}

function useLoopVisibility<T extends HTMLElement>(effectEnabled = true, desktopOnly = false) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      reducedMotion ||
      !effectEnabled ||
      (desktopOnly && window.matchMedia("(max-width: 768px), (pointer: coarse)").matches)
    ) {
      setVisible(false);
      return;
    }
    let inView = false;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        update();
      },
      { threshold: 0.05 },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [desktopOnly, effectEnabled, reducedMotion]);

  return { ref, visible };
}

function Portrait({
  available,
  className = "",
  priority = false,
}: {
  available: boolean;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(!available);
  return (
    <span
      aria-label={content.motion.photoLabel}
      className={`portrait-frame ${className}`}
      role="img"
    >
      {!failed && (
        <picture>
          <source srcSet={profile.photo.webpSrc} type="image/webp" />
          <img
            {...{ fetchpriority: priority ? "high" : "auto" }}
            alt=""
            decoding="async"
            height={profile.photo.height}
            loading={priority ? "eager" : "lazy"}
            onError={() => setFailed(true)}
            src={profile.photo.src}
            style={{ backgroundImage: `url("${profile.photo.placeholderSrc}")` }}
            width={profile.photo.width}
          />
        </picture>
      )}
      {failed && (
        <span className="portrait-fallback">
          <span className="portrait-monogram">{profile.monogram}</span>
          <span>{content.motion.portraitFallback}</span>
        </span>
      )}
    </span>
  );
}

function MotionChrome() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorLabelRef = useRef<HTMLSpanElement>(null);
  const { scrollYProgress, scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const [cursorEnabled, setCursorEnabled] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const reducedMotion = useReducedMotion();

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setProgressPercent(Math.round(value * 100));
  });

  useMotionValueEvent(velocity, "change", (value) => {
    if (!motionConfig.enabled.headingSkew || reducedMotion) return;
    const skew = Math.max(
      -motionConfig.distance.maxHeadingSkew,
      Math.min(motionConfig.distance.maxHeadingSkew, value / (motionConfig.distance.heading * 6)),
    );
    document.documentElement.style.setProperty("--scroll-skew", `${skew}deg`);
  });

  useEffect(() => {
    if (
      !motionConfig.enabled.customCursor ||
      reducedMotion ||
      !window.matchMedia(
        `(min-width: ${motionConfig.breakpoint.cursor}px) and (hover: hover) and (pointer: fine)`,
      ).matches
    ) {
      return;
    }
    setCursorEnabled(true);
    const cursor = cursorRef.current;
    const label = cursorLabelRef.current;
    if (!cursor || !label) return;
    const move = (event: PointerEvent) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      const target =
        event.target instanceof Element ? event.target.closest<HTMLElement>("[data-cursor]") : null;
      const nextLabel = target?.dataset.cursor ?? "";
      label.textContent = nextLabel;
      cursor.classList.toggle("cursor-active", Boolean(nextLabel));
      const tilted =
        event.target instanceof Element ? event.target.closest<HTMLElement>("[data-tilt]") : null;
      if (tilted && motionConfig.enabled.projectTilt) {
        const bounds = tilted.getBoundingClientRect();
        tilted.style.setProperty(
          "--tilt-x",
          `${((event.clientX - bounds.left) / bounds.width - 0.5) * 7}deg`,
        );
        tilted.style.setProperty(
          "--tilt-y",
          `${((bounds.bottom - event.clientY) / bounds.height - 0.5) * 7}deg`,
        );
        tilted.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
        tilted.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
      }
      const magnetic =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-magnetic]")
          : null;
      if (magnetic && motionConfig.enabled.magneticButtons) {
        const bounds = magnetic.getBoundingClientRect();
        const magneticOffset = (coordinate: number, start: number, size: number) =>
          Math.max(
            -motionConfig.distance.magnetic,
            Math.min(
              motionConfig.distance.magnetic,
              ((coordinate - start - size / 2) / size) * motionConfig.distance.magnetic * 2,
            ),
          );
        magnetic.style.translate = `${magneticOffset(event.clientX, bounds.left, bounds.width)}px ${magneticOffset(event.clientY, bounds.top, bounds.height)}px`;
      }
    };
    const reset = (event: PointerEvent) => {
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-tilt], [data-magnetic]")
          : null;
      if (!target || (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)))
        return;
      ["--tilt-x", "--tilt-y", "--spot-x", "--spot-y", "translate"].forEach((property) =>
        target.style.removeProperty(property),
      );
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", reset);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", reset);
      document.documentElement.style.removeProperty("--scroll-skew");
    };
  }, [reducedMotion]);

  return (
    <>
      <motion.div
        aria-label={content.motion.progress}
        className="scroll-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPercent}
        style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
      />
      {cursorEnabled && (
        <div
          aria-hidden="true"
          className="custom-cursor"
          ref={cursorRef}
          style={
            {
              "--cursor-grow": motionConfig.distance.cursorGrow,
              "--cursor-lag": `${motionConfig.distance.cursorLag}s`,
            } as React.CSSProperties
          }
        >
          <span ref={cursorLabelRef} />
        </div>
      )}
    </>
  );
}

function ParallaxWord({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [motionConfig.distance.parallax, -motionConfig.distance.parallax],
  );
  return (
    <motion.span
      aria-hidden="true"
      className="parallax-word"
      ref={ref}
      style={{ y: reducedMotion || !motionConfig.enabled.parallax ? 0 : y }}
    >
      {children}
    </motion.span>
  );
}

function Seo({
  title = site.title,
  description = site.description,
  canonical = site.url,
  portraitAvailable = false,
}: {
  title?: string;
  description?: string;
  canonical?: string;
  portraitAvailable?: boolean;
}) {
  const sameAs = site.socials.map(({ url }) => url);
  const knowsAbout = skills.flatMap((group) => group.skills);
  const alumniOf = education.map(({ institution }) => ({
    "@type": "EducationalOrganization",
    name: institution,
  }));
  const projectSchemas = [...projects, ...dataProjects].map((project) => ({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description: "description" in project ? project.description : project.problem,
    url: "liveUrl" in project ? project.liveUrl || undefined : project.dashboardUrl || undefined,
    creator: { "@type": "Person", name: profile.name },
  }));
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: profile.name,
      jobTitle: profile.title,
      description,
      email: `mailto:${site.email}`,
      telephone: site.phone,
      url: site.url,
      sameAs,
      knowsAbout,
      alumniOf,
      ...(portraitAvailable ? { image: `${site.url}${profile.photo.src}` } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: site.title,
      url: site.url,
      description,
    },
    ...projectSchemas,
  ];

  return (
    <Helmet>
      <html lang={site.language} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={site.keywords.join(", ")} />
      <meta name="theme-color" content={site.themeColor} />
      <link rel="canonical" href={canonical} />
      {portraitAvailable && (
        <link
          as="image"
          fetchPriority="high"
          href={profile.photo.webpSrc}
          rel="preload"
          type="image/webp"
        />
      )}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={`${site.url}${site.socialImagePath}`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${site.url}${site.socialImagePath}`} />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
}

function Intro() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!motionConfig.enabled.preloader || sessionStorage.getItem("portfolio-intro-seen")) return;
    setVisible(true);
    const duration = motionSeconds("preloader", Boolean(reducedMotion));
    const start = performance.now();
    const ticker = window.setInterval(() => {
      setProgress(
        Math.min(100, Math.round(((performance.now() - start) / (duration * 1000)) * 100)),
      );
    }, motionConfig.duration.introProgressTick * 1000);
    const timer = window.setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("portfolio-intro-seen", "true");
    }, duration * 1000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(ticker);
    };
  }, [reducedMotion]);

  const skip = () => {
    sessionStorage.setItem("portfolio-intro-seen", "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          animate={{ opacity: 1 }}
          aria-label={content.intro.label}
          className="intro-screen"
          exit={{ opacity: 0 }}
          initial={{ opacity: 1 }}
          role="status"
          transition={{ duration: motionSeconds("shutter", Boolean(reducedMotion)) }}
        >
          <span className="intro-shutter intro-shutter-top" />
          <span className="intro-shutter intro-shutter-bottom" />
          <span className="intro-progress mono">{String(progress).padStart(2, "0")}</span>
          <motion.p
            animate={reducedMotion ? undefined : { y: 0, opacity: 1 }}
            className="intro-name"
            initial={reducedMotion ? undefined : { y: 30, opacity: 0 }}
            transition={{
              duration: motionSeconds("reveal", Boolean(reducedMotion)),
              ease: motionConfig.ease.standard,
            }}
          >
            {profile.name}
          </motion.p>
          <button className="intro-skip" onClick={skip} type="button">
            {content.motion.skipIntro}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Navbar({
  theme,
  onToggle,
  homePath = "",
}: {
  theme: "dark" | "light";
  onToggle: () => void;
  homePath?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const links = content.nav.links;

  useEffect(() => {
    const sections = links
      .map(({ href }) => document.querySelector<HTMLElement>(href))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-22% 0px -62% 0px", threshold: [0.1, 0.35, 0.65] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [links]);

  return (
    <header className="site-header">
      <a
        aria-label={profile.name}
        className="wordmark"
        href={`${homePath}${content.routeLinks.top}`}
      >
        {profile.monogram}
        <span>.</span>
      </a>
      <nav aria-label={content.accessibility.primaryNav} className={menuOpen ? "nav-open" : ""}>
        {links.map((link) => (
          <a
            aria-current={activeSection === link.href.slice(1) ? "location" : undefined}
            href={`${homePath}${link.href}`}
            key={link.href}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <a className="nav-resume" download href={site.resumePath} onClick={trackResumeDownload}>
          {content.nav.resume}
          <Icon name="download" />
        </a>
      </nav>
      <div className="header-tools">
        <button
          aria-label={content.nav.theme}
          className="theme-toggle"
          onClick={onToggle}
          title={
            theme === "dark" ? content.accessibility.themeLight : content.accessibility.themeDark
          }
          type="button"
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} />
        </button>
        <button
          aria-expanded={menuOpen}
          aria-label={content.nav.menu}
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          type="button"
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

function ParticleField() {
  const { ref: fieldRef, visible } = useLoopVisibility<HTMLDivElement>(
    motionConfig.enabled.particles,
    true,
  );
  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
  };
  return (
    <div
      aria-label={content.accessibility.interactiveSignal}
      className={`signal-field${visible ? " signal-active" : ""}`}
      onPointerMove={handleMove}
      ref={fieldRef}
      role="img"
    >
      <div className="signal-grid" />
      <div className="signal-glow" />
      <div className="signal-line signal-line-one" />
      <div className="signal-line signal-line-two" />
      {Array.from({ length: 22 }, (_, index) => (
        <span
          className="signal-point"
          key={index}
          style={
            {
              "--point-x": `${(index * 37 + 8) % 96}%`,
              "--point-y": `${(index * 53 + 14) % 88}%`,
              "--point-delay": `${(index % 7) * -0.43}s`,
            } as React.CSSProperties
          }
        />
      ))}
      <span className="signal-caption">{content.hero.liveLabel}</span>
    </div>
  );
}

function RoleScramble() {
  const { ref, visible } = useLoopVisibility<HTMLParagraphElement>(true);
  const [roleIndex, setRoleIndex] = useState(0);
  const [display, setDisplay] = useState<string>(profile.roles[0]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!visible || reducedMotion || profile.roles.length < 2) return;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const decodeTicks = Math.ceil(
      motionConfig.duration.roleDecode / motionConfig.duration.roleTick,
    );
    const pauseTicks = Math.ceil(motionConfig.duration.rolePause / motionConfig.duration.roleTick);
    const cycleTicks = decodeTicks + pauseTicks;
    let phase = roleIndex * cycleTicks + decodeTicks;
    const timer = window.setInterval(() => {
      phase += 1;
      phase %= profile.roles.length * cycleTicks;
      const nextRoleIndex = Math.floor(phase / cycleTicks);
      const target = profile.roles[nextRoleIndex];
      const rolePhase = phase % cycleTicks;
      if (rolePhase === 0) setRoleIndex(nextRoleIndex);
      const resolved = rolePhase >= decodeTicks;
      setDisplay(
        resolved
          ? target
          : target
              .split("")
              .map((letter, index) =>
                letter === " " || index < Math.floor((rolePhase / decodeTicks) * target.length)
                  ? letter
                  : alphabet[Math.floor(Math.random() * alphabet.length)],
              )
              .join(""),
      );
    }, motionConfig.duration.roleTick * 1000);
    return () => window.clearInterval(timer);
  }, [reducedMotion, roleIndex, visible]);

  return (
    <p className="hero-position" ref={ref} aria-label={profile.roles[roleIndex]}>
      <span aria-hidden="true">{reducedMotion ? profile.roles[0] : display}</span>
    </p>
  );
}

function HeroPortrait({ available }: { available: boolean }) {
  const { ref, visible } = useLoopVisibility<HTMLDivElement>(motionConfig.enabled.photoOrbit, true);
  const orbitBadges = profile.orbitSkills
    .map((name) => skills.flatMap((group) => group.skills).find((skill) => skill === name))
    .filter((skill): skill is string => Boolean(skill));
  return (
    <div
      className={`hero-portrait${visible ? " orbit-active" : ""}`}
      ref={ref}
      style={{ "--orbit-duration": `${motionConfig.duration.orbit}s` } as React.CSSProperties}
    >
      <span className="portrait-orbit portrait-orbit-one" />
      <span className="portrait-orbit portrait-orbit-two" />
      <Portrait available={available} className="portrait-hero" priority />
      <span className="orbit-label mono">{content.hero.orbitLabel}</span>
      {orbitBadges.map((skill, index) => (
        <span
          className="orbit-badge mono"
          key={skill}
          style={
            {
              "--orbit-angle": `${index * (360 / orbitBadges.length)}deg`,
              "--orbit-counter-angle": `${index * (-360 / orbitBadges.length)}deg`,
            } as React.CSSProperties
          }
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

function Hero({ portraitAvailable }: { portraitAvailable: boolean }) {
  const reducedMotion = useReducedMotion();
  return (
    <section aria-labelledby="hero-title" className="hero section-shell" id="top">
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow">
          <span className="status-dot" />
          {content.hero.eyebrow}
        </p>
        <h1 id="hero-title">
          {content.hero.headline.map((line, lineIndex) => (
            <span className="headline-line" key={line}>
              {Array.from(line).map((character, index) => (
                <motion.span
                  animate={{ opacity: 1, y: 0 }}
                  aria-hidden="true"
                  className={lineIndex === 1 ? "headline-accent" : ""}
                  initial={reducedMotion ? undefined : { opacity: 0, y: 50 }}
                  key={`${line}-${index}`}
                  transition={{
                    delay: reducedMotion
                      ? 0
                      : 0.12 + lineIndex * 0.35 + index * motionConfig.duration.headingStagger,
                    duration: reducedMotion ? 0 : 0.65,
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                >
                  {character === " " ? "\u00a0" : character}
                </motion.span>
              ))}
            </span>
          ))}
          <span className="sr-only">{content.hero.headline.join(" ")}</span>
        </h1>
        <RoleScramble />
        <p className="hero-description">{content.hero.description}</p>
        <div className="hero-actions">
          <a className="button button-primary" data-magnetic href={content.routeLinks.work}>
            {content.hero.viewWork}
            <Icon name="arrow" />
          </a>
          <a
            className="button button-text"
            data-magnetic
            download
            href={site.resumePath}
            onClick={trackResumeDownload}
          >
            {content.nav.resume}
            <Icon name="download" />
          </a>
        </div>
        <p className="hero-availability">
          <span className="status-dot" />
          {content.hero.availability}
        </p>
      </div>
      <div className="hero-art">
        <div className="hero-art-index">
          <span>{content.hero.sequence}</span>
          <span className="mono">
            {profile.firstName.toUpperCase()} / {content.hero.portfolioLabel}
          </span>
        </div>
        <ParticleField />
        <HeroPortrait available={portraitAvailable} />
        <div className="hero-art-foot">
          <span className="mono">{content.hero.scroll}</span>
          <span className="scroll-mark" />
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  id?: string;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {intro && <p className="section-intro">{intro}</p>}
    </div>
  );
}

function About({ portraitAvailable }: { portraitAvailable: boolean }) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [revealStarted, setRevealStarted] = useState(false);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealStarted(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [reducedMotion]);
  const secondaryWords = content.about.secondary.split(" ");
  return (
    <section
      aria-labelledby="about-heading"
      className={`about-section section-shell${revealStarted ? " about-reveal-active" : ""}`}
      id="about"
      ref={sectionRef}
    >
      <ParallaxWord>{content.motion.aboutParallax}</ParallaxWord>
      <div className="about-lead">
        <SectionHeading
          eyebrow={content.about.eyebrow}
          id="about-heading"
          title={content.about.title}
        />
        <p className="about-summary">{profile.summary}</p>
      </div>
      <div className="about-bottom">
        <div className="about-story">
          <p>
            {secondaryWords.map((word, index) => (
              <span key={`${word}-${index}`}>
                <motion.span
                  className="about-word"
                  initial={false}
                  style={
                    {
                      "--word-delay": `${Math.min(index, 22) * motionConfig.duration.headingStagger}s`,
                    } as React.CSSProperties
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.7 }}
                  transition={{
                    delay: Math.min(index, 22) * motionConfig.duration.headingStagger,
                    duration: motionSeconds("normal", Boolean(reducedMotion)),
                  }}
                >
                  {word}
                </motion.span>
                {index < secondaryWords.length - 1 ? " " : null}
              </span>
            ))}
          </p>
          <figure
            className="about-photo"
            onPointerMove={(event) => {
              if (
                reducedMotion ||
                window.matchMedia("(max-width: 768px), (pointer: coarse)").matches
              ) {
                return;
              }
              const bounds = event.currentTarget.getBoundingClientRect();
              event.currentTarget.style.setProperty(
                "--photo-tilt-x",
                `${((event.clientY - bounds.top) / bounds.height - 0.5) * -5}deg`,
              );
              event.currentTarget.style.setProperty(
                "--photo-tilt-y",
                `${((event.clientX - bounds.left) / bounds.width - 0.5) * 5}deg`,
              );
            }}
            onPointerLeave={(event) => {
              event.currentTarget.style.removeProperty("--photo-tilt-x");
              event.currentTarget.style.removeProperty("--photo-tilt-y");
            }}
          >
            <Portrait available={portraitAvailable} className="portrait-about" />
            <figcaption>{content.about.portraitCaption}</figcaption>
          </figure>
        </div>
        <div className="stat-row">
          {profile.stats.map((stat, index) => (
            <motion.div
              className="stat-card"
              initial={false}
              key={stat.label}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <AnimatedStat suffix={stat.suffix} value={stat.value} />
              <span className="stat-label">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectVisual({ variant, projectId }: { variant: string; projectId?: string }) {
  return (
    <motion.div
      aria-hidden="true"
      className={`project-visual visual-${variant}`}
      layoutId={projectId ? `project-visual-${projectId}` : undefined}
    >
      <div className="visual-topline">
        <i />
        <i />
        <i />
      </div>
      <div className="visual-content">
        <span className="visual-kicker" />
        <span className="visual-title" />
        <span className="visual-copy" />
        <span className="visual-button" />
        <div className="visual-shape">
          <span />
          <span />
          <span />
        </div>
      </div>
      <span className="visual-grain" />
    </motion.div>
  );
}

function ProjectCard({
  project,
  index,
  onSelect,
}: {
  project: Project;
  index: number;
  onSelect: (project: Project, element: HTMLButtonElement) => void;
}) {
  return (
    <motion.article
      className="project-card"
      data-tilt
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.55, delay: (index % 2) * 0.08 }}
    >
      <button
        aria-label={`${content.projects.openProject}: ${project.name}`}
        className="project-card-open"
        data-cursor={content.motion.view}
        onClick={(event) => onSelect(project, event.currentTarget)}
        type="button"
      >
        <ProjectVisual projectId={project.slug} variant={project.visual} />
        <span className="project-card-body">
          <span className="project-card-meta">
            <span>{project.category}</span>
            <span>{project.status}</span>
          </span>
          <span className="project-card-title">{project.name}</span>
          <span className="project-card-description">{project.description}</span>
          <span className="project-card-tags">
            {project.technologies.map((technology) => (
              <span key={technology}>{technology}</span>
            ))}
          </span>
          <span className="project-card-footer">
            <span>{project.liveUrl ? content.projects.visit : content.projects.noLink}</span>
            <Icon name="arrow" />
          </span>
        </span>
      </button>
    </motion.article>
  );
}

function ProjectDialog({
  project,
  onClose,
  returnFocusRef,
}: {
  project: Project | null;
  onClose: () => void;
  returnFocusRef: React.MutableRefObject<HTMLButtonElement | null>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!project) return;
    const returnFocusElement = returnFocusRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocusElement?.focus();
    };
  }, [project, onClose, returnFocusRef]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled])",
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!project) return null;
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="dialog-backdrop"
      initial={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        aria-labelledby="project-dialog-title"
        aria-modal="true"
        className="project-dialog"
        initial={{ opacity: 0, y: 18 }}
        onKeyDown={handleKeyDown}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
        transition={{ duration: 0.25 }}
      >
        <button
          aria-label={content.projects.close}
          className="dialog-close"
          onClick={onClose}
          type="button"
        >
          <Icon name="close" />
        </button>
        <ProjectVisual projectId={project.slug} variant={project.visual} />
        <p className="eyebrow">
          {project.category} / {project.year}
        </p>
        <h3 id="project-dialog-title">{project.name}</h3>
        <p>{project.detail}</p>
        <div className="dialog-tags">
          {project.technologies.map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>
        <a className="text-link project-detail-link" href={`/projects/${project.slug}/`}>
          {content.projects.readMore}
          <Icon name="arrow" />
        </a>
        {project.liveUrl ? (
          <a
            className="button button-primary"
            href={project.liveUrl}
            rel="noreferrer"
            target="_blank"
          >
            {content.projects.visit}
            <Icon name="external" />
          </a>
        ) : (
          <p className="mono">{content.projects.noLink}</p>
        )}
        {project.githubUrl && (
          <a className="text-link" href={project.githubUrl} rel="noreferrer" target="_blank">
            {content.projects.source}
            <Icon name="external" />
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}

function Work() {
  const filters = ["all", ...new Set(projects.map(({ category }) => category))];
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const closeProject = useCallback(() => setSelectedProject(null), []);
  const visibleProjects =
    activeFilter === "all"
      ? projects
      : projects.filter(({ category }) => category === activeFilter);

  useEffect(() => {
    const gallery = galleryRef.current;
    const track = trackRef.current;
    if (
      !gallery ||
      !track ||
      !motionConfig.enabled.horizontalProjects ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia(`(max-width: ${motionConfig.breakpoint.touch}px), (pointer: coarse)`)
        .matches
    ) {
      return;
    }
    let disposed = false;
    let revertContext = () => {};
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || disposed) return;
        observer.disconnect();
        void Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
          .then(([{ gsap }, { ScrollTrigger }]) => {
            if (disposed) return;
            gsap.registerPlugin(ScrollTrigger);
            const context = gsap.context(() => {
              track.classList.add("project-grid-horizontal");
              const distance = () => Math.max(0, track.scrollWidth - gallery.clientWidth);
              if (!distance()) {
                track.classList.remove("project-grid-horizontal");
                return;
              }
              gsap.to(track, {
                x: () => -distance(),
                ease: "none",
                scrollTrigger: {
                  trigger: gallery,
                  start: "top top+=115",
                  end: () => `+=${distance()}`,
                  scrub: motionSeconds("projectScrub", false),
                  pin: true,
                  anticipatePin: 1,
                  invalidateOnRefresh: true,
                },
              });
            }, gallery);
            revertContext = () => context.revert();
          })
          .catch((error: unknown) => {
            if (!disposed) console.error("Unable to initialize the project carousel:", error);
          });
      },
      { rootMargin: "160px" },
    );
    observer.observe(gallery);
    return () => {
      disposed = true;
      observer.disconnect();
      revertContext();
      track.classList.remove("project-grid-horizontal");
    };
  }, [activeFilter, visibleProjects.length]);

  return (
    <section aria-labelledby="work-heading" className="work-section section-shell" id="work">
      <ParallaxWord>{content.motion.workParallax}</ParallaxWord>
      <SectionHeading
        eyebrow={content.projects.eyebrow}
        id="work-heading"
        intro={content.projects.intro}
        title={content.projects.title}
      />
      <div aria-label={content.projects.filtersLabel} className="project-filters" role="group">
        {filters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter}
            className={activeFilter === filter ? "filter-active" : ""}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter === "all" ? content.projects.allFilter : filter}
          </button>
        ))}
      </div>
      <div className="project-gallery" ref={galleryRef}>
        <div className="project-grid" ref={trackRef}>
          {visibleProjects.map((project, index) => (
            <ProjectCard
              index={index}
              key={project.slug}
              onSelect={(selected, element) => {
                returnFocusRef.current = element;
                setSelectedProject(selected);
              }}
              project={project}
            />
          ))}
        </div>
      </div>
      <ProjectDialog
        onClose={closeProject}
        project={selectedProject}
        returnFocusRef={returnFocusRef}
      />
    </section>
  );
}

function TransitionStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smallScreen = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
    if (reduceMotion || smallScreen || !stageRef.current) return;
    let disposed = false;
    let revertContext = () => {};
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || !stageRef.current || disposed) return;
        observer.disconnect();
        void Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
          .then(([{ gsap }, { ScrollTrigger }]) => {
            if (disposed || !stageRef.current) return;
            gsap.registerPlugin(ScrollTrigger);
            const context = gsap.context(() => {
              const timeline = gsap.timeline({
                scrollTrigger: {
                  trigger: stageRef.current,
                  start: "top top",
                  end: `+=${motionConfig.duration.transitionScroll}`,
                  scrub: 1,
                  pin: true,
                },
              });
              timeline
                .to(motionConfig.selector.transitionCode, {
                  opacity: 0,
                  y: -28,
                  stagger: 0.05,
                  duration: 0.35,
                })
                .fromTo(
                  motionConfig.selector.transitionBars,
                  { scaleY: 0, transformOrigin: "bottom" },
                  { scaleY: 1, stagger: 0.07, duration: 0.6 },
                  "-=0.1",
                )
                .fromTo(
                  motionConfig.selector.transitionLabel,
                  { opacity: 0, y: 12 },
                  { opacity: 1, y: 0, duration: 0.35 },
                  "-=0.1",
                )
                .to(".transition-chart", { filter: "hue-rotate(34deg)" }, 0);
            }, stageRef);
            revertContext = () => context.revert();
          })
          .catch((error: unknown) => {
            if (!disposed)
              console.error("Unable to initialize the code-to-chart transition:", error);
          });
      },
      { rootMargin: "100px" },
    );
    observer.observe(stageRef.current);
    return () => {
      disposed = true;
      observer.disconnect();
      revertContext();
    };
  }, []);

  const bars = content.transition.barHeights;
  return (
    <div aria-hidden="true" className="transition-stage" ref={stageRef}>
      <div className="transition-code-stack">
        {content.transition.codeLines.map((line, index) => (
          <span
            className="transition-code mono"
            key={line}
            style={{ "--line-index": index } as React.CSSProperties}
          >
            {line}
          </span>
        ))}
      </div>
      <div className="transition-chart">
        {bars.map((height, index) => (
          <span
            className="transition-bar"
            key={`${height}-${index}`}
            style={{ "--bar-height": `${height}%` } as React.CSSProperties}
          />
        ))}
      </div>
      <span className="transition-label mono">{content.analytics.sequenceLabel}</span>
    </div>
  );
}

function Analytics() {
  const hasProjects = dataProjects.length > 0;
  return (
    <section
      aria-labelledby="analytics-heading"
      className="analytics-section section-shell"
      id="analytics"
    >
      <ParallaxWord>{content.motion.analyticsParallax}</ParallaxWord>
      <div className="analytics-heading-wrap">
        <SectionHeading
          eyebrow={content.analytics.eyebrow}
          id="analytics-heading"
          intro={content.analytics.intro}
          title={content.analytics.title}
        />
        <span className="analytics-mark" aria-hidden="true">
          ↗
        </span>
      </div>
      <TransitionStage />
      {hasProjects ? (
        <div className="data-project-grid">
          {dataProjects.map((project) => (
            <article className="data-project-card" key={project.slug}>
              {project.screenshot && (
                <img
                  alt={project.screenshotAlt}
                  height="320"
                  loading="lazy"
                  src={project.screenshot}
                  width="640"
                />
              )}
              <p className="eyebrow">{project.tools.join(" / ")}</p>
              <h3>{project.name}</h3>
              <p>{project.problem}</p>
              <p>{project.dataset}</p>
              <ul>
                {project.insights.map((insight) => (
                  <li key={insight}>{insight}</li>
                ))}
              </ul>
              <div className="data-project-links">
                <a href={`/projects/${project.slug}/`}>{content.projects.readMore}</a>
                {project.githubUrl && <a href={project.githubUrl}>{content.projects.source}</a>}
                {project.dashboardUrl && (
                  <a href={project.dashboardUrl}>{content.analytics.viewCase}</a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="analytics-empty">
          <div className="empty-orbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <span className="status-pill">{content.analytics.upcoming}</span>
            <h3>{content.analytics.emptyTitle}</h3>
            <p>{content.analytics.emptyDescription}</p>
          </div>
        </div>
      )}
      <div className="roadmap-block">
        <p className="eyebrow">{content.analytics.sequenceLabel}</p>
        <ol className="roadmap">
          {analyticsRoadmap.map((item, index) => (
            <motion.li
              initial={false}
              key={item.name}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: index * 0.07 }}
            >
              <span className="roadmap-number">0{index + 1}</span>
              <span className="roadmap-name">{item.name}</span>
              <span className="roadmap-note">{item.note}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ExperienceEntry({ item, index }: { item: (typeof experience)[number]; index: number }) {
  const { ref, visible } = useLoopVisibility<HTMLElement>();
  return (
    <motion.article
      className={`timeline-item${visible ? " timeline-item-visible" : ""}`}
      initial={false}
      key={`${item.company}-${item.role}`}
      ref={ref}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
    >
      <TimelinePulse className="timeline-node" />
      <div className="timeline-meta">
        <span>{item.period}</span>
        <span>{item.location}</span>
      </div>
      <div className="timeline-content">
        <h3>{item.role}</h3>
        <p className="timeline-company">{item.company}</p>
        <p className="timeline-description">{item.description}</p>
        <details>
          <summary>{content.experience.highlights}</summary>
          <ul>
            {item.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </details>
      </div>
    </motion.article>
  );
}

function Experience() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 75%", "end 55%"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <section
      aria-labelledby="experience-heading"
      className="experience-section section-shell"
      id="experience"
    >
      <ParallaxWord>{content.motion.experienceParallax}</ParallaxWord>
      <SectionHeading
        eyebrow={content.experience.eyebrow}
        id="experience-heading"
        intro={content.experience.intro}
        title={content.experience.title}
      />
      <div className="timeline" ref={timelineRef}>
        <motion.span className="timeline-progress" style={{ scaleY, originY: 0 }} />
        {experience.map((item, index) => (
          <ExperienceEntry item={item} index={index} key={`${item.company}-${item.role}`} />
        ))}
      </div>
    </section>
  );
}

function Skills() {
  const maximumSkillCount = Math.max(...skills.map((group) => group.skills.length));
  const reducedMotion = useReducedMotion();
  return (
    <section aria-labelledby="skills-heading" className="skills-section section-shell" id="skills">
      <SectionHeading
        eyebrow={content.skills.eyebrow}
        id="skills-heading"
        intro={content.skills.intro}
        title={content.skills.title}
      />
      <div className="skills-groups">
        {skills.map((group) => (
          <div className={`skill-group skill-${group.kind}`} key={group.name}>
            <div className="skill-group-heading">
              <h3>{group.name}</h3>
              <span className="mono">
                {group.skills.length} {content.skills.countLabel}
              </span>
            </div>
            <div
              aria-label={`${group.name}: ${group.skills.length} ${content.skills.countLabel}`}
              className="skill-count-track"
              role="img"
            >
              <motion.span
                animate={{ scaleX: group.skills.length / maximumSkillCount }}
                className="skill-count-fill"
                initial={{ scaleX: 0 }}
                transition={{ duration: motionSeconds("reveal", Boolean(reducedMotion)) }}
              />
            </div>
            <div className="skill-list">
              {group.skills.map((skill, index) => (
                <motion.span
                  className="skill-chip"
                  title={skill}
                  initial={false}
                  key={skill}
                  whileHover={reducedMotion ? undefined : { y: -3 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    delay: index * motionConfig.duration.tagStagger,
                    duration: motionSeconds("fast", Boolean(reducedMotion)),
                  }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TechMarquee() {
  const { ref, visible } = useLoopVisibility<HTMLDivElement>(motionConfig.enabled.marquee);
  const technologies = skills.flatMap((group) => group.skills);
  return (
    <div
      aria-label={content.motion.marqueeLabel}
      className={`tech-marquee${visible ? " marquee-active" : ""}`}
      ref={ref}
      role="img"
      style={{ "--marquee-duration": `${motionConfig.duration.marquee}s` } as React.CSSProperties}
    >
      <div className="tech-marquee-track">
        {[0, 1].map((copy) => (
          <span aria-hidden={copy === 1} className="tech-marquee-group" key={copy}>
            {technologies.map((technology) => (
              <span className="tech-marquee-item" key={technology}>
                {technology}
                <i />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

function TimelinePulse({ className }: { className: string }) {
  const { ref, visible } = useLoopVisibility<HTMLSpanElement>();
  return <span className={`${className}${visible ? " timeline-node-active" : ""}`} ref={ref} />;
}

function Credentials() {
  return (
    <section
      aria-labelledby="credentials-heading"
      className="credentials-section section-shell"
      id="credentials"
    >
      <SectionHeading
        eyebrow={content.credentials.eyebrow}
        id="credentials-heading"
        title={content.credentials.title}
      />
      <div className="credentials-grid">
        <div>
          <h3 className="subsection-title">{content.credentials.education}</h3>
          {education.map((item) => (
            <article className="education-card" key={item.institution}>
              <span className="credential-mark" aria-hidden="true">
                {content.credentials.educationMark}
              </span>
              <div>
                <p className="mono">{item.period}</p>
                <h4>{item.degree}</h4>
                <p>{item.field}</p>
                <p>{item.institution}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CertificationShowcase() {
  const reducedMotion = useReducedMotion();
  return (
    <section
      aria-labelledby="certifications-heading"
      className="certifications-section section-shell"
      id="certifications"
    >
      <div className="certifications-heading">
        <SectionHeading
          eyebrow={content.certificationShowcase.eyebrow}
          id="certifications-heading"
          intro={content.certificationShowcase.intro}
          title={content.certificationShowcase.title}
        />
        <span className="certifications-count mono">
          {String(certifications.length).padStart(2, "0")} /{" "}
          {content.certificationShowcase.countLabel}
        </span>
      </div>
      <div className="certification-grid">
        {certifications.map((certification, index) => (
          <motion.article
            className="certification-card"
            initial={false}
            key={certification.name}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              delay: index * motionConfig.duration.tagStagger,
              duration: motionSeconds("normal", Boolean(reducedMotion)),
            }}
          >
            <div className="certificate-art">
              {certification.imageUrl ? (
                <img
                  alt={`${content.certificationShowcase.imageAlt}: ${certification.name}`}
                  loading="lazy"
                  src={certification.imageUrl}
                />
              ) : (
                <div aria-hidden="true" className="certificate-art-placeholder">
                  <span className="certificate-seal">{certification.issuer.slice(0, 2)}</span>
                  <span className="certificate-art-label mono">
                    {content.certificationShowcase.certificateLabel}
                  </span>
                  <span className="certificate-art-rule" />
                  <strong>{certification.name}</strong>
                  <span className="certificate-art-issuer">{certification.issuer}</span>
                </div>
              )}
              <span className="certificate-number mono">0{index + 1}</span>
            </div>
            <div className="certification-card-copy">
              <p className="eyebrow">{certification.issuer}</p>
              <h3>{certification.name}</h3>
              <p>{certification.detail}</p>
              {certification.year && <span className="certificate-year">{certification.year}</span>}
            </div>
            <div className="certification-card-links">
              {certification.documentUrl ? (
                <a href={certification.documentUrl} rel="noreferrer" target="_blank">
                  {content.certificationShowcase.viewDocument}
                  <Icon name="external" />
                </a>
              ) : (
                <span className="certificate-missing">{content.certificationShowcase.addFile}</span>
              )}
              {certification.verifyUrl && (
                <a href={certification.verifyUrl} rel="noreferrer" target="_blank">
                  {content.certificationShowcase.verify}
                  <Icon name="external" />
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT;
  const reducedMotion = useReducedMotion();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorDetail, setErrorDetail] = useState("");
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!endpoint) return;
    setStatus("sending");
    setErrorDetail("");
    const form = event.currentTarget;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      form.reset();
      setStatus("success");
    } catch (error) {
      console.error("Unable to submit contact form:", error);
      setErrorDetail(error instanceof Error ? error.message : content.contact.error);
      setStatus("error");
    }
  };

  return (
    <section
      aria-labelledby="contact-heading"
      className="contact-section section-shell"
      id="contact"
    >
      <div className="contact-copy">
        <SectionHeading
          eyebrow={content.contact.eyebrow}
          id="contact-heading"
          intro={content.contact.intro}
          title={content.contact.title}
        />
        <div className="contact-details">
          <a data-cursor={content.contact.ctaHover} href={`mailto:${site.email}`}>
            <span>{content.contact.email}</span>
            <strong>{site.email}</strong>
            <Icon name="arrow" />
          </a>
          <a href={`tel:${site.phone}`}>
            <span>{content.contact.phone}</span>
            <strong>{site.phone}</strong>
            <Icon name="arrow" />
          </a>
          {site.socials.map((social) => (
            <a href={social.url} key={social.label} rel="noreferrer" target="_blank">
              <span>{social.label}</span>
              <strong>{social.url}</strong>
              <Icon name="external" />
            </a>
          ))}
        </div>
        <div className="contact-resume">
          <a
            className="button button-primary"
            download
            href={site.resumePath}
            onClick={trackResumeDownload}
          >
            {content.contact.downloadResume}
            <Icon name="download" />
          </a>
          <a className="text-link" href={site.resumePath} rel="noreferrer" target="_blank">
            {content.contact.previewResume}
            <Icon name="external" />
          </a>
        </div>
      </div>
      <div className="contact-form-wrap">
        {endpoint ? (
          <form className="contact-form" onSubmit={submit}>
            <label>
              {content.contact.nameLabel}
              <input
                autoComplete="name"
                name="name"
                placeholder={content.motion.formNamePlaceholder}
                required
              />
            </label>
            <label>
              {content.contact.emailLabel}
              <input
                autoComplete="email"
                name="email"
                placeholder={content.motion.formEmailPlaceholder}
                required
                type="email"
              />
            </label>
            <label>
              {content.contact.messageLabel}
              <textarea
                name="message"
                placeholder={content.motion.formMessagePlaceholder}
                required
                rows={4}
              />
            </label>
            <button
              className="button button-primary"
              data-magnetic
              disabled={status === "sending"}
              type="submit"
            >
              {status === "sending" ? content.contact.sending : content.contact.send}
              <Icon name="arrow" />
            </button>
            <p aria-live="polite" className={`form-message form-${status}`}>
              <AnimatePresence mode="wait">
                {status === "success" && (
                  <motion.span
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="form-success"
                    exit={{ opacity: 0, y: 8 }}
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    key="success"
                    role="status"
                    transition={{ duration: motionSeconds("normal", Boolean(reducedMotion)) }}
                  >
                    <strong>{content.motion.successTitle}</strong>
                    <span>{content.motion.successDetail}</span>
                  </motion.span>
                )}
              </AnimatePresence>
              {status === "error" ? `${content.contact.error} ${errorDetail}` : ""}
            </p>
          </form>
        ) : (
          <div className="form-setup">
            <span className="eyebrow">{content.contact.formUnavailable}</span>
            <p>{content.contact.setup}</p>
            <a className="text-link" href={`mailto:${site.email}`}>
              {site.email}
              <Icon name="arrow" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function Footer({ homePath = "" }: { homePath?: string }) {
  return (
    <footer
      className="site-footer section-shell"
      onPointerMove={(event) => {
        if (window.matchMedia("(max-width: 768px), (pointer: coarse)").matches) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty(
          "--footer-pointer-x",
          `${event.clientX - bounds.left}px`,
        );
        event.currentTarget.style.setProperty(
          "--footer-pointer-y",
          `${event.clientY - bounds.top}px`,
        );
      }}
    >
      <a
        aria-label={profile.name}
        className="wordmark"
        href={`${homePath}${content.routeLinks.top}`}
      >
        {profile.monogram}
        <span>.</span>
      </a>
      <p>{content.footer.note}</p>
      <nav aria-label={content.accessibility.socialLinks} className="footer-socials">
        {site.socials.map((social) => (
          <a href={social.url} key={social.label} rel="noreferrer" target="_blank">
            {social.label}
            <Icon name="external" />
          </a>
        ))}
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </nav>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {profile.name}. {content.footer.copyright}
        </span>
        <a href={`${homePath}${content.routeLinks.top}`}>
          {content.footer.backToTop}
          <Icon name="arrow" />
        </a>
      </div>
    </footer>
  );
}

function ProjectDetail({
  project,
  theme,
  onToggle,
  portraitAvailable,
}: {
  project: Project;
  theme: "dark" | "light";
  onToggle: () => void;
  portraitAvailable: boolean;
}) {
  const canonical = `${site.url}/projects/${project.slug}/`;
  const title = `${project.name} — ${profile.name}`;
  return (
    <>
      <Seo
        title={title}
        description={project.description}
        canonical={canonical}
        portraitAvailable={portraitAvailable}
      />
      <a className="skip-link" href={content.routeLinks.main}>
        {content.accessibility.skip}
      </a>
      <Navbar homePath="/" onToggle={onToggle} theme={theme} />
      <main className="project-detail section-shell" id="main-content">
        <a className="text-link" href={`${site.homePath}${content.routeLinks.work}`}>
          {content.projects.title}
          <Icon name="arrow" />
        </a>
        <ProjectVisual variant={project.visual} />
        <p className="eyebrow">
          {project.category} / {project.year} / {project.status}
        </p>
        <h1>{project.name}</h1>
        <p className="project-detail-description">{project.detail}</p>
        <div className="project-detail-tags">
          {project.technologies.map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>
        {project.liveUrl && (
          <a
            className="button button-primary"
            href={project.liveUrl}
            rel="noreferrer"
            target="_blank"
          >
            {content.projects.visit}
            <Icon name="external" />
          </a>
        )}
      </main>
      <Footer homePath="/" />
    </>
  );
}

function DataProjectDetail({
  project,
  theme,
  onToggle,
  portraitAvailable,
}: {
  project: (typeof dataProjects)[number];
  theme: "dark" | "light";
  onToggle: () => void;
  portraitAvailable: boolean;
}) {
  const canonical = `${site.url}/projects/${project.slug}/`;
  const title = `${project.name} — ${profile.name}`;
  return (
    <>
      <Seo
        title={title}
        description={project.problem}
        canonical={canonical}
        portraitAvailable={portraitAvailable}
      />
      <a className="skip-link" href={content.routeLinks.main}>
        {content.accessibility.skip}
      </a>
      <Navbar homePath="/" onToggle={onToggle} theme={theme} />
      <main className="project-detail section-shell" id="main-content">
        <a className="text-link" href={`${site.homePath}${content.routeLinks.analytics}`}>
          {content.analytics.title}
          <Icon name="arrow" />
        </a>
        {project.screenshot && (
          <img
            alt={project.screenshotAlt}
            className="project-detail-image"
            height="320"
            src={project.screenshot}
            width="640"
          />
        )}
        <p className="eyebrow">{project.tools.join(" / ")}</p>
        <h1>{project.name}</h1>
        <h2>{content.dataProject.problem}</h2>
        <p className="project-detail-description">{project.problem}</p>
        <h2>{content.dataProject.dataset}</h2>
        <p>{project.dataset}</p>
        <h2>{content.dataProject.insights}</h2>
        <ul>
          {project.insights.map((insight) => (
            <li key={insight}>{insight}</li>
          ))}
        </ul>
      </main>
      <Footer homePath="/" />
    </>
  );
}

function NotFound() {
  return (
    <>
      <Helmet>
        <title>
          {content.notFound.title} — {profile.name}
        </title>
        <meta name="description" content={content.notFound.description} />
      </Helmet>
      <main className="not-found">
        <span className="eyebrow">{content.notFound.title}</span>
        <h1>{content.notFound.description}</h1>
        <a className="button button-primary" href={site.homePath}>
          {content.notFound.back}
          <Icon name="arrow" />
        </a>
      </main>
    </>
  );
}

export default function App({
  initialPath,
  portraitAvailable,
}: {
  initialPath?: string;
  portraitAvailable?: boolean;
}) {
  useSmoothScroll();
  const { theme, toggle } = useTheme();
  const [pathname] = useState(
    initialPath ?? (typeof window === "undefined" ? "/" : window.location.pathname),
  );
  const photoAvailable =
    portraitAvailable ??
    (typeof document !== "undefined" &&
      document.getElementById("root")?.dataset.portraitAvailable !== "false");

  if (pathname.startsWith("/projects/")) {
    const slug = pathname.split("/").filter(Boolean).at(-1);
    const project = projects.find((item) => item.slug === slug);
    if (project)
      return (
        <ProjectDetail
          onToggle={toggle}
          portraitAvailable={photoAvailable}
          project={project}
          theme={theme}
        />
      );
    const dataProject = dataProjects.find((item) => item.slug === slug);
    if (dataProject) {
      return (
        <DataProjectDetail
          onToggle={toggle}
          portraitAvailable={photoAvailable}
          project={dataProject}
          theme={theme}
        />
      );
    }
    return <NotFound />;
  }
  if (pathname !== "/" && pathname !== "/index.html") return <NotFound />;

  return (
    <>
      <MotionChrome />
      <Seo portraitAvailable={photoAvailable} />
      <a className="skip-link" href={content.routeLinks.main}>
        {content.accessibility.skip}
      </a>
      <Intro />
      <Navbar onToggle={toggle} theme={theme} />
      <main aria-label={content.accessibility.main} id="main-content">
        <Hero portraitAvailable={photoAvailable} />
        <About portraitAvailable={photoAvailable} />
        <Work />
        <Analytics />
        <Experience />
        <Skills />
        <TechMarquee />
        <Credentials />
        <CertificationShowcase />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
