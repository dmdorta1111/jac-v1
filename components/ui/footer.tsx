"use client";

import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-slate-200 bg-white/80 backdrop-blur-xl dark:border-[#2a2a2a] dark:bg-[#0d0d0d] shrink-0">
      <div className="mx-auto px-4 py-3 sm:px-6">
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
              <span className="text-sm font-semibold text-slate-700 dark:text-[#f5f5f5]">
                EMJAC AI Assistant
              </span>
              <span className="text-xs text-slate-600 dark:text-[#a3a3a3]">
                Powered by Claude AI
              </span>
            </div>
          </div>

          {/* Center - Tagline */}
          <div className="flex items-center gap-2 text-center">
            <div className="relative">
              <p className="text-sm font-medium text-slate-600 dark:text-[#d4d4d4]">
                Engineering Mastery
              </p>
              <div className="absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            </div>
            <span className="text-slate-500 dark:text-[#737373]">•</span>
            <p className="text-sm font-medium text-slate-600 dark:text-[#d4d4d4]">
              Junction of Architecture & Craftsmanship
            </p>
          </div>

          {/* Right side - Copyright */}
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#a3a3a3]">
            <span>© {new Date().getFullYear()} EMJAC</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">All rights reserved</span>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>
    </footer>
  );
}
