# Investigation Report: CHOICE Parameter Not Appearing in Item Details

**Date:** 2025-12-01 04:26:09
**Investigator:** Senior Debugging Agent
**Status:** Root Cause Identified

---

## Executive Summary

**Issue:** CHOICE parameter not appearing in "Item Details" section of sdi-project form
**Root Cause:** CHOICE field not defined in form template schema
**Impact:** CHOICE data saved to backend/database but not visible/editable in UI
**Evidence:** CHOICE=1 successfully saved in item JSON files but missing from form definition

---

## Phase 1: Root Cause Investigation

### 1.1 CHOICE Parameter Location - CONFIRMED WORKING

**File:** `components/ClaudeChat.tsx`
**Lines:** 1129-1132, 1191-1194

CHOICE parameter correctly added to state in TWO places:

```typescript
// Line 1129-1132: FlowExecutor state update
const stateDataToUpdate = currentStepId === 'sdi-project'
  ? { ...validationResult.data, CHOICE: 1 }
  : validationResult.data;
flowExecutor.updateState(currentStepId, stateDataToUpdate);

// Line 1191-1194: Item data save
const formDataToSave = currentStepId === 'sdi-project'
  ? { ...validationResult.data, CHOICE: 1 }
  : validationResult.data;
```

### 1.2 Item Details Backend - CONFIRMED WORKING

**File:** `app/api/save-item-data/route.ts`
**Lines:** 100-112

API successfully receives and saves CHOICE parameter:

```typescript
// Merge new form data (accumulate all forms)
const finalData = {
  ...existingData,
  ...(formId ? { [formId]: formData } : formData),
  _metadata: { ... }
};
```

**Evidence Files:**
- `project-docs/SDI/32233/items/123.json` - Line 2: `"CHOICE": 1` ✓
- `project-docs/SDI/65421/items/123.json` - Line 2: `"CHOICE": 1` ✓

### 1.3 Item Details UI Section - ROOT CAUSE IDENTIFIED

**File:** `public/form-templates/sdi-project.json`
**Line:** 8 - Section title "Item Details"
**Lines:** 10-221 - Field definitions

**CRITICAL FINDING:** CHOICE field NOT DEFINED in form template

Current fields in "Item Details" section:
1. ITEM_NUM (line 13)
2. QTY (line 21)
3. JOW (line 28)
4. JOH (line 36)
5. JD (line 44)
6. FIRE_RATING (line 53)
7. COMMENTS (line 61)
8. DOOR_QTY (line 70)
9. SUBMITTAL (line 88)
10. APPROVAL (line 95)
11. DOOR_LABEL_CONSTRUCTION (line 102)
12. MULTIPLE_TAGS (line 109)
13. SDI_LOCATION (line 116)
14. OPENING_TYPE (line 125)
15. HANDI_ (line 155)

**Missing:** CHOICE field definition

---

## Phase 2: Pattern Analysis

### 2.1 Working Parameters Pattern

All visible parameters follow this pattern in sdi-project.json:

```json
{
  "id": "SDI-Project-field-id",
  "name": "FIELD_NAME",
  "label": "Display Label",
  "type": "input|integer|float|switch|select",
  "required": true|false,
  "defaultValue": value,
  ...
}
```

### 2.2 CHOICE vs Working Parameters

| Aspect | Working Parameters | CHOICE Parameter |
|--------|-------------------|------------------|
| Form definition | ✓ Present in sdi-project.json | ✗ Missing from sdi-project.json |
| Backend save | ✓ Saved to item JSON | ✓ Saved to item JSON |
| UI visibility | ✓ Displayed in form | ✗ Not displayed in form |
| Data flow | User input → validation → save | Backend injection → save only |

### 2.3 Data Flow Trace

```
User fills form
    ↓
Form validation (only defined fields)
    ↓
validationResult.data (no CHOICE)
    ↓
ClaudeChat.tsx adds CHOICE=1 (line 1131, 1193)
    ↓
save-item-data API receives CHOICE
    ↓
JSON file written with CHOICE ✓
    ↓
But user never sees CHOICE in UI ✗
```

---

## Phase 3: Root Cause Analysis

### 3.1 Why CHOICE Not Appearing

**Root Cause:** Form template defines UI - missing field = invisible field

**Technical Explanation:**
Form rendering engine (DynamicFormRenderer.tsx) iterates through `formSpec.sections[].fields[]`. Since CHOICE not in sdi-project.json fields array, it's never rendered.

**Evidence Chain:**
1. `public/form-templates/sdi-project.json` Section "Item Details" (line 8)
2. Fields array lines 10-221 - no CHOICE field
3. CHOICE added programmatically AFTER form submission (line 1131)
4. Result: CHOICE saved but never visible in form

### 3.2 Current Behavior

**What works:**
- CHOICE=1 injected into state after sdi-project form submitted
- CHOICE saved to item JSON files
- CHOICE persisted in MongoDB
- Backend logic receives CHOICE correctly

**What doesn't work:**
- CHOICE not visible in "Item Details" UI
- User cannot see CHOICE value
- User cannot edit CHOICE value
- Form doesn't show CHOICE field

### 3.3 Comparison with Similar Fields

Working field example (SUBMITTAL):
```json
{
  "id": "SDI-Project-submittal",
  "name": "SUBMITTAL",
  "label": "Submittal",
  "type": "switch",
  "defaultValue": false
}
```

Missing CHOICE field should be:
```json
{
  "id": "SDI-Project-choice",
  "name": "CHOICE",
  "label": "Choice Mode",
  "type": "integer|switch",
  "defaultValue": 1,
  "required": false
}
```

---

## Evidence Supporting Root Cause

### Backend Evidence (CHOICE is saved):
1. **File:** `project-docs/SDI/32233/items/123.json:2`
   `"CHOICE": 1` ✓

2. **File:** `project-docs/SDI/65421/items/123.json:2`
   `"CHOICE": 1` ✓

### Frontend Evidence (CHOICE not defined):
3. **File:** `public/form-templates/sdi-project.json:1-228`
   No CHOICE field in entire form template ✗

4. **File:** `components/ClaudeChat.tsx:1131`
   CHOICE injected AFTER form validation (too late for UI) ✗

---

## Fix Location

**Primary Fix Required:**
`public/form-templates/sdi-project.json`
Section: "Item Details" (line 8)
Action: Add CHOICE field definition to fields array (after line 10 or anywhere in fields array)

**Recommended Placement:**
After ITEM_NUM field (line 18) or before first field (line 11)

**Implementation Note:**
Once field added to form template, remove programmatic injection at ClaudeChat.tsx:1131 and 1193 (let form handle it naturally)

---

## Unresolved Questions

1. **Field Type:** Should CHOICE be `integer`, `switch`, or `select`?
   - Current backend expects: integer value (1)
   - UI consideration: switch might be more intuitive for mode toggle

2. **User Editability:** Should users be able to change CHOICE value?
   - Current: hardcoded to 1 ("New item" mode)
   - Alternative: might need values 0, 1, 2 for different modes

3. **Visibility:** Should CHOICE be always visible or conditionally hidden?
   - Current: always set to 1 for new items
   - Consider: hidden field (type="hidden") if user shouldn't see it

4. **Default Value:** Should CHOICE default to 1 or require user selection?
   - Current backend logic: always sets to 1
   - Need product requirement clarification

5. **Form Regeneration:** Is sdi-project.json auto-generated from markdown?
   - Check: `form-creation-data/sdi-project.md` (line not searched)
   - If yes: fix must be in source markdown, not JSON directly

---

## Recommendations

1. **Immediate:** Add CHOICE field to `public/form-templates/sdi-project.json` fields array
2. **Code Cleanup:** Remove programmatic CHOICE injection from ClaudeChat.tsx once field added to form
3. **Validation:** Run `npm run validate:forms` after form template update
4. **Testing:** Verify CHOICE appears in Item Details UI and saves correctly
5. **Documentation:** Update form template documentation with CHOICE field purpose

---

**Investigation Complete - No Implementation Required Per Instructions**
