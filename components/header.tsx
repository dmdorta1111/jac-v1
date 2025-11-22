"use client";

import { Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { Shimmer } from "./ai-elements/shimmer";

export function Header() {
  const { setTheme, resolvedTheme } = useTheme();
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-border dark:bg-background">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Mobile Menu Toggle - Left Side */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar menu"
            aria-expanded={sidebarOpen}
            aria-controls="chat-sidebar"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all duration-200 hover:bg-slate-200 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 dark:bg-card dark:text-muted-foreground dark:hover:bg-secondary dark:hover:text-blue-400 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* EMJAC Logo and Theme Toggle - Right Side */}
        <div className="flex items-center justify-end gap-6 mr-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all duration-300 hover:bg-slate-200 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 dark:bg-card dark:text-muted-foreground dark:hover:bg-secondary dark:hover:text-blue-400"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            <div className="relative">
              {resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
              ) : (
                <Moon className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
              )}
            </div>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-card dark:text-foreground/80">
              {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>

          {/* EMJAC Logo */}
          <div className="flex items-center gap-1">
          <h1 className="font-bold text-4xl whitespace-nowrap">EM</h1>
          <Shimmer duration={4} spread={20} as="h1" className="font-bold text-4xl whitespace-nowrap">
            JAC
          </Shimmer>
          </div>
        </div>
      </div>
    </header>
  );
}
