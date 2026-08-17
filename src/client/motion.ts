import { gsap } from "gsap";

interface MotionPreference {
  matches: boolean;
}

interface AnimationHandle {
  kill(): void;
}

type EntranceAnimator = (
  element: HTMLElement,
  properties: { autoAlpha: number; duration: number; ease: string; y: number },
) => AnimationHandle;

export function prefersReducedMotion(
  preference?: MotionPreference,
): boolean {
  if (preference !== undefined) {
    return preference.matches;
  }
  return typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

export function animateEntrance(
  element: HTMLElement,
  options: {
    reducedMotion?: boolean;
    animate?: EntranceAnimator;
    reset?: (element: HTMLElement) => void;
  } = {},
): () => void {
  const reducedMotion = options.reducedMotion ?? prefersReducedMotion();
  if (reducedMotion) {
    return () => undefined;
  }

  const defaultAnimate: EntranceAnimator = (target, properties) => {
    const tween = gsap.from(target, properties);
    return { kill: () => void tween.kill() };
  };
  const animate = options.animate ?? defaultAnimate;
  const animation = animate(element, {
    autoAlpha: 0,
    duration: 0.28,
    ease: "power2.out",
    y: 8,
  });
  const reset = options.reset ?? ((target) => void gsap.set(target, { clearProps: "opacity,visibility,transform" }));
  return () => {
    animation.kill();
    reset(element);
  };
}
