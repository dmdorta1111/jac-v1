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
