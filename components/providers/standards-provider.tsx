'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useProject } from './project-context';
import { getMergedStandards, getStandardsDefaults, type ProjectStandards } from '@/lib/standards';

interface StandardsContextValue {
  standards: ProjectStandards;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const StandardsContext = createContext<StandardsContextValue | null>(null);

export function StandardsProvider({ children }: { children: ReactNode }) {
  const { metadata } = useProject();
  const [standards, setStandards] = useState<ProjectStandards>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStandards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (metadata?.folderPath) {
        // Load project-specific standards merged with defaults
        const merged = await getMergedStandards(metadata.folderPath);
        setStandards(merged);
      } else {
        // No project - load just defaults
        const defaults = await getStandardsDefaults();
        setStandards(defaults);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load standards');
      // Fall back to defaults on error
      const defaults = await getStandardsDefaults();
      setStandards(defaults);
    } finally {
      setLoading(false);
    }
  }, [metadata?.folderPath]);

  // Load on mount and when project changes
  useEffect(() => {
    loadStandards();
  }, [loadStandards]);

  const value = {
    standards,
    loading,
    error,
    refresh: loadStandards,
  };

  return (
    <StandardsContext.Provider value={value}>
      {children}
    </StandardsContext.Provider>
  );
}

export function useStandards() {
  const context = useContext(StandardsContext);
  if (!context) {
    throw new Error('useStandards must be used within a StandardsProvider');
  }
  return context;
}
