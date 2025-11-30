# Implementation Guide: Unique ID Systems for JAC-V1

**Purpose:** Companion to RESEARCH_REPORT.md - practical step-by-step implementation
**Status:** Ready for Phase 1 (ID Scoping)

---

## Quick Reference: Copy-Paste Ready Code

### 1. lib/id-generator.ts

```typescript
/**
 * Secure ID generation for sessions and items.
 * Uses built-in crypto.randomUUID() (Node 14.17+, all modern browsers)
 */

export function generateSessionId(): string {
  return crypto.randomUUID();
}

export function generateItemId(): string {
  return crypto.randomUUID();
}

/**
 * Helper to create composite IDs for form fields
 */
export function createFieldId(
  sessionId: string,
  formId: string,
  fieldName: string
): string {
  return `${sessionId}-${formId}-${fieldName}`;
}

/**
 * Helper for form instances in tables
 */
export function createTableCellId(
  sessionId: string,
  formId: string,
  fieldName: string,
  rowIndex: number,
  colIndex: number
): string {
  return `${sessionId}-${formId}-${fieldName}-row${rowIndex}-col${colIndex}`;
}
```

### 2. lib/session-storage.ts

```typescript
/**
 * Session-scoped localStorage utilities
 * Keys are namespaced to prevent collision across sessions
 */

const STORAGE_PREFIX = 'jac-v1';
const STORAGE_NAMESPACE = 'session';

/**
 * Generate scoped storage key
 * Format: jac-v1:session:${sessionId}:${dataType}
 */
export function getSessionStorageKey(
  sessionId: string,
  dataType: string
): string {
  return `${STORAGE_PREFIX}:${STORAGE_NAMESPACE}:${sessionId}:${dataType}`;
}

/**
 * Save session form data with error handling
 */
export function saveSessionFormData(
  sessionId: string,
  formData: Record<string, any>
): void {
  const key = getSessionStorageKey(sessionId, 'formData');
  try {
    localStorage.setItem(key, JSON.stringify(formData));
    console.log(`[Storage] Saved form data for session ${sessionId}`);
  } catch (e) {
    console.error(
      `[Storage] Failed to save form data for session ${sessionId}:`,
      e
    );
    // Silently fail - don't break app if storage unavailable
  }
}

/**
 * Load session form data with fallback
 */
export function loadSessionFormData(sessionId: string): Record<string, any> {
  const key = getSessionStorageKey(sessionId, 'formData');
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error(
      `[Storage] Failed to load form data for session ${sessionId}:`,
      e
    );
    return {}; // Return empty object on failure
  }
}

/**
 * Save validation errors for session
 */
export function saveSessionValidationErrors(
  sessionId: string,
  errors: Record<string, string>
): void {
  const key = getSessionStorageKey(sessionId, 'validationErrors');
  try {
    localStorage.setItem(key, JSON.stringify(errors));
  } catch (e) {
    console.error(
      `[Storage] Failed to save validation errors for session ${sessionId}:`,
      e
    );
  }
}

/**
 * Load validation errors for session
 */
export function loadSessionValidationErrors(
  sessionId: string
): Record<string, string> {
  const key = getSessionStorageKey(sessionId, 'validationErrors');
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error(
      `[Storage] Failed to load validation errors for session ${sessionId}:`,
      e
    );
    return {};
  }
}

/**
 * Clean up all storage for a session (call on session end)
 */
export function clearSessionStorage(sessionId: string): void {
  const prefix = `${STORAGE_PREFIX}:${STORAGE_NAMESPACE}:${sessionId}:`;
  let cleared = 0;

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key);
      cleared++;
    }
  });

  console.log(`[Storage] Cleared ${cleared} entries for session ${sessionId}`);
}

/**
 * Get all sessions currently in storage
 */
export function getAllSessionIds(): string[] {
  const prefix = `${STORAGE_PREFIX}:${STORAGE_NAMESPACE}:`;
  const sessionIds = new Set<string>();

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(prefix)) {
      // Extract sessionId from key format: jac-v1:session:${sessionId}:${dataType}
      const parts = key.split(':');
      if (parts.length >= 4) {
        sessionIds.add(parts[2]);
      }
    }
  });

  return Array.from(sessionIds);
}
```

### 3. contexts/SessionContext.ts

```typescript
'use client';

import { createContext, useContext } from 'react';

/**
 * Per-session state context
 * Isolates form data, validation errors, and table selections per session
 */

export interface SessionContextValue {
  // Session identification
  sessionId: string;
  itemNumber: string;

  // Form state
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;

  // Validation state
  validationErrors: Record<string, string>;
  setValidationErrors: (errors: Record<string, string>) => void;

  // Table selections (fieldName -> selectedRowIndex)
  tableSelections: Record<string, number>;
  setTableSelection: (fieldName: string, rowIndex: number) => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Hook to access current session context
 * Throws if used outside SessionProvider
 */
export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error(
      'useSessionContext must be used inside SessionProvider. ' +
        'Ensure your component tree is wrapped with <SessionProvider sessionId={...}>'
    );
  }
  return context;
}

/**
 * Hook to safely access session context or undefined
 * Use when session might not be required
 */
export function useSessionContextOptional(): SessionContextValue | undefined {
  return useContext(SessionContext) ?? undefined;
}
```

### 4. contexts/SessionsContext.ts

```typescript
'use client';

import { createContext, useContext } from 'react';
import type { SessionState } from '@/lib/session-validator';

/**
 * Global sessions management context
 * Tracks all active sessions and provides access to their state
 */

export interface SessionsContextValue {
  // Map of sessionId -> SessionState
  activeSessions: Map<string, SessionState>;

  // Get specific session state
  getSession: (sessionId: string) => SessionState | undefined;

  // Update specific session state
  setSession: (sessionId: string, state: SessionState) => void;

  // Remove session
  removeSession: (sessionId: string) => void;

  // Get all session IDs
  getSessionIds: () => string[];
}

export const SessionsContext = createContext<SessionsContextValue | null>(null);

/**
 * Hook to access global sessions context
 */
export function useSessionsContext(): SessionsContextValue {
  const context = useContext(SessionsContext);
  if (!context) {
    throw new Error(
      'useSessionsContext must be used inside SessionsProvider'
    );
  }
  return context;
}
```

### 5. components/SessionProvider.tsx

```typescript
'use client';

import { useState, useMemo, useEffect, ReactNode } from 'react';
import { SessionContext, SessionContextValue } from '@/contexts/SessionContext';
import type { SessionState } from '@/lib/session-validator';
import {
  saveSessionFormData,
  loadSessionFormData,
  saveSessionValidationErrors,
  loadSessionValidationErrors,
  clearSessionStorage,
} from '@/lib/session-storage';

interface SessionProviderProps {
  sessionId: string;
  itemNumber: string;
  initialState?: SessionState;
  children: ReactNode;
}

/**
 * Provides per-session state context
 * Isolates form data, validation, and table selections
 * Auto-saves to localStorage, cleans up on unmount
 */
export function SessionProvider({
  sessionId,
  itemNumber,
  initialState,
  children,
}: SessionProviderProps) {
  // Initialize form data from initialState or localStorage
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    if (initialState?.activeFormData && Object.keys(initialState.activeFormData).length > 0) {
      return initialState.activeFormData;
    }
    // Try loading from scoped storage
    return loadSessionFormData(sessionId);
  });

  // Initialize validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>(
    () => {
      if (initialState?.validationErrors) {
        return initialState.validationErrors;
      }
      return loadSessionValidationErrors(sessionId);
    }
  );

  // Initialize table selections
  const [tableSelections, setTableSelectionsState] = useState<Record<string, number>>(
    initialState?.tableSelections ?? {}
  );

  // Helper to update table selection for a specific field
  const setTableSelection = (fieldName: string, rowIndex: number) => {
    setTableSelectionsState((prev) => ({
      ...prev,
      [fieldName]: rowIndex,
    }));
  };

  // Auto-save form data to scoped localStorage
  useEffect(() => {
    saveSessionFormData(sessionId, formData);
  }, [sessionId, formData]);

  // Auto-save validation errors
  useEffect(() => {
    saveSessionValidationErrors(sessionId, validationErrors);
  }, [sessionId, validationErrors]);

  // Cleanup on unmount: clear scoped storage for this session
  useEffect(() => {
    return () => {
      console.log(`[Session] Cleaning up storage for session ${sessionId}`);
      clearSessionStorage(sessionId);
    };
  }, [sessionId]);

  // Memoize context value to prevent cascading re-renders
  const contextValue: SessionContextValue = useMemo(
    () => ({
      sessionId,
      itemNumber,
      formData,
      setFormData,
      validationErrors,
      setValidationErrors,
      tableSelections,
      setTableSelection,
    }),
    [sessionId, itemNumber, formData, validationErrors, tableSelections]
  );

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}
```

### 6. components/SessionsProvider.tsx

```typescript
'use client';

import { useState, useMemo, ReactNode } from 'react';
import {
  SessionsContext,
  SessionsContextValue,
} from '@/contexts/SessionsContext';
import type { SessionState } from '@/lib/session-validator';

interface SessionsProviderProps {
  children: ReactNode;
}

/**
 * Provides global sessions management
 * Tracks all active sessions and provides access to their state
 */
export function SessionsProvider({ children }: SessionsProviderProps) {
  const [activeSessions, setActiveSessions] = useState<Map<string, SessionState>>(
    new Map()
  );

  const getSession = (sessionId: string): SessionState | undefined => {
    return activeSessions.get(sessionId);
  };

  const setSession = (sessionId: string, state: SessionState) => {
    setActiveSessions((prev) => {
      const updated = new Map(prev);
      updated.set(sessionId, state);
      return updated;
    });
  };

  const removeSession = (sessionId: string) => {
    setActiveSessions((prev) => {
      const updated = new Map(prev);
      updated.delete(sessionId);
      return updated;
    });
  };

  const getSessionIds = (): string[] => {
    return Array.from(activeSessions.keys());
  };

  const contextValue: SessionsContextValue = useMemo(
    () => ({
      activeSessions,
      getSession,
      setSession,
      removeSession,
      getSessionIds,
    }),
    [activeSessions]
  );

  return (
    <SessionsContext.Provider value={contextValue}>
      {children}
    </SessionsContext.Provider>
  );
}
```

### 7. DynamicFormRenderer.tsx - Updated Snippet

Key changes to your existing DynamicFormRenderer:

```typescript
'use client';

import { useId } from 'react';
import { useSessionContext } from '@/contexts/SessionContext';
import { createFieldId, createTableCellId } from '@/lib/id-generator';

interface DynamicFormRendererProps {
  formId: string;
  formData: Record<string, FormFieldValue>;
  // ... other existing props
}

export function DynamicFormRenderer({
  formId,
  formData,
  // ... other existing props
}: DynamicFormRendererProps) {
  // Get session context for state isolation
  const { sessionId } = useSessionContext();

  // Optional: use useId for automatic stability (alternative approach)
  // const baseInstanceId = useId();

  // Helper to create scoped field IDs
  const getFieldId = (fieldName: string): string => {
    return createFieldId(sessionId, formId, fieldName);
  };

  return (
    <form id={`${sessionId}-form-${formId}`} className="dynamic-form">
      {spec.sections.map((section, sectionIndex) => (
        <fieldset
          key={`${sessionId}-${formId}-section-${sectionIndex}`}
          className="form-section"
        >
          <legend>{section.title}</legend>

          {section.fields.map((field) => {
            const fieldId = getFieldId(field.name);
            const isVisible = checkConditional(field, mergedData);

            return (
              <Field
                key={`${sessionId}-${formId}-field-${field.name}`}
                hidden={!isVisible}
              >
                {field.type !== 'checkbox' && (
                  <FieldLabel htmlFor={fieldId}>
                    {field.label}
                    {field.required && isVisible && (
                      <span aria-label="required">*</span>
                    )}
                  </FieldLabel>
                )}

                {/* Input with scoped ID */}
                <Input
                  id={fieldId}
                  name={field.name}
                  aria-describedby={
                    validationErrors[field.name]
                      ? `${fieldId}-error`
                      : undefined
                  }
                  value={toStringValue(formData[field.name])}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [field.name]: e.target.value,
                    })
                  }
                  // ... other props
                />

                {/* Error with matching ID */}
                {validationErrors[field.name] && (
                  <FieldError
                    id={`${fieldId}-error`}
                    role="alert"
                  >
                    {validationErrors[field.name]}
                  </FieldError>
                )}
              </Field>
            );
          })}

          {/* Table fields */}
          {section.fields
            .filter((f) => f.type === 'table')
            .map((tableField) => (
              <Table key={`${sessionId}-${formId}-table-${tableField.name}`}>
                <TableBody>
                  {tableData[tableField.name]?.map((row, rowIndex) => (
                    <TableRow
                      key={`${sessionId}-${formId}-table-row-${tableField.name}-${rowIndex}`}
                    >
                      {row.map((cell, colIndex) => (
                        <TableCell
                          key={`${sessionId}-${formId}-table-cell-${rowIndex}-${colIndex}`}
                          id={createTableCellId(
                            sessionId,
                            formId,
                            tableField.name,
                            rowIndex,
                            colIndex
                          )}
                        >
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ))}
        </fieldset>
      ))}
    </form>
  );
}
```

---

## Integration Checklist

### Phase 1: ID Scoping (No Breaking Changes)

- [ ] Create `lib/id-generator.ts` with helper functions
- [ ] Update `DynamicFormRenderer.tsx` to accept `sessionId` prop
- [ ] Update all form field `id=` attributes with `createFieldId()`
- [ ] Update all React `key=` attributes to include `sessionId`
- [ ] Update table rendering with `createTableCellId()`
- [ ] Test: Render 2 forms of same type simultaneously, verify unique IDs in DOM

### Phase 2: Context Providers (Medium Risk)

- [ ] Create `contexts/SessionContext.ts` and `contexts/SessionsContext.ts`
- [ ] Create `components/SessionProvider.tsx` and `components/SessionsProvider.tsx`
- [ ] Update `ClaudeChat.tsx` to wrap forms in SessionProvider
- [ ] Update `DynamicFormRenderer.tsx` to use `useSessionContext()`
- [ ] Test: Form data should be isolated per session

### Phase 3: Storage Isolation (Low Risk)

- [ ] Create `lib/session-storage.ts` with scoped helpers
- [ ] Update `SessionProvider.tsx` to use scoped storage
- [ ] Test: Form data persists per session, doesn't leak
- [ ] Test: Cleanup on session unmount

---

## Testing Commands

```bash
# After implementing Phase 1:
npm run build          # Verify compilation
npm run lint           # Check for errors
npm test               # Run existing tests

# Manual testing:
# 1. Open http://localhost:3000
# 2. Create 2 items simultaneously
# 3. Inspect DOM: Elements > right-click input > Inspect
#    Verify IDs like: "abc123-door-info-DOOR_TYPE"
#                      "def456-door-info-DOOR_TYPE" (different!)
# 4. Fill Form 1, verify Form 2 empty
# 5. Fill Form 2, verify Form 1 unchanged
```

---

## File Dependencies

```
lib/id-generator.ts
├── No dependencies (pure functions)

lib/session-storage.ts
├── No dependencies

contexts/SessionContext.ts
├── lib/session-validator.ts (type import)

contexts/SessionsContext.ts
├── lib/session-validator.ts (type import)

components/SessionProvider.tsx
├── contexts/SessionContext.ts
├── lib/session-storage.ts
├── lib/session-validator.ts

components/SessionsProvider.tsx
├── contexts/SessionsContext.ts
├── lib/session-validator.ts

components/DynamicFormRenderer.tsx (updated)
├── contexts/SessionContext.ts
├── lib/id-generator.ts
```

---

## Troubleshooting

### "useSessionContext must be used inside SessionProvider"

**Cause:** Component using `useSessionContext()` not wrapped in `<SessionProvider>`

**Fix:** Verify component hierarchy:
```
<SessionsProvider>
  <SessionProvider sessionId={id}>
    <DynamicFormRenderer /> ← Can use useSessionContext() here
  </SessionProvider>
</SessionsProvider>
```

### Form data bleeding between sessions

**Cause:** Not using `useSessionContext()` or sharing state

**Fix:** Replace global state with context hook:
```typescript
// ❌ Global state (shared)
const [formData, setFormData] = useState({});

// ✅ Session-scoped state
const { formData, setFormData } = useSessionContext();
```

### localStorage errors in storage quota exceeded

**Cause:** Too much data in localStorage

**Fix:** Implement data compression or cleanup:
```typescript
// Limit stored history
const MAX_FORM_REVISIONS = 5;

export function saveSessionFormData(
  sessionId: string,
  formData: Record<string, any>
): void {
  const key = getSessionStorageKey(sessionId, 'formData');
  try {
    // Compress or trim data before storing
    const trimmed = trimLargeFields(formData);
    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch (e) {
    if (e instanceof Error && e.name === 'QuotaExceededError') {
      // Clear old sessions
      clearOldSessions();
      // Retry
      localStorage.setItem(key, JSON.stringify(formData));
    }
  }
}
```

---

## Performance Optimization Tips

1. **Memoize form components** to prevent re-renders when session context updates

```typescript
const FormField = memo(({ field, sessionId }: Props) => {
  const { formData } = useSessionContext();
  // ... field rendering
}, (prev, next) => prev.field.name === next.field.name);
```

2. **Split large context** to prevent cascading updates

```typescript
// Instead of one big context, split:
<SessionDataProvider>     {/* formData, setFormData */}
  <SessionErrorsProvider> {/* validationErrors */}
    <FormRenderer />
  </SessionErrorsProvider>
</SessionDataProvider>
```

3. **Debounce localStorage saves** to reduce I/O

```typescript
const debouncedSave = useMemo(
  () => debounce((data) => saveSessionFormData(sessionId, data), 500),
  [sessionId]
);

useEffect(() => {
  debouncedSave(formData);
}, [formData, debouncedSave]);
```

---

**Next Step:** Start with Phase 1 implementation. The code is ready to copy-paste.
