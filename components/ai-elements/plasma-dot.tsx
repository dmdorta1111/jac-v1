"use client";

import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import type { CSSProperties, HTMLAttributes } from "react";

/**
 * PlasmaDot Component
 *
 * A surreal, multi-layered radial gradient glow effect that sits behind the prompt input.
 * Creates a visually stunning plasma appearance with GSAP-powered ethereal animations.
 *
 * Features:
 * - Rectangle-proportional sizing to match prompt container
 * - GSAP-powered morphing, drifting, and breathing animations
 * - CSS pulsating slowed by 75% (16s cycle)
 * - Full dark mode support with enhanced opacity
 * - Respects prefers-reduced-motion for accessibility
 * - GPU-accelerated blur and transform properties
 *
 * Color Gradient (Center → Outer):
 * - Core: #ff3300 (Pure Red-Orange) - Plasma energy center
 * - Inner: #ff5500 (Bright Orange-Red) - Intensity ring
 * - Mid: #ff6b00 (Orange) - Primary glow
 * - Outer: #ff9500 (Golden Orange) - Transition
 * - Fade: #ffb347 (Light Orange) - Soft outer rim
 * - Edge: transparent - Clean fadeout
 */
export type PlasmaDotProps = HTMLAttributes<HTMLDivElement>;

export const PlasmaDot = ({ className, style, ...props }: PlasmaDotProps) => {
  const plasmaRef = useRef<HTMLDivElement>(null);

  // GSAP ethereal movement animations
  useEffect(() => {
    if (!plasmaRef.current) return;

    const plasma = plasmaRef.current;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Organic drifting motion - slow, hypnotic movement
    gsap.to(plasma, {
      x: "random(-15, 15)",
      y: "random(-10, 10)",
      duration: "random(8, 12)",
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      repeatRefresh: true, // Get new random values each cycle
    });

    // Subtle rotation for living energy feel
    gsap.to(plasma, {
      rotation: "random(-5, 5)",
      duration: "random(10, 15)",
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      repeatRefresh: true,
    });

    // Morphing scale distortion (breathing + organic shape)
    gsap.to(plasma, {
      scaleX: "random(0.95, 1.08)",
      scaleY: "random(0.92, 1.05)",
      duration: "random(6, 10)",
      ease: "power1.inOut",
      repeat: -1,
      yoyo: true,
      repeatRefresh: true,
    });

    // Blur intensity variation for depth
    gsap.to(plasma, {
      filter: "blur(random(35, 55)px)",
      duration: "random(5, 8)",
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      repeatRefresh: true,
    });

    // Cleanup
    return () => {
      gsap.killTweensOf(plasma);
    };
  }, []);

  // Enhanced red-orange gradient with elliptical shape to match container
  const plasmaStyle: CSSProperties = {
    background: `radial-gradient(ellipse 70% 50%,
      #ff3300 0%,
      #ff5500 15%,
      #ff6b00 30%,
      #ff9500 50%,
      #ffb347 70%,
      rgba(255, 179, 71, 0.3) 85%,
      transparent 100%
    )`,
    ...style,
  };

  return (
    <div
      ref={plasmaRef}
      /**
       * Layout & Positioning
       * - position: absolute with inset-0 fills parent container
       * - z-index -1 keeps glow behind form inputs
       * - Elliptical shape proportional to rectangular container
       * - pointer-events-none prevents interference with form interactions
       */
      className={cn(
        // Positioning - fill parent container, stay behind
        "pointer-events-none absolute inset-0 -z-10",

        // Size proportional to container - WIDTH +100%
        "w-[100%] h-[70%]",
        // Center within parent
        "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",

        // Shape - elliptical to match rectangular container
        "rounded-[50%]",

        // Blur for soft glow edges (GSAP also animates this)
        "blur-[45px]",

        // Opacity & Dark Mode - REDUCED BY 75% total
        "opacity-[0.175] dark:opacity-20",

        // CSS Animations - SLOWED BY 75% (4s → 16s)
        "block animate-plasma-pulse-slow",
        // Desktop: Add floating animation
        "lg:animate-plasma-pulse-float-slow",

        className
      )}
      style={plasmaStyle}
      {...props}
    />
  );
};

/**
 * Styling Considerations:
 * - Parent container must use relative positioning
 * - Z-index -1 keeps glow behind form inputs
 * - Elliptical shape (w-101%, h-140%) matches rectangular container
 * - GSAP animations: drift, rotation, scale morph, blur variation
 * - CSS animation slowed 75%: 16s pulse cycle
 * - Dark mode: opacity increases for better visibility
 * - GPU-accelerated via transform and filter properties
 */
