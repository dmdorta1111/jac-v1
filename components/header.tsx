"use client";

import { Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useProject } from "@/components/providers/project-context";
import { Shimmer } from "./ai-elements/shimmer";

export function Header() {
  const { setTheme, resolvedTheme } = useTheme();
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar();
  const { metadata } = useProject();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile Menu Toggle - Left Side */}
        <div className="flex items-center">
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
                className="text-sm font-semibold text-foreground/80 truncate max-w-[120px]"
                title={`${metadata.SO_NUM} - ${metadata.JOB_NAME} - ${metadata.CUSTOMER_NAME}`}
              >
                {metadata.SO_NUM}
              </span>
            </div>
          )}
        </div>

        {/* Project Metadata - Desktop View (Center-Left) */}
        {metadata && (
          <div className="hidden lg:flex items-start justify-start gap-0 flex-1 max-w-3xl ml-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">SO</span>
              <h1
                className="text-lg font-bold text-foreground truncate max-w-[180px]"
                title={metadata.SO_NUM}
              >
                {metadata.SO_NUM}
              </h1>
            </div>

            <span className="mx-8 text-muted-foreground">•</span>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Job</span>
              <h1
                className="text-lg font-semibold text-foreground/90 truncate max-w-[200px]"
                title={metadata.JOB_NAME}
              >
                {metadata.JOB_NAME}
              </h1>
            </div>

            <span className="mx-8 text-muted-foreground">•</span>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Customer</span>
              <h1
                className="text-lg font-semibold text-foreground/80 truncate max-w-[200px]"
                title={metadata.CUSTOMER_NAME}
              >
                {metadata.CUSTOMER_NAME}
              </h1>
            </div>
          </div>
        )}

        {/* EMJAC Logo and Theme Toggle - Right Side */}
        <div className="flex items-center justify-end gap-3 mr-4 ml-auto">
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
            <Shimmer duration={4} spread={20} as="h1" className="font-bold text-3xl tracking-tight whitespace-nowrap">
              JAC
            </Shimmer>
          </div>
        </div>
      </div>
    </header>
  );
}
