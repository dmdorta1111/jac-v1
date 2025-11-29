# Implementation Plan: Fix SDI Form Flow Execution

**Date**: 2025-11-28
**Priority**: HIGH
**Type**: Bug Fix
**Status**: Ready for Implementation

---

## Executive Summary

Fix SDI form flow execution where project-header form is displayed manually OUTSIDE flow system, causing validation to fail against wrong schema (options step) when user submits.

**Root Cause**: Mismatch between displayed form (project-header) and flow state (currentStepOrder=0 points to options step).

**Core Issue**: SDI-form-flow.json has `entryForm: "project-header"` but NO corresponding step definition with `formTemplate: "project-header"` in mainFlow.steps array.

---

## Problem Analysis

### Current Broken Flow

1. **Flow Initialization** (`ClaudeChat.tsx:241-301`)
   - Loads `SDI-form-flow.json`
   - Calls `filterSteps()` which returns `[options, hinge-info, door-info, ...]` - **MISSING project-header**
   - Sets `currentStepOrder=0` pointing to **options step**
   - Displays project-header form manually via `loadFormTemplate('project-header')`

2. **Form Submission** (`ClaudeChat.tsx:356-607`)
   - User submits project-header data
   - Line 376: Gets `currentStep = filteredSteps[0]` → **options step**
   - Line 377: Gets `currentStepId = 'options'`
   - Line 380: Loads form template for **options** (WRONG!)
   - Line 386: Validates project-header data against **options schema** → **FAILS**

3. **Why filterSteps() Excludes project-header**
   - `filterSteps()` in `loader.ts:83-97` filters `formType === 'data-collection'`
   - SDI-form-flow.json has NO step with `formTemplate: "project-header"`
   - Entry form is referenced in metadata but not in steps array

### Expected Correct Flow

1. Flow initialization loads ALL forms from form-templates directory
2. Step 0 = project-header
3. Step 1 = options
4. Step 2 = hinge-info (conditional)
5. Etc.
6. Each submission validates against correct form schema and advances to next

---

## Solution Design

### Strategy: Add project-header as Step 0 in Flow Definition

**Reasoning**: The entryForm concept creates a special case that breaks stepper state synchronization. Instead, make project-header a regular step 0 in the flow.

**Benefits**:
- Stepper state (currentStepOrder) aligns with displayed form
- Validation runs against correct schema
- No special-case logic needed
- Conditional navigation works correctly from step 0

---

## Implementation Steps

### Phase 1: Update Flow Definition (SDI-form-flow.json)

**File**: `C:\Users\waveg\VsCodeProjects\jac-v1\public\form-flows\SDI-form-flow.json`

**Change 1.1** - Add project-header as Step 0 (Insert BEFORE existing steps)

**Location**: Line 21 (before drawing-history step)

**Action**: Add new step object

```json
{
  "order": 0,
  "lineNumber": null,
  "condition": null,
  "description": "Project header information",
  "purpose": "Capture basic project metadata (SO number, job name, customer)",
  "formType": "data-collection",
  "formTemplate": "project-header",
  "contextVariables": [
    "SO_NUM",
    "JOB_NAME",
    "SUB_JOB_NAME",
    "CUSTOMER_NAME"
  ]
}
```

**Change 1.2** - Re-number all existing steps

**Location**: Lines 22-760

**Action**: Increment `order` field for all steps by 1

- drawing-history: order 1 → 1 (unchanged, will be filtered for new items)
- options: order 2 → 2 (was implicit step 0)
- hinge-info: order 3 → 3
- frame-info: order 4 → 4
- door-info: order 7 → 8
- Etc. (all subsequent steps +1)

**Change 1.3** - Update completion criteria

**Location**: Lines 9-17

**Before**:
```json
"completionCriteria": {
  "requiredSteps": [
    "project-header",
    "options",
    "door-info",
    "frame-info"
  ],
  "outputFormat": "Form data collection complete, ready for model generation"
}
```

**After**: (No change needed - project-header already listed)

---

### Phase 2: Verify filterSteps() Logic (No changes needed)

**File**: `C:\Users\waveg\VsCodeProjects\jac-v1\lib\flow-engine\loader.ts`

**Analysis**:
- Line 89: `filter(step => step.formType === 'data-collection')` ✓ Correct
- Line 92-94: Filters out drawing-history for new items ✓ Correct
- After Phase 1 changes, filterSteps() will return:
  - `[project-header, options, hinge-info, frame-info, ...]` for new items
  - `[drawing-history, project-header, options, ...]` for revisions

**Verification**: No code changes needed. Existing logic will work correctly once flow JSON is fixed.

---

### Phase 3: Fix Form Display Logic (ClaudeChat.tsx)

**File**: `C:\Users\waveg\VsCodeProjects\jac-v1\components\ClaudeChat.tsx`

**Change 3.1** - Remove manual entry form loading

**Location**: Lines 269-270

**Before**:
```typescript
// Get entry form from flow
const entryFormId = getEntryForm(flow);
const formSpec = await loadFormTemplate(entryFormId);
```

**After**:
```typescript
// Get first step from filtered flow (project-header for new items)
const firstStep = filteredSteps[0];
if (!firstStep) {
  throw new Error('No valid steps in flow');
}
const formSpec = await loadFormTemplate(firstStep.formTemplate);
```

**Rationale**: Use actual first step from flow instead of metadata.entryForm

**Change 3.2** - Update bot message to reference dynamic step

**Location**: Line 295

**Before**:
```typescript
text: `Project folder created at:\n\`${folderPath}\`\n\n**SDI Form Flow** (Step 1 of ${totalSteps})\n\nPlease fill out the project header information:`,
```

**After**:
```typescript
text: `Project folder created at:\n\`${folderPath}\`\n\n**SDI Form Flow** (Step 1 of ${totalSteps})\n\n${firstStep.description}\n\nPlease fill out the form below:`,
```

**Change 3.3** - Fix currentStepOrder initialization

**Location**: Line 221

**Before**: (No explicit initialization)

**After**: Verify currentStepOrder is set to 0 in initializeStepper (already correct)

```typescript
setCurrentStepOrder(0); // Line 221 - Already correct
```

---

### Phase 4: Update Form Submission Validation Flow

**File**: `C:\Users\waveg\VsCodeProjects\jac-v1\components\ClaudeChat.tsx`

**Analysis**: Lines 374-402 are already correct!

Current logic:
1. Line 376: `const currentStep = filteredSteps[currentStepOrder]` ✓
2. Line 377: `const currentStepId = currentStep?.formTemplate` ✓
3. Line 380: `const formSpec = await loadFormTemplate(currentStepId)` ✓
4. Line 386: `validateFormData(formSpec, formData)` ✓

**After Phase 1-3 changes**:
- When user submits project-header (currentStepOrder=0):
  - currentStep = filteredSteps[0] = project-header step ✓
  - currentStepId = 'project-header' ✓
  - Loads project-header.json ✓
  - Validates against project-header schema ✓

**Verification**: No changes needed. Will work correctly after flow JSON fix.

---

### Phase 5: Remove Deprecated getEntryForm Helper

**File**: `C:\Users\waveg\VsCodeProjects\jac-v1\lib\flow-engine\loader.ts`

**Change 5.1** - Remove getEntryForm function

**Location**: Lines 129-135

**Before**:
```typescript
/**
 * Get entry form template ID from flow
 * @param flow - Form flow definition
 * @returns Entry form template ID
 */
export function getEntryForm(flow: FormFlow): string {
  return flow?.metadata?.entryForm || 'project-header';
}
```

**After**: DELETE entire function

**Rationale**: No longer needed. First step in filteredSteps array is always entry form.

**Change 5.2** - Remove import in ClaudeChat.tsx

**Location**: Line 69

**Before**:
```typescript
import { loadFlow, filterSteps, buildStepDefinitions, getEntryForm, type FormFlow, type FlowStep } from "@/lib/flow-engine/loader";
```

**After**:
```typescript
import { loadFlow, filterSteps, buildStepDefinitions, type FormFlow, type FlowStep } from "@/lib/flow-engine/loader";
```

---

## Testing Plan

### Test Case 1: New SDI Project Creation (Happy Path)

**Steps**:
1. Click "SDI" button on welcome screen
2. Enter sales order number "12345"
3. Click "Create Project"
4. **Verify**: Project-header form displays
5. Fill in: SO_NUM=12345, JOB_NAME="Test", CUSTOMER_NAME="ACME"
6. Submit form
7. **Verify**: No validation errors
8. **Verify**: Bot message shows "Step 2 of N" with options form
9. Fill options form with OPENING_TYPE=3 (BOTH)
10. Submit
11. **Verify**: Hinge-info form displays (conditional on OPENING_TYPE)
12. Continue through flow
13. **Verify**: Flow completes successfully
14. **Verify**: Export variables API called
15. **Verify**: Completion message shows variable count and export path

**Expected Outcome**: ✓ All forms display in correct order, validation succeeds, flow completes

### Test Case 2: Validation Errors on Project Header

**Steps**:
1. Create new SDI project
2. Leave JOB_NAME field empty
3. Submit form
4. **Verify**: Validation error: "Job Name is required"
5. **Verify**: Form remains visible (not removed from messages)
6. Fill JOB_NAME
7. Submit again
8. **Verify**: Validation passes, options form displays

**Expected Outcome**: ✓ Validation errors display correctly, retry succeeds

### Test Case 3: Conditional Navigation

**Steps**:
1. Create new SDI project, complete project-header
2. In options form, set OPENING_TYPE=2 (FRAME ONLY)
3. Submit options
4. **Verify**: Next form is frame-info (skip door-info since OPENING_TYPE != 1 or 3)
5. Complete frame-info
6. **Verify**: Flow continues correctly based on conditions

**Expected Outcome**: ✓ Conditional steps evaluated correctly

### Test Case 4: Revision/Edit Project

**Steps**:
1. TODO: Add revision flow testing once edit feature is implemented
2. **Verify**: drawing-history appears as step 1 for revisions
3. **Verify**: project-header still appears as step 2

**Expected Outcome**: ✓ Revision flow shows drawing-history before project-header

### Test Case 5: Circle Step Indicator

**Steps**:
1. Create SDI project
2. **Verify**: Circle indicator shows "1 of N" on project-header
3. Submit project-header
4. **Verify**: Circle updates to "2 of N" on options
5. Continue through flow
6. **Verify**: Circle increments correctly each step

**Expected Outcome**: ✓ Progress indicator stays in sync with form flow

---

## Validation Criteria

### Pre-Implementation Checklist

- [x] Root cause identified: Missing project-header step in flow JSON
- [x] Solution designed: Add project-header as step 0
- [x] All affected files identified
- [x] Breaking changes assessed: None (internal flow definition only)

### Post-Implementation Verification

**Step 1: Code Review Checklist**

- [ ] SDI-form-flow.json has project-header as step 0 with order=0
- [ ] All subsequent steps renumbered correctly (+1)
- [ ] ClaudeChat.tsx loads first step from filteredSteps (not getEntryForm)
- [ ] getEntryForm function removed from loader.ts
- [ ] No TypeScript compilation errors
- [ ] No ESLint errors

**Step 2: Functional Testing**

- [ ] Test Case 1 passes (happy path)
- [ ] Test Case 2 passes (validation errors)
- [ ] Test Case 3 passes (conditional navigation)
- [ ] Test Case 5 passes (progress indicator)

**Step 3: Integration Testing**

- [ ] MongoDB form submission saves correct stepId (project-header, not options)
- [ ] FlowExecutor state updates correctly with project-header data
- [ ] Export variables API receives complete form data
- [ ] SmartAssembly JSON contains all expected variables

**Step 4: Regression Testing**

- [ ] Non-SDI projects still work (EMJAC, Harmonic)
- [ ] Single-form submission (fallback) still works
- [ ] Chat interface remains responsive
- [ ] No console errors during flow execution

---

## Risk Assessment

### High Risk Items

**Risk 1**: Re-numbering step orders breaks condition references

**Mitigation**:
- Conditions use formTemplate names, not order numbers ✓
- Verify all condition.parent strings still valid
- Test conditional navigation thoroughly

**Risk 2**: Stepper UI state desynchronization

**Mitigation**:
- CircleStepIndicator uses currentStepOrder + 1 (line 815) ✓
- Verify progress updates on each submit
- Test backward navigation (if implemented)

### Medium Risk Items

**Risk 3**: Form pre-filling breaks with new step 0

**Mitigation**:
- FlowExecutor.getContextValues() uses field names, not step order ✓
- Test context variable propagation from project-header to options

**Risk 4**: MongoDB session tracking with new step IDs

**Mitigation**:
- Session ID remains same for all steps ✓
- stepId field will change to 'project-header' for step 0
- Verify export-variables API aggregates correctly

### Low Risk Items

**Risk 5**: Breaking changes for future flows (EMJAC, Harmonic)

**Mitigation**:
- Changes are SDI-specific (flow JSON file)
- Loader/executor logic is generic ✓
- Document entryForm metadata as optional

---

## Rollback Plan

If critical bugs discovered in production:

**Immediate Rollback** (< 5 min):
1. Revert SDI-form-flow.json to previous version
2. Restore getEntryForm function in loader.ts
3. Restore manual entry form loading in ClaudeChat.tsx (lines 269-270)

**Partial Rollback** (keep new logic, use fallback):
1. Add try/catch around filteredSteps[0] access
2. Fallback to getEntryForm() if firstStep is undefined
3. Allow time for debugging without full revert

---

## File Modification Summary

### Files to Modify

| File | Lines | Type | Complexity |
|------|-------|------|------------|
| `public/form-flows/SDI-form-flow.json` | 21-760 | Add step, renumber | Medium |
| `components/ClaudeChat.tsx` | 269-270, 295 | Remove getEntryForm call, update message | Low |
| `lib/flow-engine/loader.ts` | 129-135, 69 | Remove function, update imports | Low |

### Files to Review (No Changes)

| File | Reason |
|------|--------|
| `lib/flow-engine/executor.ts` | Logic already correct |
| `lib/validation/zod-schema-builder.ts` | Generic validation, no changes needed |
| `public/form-templates/project-header.json` | Form definition unchanged |

---

## Implementation Order

**Critical Path**: Must execute in order to avoid breaking changes

1. **FIRST**: Update SDI-form-flow.json
   - Add project-header step
   - Renumber all steps
   - Commit: `fix(flow): add project-header as step 0 in SDI flow`

2. **SECOND**: Update ClaudeChat.tsx
   - Replace getEntryForm with filteredSteps[0]
   - Update bot message text
   - Commit: `fix(ui): use first step from flow instead of entryForm metadata`

3. **THIRD**: Remove deprecated code
   - Delete getEntryForm from loader.ts
   - Update imports
   - Commit: `refactor(flow): remove deprecated getEntryForm helper`

4. **FOURTH**: Test thoroughly
   - Run all test cases
   - Verify in browser console
   - Check MongoDB submissions

---

## Success Metrics

**Quantitative**:
- [ ] 0 validation errors on correct form submission
- [ ] 100% of steps display in correct order
- [ ] currentStepOrder matches displayed form index
- [ ] Export contains all N forms data (N = number of satisfied conditions)

**Qualitative**:
- [ ] User can complete SDI flow without errors
- [ ] Progress indicator reflects actual progress
- [ ] Form transitions feel seamless
- [ ] Console logs show correct step IDs

---

## Follow-Up Tasks

**Not in Scope for This Fix** (Create separate issues):

1. **Add Backward Navigation**
   - Allow users to go back and edit previous forms
   - Update currentStepOrder on back button click
   - Pre-fill forms with saved data

2. **Implement Revision Flow**
   - Detect existing projects and load saved data
   - Show drawing-history as step 1
   - Test filterSteps with isRevision=true

3. **Add Flow Visualization**
   - Show full flow tree with completed/pending/skipped steps
   - Highlight conditional branches
   - Preview upcoming forms

4. **Optimize Performance**
   - Lazy load form templates (don't load all upfront)
   - Cache flow state in localStorage
   - Debounce auto-save

---

## Unresolved Questions

1. **Q**: Should we keep `metadata.entryForm` field for backwards compatibility?
   **A**: YES - Keep field but mark as deprecated. Document that first step in mainFlow.steps is now authoritative.

2. **Q**: Do we need to update other flow JSONs (EMJAC, Harmonic) when they're created?
   **A**: NO - Each flow is independent. Pattern established here can be followed for new flows.

3. **Q**: Should drawing-history be step 0 for revisions instead of project-header?
   **A**: NO - Project-header should always be step 0. Drawing-history (when present) should be step 0.5 conceptually, but filterSteps handles this by prepending it for revisions.

4. **Q**: What happens if user refreshes browser mid-flow?
   **A**: FUTURE WORK - Need to implement session persistence (localStorage or MongoDB session recovery).

---

## Code Quality Notes

**Linting**: No linting changes expected (JSON formatting only)

**Type Safety**: No TypeScript type changes needed

**Testing**: Manual testing required (no automated tests exist yet)

**Documentation**: Update inline comments in ClaudeChat.tsx to explain step 0 logic

---

## Estimated Effort

**Implementation**: 1-2 hours
- JSON editing: 30 min
- Code changes: 30 min
- Testing: 30-60 min

**Code Review**: 30 min

**Total**: 2-3 hours

---

## Dependencies

**Blocked By**: None

**Blocks**:
- Revision/edit feature implementation
- Backward navigation feature
- Flow visualization dashboard

**Related Issues**: None (first major flow bug fix)

---

## Plan Status

✅ **Plan Complete**
📅 **Ready for Implementation**: 2025-11-28
👤 **Author**: Claude Code
🔍 **Reviewers**: TBD
