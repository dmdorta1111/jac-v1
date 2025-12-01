'use client';

import { useCallback } from 'react';
import { useTabSync, type SyncEvent } from './useTabSync';
import type { ChatSession } from '@/components/LeftSideBar';
import type { SessionState } from '@/lib/session-validator';

/**
 * Session-specific synchronization hook.
 * Handles cross-tab sync for session CRUD operations.
 */
export function useSessionSync(
  setChatSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>,
  setSessionStateMap: React.Dispatch<React.SetStateAction<Record<string, SessionState>>>,
  currentSessionId: string | null
) {
  const handleSyncMessage = useCallback((event: SyncEvent) => {
    console.log(`[SessionSync] Received: ${event.type}`);

    switch (event.type) {
      case 'SESSION_CREATED': {
        const newSession = event.payload as ChatSession;
        setChatSessions(prev => {
          // Check if already exists (prevent duplicates)
          if (prev.find(s => s.id === newSession.id)) {
            console.log(`[SessionSync] Session ${newSession.id.slice(0, 8)}... already exists`);
            return prev;
          }
          console.log(`[SessionSync] Adding session: ${newSession.title}`);
          return [...prev, {
            ...newSession,
            // Ensure dates are Date objects
            createdAt: new Date(newSession.createdAt),
            updatedAt: new Date(newSession.updatedAt),
          }];
        });
        break;
      }

      case 'SESSION_DELETED': {
        const sessionId = event.payload as string;
        console.log(`[SessionSync] Removing session: ${sessionId.slice(0, 8)}...`);
        setChatSessions(prev => prev.filter(s => s.id !== sessionId));
        setSessionStateMap(prev => {
          const next = { ...prev };
          delete next[sessionId];
          return next;
        });
        break;
      }

      case 'SESSION_UPDATED': {
        const { sessionId, state } = event.payload as {
          sessionId: string;
          state: SessionState;
        };

        // Only update if not currently editing this session
        // (prevents overwriting local changes while user is typing)
        if (sessionId !== currentSessionId) {
          setSessionStateMap(prev => ({
            ...prev,
            [sessionId]: state,
          }));
        } else {
          console.log(`[SessionSync] Skipping update for active session`);
        }
        break;
      }

      case 'SESSIONS_RELOADED': {
        const { sessions, stateMap } = event.payload as {
          sessions: ChatSession[];
          stateMap: Record<string, SessionState>;
        };
        console.log(`[SessionSync] Reloading ${sessions.length} sessions`);
        setChatSessions(sessions.map(s => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        })));
        setSessionStateMap(stateMap);
        break;
      }
    }
  }, [setChatSessions, setSessionStateMap, currentSessionId]);

  const { broadcast, tabId } = useTabSync('jac-sessions', handleSyncMessage);

  return {
    tabId,

    broadcastSessionCreated: useCallback((session: ChatSession) => {
      broadcast('SESSION_CREATED', session);
    }, [broadcast]),

    broadcastSessionDeleted: useCallback((sessionId: string) => {
      broadcast('SESSION_DELETED', sessionId);
    }, [broadcast]),

    broadcastSessionUpdated: useCallback((sessionId: string, state: SessionState) => {
      broadcast('SESSION_UPDATED', { sessionId, state });
    }, [broadcast]),

    broadcastSessionsReloaded: useCallback((
      sessions: ChatSession[],
      stateMap: Record<string, SessionState>
    ) => {
      broadcast('SESSIONS_RELOADED', { sessions, stateMap });
    }, [broadcast]),
  };
}
