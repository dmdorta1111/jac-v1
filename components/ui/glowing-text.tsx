"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface GlowingTextProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  duration?: number;
  intensity?: number;
}

/**
 * A text component with a subtle animated glow effect using GSAP.
 * The glow pulses softly, creating an elegant ambient effect.
 */
export function GlowingText({
  children,
  className,
  glowColor = "rgba(255, 255, 255, 0.6)",
  duration = 3,
  intensity = 1,
}: GlowingTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    // Check for reduced motion preference (with SSR safety)
    const prefersReducedMotion = typeof window !== 'undefined'
      && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReducedMotion) return;

    // Create subtle pulsing glow animation
    const tl = gsap.timeline({ repeat: -1, yoyo: true });

    tl.to(textRef.current, {
      textShadow: `0 0 ${10 * intensity}px ${glowColor}, 0 0 ${20 * intensity}px ${glowColor}, 0 0 ${30 * intensity}px ${glowColor}`,
      duration: duration,
      ease: "sine.inOut",
    });

    return () => {
      tl.kill();
    };
  }, [glowColor, duration, intensity]);

  return (
    <span
      ref={textRef}
      className={cn("inline-block", className)}
      style={{
        textShadow: `0 0 ${5 * intensity}px ${glowColor}`,
      }}
    >
      {children}
    </span>
  );
}

export default GlowingText;
