# Phase 01: API Endpoint Creation

## Context

- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** None
- **Reference:** `app/api/generate-project-doc/route.ts` (similar pattern)

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-11-27 |
| Description | Create API endpoint to handle project folder creation |
| Priority | High (blocks Phase 02) |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights

- Existing API at `generate-project-doc` uses `fs/promises` and `path` - follow same pattern
- Folder structure exists: `project-docs/SDI/`, `project-docs/EMJAC/`, `project-docs/HARMONIC/`
- Need case-insensitive mapping: "Harmonic" button → "HARMONIC" folder

## Requirements

1. POST endpoint accepts `productType` and `salesOrderNumber`
2. Validate inputs (non-empty, sanitized)
3. Map product type to correct folder path
4. Create main folder + 2 subfolders
5. Handle existing folder error
6. Return success/error JSON response

## Architecture

```typescript
// Request body
{
  productType: "SDI" | "EMJAC" | "Harmonic",
  salesOrderNumber: string
}

// Response (success)
{
  success: true,
  path: "/project-docs/SDI/12345",
  folderName: "12345"
}

// Response (error)
{
  success: false,
  error: "Folder already exists" | "Invalid input" | ...
}
```

## Related Code Files

| File | Purpose |
|------|---------|
| `app/api/generate-project-doc/route.ts` | Reference pattern |
| `app/api/create-project-folder/route.ts` | **NEW - to create** |

## Implementation Steps

### Step 1: Create route file
Create `app/api/create-project-folder/route.ts`

### Step 2: Implement POST handler
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Product type to folder mapping
const PRODUCT_FOLDERS: Record<string, string> = {
  'SDI': 'SDI',
  'EMJAC': 'EMJAC',
  'Harmonic': 'HARMONIC',
};

export async function POST(request: NextRequest) {
  try {
    const { productType, salesOrderNumber } = await request.json();

    // Validate inputs
    if (!productType || !salesOrderNumber) {
      return NextResponse.json(
        { success: false, error: 'Product type and sales order number required' },
        { status: 400 }
      );
    }

    // Validate product type
    const folderName = PRODUCT_FOLDERS[productType];
    if (!folderName) {
      return NextResponse.json(
        { success: false, error: 'Invalid product type' },
        { status: 400 }
      );
    }

    // Sanitize sales order number
    const sanitizedSO = salesOrderNumber.replace(/[^a-zA-Z0-9-_]/g, '_');

    // Build paths
    const projectDocsDir = join(process.cwd(), 'project-docs');
    const productDir = join(projectDocsDir, folderName);
    const orderDir = join(productDir, sanitizedSO);
    const customerDrawingsDir = join(orderDir, 'Customer Drawings');
    const proeModelsDir = join(orderDir, 'ProE Models');

    // Check if folder exists
    if (existsSync(orderDir)) {
      return NextResponse.json(
        { success: false, error: 'Project folder already exists' },
        { status: 409 }
      );
    }

    // Create folders
    await mkdir(orderDir, { recursive: true });
    await mkdir(customerDrawingsDir, { recursive: true });
    await mkdir(proeModelsDir, { recursive: true });

    return NextResponse.json({
      success: true,
      path: `project-docs/${folderName}/${sanitizedSO}`,
      folderName: sanitizedSO,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating project folder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project folder' },
      { status: 500 }
    );
  }
}
```

## Todo List

- [ ] Create `app/api/create-project-folder/route.ts`
- [ ] Implement POST handler with validation
- [ ] Add product type mapping
- [ ] Create folder structure logic
- [ ] Handle duplicate folder error
- [ ] Test endpoint manually

## Success Criteria

- [ ] POST `/api/create-project-folder` returns 201 on success
- [ ] Creates `project-docs/{PRODUCT}/{SO#}/` folder
- [ ] Creates `Customer Drawings` subfolder
- [ ] Creates `ProE Models` subfolder
- [ ] Returns 409 if folder exists
- [ ] Returns 400 for invalid inputs

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Path traversal | Low | High | Sanitize input, use path.join |
| Folder permissions | Low | Medium | recursive: true handles parent dirs |

## Security Considerations

- Input sanitization prevents path traversal
- No user-controlled paths in fs operations
- Validate product type against whitelist

## Next Steps

After completion, proceed to [Phase 02: UI Components](./phase-02-ui-components.md)
