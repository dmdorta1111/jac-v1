const fs = require('fs');
const path = require('path');

function analyzeConditionals() {
  const filePath = path.join(__dirname, '..', 'skills', 'SDI.md');
  const content = fs.readFileSync(filePath, 'utf8');

  console.log('=== Conditional Logic Analysis ===\n');

  const regex = /```json-form\n([\s\S]*?)\n```/g;
  let match;

  let totalFields = 0;
  let fieldsWithConditionals = 0;
  let andConditions = 0;
  let orConditions = 0;
  let singleConditions = 0;
  let multiConditions = 0;

  const exampleConditionals = [];

  while ((match = regex.exec(content)) !== null) {
    const form = JSON.parse(match[1]);

    for (const section of form.sections) {
      for (const field of section.fields) {
        totalFields++;

        if (field.conditional) {
          fieldsWithConditionals++;
          const { conditions, logic } = field.conditional;

          if (logic === 'AND') andConditions++;
          if (logic === 'OR') orConditions++;

          if (conditions.length === 1) singleConditions++;
          if (conditions.length > 1) multiConditions++;

          // Collect examples
          if (exampleConditionals.length < 5) {
            exampleConditionals.push({
              form: form.formId,
              field: field.label,
              conditions: conditions.length,
              logic,
              example: field.conditional
            });
          }
        }
      }
    }
  }

  console.log(`Total fields: ${totalFields}`);
  console.log(`Fields with conditionals: ${fieldsWithConditionals} (${((fieldsWithConditionals/totalFields)*100).toFixed(1)}%)`);
  console.log(`Fields without conditionals: ${totalFields - fieldsWithConditionals} (${(((totalFields - fieldsWithConditionals)/totalFields)*100).toFixed(1)}%)`);
  console.log();
  console.log(`Conditional breakdown:`);
  console.log(`  - AND logic: ${andConditions}`);
  console.log(`  - OR logic: ${orConditions}`);
  console.log(`  - Single condition: ${singleConditions}`);
  console.log(`  - Multiple conditions: ${multiConditions}`);

  console.log('\n=== Example Conditionals ===\n');
  exampleConditionals.forEach((ex, i) => {
    console.log(`${i + 1}. ${ex.form} - "${ex.field}"`);
    console.log(`   Logic: ${ex.logic}`);
    console.log(`   Conditions: ${ex.conditions}`);
    console.log(`   ${JSON.stringify(ex.example, null, 2).split('\n').map(l => '   ' + l).join('\n')}`);
    console.log();
  });

  console.log('✓ Analysis complete!');
}

analyzeConditionals();
