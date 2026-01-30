'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import {
  Instagram,
  Plus,
  RefreshCw,
  Image,
  Video,
  LayoutGrid,
  Play,
  Heart,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { instagramApi } from '@/lib/api';
import Link from 'next/link';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

interface InstagramAccount {
  id: string;
  igUserId: string;
  username: string;
  profilePicUrl?: string;
  isActive: boolean;
  tokenExpiry?: string;
}

const mediaTypeIcons: Record<string, typeof Image> = {
  IMAGE: Image,
  VIDEO: Video,
  CAROUSEL_ALBUM: LayoutGrid,
};

export default function InstagramPage() {
  const { toast } = useToast();
  const params = useParams();
  const username = params?.username as string;
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Fetch connected Instagram accounts directly from API
  const { data: accounts, isLoading: accountsLoading, error: accountsError } = useQuery({
    queryKey: ['instagram-accounts'],
    queryFn: async () => {
      // Fetch directly from API route instead of going through database layer
      const response = await fetch('/api/instagram/accounts');
      if (!response.ok) {
        const err = await response.json();
        console.error('Failed to fetch Instagram accounts:', err);
        throw new Error(err.error || 'Failed to fetch accounts');
      }
      const result = await response.json();
      console.log('Instagram accounts response:', result);
      // API returns { data: [...] }
      return (result.data || []) as InstagramAccount[];
    },
  });

  // Log any errors
  if (accountsError) {
    console.error('Accounts query error:', accountsError);
  }

  const activeAccountId = selectedAccountId || accounts?.[0]?.id;

  // Fetch posts for selected account
  const { data: postsData, isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['instagram-posts', activeAccountId],
    queryFn: async () => {
      if (!activeAccountId) return { data: [], username: '' };
      const response = await fetch(`/api/instagram/posts?accountId=${activeAccountId}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch posts');
      }
      return response.json() as Promise<{ data: InstagramPost[]; username: string }>;
    },
    enabled: !!activeAccountId,
  });

  const posts = postsData?.data || [];
  const selectedAccount = accounts?.find((a) => a.id === activeAccountId);

  const handleConnect = () => {
    // Redirect to Instagram OAuth flow
    window.location.href = '/api/instagram/connect';
  };

  const handleRefresh = () => {
    refetchPosts();
    toast({ title: 'Refreshing posts...' });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Instagram DM Automation</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your connected Instagram accounts and automate DM responses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeAccountId && (
            <Button variant="outline" size="sm" onClick={handleRefresh} className="rounded-lg">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          <Button onClick={handleConnect} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-lg">
            <Plus className="h-4 w-4 mr-2" />
            Connect Account
          </Button>
        </div>
      </motion.div>

      {/* Account Selector */}
      {accountsLoading ? (
        <motion.div variants={item}>
          <div className="flex gap-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-48 rounded-xl" />
            ))}
          </div>
        </motion.div>
      ) : !accounts || accounts.length === 0 ? (
        <motion.div variants={item}>
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-4">
                <Instagram className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect your Instagram account</h3>
              <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">
                Connect your Instagram Business or Creator account to start automating DM responses to comments, story replies, and messages.
              </p>
              <Button onClick={handleConnect} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-lg">
                <Instagram className="h-4 w-4 mr-2" />
                Connect Instagram
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Account Tabs */}
          <motion.div variants={item} className="flex gap-3 overflow-x-auto pb-2">
            {accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => setSelectedAccountId(account.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap',
                  activeAccountId === account.id
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                <Instagram className="h-4 w-4" />
                <span className="text-sm font-medium">@{account.username}</span>
                {account.isActive && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                )}
              </button>
            ))}
          </motion.div>

          {/* Posts Grid */}
          <motion.div variants={item}>
            <Card className="border border-gray-100 bg-white">
              <CardHeader>
                <CardTitle className="text-lg">
                  Posts from @{selectedAccount?.username || '...'}
                </CardTitle>
                <CardDescription>
                  Select a post to set up DM automation triggers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <Skeleton key={i} className="aspect-square rounded-xl" />
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <Image className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No posts found</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Posts will appear here once your Instagram account has content
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {posts.map((post) => {
                      const MediaIcon = mediaTypeIcons[post.media_type] || Image;
                      const thumbnail = post.thumbnail_url || post.media_url;

                      return (
                        <div
                          key={post.id}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 cursor-pointer"
                        >
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={post.caption?.slice(0, 50) || 'Instagram post'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <MediaIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}

                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex items-center gap-4 text-white">
                              {post.like_count !== undefined && (
                                <span className="flex items-center gap-1 text-sm font-medium">
                                  <Heart className="h-4 w-4" />
                                  {post.like_count}
                                </span>
                              )}
                              {post.comments_count !== undefined && (
                                <span className="flex items-center gap-1 text-sm font-medium">
                                  <MessageCircle className="h-4 w-4" />
                                  {post.comments_count}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Media type badge */}
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-black/50 text-white border-0 text-[10px] gap-1">
                              <MediaIcon className="h-3 w-3" />
                              {post.media_type === 'CAROUSEL_ALBUM' ? 'Carousel' : post.media_type === 'VIDEO' ? 'Video' : 'Image'}
                            </Badge>
                          </div>

                          {/* View link */}
                          <a
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button size="sm" variant="secondary" className="h-7 text-xs rounded-lg">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Setup Guide */}
          <motion.div variants={item}>
            <Card className="border border-gray-100 bg-white">
              <CardHeader>
                <CardTitle className="text-lg">How DM Automation Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">1. Set Triggers</h4>
                    <p className="text-xs text-gray-500">
                      Choose which comments, keywords, or story replies trigger your automated DMs
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-xl bg-pink-100 flex items-center justify-center mx-auto mb-3">
                      <Play className="h-6 w-6 text-pink-600" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">2. Build Flows</h4>
                    <p className="text-xs text-gray-500">
                      Create conversation flows with our visual builder to engage your audience
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-3">
                      <Heart className="h-6 w-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">3. Capture Leads</h4>
                    <p className="text-xs text-gray-500">
                      Automatically collect emails and info from engaged users
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <Link href={`/${username}/campaigns/new`}>
                    <Button className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white">
                      Create Your First Campaign
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
