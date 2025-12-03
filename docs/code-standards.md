# Code Standards

**Last Updated:** 2025-12-02

## React Component Standards

### 1. React Key Props

**Rule:** All list items MUST use stable, unique composite keys.

**Pattern:**
```typescript
// ✅ Correct: Composite key with formId prefix
{sections.map((section, sectionIndex) => (
  <div key={`${formId}-section-${sectionIndex}`}>
    {section.fields.map((field) => (
      <Field key={`${formId}-field-${field.id}`}>
        {/* field content */}
      </Field>
    ))}
  </div>
))}

// ✅ Correct: Table rows use stable index
{tableData.map((row, rowIndex) => (
  <TableRow key={`${formId}-table-row-${rowIndex}`}>
    {/* row cells */}
  </TableRow>
))}

// ❌ Wrong: Duplicate keys across forms
key={field.id}  // Multiple forms may have field with same ID

// ❌ Wrong: Using data values (unstable)
key={row.value}  // Value may change or be duplicated
```

**Rationale:**
- Forms are reused across multiple steps (same `field.id` appears in different forms)
- `formId` prefix ensures global uniqueness
- Index-based keys for tables are stable (row order doesn't change during render)

**Files Using Pattern:**
- `components/DynamicFormRenderer.tsx`
- `components/ClaudeChat.tsx`

### 2. Type-Safe Value Handling

**Rule:** Never directly cast `FormFieldValue` - use helper functions.

**Pattern:**
```typescript
type FormFieldValue =
  | string | number | boolean
  | (string | number)[]
  | Date
  | Record<string, string | number>
  | undefined;

// ✅ Correct: Type-safe helpers
const toStringValue = (value: FormFieldValue): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
};

const toNumberValue = (value: FormFieldValue, fallback: number): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

// Usage in components
<Input
  value={toStringValue(formData[field.name])}
  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
/>

// ❌ Wrong: Unsafe cast
<Input value={formData[field.name] as string} />
```

**Required Helpers:**
- `toStringValue(value): string`
- `toArrayValue(value): (string | number)[]`
- `toNumberValue(value, fallback): number`
- `toBooleanValue(value): boolean`
- `toDateValue(value): Date | undefined`

**File:** `components/DynamicFormRenderer.tsx` (lines 48-79)

## Design Token Standards

### 1. Color Token Usage

**Rule:** ALWAYS use neutral color palette and semantic tokens - NEVER hardcode colors.

**Pattern:**
```tsx
// ✅ Correct: Use design tokens
<div className="bg-neutral-50 dark:bg-neutral-900">
<div className="text-neutral-700 dark:text-neutral-400">
<div className="border-neutral-200">

// ✅ Correct: Semantic tokens for meaning
<Button variant="destructive">  // Uses --color-error
<Badge variant="success">        // Uses --color-success
<Alert variant="warning">        // Uses --color-warning

// ❌ Wrong: Hardcoded zinc (deprecated)
<div className="bg-zinc-50">

// ❌ Wrong: Hardcoded hex values
<div className="bg-[#fafafa]">
<div style={{ backgroundColor: "#0a0a0a" }}>
```

**Neutral Palette (11 shades):**
- `neutral-50` through `neutral-950` (light to dark)
- Complete coverage for all grayscale needs
- Consistent across light and dark modes

**Semantic Tokens:**
- `success` / `success-foreground` - Confirmations, checkmarks
- `warning` / `warning-foreground` - Alerts, cautionary states
- `error` / `error-foreground` - Errors, destructive actions
- `surface-neutral` / `surface-neutral-hover` - Background surfaces
- `border-neutral` - All borders and dividers
- `text-muted` / `text-muted-foreground` - Secondary text

**Files:** `app/globals.css` (CSS variables), `tailwind.config.ts` (Tailwind config)

### 2. Layout Dimension Tokens

**Rule:** Use CSS variables for layout dimensions - NEVER hardcode rem/px values.

**Pattern:**
```tsx
// ✅ Correct: CSS variable references
<header className="h-[var(--header-height)]">
<nav className="h-[var(--nav-height)]">
<aside className="w-[var(--sidebar-width)]">
<div style={{ height: "calc(100dvh - var(--header-height))" }}>

// ✅ Correct: Responsive layout heights
<main className="h-[var(--layout-height-mobile)] lg:h-[var(--layout-height-desktop)]">

// ❌ Wrong: Hardcoded dimensions
<header className="h-16">
<div className="h-[calc(100vh-4rem)]">
<aside style={{ width: "16rem" }}>
```

**Available Layout Tokens:**
- `--header-height: 4rem` - Main navigation header
- `--nav-height: 3rem` - Secondary navigation
- `--footer-height: 3rem` - Page footer
- `--sidebar-width: 16rem` - Sidebar panels
- `--layout-height-mobile: calc(100dvh - var(--header-height))` - Mobile viewports
- `--layout-height-desktop: calc(100vh - var(--header-height))` - Desktop viewports

**Rationale:**
- Single source of truth - change once, updates everywhere
- Enables dynamic responsive layouts
- Self-documents design decisions
- Easy to adjust spacing system-wide

**File:** `app/globals.css` (CSS variables)

### 3. Input Dimension Tokens

**Rule:** Use standardized input dimensions for consistency.

**Pattern:**
```tsx
// ✅ Correct: Standard input widths
<Input className="w-[var(--input-width-standard)]">  // 400px
<Textarea className="max-w-[var(--input-width-large)]">  // 500px
<Select className="max-h-[var(--input-max-height-standard)]">  // 500px

// ❌ Wrong: Arbitrary dimensions
<Input className="w-[450px]">
<Textarea className="max-w-[95%]">
```

**Available Input Tokens:**
- `--input-width-standard: 400px` - Default form inputs
- `--input-width-large: 500px` - Wider inputs (textareas, selects)
- `--input-max-height-standard: 500px` - Maximum input height

### 4. NO Inline Styles Rule

**Rule:** NEVER use inline style attributes for spacing or colors - use Tailwind classes or CSS variables.

**Pattern:**
```tsx
// ✅ Correct: Tailwind utility classes
<div className="p-6">
<div className="p-6 pb-4">
<div className="bg-neutral-50">

// ✅ Correct: CSS variables for calculations
<div style={{ height: "calc(100vh - var(--header-height))" }}>

// ❌ Wrong: Inline padding styles
<div style={{ padding: "1.5rem" }}>
<div style={{ paddingBottom: "1rem" }}>

// ❌ Wrong: Inline color styles
<div style={{ backgroundColor: "#fafafa" }}>
```

**Rationale:**
- Violates DRY (Don't Repeat Yourself)
- Hard to maintain and update
- Conflicts with Tailwind classes
- No dark mode support

**Exception:** CSS variable calculations are allowed when Tailwind arbitrary values become too complex.

### 5. Animation Token Usage

**Rule:** Use CSS variables for animation colors, not hardcoded RGBA values.

**Pattern:**
```css
/* ✅ Correct: CSS variable with color-mix() */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px color-mix(in srgb, var(--primary) 30%, transparent); }
  50% { box-shadow: 0 0 40px color-mix(in srgb, var(--primary) 60%, transparent); }
}

/* ❌ Wrong: Hardcoded RGBA */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(113, 113, 122, 0.3); }
  50% { box-shadow: 0 0 40px rgba(113, 113, 122, 0.6); }
}
```

**File:** `app/globals.css` (keyframe definitions)

### 6. Design Token Migration Process

**Rule:** When adding new colors or spacing, follow this process:

**Step 1: Define CSS Variable**
```css
/* In app/globals.css :root */
--new-token: value;
```

**Step 2: Add to @theme Directive**
```css
/* In app/globals.css @theme inline */
--color-new-token: var(--new-token);  /* For colors */
--spacing-new-token: var(--new-token);  /* For spacing */
```

**Step 3: Extend Tailwind Config (if needed)**
```typescript
// In tailwind.config.ts
theme: {
  extend: {
    colors: {
      'new-token': 'var(--new-token)',
    },
  },
}
```

**Step 4: Use in Components**
```tsx
<div className="bg-new-token">  // Option 1: Direct class
<div className="bg-[var(--new-token)]">  // Option 2: Arbitrary value
<div style={{ background: "var(--new-token)" }}>  // Option 3: Inline CSS variable
```

### 3. Component Cleanup

**Rule:** Remove unused components immediately. Do not keep "just in case" code.

**Removed in Recent Refactor:**
- `ChainOfThought` component (unused AI element)
- `TaskContent` component (replaced with direct rendering)

**Rationale:**
- Dead code increases bundle size
- Confuses future maintainers
- Git history preserves deleted code if needed

## Validation Standards

### 1. Conditional-Aware Validation

**Rule:** Always pass current data to `buildZodSchema` for conditional evaluation.

**Pattern:**
```typescript
// ✅ Correct: Conditionals see current field values
const schema = buildZodSchema(formSpec, mergedData);
const result = schema.safeParse(formData);

// ❌ Wrong: Conditionals can't evaluate (default to visible)
const schema = buildZodSchema(formSpec);
const result = schema.safeParse(formData);
```

**Why:** Hidden conditional fields should be optional. Without data context, validator can't determine visibility.

**Implementation:**
```typescript
export function buildZodSchema(
  formSpec: FormSpec,
  data?: Record<string, unknown>  // Required for conditionals
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  formSpec.sections.forEach((section) => {
    section.fields.forEach((field) => {
      // Check if field is visible based on current data
      const isVisible = data ? checkConditional(field, data) : true;
      const fieldSchema = buildFieldSchema(field, isVisible);
      schemaFields[field.name] = fieldSchema;
    });
  });

  return z.object(schemaFields);
}
```

**File:** `lib/validation/zod-schema-builder.ts`

### 2. Boolean/Number Normalization

**Rule:** Normalize boolean and number values before comparison in conditionals.

**Pattern:**
```typescript
// Switch fields return boolean, but JSON may compare to 0/1
const normalizedCurrent = typeof currentValue === 'boolean'
  ? (currentValue ? 1 : 0)
  : currentValue;
const normalizedRequired = typeof requiredValue === 'boolean'
  ? (requiredValue ? 1 : 0)
  : requiredValue;

// Use loose equality for type coercion (string "1" == number 1)
return normalizedCurrent == normalizedRequired;
```

**Use Cases:**
```json
// Form definition uses number
{ "field": "USE_HINGE", "operator": "equals", "value": 1 }

// Runtime value may be boolean
formData.USE_HINGE = true  // Switch component returns boolean

// Normalizer converts both: 1 == 1 ✅
```

**File:** `lib/validation/zod-schema-builder.ts` (lines 24-36)

### 3. Effective Required Fields

**Rule:** Required flag only enforced if field is visible.

**Pattern:**
```typescript
function buildFieldSchema(field: FormField, isVisible: boolean = true): z.ZodTypeAny {
  // Hidden fields are always optional (prevent validation errors)
  const effectiveRequired = field.required && isVisible;

  // Build schema based on effectiveRequired
  switch (field.type) {
    case 'input':
      schema = z.string();
      if (effectiveRequired) {
        schema = schema.min(1, `${field.label} is required`);
      } else {
        schema = schema.optional().or(z.literal(''));
      }
      break;
    // ... other field types
  }
}
```

**File:** `lib/validation/zod-schema-builder.ts` (lines 90-253)

## Flow Engine Standards

### 1. State Merging for Cross-Form Conditionals

**Rule:** Always merge accumulated state before validation.

**Pattern:**
```typescript
// ✅ Correct: Cross-form conditionals work
const accumulatedState = flowExecutor.getState();  // {project-header: {...}, door-info: {...}}
const mergedData = { ...accumulatedState, ...formData };
const validationResult = validateFormData(formSpec, mergedData);

// ❌ Wrong: Conditionals can't reference previous forms
const validationResult = validateFormData(formSpec, formData);
```

**Why:** Form 5's field may depend on `SUB_TYPE` from Form 1. Merged state provides full context.

**File:** `components/ClaudeChat.tsx` (lines 427-432)

### 2. Safe Expression Evaluation

**Rule:** Only use `safeEval()` for condition expressions. Never use `eval()`.

**Pattern:**
```typescript
// ✅ Correct: Whitelist-only evaluation
import { safeEval } from '@/lib/flow-engine/evaluator';
const result = safeEval("OPENING_TYPE == 1 AND HINGES == 1", context);

// ❌ Wrong: Unsafe eval
const result = eval(`context.${expression}`);
```

**Security Checklist:**
- ✅ Converts SmartAssembly syntax (`AND`, `OR`, `<>`) to JavaScript
- ✅ Validates against whitelist (no function calls, no semicolons)
- ✅ Variables default to null (prevent ReferenceError exploits)
- ✅ Returns boolean only

**File:** `lib/flow-engine/evaluator.ts`

### 3. Flow State Management

**Rule:** FlowExecutor is single source of truth for accumulated state.

**Pattern:**
```typescript
// ✅ Correct: Update executor after validation
const validationResult = validateFormData(formSpec, mergedData);
if (validationResult.success) {
  flowExecutor.updateState(currentStepId, validationResult.data);
  flowExecutor.setCurrentStepIndex(currentStepOrder);
}

// ❌ Wrong: Separate state management
setFlowState({...flowState, [stepId]: data});  // Out of sync with executor
```

**File:** `components/ClaudeChat.tsx` (lines 484-491)

## TypeScript Standards

### 1. Form Field Type Definitions

**Rule:** All form fields MUST match `FormField` interface.

**Interface:**
```typescript
interface FormField {
  id: string;                    // Unique within form
  name: string;                  // Field name in formData
  label: string;                 // Display label
  type: FieldType;               // One of 11 supported types
  required?: boolean;            // Validation flag
  conditional?: FieldConditional; // Visibility rules
  validation?: {                 // Zod validation config
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  // Type-specific props...
  options?: Array<{ value: string | number; label: string }>;
  columns?: Array<{ key: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  // ...
}
```

**File:** `lib/form-templates/types.ts`

### 2. Conditional Type Definitions

**Rule:** Conditionals MUST specify operator and logic.

**Types:**
```typescript
type ConditionalOperator =
  | 'equals' | 'notEquals'
  | 'greaterThan' | 'greaterThanOrEqual'
  | 'lessThan' | 'lessThanOrEqual';

interface FieldCondition {
  field: string;              // Dependent field name
  operator: ConditionalOperator;
  value: string | number | boolean;
}

interface FieldConditional {
  conditions: FieldCondition[];  // Array of comparisons
  logic: 'AND' | 'OR';           // How to combine results
}
```

**Example:**
```json
{
  "name": "HINGE_COUNT",
  "conditional": {
    "conditions": [
      { "field": "USE_HINGE", "operator": "equals", "value": 1 },
      { "field": "DOOR_HEIGHT", "operator": "greaterThan", "value": 80 }
    ],
    "logic": "AND"
  }
}
```

**File:** `lib/form-templates/types.ts` (lines 7-24)

## Error Handling Standards

### 1. Graceful Degradation

**Rule:** Continue flow execution even if non-critical operations fail.

**Pattern:**
```typescript
// ✅ Correct: Log error but continue
try {
  await fetch('/api/form-submission', {...});
} catch (dbError) {
  console.error('MongoDB submission error:', dbError);
  // Continue - executor state persists in memory
}

// ❌ Wrong: Block user on DB failure
try {
  await fetch('/api/form-submission', {...});
} catch (dbError) {
  throw new Error('Database error - cannot continue');
}
```

**File:** `components/ClaudeChat.tsx` (lines 478-481)

### 2. Validation Error Display

**Rule:** Show field-level errors inline, not modal dialogs.

**Pattern:**
```typescript
// Set errors in state
const validationResult = validateFormData(formSpec, mergedData);
if (!validationResult.success) {
  setValidationErrors(validationResult.errors);
  return;
}

// DynamicFormRenderer displays errors
<FieldError>{validationErrors[field.name]}</FieldError>
```

**File:** `components/ClaudeChat.tsx` (lines 434-447)

## Performance Standards

### 1. Async Template Loading

**Rule:** Load form templates on demand, not at app startup.

**Pattern:**
```typescript
// ✅ Correct: Load when needed
const formSpec = await loadFormTemplate(currentStepId);

// ❌ Wrong: Preload all templates
const allTemplates = await Promise.all(templateIds.map(loadFormTemplate));
```

**File:** `lib/form-templates/loader.ts`

### 2. Schema Caching (Future Enhancement)

**Rule:** Zod schemas should be cached if form spec is unchanged.

**Current:** Schema rebuilt on every validation call.

**Proposed:**
```typescript
const schemaCache = new Map<string, z.ZodObject<any>>();

export function buildZodSchema(formSpec: FormSpec, data?: Record<string, unknown>) {
  const cacheKey = `${formSpec.formId}-${JSON.stringify(data)}`;
  if (schemaCache.has(cacheKey)) {
    return schemaCache.get(cacheKey)!;
  }
  const schema = /* build schema */;
  schemaCache.set(cacheKey, schema);
  return schema;
}
```

**Note:** Not implemented yet (conditionals require data, making cache key complex).

## Testing Standards

### 1. Type Validation Scripts

**Rule:** Run validation scripts before committing form template changes.

**Scripts:**
```bash
# Check for duplicate field names
node scripts/check-duplicates.js

# Verify radio/select option types
node scripts/verify-radio-numeric.js

# Validate flow step linking
ts-node scripts/validate-flow-link.ts

# Analyze conditional dependencies
node scripts/analyze-conditionals.js
```

### 2. Form Template Validation

**Rule:** All form templates MUST validate against schema before deployment.

**Script:**
```bash
ts-node scripts/validate-extracted-forms.ts
```

**Checks:**
- All required fields present (`formId`, `title`, `sections`)
- Field types match `FieldType` enum
- Conditional operators are valid
- No duplicate field names within form

## File Naming Standards

### 1. Form Templates

**Pattern:** `{form-id}.json`

**Examples:**
- `project-header.json`
- `door-info.json`
- `hinge-info.json`

**Location:** `public/form-templates/`

### 2. Flow Definitions

**Pattern:** `{product-type}-form-flow.json`

**Examples:**
- `SDI-form-flow.json`
- `EMJAC-form-flow.json`

**Location:** `public/form-flows/`

### 3. Component Files

**Pattern:** `{ComponentName}.tsx`

**Examples:**
- `DynamicFormRenderer.tsx` (component)
- `ClaudeChat.tsx` (component)
- `zod-schema-builder.ts` (utility)

## Git Commit Standards

### 1. Commit Message Format

**Pattern:** `{type}: {short description}`

**Types:**
- `fix:` Bug fixes
- `feat:` New features
- `refactor:` Code restructuring (no behavior change)
- `docs:` Documentation updates
- `test:` Test additions/changes
- `chore:` Build/tooling changes

**Examples:**
```
fix: resolve duplicate field names in door-info
feat: add conditional validation system
refactor: remove unused ChainOfThought component
docs: update codebase summary with validation flow
```

### 2. Recent Commit Examples

```
9374692 fix: rename duplicate field names in door-info, hinge-info, lock-options
9713b48 fix: resolve duplicate field names and step orders
898fbb5 fix: resolve array validation and null value handling
991c36c fix: remove double-keyed wrapper div in DynamicFormRenderer
a855075 fix: resolve form flow execution and validation errors
```

## Code Review Checklist

Before submitting PR, verify:

**React & TypeScript:**
- [ ] All React lists use stable composite keys with `formId` prefix
- [ ] Type-safe value helpers used (no direct casts)
- [ ] No unused components/imports
- [ ] TypeScript strict mode passes

**Validation & Flow:**
- [ ] Validation calls include `data` parameter for conditionals
- [ ] Boolean/number normalization in conditional checks
- [ ] FlowExecutor state updated after validation
- [ ] Form templates validated with scripts

**Design Tokens (Tailwind V4):**
- [ ] NO `zinc-*` classes (use `neutral-*` instead)
- [ ] NO hardcoded hex colors in className or style
- [ ] NO inline `style={{padding:...}}` (use Tailwind classes)
- [ ] Use CSS variables for layout dimensions (`--header-height`, etc.)
- [ ] Use semantic color tokens (`success`, `warning`, `error`)
- [ ] Animation keyframes use `color-mix()` with CSS variables

**Error Handling:**
- [ ] Graceful degradation for non-critical errors

**Git:**
- [ ] Git commit follows message format

**Verification Commands:**
```bash
# No zinc classes remaining
grep -r "zinc-" components/ app/ --include="*.tsx" | grep -v node_modules

# No inline padding styles
grep -r 'style={{.*padding' components/ app/ --include="*.tsx"

# Build passes
npm run build

# Type check passes
npx tsc --noEmit
```

---

**Enforcement:** These standards are enforced via:
1. TypeScript strict mode
2. ESLint rules (see `eslint.config.mjs`)
3. Pre-commit validation scripts
4. Code review process
