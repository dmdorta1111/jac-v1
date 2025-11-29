# JAC-V1 - Dynamic Form System

**Status:** Production
**Stack:** Next.js 15, React 19, TypeScript, MongoDB, Zod, Claude AI
**Purpose:** Multi-step form workflows with conditional validation for manufacturing projects

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Add: MONGODB_URI, ANTHROPIC_API_KEY

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Core Features

### 1. Dynamic Form Rendering
- 11 field types (input, integer, float, select, radio, checkbox, switch, slider, date, textarea, table)
- Conditional field visibility (field-level)
- Real-time validation feedback
- Type-safe value handling

### 2. Conditional Validation System
- Hidden fields are optional (not validated)
- Visible required fields enforced
- Cross-form conditionals (reference previous form data)
- Boolean/number normalization for switches

### 3. Flow State Management
- Multi-step workflows with dynamic stepper
- State accumulation across forms
- Step filtering based on conditions
- MongoDB persistence with graceful degradation

### 4. AI-Assisted Forms
- Claude API integration for guided data collection
- Conversational form flows
- Context-aware suggestions

## Project Structure

```
app/
├── api/                  # Backend endpoints (chat, form-submission, etc.)
├── page.tsx             # Landing page
├── quote/               # Quote generation workflow
└── test-table/          # Table component testing

components/
├── DynamicFormRenderer.tsx  # Core form engine
├── ClaudeChat.tsx           # Flow orchestration
├── ui/                      # shadcn/ui components
└── ai-elements/             # AI-specific UI

lib/
├── flow-engine/         # Workflow execution
│   ├── evaluator.ts     # Safe expression evaluation
│   ├── executor.ts      # State management
│   └── loader.ts        # Flow definition loading
├── form-templates/      # Form schema management
├── validation/
│   └── zod-schema-builder.ts  # Dynamic Zod schemas

public/
├── form-templates/      # JSON form definitions (50+ forms)
├── form-flows/          # Multi-step workflow configs
└── models/              # 3D models (GLTF)
```

## Key Patterns

### React Keys
Use stable composite keys to prevent warnings:
```typescript
key={`${formId}-section-${sectionIndex}`}
key={`${formId}-field-${field.id}`}
key={`${formId}-table-row-${rowIndex}`}
```

### Type-Safe Values
Always use helper functions:
```typescript
const value = toStringValue(formData[field.name]);
const number = toNumberValue(formData[field.name], 0);
const checked = toBooleanValue(formData[field.name]);
```

### Conditional Validation
Pass current data to schema builder:
```typescript
// ✅ Correct: Conditionals see field values
const schema = buildZodSchema(formSpec, mergedData);

// ❌ Wrong: Conditionals can't evaluate
const schema = buildZodSchema(formSpec);
```

### State Merging
Merge accumulated state before validation:
```typescript
const accumulatedState = flowExecutor.getState();
const mergedData = { ...accumulatedState, ...formData };
const result = validateFormData(formSpec, mergedData);
```

## Validation Flow

```
User submits form
    ↓
Load form template
    ↓
Merge accumulated state + current data
    ↓
Build Zod schema (conditional-aware)
    ↓
Validate form data
    ↓
If errors: Display inline → Stop
If success:
    ↓
Save to MongoDB (graceful if fails)
    ↓
Update FlowExecutor state
    ↓
Load next step
```

## Conditional System

### Field-Level (Within Form)
```json
{
  "name": "HINGE_TYPE",
  "conditional": {
    "conditions": [
      { "field": "USE_HINGE", "operator": "equals", "value": 1 }
    ],
    "logic": "AND"
  }
}
```

### Step-Level (Flow Filtering)
```json
{
  "order": 2,
  "formTemplate": "hinge-info",
  "condition": "SUB_TYPE == 1"
}
```

### Validation-Level (Zod Schema)
Hidden fields made optional automatically:
```typescript
const isVisible = checkConditional(field, data);
const effectiveRequired = field.required && isVisible;
```

## Scripts

```bash
# Build form templates from markdown
npm run build:forms

# Validate form definitions
npm run validate:forms

# Check for duplicate field names
node scripts/check-duplicates.js

# Analyze conditional dependencies
node scripts/analyze-conditionals.js

# Verify radio/select option types
node scripts/verify-radio-numeric.js
```

## Environment Variables

```bash
# Required
MONGODB_URI=mongodb+srv://...
ANTHROPIC_API_KEY=sk-ant-...

# Optional
NEXT_PUBLIC_API_URL=https://...
```

## Development Rules

1. **Always** use composite React keys with `formId` prefix
2. **Always** merge state before validation (cross-form conditionals)
3. **Always** use type-safe value helpers (no direct casts)
4. **Never** use `eval()` - use `safeEval()` from flow-engine
5. **Never** commit without running validation scripts

## Testing

```bash
# Run validation scripts before commit
npm run validate:forms
node scripts/check-duplicates.js
node scripts/verify-radio-numeric.js

# Future: Unit tests
npm test
```

## Recent Changes

### 2025-11-29
1. **React Key Fixes**
   - Prefixed all keys with `formId` for uniqueness
   - Table rows use stable `rowIndex` keys
   - Removed duplicate wrapper divs

2. **Conditional Validation**
   - Hidden fields made optional automatically
   - Boolean/number normalization for switch fields
   - Cross-form data merging for conditionals

3. **Type System**
   - Added `ConditionalOperator`, `FieldCondition`, `FieldConditional` types
   - `FormField.conditional` property added

4. **Flow State**
   - State merging before validation
   - Enables field references across forms

## Documentation

See `./docs/` for detailed technical documentation:
- `codebase-summary.md` - Architecture overview
- `code-standards.md` - Development patterns
- `system-architecture.md` - Data flow diagrams

## Deployment

```bash
# Build production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod
```

## Security

1. **Expression Evaluation:** Whitelist-only syntax (no function calls, no `eval()`)
2. **Input Validation:** Zod enforces strict types and ranges
3. **API Security:** Server-side env vars, no client exposure

## Known Limitations

1. No backtracking (flow progresses forward only)
2. No async validation rules (client-side Zod only)
3. Single-select tables (no multi-row selection)
4. Max conditional depth: 1 (no nested conditionals)

## License

Proprietary

## Support

Contact: [Internal team]

---

**Tech Stack Details:**
- Next.js 15.0.3 (App Router)
- React 19.0.0
- TypeScript 5.x
- Zod 3.24.1 (validation)
- MongoDB 6.12.0
- Anthropic Claude API 0.33.1
- Three.js + React Three Fiber (3D rendering)
- TailwindCSS + shadcn/ui
