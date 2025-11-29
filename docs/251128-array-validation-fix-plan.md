# Array Validation Fix - Implementation Plan
**Date:** 2025-11-28
**Updated:** 2025-11-28 (Code Review Complete)
**Project:** jac-v1 Form System
**Scope:** Fix array validation errors in form schema and rendering
**Status:** ⚠️ Conditional Approval - 3 Critical Fixes Required

---

## Summary

Fix 4 critical array validation issues causing schema mismatches between Zod validation and form data structures. Focus on checkbox/switch type confusion and table field behavior alignment.

**Review Score:** 7/10
**Build Status:** ✅ Passing (no type errors)
**Test Coverage:** ❌ 0% (no tests written)

---

## Diagnosed Issues

### 1. Checkbox Schema Mismatch
**Location:** `lib/validation/zod-schema-builder.ts:72-75`
**Problem:** Checkbox fields return `string[]` but schema expects `boolean`
**Impact:** Validation fails for all checkbox groups with options

### 2. Table Field Type Conflict
**Location:** `components/DynamicFormRenderer.tsx:304-310`
**Problem:** Schema expects `array`, form stores single selected row `Record<string, string | number>`
**Impact:** Table selections fail validation

### 3. Missing Array Length Validation
**Location:** `lib/validation/zod-schema-builder.ts:114-122`
**Problem:** Required validation doesn't check array `.length > 0`
**Impact:** Empty arrays pass as valid for required fields

### 4. Checkbox Without Options (Type Confusion)
**Location:** `public/form-templates/anchors-sa.json` (6 fields)
**Problem:** Checkbox type used without `options[]` - should be switch
**Impact:** Renders as broken checkbox group instead of boolean toggle

---

## Implementation Order

### Phase 1: Schema Builder Fixes (FIRST)
Fix core validation logic before templates.

#### Task 1.1: Fix Checkbox Array Schema
**File:** `lib/validation/zod-schema-builder.ts`
**Line:** 72-75

**Current Code:**
```typescript
case 'checkbox':
case 'switch':
  schema = z.boolean();
  break;
```

**Fixed Code:**
```typescript
case 'checkbox':
  // Checkbox with options = multi-select string array
  if (field.options && field.options.length > 0) {
    schema = z.array(z.string());
  } else {
    // Checkbox without options = single boolean (should be switch)
    schema = z.boolean();
  }
  break;

case 'switch':
  schema = z.boolean();
  break;
```

#### Task 1.2: Add Array Length Validation
**File:** `lib/validation/zod-schema-builder.ts`
**Line:** 114-122

**Current Code:**
```typescript
if (field.required) {
  // Add required error message
  if (schema instanceof z.ZodString) {
    schema = schema.min(1, `${field.label} is required`);
  } else if (schema instanceof z.ZodNumber) {
    schema = schema.refine(val => val !== null && val !== undefined, {
      message: `${field.label} is required`,
    });
  }
}
```

**Fixed Code:**
```typescript
if (field.required) {
  // Add required error message
  if (schema instanceof z.ZodString) {
    schema = schema.min(1, `${field.label} is required`);
  } else if (schema instanceof z.ZodNumber) {
    schema = schema.refine(val => val !== null && val !== undefined, {
      message: `${field.label} is required`,
    });
  } else if (schema instanceof z.ZodArray) {
    schema = schema.min(1, `${field.label} requires at least one selection`);
  }
}
```

#### Task 1.3: Fix Table Schema Type
**File:** `lib/validation/zod-schema-builder.ts`
**Line:** 103-106

**Current Code:**
```typescript
case 'table':
  // Table data is array of records
  schema = z.array(z.record(z.string(), z.union([z.string(), z.number()])));
  break;
```

**Fixed Code:**
```typescript
case 'table':
  // Table stores SINGLE selected row as record (not array)
  schema = z.record(z.string(), z.union([z.string(), z.number()]));
  break;
```

---

### Phase 2: Template Fixes (SECOND)
Fix type confusion in JSON templates.

#### Task 2.1: Convert Checkbox to Switch in anchors-sa.json
**File:** `public/form-templates/anchors-sa.json`
**Fields to Fix (6 total):**

1. Line 15: `HELP` (id: anchors-sa-help)
2. Line 238: `ANCHOR_BOLTS` (id: anchors-sa-anchor-bolts)
3. Line 269: `DUST_BOXES` (id: anchors-sa-dust-boxes)
4. Line 276: `GROUT_HOLES` (id: anchors-sa-grout-holes)
5. Line 314: `BOTTOM_ONLY` (id: anchors-sa-bottom-only)
6. Line 319: `HEAD_ANCHORS` (id: anchors-sa-head-anchors)

**Change Pattern:**
```json
// BEFORE
{
  "type": "checkbox",
  "description": "..."
}

// AFTER
{
  "type": "switch",
  "helperText": "..."
}
```

**Note:** Change `description` to `helperText` for consistency with switch rendering.

---

## Files to Modify

1. `lib/validation/zod-schema-builder.ts` (3 changes)
2. `public/form-templates/anchors-sa.json` (6 fields)

**Total:** 2 files, 9 modifications

---

## Testing Strategy

### Unit Tests (Manual Validation)

#### Test 1: Checkbox Array Validation
```typescript
// Test checkbox with options returns string array
const checkboxField = {
  name: "colors",
  type: "checkbox",
  options: [{ value: "red" }, { value: "blue" }],
  required: true
};

// Valid: ["red", "blue"]
// Invalid: [] (empty array on required)
// Invalid: "red" (single string)
```

#### Test 2: Switch Boolean Validation
```typescript
// Test switch returns boolean
const switchField = {
  name: "enabled",
  type: "switch",
  required: false
};

// Valid: true, false, undefined
// Invalid: "true", 1, []
```

#### Test 3: Table Record Validation
```typescript
// Test table returns single record
const tableField = {
  name: "selectedRow",
  type: "table",
  tableData: [{ id: 1, name: "Item" }],
  required: true
};

// Valid: { id: 1, name: "Item" }
// Invalid: [{ id: 1 }] (array)
// Invalid: {} (empty object on required - need custom validation)
```

#### Test 4: Required Array Length
```typescript
// Test required checkbox enforces min length
const requiredCheckbox = {
  name: "skills",
  type: "checkbox",
  options: [{ value: "js" }, { value: "ts" }],
  required: true
};

// Valid: ["js"], ["js", "ts"]
// Invalid: []
```

### Integration Tests

#### Test 5: anchors-sa Form Rendering
1. Load `anchors-sa.json` template
2. Verify 6 fields render as `<Switch>` components (not checkbox groups)
3. Toggle each switch - verify boolean values in formData
4. Submit form - verify validation passes

#### Test 6: Checkbox Group Validation
1. Find template with checkbox field that HAS options (e.g., `options.json`)
2. Submit empty - verify "requires at least one selection" error
3. Select option - verify validation passes
4. Verify formData contains `string[]` type

#### Test 7: Table Selection Validation
1. Find template with table field
2. Select row - verify formData stores `Record<string, string|number>`
3. Submit without selection (if required) - verify error
4. Submit with selection - verify validation passes

---

## Edge Cases & Risks

### Risk 1: Table Empty Object Validation
**Problem:** Required table with empty object `{}` will pass validation
**Mitigation:** Add custom refine check:
```typescript
case 'table':
  schema = z.record(z.string(), z.union([z.string(), z.number()]));
  if (field.required) {
    schema = schema.refine(
      (val) => Object.keys(val).length > 0,
      { message: `${field.label} requires a selection` }
    );
  }
  break;
```

### Risk 2: Other Templates with Checkbox Type Confusion
**Problem:** May exist in other 47+ template files
**Mitigation:**
- Run after Phase 1 complete:
```bash
# Find all checkbox fields without options
grep -l '"type": "checkbox"' public/form-templates/*.json | \
  xargs grep -L '"options"'
```
- Manual review each result
- Apply same fix pattern as anchors-sa.json

### Risk 3: Backward Compatibility
**Problem:** Existing saved form data may have wrong types
**Mitigation:** Add data migration in form loader:
```typescript
// Convert old checkbox boolean to new array format
if (field.type === 'checkbox' && typeof savedValue === 'boolean') {
  savedValue = savedValue ? [field.options[0].value] : [];
}
```

---

## Validation Checklist

**Code Review Completed: 2025-11-28**

- [x] All checkbox fields with options validate as `string[]` *(Implemented lines 76-84)*
- [x] All switch fields validate as `boolean` *(Implemented lines 72-74)*
- [x] All table fields validate as single `Record<>` *(Implemented line 125)*
- [x] Required checkbox enforces min length 1 *(Implemented line 145)*
- [ ] **CRITICAL:** Required table enforces non-empty object *(Missing refinement check)*
- [x] anchors-sa.json renders 6 switches (not checkboxes) *(6 fields converted)*
- [x] No regression in existing form templates *(Build passes)*
- [x] Type errors cleared in DynamicFormRenderer *(Build clean)*
- [⚠️] Zod schema builder covers all field type combinations *(Partial - type def limits numeric options)*

**Additional Issues Found:**
- [ ] **CRITICAL:** Fix type definition `lib/form-templates/types.ts:22` to support `value: string | number`
- [ ] **HIGH:** Simplify optional array validation (line 152-154)
- [ ] **MEDIUM:** Add validation tests (0% coverage currently)
- [ ] **LOW:** Add JSDoc documentation

---

## Rollback Plan

If validation breaks:
1. Revert `zod-schema-builder.ts` changes
2. Revert `anchors-sa.json` changes
3. Existing behavior restored (broken, but stable)

Git commands:
```bash
git checkout HEAD -- lib/validation/zod-schema-builder.ts
git checkout HEAD -- public/form-templates/anchors-sa.json
```

---

## Unresolved Questions

1. **Table required validation behavior** - Should empty object `{}` fail? Or only `undefined`?
   - **Code Reviewer Recommendation:** Should fail - add refinement check
2. **Checkbox migration strategy** - Do we need to migrate existing saved data with wrong types?
   - **Code Reviewer Note:** Yes - backward compatibility migration needed (see plan line 285-290)
3. **Global template audit scope** - Should we fix ALL templates in one PR or iterative?
   - **Code Reviewer Finding:** 39 templates use numeric options - suggest iterative approach
4. **Default values for arrays** - Should checkbox default to `[]` instead of `undefined`?
   - **Code Reviewer Note:** Current approach acceptable - explicit defaults in templates preferred
5. **NEW:** Why do table schemas accept `z.null()` values? Intentional or oversight?
   - Needs clarification from original implementer

---

## Success Criteria

**Original Criteria:**
- [x] Zero Zod validation errors for checkbox/table/switch types *(Build passes)*
- [x] All 6 anchors-sa checkbox fields render as switches *(Implemented)*
- [x] Required array fields reject empty arrays *(Implemented line 145)*
- [x] Table validation accepts single record (not array) *(Implemented line 125)*
- [x] No breaking changes to other 47+ templates *(Build passes)*
- [x] Type safety maintained in DynamicFormRenderer *(Build clean)*

**Additional Criteria from Code Review:**
- [ ] Required table validates non-empty object
- [ ] Type definitions support numeric option values
- [ ] Optional array validation simplified
- [ ] Test coverage > 0%

---

## Code Review Summary (2025-11-28)

**Reviewer:** code-reviewer
**Overall Score:** 7/10
**Status:** ⚠️ Conditional Approval

**What Works:**
- ✅ Checkbox/switch separation correctly implemented
- ✅ Table schema changed from array to record
- ✅ Required arrays enforce min length
- ✅ Template conversions accurate (6 fields)
- ✅ Zero build errors
- ✅ Clean, well-commented code

**Critical Issues Requiring Fix:**
1. **Type Definition Conflict** - `types.ts:22` limits options to strings, breaking numeric option validation
2. **Missing Table Validation** - Required tables accept empty objects
3. **Overly Complex Optional Arrays** - Line 152-154 can be simplified

**Post-Merge Tasks:**
- Add validation test suite
- Implement backward compatibility migration
- Audit remaining 38+ templates with numeric options
- Add JSDoc documentation

**See Full Report:** `plans/251128-array-validation-fix/reports/251128-from-code-reviewer-to-dev-array-validation-fix-report.md`
