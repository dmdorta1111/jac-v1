'use client';

import { Canvas } from '@/components/ai-elements/canvas';
import { Controls } from '@/components/ai-elements/controls';
import { Button } from '@/components/ui/button';
import { useNodesState, useEdgesState } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import { WorkflowNode } from '@/components/workflow/workflow-node';
import { workflowEdgeTypes, edgeAnimationStyles } from '@/components/workflow/workflow-edges';

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

export default function WorkflowPage() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-screen bg-background flex flex-col">
      {/* Header section */}
      <div className="border-b bg-card px-6 py-4 sm:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Workflow Visualization</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Interactive workflow execution and state management
            </p>
          </div>
          <Button size="sm" variant="secondary">
            Export Workflow
          </Button>
        </div>
      </div>

      {/* Canvas container */}
      <div className="flex-1 relative">
        <style>{edgeAnimationStyles}</style>
        <Canvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={{ workflow: WorkflowNode }}
          edgeTypes={workflowEdgeTypes}
          fitView
        >
          {/* Top-left toolbar */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Button size="sm" variant="outline" className="text-xs">
              Reset View
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Zoom Fit
            </Button>
          </div>

          {/* Top-right controls */}
          <Controls position="top-right" />

          {/* Workflow info panel - bottom left */}
          <div className="absolute bottom-4 left-4 z-10 bg-card border rounded-lg p-4 w-80 shadow-lg">
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
    </div>
  );
}
