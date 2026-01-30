import { createSupabaseServerClient } from './server';
import type { PublicProfile, DatabasePublicProfile } from '@/lib/validations';

function mapToPublicProfile(data: DatabasePublicProfile): PublicProfile {
  return {
    id: data.id,
    userId: data.user_id,
    username: data.username,
    displayName: data.display_name,
    bio: data.bio,
    avatarUrl: data.avatar_url,
    links: data.links,
    theme: data.theme,
    isPublished: data.is_published,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    viewCount: data.view_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getPublicProfileByUsername(username: string): Promise<PublicProfile | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('public_profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .eq('is_published', true)
    .single();

  if (error || !data) {
    return null;
  }

  // Increment view count (fire and forget)
  supabase.rpc('increment_profile_view', { p_username: username.toLowerCase() }).then();

  return mapToPublicProfile(data as DatabasePublicProfile);
}
