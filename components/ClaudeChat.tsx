"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Bot,
  User,
  AlertCircle,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputButton,
  usePromptInputAttachments,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { PaperclipIcon } from "lucide-react";
import {
  Message as MessageComponent,
  MessageContent,
  MessageResponse,
  MessageAttachment,
  MessageAttachments,
} from "@/components/ai-elements/message";
import {
  projectSetupExample,
  codeAnalysisExample,
  dataProcessingExample,
  featureDevelopmentExample,
  bugFixExample,
} from "@/components/ai-elements/examples";
import {
  LeftSidebar,
  type ChatSession,
  type Message,
  type UploadedFile,
} from "@/components/leftsidebar";
import DynamicFormRenderer from "@/components/DynamicFormRenderer";
import { loadFormTemplate } from "@/lib/form-templates";
import { useProject } from "@/components/providers/project-context";
import { usePersistedProject } from "@/lib/hooks/usePersistedProject";
import { usePersistedSession } from "@/lib/hooks/usePersistedSession";
import { useSessionSync } from "@/lib/hooks/useSessionSync";
import {
  validateSessionState,
  createFreshSessionState,
  type SessionState,
} from "@/lib/session-validator";
import {
  rebuildSessionsFromDB,
  isCacheValidForProject,
} from "@/lib/session-rebuilder";
import { loadFlow, filterSteps, buildStepDefinitions, type FormFlow, type FlowStep } from "@/lib/flow-engine/loader";
import { createFlowExecutor, type FlowExecutor } from "@/lib/flow-engine/executor";
import { validateFormData } from "@/lib/validation/zod-schema-builder";

// Project context for tracking active project
interface ProjectContext {
  productType: string;
  salesOrderNumber: string;
  folderPath: string;
}

const suggestions = [
  "SDI",
  "EMJAC",
  "Harmonic",
];

// Parse form specification from Claude's response
const parseFormFromMessage = (content: string): { text: string; formSpec?: any } => {
  // Look for ```json-form blocks
  const formRegex = /```json-form\s*([\s\S]*?)```/;
  const match = content.match(formRegex);

  if (match && match[1]) {
    try {
      const formSpec = JSON.parse(match[1].trim());
      // Remove the form block from the text content
      const text = content.replace(formRegex, '').trim();
      return { text, formSpec };
    } catch (error) {
      console.error('Failed to parse form JSON:', error);
      return { text: content };
    }
  }

  return { text: content };
};

export function ClaudeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);

  // Flow engine state
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [flowState, setFlowState] = useState<Record<string, Record<string, any>>>({});
  const [currentStepOrder, setCurrentStepOrder] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [filteredSteps, setFilteredSteps] = useState<FlowStep[]>([]);
  const [flowExecutor, setFlowExecutor] = useState<FlowExecutor | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentItemNumber, setCurrentItemNumber] = useState<string | null>(null);

  // Session state management for multi-session support
  const [sessionStateMap, setSessionStateMap] = useState<Record<string, {
    messages: Message[];
    flowState: Record<string, any>;
    currentStepOrder: number;
    filteredSteps: FlowStep[];
    itemNumber: string;
    validationErrors: Record<string, string>; // Session-scoped validation errors
    activeFormData: Record<string, any>; // Unsaved form data for session persistence
    completedFormIds: string[]; // Track completed form steps for tab navigation
    tableSelections: Record<string, number>; // Session-scoped table row selections
    highestStepReached: number; // Track furthest step visited for forward navigation
  }>>({});

  // Store active (unsaved) form data per session - synced from DynamicFormRenderer
  const [activeFormDataMap, setActiveFormDataMap] = useState<Record<string, Record<string, any>>>({});

  // Access global project metadata context for header display
  const { metadata, setMetadata: setProjectMetadata } = useProject();

  // Load/save project state from localStorage
  usePersistedProject();

  // Multi-tab synchronization
  const {
    broadcastSessionCreated,
    broadcastSessionDeleted,
    broadcastSessionUpdated,
  } = useSessionSync(
    setChatSessions,
    setSessionStateMap as React.Dispatch<React.SetStateAction<Record<string, SessionState>>>,
    currentSessionId
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use crypto.randomUUID for collision-proof ID generation
  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback: timestamp + high-entropy random
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  };

  /**
   * Load existing project state from JSON files
   * @param folderPath - Project folder path (e.g., "project-docs/SDI/SO123")
   * @returns Merged state from project-header.json and any item files
   */
  const loadExistingProjectState = async (folderPath: string): Promise<Record<string, any>> => {
    const state: Record<string, any> = {};

    try {
      // Load project-header.json if exists
      const headerRes = await fetch(`/api/read-json?path=${encodeURIComponent(folderPath + '/project-header.json')}`);
      if (headerRes.ok) {
        const headerData = await headerRes.json();
        if (headerData.success && headerData.data) {
          Object.assign(state, headerData.data);
          console.log('Loaded project header state:', Object.keys(headerData.data));
        }
      }
    } catch (e) {
      console.warn('No project header found or error loading:', e);
    }

    return state;
  };

  /**
   * Load existing item state from JSON file
   * @param folderPath - Project folder path
   * @param itemNumber - Item number (e.g., "001")
   * @returns Item data or empty object
   */
  const loadExistingItemState = async (folderPath: string, itemNumber: string): Promise<Record<string, any>> => {
    try {
      const res = await fetch(`/api/save-item-data?projectPath=${encodeURIComponent(folderPath)}&itemNumber=${itemNumber}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          console.log('Loaded item state for:', itemNumber, Object.keys(data.data));
          return data.data;
        }
      }
    } catch (e) {
      console.warn('No item data found:', e);
    }
    return {};
  };

  /**
   * Rebuild sessions from MongoDB when opening an existing project.
   * This is called when cache is invalid or missing for a recalled project.
   * @param salesOrderNumber - The SO# to rebuild sessions for
   */
  const loadExistingProjectFromDB = async (salesOrderNumber: string): Promise<boolean> => {
    console.log(`[Rebuild] Loading project from DB: ${salesOrderNumber}`);

    try {
      // Check if cache is valid
      if (isCacheValidForProject(chatSessions, salesOrderNumber)) {
        console.log('[Rebuild] Cache is valid, skipping DB fetch');
        return true;
      }

      // Load flow to get step definitions
      const flow = await loadFlow('SDI-form-flow');
      if (!flow) {
        console.error('[Rebuild] Could not load form flow');
        return false;
      }

      // Filter steps (non-revision mode)
      const steps = filterSteps(flow, false);

      // Rebuild sessions from MongoDB
      const rebuilt = await rebuildSessionsFromDB(salesOrderNumber, steps);

      if (rebuilt.length === 0) {
        console.log('[Rebuild] No sessions found in DB');
        return false;
      }

      // Convert to state structures
      const sessions = rebuilt.map(r => r.session);
      const stateMap = rebuilt.reduce((acc, r) => {
        acc[r.session.id] = r.state;
        return acc;
      }, {} as Record<string, SessionState>);

      // Update React state
      setChatSessions(sessions);
      setSessionStateMap(stateMap as any);

      // Persist to localStorage
      try {
        localStorage.setItem('sessions:list', JSON.stringify(sessions));
        localStorage.setItem('sessions:state', JSON.stringify(stateMap));
      } catch (e) {
        console.warn('[Rebuild] Failed to persist to localStorage:', e);
      }

      // Switch to first session
      if (sessions.length > 0) {
        await switchToSession(sessions[0].id);
      }

      console.log(`[Rebuild] Successfully rebuilt ${rebuilt.length} sessions`);
      return true;
    } catch (error) {
      console.error('[Rebuild] Error loading from DB:', error);
      return false;
    }
  };

  /**
   * Initialize flow with dynamic steps
   * @param flow - Loaded form flow definition
   * @param isRevision - Whether this is a revision/edit of existing item
   * @param initialState - Optional initial state to populate executor
   */
  const initializeFlow = async (flow: FormFlow, isRevision: boolean, initialState: Record<string, any> = {}): Promise<FlowStep[] | null> => {
    try {
      // Filter steps based on revision status
      const steps = filterSteps(flow, isRevision);
      setFilteredSteps(steps);

      // Build step definitions
      const stepDefs = buildStepDefinitions(steps);

      if (stepDefs.length === 0) {
        console.error('No valid steps found in flow');
        return null;
      }

      setTotalSteps(stepDefs.length);
      setCurrentStepOrder(0);
      setCurrentFlowId(flow.metadata.source || 'SDI-form-flow');

      // Initialize FlowExecutor for conditional navigation with initial state
      const executor = createFlowExecutor(flow, steps, initialState);
      setFlowExecutor(executor);
      console.log('FlowExecutor initialized with state:', Object.keys(initialState));

      return steps; // Return filtered steps for immediate use
    } catch (error) {
      console.error('Failed to initialize flow:', error);
      return null;
    }
  };

  // Load static form template and display in chat
  const loadAndDisplayProjectHeaderForm = async (
    productType: string,
    salesOrderNumber: string,
    folderPath: string
  ) => {
    try {
      // For SDI product type, load flow and initialize form flow
      if (productType.toUpperCase() === 'SDI') {
        // Load SDI form flow
        const flow = await loadFlow('SDI-form-flow');

        if (!flow) {
          throw new Error('SDI form flow not found');
        }

        // Load existing project state from JSON files (for resuming)
        const existingState = await loadExistingProjectState(folderPath);

        // Initialize flow (isRevision = false for new items)
        const steps = await initializeFlow(flow, false, existingState);

        if (!steps || steps.length === 0) {
          throw new Error('Failed to initialize flow or no steps found');
        }

        // Update project metadata with isRevision flag
        setProjectMetadata({
          SO_NUM: salesOrderNumber,
          JOB_NAME: '',
          CUSTOMER_NAME: '',
          productType,
          salesOrderNumber,
          folderPath,
          isRevision: false,
          currentSessionId: undefined,
          projectHeaderCompleted: false,
          itemSessions: {},
        });

        // Get first form from filtered steps (project-header is now step 0)
        const entryFormId = steps[0].formTemplate;
        const formSpec = await loadFormTemplate(entryFormId);

        if (!formSpec) {
          throw new Error(`Entry form template not found: ${entryFormId}`);
        }

        // Pre-fill SO_NUM field with sales order number
        const prefilledSpec = {
          ...formSpec,
          sections: formSpec.sections.map(section => ({
            ...section,
            fields: section.fields.map(field => {
              if (field.name === 'SO_NUM') {
                return { ...field, defaultValue: salesOrderNumber };
              }
              return field;
            }),
          })),
        };

        // Create bot message with form
        const botMessage: Message = {
          id: generateId(),
          sender: 'bot',
          text: `Project folder created at:\n\`${folderPath}\`\n\n**Step 1: Project Header**\n\nPlease fill out the project information. After submission, you'll create items for this project.`,
          timestamp: new Date(),
          formSpec: prefilledSpec,
        };

        setMessages((prev) => [...prev, botMessage]);
        return;
      }

      // Fallback: Load standard project-header for non-SDI products
      const formSpec = await loadFormTemplate('project-header');

      if (!formSpec) {
        throw new Error('Project header template not found');
      }

      // Pre-fill SO_NUM field with sales order number
      const prefilledSpec = {
        ...formSpec,
        sections: formSpec.sections.map(section => ({
          ...section,
          fields: section.fields.map(field => {
            if (field.name === 'SO_NUM') {
              return { ...field, defaultValue: salesOrderNumber };
            }
            return field;
          }),
        })),
      };

      // Create bot message with form
      const botMessage: Message = {
        id: generateId(),
        sender: 'bot',
        text: `Project folder created at:\n\`${folderPath}\`\n\nPlease fill out the project header information:`,
        timestamp: new Date(),
        formSpec: prefilledSpec,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to load project header form:', error);
      const errorMessage: Message = {
        id: generateId(),
        sender: 'bot',
        text: 'Project folder created, but I couldn\'t load the header form. Please try refreshing the page.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle form data changes from DynamicFormRenderer for session persistence
  const handleFormDataChange = useCallback((formId: string, data: Record<string, any>) => {
    if (!currentSessionId) return;

    setActiveFormDataMap(prev => ({
      ...prev,
      [currentSessionId]: {
        ...(prev[currentSessionId] || {}),
        ...data,
      },
    }));
  }, [currentSessionId]);

  // Create new item chat session
  const startNewItemChat = async () => {
    if (!metadata || !metadata.projectHeaderCompleted) {
      console.error('Cannot create item: project header not completed');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Get next item number from API
      const itemResponse = await fetch(
        `/api/get-next-item-number?folderPath=${encodeURIComponent(metadata.folderPath || '')}`
      );
      const itemData = await itemResponse.json();

      if (!itemData.success) {
        throw new Error(itemData.error || 'Failed to get next item number');
      }

      const itemNumber = itemData.nextItemNumber;

      // 2. Create new session
      const sessionId = generateId();
      const newSession: ChatSession = {
        id: sessionId,
        title: `Item ${itemNumber}`,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        itemNumber,
        projectMetadata: { ...metadata },
        flowState: {},
      };

      // 3. Add session to list and broadcast to other tabs
      setChatSessions(prev => [...prev, newSession]);
      broadcastSessionCreated(newSession);
      setCurrentSessionId(sessionId);

      // 4. Update project metadata
      setProjectMetadata({
        ...metadata,
        currentSessionId: sessionId,
        itemSessions: {
          ...metadata.itemSessions,
          [itemNumber]: {
            sessionId,
            itemNumber,
            createdAt: Date.now(),
            title: `Item ${itemNumber}`,
          },
        },
      });

      // 5. Load SDI flow and skip to step 1 (sdi-project form)
      const flow = await loadFlow('SDI-form-flow');
      if (!flow) {
        throw new Error('SDI form flow not found');
      }

      // Filter steps (isRevision = false)
      const allSteps = filterSteps(flow, false);

      // Skip step 0 (project-header), start at step 1
      const itemSteps = allSteps.slice(1);
      setFilteredSteps(itemSteps);

      // Build step definitions for item flow
      const stepDefs = buildStepDefinitions(itemSteps);
      setTotalSteps(stepDefs.length);
      setCurrentStepOrder(0); // Start at first item step (sdi-project)
      setCurrentFlowId(flow.metadata.source || 'SDI-form-flow');

      // Update session with step progress for sidebar display
      setChatSessions(prev => prev.map(s =>
        s.id === sessionId
          ? { ...s, currentStep: 1, totalSteps: stepDefs.length, flowComplete: false }
          : s
      ));

      // Initialize FlowExecutor with project-header data as initial state
      const projectHeaderState = flowExecutor?.getState()?.['project-header'] || {};
      const executor = createFlowExecutor(flow, itemSteps, projectHeaderState);
      setFlowExecutor(executor);

      // 6. Load sdi-project form template
      const formSpec = await loadFormTemplate('sdi-project');
      if (!formSpec) {
        throw new Error('sdi-project template not found');
      }

      // Pre-fill ITEM_NUM field (editable - user can change it)
      const prefilledSpec = {
        ...formSpec,
        sections: formSpec.sections.map(section => ({
          ...section,
          fields: section.fields.map(field => {
            if (field.name === 'ITEM_NUM') {
              return { ...field, defaultValue: itemNumber };
            }
            return field;
          }),
        })),
      };

      // 7. Create bot message with form
      const botMessage: Message = {
        id: generateId(),
        sender: 'bot',
        text: `Creating **Item ${itemNumber}** for ${metadata.JOB_NAME}\n\n**Step 1 of ${stepDefs.length}:** Item Configuration\n\nPlease fill out the item details:`,
        timestamp: new Date(),
        formSpec: prefilledSpec,
      };

      setMessages([botMessage]);
      setCurrentItemNumber(itemNumber);

      console.log(`Created item session ${sessionId} for item ${itemNumber}`);
    } catch (error) {
      console.error('Failed to create item session:', error);
      const errorMessage: Message = {
        id: generateId(),
        sender: 'bot',
        text: `Error creating item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to existing session with state restoration
  // CRITICAL: All async operations must complete BEFORE any state updates
  // to prevent race conditions that cause data mix-matching between sessions
  const switchToSession = async (sessionId: string) => {
    if (sessionId === currentSessionId) return; // Already on this session

    setIsLoading(true);

    try {
      // ============================================
      // PHASE 1: SAVE CURRENT SESSION (sync state read)
      // ============================================
      if (currentSessionId) {
        // Use executor's flat state for proper restoration (not component's nested flowState)
        const executorState = flowExecutor?.getState() || {};
        const prevHighest = sessionStateMap[currentSessionId]?.highestStepReached ?? 0;
        const currentState = {
          messages,
          flowState: executorState,
          currentStepOrder,
          filteredSteps,
          itemNumber: currentItemNumber || '',
          validationErrors,
          activeFormData: activeFormDataMap[currentSessionId] || {}, // Save unsaved form data
          completedFormIds: sessionStateMap[currentSessionId]?.completedFormIds || [],
          tableSelections: sessionStateMap[currentSessionId]?.tableSelections || {},
          highestStepReached: Math.max(prevHighest, currentStepOrder),
          lastAccessedAt: Date.now(),
        };

        setSessionStateMap(prev => ({
          ...prev,
          [currentSessionId]: currentState,
        }));
      }

      // ============================================
      // PHASE 2: VALIDATE TARGET SESSION
      // ============================================
      const sessionState = sessionStateMap[sessionId];

      if (!sessionState || !validateSessionState(sessionState)) {
        // Session missing or corrupted - create fresh state
        console.warn(`[Session] Invalid session ${sessionId}, creating fresh`);
        const session = chatSessions.find(s => s.id === sessionId);
        const freshState = createFreshSessionState(session?.itemNumber || '');

        // BATCH: All state updates together for fresh session
        setMessages(freshState.messages);
        setFlowState(freshState.flowState);
        setCurrentStepOrder(freshState.currentStepOrder);
        setFilteredSteps(freshState.filteredSteps);
        setValidationErrors(freshState.validationErrors);
        setCurrentItemNumber(freshState.itemNumber || null);
        setCurrentSessionId(sessionId);
        setFlowExecutor(null);
        setIsLoading(false);
        return;
      }

      // ============================================
      // PHASE 3: ASYNC DATA LOADING (complete ALL async before state updates)
      // ============================================
      const targetStep = sessionState.highestStepReached ?? sessionState.currentStepOrder;
      let mergedFlowState = { ...sessionState.flowState };

      // 3a. Load disk data (async)
      if (metadata?.folderPath && sessionState.itemNumber) {
        try {
          const diskData = await loadExistingItemState(metadata.folderPath, sessionState.itemNumber);

          if (Object.keys(diskData).length > 0) {
            // Disk data takes priority (source of truth)
            Object.keys(diskData).forEach(key => {
              if (key !== '_metadata') {
                const formData = diskData[key];
                if (formData && typeof formData === 'object' && !Array.isArray(formData)) {
                  // Flatten individual fields for form defaultValues
                  Object.keys(formData).forEach(fieldName => {
                    mergedFlowState[fieldName] = formData[fieldName];
                  });
                  // Also keep nested structure for executor state
                  mergedFlowState[key] = formData;
                } else {
                  mergedFlowState[key] = formData;
                }
              }
            });
            console.log(`[Session Switch] Loaded disk data for item ${sessionState.itemNumber}:`, Object.keys(diskData));
          }
        } catch (e) {
          console.warn('[Session Switch] Failed to load disk data:', e);
        }
      }

      // 3b. Load flow definition (async) - BEFORE any state updates
      const flow = await loadFlow('SDI-form-flow');
      if (!flow) {
        throw new Error('SDI form flow not found');
      }

      // 3c. Create executor with complete merged state - BEFORE any state updates
      const newExecutor = createFlowExecutor(flow, sessionState.filteredSteps, mergedFlowState);
      newExecutor.setCurrentStepIndex(targetStep);

      // 3d. Calculate step definitions - BEFORE any state updates
      const stepDefs = sessionState.filteredSteps.length > 0
        ? buildStepDefinitions(sessionState.filteredSteps)
        : [];

      // ============================================
      // PHASE 4: BATCH ALL STATE UPDATES (sync, no async gaps)
      // React 18 automatically batches these updates together
      // This prevents race conditions where component renders with mixed state
      // ============================================

      // Core session state
      setCurrentSessionId(sessionId);
      setMessages(sessionState.messages);
      setFlowState(mergedFlowState);
      setFlowExecutor(newExecutor);

      // Flow navigation state
      setCurrentStepOrder(targetStep);
      setFilteredSteps(sessionState.filteredSteps);
      setTotalSteps(stepDefs.length);

      // Item-specific state
      setCurrentItemNumber(sessionState.itemNumber);
      setValidationErrors(sessionState.validationErrors || {});

      // Restore active form data for the session
      if (sessionState.activeFormData && Object.keys(sessionState.activeFormData).length > 0) {
        setActiveFormDataMap(prev => ({
          ...prev,
          [sessionId]: sessionState.activeFormData,
        }));
      }

      // Update project metadata
      if (metadata) {
        setProjectMetadata({ ...metadata, currentSessionId: sessionId });
      }

      console.log(`[Session Switch] Complete: ${sessionId} (Item ${sessionState.itemNumber})`);
    } catch (error) {
      console.error('[Session Switch] Failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Create First Item button click
  const handleCreateFirstItem = async () => {
    await startNewItemChat();
  };

  // Handle form submission from DynamicFormRenderer
  const handleFormSubmit = async (formData: Record<string, any>) => {
    // Check if we have project context (from folder creation)
    if (!projectContext) {
      const errorMessage: Message = {
        id: generateId(),
        sender: 'bot',
        text: 'Error: Project folder information missing. Please create a new project first.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    setIsLoading(true);
    setValidationErrors({});

    try {
      // If using dynamic flow (SDI flow), handle step progression with validation
      if (filteredSteps.length > 0 && flowExecutor) {
        const currentStep = filteredSteps[currentStepOrder];
        const currentStepId = currentStep?.formTemplate;

        // NEW: Check if this is project-header submission (step 0)
        if (currentStepOrder === 0 && currentStepId === 'project-header') {
          // 1. Load form template for validation
          const formSpec = await loadFormTemplate(currentStepId);
          if (!formSpec) {
            throw new Error(`Form template not found: ${currentStepId}`);
          }

          // 2. Validate form data
          const accumulatedState = flowExecutor.getState();
          const mergedData = { ...accumulatedState, ...formData };
          const validationResult = validateFormData(formSpec, mergedData);

          if (!validationResult.success) {
            // Show validation errors inline (no chat bubble)
            setValidationErrors(validationResult.errors);
            setIsLoading(false);
            // Errors are displayed inline on the form via validationErrors prop
            return;
          }

          // 3. Save project-header to file
          try {
            const saveResponse = await fetch('/api/save-project-header', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                folderPath: projectContext.folderPath,
                data: validationResult.data,
              }),
            });

            const saveData = await saveResponse.json();
            if (!saveData.success) {
              throw new Error(saveData.error || 'Failed to save project header');
            }
          } catch (saveError) {
            console.error('Project header save error:', saveError);
            // Continue anyway (graceful degradation)
          }

          // 4. Update project metadata
          setProjectMetadata({
            SO_NUM: String(validationResult.data.SO_NUM),
            JOB_NAME: String(validationResult.data.JOB_NAME),
            CUSTOMER_NAME: String(validationResult.data.CUSTOMER_NAME),
            productType: projectContext.productType,
            salesOrderNumber: projectContext.salesOrderNumber,
            folderPath: projectContext.folderPath,
            isRevision: false,
            currentSessionId: undefined,
            projectHeaderCompleted: true, // MARK COMPLETE
            itemSessions: {},
          });

          // 5. Update executor state
          flowExecutor.updateState(currentStepId, validationResult.data);

          // 6. Replace form message with success (no additional chat bubble)
          setMessages((prev) => {
            const lastBotIndex = prev.map((m, i) => ({ m, i }))
              .filter(({ m }) => m.sender === 'bot')
              .pop()?.i;

            if (lastBotIndex !== undefined) {
              const updated = [...prev];
              updated[lastBotIndex] = {
                ...updated[lastBotIndex],
                text: `✓ Project header saved!\n\n**${validationResult.data.JOB_NAME}** (SO# ${validationResult.data.SO_NUM})\n\nReady to create your first item?`,
                formSpec: undefined,
              };
              return updated;
            }
            return prev.map(msg =>
              msg.formSpec ? { ...msg, formSpec: undefined, text: `✓ Project header saved!` } : msg
            );
          });

          setIsLoading(false);
          return; // STOP - don't advance to next step
        }

        // Continue with regular flow for other steps (existing code starts here)
        // 1. Load current form template for validation
        const formSpec = await loadFormTemplate(currentStepId);
        if (!formSpec) {
          throw new Error(`Form template not found: ${currentStepId}`);
        }

        // 2. Merge current form data with accumulated flow state
        // This allows conditionals to reference values from previous forms
        const accumulatedState = flowExecutor.getState();
        const mergedData = { ...accumulatedState, ...formData };

        // 3. Validate form data with Zod schema (using merged data for conditionals)
        const validationResult = validateFormData(formSpec, mergedData);

        if (!validationResult.success) {
          // Show validation errors inline (no chat bubble)
          setValidationErrors(validationResult.errors);
          setIsLoading(false);
          // Errors are displayed inline on the form via validationErrors prop
          return;
        }

        // 3. Save validated form data to MongoDB
        try {
          const submissionResponse = await fetch('/api/form-submission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: currentSessionId || generateId(),
              stepId: currentStepId,
              formId: currentStepId,
              formData: validationResult.data,
              metadata: {
                salesOrderNumber: projectContext.salesOrderNumber,
                itemNumber: currentItemNumber || validationResult.data.ITEM_NUM || '',
                productType: projectContext.productType,
                formVersion: '1.0.0',
                userId: undefined, // TODO: Add user authentication
                isRevision: false,
              },
            }),
          });

          const submissionData = await submissionResponse.json();

          if (!submissionData.success) {
            throw new Error(submissionData.error || 'Failed to save form data');
          }

          console.log('Form data saved to MongoDB:', submissionData.submissionId);
        } catch (dbError) {
          console.error('MongoDB submission error:', dbError);
          // Continue with flow even if DB save fails (graceful degradation)
        }

        // 4. Update FlowExecutor state with validated data
        flowExecutor.updateState(currentStepId, validationResult.data);
        flowExecutor.setCurrentStepIndex(currentStepOrder);

        // 5. Store form data for current step (already in executor state)
        setFlowState(prev => ({
          ...prev,
          [currentStepId]: validationResult.data,
        }));

        // Update project metadata with first form data (project-header)
        if (currentStepOrder === 0) {
          setProjectMetadata({
            SO_NUM: String(validationResult.data.SO_NUM || projectContext.salesOrderNumber),
            JOB_NAME: String(validationResult.data.JOB_NAME || ''),
            CUSTOMER_NAME: String(validationResult.data.CUSTOMER_NAME || ''),
            productType: projectContext.productType,
            salesOrderNumber: projectContext.salesOrderNumber,
            folderPath: projectContext.folderPath,
            isRevision: false,
            currentSessionId: currentSessionId || undefined,
            projectHeaderCompleted: true,
            itemSessions: {},
          });

          // Save project-header.json to project folder
          try {
            await fetch('/api/generate-project-doc', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectData: {
                  ...validationResult.data,
                  productType: projectContext.productType,
                },
                action: 'project_header',
                targetFolder: projectContext.folderPath,
                output: 'json',
              }),
            });
            console.log('Project header JSON saved to:', projectContext.folderPath);
          } catch (jsonError) {
            console.error('Failed to save project header JSON:', jsonError);
            // Continue flow - not blocking
          }
        }

        // Save item data JSON for forms after project-header (step 1+)
        if (currentStepOrder >= 1 && projectContext.folderPath) {
          // Get the NEW item number from form data (user may have changed it)
          const newItemNum = validationResult.data.ITEM_NUM || flowExecutor.getState().ITEM_NUM || currentItemNumber;
          // Original item number is tracked in session state (from when session was created)
          const originalItemNum = currentItemNumber;

          if (newItemNum) {
            const paddedNewItemNumber = String(newItemNum).padStart(3, '0');
            const paddedOriginalItemNumber = originalItemNum ? String(originalItemNum).padStart(3, '0') : null;

            try {
              const saveResponse = await fetch('/api/save-item-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  projectPath: projectContext.folderPath,
                  itemNumber: paddedNewItemNumber,
                  originalItemNumber: paddedOriginalItemNumber,  // For rename detection
                  formId: currentStepId,
                  formData: validationResult.data,
                  merge: true,
                  sessionId: currentSessionId,  // For MongoDB updates
                  salesOrderNumber: projectContext.salesOrderNumber,  // For MongoDB updates
                }),
              });

              const saveData = await saveResponse.json();
              if (!saveData.success) {
                console.error('Failed to save item data:', saveData.error);
              } else {
                console.log(`Item ${paddedNewItemNumber} data saved (${currentStepId})${saveData.renamed ? ` - renamed from ${saveData.renamedFrom}` : ''}`);
              }

              // Always sync item number to session (handles both initial set and changes)
              // This ensures sidebar always shows correct item number
              const itemNumberChanged = paddedNewItemNumber !== paddedOriginalItemNumber;

              // Update currentItemNumber state
              setCurrentItemNumber(paddedNewItemNumber);

              // Always update session with current item number
              setChatSessions(prev => prev.map(s =>
                s.id === currentSessionId
                  ? { ...s, title: `Item ${paddedNewItemNumber}`, itemNumber: paddedNewItemNumber }
                  : s
              ));

              // Update itemSessions map in metadata if item number changed
              if (itemNumberChanged && metadata?.itemSessions) {
                const updatedItemSessions = { ...metadata.itemSessions };
                // Remove old entry if exists
                if (paddedOriginalItemNumber) {
                  delete updatedItemSessions[paddedOriginalItemNumber];
                }
                // Add/update entry with new item number
                updatedItemSessions[paddedNewItemNumber] = {
                  sessionId: currentSessionId || '',
                  itemNumber: paddedNewItemNumber,
                  createdAt: Date.now(),
                  title: `Item ${paddedNewItemNumber}`,
                };
                setProjectMetadata({
                  ...metadata,
                  itemSessions: updatedItemSessions,
                });
              }
            } catch (jsonError) {
              console.error('Failed to save item JSON:', jsonError);
              // Continue flow - not blocking
            }
          }
        }

        // Remove form from current message
        setMessages((prev) => prev.map(msg =>
          msg.formSpec ? { ...msg, formSpec: undefined } : msg
        ));

        // Track completed form in session state for tab navigation
        if (currentSessionId && currentStepId) {
          setSessionStateMap(prev => ({
            ...prev,
            [currentSessionId]: {
              ...(prev[currentSessionId] || createFreshSessionState()),
              completedFormIds: [
                ...(prev[currentSessionId]?.completedFormIds || []),
                currentStepId
              ].filter((id, idx, arr) => arr.indexOf(id) === idx) // dedupe
            }
          }));
        }

        // Clear active form data since form was submitted successfully
        if (currentSessionId) {
          setActiveFormDataMap(prev => {
            const newMap = { ...prev };
            delete newMap[currentSessionId];
            return newMap;
          });
        }

        // 5. Find next step using conditional navigation
        const nextStep = flowExecutor.findNextStep();

        if (nextStep) {
          // Load next form
          const nextFormSpec = await loadFormTemplate(nextStep.formTemplate);

          if (!nextFormSpec) {
            throw new Error(`Form template not found: ${nextStep.formTemplate}`);
          }

          // Pre-fill form with context values if available
          const contextValues = flowExecutor.getContextValues(
            nextFormSpec.sections.flatMap(s => s.fields.map(f => f.name))
          );

          // Merge context values into form defaults
          const prefilledSpec = {
            ...nextFormSpec,
            sections: nextFormSpec.sections.map(section => ({
              ...section,
              fields: section.fields.map(field => ({
                ...field,
                defaultValue: contextValues[field.name] ?? field.defaultValue,
              })),
            })),
          };

          // Update current step index to next step
          const nextStepIndex = filteredSteps.findIndex(s => s.formTemplate === nextStep.formTemplate);
          if (nextStepIndex !== -1) {
            setCurrentStepOrder(nextStepIndex);
            // Update session progress for sidebar display
            setChatSessions(prev => prev.map(s =>
              s.id === currentSessionId
                ? { ...s, currentStep: nextStepIndex + 1, totalSteps }
                : s
            ));
          }

          // Replace the last bot message with next form (no new chat bubble)
          setMessages((prev) => {
            // Find the last bot message index
            const lastBotIndex = prev.map((m, i) => ({ m, i }))
              .filter(({ m }) => m.sender === 'bot')
              .pop()?.i;

            if (lastBotIndex !== undefined) {
              // Replace the last bot message with the new form
              const updated = [...prev];
              updated[lastBotIndex] = {
                ...updated[lastBotIndex],
                text: `**Step ${nextStepIndex + 1} of ${totalSteps}**`,
                formSpec: prefilledSpec,
              };
              return updated;
            }

            // Fallback: add new message if no bot message found
            return [...prev, {
              id: generateId(),
              sender: 'bot' as const,
              text: `**Step ${nextStepIndex + 1} of ${totalSteps}**`,
              timestamp: new Date(),
              formSpec: prefilledSpec,
            }];
          });
        } else {
          // Flow complete - no more steps satisfy conditions
          // Export all form data to SmartAssembly JSON
          try {
            const exportResponse = await fetch('/api/export-variables', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: currentSessionId || generateId(),
                salesOrderNumber: projectContext.salesOrderNumber,
              }),
            });

            const exportData = await exportResponse.json();

            if (exportData.success) {
              const completionMessage: Message = {
                id: generateId(),
                sender: 'bot',
                text: `✓ Item ${currentItemNumber} configuration complete!\n\nAll required forms have been filled based on your selections.\n\n**Export Summary:**\n- Variables exported: ${exportData.variableCount}\n- Export path: \`${exportData.exportPath}\`\n- Session ID: ${exportData.sessionId}\n\nYour SDI project data has been exported for SmartAssembly.\n\nWould you like to create another item for this project?`,
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, completionMessage]);
              // Mark session as flow complete
              setChatSessions(prev => prev.map(s =>
                s.id === currentSessionId
                  ? { ...s, flowComplete: true, currentStep: totalSteps, totalSteps }
                  : s
              ));
            } else {
              throw new Error(exportData.error || 'Export failed');
            }
          } catch (exportError) {
            console.error('Export error:', exportError);
            const errorMessage: Message = {
              id: generateId(),
              sender: 'bot',
              text: `✓ Item ${currentItemNumber} configuration complete!\n\nAll forms filled, but I encountered an issue exporting to SmartAssembly:\n${exportError instanceof Error ? exportError.message : 'Unknown error'}\n\nYour data is saved in the database. You can retry export later.\n\nWould you like to create another item for this project?`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
            // Mark session as flow complete (even on export error)
            setChatSessions(prev => prev.map(s =>
              s.id === currentSessionId
                ? { ...s, flowComplete: true, currentStep: totalSteps, totalSteps }
                : s
            ));
          }
        }

        setIsLoading(false);
        return;
      }

      // Fallback: Standard single-form submission (non-SDI)
      const response = await fetch('/api/generate-project-doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectData: {
            ...formData,
            productType: projectContext.productType,
            salesOrderNumber: projectContext.salesOrderNumber,
          },
          action: 'project_header',
          targetFolder: projectContext.folderPath,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update header with project metadata
        setProjectMetadata({
          SO_NUM: formData.SO_NUM || projectContext.salesOrderNumber,
          JOB_NAME: formData.JOB_NAME || '',
          CUSTOMER_NAME: formData.CUSTOMER_NAME || '',
        });

        // Remove form from messages
        setMessages((prev) => prev.map(msg =>
          msg.formSpec ? { ...msg, formSpec: undefined } : msg
        ));

        // Add success message
        const successMessage: Message = {
          id: generateId(),
          sender: 'bot',
          text: `Project header saved to:\n\`${data.path}\`\n\nYour project is ready. How can I help with this job?`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
      } else {
        throw new Error(data.error || 'Failed to save project header');
      }
    } catch (error) {
      console.error('Error saving project header:', error);
      const errorMessage: Message = {
        id: generateId(),
        sender: 'bot',
        text: 'Sorry, I had trouble saving your project header. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load and display a previously completed form for editing.
   * Called when user clicks a form tab in the FormTabNavigation.
   */
  const handleFormTabClick = useCallback(async (formId: string) => {
    if (!currentSessionId || !flowExecutor) return;

    setIsLoading(true);

    try {
      // 1. Load form template
      const formSpec = await loadFormTemplate(formId);
      if (!formSpec) {
        throw new Error(`Form template not found: ${formId}`);
      }

      // 2. Get existing data from flowState
      const existingData = flowExecutor.getState();

      // 3. Pre-fill form with existing data
      const prefilledSpec = {
        ...formSpec,
        sections: formSpec.sections.map(section => ({
          ...section,
          fields: section.fields.map(field => ({
            ...field,
            defaultValue: existingData[field.name] ?? field.defaultValue,
          })),
        })),
      };

      // 4. Add form to messages (or replace if already visible)
      const tabEditMessage: Message = {
        id: generateId(),
        sender: 'bot',
        text: `Editing **${formSpec.title}**\n\nMake your changes below:`,
        timestamp: new Date(),
        formSpec: prefilledSpec,
      };

      // Remove any existing forms from messages first
      setMessages(prev => [
        ...prev.filter(m => !m.formSpec),
        tabEditMessage
      ]);

      console.log(`Loaded form ${formId} for editing`);
    } catch (error) {
      console.error('Failed to load form for editing:', error);
      const errorMessage: Message = {
        id: generateId(),
        sender: 'bot',
        text: `Error loading form: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, flowExecutor]);

  /**
   * Navigate to previous form in the flow.
   * Only navigates to forms that were actually visited (in completedFormIds).
   * This respects conditional logic - forms skipped during input won't appear in navigation.
   */
  const handleNavigatePrev = useCallback(async () => {
    if (!currentSessionId || filteredSteps.length === 0) return;

    // Get completed forms (actual visited steps, respecting conditional logic)
    const completedFormIds = sessionStateMap[currentSessionId]?.completedFormIds || [];
    if (completedFormIds.length === 0) return;

    // Find current form's position in completed forms
    const currentFormId = filteredSteps[currentStepOrder]?.formTemplate;
    const currentCompletedIndex = completedFormIds.indexOf(currentFormId);

    // If current form not in completed list, navigate to last completed form
    if (currentCompletedIndex === -1) {
      const lastCompletedFormId = completedFormIds[completedFormIds.length - 1];
      const targetStepIndex = filteredSteps.findIndex(s => s.formTemplate === lastCompletedFormId);
      if (targetStepIndex !== -1) {
        setCurrentStepOrder(targetStepIndex);
        handleFormTabClick(lastCompletedFormId);
      }
      return;
    }

    // Navigate to previous completed form
    if (currentCompletedIndex <= 0) return; // Already at first completed form

    const prevFormId = completedFormIds[currentCompletedIndex - 1];
    const targetStepIndex = filteredSteps.findIndex(s => s.formTemplate === prevFormId);
    if (targetStepIndex !== -1) {
      setCurrentStepOrder(targetStepIndex);
      handleFormTabClick(prevFormId);
    }
  }, [currentStepOrder, filteredSteps, currentSessionId, sessionStateMap, handleFormTabClick]);

  /**
   * Navigate to next form in the flow.
   * Only navigates to forms that were actually visited (in completedFormIds).
   * This respects conditional logic - forms skipped during input won't appear in navigation.
   */
  const handleNavigateNext = useCallback(async () => {
    if (!currentSessionId || filteredSteps.length === 0) return;

    // Get completed forms (actual visited steps, respecting conditional logic)
    const completedFormIds = sessionStateMap[currentSessionId]?.completedFormIds || [];
    if (completedFormIds.length === 0) return;

    // Find current form's position in completed forms
    const currentFormId = filteredSteps[currentStepOrder]?.formTemplate;
    const currentCompletedIndex = completedFormIds.indexOf(currentFormId);

    // If current form not in completed list, navigate to first completed form
    if (currentCompletedIndex === -1) {
      const firstCompletedFormId = completedFormIds[0];
      const targetStepIndex = filteredSteps.findIndex(s => s.formTemplate === firstCompletedFormId);
      if (targetStepIndex !== -1) {
        setCurrentStepOrder(targetStepIndex);
        handleFormTabClick(firstCompletedFormId);
      }
      return;
    }

    // Navigate to next completed form
    if (currentCompletedIndex >= completedFormIds.length - 1) return; // Already at last completed form

    const nextFormId = completedFormIds[currentCompletedIndex + 1];
    const targetStepIndex = filteredSteps.findIndex(s => s.formTemplate === nextFormId);
    if (targetStepIndex !== -1) {
      setCurrentStepOrder(targetStepIndex);
      handleFormTabClick(nextFormId);
    }
  }, [currentStepOrder, filteredSteps, currentSessionId, sessionStateMap, handleFormTabClick]);

  // Save current session when messages change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setChatSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                messages,
                updatedAt: new Date(),
                title: generateSessionTitle(messages),
              }
            : session
        )
      );
    }
  }, [messages, currentSessionId]);

  // Auto-save session state when messages change and broadcast to other tabs
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      // Use executor's flat state for proper restoration
      const executorState = flowExecutor?.getState() || flowState;
      // Track highest step reached for forward navigation after going back
      const prevHighest = sessionStateMap[currentSessionId]?.highestStepReached ?? 0;
      const newHighest = Math.max(prevHighest, currentStepOrder);
      const state: SessionState = {
        messages,
        flowState: executorState,
        currentStepOrder,
        filteredSteps,
        itemNumber: currentItemNumber || '',
        validationErrors,
        activeFormData: activeFormDataMap[currentSessionId] || {}, // Include unsaved form data
        completedFormIds: sessionStateMap[currentSessionId]?.completedFormIds || [],
        tableSelections: sessionStateMap[currentSessionId]?.tableSelections || {},
        highestStepReached: newHighest,
        lastAccessedAt: Date.now(),
      };

      setSessionStateMap(prev => ({
        ...prev,
        [currentSessionId]: state,
      }));

      // Broadcast to other tabs (they won't update if this is their active session)
      broadcastSessionUpdated(currentSessionId, state);
    }
  }, [messages, currentSessionId, flowState, flowExecutor, currentStepOrder, filteredSteps, currentItemNumber, validationErrors, activeFormDataMap, broadcastSessionUpdated]);

  // Rebuild sessions from MongoDB when project is recalled and cache is empty
  useEffect(() => {
    // Only trigger if:
    // 1. Project metadata exists with a salesOrderNumber
    // 2. Project header is completed (so we know it's an existing project)
    // 3. No sessions are cached for this project
    if (
      metadata?.salesOrderNumber &&
      metadata?.projectHeaderCompleted &&
      !isCacheValidForProject(chatSessions, metadata.salesOrderNumber)
    ) {
      console.log('[ClaudeChat] Project has no cached sessions, attempting rebuild from DB');
      loadExistingProjectFromDB(metadata.salesOrderNumber);
    }
  }, [metadata?.salesOrderNumber, metadata?.projectHeaderCompleted, chatSessions.length]);

  const generateSessionTitle = (msgs: Message[]): string => {
    const firstUserMsg = msgs.find((m) => m.sender === "user");
    if (firstUserMsg) {
      return firstUserMsg.text.slice(0, 40) + (firstUserMsg.text.length > 40 ? "..." : "");
    }
    return "New Chat";
  };

  const startNewChat = () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setError(null);
  };

  const selectSession = (sessionId: string) => {
    const session = chatSessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setError(null);
    }
  };

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Delete this item session? This cannot be undone.')) {
      return;
    }

    // 1. Find session to get itemNumber
    const session = chatSessions.find(s => s.id === sessionId);

    // 2. Remove from sessions list and broadcast to other tabs
    setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
    broadcastSessionDeleted(sessionId);

    // 3. Remove from sessionStateMap
    setSessionStateMap(prev => {
      const newMap = { ...prev };
      delete newMap[sessionId];
      return newMap;
    });

    // 4. Remove from activeFormDataMap (cleanup unsaved form data)
    setActiveFormDataMap(prev => {
      const newMap = { ...prev };
      delete newMap[sessionId];
      return newMap;
    });

    // 4. Remove from itemSessions map in metadata
    if (session?.itemNumber && metadata?.itemSessions) {
      const updatedItemSessions = { ...metadata.itemSessions };
      delete updatedItemSessions[session.itemNumber];

      setProjectMetadata({
        ...metadata,
        itemSessions: updatedItemSessions,
      });
    }

    // 5. If deleting current session, switch to another or clear
    if (sessionId === currentSessionId) {
      const remaining = chatSessions.filter(s => s.id !== sessionId);
      if (remaining.length > 0) {
        switchToSession(remaining[0].id);
      } else {
        setCurrentSessionId(null);
        setMessages([]);
        setCurrentItemNumber(null);
      }
    }

    console.log(`Deleted session ${sessionId} (Item ${session?.itemNumber || 'N/A'})`);
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    if ((!message.text.trim() && message.files.length === 0) || isLoading) return;

    // Start a new session if none exists
    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: generateId(),
        title: "New Chat",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setChatSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
    }

    // Convert FileUIPart files to UploadedFile format
    const convertedFiles: UploadedFile[] = message.files.map((file) => ({
      id: generateId(),
      name: file.filename || "file",
      size: 0,
      type: file.mediaType || "",
    }));

    const userMessage: Message = {
      id: generateId(),
      sender: "user",
      text: message.text.trim(),
      timestamp: new Date(),
      files: convertedFiles.length > 0 ? convertedFiles : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Check for example triggers
    const lowerText = message.text.trim().toLowerCase();
    
    if (lowerText.includes("project setup") || lowerText.includes("setup example")) {
      setMessages((prev) => [...prev, projectSetupExample]);
      setIsLoading(false);
      return;
    }
    if (lowerText.includes("code analysis") || lowerText.includes("analyze code")) {
      setMessages((prev) => [...prev, codeAnalysisExample]);
      setIsLoading(false);
      return;
    }
    if (lowerText.includes("data processing") || lowerText.includes("process data")) {
      setMessages((prev) => [...prev, dataProcessingExample]);
      setIsLoading(false);
      return;
    }
    if (lowerText.includes("feature development") || lowerText.includes("develop feature")) {
      setMessages((prev) => [...prev, featureDevelopmentExample]);
      setIsLoading(false);
      return;
    }
    if (lowerText.includes("bug fix") || lowerText.includes("fix bug")) {
      setMessages((prev) => [...prev, bugFixExample]);
      setIsLoading(false);
      return;
    }

    try {
      // Build message history for context
      const messageHistory = [...messages, userMessage].map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: message.text.trim(),
          messages: messageHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Parse response for form specification
      const { text, formSpec } = parseFormFromMessage(data.response);

      const botMessage: Message = {
        id: generateId(),
        sender: "bot",
        text: text,
        timestamp: new Date(),
        formSpec: formSpec,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setError("Failed to get response. Please try again.");
      const errorMessage: Message = {
        id: generateId(),
        sender: "bot",
        text: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize initialFormData to prevent unnecessary form resets on re-render
  // Priority: activeFormData (unsaved) > flowState (submitted) > formSpec.defaultValue
  const initialFormData = useMemo(() => ({
    ...flowState,
    ...(activeFormDataMap[currentSessionId || ''] || {}),
  }), [flowState, activeFormDataMap, currentSessionId]);

  return (
    <div className="flex h-full w-full relative gap-4 lg:gap-6">
      {/* Left Sidebar */}
      <LeftSidebar
        chatSessions={[...chatSessions].sort((a, b) => {
          // Sort by itemNumber numerically (e.g., "001" < "002" < "010")
          const aNum = parseInt(a.itemNumber || '999', 10);
          const bNum = parseInt(b.itemNumber || '999', 10);
          return aNum - bNum;
        })}
        currentSessionId={currentSessionId}
        onNewChat={handleCreateFirstItem}
        onSelectSession={switchToSession}
        onDeleteSession={deleteSession}
        formNavigationState={currentSessionId ? {
          currentStepIndex: currentStepOrder,
          totalSteps: filteredSteps.length,
          completedFormIds: sessionStateMap[currentSessionId]?.completedFormIds || [],
          highestStepReached: sessionStateMap[currentSessionId]?.highestStepReached ?? 0,
        } : undefined}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
      />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col items-center w-full">
        {/* Messages Area */}
        <div className="w-full flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-4 lg:px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {messages.length === 0 ? (
            <WelcomeScreen
              onSuggestionClick={(text) => handleSubmit({ text, files: [] })}
              onProjectCreated={loadAndDisplayProjectHeaderForm}
              setProjectContext={setProjectContext}
            />
          ) : (
            <div className="flex w-full flex-col gap-4 sm:gap-6 px-2 sm:px-4 lg:px-8">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  sessionId={currentSessionId || 'default'}
                  onFormSubmit={handleFormSubmit}
                  onFormDataChange={handleFormDataChange}
                  validationErrors={validationErrors}
                  initialFormData={initialFormData}
                  selectedTableRows={sessionStateMap[currentSessionId || '']?.tableSelections || {}}
                  onTableRowSelect={(fieldName, rowIndex, rowData) => {
                    if (!currentSessionId) return;
                    setSessionStateMap(prev => ({
                      ...prev,
                      [currentSessionId]: {
                        ...(prev[currentSessionId] || createFreshSessionState()),
                        tableSelections: {
                          ...(prev[currentSessionId]?.tableSelections || {}),
                          [fieldName]: rowIndex
                        }
                      }
                    }));
                  }}
                />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div
            role="alert"
            className="mx-4 md:mx-8 flex items-center gap-3 rounded-lg bg-red-50 px-6 py-3 text-sm text-red-600 shadow-md dark:bg-destructive/10 dark:text-red-400"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              className="rounded-md p-1.5 transition-colors hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-red-900/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Add New Item Button - Always visible when project header is completed */}
        {metadata?.projectHeaderCompleted && (
          <div className="w-full px-4 pb-2">
            <Button
              onClick={startNewItemChat}
              variant="outline"
              className="w-full border-dashed border-2 hover:border-solid hover:bg-accent/50"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              {chatSessions.length === 0 ? 'Create First Item' : 'Add New Item'}
            </Button>
          </div>
        )}

        {/* Input Area */}
        <div className="justify-center w-full shrink-0 border-border backdrop-blur-sm dark:bg-background">
          <div className="mx-auto w-full">
            {/* Input Container with Glow Effect */}
            <div className="relative">
              {/* Subtle Glow Behind */}
              <div
                className={`absolute -inset-1 rounded-3xl bg-gradient-to-r from-zinc-500/20 via-zinc-400/20 to-zinc-600/20 blur-xl duration-500 ${
                  isLoading ? "opacity-80" : "opacity-30"
                }`}
              />

              {/* Main Input Container */}
              <PromptInput
                onSubmit={handleSubmit}
                className="relative bg-linear-to-b from-surface to-background p-1.5 shadow-lg transition-all duration-300 has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:ring-transparent has-[[data-slot=input-group-control]:focus-visible]:border-zinc-300 dark:bg-card dark:bg-none dark:shadow-xl dark:shadow-black/20 dark:has-[[data-slot=input-group-control]:focus-visible]:ring-0 dark:has-[[data-slot=input-group-control]:focus-visible]:ring-transparent dark:has-[[data-slot=input-group-control]:focus-visible]:border-zinc-700"
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
                multiple
                globalDrop
              >
                <PromptInputAttachments className="gap-3 p-4">
                  {(attachment) => (
                    <PromptInputAttachment
                      key={attachment.id}
                      data={attachment}
                      className="h-12 px-3 gap-2.5 rounded-lg text-base"
                    />
                  )}
                </PromptInputAttachments>
                <PromptInputTextarea
                  placeholder="Jac is Waiting..."
                  disabled={isLoading}
                />
                <PromptInputFooter>
                  <PromptInputTools>
                    <AttachmentButton />
                  </PromptInputTools>
                  <PromptInputSubmit
                    disabled={isLoading}
                    status={isLoading ? "submitted" : "ready"}
                    className="relative p-1.5 shadow-lg transition-all duration-300"
                  />
                </PromptInputFooter>
              </PromptInput>             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface WelcomeScreenProps {
  onSuggestionClick?: (text: string) => void;
  onProjectCreated?: (productType: string, salesOrderNumber: string, folderPath: string) => void;
  setProjectContext?: (context: ProjectContext) => void;
}

function WelcomeScreen({ onSuggestionClick, onProjectCreated, setProjectContext }: WelcomeScreenProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [salesOrder, setSalesOrder] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleButtonClick = (product: string) => {
    setSelectedProduct(product);
    setSalesOrder("");
    setFeedback(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!salesOrder.trim() || !selectedProduct) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/create-project-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: selectedProduct,
          salesOrderNumber: salesOrder.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFeedback({ type: 'success', message: `Project folder created: ${data.path}` });

        // Store project context for form submission
        if (setProjectContext) {
          setProjectContext({
            productType: selectedProduct,
            salesOrderNumber: salesOrder.trim(),
            folderPath: data.path,
          });
        }

        // Close dialog and trigger form display
        setTimeout(() => {
          setDialogOpen(false);
          setFeedback(null);
          setSalesOrder("");

          // Load and display the project header form
          if (onProjectCreated) {
            onProjectCreated(selectedProduct, salesOrder.trim(), data.path);
          }
        }, 1500);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to create folder' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting && salesOrder.trim()) {
      handleSubmit();
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-16 sm:px-8">
      <h2 className="mb-3 text-3xl font-bold text-foreground">
        EMJAC Engineering Assistant
      </h2>
      <p className="mb-12 max-w-xl text-center text-base leading-relaxed text-muted-foreground">
        Your AI-powered helper for custom stainless steel fabrication projects.
        Ask about kitchen equipment, specifications, or engineering details.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            size="lg"
            onClick={() => handleButtonClick(suggestion)}
            className="min-w-[120px] transition-all duration-200 hover:border-zinc-400 hover:bg-accent hover:shadow-md"
          >
            {suggestion}
          </Button>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create {selectedProduct} Project</DialogTitle>
            <DialogDescription>
              Enter the sales order number to create a new project folder.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Input
              name="salesOrder"
              placeholder="Enter sales order number"
              value={salesOrder}
              onChange={(e) => setSalesOrder(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              autoFocus
            />

            {feedback && (
              <div
                className={`rounded-lg px-4 py-3 text-sm ${
                  feedback.type === 'success'
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                }`}
              >
                {feedback.message}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !salesOrder.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MessageBubble({ message, sessionId, onFormSubmit, onFormDataChange, validationErrors = {}, initialFormData = {}, selectedTableRows = {}, onTableRowSelect }: { message: Message; sessionId: string; onFormSubmit?: (data: Record<string, any>) => void; onFormDataChange?: (formId: string, data: Record<string, any>) => void; validationErrors?: Record<string, string>; initialFormData?: Record<string, any>; selectedTableRows?: Record<string, number>; onTableRowSelect?: (fieldName: string, rowIndex: number, rowData: Record<string, string | number>) => void }) {
  const isUser = message.sender === "user";
  const role = isUser ? "user" : "assistant";
  const hasForm = !isUser && message.formSpec;

  const Avatar = (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
        isUser
          ? "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
          : "bg-secondary text-foreground border-transparent shadow-md dark:bg-card dark:text-muted-foreground dark:shadow-black/20"
      }`}
    >
      {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
    </div>
  );

  const messageBody = (
    <div className={hasForm ? 'w-full' : ''}>
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm font-medium leading-7 text-zinc-800 dark:text-zinc-100">
              {message.text}
            </p>
          ) : (
            <MessageResponse className="whitespace-pre-wrap text-sm leading-7 text-slate-800 dark:text-foreground">
              {message.text}
            </MessageResponse>
          )}

          {/* File Attachments */}
          {message.files && message.files.length > 0 && (
            <MessageAttachments className="mt-3 border-t border-slate-300 pt-3 dark:border-white/10">
              {message.files.map((file) => (
                <MessageAttachment
                  key={file.id}
                  data={{
                    type: "file",
                    filename: file.name,
                    mediaType: file.type,
                    url: "",
                  }}
                  className="size-auto flex-row items-center gap-1.5 rounded-lg bg-white/50 px-2.5 py-1.5 text-xs dark:bg-white/10"
                />
              ))}
            </MessageAttachments>
          )}

          {/* Dynamic Form */}
          {hasForm && onFormSubmit && message.formSpec?.formId && (
            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4 w-full">
              <DynamicFormRenderer
                key={`${sessionId}-${message.id}-${message.formSpec.formId}`}
                formSpec={message.formSpec}
                sessionId={sessionId}
                initialData={initialFormData}
                onSubmit={onFormSubmit}
                onFormDataChange={onFormDataChange}
                validationErrors={validationErrors}
                selectedTableRows={selectedTableRows}
                onTableRowSelect={onTableRowSelect}
              />
            </div>
          )}

          <span
            className={`mt-4 block text-xs ${
              isUser ? "text-zinc-500" : "text-muted-foreground"
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
      </div>
    );

    return (
      <div className={`flex w-full animate-slide-up ${isUser ? "justify-end" : "justify-start"}`}>
        {isUser ? (
          <div className="flex items-start gap-3">
                  <MessageComponent from={role} className="flex-1 max-w-[95%] items-end text-right">
                    <MessageContent className="w-full rounded-sm border border-zinc-200 bg-white px-6 py-5 text-slate-900 shadow-md group-[.is-user]:rounded-sm group-[.is-user]:border-zinc-200 group-[.is-user]:bg-white group-[.is-user]:text-slate-900 group-[.is-user]:shadow-md dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50">
                {messageBody}
              </MessageContent>
            </MessageComponent>
            <div className="flex flex-col items-end">{Avatar}</div>
          </div>
        ) : (
          <div className={`flex items-start gap-3 ${hasForm ? 'w-full' : ''}`}>
            <div className="flex flex-col items-start">{Avatar}</div>
            <MessageComponent from={role} className={`text-left ${hasForm ? 'flex-1 max-w-none' : 'max-w-[90%]'}`}>
              <MessageContent className="rounded-none bg-transparent px-0 py-0 text-foreground shadow-none">
                {messageBody}
              </MessageContent>
            </MessageComponent>
          </div>
        )}
      </div>
    );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-4 animate-fade-in" aria-live="polite" aria-label="Jac is typing">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground shadow-md dark:bg-card dark:text-muted-foreground dark:shadow-lg dark:shadow-black/20">
        <Bot className="h-5 w-5" />
      </div>
      <div className="rounded-2xl bg-card px-6 py-4 shadow-lg dark:shadow-black/20">
        <div className="flex items-center gap-2">
          <div className="typing-dot h-2.5 w-2.5 rounded-full bg-zinc-600 dark:bg-zinc-400" />
          <div className="typing-dot h-2.5 w-2.5 rounded-full bg-zinc-600 dark:bg-zinc-400" />
          <div className="typing-dot h-2.5 w-2.5 rounded-full bg-zinc-600 dark:bg-zinc-400" />
        </div>
      </div>
    </div>
  );
}

function AttachmentButton() {
  const attachments = usePromptInputAttachments();

  return (
    <PromptInputButton
      onClick={() => attachments.openFileDialog()}
      aria-label="Add attachment"
      className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
    >
      <PaperclipIcon className="size-4" />
    </PromptInputButton>
  );
}
