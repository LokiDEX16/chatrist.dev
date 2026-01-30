'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';

interface MessageNodeData {
  content: string;
  personalization: boolean;
}

export const MessageNode = memo(function MessageNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as MessageNodeData;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white shadow-sm min-w-[200px] max-w-[280px] ${
        selected ? 'border-blue-500' : 'border-blue-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded bg-blue-100">
          <MessageSquare className="h-4 w-4 text-blue-600" />
        </div>
        <span className="font-medium text-sm">Message</span>
      </div>
      <p className="text-xs text-gray-600 line-clamp-3">
        {nodeData.content || 'No message set'}
      </p>
      {nodeData.personalization && (
        <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
          Personalized
        </span>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  );
});
