"use client";

import { useEffect } from "react";
import { gsap } from "gsap";

/**
 * useBlueGlowFade Hook
 *
 * Adds a subtle blue glow under elements that fades out on hover.
 * Uses GSAP for smooth box-shadow animations.
 *
 * @param selector - CSS selector for elements to apply the effect to
 * @param options - Configuration options
 */
export interface BlueGlowFadeOptions {
  /** Glow color RGB (default: "59, 130, 246" - blue-500) */
  color?: string;
  /** Glow intensity 0-1 (default: 0.3) */
  intensity?: number;
  /** Animation duration in seconds (default: 0.3) */
  duration?: number;
  /** Blur radius in pixels (default: 10) */
  blur?: number;
  /** Spread radius in pixels (default: 2) */
  spread?: number;
}

export function useBlueGlowFade(
  selector: string,
  options: BlueGlowFadeOptions = {}
) {
  useEffect(() => {
    const {
      color = "59, 130, 246", // blue-500 RGB
      intensity = 0.3,
      duration = 0.3,
      blur = 10,
      spread = 2,
    } = options;

    // Find elements matching selector
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Default glow state
    const glowShadow = `0 0 ${blur}px ${spread}px rgba(${color}, ${intensity}), 0 ${blur/2}px ${blur*1.5}px rgba(${color}, ${intensity * 0.6})`;
    const noGlow = "0 0 0 0 rgba(0,0,0,0)";

    // Set initial glow state
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (prefersReducedMotion) {
        htmlEl.style.boxShadow = glowShadow;
        return;
      }
      gsap.set(htmlEl, { boxShadow: glowShadow });
    });

    const handleMouseEnter = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      if (prefersReducedMotion) {
        el.style.boxShadow = noGlow;
        return;
      }
      gsap.to(el, {
        boxShadow: noGlow,
        duration,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      if (prefersReducedMotion) {
        el.style.boxShadow = glowShadow;
        return;
      }
      gsap.to(el, {
        boxShadow: glowShadow,
        duration,
        ease: "power2.in",
      });
    };

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
}
