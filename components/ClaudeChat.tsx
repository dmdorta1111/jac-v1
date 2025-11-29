"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  User,
  AlertCircle,
  X,
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
import { defineStepper } from "@/components/ui/stepper";
import { loadFlow, filterSteps, buildStepDefinitions, type FormFlow, type FlowStep } from "@/lib/flow-engine/loader";
import { createFlowExecutor, type FlowExecutor } from "@/lib/flow-engine/executor";
import { validateFormData } from "@/lib/validation/zod-schema-builder";

// Import CircleStepIndicator component from stepper (exported in namespace)
const CircleStepIndicator = ({ currentStep, totalSteps, size = 80, strokeWidth = 6 }: {
  currentStep: number;
  totalSteps: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const fillPercentage = (currentStep / totalSteps) * 100;
  const dashOffset = circumference - (circumference * fillPercentage) / 100;

  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      tabIndex={-1}
      className="relative inline-flex items-center justify-center"
    >
      <svg width={size} height={size}>
        <title>Step Indicator</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="text-primary transition-all duration-300 ease-in-out"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-medium" aria-live="polite">
          {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  );
};

// Define stepper for project creation workflow
const { Stepper, useStepper, steps } = defineStepper(
  { id: "project-header", title: "Project Header", description: "Basic project info" },
  { id: "item-data", title: "Item Data", description: "Item specifications" }
);

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
  const [showStepper, setShowStepper] = useState(false);

  // Flow engine state for dynamic stepper
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [flowState, setFlowState] = useState<Record<string, Record<string, any>>>({});
  const [currentStepOrder, setCurrentStepOrder] = useState<number>(0);
  const [stepperDef, setStepperDef] = useState<any>(null);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [filteredSteps, setFilteredSteps] = useState<FlowStep[]>([]);
  const [flowExecutor, setFlowExecutor] = useState<FlowExecutor | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentItemNumber, setCurrentItemNumber] = useState<string | null>(null);

  // Access global project metadata context for header display
  const { setMetadata: setProjectMetadata } = useProject();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

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
   * Initialize stepper with dynamic steps from flow
   * @param flow - Loaded form flow definition
   * @param isRevision - Whether this is a revision/edit of existing item
   * @param initialState - Optional initial state to populate executor
   */
  const initializeStepper = async (flow: FormFlow, isRevision: boolean, initialState: Record<string, any> = {}): Promise<FlowStep[] | null> => {
    try {
      // Filter steps based on revision status
      const steps = filterSteps(flow, isRevision);
      setFilteredSteps(steps);

      // Build step definitions for defineStepper
      const stepDefs = buildStepDefinitions(steps);

      if (stepDefs.length === 0) {
        console.error('No valid steps found in flow');
        return null;
      }

      // Create dynamic stepper with steps from flow
      const dynamicStepper = defineStepper(...stepDefs.map(def => ({
        id: def.id,
        title: def.title,
        description: def.description,
      })));

      setStepperDef(dynamicStepper);
      setTotalSteps(stepDefs.length);
      setCurrentStepOrder(0);
      setCurrentFlowId(flow.metadata.source || 'SDI-form-flow');

      // Initialize FlowExecutor for conditional navigation with initial state
      const executor = createFlowExecutor(flow, steps, initialState);
      setFlowExecutor(executor);
      console.log('FlowExecutor initialized with state:', Object.keys(initialState));

      return steps; // Return filtered steps for immediate use
    } catch (error) {
      console.error('Failed to initialize stepper:', error);
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
      // For SDI product type, load flow and initialize stepper
      if (productType.toUpperCase() === 'SDI') {
        // Load SDI form flow
        const flow = await loadFlow('SDI-form-flow');

        if (!flow) {
          throw new Error('SDI form flow not found');
        }

        // Load existing project state from JSON files (for resuming)
        const existingState = await loadExistingProjectState(folderPath);

        // Initialize stepper with flow (isRevision = false for new items)
        const steps = await initializeStepper(flow, false, existingState);

        if (!steps || steps.length === 0) {
          throw new Error('Failed to initialize stepper or no steps found');
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

        // Create bot message with form and stepper info
        const botMessage: Message = {
          id: generateId(),
          sender: 'bot',
          text: `Project folder created at:\n\`${folderPath}\`\n\n**SDI Form Flow** (Step 1 of ${totalSteps})\n\nPlease fill out the project header information:`,
          timestamp: new Date(),
          formSpec: prefilledSpec,
        };

        setMessages((prev) => [...prev, botMessage]);
        setShowStepper(true);
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
      // If using dynamic stepper (SDI flow), handle step progression with validation
      if (stepperDef && filteredSteps.length > 0 && flowExecutor) {
        const currentStep = filteredSteps[currentStepOrder];
        const currentStepId = currentStep?.formTemplate;

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
          // Show validation errors
          setValidationErrors(validationResult.errors);
          setIsLoading(false);

          // Add error message
          const errorMessage: Message = {
            id: generateId(),
            sender: 'bot',
            text: 'Please fix the validation errors before continuing.',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
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
                itemNumber: validationResult.data.ITEM_NUM || '',
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
          // Get item number from form data or flow state
          const itemNum = validationResult.data.ITEM_NUM || flowExecutor.getState().ITEM_NUM || currentItemNumber;

          // Track item number when set in sdi-project form (step 1)
          if (currentStepId === 'sdi-project' && validationResult.data.ITEM_NUM) {
            const paddedItemNum = String(validationResult.data.ITEM_NUM).padStart(3, '0');
            setCurrentItemNumber(paddedItemNum);
          }

          if (itemNum) {
            const paddedItemNumber = String(itemNum).padStart(3, '0');
            try {
              await fetch('/api/save-item-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  projectPath: projectContext.folderPath,
                  itemNumber: paddedItemNumber,
                  formData: validationResult.data,
                  merge: true,  // Accumulate data from all forms
                }),
              });
              console.log(`Item ${paddedItemNumber} JSON saved/updated`);
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
          }

          // Create bot message with next form
          const botMessage: Message = {
            id: generateId(),
            sender: 'bot',
            text: `**Step ${nextStepIndex + 1} of ${totalSteps}**\n\n${nextStep.description}\n\nPlease fill out the form below:`,
            timestamp: new Date(),
            formSpec: prefilledSpec,
          };

          setMessages((prev) => [...prev, botMessage]);
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
                text: `✓ Form flow completed!\n\nAll required forms have been filled based on your selections.\n\n**Export Summary:**\n- Variables exported: ${exportData.variableCount}\n- Export path: \`${exportData.exportPath}\`\n- Session ID: ${exportData.sessionId}\n\nYour SDI project data has been exported for SmartAssembly. How can I help with this job?`,
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, completionMessage]);
            } else {
              throw new Error(exportData.error || 'Export failed');
            }
          } catch (exportError) {
            console.error('Export error:', exportError);
            const errorMessage: Message = {
              id: generateId(),
              sender: 'bot',
              text: `✓ Form flow completed!\n\nAll forms filled, but I encountered an issue exporting to SmartAssembly:\n${exportError instanceof Error ? exportError.message : 'Unknown error'}\n\nYour data is saved in the database. You can retry export later.`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
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

        // Show stepper and remove form from messages
        setShowStepper(true);
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
    setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
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

  return (
    <div className="flex h-full w-full relative gap-4 lg:gap-6">
      {/* Left Sidebar */}
      <LeftSidebar
        chatSessions={chatSessions}
        currentSessionId={currentSessionId}
        onNewChat={startNewChat}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
      />

      {/* Vertical Stepper - Desktop Only */}
      {showStepper && (
        <div className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-background/50 backdrop-blur-sm p-6 animate-in slide-in-from-left duration-300 ease-out">
          <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Project Steps</h3>
          <Stepper.Provider variant="vertical" className="flex-1">
            <Stepper.Navigation className="flex flex-col gap-4">
              {steps.map((step, index) => (
                <Stepper.Step key={step.id} of={step.id}>
                  <Stepper.Title className="text-foreground">{step.title}</Stepper.Title>
                  <Stepper.Description className="text-muted-foreground text-xs">{step.description}</Stepper.Description>
                </Stepper.Step>
              ))}
            </Stepper.Navigation>
          </Stepper.Provider>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col items-center w-full">
        {/* CircleStepIndicator - Show when SDI flow is active */}
        {stepperDef && totalSteps > 0 && (
          <div className="w-full border-b border-border bg-background/50 backdrop-blur-sm px-6 py-4 flex items-center justify-center">
            <CircleStepIndicator
              currentStep={currentStepOrder + 1}
              totalSteps={totalSteps}
              size={60}
              strokeWidth={5}
            />
            <div className="ml-4 text-sm text-muted-foreground">
              <p className="font-semibold">SDI Form Flow</p>
              <p className="text-xs">Step {currentStepOrder + 1} of {totalSteps}</p>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="w-full flex-1 overflow-y-auto px-6 py-4 sm:px-8">
          {messages.length === 0 ? (
            <WelcomeScreen
              onSuggestionClick={(text) => handleSubmit({ text, files: [] })}
              onProjectCreated={loadAndDisplayProjectHeaderForm}
              setProjectContext={setProjectContext}
            />
          ) : (
            <div className="mx-auto flex max-w-4xl flex-col gap-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} onFormSubmit={handleFormSubmit} validationErrors={validationErrors} />
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
            className="mx-auto w-full max-w-4xl flex items-center gap-3 rounded-lg bg-red-50 px-6 py-3 text-sm text-red-600 shadow-md dark:bg-destructive/10 dark:text-red-400"
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

function MessageBubble({ message, onFormSubmit, validationErrors = {} }: { message: Message; onFormSubmit?: (data: Record<string, any>) => void; validationErrors?: Record<string, string> }) {
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
    <>
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
          {hasForm && onFormSubmit && (
            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
              <DynamicFormRenderer
                formSpec={message.formSpec}
                onSubmit={onFormSubmit}
                validationErrors={validationErrors}
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
      </>
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
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-start">{Avatar}</div>
            <MessageComponent from={role} className="max-w-[90%] text-left">
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
