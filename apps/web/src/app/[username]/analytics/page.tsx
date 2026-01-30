'use client';

import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  MessageSquare,
  Users,
  Zap,
  Activity,
  Megaphone,
  CheckCircle2,
  PauseCircle,
  Instagram,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { OverviewAnalytics } from '@/lib/supabase/database';

const activityTypeConfig: Record<string, { label: string; icon: typeof Zap; color: string }> = {
  'trigger-received': {
    label: 'Trigger',
    icon: Zap,
    color: 'bg-blue-500/10 text-blue-600',
  },
  'dm-sent': {
    label: 'DM Sent',
    icon: MessageSquare,
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  'lead-captured': {
    label: 'Lead Captured',
    icon: Users,
    color: 'bg-violet-500/10 text-violet-600',
  },
  'flow-completed': {
    label: 'Flow Complete',
    icon: CheckCircle2,
    color: 'bg-amber-500/10 text-amber-600',
  },
  'campaign-activated': {
    label: 'Activated',
    icon: Megaphone,
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  'campaign-paused': {
    label: 'Paused',
    icon: PauseCircle,
    color: 'bg-amber-500/10 text-amber-600',
  },
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

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  loading,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: typeof TrendingUp;
  iconColor: string;
  iconBg: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div variants={item}>
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="stat-label">{title}</p>
              <p className="stat-value">{value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', iconBg)}>
              <Icon className={cn('h-6 w-6', iconColor)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const response = await analyticsApi.overview();
      return response.data as any as OverviewAnalytics;
    },
  });

  const stats = [
    {
      title: 'Total Campaigns',
      value: overview?.totalCampaigns || 0,
      subtitle: `${overview?.activeCampaigns || 0} active`,
      icon: Megaphone,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-500/10',
    },
    {
      title: 'Total Triggers',
      value: overview?.totalTriggers || 0,
      subtitle: 'All time',
      icon: Zap,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-500/10',
    },
    {
      title: 'DMs Sent',
      value: overview?.totalDmsSent || 0,
      subtitle: 'All time',
      icon: MessageSquare,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-500/10',
    },
    {
      title: 'Total Leads',
      value: overview?.totalLeads || 0,
      subtitle: 'Captured',
      icon: Users,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-500/10',
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item} className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-description">
          Track your Instagram automation performance
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} loading={isLoading} />
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest events from your campaigns</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <ActivitySkeleton />
              </div>
            ) : (
              <div className="empty-state py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                <p className="empty-state-title">No activity yet</p>
                <p className="empty-state-description">
                  Create and activate a campaign to start seeing activity here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
