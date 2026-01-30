'use client';

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProfileLink, ProfileTheme } from '@/lib/validations';

interface ProfileLinkItemProps {
  link: ProfileLink;
  theme: ProfileTheme;
  index: number;
}

const buttonStyleClasses: Record<string, string> = {
  rounded: 'rounded-xl',
  pill: 'rounded-full',
  sharp: 'rounded-none',
  outline: 'rounded-xl bg-transparent !border-2',
};

export function ProfileLinkItem({ link, theme, index }: ProfileLinkItemProps) {
  if (!link.isActive) return null;

  const isOutline = theme.buttonStyle === 'outline';

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
      className={cn(
        'group flex w-full items-center justify-between px-5 py-3.5 text-sm font-medium',
        'transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
        'shadow-sm hover:shadow-md',
        buttonStyleClasses[theme.buttonStyle] || 'rounded-xl'
      )}
      style={{
        backgroundColor: isOutline ? 'transparent' : theme.primaryColor,
        color: isOutline ? theme.primaryColor : '#ffffff',
        borderColor: theme.primaryColor,
        borderWidth: isOutline ? '2px' : '0',
        borderStyle: 'solid',
      }}
    >
      <span className="flex-1 text-center">{link.title}</span>
      <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.a>
  );
}
