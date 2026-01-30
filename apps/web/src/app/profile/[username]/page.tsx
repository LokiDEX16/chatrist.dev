import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublicProfileByUsername } from '@/lib/supabase/public-profile-server';
import { ProfilePage } from '@/components/public-profile/ProfilePage';

interface PageProps {
  params: { username: string };
}

export const revalidate = 60; // ISR: revalidate every 60 seconds

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = await getPublicProfileByUsername(params.username);

  if (!profile) {
    return {
      title: 'Profile Not Found',
    };
  }

  const title = profile.seoTitle || `${profile.displayName || `@${profile.username}`} | Chatrist`;
  const description = profile.seoDescription || profile.bio || `Check out ${profile.displayName || `@${profile.username}`}'s links on Chatrist`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      ...(profile.avatarUrl && {
        images: [{ url: profile.avatarUrl, width: 400, height: 400, alt: profile.displayName || profile.username }],
      }),
    },
    twitter: {
      card: 'summary',
      title,
      description,
      ...(profile.avatarUrl && { images: [profile.avatarUrl] }),
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const profile = await getPublicProfileByUsername(params.username);

  if (!profile) {
    notFound();
  }

  return <ProfilePage profile={profile} />;
}
