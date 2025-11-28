import * as fs from 'fs';
import * as path from 'path';

/**
 * Link SDI Form Flow to extracted form templates
 *
 * This script transforms the SmartAssembly flow (.tab file references)
 * into a client-side form flow with template references.
 *
 * Transformations:
 * - Map .tab files to form template keys (kebab-case)
 * - Add formTemplate field for data-collection steps
 * - Add formType field ("data-collection" | "action")
 * - Rename passedVariables → contextVariables
 * - Preserve condition objects intact
 * - Add flow metadata
 */

interface FlowStep {
  order: number;
  lineNumber: number;
  command?: string;
  file?: string;
  condition?: any;
  description: string;
  purpose: string;
  passedVariables?: string[];
  formTemplate?: string;
  formType?: 'data-collection' | 'action';
  contextVariables?: string[];
}

interface FlowMetadata {
  source: string;
  description: string;
  entryPoint: string;
  location: string;
  extractedDate: string;
  entryForm?: string;
  completionCriteria?: {
    requiredSteps: string[];
    outputFormat: string;
  };
}

interface FormFlow {
  metadata: FlowMetadata;
  mainFlow: {
    description: string;
    steps: FlowStep[];
  };
  conditionalGroups?: any;
  fileRegistry?: any;
  executionPhases?: any;
}

// Mapping: .tab filename (without extension) → template key (kebab-case)
const tabToTemplateMapping: Record<string, string | null> = {
  // Data Collection Forms
  'options': 'options',
  'hinge_info': 'hinge-info',
  'frame_info': 'frame-info',
  'frame_5_20': 'frame-5-20',
  'anchors': 'anchors',
  'door_info': 'door-info',
  'door_elevation_info': 'door-elevation-info',
  'door_lite': 'door-lite',
  'door_louver': 'door-louver',
  'steel_stiff_info': 'steel-stiff-info',
  'lock_options': 'lock-options',
  'dummy_trim': 'dummy-trim',
  'strikes': 'strikes',
  'push_pull': 'push-pull',
  'holder_stop': 'holder-stop',
  'closers': 'closers',
  'dps': 'dps',
  'ept': 'ept',
  'auto_bottom': 'auto-bottom',
  'kick_plate': 'kick-plate',
  'Drawing_History': 'drawing-history',
  'custom_hinges': 'custom-hinges',
  'flush_pull': 'flush-pull',
  'exit_device': 'exit-device',
  'flush_bolt_info': 'flush-bolt-info',
  'hospital_latch': 'hospital-latch',
  'lite_info': 'lite-info',
  'locations': 'locations',
  'lock_prep': 'lock-prep',
  'mortise_lock': 'mortise-lock',
  'parameters': 'parameters',
  'rixon': 'rixon',
  'sched': 'sched',
  'sdi_project': 'sdi-project',
  'seconary_lock_options': 'seconary-lock-options',
  'standard_componets': 'standard-componets',
  'tags': 'tags',
  'transom_panel': 'transom-panel',
  'project_header': 'project-header',
  'anchors_sa': 'anchors-sa',

  // Action Steps (no form template)
  'door': null, // Build door model - action
  'frame_3': null, // Build frame model - action
  'drawing': null, // Generate drawing - action
  'PARTS_LIST': null, // Generate BOM - action
  'EXPORT_SA': null, // Export data - action
  'Build_Asm': null, // Build assembly - action
  'door_lite_old': 'door-lite-old',
  'bom_lines': 'bom-lines',
  'bom_sheets': 'bom-sheets',
  'build_asm': 'build-asm',
  'build_asm_bu1': 'build-asm-bu1',
  'build_asm_bu2': 'build-asm-bu2',
  'copy_of_document': 'copy-of-document',
};

// Files that are actions (not data collection forms)
const actionFiles = new Set([
  'door.tab',
  'frame_3.tab',
  'drawing.tab',
  'PARTS_LIST.TAB',
  'EXPORT_SA.TAB',
  'Build_Asm.tab'
]);

function extractTabFilename(file: string): string {
  // Remove .tab extension and normalize
  return file.replace(/\.tab$/i, '').toLowerCase();
}

function getFormTemplateKey(tabFile: string): string | null {
  const baseFilename = extractTabFilename(tabFile);

  // Check if it's a known mapping
  if (baseFilename in tabToTemplateMapping) {
    return tabToTemplateMapping[baseFilename];
  }

  // Try case-insensitive match
  const lowerFilename = baseFilename.toLowerCase();
  for (const [key, value] of Object.entries(tabToTemplateMapping)) {
    if (key.toLowerCase() === lowerFilename) {
      return value;
    }
  }

  // Default: convert to kebab-case
  return baseFilename.replace(/_/g, '-');
}

function isActionStep(tabFile: string): boolean {
  return actionFiles.has(tabFile);
}

function transformFlowStep(step: FlowStep, manifest: Record<string, any>): FlowStep {
  const transformed: FlowStep = { ...step };

  // Remove SmartAssembly-specific fields
  delete transformed.command;

  if (step.file) {
    const isAction = isActionStep(step.file);
    const templateKey = getFormTemplateKey(step.file);

    if (isAction) {
      transformed.formType = 'action';
      // Remove file reference for actions (not displayed as forms)
      delete transformed.file;
    } else {
      transformed.formType = 'data-collection';

      // Add formTemplate field if template exists in manifest
      if (templateKey && manifest[templateKey]) {
        transformed.formTemplate = templateKey;
        delete transformed.file; // Remove original .tab reference
      } else {
        console.warn(`⚠️  No template found for ${step.file} (key: ${templateKey})`);
        // Keep file reference for manual review
      }
    }
  }

  // Rename passedVariables → contextVariables
  if (step.passedVariables) {
    transformed.contextVariables = step.passedVariables;
    delete transformed.passedVariables;
  }

  return transformed;
}

async function linkFlowForms() {
  console.log('🔗 Linking SDI Form Flow to Template System\n');

  const projectRoot = path.resolve(__dirname, '..');
  const flowPath = path.join(projectRoot, 'public', 'form-flows', 'SDI-form-flow.json');
  const manifestPath = path.join(projectRoot, 'public', 'form-templates', 'manifest.json');

  // Load existing flow
  console.log('📖 Loading SDI-form-flow.json...');
  const flowContent = fs.readFileSync(flowPath, 'utf-8');
  const flow: FormFlow = JSON.parse(flowContent);

  // Load manifest
  console.log('📖 Loading manifest.json...');
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  const manifest = JSON.parse(manifestContent);

  console.log(`   ✓ Found ${Object.keys(manifest).length} form templates\n`);

  // Transform flow steps
  console.log('🔄 Transforming flow steps...');
  const transformedSteps = flow.mainFlow.steps.map(step =>
    transformFlowStep(step, manifest)
  );

  // Count step types
  const dataCollectionSteps = transformedSteps.filter(s => s.formType === 'data-collection');
  const actionSteps = transformedSteps.filter(s => s.formType === 'action');
  const withTemplates = dataCollectionSteps.filter(s => s.formTemplate);
  const withoutTemplates = dataCollectionSteps.filter(s => !s.formTemplate && s.file);

  console.log(`   ✓ Data collection steps: ${dataCollectionSteps.length}`);
  console.log(`   ✓ Action steps: ${actionSteps.length}`);
  console.log(`   ✓ Linked to templates: ${withTemplates.length}`);
  if (withoutTemplates.length > 0) {
    console.log(`   ⚠️  Missing templates: ${withoutTemplates.length}`);
    withoutTemplates.forEach(step => {
      console.log(`      - ${step.file} (order: ${step.order})`);
    });
  }
  console.log();

  // Validate all formTemplate references exist in manifest
  console.log('✅ Validating template references...');
  let validationErrors = 0;
  withTemplates.forEach(step => {
    if (step.formTemplate && !manifest[step.formTemplate]) {
      console.error(`   ❌ Invalid template reference: ${step.formTemplate} (step ${step.order})`);
      validationErrors++;
    }
  });

  if (validationErrors === 0) {
    console.log('   ✓ All template references valid\n');
  } else {
    console.error(`   ❌ ${validationErrors} validation errors found\n`);
    process.exit(1);
  }

  // Add flow metadata
  console.log('📝 Adding flow metadata...');
  flow.metadata.entryForm = 'project-header'; // First form in the flow
  flow.metadata.completionCriteria = {
    requiredSteps: [
      'project-header',
      'options',
      'door-info',
      'frame-info'
    ],
    outputFormat: 'Form data collection complete, ready for model generation'
  };
  console.log('   ✓ Flow metadata added\n');

  // Update flow with transformed steps
  flow.mainFlow.steps = transformedSteps;

  // Write updated flow
  console.log('💾 Writing updated flow...');
  const outputPath = flowPath;
  fs.writeFileSync(
    outputPath,
    JSON.stringify(flow, null, 2),
    'utf-8'
  );
  console.log(`   ✓ Updated: ${outputPath}\n`);

  // Summary
  console.log('✅ Flow linking complete!\n');
  console.log('Summary:');
  console.log(`  - Total steps: ${transformedSteps.length}`);
  console.log(`  - Data collection: ${dataCollectionSteps.length}`);
  console.log(`  - Action steps: ${actionSteps.length}`);
  console.log(`  - Linked templates: ${withTemplates.length}`);
  console.log(`  - Entry form: ${flow.metadata.entryForm}`);
  console.log();
}

// Execute
linkFlowForms().catch(error => {
  console.error('❌ Error linking flow forms:', error);
  process.exit(1);
});
