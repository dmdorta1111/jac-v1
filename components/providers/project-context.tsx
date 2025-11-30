'use client';

import { createContext, useContext, useState, useMemo, ReactNode } from 'react';

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
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [metadata, setMetadata] = useState<ProjectMetadata | null>(null);

  const clearMetadata = () => setMetadata(null);

  const value = useMemo(() => ({
    metadata,
    setMetadata,
    clearMetadata
  }), [metadata]);

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
