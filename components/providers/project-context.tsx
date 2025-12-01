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
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [metadata, setMetadata] = useState<ProjectMetadata | null>(null);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);

  const clearMetadata = () => setMetadata(null);
  const openNewProjectDialog = useCallback(() => setShowNewProjectDialog(true), []);
  const closeNewProjectDialog = useCallback(() => setShowNewProjectDialog(false), []);

  const value = useMemo(() => ({
    metadata,
    setMetadata,
    clearMetadata,
    showNewProjectDialog,
    openNewProjectDialog,
    closeNewProjectDialog,
  }), [metadata, showNewProjectDialog, openNewProjectDialog, closeNewProjectDialog]);

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
