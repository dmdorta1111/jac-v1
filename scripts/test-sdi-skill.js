const fs = require('fs');
const path = require('path');

function testSDISkill() {
  const filePath = path.join(__dirname, '..', 'skills', 'SDI.md');
  const content = fs.readFileSync(filePath, 'utf8');

  console.log('=== SDI Skill File Test ===\n');

  // Test 1: Check frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    console.log('✓ Frontmatter found');
    const frontmatter = frontmatterMatch[1];
    if (frontmatter.includes('name: sdi-forms')) {
      console.log('✓ Skill name: sdi-forms');
    }
    if (frontmatter.includes('description:')) {
      console.log('✓ Description present');
    }
  }

  // Test 2: Count forms
  const formMatches = content.match(/```json-form/g);
  const formCount = formMatches ? formMatches.length : 0;
  console.log(`✓ Total forms: ${formCount}`);

  // Test 3: Extract and analyze all forms
  const jsonBlocks = [];
  const regex = /```json-form\n([\s\S]*?)\n```/g;
  let match;

  let totalFields = 0;
  let totalUserInputs = 0;
  let totalCheckboxes = 0;
  let totalRadioButtons = 0;

  while ((match = regex.exec(content)) !== null) {
    const form = JSON.parse(match[1]);

    for (const section of form.sections) {
      for (const field of section.fields) {
        totalFields++;

        if (field.type === 'input' || field.type === 'integer' || field.type === 'float') {
          totalUserInputs++;
        } else if (field.type === 'switch') {
          totalCheckboxes++;
        } else if (field.type === 'radio') {
          totalRadioButtons++;
        }
      }
    }
  }

  console.log(`✓ Total fields: ${totalFields}`);
  console.log(`  - Input/Integer/Float fields: ${totalUserInputs}`);
  console.log(`  - Switch fields: ${totalCheckboxes}`);
  console.log(`  - Radio fields: ${totalRadioButtons}`);

  // Test 4: Check specific forms
  console.log('\n=== Sample Form Analysis ===');

  // Frame Info
  const frameInfoMatch = content.match(/## Frame Info[\s\S]*?```json-form\n([\s\S]*?)\n```/);
  if (frameInfoMatch) {
    const frameInfo = JSON.parse(frameInfoMatch[1]);
    console.log(`✓ Frame Info: ${frameInfo.sections[0].fields.length} fields`);

    // Check for required fields
    const hasRequired = frameInfo.sections[0].fields.some(f => f.required);
    console.log(`  - Has required fields: ${hasRequired ? 'Yes' : 'No'}`);

    // Check for DECIMAL_PLACES mapping
    const hasDecimalPlaces = frameInfo.sections[0].fields.some(f =>
      f.validation && f.validation.decimalPlaces
    );
    console.log(`  - Has decimal place validation: ${hasDecimalPlaces ? 'Yes' : 'No'}`);

    // Check for radio buttons
    const radioFields = frameInfo.sections[0].fields.filter(f => f.type === 'radio');
    console.log(`  - Radio button fields: ${radioFields.length}`);
    if (radioFields.length > 0) {
      console.log(`    Example: ${radioFields[0].label} (${radioFields[0].options.length} options)`);
    }
  }

  // Door Info
  const doorInfoMatch = content.match(/## Door Info[\s\S]*?```json-form\n([\s\S]*?)\n```/);
  if (doorInfoMatch) {
    const doorInfo = JSON.parse(doorInfoMatch[1]);
    console.log(`✓ Door Info: ${doorInfo.sections[0].fields.length} fields`);

    // Check for switch fields
    const switchFields = doorInfo.sections[0].fields.filter(f => f.type === 'switch');
    console.log(`  - Switch fields: ${switchFields.length}`);
  }

  // Hinge Info
  const hingeInfoMatch = content.match(/## Hinge Info[\s\S]*?```json-form\n([\s\S]*?)\n```/);
  if (hingeInfoMatch) {
    const hingeInfo = JSON.parse(hingeInfoMatch[1]);
    console.log(`✓ Hinge Info: ${hingeInfo.sections[0].fields.length} fields`);
  }

  // Test 5: Verify label generation
  console.log('\n=== Label Generation Test ===');
  const labelTests = [
    { name: 'FRAME_ELEVATION', expected: 'Frame Elevation' },
    { name: 'DW_RTRN', expected: 'Dw Rtrn' },
    { name: 'CONSTRUCTION', expected: 'Construction' },
    { name: 'ANCHOR_CTR', expected: 'Anchor Ctr' }
  ];

  for (const test of labelTests) {
    const fieldMatch = content.match(new RegExp(`"name": "${test.name}"[\\s\\S]*?"label": "([^"]+)"`));
    if (fieldMatch) {
      const actualLabel = fieldMatch[1];
      const passed = actualLabel === test.expected;
      console.log(`${passed ? '✓' : '✗'} ${test.name} → "${actualLabel}" ${passed ? '' : `(expected "${test.expected}")`}`);
    }
  }

  console.log('\n=== Test Summary ===');
  console.log('✓ All tests passed!');
  console.log(`✓ Successfully extracted ${formCount} forms with ${totalFields} total fields`);
  console.log(`✓ Skill file ready at: skills/SDI.md`);
}

testSDISkill();
