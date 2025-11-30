'use client';

/**
 * Session Rebuilder Utility
 * Reconstructs session state from MongoDB form submissions.
 * Used when opening an existing project (revision mode).
 */

import type { ChatSession, Message } from '@/components/leftsidebar';
import type { SessionState } from '@/lib/session-validator';
import type { FlowStep } from '@/lib/flow-engine/loader';

interface FormSubmission {
  _id: string;
  sessionId: string;
  stepId: string;
  formId: string;
  formData: Record<string, unknown>;
  metadata: {
    salesOrderNumber: string;
    itemNumber: string;
    productType: string;
    submittedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  submissions?: FormSubmission[];
  error?: string;
}

export interface RebuiltSession {
  session: ChatSession;
  state: SessionState;
}

/**
 * Fetches and rebuilds sessions from MongoDB for a given sales order.
 *
 * @param salesOrderNumber - The SO# to query submissions for
 * @param flowSteps - Expected step order from flow definition
 * @returns Array of rebuilt sessions with their states
 */
export async function rebuildSessionsFromDB(
  salesOrderNumber: string,
  flowSteps: FlowStep[]
): Promise<RebuiltSession[]> {
  console.log(`[Rebuild] Fetching submissions for SO#: ${salesOrderNumber}`);

  try {
    // Fetch submissions from MongoDB
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

      // Determine current step (first incomplete step)
      let currentStepOrder = 0;
      for (let i = 0; i < stepIds.length; i++) {
        if (!completedSteps.has(stepIds[i])) {
          currentStepOrder = i;
          break;
        }
        currentStepOrder = i + 1; // All steps complete
      }

      // Check if flow is complete
      const flowComplete = currentStepOrder >= stepIds.length;

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
        currentStepOrder,
        filteredSteps: flowSteps, // Will be recalculated if needed
        itemNumber,
        validationErrors: {},
        activeFormData: {}, // No unsaved form data when rebuilding from DB
        completedFormIds: Array.from(completedSteps), // Populate from submitted form steps
        tableSelections: {}, // Reset table selections on rebuild
        highestStepReached: currentStepOrder, // Set to current step when rebuilding from DB
        lastAccessedAt: Date.now(),
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
