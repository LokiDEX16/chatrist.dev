'use client';

import { useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MessageNode } from './nodes/MessageNode';
import { ButtonNode } from './nodes/ButtonNode';
import { DelayNode } from './nodes/DelayNode';
import { ConditionNode } from './nodes/ConditionNode';
import { CaptureNode } from './nodes/CaptureNode';
import { EndNode } from './nodes/EndNode';
import { NodePanel } from './NodePanel';
import { NodeEditor } from './NodeEditor';
import { Button } from '@/components/ui/button';
import { Save, Undo, Redo } from 'lucide-react';

const nodeTypes = {
  message: MessageNode,
  button: ButtonNode,
  delay: DelayNode,
  condition: ConditionNode,
  capture: CaptureNode,
  end: EndNode,
};

interface FlowBuilderProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave: (nodes: Node[], edges: Edge[]) => void;
  isSaving?: boolean;
}

let nodeId = 0;
const getNodeId = () => `node_${nodeId++}`;

function FlowBuilderInner({
  initialNodes = [],
  initialEdges = [],
  onSave,
  isSaving = false,
}: FlowBuilderProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = {
        x: event.clientX - (reactFlowWrapper.current?.getBoundingClientRect().left || 0),
        y: event.clientY - (reactFlowWrapper.current?.getBoundingClientRect().top || 0),
      };

      const newNode: Node = {
        id: getNodeId(),
        type,
        position,
        data: getDefaultNodeData(type),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onNodeDataChange = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...data } };
          }
          return node;
        })
      );
      if (selectedNode?.id === nodeId) {
        setSelectedNode((prev) => (prev ? { ...prev, data: { ...prev.data, ...data } } : null));
      }
    },
    [setNodes, selectedNode]
  );

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
    },
    [setNodes, setEdges, selectedNode]
  );

  const handleSave = () => {
    onSave(nodes, edges);
  };

  return (
    <div className="h-[calc(100vh-180px)] flex">
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50"
        >
          <Panel position="top-right" className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Flow'}
            </Button>
          </Panel>
          <Controls />
          <MiniMap zoomable pannable />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
      <NodePanel />
      {selectedNode && (
        <NodeEditor
          node={selectedNode}
          onDataChange={(data) => onNodeDataChange(selectedNode.id, data)}
          onDelete={() => onDeleteNode(selectedNode.id)}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}

export function FlowBuilder(props: FlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <FlowBuilderInner {...props} />
    </ReactFlowProvider>
  );
}

function getDefaultNodeData(type: string): any {
  switch (type) {
    case 'message':
      return { content: 'Enter your message here...', personalization: false };
    case 'button':
      return { message: 'Please choose an option:', buttons: [] };
    case 'delay':
      return { duration: 5, unit: 'minutes' };
    case 'condition':
      return { variable: '', operator: 'equals', value: '' };
    case 'capture':
      return { field: 'email', promptMessage: 'Please enter your email:' };
    case 'end':
      return { message: '' };
    default:
      return {};
  }
}
