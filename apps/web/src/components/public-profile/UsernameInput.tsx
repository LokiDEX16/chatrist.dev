'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  currentUsername?: string;
  disabled?: boolean;
}

export function UsernameInput({ value, onChange, currentUsername, disabled }: UsernameInputProps) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [reason, setReason] = useState<string>('');

  const checkAvailability = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setStatus('idle');
      return;
    }

    // If same as current username, it's valid
    if (currentUsername && username === currentUsername) {
      setStatus('available');
      setReason('');
      return;
    }

    setStatus('checking');
    try {
      const res = await fetch(`/api/profile/check-username?username=${encodeURIComponent(username)}`);
      const data = await res.json();

      if (data.available) {
        setStatus('available');
        setReason('');
      } else {
        setStatus(data.reason?.includes('Invalid') || data.reason?.includes('reserved') ? 'invalid' : 'taken');
        setReason(data.reason || 'Username is not available');
      }
    } catch {
      setStatus('idle');
    }
  }, [currentUsername]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value) {
        checkAvailability(value);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value, checkAvailability]);

  return (
    <div className="space-y-2">
      <Label htmlFor="username">Username</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">@</span>
        <Input
          id="username"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          placeholder="yourname"
          className={cn(
            'pl-7 pr-10',
            status === 'available' && 'border-green-500 focus-visible:ring-green-500',
            (status === 'taken' || status === 'invalid') && 'border-red-500 focus-visible:ring-red-500'
          )}
          maxLength={30}
          disabled={disabled}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {status === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          {status === 'available' && <Check className="h-4 w-4 text-green-500" />}
          {(status === 'taken' || status === 'invalid') && <X className="h-4 w-4 text-red-500" />}
        </div>
      </div>
      {status === 'available' && value.length >= 3 && (
        <p className="text-xs text-green-600">Username is available</p>
      )}
      {(status === 'taken' || status === 'invalid') && (
        <p className="text-xs text-red-600">{reason}</p>
      )}
      {value.length > 0 && value.length < 3 && (
        <p className="text-xs text-slate-500">Username must be at least 3 characters</p>
      )}
    </div>
  );
}
