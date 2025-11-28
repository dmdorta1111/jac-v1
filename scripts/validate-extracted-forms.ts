import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface FormSpec {
  formId: string;
  itemType: string;
  title: string;
  description: string;
  sections: Array<{
    id?: string;
    title?: string;
    fields: Array<Record<string, unknown>>;
  }>;
  submitButton: {
    text: string;
    action: string;
  };
}

function validateJSON(filePath: string): { valid: boolean; error?: string } {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content) as FormSpec;

    if (!parsed.formId) return { valid: false, error: 'Missing formId' };
    if (!parsed.itemType) return { valid: false, error: 'Missing itemType' };
    if (!parsed.title) return { valid: false, error: 'Missing title' };
    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      return { valid: false, error: 'Invalid sections' };
    }
    if (!parsed.submitButton) return { valid: false, error: 'Missing submitButton' };

    return { valid: true };
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// Main validation
const templatesDir = join(process.cwd(), 'public', 'form-templates');
const files = readdirSync(templatesDir)
  .filter(f => f.endsWith('.json'))
  .filter(f => f !== 'manifest.json'); // Skip manifest file

console.log('Validating extracted form templates...\n');
console.log('='.repeat(70));

const formIds = new Map<string, string>();
const validationResults: { file: string; valid: boolean; error?: string; formId?: string }[] = [];

for (const file of files) {
  const filePath = join(templatesDir, file);
  const result = validateJSON(filePath);

  if (result.valid) {
    // Extract formId to check for duplicates
    const content = JSON.parse(readFileSync(filePath, 'utf-8')) as FormSpec;
    const { formId } = content;

    if (formIds.has(formId)) {
      console.log(`✗ ${file.padEnd(30)} - Duplicate formId: ${formId} (also in ${formIds.get(formId)})`);
      validationResults.push({ file, valid: false, error: `Duplicate formId: ${formId}`, formId });
    } else {
      formIds.set(formId, file);
      console.log(`✓ ${file.padEnd(30)} - formId: ${formId}`);
      validationResults.push({ file, valid: true, formId });
    }
  } else {
    console.log(`✗ ${file.padEnd(30)} - ${result.error}`);
    validationResults.push({ file, valid: false, error: result.error });
  }
}

console.log('='.repeat(70));

const valid = validationResults.filter(r => r.valid);
const invalid = validationResults.filter(r => !r.valid);

console.log('\nVALIDATION SUMMARY');
console.log('='.repeat(70));
console.log(`Total files: ${files.length}`);
console.log(`✓ Valid: ${valid.length}`);
console.log(`✗ Invalid: ${invalid.length}`);
console.log(`Unique formIds: ${formIds.size}`);

if (invalid.length > 0) {
  console.log('\nInvalid files:');
  invalid.forEach(r => {
    console.log(`  - ${r.file}: ${r.error}`);
  });
  process.exit(1);
}

// Test sample forms
console.log('\n' + '='.repeat(70));
console.log('TESTING SAMPLE FORMS');
console.log('='.repeat(70));

const sampleForms = ['anchors', 'door-info', 'closers'];
for (const formId of sampleForms) {
  const fileName = `${formId}.json`;
  const filePath = join(templatesDir, fileName);

  try {
    const content = readFileSync(filePath, 'utf-8');
    const spec = JSON.parse(content) as FormSpec;

    console.log(`\n✓ ${formId}`);
    console.log(`  Title: ${spec.title}`);
    console.log(`  Sections: ${spec.sections.length}`);
    console.log(`  Total fields: ${spec.sections.reduce((sum, s) => sum + s.fields.length, 0)}`);
    console.log(`  Submit: ${spec.submitButton.text} → ${spec.submitButton.action}`);
  } catch (err) {
    console.log(`\n✗ ${formId}: ${err}`);
    process.exit(1);
  }
}

console.log('\n✓ All validations passed!');
