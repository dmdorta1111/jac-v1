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
