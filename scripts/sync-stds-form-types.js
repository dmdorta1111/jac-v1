/**
 * Script to synchronize stds-form.json field types with matching fields in other form templates.
 *
 * This script:
 * 1. Reads all form templates from public/form-templates/
 * 2. Builds a map of field name -> field definition (type, options)
 * 3. Updates stds-form.json fields to match types/options from other forms
 * 4. Keeps the defaultValue from stds-form.json
 *
 * Run with: node scripts/sync-stds-form-types.js
 */

const fs = require('fs');
const path = require('path');

const FORM_TEMPLATES_DIR = path.join(__dirname, '..', 'public', 'form-templates');
const STDS_FORM_PATH = path.join(FORM_TEMPLATES_DIR, 'stds-form.json');

// Load all form templates
function loadAllFormTemplates() {
  const files = fs.readdirSync(FORM_TEMPLATES_DIR).filter(f => f.endsWith('.json') && f !== 'stds-form.json' && f !== 'manifest.json');
  const forms = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(FORM_TEMPLATES_DIR, file), 'utf-8');
      const form = JSON.parse(content);
      forms.push({ filename: file, form });
    } catch (e) {
      console.error(`Error loading ${file}:`, e.message);
    }
  }

  return forms;
}

// Build a map of field name -> field definition from all forms
function buildFieldMap(forms) {
  const fieldMap = new Map();

  for (const { filename, form } of forms) {
    if (!form.sections) continue;

    for (const section of form.sections) {
      if (!section.fields) continue;

      for (const field of section.fields) {
        if (!field.name) continue;

        // Store the field definition (prefer fields with options/more complete definitions)
        const existing = fieldMap.get(field.name);

        // Prioritize fields with options, then by completeness
        const shouldReplace = !existing ||
          (field.options && !existing.options) ||
          (field.type === 'select' && existing.type !== 'select');

        if (shouldReplace) {
          fieldMap.set(field.name, {
            type: field.type,
            inputType: field.inputType,
            options: field.options,
            placeholder: field.placeholder,
            helperText: field.helperText,
            source: filename
          });
        }
      }
    }
  }

  return fieldMap;
}

// Update stds-form.json fields with matched types/options
function updateStdsForm(stdsForm, fieldMap) {
  let updateCount = 0;
  const updates = [];

  for (const section of stdsForm.sections) {
    for (const field of section.fields) {
      const match = fieldMap.get(field.name);

      if (match) {
        const originalType = field.type;
        const originalOptions = field.options;
        let changed = false;

        // Update type if different
        if (match.type && match.type !== field.type) {
          field.type = match.type;
          changed = true;
        }

        // Update inputType for input fields
        if (match.inputType && match.type === 'input') {
          field.inputType = match.inputType;
        }

        // Update options if the matched field has them and current field doesn't
        if (match.options && !field.options) {
          field.options = match.options;
          changed = true;
        }

        // Remove inputType for non-input types
        if (field.type !== 'input' && field.inputType) {
          delete field.inputType;
          changed = true;
        }

        // Update placeholder for float/integer types
        if (field.type === 'float' && field.placeholder !== '0.00000') {
          field.placeholder = '0.00000';
        } else if (field.type === 'integer' && field.placeholder !== '0') {
          field.placeholder = '0';
        }

        // Handle switch type - ensure proper structure
        if (field.type === 'switch') {
          delete field.placeholder;
          delete field.inputType;
          if (!field.helperText) {
            field.helperText = 'Toggle to enable';
          }
          // Convert numeric defaultValue to boolean for switch
          if (typeof field.defaultValue === 'number') {
            field.defaultValue = field.defaultValue === 1 || field.defaultValue === true;
          }
          changed = true;
        }

        // Handle select type - ensure options are present
        if (field.type === 'select' && match.options) {
          field.options = match.options;
          delete field.placeholder;
          delete field.inputType;
          changed = true;
        }

        if (changed) {
          updateCount++;
          updates.push({
            name: field.name,
            from: originalType,
            to: field.type,
            options: match.options ? match.options.length : 0,
            source: match.source
          });
        }
      }
    }
  }

  return { stdsForm, updateCount, updates };
}

// Main execution
function main() {
  console.log('Loading stds-form.json...');
  const stdsFormContent = fs.readFileSync(STDS_FORM_PATH, 'utf-8');
  const stdsForm = JSON.parse(stdsFormContent);

  console.log('Loading all form templates...');
  const forms = loadAllFormTemplates();
  console.log(`Loaded ${forms.length} form templates`);

  console.log('Building field map...');
  const fieldMap = buildFieldMap(forms);
  console.log(`Found ${fieldMap.size} unique field names across all forms`);

  console.log('Updating stds-form.json...');
  const { stdsForm: updatedForm, updateCount, updates } = updateStdsForm(stdsForm, fieldMap);

  console.log(`\nUpdated ${updateCount} fields:`);
  for (const u of updates) {
    console.log(`  - ${u.name}: ${u.from} -> ${u.to}${u.options > 0 ? ` (${u.options} options)` : ''} [from ${u.source}]`);
  }

  // Write updated form
  const outputPath = STDS_FORM_PATH;
  fs.writeFileSync(outputPath, JSON.stringify(updatedForm, null, 2));
  console.log(`\nWrote updated stds-form.json to ${outputPath}`);
}

main();
