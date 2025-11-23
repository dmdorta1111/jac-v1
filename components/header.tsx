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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile Menu Toggle - Left Side */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar menu"
            aria-expanded={sidebarOpen}
            aria-controls="chat-sidebar"
            className="flex size-10 items-center justify-center rounded-[10px] bg-secondary text-secondary-foreground transition-all duration-200 hover:bg-accent active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>

        {/* EMJAC Logo and Theme Toggle - Right Side */}
        <div className="flex items-center justify-end gap-3 mr-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="group relative flex size-10 items-center justify-center rounded-[10px] bg-secondary text-secondary-foreground transition-all duration-200 hover:bg-accent active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            <div className="relative">
              {resolvedTheme === "dark" ? (
                <Sun className="size-5 transition-transform duration-300 group-hover:rotate-45" />
              ) : (
                <Moon className="size-5 transition-transform duration-300 group-hover:-rotate-12" />
              )}
            </div>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 transition-opacity duration-200 group-hover:opacity-100 shadow-md">
              {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>

          {/* EMJAC Logo */}
          <div className="flex items-center gap-1">
            <h1 className="font-bold text-3xl tracking-tight whitespace-nowrap">EM</h1>
            <Shimmer duration={4} spread={20} as="h1" className="font-bold text-3xl tracking-tight whitespace-nowrap">
              JAC
            </Shimmer>
          </div>
        </div>
      </div>
    </header>
  );
}
