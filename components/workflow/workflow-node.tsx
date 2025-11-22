import React from 'react';
import { Node, NodeHeader, NodeTitle, NodeDescription, NodeContent, NodeFooter } from '@/components/ai-elements/node';
import { Toolbar } from '@/components/ai-elements/toolbar';
import { Button } from '@/components/ui/button';

interface WorkflowNodeData {
  label: string;
  description: string;
  content: string;
  footer: string;
  handles?: {
    target?: boolean;
    source?: boolean;
  };
}

interface WorkflowNodeProps {
  data: WorkflowNodeData;
}

/**
 * Custom workflow node component
 * Displays a workflow step with header, content, footer, and action buttons
 * Integrates with React Flow for node and edge connection handling
 */
export const WorkflowNode: React.FC<WorkflowNodeProps> = ({ data }) => {
  const { label, description, content, footer, handles = { target: true, source: true } } = data;

  // Ensure handles have proper boolean values
  const nodeHandles = {
    target: handles.target ?? true,
    source: handles.source ?? true,
  };

  return (
    <Node
      handles={nodeHandles}
      className="w-72"
    >
      {/* Node header with title and description */}
      <NodeHeader>
        <NodeTitle>{label}</NodeTitle>
        <NodeDescription>{description}</NodeDescription>
      </NodeHeader>

      {/* Main content area with workflow data */}
      <NodeContent className="text-sm text-muted-foreground min-h-12">
        {content}
      </NodeContent>

      {/* Footer with metadata and status */}
      <NodeFooter className="text-xs text-muted-foreground">
        {footer}
      </NodeFooter>

      {/* Toolbar with edit and delete actions */}
      <Toolbar>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          onClick={() => console.log(`Edit node: ${label}`)}
        >
          Edit
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          onClick={() => console.log(`Delete node: ${label}`)}
        >
          Delete
        </Button>
      </Toolbar>
    </Node>
  );
};

export default WorkflowNode;
