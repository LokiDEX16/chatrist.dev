// Flow Builder Types

export type FlowNodeType = 'message' | 'button' | 'delay' | 'condition' | 'capture' | 'end';

export interface FlowNodePosition {
  x: number;
  y: number;
}

export interface MessageNodeData {
  content: string;
  personalization: boolean;
}

export interface ButtonOption {
  id: string;
  label: string;
  type: 'reply' | 'url';
  value?: string;
}

export interface ButtonNodeData {
  message: string;
  buttons: ButtonOption[];
}

export interface DelayNodeData {
  duration: number;
  unit: 'seconds' | 'minutes' | 'hours';
}

export interface ConditionNodeData {
  variable: string;
  operator: 'equals' | 'contains' | 'exists' | 'not_equals' | 'not_contains';
  value: string;
}

export interface CaptureNodeData {
  field: 'email' | 'name' | 'phone' | 'custom';
  customFieldName?: string;
  validationType?: 'email' | 'phone' | 'none';
  promptMessage: string;
  retryMessage?: string;
  maxRetries?: number;
}

export interface EndNodeData {
  message?: string;
}

export type FlowNodeData =
  | MessageNodeData
  | ButtonNodeData
  | DelayNodeData
  | ConditionNodeData
  | CaptureNodeData
  | EndNodeData;

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  position: FlowNodePosition;
  data: FlowNodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  label?: string;
}

export interface Flow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  isTemplate: boolean;
  isValid: boolean;
  validationErrors: string[];
  createdAt: Date;
  updatedAt: Date;
}
