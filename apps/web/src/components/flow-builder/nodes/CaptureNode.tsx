'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FormInput } from 'lucide-react';

interface CaptureNodeData {
  field: 'email' | 'name' | 'phone' | 'custom';
  customFieldName?: string;
  validationType?: 'email' | 'phone' | 'none';
  promptMessage: string;
  retryMessage?: string;
  maxRetries?: number;
}

export const CaptureNode = memo(function CaptureNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as CaptureNodeData;

  const getFieldLabel = () => {
    if (nodeData.field === 'custom') {
      return nodeData.customFieldName || 'Custom';
    }
    const labels: Record<string, string> = { email: 'Email', name: 'Name', phone: 'Phone' };
    return labels[nodeData.field] || nodeData.field;
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white shadow-sm min-w-[200px] max-w-[280px] ${
        selected ? 'border-pink-500' : 'border-pink-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-pink-500" />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded bg-pink-100">
          <FormInput className="h-4 w-4 text-pink-600" />
        </div>
        <span className="font-medium text-sm">Capture</span>
        <span className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded">
          {getFieldLabel()}
        </span>
      </div>
      <p className="text-xs text-gray-600 line-clamp-2">
        {nodeData.promptMessage || 'No prompt set'}
      </p>
      <Handle type="source" position={Position.Bottom} className="!bg-pink-500" />
    </div>
  );
});
