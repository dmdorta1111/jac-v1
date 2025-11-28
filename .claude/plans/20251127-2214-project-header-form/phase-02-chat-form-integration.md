# Phase 02: Chat Form Integration Updates

**Plan:** [20251127-2214-project-header-form](./plan.md) | **Phase:** 02/04
**Status:** Pending | **Priority:** High | **Date:** 2025-11-27

## Context

**Parent Plan:** [plan.md](./plan.md)
**Dependencies:** [Phase 01 - Template Infrastructure](./phase-01-template-infrastructure.md)
**Next Phase:** [Phase 03 - API Enhancement](./phase-03-api-enhancement.md)

## Overview

Modify WelcomeScreen to display static project-header form in chat bubble after successful folder creation. Replace Claude API dependency with static template loader. Track folder creation state to enable form submission with correct project path.

## Key Insights from Research

**From researcher-02:**
- Current flow: Folder creation → Chat init → Claude response with form
- Risk: Form could display before folder creation completes
- handleFormSubmit uses hardcoded `projectId: PRJ-${Date.now()}`
- Need explicit state tracking for folder path

**Current limitation:** No state communication between WelcomeScreen and chat messages

## Requirements

### Functional
1. Load static project-header form after folder creation success
2. Display form as bot message in chat bubble
3. Track productType + salesOrderNumber for API submission
4. Pass folder context to handleFormSubmit
5. Prevent form display if folder creation failed

### Non-Functional
- Form display: <100ms after folder creation success
- No Claude API call for form generation
- State persists across component re-renders
- Clear error messaging if template load fails

## Architecture

### State Flow
```
[Product Button] → [Dialog] → [Sales Order Input] → [POST /create-project-folder]
                                                           ↓ success
                         [Store: productType, salesOrderNumber, folderPath]
                                                           ↓
                         [Load static project-header template]
                                                           ↓
                         [Create bot message with formSpec]
                                                           ↓
                         [Form renders in MessageBubble]
                                                           ↓
                         [User submits → handleFormSubmit with folder context]
```

### Component Updates
```
ClaudeChat.tsx
├── Add projectContext state (productType, salesOrderNumber, folderPath)
├── Modify WelcomeScreen to return context on success
├── Load static form template instead of Claude response
├── Update handleFormSubmit to use projectContext
└── Create bot message with loaded form spec
```

## Related Code Files

**Files to modify:**
- `components/ClaudeChat.tsx` (lines 442-572 WelcomeScreen, lines 111-168 handleFormSubmit)

**Files to reference:**
- `lib/form-templates/loader.ts` (loadFormTemplate function)
- `components/DynamicFormRenderer.tsx` (formSpec interface)

## Implementation Steps

### Step 1: Add Project Context State
**File:** `components/ClaudeChat.tsx`

Add state after line 100:
```typescript
interface ProjectContext {
  productType: string;
  salesOrderNumber: string;
  folderPath: string;
}

const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
```

### Step 2: Update WelcomeScreen Success Handler
**File:** `components/ClaudeChat.tsx` (lines 456-489)

Replace handleSubmit function:
```typescript
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
      setProjectContext({
        productType: selectedProduct,
        salesOrderNumber: salesOrder.trim(),
        folderPath: data.path,
      });

      // Load and display project header form
      setTimeout(async () => {
        await loadAndDisplayProjectHeaderForm(selectedProduct, salesOrder.trim(), data.path);
        setDialogOpen(false);
        setFeedback(null);
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
```

### Step 3: Create Form Loading Helper
**File:** `components/ClaudeChat.tsx`

Add before WelcomeScreen component (around line 440):
```typescript
import { loadFormTemplate } from '@/lib/form-templates/loader';

// Helper function to load static form and display in chat
async function loadAndDisplayProjectHeaderForm(
  productType: string,
  salesOrderNumber: string,
  folderPath: string
) {
  try {
    // Load static template
    const formSpec = await loadFormTemplate('project-header');

    if (!formSpec) {
      throw new Error('Project header template not found');
    }

    // Pre-fill form with known data
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
      text: `Great! I've created your ${productType} project folder.\n\nPlease fill out the project header information:`,
      timestamp: new Date(),
      formSpec: prefilledSpec,
    };

    setMessages((prev) => [...prev, botMessage]);
  } catch (error) {
    console.error('Failed to load project header form:', error);

    // Fallback to error message
    const errorMessage: Message = {
      id: generateId(),
      sender: 'bot',
      text: 'Project folder created, but I couldn\'t load the header form. Please try refreshing the page.',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, errorMessage]);
  }
}
```

Make it accessible to handleSubmit by moving inside ClaudeChat component or passing setMessages as parameter.

### Step 4: Update handleFormSubmit to Use Context
**File:** `components/ClaudeChat.tsx` (lines 111-168)

Replace handleFormSubmit function:
```typescript
const handleFormSubmit = async (formData: Record<string, any>) => {
  if (!projectContext) {
    // Safety check - should never happen if form only appears after folder creation
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

  try {
    // Send form data to generate project header document
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
        targetFolder: projectContext.folderPath, // NEW: Pass folder path for API
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Add success message
      const successMessage: Message = {
        id: generateId(),
        sender: 'bot',
        text: `Perfect! Project header saved to: ${data.filename}\n\nYour project is ready. How can I help with this job?`,
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
```

### Step 5: Import Template Loader at Top
**File:** `components/ClaudeChat.tsx` (around line 65)

Add import:
```typescript
import { loadFormTemplate } from '@/lib/form-templates/loader';
```

### Step 6: Refactor loadAndDisplayProjectHeaderForm Scope
Move the helper function inside ClaudeChat component (after state declarations, before useEffect hooks) so it has access to `setMessages` and `generateId`:

```typescript
export function ClaudeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  // ... other state ...
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Helper to load and display form
  const loadAndDisplayProjectHeaderForm = async (
    productType: string,
    salesOrderNumber: string,
    folderPath: string
  ) => {
    try {
      const formSpec = await loadFormTemplate('project-header');

      if (!formSpec) {
        throw new Error('Project header template not found');
      }

      // Pre-fill SO_NUM field
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

      const botMessage: Message = {
        id: generateId(),
        sender: 'bot',
        text: `Great! I've created your ${productType} project folder at:\n\`${folderPath}\`\n\nPlease fill out the project header information:`,
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

  // ... rest of component ...
}
```

### Step 7: Update WelcomeScreen Props (if needed)
Pass `loadAndDisplayProjectHeaderForm` to WelcomeScreen as prop if it's extracted as separate component, OR keep it inline and call directly.

Current code has WelcomeScreen as inline function component, so direct call works.

## Todo List

- [ ] Add `ProjectContext` interface and state to ClaudeChat
- [ ] Import `loadFormTemplate` from lib/form-templates/loader
- [ ] Create `loadAndDisplayProjectHeaderForm` helper inside ClaudeChat
- [ ] Update WelcomeScreen `handleSubmit` to store project context
- [ ] Modify WelcomeScreen success flow to call form loader
- [ ] Update `handleFormSubmit` to use projectContext instead of hardcoded ID
- [ ] Add targetFolder parameter to API call payload
- [ ] Test folder creation → form display flow
- [ ] Verify SO_NUM field pre-filled with sales order number
- [ ] Test error handling if template load fails

## Success Criteria

- [ ] Form displays in chat bubble after folder creation success
- [ ] No Claude API call for form generation
- [ ] SO_NUM field pre-populated with sales order number
- [ ] Form submission includes productType, salesOrderNumber, targetFolder
- [ ] Error message displays if template load fails
- [ ] projectContext persists across component updates
- [ ] Form only appears after successful folder creation

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Template load fails | High | Display fallback error message, allow retry |
| State lost on re-render | Medium | Use useState (already stable across renders) |
| Async timing issue | Low | Use setTimeout to ensure dialog closes first |
| Multiple form displays | Low | Only call loader once per folder creation |

## Security Considerations

1. **Input sanitization:** salesOrderNumber already sanitized in API (line 35 of create-project-folder)
2. **XSS prevention:** DynamicFormRenderer escapes all user input
3. **State tampering:** projectContext only set server-side validation success
4. **Path traversal:** targetFolder validated in Phase 03 API updates

## Next Steps

After completion, proceed to [Phase 03 - API Enhancement](./phase-03-api-enhancement.md) to modify generate-project-doc API to accept targetFolder parameter and save to correct project location.
