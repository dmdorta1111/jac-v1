"use client";

import { useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

/**
 * PlasmaSparkles Component
 *
 * Fiery streak sparks that emanate from the center of the plasma glow,
 * creating a blazing forge atmosphere with comet-tail particles.
 *
 * Features:
 * - 135 particles with fast continuous spawning
 * - Warm spark colors (whites, yellows, ambers, oranges)
 * - Tiny comet-shaped streaks (0.5-1.25px × 4-8px)
 * - Motion blur and elongated glow trails
 * - 100% faster animation (1.5-3s duration)
 * - 50% reduced travel distance (30-75px)
 * - 200% wider emanation area (-120 to 120px)
 * - Rapid twinkling for spark flicker effect
 * - Respects prefers-reduced-motion
 * - GPU-accelerated animations
 */
export type PlasmaSparklesProps = HTMLAttributes<HTMLDivElement> & {
  /** Number of particles to maintain (default: 12) */
  particleCount?: number;
  /** Whether particles are active (default: true) */
  active?: boolean;
};

// Spark color palette - warm fiery colors (yellows, oranges, whites)
const SPARKLE_COLORS = [
  "#ffffff", // Pure white - hot spark
  "#fffbeb", // Warm white
  "#fef3c7", // Amber-100
  "#fde68a", // Amber-200
  "#fcd34d", // Amber-300
  "#fbbf24", // Amber-400
  "#f59e0b", // Amber-500
  "#ffedd5", // Orange-100
  "#fed7aa", // Orange-200
  "#fdba74", // Orange-300
  "#fb923c", // Orange-400
  "#f97316", // Orange-500
];

export const PlasmaSparkles = ({
  className,
  particleCount = 12,
  active = true,
  ...props
}: PlasmaSparklesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const animationsRef = useRef<gsap.core.Tween[]>([]);

  // Create a single particle animation with streak effect
  const animateParticle = useCallback((particle: HTMLDivElement, index: number) => {
    if (!particle || !active) return;

    // WIDENED: Emanation area 200% wider (-40,40 → -120,120)
    const startX = gsap.utils.random(-120, 120);
    const startY = gsap.utils.random(-120, 120);

    // REDUCED: Travel distance halved (60-150 → 30-75)
    const angle = gsap.utils.random(0, 360);
    const distance = gsap.utils.random(30, 75);
    const endX = Math.cos(angle * Math.PI / 180) * distance;
    const endY = Math.sin(angle * Math.PI / 180) * distance;

    // Random color from palette
    const color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];

    // REDUCED: Particle size 50% smaller (1-2.5 → 0.5-1.25)
    const size = gsap.utils.random(0.5, 1.25);

    // STREAK: Calculate angle for elongated particle rotation
    const streakAngle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
    const streakLength = gsap.utils.random(4, 8); // 50% smaller streak for comet tail

    // Set initial state with streak styling
    gsap.set(particle, {
      x: startX,
      y: startY,
      scale: 0,
      opacity: 0,
      backgroundColor: color,
      width: streakLength,
      height: size,
      rotation: streakAngle,
      borderRadius: '50% 20% 20% 50%', // Comet shape - round front, tapered back
      boxShadow: `0 0 ${size * 3}px ${color}, ${streakLength * 0.5}px 0 ${streakLength}px ${color}`,
      filter: `blur(${gsap.utils.random(0.3, 0.8)}px)`, // Motion blur effect
    });

    // SPEED: Duration halved (3-6s → 1.5-3s) = 100% faster
    const duration = gsap.utils.random(1.5, 3);
    const delay = index * 0.08 + gsap.utils.random(0, 0.5); // Faster stagger

    const tween = gsap.to(particle, {
      x: endX,
      y: endY,
      scale: gsap.utils.random(0.5, 1.2),
      opacity: 0,
      duration: duration,
      delay: delay,
      ease: "power2.out", // Faster deceleration for spark feel
      onStart: () => {
        // Quick bright flash at start
        gsap.to(particle, {
          opacity: gsap.utils.random(0.7, 1),
          scale: 1,
          duration: 0.2, // Faster fade in
          ease: "power2.out",
        });
      },
      onComplete: () => {
        // Restart the animation with new random values
        if (active) {
          animateParticle(particle, 0);
        }
      },
    });

    // Faster twinkling for spark flicker
    gsap.to(particle, {
      opacity: gsap.utils.random(0.4, 1),
      duration: gsap.utils.random(0.1, 0.25), // Faster flicker
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: delay,
    });

    animationsRef.current.push(tween);
  }, [active]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !active) return;

    // Create particle elements
    const container = containerRef.current;
    particlesRef.current = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full pointer-events-none';
      particle.style.left = '50%';
      particle.style.top = '50%';
      particle.style.transform = 'translate(-50%, -50%)';
      container.appendChild(particle);
      particlesRef.current.push(particle);
    }

    // Start animations with stagger
    particlesRef.current.forEach((particle, index) => {
      animateParticle(particle, index);
    });

    // Cleanup
    return () => {
      animationsRef.current.forEach(tween => tween.kill());
      animationsRef.current = [];
      particlesRef.current.forEach(particle => particle.remove());
      particlesRef.current = [];
    };
  }, [particleCount, active, animateParticle]);

  return (
    <div
      ref={containerRef}
      className={cn(
        // Positioning - same as PlasmaDot, overlay on top
        "pointer-events-none absolute inset-0 z-0",
        // Center the particle origin
        "flex items-center justify-center",
        // Overflow visible so particles can float beyond container
        "overflow-visible",
        className
      )}
      {...props}
    />
  );
};

/**
 * Usage:
 * Place alongside PlasmaDot in the same container:
 *
 * <div className="relative">
 *   <PlasmaDot />
 *   <PlasmaSparkles particleCount={135} />
 *   <YourContent />
 * </div>
 *
 * The streak sparks emanate from center of the orange plasma glow,
 * creating a blazing forge atmosphere with comet-tail particles.
 */
