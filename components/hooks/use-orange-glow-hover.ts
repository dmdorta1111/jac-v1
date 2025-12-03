"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * useOrangeGlowHover Hook
 *
 * Adds a subtle orange glowing border effect on hover to elements.
 * Uses GSAP for smooth box-shadow animations.
 *
 * @param selector - CSS selector for elements to apply the effect to
 * @param options - Configuration options
 */
export interface OrangeGlowOptions {
  /** Glow color (default: orange-500) */
  color?: string;
  /** Glow intensity 0-1 (default: 0.4) */
  intensity?: number;
  /** Animation duration in seconds (default: 0.3) */
  duration?: number;
  /** Blur radius in pixels (default: 12) */
  blur?: number;
  /** Spread radius in pixels (default: 2) */
  spread?: number;
}

export function useOrangeGlowHover(
  selector: string,
  options: OrangeGlowOptions = {}
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const {
      color = "249, 115, 22", // orange-500 RGB
      intensity = 0.4,
      duration = 0.3,
      blur = 12,
      spread = 2,
    } = options;

    // Find elements matching selector
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Blue glow default state (will be restored on mouse leave)
    const blueColor = "59, 130, 246";
    const blueGlow = `0 0 8px 1px rgba(${blueColor}, 0.25), 0 4px 12px rgba(${blueColor}, 0.15)`;

    // Orange glow for hover state - REDUCED BY 50%
    const orangeGlow = `0 0 ${blur}px ${spread}px rgba(${color}, ${intensity * 0.5}), 0 0 ${blur * 2}px ${spread}px rgba(${color}, ${intensity * 0.25})`;

    const handleMouseEnter = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      if (prefersReducedMotion) {
        el.style.boxShadow = orangeGlow;
        return;
      }
      // Smooth cross-fade: blue fades out, orange fades in
      gsap.to(el, {
        boxShadow: orangeGlow,
        duration: duration * 1.2,
        ease: "sine.inOut",
      });
    };

    const handleMouseLeave = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      if (prefersReducedMotion) {
        el.style.boxShadow = blueGlow;
        return;
      }
      // Smooth cross-fade: orange fades out, blue fades in
      gsap.to(el, {
        boxShadow: blueGlow,
        duration: duration * 1.2,
        ease: "sine.inOut",
      });
    };

    // Set initial blue glow state
    elements.forEach((el) => {
      gsap.set(el, { boxShadow: blueGlow });
    });

    // Attach event listeners
    elements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    // Cleanup
    return () => {
      elements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
        gsap.killTweensOf(el);
      });
    };
  }, [selector, options]);

  return containerRef;
}
