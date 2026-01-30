'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CheckCircle2 } from 'lucide-react';

interface EndNodeData {
  message?: string;
}

export const EndNode = memo(function EndNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as EndNodeData;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white shadow-sm min-w-[150px] ${
        selected ? 'border-gray-500' : 'border-gray-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-500" />
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded bg-gray-100">
          <CheckCircle2 className="h-4 w-4 text-gray-600" />
        </div>
        <div>
          <span className="font-medium text-sm block">End</span>
          {nodeData.message && (
            <span className="text-xs text-gray-500 line-clamp-1">
              {nodeData.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
