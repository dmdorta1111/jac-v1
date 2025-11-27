const fs = require('fs');
const path = require('path');

// Helper: Generate human-readable label from UPPERCASE_SNAKE_CASE
function generateLabel(varName) {
  return varName
    .replace(/_+$/, '') // Remove trailing underscores
    .replace(/_/g, ' ') // Underscores to spaces
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper: Generate kebab-case ID from variable name
function generateId(varName, prefix = '') {
  const base = varName
    .replace(/_+$/, '')
    .replace(/_/g, '-')
    .toLowerCase();
  return prefix ? `${prefix}-${base}` : base;
}

// Helper: Parse radio button options from quoted strings
function parseRadioOptions(optionsText) {
  const optionRegex = /"([^"]+)"/g;
  const options = [];
  let match;
  let index = 0;

  while ((match = optionRegex.exec(optionsText)) !== null) {
    const label = match[1];
    options.push({
      value: index,
      label: label
    });
    index++;
  }

  return options;
}

// Parse conditions from IF statements
function parseCondition(conditionText) {
  // Parse single condition like "SECTION == 1" or "FRAME_ELEVATION > 30"
  const condRegex = /(\w+)\s*(==|<>|>|<|>=|<=)\s*(\d+|"[^"]*")/;
  const match = conditionText.match(condRegex);

  if (!match) return null;

  const [, field, op, val] = match;
  let value = val.replace(/"/g, ''); // Remove quotes from strings

  // Convert to number if it's numeric
  if (/^\d+$/.test(value)) {
    value = parseInt(value);
  }

  const operatorMap = {
    '==': 'equals',
    '<>': 'notEquals',
    '>': 'greaterThan',
    '<': 'lessThan',
    '>=': 'greaterThanOrEqual',
    '<=': 'lessThanOrEqual'
  };

  return {
    field,
    operator: operatorMap[op] || 'equals',
    value
  };
}

// Parse complex IF conditions with AND/OR logic
function parseIfCondition(guiBlock, componentStart) {
  // Look backwards from component to find IF statement
  const beforeComponent = guiBlock.substring(0, componentStart);
  const lines = beforeComponent.split('\n').reverse();

  let depth = 0;
  let ifLine = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('END_IF')) depth++;
    if (trimmed.startsWith('IF ') && depth === 0) {
      ifLine = trimmed;
      break;
    }
    if (trimmed.startsWith('IF ') && depth > 0) depth--;
  }

  if (!ifLine) return null;

  // Extract condition from "IF condition"
  const condText = ifLine.substring(3).trim();

  // Check for OR logic
  if (condText.includes(' OR ')) {
    const parts = condText.split(' OR ');
    const conditions = parts.map(p => parseCondition(p.trim())).filter(Boolean);

    if (conditions.length > 0) {
      return { conditions, logic: 'OR' };
    }
  }

  // Check for AND logic
  if (condText.includes(' AND ')) {
    const parts = condText.split(' AND ');
    const conditions = parts.map(p => parseCondition(p.trim())).filter(Boolean);

    if (conditions.length > 0) {
      return { conditions, logic: 'AND' };
    }
  }

  // Single condition
  const condition = parseCondition(condText);
  if (condition) {
    return { conditions: [condition], logic: 'AND' };
  }

  return null;
}

// Parse USER_INPUT_PARAM components with conditions
function parseUserInputParams(guiBlock) {
  const regex = /USER_INPUT_PARAM\s+(INTEGER|DOUBLE|STRING)\s+(\w+)(\s+REQUIRED)?(?:\s+DECIMAL_PLACES\s+(\d+))?(?:\s+(\d+))?/g;
  const components = [];
  let match;

  while ((match = regex.exec(guiBlock)) !== null) {
    const [, type, name, required, decimalPlaces, numArg] = match;

    const component = {
      id: generateId(name),
      name: name,
      label: generateLabel(name),
      required: !!required
    };

    // Map types
    if (type === 'INTEGER') {
      component.type = 'integer';
      component.placeholder = '0';
    } else if (type === 'DOUBLE') {
      component.type = 'float';
      component.placeholder = '0.00';

      if (decimalPlaces) {
        component.validation = {
          decimalPlaces: parseInt(decimalPlaces)
        };
        component.helperText = `Precision: ${decimalPlaces} decimal places`;
      }
    } else if (type === 'STRING') {
      component.type = 'input';
      component.inputType = 'text';
      component.placeholder = '';
    }

    // Parse conditional logic
    const conditional = parseIfCondition(guiBlock, match.index);
    if (conditional) {
      component.conditional = conditional;
    }

    components.push(component);
  }

  return components;
}

// Parse CHECKBOX_PARAM components with conditions
function parseCheckboxParams(guiBlock) {
  const regex = /CHECKBOX_PARAM\s+INTEGER\s+(\w+)\s+"([^"]+)"/g;
  const components = [];
  let match;

  while ((match = regex.exec(guiBlock)) !== null) {
    const [, name, label] = match;

    const component = {
      id: generateId(name),
      name: name,
      label: generateLabel(name),
      type: 'switch',
      defaultValue: false,
      helperText: label === 'YES/NO' || label === '(YES/NO)' ? 'Toggle to enable' : undefined
    };

    // Parse conditional logic
    const conditional = parseIfCondition(guiBlock, match.index);
    if (conditional) {
      component.conditional = conditional;
    }

    components.push(component);
  }

  return components;
}

// Parse RADIOBUTTON_PARAM components with conditions
function parseRadioButtonParams(guiBlock) {
  // Handle multi-line radio buttons with backslash continuation
  const normalizedBlock = guiBlock.replace(/\\\s*\n\s*/g, ' ');

  const regex = /RADIOBUTTON_PARAM\s+INTEGER\s+(\w+)\s+((?:"[^"]+"\s*)+)/g;
  const components = [];
  let match;

  while ((match = regex.exec(normalizedBlock)) !== null) {
    const [, name, optionsText] = match;
    const options = parseRadioOptions(optionsText);

    if (options.length > 0) {
      const component = {
        id: generateId(name),
        name: name,
        label: generateLabel(name),
        type: 'radio',
        required: false,
        options: options
      };

      // Parse conditional logic
      const conditional = parseIfCondition(guiBlock, match.index);
      if (conditional) {
        component.conditional = conditional;
      }

      components.push(component);
    }
  }

  return components;
}

// Extract GUI block from file content
function extractGuiBlock(content) {
  const regex = /BEGIN_GUI_DESCR\s+([\s\S]*?)\s+END_GUI_DESCR/m;
  const match = content.match(regex);
  return match ? match[1] : null;
}

// Process a single .tab file
function processTabFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const guiBlock = extractGuiBlock(content);

    if (!guiBlock) {
      return null;
    }

    const userInputs = parseUserInputParams(guiBlock);
    const checkboxes = parseCheckboxParams(guiBlock);
    const radioButtons = parseRadioButtonParams(guiBlock);

    const allFields = [...userInputs, ...checkboxes, ...radioButtons];

    if (allFields.length === 0) {
      return null;
    }

    const filename = path.basename(filePath, '.tab');
    const formId = filename.replace(/_/g, '-');
    const title = generateLabel(filename);

    // Prefix all IDs with formId to ensure global uniqueness
    const idCounts = {};
    for (const field of allFields) {
      const baseId = `${formId}-${field.id}`;
      if (idCounts[baseId]) {
        idCounts[baseId]++;
        field.id = `${baseId}-${idCounts[baseId]}`;
      } else {
        idCounts[baseId] = 1;
        field.id = baseId;
      }
    }

    return {
      filename,
      formId,
      title,
      fields: allFields
    };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return null;
  }
}

// Generate JSON form object
function generateFormObject(fileData) {
  return {
    formId: fileData.formId,
    itemType: 'custom',
    title: fileData.title,
    description: `Configuration parameters for ${fileData.title.toLowerCase()}`,
    sections: [
      {
        id: `${fileData.formId}-configuration`,
        title: 'Configuration',
        fields: fileData.fields
      }
    ],
    submitButton: {
      text: 'Save Configuration',
      action: 'save-config'
    }
  };
}

// Main execution
function main() {
  const sdiDir = path.join(__dirname, '..', 'SDI');
  const outputPath = path.join(__dirname, '..', 'skills', 'SDI.md');

  console.log('Scanning SDI directory:', sdiDir);

  // Get all .tab files
  const tabFiles = fs.readdirSync(sdiDir)
    .filter(file => file.endsWith('.tab'))
    .map(file => path.join(sdiDir, file));

  console.log(`Found ${tabFiles.length} .tab files`);

  // Process all files
  const processedFiles = [];
  let skippedCount = 0;

  for (const filePath of tabFiles) {
    const result = processTabFile(filePath);
    if (result) {
      processedFiles.push(result);
      console.log(`✓ Processed: ${result.filename} (${result.fields.length} fields)`);
    } else {
      skippedCount++;
    }
  }

  console.log(`\nProcessed: ${processedFiles.length} files`);
  console.log(`Skipped: ${skippedCount} files (no GUI blocks or fields)`);

  // Generate output markdown
  let output = `---
name: sdi-forms
description: SmartAssembly SDI GUI component form specifications extracted from ${processedFiles.length} .tab files
---

# SDI Form Specifications

This skill contains dynamically generated form specifications extracted from SmartAssembly .tab files in the SDI folder.

## Usage

When a user requests SDI configuration forms, Claude can reference these specifications to generate interactive forms using the dynamic-form-builder pattern.

---

`;

  // Add each form
  for (const fileData of processedFiles) {
    const formObject = generateFormObject(fileData);

    output += `## ${fileData.title}\n\n`;
    output += `**Source:** \`SDI/${fileData.filename}.tab\`\n\n`;
    output += `Form specification with ${fileData.fields.length} configuration fields.\n\n`;
    output += '```json-form\n';
    output += JSON.stringify(formObject, null, 2);
    output += '\n```\n\n';
    output += '---\n\n';
  }

  // Add footer
  output += `## Summary\n\n`;
  output += `- **Total Forms:** ${processedFiles.length}\n`;
  output += `- **Total Fields:** ${processedFiles.reduce((sum, f) => sum + f.fields.length, 0)}\n`;
  output += `- **Generated:** ${new Date().toISOString()}\n`;

  // Write output
  fs.writeFileSync(outputPath, output, 'utf8');
  console.log(`\n✓ Generated: ${outputPath}`);
  console.log(`✓ Total forms: ${processedFiles.length}`);
  console.log(`✓ Total fields: ${processedFiles.reduce((sum, f) => sum + f.fields.length, 0)}`);
}

// Run
main();
