# React 19 + Next.js 15: State Persistence & Session Management Research

**Date:** 2025-11-29
**Status:** Research Complete
**Target:** JAC-V1 Session State Architecture

## Executive Summary

Your current implementation uses `useState` + `useEffect` + localStorage with 1s debounce. This is **functional but introduces concurrent rendering risks** in React 19. Key findings: (1) switch to `useSyncExternalStore` for concurrent safety, (2) localStorage is appropriate for ~10KB session data, (3) consider IndexedDB only if exceeding 5MB, (4) implement state validation on restoration, (5) add session cleanup strategy.

---

## 1. State Persistence Patterns (React 19 Specific)

### Current Approach Assessment
Your hooks (`usePersistedSession`, `usePersistedProject`) follow a basic pattern:
```typescript
// Pattern: useState + useEffect + debounce
const [state, setState] = useState({});
useEffect(() => {
  const stored = localStorage.getItem('key');
  setState(JSON.parse(stored)); // Load on mount
}, []);
useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem('key', JSON.stringify(state));
  }, 1000); // Debounced auto-save
  return () => clearTimeout(timer);
}, [state]);
```

**Risks in React 19:**
- Concurrent rendering can cause **UI tearing** (components see inconsistent snapshots)
- External store (localStorage) updates between render pauses without React knowing
- Race conditions between state updates and persistence writes

### Recommended: useSyncExternalStore Pattern

React 19 requires external stores to use `useSyncExternalStore` to prevent tearing. This hook:
- Guarantees all components see same snapshot during concurrent renders
- Handles subscription/unsubscription cleanly
- Supports SSR with `getServerSnapshot`

**Migration pattern** (pseudocode):
```typescript
import { useSyncExternalStore } from 'react';

// Create external store (once, outside component)
const sessionStore = {
  state: {},
  subscribers: Set<() => void>,

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  },

  getSnapshot() {
    return this.state; // Must return same object if unchanged
  },

  setState(newState) {
    this.state = newState;
    this.subscribers.forEach(cb => cb());
  }
};

// In component:
const snapshot = useSyncExternalStore(
  (callback) => sessionStore.subscribe(callback),
  () => sessionStore.getSnapshot(),
  () => null // getServerSnapshot for SSR
);
```

**Trade-offs:**
- More boilerplate but prevents tearing
- Fine-grained reactivity (changes trigger immediate re-renders)
- Better with Suspense compatibility
- Redux/Zustand use this internally

**Recommendation:** Migrate for production safety, but current impl works for MVP if React 19 concurrent features not heavily used yet.

---

## 2. localStorage vs IndexedDB Decision Matrix

| Criterion | localStorage | IndexedDB |
|-----------|--------------|-----------|
| **Capacity** | ~5MB | 100MB+ |
| **Data Format** | Strings only (JSON) | Objects, blobs, nested |
| **API** | Sync (blocking) | Async (non-blocking) |
| **Querying** | Key lookup only | Complex queries, indexes |
| **Service Worker** | No access | Full access |
| **Complexity** | Simple | Moderate |

### For JAC-V1 Decision

**Current:** sessionStateMap ~10KB per session, ~5 concurrent sessions = ~50KB max
**Storage:** localStorage is **CORRECT CHOICE** because:
1. Data fits comfortably within 5MB limit (100x buffer)
2. Synchronous API fine for small, infrequent writes
3. Simple key-value pattern (no complex queries)
4. Service worker not required yet

**When to switch to IndexedDB:**
- Data exceeds 50MB
- Need offline-first with service workers
- Complex nested structures requiring queries
- Multiple sessions with file attachments (blobs)

**Action:** Stick with localStorage for now, plan IndexedDB migration if app grows.

---

## 3. Auto-Save Debounce Timing Analysis

### Current: 1000ms Debounce

**Assessment:**
- ✅ Safe from quota errors (small payloads)
- ✅ Reduces I/O (localStorage is synchronous, blocks event loop)
- ✅ Typical for form drafts
- ⚠️ User loses 1s of work on crash (acceptable for forms)

### Timing Recommendations

```
User input → 500ms debounce → Save (fast feedback)    [Too aggressive]
User input → 1000ms debounce → Save (form drafts)     [Current - Good]
User input → 2000ms debounce → Save (long documents)  [Safer but slower]
```

**React 19 optimization:**
- Use `useTransition` hook for non-blocking saves:
```typescript
const [isPending, startTransition] = useTransition();

const debouncedSave = useCallback(
  debounce((data) => {
    startTransition(() => {
      localStorage.setItem('key', JSON.stringify(data));
    });
  }, 1000),
  []
);
```

**Recommendation:** Keep 1000ms, add user feedback with `isPending` state.

---

## 4. FlowExecutor State Restoration Best Practices

Your `FlowExecutor` class maintains state machine:
```typescript
class FlowExecutor {
  state: Record<string, any>;
  currentStepIndex: number;
  filteredSteps: FlowStep[];

  updateState(stepId, data) { /* merge logic */ }
  findNextStep() { /* condition evaluation */ }
}
```

### Restoration Strategy (After Page Reload)

**Problem:** FlowExecutor lost when page reloads; need to rebuild machine + state

**Solution pattern:**
```typescript
export async function restoreFlowExecutor(
  flow: FormFlow,
  sessionId: string
): Promise<FlowExecutor> {
  // 1. Load persisted state
  const persisted = JSON.parse(
    localStorage.getItem(`session:${sessionId}:state`) || '{}'
  );

  // 2. Rebuild FlowExecutor with restored state
  const filteredSteps = filterSteps(flow.steps, persisted);
  const executor = new FlowExecutor(flow, filteredSteps, persisted);

  // 3. Validate state integrity
  const validation = validateRestoredState(persisted, flow);
  if (!validation.valid) {
    console.error('Corrupted state:', validation.errors);
    // Fallback to fresh start
    return new FlowExecutor(flow, filteredSteps, {});
  }

  // 4. Restore step position
  const nextStep = executor.findNextStep();
  if (nextStep) {
    executor.setCurrentStepIndex(
      filteredSteps.findIndex(s => s.order === nextStep.order)
    );
  }

  return executor;
}

function validateRestoredState(
  state: Record<string, any>,
  flow: FormFlow
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate field types match flow definitions
  flow.steps.forEach(step => {
    const formSpec = loadFormTemplate(step.formTemplate);
    formSpec.sections.forEach(section => {
      section.fields.forEach(field => {
        if (state[field.name] !== undefined) {
          // Type validation logic
          const actualType = typeof state[field.name];
          // Compare with expected type
        }
      });
    });
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
```

**Key principles:**
1. **Always validate** restored state against current form schema
2. **Detect schema mismatches** (field renamed, type changed)
3. **Fail gracefully** (reset to initial state if corrupted)
4. **Log restoration** for debugging

---

## 5. Session Cleanup & Garbage Collection

### Problem: Orphaned Sessions

localStorage has no expiry mechanism—old sessions accumulate forever.

### Cleanup Strategy

```typescript
interface SessionMetadata {
  id: string;
  createdAt: number;
  lastAccessedAt: number;
  status: 'active' | 'abandoned';
}

export function cleanupOldSessions(maxAgeDays = 7) {
  const now = Date.now();
  const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;

  // 1. Load all session metadata
  const sessions = JSON.parse(
    localStorage.getItem('sessions:list') || '[]'
  ) as SessionMetadata[];

  // 2. Mark abandoned (not accessed in 7+ days)
  const validSessions = sessions.filter(s => {
    const age = now - s.lastAccessedAt;
    return age < maxAge;
  });

  // 3. Delete orphaned data
  sessions.forEach(s => {
    if (!validSessions.find(vs => vs.id === s.id)) {
      localStorage.removeItem(`session:${s.id}:state`);
      localStorage.removeItem(`session:${s.id}:messages`);
    }
  });

  // 4. Update sessions list
  localStorage.setItem('sessions:list', JSON.stringify(validSessions));
}

// Run on app initialization (not on every render!)
useEffect(() => {
  cleanupOldSessions(7); // Weekly cleanup
}, []); // Empty deps - run once on mount
```

**Detection strategies:**
- **lastAccessedAt:** Update on session access
- **Size check:** If localStorage > 4MB, trigger cleanup
- **Age threshold:** Default 7 days (configurable)

**Recommendation:** Implement cleanup on app startup + weekly background check.

---

## 6. Concurrent Rendering Considerations for JAC-V1

### Your Current Risks

1. **sessionStateMap state + FlowExecutor**
   - Multiple session objects updated independently
   - Risk: UI shows different session data in parent vs children

2. **Form validation loop**
   - setState during form submission
   - Concurrent pause could show stale validation errors

3. **Multi-step flow**
   - filteredSteps computed from state
   - Could diverge if state changes mid-render

### Mitigation (Not Urgent if Not Using Suspense)

If NOT using React 19 Suspense:
- Current approach is safe (sequential rendering default in most cases)
- No changes needed

If USING React 19 Suspense or Transitions:
- Migrate critical stores to `useSyncExternalStore`
- Wrap state updates in `useTransition` for non-blocking saves
- Use `useOptimistic` for optimistic form submissions

```typescript
// If you add Suspense later:
const [optimisticState, addOptimistic] = useOptimistic(sessionState);
const [isPending, startTransition] = useTransition();

const submitForm = async (data) => {
  addOptimistic({ ...state, [formId]: data }); // UI updates immediately
  startTransition(async () => {
    const result = await saveFormData(data);
    setSessionStateMap(prev => ({
      ...prev,
      [sessionId]: result
    }));
  });
};
```

---

## 7. SSR Hydration Challenges in Next.js 15

### Problem: Double Render Hydration Mismatch

Next.js renders on server → sends HTML → hydrates on client
If client state (localStorage) differs from server state, hydration error.

### Solution: Suppress Hydration Check for External State

```typescript
import { useEffect, useState } from 'react';

export function useClientOnly<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage AFTER hydration
    const stored = localStorage.getItem('key');
    if (stored) {
      setValue(JSON.parse(stored));
    }
    setMounted(true);
  }, []);

  // Suppress hydration warning
  if (!mounted) {
    return initialValue; // Server-rendered value
  }

  return value;
}
```

Or use `suppressHydrationWarning` in your ClaudeChat component:
```tsx
<div suppressHydrationWarning>
  {/* Content that depends on localStorage */}
</div>
```

---

## Implementation Priority

### Phase 1 (Immediate)
- [ ] Add state validation on FlowExecutor restoration
- [ ] Implement session cleanup (7-day purge)
- [ ] Add logging for debugging persistence
- [ ] Document state schema version

### Phase 2 (Next Sprint)
- [ ] Migrate usePersistedSession → useSyncExternalStore
- [ ] Add session metadata (createdAt, lastAccessedAt)
- [ ] Implement isPending feedback UI for saves

### Phase 3 (Future)
- [ ] Add IndexedDB migration for 50MB+ data
- [ ] Implement offline-first with service workers
- [ ] Add state diff calculation (only save deltas)

---

## Unresolved Questions

1. **Session expiry:** Do sessions auto-clear after app close, or persist? (Affects cleanup strategy)
2. **Concurrent sessions:** Can user have >1 session in different tabs? (Impacts cross-tab sync needs)
3. **Schema evolution:** How to handle form template changes mid-session? (Version migration)
4. **Large attachments:** Plans for file uploads? (Determines IndexedDB necessity)
5. **Offline support:** Do users need app to work offline? (Affects service worker roadmap)

---

## References

- [React 19 useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- [Managing Persistent Browser Data with useSyncExternalStore](https://www.yeti.co/blog/managing-persistent-browser-data-with-usesyncexternalstore)
- [localStorage vs IndexedDB comparison](https://dev.to/armstrong2035/9-differences-between-indexeddb-and-localstorage-30ai)
- [Concurrent React and UI Tearing](https://interbolt.org/blog/react-ui-tearing/)
- [Next.js 15 State Persistence Guide](https://clerk.com/blog/complete-guide-session-management-nextjs)
- [React 19: New Features](https://react.dev/blog/2024/12/05/react-19)
- [Debouncing in React Best Practices](https://www.developerway.com/posts/debouncing-in-react)
- [XState Persistence Documentation](https://stately.ai/docs/persistence)
- [Zustand Persist Middleware](https://github.com/pmndrs/zustand#persist-middleware)
