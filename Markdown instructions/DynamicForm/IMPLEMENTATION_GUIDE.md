# Dynamic Form Builder - Complete Implementation Guide

This guide shows you how to integrate dynamic form generation into your Claude chat interface.

## Overview

The system works as follows:
1. User types what they want to build (e.g., "I need a custom cabinet")
2. Claude reads the DYNAMIC_FORM_BUILDER_SKILL.md and generates a JSON form specification
3. The frontend detects the `json-form` code block and renders it as an interactive form
4. User fills out the form and submits
5. Form data is sent to your quote generation API
6. Claude generates markdown documentation with all the collected data

## File Structure

```
your-nextjs-app/
├── skills/
│   └── DYNAMIC_FORM_BUILDER_SKILL.md    # The skill that teaches Claude about forms
├── components/
│   ├── ui/                              # Your shadcn/ui components
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── radio-group.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── calendar.tsx
│   │   ├── button.tsx
│   │   └── label.tsx
│   ├── DynamicFormRenderer.tsx          # Renders forms from JSON
│   └── ClaudeChat.tsx                   # Main chat interface
├── app/
│   └── api/
│       ├── chat/
│       │   └── route.ts                 # Claude chat API
│       └── generate-project-doc/
│           └── route.ts                 # Document generation API
└── project-docs/                        # Generated markdown files
```

## Installation Steps

### 2. Create the Skills Directory

```bash
mkdir skills
```

Place the `DYNAMIC_FORM_BUILDER_SKILL.md` file in the `skills/` directory.

### 3. Add Files to Your Project

Copy these files to your project:

1. **`components/DynamicFormRenderer.tsx`** - The form rendering component

### 4. Integrate into existing ClaudeChat.tsx and chat-route.ts
the ClaudeChat.tsx file in Markdown Instructions/DynamicForm needs to be integrated into existing one located in the components folder. DO OVERWRITE only add the form entry/quote features into the existing chat framework. The chat-route.ts file needs to be integrated into existing chat api file. 

### 5. Add the multi-step forms creating feature below
Follow the steps below to add this feature to ClaudeChat.tsx in app folder 

## How It Works

### Step 1: User Starts Conversation

```
User: "I need a custom cabinet for my kitchen"
```

### Step 2: Claude Generates Form

Claude reads the DYNAMIC_FORM_BUILDER_SKILL.md and responds with:

```
I'll help you configure a custom kitchen cabinet. Please provide the following specifications:

```json-form
{
  "formId": "cabinet-001",
  "itemType": "furniture",
  "title": "Custom Kitchen Cabinet",
  "sections": [
    {
      "id": "dimensions",
      "title": "Dimensions",
      "fields": [
        {
          "id": "width",
          "name": "width",
          "label": "Width (inches)",
          "type": "input",
          "inputType": "number",
          "required": true
        },
        // ... more fields
      ]
    }
  ]
}
```
```

### Step 3: Frontend Renders Form

The `ClaudeChat` component:
1. Detects the `json-form` code block
2. Parses the JSON
3. Passes it to `DynamicFormRenderer`
4. Renders interactive form in the chat bubble

### Step 4: User Fills Form and Submits

The form data is collected and sent to your quote generation API.

### Step 5: Documentation Generated

The system generates a markdown file with all specifications.

## Customizing the Skill

You can customize `DYNAMIC_FORM_BUILDER_SKILL.md` to add your own item types:

```markdown
### 7. Custom Item Type: Pool Tables

**Typical fields:**
- Table size (7ft, 8ft, 9ft)
- Slate type (1-piece, 3-piece)
- Felt color
- Wood type
- Pocket style
- Accessories included
```

Then add an example form specification for this item type.

## Advanced Features

### 1. Multi-Step Forms

You can create multi-step forms by having Claude generate multiple form specs in sequence:

```typescript
// Add to ClaudeChat.tsx
const [currentStep, setCurrentStep] = useState(1);
const [formHistory, setFormHistory] = useState<any[]>([]);

// Track completed forms and request next step
const handleFormSubmit = async (formData: Record<string, any>) => {
  setFormHistory([...formHistory, formData]);
  
  // Ask Claude for next step
  await sendMessage('I completed the form. What else do you need?');
};
```

### 2. Form Validation with Claude

After form submission, you can ask Claude to validate the data:

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [
      ...previousMessages,
      {
        role: 'user',
        content: `Please validate this form data: ${JSON.stringify(formData)}`
      }
    ]
  })
});
```

### 3. Dynamic Pricing Estimates

Add a button to get real-time pricing based on partially filled forms:

```typescript
// In DynamicFormRenderer.tsx
<Button 
  type="button" 
  variant="outline"
  onClick={() => onEstimate?.(formData)}
>
  Get Estimate
</Button>
```

### 4. Save Draft Functionality

Save incomplete forms to localStorage:

```typescript
// In ClaudeChat.tsx
const saveDraft = (formData: any) => {
  localStorage.setItem(`draft-${formSpec.formId}`, JSON.stringify(formData));
};

const loadDraft = (formId: string) => {
  const draft = localStorage.getItem(`draft-${formId}`);
  return draft ? JSON.parse(draft) : null;
};
```

### 5. File Upload Fields

Extend the form renderer to support file uploads:

```typescript
// Add to DynamicFormRenderer.tsx field types
case 'file':
  return (
    <div key={field.id} className="space-y-2">
      <Label htmlFor={field.id}>{field.label}</Label>
      <Input
        id={field.id}
        type="file"
        accept={field.accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFieldChange(field.name, file);
          }
        }}
      />
    </div>
  );
```

Then update the skill to include file upload fields:

```json
{
  "id": "blueprints",
  "name": "blueprints",
  "label": "Upload Blueprints",
  "type": "file",
  "accept": ".pdf,.dwg,.jpg,.png",
  "required": false
}
```

## Testing the Implementation

### Test 1: Simple Item Quote

```
User: "I need a quote for a custom table"
Expected: Claude generates a furniture form with dimensions, materials, etc.
```

### Test 2: Complex Item

```
User: "I want to build an outdoor LED sign for my restaurant"
Expected: Claude generates a comprehensive signage form with lighting, materials, permits, etc.
```

### Test 3: Conditional Fields

Fill out a form where selecting "Custom Paint Color" shows an additional color input field.

### Test 4: Form Submission

Submit a completed form and verify:
- Form data is sent to API
- Markdown document is generated
- Success message appears in chat
- File is saved in `project-docs/`

## Troubleshooting

### Issue: Forms Not Rendering

**Problem:** Chat shows the JSON code block instead of rendering the form.

**Solution:** 
- Check that the code block uses `json-form` language identifier
- Verify the JSON is valid
- Check browser console for parsing errors

### Issue: Required Fields Not Validating

**Problem:** Form submits even with empty required fields.

**Solution:**
- Ensure `required: true` is set in field spec
- Check that validation logic in `DynamicFormRenderer.tsx` is working
- Verify error state is being set correctly

### Issue: Conditional Fields Not Showing

**Problem:** Conditional fields never appear.

**Solution:**
- Verify the `conditional.field` ID matches the parent field's `name`
- Check that the parent field value matches the `conditional.value`
- Ensure `checkConditional()` function is called before rendering

### Issue: Form Data Not Saving

**Problem:** Form submits but no markdown file is created.

**Solution:**
- Check that `/api/generate-project-doc` endpoint is working
- Verify `project-docs/` directory exists and is writable
- Check server logs for errors
- Ensure form data includes required fields like `projectId`

## Best Practices

### 1. Keep Forms Focused

Don't overwhelm users with too many fields. Break complex forms into logical sections.

### 2. Provide Defaults

Set sensible default values for common selections to speed up the process.

### 3. Use Helper Text

Always include `helperText` for fields that might be confusing.

### 4. Validate Early

Show validation errors as users type, not just on submit.

### 5. Mobile-Friendly

Test forms on mobile devices and ensure fields are appropriately sized.

### 6. Progressive Disclosure

Use conditional fields to only show relevant options based on previous selections.

### 7. Clear Error Messages

Provide specific, actionable error messages that tell users exactly what to fix.

## Example Usage Patterns

### Pattern 1: Quick Quote

For simple items, Claude generates a minimal form with just essential fields:
- Dimensions
- Material
- Quantity
- Timeline

### Pattern 2: Detailed Specification

For complex custom work, Claude generates comprehensive forms with:
- Multiple sections
- Conditional fields
- File uploads
- Special requirements

### Pattern 3: Iterative Refinement

Claude generates an initial form, then based on answers, asks follow-up questions:
1. Basic specifications
2. Feature selection
3. Finish options
4. Installation requirements

## Integration with Existing Systems

### CRM Integration

Send form data to your CRM:

```typescript
const handleFormSubmit = async (formData: any) => {
  // Generate quote document
  await fetch('/api/generate-project-doc', { ... });
  
  // Send to CRM
  await fetch('/api/crm/create-opportunity', {
    method: 'POST',
    body: JSON.stringify({
      contact: formData.clientName,
      value: estimatedValue,
      stage: 'quote-generated',
      customFields: formData
    })
  });
};
```

### Email Notifications

Send email when quotes are generated:

```typescript
// In generate-project-doc/route.ts
await sendEmail({
  to: salesTeam,
  subject: `New Quote: ${projectData.projectId}`,
  body: `A new quote has been generated for ${projectData.clientName}...`,
  attachments: [{ filename, path: filePath }]
});
```

### Database Storage

Store form submissions in a database:

```typescript
// Add to generate-project-doc/route.ts
import { db } from '@/lib/db';

await db.quotes.create({
  data: {
    projectId: body.projectData.projectId,
    itemType: formData.itemType,
    specifications: formData,
    status: 'pending',
    createdAt: new Date()
  }
});
```

## Next Steps

1. Deploy your app and test with real users
2. Collect feedback on form clarity and ease of use
3. Refine the skill file based on common questions or confusion
4. Add analytics to track which item types are most requested
5. Create templates for your most common item types
6. Train your sales team on how to use the system

## Support and Feedback

For questions or issues:
1. Check the troubleshooting section
2. Review the skill file examples
3. Test with simple forms first before complex ones
4. Check browser console and server logs for errors

Happy building! 🚀
