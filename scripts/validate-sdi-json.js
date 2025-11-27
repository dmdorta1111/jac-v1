const fs = require('fs');
const path = require('path');

function validateSDIMarkdown() {
  const filePath = path.join(__dirname, '..', 'skills', 'SDI.md');
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract all JSON blocks
  const jsonBlocks = [];
  const regex = /```json-form\n([\s\S]*?)\n```/g;
  let match;
  let blockNum = 0;
  const globalFieldIds = new Set();
  const globalSectionIds = new Set();

  while ((match = regex.exec(content)) !== null) {
    blockNum++;
    const jsonText = match[1];

    try {
      const parsed = JSON.parse(jsonText);

      // Validate structure
      if (!parsed.formId) throw new Error('Missing formId');
      if (!parsed.sections) throw new Error('Missing sections');
      if (!Array.isArray(parsed.sections)) throw new Error('sections must be array');

      // Validate fields
      let fieldCount = 0;
      const fieldIds = new Set();

      for (const section of parsed.sections) {
        if (!section.fields || !Array.isArray(section.fields)) {
          throw new Error(`Section ${section.id} missing fields array`);
        }

        // Check for global section ID uniqueness
        if (globalSectionIds.has(section.id)) {
          throw new Error(`Duplicate section ID across forms: ${section.id}`);
        }
        globalSectionIds.add(section.id);

        for (const field of section.fields) {
          fieldCount++;

          // Check for duplicate IDs within form
          if (fieldIds.has(field.id)) {
            throw new Error(`Duplicate field ID within form: ${field.id}`);
          }
          fieldIds.add(field.id);

          // Check for global field ID uniqueness
          if (globalFieldIds.has(field.id)) {
            throw new Error(`Duplicate field ID across forms: ${field.id}`);
          }
          globalFieldIds.add(field.id);

          // Validate required properties
          if (!field.id) throw new Error('Field missing id');
          if (!field.name) throw new Error('Field missing name');
          if (!field.type) throw new Error('Field missing type');

          // Type-specific validation
          if (field.type === 'radio' && (!field.options || field.options.length === 0)) {
            throw new Error(`Radio field ${field.id} missing options`);
          }
        }
      }

      jsonBlocks.push({
        blockNum,
        formId: parsed.formId,
        fieldCount,
        valid: true
      });

      console.log(`✓ Block ${blockNum}: ${parsed.formId} (${fieldCount} fields)`);

    } catch (error) {
      console.error(`✗ Block ${blockNum}: JSON parse error - ${error.message}`);
      jsonBlocks.push({
        blockNum,
        error: error.message,
        valid: false
      });
    }
  }

  console.log(`\n=== Validation Summary ===`);
  console.log(`Total blocks: ${jsonBlocks.length}`);
  console.log(`Valid blocks: ${jsonBlocks.filter(b => b.valid).length}`);
  console.log(`Invalid blocks: ${jsonBlocks.filter(b => !b.valid).length}`);
  console.log(`Total fields: ${jsonBlocks.reduce((sum, b) => sum + (b.fieldCount || 0), 0)}`);
  console.log(`Unique field IDs: ${globalFieldIds.size}`);
  console.log(`Unique section IDs: ${globalSectionIds.size}`);

  if (jsonBlocks.some(b => !b.valid)) {
    console.error('\n⚠️  Validation failed!');
    process.exit(1);
  } else {
    console.log('\n✓ All JSON blocks valid!');
    console.log('✓ All field IDs unique across forms!');
    console.log('✓ All section IDs unique across forms!');
  }
}

validateSDIMarkdown();
