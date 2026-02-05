'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Play,
  Pause,
  MoreVertical,
  Trash2,
  Edit,
  BarChart3,
  Megaphone,
  MessageSquare,
  Users,
  Zap,
  Instagram,
  GitBranch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { db } from '@/lib/supabase';
import type { DatabaseCampaign } from '@/lib/validations';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Campaign } from '@chatrist/shared';

const statusConfig: Record<string, { label: string; className: string; dotColor: string }> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground',
    dotColor: 'bg-muted-foreground',
  },
  ACTIVE: {
    label: 'Active',
    className: 'bg-emerald-500/10 text-emerald-600',
    dotColor: 'bg-emerald-500',
  },
  PAUSED: {
    label: 'Paused',
    className: 'bg-amber-500/10 text-amber-600',
    dotColor: 'bg-amber-500',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-blue-500/10 text-blue-600',
    dotColor: 'bg-blue-500',
  },
  ARCHIVED: {
    label: 'Archived',
    className: 'bg-muted text-muted-foreground',
    dotColor: 'bg-muted-foreground',
  },
};

const triggerTypeConfig: Record<string, { label: string; icon: typeof MessageSquare }> = {
  COMMENT: { label: 'Comment', icon: MessageSquare },
  STORY_REPLY: { label: 'Story Reply', icon: Instagram },
  DM_KEYWORD: { label: 'DM Keyword', icon: MessageSquare },
  NEW_FOLLOWER: { label: 'New Follower', icon: Users },
};

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

function CampaignCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

export default function CampaignsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const params = useParams();
  const username = params?.username as string;

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await db.campaigns.list();
      if (error) throw error;
      type CampaignRow = DatabaseCampaign & {
        instagram_account?: { id: string; username: string; profile_pic_url?: string } | null;
        flow?: { id: string; name: string; is_valid?: boolean } | null;
        leads?: { count?: number } | null;
      };
      const campaigns = ((data?.data || []) as CampaignRow[]).map((dbCampaign) => ({
        id: dbCampaign.id,
        userId: dbCampaign.user_id,
        instagramAccountId: dbCampaign.instagram_account_id,
        name: dbCampaign.name,
        description: dbCampaign.description,
        status: dbCampaign.status,
        triggerType: dbCampaign.trigger_type,
        triggerConfig: dbCampaign.trigger_config,
        flowId: dbCampaign.flow_id,
        hourlyLimit: dbCampaign.hourly_limit,
        dailyLimit: dbCampaign.daily_limit,
        hourlyCount: dbCampaign.hourly_count,
        dailyCount: dbCampaign.daily_count,
        leadsCount: dbCampaign.leads?.count || 0,
        startsAt: dbCampaign.starts_at ? new Date(dbCampaign.starts_at) : undefined,
        endsAt: dbCampaign.ends_at ? new Date(dbCampaign.ends_at) : undefined,
        createdAt: new Date(dbCampaign.created_at),
        updatedAt: new Date(dbCampaign.updated_at),
        instagramAccount: dbCampaign.instagram_account ? {
          id: dbCampaign.instagram_account.id,
          username: dbCampaign.instagram_account.username,
          profilePicUrl: dbCampaign.instagram_account.profile_pic_url,
        } : null,
        flow: dbCampaign.flow ? {
          id: dbCampaign.flow.id,
          name: dbCampaign.flow.name,
          isValid: dbCampaign.flow.is_valid,
        } : null,
      })) as Campaign[];
      return campaigns;
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.campaigns.activate(id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign activated' });
    },
    onError: () => {
      toast({ title: 'Failed to activate campaign', variant: 'destructive' });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.campaigns.pause(id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign paused' });
    },
    onError: () => {
      toast({ title: 'Failed to pause campaign', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.campaigns.delete(id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign deleted' });
    },
    onError: () => {
      toast({ title: 'Failed to delete campaign', variant: 'destructive' });
    },
  });

  const campaigns = data || [];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        variants={item}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="page-header">
          <h1 className="page-title">Campaigns</h1>
          <p className="page-description">
            Manage your Instagram DM automation campaigns
          </p>
        </div>
        <Link href={`/${username}/campaigns/new`}>
          <Button size="lg">
            <Plus className="h-4 w-4" />
            Create Campaign
          </Button>
        </Link>
      </motion.div>

      {/* Campaign Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <CampaignCardSkeleton key={i} />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <motion.div variants={item}>
          <Card className="border-dashed">
            <CardContent className="empty-state py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <Megaphone className="h-8 w-8 text-primary" />
              </div>
              <p className="empty-state-title">No campaigns yet</p>
              <p className="empty-state-description mb-6">
                Create your first campaign to start automating your Instagram DMs
              </p>
              <Link href={`/${username}/campaigns/new`}>
                <Button size="lg">
                  <Plus className="h-4 w-4" />
                  Create your first campaign
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign, index) => {
            const status = statusConfig[campaign.status];
            const trigger = triggerTypeConfig[campaign.triggerType];
            const TriggerIcon = trigger?.icon || Zap;

            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <CardTitle className="text-base font-semibold truncate">
                          {campaign.name}
                        </CardTitle>
                        {campaign.description && (
                          <CardDescription className="line-clamp-2 text-sm">
                            {campaign.description}
                          </CardDescription>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                            <Link href={`/${username}/campaigns/${campaign.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit campaign
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                            <Link href={`/${username}/campaigns/${campaign.id}`}>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View analytics
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => deleteMutation.mutate(campaign.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete campaign
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col space-y-4">
                    {/* Status and Trigger Type */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={cn('gap-1.5 rounded-full', status.className)}>
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            status.dotColor,
                            campaign.status === 'ACTIVE' && 'animate-pulse'
                          )}
                        />
                        {status.label}
                      </Badge>
                      <Badge variant="outline" className="gap-1.5 rounded-full">
                        <TriggerIcon className="h-3 w-3" />
                        {trigger?.label}
                      </Badge>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-2 flex-1">
                      {campaign.instagramAccount && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Instagram className="h-4 w-4" />
                          <span className="truncate">@{campaign.instagramAccount.username}</span>
                        </div>
                      )}

                      {campaign.flow && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <GitBranch className="h-4 w-4" />
                          <span className="truncate">{campaign.flow.name}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{campaign.leadsCount} leads</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      {campaign.status === 'ACTIVE' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-xl"
                          onClick={() => pauseMutation.mutate(campaign.id)}
                          disabled={pauseMutation.isPending}
                        >
                          <Pause className="h-4 w-4" />
                          Pause campaign
                        </Button>
                      ) : campaign.status === 'PAUSED' || campaign.status === 'DRAFT' ? (
                        <Button
                          size="sm"
                          className="w-full rounded-xl"
                          onClick={() => activateMutation.mutate(campaign.id)}
                          disabled={activateMutation.isPending}
                        >
                          <Play className="h-4 w-4" />
                          {campaign.status === 'DRAFT' ? 'Activate' : 'Resume'}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full rounded-xl" asChild>
                          <Link href={`/${username}/campaigns/${campaign.id}`}>
                            <BarChart3 className="h-4 w-4" />
                            View analytics
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
