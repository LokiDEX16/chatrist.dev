'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { BUTTON_STYLES, FONT_OPTIONS, type ProfileTheme } from '@/lib/validations';

interface ThemePickerProps {
  theme: ProfileTheme;
  onChange: (theme: ProfileTheme) => void;
}

const presetColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#0f172a',
];

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-wrap">
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              className={cn(
                'h-6 w-6 rounded-full border-2 transition-transform hover:scale-110',
                value === color ? 'border-slate-900 scale-110' : 'border-transparent'
              )}
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 w-7 rounded cursor-pointer border border-slate-200"
          />
          <Input
            value={value}
            onChange={(e) => {
              const val = e.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                onChange(val);
              }
            }}
            className="h-7 w-20 text-xs font-mono"
            maxLength={7}
          />
        </div>
      </div>
    </div>
  );
}

export function ThemePicker({ theme, onChange }: ThemePickerProps) {
  const update = (updates: Partial<ProfileTheme>) => {
    onChange({ ...theme, ...updates });
  };

  return (
    <div className="space-y-5">
      <ColorPicker
        label="Primary Color"
        value={theme.primaryColor}
        onChange={(primaryColor) => update({ primaryColor })}
      />

      <ColorPicker
        label="Background Color"
        value={theme.backgroundColor}
        onChange={(backgroundColor) => update({ backgroundColor })}
      />

      <ColorPicker
        label="Text Color"
        value={theme.textColor}
        onChange={(textColor) => update({ textColor })}
      />

      {/* Button Style */}
      <div className="space-y-2">
        <Label className="text-xs">Button Style</Label>
        <div className="grid grid-cols-4 gap-2">
          {BUTTON_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              className={cn(
                'h-9 border-2 text-xs font-medium transition-all',
                style === 'rounded' && 'rounded-xl',
                style === 'pill' && 'rounded-full',
                style === 'sharp' && 'rounded-none',
                style === 'outline' && 'rounded-xl bg-transparent',
                theme.buttonStyle === style
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              )}
              onClick={() => update({ buttonStyle: style })}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Font */}
      <div className="space-y-2">
        <Label className="text-xs">Font</Label>
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font}
              type="button"
              className={cn(
                'h-9 rounded-lg border-2 text-xs font-medium transition-all',
                theme.font === font
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              )}
              style={{ fontFamily: `'${font}', sans-serif` }}
              onClick={() => update({ font })}
            >
              {font}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
