"use client";

import { Moon, Sun, Menu, Plus } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useProject } from "@/components/providers/project-context";
import { useThemeTransition } from "./hooks/useThemeTransition";
import { Shimmer } from "./ai-elements/shimmer";
import { GlowingText } from "./ui/glowing-text";
import { Button } from "./ui/button";

export function Header() {
  const { setTheme, resolvedTheme } = useTheme();
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar();
  const { metadata, openNewProjectDialog } = useProject();

  // Enable smooth theme transition animations
  useThemeTransition();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-40 w-screen border-0 dark:bg-neutral-800/95 backdrop-blur-lg" data-theme-animated>
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 w-full">
        {/* Left Side - New Project Button + Mobile Menu Toggle */}
        <div className="flex items-center gap-2" data-theme-animated>
        
          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar menu"
            aria-expanded={sidebarOpen}
            aria-controls="chat-sidebar"
            className="flex size-10 items-center justify-center rounded-[10px] text-secondary-foreground transition-all duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          {/* Mobile Metadata - Compact View */}
          {metadata && (
            <div className="flex lg:hidden items-center ml-2">
              <span
                className="text-xs font-semibold text-foreground/80 truncate max-w-[120px]"
                title={`${metadata.SO_NUM} - ${metadata.JOB_NAME} - ${metadata.CUSTOMER_NAME}`}
              >
                {metadata.SO_NUM}
              </span>
            </div>
          )}
        </div>

        {/* Project Metadata - Desktop View (Center-Left) */}
        {metadata && (
          <div className="hidden lg:flex items-start justify-start gap-0 flex-1 max-w-3xl ml-4" data-theme-animated>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">SO</span>
              <h1
                className="text-sm font-bold text-foreground truncate max-w-[180px]"
                title={metadata.SO_NUM}
              >
                {metadata.SO_NUM}
              </h1>
            </div>

            <span className="mx-4 text-muted-foreground text-xs">•</span>

            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Job</span>
              <h1
                className="text-sm font-semibold text-foreground/90 truncate max-w-[200px]"
                title={metadata.JOB_NAME}
              >
                {metadata.JOB_NAME}
              </h1>
            </div>

            <span className="mx-4 text-muted-foreground text-xs">•</span>

            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Customer</span>
              <h1
                className="text-sm font-semibold text-foreground/80 truncate max-w-[200px]"
                title={metadata.CUSTOMER_NAME}
              >
                {metadata.CUSTOMER_NAME}
              </h1>
            </div>
          </div>
        )}

        {/* EMJAC Logo and Theme Toggle - Right Side */}
        <div className="flex items-center justify-end gap-3 mr-4 ml-auto" data-theme-animated>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="group relative flex size-10 items-center justify-center rounded-[10px] transition-all duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            <div className="relative">
              {resolvedTheme === "dark" ? (
                <Sun className="size-5 transition-transform duration-300 group-hover:rotate-45" />
              ) : (
                <Moon className="size-5 transition-transform duration-300 group-hover:-rotate-20" />
              )}
            </div>
          </button>

          {/* EMJAC Logo */}
          <div className="flex items-center gap-1">
            <GlowingText
              glowColor="rgba(160, 160, 170, 0.4)"
              duration={2.5}
              intensity={0.6}
            >
              <Shimmer duration={16} spread={5} as="h1" className="font-bold text-3xl tracking-tight whitespace-nowrap [--color-muted-foreground:#27272a] dark:[--color-muted-foreground:#a1a1aa]">
                JAC
              </Shimmer>
            </GlowingText>
          </div>
        </div>
      </div>
    </header>
  );
}
