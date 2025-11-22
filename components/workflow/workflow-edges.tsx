import React from 'react';
import { BaseEdge, getSmoothStepPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

/**
 * Animated edge for main workflow flow
 * Shows active/in-progress connections with animation
 */
export const AnimatedWorkflowEdge: React.FC<EdgeProps> = (props) => {
  const { id, sourceX, sourceY, targetX, targetY } = props;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: 'var(--primary)', strokeWidth: 2 }} />
      {/* Animated dash pattern for visual flow indication */}
      <BaseEdge
        id={`${id}-animation`}
        path={edgePath}
        style={{
          stroke: 'var(--primary)',
          strokeWidth: 2,
          strokeDasharray: 5,
          strokeDashoffset: 0,
          animation: 'dash 0.5s linear infinite',
        }}
      />
    </>
  );
};

/**
 * Temporary/conditional edge for alternative paths
 * Shows dashed lines for conditional or error paths
 */
export const TemporaryWorkflowEdge: React.FC<EdgeProps> = (props) => {
  const { id, sourceX, sourceY, targetX, targetY } = props;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: 'var(--muted-foreground)',
        strokeWidth: 2,
        strokeDasharray: '5,5',
      }}
    />
  );
};

/**
 * Edge type map for React Flow
 * Defines custom renderers for different edge types in the workflow
 */
export const workflowEdgeTypes = {
  animated: AnimatedWorkflowEdge,
  temporary: TemporaryWorkflowEdge,
} as const;

/**
 * Global style injection for edge animations
 * Add this to your global CSS or import in your layout
 */
export const edgeAnimationStyles = `
  @keyframes dash {
    to {
      stroke-dashoffset: -10;
    }
  }
`;
