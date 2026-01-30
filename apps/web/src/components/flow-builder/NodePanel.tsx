'use client';

import { MessageSquare, MousePointer2, Clock, GitBranch, FormInput, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const nodeTypes = [
  {
    type: 'message',
    label: 'Message',
    description: 'Send a text message',
    icon: MessageSquare,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    type: 'button',
    label: 'Buttons',
    description: 'Send message with buttons',
    icon: MousePointer2,
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    type: 'delay',
    label: 'Delay',
    description: 'Wait before next step',
    icon: Clock,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branch based on data',
    icon: GitBranch,
    color: 'bg-green-100 text-green-600',
  },
  {
    type: 'capture',
    label: 'Capture',
    description: 'Collect user input',
    icon: FormInput,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    type: 'end',
    label: 'End',
    description: 'End the flow',
    icon: CheckCircle2,
    color: 'bg-gray-100 text-gray-600',
  },
];

export function NodePanel() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 border-l bg-white p-4 overflow-y-auto">
      <h3 className="font-semibold mb-4">Node Types</h3>
      <div className="space-y-2">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
            className="flex items-center gap-3 p-3 border rounded-lg cursor-grab hover:bg-gray-50 transition-colors"
          >
            <div className={`p-2 rounded-lg ${node.color}`}>
              <node.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-sm">{node.label}</p>
              <p className="text-xs text-muted-foreground">{node.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-xs text-muted-foreground">
        <p className="font-medium mb-2">How to use:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Drag nodes onto the canvas</li>
          <li>Connect nodes by dragging from handles</li>
          <li>Click a node to edit its properties</li>
          <li>Use delete key to remove selected nodes</li>
        </ul>
      </div>
    </div>
  );
}
