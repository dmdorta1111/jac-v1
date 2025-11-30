# Implementation Plan: Session Switch Data Loading

**Created:** 2025-11-29
**Issue:** Form data lost when switching item sessions via sidebar
**Root Cause:** `switchToSession()` restores session state from localStorage but does NOT load JSON file from disk

---

## Problem Analysis

### Current Flow (BROKEN)
```
User clicks item in sidebar
    ↓
switchToSession(sessionId) - line 571
    ↓
1. Save current session to sessionStateMap
2. Load target session from sessionStateMap (localStorage)
3. Recreate FlowExecutor with sessionState.flowState - line 631
4. ❌ MISSING: Load item-XXX.json from disk
    ↓
Result: Empty forms (no JSON data merged into executor)
```

### What EXISTS
- JSON files ARE saved: `project-docs/SDI/{SO}/items/item-{num}.json`
- GET API exists: `/api/save-item-data?projectPath=xxx&itemNumber=xxx` (line 195)
- Executor accepts initial state: `createFlowExecutor(flow, steps, initialState)` (line 19)

### Gap
After line 631 (recreate executor), no call to:
1. Fetch JSON file
2. Merge JSON data into executor state
3. Display data in forms

---

## Implementation Plan

### Phase 1: Create JSON Data Loader Utility

**File:** `lib/session-loader.ts` (NEW)

**Purpose:** Centralized data loading for session restoration

**Functions:**
```typescript
/**
 * Load item JSON data from disk
 * @param projectPath - e.g., "project-docs/SDI/SO123"
 * @param itemNumber - e.g., "001"
 * @returns Merged form data or empty object
 */
export async function loadItemDataFromDisk(
  projectPath: string,
  itemNumber: string
): Promise<Record<string, any>>

/**
 * Merge multiple data sources for executor initialization
 * Priority: JSON file > sessionState > defaults
 */
export function mergeSessionData(
  diskData: Record<string, any>,
  sessionState: Record<string, any>
): Record<string, any>
```

**Implementation:**
```typescript
export async function loadItemDataFromDisk(
  projectPath: string,
  itemNumber: string
): Promise<Record<string, any>> {
  try {
    const res = await fetch(
      `/api/save-item-data?projectPath=${encodeURIComponent(projectPath)}&itemNumber=${itemNumber}`
    );

    if (!res.ok) {
      console.warn(`No JSON file found for item ${itemNumber}`);
      return {};
    }

    const data = await res.json();
    if (data.success && data.data) {
      console.log(`Loaded item ${itemNumber} from disk:`, Object.keys(data.data));
      return data.data;
    }
  } catch (error) {
    console.warn(`Failed to load item ${itemNumber}:`, error);
  }

  return {};
}

export function mergeSessionData(
  diskData: Record<string, any>,
  sessionState: Record<string, any>
): Record<string, any> {
  // Remove metadata from disk data (not needed for executor)
  const { _metadata, ...cleanDiskData } = diskData;

  // Extract form-specific data from disk JSON structure
  // JSON structure: { "sdi-project": {...}, "door-info": {...}, _metadata: {...} }
  // Flatten to single object: { ITEM_NUM: 1, DOOR_TYPE: 2, ... }
  const flattenedDiskData: Record<string, any> = {};
  Object.entries(cleanDiskData).forEach(([formId, formData]) => {
    if (typeof formData === 'object' && formData !== null) {
      Object.assign(flattenedDiskData, formData);
    }
  });

  // Priority: Disk data (source of truth) > Session state (may be stale)
  return {
    ...sessionState,
    ...flattenedDiskData,
  };
}
```

**Edge Cases:**
- No JSON file exists (new session never submitted)
- JSON file corrupted (invalid JSON)
- Partial data (only some forms saved)
- Metadata handling (`_metadata` should not pollute executor state)

---

### Phase 2: Modify `switchToSession()` Function

**File:** `components/ClaudeChat.tsx`

**Location:** Line 571-653 (existing `switchToSession()`)

**Changes:**

#### Step 1: Load JSON Data (after line 623)
```typescript
// 3. Restore validated session state
setMessages(sessionState.messages);
setFlowState(sessionState.flowState);
setCurrentStepOrder(sessionState.currentStepOrder);
setFilteredSteps(sessionState.filteredSteps);
setCurrentItemNumber(sessionState.itemNumber);
setValidationErrors(sessionState.validationErrors || {});

// 🆕 NEW: Load item data from disk
let diskData: Record<string, any> = {};
if (metadata?.folderPath && sessionState.itemNumber) {
  diskData = await loadItemDataFromDisk(
    metadata.folderPath,
    sessionState.itemNumber
  );
}
```

#### Step 2: Merge Data Before Executor Creation (line 631)
```typescript
// 4. Recreate FlowExecutor with saved state
const flow = await loadFlow('SDI-form-flow');
if (!flow) {
  throw new Error('SDI form flow not found');
}

// 🆕 UPDATED: Merge disk data with session state
const mergedState = mergeSessionData(diskData, sessionState.flowState);

// 🆕 UPDATED: Create executor with merged state
const executor = createFlowExecutor(flow, sessionState.filteredSteps, mergedState);
executor.setCurrentStepIndex(sessionState.currentStepOrder);
setFlowExecutor(executor);

console.log(`Executor restored with ${Object.keys(mergedState).length} fields`);
```

#### Step 3: Update flowState (for consistency)
```typescript
// 🆕 NEW: Update flowState with merged data
setFlowState(mergedState);
```

**Full Modified Function:**
```typescript
const switchToSession = async (sessionId: string) => {
  if (sessionId === currentSessionId) return;

  setIsLoading(true);

  try {
    // 1. Save current session state (UNCHANGED)
    if (currentSessionId) {
      const executorState = flowExecutor?.getState() || {};
      const currentState = {
        messages,
        flowState: executorState,
        currentStepOrder,
        filteredSteps,
        itemNumber: currentItemNumber || '',
        validationErrors,
        lastAccessedAt: Date.now(),
      };

      setSessionStateMap(prev => ({
        ...prev,
        [currentSessionId]: currentState,
      }));
    }

    // 2. Load and VALIDATE target session state (UNCHANGED)
    const sessionState = sessionStateMap[sessionId];

    if (!sessionState || !validateSessionState(sessionState)) {
      console.warn(`[Session] Invalid session ${sessionId}, creating fresh`);
      const session = chatSessions.find(s => s.id === sessionId);
      const freshState = createFreshSessionState(session?.itemNumber || '');

      setMessages(freshState.messages);
      setFlowState(freshState.flowState);
      setCurrentStepOrder(freshState.currentStepOrder);
      setFilteredSteps(freshState.filteredSteps);
      setValidationErrors(freshState.validationErrors);
      setCurrentItemNumber(freshState.itemNumber || null);
      setCurrentSessionId(sessionId);
      setIsLoading(false);
      return;
    }

    // 3. Restore validated session state (UNCHANGED)
    setMessages(sessionState.messages);
    setCurrentStepOrder(sessionState.currentStepOrder);
    setFilteredSteps(sessionState.filteredSteps);
    setCurrentItemNumber(sessionState.itemNumber);
    setValidationErrors(sessionState.validationErrors || {});

    // 🆕 3.5. Load item data from disk
    let diskData: Record<string, any> = {};
    if (metadata?.folderPath && sessionState.itemNumber) {
      diskData = await loadItemDataFromDisk(
        metadata.folderPath,
        sessionState.itemNumber
      );
    }

    // 4. Recreate FlowExecutor with saved state (MODIFIED)
    const flow = await loadFlow('SDI-form-flow');
    if (!flow) {
      throw new Error('SDI form flow not found');
    }

    // 🆕 Merge disk data with session state
    const mergedState = mergeSessionData(diskData, sessionState.flowState);

    // 🆕 Create executor with merged state
    const executor = createFlowExecutor(flow, sessionState.filteredSteps, mergedState);
    executor.setCurrentStepIndex(sessionState.currentStepOrder);
    setFlowExecutor(executor);

    // 🆕 Update flowState with merged data
    setFlowState(mergedState);

    console.log(`Executor restored with ${Object.keys(mergedState).length} fields from disk`);

    // 5. Update flow state if session has active flow (UNCHANGED)
    if (sessionState.filteredSteps.length > 0) {
      const stepDefs = buildStepDefinitions(sessionState.filteredSteps);
      setTotalSteps(stepDefs.length);
    }

    // 6. Update current session ID (UNCHANGED)
    setCurrentSessionId(sessionId);
    if (metadata) {
      setProjectMetadata({ ...metadata, currentSessionId: sessionId });
    }

    console.log(`Switched to session ${sessionId} (Item ${sessionState.itemNumber})`);
  } catch (error) {
    console.error('Failed to switch session:', error);
  } finally {
    setIsLoading(false);
  }
};
```

---

### Phase 3: Update Imports

**File:** `components/ClaudeChat.tsx` (top)

**Add:**
```typescript
import { loadItemDataFromDisk, mergeSessionData } from '@/lib/session-loader';
```

---

### Phase 4: Edge Case Handling

#### Case 1: No JSON File (New Session Never Submitted)
**Behavior:** `loadItemDataFromDisk()` returns `{}`
**Result:** Executor initialized with empty state (correct - no data exists)

#### Case 2: JSON File Corrupted
**Behavior:** `loadItemDataFromDisk()` catches parse error, returns `{}`
**Result:** Session state used as fallback (graceful degradation)

#### Case 3: Partial Data (Only 2/5 Forms Saved)
**Behavior:** Merge includes only saved forms
**Result:** Forms display saved data, others remain empty (correct)

#### Case 4: Metadata Pollution
**Behavior:** `mergeSessionData()` filters `_metadata` before merge
**Result:** Executor state clean (no `_metadata.lastUpdated` in ITEM_NUM field)

#### Case 5: Session State vs Disk Data Conflict
**Scenario:** User edited form but didn't submit (session has newer data)
**Behavior:** `mergeSessionData()` prioritizes disk data (source of truth)
**Rationale:** Unsaved changes should not persist (matches file system state)

**Alternative (if you want session priority):**
```typescript
// Session state priority (unsaved edits win)
return {
  ...flattenedDiskData,
  ...sessionState,  // Swap order
};
```

---

### Phase 5: Testing Checklist

#### Unit Tests (Manual)
1. ✅ Switch to session with existing JSON file
   - **Expected:** Forms display saved data
2. ✅ Switch to session without JSON file (new item)
   - **Expected:** Forms empty, no errors
3. ✅ Switch to session with partial JSON (only 2 forms)
   - **Expected:** 2 forms filled, others empty
4. ✅ Switch between sessions rapidly
   - **Expected:** Correct data for each session
5. ✅ Edit form, switch away WITHOUT submitting, switch back
   - **Expected:** Unsaved changes lost (disk data wins)

#### Integration Tests
1. ✅ Create item → Fill forms → Save → Switch to another item → Switch back
   - **Expected:** All saved data restored
2. ✅ Rename item (change ITEM_NUM) → Switch sessions
   - **Expected:** Loads from renamed file (`item-002.json`)
3. ✅ Delete JSON file manually → Switch session
   - **Expected:** Session state used, no crash

---

## Summary of Changes

### New Files
- `lib/session-loader.ts` (70 lines)

### Modified Files
- `components/ClaudeChat.tsx`:
  - Import `loadItemDataFromDisk`, `mergeSessionData`
  - Modify `switchToSession()` (lines 571-653)
    - Add disk data loading after line 623
    - Merge disk + session data before executor creation (line 631)
    - Update flowState with merged data

### No Changes Needed
- `/api/save-item-data/route.ts` (GET already exists)
- `lib/flow-engine/executor.ts` (already accepts initialState)
- `DynamicFormRenderer.tsx` (reads from flowExecutor.getState())

---

## Implementation Order

1. **Create `lib/session-loader.ts`** (15 min)
   - Write `loadItemDataFromDisk()`
   - Write `mergeSessionData()`
   - Test with sample JSON files

2. **Update `ClaudeChat.tsx`** (10 min)
   - Add imports
   - Modify `switchToSession()`
   - Add console logs for debugging

3. **Manual Testing** (20 min)
   - Test all 5 unit test scenarios
   - Verify forms display data

4. **Integration Testing** (15 min)
   - End-to-end flow testing
   - Multi-session switching

**Total Time:** ~60 minutes

---

## Rollback Plan

If issues arise:
1. Revert `ClaudeChat.tsx` changes (git checkout)
2. Delete `lib/session-loader.ts`
3. Existing session state restoration still works (no data from disk)

---

## Future Enhancements

1. **Cache disk data in sessionStateMap** (avoid redundant API calls)
2. **Prefetch JSON on session creation** (faster initial load)
3. **Show "Loading data..." indicator** during disk fetch
4. **Warn user on unsaved changes** before session switch

---

## Unresolved Questions

1. **Priority conflict:** Session state vs disk data?
   - Current plan: Disk wins (source of truth)
   - Alternative: Session wins (preserve unsaved edits)

2. **Should we update sessionStateMap with disk data?**
   - Current plan: No (keep separate)
   - Alternative: Merge disk data into sessionStateMap for next switch

3. **JSON structure assumptions:**
   - Plan assumes: `{ "form-id": { FIELD: value }, _metadata: {...} }`
   - Verify actual JSON structure matches (check existing files)

4. **Performance:** Should we debounce rapid session switches?
   - Current plan: No debounce (risk: API spam)
   - Alternative: 200ms debounce on sidebar clicks

---

**END OF PLAN**
