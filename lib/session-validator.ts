'use client';

/**
 * Session State Validation Utility
 * Validates session state structure before restoring from localStorage
 * to prevent crashes from corrupted data.
 */

export interface SessionState {
  messages: any[];
  flowState: Record<string, any>;
  currentStepOrder: number;
  filteredSteps: any[];
  itemNumber: string;
  validationErrors: Record<string, string>;
  lastAccessedAt?: number;
}

/**
 * Validates that a parsed object has the expected SessionState structure.
 * Returns true if valid, false if corrupted/malformed.
 */
export function validateSessionState(state: unknown): state is SessionState {
  if (!state || typeof state !== 'object') {
    console.warn('[Session] Invalid state: not an object');
    return false;
  }

  const s = state as Record<string, unknown>;

  if (!Array.isArray(s.messages)) {
    console.warn('[Session] Invalid state: messages not array');
    return false;
  }

  if (s.flowState !== null && typeof s.flowState !== 'object') {
    console.warn('[Session] Invalid state: flowState not object');
    return false;
  }

  if (typeof s.currentStepOrder !== 'number') {
    console.warn('[Session] Invalid state: currentStepOrder not number');
    return false;
  }

  if (!Array.isArray(s.filteredSteps)) {
    console.warn('[Session] Invalid state: filteredSteps not array');
    return false;
  }

  // itemNumber can be string or undefined (for older sessions)
  if (s.itemNumber !== undefined && typeof s.itemNumber !== 'string') {
    console.warn('[Session] Invalid state: itemNumber not string');
    return false;
  }

  return true;
}

/**
 * Creates a fresh session state with defaults.
 * Used when validation fails or for new sessions.
 */
export function createFreshSessionState(itemNumber: string = ''): SessionState {
  return {
    messages: [],
    flowState: {},
    currentStepOrder: 0,
    filteredSteps: [],
    itemNumber,
    validationErrors: {},
    lastAccessedAt: Date.now(),
  };
}

/**
 * Validates and filters a session state map, dropping corrupted entries.
 * Returns a clean map with only valid sessions.
 */
export function validateSessionStateMap(
  parsed: unknown
): Record<string, SessionState> {
  if (!parsed || typeof parsed !== 'object') {
    console.warn('[Session] Invalid state map: not an object');
    return {};
  }

  const validated: Record<string, SessionState> = {};

  Object.entries(parsed as Record<string, unknown>).forEach(([id, state]) => {
    if (validateSessionState(state)) {
      // Add lastAccessedAt if missing (migration from older format)
      validated[id] = {
        ...state,
        lastAccessedAt: state.lastAccessedAt ?? Date.now(),
      };
    } else {
      console.warn(`[Session] Dropping corrupted session: ${id}`);
    }
  });

  return validated;
}
