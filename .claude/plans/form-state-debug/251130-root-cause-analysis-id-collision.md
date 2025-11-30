# Root Cause Analysis: ID Collision in Multi-Session Forms

**Date:** 2025-11-30
**Issue:** ID clashing when multiple items with unfinished forms are created
**Status:** ROOT CAUSE IDENTIFIED

---

## Executive Summary

**ROOT CAUSE:** Table row IDs are NOT session-scoped, causing React key collisions when multiple sessions display the same form with table fields.

**Impact:** High - React throws key duplicate warnings, form state corruption possible
**Affected:** All forms with table fields across multiple concurrent sessions

---

## Investigation Findings

### 1. Session ID Generation ✅ CORRECT
**File:** `components/ClaudeChat.tsx:161-168`

```typescript
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + high-entropy random
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};
```

**Analysis:** Session IDs use `crypto.randomUUID()` - collision-proof ✅

---

### 2. Form Component Keys ✅ CORRECT
**File:** `components/ClaudeChat.tsx:1953`

```typescript
<DynamicFormRenderer
  key={`${sessionId}-${message.id}-${message.formSpec.formId}`}
  ...
/>
```

**Analysis:** Form renderer properly scoped to session ✅

---

### 3. Field IDs ✅ CORRECT
**File:** `components/DynamicFormRenderer.tsx:301`

```typescript
const getFieldId = (field: FormField) => `${sessionId}-${formSpec.formId}-${field.id}`;
```

**Usage:**
- Line 456: `htmlFor={getFieldId(field)}`
- Line 466: `id={getFieldId(field)}`

**Analysis:** All field IDs properly scoped: `{sessionId}-{formId}-{fieldId}` ✅

---

### 4. Table Row IDs ❌ **ROOT CAUSE**
**File:** `components/DynamicFormRenderer.tsx:818`

```typescript
const rowId = (row as Record<string, unknown>).__id as string || `row-${field.name}-${rowIndex}`;
```

**PROBLEM:**
- Row ID format: `row-{field.name}-{rowIndex}`
- **MISSING:** `sessionId` prefix
- **RESULT:** When Session A and Session B both render same form (e.g., "door-info"), table rows get IDENTICAL keys

**Example collision:**
```
Session A (UUID: abc-123): row-DOOR_TYPE-0
Session B (UUID: def-456): row-DOOR_TYPE-0  ← COLLISION!
```

---

### 5. Table Cell Keys ⚠️ SECONDARY ISSUE
**File:** `components/DynamicFormRenderer.tsx:856`

```typescript
<TableCell key={`${rowId}-${column.key}`}>
```

**Analysis:**
- Depends on `rowId` from line 818
- Inherits collision issue from parent row key
- Also NOT session-scoped

---

## Why Previous Fixes Weren't Sufficient

**Previous implementations:**
1. ✅ Session IDs are unique (crypto.randomUUID)
2. ✅ Form keys include sessionId
3. ✅ Field IDs include sessionId
4. ❌ Table row/cell keys do NOT include sessionId

**Gap:** Table rendering was overlooked in session-scoping implementation

---

## Reproduction Scenario

**Steps to reproduce:**
1. Create Item 001 → Fill form 1 (has table field) → Leave incomplete
2. Create Item 002 → Fill same form 1 (has table field)
3. Switch between Item 001 and Item 002 tabs

**Expected behavior:**
- No key warnings
- Each session's table state independent

**Actual behavior:**
- React console: "Warning: Encountered two children with the same key, `row-FIELD_NAME-0`"
- Table selections may bleed between sessions (if state stored by key)

---

## Impact Analysis

### High-Risk Scenarios
1. **Multi-item workflows** - User creates Items 001-005 simultaneously
2. **Incomplete forms** - Multiple items stuck at same step with table fields
3. **Form navigation** - Switching between in-progress items

### Affected Forms
Any form template with `type: 'table'` fields:
- `door-info.json`
- `hinge-info.json`
- `lock-options.json`
- `sdi-project.json` (if has table fields)

### Consequences
- ❌ React key duplicate warnings (clutters console, indicates potential bugs)
- ❌ Table row selection state may leak between sessions
- ❌ Performance degradation (React reconciliation confused by duplicate keys)
- ⚠️ Potential form corruption if React uses keys for state identity

---

## Recommended Fix

### File: `components/DynamicFormRenderer.tsx:818`

**Current (BROKEN):**
```typescript
const rowId = (row as Record<string, unknown>).__id as string || `row-${field.name}-${rowIndex}`;
```

**Fixed (SESSION-SCOPED):**
```typescript
const rowId = (row as Record<string, unknown>).__id as string || `${sessionId}-${formSpec.formId}-row-${field.name}-${rowIndex}`;
```

**Format:** `{sessionId}-{formId}-row-{fieldName}-{rowIndex}`

**Example:**
```
Session abc-123, form "door-info", field "DOOR_TYPE", row 0:
abc-123-door-info-row-DOOR_TYPE-0
```

### Why This Works
1. **Collision-proof across sessions:** `sessionId` prefix (UUID)
2. **Collision-proof across forms:** `formSpec.formId` (e.g., "door-info" vs "hinge-info")
3. **Collision-proof within form:** `field.name` + `rowIndex`
4. **Consistent pattern:** Matches field ID pattern from line 301

---

## Verification Steps

After fix, verify:
1. ✅ No React key warnings in console
2. ✅ Table selections don't bleed between sessions
3. ✅ Inspect DOM: table row IDs unique per session
4. ✅ Create 3+ items with same form, switch tabs rapidly → no errors

---

## Files to Modify

1. **`components/DynamicFormRenderer.tsx`**
   - Line 818: Add `sessionId` and `formSpec.formId` to `rowId` generation
   - Line 856: Inherits fix from parent `rowId` (no change needed)

---

## Additional Recommendations

### 1. Audit Other Key Usages
Search for patterns like:
```bash
grep -n "key={`" components/*.tsx | grep -v sessionId
```

Ensure all React keys for multi-session components include `sessionId`.

### 2. Add Session ID to All Dynamic Keys
**Pattern to follow:**
```typescript
// ✅ Good
key={`${sessionId}-${contextId}-${itemId}`}

// ❌ Bad
key={`${contextId}-${itemId}`}
```

### 3. Consider Utility Function
**File:** `lib/utils/id-generator.ts` (new)

```typescript
export const generateSessionScopedKey = (
  sessionId: string,
  formId: string,
  ...parts: (string | number)[]
): string => {
  return [sessionId, formId, ...parts].join('-');
};

// Usage:
const rowId = generateSessionScopedKey(sessionId, formSpec.formId, 'row', field.name, rowIndex);
```

---

## Unresolved Questions

1. **Are there other non-scoped keys?**
   - Checkbox options (line 560-561)?
   - Radio options (line 607-610)?
   - Need audit of all `key=` usages in `DynamicFormRenderer.tsx`

2. **Does `__id` ever exist in table data?**
   - Line 818: `(row as Record<string, unknown>).__id`
   - If yes, is it already session-scoped?
   - Where is `__id` added to row data?

3. **Are section keys session-scoped?**
   - Line 902: `key={`${formSpec.formId}-${section.id}`}`
   - Missing `sessionId` prefix?

---

## Next Steps

1. **Immediate:** Fix table row ID scoping (line 818)
2. **Short-term:** Audit all keys in `DynamicFormRenderer.tsx`
3. **Long-term:** Implement `generateSessionScopedKey` utility for consistency

---

## Evidence

**React key warning (expected in console):**
```
Warning: Encountered two children with the same key, `row-DOOR_TYPE-0`.
Keys should be unique so that components maintain their identity across updates.
```

**Code locations:**
- Session ID generation: `ClaudeChat.tsx:161-168`
- Form key: `ClaudeChat.tsx:1953`
- Field ID helper: `DynamicFormRenderer.tsx:301`
- **Table row ID (BROKEN):** `DynamicFormRenderer.tsx:818` ⚠️
- Table cell key: `DynamicFormRenderer.tsx:856`

---

**End of Report**
