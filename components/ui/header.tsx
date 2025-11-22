"use client";

import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { Shimmer } from "../ai-elements/shimmer";

export function Header() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-[#2a2a2a] dark:bg-[#0d0d0d]">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Empty space on the left */}
        <div className="flex-1" />

        {/* EMJAC Logo and Theme Toggle - Right Side */}
        <div className="flex items-center justify-end gap-6 mr-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all duration-300 hover:bg-slate-200 hover:text-blue-600 active:scale-95 dark:bg-[#1a1a1a] dark:text-[#a3a3a3] dark:hover:bg-[#252525] dark:hover:text-blue-400"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            <div className="relative">
              {resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
              ) : (
                <Moon className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
              )}
            </div>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-[#1a1a1a] dark:text-[#d4d4d4]">
              {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>

          {/* EMJAC Logo */}
          <Shimmer duration={4} spread={20} as="h1" className="font-bold text-4xl whitespace-nowrap">
            JAC
          </Shimmer>
        </div>
      </div>
    </header>
  );
}
