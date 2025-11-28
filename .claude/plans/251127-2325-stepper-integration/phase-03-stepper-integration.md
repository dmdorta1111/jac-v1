# Phase 03: Stepper Integration in ClaudeChat

## Context

- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** Phase 01 (form cleanup), Phase 02 (header alignment)

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-11-27 |
| Description | Integrate vertical stepper with conditional display and animations |
| Priority | High |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights

- `defineStepper` from `@/components/ui/stepper` creates stepper configuration
- Stepper supports `variant="vertical"` for side placement
- CircleStepIndicator shows progress (currentStep/totalSteps)
- Need state management for visibility toggle after form submission

## Requirements

1. Import `defineStepper` from stepper component
2. Define steps: "Project Header", "Item Data" (placeholder)
3. Position stepper vertically between LeftSidebar and chat
4. Show stepper only after project-header form submission
5. Remove/hide form from chat after submission
6. Animate stepper entrance (slide-in from left)
7. Responsive: hidden on mobile/tablet, visible on lg+
8. Theme-consistent styling

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        ClaudeChat                           │
├────────────┬──────────────┬─────────────────────────────────┤
│ LeftSidebar │   Stepper    │       Main Chat Area            │
│  (existing) │ (conditional)│                                 │
│             │  lg:flex     │                                 │
│             │  w-64        │                                 │
│             │  border-r    │                                 │
└────────────┴──────────────┴─────────────────────────────────┘
```

## Related Code Files

| File | Lines | Purpose |
|------|-------|---------|
| `components/ClaudeChat.tsx` | 1-891 | Main chat component |
| `components/ui/stepper.tsx` | 1-533 | Stepper component |

## Implementation Steps

### Step 1: Import and Define Stepper

```tsx
// Add to imports
import { defineStepper } from "@/components/ui/stepper";

// Define stepper outside component (after imports)
const { Stepper, useStepper, steps } = defineStepper(
  { id: "project-header", title: "Project Header", description: "Basic project info" },
  { id: "item-data", title: "Item Data", description: "Item specifications" }
);
```

### Step 2: Add State for Stepper Visibility

```tsx
// Inside ClaudeChat component, add state
const [showStepper, setShowStepper] = useState(false);
const [formSubmitted, setFormSubmitted] = useState(false);
```

### Step 3: Update handleFormSubmit

```tsx
// In handleFormSubmit, after success response
if (data.success) {
  // ... existing metadata update code ...

  // Show stepper and mark form as submitted
  setShowStepper(true);
  setFormSubmitted(true);

  // Filter out form message or add submitted flag
  setMessages((prev) => prev.map(msg =>
    msg.formSpec ? { ...msg, formSpec: undefined, formSubmitted: true } : msg
  ));

  // ... existing success message ...
}
```

### Step 4: Add Stepper Component in JSX

Insert between LeftSidebar and Main Chat Area (after line 425):

```tsx
{/* Vertical Stepper - Desktop Only */}
{showStepper && (
  <div className="hidden lg:flex flex-col w-64 border-r border-border bg-background/50 p-4 animate-in slide-in-from-left duration-300">
    <Stepper.Provider variant="vertical" className="h-full">
      <Stepper.Navigation className="flex-1">
        {steps.map((step) => (
          <Stepper.Step key={step.id} of={step.id}>
            <Stepper.Title>{step.title}</Stepper.Title>
            <Stepper.Description>{step.description}</Stepper.Description>
          </Stepper.Step>
        ))}
      </Stepper.Navigation>
    </Stepper.Provider>
  </div>
)}
```

### Step 5: Add Custom Animation (if needed)

In tailwind.config or inline:
```tsx
className="transition-all duration-300 ease-out transform
           data-[state=open]:translate-x-0
           data-[state=closed]:-translate-x-full"
```

Or use Tailwind's built-in animate utilities:
```tsx
className="animate-in slide-in-from-left-full duration-300"
```

## Todo List

- [ ] Import defineStepper from stepper component
- [ ] Create stepper definition with 2 steps
- [ ] Add showStepper and formSubmitted state
- [ ] Update handleFormSubmit to show stepper on success
- [ ] Filter/modify messages to remove form after submission
- [ ] Add stepper JSX between LeftSidebar and chat
- [ ] Apply vertical orientation and lg:flex visibility
- [ ] Add slide-in animation classes
- [ ] Style with theme colors and border
- [ ] Test responsive behavior

## Success Criteria

1. Stepper hidden initially
2. After form submit: stepper slides in from left
3. Form disappears from chat messages
4. Stepper shows 2 steps with titles/descriptions
5. Hidden on mobile/tablet viewports
6. Consistent with project theme
7. Smooth animation (300ms duration)

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Stepper library conflicts | Low | Test import compatibility |
| State sync issues | Medium | Careful state update sequencing |
| Animation jank | Low | Use GPU-accelerated transforms |
| Layout shift | Medium | Fixed width stepper container |

## Security Considerations

None - UI enhancement only

## Unresolved Questions

1. Should stepper track actual step completion state?
2. Will additional steps be added dynamically for "Item Data" forms?
3. Should stepper be clickable to navigate between steps?

## Next Steps

After implementation, verify:
- Visual appearance matches design intent
- Animation timing feels natural
- No console errors from stepper library
- Form submission flow works correctly
