"use client";

import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

export function Header() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-steel-800/50 bg-surface-dark/80 backdrop-blur-xl dark:border-steel-800/50 dark:bg-surface-dark/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
        {/* Theme Toggle - Left Side */}
        <div className="flex w-1/4 justify-start">
          <button
            onClick={toggleTheme}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-steel-800/50 text-steel-400 transition-all duration-300 hover:bg-steel-700/50 hover:text-blue-400 hover:shadow-glow-sm active:scale-95 dark:bg-steel-800/50"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            <div className="relative">
              {resolvedTheme === "dark" ? (
                <Sun className= " h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
              ) : (
                <Moon className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
              )}
            </div>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-steel-800 px-2 py-1 text-xs text-steel-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>
        </div>

        {/* EMJAC Logo - Centered on Desktop, Right on Mobile */}
        <div className="flex w-1/2 justify-center md:w-2/4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Sparkles className="h-5 w-5 text-blue-400 animate-pulse" />
                <div className="absolute inset-0 h-5 w-5 animate-ping text-blue-400 opacity-20">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <span className="hidden text-xs font-medium uppercase tracking-wider text-steel-500 sm:inline">
                AI Assistant
              </span>
            </div>
            <div className="hidden h-6 w-px bg-steel-700 sm:block" />
            <div className="">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                <span className="steel-bg-linear-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text transition-all duration-300 group-hover:from-blue-300 group-hover:via-blue-400 group-hover:to-blue-500">
                  EMJAC
                </span>
              </h1>
              <div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 group-hover:w-full" />
            </div>
          </div>
        </div>

        {/* Spacer for balance */}
        <div className="w-1/4" />
      </div>
    </header>
  );
}
