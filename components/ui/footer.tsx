"use client";

import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-steel-800/50 bg-surface-dark/80 backdrop-blur-xl dark:border-steel-800/50 dark:bg-surface-dark/80 light:border-steel-200 light:bg-white/80">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
          {/* Left side - Branding */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="h-5 w-5 text-blue-400 animate-pulse" />
              <div className="absolute inset-0 h-5 w-5 animate-ping text-blue-400 opacity-20">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-steel-200 dark:text-steel-200 light:text-steel-700">
                EMJAC AI Assistant
              </span>
              <span className="text-xs text-steel-500 dark:text-steel-500 light:text-steel-600">
                Powered by Claude AI
              </span>
            </div>
          </div>

          {/* Center - Tagline */}
          <div className="flex items-center gap-2 text-center">
            <div className="relative">
              <p className="text-sm font-medium text-steel-400 dark:text-steel-400 light:text-steel-600">
                Engineering Mastery
              </p>
              <div className="absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            </div>
            <span className="text-steel-600 dark:text-steel-600 light:text-steel-500">•</span>
            <p className="text-sm font-medium text-steel-400 dark:text-steel-400 light:text-steel-600">
              Junction of Architecture & Craftsmanship
            </p>
          </div>

          {/* Right side - Copyright */}
          <div className="flex items-center gap-2 text-xs text-steel-500 dark:text-steel-500 light:text-steel-600">
            <span>© {new Date().getFullYear()} EMJAC</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">All rights reserved</span>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>
    </footer>
  );
}
