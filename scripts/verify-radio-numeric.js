const fs = require('fs');
const path = require('path');

function verifyRadioNumericValues() {
  const filePath = path.join(__dirname, '..', 'skills', 'SDI.md');
  const content = fs.readFileSync(filePath, 'utf8');

  console.log('=== Radio Button Value Verification ===\n');

  const jsonBlocks = [];
  const regex = /```json-form\n([\s\S]*?)\n```/g;
  let match;
  let totalRadioFields = 0;
  let numericValueCount = 0;
  let stringValueCount = 0;

  while ((match = regex.exec(content)) !== null) {
    const form = JSON.parse(match[1]);

    for (const section of form.sections) {
      for (const field of section.fields) {
        if (field.type === 'radio') {
          totalRadioFields++;

          for (const option of field.options) {
            if (typeof option.value === 'number') {
              numericValueCount++;
            } else if (typeof option.value === 'string') {
              stringValueCount++;
              console.log(`⚠️  String value found: ${form.formId}.${field.id} - option "${option.label}" has value: "${option.value}"`);
            }
          }
        }
      }
    }
  }

  console.log(`\n=== Results ===`);
  console.log(`Total radio button fields: ${totalRadioFields}`);
  console.log(`Total radio options with numeric values: ${numericValueCount}`);
  console.log(`Total radio options with string values: ${stringValueCount}`);

  if (stringValueCount === 0) {
    console.log('\n✓ All radio button values are numeric!');
  } else {
    console.error(`\n✗ Found ${stringValueCount} string values (should be 0)`);
    process.exit(1);
  }

  // Sample verification
  console.log('\n=== Sample Radio Fields ===');

  const sampleMatches = content.match(/## Anchors[\s\S]*?```json-form\n([\s\S]*?)\n```/);
  if (sampleMatches) {
    const anchorForm = JSON.parse(sampleMatches[1]);
    const radioFields = anchorForm.sections[0].fields.filter(f => f.type === 'radio');

    if (radioFields.length > 0) {
      const sample = radioFields[0];
      console.log(`Form: ${anchorForm.formId}`);
      console.log(`Field: ${sample.label}`);
      console.log(`Options (first 3):`);
      sample.options.slice(0, 3).forEach(opt => {
        console.log(`  - value: ${opt.value} (${typeof opt.value}), label: "${opt.label}"`);
      });
    }
  }

  console.log('\n✓ Verification complete!');
}

verifyRadioNumericValues();
