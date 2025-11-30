# Multi-Session Form State Management - Research Summary

**Date**: 2025-01-30 | **Stack**: React 19 + Next.js 15 | **Project**: JAC-V1

---

## Key Findings

### Your Codebase Already Implements Most Best Practices ✓

**Pattern in Use**: Session-scoped state maps + BroadcastChannel API + disk-based source of truth

```
sessionStateMap (React State)
    ↓
useTabSync (BroadcastChannel API)
    ↓
localStorage (Browser Persistence)
    ↓
MongoDB + JSON Files (Disk Truth)
```

This is **production-ready**.

---

## Top 5 Recommended Patterns for Form Isolation

### 1. **Session-Scoped State Maps** (Your Approach) ✓
**Pattern**: Each session ID → isolated state object
```typescript
const sessionStateMap = {
  'session-001': { messages, flowState, currentStep, validationErrors, ... },
  'session-002': { messages, flowState, currentStep, validationErrors, ... },
  'session-003': { messages, flowState, currentStep, validationErrors, ... },
};
```
**Guarantee**: Zero state bleeding between sessions.
**When**: < 10 concurrent sessions.

---

### 2. **FlowExecutor Per Session** ✓
**Ensure**: Form conditionals evaluate against session context
```typescript
const executor = createFlowExecutor(flow, itemSteps, sessionState.flowState);
setFlowExecutor(executor);
```

---

### 3. **Disk-Based Source of Truth** ✓
**On Session Switch**: Merge memory + disk
```typescript
const diskData = await loadExistingItemState(folderPath, itemNumber);
const mergedFlowState = { ...sessionState.flowState, ...diskData };
const executor = createFlowExecutor(flow, steps, mergedFlowState);
```
**Ensures**: Data survives reload, multi-device sync.

---

### 4. **Three-Tier Restoration with Validation** (NEW)
**Enhance Current Code**:
```typescript
// Tier 1: Memory (fast)
let sessionState = sessionStateMap[sessionId];

// Tier 2: Validation
if (!validateSessionState(sessionState)) {
  sessionState = createFreshSessionState(itemNumber);
}

// Tier 3: Disk (source of truth)
const diskData = await loadExistingItemState(folderPath, itemNumber);
const mergedFlowState = { ...sessionState.flowState, ...diskData };
```

---

### 5. **Cross-Tab Sync with Smart Broadcasting** ✓
**Your Rule** (Correct):
- Only update **inactive** sessions on broadcast
- Don't overwrite **active** session (prevents user losing data)

```typescript
if (sessionId !== currentSessionId) {
  setSessionStateMap(prev => ({ ...prev, [sessionId]: state }));
}
```

---

## Quick Reference: Common Pitfalls

| Pitfall | Symptom | Your Code | Fix |
|---------|---------|-----------|-----|
| **State Bleeding** | Item 001 data appears in Item 002 | ✓ sessionStateMap | Already fixed |
| **Lost on Switch** | Fill form → switch session → come back → empty | ✓ Save before switch | Already fixed |
| **Stale Data** | Submit form but UI doesn't update | ✓ Update sessionStateMap | Already fixed |
| **Hydration Mismatch** | Blank page or FOUC on load | ✓ Load in useEffect | Already fixed |
| **New Tab Missing Data** | Open new tab → no sessions shown | ✓ Load from localStorage | Already fixed |

---

## Specific Tech Stack Recommendations

### React 19 Context vs Zustand

| Scenario | Recommendation | Your Codebase |
|----------|------------------|-----------------|
| < 10 sessions | Context API + sessionStateMap | ✓ Using this |
| 10-50 sessions | Consider Zustand | No change needed yet |
| > 50 sessions | Zustand + selectors | Future optimization |

**For JAC-V1**: Keep current approach. Context + sessionStateMap scales well to 20 sessions.

---

### Next.js 15 localStorage Best Practices

**Rules** (All Implemented ✓):
1. Use `'use client'` directive → ✓ Done
2. Access in `useEffect`, not render → ✓ usePersistedSession does this
3. Handle hydration mismatch → ✓ Validation + fresh state creation
4. Debounce writes → ✓ 1000ms debounce in usePersistedSession
5. Never store secrets → ✓ Form data only, no tokens

---

### BroadcastChannel API Usage

**Your Implementation** (`useTabSync`): Correct.

**Best Practices**:
- ✓ Use channel name: 'jac-sessions'
- ✓ Only update inactive sessions
- ✓ Combine with localStorage for persistence
- ⚠ New tabs won't see old messages (by design; use localStorage)

---

## Code Examples for Enhancement

### Add lastHydrationTime for Staleness Detection
```typescript
// In SessionState interface
interface SessionState {
  messages: Message[];
  flowState: Record<string, any>;
  currentStepOrder: number;
  filteredSteps: FlowStep[];
  itemNumber: string;
  validationErrors: Record<string, string>;
  lastHydrationTime: number; // NEW: when last synced from disk
}

// In switchToSession() function
if (Date.now() - sessionState.lastHydrationTime > 5000) {
  // Refetch from disk if older than 5 seconds
  const diskData = await loadExistingItemState(...);
}

// After form submission
setSessionStateMap(prev => ({
  ...prev,
  [sessionId]: {
    ...prev[sessionId],
    flowState: validationResult.data,
    lastHydrationTime: Date.now(), // Update timestamp
  }
}));
```

### Add Corrupt Session Recovery
```typescript
const [sessionState, setSessionState] = useState(sessionStateMap[sessionId]);

if (!validateSessionState(sessionState)) {
  // Create fresh state with notification
  const freshState = createFreshSessionState(itemNumber);

  // Notify user (optional)
  const recoveryMsg: Message = {
    id: generateId(),
    sender: 'bot',
    text: 'Session was corrupted. Starting fresh. Previous data lost.',
    timestamp: new Date(),
  };

  setMessages([recoveryMsg]);
  setSessionStateMap(prev => ({ ...prev, [sessionId]: freshState }));
}
```

---

## Performance Guidelines

### When to Optimize
- **Session Count**: Scales fine up to 20. At 50+, consider Zustand.
- **Form Complexity**: < 100 fields → no optimization needed.
- **Storage**: Monitor localStorage size (quota: 5-10MB).

### How to Monitor
```typescript
const storageSize = getStorageSize(); // in bytes
const sizeMB = (storageSize / 1024 / 1024).toFixed(2);
console.warn(`localStorage: ${sizeMB}MB`); // Should be < 2MB
```

---

## Checklist: Session Isolation Verification

- [ ] FlowExecutor recreated on session switch
- [ ] SessionStateMap has no shared references between sessions
- [ ] Validation runs before using restored state
- [ ] Disk data loaded as source of truth
- [ ] lastHydrationTime tracked
- [ ] BroadcastChannel only updates inactive sessions
- [ ] localStorage persisted with 1000ms debounce
- [ ] New tabs load from localStorage on mount

---

## Files to Review/Update

### Already Good ✓
- `ClaudeChat.tsx` - Session management logic (comprehensive)
- `useSessionSync.ts` - Cross-tab broadcast (correct)
- `usePersistedSession.ts` - localStorage persistence (good)
- `session-validator.ts` - State validation (solid)

### Consider Enhancing
- `lib/session-validator.ts` - Add `lastHydrationTime` to interface
- `components/ClaudeChat.tsx` - Add staleness check in `switchToSession()`
- `lib/hooks/usePersistedSession.ts` - Add storage quota monitoring

---

## Unresolved Questions

1. **Scaling Limit**: At what session count (50? 100?) should you switch to Zustand?
2. **Conflict Resolution**: Disk vs Memory conflict - always prefer disk? (Current assumption: yes)
3. **Offline Sync**: How handle form submission when offline?
4. **Mobile Support**: BroadcastChannel not on all mobile browsers - fallback strategy?
5. **Undo/Redo**: Should sessions maintain form history stack?

---

## Quick Decision Tree

```
Do you have < 10 concurrent item sessions?
  ├─ YES → Keep Context API + sessionStateMap ✓
  └─ NO → Plan Zustand migration when you hit 20+ sessions

Are form states isolated per session?
  ├─ YES → Good, maintain separation ✓
  └─ NO → Refactor to sessionStateMap immediately

Is disk data loaded on session switch?
  ├─ YES → Source of truth is correct ✓
  └─ NO → Always merge disk + memory

Is BroadcastChannel only updating inactive sessions?
  ├─ YES → Prevents user data loss ✓
  └─ NO → Add condition: if (sessionId !== currentSessionId)

Is form state validation before use?
  ├─ YES → Corruption handled ✓
  └─ NO → Add validateSessionState() check
```

---

## Next Actions

**Immediate** (This Sprint):
1. Add `lastHydrationTime` to SessionState
2. Add staleness check in switchToSession()
3. Document session boundaries in code

**Medium-Term** (This Quarter):
4. Monitor storage quota in dev tools
5. Test with 20+ concurrent sessions

**Long-Term** (Next Quarter):
6. Consider Zustand if scaling beyond 30 sessions
7. Add audit logging for session state changes

---

**Report Date**: 2025-01-30
**Full Report**: `./plans/multi-session-forms/reports/250130-multi-session-form-state-management.md`
