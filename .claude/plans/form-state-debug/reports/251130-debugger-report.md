# Form State Persistence Debug Report
**Date:** 2025-11-30
**Investigator:** Debug Agent
**Task:** Investigate form state not persisting when switching tabs

---

## ROOT CAUSE ANALYSIS

**Primary Issue:** Form state restoration broken due to data structure mismatch between save/restore flow.

**Location:** `components/ClaudeChat.tsx` lines 687-711 (session switching logic)

**Root Cause:**

1. **State Storage (Line 597-606):** Saves executor's flat state correctly:
   ```typescript
   const executorState = flowExecutor?.getState() || {};
   const currentState = {
     flowState: executorState,  // Flat structure
     activeFormData: activeFormDataMap[currentSessionId] || {},
   };
   ```

2. **State Restoration Problem (Line 687-711):** Tries to update `message.formSpec.defaultValue` fields, but DynamicFormRenderer ignores these updates:
   ```typescript
   const updatedMessages = sessionState.messages.map(msg => {
     if (msg.formSpec?.sections?.length) {
       return {
         formSpec: {
           sections: sections.map(section => ({
             fields: fields.map(field => ({
               // ❌ BUG: DynamicFormRenderer rebuilds from formSpec on mount,
               // ignoring these updated defaultValues
               defaultValue: restoredActiveData[field.name] ??
                            mergedFlowState[field.name] ??
                            field.defaultValue,
             })),
           })),
         },
       };
     }
   });
   setMessages(updatedMessages);
   ```

3. **DynamicFormRenderer Wipes State (Lines 204-209):** Rebuilds form data from `formSpec` on every session change:
   ```typescript
   useEffect(() => {
     const freshData = buildInitialFormData(formSpec);
     setFormData(freshData);  // ❌ Overwrites any restored defaultValues
   }, [sessionId, formSpec.formId]);
   ```

---

## DATA FLOW TRACE

### Expected Flow
1. User fills form → `handleFieldChange` updates `formData`
2. `formData` changes → `onFormDataChange` syncs to `activeFormDataMap[sessionId]`
3. User switches tabs → `switchToSession` saves `activeFormDataMap[sessionId]` to `sessionStateMap`
4. User switches back → `switchToSession` restores `activeFormData` and updates message `defaultValue`
5. `DynamicFormRenderer` mounts → reads `defaultValue` and populates form

### Actual Broken Flow
1. ✓ Steps 1-3 work correctly
2. ⚠️ Step 4: Updates message `defaultValue` fields (lines 687-711)
3. ❌ Step 5 FAILS: Form renderer's `useEffect` (line 206-209) calls `buildInitialFormData(formSpec)` which reads original `defaultValue` from template, NOT the updated values from step 4

**Why it fails:** React doesn't detect `formSpec.sections[].fields[].defaultValue` changes as prop updates because `formSpec` object reference doesn't change. The `useEffect` only runs when `sessionId` or `formSpec.formId` change, and it ALWAYS rebuilds from scratch.

---

## CODE LOCATIONS

### Bug Location 1: `components/ClaudeChat.tsx:687-711`
**What:** Message update logic attempting to restore form field values
**Issue:** Updates `message.formSpec.defaultValue` but DynamicFormRenderer ignores these
**Impact:** State restoration code runs but has zero effect

### Bug Location 2: `components/DynamicFormRenderer.tsx:204-209`
**What:** Form data reset on session/form change
**Issue:** Unconditionally rebuilds from `formSpec` without checking for parent-provided data
**Contributing Factor:** `useEffect` dependency `[sessionId, formSpec.formId]` triggers reset on every tab switch

### Bug Location 3: `components/DynamicFormRenderer.tsx:98-108`
**What:** `buildInitialFormData` helper function
**Issue:** Only reads `field.defaultValue` from formSpec, no mechanism to merge external data
**Impact:** Parent has no way to inject restored form state

### Bug Location 4: `components/ClaudeChat.tsx:1796`
**What:** DynamicFormRenderer instantiation
**Issue:** No prop to pass `activeFormDataMap[sessionId]` to form renderer
**Impact:** Restored data has nowhere to go

---

## RECOMMENDED FIXES

### Fix 1: Add `initialData` Prop to DynamicFormRenderer

**File:** `components/DynamicFormRenderer.tsx`

**Changes:**
1. Add prop to interface (line 165):
   ```typescript
   interface DynamicFormRendererProps {
     formSpec: DynamicFormSpec;
     sessionId: string;
     initialData?: Record<string, FormFieldValue>; // ← NEW
     onSubmit: (data: Record<string, FormFieldValue>) => void;
     onCancel?: () => void;
     onFormDataChange?: (formId: string, data: Record<string, FormFieldValue>) => void;
     validationErrors?: Record<string, string>;
   }
   ```

2. Update state initialization (line 182):
   ```typescript
   const [formData, setFormData] = useState<Record<string, FormFieldValue>>(() => {
     const defaults = buildInitialFormData(formSpec);
     return { ...defaults, ...(initialData || {}) };
   });
   ```

3. Update reset effect (lines 204-209):
   ```typescript
   useEffect(() => {
     const defaults = buildInitialFormData(formSpec);
     const merged = { ...defaults, ...(initialData || {}) };
     setFormData(merged);
   }, [sessionId, formSpec.formId, initialData]);
   ```

**Rationale:** Provides explicit mechanism for parent to inject restored form data.

---

### Fix 2: Pass Restored Data from Parent

**File:** `components/ClaudeChat.tsx`

**Change 1:** Update DynamicFormRenderer call (line 1796):
```typescript
<DynamicFormRenderer
  key={`${sessionId}-${message.id}-${message.formSpec.formId}`}
  formSpec={message.formSpec}
  sessionId={sessionId}
  initialData={activeFormDataMap[sessionId] || {}} // ← NEW
  onSubmit={onFormSubmit}
  onFormDataChange={onFormDataChange}
  validationErrors={validationErrors}
/>
```

**Change 2:** Remove broken message update logic (lines 687-711):
```typescript
// DELETE LINES 688-711 (updatedMessages logic)
// Replace with simple assignment:
setMessages(sessionState.messages);
```

**Rationale:**
- Direct prop passing is explicit and reliable
- Removes complex/broken message mutation logic
- Aligns with React's unidirectional data flow

---

### Fix 3: Ensure Parent Syncs Form Data (Already Working)

**File:** `components/ClaudeChat.tsx`
**Lines:** 441-452 (`handleFormDataChange` callback)

**Status:** ✓ Already implemented correctly
```typescript
const handleFormDataChange = useCallback((formId: string, data: Record<string, any>) => {
  if (!currentSessionId) return;

  setActiveFormDataMap(prev => ({
    ...prev,
    [currentSessionId]: {
      ...(prev[currentSessionId] || {}),
      ...data,
    },
  }));
}, [currentSessionId]);
```

**No changes needed** - this part works correctly.

---

## SUMMARY

**Root Cause:** DynamicFormRenderer rebuilds form state from `formSpec.defaultValue` on every session switch, ignoring parent's attempt to restore saved data via message updates.

**Data Flow Mismatch:**
- **Save Path:** User input → `formData` → `onFormDataChange` → `activeFormDataMap[sessionId]` ✓
- **Restore Path:** `activeFormDataMap[sessionId]` → update `message.formSpec.defaultValue` → **IGNORED by form rebuild** ❌

**Fix Strategy:**
1. Add `initialData` prop to DynamicFormRenderer
2. Pass `activeFormDataMap[sessionId]` as `initialData`
3. Form merges `initialData` with `formSpec` defaults on mount/reset
4. Remove broken message update logic

**Estimated Impact:**
- Low risk - changes are additive (new prop with fallback)
- High confidence - fixes data flow at the root
- No changes to state storage logic needed

---

## UNRESOLVED QUESTIONS

1. **Disk data priority:** Lines 649-684 load item data from JSON files. Should this override `activeFormData` (unsaved changes)?
   - Current behavior: disk data merged into `flowState`, then `activeFormData` takes priority
   - Is this correct? Should disk data override unsaved user input?

2. **Form ID matching:** When restoring, does `message.formSpec.formId` always match the current step?
   - If user is mid-flow and session contains multiple forms, which form's data gets restored?
   - Current code: `activeFormDataMap` is flat per session - might restore wrong form's data

3. **Multiple forms per message:** Code assumes one form per message. What if there are multiple?
   - Current `initialData` pattern supports this (flat key-value), but needs testing

4. **State sync timing:** Line 213-218 syncs initial data to parent on `formSpec.formId` change only
   - Missing dependency on `formSpec` full object (eslint warning disabled)
   - Could this cause stale data in `activeFormDataMap`?

---

**Next Steps:**
1. Implement Fix 1 and Fix 2 (high priority)
2. Test multi-session tab switching
3. Test with partially filled forms
4. Verify disk data doesn't override unsaved changes
5. Add integration test for session persistence

---

**Files Referenced:**
- `C:\Users\dmdor\VsCode\jac-v1\components\ClaudeChat.tsx`
- `C:\Users\dmdor\VsCode\jac-v1\components\DynamicFormRenderer.tsx`
- `C:\Users\dmdor\VsCode\jac-v1\lib\session-rebuilder.ts`
- `C:\Users\dmdor\VsCode\jac-v1\lib\session-validator.ts`
