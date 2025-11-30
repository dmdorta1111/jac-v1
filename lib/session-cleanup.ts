'use client';

/**
 * Session Cleanup Utility
 * Automatically removes old sessions to prevent localStorage bloat.
 * Runs on app load in usePersistedSession hook.
 */

import { SessionState } from './session-validator';

export const CLEANUP_CONFIG = {
  MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000,  // 7 days
  WARN_THRESHOLD_BYTES: 4 * 1024 * 1024, // 4MB
};

export interface CleanupResult {
  removedCount: number;
  keptCount: number;
  storageSizeBytes: number;
  warnings: string[];
}

/**
 * Determines if a session flow is complete.
 * A flow is complete if:
 * - No steps exist (no flow active)
 * - Current step >= total steps (finished all steps)
 */
function isFlowComplete(state: SessionState): boolean {
  if (!state.filteredSteps || state.filteredSteps.length === 0) {
    // No flow active - consider complete for cleanup purposes
    return true;
  }
  return state.currentStepOrder >= state.filteredSteps.length;
}

/**
 * Cleans up old sessions based on age and completion status.
 * - Removes sessions > 7 days old AND flow complete
 * - Keeps old incomplete sessions (with warning)
 * - Keeps all recent sessions
 */
export function cleanupSessions(
  sessions: Record<string, SessionState>
): { cleaned: Record<string, SessionState>; result: CleanupResult } {
  const now = Date.now();
  const cleaned: Record<string, SessionState> = {};
  const result: CleanupResult = {
    removedCount: 0,
    keptCount: 0,
    storageSizeBytes: 0,
    warnings: [],
  };

  Object.entries(sessions).forEach(([id, state]) => {
    const lastAccess = state.lastAccessedAt || 0;
    const age = now - lastAccess;
    const isOld = age > CLEANUP_CONFIG.MAX_AGE_MS;
    const isComplete = isFlowComplete(state);

    if (isOld && isComplete) {
      // Old AND complete: safe to delete
      result.removedCount++;
      console.log(`[Cleanup] Removed old session: ${id} (age: ${Math.round(age / 86400000)}d)`);
    } else if (isOld && !isComplete) {
      // Old but incomplete: keep but warn
      cleaned[id] = state;
      result.keptCount++;
      const itemInfo = state.itemNumber ? `Item ${state.itemNumber}` : 'Unknown item';
      result.warnings.push(`Session ${id.slice(0, 8)}... (${itemInfo}) is old but incomplete - keeping`);
    } else {
      // Not old: keep
      cleaned[id] = state;
      result.keptCount++;
    }
  });

  // Calculate storage size of cleaned sessions
  try {
    result.storageSizeBytes = new Blob([JSON.stringify(cleaned)]).size;
  } catch {
    // Fallback: estimate based on string length
    result.storageSizeBytes = JSON.stringify(cleaned).length * 2;
  }

  if (result.storageSizeBytes > CLEANUP_CONFIG.WARN_THRESHOLD_BYTES) {
    const sizeMB = (result.storageSizeBytes / 1024 / 1024).toFixed(2);
    result.warnings.push(`Storage usage high: ${sizeMB}MB (threshold: 4MB)`);
  }

  return { cleaned, result };
}

/**
 * Gets total localStorage usage for session-related keys.
 * Returns size in bytes.
 */
export function getStorageSize(): number {
  if (typeof window === 'undefined') return 0;

  let total = 0;
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('sessions:') || key.startsWith('project:')) {
        const value = localStorage.getItem(key);
        if (value) {
          total += value.length * 2; // UTF-16 = 2 bytes per char
        }
      }
    }
  } catch (e) {
    console.error('[Storage] Failed to calculate size:', e);
  }
  return total;
}

/**
 * Force cleanup - can be called manually for debugging.
 * Exposed on window object in development.
 */
export function forceCleanup(): CleanupResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const storedState = localStorage.getItem('sessions:state');
    const storedList = localStorage.getItem('sessions:list');

    if (!storedState) {
      console.log('[Cleanup] No sessions to clean');
      return null;
    }

    const parsedState = JSON.parse(storedState);
    const { cleaned, result } = cleanupSessions(parsedState);

    // Save cleaned state
    localStorage.setItem('sessions:state', JSON.stringify(cleaned));

    // Update sessions list to remove deleted sessions
    if (storedList) {
      const parsedList = JSON.parse(storedList);
      const cleanedIds = new Set(Object.keys(cleaned));
      const filteredList = parsedList.filter((s: { id: string }) => cleanedIds.has(s.id));
      localStorage.setItem('sessions:list', JSON.stringify(filteredList));
    }

    console.log(`[Cleanup] Force cleanup complete: ${result.removedCount} removed, ${result.keptCount} kept`);
    return result;
  } catch (e) {
    console.error('[Cleanup] Force cleanup failed:', e);
    return null;
  }
}

// Expose forceCleanup in development for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__forceSessionCleanup = forceCleanup;
}
