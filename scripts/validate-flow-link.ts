import * as fs from 'fs';
import * as path from 'path';

const projectRoot = path.resolve(__dirname, '..');
const flowPath = path.join(projectRoot, 'public', 'form-flows', 'SDI-form-flow.json');
const manifestPath = path.join(projectRoot, 'public', 'form-templates', 'manifest.json');

try {
  const flow = JSON.parse(fs.readFileSync(flowPath, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  console.log('✅ JSON validation: PASSED\n');

  const dataSteps = flow.mainFlow.steps.filter((s: any) => s.formType === 'data-collection');
  const actionSteps = flow.mainFlow.steps.filter((s: any) => s.formType === 'action');
  const withTemplates = dataSteps.filter((s: any) => s.formTemplate);
  const invalidRefs = withTemplates.filter((s: any) => !manifest[s.formTemplate]);

  console.log('📊 Validation Results:');
  console.log('  Total steps:', flow.mainFlow.steps.length);
  console.log('  Data collection:', dataSteps.length);
  console.log('  Action steps:', actionSteps.length);
  console.log('  With templates:', withTemplates.length);
  console.log('  Invalid refs:', invalidRefs.length);

  if (invalidRefs.length > 0) {
    console.log('\n❌ Invalid template references:');
    invalidRefs.forEach((s: any) => {
      console.log(`   - Step ${s.order}: ${s.formTemplate}`);
    });
  }

  console.log('\n✅ All formTemplate references valid:', invalidRefs.length === 0);
  console.log('✅ Entry form set:', flow.metadata.entryForm);
  console.log('✅ Completion criteria set:', !!flow.metadata.completionCriteria);

  // Check for contextVariables transformation
  const withContext = flow.mainFlow.steps.filter((s: any) => s.contextVariables);
  const withPassed = flow.mainFlow.steps.filter((s: any) => s.passedVariables);

  console.log('\n🔄 Variable Transformation:');
  console.log('  Steps with contextVariables:', withContext.length);
  console.log('  Steps with passedVariables (should be 0):', withPassed.length);

  if (withPassed.length > 0) {
    console.log('\n⚠️  Steps still have passedVariables (should be renamed):');
    withPassed.forEach((s: any) => {
      console.log(`   - Step ${s.order}`);
    });
  }

  console.log('\n✅ Phase 3 validation complete!');
  process.exit(0);
} catch (e: any) {
  console.error('❌ Validation failed:', e.message);
  process.exit(1);
}
