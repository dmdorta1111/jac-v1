# Research Report: Unique ID Systems in React Dynamic Forms with Multiple Concurrent Sessions

**Date:** 2025-11-30
**Status:** Complete
**Context:** JAC-V1 Dynamic Form System

---

## Executive Summary

For your Next.js app with dynamic forms, multiple concurrent items/sessions, and field ID requirements, the recommended approach uses:

1. **ID Generation:** `crypto.randomUUID()` for session/item IDs + `useId()` for form field HTML IDs
2. **Field ID Scoping:** Composite pattern `${sessionId}-${formId}-${fieldId}` for HTML form fields
3. **State Isolation:** Session-scoped context providers with localStorage key prefixing
4. **React Keys:** Stable composite keys from form structure data, never array index

This addresses your specific problem: **ID clashing when multiple forms of the same type render simultaneously.**

---

## 1. UUID Generation Patterns

### Recommendation: Dual-Strategy Approach

**For Session/Item IDs:** Use `crypto.randomUUID()`
**For Form Field HTML IDs:** Use React's `useId()` hook

### Why Not Single Approach?

| Strategy | UUID/nanoid | crypto.randomUUID() | useId() |
|----------|-----------|-----------------|---------|
| **Use Case** | Application IDs | Session/Item IDs | Form field HTML IDs |
| **Stability** | Unstable (new ID per render) | Stable per session | Stable per component instance |
| **Performance** | Lightweight (118 bytes) | Built-in (0 overhead) | Built-in (0 overhead) |
| **SSR Safe** | ⚠️ Requires careful hydration | ✅ Safe | ✅ Safe (built for SSR) |
| **Accessibility** | N/A | N/A | ✅ Best for accessibility |

### 1.1 Session/Item ID Generation with crypto.randomUUID()

**When:** On session creation, item creation, form instance initialization
**Why:** Cryptographically secure, built-in to modern JS, no dependencies

```typescript
// lib/id-generator.ts
/**
 * Generates cryptographically secure UUIDs for sessions and items.
 * Built-in to all modern browsers and Node.js 14.17+
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

export function generateItemId(): string {
  return crypto.randomUUID();
}

// Usage in your session rebuilder
export async function rebuildSessionsFromDB(
  salesOrderNumber: string,
  flowSteps: FlowStep[]
): Promise<RebuiltSession[]> {
  // ... existing code ...

  // Generate new session ID
  const sessionId = generateSessionId(); // ✅ Stable, unique per session

  const session: ChatSession = {
    id: sessionId,
    title: `Item ${itemNumber}`,
    // ... rest of session
  };
}
```

**Performance Notes:**
- `crypto.randomUUID()` is faster than nanoid for most use cases
- No package dependencies needed (YAGNI principle)
- Generates 36-char UUID4 (e.g., `123e4567-e89b-12d3-a456-426614174000`)

### 1.2 Why NOT to Generate IDs During Render

```typescript
// ❌ WRONG - Creates new ID every render (state mismatch)
function FormRenderer({ formId }: Props) {
  const instanceId = crypto.randomUUID(); // BAD: new ID every render
  return <form id={`${instanceId}-${formId}`} />;
}

// ✅ CORRECT - ID generated once, stored in state
function FormRenderer({ formId }: Props) {
  const [instanceId] = useState(() => crypto.randomUUID()); // Good: once
  return <form id={`${instanceId}-${formId}`} />;
}

// ✅ BETTER - Use React's useId for form field IDs
function FormRenderer({ formId }: Props) {
  const instanceId = useId(); // Best: React handles stability
  return <form id={`${instanceId}-${formId}`} />;
}
```

---

## 2. Field ID Scoping Pattern for Multi-Instance Forms

### Problem Your App Faces

When rendering multiple form instances of the same type simultaneously:

```typescript
// ❌ PROBLEM: Same form type rendered twice → duplicate IDs
<DynamicFormRenderer formId="door-info" formData={item1Data} />
<DynamicFormRenderer formId="door-info" formData={item2Data} />

// Both render fields with id="door-info-DOOR_TYPE", id="door-info-HINGE_TYPE"
// HTML ID attributes must be UNIQUE → accessibility breaks
```

### Solution: Composite Key Pattern

Use 3-level composite ID scoping:

```
${sessionId}-${formId}-${fieldName}
example: "abc123-door-info-DOOR_TYPE"
```

### 2.1 Implementation in DynamicFormRenderer

```typescript
// components/DynamicFormRenderer.tsx
import { useId } from 'react';

interface DynamicFormRendererProps {
  formId: string;
  formData: Record<string, FormFieldValue>;
  sessionId: string; // Pass session context down
  // ... other props
}

export function DynamicFormRenderer({
  formId,
  formData,
  sessionId,
  // ... other props
}: DynamicFormRendererProps) {
  // Use useId for components that need HTML IDs
  const formInstanceId = useId();

  // Composite key for all fields in this form instance
  const getFieldId = (fieldName: string): string => {
    return `${sessionId}-${formId}-${fieldName}`;
  };

  const getLabelHtmlFor = (fieldName: string): string => {
    return getFieldId(fieldName);
  };

  return (
    <form
      id={`${sessionId}-form-${formId}`}
      className="dynamic-form"
    >
      {spec.sections.map((section, sectionIndex) => (
        <fieldset
          key={`${formId}-section-${sectionIndex}`}
          className="form-section"
        >
          <legend>{section.title}</legend>

          {section.fields.map((field) => {
            const fieldId = getFieldId(field.name);
            const isVisible = checkConditional(field, mergedData);

            return (
              <Field
                key={`${formId}-field-${field.name}`}
                hidden={!isVisible}
              >
                {field.type !== 'checkbox' && (
                  <FieldLabel htmlFor={fieldId}>
                    {field.label}
                    {field.required && !isVisible && (
                      <span aria-label="required">*</span>
                    )}
                  </FieldLabel>
                )}

                {/* Input with scoped HTML ID */}
                <Input
                  id={fieldId} // ✅ Scoped: sessionId-formId-fieldName
                  name={field.name}
                  aria-describedby={`${fieldId}-error`}
                  value={toStringValue(formData[field.name])}
                  // ... other props
                />

                {/* Error messages linked via aria-describedby */}
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
        </fieldset>
      ))}
    </form>
  );
}
```

### 2.2 Table Field ID Scoping

Tables have an extra dimension - row index:

```typescript
// For table fields with dynamic rows
const getTableCellId = (fieldName: string, rowIndex: number, colIndex: number): string => {
  return `${sessionId}-${formId}-${fieldName}-row${rowIndex}-col${colIndex}`;
};

// Usage in table rendering
<Table>
  <TableBody>
    {tableData.map((row, rowIndex) => (
      <TableRow key={`${formId}-table-row-${rowIndex}`}>
        {row.map((cell, colIndex) => (
          <TableCell
            key={`${formId}-table-cell-${rowIndex}-${colIndex}`}
            id={getTableCellId(fieldName, rowIndex, colIndex)}
          >
            {cell}
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### 2.3 Accessibility Benefits

The composite ID pattern enables proper accessibility linking:

```typescript
// Each field's error message is linked via aria-describedby
<Input
  id="abc123-door-info-DOOR_TYPE"
  aria-describedby="abc123-door-info-DOOR_TYPE-error"
  value={doorType}
/>

<span id="abc123-door-info-DOOR_TYPE-error" role="alert">
  Door type is required
</span>

// Screen readers announce: "Door type field, required, error: Door type is required"
```

---

## 3. State Isolation Strategy for Multiple Concurrent Sessions

### Problem: Session State Bleeding

Without proper isolation, state from Item 1's form can leak into Item 2's form:

```typescript
// ❌ WRONG - Shared global state
const globalFormState = {}; // Shared across ALL sessions

// When Item 1 fills form A, Item 2 sees same state
const { formData } = useGlobalFormState(); // Same for both items!
```

### Solution: Session-Scoped Context Providers

Use 2-level context nesting: **Global → Per-Session**

```typescript
// contexts/SessionContext.ts
import { createContext, useContext } from 'react';

export interface SessionContextValue {
  sessionId: string;
  itemNumber: string;
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  validationErrors: Record<string, string>;
  setValidationErrors: (errors: Record<string, string>) => void;
  tableSelections: Record<string, number>; // fieldName -> selectedRowIndex
  setTableSelection: (fieldName: string, rowIndex: number) => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be inside SessionProvider');
  }
  return context;
}
```

### 3.1 SessionProvider Implementation

```typescript
// components/SessionProvider.tsx
import { useState, useMemo, ReactNode } from 'react';
import { SessionContext, SessionContextValue } from '@/contexts/SessionContext';
import type { SessionState } from '@/lib/session-validator';

interface SessionProviderProps {
  sessionId: string;
  itemNumber: string;
  initialState?: SessionState;
  children: ReactNode;
}

export function SessionProvider({
  sessionId,
  itemNumber,
  initialState,
  children,
}: SessionProviderProps) {
  // Scoped state - each session has its own
  const [formData, setFormData] = useState<Record<string, any>>(
    initialState?.activeFormData ?? {}
  );

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>(
    initialState?.validationErrors ?? {}
  );

  const [tableSelections, setTableSelectionsState] = useState<Record<string, number>>(
    initialState?.tableSelections ?? {}
  );

  const setTableSelection = (fieldName: string, rowIndex: number) => {
    setTableSelectionsState((prev) => ({
      ...prev,
      [fieldName]: rowIndex,
    }));
  };

  // Memoize to prevent unnecessary re-renders of dependent components
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

### 3.2 Global Sessions Management

```typescript
// contexts/SessionsContext.ts
import { createContext, useContext } from 'react';

export interface SessionsContextValue {
  activeSessions: Map<string, SessionState>;
  getSession: (sessionId: string) => SessionState | undefined;
  setSession: (sessionId: string, state: SessionState) => void;
}

export const SessionsContext = createContext<SessionsContextValue | null>(null);

export function useSessionsContext(): SessionsContextValue {
  const context = useContext(SessionsContext);
  if (!context) {
    throw new Error('useSessionsContext must be inside SessionsProvider');
  }
  return context;
}
```

### 3.3 SessionsProvider Implementation

```typescript
// components/SessionsProvider.tsx
import { useState, useMemo, ReactNode } from 'react';
import { SessionsContext, SessionsContextValue } from '@/contexts/SessionsContext';
import type { SessionState } from '@/lib/session-validator';

interface SessionsProviderProps {
  children: ReactNode;
}

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

  const contextValue: SessionsContextValue = useMemo(
    () => ({
      activeSessions,
      getSession,
      setSession,
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

### 3.4 localStorage Scoping for Persistence

```typescript
// lib/session-storage.ts
/**
 * localStorage keys scoped by session to prevent data collision.
 *
 * Key format: `jac-v1:session:${sessionId}:${dataType}`
 * Examples:
 *   jac-v1:session:abc123:formData
 *   jac-v1:session:abc123:validationErrors
 *   jac-v1:session:def456:formData
 */

const STORAGE_PREFIX = 'jac-v1';
const STORAGE_NAMESPACE = 'session';

export function getSessionStorageKey(
  sessionId: string,
  dataType: string
): string {
  return `${STORAGE_PREFIX}:${STORAGE_NAMESPACE}:${sessionId}:${dataType}`;
}

export function saveSessionFormData(
  sessionId: string,
  formData: Record<string, any>
): void {
  const key = getSessionStorageKey(sessionId, 'formData');
  try {
    localStorage.setItem(key, JSON.stringify(formData));
  } catch (e) {
    console.error(`[Session] Failed to save form data for ${sessionId}:`, e);
  }
}

export function loadSessionFormData(sessionId: string): Record<string, any> {
  const key = getSessionStorageKey(sessionId, 'formData');
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error(`[Session] Failed to load form data for ${sessionId}:`, e);
    return {};
  }
}

export function clearSessionStorage(sessionId: string): void {
  const prefix = `${STORAGE_PREFIX}:${STORAGE_NAMESPACE}:${sessionId}:`;
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  });
}
```

### 3.5 Using Scoped Storage in Provider

```typescript
// components/SessionProvider.tsx (updated)
import { useEffect } from 'react';
import {
  saveSessionFormData,
  loadSessionFormData,
  clearSessionStorage,
} from '@/lib/session-storage';

export function SessionProvider({
  sessionId,
  itemNumber,
  initialState,
  children,
}: SessionProviderProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    // Try loading from scoped localStorage first
    const saved = loadSessionFormData(sessionId);
    if (Object.keys(saved).length > 0) {
      return saved;
    }
    return initialState?.activeFormData ?? {};
  });

  // Auto-save to scoped storage when formData changes
  useEffect(() => {
    saveSessionFormData(sessionId, formData);
  }, [sessionId, formData]);

  // Cleanup on session unmount
  useEffect(() => {
    return () => {
      clearSessionStorage(sessionId);
    };
  }, [sessionId]);

  // ... rest of provider implementation
}
```

---

## 4. React Key Best Practices

### Core Rules for Keys

1. **NEVER use array index as key** - leads to state mismatch when list reorders
2. **Use stable data identifiers** - IDs that don't change across renders
3. **For forms, use form structure** - `${formId}-${section}-${field}`
4. **For tables, use row ID** - not row index

### 4.1 Form Section Keys

```typescript
// ✅ CORRECT - Keys are stable from form structure
<div>
  {spec.sections.map((section, sectionIndex) => (
    <fieldset
      key={`${formId}-section-${sectionIndex}`}
      // sectionIndex is STABLE (same form always has same sections in same order)
    >
      {section.fields.map((field) => (
        <Field
          key={`${formId}-field-${field.name}`}
          // field.name is stable (database identifier)
        >
          {/* field content */}
        </Field>
      ))}
    </fieldset>
  ))}
</div>

// ❌ WRONG - Index-based keys
<div>
  {spec.sections.map((section, index) => (
    <fieldset key={index}> {/* BAD: key changes if sections reorder */}
      {section.fields.map((field, fieldIndex) => (
        <Field key={fieldIndex}> {/* WORSE: nested index-based keys */}
          {/* BAD: if fields reorder, state mixes up */}
        </Field>
      ))}
    </fieldset>
  ))}
</div>
```

### 4.2 Table Row Keys

```typescript
// ✅ CORRECT - Use stable row identifier
interface TableRow {
  id: string; // Unique row ID from database or generation
  data: Record<string, any>;
}

<Table>
  <TableBody>
    {tableData.map((row) => (
      <TableRow
        key={row.id} // ✅ Stable row identifier
        data={row}
        selected={selectedRowId === row.id}
      />
    ))}
  </TableBody>
</Table>

// ❌ WRONG - Index-based
<Table>
  <TableBody>
    {tableData.map((row, index) => (
      <TableRow
        key={index} // ❌ If rows reorder or delete, state mixes
        data={row}
        selected={selectedIndex === index}
      />
    ))}
  </TableBody>
</Table>
```

### 4.3 Multi-Item Form Rendering

When rendering forms for multiple items simultaneously:

```typescript
// ✅ CORRECT - Each form instance has unique key
function MultiItemForms({ items }: Props) {
  return (
    <div>
      {items.map((item) => (
        <div key={item.sessionId}> {/* Unique per session */}
          <SessionProvider sessionId={item.sessionId} itemNumber={item.itemNumber}>
            <DynamicFormRenderer
              formId="door-info"
              sessionId={item.sessionId}
              // ... other props
            />
          </SessionProvider>
        </div>
      ))}
    </div>
  );
}

// ❌ WRONG - Index-based or form-based only (won't isolate state)
function MultiItemForms({ items }: Props) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={index}> {/* ❌ If items reorder, state mixes */}
          {/* State bleeding between items! */}
        </div>
      ))}
    </div>
  );
}
```

### 4.4 Key Change Detection (State Reset)

Sometimes you WANT state to reset when key changes - use this intentionally:

```typescript
// ✅ Force component to reset state by changing key
function FormRenderer({ formId, sessionId, resetTrigger }: Props) {
  // When resetTrigger changes, key changes, and component remounts
  // All internal state (form data, errors) resets
  return (
    <form key={`${formId}-${resetTrigger}`}>
      {/* Form content */}
    </form>
  );
}

// Usage
function App() {
  const [resetToken, setResetToken] = useState(0);

  const handleResetForm = () => {
    setResetToken((prev) => prev + 1); // Forces form remount
  };

  return (
    <FormRenderer
      formId="door-info"
      sessionId={sessionId}
      resetTrigger={resetToken}
    />
  );
}
```

---

## 5. Integration with Your Codebase

### Current State (from README)

Your app already follows good practices:

```typescript
// ✅ GOOD: Composite keys in DynamicFormRenderer
key={`${formId}-section-${sectionIndex}`}
key={`${formId}-field-${field.id}`}
key={`${formId}-table-row-${rowIndex}`}
```

### Recommended Enhancements

1. **Add sessionId to all composite keys** (multiple concurrent sessions)
   ```typescript
   // BEFORE
   key={`${formId}-field-${field.name}`}

   // AFTER
   key={`${sessionId}-${formId}-field-${field.name}`}
   ```

2. **Use useId() for HTML field IDs** (accessibility)
   ```typescript
   // BEFORE
   id={field.name}

   // AFTER
   id={`${sessionId}-${formId}-${field.name}`}
   // OR with useId for automatic stability:
   const baseId = useId();
   id={`${baseId}-${field.name}`}
   ```

3. **Implement SessionProvider** (state isolation)
   ```typescript
   // Wrap multi-item rendering
   {items.map((item) => (
     <SessionProvider key={item.sessionId} sessionId={item.sessionId}>
       <DynamicFormRenderer ... />
     </SessionProvider>
   ))}
   ```

---

## 6. Performance Considerations

### Memory Overhead

| Approach | Per-Session | Per-Form | Per-Field | Notes |
|----------|-----------|---------|-----------|-------|
| **useId()** | ~50 bytes | 0 bytes | ~4 bytes | Minimal, built-in |
| **crypto.randomUUID()** | 36 bytes | - | - | One-time generation |
| **Context Providers** | ~1KB | - | - | Memoized, single instance |
| **localStorage** | Variable | Variable | 100-500 bytes | Persisted to disk |

**For 100 concurrent sessions:** ~100-200KB total overhead (acceptable)

### Rendering Performance

```typescript
// ✅ GOOD: Memoized context value prevents cascading re-renders
const contextValue: SessionContextValue = useMemo(
  () => ({
    sessionId,
    itemNumber,
    formData,
    setFormData,
    // ... other fields
  }),
  [sessionId, itemNumber, formData] // Only recreate when these change
);

// ❌ BAD: New object every render (all consumers re-render)
return (
  <SessionContext.Provider value={{ sessionId, itemNumber, formData }}>
    {children}
  </SessionContext.Provider>
);
```

---

## 7. Security Considerations

### ID Generation

- ✅ `crypto.randomUUID()` uses cryptographically secure random
- ✅ No predictable patterns (unlike auto-incrementing IDs)
- ✅ Safe for session tokens (entropy: 128 bits)

### localStorage

- ⚠️ Visible to XSS attacks - don't store sensitive data
- ✅ Scoped by sessionId - prevents accidental cross-session access
- ✅ Clean up on session end (SessionProvider cleanup)

```typescript
// ❌ DON'T store secrets
saveSessionFormData(sessionId, {
  ...formData,
  apiKey: 'sk-ant-...', // DON'T DO THIS
});

// ✅ DO store only user input
saveSessionFormData(sessionId, {
  doorType: 'sliding',
  hingeType: 'butt',
  // ... only form data, no secrets
});
```

---

## 8. Migration Path

### Phase 1: ID Scoping (Low Risk)
1. Add sessionId parameter to DynamicFormRenderer
2. Update all `id=` attributes to use `${sessionId}-${formId}-${fieldName}`
3. Update all `key=` attributes to include sessionId
4. No breaking changes - backward compatible

### Phase 2: Context Providers (Medium Risk)
1. Create SessionProvider and SessionsProvider components
2. Wrap multi-item rendering in SessionProvider
3. Update form components to use useSessionContext()
4. Gradually migrate form state to context

### Phase 3: Storage Isolation (Low Risk)
1. Add session-scoped localStorage utilities
2. Migrate from global to scoped storage
3. Add cleanup on session unmount
4. Test concurrent session scenarios

---

## 9. Testing Strategy

### Unit Tests

```typescript
// __tests__/session-id-generation.test.ts
describe('Session ID Generation', () => {
  it('should generate unique IDs', () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();
    expect(id1).not.toBe(id2);
  });

  it('should generate UUIDs in correct format', () => {
    const id = generateSessionId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});
```

### Integration Tests

```typescript
// __tests__/multi-session-forms.test.tsx
describe('Multi-Session Form Rendering', () => {
  it('should not share state between sessions', () => {
    const { rerender } = render(
      <SessionsProvider>
        <SessionProvider sessionId="session-1" itemNumber="item-1">
          <FormComponent />
        </SessionProvider>
        <SessionProvider sessionId="session-2" itemNumber="item-2">
          <FormComponent />
        </SessionProvider>
      </SessionsProvider>
    );

    // Change form 1
    const input1 = screen.getAllByRole('textbox')[0];
    fireEvent.change(input1, { target: { value: 'Test 1' } });

    // Form 2 should be unaffected
    const input2 = screen.getAllByRole('textbox')[1];
    expect(input2.value).toBe('');
  });
});
```

---

## 10. Code Examples Summary

All examples provided in this report can be copied directly. Key files to implement:

1. **lib/id-generator.ts** - Session/item ID generation
2. **lib/session-storage.ts** - Scoped localStorage utilities
3. **contexts/SessionContext.ts** - Per-session state context
4. **contexts/SessionsContext.ts** - Global sessions management
5. **components/SessionProvider.tsx** - Per-session provider
6. **components/SessionsProvider.tsx** - Global provider
7. **components/DynamicFormRenderer.tsx** - Updated with scoped IDs

---

## Unresolved Questions

1. **Next.js App Router Specifics:** How does your current session management work with App Router? Consider using `useSearchParams()` to persist session ID in URL for better navigation.

2. **Real-Time Sync:** Do sessions need to sync across browser tabs? Consider ServiceWorker + localStorage events.

3. **Cleanup Strategy:** What's your policy for stale sessions? Implement a timeout + cleanup mechanism.

4. **SSR Implications:** Does your form need server-rendering? `useId()` handles this correctly, but verify `identifierPrefix` doesn't conflict.

---

## References

- React useId: https://react.dev/reference/react/useId
- React Context: https://react.dev/reference/react/createContext
- MDN Web Storage: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
- Web Crypto API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- UUID RFC 4122: https://tools.ietf.org/html/rfc4122

---

**Report Generated:** 2025-11-30
**Research Tools Used:** Exa web search, React official documentation, codebase analysis
**Next Steps:** Implement Phase 1 (ID Scoping) with code review before deployment
