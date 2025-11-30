# Multi-Session Form Architecture - Visual Reference

## Current Architecture (Implemented in JAC-V1)

```
┌─────────────────────────────────────────────────────────────────┐
│                        REACT COMPONENT                          │
│                     (ClaudeChat.tsx)                            │
│                                                                 │
│  currentSessionId (string | null)                              │
│  sessionStateMap {                                             │
│    'session-001': { messages, flowState, currentStep, ... }   │
│    'session-002': { messages, flowState, currentStep, ... }   │
│    'session-003': { messages, flowState, currentStep, ... }   │
│  }                                                             │
│  flowExecutor (FlowExecutor | null)  ← Per-session instance   │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
              ┌───────────────────────────────┐
              │   useSessionSync() Hook        │
              │  (useTabSync under the hood)   │
              └───────────────────────────────┘
                              ↓↑
              ┌───────────────────────────────┐
              │   BroadcastChannel API        │
              │  'jac-sessions' channel       │
              │                               │
              │  Messages:                    │
              │  - SESSION_CREATED            │
              │  - SESSION_DELETED            │
              │  - SESSION_UPDATED            │
              │  - SESSIONS_RELOADED          │
              └───────────────────────────────┘
                ↓                           ↑
        ┌──────────────┐          ┌──────────────┐
        │  Other Tab 1 │          │  Other Tab 2 │
        │  Same Origin │          │  Same Origin │
        └──────────────┘          └──────────────┘

                    ↓↑
        ┌───────────────────────────┐
        │  Browser localStorage     │
        │  sessions:state (JSON)    │
        │  sessions:list (JSON)     │
        │  (5-10MB quota)           │
        └───────────────────────────┘
                    ↓↑
        ┌───────────────────────────┐
        │  MongoDB + JSON Files     │
        │  (Disk Source of Truth)   │
        │  - project-header.json    │
        │  - item-001.json          │
        │  - item-002.json          │
        └───────────────────────────┘
```

---

## Session State Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                  USER OPENS ITEM SESSION                     │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 1. generateId() → sessionId: '123e4567-e89b-12d3-a456...'    │
│ 2. Create newSession object                                  │
│ 3. Add to chatSessions list                                  │
│ 4. Broadcast SESSION_CREATED to other tabs                   │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 5. Initialize sessionStateMap[sessionId]:                    │
│    {                                                         │
│      messages: [botMessage],                                 │
│      flowState: { ITEM_NUM: '001' },                        │
│      currentStepOrder: 0,                                    │
│      filteredSteps: [...],                                   │
│      validationErrors: {},                                   │
│      lastHydrationTime: Date.now()  ← NEW                    │
│    }                                                         │
│ 6. Load first form (sdi-project)                             │
│ 7. Create FlowExecutor with project-header state             │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│              USER FILLS FORM & SUBMITS                       │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 1. Merge: { ...accumulatedState, ...formData }               │
│ 2. Validate with Zod schema (merged data for conditionals)   │
│ 3. Save to MongoDB (graceful if fails)                       │
│ 4. Save to disk JSON (items/{itemNumber}.json)               │
│ 5. Update flowExecutor.updateState(formId, validData)        │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 6. Update sessionStateMap[sessionId]:                        │
│    {                                                         │
│      flowState: { ...old, ...validData },  ← Updated         │
│      messages: [..., botMessage],                            │
│      currentStepOrder: nextStepIndex,      ← Incremented     │
│      lastHydrationTime: Date.now(),        ← Updated         │
│      validationErrors: {}                                    │
│    }                                                         │
│ 7. Broadcast SESSION_UPDATED to other tabs                   │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│              FORM PERSISTED & FLOW CONTINUES                 │
│ - Other tabs receive broadcast (only if not current tab)     │
│ - localStorage auto-saves (1000ms debounce)                  │
│ - Disk JSON updated (source of truth)                        │
└──────────────────────────────────────────────────────────────┘
```

---

## Session Switch (Critical: Re-hydration)

```
┌──────────────────────────────────────────────────────────────┐
│              USER CLICKS DIFFERENT ITEM                       │
│         (from Item 001 to Item 002)                          │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: SAVE CURRENT SESSION                                │
│ if (currentSessionId) {                                      │
│   executorState = flowExecutor.getState()                    │
│   sessionStateMap[currentSessionId] = {                       │
│     messages,                                                │
│     flowState: executorState,  ← From executor               │
│     currentStepOrder,                                        │
│     filteredSteps,                                           │
│     itemNumber,                                              │
│     validationErrors,                                        │
│     lastHydrationTime: Date.now()                            │
│   }                                                          │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 2: LOAD TARGET SESSION (3-TIER RESTORATION)             │
│                                                              │
│ TIER 1: Memory                                               │
│   sessionState = sessionStateMap['session-002']  ← Fast       │
│                                                              │
│ TIER 2: Validation                                           │
│   if (!validateSessionState(sessionState)) {                 │
│     sessionState = createFreshSessionState(itemNumber)       │
│   }                                                          │
│                                                              │
│ TIER 3: Disk (Source of Truth)                               │
│   diskData = await loadExistingItemState(folderPath, '002')  │
│   mergedFlowState = { ...sessionState.flowState, ...diskData }│
│   ← Disk data takes priority                                 │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 3: RESTORE ALL STATE                                    │
│   setMessages(sessionState.messages)                         │
│   setFlowState(mergedFlowState)                              │
│   setCurrentStepOrder(sessionState.currentStepOrder)         │
│   setFilteredSteps(sessionState.filteredSteps)               │
│   setCurrentItemNumber(sessionState.itemNumber)              │
│   setValidationErrors(sessionState.validationErrors)         │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 4: RECREATE EXECUTOR (CRITICAL!)                        │
│   const executor = createFlowExecutor(                        │
│     flow,                                                    │
│     sessionState.filteredSteps,                              │
│     mergedFlowState  ← Merged with disk                      │
│   )                                                          │
│   executor.setCurrentStepIndex(sessionState.currentStepOrder)│
│   setFlowExecutor(executor)                                  │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 5: FINALIZE                                             │
│   setCurrentSessionId(sessionId)                             │
│   setProjectMetadata({ ...metadata, currentSessionId })      │
│   ← All state synchronized                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## State Isolation Guarantee (No Bleeding)

```
┌─────────────────────────────────────────────────────────────┐
│              sessionStateMap Structure                       │
│                                                             │
│  {                                                          │
│    'item-001-session': {                                   │
│      messages: [msg1, msg2, ...],    ← Independent          │
│      flowState: { FIELD_A: 'value1', FIELD_B: 10 },       │
│      currentStepOrder: 2,            ← Per session          │
│      validationErrors: {},           ← Per session          │
│      lastHydrationTime: 1704067200   ← Per session          │
│    },                                                       │
│                                                             │
│    'item-002-session': {                                   │
│      messages: [msg3, msg4, ...],    ← Independent          │
│      flowState: { FIELD_A: 'value2', FIELD_C: 20 },       │
│      currentStepOrder: 1,            ← Different            │
│      validationErrors: {},           ← Independent          │
│      lastHydrationTime: 1704067201   ← Independent          │
│    },                                                       │
│                                                             │
│    'item-003-session': {                                   │
│      messages: [msg5, msg6, ...],    ← Never touches 001   │
│      flowState: { FIELD_A: 'value3', FIELD_D: 30 },       │
│      currentStepOrder: 3,            ← Never cross-talks    │
│      validationErrors: {},           ← True isolation       │
│      lastHydrationTime: 1704067202   ← Each is independent  │
│    }                                                        │
│  }                                                          │
│                                                             │
│  Rule: Access ONLY via: sessionStateMap[currentSessionId]  │
│        Never use global form state                         │
│        Never reuse executor between sessions               │
└─────────────────────────────────────────────────────────────┘
```

---

## BroadcastChannel Sync (Multi-Tab Safety)

```
┌─────────────────────────────────────────────┐
│         TAB A (Active Session 001)          │
│                                             │
│  currentSessionId = 'session-001'           │
│  fillForm() → submitForm()                  │
│              → validate & save              │
│              → update sessionStateMap[001]  │
│              → broadcast SESSION_UPDATED    │
│                                             │
│  ⚠️ CRITICAL: Only broadcast, don't        │
│              update 001 from broadcast      │
└─────────────────────────────────────────────┘
                    ↓
        ┌──────────────────────────┐
        │  BroadcastChannel        │
        │  Message: SESSION_UPDATED│
        │  payload: {              │
        │    sessionId: '001',     │
        │    state: { ... }        │
        │  }                       │
        └──────────────────────────┘
                ↓        ↓
    ┌───────────────┐  ┌───────────────┐
    │ TAB B         │  │ TAB C         │
    │ (Viewing 002) │  │ (Viewing 003) │
    │               │  │               │
    │ currentSessionId│ currentSessionId
    │ = 'session-002'│ = 'session-003'│
    │               │  │               │
    │ Receive msg   │  │ Receive msg   │
    │ if (001 ≠ 002)│  │ if (001 ≠ 003)│
    │   update 001  │  │   update 001  │
    │ ✓ SAFE        │  │ ✓ SAFE        │
    └───────────────┘  └───────────────┘

    Rule: if (sessionId !== currentSessionId) {
      // Safe to update - not being edited
      setSessionStateMap(prev => ({
        ...prev,
        [sessionId]: state
      }));
    } else {
      // Skip - would overwrite active edits
      console.log('Active session, skipping broadcast');
    }
```

---

## Error Recovery Paths

```
┌────────────────────────────────────────┐
│   CORRUPTED SESSION STATE DETECTED     │
└────────────────────────────────────────┘
                ↓
        ┌──────────────────┐
        │ validateSessionState()
        │ Returns: false
        └──────────────────┘
                ↓
┌────────────────────────────────────────┐
│ Option 1: Recover from localStorage    │
│   → sessionStateMap still has it       │
│   → No action needed (in memory)       │
└────────────────────────────────────────┘
                ↓
┌────────────────────────────────────────┐
│ Option 2: Recover from Disk            │
│   → loadExistingItemState()            │
│   → Disk data is source of truth       │
│   → Restore form fields from file      │
└────────────────────────────────────────┘
                ↓
┌────────────────────────────────────────┐
│ Option 3: Fresh State (Last Resort)    │
│   → createFreshSessionState()          │
│   → Show "Session recovered" message   │
│   → User must re-fill form             │
└────────────────────────────────────────┘

    if (!validateSessionState(sessionState)) {
      console.error(`Session corrupted: ${sessionId}`);

      // Try disk first
      const diskData = await loadExistingItemState(...);
      if (diskData && Object.keys(diskData).length > 0) {
        // Disk recovery successful
        return diskData;
      }

      // Fallback: fresh state
      return createFreshSessionState(itemNumber);
    }
```

---

## Performance Characteristics

```
Operation                 Time    Notes
─────────────────────────────────────────────────
Load sessionStateMap      <1ms    From React state
Validate session          <1ms    Simple type checks
Create FlowExecutor       5-10ms  Depends on step count
Merge disk data           2-5ms   Depends on file size
BroadcastChannel send     <1ms    Async, batched
localStorage save         5-20ms  Async, debounced
MongoDB save              100-500ms Async, can fail gracefully

Scaling Limits:
─────────────────────────────────────────────────
< 10 sessions   ✓ No optimization needed
10-20 sessions  ✓ Fine with current approach
20-50 sessions  ~ Monitor performance, consider optimizing
> 50 sessions   ✗ Consider Zustand for better selector granularity
```

---

## Decision Tree: When to Upgrade Pattern

```
Current Approach Sufficient?
│
├─ Have <= 20 concurrent sessions?
│  ├─ YES: ✓ Keep sessionStateMap approach
│  └─ NO: → Go to next check
│
├─ Do you need atomic field updates?
│  ├─ YES: → Consider Zustand (better selectors)
│  └─ NO: → Keep current approach
│
├─ Is localStorage quota being exceeded?
│  ├─ YES: → Implement compression or IndexedDB
│  └─ NO: → Keep current approach
│
├─ Do you need time-travel debugging?
│  ├─ YES: → Consider Redux Toolkit
│  └─ NO: → Keep current approach
│
└─ Keep sessionStateMap + Context API ✓
```

---

**Last Updated**: 2025-01-30
**Architecture**: Multi-Tab Safe, Disk-Backed, Session-Isolated
**Status**: Production Ready
