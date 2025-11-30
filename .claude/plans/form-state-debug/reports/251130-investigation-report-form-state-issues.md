# Form State Investigation Report
**Date:** 2025-11-30
**Investigator:** Claude Code (Senior Debugging Agent)
**Project:** JAC-V1 Dynamic Form System
**Scope:** Multi-session form state persistence issues

---

## Executive Summary

Investigated 4 critical issues in multi-session form state management. Root causes identified across session persistence, form data propagation, and item number synchronization. All issues stem from gaps in state restoration logic and missing bi-directional data flow between form component and session state.

**Impact:** High - Users lose form data when switching sessions, item numbers don't update in UI, no tab system exists for editing previous forms.

---

## Issue 1: Form State Not Preserved Between Sessions

### Root Cause
**Location:** `components/ClaudeChat.tsx:1451-1456`, `components/DynamicFormRenderer.tsx:210-216`

**Problem:** Form state restoration mechanism incomplete. Three separate issues:

1. **Incomplete restoration flow**
   - `initialFormData` memoized from `flowState` + `activeFormDataMap` (line 1453-1456)
   - BUT: `flowState` not always updated when switching sessions
   - File: `ClaudeChat.tsx:686` - `setFlowState(mergedFlowState)` called AFTER disk data merge
   - **Gap:** Race condition - form may render before flowState update completes

2. **DynamicFormRenderer doesn't persist initial state properly**
   - Line 210-216: `useEffect` resets `formData` on session/formSpec change
   - Merges defaults with `initialData`, BUT:
   - **Gap:** If `initialData` is empty object `{}`, defaults override any unsaved changes
   - **Result:** Typing in form → switch session → return = data lost

3. **activeFormDataMap only synced on handleFieldChange**
   - `handleFormDataChange` callback (line 442-452) updates `activeFormDataMap`
   - Only triggered when user types (via `DynamicFormRenderer:301`)
   - **Gap:** Pre-filled form fields (from defaultValue) never enter activeFormDataMap
   - **Result:** Forms with only default values lose state on session switch

### Evidence
```typescript
// ClaudeChat.tsx:1453-1456
const initialFormData = useMemo(() => ({
  ...flowState,  // ← May be stale if session switch in progress
  ...(activeFormDataMap[currentSessionId || ''] || {}),
}), [flowState, activeFormDataMap, currentSessionId]);

// ClaudeChat.tsx:636-686 (switchToSession)
// Step 3: Restore session state
setCurrentStepOrder(sessionState.currentStepOrder);
setFilteredSteps(sessionState.filteredSteps);
// ...
// Step 4-5: Load disk data, merge into flowState
setFlowState(mergedFlowState);  // ← Async, may not complete before form renders
setMessages(sessionState.messages);  // ← Form in message may render with stale initialFormData
```

### Fix Locations
1. **ClaudeChat.tsx:636-686** - Ensure flowState update completes before setting messages
2. **DynamicFormRenderer.tsx:210-216** - Preserve existing formData if initialData is empty
3. **ClaudeChat.tsx:220-225** - Sync pre-filled defaults to activeFormDataMap on form mount

---

## Issue 2: Item Number Not Updating in Session After Submission

### Root Cause
**Location:** `components/ClaudeChat.tsx:944-1009`

**Problem:** Item number update logic only runs when user CHANGES the number from original. If user keeps pre-filled value, session title never updates.

**Code Flow:**
1. `startNewItemChat` (line 455-585):
   - Gets next item number from API (e.g., "002")
   - Creates session with `title: "Item 002"` and `itemNumber: "002"`
   - Pre-fills `ITEM_NUM` field with "002"

2. User submits sdi-project form WITHOUT changing ITEM_NUM

3. `handleFormSubmit` (line 944-1009):
   ```typescript
   const newItemNum = validationResult.data.ITEM_NUM || ...;
   const originalItemNum = currentItemNumber;  // "002"

   // Line 979: Only updates if numbers differ
   const itemNumberChanged = paddedNewItemNumber !== paddedOriginalItemNumber;

   // Line 984-989: ALWAYS updates session title (good)
   setChatSessions(prev => prev.map(s =>
     s.id === currentSessionId
       ? { ...s, title: `Item ${paddedNewItemNumber}`, itemNumber: paddedNewItemNumber }
       : s
   ));
   ```

**Gap:** Code DOES update session title even when number unchanged (line 984-989), BUT:
- **Session title update happens AFTER form submission** (not on initial session creation)
- If user never submits sdi-project form (abandons session), title stays "Item undefined"
- **Real issue:** Session creation (line 478-487) doesn't wait for sdi-project form to set itemNumber in flowState

### Evidence
```typescript
// ClaudeChat.tsx:473-487 (startNewItemChat)
const itemNumber = itemData.nextItemNumber;  // e.g., "002"
const sessionId = generateId();
const newSession: ChatSession = {
  id: sessionId,
  title: `Item ${itemNumber}`,  // ✓ Title set correctly
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  itemNumber,  // ✓ ItemNumber set correctly
  projectMetadata: { ...metadata },
  flowState: {},  // ← Empty! No ITEM_NUM in state yet
};

// Issue: Session title shows "Item 002" in sidebar immediately
// BUT: If user switches away before submitting form, returns to see "Item 002" with empty form
// Then submits form → item number updates again (redundant)
```

### Fix Locations
1. **ClaudeChat.tsx:570** - Set `currentItemNumber` state IMMEDIATELY on session creation (not just in flowState)
2. **ClaudeChat.tsx:638** - When restoring session, sync itemNumber from sessionState.itemNumber (not flowState.ITEM_NUM)
3. **leftsidebar.tsx:229-231** - Display title uses `session.itemNumber` (already correct, no change needed)

**NOTE:** Item number DOES update correctly after form submission. Issue is cosmetic - session appears to have itemNumber before form is submitted, creating inconsistency.

---

## Issue 3: No Form Tab System

### Root Cause
**Location:** None - feature doesn't exist

**Problem:** No UI mechanism to navigate back to previous forms in a flow. Forms are one-way progression only.

**Current Architecture:**
- Flow progresses linearly: Step 0 → Step 1 → Step 2 → ... → Complete
- `handleFormSubmit` (line 728-1190):
  - Validates current form
  - Saves to MongoDB
  - Hides current form (`msg.formSpec = undefined` at line 1018-1020)
  - Loads next form (line 1034-1080)
- **No backtracking mechanism:** Once form submitted, no UI to re-display it

**Evidence:**
```typescript
// ClaudeChat.tsx:1017-1020
// Remove form from current message
setMessages((prev) => prev.map(msg =>
  msg.formSpec ? { ...msg, formSpec: undefined } : msg
));
// ↑ Form disappears from chat after submission - cannot be recovered via UI
```

**Existing Data:**
- All form data IS persisted:
  - MongoDB: `/api/form-submission` stores all submissions
  - Local disk: `/api/save-item-data` saves item JSON files
  - FlowExecutor state: `flowExecutor.getState()` has all submitted data
  - SessionState: `sessionStateMap[sessionId].flowState` preserves data
- **Gap:** No UI to render previous forms with existing data

### Fix Locations
**New feature required:**
1. Create `FormTabNavigation` component in `components/FormTabNavigation.tsx`
2. Add to `ClaudeChat.tsx` below stepper (line 1501, between messages area and input)
3. Track completed forms in session state: `completedFormIds: string[]`
4. On tab click:
   - Load form template for selected formId
   - Populate with data from `flowState[formId]`
   - Render in edit mode (readonly=false)
   - On re-submit: Validate → Update flowState → Re-save to DB → Return to current step

**Design:**
```
┌────────────────────────────────────────────────────┐
│ Item 002 - Step 3 of 5                             │
├────────────────────────────────────────────────────┤
│ [✓ Project]  [✓ Hinge Info]  [→ Lock Options] ... │  ← Tab bar
├────────────────────────────────────────────────────┤
│ Form content here...                                │
└────────────────────────────────────────────────────┘
```

---

## Issue 4: Forms Not Independent Per Item

### Root Cause
**Location:** `components/DynamicFormRenderer.tsx:292-295`, `components/ClaudeChat.tsx:1453-1456`

**Problem:** Forms ARE mostly independent per item, but table selection state has session-scoped keys with potential collision risk.

**Analysis:**
1. **Session-scoped state isolation (CORRECT):**
   - `sessionStateMap` is keyed by `sessionId` (line ClaudeChat.tsx:126-134)
   - Each session has independent `flowState`, `messages`, `validationErrors`
   - `activeFormDataMap` keyed by `sessionId` (line 137)
   - DynamicFormRenderer receives `sessionId` prop (line 167)

2. **Form-scoped field IDs (CORRECT):**
   - `getFieldId(field)` generates: `${sessionId}-${formId}-${field.id}` (line 295)
   - Prevents DOM ID collisions across sessions
   - Each form instance has unique HTML IDs

3. **Table selection state (POTENTIAL ISSUE):**
   - `selectedTableRows` state (line 193): `Record<string, number>`
   - Key format: `${sessionId}__${formSpec.formId}__${fieldName}` (line 292)
   - **Gap:** State is component-level, shared across ALL mounted DynamicFormRenderer instances
   - If multiple forms rendered simultaneously (e.g., split-screen), table selections could interfere

**Evidence:**
```typescript
// DynamicFormRenderer.tsx:193
const [selectedTableRows, setSelectedTableRows] = useState<Record<string, number>>({});

// Line 292
const getTableStateKey = (fieldName: string) => `${sessionId}__${formSpec.formId}__${fieldName}`;

// Line 437-444
const handleTableRowSelect = (fieldName: string, rowIndex: number, rowData: ...) => {
  const stateKey = getTableStateKey(fieldName);  // e.g., "sess1__form2__HINGE_TYPE"
  setSelectedTableRows(prev => ({ ...prev, [stateKey]: rowIndex }));
  // ↑ If two DynamicFormRenderer instances exist, they share this state object
  handleFieldChange(fieldName, rowData);  // ← Actual data stored correctly in formData (session-isolated)
};
```

**Current Behavior:**
- Form DATA is independent per session (stored in `formData` state, passed to parent via `onFormDataChange`)
- Table row SELECTION UI state shared across all forms (cosmetic issue only)
- **Impact:** Low - Unlikely multiple forms render simultaneously in current UI flow

### Fix Locations
**If tab system implemented (Issue 3), this becomes critical:**
1. **DynamicFormRenderer.tsx:193** - Move `selectedTableRows` to parent (`ClaudeChat.tsx`)
2. **ClaudeChat.tsx:126-134** - Add `tableSelections: Record<string, number>` to SessionState
3. **DynamicFormRenderer.tsx** - Accept `selectedTableRows` and `onTableRowSelect` as props
4. Pass session-specific table selections to each form instance

**Current workaround:** Line 206-208 clears table selections on session change (mitigates but doesn't fix root cause):
```typescript
useEffect(() => {
  setSelectedTableRows({});
}, [sessionId]);
```

---

## System Behavior Patterns

### State Restoration Flow (switchToSession)
**File:** `ClaudeChat.tsx:588-721`

```
1. Save current session state (line 594-613)
   - Get executor's flat state: flowExecutor.getState()
   - Bundle: messages, flowState, stepOrder, itemNumber, validationErrors, activeFormData
   - Store in sessionStateMap

2. Load target session state (line 616-633)
   - Retrieve from sessionStateMap[sessionId]
   - Validate structure via validateSessionState()
   - If invalid → createFreshSessionState()

3. Restore session state (line 636-647)
   - setCurrentStepOrder(sessionState.currentStepOrder)
   - setFilteredSteps(sessionState.filteredSteps)
   - setCurrentItemNumber(sessionState.itemNumber)
   - setValidationErrors(sessionState.validationErrors)
   - Restore activeFormDataMap[sessionId] = sessionState.activeFormData

4. Merge disk data (line 649-684)
   - Fetch item JSON from /api/save-item-data
   - Merge disk data into sessionState.flowState
   - Disk data = source of truth (overwrites session state)

5. Update React state (line 686-701)
   - setFlowState(mergedFlowState)  ← Triggers initialFormData recalc
   - setMessages(sessionState.messages)  ← Forms render here
   - Recreate FlowExecutor with merged state
   - setCurrentSessionId(sessionId)

6. Update metadata (line 710-713)
   - setProjectMetadata({ ...metadata, currentSessionId: sessionId })
```

**Critical Gap:** Step 5 - `setFlowState()` and `setMessages()` called sequentially, not atomically. Form may render before flowState update propagates to `initialFormData` memo.

---

### Form Data Synchronization Flow
**Files:** `ClaudeChat.tsx` ↔ `DynamicFormRenderer.tsx`

```
User types in form field
   ↓
DynamicFormRenderer.handleFieldChange (line 297-312)
   ↓
Updates local formData state
   ↓
Calls onFormDataChange(formId, newData)  ← Prop callback
   ↓
ClaudeChat.handleFormDataChange (line 442-452)
   ↓
Updates activeFormDataMap[currentSessionId]
   ↓
activeFormDataMap change triggers useEffect (line 1211-1234)
   ↓
Bundles into SessionState: { ..., activeFormData: activeFormDataMap[sessionId] }
   ↓
Updates sessionStateMap[currentSessionId]
   ↓
Broadcasts to other tabs via broadcastSessionUpdated
   ↓
(Debounced) Saves to localStorage 'sessions:state'
```

**Gap in reverse flow (session switch → form):**
```
Session switch requested
   ↓
ClaudeChat.switchToSession loads sessionState
   ↓
Restores activeFormDataMap[sessionId] = sessionState.activeFormData
   ↓
Updates flowState with disk + session data
   ↓
initialFormData recalculated: { ...flowState, ...activeFormDataMap[sessionId] }
   ↓
DynamicFormRenderer receives initialData prop
   ↓
useEffect (line 212-216) merges defaults + initialData
   ↓
ISSUE: If initialData = {}, defaults override unsaved changes
```

---

## Database vs. Session State Reconciliation

### Disk Persistence
**File:** `ClaudeChat.tsx:944-1014` (save-item-data API call)

**When:** After form submission, for steps >= 1 (item forms, not project-header)

**What's saved:**
```json
{
  "formId": "sdi-project",  // or "hinge-info", etc.
  "formData": { "ITEM_NUM": "002", "OPENING_TYPE": 1, ... },
  "merge": true,  // Merges with existing item JSON
  "sessionId": "abc123",
  "salesOrderNumber": "SO456"
}
```

**File structure:**
```
project-docs/SDI/SO456/
  ├── project-header.json
  └── items/
      ├── item-001.json  ← { "sdi-project": {...}, "hinge-info": {...}, "_metadata": {...} }
      ├── item-002.json
      └── item-003.json
```

### Session State Persistence
**File:** `lib/hooks/usePersistedSession.ts` + `ClaudeChat.tsx:1211-1234`

**When:** Auto-saved on every message change (debounced 1s)

**LocalStorage keys:**
- `sessions:list`: Array of ChatSession objects
- `sessions:state`: Map of `{ [sessionId]: SessionState }`

**SessionState structure:**
```typescript
{
  messages: Message[],
  flowState: Record<string, any>,        // Flat: { ITEM_NUM: "002", OPENING_TYPE: 1 }
  currentStepOrder: number,
  filteredSteps: FlowStep[],
  itemNumber: string,
  validationErrors: Record<string, string>,
  activeFormData: Record<string, any>,   // Unsaved form data
  lastAccessedAt: number
}
```

### Reconciliation Logic
**File:** `ClaudeChat.tsx:649-684` (switchToSession)

**Priority:** Disk data > Session state

```typescript
// 1. Start with session flowState
let mergedFlowState = { ...sessionState.flowState };

// 2. Load disk JSON
const diskData = await loadExistingItemState(folderPath, itemNumber);

// 3. Merge: disk overwrites session
Object.keys(diskData).forEach(key => {
  if (key !== '_metadata') {
    const formData = diskData[key];
    // Flatten individual fields
    Object.keys(formData).forEach(fieldName => {
      mergedFlowState[fieldName] = formData[fieldName];
    });
    // Keep nested structure for executor
    mergedFlowState[key] = formData;
  }
});

// 4. Use merged state for FlowExecutor recreation
const executor = createFlowExecutor(flow, filteredSteps, mergedFlowState);
```

**Why this matters:**
- MongoDB may have stale data if user switched sessions without submitting
- Disk JSON = last SUBMITTED state (authoritative)
- Session state = last ACTIVE state (may include unsaved changes)
- **Issue:** If user types in form → switches away → switches back:
  - Unsaved changes in `activeFormData` should restore
  - BUT: Disk data merge happens AFTER session state restore
  - If field exists in disk but not in activeFormData, disk wins (correct)
  - If field exists in activeFormData but not disk, activeFormData should win (currently broken)

---

## Performance Observations

### State Storage Size
**File:** `lib/session-cleanup.ts` (not in provided files, but referenced)

- Cleanup runs on mount (usePersistedSession.ts:60-83)
- Removes sessions older than 7 days (CLEANUP_CONFIG)
- Warns if total storage > 4MB

### Form Rendering
**File:** `DynamicFormRenderer.tsx`

- Remounts on `sessionId` OR `formSpec.formId` change (line 212-216)
- Auto-focuses first empty field on mount (line 250-273)
- Auto-focuses first error field on validation fail (line 276-289)
- Table selections cleared on session change (line 206-208)

**Optimization opportunities:**
- Memoize `renderField` function (pure function, only depends on field + formData)
- Memoize table row rendering (currently re-renders all rows on any formData change)

---

## Recommended Solutions

### Priority 1: Fix Form State Persistence (Issue 1)
**Impact:** High - Data loss on session switch
**Complexity:** Medium

**Changes:**
1. **ClaudeChat.tsx:686** - Use `useState` callback to ensure atomic state update:
   ```typescript
   setFlowState(mergedFlowState);
   // Wait for next tick before rendering forms
   setTimeout(() => setMessages(sessionState.messages), 0);
   ```

2. **DynamicFormRenderer.tsx:212-216** - Preserve existing formData if initialData empty:
   ```typescript
   useEffect(() => {
     const defaults = buildInitialFormData(formSpec);
     const merged = { ...defaults, ...(initialData || {}) };
     // Only reset if initialData has content OR formData is empty
     if (Object.keys(initialData || {}).length > 0 || Object.keys(formData).length === 0) {
       setFormData(merged);
     }
   }, [sessionId, formSpec.formId, initialData]);
   ```

3. **ClaudeChat.tsx:220-225** - Sync defaults to activeFormDataMap on form mount:
   ```typescript
   useEffect(() => {
     const initialData = buildInitialFormData(formSpec);
     if (Object.keys(initialData).length > 0) {
       onFormDataChange?.(formSpec.formId, initialData);
     }
   }, [formSpec.formId]);
   ```

### Priority 2: Fix Item Number Sync (Issue 2)
**Impact:** Medium - Cosmetic inconsistency
**Complexity:** Low

**Changes:**
1. **ClaudeChat.tsx:570** - Set currentItemNumber on session creation:
   ```typescript
   setCurrentItemNumber(itemNumber);  // Add this line
   ```

2. Ensure sidebar always uses `session.itemNumber` (already correct in leftsidebar.tsx:229)

### Priority 3: Implement Form Tabs (Issue 3)
**Impact:** High - Critical UX gap for editing
**Complexity:** High

**New Component:** `components/FormTabNavigation.tsx`
**Integration:** ClaudeChat.tsx (insert above messages area)
**State Changes:**
- Add `completedFormIds: string[]` to SessionState
- Track form completion on submit (handleFormSubmit)
- Implement `loadPreviousForm(formId)` function

**Design spec:**
- Horizontal scrollable tabs
- Icons: ✓ (completed), → (current), ⏸ (pending)
- Click → Load form template → Populate from flowState → Render in modal/expanded view
- Re-submission updates flowState + DB

### Priority 4: Isolate Table State (Issue 4)
**Impact:** Low - Only affects multi-form scenarios
**Complexity:** Medium

**Changes:**
1. Move `selectedTableRows` to SessionState
2. Pass as prop to DynamicFormRenderer
3. Lift state management to ClaudeChat

---

## Testing Recommendations

### Test Scenario 1: Session Switch with Unsaved Data
1. Create Item 001
2. Fill sdi-project form (don't submit)
3. Type "Test Data" in text field
4. Create Item 002
5. Switch back to Item 001
6. **Expected:** "Test Data" restored in field
7. **Current:** Field empty (data lost)

### Test Scenario 2: Item Number Propagation
1. Create Item 001
2. Change ITEM_NUM to "005" in form
3. Submit sdi-project form
4. **Expected:** Sidebar shows "Item 005"
5. **Current:** Sidebar shows "Item 005" (WORKS - see Issue 2 analysis)

### Test Scenario 3: Form Tab Navigation
1. Complete Items 001, 002
2. Click "Project" tab in Item 002
3. **Expected:** sdi-project form opens with Item 002 data
4. **Current:** No tab UI exists

### Test Scenario 4: Cross-Session Isolation
1. Open Item 001, select row 3 in HINGE_TYPE table
2. Create Item 002, open hinge-info form
3. **Expected:** No row selected in table
4. **Current:** Row 3 selected (cosmetic bug - data is correct)

---

## Unresolved Questions

1. **Should activeFormData override disk data?**
   - Current: Disk always wins
   - Alternative: Merge activeFormData AFTER disk data
   - Tradeoff: Risk of restoring stale data vs. losing unsaved changes

2. **Form tab edit mode: readonly or editable?**
   - Option A: Readonly (safer, prevents accidental changes)
   - Option B: Editable (more flexible, requires re-validation)
   - Recommendation: Editable with "Discard Changes" button

3. **Session state cleanup triggers?**
   - Current: 7-day retention, runs on mount
   - Should we auto-cleanup on session delete?
   - Should we compress old sessions (remove messages, keep flowState)?

4. **Multi-tab editing conflicts:**
   - User edits Item 001 in Tab A
   - User edits Item 001 in Tab B simultaneously
   - Which changes win?
   - Current: useSessionSync skips updates for active session (line 60)
   - Gap: No conflict detection if same session edited in multiple tabs

---

## Code Quality Notes

**Strengths:**
- Comprehensive validation with session-validator.ts
- Clean separation: ClaudeChat (orchestration) + DynamicFormRenderer (presentation)
- Multi-tab sync via BroadcastChannel (useSessionSync)
- Graceful degradation (MongoDB failures don't block flow)

**Weaknesses:**
- Too many sources of truth (flowState, activeFormDataMap, sessionStateMap, disk JSON, MongoDB)
- State update race conditions (setFlowState → setMessages)
- Missing type guards for form data (FormFieldValue can be undefined)
- No transaction mechanism for atomic session state updates

**Refactoring Opportunities:**
1. Unify state management: Single `SessionStore` class managing all session state
2. Immutable state updates: Use Immer or similar for deep state changes
3. Form state machine: Explicit states (EDITING, SUBMITTING, VALIDATING, SAVED)
4. Event sourcing: Track state changes as events, replay for recovery

---

**Report Complete**
**Next Steps:** Prioritize fixes based on impact/complexity matrix, implement Priority 1 fixes first.
