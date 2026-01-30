'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';

interface DelayNodeData {
  duration: number;
  unit: 'seconds' | 'minutes' | 'hours';
}

export const DelayNode = memo(function DelayNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as DelayNodeData;

  const formatDuration = () => {
    const duration = nodeData.duration || 5;
    const unit = nodeData.unit || 'minutes';
    return `${duration} ${duration === 1 ? unit.slice(0, -1) : unit}`;
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white shadow-sm min-w-[150px] ${
        selected ? 'border-orange-500' : 'border-orange-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-orange-500" />
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded bg-orange-100">
          <Clock className="h-4 w-4 text-orange-600" />
        </div>
        <div>
          <span className="font-medium text-sm block">Delay</span>
          <span className="text-xs text-gray-600">{formatDuration()}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-orange-500" />
    </div>
  );
});
