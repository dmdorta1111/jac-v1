"use client";

import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
          {/* Left side - Branding */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="h-5 w-5 text-muted-foreground animate-pulse" />
              <div className="absolute inset-0 h-5 w-5 animate-ping text-muted-foreground opacity-20">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                EMJAC AI Assistant
              </span>
            </div>
          </div>

          {/* Center - Tagline (hidden on very small screens to prevent overflow) */}
          <div className="hidden items-center gap-2 text-center sm:flex">
            <div className="relative">
              <p className="text-sm font-medium text-muted-foreground">
                Engineering Mastery
              </p>
              <div className="absolute -bottom-1 left-0 h-px w-full bg-linear-to-r from-transparent via-zinc-500/50 to-transparent" />
            </div>
            <span className="text-muted-foreground">•</span>
            <p className="text-sm font-medium text-muted-foreground">
              Junction of Architecture & Craftsmanship
            </p>
          </div>

          {/* Right side - Copyright */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} EMJAC</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">All rights reserved</span>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="mt-2 h-px w-full bg-linear-to-r from-transparent via-zinc-500/20 to-transparent" />
      </div>
    </footer>
  );
}
