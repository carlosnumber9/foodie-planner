import { describe, expect, it, vi } from "vitest";

import { animateEntrance, prefersReducedMotion } from "./motion";

describe("motion foundation", () => {
  it.each([
    { matches: true, expected: true },
    { matches: false, expected: false },
  ])("reads reduced motion preference", ({ matches, expected }) => {
    expect(prefersReducedMotion({ matches })).toBe(expected);
  });

  it("does not animate when reduced motion is requested", () => {
    const animate = vi.fn();
    const element = {} as HTMLElement;

    const cleanup = animateEntrance(element, { reducedMotion: true, animate });

    expect(animate).not.toHaveBeenCalled();
    expect(cleanup).toBeTypeOf("function");
  });

  it("creates and cleans up an entrance animation", () => {
    const kill = vi.fn();
    const animate = vi.fn().mockReturnValue({ kill });
    const reset = vi.fn();
    const element = {} as HTMLElement;

    const cleanup = animateEntrance(element, { reducedMotion: false, animate, reset });
    cleanup();

    expect(animate).toHaveBeenCalledWith(element, {
      autoAlpha: 0,
      duration: 0.28,
      ease: "power2.out",
      y: 8,
    });
    expect(kill).toHaveBeenCalledOnce();
    expect(reset).toHaveBeenCalledWith(element);
  });
});
