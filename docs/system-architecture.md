# System Architecture

**Last Updated:** 2025-12-04

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Landing Page │  │ Quote Flow   │  │ 3D Viewer    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Component Layer (React 19)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ ClaudeChat   │  │ DynamicForm  │  │ Stepper UI   │      │
│  │ (Orchestr.)  │  │ Renderer     │  │ Components   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Flow Engine  │  │ Validation   │  │ Form Loader  │      │
│  │ (Executor)   │  │ (Zod Schema) │  │ (Templates)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ MongoDB      │  │ JSON Files   │  │ Claude API   │      │
│  │ (Persist)    │  │ (Templates)  │  │ (Chat)       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Core Systems

### 1. Form Rendering System

**Component:** `DynamicFormRenderer.tsx`

**Responsibilities:**
- Render 11 field types from JSON specs
- Manage local form state (`formData`)
- Display validation errors inline
- Handle conditional field visibility (UI only)

**Architecture:**
```
FormSpec (JSON)
    ↓
DynamicFormRenderer
    ↓
Field Type Router
    ├─→ Input/Textarea
    ├─→ Integer/Float (number inputs)
    ├─→ Select/Radio/Checkbox
    ├─→ Switch/Slider
    ├─→ Date Picker
    └─→ Table (row selection)
    ↓
Type-Safe Value Helpers
    ├─→ toStringValue()
    ├─→ toNumberValue()
    ├─→ toBooleanValue()
    ├─→ toArrayValue()
    └─→ toDateValue()
    ↓
Emit: formData (Record<string, FormFieldValue>)
```

**Field Type Mapping:**
| Field Type | React Component       | Value Type              |
|------------|-----------------------|-------------------------|
| input      | Input                 | string                  |
| textarea   | Textarea              | string                  |
| integer    | Input type="number"   | number                  |
| float      | Input type="number"   | number                  |
| select     | Select                | string \| number        |
| radio      | RadioGroup            | string \| number        |
| checkbox   | Checkbox (multi)      | (string \| number)[]    |
| checkbox   | Checkbox (single)     | boolean                 |
| switch     | Switch                | boolean                 |
| slider     | Slider                | number                  |
| date       | DatePicker            | Date                    |
| table      | Table (row select)    | Record<string, any>     |

**Key Patterns:**
1. **Stable React Keys:** `key={${formId}-field-${field.id}}`
2. **Type Safety:** Always use helper functions for value extraction
3. **Controlled Components:** All fields controlled by `formData` state

### 2. Validation System

**File:** `lib/validation/zod-schema-builder.ts`

**Architecture:**
```
validateFormData(formSpec, data)
    ↓
buildZodSchema(formSpec, data)
    ↓
For each field:
    ↓
checkConditional(field, data) → isVisible
    ↓
effectiveRequired = field.required && isVisible
    ↓
buildFieldSchema(field, isVisible)
    ├─→ String fields (min length, pattern)
    ├─→ Number fields (min, max, int/float)
    ├─→ Array fields (min items)
    ├─→ Boolean fields (true/false)
    ├─→ Table fields (record validation)
    └─→ Apply required/optional based on effectiveRequired
    ↓
z.object(schemaFields)
    ↓
schema.safeParse(data)
    ↓
Return: {success: true, data} | {success: false, errors}
```

**Conditional Evaluation:**
```
checkConditional(field, data)
    ↓
For each condition in field.conditional.conditions:
    ↓
Normalize values (boolean → 0/1)
    ↓
Apply operator:
    ├─→ equals (==)
    ├─→ notEquals (!=)
    ├─→ greaterThan (>)
    ├─→ greaterThanOrEqual (>=)
    ├─→ lessThan (<)
    └─→ lessThanOrEqual (<=)
    ↓
Combine with logic (AND/OR)
    ↓
Return: boolean (field visible or hidden)
```

**Key Innovation:** Hidden fields are made optional to prevent validation errors on invisible required fields.

### 3. Flow Engine

**Files:**
- `lib/flow-engine/loader.ts` - Load and parse flow definitions
- `lib/flow-engine/executor.ts` - State machine for step progression
- `lib/flow-engine/evaluator.ts` - Safe expression evaluation

**Flow Execution Architecture:**
```
loadFlow(flowId)
    ↓
Parse JSON flow definition
    ↓
filterSteps(flowSteps, initialData)
    ↓
For each step:
    ↓
evaluateCompoundCondition(parentCondition, childCondition, context)
    ↓
safeEval(expression, context) → boolean
    ├─→ Convert SmartAssembly syntax (AND/OR/<>)
    ├─→ Validate whitelist (no functions, no semicolons)
    ├─→ Extract variables, default to null
    └─→ Execute in sandboxed Function()
    ↓
Filter to visible steps only
    ↓
buildStepDefinitions(filteredSteps)
    ↓
Return: { steps, executor, filteredSteps }
```

**FlowExecutor State Machine:**
```typescript
class FlowExecutor {
  private state: Record<string, any> = {};
  private currentStepIndex: number = 0;

  updateState(stepId: string, data: Record<string, any>) {
    this.state[stepId] = data;
    // Flatten for cross-form references
    Object.assign(this.state, data);
  }

  getState(): Record<string, any> {
    return this.state;
  }

  getCurrentStep(): number {
    return this.currentStepIndex;
  }
}
```

**Security (Expression Evaluator):**
1. **Syntax Conversion:** `AND` → `&&`, `OR` → `||`, `<>` → `!==`
2. **Whitelist Validation:** Only `[a-zA-Z0-9_()&|!<>=.+-' "]` allowed
3. **Block Function Calls:** Regex prevents `func()`
4. **Block Assignment:** No `=` except in comparisons
5. **Variable Safety:** Undefined vars default to `null` (no ReferenceError)

### 4. Form Flow Orchestration

**Component:** `ClaudeChat.tsx`

**Architecture:**
```
User submits form
    ↓
handleFormSubmit()
    ↓
Load current form template
    ↓
Get accumulated state from FlowExecutor
    ↓
Merge state: { ...accumulatedState, ...formData }
    ↓
Validate with merged data (enables cross-form conditionals)
    ↓
validateFormData(formSpec, mergedData)
    ↓
If validation fails:
    ├─→ Set validationErrors state
    └─→ Display errors inline in DynamicFormRenderer
    ↓
If validation succeeds:
    ├─→ Save to MongoDB (/api/form-submission)
    ├─→ Update FlowExecutor state
    ├─→ Increment step index
    ├─→ Load next form template
    └─→ Render next step
```

**State Merging Rationale:**
```typescript
// Without merging: Form 5's conditional can't see Form 1's data
const validationResult = validateFormData(formSpec, formData);
// Conditional: { field: "SUB_TYPE", operator: "equals", value: 1 }
// SUB_TYPE not in formData → conditional defaults to visible

// With merging: Cross-form conditionals work
const accumulatedState = flowExecutor.getState();
// { "project-header": {...}, "door-info": { SUB_TYPE: 1 }, ... }
const mergedData = { ...accumulatedState, ...formData };
// Now SUB_TYPE is in mergedData → conditional evaluates correctly
const validationResult = validateFormData(formSpec, mergedData);
```

### 5. API Layer

**Endpoints:**

| Route                        | Method | Purpose                          |
|------------------------------|--------|----------------------------------|
| `/api/chat`                  | POST   | Claude AI conversation           |
| `/api/form-submission`       | POST   | Save form data to MongoDB        |
| `/api/generate-project-doc`  | POST   | Generate project documentation   |
| `/api/read-json`             | GET    | Read JSON files from filesystem  |
| `/api/save-item-data`        | POST/GET | Save/load item data (MongoDB-only) |
| `/api/create-project-folder` | POST   | Create project directory         |
| `/api/build-asm`             | POST   | Build assembly files             |
| `/api/export-variables`      | POST   | Export per-item JSON files (Phase 03) |
| `/api/export-variables`      | GET    | Check export status (legacy)     |

**MongoDB Schema (Form Submissions):**
```typescript
{
  _id: ObjectId,
  sessionId: string,         // Unique session identifier
  stepId: string,            // Form template ID
  formId: string,            // Same as stepId
  formData: Record<string, any>, // Validated form data
  metadata: {
    salesOrderNumber: string,
    itemNumber: string,
    productType: string,
    formVersion: string,
    userId?: string,
    isRevision: boolean,
  },
  timestamp: Date,
}
```

**MongoDB Schema (Items Collection - Phase 01 Updated):**
```typescript
{
  _id: ObjectId,
  projectId: ObjectId,           // Foreign key to projects collection
  itemNumber: string,             // "001", "002", etc.
  productType: string,            // "SDI", "EMJAC", etc.
  itemData: Record<string, any>,  // All form data (nested by formId)
  formIds: string[],              // ["door-info", "hinge-info", ...]
  isDeleted: boolean,             // Soft-delete for renames
  createdAt: Date,
  updatedAt: Date,
  renamedFrom?: string,           // Original item number if renamed
  renamedAt?: Date,
}
```

**Data Flow Pattern (MongoDB-First - Updated 2025-12-04):**
```
Form Submission
    ↓
POST /api/save-item-data (MongoDB upsert ONLY)
    ↓
Items Collection Updated
    ↓
Workflow Continues (no filesystem writes)
    ↓
Flow Complete → flowComplete: true
    ↓
Export Button Enabled in LeftSidebar
    ↓
[User clicks Export Button]
    ↓
POST /api/export-variables (queries MongoDB, writes per-item files)
    ├─→ Query items collection for projectId
    ├─→ Delete old item-XXX.json files (cleanup)
    ├─→ Write item-001.json, item-002.json, etc.
    └─→ Add CHOICE=1, FRAME_PROCESSED="" defaults
    ↓
JSON files created in project-docs/{productType}/{SO_NUM}/items/
```

**Key Principles:**
1. **MongoDB-First:** Database is single source of truth during workflow
2. **Explicit Export:** User controls when files are written via Export button
3. **No Auto-Export:** File generation decoupled from workflow completion
4. **Filesystem writes occur ONLY during explicit export operations**
5. **Per-Item Files:** Each item exported to separate JSON file (item-001.json, item-002.json)
6. **File Cleanup:** Old item files deleted before writing new ones (prevents stale data)
7. **Security:** Path traversal protection via regex validation and normalized path checks

**Export Button Architecture:**
- Location: LeftSidebar footer (below 3D Viewer button)
- Enabled when: ≥1 item has `flowComplete: true`
- Badge: Shows count of completed items
- Mobile: Closes sidebar after export
- Handler: `ClaudeChat.handleExportClick()` calls `/api/export-variables`

**Export API Details (Phase 03 - 2025-12-04):**
```typescript
// Request
POST /api/export-variables
Body: {
  salesOrderNumber: string,  // Regex: /^[a-zA-Z0-9_-]+$/
  productType: string,       // Regex: /^[A-Z]{2,10}$/
}

// Response (Success)
{
  success: true,
  exportPath: "project-docs/SDI/SO12345/items",
  itemCount: 3,
  exportedFiles: ["item-001.json", "item-002.json", "item-003.json"],
  salesOrderNumber: "SO12345",
  productType: "SDI",
  exportedAt: "2025-12-04T05:13:00.000Z"
}

// Item File Structure (item-001.json)
{
  // All form data (nested by formId)
  "door-info": { DOOR_WIDTH: 36, DOOR_HEIGHT: 80, ... },
  "hinge-info": { HINGE_TYPE: 1, HINGE_COUNT: 3, ... },

  // System fields (SmartAssembly requirements)
  "CHOICE": 1,
  "FRAME_PROCESSED": "",

  // Metadata (informational)
  "_metadata": {
    "itemNumber": "001",
    "productType": "SDI",
    "salesOrderNumber": "SO12345",
    "exportedAt": "2025-12-04T05:13:00.000Z",
    "formIds": ["door-info", "hinge-info"]
  }
}
```

**Security Features:**
1. **Input Validation:** Zod schema with strict regex patterns
2. **Path Traversal Protection:** Normalized path validation against project-docs root
3. **Rate Limiting:** 10 requests/min per IP (RATE_LIMITS.EXPORT)
4. **Error Handling:** Sentry integration for unexpected errors

### 6. Template Management

**Files:**
- `lib/form-templates/loader.ts` - Async template fetching
- `lib/form-templates/types.ts` - TypeScript definitions
- `public/form-templates/*.json` - Form specifications

**Template Loading Flow:**
```
loadFormTemplate(formId)
    ↓
Fetch from /form-templates/{formId}.json
    ↓
Parse JSON
    ↓
Validate against FormSpec type
    ↓
Return: FormSpec | null
```

**Template Structure:**
```typescript
interface FormSpec {
  formId: string;              // Unique identifier
  itemType: string;            // Product category
  title: string;               // Display title
  description: string;         // Subtitle
  sections: FormSection[];     // Field groups
  submitButton: {
    text: string;
    action: string;
  };
}

interface FormSection {
  id?: string;
  title?: string;
  description?: string;
  fields: FormField[];         // Array of field specs
}
```

## Data Flow: Complete Form Submission

```
┌───────────────────────────────────────────────────────────────┐
│ 1. User fills form in DynamicFormRenderer                     │
│    formData = { DOOR_WIDTH: 36, DOOR_HEIGHT: 80, ... }       │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│ 2. User clicks Submit                                         │
│    ClaudeChat.handleFormSubmit() triggered                    │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│ 3. Load current form template                                 │
│    formSpec = await loadFormTemplate("door-info")            │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│ 4. Get accumulated state from FlowExecutor                    │
│    accumulatedState = flowExecutor.getState()                │
│    // { "project-header": { SUB_TYPE: 1, ... }, ... }        │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│ 5. Merge state for cross-form conditionals                    │
│    mergedData = { ...accumulatedState, ...formData }          │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│ 6. Build Zod schema with conditional awareness                │
│    schema = buildZodSchema(formSpec, mergedData)              │
│                                                               │
│    For each field:                                            │
│      - Check if visible (checkConditional)                   │
│      - Set effectiveRequired = required && isVisible         │
│      - Build type-specific schema                            │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│ 7. Validate form data                                         │
│    result = schema.safeParse(formData)                        │
│                                                               │
│    If errors:                                                 │
│      - Format as { fieldName: errorMessage }                 │
│      - setValidationErrors(errors)                           │
│      - DynamicFormRenderer shows FieldError components       │
│      - STOP (user must fix)                                  │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│ 8. Save to MongoDB (graceful degradation)                     │
│    POST /api/form-submission                                  │
│    Body: { sessionId, stepId, formData, metadata }           │
│                                                               │
│    If DB error: log but continue (executor has state)        │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│ 9. Update FlowExecutor state                                  │
│    flowExecutor.updateState("door-info", validatedData)      │
│    flowExecutor.setCurrentStepIndex(1)                       │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│ 10. Load next step                                            │
│     nextStep = filteredSteps[1]                              │
│     nextFormSpec = await loadFormTemplate(nextStep.formId)   │
│     Render DynamicFormRenderer with new spec                 │
└───────────────────────────────────────────────────────────────┘
```

## Conditional Rendering Architecture

### Field-Level Conditionals (DynamicFormRenderer)

**Purpose:** Hide/show fields based on current form values.

**Implementation:**
```typescript
// In DynamicFormRenderer
const isFieldVisible = (field: FormField): boolean => {
  if (!field.conditional) return true;

  const { conditions, logic } = field.conditional;
  const results = conditions.map(({ field: depField, operator, value }) => {
    const currentValue = formData[depField];
    // Apply operator logic...
    return result;
  });

  return logic === 'OR' ? results.some(r => r) : results.every(r => r);
};

// Render only if visible
{isFieldVisible(field) && (
  <Field key={`${formId}-field-${field.id}`}>
    {/* field content */}
  </Field>
)}
```

**Limitation:** Only sees current form data (no cross-form references).

### Step-Level Conditionals (Flow Engine)

**Purpose:** Filter entire form steps based on previous answers.

**Implementation:**
```typescript
// In flow-engine/loader.ts
function filterSteps(
  steps: FlowStep[],
  initialData: Record<string, any>
): FlowStep[] {
  return steps.filter(step => {
    const parentCondition = step.parentCondition || null;
    const childCondition = step.condition || null;
    return evaluateCompoundCondition(parentCondition, childCondition, initialData);
  });
}
```

**Example Flow:**
```json
{
  "steps": [
    { "order": 1, "formTemplate": "project-header" },
    {
      "order": 2,
      "formTemplate": "hinge-info",
      "condition": "SUB_TYPE == 1"  // Only show if SUB_TYPE is 1
    }
  ]
}
```

### Validation-Level Conditionals (Zod Schema)

**Purpose:** Make hidden fields optional during validation.

**Implementation:**
```typescript
// In zod-schema-builder.ts
const isVisible = data ? checkConditional(field, data) : true;
const effectiveRequired = field.required && isVisible;

if (effectiveRequired) {
  schema = schema.min(1, `${field.label} is required`);
} else {
  schema = schema.optional().or(z.literal(''));
}
```

**Why:** Prevents validation errors on required fields that are hidden by conditionals.

## Performance Optimization Points

### 1. Template Loading
- **Current:** Async fetch per step
- **Optimization:** Preload next step template in background

### 2. Schema Building
- **Current:** Rebuild on every validation
- **Optimization:** Cache schemas by `(formId, dataHash)`
- **Complexity:** Data hash expensive for large objects

### 3. Conditional Evaluation
- **Current:** Re-evaluate on every field render
- **Optimization:** Memoize `isFieldVisible` results
- **Implementation:** `useMemo(() => checkConditional(field, formData), [field, formData])`

### 4. Flow Filtering
- **Current:** Filter once at flow initialization
- **Already Optimized:** No per-step re-filtering

## Security Architecture

### 1. Expression Evaluation (Flow Engine)

**Threat Model:**
- User controls flow definitions (JSON files)
- Conditions may reference user-controlled data
- Must prevent code injection

**Mitigations:**
1. **Whitelist Validation:** Only alphanumeric + operators allowed
2. **No Function Calls:** Regex blocks `identifier(`
3. **No Assignment:** Blocks `=` except in comparisons
4. **No Semicolons:** Prevents statement injection
5. **Sandboxed Execution:** `new Function()` with explicit parameters
6. **Null Default:** Missing vars default to `null` (no ReferenceError tricks)

**File:** `lib/flow-engine/evaluator.ts` (lines 100-129)

### 2. Input Validation (Zod)

**Threat Model:**
- User submits arbitrary form data
- Must validate types and ranges

**Mitigations:**
1. **Type Coercion Prevention:** Zod enforces strict types
2. **Pattern Validation:** Regex patterns on string inputs
3. **Range Validation:** Min/max on numeric fields
4. **Array Validation:** Min items for multi-select
5. **Table Validation:** Record schema with type checking

**File:** `lib/validation/zod-schema-builder.ts`

### 3. API Security

**Current State:**
- No authentication (TODO: Add user auth)
- MongoDB connection via environment variables
- Claude API key in server-side env only

**Future Enhancements:**
1. Add JWT authentication
2. Rate limiting on API endpoints
3. Input sanitization for MongoDB queries
4. CORS configuration

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Production Build                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Static Pages │  │ API Routes   │  │ Static Assets│      │
│  │ (SSG)        │  │ (Serverless) │  │ (CDN)        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ MongoDB      │  │ Claude API   │  │ Vercel/AWS   │      │
│  │ Atlas        │  │ (Anthropic)  │  │ (Hosting)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

**Environment Variables:**
```
MONGODB_URI=mongodb+srv://...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_API_URL=https://...
```

## Testing Architecture

### 1. Unit Tests (Proposed)
- `zod-schema-builder.test.ts` - Validation logic
- `evaluator.test.ts` - Expression evaluation
- `executor.test.ts` - Flow state management

### 2. Integration Tests (Proposed)
- `form-submission.test.ts` - End-to-end form flow
- `conditional-rendering.test.ts` - Field visibility

### 3. Validation Scripts (Existing)
- `check-duplicates.js` - Duplicate field detection
- `verify-radio-numeric.js` - Type checking
- `validate-flow-link.ts` - Flow step validation
- `analyze-conditionals.js` - Dependency mapping

## Future Architecture Enhancements

### 1. Versioning System
```
FormSpec {
  formId: string;
  version: string;  // NEW: "1.0.0"
  deprecated?: boolean;
  supersededBy?: string;  // FormId of newer version
}
```

### 2. Audit Log
```
AuditLog {
  _id: ObjectId;
  userId: string;
  action: "create" | "update" | "delete" | "view";
  entity: "form" | "submission" | "project";
  entityId: string;
  changes: Record<string, { old: any; new: any }>;
  timestamp: Date;
}
```

### 3. Server-Side Validation
```
POST /api/validate-form
Body: { formId, data }
Response: { success: boolean; errors?: Record<string, string> }

// Enables complex validation (DB lookups, external APIs)
```

### 4. Real-Time Collaboration
```
WebSocket /api/session/{sessionId}
Events:
  - user_joined
  - form_updated
  - step_completed
  - user_left

// Multiple users can collaborate on same quote
```

---

**Maintainer Notes:**
- FlowExecutor is single source of truth for accumulated state
- Always merge state before validation for cross-form conditionals
- Hidden conditional fields are optional (not validated)
- Expression evaluator uses whitelist-only validation
- MongoDB saves are graceful (failures don't block flow)
