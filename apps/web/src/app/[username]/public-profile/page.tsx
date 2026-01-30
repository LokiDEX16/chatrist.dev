'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/lib/api';
import { ErrorBoundary, LoadingFallback } from '@/components/ErrorBoundary';
import {
  User,
  Link2,
  Palette,
  Search,
  ExternalLink,
  Loader2,
  Save,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';
import { publicProfileDb } from '@/lib/supabase/public-profile';
import { UsernameInput } from '@/components/public-profile/UsernameInput';
import { LinkEditor } from '@/components/public-profile/LinkEditor';
import { ThemePicker } from '@/components/public-profile/ThemePicker';
import { ProfilePreview } from '@/components/public-profile/ProfilePreview';
import type {
  PublicProfile,
  ProfileLink,
  ProfileTheme,
} from '@/lib/validations';

const DEFAULT_THEME: ProfileTheme = {
  primaryColor: '#6366f1',
  backgroundColor: '#ffffff',
  textColor: '#0f172a',
  buttonStyle: 'rounded',
  font: 'Inter',
};

export default function PublicProfilePage() {
  return (
    <ErrorBoundary>
      <PublicProfileContent />
    </ErrorBoundary>
  );
}

function PublicProfileContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [theme, setTheme] = useState<ProfileTheme>(DEFAULT_THEME);
  const [isPublished, setIsPublished] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Fetch profile — returns null if user hasn't created one yet (not an error)
  const { data: profileResult, isLoading } = useQuery({
    queryKey: ['public-profile'],
    queryFn: async () => {
      const result = await publicProfileDb.get();
      // "Not found" means user has no profile yet — that's valid, not an error
      if (result.error && result.error.code === 'NOT_FOUND') {
        return null;
      }
      if (result.error) throw result.error;
      return result.data;
    },
    retry: 1,
  });

  // Populate form from fetched profile
  useEffect(() => {
    if (profileResult === undefined) return;

    if (profileResult) {
      const p = profileResult;
      setHasProfile(true);
      setUsername(p.username);
      setDisplayName(p.displayName || '');
      setBio(p.bio || '');
      setAvatarUrl(p.avatarUrl || '');
      setLinks(p.links);
      setTheme(p.theme);
      setIsPublished(p.isPublished);
      setSeoTitle(p.seoTitle || '');
      setSeoDescription(p.seoDescription || '');
    } else {
      setHasProfile(false);
    }
  }, [profileResult]);

  // Create profile mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const result = await publicProfileDb.create({
        username,
        displayName: displayName || undefined,
        bio: bio || undefined,
        avatarUrl: avatarUrl || undefined,
        links,
        theme,
        isPublished,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
      });
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      setHasProfile(true);
      queryClient.invalidateQueries({ queryKey: ['public-profile'] });
      toast({ title: 'Profile created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create profile', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      const result = await publicProfileDb.update({
        displayName: displayName || undefined,
        bio: bio || undefined,
        avatarUrl: avatarUrl || undefined,
        links,
        theme,
        isPublished,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
      });
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-profile'] });
      toast({ title: 'Changes saved successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to save changes', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  // Update username mutation
  const updateUsernameMutation = useMutation({
    mutationFn: async () => {
      const result = await publicProfileDb.updateUsername(username);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-profile'] });
      toast({ title: 'Username updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update username', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  // Toggle published mutation
  const togglePublishedMutation = useMutation({
    mutationFn: async () => {
      const result = await publicProfileDb.togglePublished();
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        setIsPublished(data.isPublished);
      }
      queryClient.invalidateQueries({ queryKey: ['public-profile'] });
      toast({ title: data?.isPublished ? 'Profile published' : 'Profile unpublished' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update publish status', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const handleSave = () => {
    if (hasProfile) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleCopyUrl = () => {
    if (username) {
      navigator.clipboard.writeText(`${window.location.origin}/@${username}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const currentProfile = profileResult;
  const hasUsernameChanged = currentProfile && username !== currentProfile.username;

  // Build preview profile object
  const previewProfile: PublicProfile = {
    id: currentProfile?.id || '',
    userId: currentProfile?.userId || '',
    username: username || 'username',
    displayName: displayName || null,
    bio: bio || null,
    avatarUrl: avatarUrl || null,
    links,
    theme,
    isPublished,
    seoTitle: seoTitle || null,
    seoDescription: seoDescription || null,
    viewCount: currentProfile?.viewCount || 0,
    createdAt: currentProfile?.createdAt || '',
    updatedAt: currentProfile?.updatedAt || '',
  };

  if (isLoading) {
    return <LoadingFallback message="Loading public profile..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Public Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create your Linktree-style page accessible at{' '}
            <span className="font-mono text-indigo-600">/@{username || 'username'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasProfile && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Published</span>
                <Switch
                  checked={isPublished}
                  onCheckedChange={() => togglePublishedMutation.mutate()}
                  disabled={togglePublishedMutation.isPending}
                />
              </div>
              {username && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="gap-1.5"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy URL'}
                </Button>
              )}
              {isPublished && username && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href={`/@${username}`} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5" />
                    View
                  </a>
                </Button>
              )}
            </>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || (!hasProfile && username.length < 3)}
            className="bg-indigo-500 hover:bg-indigo-600 gap-1.5"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {hasProfile ? 'Save Changes' : 'Create Profile'}
          </Button>
        </div>
      </div>

      {/* Main content: Editor + Preview */}
      <div className="flex gap-8">
        {/* Editor */}
        <div className="flex-1 min-w-0">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full grid grid-cols-4 mb-6">
              <TabsTrigger value="profile" className="gap-1.5 text-xs">
                <User className="h-3.5 w-3.5" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="links" className="gap-1.5 text-xs">
                <Link2 className="h-3.5 w-3.5" />
                Links
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-1.5 text-xs">
                <Palette className="h-3.5 w-3.5" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="seo" className="gap-1.5 text-xs">
                <Search className="h-3.5 w-3.5" />
                SEO
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
                <UsernameInput
                  value={username}
                  onChange={setUsername}
                  currentUsername={currentProfile?.username}
                  disabled={false}
                />

                {hasProfile && hasUsernameChanged && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateUsernameMutation.mutate()}
                    disabled={updateUsernameMutation.isPending || username.length < 3}
                    className="gap-1.5"
                  >
                    {updateUsernameMutation.isPending && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    Update Username
                  </Button>
                )}

                <div className="space-y-1.5">
                  <Label>Display Name</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    maxLength={100}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell visitors about yourself..."
                    maxLength={500}
                    rows={3}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-slate-400 text-right">{bio.length}/500</p>
                </div>

                <div className="space-y-1.5">
                  <Label>Avatar URL</Label>
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    type="url"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Links Tab */}
            <TabsContent value="links" className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <LinkEditor links={links} onChange={setLinks} />
              </div>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <ThemePicker theme={theme} onChange={setTheme} />
              </div>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>SEO Title</Label>
                  <Input
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Custom page title for search engines"
                    maxLength={60}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-slate-400 text-right">{seoTitle.length}/60</p>
                </div>

                <div className="space-y-1.5">
                  <Label>SEO Description</Label>
                  <Textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Custom description for search engines and social media"
                    maxLength={160}
                    rows={3}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-slate-400 text-right">{seoDescription.length}/160</p>
                </div>

                {/* OG Preview */}
                <div className="mt-4">
                  <p className="text-xs text-slate-500 font-medium mb-2">Search result preview</p>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-medium text-blue-700 truncate">
                      {seoTitle || `${displayName || `@${username || 'username'}`} | Chatrist`}
                    </p>
                    <p className="text-xs text-green-700 mt-0.5 truncate">
                      {typeof window !== 'undefined' ? window.location.origin : ''}/@{username || 'username'}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {seoDescription || bio || `Check out @${username || 'username'}'s links on Chatrist`}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Stats */}
          {hasProfile && currentProfile && (
            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-slate-500">Total views</p>
                  <p className="text-lg font-semibold text-slate-900">{currentProfile.viewCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Active links</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {links.filter((l) => l.isActive).length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isPublished ? (
                      <>
                        <Eye className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-sm font-medium text-green-600">Published</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-500">Draft</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview - hidden on small screens */}
        <div className="hidden lg:block flex-shrink-0 sticky top-8 self-start">
          <ProfilePreview profile={previewProfile} />
        </div>
      </div>
    </div>
  );
}
