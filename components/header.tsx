"use client";

import { Moon, Sun, Menu, Plus } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useProject } from "@/components/providers/project-context";
import { useThemeTransition } from "./hooks/useThemeTransition";
import { PlasmaDot } from "./ai-elements/plasma-dot";
import { Button } from "./ui/button";
import Image from "next/image";

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
          <div
            className="hidden lg:flex items-center justify-start gap-6 flex-1 max-w-4xl ml-6"
            data-theme-animated
          >
            {/* SO Number - Primary identifier */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Sales Order
              </span>
              <span
                className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 truncate max-w-[160px]"
                title={metadata.SO_NUM}
              >
                {metadata.SO_NUM}
              </span>
            </div>

            {/* Vertical Divider */}
            <div className="h-8 w-px bg-neutral-300 dark:bg-neutral-600" />

            {/* Job Name */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Job Name
              </span>
              <span
                className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate max-w-[180px]"
                title={metadata.JOB_NAME}
              >
                {metadata.JOB_NAME}
              </span>
            </div>

            {/* Vertical Divider */}
            <div className="h-8 w-px bg-neutral-300 dark:bg-neutral-600" />

            {/* Customer Name */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Customer
              </span>
              <span
                className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate max-w-[200px]"
                title={metadata.CUSTOMER_NAME}
              >
                {metadata.CUSTOMER_NAME}
              </span>
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

          {/* JAC Logo - Blue glow in light mode, Orange glow in dark mode */}
          <div className="relative flex items-center gap-1">
            {/* Plasma Glow - behind (only visible in dark mode) - reduced by 75% */}
            <PlasmaDot className="!w-[150%] !h-[200%] !opacity-0 dark:!opacity-[0.1125]" />
            {/* JAC Text - Blue in light mode, Orange in dark mode */}
            <h1
              className={`
                font-bold text-3xl tracking-tight whitespace-nowrap relative z-10 px-3 py-1
                bg-clip-text [-webkit-background-clip:text] text-transparent
                bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300
                dark:from-orange-500 dark:via-orange-400 dark:to-amber-300
                [text-shadow:0_0_20px_rgba(59,130,246,0.125),0_0_40px_rgba(59,130,246,0.075),0_0_60px_rgba(96,165,250,0.05)]
                dark:[text-shadow:0_0_20px_rgba(249,115,22,0.125),0_0_40px_rgba(249,115,22,0.075),0_0_60px_rgba(251,191,36,0.05)]
              `}
            >
              JAC
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
