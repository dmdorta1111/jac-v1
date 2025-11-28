import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface FormSpec {
  formId: string;
  itemType: string;
  title: string;
  description: string;
  sections: Array<{
    id?: string;
    title?: string;
    description?: string;
    fields: Array<Record<string, unknown>>;
  }>;
  submitButton: {
    text: string;
    action: string;
  };
}

interface ExtractionResult {
  formId: string;
  title: string;
  source: string;
  mdPath: string;
  jsonPath: string;
  success: boolean;
  error?: string;
}

// Convert H2 title to kebab-case filename
function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-'); // Collapse multiple hyphens
}

// Validate FormSpec structure
function validateFormSpec(obj: unknown, title: string): obj is FormSpec {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Not an object');
  }

  const spec = obj as Partial<FormSpec>;

  if (!spec.formId) throw new Error('Missing formId');
  if (!spec.itemType) throw new Error('Missing itemType');
  if (!spec.title) throw new Error('Missing title');
  if (!spec.sections || !Array.isArray(spec.sections)) throw new Error('Missing or invalid sections');
  if (!spec.submitButton) throw new Error('Missing submitButton');

  return true;
}

// Extract form from section text
function extractForm(sectionText: string, title: string, source: string): { form: FormSpec; description: string } | null {
  // Find ```json-form block (account for possible \r\n line endings)
  const jsonFormMatch = sectionText.match(/```json-form\s*\r?\n([\s\S]*?)\r?\n```/);
  if (!jsonFormMatch) {
    return null;
  }

  // Extract description (text between source line and json block)
  const descMatch = sectionText.match(/\*\*Source:\*\*[^\n]*\r?\n\r?\n([^\n]*)/);
  const description = descMatch ? descMatch[1].trim() : '';

  try {
    const jsonText = jsonFormMatch[1];
    const parsed = JSON.parse(jsonText);

    if (validateFormSpec(parsed, title)) {
      return { form: parsed, description };
    }
    return null;
  } catch (err) {
    console.error(`Failed to parse JSON for "${title}":`, err);
    return null;
  }
}

// Main extraction function
function extractSDIForms(): ExtractionResult[] {
  const sdiPath = join(process.cwd(), 'form-creation-data', 'SDI.md');
  const content = readFileSync(sdiPath, 'utf-8');

  // Split by H2 headers - use regex that captures the full header
  const sections: string[] = [];
  const matches = content.matchAll(/^## (.+)$/gm);

  let lastIndex = 0;
  let lastTitle = '';

  for (const match of matches) {
    if (lastIndex > 0) {
      // Add previous section
      sections.push(lastTitle + '\n' + content.substring(lastIndex, match.index));
    }
    lastTitle = match[1];
    lastIndex = match.index! + match[0].length;
  }

  // Add last section
  if (lastIndex > 0) {
    sections.push(lastTitle + '\n' + content.substring(lastIndex));
  }

  // Skip header sections (Usage, etc.) - start from "Anchors"
  const formSections = sections.filter(s => {
    const title = s.split('\n')[0].trim();
    return title !== 'Usage' && title !== 'Summary' && s.includes('```json-form');
  });

  const results: ExtractionResult[] = [];
  const formIds = new Set<string>();

  // Ensure output directories exist
  const formDataDir = join(process.cwd(), 'form-creation-data');
  const templatesDir = join(process.cwd(), 'public', 'form-templates');

  if (!existsSync(templatesDir)) {
    mkdirSync(templatesDir, { recursive: true });
  }

  for (const section of formSections) {
    // Extract title from first line
    const lines = section.split('\n');
    const title = lines[0].trim();

    if (!title) continue;

    // Extract source file
    const sourceMatch = section.match(/\*\*Source:\*\*\s*`([^`]+)`/);
    const source = sourceMatch ? sourceMatch[1] : 'Unknown';

    const result: ExtractionResult = {
      formId: '',
      title,
      source,
      mdPath: '',
      jsonPath: '',
      success: false,
    };

    try {
      // Extract form data
      const extracted = extractForm(section, title, source);

      if (!extracted) {
        result.error = 'No json-form block found or invalid structure';
        results.push(result);
        continue;
      }

      const { form, description } = extracted;
      result.formId = form.formId;

      // Check for duplicate formId
      if (formIds.has(form.formId)) {
        result.error = `Duplicate formId: ${form.formId}`;
        results.push(result);
        continue;
      }
      formIds.add(form.formId);

      // Generate filenames
      const kebabName = toKebabCase(title);
      const mdFilename = `${kebabName}.md`;
      const jsonFilename = `${kebabName}.json`;

      result.mdPath = join(formDataDir, mdFilename);
      result.jsonPath = join(templatesDir, jsonFilename);

      // Write markdown file
      const mdContent = `---
formId: ${form.formId}
source: ${source}
---
# ${title}

${description}

\`\`\`json-form
${JSON.stringify(form, null, 2)}
\`\`\`
`;

      writeFileSync(result.mdPath, mdContent, 'utf-8');

      // Write JSON file
      writeFileSync(result.jsonPath, JSON.stringify(form, null, 2), 'utf-8');

      result.success = true;
      results.push(result);

      console.log(`✓ Extracted: ${title} → ${kebabName}.{md,json}`);

    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err);
      results.push(result);
      console.error(`✗ Failed: ${title} - ${result.error}`);
    }
  }

  return results;
}

// Execute extraction
console.log('Starting SDI form extraction...\n');

const results = extractSDIForms();

const successful = results.filter(r => r.success);
const failed = results.filter(r => !r.success);

console.log('\n' + '='.repeat(60));
console.log('EXTRACTION SUMMARY');
console.log('='.repeat(60));
console.log(`Total sections processed: ${results.length}`);
console.log(`✓ Successful: ${successful.length}`);
console.log(`✗ Failed: ${failed.length}`);

if (failed.length > 0) {
  console.log('\nFailed extractions:');
  failed.forEach(f => {
    console.log(`  - ${f.title}: ${f.error}`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('Extracted form IDs:');
console.log('='.repeat(60));
successful.forEach(r => {
  console.log(`  ${r.formId.padEnd(30)} (${r.title})`);
});

console.log(`\n✓ Created ${successful.length} markdown files in form-creation-data/`);
console.log(`✓ Created ${successful.length} JSON files in public/form-templates/`);

// Exit with error code if any failed
process.exit(failed.length > 0 ? 1 : 0);
