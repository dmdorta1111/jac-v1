# Comprehensive ID Collision Audit - DynamicFormRenderer

**Date:** 2025-11-30
**File:** `components/DynamicFormRenderer.tsx`
**Scope:** All React keys and HTML IDs

---

## Summary

**Total Issues Found:** 3 categories
1. ❌ **CRITICAL:** Table row keys (line 818, 822, 856)
2. ⚠️ **MEDIUM:** Section keys (line 902)
3. ✅ **OK:** Checkbox/Radio option keys (lines 559, 607)

---

## Detailed Analysis

### 1. ❌ CRITICAL: Table Row Keys (NOT Session-Scoped)

**Line 818:**
```typescript
const rowId = (row as Record<string, unknown>).__id as string || `row-${field.name}-${rowIndex}`;
```

**Problem:**
- Format: `row-{fieldName}-{rowIndex}`
- Missing: `sessionId` and `formSpec.formId`
- Collision when: Same form rendered in multiple sessions

**Line 822:**
```typescript
<TableRow
  key={rowId}  // ← Uses non-scoped rowId
  ...
>
```

**Line 856:**
```typescript
<TableCell key={`${rowId}-${column.key}`}>
```

**Impact:** HIGH
- React key warnings
- Table selection state may leak between sessions
- Performance issues

**Fix:**
```typescript
// Line 818
const rowId = (row as Record<string, unknown>).__id as string ||
  `${sessionId}-${formSpec.formId}-row-${field.name}-${rowIndex}`;
```

---

### 2. ⚠️ MEDIUM: Section Keys (Partially Scoped)

**Line 902:**
```typescript
<FieldSet key={`${formSpec.formId}-${section.id}`} name={section.id}>
```

**Current format:** `{formId}-{sectionId}`
**Example:** `door-info-main-section`

**Analysis:**
- ✅ Unique within a form
- ⚠️ **NOT unique across sessions** if same form rendered multiple times
- Less critical than table rows (sections don't have interactive state)

**Problem scenario:**
```
Session A: door-info-main-section
Session B: door-info-main-section  ← COLLISION
```

**Impact:** MEDIUM
- React may warn if multiple sessions render same form simultaneously
- Lower risk than table rows (no user interaction state tied to sections)

**Recommended Fix:**
```typescript
// Line 902
<FieldSet key={`${sessionId}-${formSpec.formId}-${section.id}`} name={section.id}>
```

**Priority:** Fix after table rows, or batch with same commit

---

### 3. ✅ OK: Checkbox/Radio Option Keys (Session-Scoped via Parent)

**Checkbox Options (Line 559):**
```typescript
<Field key={option.value} orientation="horizontal">
  <Checkbox
    id={`${getFieldId(field)}-${option.value}`}  // ← Uses getFieldId (session-scoped)
    ...
  />
</Field>
```

**Radio Options (Line 607):**
```typescript
<Field key={option.value} orientation="horizontal">
  <RadioGroupItem
    id={`${getFieldId(field)}-${option.value}`}  // ← Uses getFieldId (session-scoped)
    ...
  />
</Field>
```

**Analysis:**
- Key: `option.value` (e.g., "1", "2", "yes", "no")
- HTML ID: `${getFieldId(field)}-${option.value}` → **session-scoped** ✅
- Parent Field component scoped by `getFieldId(field)` (line 454, 482)

**Why this is OK:**
1. React key collision possible (`option.value` not unique across sessions)
2. BUT: HTML `id` attributes ARE session-scoped via `getFieldId()`
3. Parent `<Field>` wrapper keyed with `getFieldId(field)` → creates unique React tree path
4. Checkbox/Radio state tied to HTML `id`, not React `key`

**Example:**
```
Session A, field "DOOR_TYPE", option "1":
  React key: "1"  ← May collide
  HTML id: "sessionA-door-info-DOOR_TYPE-1"  ✅ Unique

Session B, field "DOOR_TYPE", option "1":
  React key: "1"  ← May collide
  HTML id: "sessionB-door-info-DOOR_TYPE-1"  ✅ Unique
```

**Verdict:** Low risk, but could improve for consistency

**Optional Enhancement (low priority):**
```typescript
// Line 559 (checkbox)
<Field key={`${getFieldId(field)}-opt-${option.value}`} orientation="horizontal">

// Line 607 (radio)
<Field key={`${getFieldId(field)}-opt-${option.value}`} orientation="horizontal">
```

---

## Pattern Analysis

### ✅ CORRECT Pattern (Field IDs)

**Line 301:**
```typescript
const getFieldId = (field: FormField) => `${sessionId}-${formSpec.formId}-${field.id}`;
```

**Usage:**
- Line 454: `<Field key={getFieldId(field)} ...>`
- Line 456: `htmlFor={getFieldId(field)}`
- Line 466: `id={getFieldId(field)}`
- Line 482, 484, 493, 509, 530, etc.

**Format:** `{sessionId}-{formId}-{fieldId}`
**Status:** ✅ All field-level IDs properly scoped

---

### ❌ BROKEN Pattern (Table Rows)

**Line 818:**
```typescript
const rowId = ... || `row-${field.name}-${rowIndex}`;
```

**Format:** `row-{fieldName}-{rowIndex}`
**Missing:** `sessionId`, `formSpec.formId`
**Status:** ❌ NOT session-scoped

---

### ⚠️ PARTIAL Pattern (Sections)

**Line 902:**
```typescript
key={`${formSpec.formId}-${section.id}`}
```

**Format:** `{formId}-{sectionId}`
**Missing:** `sessionId`
**Status:** ⚠️ Form-scoped, but not session-scoped

---

## Collision Risk Matrix

| Element | Current Key Format | Session-Scoped? | Collision Risk | User Impact |
|---------|-------------------|-----------------|----------------|-------------|
| **Form Component** | `{sessionId}-{messageId}-{formId}` | ✅ Yes | None | None |
| **Field (input/textarea/etc)** | `{sessionId}-{formId}-{fieldId}` | ✅ Yes | None | None |
| **Checkbox Option** | `{optionValue}` | ❌ No | Low | Minimal (HTML id scoped) |
| **Radio Option** | `{optionValue}` | ❌ No | Low | Minimal (HTML id scoped) |
| **Section** | `{formId}-{sectionId}` | ⚠️ Partial | Medium | None (no state) |
| **Table Row** | `row-{fieldName}-{rowIndex}` | ❌ **No** | **HIGH** | **State corruption** |
| **Table Cell** | `{rowId}-{columnKey}` | ❌ **No** | **HIGH** | **Inherits row issue** |

---

## Recommended Fixes (Priority Order)

### Priority 1: CRITICAL (Fix Immediately)
**File:** `components/DynamicFormRenderer.tsx:818`

```typescript
// BEFORE
const rowId = (row as Record<string, unknown>).__id as string || `row-${field.name}-${rowIndex}`;

// AFTER
const rowId = (row as Record<string, unknown>).__id as string ||
  `${sessionId}-${formSpec.formId}-row-${field.name}-${rowIndex}`;
```

**Verification:** No React key warnings when switching between items with tables

---

### Priority 2: MEDIUM (Fix Soon)
**File:** `components/DynamicFormRenderer.tsx:902`

```typescript
// BEFORE
<FieldSet key={`${formSpec.formId}-${section.id}`} name={section.id}>

// AFTER
<FieldSet key={`${sessionId}-${formSpec.formId}-${section.id}`} name={section.id}>
```

---

### Priority 3: LOW (Optional Enhancement)
**File:** `components/DynamicFormRenderer.tsx:559, 607`

```typescript
// BEFORE (line 559)
<Field key={option.value} orientation="horizontal">

// AFTER
<Field key={`${getFieldId(field)}-opt-${option.value}`} orientation="horizontal">

// BEFORE (line 607)
<Field key={option.value} orientation="horizontal">

// AFTER
<Field key={`${getFieldId(field)}-opt-${option.value}`} orientation="horizontal">
```

---

## Testing Checklist

After fixes:
- [ ] Open DevTools console
- [ ] Create Item 001, fill form with table (e.g., door-info) → leave incomplete
- [ ] Create Item 002, fill same form
- [ ] Switch between Item 001 and Item 002 tabs rapidly
- [ ] Verify: No React key warnings
- [ ] Verify: Table row selections don't bleed between sessions
- [ ] Inspect DOM: table row IDs unique (`sessionId` prefix visible)
- [ ] Create 5+ items, switch between all → no errors

---

## Code Locations Summary

| Issue | File | Line | Element | Fix Required |
|-------|------|------|---------|--------------|
| ❌ Table row ID | `DynamicFormRenderer.tsx` | 818 | `const rowId = ...` | Add `sessionId` + `formSpec.formId` |
| ❌ Table row key | `DynamicFormRenderer.tsx` | 822 | `<TableRow key={rowId}>` | Inherits fix from 818 |
| ❌ Table cell key | `DynamicFormRenderer.tsx` | 856 | `<TableCell key={...}>` | Inherits fix from 818 |
| ⚠️ Section key | `DynamicFormRenderer.tsx` | 902 | `<FieldSet key={...}>` | Add `sessionId` prefix |
| ✅ Field key | `DynamicFormRenderer.tsx` | 454 | `<Field key={getFieldId(field)}>` | Already scoped |
| ✅ Checkbox id | `DynamicFormRenderer.tsx` | 561 | `id={getFieldId(field)}-...` | Already scoped |
| ✅ Radio id | `DynamicFormRenderer.tsx` | 610 | `id={getFieldId(field)}-...` | Already scoped |

---

**End of Audit**
