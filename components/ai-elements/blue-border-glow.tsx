"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

/**
 * BlueBorderGlow Component
 *
 * An ethereal blue glowing border effect that wraps around a container.
 * Creates a magical, pulsing aura with GSAP-powered animations.
 *
 * Features:
 * - Smooth pulsing blue glow with varying intensity
 * - Multi-layered box-shadow for depth
 * - Organic breathing animation
 * - Respects prefers-reduced-motion
 * - GPU-accelerated animations
 */
export type BlueBorderGlowProps = HTMLAttributes<HTMLDivElement> & {
  /** Whether the glow is active (default: true) */
  active?: boolean;
  /** Glow intensity multiplier (default: 1) */
  intensity?: number;
};

export const BlueBorderGlow = ({
  className,
  active = true,
  intensity = 1,
  children,
  ...props
}: BlueBorderGlowProps) => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!glowRef.current || !active) return;

    const glow = glowRef.current;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Base blue colors
    const blueLight = `rgba(59, 130, 246, ${0.225 * intensity})`; // blue-500 - DOUBLED AGAIN
    const blueMedium = `rgba(37, 99, 235, ${0.09375 * intensity})`; // blue-600
    const blueBright = `rgba(96, 165, 250, ${0.225 * intensity})`; // blue-400 - DOUBLED

    // Pulsing glow animation - breathing effect
    const glowTimeline = gsap.timeline({ repeat: -1, yoyo: true });

    // SLOWED BY 100% (doubled durations)
    glowTimeline.to(glow, {
      boxShadow: `
        0 0 10px ${blueLight},
        0 0 20px ${blueLight},
        0 0 30px ${blueMedium},
        0 0 40px ${blueMedium},
        inset 0 0 10px ${blueLight}
      `,
      duration: 4,
      ease: "sine.inOut",
    }).to(glow, {
      boxShadow: `
        0 0 15px ${blueMedium},
        0 0 30px ${blueMedium},
        0 0 45px ${blueBright},
        0 0 60px ${blueBright},
        inset 0 0 15px ${blueMedium}
      `,
      duration: 5,
      ease: "sine.inOut",
    }).to(glow, {
      boxShadow: `
        0 0 8px ${blueLight},
        0 0 16px ${blueLight},
        0 0 24px ${blueMedium},
        0 0 32px ${blueMedium},
        inset 0 0 8px ${blueLight}
      `,
      duration: 3.6,
      ease: "sine.inOut",
    });

    // Subtle border color shift - SLOWED BY 100%
    gsap.to(glow, {
      borderColor: `rgba(96, 165, 250, ${0.6 * intensity})`,
      duration: 6,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    // Cleanup
    return () => {
      glowTimeline.kill();
      gsap.killTweensOf(glow);
    };
  }, [active, intensity]);

  return (
    <div
      ref={glowRef}
      className={cn(
        // Border styling - INVISIBLE
        "border-2 border-transparent",
        "rounded-2xl",
        // Initial glow state - INCREASED BY 50%
        "shadow-[0_0_10px_rgba(59,130,246,0.05625),0_0_20px_rgba(59,130,246,0.0375),inset_0_0_10px_rgba(59,130,246,0.01875)]",
        // Transition for smooth initial state
        "transition-shadow duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Usage:
 * Wrap your content with BlueBorderGlow:
 *
 * <BlueBorderGlow>
 *   <YourContent />
 * </BlueBorderGlow>
 *
 * The blue glow will pulse around the container,
 * creating an ethereal magical border effect.
 */
