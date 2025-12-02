'use client';

/**
 * Session Rebuilder Utility
 * Reconstructs session state from MongoDB form submissions.
 * Used when opening an existing project (revision mode).
 */

import type { ChatSession, Message } from '@/components/LeftSideBar';
import type { SessionState } from '@/lib/session-validator';
import type { FlowStep } from '@/lib/flow-engine/loader';

interface FormSubmission {
  _id: string;
  sessionId: string;
  projectId?: string;  // NEW: Reference to projects collection
  itemId?: string;     // NEW: Reference to items collection
  stepId: string;
  formId: string;
  formData: Record<string, unknown>;
  metadata: {
    salesOrderNumber: string;
    itemNumber: string;
    productType: string;
    submittedAt: string;
    renamedFrom?: string;
    renamedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProjectWithItems {
  _id: string;
  salesOrderNumber: string;
  projectName: string;
  itemCount: number;
  items: Array<{
    _id: string;
    itemNumber: string;
    productType: string;
    itemData: Record<string, unknown>;
    formIds: string[];
  }>;
}

interface ApiResponse {
  success: boolean;
  submissions?: FormSubmission[];
  project?: ProjectWithItems;
  error?: string;
}

export interface RebuiltSession {
  session: ChatSession;
  state: SessionState;
}

/**
 * Fetches and rebuilds sessions from MongoDB for a given sales order.
 * Uses new normalized schema (projects/items) with fallback to old schema.
 *
 * @param salesOrderNumber - The SO# to query submissions for
 * @param flowSteps - Expected step order from flow definition
 * @param projectPath - Optional project folder path for session isolation
 * @returns Array of rebuilt sessions with their states
 */
export async function rebuildSessionsFromDB(
  salesOrderNumber: string,
  flowSteps: FlowStep[],
  projectPath?: string
): Promise<RebuiltSession[]> {
  console.log(`[Rebuild] Fetching data for SO#: ${salesOrderNumber}`);

  try {
    // Try new normalized schema first (projects + items)
    const projectResponse = await fetch(
      `/api/projects?salesOrderNumber=${encodeURIComponent(salesOrderNumber)}`
    );

    if (projectResponse.ok) {
      const projectData = await projectResponse.json();

      if (projectData.success && projectData.project) {
        console.log('[Rebuild] Using normalized schema');

        // Fetch project with items
        const fullResponse = await fetch(
          `/api/projects/${projectData.project._id}/with-items`
        );

        if (fullResponse.ok) {
          const fullData = await fullResponse.json();

          if (fullData.success && fullData.project?.items?.length > 0) {
            return await rebuildFromNormalizedSchema(fullData.project, flowSteps, projectPath);
          }
        }
      }
    }

    // Fallback to old schema (form_submissions with metadata)
    console.log('[Rebuild] Falling back to legacy schema');

    const response = await fetch(
      `/api/form-submission?salesOrderNumber=${encodeURIComponent(salesOrderNumber)}`
    );

    if (!response.ok) {
      console.error('[Rebuild] API request failed:', response.status);
      return [];
    }

    const data: ApiResponse = await response.json();

    if (!data.success || !data.submissions || data.submissions.length === 0) {
      console.log('[Rebuild] No submissions found');
      return [];
    }

    console.log(`[Rebuild] Found ${data.submissions.length} submissions`);

    // Group submissions by itemNumber
    const itemGroups = new Map<string, FormSubmission[]>();
    data.submissions.forEach(sub => {
      const itemNum = sub.metadata.itemNumber;
      if (!itemNum) return; // Skip submissions without itemNumber

      if (!itemGroups.has(itemNum)) {
        itemGroups.set(itemNum, []);
      }
      itemGroups.get(itemNum)!.push(sub);
    });

    // Extract step IDs for progress calculation
    const stepIds = flowSteps.map(s => s.formTemplate);

    // Reconstruct sessions
    const rebuiltSessions: RebuiltSession[] = [];

    itemGroups.forEach((subs, itemNumber) => {
      // Sort by submission time
      subs.sort((a, b) =>
        new Date(a.metadata.submittedAt || a.createdAt).getTime() -
        new Date(b.metadata.submittedAt || b.createdAt).getTime()
      );

      // Build flowState from submissions
      const flowState: Record<string, Record<string, unknown>> = {};
      const completedSteps = new Set<string>();

      subs.forEach(sub => {
        flowState[sub.stepId] = sub.formData;
        completedSteps.add(sub.stepId);
      });

      // Determine current step (first incomplete step) and highest completed step
      let currentStepOrder = 0;
      let highestCompletedStep = -1;
      for (let i = 0; i < stepIds.length; i++) {
        if (completedSteps.has(stepIds[i])) {
          highestCompletedStep = i;
        }
        if (!completedSteps.has(stepIds[i]) && currentStepOrder === 0) {
          currentStepOrder = i;
        }
      }
      // If all steps completed, currentStepOrder should be the last step
      if (highestCompletedStep >= 0 && !completedSteps.has(stepIds[currentStepOrder])) {
        // currentStepOrder is already at first incomplete step
      } else if (highestCompletedStep === stepIds.length - 1) {
        currentStepOrder = stepIds.length; // All complete
      }

      // Check if flow is complete
      const flowComplete = completedSteps.size === stepIds.length;

      // Generate new session ID
      const sessionId = crypto.randomUUID();

      // Create system message indicating rebuild
      const systemMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'bot',
        text: `📋 Session restored from ${completedSteps.size} previous form submission(s).${flowComplete ? ' All forms completed.' : ` Resume at step ${currentStepOrder + 1}.`}`,
        timestamp: new Date(),
      };

      const session: ChatSession = {
        id: sessionId,
        title: `Item ${itemNumber}`,
        messages: [systemMessage],
        createdAt: new Date(subs[0].createdAt),
        updatedAt: new Date(subs[subs.length - 1].updatedAt),
        itemNumber,
        projectMetadata: {
          salesOrderNumber: subs[0].metadata.salesOrderNumber,
          productType: subs[0].metadata.productType,
        },
        flowState,
      };

      const state: SessionState = {
        messages: [systemMessage],
        flowState,
        currentStepOrder: highestCompletedStep >= 0 ? highestCompletedStep : 0, // Start at highest completed step
        filteredSteps: flowSteps, // Will be recalculated if needed
        itemNumber,
        validationErrors: {},
        activeFormData: {}, // No unsaved form data when rebuilding from DB
        completedFormIds: Array.from(completedSteps), // Populate from submitted form steps
        tableSelections: {}, // Reset table selections on rebuild
        highestStepReached: highestCompletedStep >= 0 ? highestCompletedStep : 0, // Enable navigation to all completed steps
        lastAccessedAt: Date.now(),
        projectPath, // CRITICAL: Include project path for session isolation
        executorState: flowState, // Per-session executor state from form submissions
      };

      rebuiltSessions.push({ session, state });
    });

    // Sort by item number
    rebuiltSessions.sort((a, b) =>
      a.session.itemNumber!.localeCompare(b.session.itemNumber!)
    );

    console.log(`[Rebuild] Reconstructed ${rebuiltSessions.length} sessions`);
    return rebuiltSessions;

  } catch (error) {
    console.error('[Rebuild] Error rebuilding sessions:', error);
    return [];
  }
}

/**
 * Rebuild sessions from normalized schema (projects + items collections)
 * Falls back to fetching form_submissions if itemData is empty
 * @param project - Project data with items
 * @param flowSteps - Expected step order from flow definition
 * @param projectPath - Optional project folder path for session isolation
 */
async function rebuildFromNormalizedSchema(
  project: ProjectWithItems,
  flowSteps: FlowStep[],
  projectPath?: string
): Promise<RebuiltSession[]> {
  const rebuiltSessions: RebuiltSession[] = [];
  const stepIds = flowSteps.map(s => s.formTemplate);

  // Fetch form submissions for this project to get actual form data
  const submissionsResponse = await fetch(
    `/api/form-submission?salesOrderNumber=${encodeURIComponent(project.salesOrderNumber)}`
  );

  const submissionsByItem: Map<string, FormSubmission[]> = new Map();

  if (submissionsResponse.ok) {
    const subData = await submissionsResponse.json();
    if (subData.success && subData.submissions) {
      // Group submissions by item number
      for (const sub of subData.submissions) {
        const itemNum = sub.metadata?.itemNumber || '';
        if (!submissionsByItem.has(itemNum)) {
          submissionsByItem.set(itemNum, []);
        }
        submissionsByItem.get(itemNum)!.push(sub);
      }
    }
  }

  for (const item of project.items) {
    // Build flowState from form submissions (more reliable than itemData)
    const flowState: Record<string, Record<string, unknown>> = {};
    const completedSteps = new Set<string>();

    // Get submissions for this item
    const itemSubs = submissionsByItem.get(item.itemNumber) || [];

    // Sort by submission time and populate flowState
    itemSubs.sort((a, b) =>
      new Date(a.metadata?.submittedAt || a.createdAt).getTime() -
      new Date(b.metadata?.submittedAt || b.createdAt).getTime()
    );

    for (const sub of itemSubs) {
      if (sub.formData && sub.stepId) {
        flowState[sub.stepId] = sub.formData;
        completedSteps.add(sub.stepId);
      }
    }

    // Also check formIds from item if no submissions found
    if (completedSteps.size === 0 && item.formIds) {
      item.formIds.forEach(id => completedSteps.add(id));
    }

    // Determine current step and highest completed step
    let currentStepOrder = 0;
    let highestCompletedStep = -1;
    for (let i = 0; i < stepIds.length; i++) {
      if (completedSteps.has(stepIds[i])) {
        highestCompletedStep = i;
      }
      if (!completedSteps.has(stepIds[i]) && currentStepOrder === 0) {
        currentStepOrder = i;
      }
    }
    // If all steps completed, currentStepOrder should be the last step
    if (highestCompletedStep === stepIds.length - 1) {
      currentStepOrder = stepIds.length;
    }

    const flowComplete = completedSteps.size === stepIds.length;
    const sessionId = crypto.randomUUID();

    const systemMessage: Message = {
      id: crypto.randomUUID(),
      sender: 'bot',
      text: `📋 Session restored from ${completedSteps.size} form(s).${flowComplete ? ' All forms completed.' : ` Resume at step ${currentStepOrder + 1}.`}`,
      timestamp: new Date(),
    };

    const session: ChatSession = {
      id: sessionId,
      title: `Item ${item.itemNumber}`,
      messages: [systemMessage],
      createdAt: new Date(),
      updatedAt: new Date(),
      itemNumber: item.itemNumber,
      projectMetadata: {
        salesOrderNumber: project.salesOrderNumber,
        productType: item.productType,
        projectId: project._id,
        itemId: item._id,
      },
      flowState,
    };

    const state: SessionState = {
      messages: [systemMessage],
      flowState,
      currentStepOrder: highestCompletedStep >= 0 ? highestCompletedStep : 0, // Start at highest completed step
      filteredSteps: flowSteps,
      itemNumber: item.itemNumber,
      validationErrors: {},
      activeFormData: {},
      completedFormIds: Array.from(completedSteps),
      tableSelections: {},
      highestStepReached: highestCompletedStep >= 0 ? highestCompletedStep : 0, // Enable navigation to all completed steps
      lastAccessedAt: Date.now(),
      projectPath, // CRITICAL: Include project path for session isolation
      executorState: flowState, // Per-session executor state from form submissions
    };

    rebuiltSessions.push({ session, state });
  }

  // Sort by item number
  rebuiltSessions.sort((a, b) =>
    a.session.itemNumber!.localeCompare(b.session.itemNumber!)
  );

  console.log(`[Rebuild] Reconstructed ${rebuiltSessions.length} sessions from normalized schema`);
  return rebuiltSessions;
}

/**
 * Checks if cached sessions match the given sales order number.
 * Returns true if cache is valid and recent.
 */
export function isCacheValidForProject(
  cachedSessions: ChatSession[],
  salesOrderNumber: string
): boolean {
  if (!cachedSessions || cachedSessions.length === 0) {
    return false;
  }

  // Check if any cached session belongs to this project
  return cachedSessions.some(
    s => s.projectMetadata?.salesOrderNumber === salesOrderNumber
  );
}
