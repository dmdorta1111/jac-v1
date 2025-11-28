# Form Template Reusability Patterns Research
**Date:** 2025-11-27 | **Project:** JAC-V1

## Executive Summary
Investigated reusable form template patterns for Next.js/React apps. Current implementation uses markdown files with embedded `json-form` code blocks. Identified three viable patterns with tradeoffs between simplicity, build-time optimization, and runtime flexibility.

## Current Implementation Analysis

**Location:** `/folder-creation-data/project-header.md`
- Form specs embedded in markdown as JSON (between `json-form` code blocks)
- Parsed dynamically at runtime via `DynamicFormRenderer.tsx`
- Single form entry point per markdown file
- No caching mechanism

**Renderer:** `DynamicFormRenderer.tsx`
- Client-side component (`use client`)
- Renders 12+ field types (input, select, textarea, date, table, etc.)
- Handles form state and validation
- No form spec caching currently

## Recommended Pattern: Hybrid Static/Runtime Approach

### Folder Structure
```
project-root/
├── public/
│   └── form-templates/          # Built at compile time
│       ├── project-header.json
│       ├── furniture-quote.json
│       └── manifest.json        # Index of all templates
├── src/
│   ├── lib/
│   │   ├── form-templates/
│   │   │   ├── templates.ts     # Static imports + type defs
│   │   │   ├── loader.ts        # Runtime loading logic
│   │   │   └── cache.ts         # Memory cache wrapper
│   │   └── form-utils.ts        # Shared form utilities
│   ├── components/
│   │   ├── DynamicFormRenderer.tsx
│   │   └── FormTemplateLoader.tsx (new)
│   └── folder-creation-data/    # Source markdown files
│       ├── project-header.md
│       └── furniture-quote.md
```

### Pattern 1: Static Import (Best for Small Count)
**Use case:** ≤5 templates, rarely changing

```typescript
// lib/form-templates/templates.ts
import projectHeaderSpec from '@/public/form-templates/project-header.json';
import furnitureQuoteSpec from '@/public/form-templates/furniture-quote.json';

export const FORM_TEMPLATES = {
  'project-header': projectHeaderSpec,
  'furniture-quote': furnitureQuoteSpec,
} as const;

export type FormTemplateId = keyof typeof FORM_TEMPLATES;
```

**Advantages:**
- Type-safe template IDs at compile time
- Bundled directly into app
- Zero runtime overhead

**Disadvantages:**
- Not scalable for many templates
- Requires rebuild for new templates

### Pattern 2: Runtime File System Load (Best for Dynamic)
**Use case:** Unlimited templates, discovered at build-time

```typescript
// lib/form-templates/loader.ts
export async function loadFormTemplate(templateId: string) {
  const response = await fetch(`/form-templates/${templateId}.json`);
  if (!response.ok) return null;
  return response.json();
}

// With caching
const templateCache = new Map<string, any>();

export async function loadFormTemplateWithCache(templateId: string) {
  if (templateCache.has(templateId)) {
    return templateCache.get(templateId);
  }
  const spec = await loadFormTemplate(templateId);
  if (spec) templateCache.set(templateId, spec);
  return spec;
}
```

**Advantages:**
- Scalable to hundreds of templates
- No rebuild for new templates
- Enables lazy loading of heavy specs

**Disadvantages:**
- Runtime HTTP fetch (minor cost)
- No compile-time safety

### Pattern 3: Hybrid (Recommended)
**Use case:** Production apps needing both speed + scalability

```typescript
// lib/form-templates/cache.ts
import type { FormSpec } from './types';

// Static imports for core templates
import projectHeaderSpec from '@/public/form-templates/project-header.json';

const STATIC_TEMPLATES: Record<string, FormSpec> = {
  'project-header': projectHeaderSpec,
};

const runtimeCache = new Map<string, FormSpec>();

export async function getFormTemplate(templateId: string): Promise<FormSpec | null> {
  // Check static templates first
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
    if (!response.ok) return null;
    const spec = await response.json();
    runtimeCache.set(templateId, spec);
    return spec;
  } catch {
    return null;
  }
}

// Check if template exists without fetching
export async function templateExists(templateId: string): Promise<boolean> {
  if (templateId in STATIC_TEMPLATES) return true;

  // Quick HEAD check for existence
  try {
    const response = await fetch(`/form-templates/${templateId}.json`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
```

## Build-Time Generation Strategy

**Recommended:** Script to parse markdown form specs and generate JSON at build time

```typescript
// scripts/build-form-templates.ts
import fs from 'fs/promises';
import path from 'path';

async function buildFormTemplates() {
  const sourceDir = 'src/folder-creation-data';
  const outputDir = 'public/form-templates';

  // Create manifest for discovery
  const manifest: Record<string, { lastModified: string; md5: string }> = {};

  for (const file of await fs.readdir(sourceDir)) {
    if (!file.endsWith('.md')) continue;

    const content = await fs.readFile(path.join(sourceDir, file), 'utf-8');
    const jsonMatch = content.match(/```json-form\n([\s\S]*?)\n```/);

    if (!jsonMatch) {
      console.warn(`No json-form block found in ${file}`);
      continue;
    }

    const formSpec = JSON.parse(jsonMatch[1]);
    const templateId = formSpec.formId || file.replace('.md', '');

    // Write JSON file
    await fs.writeFile(
      path.join(outputDir, `${templateId}.json`),
      JSON.stringify(formSpec, null, 2)
    );

    // Track for manifest
    const stats = await fs.stat(path.join(sourceDir, file));
    manifest[templateId] = {
      lastModified: stats.mtime.toISOString(),
      md5: require('crypto').createHash('md5').update(jsonMatch[1]).digest('hex'),
    };
  }

  // Write manifest for discovery
  await fs.writeFile(
    path.join(outputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
}

buildFormTemplates();
```

## Caching Strategy

### Client-Side (React)
```typescript
// In DynamicFormRenderer or FormTemplateLoader
const [template, setTemplate] = useState<FormSpec | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadFormTemplateWithCache(templateId).then(spec => {
    setTemplate(spec);
    setLoading(false);
  });
}, [templateId]);
```

### Server-Side (Next.js)
- Use SWR fetch caching (`revalidate` option)
- Cache in `/public` static files (best for build-time specs)
- Use `next/cache` for runtime revalidation

```typescript
// app/api/forms/[templateId]/route.ts
export async function GET(request: Request, props: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await props.params;
  const response = await fetch(`file://${process.cwd()}/public/form-templates/${templateId}.json`);

  // Cache for 1 hour
  return new Response(response.body, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'Content-Type': 'application/json',
    },
  });
}
```

## Checking for Existing Forms

**Pattern: Manifest-based detection**

```typescript
// lib/form-templates/discovery.ts
export async function loadManifest(): Promise<Record<string, TemplateMetadata>> {
  const response = await fetch('/form-templates/manifest.json');
  if (!response.ok) return {};
  return response.json();
}

export async function formExists(templateId: string): Promise<boolean> {
  const manifest = await loadManifest();
  return templateId in manifest;
}

export async function getAllFormIds(): Promise<string[]> {
  const manifest = await loadManifest();
  return Object.keys(manifest);
}
```

**Alternative: Content-hash based deduplication**
- Store MD5 of form JSON in manifest
- Skip regeneration if hash unchanged
- Enables efficient rebuilds

## Performance Considerations

| Pattern | Bundle Size | Load Time | Runtime Lookup |
|---------|------------|-----------|-----------------|
| Static Import | +10KB per spec | 0ms | O(1) object lookup |
| Runtime Load | +1KB | 10-50ms network | O(1) after cache |
| Hybrid | +10KB core + cache | 0ms core, 10ms others | O(1) both |

**Recommendation:** Hybrid pattern balances fast core templates with scalability.

## Next.js App Router Specific

```typescript
// app/forms/[templateId]/page.tsx
import { getFormTemplate, templateExists } from '@/lib/form-templates';
import { DynamicFormRenderer } from '@/components';

export async function generateStaticParams() {
  // Pre-render all known forms at build time
  const manifest = await loadManifest();
  return Object.keys(manifest).map(id => ({ templateId: id }));
}

export default async function FormPage(props: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await props.params;
  const template = await getFormTemplate(templateId);

  if (!template) {
    return <div>Form not found</div>;
  }

  return <DynamicFormRenderer spec={template} />;
}
```

## Unresolved Questions

1. **Form versioning**: Should templates support semantic versioning for breaking changes?
2. **Localization**: Multi-language form specs - single file with i18n or separate files per locale?
3. **Form schema validation**: Use Zod/Yup for runtime spec validation before rendering?
4. **Update frequency**: Should manifest refresh be automatic or manual rebuild only?
