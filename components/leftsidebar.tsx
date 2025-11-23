"use client";

import { useEffect } from "react";
import { Box, GitBranch, MessageSquare, Plus, Trash2 } from "lucide-react";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useModelModal } from "@/components/providers/model-modal-provider";
import { useWorkflowModal } from "@/components/providers/workflow-modal-provider";
import { Button } from "./ui/button";

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  files?: UploadedFile[];
  reasoning?: ReasoningStep[];
  tasks?: TaskStep[];
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

interface LeftSidebarProps {
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
}

export function LeftSidebar({
  chatSessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}: LeftSidebarProps) {
  const { isOpen: mobileSidebarOpen, close: closeSidebar } = useSidebar();
  const { open: openModelModal } = useModelModal();
  const { open: openWorkflowModal } = useWorkflowModal();

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
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Chat History Sidebar */}
      <aside
        id="chat-sidebar"
        role="navigation"
        aria-label="Chat sessions"
        className={`${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:sticky left-0 top-0 z-50 w-72 lg:w-80 flex justify-between overflow-y-auto p-4 shrink-0 flex-col border-r border-border bg-background/95 backdrop-blur-sm transition-transform duration-300`}
      >
        {/* New Chat Button */}
        <div className="mb-3">
          <Button
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-sm transition-all duration-200 hover:bg-accent hover:border-primary/50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Plus className="size-5" />
            New Item
          </Button>
        </div>
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
        <div className="flex-1 overflow-y-auto py-2">
          <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Chats
          </p>
          <div className="space-y-1.5" role="listbox" aria-label="Chat sessions">
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
                />
              ))
            )}
          </div>
        </div>
        {/* 3D Model Viewer Button */}
        <div className="mb-3">
          <Button
            onClick={() => {
              openModelModal();
              // Close mobile sidebar after opening modal
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                closeSidebar();
              }
            }}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary shadow-sm transition-all duration-200 hover:bg-primary/10 hover:border-primary/50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
      <MessageSquare className="size-8 text-muted-foreground/50 mb-2" />
      <p className="text-sm font-medium text-muted-foreground">
        No chat history yet
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        Start a conversation to see it here
      </p>
    </div>
  );
}

interface SessionItemProps {
  session: ChatSession;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function SessionItem({ session, isSelected, onSelect, onDelete }: SessionItemProps) {
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
      className={`group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        isSelected
          ? "bg-primary/10 text-primary shadow-sm"
          : "text-foreground hover:bg-accent"
      }`}
    >
      <MessageSquare className="size-4 shrink-0" aria-hidden="true" />
      <span className="flex-1 truncate text-sm font-medium">Item #</span>
      <Button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(e);
        }}
        aria-label={`Delete chat: ${session.title}`}
        className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all duration-150 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
