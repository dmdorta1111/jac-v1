import { useEffect, useRef } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import gsap from "gsap";

/**
 * Hook for smooth theme transition animations using GSAP
 * Fades out content, transitions theme, then fades in with staggered elements
 */
export function useThemeTransition() {
  const { resolvedTheme } = useTheme();
  const animatingRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // Prevent multiple animations from running simultaneously
    if (animatingRef.current) return;
    animatingRef.current = true;

    // Kill any existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Create new timeline for theme transition
    const tl = gsap.timeline({
      onComplete: () => {
        animatingRef.current = false;
      }
    });

    timelineRef.current = tl;

    // Animation sequence:
    // 1. Fade out main content
    tl.to("body", {
      opacity: 0.7,
      duration: 0.3,
      ease: "power2.inOut"
    }, 0);

    // 2. Transition colors (theme change already happened via CSS)
    tl.to("body", {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
      delay: 0.1
    });

    // 3. Stagger animate visible elements back in
    tl.to(
      "[data-theme-animated]",
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
        stagger: 0.05,
        force3D: true
      },
      0.2
    );

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [resolvedTheme]);
}
