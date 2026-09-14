
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Panel,
  NodeTypes,
  EdgeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { WorkflowNode } from './nodes/WorkflowNode';
import { ApprovalNode } from './nodes/ApprovalNode';
import { ConditionNode } from './nodes/ConditionNode';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { NodePalette } from './NodePalette';
import { WorkflowToolbar } from './WorkflowToolbar';
import { NodePropertiesPanel } from './NodePropertiesPanel';

// Define custom node types
const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  task: WorkflowNode,
  approval: ApprovalNode,
  condition: ConditionNode,
};

// Initial nodes for a basic workflow
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'start',
    position: { x: 250, y: 25 },
    data: { label: 'Start' },
  },
];

const initialEdges: Edge[] = [];

interface WorkflowDesignerProps {
  workflowId?: string;
  onSave?: (workflow: any) => void;
  onLoad?: (workflowId: string) => Promise<any>;
  readOnly?: boolean;
}

export const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({
  workflowId,
  onSave,
  onLoad,
  readOnly = false,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Load workflow data
  useEffect(() => {
    if (workflowId && onLoad) {
      onLoad(workflowId).then((workflow) => {
        if (workflow) {
          setNodes(workflow.definition?.nodes || initialNodes);
          setEdges(workflow.definition?.edges || initialEdges);
          setWorkflowName(workflow.name || 'Untitled Workflow');
          setWorkflowDescription(workflow.description || '');
        }
      });
    }
  }, [workflowId, onLoad, setNodes, setEdges]);

  // Handle connection between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return;
      
      setEdges((eds) => addEdge(params, eds));
      setIsDirty(true);
    },
    [setEdges, readOnly]
  );

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setIsPropertiesPanelOpen(true);
  }, []);

  // Handle node drag
  const onNodeDrag = useCallback(() => {
    if (!readOnly) {
      setIsDirty(true);
    }
  }, [readOnly]);

  // Add new node from palette
  const onAddNode = useCallback(
    (nodeType: string, position: { x: number; y: number }) => {
      if (readOnly) return;

      const newNode: Node = {
        id: `${Date.now()}`,
        type: nodeType,
        position,
        data: {
          label: getDefaultNodeLabel(nodeType),
          ...getDefaultNodeData(nodeType),
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setIsDirty(true);
    },
    [setNodes, readOnly]
  );

  // Update node properties
  const onUpdateNodeProperties = useCallback(
    (nodeId: string, properties: any) => {
      if (readOnly) return;

      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...properties } }
            : node
        )
      );
      setIsDirty(true);
    },
    [setNodes, readOnly]
  );

  // Delete selected node
  const onDeleteNode = useCallback(
    (nodeId: string) => {
      if (readOnly) return;

      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      setSelectedNode(null);
      setIsPropertiesPanelOpen(false);
      setIsDirty(true);
    },
    [setNodes, setEdges, readOnly]
  );

  // Save workflow
  const handleSave = useCallback(() => {
    if (!onSave) return;

    const workflow = {
      name: workflowName,
      description: workflowDescription,
      definition: {
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        })),
      },
    };

    onSave(workflow);
    setIsDirty(false);
  }, [onSave, workflowName, workflowDescription, nodes, edges]);

  // Validate workflow
  const validateWorkflow = useCallback(() => {
    const errors: string[] = [];

    // Check for start node
    const startNodes = nodes.filter((node) => node.type === 'start');
    if (startNodes.length === 0) {
      errors.push('Workflow must have a start node');
    } else if (startNodes.length > 1) {
      errors.push('Workflow can only have one start node');
    }

    // Check for end node
    const endNodes = nodes.filter((node) => node.type === 'end');
    if (endNodes.length === 0) {
      errors.push('Workflow must have at least one end node');
    }

    // Check for disconnected nodes
    const connectedNodeIds = new Set();
    edges.forEach((edge) => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    const disconnectedNodes = nodes.filter(
      (node) => node.type !== 'start' && !connectedNodeIds.has(node.id)
    );

    if (disconnectedNodes.length > 0) {
      errors.push(`${disconnectedNodes.length} node(s) are not connected`);
    }

    return errors;
  }, [nodes, edges]);

  return (
    <div className="h-full w-full flex">
      {/* Node Palette */}
      {!readOnly && (
        <NodePalette onAddNode={onAddNode} />
      )}

      {/* Main Workflow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDrag={onNodeDrag}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          
          {/* Workflow Toolbar */}
          <Panel position="top-left">
            <WorkflowToolbar
              workflowName={workflowName}
              onWorkflowNameChange={setWorkflowName}
              onSave={handleSave}
              onValidate={validateWorkflow}
              isDirty={isDirty}
              readOnly={readOnly}
            />
          </Panel>

          {/* Workflow Info */}
          <Panel position="top-right">
            <div className="bg-white p-4 rounded-lg shadow-lg border">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">
                Workflow Info
              </h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Nodes: {nodes.length}</div>
                <div>Connections: {edges.length}</div>
                <div>Status: {isDirty ? 'Modified' : 'Saved'}</div>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Node Properties Panel */}
      {isPropertiesPanelOpen && selectedNode && (
        <NodePropertiesPanel
          node={selectedNode}
          onUpdateProperties={(properties) =>
            onUpdateNodeProperties(selectedNode.id, properties)
          }
          onDeleteNode={() => onDeleteNode(selectedNode.id)}
          onClose={() => setIsPropertiesPanelOpen(false)}
          readOnly={readOnly}
        />
      )}
    </div>
  );
};

// Helper functions
function getDefaultNodeLabel(nodeType: string): string {
  const labels: Record<string, string> = {
    start: 'Start',
    end: 'End',
    task: 'Task',
    approval: 'Approval',
    condition: 'Condition',
    parallel: 'Parallel',
    merge: 'Merge',
    delay: 'Delay',
    webhook: 'Webhook',
    script: 'Script',
  };
  return labels[nodeType] || 'Node';
}

function getDefaultNodeData(nodeType: string): any {
  const defaultData: Record<string, any> = {
    start: {},
    end: {},
    task: {
      assignee: '',
      dueDate: '',
      priority: 'medium',
    },
    approval: {
      approvers: [],
      approvalType: 'any', // any, all, majority
      dueDate: '',
      escalation: {
        enabled: false,
        escalateTo: '',
        escalateAfter: 24, // hours
      },
    },
    condition: {
      conditions: [],
      operator: 'and', // and, or
    },
    parallel: {
      branches: [],
    },
    merge: {
      waitFor: 'all', // all, any
    },
    delay: {
      duration: 1,
      unit: 'hours', // minutes, hours, days
    },
    webhook: {
      url: '',
      method: 'POST',
      headers: {},
      payload: {},
    },
    script: {
      language: 'javascript',
      code: '',
    },
  };
  return defaultData[nodeType] || {};
}

export default WorkflowDesigner;
