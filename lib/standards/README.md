# Standards Service

Project standards autofill system for JAC-V1.

## Overview

Manages project standards by:
- Extracting defaults from `stds-form.json`
- Loading project-specific values from API
- Merging and applying to form templates

## Usage

### Basic Usage

```typescript
import {
  getStandardsDefaults,
  loadProjectStandards,
  getMergedStandards,
  applyStandardsToForm,
} from '@/lib/standards';

// Get defaults from stds-form.json
const defaults = await getStandardsDefaults();

// Load project-specific standards
const projectStandards = await loadProjectStandards('project-docs/SDI/12345');

// Get merged (project overrides defaults)
const merged = await getMergedStandards('project-docs/SDI/12345');
```

### Apply to Form Templates

```typescript
import { loadFormTemplate } from '@/lib/form-templates/loader';
import { applyStandardsToForm, getMergedStandards } from '@/lib/standards';

// Manual approach
const formSpec = await loadFormTemplate('door-info');
const standards = await getMergedStandards(projectPath);
const prefilled = applyStandardsToForm(formSpec, standards);

// Or use convenience function
import { loadFormTemplateWithStandards } from '@/lib/form-templates/loader';
const prefilled = await loadFormTemplateWithStandards('door-info', standards);
```

### Get Full State

```typescript
import { getStandardsState } from '@/lib/standards';

const state = await getStandardsState('project-docs/SDI/12345');
// Returns:
// {
//   defaults: { HINGE_GAP: 0.125, ... },  // From stds-form
//   project: { HINGE_GAP: 0.25, ... },     // User saved
//   merged: { HINGE_GAP: 0.25, ... }       // Combined
// }
```

## API Integration

Uses `/api/project-standards` endpoint:

**GET** - Load standards
```
GET /api/project-standards?projectPath=project-docs/SDI/12345
```

**POST** - Save standards
```json
POST /api/project-standards
{
  "projectPath": "project-docs/SDI/12345",
  "standards": { "HINGE_GAP": 0.25, ... }
}
```

## Architecture

### Files
- `types.ts` - TypeScript interfaces
- `defaults.ts` - Extract from stds-form.json
- `service.ts` - Core functions (load, merge, apply)
- `index.ts` - Public exports

### Caching
- stds-form defaults cached in memory after first load
- No caching for project-specific standards (always fresh)

### Error Handling
- Graceful degradation (returns empty object on errors)
- Project standards 404 = empty object (not an error)
- Falls back to defaults if merge fails

## Type Definitions

```typescript
interface ProjectStandards {
  [fieldName: string]: unknown;
}

interface StandardsState {
  defaults: ProjectStandards;  // From stds-form.json
  project: ProjectStandards;   // User-saved values
  merged: ProjectStandards;    // Combined (project overrides defaults)
}
```

## Testing

Clear cache during development:
```typescript
import { clearDefaultsCache } from '@/lib/standards/defaults';
clearDefaultsCache();
```
