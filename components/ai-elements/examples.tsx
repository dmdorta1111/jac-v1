// Example: Task-Based Messages for Testing
// Add these to your chat to test the Task component integration

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface ReasoningStep {
  label: string;
  description?: string;
  status?: "complete" | "active" | "pending";
}

interface TaskStep {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "active" | "complete";
  items?: string[];
}

// Message type matches the interface defined in components/chat.tsx
interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  files?: UploadedFile[];
  reasoning?: ReasoningStep[];
  tasks?: TaskStep[];
}

// Example 1: Project Setup Tasks
export const projectSetupExample: Message = {
  id: "msg-project-setup",
  sender: "bot",
  text: "I'll help you set up the project. Here's the plan:",
  timestamp: new Date(),
  tasks: [
    {
      id: "env-setup",
      title: "Environment Configuration",
      status: "complete",
      description: "Setting up development environment",
      items: [
        "Installed Node.js 18.x",
        "Created .env.local with required variables",
        "Configured development server",
        "Set up database connection"
      ]
    },
    {
      id: "deps-install",
      title: "Dependencies Installation",
      status: "active",
      description: "Installing project dependencies",
      items: [
        "Installing npm packages",
        "Resolving peer dependencies",
        "Caching packages locally"
      ]
    },
    {
      id: "testing-setup",
      title: "Testing Configuration",
      status: "pending",
      description: "Setting up test environment",
      items: [
        "Configure Jest",
        "Set up test database",
        "Create test fixtures"
      ]
    },
    {
      id: "deploy-config",
      title: "Deployment Setup",
      status: "pending",
      items: [
        "Configure Docker",
        "Set up CI/CD pipeline",
        "Prepare production variables"
      ]
    }
  ]
};

// Example 2: Code Analysis Tasks
export const codeAnalysisExample: Message = {
  id: "msg-code-analysis",
  sender: "bot",
  text: "I've analyzed your codebase. Here's what I found:",
  timestamp: new Date(),
  tasks: [
    {
      id: "structure-review",
      title: "Structure Review",
      status: "complete",
      items: [
        "Reviewed project architecture",
        "Checked file organization",
        "Verified naming conventions"
      ]
    },
    {
      id: "performance-audit",
      title: "Performance Audit",
      status: "active",
      items: [
        "Analyzing bundle size",
        "Checking render performance",
        "Optimizing database queries"
      ]
    },
    {
      id: "security-scan",
      title: "Security Scan",
      status: "pending",
      items: [
        "Check vulnerabilities",
        "Review authentication",
        "Validate data handling"
      ]
    }
  ]
};

// Example 3: Data Processing Pipeline
export const dataProcessingExample: Message = {
  id: "msg-data-processing",
  sender: "bot",
  text: "Processing your data request. Progress below:",
  timestamp: new Date(),
  tasks: [
    {
      id: "validation",
      title: "Data Validation",
      status: "complete",
      items: [
        "Parsed input format",
        "Validated data types",
        "Checked required fields",
        "Sanitized inputs"
      ]
    },
    {
      id: "transformation",
      title: "Data Transformation",
      status: "active",
      items: [
        "Normalizing data structure",
        "Converting formats",
        "Applying business logic"
      ]
    },
    {
      id: "enrichment",
      title: "Data Enrichment",
      status: "pending",
      items: [
        "Fetch external data",
        "Add computed fields",
        "Generate insights"
      ]
    },
    {
      id: "output",
      title: "Output Generation",
      status: "pending",
      items: [
        "Format results",
        "Generate reports",
        "Export data"
      ]
    }
  ]
};

// Example 4: Feature Development Tasks
export const featureDevelopmentExample: Message = {
  id: "msg-feature-dev",
  sender: "bot",
  text: "Starting implementation of the new feature. Here's the roadmap:",
  timestamp: new Date(),
  tasks: [
    {
      id: "requirements",
      title: "Requirements Gathering",
      status: "complete",
      items: [
        "Documented specifications",
        "Identified dependencies",
        "Planned API endpoints"
      ]
    },
    {
      id: "frontend",
      title: "Frontend Development",
      status: "active",
      items: [
        "Creating UI components",
        "Adding state management",
        "Implementing user interactions"
      ]
    },
    {
      id: "backend",
      title: "Backend Development",
      status: "active",
      items: [
        "Setting up database schema",
        "Creating API endpoints",
        "Adding validation"
      ]
    },
    {
      id: "testing",
      title: "Testing & QA",
      status: "pending",
      items: [
        "Write unit tests",
        "Integration testing",
        "User acceptance testing"
      ]
    },
    {
      id: "deployment",
      title: "Deployment",
      status: "pending",
      items: [
        "Deploy to staging",
        "Performance testing",
        "Deploy to production"
      ]
    }
  ]
};

// Example 5: Bug Fix Workflow
export const bugFixExample: Message = {
  id: "msg-bug-fix",
  sender: "bot",
  text: "I've identified and started fixing the issues:",
  timestamp: new Date(),
  tasks: [
    {
      id: "diagnosis",
      title: "Bug Diagnosis",
      status: "complete",
      items: [
        "Reproduced the issue",
        "Identified root cause",
        "Traced error logs",
        "Isolated problematic code"
      ]
    },
    {
      id: "fixing",
      title: "Fix Implementation",
      status: "active",
      items: [
        "Applied patch",
        "Refactored affected code",
        "Updated documentation"
      ]
    },
    {
      id: "verification",
      title: "Verification",
      status: "pending",
      items: [
        "Run regression tests",
        "Manual verification",
        "Performance check"
      ]
    },
    {
      id: "release",
      title: "Release",
      status: "pending",
      items: [
        "Create release notes",
        "Deploy patch",
        "Notify users"
      ]
    }
  ]
};

// How to use in your Chat component:
/*
  // Example: Add to your chat after user sends a message
  const handleSendMessage = async (text: string) => {
    // ... existing code ...
    
    // Use any of the examples above:
    setMessages((prev) => [...prev, projectSetupExample]);
    
    // Or create custom task message:
    const customTaskMessage: Message = {
      id: generateId(),
      sender: "bot",
      text: "Custom response with tasks",
      timestamp: new Date(),
      tasks: [
        {
          id: "custom-1",
          title: "Step 1",
          status: "complete",
          items: ["Item A", "Item B"]
        },
        {
          id: "custom-2",
          title: "Step 2",
          status: "active",
          items: ["Working on Item C"]
        }
      ]
    };
    
    setMessages((prev) => [...prev, customTaskMessage]);
  };
*/

// Tips for using tasks:
/*
 * 1. Status Values:
 *    - "pending": Task not started (gray indicator)
 *    - "active": Currently working (blue dot, auto-expanded)
 *    - "complete": Task finished (green checkmark)
 *
 * 2. Auto-Expansion:
 *    - Tasks with status "active" automatically expand
 *    - Other tasks show collapsed with clickable headers
 *
 * 3. Items Array:
 *    - Optional array of subtasks
 *    - Displayed as bullet points when task is expanded
 *    - Keep items concise and actionable
 *
 * 4. Styling:
 *    - Automatically adjusts colors based on status
 *    - Full dark mode support
 *    - Consistent with chat bubble styling
 *
 * 5. UX Best Practices:
 *    - Use 3-5 tasks per message for clarity
 *    - Provide 2-5 items per task
 *    - Update task status as work progresses
 *    - Keep titles descriptive but brief
 */
