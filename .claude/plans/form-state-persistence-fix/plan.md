# Form State Persistence Fix - Implementation Plan
**Date:** 2025-11-30
**Project:** JAC-V1 Dynamic Form System
**Scope:** Fix multi-session form state issues + implement form tab navigation
**Compliance:** KISS, YAGNI, DRY, backward compatible, no template changes

---

## Executive Summary

Fix 4 critical issues in multi-session form state management based on debugger investigation. Prioritized by impact/risk. Total estimated effort: 3-4 hours. All fixes are surgical, minimal code changes, backward compatible.

**Issues:**
- **P0:** Form state not preserved between sessions (data loss)
- **P1:** Item number not syncing to session state on creation
- **P2:** No form tab system for editing completed forms
- **P3:** Table selection state shared across form instances

---

## Issue Breakdown & Fixes

### P0: Form State Not Preserved Between Sessions
**Impact:** HIGH - Users lose typed data when switching sessions
**Complexity:** MEDIUM
**Files:** `ClaudeChat.tsx`, `DynamicFormRenderer.tsx`
**Estimated Time:** 1.5 hours

#### Root Causes
1. **Race condition in session switch** - `setFlowState()` and `setMessages()` called sequentially, form renders before state propagates
2. **Form data reset on session change** - useEffect unconditionally resets formData
3. **Pre-filled defaults not synced** - Only user-typed values enter activeFormDataMap

#### Code Changes

**Change 1.1: Fix race condition in session switch**
```typescript
// File: components/ClaudeChat.tsx
// Line: 686-691
// BEFORE:
setFlowState(mergedFlowState);
setMessages(sessionState.messages);

// AFTER:
setFlowState(mergedFlowState);
// Use setTimeout to ensure flowState update propagates to initialFormData memo
// before form renders. Zero timeout schedules for next event loop tick.
setTimeout(() => {
  setMessages(sessionState.messages);
}, 0);
```

**Change 1.2: Preserve formData on re-render if initialData empty**
```typescript
// File: components/DynamicFormRenderer.tsx
// Line: 212-216
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

  // Only reset formData if:
  // 1. initialData has content (explicit restore) OR
  // 2. formData is empty (first render)
  // This preserves unsaved changes when session switches without initialData
  const shouldReset =
    Object.keys(initialData || {}).length > 0 ||
    Object.keys(formData).length === 0;

  if (shouldReset) {
    setFormData(merged);
  }
}, [sessionId, formSpec.formId, initialData]);
```

**Change 1.3: Sync pre-filled defaults to activeFormDataMap**
```typescript
// File: components/DynamicFormRenderer.tsx
// Line: 218-225 (existing useEffect)
// MODIFY to also sync on mount:
useEffect(() => {
  const initialData = buildInitialFormData(formSpec);
  if (Object.keys(initialData).length > 0) {
    // Sync pre-filled defaults to parent immediately
    // This ensures session state captures defaultValue fields
    onFormDataChange?.(formSpec.formId, initialData);
  }
}, [formSpec.formId, onFormDataChange]); // Add onFormDataChange to deps
```

#### Testing Checklist
- [ ] Create Item 001, type "Test" in OPENING_WIDTH field (don't submit)
- [ ] Create Item 002
- [ ] Switch back to Item 001
- [ ] Verify "Test" still in OPENING_WIDTH field
- [ ] Submit Item 001 form
- [ ] Switch to Item 002, fill form
- [ ] Switch back to Item 001
- [ ] Verify submitted data displays correctly
- [ ] Test with pre-filled defaults (SO_NUM field)
- [ ] Verify defaults persist when switching away/back before submission

#### Risk Assessment
**Risk:** Medium
**Mitigation:**
- setTimeout(0) is standard React pattern for state synchronization
- Conditional formData reset preserves existing behavior when initialData provided
- Pre-filled sync only runs on mount, no performance impact

---

### P1: Item Number Not Updating in Session
**Impact:** MEDIUM - Item number state inconsistent until form submitted
**Complexity:** LOW
**Files:** `ClaudeChat.tsx`
**Estimated Time:** 15 minutes

#### Root Cause
`currentItemNumber` state not set when session created. Only set after first form submission (line 982).

#### Code Changes

**Change 2.1: Set currentItemNumber on session creation**
```typescript
// File: components/ClaudeChat.tsx
// Line: 570 (add this line)
// Context: Inside startNewItemChat(), after creating bot message

setMessages([botMessage]);
setCurrentItemNumber(itemNumber); // ← ADD THIS LINE

console.log(`Created item session ${sessionId} for item ${itemNumber}`);
```

#### Testing Checklist
- [ ] Create new project
- [ ] Click "Create First Item"
- [ ] Verify sidebar shows "Item 001" immediately
- [ ] Type in form field, switch to another item
- [ ] Switch back to Item 001
- [ ] Verify item number still "001" in session state
- [ ] Change ITEM_NUM to "005", submit form
- [ ] Verify sidebar updates to "Item 005"

#### Risk Assessment
**Risk:** LOW
**Mitigation:**
- Single line addition, no existing logic changed
- Item number already tracked in session.itemNumber (line 484)
- This just syncs to component state earlier

---

### P2: Form Tab Navigation System (NEW FEATURE)
**Impact:** HIGH - Critical UX gap for editing completed forms
**Complexity:** HIGH
**Files:** New component + integration in `ClaudeChat.tsx`, update `SessionState`
**Estimated Time:** 2 hours

#### Feature Requirements
- Horizontal tab bar showing all forms in flow
- Visual states: ✓ (completed), → (active), ⏸ (pending)
- Click tab → load form with existing data
- Re-submit → update flowState + disk JSON + MongoDB
- Tabs scroll horizontally on mobile
- Positioned between stepper and messages area

#### New Component Structure
**File:** `components/FormTabNavigation.tsx`

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Check, ChevronRight, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormTab {
  formId: string;
  label: string;
  order: number;
  status: 'completed' | 'active' | 'pending';
}

interface FormTabNavigationProps {
  tabs: FormTab[];
  currentFormId: string;
  onTabClick: (formId: string) => void;
  className?: string;
}

export function FormTabNavigation({
  tabs,
  currentFormId,
  onTabClick,
  className
}: FormTabNavigationProps) {
  return (
    <div className={cn(
      "border-b border-border bg-card/50 backdrop-blur-sm",
      className
    )}>
      <div className="px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 py-3 min-w-max">
          {tabs.map((tab) => {
            const isActive = tab.formId === currentFormId;
            const Icon =
              tab.status === 'completed' ? Check :
              tab.status === 'active' ? ChevronRight :
              Pause;

            return (
              <Button
                key={tab.formId}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onTabClick(tab.formId)}
                disabled={tab.status === 'pending'}
                className={cn(
                  "flex items-center gap-2 transition-all",
                  isActive && "shadow-md",
                  tab.status === 'completed' && !isActive && "border-green-500/30 hover:border-green-500",
                  tab.status === 'pending' && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

#### Integration Changes

**Change 3.1: Add completedFormIds to SessionState**
```typescript
// File: lib/session-validator.ts
// Line: 9-18
export interface SessionState {
  messages: any[];
  flowState: Record<string, any>;
  currentStepOrder: number;
  filteredSteps: any[];
  itemNumber: string;
  validationErrors: Record<string, string>;
  activeFormData: Record<string, any>;
  completedFormIds: string[]; // ← ADD THIS LINE
  lastAccessedAt?: number;
}
```

**Change 3.2: Update createFreshSessionState**
```typescript
// File: lib/session-validator.ts
// Line: 65-76
export function createFreshSessionState(itemNumber: string = ''): SessionState {
  return {
    messages: [],
    flowState: {},
    currentStepOrder: 0,
    filteredSteps: [],
    itemNumber,
    validationErrors: {},
    activeFormData: {},
    completedFormIds: [], // ← ADD THIS LINE
    lastAccessedAt: Date.now(),
  };
}
```

**Change 3.3: Track form completion on submit**
```typescript
// File: components/ClaudeChat.tsx
// Line: 1022-1030 (after removing form from messages)

// Remove form from current message
setMessages((prev) => prev.map(msg =>
  msg.formSpec ? { ...msg, formSpec: undefined } : msg
));

// Track completed form in session state
if (currentSessionId) {
  setSessionStateMap(prev => ({
    ...prev,
    [currentSessionId]: {
      ...(prev[currentSessionId] || createFreshSessionState()),
      completedFormIds: [
        ...(prev[currentSessionId]?.completedFormIds || []),
        currentStepId
      ].filter((id, idx, arr) => arr.indexOf(id) === idx) // dedupe
    }
  }));
}
```

**Change 3.4: Add handleFormTabClick handler**
```typescript
// File: components/ClaudeChat.tsx
// Line: ~1190 (add new function after handleFormSubmit)

/**
 * Load and display a previously completed form for editing
 * @param formId - Form template ID (e.g., "sdi-project", "hinge-info")
 */
const handleFormTabClick = async (formId: string) => {
  if (!currentSessionId || !flowExecutor) return;

  setIsLoading(true);

  try {
    // 1. Load form template
    const formSpec = await loadFormTemplate(formId);
    if (!formSpec) {
      throw new Error(`Form template not found: ${formId}`);
    }

    // 2. Get existing data from flowState
    const existingData = flowExecutor.getState();

    // 3. Pre-fill form with existing data
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

    // 4. Add form to messages (or replace if already visible)
    const tabEditMessage: Message = {
      id: generateId(),
      sender: 'bot',
      text: `Editing **${formSpec.title}**\n\nMake your changes below:`,
      timestamp: new Date(),
      formSpec: prefilledSpec,
    };

    // Remove any existing forms from messages first
    setMessages(prev => [
      ...prev.filter(m => !m.formSpec),
      tabEditMessage
    ]);

    console.log(`Loaded form ${formId} for editing`);
  } catch (error) {
    console.error('Failed to load form for editing:', error);
    const errorMessage: Message = {
      id: generateId(),
      sender: 'bot',
      text: `Error loading form: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};
```

**Change 3.5: Render FormTabNavigation in UI**
```typescript
// File: components/ClaudeChat.tsx
// Line: 1485 (before messages area, after <div className="flex flex-1 flex-col">)

{/* Form Tab Navigation - only show when session has completed forms */}
{currentSessionId && sessionStateMap[currentSessionId]?.completedFormIds?.length > 0 && (
  <FormTabNavigation
    tabs={filteredSteps.map((step, idx) => {
      const isCompleted = sessionStateMap[currentSessionId]?.completedFormIds?.includes(step.formTemplate) || false;
      const isActive = currentStepOrder === idx;
      const isPending = !isCompleted && !isActive;

      return {
        formId: step.formTemplate,
        label: step.label || step.formTemplate.split('-').map(w =>
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' '),
        order: idx,
        status: isCompleted ? 'completed' : isActive ? 'active' : 'pending'
      };
    })}
    currentFormId={filteredSteps[currentStepOrder]?.formTemplate || ''}
    onTabClick={handleFormTabClick}
  />
)}
```

**Change 3.6: Import FormTabNavigation**
```typescript
// File: components/ClaudeChat.tsx
// Line: 54 (add to imports)
import { FormTabNavigation } from '@/components/FormTabNavigation';
```

#### Testing Checklist
- [ ] Create Item 001, complete sdi-project form
- [ ] Verify tab bar appears with "Sdi Project" tab (green checkmark)
- [ ] Complete hinge-info form
- [ ] Verify tab bar shows both tabs as completed
- [ ] Click "Sdi Project" tab
- [ ] Verify form opens with previously submitted data
- [ ] Change OPENING_WIDTH from "36" to "48"
- [ ] Submit form
- [ ] Verify sidebar updates (if item number changed)
- [ ] Verify item JSON file updated on disk
- [ ] Click "Hinge Info" tab
- [ ] Verify hinge-info form data loaded correctly
- [ ] Test with pending forms (should be disabled)
- [ ] Test on mobile (tabs scroll horizontally)

#### Risk Assessment
**Risk:** MEDIUM-HIGH
**Mitigation:**
- New feature, no existing logic broken
- Form submission flow unchanged (just adds tracking)
- Tab click loads form same way as flow progression
- Uses existing validation/save infrastructure
- Potential issue: Loading large forms may lag (optimize with React.memo if needed)

---

### P3: Forms Not Independent Per Item (Table State Isolation)
**Impact:** LOW - Only affects multi-form scenarios (becomes critical with P2)
**Complexity:** MEDIUM
**Files:** `DynamicFormRenderer.tsx`, `ClaudeChat.tsx`, `session-validator.ts`
**Estimated Time:** 45 minutes

#### Root Cause
`selectedTableRows` state is component-level (DynamicFormRenderer:193), shared across all mounted instances. If multiple forms rendered (e.g., via tab system), table selections interfere.

#### Code Changes

**Change 4.1: Add tableSelections to SessionState**
```typescript
// File: lib/session-validator.ts
// Line: 9-19
export interface SessionState {
  messages: any[];
  flowState: Record<string, any>;
  currentStepOrder: number;
  filteredSteps: any[];
  itemNumber: string;
  validationErrors: Record<string, string>;
  activeFormData: Record<string, any>;
  completedFormIds: string[];
  tableSelections: Record<string, number>; // ← ADD THIS LINE (key: fieldName, value: rowIndex)
  lastAccessedAt?: number;
}
```

**Change 4.2: Update createFreshSessionState**
```typescript
// File: lib/session-validator.ts
// Line: 65-77
export function createFreshSessionState(itemNumber: string = ''): SessionState {
  return {
    messages: [],
    flowState: {},
    currentStepOrder: 0,
    filteredSteps: [],
    itemNumber,
    validationErrors: {},
    activeFormData: {},
    completedFormIds: [],
    tableSelections: {}, // ← ADD THIS LINE
    lastAccessedAt: Date.now(),
  };
}
```

**Change 4.3: Lift selectedTableRows to ClaudeChat**
```typescript
// File: components/DynamicFormRenderer.tsx
// Line: 166-173 (update props interface)
interface DynamicFormRendererProps {
  formSpec: DynamicFormSpec;
  sessionId: string;
  initialData?: Record<string, FormFieldValue>;
  onSubmit: (data: Record<string, FormFieldValue>) => void;
  onCancel?: () => void;
  onFormDataChange?: (formId: string, data: Record<string, FormFieldValue>) => void;
  validationErrors?: Record<string, string>;
  selectedTableRows?: Record<string, number>; // ← ADD THIS LINE
  onTableRowSelect?: (fieldName: string, rowIndex: number, rowData: Record<string, string | number>) => void; // ← ADD THIS LINE
}
```

**Change 4.4: Remove component-level table state**
```typescript
// File: components/DynamicFormRenderer.tsx
// Line: 193
// REMOVE THIS LINE:
const [selectedTableRows, setSelectedTableRows] = useState<Record<string, number>>({});

// REPLACE handleTableRowSelect (line 437-444)
// BEFORE:
const handleTableRowSelect = (fieldName: string, rowIndex: number, rowData: Record<string, string | number>) => {
  const stateKey = getTableStateKey(fieldName);
  setSelectedTableRows(prev => ({ ...prev, [stateKey]: rowIndex }));
  handleFieldChange(fieldName, rowData);
};

// AFTER:
const handleTableRowSelect = (fieldName: string, rowIndex: number, rowData: Record<string, string | number>) => {
  // Call parent handler if provided
  onTableRowSelect?.(fieldName, rowIndex, rowData);
  // Update form data
  handleFieldChange(fieldName, rowData);
};
```

**Change 4.5: Update table rendering to use prop**
```typescript
// File: components/DynamicFormRenderer.tsx
// Line: 784-786
// BEFORE:
const stateKey = getTableStateKey(field.name);
const selectedRowIndex = selectedTableRows[stateKey];

// AFTER:
const selectedRowIndex = selectedTableRows?.[field.name];
```

**Change 4.6: Remove table cleanup useEffect**
```typescript
// File: components/DynamicFormRenderer.tsx
// Line: 206-208
// REMOVE THIS ENTIRE BLOCK (no longer needed):
useEffect(() => {
  setSelectedTableRows({});
}, [sessionId]);
```

**Change 4.7: Remove getTableStateKey helper**
```typescript
// File: components/DynamicFormRenderer.tsx
// Line: 292-293
// REMOVE THIS FUNCTION (no longer needed):
const getTableStateKey = (fieldName: string) => `${sessionId}__${formSpec.formId}__${fieldName}`;
```

**Change 4.8: Add table state management to ClaudeChat**
```typescript
// File: components/ClaudeChat.tsx
// Line: ~1743 (in MessageBubble component, update DynamicFormRenderer call)

// BEFORE:
<DynamicFormRenderer
  key={`${sessionId}-${message.id}-${message.formSpec.formId}`}
  formSpec={message.formSpec}
  sessionId={sessionId}
  initialData={initialFormData}
  onSubmit={onFormSubmit}
  onFormDataChange={onFormDataChange}
  validationErrors={validationErrors}
/>

// AFTER:
<DynamicFormRenderer
  key={`${sessionId}-${message.id}-${message.formSpec.formId}`}
  formSpec={message.formSpec}
  sessionId={sessionId}
  initialData={initialFormData}
  onSubmit={onFormSubmit}
  onFormDataChange={onFormDataChange}
  validationErrors={validationErrors}
  selectedTableRows={sessionStateMap[sessionId]?.tableSelections || {}}
  onTableRowSelect={(fieldName, rowIndex, rowData) => {
    if (!sessionId) return;
    setSessionStateMap(prev => ({
      ...prev,
      [sessionId]: {
        ...(prev[sessionId] || createFreshSessionState()),
        tableSelections: {
          ...(prev[sessionId]?.tableSelections || {}),
          [fieldName]: rowIndex
        }
      }
    }));
  }}
/>
```

**Change 4.9: Import createFreshSessionState in ClaudeChat**
```typescript
// File: components/ClaudeChat.tsx
// Line: 60-65 (modify existing import)
import {
  validateSessionState,
  createFreshSessionState,
  type SessionState,
} from "@/lib/session-validator";
```

#### Testing Checklist
- [ ] Create Item 001, open hinge-info form
- [ ] Select row 3 in HINGE_TYPE table
- [ ] Switch to Item 002
- [ ] Open hinge-info form
- [ ] Verify NO row selected (table state isolated)
- [ ] Select row 2 in Item 002
- [ ] Switch back to Item 001
- [ ] Verify row 3 still selected (state preserved)
- [ ] With form tabs: Open sdi-project tab, then hinge-info tab
- [ ] Verify table selections don't interfere between tabs

#### Risk Assessment
**Risk:** LOW
**Mitigation:**
- Prop-based state management (standard React pattern)
- Backward compatible (defaults to empty object if prop not provided)
- No change to form data logic, only UI selection state
- Existing cleanup effect removed (no longer needed)

---

## Migration Strategy

### Backward Compatibility
All changes maintain backward compatibility with existing data:

1. **SessionState schema migration:**
   - New fields: `completedFormIds`, `tableSelections`
   - Handled by `validateSessionStateMap()` (session-validator.ts:96-99)
   - Missing fields default to `[]` and `{}`
   - Old sessions auto-migrate on load

2. **localStorage format unchanged:**
   - Keys: `sessions:list`, `sessions:state` (same)
   - Structure: Just adds optional fields
   - No breaking changes to existing stored data

3. **MongoDB schema:**
   - No changes to FormSubmission collection
   - Item JSON files: No schema changes
   - All saves use existing API endpoints

### Rollback Plan
If critical issues found after deployment:

1. **Quick rollback (< 5 min):**
   - Revert Git commit
   - Rebuild and deploy
   - No data loss (disk JSON + MongoDB unchanged)

2. **Data recovery:**
   - Session state: Clear localStorage `sessions:state` key
   - Forms rebuild from MongoDB via `rebuildSessionsFromDB()`
   - No user action required

### Testing Protocol

**Phase 1: Unit Testing (30 min)**
- Run all existing validation scripts
- Test each fix in isolation
- Verify no console errors

**Phase 2: Integration Testing (1 hour)**
- Test full user flow: Create project → Items → Session switching
- Test edge cases: Empty forms, pre-filled defaults, validation errors
- Test form tabs: Complete forms, click tabs, re-edit, re-submit

**Phase 3: Cross-browser Testing (30 min)**
- Chrome, Firefox, Edge (desktop)
- Mobile Safari, Chrome (responsive tabs)
- Verify localStorage + BroadcastChannel work

**Phase 4: Multi-tab Testing (30 min)**
- Open two browser tabs
- Create items in Tab A
- Verify sync to Tab B
- Edit same item in both tabs simultaneously
- Verify no race conditions

---

## Implementation Order

### Step 1: P1 (Item Number Sync) - 15 min
**Why first:** Simplest, no dependencies, high value

1. Add `setCurrentItemNumber(itemNumber)` at ClaudeChat.tsx:570
2. Test item creation
3. Commit: `fix: sync item number to session state on creation`

### Step 2: P3 (Table State Isolation) - 45 min
**Why second:** Required for P2, avoids rework

1. Update SessionState interface (session-validator.ts)
2. Lift selectedTableRows to props (DynamicFormRenderer.tsx)
3. Add table state management in ClaudeChat.tsx
4. Remove component-level table state
5. Test table selections across sessions
6. Commit: `feat: isolate table selection state per session`

### Step 3: P0 (Form State Persistence) - 1.5 hours
**Why third:** Most critical, complex, needs clean slate

1. Fix race condition (ClaudeChat.tsx:686)
2. Preserve formData on re-render (DynamicFormRenderer.tsx:212)
3. Sync pre-filled defaults (DynamicFormRenderer.tsx:220)
4. Test session switching thoroughly
5. Test with various form types (defaults, typed values, tables)
6. Commit: `fix: preserve form state when switching sessions`

### Step 4: P2 (Form Tab System) - 2 hours
**Why last:** Most complex, builds on all previous fixes

1. Create FormTabNavigation component
2. Update SessionState (add completedFormIds)
3. Track form completion in handleFormSubmit
4. Add handleFormTabClick handler
5. Render FormTabNavigation in UI
6. Test tab navigation thoroughly
7. Commit: `feat: add form tab navigation for editing completed forms`

---

## Code Review Checklist

### Before Implementation
- [ ] Read debugger report thoroughly
- [ ] Understand current state flow
- [ ] Review SessionState schema
- [ ] Map all state update locations

### During Implementation
- [ ] Follow KISS principle (simplest solution)
- [ ] No changes to form templates
- [ ] Preserve existing API contracts
- [ ] Add comments for complex logic
- [ ] Use TypeScript strict mode

### After Implementation
- [ ] Run `npm run build` (no errors)
- [ ] Check browser console (no warnings)
- [ ] Test all P0-P3 scenarios
- [ ] Verify localStorage size reasonable
- [ ] Check network tab (no excessive API calls)

---

## Performance Considerations

### State Update Frequency
**Current:** Auto-save every message change (debounced 1s)
**Impact:** With form tabs, more frequent state updates
**Mitigation:**
- FormTabNavigation is pure component (no re-renders unless tabs change)
- handleFormTabClick only runs on user click (not auto)
- No performance degradation expected

### localStorage Size
**Current:** ~50KB per project (10 items, 5 forms each)
**After P2:** +5-10KB (completedFormIds tracking)
**Risk:** LOW - Cleanup runs at 4MB limit
**Mitigation:** Existing cleanup logic handles growth

### Form Rendering
**Current:** One form visible per session
**After P2:** Still one form (tabs just switch which form shown)
**Risk:** NONE - No simultaneous multi-form rendering

---

## Deployment Steps

### Pre-deployment
1. Create feature branch: `fix/form-state-persistence`
2. Implement P1-P3 in separate commits
3. Run full test suite
4. Create PR with debugger report linked

### Deployment
1. Merge to `Desktop` branch
2. Test in dev environment
3. Monitor browser console for errors
4. Deploy to production

### Post-deployment
1. Monitor error logs (first 24 hours)
2. Check localStorage usage patterns
3. Gather user feedback on form tabs
4. Document any edge cases discovered

---

## Success Metrics

### Functional
- [ ] No data loss on session switch (100% pass rate)
- [ ] Item numbers sync correctly (100% pass rate)
- [ ] Form tabs load previous data (100% accuracy)
- [ ] Table selections isolated per session (no interference)

### Performance
- [ ] Page load time: < 2s (unchanged from baseline)
- [ ] Session switch time: < 500ms (target)
- [ ] Form tab click response: < 300ms (target)
- [ ] localStorage growth: < 10KB per project (acceptable)

### User Experience
- [ ] No console errors in normal usage
- [ ] Tab UI responsive on mobile
- [ ] Validation errors display correctly
- [ ] No regressions in existing flows

---

## Unresolved Questions

### Design Decisions Needed
1. **activeFormData vs. disk data priority:**
   - Current: Disk always wins
   - Proposal: Merge activeFormData AFTER disk data
   - **Decision required:** Approve current behavior or change?

2. **Form tab edit validation:**
   - Should re-edited forms re-validate against current flow state?
   - Or validate against original submission state?
   - **Decision required:** Define validation scope for tab edits

3. **Multi-tab editing conflicts:**
   - If same session edited in two browser tabs, which wins?
   - Current: Last write wins (no conflict detection)
   - **Decision required:** Add conflict warnings or keep simple?

### Future Enhancements (Out of Scope)
- Undo/redo for form edits
- Form version history (audit trail)
- Batch item operations (e.g., duplicate item)
- Export/import session state (backup/restore)

---

## Files Modified Summary

### Modified Files (6)
1. `components/ClaudeChat.tsx` - Session state management, form tabs
2. `components/DynamicFormRenderer.tsx` - Form state persistence, table props
3. `lib/session-validator.ts` - SessionState schema updates
4. `components/leftsidebar.tsx` - No changes (already uses session.itemNumber)

### New Files (1)
1. `components/FormTabNavigation.tsx` - Tab navigation UI component

### Total LOC Changes
- Added: ~200 lines
- Modified: ~50 lines
- Removed: ~15 lines
- Net: +235 lines

---

## Appendix: State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ User Action: Switch Session (Item 001 → Item 002)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────────┐
         │ 1. Save Current Session State          │
         │    - flowExecutor.getState()           │
         │    - Bundle messages, flowState, etc.  │
         │    - Store in sessionStateMap[001]     │
         └────────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────────┐
         │ 2. Load Target Session State           │
         │    - Retrieve sessionStateMap[002]     │
         │    - Validate via validateSessionState │
         │    - If invalid → createFreshState()   │
         └────────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────────┐
         │ 3. Merge Disk Data                     │
         │    - Fetch /api/save-item-data?002     │
         │    - Merge disk JSON → flowState       │
         │    - Disk = source of truth            │
         └────────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────────┐
         │ 4. Update React State                  │
         │    - setFlowState(mergedState)         │
         │    - setTimeout(() =>                  │
         │        setMessages(state.messages), 0) │ ← P0 Fix
         │    - setCurrentSessionId(002)          │
         └────────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────────┐
         │ 5. Form Renders                        │
         │    - initialFormData memo updates      │
         │    - DynamicFormRenderer receives:     │
         │      * initialData (flowState+active)  │
         │      * selectedTableRows (session)     │ ← P3 Fix
         │    - Form fields populate              │
         └────────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────────┐
         │ 6. Tab Bar Updates                     │
         │    - completedFormIds → tab status     │ ← P2 Feature
         │    - Current step → active tab         │
         │    - Tabs clickable for editing        │
         └────────────────────────────────────────┘
```

---

**Plan Complete**
**Next Steps:** Review plan → Approve → Begin implementation (Step 1: P1)
**Estimated Total Time:** 3-4 hours (coding + testing)
**Risk Level:** LOW-MEDIUM (surgical fixes, backward compatible)
