'use client';

import type { ProfileTheme } from '@/lib/validations';

interface ProfileThemeProviderProps {
  theme: ProfileTheme;
  children: React.ReactNode;
}

export function ProfileThemeProvider({ theme, children }: ProfileThemeProviderProps) {
  const style = {
    '--profile-primary': theme.primaryColor,
    '--profile-bg': theme.backgroundColor,
    '--profile-text': theme.textColor,
    '--profile-font': theme.font,
  } as React.CSSProperties;

  return (
    <div style={style} className="contents">
      {children}
    </div>
  );
}
