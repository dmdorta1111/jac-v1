"use client";

import { useEffect } from "react";
import { Box, CheckCircle2, ChevronLeft, ChevronRight, Clock, Plus, Sliders, Trash2 } from "lucide-react";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useModelModal } from "@/components/providers/model-modal-provider";
import { useWorkflowModal } from "@/components/providers/workflow-modal-provider";
import { useStdsModal } from "@/components/providers/stds-modal-provider";
import { Button } from "./ui/button";
import Image from "next/image";

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  itemNumber?: string;
  projectMetadata?: any;
  flowState?: Record<string, any>;
  flowComplete?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  files?: UploadedFile[];
  reasoning?: ReasoningStep[];
  tasks?: TaskStep[];
  formSpec?: any; // Dynamic form specification from Claude
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface ReasoningStep {
  label: string;
  description?: string;
  status?: "complete" | "active" | "pending";
}

export interface TaskStep {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "active" | "complete";
  items?: string[];
}

interface FormNavigationState {
  currentStepIndex: number;
  totalSteps: number;
  completedFormIds: string[];
  highestStepReached: number;
}

interface LeftSidebarProps {
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
  formNavigationState?: FormNavigationState;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  showNewItemButton?: boolean;
  isLoading?: boolean;
}

export function LeftSidebar({
  chatSessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  formNavigationState,
  onNavigatePrev,
  onNavigateNext,
  showNewItemButton = false,
  isLoading = false,
}: LeftSidebarProps) {
  const { isOpen: mobileSidebarOpen, close: closeSidebar } = useSidebar();
  const { open: openModelModal } = useModelModal();
  const { open: openWorkflowModal } = useWorkflowModal();
  const { open: openStdsModal } = useStdsModal();

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileSidebarOpen) {
        closeSidebar();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileSidebarOpen, closeSidebar]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  // Handle session selection - close sidebar on mobile
  const handleSelectSession = (sessionId: string) => {
    onSelectSession(sessionId);
    // Close sidebar on mobile after selection
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      closeSidebar();
    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay - below header (z-50), below sidebar (z-45) */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm bg-neutral-300/50 dark:bg-neutral-800/50 lg:hidden animate-[fade-in_200ms_ease-out]"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Chat History Sidebar - mobile: z-45 (above overlay), desktop: z-30 (below header) */}
      <aside
        id="chat-sidebar"
        role="navigation"
        aria-label="Chat history and navigation"
        className={`${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:sticky left-0 top-16 lg:top-0 z-[45] lg:z-30 w-52 lg:w-56 h-[calc(100dvh-var(--header-height))] lg:h-[calc(100vh-var(--header-height))] flex justify-between overflow-hidden px-4 pt-4 pb-4 lg:pb-6 shrink-0 flex-col bg-neutral-300/95 dark:bg-neutral-800/95 backdrop-blur-sm transition-transform duration-300`}
      >

        {/* New Item Button - Above Session History */}
        {showNewItemButton && (
          <div className="shrink-0 pb-3">
            <Button
              onClick={onNewChat}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-border bg-secondary/50 px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-sm transition-all duration-200 hover:bg-accent hover:border-solid hover:border-neutral-400/50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="size-5" />
              {chatSessions.length === 0 ? 'Create First Item' : 'Add New Item'}
            </Button>
          </div>
        )}
        {/* Workflow Viewer Button
        <div className="mb-4">
          <button
            onClick={() => {
              openWorkflowModal();
              // Close mobile sidebar after opening modal
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                closeSidebar();
              }
            }}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-accent-color/30 bg-accent-color/5 px-4 py-3 text-sm font-semibold text-accent-color shadow-sm transition-all duration-200 hover:bg-accent-color/10 hover:border-accent-color/50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Open Workflow Viewer"
          >
            <GitBranch className="size-5" />
            Workflow
          </button>
        </div> */}

        {/* Chat Sessions List */}
        <div className="flex-1 min-h-0 overflow-y-auto py-2 pb-2">
          <div className="space-y-1.5 pb-2" role="listbox" aria-label="">
            {chatSessions.length === 0 ? (
              <EmptyState />
            ) : (
              chatSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isSelected={currentSessionId === session.id}
                  onSelect={() => handleSelectSession(session.id)}
                  onDelete={(e) => onDeleteSession(session.id, e)}
                  formNavigationState={currentSessionId === session.id ? formNavigationState : undefined}
                  onNavigatePrev={currentSessionId === session.id ? onNavigatePrev : undefined}
                  onNavigateNext={currentSessionId === session.id ? onNavigateNext : undefined}
                />
              ))
            )}
          </div>
        </div>
        {/* Footer Buttons: Project STDS & 3D Viewer */}
        <div className="shrink-0 pt-3 sticky bottom-0 backdrop-blur-sm pb-2 -mx-4 px-4 mt-2 space-y-2">
          {/* Project STDS Button */}
          <Button
            onClick={() => {
              openStdsModal();
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                closeSidebar();
              }
            }}
            variant="ghost"
            className="flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-amber-600 dark:text-amber-400 transition-all duration-200 hover:bg-amber-500/15 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Open Project Standards"
          >
            <Sliders className="size-5" />
            Project STDS
          </Button>

          {/* 3D Model Viewer Button */}
          <Button
            onClick={() => {
              openModelModal();
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                closeSidebar();
              }
            }}
            variant="ghost"
            className="flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-neutral-600 dark:text-neutral-400 transition-all duration-200 hover:bg-neutral-500/15 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Open 3D Model Viewer"
          >
            <Box className="size-5" />
            3D Viewer
          </Button>
        </div>
      </aside>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-8 text-center">
      <p className="text-sm font-medium text-muted-foreground">
        No Items Yet
      </p>
    </div>
  );
}

interface SessionItemProps {
  session: ChatSession;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  formNavigationState?: FormNavigationState;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
}

function SessionItem({ session, isSelected, onSelect, onDelete, formNavigationState, onNavigatePrev, onNavigateNext }: SessionItemProps) {
  // Determine status icon
  const StatusIcon = session.flowComplete ? CheckCircle2 : Clock;
  const statusColor = session.flowComplete ? "text-green-500" : "text-yellow-500";
  const statusLabel = session.flowComplete ? "Completed" : "In Progress";

  // Calculate progress percentage if available
  const progressText = session.currentStep !== undefined && session.totalSteps
    ? `${Math.round((session.currentStep / session.totalSteps) * 100)}%`
    : null;

  // Display title: prefer itemNumber-based title, fallback to session title
  const displayTitle = session.itemNumber
    ? `Item ${session.itemNumber}`
    : (session.title || 'New Item');

  // Form navigation controls - only show for selected session with multiple forms
  const showFormNav = isSelected && formNavigationState && formNavigationState.totalSteps > 1;
  const canGoPrev = showFormNav && formNavigationState.currentStepIndex > 0;
  // Can go forward to any step up to the highest previously reached
  const canGoNext = showFormNav && formNavigationState.currentStepIndex < formNavigationState.totalSteps - 1
    && formNavigationState.currentStepIndex < formNavigationState.highestStepReached;

  return (
    <div
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`group flex w-full cursor-pointer flex-col gap-1.5 rounded-xl px-3 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        isSelected
          ? "bg-neutral-500/10 text-neutral-700 dark:text-neutral-300 shadow-sm"
          : "text-foreground hover:bg-accent"
      }`}
    >
      {/* Main row with status, title, progress, and delete */}
      <div className="flex w-full items-center gap-2.5">
        {/* Status Icon */}
        <StatusIcon
          className={`size-4 shrink-0 ${statusColor}`}
          aria-label={statusLabel}
        />
        <span className="flex-1 truncate text-sm font-medium">
          {displayTitle}
        </span>
        {/* Progress indicator */}
        {progressText && (
          <span className="text-xs text-muted-foreground shrink-0">
            {progressText}
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
          aria-label={`Delete chat: ${session.title}`}
          className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all duration-150 hover:bg-neutral-500/10 hover:text-neutral-600 dark:hover:text-neutral-400 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Form navigation row - only show for selected session with forms */}
      {showFormNav && (
        <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-border/50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onNavigatePrev?.();
            }}
            disabled={!canGoPrev}
            aria-label="Previous form"
            className="h-7 px-2 text-xs gap-1 disabled:opacity-30"
          >
            <ChevronLeft className="size-3.5" />
            Prev
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateNext?.();
            }}
            disabled={!canGoNext}
            aria-label="Next form"
            className="h-7 px-2 text-xs gap-1 disabled:opacity-30"
          >
            Next
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
