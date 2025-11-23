# Workflow Viewer Modal - Implementation Plan

**Created by**: shadcn-ui-designer agent
**Date**: 2025-11-22
**Status**: READY FOR IMPLEMENTATION

---

## Overview

This document provides a comprehensive implementation plan for creating a Workflow Viewer Modal that mirrors the exact structure and styling of the existing `model-viewer-modal.tsx`. The modal will display the React Flow workflow visualization within a large modal dialog triggered from the sidebar.

---

## Icon Recommendation

After researching Lucide icons for the workflow button, I recommend:

### Primary Choice: `GitBranch`
- **Reason**: Best represents branching workflow paths and decision trees
- **Visual**: Shows a branching structure that matches the workflow visualization
- **Consistency**: Works well alongside the `Box` icon used for 3D Viewer

### Alternative Options:
| Icon | Use Case | Notes |
|------|----------|-------|
| `Workflow` | Generic workflow | More abstract, less distinctive |
| `Share2` | Network/sharing | Could be confused with sharing features |
| `Network` | Network diagram | Good alternative for interconnected nodes |
| `GitBranch` | Branching paths | **RECOMMENDED** - clear visual metaphor |

---

## File Structure

```
components/
  providers/
    workflow-modal-provider.tsx   # NEW - Context provider
  workflow-viewer-modal.tsx       # NEW - Modal component
  leftsidebar.tsx                 # MODIFY - Add Workflow button
app/
  layout.tsx                      # MODIFY - Add provider + modal
```

---

## Implementation Details

### 1. Workflow Modal Provider

**File**: `components/providers/workflow-modal-provider.tsx`

```tsx
"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface WorkflowModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const WorkflowModalContext = createContext<WorkflowModalContextType | undefined>(undefined);

export function WorkflowModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <WorkflowModalContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </WorkflowModalContext.Provider>
  );
}

export function useWorkflowModal() {
  const context = useContext(WorkflowModalContext);
  if (context === undefined) {
    throw new Error("useWorkflowModal must be used within a WorkflowModalProvider");
  }
  return context;
}
```

---

### 2. Workflow Viewer Modal Component

**File**: `components/workflow-viewer-modal.tsx`

```tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon, Maximize2, Minimize2, Download, GitBranch } from "lucide-react";
import { useNodesState, useEdgesState } from "@xyflow/react";
import type { Node, Edge } from "@xyflow/react";

import { cn } from "@/lib/utils";
import { Canvas } from "@/components/ai-elements/canvas";
import { Controls } from "@/components/ai-elements/controls";
import { WorkflowNode } from "@/components/workflow/workflow-node";
import { workflowEdgeTypes, edgeAnimationStyles } from "@/components/workflow/workflow-edges";
import { useWorkflowModal } from "@/components/providers/workflow-modal-provider";
import { Button } from "@/components/ui/button";

// Node IDs - centralized reference
const nodeIds = {
  start: 'start',
  process1: 'process1',
  process2: 'process2',
  decision: 'decision',
  output1: 'output1',
  output2: 'output2',
  complete: 'complete',
} as const;

// Mock workflow nodes with complete configuration
const initialNodes: Node[] = [
  {
    id: nodeIds.start,
    type: 'workflow',
    position: { x: 0, y: 0 },
    data: {
      label: 'Start',
      description: 'Initialize workflow',
      handles: { target: false, source: true },
      content: 'Triggered by user action at 09:30 AM',
      footer: 'Status: Ready',
    },
  },
  {
    id: nodeIds.process1,
    type: 'workflow',
    position: { x: 500, y: 0 },
    data: {
      label: 'Process Data',
      description: 'Transform input',
      handles: { target: true, source: true },
      content: 'Validating 1,234 records and applying business rules',
      footer: 'Duration: ~2.5s',
    },
  },
  {
    id: nodeIds.decision,
    type: 'workflow',
    position: { x: 1000, y: 0 },
    data: {
      label: 'Decision Point',
      description: 'Route based on conditions',
      handles: { target: true, source: true },
      content: "Evaluating: data.status === 'valid' && data.score > 0.8",
      footer: 'Confidence: 94%',
    },
  },
  {
    id: nodeIds.output1,
    type: 'workflow',
    position: { x: 1500, y: -300 },
    data: {
      label: 'Success Path',
      description: 'Handle success case',
      handles: { target: true, source: true },
      content: '1,156 records passed validation (93.7%)',
      footer: 'Next: Send to production',
    },
  },
  {
    id: nodeIds.output2,
    type: 'workflow',
    position: { x: 1500, y: 300 },
    data: {
      label: 'Error Path',
      description: 'Handle error case',
      handles: { target: true, source: true },
      content: '78 records failed validation (6.3%)',
      footer: 'Next: Queue for review',
    },
  },
  {
    id: nodeIds.process2,
    type: 'workflow',
    position: { x: 2000, y: 0 },
    data: {
      label: 'Complete',
      description: 'Finalize workflow',
      handles: { target: true, source: false },
      content: 'All records processed and routed successfully',
      footer: 'Total time: 4.2s',
    },
  },
];

// Workflow edges - main flow (animated) and conditional branches
const initialEdges: Edge[] = [
  {
    id: 'edge1',
    source: nodeIds.start,
    target: nodeIds.process1,
    animated: true,
  },
  {
    id: 'edge2',
    source: nodeIds.process1,
    target: nodeIds.decision,
    animated: true,
  },
  {
    id: 'edge3',
    source: nodeIds.decision,
    target: nodeIds.output1,
    animated: true,
  },
  {
    id: 'edge4',
    source: nodeIds.decision,
    target: nodeIds.output2,
    animated: false,
  },
  {
    id: 'edge5',
    source: nodeIds.output1,
    target: nodeIds.process2,
    animated: true,
  },
  {
    id: 'edge6',
    source: nodeIds.output2,
    target: nodeIds.process2,
    animated: false,
  },
];

export function WorkflowViewerModal() {
  const { isOpen, close } = useWorkflowModal();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, close]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogPrimitive.Portal>
        {/* Blurred Overlay */}
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/60 backdrop-blur-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />

        {/* Modal Content */}
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 bg-background border border-border rounded-2xl shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "duration-300 ease-out",
            // Positioning - centered with responsive sizing
            isFullscreen
              ? "inset-2 sm:inset-4"
              : "top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] h-[90vh] max-w-7xl"
          )}
        >
          {/* Header Bar */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm border-b border-border rounded-t-2xl">
            <div className="flex items-center gap-3">
              <GitBranch className="h-5 w-5 text-primary" />
              <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                Workflow Visualization
              </DialogPrimitive.Title>
            </div>

            <div className="flex items-center gap-2">
              {/* Export Button */}
              <Button
                variant="secondary"
                size="sm"
                className="hidden sm:flex gap-2"
                onClick={() => console.log("Export workflow")}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>

              {/* Fullscreen Toggle */}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>

              {/* Close Button */}
              <DialogPrimitive.Close asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close modal"
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Workflow Canvas Container */}
          <div className="relative w-full h-full pt-14 overflow-hidden rounded-b-2xl">
            {/* Inject edge animation styles */}
            <style>{edgeAnimationStyles}</style>

            {/* React Flow Canvas */}
            <Canvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={{ workflow: WorkflowNode }}
              edgeTypes={workflowEdgeTypes}
              fitView
            >
              {/* Top-right controls */}
              <Controls position="top-right" />

              {/* Workflow Statistics Panel - bottom left */}
              <div className="absolute bottom-4 left-4 z-10 bg-card border rounded-lg p-4 w-72 shadow-lg">
                <h3 className="font-semibold text-sm mb-3">Workflow Statistics</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Nodes:</span>
                    <span className="font-medium">{nodes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Edges:</span>
                    <span className="font-medium">{edges.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Animated Paths:</span>
                    <span className="font-medium">{edges.filter(e => e.animated).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Execution Time:</span>
                    <span className="font-medium">4.2s</span>
                  </div>
                  <div className="pt-2 border-t mt-2">
                    <span className="text-muted-foreground">Status: </span>
                    <span className="font-medium text-green-500">Completed</span>
                  </div>
                </div>
              </div>
            </Canvas>
          </div>

          {/* Hidden description for accessibility */}
          <DialogPrimitive.Description className="sr-only">
            Interactive workflow execution and state management visualization with nodes and edges.
          </DialogPrimitive.Description>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
```

---

### 3. Sidebar Modification

**File**: `components/leftsidebar.tsx`

**Changes Required**:

1. Add import for `GitBranch` icon and `useWorkflowModal` hook
2. Add Workflow button after the 3D Viewer button

**Import additions** (at top of file):
```tsx
import { Box, GitBranch, MessageSquare, Plus, Trash2 } from "lucide-react";
import { useWorkflowModal } from "@/components/providers/workflow-modal-provider";
```

**Hook usage** (inside LeftSidebar component):
```tsx
const { open: openWorkflowModal } = useWorkflowModal();
```

**New button** (add after the 3D Viewer button block, around line 145):
```tsx
{/* Workflow Viewer Button */}
<div className="mb-6 px-2">
  <button
    onClick={() => {
      openWorkflowModal();
      // Close mobile sidebar after opening modal
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        closeSidebar();
      }
    }}
    className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-gradient-to-br from-emerald-50 to-slate-50 px-5 py-3.5 text-sm font-semibold text-emerald-600 shadow-md transition-all duration-200 hover:border-emerald-400 hover:from-emerald-100 hover:to-emerald-50 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 dark:border-emerald-900/50 dark:bg-gradient-to-br dark:from-emerald-950/40 dark:to-emerald-900/20 dark:text-emerald-400 dark:shadow-lg dark:hover:border-emerald-700 dark:hover:from-emerald-950/60 dark:hover:to-emerald-900/30 dark:hover:text-emerald-300"
    aria-label="Open Workflow Viewer"
  >
    <GitBranch className="h-5 w-5" />
    Workflow
  </button>
</div>
```

**Color Scheme for Workflow Button**:
- Uses **emerald** color palette (green) to differentiate from the blue 3D Viewer button
- Light mode: emerald-50/emerald-600 gradient
- Dark mode: emerald-950/emerald-400 gradient

---

### 4. Layout Modification

**File**: `app/layout.tsx`

**Changes Required**:

1. Add imports for new provider and modal
2. Wrap with WorkflowModalProvider (inside ModelModalProvider)
3. Add WorkflowViewerModal component

**Updated imports**:
```tsx
import { WorkflowModalProvider } from "@/components/providers/workflow-modal-provider";
import { WorkflowViewerModal } from "@/components/workflow-viewer-modal";
```

**Updated provider tree** (complete layout):
```tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#0a0f1a] font-sans antialiased`}
      >
        <ThemeProvider defaultTheme="dark" storageKey="emjac-theme">
          <SidebarProvider>
            <ModelModalProvider>
              <WorkflowModalProvider>
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                {/* Modals rendered at root level */}
                <ModelViewerModal />
                <WorkflowViewerModal />
              </WorkflowModalProvider>
            </ModelModalProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## React Flow Specific Considerations

### 1. React Flow Provider Requirement

React Flow requires `ReactFlowProvider` when hooks like `useNodesState` and `useEdgesState` are used. However, the current `Canvas` component wraps `ReactFlow` directly without the provider.

**Current Implementation Analysis**:
- The `Canvas` component at `components/ai-elements/canvas.tsx` uses `ReactFlow` directly
- The hooks are used in the parent component (modal)
- This should work because React Flow hooks can be used outside the provider if the ReactFlow component is a child

**If Issues Arise**:
If there are issues with the React Flow hooks in modal context, wrap the Canvas with ReactFlowProvider:

```tsx
import { ReactFlowProvider } from "@xyflow/react";

// Inside modal content:
<ReactFlowProvider>
  <Canvas ... />
</ReactFlowProvider>
```

### 2. Modal Container Sizing

React Flow requires its container to have explicit dimensions. The modal handles this with:
- `h-full` on the container
- `pt-14` to account for the header bar
- Container inherits full modal dimensions

### 3. Fit View on Open

The `fitView` prop on Canvas ensures the workflow fits within the visible area when the modal opens.

### 4. Keyboard Navigation

- ESC key closes the modal (handled in useEffect)
- React Flow's default keyboard shortcuts remain active within the canvas
- Tab navigation works for buttons in header and statistics panel

---

## Accessibility Checklist

- [x] Modal title with `DialogPrimitive.Title`
- [x] Hidden description with `DialogPrimitive.Description` + `sr-only`
- [x] Close button with proper `aria-label`
- [x] Fullscreen toggle with dynamic `aria-label`
- [x] Focus trap within modal (Radix handles this)
- [x] ESC key to close
- [x] Click outside to close (via overlay)
- [x] Body scroll lock when open

---

## Testing Recommendations

1. **Modal Open/Close**
   - Click sidebar button to open
   - Press ESC to close
   - Click overlay to close
   - Click X button to close

2. **Fullscreen Toggle**
   - Toggle fullscreen mode
   - Verify proper sizing in both modes
   - Test on different screen sizes

3. **React Flow Interactions**
   - Pan and zoom canvas
   - Select nodes
   - Use Controls panel

4. **Mobile Responsiveness**
   - Open modal on mobile
   - Verify sidebar closes after opening modal
   - Check statistics panel visibility

5. **Theme Switching**
   - Test in light mode
   - Test in dark mode
   - Verify all elements respect theme

---

## Summary of Changes

| File | Action | Description |
|------|--------|-------------|
| `components/providers/workflow-modal-provider.tsx` | CREATE | Context provider for modal state |
| `components/workflow-viewer-modal.tsx` | CREATE | Modal component with React Flow canvas |
| `components/leftsidebar.tsx` | MODIFY | Add Workflow button with GitBranch icon |
| `app/layout.tsx` | MODIFY | Add WorkflowModalProvider and WorkflowViewerModal |

---

## Implementation Order

1. Create `workflow-modal-provider.tsx` first (no dependencies)
2. Create `workflow-viewer-modal.tsx` (depends on provider)
3. Modify `layout.tsx` (add provider and modal)
4. Modify `leftsidebar.tsx` (add button)
5. Test the complete flow

---

**End of Implementation Plan**
