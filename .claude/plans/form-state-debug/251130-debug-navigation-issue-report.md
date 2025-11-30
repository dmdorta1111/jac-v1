# Form Navigation Issue - Root Cause Analysis

**Date:** 2025-11-30
**Issue:** Navigation shows irrelevant forms not displayed during data input
**Status:** ROOT CAUSE CONFIRMED

---

## Executive Summary

**ROOT CAUSE IDENTIFIED:** Navigation uses static `filteredSteps` array which contains ALL conditionally-possible steps, NOT the dynamically-evaluated steps actually visited during flow execution.

**IMPACT:** Users see forms during prev/next navigation that were skipped due to conditional logic.

**SOLUTION REQUIRED:** Track actual visited steps separately and use for navigation instead of full `filteredSteps` array.

---

## Technical Analysis

### 1. CONFIRMED: Navigation Flow Path

**During Data Input (WORKS CORRECTLY):**
```
handleFormSubmit (line 1000-1118)
  └─> flowExecutor.findNextStep() (line 1051)
      └─> Evaluates conditions dynamically (executor.ts:66-84)
          └─> Returns ONLY steps where condition=true
              └─> Updates currentStepOrder to matched step index (line 1079-1081)
```

**During Navigation (BROKEN):**
```
handleNavigatePrev (lines 1293-1301)
  └─> filteredSteps[currentStepOrder - 1]  // NO CONDITION CHECK
      └─> setCurrentStepOrder(currentStepOrder - 1)
          └─> Shows form regardless of condition

handleNavigateNext (lines 1307-1322)
  └─> filteredSteps[currentStepOrder + 1]  // NO CONDITION CHECK
      └─> Limited by highestStepReached but NOT by conditions
          └─> Shows form regardless of condition
```

### 2. Data Structure Mismatch

**filteredSteps Array Contains:**
- ALL steps that pass initial `filterSteps()` (loader.ts)
- Filters by: projectType, itemType, user role
- DOES NOT filter by runtime conditions (e.g., OPENING_TYPE checks)

**Example from SDI-form-flow.json:**
```json
{
  "order": 3,
  "formTemplate": "options",
  "condition": {
    "expression": "OPENING_TYPE == 1 OR OPENING_TYPE == 2 OR OPENING_TYPE == 3"
  }
}
```

**If OPENING_TYPE=4:**
- Forward flow: `options` form SKIPPED (condition false)
- Navigation: `options` form SHOWN (in filteredSteps array)

### 3. Existing Tracking Mechanisms

**completedFormIds (line 134, 1033-1036):**
```typescript
completedFormIds: string[]; // Track completed form steps for tab navigation
```
- Tracks form IDs that were actually submitted
- Updated on successful form submission (line 1028-1038)
- Deduped to prevent duplicates
- **CURRENTLY UNUSED for navigation**

**highestStepReached (line 136, 1310-1315):**
```typescript
highestStepReached: number; // Track furthest step visited for forward navigation
```
- Tracks furthest step INDEX reached
- Updated on session switch (line 601-612)
- Limits forward navigation but NOT condition-aware
- Uses array index, not actual visited steps

### 4. Code Locations Needing Changes

**File:** `C:\Users\dmdor\VsCode\jac-v1\components\ClaudeChat.tsx`

**Navigation Functions:**
- `handleNavigatePrev()` - Lines 1293-1301
- `handleNavigateNext()` - Lines 1307-1322

**Current Logic:**
```typescript
// BROKEN: Uses filteredSteps array index
const prevStep = filteredSteps[currentStepOrder - 1];
const nextStep = filteredSteps[nextStepIndex];
```

**Data Tracking:**
- `completedFormIds` update - Lines 1028-1038 (working)
- Session state save - Lines 596-619 (working)

---

## Recommended Solution

### Option A: Use completedFormIds for Navigation (RECOMMENDED)

**Why:**
- Already tracking actual visited steps
- Already deduped and maintained
- No additional state needed
- Simple to implement

**Changes Required:**

1. **handleNavigatePrev() (lines 1293-1301):**
```typescript
const handleNavigatePrev = useCallback(() => {
  if (!currentSessionId || currentStepOrder <= 0) return;

  const completed = sessionStateMap[currentSessionId]?.completedFormIds || [];
  const currentFormId = filteredSteps[currentStepOrder]?.formTemplate;

  // Find current position in completed steps
  const currentCompletedIndex = completed.indexOf(currentFormId);
  if (currentCompletedIndex <= 0) return; // First or not found

  // Navigate to previous completed step
  const prevFormId = completed[currentCompletedIndex - 1];
  const prevStepIndex = filteredSteps.findIndex(s => s.formTemplate === prevFormId);

  if (prevStepIndex !== -1) {
    setCurrentStepOrder(prevStepIndex);
    handleFormTabClick(filteredSteps[prevStepIndex].formTemplate);
  }
}, [currentStepOrder, filteredSteps, currentSessionId, sessionStateMap]);
```

2. **handleNavigateNext() (lines 1307-1322):**
```typescript
const handleNavigateNext = useCallback(() => {
  if (!currentSessionId) return;

  const completed = sessionStateMap[currentSessionId]?.completedFormIds || [];
  const currentFormId = filteredSteps[currentStepOrder]?.formTemplate;

  // Find current position in completed steps
  const currentCompletedIndex = completed.indexOf(currentFormId);
  if (currentCompletedIndex < 0 || currentCompletedIndex >= completed.length - 1) return;

  // Navigate to next completed step
  const nextFormId = completed[currentCompletedIndex + 1];
  const nextStepIndex = filteredSteps.findIndex(s => s.formTemplate === nextFormId);

  if (nextStepIndex !== -1) {
    setCurrentStepOrder(nextStepIndex);
    handleFormTabClick(filteredSteps[nextStepIndex].formTemplate);
  }
}, [currentStepOrder, filteredSteps, currentSessionId, sessionStateMap]);
```

### Option B: Re-evaluate Conditions During Navigation

**Why NOT Recommended:**
- More complex implementation
- Performance overhead
- May confuse users if conditions changed since completion
- Requires flowExecutor state restoration

---

## Edge Cases to Consider

1. **Session Restoration:**
   - completedFormIds already persisted in sessionStateMap
   - Already restored on session switch (lines 610, 1358, 1614)
   - No additional persistence needed

2. **First Form (project-header):**
   - completedFormIds will be empty before submission
   - handleNavigatePrev already checks `currentStepOrder <= 0`
   - No change needed

3. **Last Form:**
   - handleNavigateNext checks if nextIndex >= completed.length
   - Prevents navigation beyond last completed form
   - Working correctly

4. **Non-linear Flows:**
   - completedFormIds tracks submission order (insertion order)
   - Matches actual user experience
   - Handles branching flows correctly

5. **Form Re-submission:**
   - completedFormIds already deduped (line 1036)
   - Prevents duplicate entries
   - No change needed

6. **Multi-session:**
   - Each session has own completedFormIds
   - Already session-scoped in sessionStateMap
   - No cross-contamination

---

## Verification Plan

After implementing fix:

1. **Test Conditional Skip:**
   - Set OPENING_TYPE=4 (BORROWED LITE)
   - Verify `options` form skipped in forward flow
   - Submit subsequent forms
   - Navigate back with chevron
   - **EXPECT:** Should NOT show `options` form

2. **Test Linear Navigation:**
   - Submit forms 1→2→3→4
   - Navigate back 4→3→2→1
   - Navigate forward 1→2→3→4
   - **EXPECT:** All navigations work smoothly

3. **Test Session Switch:**
   - Complete forms in Session A
   - Switch to Session B
   - Switch back to Session A
   - Navigate with chevrons
   - **EXPECT:** Only shows completed forms from Session A

---

## Unresolved Questions

None - root cause confirmed, solution designed, edge cases analyzed.

---

## Implementation Priority

**CRITICAL** - User-facing navigation defect affecting core workflow.

**Estimated Effort:** 15 minutes (simple refactor of 2 functions)

**Risk Level:** LOW - Using existing, well-tested data structure (completedFormIds)
