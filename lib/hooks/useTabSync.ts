'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Multi-Tab Synchronization using BroadcastChannel API.
 * Allows tabs to communicate session state changes in real-time.
 */

export type SyncEventType =
  | 'SESSION_CREATED'
  | 'SESSION_DELETED'
  | 'SESSION_UPDATED'
  | 'SESSIONS_RELOADED';

export interface SyncEvent {
  type: SyncEventType;
  payload: unknown;
  sourceTabId: string;
  timestamp: number;
}

// Unique ID for this tab instance
const TAB_ID = typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).substring(2)}`;

/**
 * Hook for cross-tab communication via BroadcastChannel.
 *
 * @param channelName - Name of the broadcast channel
 * @param onMessage - Callback when receiving messages from other tabs
 * @returns broadcast function and tab ID
 */
export function useTabSync(
  channelName: string,
  onMessage: (event: SyncEvent) => void
) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const isProcessingRef = useRef(false);
  const onMessageRef = useRef(onMessage);

  // Keep callback ref updated
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    // Check if BroadcastChannel is supported
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
      console.warn('[TabSync] BroadcastChannel not supported');
      return;
    }

    const channel = new BroadcastChannel(channelName);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<SyncEvent>) => {
      // Ignore messages from this tab
      if (event.data.sourceTabId === TAB_ID) return;

      // Prevent processing loops
      if (isProcessingRef.current) return;

      isProcessingRef.current = true;
      try {
        onMessageRef.current(event.data);
      } finally {
        // Small delay to prevent rapid successive updates
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 50);
      }
    };

    console.log(`[TabSync] Connected to channel: ${channelName} (Tab: ${TAB_ID.slice(0, 8)}...)`);

    return () => {
      channel.close();
      channelRef.current = null;
      console.log(`[TabSync] Disconnected from channel: ${channelName}`);
    };
  }, [channelName]);

  const broadcast = useCallback((type: SyncEventType, payload: unknown) => {
    if (channelRef.current && !isProcessingRef.current) {
      const event: SyncEvent = {
        type,
        payload,
        sourceTabId: TAB_ID,
        timestamp: Date.now(),
      };
      channelRef.current.postMessage(event);
    }
  }, []);

  return { broadcast, tabId: TAB_ID };
}
