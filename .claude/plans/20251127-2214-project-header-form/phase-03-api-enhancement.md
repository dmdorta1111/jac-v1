# Phase 03: API Enhancement for Project Header Storage

**Plan:** [20251127-2214-project-header-form](./plan.md) | **Phase:** 03/04
**Status:** Pending | **Priority:** High | **Date:** 2025-11-27

## Context

**Parent Plan:** [plan.md](./plan.md)
**Dependencies:** [Phase 02 - Chat Integration](./phase-02-chat-form-integration.md)
**Next Phase:** [Phase 04 - Header Update](./phase-04-header-update.md)

## Overview

Modify `/api/generate-project-doc` to accept targetFolder parameter and save project-header.md to project root (`project-docs/{PRODUCT}/{SO_NUM}/`) instead of top-level project-docs folder. Support both legacy quote action and new project_header action.

## Key Insights from Research

**Current API behavior (lines 56-59):**
- Saves to `project-docs/{projectId}_{action}_{timestamp}.md`
- Uses Claude to generate markdown from form data
- No folder path parameter support

**Required changes:**
- Accept targetFolder in request body
- Save to `{targetFolder}/project-header.md` for project_header action
- Maintain backward compatibility for quote action

## Requirements

### Functional
1. Accept `targetFolder` parameter in POST body
2. Save project-header.md to project root (not project-docs/)
3. Support both `quote` and `project_header` actions
4. Generate structured markdown from form data
5. Return file path relative to project root

### Non-Functional
- Backward compatible with existing quote generation
- Validate folder path to prevent directory traversal
- Handle missing folder gracefully (return 400)
- File write time: <500ms

## Architecture

### API Flow (Enhanced)
```
[POST /api/generate-project-doc]
   ↓
[Parse: projectData, action, targetFolder]
   ↓
[Validate: targetFolder exists, no path traversal]
   ↓
[Generate markdown via Claude OR use template]
   ↓
[Determine save path based on action]
   ├─ quote → project-docs/{projectId}_quote_{date}.md
   └─ project_header → {targetFolder}/project-header.md
   ↓
[Write file to disk]
   ↓
[Return: success, filename, path]
```

### File Structure
```
project-docs/
├── SDI/
│   └── SO-12345/                    ← targetFolder
│       ├── project-header.md        ← NEW: Saved here
│       ├── Customer Drawings/
│       └── ProE Models/
├── EMJAC/
│   └── SO-67890/
│       └── project-header.md
└── PRJ-{timestamp}_quote_2025-11-27.md  ← Legacy quote location
```

## Related Code Files

**Files to modify:**
- `app/api/generate-project-doc/route.ts` (entire file)

**Files to reference:**
- `app/api/create-project-folder/route.ts` (lines 38-40 for folder structure)

## Implementation Steps

### Step 1: Update Request Interface
**File:** `app/api/generate-project-doc/route.ts`

Add after line 10:
```typescript
interface GenerateDocRequest {
  projectData: Record<string, any>;
  action: 'initial_quote' | 'project_header' | 'quote';
  targetFolder?: string; // NEW: Optional project folder path
}
```

### Step 2: Add Path Validation Utility
**File:** `app/api/generate-project-doc/route.ts`

Add after imports:
```typescript
import { existsSync } from 'fs';

/**
 * Validate folder path to prevent directory traversal attacks
 * @param folderPath - Relative path from project root
 * @returns Absolute path if valid, null if invalid
 */
function validateFolderPath(folderPath: string): string | null {
  // Prevent directory traversal
  if (folderPath.includes('..') || folderPath.startsWith('/')) {
    return null;
  }

  const absolutePath = path.join(process.cwd(), folderPath);

  // Ensure path is within project directory
  if (!absolutePath.startsWith(process.cwd())) {
    return null;
  }

  // Check folder exists
  if (!existsSync(absolutePath)) {
    return null;
  }

  return absolutePath;
}
```

### Step 3: Update POST Handler
**File:** `app/api/generate-project-doc/route.ts` (lines 10-88)

Replace entire POST function:
```typescript
export async function POST(request: NextRequest) {
  try {
    const body: GenerateDocRequest = await request.json();
    const { projectData, action, targetFolder } = body;

    // Validate required fields
    if (!projectData) {
      return NextResponse.json(
        { error: 'Missing required project data' },
        { status: 400 }
      );
    }

    const actionType = action || 'initial_quote';

    // Determine save location based on action
    let outputPath: string;
    let filename: string;

    if (actionType === 'project_header' && targetFolder) {
      // Validate and resolve target folder
      const validatedPath = validateFolderPath(targetFolder);

      if (!validatedPath) {
        return NextResponse.json(
          { error: 'Invalid or non-existent target folder', details: targetFolder },
          { status: 400 }
        );
      }

      // Save to project root as project-header.md
      filename = 'project-header.md';
      outputPath = path.join(validatedPath, filename);

    } else {
      // Legacy behavior: Save to top-level project-docs
      const projectDocsDir = path.join(process.cwd(), 'project-docs');
      await mkdir(projectDocsDir, { recursive: true });

      const timestamp = new Date().toISOString().split('T')[0];
      const projectId = projectData.projectId || `PRJ-${Date.now()}`;
      filename = `${projectId}_${actionType}_${timestamp}.md`;
      outputPath = path.join(projectDocsDir, filename);
    }

    // Generate markdown content
    let markdownContent: string;

    if (actionType === 'project_header') {
      // Use structured template for project header
      markdownContent = generateProjectHeaderMarkdown(projectData);
    } else {
      // Use Claude AI for quote generation
      const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: `Generate a professional project documentation markdown file for a custom fabrication quote. Create a well-structured document with the following information:

Project Specifications: ${JSON.stringify(projectData, null, 2)}

Create a professional markdown document with:
1. **Project Overview** - Summary of the item being quoted
2. **Specifications Summary** - Key dimensions, materials, and options selected
3. **Features & Options** - List of selected features and configurations
4. **Project Details** - Quantity, timeline, installation requirements
5. **Additional Notes** - Any special requirements noted
6. **Quote Information** - Project ID and timestamp

Format it as a clean, professional quote document suitable for a fabrication company.`
        }]
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      markdownContent = content.text;
    }

    // Write file to disk
    await writeFile(outputPath, markdownContent, 'utf-8');

    // Return success with relative path
    const relativePath = path.relative(process.cwd(), outputPath);

    return NextResponse.json({
      success: true,
      filename,
      path: relativePath,
      content: markdownContent.split('\n').slice(0, 10).join('\n') + '\n\n...(see full document)',
      message: 'Project documentation generated successfully',
    });

  } catch (error) {
    console.error('Error generating project documentation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate project documentation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

### Step 4: Create Structured Markdown Generator
**File:** `app/api/generate-project-doc/route.ts`

Add before POST handler:
```typescript
/**
 * Generate structured project header markdown from form data
 */
function generateProjectHeaderMarkdown(data: Record<string, any>): string {
  const timestamp = new Date().toISOString();

  return `# Project Header

**Generated:** ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

---

## Project Information

- **Sales Order Number:** ${data.SO_NUM || 'N/A'}
- **Job Name:** ${data.JOB_NAME || 'N/A'}
- **Sub Job Name:** ${data.SUB_JOB_NAME || 'N/A'}
- **Customer Name:** ${data.CUSTOMER_NAME || 'N/A'}

---

## Project Details

**Product Type:** ${data.productType || 'N/A'}
**Created:** ${timestamp}

---

## Notes

This project header was generated from the initial project creation form.
Update this file as project requirements evolve.
`;
}
```

### Step 5: Update Import Statements
**File:** `app/api/generate-project-doc/route.ts` (line 2)

Update imports:
```typescript
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs'; // ADD this
import { join as pathJoin } from 'path';
```

Use `pathJoin` instead of `path.join` to avoid conflict if needed, or rename:
```typescript
import path from 'path';
```

### Step 6: Test API with cURL
```bash
# Test project_header action with targetFolder
curl -X POST http://localhost:3000/api/generate-project-doc \
  -H "Content-Type: application/json" \
  -d '{
    "projectData": {
      "SO_NUM": "SO-12345",
      "JOB_NAME": "Test Kitchen",
      "SUB_JOB_NAME": "Phase 1",
      "CUSTOMER_NAME": "Acme Corp",
      "productType": "SDI"
    },
    "action": "project_header",
    "targetFolder": "project-docs/SDI/SO-12345"
  }'

# Expected response:
# {
#   "success": true,
#   "filename": "project-header.md",
#   "path": "project-docs/SDI/SO-12345/project-header.md",
#   "content": "# Project Header\n\n**Generated:** ...",
#   "message": "Project documentation generated successfully"
# }
```

### Step 7: Verify File Created
Check that `project-docs/SDI/SO-12345/project-header.md` exists with correct content.

## Todo List

- [ ] Add `GenerateDocRequest` interface with targetFolder
- [ ] Create `validateFolderPath` security function
- [ ] Import `existsSync` from fs
- [ ] Update POST handler to accept targetFolder parameter
- [ ] Add conditional logic for save path (project_header vs quote)
- [ ] Create `generateProjectHeaderMarkdown` template function
- [ ] Test with valid targetFolder (should succeed)
- [ ] Test with invalid targetFolder (should return 400)
- [ ] Test with path traversal attempt `../../../etc/passwd` (should reject)
- [ ] Test legacy quote generation (should still work)
- [ ] Verify file saved to correct location
- [ ] Update error messages to be descriptive

## Success Criteria

- [ ] API accepts targetFolder parameter without breaking existing quotes
- [ ] project-header.md saved to `{targetFolder}/project-header.md`
- [ ] Path traversal attempts rejected with 400 error
- [ ] Non-existent folder returns 400 with clear error message
- [ ] Legacy quote action still works without targetFolder
- [ ] Markdown content includes SO_NUM, JOB_NAME, CUSTOMER_NAME
- [ ] Response includes relative path to created file

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Directory traversal attack | Critical | Validate path with explicit checks, reject `..` |
| Folder doesn't exist | Medium | Check with existsSync before write |
| Overwrite existing header | Low | Accept as intended behavior (update header) |
| Race condition (parallel writes) | Low | File system handles atomically |

## Security Considerations

1. **Path Traversal Prevention:**
   - Reject paths containing `..`
   - Reject absolute paths starting with `/`
   - Validate resolved path within project directory
   - Check folder exists before write

2. **Input Validation:**
   - Sanitize projectData field values (already handled by DynamicFormRenderer)
   - Limit markdown content size to prevent disk exhaustion
   - Validate action parameter is allowlist value

3. **Error Disclosure:**
   - Don't expose full filesystem paths in errors
   - Use generic error messages for security failures
   - Log detailed errors server-side only

4. **File Permissions:**
   - Ensure written files have correct permissions (default 0644)
   - Don't allow executable bit on markdown files

## Next Steps

After completion, proceed to [Phase 04 - Header Update](./phase-04-header-update.md) to display project metadata (SO_NUM, JOB_NAME, CUSTOMER_NAME) in the header component.
