# Form State Issues - Fix Summary

**Date:** 2025-11-30
**Status:** Investigation Complete

---

## Issue 1: Form State Not Preserved Between Sessions

### Root Causes
1. **Race condition in session switch** - `ClaudeChat.tsx:686`
   - `setFlowState()` and `setMessages()` called sequentially
   - Form renders before flowState update propagates to initialFormData

2. **Form data reset on session change** - `DynamicFormRenderer.tsx:210-216`
   - useEffect unconditionally resets formData
   - Empty initialData causes defaults to override unsaved changes

3. **Pre-filled defaults not synced** - `DynamicFormRenderer.tsx:220-225`
   - Only user-typed values enter activeFormDataMap
   - Default values lost on session switch

### Fixes Required

**File: `components/ClaudeChat.tsx`**

```typescript
// Line 686 - Fix async state update race
// BEFORE:
setFlowState(mergedFlowState);
setMessages(sessionState.messages);

// AFTER:
setFlowState(mergedFlowState);
// Defer message rendering until next tick
setTimeout(() => setMessages(sessionState.messages), 0);
```

**File: `components/DynamicFormRenderer.tsx`**

```typescript
// Line 212-216 - Preserve existing formData
// BEFORE:
useEffect(() => {
  const defaults = buildInitialFormData(formSpec);
  const merged = { ...defaults, ...(initialData || {}) };
  setFormData(merged);
}, [sessionId, formSpec.formId, initialData]);

// AFTER:
useEffect(() => {
  const defaults = buildInitialFormData(formSpec);
  const merged = { ...defaults, ...(initialData || {}) };
  // Only reset if initialData has content OR formData is empty
  if (Object.keys(initialData || {}).length > 0 || Object.keys(formData).length === 0) {
    setFormData(merged);
  }
}, [sessionId, formSpec.formId, initialData]);
```

---

## Issue 2: Item Number Not Updating in Session

### Root Cause
**File:** `components/ClaudeChat.tsx:570`

currentItemNumber state not set when session created. Only set after form submission.

### Fix Required

```typescript
// Line 570 - Add missing state update
// AFTER line 569: setMessages([botMessage]);
setCurrentItemNumber(itemNumber);  // ← ADD THIS LINE
```

**Impact:** Sidebar shows correct item number (line 987-989 updates session.itemNumber), but internal state lags.

---

## Issue 3: No Form Tab System

### Root Cause
**Location:** Feature doesn't exist

Once form submitted, `msg.formSpec` set to `undefined` (line 1018-1020). No UI to re-display.

### Implementation Required

**New Files:**
1. `components/FormTabNavigation.tsx` - Tab bar component
2. `lib/hooks/useFormHistory.ts` - Track completed forms

**Changes to existing files:**

**File: `lib/session-validator.ts`**
```typescript
// Line 9-18 - Add completedFormIds
export interface SessionState {
  messages: any[];
  flowState: Record<string, any>;
  currentStepOrder: number;
  filteredSteps: any[];
  itemNumber: string;
  validationErrors: Record<string, string>;
  activeFormData: Record<string, any>;
  completedFormIds: string[];  // ← ADD THIS
  lastAccessedAt?: number;
}
```

**File: `components/ClaudeChat.tsx`**
```typescript
// After line 1020 - Track completed forms
// ADD:
setSessionStateMap(prev => ({
  ...prev,
  [currentSessionId!]: {
    ...prev[currentSessionId!],
    completedFormIds: [...(prev[currentSessionId!]?.completedFormIds || []), currentStepId],
  },
}));

// Line ~1485 (above messages area) - Render tab navigation
{sessionStateMap[currentSessionId]?.completedFormIds?.length > 0 && (
  <FormTabNavigation
    completedFormIds={sessionStateMap[currentSessionId].completedFormIds}
    currentFormId={filteredSteps[currentStepOrder]?.formTemplate}
    flowState={flowState}
    onFormSelect={handleFormTabClick}
  />
)}
```

**New Component: `components/FormTabNavigation.tsx`**
```typescript
interface FormTabNavigationProps {
  completedFormIds: string[];
  currentFormId: string;
  flowState: Record<string, any>;
  onFormSelect: (formId: string) => void;
}

export function FormTabNavigation({ ... }: FormTabNavigationProps) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b pb-2">
      {completedFormIds.map(formId => (
        <button
          key={formId}
          onClick={() => onFormSelect(formId)}
          className={formId === currentFormId ? 'active' : ''}
        >
          ✓ {formId}
        </button>
      ))}
    </div>
  );
}
```

**New Handler: `components/ClaudeChat.tsx`**
```typescript
// Add after handleFormSubmit
const handleFormTabClick = async (formId: string) => {
  // Load form template
  const formSpec = await loadFormTemplate(formId);

  // Populate with existing data
  const existingData = flowState[formId] || {};
  const prefilledSpec = {
    ...formSpec,
    sections: formSpec.sections.map(section => ({
      ...section,
      fields: section.fields.map(field => ({
        ...field,
        defaultValue: existingData[field.name] ?? field.defaultValue,
      })),
    })),
  };

  // Render in modal or expand in chat
  const editMessage: Message = {
    id: generateId(),
    sender: 'bot',
    text: `Editing ${formId}`,
    timestamp: new Date(),
    formSpec: prefilledSpec,
  };

  setMessages(prev => [...prev, editMessage]);
};
```

---

## Issue 4: Forms Not Independent Per Item

### Root Cause
**File:** `components/DynamicFormRenderer.tsx:193`

`selectedTableRows` state shared across all DynamicFormRenderer instances. Data is isolated (correct), but UI selection state isn't.

### Fix Required (LOW PRIORITY - only matters if multiple forms rendered simultaneously)

**File: `lib/session-validator.ts`**
```typescript
// Line 9-18 - Add tableSelections
export interface SessionState {
  // ... existing fields
  activeFormData: Record<string, any>;
  tableSelections: Record<string, number>;  // ← ADD THIS
  lastAccessedAt?: number;
}
```

**File: `components/DynamicFormRenderer.tsx`**
```typescript
// Line 165-173 - Add props
interface DynamicFormRendererProps {
  formSpec: DynamicFormSpec;
  sessionId: string;
  initialData?: Record<string, FormFieldValue>;
  selectedTableRows?: Record<string, number>;  // ← ADD
  onSubmit: (data: Record<string, FormFieldValue>) => void;
  onCancel?: () => void;
  onFormDataChange?: (formId: string, data: Record<string, FormFieldValue>) => void;
  onTableRowSelect?: (stateKey: string, rowIndex: number) => void;  // ← ADD
  validationErrors?: Record<string, string>;
}

// Line 193 - Use prop instead of local state
// REMOVE:
const [selectedTableRows, setSelectedTableRows] = useState<Record<string, number>>({});

// Line 437-444 - Call parent handler
const handleTableRowSelect = (...) => {
  const stateKey = getTableStateKey(fieldName);
  onTableRowSelect?.(stateKey, rowIndex);  // ← Use prop callback
  handleFieldChange(fieldName, rowData);
};
```

**File: `components/ClaudeChat.tsx`**
```typescript
// Pass tableSelections to form
<DynamicFormRenderer
  formSpec={message.formSpec}
  sessionId={sessionId}
  initialData={initialFormData}
  selectedTableRows={sessionStateMap[currentSessionId]?.tableSelections || {}}  // ← ADD
  onSubmit={handleFormSubmit}
  onFormDataChange={handleFormDataChange}
  onTableRowSelect={(key, index) => {  // ← ADD
    setSessionStateMap(prev => ({
      ...prev,
      [currentSessionId!]: {
        ...prev[currentSessionId!],
        tableSelections: { ...(prev[currentSessionId!]?.tableSelections || {}), [key]: index },
      },
    }));
  }}
  validationErrors={validationErrors}
/>
```

---

## Priority Matrix

| Issue | Impact | Complexity | Priority |
|-------|--------|------------|----------|
| Issue 1: Form state loss | HIGH | MEDIUM | **P0** |
| Issue 2: Item number sync | MEDIUM | LOW | **P1** |
| Issue 3: Form tabs | HIGH | HIGH | **P2** |
| Issue 4: Table isolation | LOW | MEDIUM | **P3** |

---

## Testing Checklist

After implementing fixes:

**Issue 1:**
- [ ] Create Item 001
- [ ] Type data in sdi-project form (DON'T submit)
- [ ] Create Item 002
- [ ] Switch back to Item 001
- [ ] Verify: Data restored in form

**Issue 2:**
- [ ] Create Item 001
- [ ] Submit sdi-project form with ITEM_NUM = "005"
- [ ] Verify: Sidebar shows "Item 005" immediately

**Issue 3:**
- [ ] Complete sdi-project and hinge-info forms
- [ ] Verify: Tab bar shows "✓ sdi-project" "✓ hinge-info"
- [ ] Click sdi-project tab
- [ ] Verify: Form opens with saved data
- [ ] Edit field, re-submit
- [ ] Verify: Data updated in flowState and disk

**Issue 4:**
- [ ] Open Item 001, select table row 3
- [ ] Create Item 002
- [ ] Verify: No row selected in Item 002 table

---

## Additional Notes

### State Hierarchy (Source of Truth)

1. **Disk JSON** (`/api/save-item-data`) - Submitted forms (authoritative)
2. **MongoDB** - All submissions (audit trail)
3. **SessionState** - Active session data (includes unsaved)
4. **activeFormDataMap** - Unsaved form data (temporary)
5. **DynamicFormRenderer.formData** - Current form state (ephemeral)

### State Merge Priority (Session Switch)

```typescript
// ClaudeChat.tsx:649-684
mergedFlowState = {
  ...sessionState.flowState,      // Base: last session state
  ...diskData,                     // Override: disk data (submitted)
  // MISSING: ...sessionState.activeFormData  // Should override both for unsaved changes
};

// RECOMMENDED:
mergedFlowState = {
  ...sessionState.flowState,
  ...diskData,
  ...sessionState.activeFormData,  // ← ADD THIS to preserve unsaved edits
};
```

### Performance Impact

All fixes are **low performance cost:**
- Issue 1: Adds `setTimeout(..., 0)` - 1 frame delay (negligible)
- Issue 2: Single state update on session creation
- Issue 3: Renders tab bar only when forms completed (lazy)
- Issue 4: Lifts state to parent (no extra renders)

---

**Estimated Implementation Time:**
- P0 (Issue 1): 2 hours
- P1 (Issue 2): 30 minutes
- P2 (Issue 3): 8-12 hours
- P3 (Issue 4): 3 hours

**Total:** ~14-18 hours for complete fix
