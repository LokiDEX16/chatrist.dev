'use client';

import { Node } from '@xyflow/react';
import { X, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NodeEditorProps {
  node: Node;
  onDataChange: (data: any) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function NodeEditor({ node, onDataChange, onDelete, onClose }: NodeEditorProps) {
  const renderEditor = () => {
    switch (node.type) {
      case 'message':
        return <MessageEditor data={node.data} onChange={onDataChange} />;
      case 'button':
        return <ButtonEditor data={node.data} onChange={onDataChange} />;
      case 'delay':
        return <DelayEditor data={node.data} onChange={onDataChange} />;
      case 'condition':
        return <ConditionEditor data={node.data} onChange={onDataChange} />;
      case 'capture':
        return <CaptureEditor data={node.data} onChange={onDataChange} />;
      case 'end':
        return <EndEditor data={node.data} onChange={onDataChange} />;
      default:
        return <p>Unknown node type</p>;
    }
  };

  return (
    <div className="w-80 border-l bg-white overflow-y-auto">
      <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
        <h3 className="font-semibold capitalize">{node.type} Node</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4">{renderEditor()}</div>
    </div>
  );
}

function MessageEditor({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content">Message Content</Label>
        <Textarea
          id="content"
          value={data.content || ''}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="Enter your message..."
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Use {'{{username}}'}, {'{{first_name}}'} for personalization
        </p>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="personalization">Enable Personalization</Label>
        <Switch
          id="personalization"
          checked={data.personalization || false}
          onCheckedChange={(checked) => onChange({ personalization: checked })}
        />
      </div>
    </div>
  );
}

function ButtonEditor({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const buttons = data.buttons || [];

  const addButton = () => {
    if (buttons.length >= 3) return;
    onChange({
      buttons: [
        ...buttons,
        { id: `btn_${Date.now()}`, label: 'Button', type: 'reply', value: '' },
      ],
    });
  };

  const updateButton = (index: number, updates: any) => {
    const newButtons = [...buttons];
    newButtons[index] = { ...newButtons[index], ...updates };
    onChange({ buttons: newButtons });
  };

  const removeButton = (index: number) => {
    onChange({ buttons: buttons.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="message">Button Message</Label>
        <Textarea
          id="message"
          value={data.message || ''}
          onChange={(e) => onChange({ message: e.target.value })}
          placeholder="Message shown with buttons..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Buttons ({buttons.length}/3)</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={addButton}
            disabled={buttons.length >= 3}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {buttons.map((button: any, index: number) => (
            <Card key={button.id} className="p-3">
              <div className="space-y-2">
                <Input
                  value={button.label}
                  onChange={(e) => updateButton(index, { label: e.target.value })}
                  placeholder="Button label"
                />
                <div className="flex gap-2">
                  <Select
                    value={button.type}
                    onValueChange={(value) => updateButton(index, { type: value })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reply">Reply</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeButton(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {button.type === 'url' && (
                  <Input
                    value={button.value || ''}
                    onChange={(e) => updateButton(index, { value: e.target.value })}
                    placeholder="https://..."
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function DelayEditor({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="duration">Duration</Label>
        <div className="flex gap-2">
          <Input
            id="duration"
            type="number"
            min={1}
            value={data.duration || 5}
            onChange={(e) => onChange({ duration: parseInt(e.target.value) || 1 })}
            className="w-20"
          />
          <Select
            value={data.unit || 'minutes'}
            onValueChange={(value) => onChange({ unit: value })}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seconds">Seconds</SelectItem>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">Maximum delay: 24 hours</p>
      </div>
    </div>
  );
}

function ConditionEditor({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="variable">Variable</Label>
        <Select
          value={data.variable || ''}
          onValueChange={(value) => onChange({ variable: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select variable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="buttonResponse">Button Response</SelectItem>
            <SelectItem value="lastResponse">Last Response</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="operator">Operator</Label>
        <Select
          value={data.operator || 'equals'}
          onValueChange={(value) => onChange({ operator: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="not_equals">Not Equals</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="not_contains">Not Contains</SelectItem>
            <SelectItem value="exists">Exists</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.operator !== 'exists' && (
        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            value={data.value || ''}
            onChange={(e) => onChange({ value: e.target.value })}
            placeholder="Value to compare"
          />
        </div>
      )}
    </div>
  );
}

function CaptureEditor({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="field">Capture Field</Label>
        <Select
          value={data.field || 'email'}
          onValueChange={(value) => onChange({ field: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="custom">Custom Field</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.field === 'custom' && (
        <div className="space-y-2">
          <Label htmlFor="customFieldName">Custom Field Name</Label>
          <Input
            id="customFieldName"
            value={data.customFieldName || ''}
            onChange={(e) => onChange({ customFieldName: e.target.value })}
            placeholder="e.g., phone_number"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="promptMessage">Prompt Message</Label>
        <Textarea
          id="promptMessage"
          value={data.promptMessage || ''}
          onChange={(e) => onChange({ promptMessage: e.target.value })}
          placeholder="Message asking for input..."
          rows={3}
        />
      </div>
    </div>
  );
}

function EndEditor({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="message">Final Message (Optional)</Label>
        <Textarea
          id="message"
          value={data.message || ''}
          onChange={(e) => onChange({ message: e.target.value })}
          placeholder="Optional goodbye message..."
          rows={3}
        />
      </div>
    </div>
  );
}
