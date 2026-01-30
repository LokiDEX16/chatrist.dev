'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileThemeProvider } from './ProfileThemeProvider';
import { ProfileLinkItem } from './ProfileLinkItem';
import type { PublicProfile } from '@/lib/validations';

interface ProfilePageProps {
  profile: PublicProfile;
  isPreview?: boolean;
}

export function ProfilePage({ profile, isPreview = false }: ProfilePageProps) {
  const { theme, links } = profile;
  const activeLinks = links.filter((link) => link.isActive);
  const initials = (profile.displayName || profile.username || '?')
    .charAt(0)
    .toUpperCase();

  return (
    <ProfileThemeProvider theme={theme}>
      <div
        className="min-h-screen w-full flex flex-col items-center"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
          fontFamily: `'${theme.font}', sans-serif`,
        }}
      >
        <div className="w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Avatar className="h-24 w-24 border-4 shadow-lg" style={{ borderColor: theme.primaryColor }}>
              {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile.displayName || profile.username} />}
              <AvatarFallback
                className="text-2xl font-bold"
                style={{ backgroundColor: theme.primaryColor, color: '#ffffff' }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          {/* Display Name */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mt-5 text-xl font-bold text-center"
            style={{ color: theme.textColor }}
          >
            {profile.displayName || `@${profile.username}`}
          </motion.h1>

          {/* Username (shown if display name exists) */}
          {profile.displayName && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-1 text-sm"
              style={{ color: theme.textColor }}
            >
              @{profile.username}
            </motion.p>
          )}

          {/* Bio */}
          {profile.bio && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="mt-3 text-sm text-center max-w-xs leading-relaxed"
              style={{ color: theme.textColor, opacity: 0.8 }}
            >
              {profile.bio}
            </motion.p>
          )}

          {/* Links */}
          {activeLinks.length > 0 && (
            <div className="mt-8 w-full space-y-3">
              {activeLinks.map((link, index) => (
                <ProfileLinkItem
                  key={link.id}
                  link={link}
                  theme={theme}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          {!isPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="mt-12 text-xs opacity-50"
              style={{ color: theme.textColor }}
            >
              Powered by{' '}
              <a
                href="/"
                className="font-semibold underline-offset-2 hover:underline"
                style={{ color: theme.primaryColor }}
              >
                Chatrist
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </ProfileThemeProvider>
  );
}
