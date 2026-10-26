export const motionConfig = {
  intensity: "max" as "balanced" | "max",
  enabled: {
    preloader: true,
    customCursor: true,
    smoothScroll: true,
    headingSkew: true,
    marquee: true,
    horizontalProjects: true,
    parallax: true,
    projectTilt: true,
    magneticButtons: true,
    particles: true,
    photoOrbit: true,
  },
  duration: {
    fast: 0.2,
    normal: 0.45,
    reveal: 0.75,
    preloader: 1.45,
    shutter: 0.72,
    roleDecode: 0.62,
    rolePause: 1.2,
    roleTick: 0.055,
    smoothScroll: 1.05,
    projectScrub: 0.7,
    transitionScroll: 900,
    introProgressTick: 0.05,
    tagStagger: 0.045,
    headingStagger: 0.028,
    marquee: 24,
    orbit: 32,
  },
  ease: {
    standard: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
    cinematic: [0.76, 0, 0.24, 1] as [number, number, number, number],
    css: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  },
  distance: {
    heading: 38,
    parallax: 64,
    magnetic: 8,
    cursorLag: 0.16,
    maxHeadingSkew: 4,
    cursorGrow: 1.75,
  },
  breakpoint: {
    touch: 768,
    cursor: 769,
  },
  selector: {
    animatedHeading: ".section-heading h2",
    projectCards: ".project-card",
    horizontalTrack: ".project-grid.project-grid-horizontal",
    horizontalViewport: ".project-gallery",
    transitionCode: ".transition-code",
    transitionBars: ".transition-bar",
    transitionLabel: ".transition-label",
  },
} as const;

export type MotionDuration = keyof typeof motionConfig.duration;

export function motionSeconds(duration: MotionDuration, reducedMotion: boolean): number {
  if (reducedMotion) return 0;
  const intensityScale = motionConfig.intensity === "balanced" ? 0.78 : 1;
  return motionConfig.duration[duration] * intensityScale;
}
