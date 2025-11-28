# Phase 01: Template Infrastructure

**Plan:** [20251127-2214-project-header-form](./plan.md) | **Phase:** 01/04
**Status:** Pending | **Priority:** High | **Date:** 2025-11-27

## Context

**Parent Plan:** [plan.md](./plan.md)
**Dependencies:** None
**Next Phase:** [Phase 02 - Chat Integration](./phase-02-chat-form-integration.md)

## Overview

Create form template infrastructure with static JSON files, loader utilities, and build-time generation script. Enables reusable forms without Claude API calls for every project creation.

## Key Insights from Research

**From researcher-01:**
- Hybrid pattern balances speed (static imports) with scalability (runtime fetch)
- In-memory cache eliminates redundant fetches
- Manifest.json enables discovery without filesystem access
- Build script parses markdown → JSON at build time

**Current limitation:** Forms hardcoded in markdown, parsed at runtime every time

## Requirements

### Functional
1. Store form templates as static JSON files in `/public/form-templates/`
2. Convert `project-header.md` to `project-header.json`
3. Create loader utility with in-memory caching
4. Generate manifest.json for template discovery
5. Build script to automate markdown → JSON conversion

### Non-Functional
- Load time: <10ms for cached templates
- Bundle size: <1KB overhead for loader utility
- Zero network calls for static templates
- Type-safe template IDs

## Architecture

### Folder Structure
```
project-root/
├── public/
│   └── form-templates/              # NEW
│       ├── project-header.json      # Converted from MD
│       └── manifest.json            # Auto-generated index
├── lib/
│   └── form-templates/              # NEW
│       ├── types.ts                 # TypeScript definitions
│       ├── loader.ts                # Runtime loading + cache
│       └── static.ts                # Static imports
├── scripts/
│   └── build-form-templates.ts      # NEW - Build-time generation
└── folder-creation-data/
    └── project-header.md            # Source of truth
```

### Data Flow
```
[Markdown Source] → [Build Script] → [JSON File] → [Loader Utility] → [Cache] → [Component]
     (build time)                       (runtime)      (memory)
```

## Related Code Files

**New files to create:**
- `public/form-templates/` (folder)
- `lib/form-templates/types.ts`
- `lib/form-templates/loader.ts`
- `lib/form-templates/static.ts`
- `scripts/build-form-templates.ts`

**Files to reference:**
- `folder-creation-data/project-header.md` (lines 1-66)
- `components/DynamicFormRenderer.tsx` (lines 135-145 for type definitions)

## Implementation Steps

### Step 1: Create TypeScript Definitions
**File:** `lib/form-templates/types.ts`

```typescript
// Form field types (extracted from DynamicFormRenderer)
export type FieldType =
  | 'input' | 'textarea' | 'select' | 'checkbox'
  | 'radio' | 'slider' | 'date' | 'switch'
  | 'table' | 'integer' | 'float';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  inputType?: string;
  placeholder?: string;
  defaultValue?: string | number | boolean | string[] | Date;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  options?: Array<{ value: string; label: string }>;
  helperText?: string;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  columns?: Array<{ key: string; label: string }>;
  tableData?: Array<Record<string, string | number>>;
  editable?: boolean;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormSpec {
  formId: string;
  itemType: string;
  title: string;
  description: string;
  sections: FormSection[];
  submitButton: {
    text: string;
    action: string;
  };
}

export interface TemplateMetadata {
  lastModified: string;
  md5: string;
}

export type TemplateManifest = Record<string, TemplateMetadata>;
```

### Step 2: Create Static Imports (Core Templates)
**File:** `lib/form-templates/static.ts`

```typescript
import type { FormSpec } from './types';

// Static import for instant loading of core templates
// IMPORTANT: This file will be generated after build script runs
// For now, export empty object until project-header.json exists

export const STATIC_TEMPLATES: Record<string, FormSpec> = {};

// After build script runs, this will become:
// import projectHeaderSpec from '@/public/form-templates/project-header.json';
// export const STATIC_TEMPLATES = {
//   'project-header': projectHeaderSpec,
// } as const;

export type StaticTemplateId = keyof typeof STATIC_TEMPLATES;
```

### Step 3: Create Loader Utility with Cache
**File:** `lib/form-templates/loader.ts`

```typescript
import { STATIC_TEMPLATES } from './static';
import type { FormSpec, TemplateManifest } from './types';

// In-memory cache for runtime-loaded templates
const runtimeCache = new Map<string, FormSpec>();
let manifestCache: TemplateManifest | null = null;

/**
 * Load form template by ID (hybrid static + runtime)
 * @param templateId - Form template identifier (e.g., 'project-header')
 * @returns Form specification or null if not found
 */
export async function loadFormTemplate(templateId: string): Promise<FormSpec | null> {
  // Check static templates first (instant)
  if (templateId in STATIC_TEMPLATES) {
    return STATIC_TEMPLATES[templateId];
  }

  // Check runtime cache
  if (runtimeCache.has(templateId)) {
    return runtimeCache.get(templateId)!;
  }

  // Load from filesystem
  try {
    const response = await fetch(`/form-templates/${templateId}.json`);
    if (!response.ok) {
      console.warn(`Template not found: ${templateId}`);
      return null;
    }
    const spec: FormSpec = await response.json();

    // Validate structure
    if (!spec.formId || !spec.sections) {
      console.error(`Invalid template structure: ${templateId}`);
      return null;
    }

    runtimeCache.set(templateId, spec);
    return spec;
  } catch (error) {
    console.error(`Failed to load template ${templateId}:`, error);
    return null;
  }
}

/**
 * Load manifest file containing all available templates
 */
export async function loadManifest(): Promise<TemplateManifest> {
  if (manifestCache) return manifestCache;

  try {
    const response = await fetch('/form-templates/manifest.json');
    if (!response.ok) return {};
    manifestCache = await response.json();
    return manifestCache;
  } catch {
    return {};
  }
}

/**
 * Check if template exists without loading it
 */
export async function templateExists(templateId: string): Promise<boolean> {
  // Check static first
  if (templateId in STATIC_TEMPLATES) return true;

  // Check manifest
  const manifest = await loadManifest();
  return templateId in manifest;
}

/**
 * Get list of all available template IDs
 */
export async function getAllTemplateIds(): Promise<string[]> {
  const manifest = await loadManifest();
  const staticIds = Object.keys(STATIC_TEMPLATES);
  const runtimeIds = Object.keys(manifest);

  // Merge and deduplicate
  return Array.from(new Set([...staticIds, ...runtimeIds]));
}

/**
 * Clear runtime cache (useful for development/testing)
 */
export function clearTemplateCache(): void {
  runtimeCache.clear();
  manifestCache = null;
}
```

### Step 4: Create Build Script
**File:** `scripts/build-form-templates.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

interface TemplateMetadata {
  lastModified: string;
  md5: string;
}

async function buildFormTemplates() {
  console.log('🔨 Building form templates...\n');

  const sourceDir = path.join(process.cwd(), 'folder-creation-data');
  const outputDir = path.join(process.cwd(), 'public', 'form-templates');

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  const manifest: Record<string, TemplateMetadata> = {};
  let processedCount = 0;

  try {
    const files = await fs.readdir(sourceDir);

    for (const file of files) {
      if (!file.endsWith('.md')) continue;

      const sourcePath = path.join(sourceDir, file);
      const content = await fs.readFile(sourcePath, 'utf-8');

      // Extract JSON from ```json-form blocks
      const jsonMatch = content.match(/```json-form\s*\n([\s\S]*?)\n```/);

      if (!jsonMatch) {
        console.warn(`⚠️  No json-form block found in ${file}`);
        continue;
      }

      try {
        const formSpec = JSON.parse(jsonMatch[1]);
        const templateId = formSpec.formId || file.replace('.md', '');

        // Write JSON file
        const outputPath = path.join(outputDir, `${templateId}.json`);
        await fs.writeFile(outputPath, JSON.stringify(formSpec, null, 2));

        // Generate metadata
        const stats = await fs.stat(sourcePath);
        const md5 = crypto.createHash('md5').update(jsonMatch[1]).digest('hex');

        manifest[templateId] = {
          lastModified: stats.mtime.toISOString(),
          md5,
        };

        console.log(`✅ Generated ${templateId}.json`);
        processedCount++;
      } catch (parseError) {
        console.error(`❌ Failed to parse JSON in ${file}:`, parseError);
      }
    }

    // Write manifest
    const manifestPath = path.join(outputDir, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`\n📋 Manifest created with ${processedCount} templates`);

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildFormTemplates();
```

### Step 5: Update package.json Scripts
**File:** `package.json`

Add to scripts section:
```json
{
  "scripts": {
    "build:forms": "tsx scripts/build-form-templates.ts",
    "prebuild": "npm run build:forms",
    "dev": "npm run build:forms && next dev"
  }
}
```

### Step 6: Run Build Script
```bash
npm install -D tsx  # If not already installed
npm run build:forms
```

**Expected output:**
```
public/form-templates/
├── project-header.json
└── manifest.json
```

### Step 7: Verify Output
Check `public/form-templates/project-header.json` contains:
```json
{
  "formId": "project-header",
  "itemType": "Project Creation",
  "title": "Project Header",
  "description": "Project information to start a new job",
  "sections": [...],
  "submitButton": {...}
}
```

## Todo List

- [ ] Create `lib/form-templates/types.ts` with FormSpec definitions
- [ ] Create `lib/form-templates/static.ts` with static imports skeleton
- [ ] Create `lib/form-templates/loader.ts` with hybrid loader + cache
- [ ] Create `scripts/build-form-templates.ts` build script
- [ ] Install `tsx` package for TypeScript script execution
- [ ] Add `build:forms` script to package.json
- [ ] Run `npm run build:forms` to generate JSON files
- [ ] Verify `public/form-templates/project-header.json` exists
- [ ] Verify `public/form-templates/manifest.json` exists
- [ ] Update `lib/form-templates/static.ts` with actual import after generation
- [ ] Test `loadFormTemplate('project-header')` returns valid spec

## Success Criteria

- [ ] `public/form-templates/` folder exists with JSON files
- [ ] `loadFormTemplate('project-header')` returns FormSpec in <10ms
- [ ] `templateExists('project-header')` returns true
- [ ] `getAllTemplateIds()` includes 'project-header'
- [ ] Manifest contains MD5 hash and lastModified timestamp
- [ ] Build script runs without errors
- [ ] Type definitions match DynamicFormRenderer expectations

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| JSON parsing fails | High | Validate JSON schema in build script |
| MD5 hash mismatch after edit | Medium | Rebuild on markdown change |
| Cache stale after hot reload | Low | Clear cache in dev mode |
| Missing tsx dependency | Medium | Document in package.json devDependencies |

## Security Considerations

1. **Path traversal:** Sanitize templateId in loader (prevent `../../etc/passwd`)
2. **JSON injection:** Validate form spec structure before rendering
3. **XSS in form fields:** DynamicFormRenderer already escapes user input
4. **Manifest tampering:** Server-side validation for critical templates

## Next Steps

After completion, proceed to [Phase 02 - Chat Integration](./phase-02-chat-form-integration.md) to load static form in WelcomeScreen success flow.
