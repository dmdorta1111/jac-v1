'use client';

import { useEffect } from 'react';
import { useProject } from '@/components/providers/project-context';

/**
 * Hook to persist project metadata to localStorage
 * Loads state on mount and auto-saves changes with 1s debounce
 */
export function usePersistedProject() {
  const { metadata, setMetadata } = useProject();

  // Load on mount (once)
  useEffect(() => {
    const stored = localStorage.getItem('project:root');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMetadata(parsed);
      } catch (e) {
        console.error('Failed to restore project:', e);
      }
    }
  }, [setMetadata]);

  // Debounced auto-save (1s delay)
  useEffect(() => {
    if (!metadata) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem('project:root', JSON.stringify(metadata));
      } catch (e) {
        console.error('localStorage quota exceeded:', e);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [metadata]);

  return metadata;
}
