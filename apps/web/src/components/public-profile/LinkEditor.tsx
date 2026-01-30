'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, GripVertical, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProfileLink } from '@/lib/validations';

interface LinkEditorProps {
  links: ProfileLink[];
  onChange: (links: ProfileLink[]) => void;
}

function generateId() {
  return `link_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function LinkEditor({ links, onChange }: LinkEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addLink = () => {
    const newLink: ProfileLink = {
      id: generateId(),
      title: '',
      url: '',
      icon: '',
      isActive: true,
    };
    onChange([...links, newLink]);
    setExpandedId(newLink.id);
  };

  const updateLink = (id: string, updates: Partial<ProfileLink>) => {
    onChange(links.map((link) => (link.id === id ? { ...link, ...updates } : link)));
  };

  const removeLink = (id: string) => {
    onChange(links.filter((link) => link.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...links];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newLinks.length) return;
    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
    onChange(newLinks);
  };

  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <div
          key={link.id}
          className="rounded-lg border border-slate-200 bg-white overflow-hidden"
        >
          {/* Link header */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setExpandedId(expandedId === link.id ? null : link.id)}
          >
            <GripVertical className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium truncate', !link.title && 'text-slate-400 italic')}>
                {link.title || 'Untitled link'}
              </p>
              {link.url && (
                <p className="text-xs text-slate-400 truncate">{link.url}</p>
              )}
            </div>
            <Switch
              checked={link.isActive}
              onCheckedChange={(checked) => {
                updateLink(link.id, { isActive: checked });
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0"
            />
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => { e.stopPropagation(); moveLink(index, 'up'); }}
                disabled={index === 0}
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => { e.stopPropagation(); moveLink(index, 'down'); }}
                disabled={index === links.length - 1}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Expanded editor */}
          {expandedId === link.id && (
            <div className="border-t border-slate-100 px-3 py-3 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Title</Label>
                <Input
                  value={link.title}
                  onChange={(e) => updateLink(link.id, { title: e.target.value })}
                  placeholder="My Website"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">URL</Label>
                <Input
                  value={link.url}
                  onChange={(e) => updateLink(link.id, { url: e.target.value })}
                  placeholder="https://example.com"
                  className="h-8 text-sm"
                  type="url"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 text-xs"
                onClick={() => removeLink(link.id)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Remove link
              </Button>
            </div>
          )}
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={addLink}
        className="w-full border-dashed"
        disabled={links.length >= 20}
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Add link
      </Button>

      {links.length >= 20 && (
        <p className="text-xs text-slate-500 text-center">Maximum 20 links reached</p>
      )}
    </div>
  );
}
