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
  activeFormData: Record<string, any>; // Unsaved form data for session persistence
  completedFormIds: string[]; // Track completed form steps for tab navigation
  tableSelections: Record<string, number>; // Session-scoped table row selections (fieldName -> rowIndex)
  highestStepReached: number; // Track furthest step visited for forward navigation
  lastAccessedAt?: number;
  projectPath?: string; // Project folder path for isolation (e.g., "project-docs/SDI/SO123")
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
export function createFreshSessionState(itemNumber: string = '', projectPath?: string): SessionState {
  return {
    messages: [],
    flowState: {},
    currentStepOrder: 0,
    filteredSteps: [],
    itemNumber,
    validationErrors: {},
    activeFormData: {},
    completedFormIds: [],
    tableSelections: {},
    highestStepReached: 0,
    lastAccessedAt: Date.now(),
    projectPath,
  };
}

/**
 * Validates and filters a session state map, dropping corrupted entries.
 * Returns a clean map with only valid sessions.
 * @param parsed - Raw parsed data from localStorage
 * @param currentProjectPath - Optional project path to filter sessions by
 */
export function validateSessionStateMap(
  parsed: unknown,
  currentProjectPath?: string | null
): Record<string, SessionState> {
  if (!parsed || typeof parsed !== 'object') {
    console.warn('[Session] Invalid state map: not an object');
    return {};
  }

  const validated: Record<string, SessionState> = {};
  let filteredCount = 0;

  Object.entries(parsed as Record<string, unknown>).forEach(([id, state]) => {
    if (validateSessionState(state)) {
      // Add missing fields (migration from older format)
      const completedIds = state.completedFormIds ?? [];
      // Migration fallback chain for highestStepReached:
      // 1. Use existing value if set
      // 2. Fall back to completedFormIds length if available
      // 3. Fall back to currentStepOrder (the step they're currently on)
      // 4. Default to 0 for completely new sessions
      const migratedHighestStep = state.highestStepReached
        ?? (completedIds.length > 0 ? completedIds.length : state.currentStepOrder)
        ?? 0;

      const sessionProjectPath = state.projectPath;

      // Project isolation: only include sessions matching current project
      // Legacy sessions (no projectPath) are included for backward compatibility
      const projectMatches = !currentProjectPath ||
                            !sessionProjectPath ||
                            sessionProjectPath === currentProjectPath;

      if (projectMatches) {
        validated[id] = {
          ...state,
          activeFormData: state.activeFormData ?? {},
          completedFormIds: completedIds,
          tableSelections: state.tableSelections ?? {},
          highestStepReached: migratedHighestStep,
          lastAccessedAt: state.lastAccessedAt ?? Date.now(),
          projectPath: sessionProjectPath,
        };
      } else {
        filteredCount++;
      }
    } else {
      console.warn(`[Session] Dropping corrupted session: ${id}`);
    }
  });

  if (filteredCount > 0) {
    console.log(`[Session] Filtered ${filteredCount} sessions from other projects`);
  }

  return validated;
}
