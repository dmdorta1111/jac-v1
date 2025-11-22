"use client";

import { useEffect } from "react";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { useSidebar } from "@/components/providers/sidebar-provider";

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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
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
        } lg:translate-x-0 fixed lg:sticky left-0 top-0 z-50 h-screen w-72 lg:w-80 flex justify-between overflow-y-auto p-6 shrink-0 flex-col border-r border-slate-200 bg-white/95 backdrop-blur-sm transition-transform duration-300 dark:border-border dark:bg-background`}
      >
        {/* New Chat Button */}
        <div className="mb-6 px-2">
          <button
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-gradient-to-br from-slate-100 to-slate-50 px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-md transition-all duration-200 hover:border-blue-400 hover:from-slate-50 hover:to-white hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 dark:border-border dark:bg-card dark:bg-none dark:text-foreground dark:shadow-lg dark:hover:border-blue-500 dark:hover:bg-secondary dark:hover:text-blue-400"
          >
            <Plus className="h-5 w-5" />
            New Chat
          </button>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 pb-6">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-muted-foreground">
            Recent Chats
          </p>
          <div className="space-y-2" role="listbox" aria-label="Chat sessions">
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
      </aside>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-8 text-center">
      <MessageSquare className="h-8 w-8 text-slate-300 dark:text-muted-foreground mb-2" />
      <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground">
        No chat history yet
      </p>
      <p className="text-xs text-slate-400 dark:text-muted-foreground/70 mt-1">
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
      className={`group flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        isSelected
          ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-600 shadow-sm dark:from-blue-600/20 dark:to-blue-500/10 dark:bg-none dark:text-blue-400 dark:shadow-md"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-800 dark:text-foreground/80 dark:hover:bg-secondary dark:hover:text-foreground"
      }`}
    >
      <MessageSquare className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span className="flex-1 truncate text-sm font-medium">{session.title}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(e);
        }}
        aria-label={`Delete chat: ${session.title}`}
        className="rounded-lg p-1.5 text-slate-500 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-muted-foreground dark:hover:bg-destructive/20 dark:hover:text-red-400"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

