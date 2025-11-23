# Shadcraft Pro Styling Implementation Plan

## Overview

This document provides a comprehensive styling implementation plan for the JAC application to match the Shadcraft Pro design system. It includes complete rewrites of configuration files and detailed component-by-component styling guides.

---

## Table of Contents

1. [globals.css Complete Rewrite](#1-globalscss-complete-rewrite)
2. [tailwind.config.ts Updates](#2-tailwindconfigts-updates)
3. [Component Styling Guide](#3-component-styling-guide)
4. [Implementation Priority Order](#4-implementation-priority-order)

---

## 1. globals.css Complete Rewrite

Replace the entire contents of `app/globals.css` with:

```css
@import "tailwindcss";

@plugin "tailwindcss-animate";

@custom-variant dark (&:is(.dark *));

/* =============================================================================
   SHADCRAFT PRO DESIGN SYSTEM - CSS Variables
   ============================================================================= */

:root {
  /* --------------------------------------------------------------------------
     Core Colors - Light Mode
     -------------------------------------------------------------------------- */
  --background: #ffffff;
  --foreground: #09090b;

  /* Surface Colors */
  --surface: #f5f5f5;
  --surface-secondary: #f4f4f5;

  /* Card & Popover */
  --card: #fafafa;
  --card-foreground: #09090b;
  --popover: #ffffff;
  --popover-foreground: #09090b;

  /* Primary - Shadcraft Blue */
  --primary: #155dfc;
  --primary-foreground: #ffffff;

  /* Secondary */
  --secondary: #f4f4f5;
  --secondary-foreground: #18181b;

  /* Muted */
  --muted: #f4f4f5;
  --muted-foreground: #71717a;

  /* Accent - for highlights and focus */
  --accent: #f4f4f5;
  --accent-foreground: #18181b;

  /* Accent Color (Green for success) */
  --accent-color: #22c55e;
  --accent-color-foreground: #ffffff;

  /* Destructive */
  --destructive: #e7000b;
  --destructive-foreground: #ffffff;

  /* Border & Input */
  --border: #e4e4e7;
  --input: #e4e4e7;
  --ring: #155dfc;

  /* Chart Colors */
  --chart-1: #155dfc;
  --chart-2: #297eff;
  --chart-3: #22c55e;
  --chart-4: #f59e0b;
  --chart-5: #ef4444;

  /* Sidebar */
  --sidebar: #fafafa;
  --sidebar-foreground: #09090b;
  --sidebar-primary: #155dfc;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #f4f4f5;
  --sidebar-accent-foreground: #18181b;
  --sidebar-border: #e4e4e7;
  --sidebar-ring: #155dfc;

  /* --------------------------------------------------------------------------
     Typography
     -------------------------------------------------------------------------- */
  --font-sans: "Geist", "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-serif: "Source Serif 4", Georgia, serif;
  --font-mono: "Fragment Mono", "JetBrains Mono", "Fira Code", monospace;

  /* Letter Spacing */
  --tracking-normal: 0em;
  --tracking-tight: -0.025em;
  --tracking-tighter: -0.05em;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;

  /* --------------------------------------------------------------------------
     Spacing
     -------------------------------------------------------------------------- */
  --spacing: 0.25rem;
  --spacing-xs: 6px;
  --spacing-sm: 10px;
  --spacing-md: 14px;
  --spacing-lg: 28px;
  --spacing-xl: 30px;
  --spacing-2xl: 40px;
  --spacing-3xl: 60px;

  /* --------------------------------------------------------------------------
     Border Radius
     -------------------------------------------------------------------------- */
  --radius: 0.625rem; /* 10px - Default */
  --radius-sm: 0.375rem; /* 6px */
  --radius-md: 0.5rem; /* 8px */
  --radius-lg: 0.75rem; /* 12px */
  --radius-xl: 1rem; /* 16px */
  --radius-full: 9999px;

  /* --------------------------------------------------------------------------
     Shadows - Light Mode
     -------------------------------------------------------------------------- */
  --shadow-color: 0 0% 0%;
  --shadow-opacity: 0.1;
  --shadow-blur: 3px;
  --shadow-spread: 0px;
  --shadow-offset-x: 0px;
  --shadow-offset-y: 1px;

  --shadow-2xs: 0 1px 2px 0px hsl(0 0% 0% / 0.03);
  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.04);
  --shadow-sm: 0 2px 4px 0px hsl(0 0% 0% / 0.06);
  --shadow: 0 2px 4px 0px hsl(0 0% 0% / 0.06);
  --shadow-md: 0 4px 8px -2px hsl(0 0% 0% / 0.08), 0 2px 4px -2px hsl(0 0% 0% / 0.04);
  --shadow-lg: 0 12px 24px -4px hsl(0 0% 0% / 0.10), 0 4px 8px -2px hsl(0 0% 0% / 0.04);
  --shadow-xl: 0 24px 48px -8px hsl(0 0% 0% / 0.12), 0 8px 16px -4px hsl(0 0% 0% / 0.04);
  --shadow-2xl: 0 32px 64px -12px hsl(0 0% 0% / 0.14);
}

.dark {
  /* --------------------------------------------------------------------------
     Core Colors - Dark Mode
     -------------------------------------------------------------------------- */
  --background: #0a0a0a;
  --foreground: #ffffff;

  /* Surface Colors */
  --surface: #18181b;
  --surface-secondary: #27272a;

  /* Card & Popover */
  --card: #18181b;
  --card-foreground: #ffffff;
  --popover: #18181b;
  --popover-foreground: #ffffff;

  /* Primary - Maintained */
  --primary: #155dfc;
  --primary-foreground: #ffffff;

  /* Secondary */
  --secondary: #27272a;
  --secondary-foreground: #ffffff;

  /* Muted */
  --muted: #27272a;
  --muted-foreground: #9ca3af;

  /* Accent */
  --accent: #27272a;
  --accent-foreground: #ffffff;

  /* Accent Color (Green) */
  --accent-color: #22c55e;
  --accent-color-foreground: #ffffff;

  /* Destructive - Lighter for dark mode visibility */
  --destructive: #ff6467;
  --destructive-foreground: #0a0a0a;

  /* Border & Input */
  --border: #3a3a3d;
  --input: #3a3a3d;
  --ring: #155dfc;

  /* Chart Colors */
  --chart-1: #297eff;
  --chart-2: #155dfc;
  --chart-3: #22c55e;
  --chart-4: #f59e0b;
  --chart-5: #ff6467;

  /* Sidebar */
  --sidebar: #0a0a0a;
  --sidebar-foreground: #ffffff;
  --sidebar-primary: #155dfc;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #27272a;
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: #3a3a3d;
  --sidebar-ring: #155dfc;

  /* --------------------------------------------------------------------------
     Shadows - Dark Mode (more subtle)
     -------------------------------------------------------------------------- */
  --shadow-2xs: 0 1px 2px 0px hsl(0 0% 0% / 0.20);
  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
  --shadow-sm: 0 2px 4px 0px hsl(0 0% 0% / 0.30);
  --shadow: 0 2px 4px 0px hsl(0 0% 0% / 0.30);
  --shadow-md: 0 4px 8px -2px hsl(0 0% 0% / 0.35), 0 2px 4px -2px hsl(0 0% 0% / 0.20);
  --shadow-lg: 0 12px 24px -4px hsl(0 0% 0% / 0.40), 0 4px 8px -2px hsl(0 0% 0% / 0.20);
  --shadow-xl: 0 24px 48px -8px hsl(0 0% 0% / 0.45), 0 8px 16px -4px hsl(0 0% 0% / 0.25);
  --shadow-2xl: 0 32px 64px -12px hsl(0 0% 0% / 0.50);
}

/* =============================================================================
   TAILWIND v4 THEME INLINE DIRECTIVE
   ============================================================================= */

@theme inline {
  /* Colors */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-surface-secondary: var(--surface-secondary);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent-color: var(--accent-color);
  --color-accent-color-foreground: var(--accent-color-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  /* Chart Colors */
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  /* Sidebar */
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* Typography */
  --font-sans: var(--font-sans);
  --font-serif: var(--font-serif);
  --font-mono: var(--font-mono);

  /* Spacing */
  --spacing: var(--spacing);

  /* Border Radius */
  --radius: var(--radius);
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);

  /* Shadows */
  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);

  /* Letter Spacing */
  --tracking-normal: var(--tracking-normal);
  --tracking-tight: var(--tracking-tight);
  --tracking-tighter: var(--tracking-tighter);
  --tracking-wide: var(--tracking-wide);
  --tracking-wider: var(--tracking-wider);
  --tracking-widest: var(--tracking-widest);
}

/* =============================================================================
   BASE STYLES
   ============================================================================= */

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html {
  scroll-behavior: smooth;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}

html::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

body {
  font-family: var(--font-sans);
  min-height: 100vh;
  background-color: var(--background);
  color: var(--foreground);
  transition: background-color 0.2s ease, color 0.2s ease;
  letter-spacing: var(--tracking-normal);
}

/* =============================================================================
   SCROLLBAR STYLING
   ============================================================================= */

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--surface);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--muted-foreground);
}

/* =============================================================================
   FOCUS & SELECTION STYLES
   ============================================================================= */

*:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

::selection {
  background: var(--primary);
  color: var(--primary-foreground);
}

/* =============================================================================
   TAILWIND BASE LAYER
   ============================================================================= */

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* =============================================================================
   ANIMATION KEYFRAMES
   ============================================================================= */

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes scale-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(21, 93, 252, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(21, 93, 252, 0.6);
  }
}

@keyframes typing-bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* =============================================================================
   ANIMATION UTILITY CLASSES
   ============================================================================= */

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

.animate-fade-out {
  animation: fade-out 0.2s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.animate-slide-down {
  animation: slide-down 0.2s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}

.animate-scale-out {
  animation: scale-out 0.2s ease-out;
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    var(--surface) 25%,
    var(--border) 50%,
    var(--surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* =============================================================================
   SHIMMER & LOADING EFFECTS
   ============================================================================= */

.shimmer {
  background: linear-gradient(
    90deg,
    var(--surface) 25%,
    var(--border) 50%,
    var(--surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.typing-dot {
  animation: typing-bounce 1.4s infinite ease-in-out both;
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }

/* =============================================================================
   GLOW EFFECTS
   ============================================================================= */

.glow-effect {
  position: relative;
}

.glow-effect::before {
  content: "";
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #297eff, #155dfc, #0d47a1);
  border-radius: inherit;
  opacity: 0;
  z-index: -1;
  filter: blur(12px);
  transition: opacity 0.3s ease;
}

.glow-effect:hover::before,
.glow-effect:focus-within::before {
  opacity: 0.6;
}

.glow-effect.active::before {
  opacity: 0.8;
  animation: pulse-glow 1.5s ease-in-out infinite;
}

/* =============================================================================
   GLASS EFFECT
   ============================================================================= */

.glass {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.dark .glass {
  background: rgba(0, 0, 0, 0.2);
}

/* =============================================================================
   UTILITY CLASSES
   ============================================================================= */

.Models {
  width: 100vw;
  height: 100vh;
  background-color: var(--background);
  transition: background-color 0.2s ease;
}

/* Color Picker Override */
.picker .react-colorful {
  margin-bottom: 28px;
  width: 120px;
  height: 120px;
}

/* =============================================================================
   REDUCED MOTION SUPPORT
   ============================================================================= */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .typing-dot,
  .shimmer,
  .glow-effect::before,
  .animate-float,
  .animate-pulse,
  .animate-ping,
  .animate-bounce,
  .animate-pulse-glow {
    animation: none !important;
  }
}

/* =============================================================================
   STREAMDOWN SOURCE
   ============================================================================= */

@source "../node_modules/streamdown/dist/index.js";
```

---

## 2. tailwind.config.ts Updates

Replace the theme.extend section in `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Shadcraft Pro Primary Brand Colors
        "shadcraft-primary": "#155dfc",
        "shadcraft-secondary": "#297eff",
        "shadcraft-accent": "#22c55e",

        // Extended color palette
        surface: {
          DEFAULT: "var(--surface)",
          secondary: "var(--surface-secondary)",
        },
      },
      spacing: {
        // Shadcraft Pro Spacing Scale
        "1.5": "6px",   // xs
        "2.5": "10px",  // sm
        "3.5": "14px",  // md
        "7": "28px",    // lg
        "7.5": "30px",  // xl
        "10": "40px",   // 2xl
        "15": "60px",   // 3xl
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
      },
      borderRadius: {
        // Shadcraft Pro Border Radius
        DEFAULT: "0.625rem",  // 10px
        sm: "0.375rem",       // 6px
        md: "0.5rem",         // 8px
        lg: "0.75rem",        // 12px
        xl: "1rem",           // 16px
        "2xl": "1.25rem",     // 20px
        "3xl": "1.5rem",      // 24px
      },
      boxShadow: {
        // Shadcraft Pro Shadow Presets
        "2xs": "0 1px 2px 0px hsl(0 0% 0% / 0.03)",
        "xs": "0 1px 3px 0px hsl(0 0% 0% / 0.04)",
        "sm": "0 2px 4px 0px hsl(0 0% 0% / 0.06)",
        DEFAULT: "0 2px 4px 0px hsl(0 0% 0% / 0.06)",
        "md": "0 4px 8px -2px hsl(0 0% 0% / 0.08), 0 2px 4px -2px hsl(0 0% 0% / 0.04)",
        "lg": "0 12px 24px -4px hsl(0 0% 0% / 0.10), 0 4px 8px -2px hsl(0 0% 0% / 0.04)",
        "xl": "0 24px 48px -8px hsl(0 0% 0% / 0.12), 0 8px 16px -4px hsl(0 0% 0% / 0.04)",
        "2xl": "0 32px 64px -12px hsl(0 0% 0% / 0.14)",
        // Glow effects
        "glow-sm": "0 0 10px rgba(21, 93, 252, 0.3)",
        "glow-md": "0 0 20px rgba(21, 93, 252, 0.4)",
        "glow-lg": "0 0 30px rgba(21, 93, 252, 0.5)",
        "glow-pulse": "0 0 40px rgba(21, 93, 252, 0.6)",
        "inner-glow": "inset 0 0 20px rgba(21, 93, 252, 0.1)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        // Consistent typography scale
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
      screens: {
        xs: "390px",
        sm: "640px",
        md: "810px",
        lg: "1024px",
        xl: "1200px",
        "2xl": "1400px",
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "fade-in-slow": "fade-in 0.4s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.2s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "scale-out": "scale-out 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 1.5s linear infinite",
        "bounce-subtle": "bounce-subtle 0.5s ease-out",
        "float": "float 3s ease-in-out infinite",
        "spin-slow": "spin 2s linear infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "scale-out": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.95)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(21, 93, 252, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(21, 93, 252, 0.6)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "ease-out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
      transitionDuration: {
        "150": "150ms",
        "200": "200ms",
        "300": "300ms",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #155dfc 0%, #297eff 100%)",
        "gradient-surface": "linear-gradient(135deg, var(--surface) 0%, var(--surface-secondary) 100%)",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
```

---

## 3. Component Styling Guide

### 3.1 Base UI Components (components/ui/)

---

#### 3.1.1 button.tsx

**Current Issues:**
- Border radius using `rounded-md` instead of default 10px
- Missing proper shadow on default variant
- Focus ring opacity could be improved

**Updated Styling:**

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-[10px] text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
        outline:
          "border border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:scale-[0.98]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2.5",
        sm: "h-9 rounded-lg px-3.5 gap-1.5",
        lg: "h-11 rounded-xl px-6",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

**Key Changes:**
- `rounded-[10px]` - Default Shadcraft radius
- `gap-2.5` - 10px gap between icon and text
- `duration-200` - Faster, snappier transitions
- `active:scale-[0.98]` - Subtle press feedback
- `focus-visible:ring-offset-background` - Proper offset color
- Height `h-10` (40px) for default size
- Padding `px-4 py-2.5` for proper spacing

---

#### 3.1.2 card.tsx

**Current Issues:**
- Using `rounded-xl` instead of default radius
- `gap-6` is too large
- Missing proper shadow hierarchy

**Updated Styling:**

```tsx
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-4 rounded-xl border border-border p-6 shadow-sm transition-shadow duration-200 hover:shadow-md",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-base leading-none font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-2.5 pt-2 [.border-t]:pt-4", className)}
      {...props}
    />
  )
}
```

**Key Changes:**
- `rounded-xl` (12px) - Cards use lg radius
- `gap-4` - More compact internal spacing
- `p-6` - 24px padding all around
- `shadow-sm` with `hover:shadow-md` - Subtle elevation on hover
- `gap-1.5` in header - 6px between title and description
- `tracking-tight` on title for professional look

---

#### 3.1.3 input.tsx

**Current Issues:**
- Height `h-9` is slightly small
- Missing proper focus transition

**Updated Styling:**

```tsx
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-[10px] border border-input bg-background px-3.5 py-2.5 text-sm shadow-xs transition-all duration-200",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
}
```

**Key Changes:**
- `h-10` (40px) - Standard input height
- `rounded-[10px]` - Default radius
- `px-3.5 py-2.5` - Proper internal padding
- `duration-200` - Smooth focus transition
- `focus-visible:border-primary` - Border color change on focus
- `shadow-xs` - Subtle depth

---

#### 3.1.4 textarea.tsx

**Updated Styling:**

```tsx
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[120px] w-full rounded-[10px] border border-input bg-background px-3.5 py-3 text-sm shadow-xs transition-all duration-200",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-y",
        className
      )}
      {...props}
    />
  )
}
```

---

#### 3.1.5 select.tsx

**Updated SelectTrigger:**

```tsx
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-full items-center justify-between gap-2.5 rounded-[10px] border border-input bg-background px-3.5 py-2.5 text-sm shadow-xs transition-all duration-200",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[size=default]:h-10 data-[size=sm]:h-9",
        "[&>span]:line-clamp-1",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50 transition-transform duration-200 data-[state=open]:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1.5",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg py-2 pr-8 pl-2.5 text-sm outline-none transition-colors duration-150",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4 text-primary" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}
```

---

#### 3.1.6 dialog.tsx

**Updated Styling:**

```tsx
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl border border-border bg-background p-6 shadow-xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "duration-200",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground opacity-70 transition-all duration-150 hover:bg-accent hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    />
  )
}
```

**Key Changes:**
- `rounded-2xl` (16px) - Larger radius for modals
- `bg-black/60` - Darker overlay
- `backdrop-blur-sm` - Subtle blur effect
- `shadow-xl` - Strong elevation
- `gap-1.5` in header - Tighter title/description spacing
- `gap-2.5` in footer - Proper button spacing

---

#### 3.1.7 dropdown-menu.tsx

**Updated Styling:**

```tsx
function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors duration-150",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "data-[inset]:pl-8",
        "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1.5 my-1.5 h-px bg-border", className)}
      {...props}
    />
  )
}
```

---

#### 3.1.8 badge.tsx

**Updated Styling:**

```tsx
const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors duration-150",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-border text-foreground hover:bg-accent",
        success:
          "border-transparent bg-accent-color text-accent-color-foreground hover:bg-accent-color/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

---

#### 3.1.9 tooltip.tsx

**Updated Styling:**

```tsx
function TooltipContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 overflow-hidden rounded-lg bg-foreground px-3 py-1.5 text-xs text-background shadow-md",
          "animate-in fade-in-0 zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}
```

---

#### 3.1.10 checkbox.tsx

**Updated Styling:**

```tsx
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-5 shrink-0 rounded-md border border-input shadow-xs transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
```

---

#### 3.1.11 progress.tsx

**Updated Styling:**

```tsx
function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all duration-300 ease-out-expo"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}
```

---

#### 3.1.12 separator.tsx

**Updated Styling:**

```tsx
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full my-4" : "h-full w-px mx-4",
        className
      )}
      {...props}
    />
  )
}
```

---

#### 3.1.13 alert.tsx

**Updated Styling:**

```tsx
const alertVariants = cva(
  "relative w-full rounded-xl border p-4 shadow-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:size-5 [&>svg+div]:translate-y-[-3px] [&:has(svg)]:pl-11",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "border-destructive/50 text-destructive bg-destructive/5 [&>svg]:text-destructive",
        success:
          "border-accent-color/50 text-accent-color bg-accent-color/5 [&>svg]:text-accent-color",
        warning:
          "border-yellow-500/50 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 [&>svg]:text-yellow-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

---

#### 3.1.14 table.tsx

**Updated Styling:**

```tsx
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="relative w-full overflow-auto rounded-xl border border-border">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-muted/50 [&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-11 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border transition-colors duration-150 hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}
```

---

### 3.2 Layout Components

---

#### 3.2.1 header.tsx

**Updated Styling:**

```tsx
<header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
  <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
    {/* Mobile Menu Toggle */}
    <button
      onClick={toggleSidebar}
      aria-label="Toggle sidebar menu"
      className="flex size-10 items-center justify-center rounded-[10px] bg-secondary text-secondary-foreground transition-all duration-200 hover:bg-accent active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
    >
      <Menu className="size-5" />
    </button>

    {/* Right Side Controls */}
    <div className="flex items-center gap-3">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="group relative flex size-10 items-center justify-center rounded-[10px] bg-secondary text-secondary-foreground transition-all duration-200 hover:bg-accent active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {resolvedTheme === "dark" ? (
          <Sun className="size-5 transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon className="size-5 transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-1">
        <h1 className="text-3xl font-bold tracking-tight">EM</h1>
        <Shimmer duration={4} spread={20} as="h1" className="text-3xl font-bold tracking-tight">
          JAC
        </Shimmer>
      </div>
    </div>
  </div>
</header>
```

**Key Changes:**
- `bg-background/80 backdrop-blur-lg` - Glass effect header
- `rounded-[10px]` - Default radius for buttons
- `gap-3` - Proper spacing between controls
- `tracking-tight` - Professional typography
- Removed hardcoded slate colors, using design tokens

---

#### 3.2.2 leftsidebar.tsx

**Updated Styling:**

```tsx
{/* Sidebar Container */}
<aside
  className={cn(
    "fixed lg:sticky left-0 top-0 z-50 h-screen w-72 lg:w-80 flex flex-col border-r border-border bg-background/95 backdrop-blur-sm transition-transform duration-300",
    mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
  )}
>
  {/* New Chat Button */}
  <div className="p-4">
    <button
      onClick={onNewChat}
      className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-sm transition-all duration-200 hover:bg-accent hover:border-primary/50 active:scale-[0.98]"
    >
      <Plus className="size-5" />
      New Chat
    </button>
  </div>

  {/* Feature Buttons */}
  <div className="space-y-2 px-4">
    <button
      onClick={openModelModal}
      className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary shadow-sm transition-all duration-200 hover:bg-primary/10 hover:border-primary/50 active:scale-[0.98]"
    >
      <Box className="size-5" />
      3D Viewer
    </button>

    <button
      onClick={openWorkflowModal}
      className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-accent-color/30 bg-accent-color/5 px-4 py-3 text-sm font-semibold text-accent-color shadow-sm transition-all duration-200 hover:bg-accent-color/10 hover:border-accent-color/50 active:scale-[0.98]"
    >
      <GitBranch className="size-5" />
      Workflow
    </button>
  </div>

  {/* Chat Sessions List */}
  <div className="flex-1 overflow-y-auto px-4 py-4">
    <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      Recent Chats
    </p>
    <div className="space-y-1.5">
      {/* Session items */}
    </div>
  </div>
</aside>

{/* Session Item */}
<div
  className={cn(
    "group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-3 text-left transition-all duration-200",
    isSelected
      ? "bg-primary/10 text-primary shadow-sm"
      : "text-foreground hover:bg-accent"
  )}
>
  <MessageSquare className="size-4 shrink-0" />
  <span className="flex-1 truncate text-sm font-medium">{session.title}</span>
  <button
    onClick={onDelete}
    className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all duration-150 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
  >
    <Trash2 className="size-3.5" />
  </button>
</div>
```

---

### 3.3 AI Components

---

#### 3.3.1 message.tsx

**Updated Styling:**

```tsx
// Message container
<div
  className={cn(
    "group flex w-full max-w-[85%] flex-col gap-2",
    from === "user" ? "is-user ml-auto" : "is-assistant"
  )}
/>

// MessageContent
<div
  className={cn(
    "flex w-fit flex-col gap-2 overflow-hidden text-sm leading-relaxed",
    "group-[.is-user]:ml-auto group-[.is-user]:rounded-2xl group-[.is-user]:bg-primary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-primary-foreground",
    "group-[.is-assistant]:text-foreground"
  )}
/>

// MessageActions
<div className="flex items-center gap-1.5" />

// MessageAttachment
<div className="group relative size-24 overflow-hidden rounded-xl border border-border shadow-sm" />
```

---

#### 3.3.2 prompt-input.tsx

**Updated Styling:**

```tsx
// PromptInputAttachment
<div
  className={cn(
    "group relative flex h-9 cursor-default select-none items-center gap-2 rounded-lg border border-border bg-secondary/50 px-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent",
    className
  )}
/>

// PromptInputTextarea
<InputGroupTextarea
  className="field-sizing-content max-h-48 min-h-16 rounded-xl border-0 bg-transparent px-4 py-3 text-sm shadow-none focus-visible:ring-0"
/>

// PromptInputSubmit
<InputGroupButton
  className="size-10 rounded-[10px] bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 active:scale-95"
/>
```

---

#### 3.3.3 code-block.tsx

**Updated Styling:**

```tsx
<div
  className={cn(
    "group relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm",
    className
  )}
>
  <div className="relative">
    <div
      className="overflow-auto dark:hidden [&>pre]:m-0 [&>pre]:bg-card [&>pre]:p-4 [&>pre]:text-sm [&_code]:font-mono"
    />
    <div
      className="hidden overflow-auto dark:block [&>pre]:m-0 [&>pre]:bg-card [&>pre]:p-4 [&>pre]:text-sm [&_code]:font-mono"
    />
    {children && (
      <div className="absolute right-2 top-2 flex items-center gap-1.5">
        {children}
      </div>
    )}
  </div>
</div>

// Copy button
<Button
  className="size-8 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100"
  variant="ghost"
  size="icon-sm"
/>
```

---

#### 3.3.4 task.tsx

**Updated Styling:**

```tsx
// Task container
<div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm" />

// Task step
<div
  className={cn(
    "flex items-start gap-3 rounded-lg p-2.5 transition-colors duration-200",
    status === "active" && "bg-primary/5",
    status === "complete" && "bg-accent-color/5"
  )}
/>

// Task icon
<div
  className={cn(
    "flex size-6 shrink-0 items-center justify-center rounded-full",
    status === "pending" && "bg-muted text-muted-foreground",
    status === "active" && "bg-primary text-primary-foreground",
    status === "complete" && "bg-accent-color text-accent-color-foreground"
  )}
/>
```

---

#### 3.3.5 suggestion.tsx

**Updated Styling:**

```tsx
<button
  className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-xs transition-all duration-200 hover:bg-accent hover:border-primary/50 active:scale-[0.98]"
/>
```

---

### 3.4 Modal Components

---

#### 3.4.1 model-viewer-modal.tsx & workflow-viewer-modal.tsx

**Updated Styling:**

```tsx
// Modal overlay
<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />

// Modal content
<div className="fixed left-[50%] top-[50%] z-50 grid h-[90vh] w-[95vw] max-w-7xl translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl border border-border bg-background p-6 shadow-2xl">
  {/* Header */}
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-semibold tracking-tight">Modal Title</h2>
    <button className="rounded-lg p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground">
      <XIcon className="size-5" />
    </button>
  </div>

  {/* Content area */}
  <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card" />
</div>
```

---

### 3.5 Workflow Components

---

#### 3.5.1 workflow-node.tsx

**Updated Styling:**

```tsx
<div
  className={cn(
    "flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-md transition-all duration-200",
    selected && "border-primary ring-2 ring-primary/20",
    "hover:shadow-lg"
  )}
>
  {/* Node header */}
  <div className="flex items-center gap-2.5">
    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon className="size-4" />
    </div>
    <span className="text-sm font-semibold">{label}</span>
  </div>
</div>
```

---

## 4. Implementation Priority Order

### Phase 1: Core Configuration (Day 1)
1. `app/globals.css` - Complete rewrite
2. `tailwind.config.ts` - Update configuration

### Phase 2: Base UI Components (Days 2-3)
3. `components/ui/button.tsx`
4. `components/ui/input.tsx`
5. `components/ui/card.tsx`
6. `components/ui/dialog.tsx`
7. `components/ui/select.tsx`
8. `components/ui/dropdown-menu.tsx`
9. `components/ui/badge.tsx`
10. `components/ui/tooltip.tsx`
11. `components/ui/textarea.tsx`
12. `components/ui/checkbox.tsx`
13. `components/ui/radio-group.tsx`
14. `components/ui/progress.tsx`
15. `components/ui/separator.tsx`
16. `components/ui/alert.tsx`
17. `components/ui/scroll-area.tsx`
18. `components/ui/table.tsx`
19. `components/ui/hover-card.tsx`
20. `components/ui/command.tsx`
21. `components/ui/collapsible.tsx`
22. `components/ui/carousel.tsx`
23. `components/ui/input-group.tsx`
24. `components/ui/button-group.tsx`

### Phase 3: Layout Components (Day 4)
25. `components/header.tsx`
26. `components/leftsidebar.tsx`
27. `components/footer.tsx`
28. `components/chat.tsx`

### Phase 4: AI Components (Days 5-6)
29. `components/ai-elements/prompt-input.tsx`
30. `components/ai-elements/message.tsx`
31. `components/ai-elements/code-block.tsx`
32. `components/ai-elements/task.tsx`
33. `components/ai-elements/chain-of-thought.tsx`
34. `components/ai-elements/reasoning.tsx`
35. `components/ai-elements/suggestion.tsx`
36. `components/ai-elements/confirmation.tsx`
37. `components/ai-elements/shimmer.tsx`
38. `components/ai-elements/artifact.tsx`
39. `components/ai-elements/canvas.tsx`
40. `components/ai-elements/checkpoint.tsx`
41. `components/ai-elements/connection.tsx`
42. `components/ai-elements/context.tsx`
43. `components/ai-elements/controls.tsx`
44. `components/ai-elements/conversation.tsx`
45. `components/ai-elements/edge.tsx`
46. `components/ai-elements/image.tsx`
47. `components/ai-elements/inline-citation.tsx`
48. `components/ai-elements/loader.tsx`
49. `components/ai-elements/model-selector.tsx`
50. `components/ai-elements/node.tsx`
51. `components/ai-elements/open-in-chat.tsx`
52. `components/ai-elements/panel.tsx`
53. `components/ai-elements/plan.tsx`
54. `components/ai-elements/queue.tsx`
55. `components/ai-elements/sources.tsx`
56. `components/ai-elements/tool.tsx`
57. `components/ai-elements/toolbar.tsx`
58. `components/ai-elements/web-preview.tsx`
59. `components/ai-elements/examples.tsx`

### Phase 5: Modal & Workflow Components (Day 7)
60. `components/model-viewer-modal.tsx`
61. `components/workflow-viewer-modal.tsx`
62. `components/workflow/workflow-node.tsx`
63. `components/workflow/workflow-edges.tsx`

---

## Quick Reference: Common Tailwind Classes

### Spacing
| Concept | Class | Pixels |
|---------|-------|--------|
| Extra Small Gap | `gap-1.5` | 6px |
| Small Gap | `gap-2.5` | 10px |
| Medium Gap | `gap-3.5` | 14px |
| Large Gap | `gap-7` | 28px |
| Extra Large Gap | `gap-10` | 40px |

### Border Radius
| Concept | Class | Pixels |
|---------|-------|--------|
| Default | `rounded-[10px]` | 10px |
| Small | `rounded-md` | 6px |
| Medium | `rounded-lg` | 8px |
| Large | `rounded-xl` | 12px |
| Extra Large | `rounded-2xl` | 16px |
| Full | `rounded-full` | 9999px |

### Heights
| Element | Class | Pixels |
|---------|-------|--------|
| Small Button | `h-9` | 36px |
| Default Button/Input | `h-10` | 40px |
| Large Button | `h-11` | 44px |
| Header | `h-16` | 64px |

### Common Patterns
```
// Focus ring
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background

// Transition
transition-all duration-200

// Active press
active:scale-[0.98]

// Hover on interactive
hover:bg-accent hover:text-accent-foreground

// Disabled
disabled:pointer-events-none disabled:opacity-50
```

---

## Notes

1. **Color Tokens**: Always use semantic color tokens (`bg-primary`, `text-foreground`, etc.) instead of hardcoded colors
2. **Transitions**: Use `duration-200` for most interactions, `duration-300` for larger animations
3. **Focus States**: All interactive elements must have visible focus indicators using the ring utility
4. **Dark Mode**: All styles should work in both light and dark modes - use CSS variables
5. **Accessibility**: Maintain proper contrast ratios and focus management
6. **Performance**: Use `transition-colors` instead of `transition-all` where only colors change

---

*Document Created: 2024-11-22*
*Status: Ready for Implementation*
