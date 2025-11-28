# Phase 02: UI Components Update

## Context

- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** Phase 01 (API endpoint must exist)
- **Reference:** `components/ClaudeChat.tsx` lines 446-455

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-11-27 |
| Description | Replace Suggestions with shadcn Buttons + Dialog |
| Priority | High |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights

- Current `Suggestions` component at lines 446-455 uses custom styling
- shadcn `Button` already has `active:scale-[0.98]` animation
- shadcn `Dialog` has built-in open/close animations
- Need state for: dialog open, selected product, sales order input, loading, feedback

## Requirements

1. Replace `Suggestions` + `Suggestion` with shadcn `Button` components
2. Style buttons appropriately (outline variant fits current design)
3. Add press animation (already in Button component)
4. On click: open Dialog with product name in title
5. Dialog contains Input for sales order number
6. Submit button calls API from Phase 01
7. Show loading state during API call
8. Show success/error toast or inline message

## Architecture

```
WelcomeScreen
├── State: dialogOpen, selectedProduct, salesOrder, isSubmitting, feedback
├── Button (SDI) → onClick: setSelectedProduct("SDI"), setDialogOpen(true)
├── Button (EMJAC) → onClick: setSelectedProduct("EMJAC"), setDialogOpen(true)
├── Button (Harmonic) → onClick: setSelectedProduct("Harmonic"), setDialogOpen(true)
└── Dialog (controlled by dialogOpen)
    ├── DialogHeader → "Create {selectedProduct} Project"
    ├── Input → salesOrder value
    ├── DialogFooter
    │   ├── Button (Cancel) → close dialog
    │   └── Button (Create) → handleSubmit()
    └── Feedback message (success/error)
```

## Related Code Files

| File | Purpose |
|------|---------|
| `components/ClaudeChat.tsx` | Main file to modify |
| `components/ui/button.tsx` | Button component |
| `components/ui/dialog.tsx` | Dialog components |
| `components/ui/input.tsx` | Input component |

## Implementation Steps

### Step 1: Add imports
Add to `ClaudeChat.tsx` imports:
```typescript
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
```

### Step 2: Remove old imports
Remove (if not used elsewhere):
```typescript
// Remove these if only used in WelcomeScreen:
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
```

### Step 3: Update WelcomeScreen component
Replace the function with state and dialog:

```typescript
function WelcomeScreen({ onSuggestionClick }: { onSuggestionClick?: (text: string) => void }) {
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
        setSalesOrder("");
        // Auto-close after success
        setTimeout(() => {
          setDialogOpen(false);
          setFeedback(null);
        }, 2000);
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
```

### Step 4: Clean up unused imports
Remove `Suggestion`, `Suggestions` imports if no longer needed elsewhere in file.

## Todo List

- [ ] Add shadcn component imports (Button, Dialog, Input)
- [ ] Add useState import if not present
- [ ] Update WelcomeScreen with state management
- [ ] Replace Suggestions with Button components
- [ ] Add Dialog with form
- [ ] Implement handleSubmit with API call
- [ ] Add feedback display
- [ ] Remove unused Suggestion imports
- [ ] Test full flow

## Success Criteria

- [ ] Buttons render in grid layout
- [ ] Button press shows scale animation
- [ ] Click opens dialog with correct product name
- [ ] Input accepts sales order number
- [ ] Enter key submits form
- [ ] Loading state shown during submission
- [ ] Success message displays and auto-closes
- [ ] Error message displays on failure
- [ ] Cancel button closes dialog

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| State complexity | Low | Low | Keep state localized in WelcomeScreen |
| Dialog z-index issues | Low | Low | shadcn Dialog handles properly |

## Security Considerations

- No sensitive data in client state
- API handles all validation

## Next Steps

After completion:
1. Manual testing of full flow
2. Code review
3. Commit changes
