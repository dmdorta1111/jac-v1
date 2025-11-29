# SDI Form Flow Fix - Implementation Summary

**Full Plan**: `251128-fix-sdi-form-flow-execution.md`

---

## Problem

Project-header form shown manually OUTSIDE flow system. When user submits, validation runs against wrong schema (options instead of project-header) → flow stops.

**Root Cause**: SDI-form-flow.json has `entryForm: "project-header"` metadata but NO step with `formTemplate: "project-header"` in steps array.

---

## Solution

Add project-header as Step 0 in flow definition. Remove manual entry form loading logic.

---

## Changes Required

### 1. SDI-form-flow.json (PRIORITY 1)

**Line 21** - Insert BEFORE drawing-history step:

```json
{
  "order": 0,
  "lineNumber": null,
  "condition": null,
  "description": "Project header information",
  "purpose": "Capture basic project metadata (SO number, job name, customer)",
  "formType": "data-collection",
  "formTemplate": "project-header",
  "contextVariables": ["SO_NUM", "JOB_NAME", "SUB_JOB_NAME", "CUSTOMER_NAME"]
}
```

**Lines 22-760** - Increment all step `order` values by 1:
- drawing-history: 1 → 1 (stays, will filter out for new items)
- options: 2 → 2 (was implicit step 0)
- All others: +1

### 2. ClaudeChat.tsx (PRIORITY 2)

**Lines 269-274** - Replace getEntryForm with first step:

```typescript
// BEFORE
const entryFormId = getEntryForm(flow);
const formSpec = await loadFormTemplate(entryFormId);

// AFTER
const firstStep = filteredSteps[0];
if (!firstStep) {
  throw new Error('No valid steps in flow');
}
const formSpec = await loadFormTemplate(firstStep.formTemplate);
```

**Line 295** - Update bot message:

```typescript
// BEFORE
text: `Project folder created...\n\nPlease fill out the project header information:`,

// AFTER
text: `Project folder created...\n\n${firstStep.description}\n\nPlease fill out the form below:`,
```

### 3. loader.ts (PRIORITY 3)

**Lines 129-135** - DELETE getEntryForm function entirely

**Line 69 (ClaudeChat.tsx)** - Remove from import:

```typescript
// BEFORE
import { loadFlow, filterSteps, buildStepDefinitions, getEntryForm, type FormFlow, type FlowStep }

// AFTER
import { loadFlow, filterSteps, buildStepDefinitions, type FormFlow, type FlowStep }
```

---

## Why This Fixes It

**Before Fix**:
1. filterSteps() returns `[options, hinge-info, ...]` (no project-header)
2. currentStepOrder=0 points to options step
3. UI shows project-header form manually
4. User submits → validates against options schema → FAILS ❌

**After Fix**:
1. filterSteps() returns `[project-header, options, hinge-info, ...]`
2. currentStepOrder=0 points to project-header step
3. UI shows project-header from filteredSteps[0]
4. User submits → validates against project-header schema → SUCCESS ✅

---

## Testing

**Happy Path**:
1. Create SDI project → project-header displays
2. Fill SO_NUM, JOB_NAME, CUSTOMER_NAME → submit
3. Verify options form displays (Step 2 of N)
4. Continue through conditional flow
5. Verify export completes successfully

**Validation Test**:
1. Leave JOB_NAME empty → submit
2. Verify error: "Job Name is required"
3. Fill JOB_NAME → submit again
4. Verify success

**Conditional Test**:
1. Set OPENING_TYPE=2 (FRAME ONLY)
2. Verify door-info skipped, frame-info shown next

---

## Files Modified

| File | Action | Lines |
|------|--------|-------|
| `public/form-flows/SDI-form-flow.json` | Add step, renumber | 21-760 |
| `components/ClaudeChat.tsx` | Replace getEntryForm logic | 269-270, 295 |
| `lib/flow-engine/loader.ts` | Remove function | 129-135 |

---

## Risk Mitigation

- ✅ Conditions use formTemplate names (not order numbers) → safe to renumber
- ✅ Executor logic is generic → no changes needed
- ✅ Validation logic is generic → no changes needed
- ✅ Non-SDI flows unaffected (separate JSON files)

---

## Rollback

If critical issue found:
1. Revert SDI-form-flow.json
2. Restore getEntryForm function
3. Restore manual entry form loading (lines 269-270)

**Rollback time**: < 5 minutes

---

## Estimated Effort

- JSON editing: 30 min
- Code changes: 30 min
- Testing: 60 min
- **Total**: 2 hours

---

## Success Criteria

- [ ] Project-header displays as Step 1 of N
- [ ] Form submission validates against correct schema
- [ ] Options displays as Step 2 of N
- [ ] Flow completes with all forms executed
- [ ] Export contains data from all submitted forms
- [ ] Zero console errors

---

**Status**: ✅ Plan Complete, Ready for Implementation
