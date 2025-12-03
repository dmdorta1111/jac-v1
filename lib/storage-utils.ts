'use client';

/**
 * Storage Utility for managing localStorage with project scoping.
 * Provides pattern-based cleanup for project transitions.
 */

// Project-scoped key patterns (will be cleaned on project switch)
const PROJECT_SCOPED_PATTERNS = [
  /^session-states-/,           // Session persistence
  /^sessions:/,                 // Session list and state
  /^flow-state-/,               // Flow executor state
  /^project-cache-/,            // Project-specific cache
  /^item-draft-/,               // Draft items
] as const;

// Preserved key patterns (never cleaned)
const PRESERVED_PATTERNS = [
  /^user-preferences-/,         // User settings
  /^theme-/,                    // Theme preferences
  /^recent-projects$/,          // Recent projects list
] as const;

/**
 * Check if key should be cleaned on project transition.
 */
export const isProjectScopedKey = (key: string): boolean => {
  // Never clean preserved keys
  if (PRESERVED_PATTERNS.some(pattern => pattern.test(key))) {
    return false;
  }

  // Clean if matches project-scoped pattern
  return PROJECT_SCOPED_PATTERNS.some(pattern => pattern.test(key));
};

/**
 * Clean all project-scoped localStorage keys.
 * Called during project transitions to prevent state leakage.
 */
export const cleanProjectScopedStorage = (): void => {
  if (typeof window === 'undefined') return;

  try {
    const keysToRemove: string[] = [];

    // Collect keys to remove
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && isProjectScopedKey(key)) {
        keysToRemove.push(key);
      }
    }

    // Remove collected keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    if (keysToRemove.length > 0) {
      console.log(`[Storage] Cleaned ${keysToRemove.length} project-scoped keys:`, keysToRemove);
    }
  } catch (error) {
    console.error('[Storage] Cleanup error:', error);
  }
};

/**
 * Audit current localStorage usage.
 * Returns categorization of all keys for debugging.
 */
export const auditStorage = (): {
  projectScoped: string[];
  preserved: string[];
  other: string[];
  totalSize: number;
} => {
  if (typeof window === 'undefined') {
    return { projectScoped: [], preserved: [], other: [], totalSize: 0 };
  }

  const result = {
    projectScoped: [] as string[],
    preserved: [] as string[],
    other: [] as string[],
    totalSize: 0,
  };

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const value = localStorage.getItem(key) || '';
      result.totalSize += key.length + value.length;

      if (PRESERVED_PATTERNS.some(p => p.test(key))) {
        result.preserved.push(key);
      } else if (PROJECT_SCOPED_PATTERNS.some(p => p.test(key))) {
        result.projectScoped.push(key);
      } else {
        result.other.push(key);
      }
    }
  } catch (error) {
    console.error('[Storage] Audit error:', error);
  }

  return result;
};

/**
 * Expose audit function to console in development mode.
 * Usage: window.__auditStorage() in browser console
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as unknown as Record<string, unknown>).__auditStorage = () => {
    const audit = auditStorage();
    console.log('=== localStorage Audit ===');
    console.log('Project-scoped (will be cleaned):', audit.projectScoped);
    console.log('Preserved (kept across projects):', audit.preserved);
    console.log('Other (unclassified):', audit.other);
    console.log(`Total size: ${(audit.totalSize / 1024).toFixed(2)} KB`);
    return audit;
  };
}
