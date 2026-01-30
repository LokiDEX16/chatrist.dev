'use client';

import { ProfilePage } from './ProfilePage';
import type { PublicProfile } from '@/lib/validations';

interface ProfilePreviewProps {
  profile: PublicProfile;
}

export function ProfilePreview({ profile }: ProfilePreviewProps) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-xs text-slate-500 mb-3 font-medium">Live Preview</p>
      {/* Phone frame */}
      <div className="relative w-[300px] h-[580px] rounded-[2.5rem] border-[8px] border-slate-900 bg-white overflow-hidden shadow-xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-b-2xl z-10" />

        {/* Screen content */}
        <div className="h-full overflow-y-auto">
          <ProfilePage profile={profile} isPreview />
        </div>
      </div>
    </div>
  );
}
