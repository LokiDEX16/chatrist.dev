'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

interface ConditionNodeData {
  variable: string;
  operator: 'equals' | 'contains' | 'exists' | 'not_equals' | 'not_contains';
  value: string;
}

export const ConditionNode = memo(function ConditionNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as ConditionNodeData;

  const formatCondition = () => {
    const variable = nodeData.variable || 'variable';
    const operator = nodeData.operator || 'equals';
    const value = nodeData.value || '';

    if (operator === 'exists') {
      return `${variable} exists`;
    }
    if (operator === 'not_equals') {
      return `${variable} not equals "${value}"`;
    }
    if (operator === 'not_contains') {
      return `${variable} not contains "${value}"`;
    }
    return `${variable} ${operator} "${value}"`;
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white shadow-sm min-w-[180px] ${
        selected ? 'border-green-500' : 'border-green-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-green-500" />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded bg-green-100">
          <GitBranch className="h-4 w-4 text-green-600" />
        </div>
        <span className="font-medium text-sm">Condition</span>
      </div>
      <p className="text-xs text-gray-600 text-center mb-2">{formatCondition()}</p>
      <div className="flex justify-between text-xs">
        <span className="text-green-600">Yes</span>
        <span className="text-red-600">No</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!bg-green-500"
        style={{ left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!bg-red-500"
        style={{ left: '70%' }}
      />
    </div>
  );
});
