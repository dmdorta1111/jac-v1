'use client';

import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';

interface ProjectMetadata {
  SO_NUM: string;
  JOB_NAME: string;
  CUSTOMER_NAME: string;
  productType?: string;
  salesOrderNumber?: string;
  folderPath?: string;
  isRevision?: boolean;
  currentSessionId?: string;
  projectHeaderCompleted?: boolean;
  itemSessions?: Record<string, {
    sessionId: string;
    itemNumber: string;
    createdAt: number;
    title: string;
  }>;
}

interface ProjectContextType {
  metadata: ProjectMetadata | null;
  setMetadata: (metadata: ProjectMetadata | null) => void;
  clearMetadata: () => void;
  // New project dialog state
  showNewProjectDialog: boolean;
  openNewProjectDialog: () => void;
  closeNewProjectDialog: () => void;
  // Clear all chats callback - registered by ClaudeChat
  clearAllChats: () => void;
  registerClearChatsCallback: (callback: () => void) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [metadata, setMetadata] = useState<ProjectMetadata | null>(null);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [clearChatsCallback, setClearChatsCallback] = useState<(() => void) | null>(null);

  const clearMetadata = () => setMetadata(null);
  const openNewProjectDialog = useCallback(() => setShowNewProjectDialog(true), []);
  const closeNewProjectDialog = useCallback(() => setShowNewProjectDialog(false), []);

  // Register callback from ClaudeChat for clearing chats
  const registerClearChatsCallback = useCallback((callback: () => void) => {
    setClearChatsCallback(() => callback);
  }, []);

  // Clear all chats using registered callback
  const clearAllChats = useCallback(() => {
    if (clearChatsCallback) {
      clearChatsCallback();
    }
  }, [clearChatsCallback]);

  const value = useMemo(() => ({
    metadata,
    setMetadata,
    clearMetadata,
    showNewProjectDialog,
    openNewProjectDialog,
    closeNewProjectDialog,
    clearAllChats,
    registerClearChatsCallback,
  }), [metadata, showNewProjectDialog, openNewProjectDialog, closeNewProjectDialog, clearAllChats, registerClearChatsCallback]);

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
