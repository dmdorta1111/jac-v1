# Session Persistence Code Patterns for JAC-V1

**Purpose:** Ready-to-use code patterns implementing React 19 best practices

---

## Pattern 1: useSyncExternalStore Session Hook (React 19 Safe)

```typescript
// lib/hooks/useSessionStore.ts
'use client';

import { useSyncExternalStore } from 'react';

interface SessionState {
  messages: any[];
  flowState: Record<string, any>;
  currentStepOrder: number;
  filteredSteps: any[];
  itemNumber: string;
  validationErrors: Record<string, string>;
}

// External store (singleton, lives outside React)
class SessionStore {
  private store: Map<string, SessionState> = new Map();
  private subscribers = new Set<() => void>();

  subscribe(listener: () => void) {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  }

  getSnapshot() {
    return Object.fromEntries(this.store);
  }

  getServerSnapshot() {
    return {}; // No sessions on server
  }

  // Update session and notify React
  updateSession(sessionId: string, data: Partial<SessionState>) {
    const current = this.store.get(sessionId) || this.getDefaultState();
    this.store.set(sessionId, { ...current, ...data });

    // Debounced persist
    this.debouncedPersist();

    // Notify subscribers
    this.subscribers.forEach(fn => fn());
  }

  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  private debouncedPersist() {
    if (this.persistTimer) clearTimeout(this.persistTimer);

    this.persistTimer = setTimeout(() => {
      try {
        localStorage.setItem(
          'sessions:state',
          JSON.stringify(Object.fromEntries(this.store))
        );
      } catch (e) {
        console.error('localStorage write failed:', e);
      }
    }, 1000);
  }

  private getDefaultState(): SessionState {
    return {
      messages: [],
      flowState: {},
      currentStepOrder: 0,
      filteredSteps: [],
      itemNumber: '',
      validationErrors: {},
    };
  }

  // Restore from localStorage
  hydrate() {
    const persisted = localStorage.getItem('sessions:state');
    if (persisted) {
      try {
        const data = JSON.parse(persisted);
        Object.entries(data).forEach(([id, state]) => {
          this.store.set(id, state as SessionState);
        });
      } catch (e) {
        console.error('Failed to hydrate sessions:', e);
      }
    }
  }
}

export const sessionStore = new SessionStore();

// Hook for components
export function useSessionStore(sessionId: string) {
  const allSessions = useSyncExternalStore(
    (callback) => sessionStore.subscribe(callback),
    () => sessionStore.getSnapshot(),
    () => ({}) // getServerSnapshot
  );

  return {
    session: allSessions[sessionId],
    updateSession: (data: Partial<SessionState>) =>
      sessionStore.updateSession(sessionId, data),
  };
}

// Initialize on app startup
if (typeof window !== 'undefined') {
  sessionStore.hydrate();
}
```

**Usage in component:**
```typescript
function ClaudeChat({ sessionId }: { sessionId: string }) {
  const { session, updateSession } = useSessionStore(sessionId);

  const handleFormSubmit = (formData) => {
    updateSession({
      flowState: { ...session.flowState, ...formData },
      messages: [...session.messages, { role: 'user', content: formData }]
    });
  };

  return (
    <div>
      {session?.messages.map((msg, i) => (
        <div key={i}>{msg.content}</div>
      ))}
    </div>
  );
}
```

---

## Pattern 2: State Restoration with Validation

```typescript
// lib/flow-engine/flow-restoration.ts
import { FlowExecutor } from './executor';
import { FormFlow, FlowStep } from './loader';
import { loadFormTemplate } from '@/lib/form-templates';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Restore FlowExecutor after page reload
 * Validates state matches current form schema
 */
export async function restoreFlowExecutor(
  flow: FormFlow,
  sessionId: string,
  filteredSteps: FlowStep[]
): Promise<{ executor: FlowExecutor; validation: ValidationResult }> {
  // Load persisted state
  const persisted = JSON.parse(
    localStorage.getItem(`session:${sessionId}:state`) || '{}'
  );

  // Validate state integrity
  const validation = validateRestoredState(persisted, flow);

  if (!validation.valid) {
    console.error('State validation failed:', validation);
    // Fall back to fresh state
    const executor = new FlowExecutor(flow, filteredSteps, {});
    return { executor, validation };
  }

  // Restore executor
  const executor = new FlowExecutor(flow, filteredSteps, persisted);

  // Restore step position
  const nextStep = executor.findNextStep();
  if (nextStep) {
    const stepIndex = filteredSteps.findIndex(
      s => s.order === nextStep.order
    );
    executor.setCurrentStepIndex(stepIndex);
  }

  return { executor, validation };
}

/**
 * Validate restored state against form schema
 * Checks: field existence, type correctness, required fields
 */
function validateRestoredState(
  state: Record<string, any>,
  flow: FormFlow
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const stateKeys = new Set(Object.keys(state));

  // Get all valid field names from flow
  const validFields = new Set<string>();

  flow.steps.forEach(step => {
    try {
      const formSpec = loadFormTemplate(step.formTemplate);

      formSpec.sections.forEach(section => {
        section.fields.forEach(field => {
          validFields.add(field.name);

          // Type validation
          const value = state[field.name];
          if (value !== undefined && value !== null) {
            const expectedType = getExpectedType(field);
            const actualType = typeof value;

            if (!typeMatches(expectedType, actualType, value)) {
              errors.push(
                `Field ${field.name}: expected ${expectedType}, got ${actualType}`
              );
            }
          }
        });
      });
    } catch (e) {
      errors.push(`Failed to load form template ${step.formTemplate}`);
    }
  });

  // Warn about orphaned state keys (field was removed from schema)
  stateKeys.forEach(key => {
    if (!validFields.has(key)) {
      warnings.push(`Orphaned field in state: ${key}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function getExpectedType(field: any): string {
  switch (field.type) {
    case 'integer':
    case 'float':
    case 'slider':
      return 'number';
    case 'checkbox':
    case 'switch':
      return 'boolean';
    case 'table':
      return 'array';
    case 'select':
    case 'radio':
      return field.options?.[0]?.value ? typeof field.options[0].value : 'string';
    default:
      return 'string';
  }
}

function typeMatches(expected: string, actual: string, value: any): boolean {
  if (expected === actual) return true;

  // Allow number coercion
  if ((expected === 'number' && actual === 'string') && !isNaN(Number(value))) {
    return true;
  }

  // Allow array-like validation
  if (expected === 'array' && Array.isArray(value)) {
    return true;
  }

  return false;
}
```

**Usage:**
```typescript
const { executor, validation } = await restoreFlowExecutor(
  flow,
  sessionId,
  filteredSteps
);

if (!validation.valid) {
  console.error('Cannot restore session:', validation.errors);
  // Show user: "Your session data is corrupted. Starting fresh."
}

validation.warnings.forEach(w => console.warn(w));
```

---

## Pattern 3: Session Cleanup & Garbage Collection

```typescript
// lib/hooks/useSessionCleanup.ts
'use client';

import { useEffect } from 'react';

interface SessionMetadata {
  id: string;
  createdAt: number;
  lastAccessedAt: number;
  title: string;
}

const CLEANUP_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days
const STORAGE_WARNING_THRESHOLD = 4 * 1024 * 1024; // 4MB

/**
 * Clean up old and orphaned sessions
 * Runs once on app startup
 */
export function useSessionCleanup() {
  useEffect(() => {
    cleanupSessions();
  }, []); // Empty deps - run once on mount
}

function cleanupSessions() {
  try {
    const now = Date.now();
    const sessions = getSessions();
    const sizeEstimate = estimateStorageSize();

    // Rule 1: Remove sessions older than 7 days
    const validSessions = sessions.filter(s => {
      const age = now - s.lastAccessedAt;
      const isOld = age > CLEANUP_INTERVAL;

      if (isOld) {
        console.log(`Removing old session: ${s.id} (${age / 1000 / 60 / 60 / 24 | 0} days)`);
        removeSession(s.id);
      }

      return !isOld;
    });

    // Rule 2: If storage >4MB, remove oldest 10%
    if (sizeEstimate > STORAGE_WARNING_THRESHOLD) {
      const toRemove = Math.ceil(validSessions.length * 0.1);
      const sorted = validSessions.sort((a, b) =>
        a.lastAccessedAt - b.lastAccessedAt
      );

      sorted.slice(0, toRemove).forEach(s => {
        console.warn(`Storage full, removing: ${s.id}`);
        removeSession(s.id);
      });

      validSessions.splice(0, toRemove);
    }

    // Update sessions list
    localStorage.setItem('sessions:list', JSON.stringify(validSessions));

    console.log(`Cleanup complete: ${validSessions.length} sessions retained`);
  } catch (e) {
    console.error('Session cleanup failed:', e);
  }
}

function getSessions(): SessionMetadata[] {
  try {
    const stored = localStorage.getItem('sessions:list') || '[]';
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse sessions:', e);
    return [];
  }
}

function removeSession(sessionId: string) {
  localStorage.removeItem(`session:${sessionId}:state`);
  localStorage.removeItem(`session:${sessionId}:messages`);
  localStorage.removeItem(`session:${sessionId}:meta`);
}

function estimateStorageSize(): number {
  let size = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      size += localStorage[key].length + key.length;
    }
  }
  return size;
}

/**
 * Update session access time (call when user opens session)
 */
export function updateSessionAccess(sessionId: string) {
  const sessions = getSessions();
  const session = sessions.find(s => s.id === sessionId);

  if (session) {
    session.lastAccessedAt = Date.now();
    localStorage.setItem('sessions:list', JSON.stringify(sessions));
  }
}
```

**Usage in ClaudeChat:**
```typescript
function ClaudeChat({ sessionId }: { sessionId: string }) {
  // Cleanup once on app startup
  useSessionCleanup();

  // Update access time when opening session
  useEffect(() => {
    updateSessionAccess(sessionId);
  }, [sessionId]);

  return <div>{/* form content */}</div>;
}
```

---

## Pattern 4: Cross-Tab Synchronization (Optional)

```typescript
// lib/hooks/useCrossTabSync.ts
'use client';

import { useEffect } from 'react';

/**
 * Sync session state across browser tabs
 * When one tab updates localStorage, others are notified
 */
export function useCrossTabSync(
  sessionId: string,
  onUpdate: (state: Record<string, any>) => void
) {
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Only process session state changes
      if (!e.key?.startsWith(`session:${sessionId}`)) {
        return;
      }

      if (e.newValue) {
        try {
          const state = JSON.parse(e.newValue);
          onUpdate(state);
          console.log('Session synced from another tab');
        } catch (err) {
          console.error('Failed to sync session:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [sessionId, onUpdate]);
}
```

---

## Pattern 5: Loading State & Hydration Handling

```typescript
// lib/hooks/useClientHydration.ts
'use client';

import { useEffect, useState } from 'react';

/**
 * Handle client-side hydration delay in Next.js
 * Prevents hydration mismatch when component depends on localStorage
 */
export function useClientHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

// In component:
function ClaudeChat() {
  const isHydrated = useClientHydration();

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  return <div>{/* actual content */}</div>;
}
```

---

## Pattern 6: Debounced Saves with Transition (React 19)

```typescript
// lib/hooks/useDebouncedSave.ts
'use client';

import { useCallback, useTransition } from 'react';

type SaveFn = (data: any) => void | Promise<void>;

/**
 * Debounced save with React 19 Transition
 * Updates don't block UI rendering
 */
export function useDebouncedSave(
  saveFn: SaveFn,
  delayMs = 1000
) {
  const [isPending, startTransition] = useTransition();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedSave = useCallback((data: any) => {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      startTransition(async () => {
        try {
          await saveFn(data);
        } catch (err) {
          console.error('Save failed:', err);
        }
      });
    }, delayMs);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [saveFn, delayMs]);

  return { debouncedSave, isPending };
}

// Usage:
const { debouncedSave, isPending } = useDebouncedSave(
  (data) => {
    localStorage.setItem('session:state', JSON.stringify(data));
  },
  1000
);

const handleFormChange = (formData) => {
  debouncedSave(formData);
  // User sees immediate feedback even if save is pending
};
```

---

## Migration Checklist

- [ ] Add state validation on restoration (Pattern 2)
- [ ] Implement session cleanup (Pattern 3)
- [ ] Add `useSessionCleanup()` to root layout
- [ ] Call `updateSessionAccess()` when opening session
- [ ] Test localStorage quota errors with >5MB
- [ ] Add error boundary around persistence hooks
- [ ] Document session metadata schema
- [ ] Plan useSyncExternalStore migration for Phase 2

---

## Testing Utilities

```typescript
// lib/testing/storage-mock.ts
export function mockLocalStorage() {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() {
      return Object.keys(store).length;
    }
  };
}

// In tests:
const storage = mockLocalStorage();
Object.defineProperty(window, 'localStorage', {
  value: storage,
  writable: true
});
```
