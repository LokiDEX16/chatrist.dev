'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MousePointer2 } from 'lucide-react';

interface ButtonOption {
  id: string;
  label: string;
  type: 'reply' | 'url';
  value?: string;
}

interface ButtonNodeData {
  message: string;
  buttons: ButtonOption[];
}

export const ButtonNode = memo(function ButtonNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as ButtonNodeData;
  const buttons = nodeData.buttons || [];

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white shadow-sm min-w-[200px] max-w-[280px] ${
        selected ? 'border-indigo-500' : 'border-indigo-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-indigo-500" />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded bg-indigo-100">
          <MousePointer2 className="h-4 w-4 text-indigo-600" />
        </div>
        <span className="font-medium text-sm">Buttons</span>
      </div>
      <p className="text-xs text-[#475569] line-clamp-2 mb-2">
        {nodeData.message || 'No message set'}
      </p>
      <div className="space-y-1">
        {buttons.slice(0, 3).map((btn, index) => (
          <div
            key={btn.id}
            className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-center"
          >
            {btn.label || `Button ${index + 1}`}
          </div>
        ))}
        {buttons.length === 0 && (
          <div className="text-xs text-[#94A3B8] text-center py-1">No buttons</div>
        )}
      </div>
      {buttons.map((btn, index) => (
        <Handle
          key={btn.id}
          type="source"
          position={Position.Bottom}
          id={btn.label}
          className="!bg-indigo-500"
          style={{ left: `${((index + 1) / (buttons.length + 1)) * 100}%` }}
        />
      ))}
      {buttons.length === 0 && (
        <Handle type="source" position={Position.Bottom} className="!bg-indigo-500" />
      )}
    </div>
  );
});
