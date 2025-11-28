/**
 * Flow Executor
 * Client-side conditional form rendering engine
 * Evaluates step conditions and manages flow state
 */

import { safeEval, evaluateCompoundCondition } from './evaluator';
import type { FormFlow, FlowStep } from './loader';

/**
 * FlowExecutor manages flow execution state and conditional navigation
 */
export class FlowExecutor {
  private flow: FormFlow;
  private state: Record<string, any>;
  private currentStepIndex: number;
  private filteredSteps: FlowStep[];

  constructor(flow: FormFlow, filteredSteps: FlowStep[], initialState: Record<string, any> = {}) {
    this.flow = flow;
    this.filteredSteps = filteredSteps;
    this.state = { ...initialState };
    this.currentStepIndex = 0;
  }

  /**
   * Update flow state with validated form data
   * @param stepId - Form template ID of completed step
   * @param data - Validated form data
   */
  updateState(stepId: string, data: Record<string, any>): void {
    // Merge new data into state (flat structure for condition evaluation)
    this.state = {
      ...this.state,
      ...data,
    };

    console.log('Flow state updated:', { stepId, state: this.state });
  }

  /**
   * Get current flow state
   */
  getState(): Record<string, any> {
    return { ...this.state };
  }

  /**
   * Set current step index
   */
  setCurrentStepIndex(index: number): void {
    this.currentStepIndex = index;
  }

  /**
   * Get current step index
   */
  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  /**
   * Find next step that satisfies conditions
   * @returns Next step or null if no more steps
   */
  findNextStep(): FlowStep | null {
    // Search from current index + 1 onwards
    for (let i = this.currentStepIndex + 1; i < this.filteredSteps.length; i++) {
      const step = this.filteredSteps[i];

      // Only consider data-collection steps
      if (step.formType !== 'data-collection') {
        continue;
      }

      // Evaluate step condition
      if (this.evaluateCondition(step)) {
        console.log('Next step found:', { index: i, formTemplate: step.formTemplate });
        return step;
      }
    }

    console.log('No more steps found - flow complete');
    return null;
  }

  /**
   * Find next step by index (skip condition checking)
   * Used when conditions are already known to be satisfied
   */
  getStepByIndex(index: number): FlowStep | null {
    if (index < 0 || index >= this.filteredSteps.length) {
      return null;
    }
    return this.filteredSteps[index];
  }

  /**
   * Evaluate step condition against current flow state
   * @param step - Flow step to evaluate
   * @returns True if condition is satisfied (or no condition), false otherwise
   */
  evaluateCondition(step: FlowStep): boolean {
    // No condition means unconditional (always show)
    if (!step.condition) {
      return true;
    }

    try {
      const condition = step.condition;

      // Handle compound conditions (parent AND child)
      if (condition.parent) {
        return evaluateCompoundCondition(
          condition.parent,
          condition.expression,
          this.state
        );
      }

      // Simple condition
      if (condition.expression) {
        return safeEval(condition.expression, this.state);
      }

      // No expression means unconditional
      return true;
    } catch (error) {
      console.error('Condition evaluation failed:', error, 'Step:', step.formTemplate);
      // On error, default to false (don't show step)
      return false;
    }
  }

  /**
   * Pre-fill form fields from context variables
   * Extracts values from flow state that match field names
   * @param fieldNames - Array of field names from form
   * @returns Object with pre-filled values
   */
  getContextValues(fieldNames: string[]): Record<string, any> {
    const values: Record<string, any> = {};

    fieldNames.forEach(fieldName => {
      if (this.state[fieldName] !== undefined) {
        values[fieldName] = this.state[fieldName];
      }
    });

    return values;
  }

  /**
   * Check if flow is complete (no more steps)
   */
  isComplete(): boolean {
    return this.currentStepIndex >= this.filteredSteps.length - 1;
  }

  /**
   * Get progress information
   */
  getProgress(): { current: number; total: number; percentage: number } {
    const current = this.currentStepIndex + 1;
    const total = this.filteredSteps.length;
    const percentage = Math.round((current / total) * 100);

    return { current, total, percentage };
  }

  /**
   * Reset executor to beginning
   */
  reset(): void {
    this.currentStepIndex = 0;
    this.state = {};
  }

  /**
   * Get all steps that would be shown given current state
   * Useful for debugging and visualization
   */
  getVisibleSteps(): FlowStep[] {
    return this.filteredSteps.filter(step => this.evaluateCondition(step));
  }
}

/**
 * Create FlowExecutor instance from flow definition
 * @param flow - Form flow definition
 * @param filteredSteps - Pre-filtered steps array
 * @param initialState - Optional initial state
 * @returns FlowExecutor instance
 */
export function createFlowExecutor(
  flow: FormFlow,
  filteredSteps: FlowStep[],
  initialState: Record<string, any> = {}
): FlowExecutor {
  return new FlowExecutor(flow, filteredSteps, initialState);
}
