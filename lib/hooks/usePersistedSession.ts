'use client';

import { useEffect, useState } from 'react';
import { ChatSession } from '@/components/leftsidebar';
import {
  type SessionState,
  validateSessionStateMap,
} from '@/lib/session-validator';
import {
  cleanupSessions,
  getStorageSize,
  CLEANUP_CONFIG,
} from '@/lib/session-cleanup';

export type { SessionState };

export function usePersistedSession() {
  const [sessionStateMap, setSessionStateMap] = useState<Record<string, SessionState>>({});
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  // Load from localStorage on mount with validation and cleanup
  useEffect(() => {
    const stateStored = localStorage.getItem('sessions:state');
    const sessionsStored = localStorage.getItem('sessions:list');

    let validatedState: Record<string, SessionState> = {};
    let sessionsList: ChatSession[] = [];

    // 1. Parse and validate session state
    if (stateStored) {
      try {
        const parsed = JSON.parse(stateStored);
        validatedState = validateSessionStateMap(parsed);

        const totalCount = Object.keys(parsed).length;
        const validCount = Object.keys(validatedState).length;
        if (validCount < totalCount) {
          console.warn(`[Session] Validated ${validCount}/${totalCount} sessions (${totalCount - validCount} corrupted)`);
        }
      } catch (e) {
        console.error('[Session] Failed to parse localStorage:', e);
      }
    }

    // 2. Parse sessions list
    if (sessionsStored) {
      try {
        const parsed = JSON.parse(sessionsStored);
        sessionsList = parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        }));
      } catch (e) {
        console.error('[Session] Failed to restore sessions list:', e);
      }
    }

    // 3. Run cleanup on validated sessions
    if (Object.keys(validatedState).length > 0) {
      const { cleaned, result } = cleanupSessions(validatedState);

      // Log cleanup results
      if (result.removedCount > 0) {
        console.log(`[Cleanup] Removed ${result.removedCount} old sessions`);
      }
      result.warnings.forEach(w => console.warn(`[Cleanup] ${w}`));

      // Update state with cleaned sessions
      validatedState = cleaned;

      // Update sessions list to match cleaned state
      const cleanedIds = new Set(Object.keys(cleaned));
      sessionsList = sessionsList.filter(s => cleanedIds.has(s.id));

      // Persist cleaned state immediately
      try {
        localStorage.setItem('sessions:state', JSON.stringify(cleaned));
        localStorage.setItem('sessions:list', JSON.stringify(sessionsList));
      } catch (e) {
        console.error('[Session] Failed to save cleaned state:', e);
      }
    }

    // 4. Set React state
    setSessionStateMap(validatedState);
    setChatSessions(sessionsList);

    // 5. Check overall storage usage
    const storageSize = getStorageSize();
    if (storageSize > CLEANUP_CONFIG.WARN_THRESHOLD_BYTES) {
      const sizeMB = (storageSize / 1024 / 1024).toFixed(2);
      console.warn(`[Storage] Total usage: ${sizeMB}MB (threshold: 4MB)`);
    }
  }, []);

  // Auto-save state map (debounced)
  useEffect(() => {
    if (Object.keys(sessionStateMap).length === 0) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem('sessions:state', JSON.stringify(sessionStateMap));
      } catch (e) {
        console.error('localStorage quota exceeded:', e);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [sessionStateMap]);

  // Auto-save sessions list (debounced)
  useEffect(() => {
    if (chatSessions.length === 0) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem('sessions:list', JSON.stringify(chatSessions));
      } catch (e) {
        console.error('localStorage quota exceeded:', e);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [chatSessions]);

  return { sessionStateMap, setSessionStateMap, chatSessions, setChatSessions };
}
