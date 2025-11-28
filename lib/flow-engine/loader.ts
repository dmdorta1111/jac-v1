/**
 * Flow Engine Loader
 * Loads form flows from JSON and prepares them for stepper integration
 */

export interface FlowStep {
  order: number;
  lineNumber?: number;
  condition?: {
    expression: string;
    variables?: Record<string, any>;
    parent?: string;
  } | null;
  description: string;
  purpose: string;
  formType: string;
  formTemplate: string;
  contextVariables?: string[];
}

export interface FormFlow {
  metadata: {
    source: string;
    description: string;
    entryPoint: string;
    location: string;
    extractedDate: string;
    entryForm: string;
    completionCriteria?: {
      requiredSteps?: string[];
      outputFormat?: string;
    };
  };
  mainFlow: {
    description: string;
    steps: FlowStep[];
  };
  conditionalGroups?: Record<string, any>;
  fileRegistry?: Record<string, any>;
  executionPhases?: Record<string, any>;
}

export interface StepDefinition {
  id: string;
  title: string;
  description: string;
}

/**
 * Load flow definition from JSON file
 * @param flowId - Flow identifier (e.g., 'SDI-form-flow')
 * @returns Flow definition or null if not found
 */
export async function loadFlow(flowId: string): Promise<FormFlow | null> {
  try {
    const response = await fetch(`/form-flows/${flowId}.json`);
    if (!response.ok) {
      console.warn(`Flow not found: ${flowId}`);
      return null;
    }

    const flow: FormFlow = await response.json();

    // Validate flow structure
    if (!flow.metadata || !flow.mainFlow || !Array.isArray(flow.mainFlow.steps)) {
      console.error(`Invalid flow structure: ${flowId}`);
      return null;
    }

    return flow;
  } catch (error) {
    console.error(`Failed to load flow ${flowId}:`, error);
    return null;
  }
}

/**
 * Filter steps based on project context
 * @param flow - Form flow definition
 * @param isRevision - Whether this is a revision (edit) of existing item
 * @returns Filtered steps array
 */
export function filterSteps(flow: FormFlow, isRevision: boolean): FlowStep[] {
  if (!flow || !flow.mainFlow || !Array.isArray(flow.mainFlow.steps)) {
    return [];
  }

  // Filter out action steps (only keep data-collection forms)
  let steps = flow.mainFlow.steps.filter(step => step.formType === 'data-collection');

  // Skip Drawing_History for new items (only show for revisions)
  if (!isRevision) {
    steps = steps.filter(step => step.formTemplate !== 'drawing-history');
  }

  return steps;
}

/**
 * Build step definitions for defineStepper from flow steps
 * @param steps - Filtered flow steps
 * @returns Array of step definitions for stepper
 */
export function buildStepDefinitions(steps: FlowStep[]): StepDefinition[] {
  if (!Array.isArray(steps)) {
    return [];
  }

  return steps.map(step => ({
    id: step.formTemplate,
    title: formatTitle(step.formTemplate),
    description: step.description || step.purpose || '',
  }));
}

/**
 * Format template ID into human-readable title
 * @param templateId - Form template identifier
 * @returns Formatted title
 */
function formatTitle(templateId: string): string {
  return templateId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get entry form template ID from flow
 * @param flow - Form flow definition
 * @returns Entry form template ID
 */
export function getEntryForm(flow: FormFlow): string {
  return flow?.metadata?.entryForm || 'project-header';
}

/**
 * Find next step in flow based on current step index
 * @param steps - Array of flow steps
 * @param currentIndex - Current step index (0-based)
 * @returns Next step or null if at end
 */
export function getNextStep(steps: FlowStep[], currentIndex: number): FlowStep | null {
  if (!Array.isArray(steps) || currentIndex < 0 || currentIndex >= steps.length - 1) {
    return null;
  }

  return steps[currentIndex + 1];
}

/**
 * Validate flow definition structure
 * @param flow - Flow to validate
 * @returns True if valid, false otherwise
 */
export function validateFlow(flow: any): flow is FormFlow {
  return (
    flow &&
    typeof flow === 'object' &&
    flow.metadata &&
    typeof flow.metadata === 'object' &&
    flow.mainFlow &&
    typeof flow.mainFlow === 'object' &&
    Array.isArray(flow.mainFlow.steps)
  );
}
