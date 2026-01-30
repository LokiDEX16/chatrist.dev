'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Megaphone,
  Zap,
  Users,
  MessageSquare,
  MessageCircle,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

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

function CircularProgress({ value, color, size = 48 }: { value: number; color: string; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
        strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

interface TooltipPayloadEntry {
  color: string;
  name: string;
  value: number;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="text-xs font-medium text-gray-500 mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-semibold text-gray-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#F97316',
  PAUSED: '#EC4899',
  DRAFT: '#8B5CF6',
  COMPLETED: '#3B82F6',
  ARCHIVED: '#CBD5E1',
};

export default function DashboardPage() {
  const { userName } = useAuth();
  const params = useParams();
  const username = params?.username as string;
  const displayName = userName || 'there';

  // Fetch real analytics overview
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const { data, error } = await db.analytics.overview();
      if (error) throw error;
      return data;
    },
  });

  // Fetch campaigns for status breakdown and active list
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await db.campaigns.list();
      if (error) throw error;
      return data?.data || [];
    },
  });

  // Fetch Instagram accounts for activity
  const { data: igAccounts } = useQuery({
    queryKey: ['instagram-accounts-dashboard'],
    queryFn: async () => {
      const { data, error } = await db.instagramAccounts.list();
      if (error) throw error;
      return data || [];
    },
  });

  // Build stats from real data
  const quickStats = [
    {
      title: 'Total Campaigns',
      value: overview?.totalCampaigns ?? 0,
      icon: Megaphone,
      iconColor: 'text-orange-600',
      progressValue: overview?.totalCampaigns ? Math.min((overview.totalCampaigns / 20) * 100, 100) : 0,
      progressColor: '#F97316',
    },
    {
      title: 'Active Automations',
      value: overview?.activeCampaigns ?? 0,
      icon: Zap,
      iconColor: 'text-pink-600',
      progressValue: overview?.activeCampaigns && overview?.totalCampaigns
        ? (overview.activeCampaigns / overview.totalCampaigns) * 100
        : 0,
      progressColor: '#EC4899',
    },
    {
      title: 'Leads Captured',
      value: overview?.totalLeads ?? 0,
      icon: Users,
      iconColor: 'text-violet-600',
      progressValue: overview?.totalLeads ? Math.min((overview.totalLeads / 500) * 100, 100) : 0,
      progressColor: '#8B5CF6',
    },
    {
      title: 'Messages Sent',
      value: overview?.totalDmsSent ?? 0,
      icon: MessageSquare,
      iconColor: 'text-emerald-600',
      progressValue: overview?.totalDmsSent ? Math.min((overview.totalDmsSent / 2000) * 100, 100) : 0,
      progressColor: '#10B981',
    },
  ];

  // Build campaign status pie chart data
  const campaignStatusCounts = (campaigns || []).reduce<Record<string, number>>((acc, c) => {
    const status = c.status || 'DRAFT';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const campaignStatusData = Object.entries(campaignStatusCounts).map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLORS[name] || '#CBD5E1',
  }));

  const totalCampaigns = campaignStatusData.reduce((sum, d) => sum + d.value, 0);

  // Active campaigns list
  const activeCampaigns = (campaigns || [])
    .filter((c) => c.status === 'ACTIVE')
    .slice(0, 4)
    .map((c) => ({
      name: c.name,
      leadsCount: c.daily_count || 0,
    }));

  const isLoading = overviewLoading || campaignsLoading;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {displayName}!</h1>
          <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening with your campaigns today.</p>
        </div>
        <Link href={`/${username}/campaigns/new`}>
          <Button className="bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 hover:opacity-90 text-white rounded-full px-6 shadow-lg shadow-orange-500/25 transition-opacity">
            <Megaphone className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className="border border-gray-100 bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className="text-3xl font-semibold tracking-tight text-gray-900">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </p>
                    </div>
                    <div className="relative">
                      <CircularProgress value={stat.progressValue} color={stat.progressColor} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-3">
        {/* Active Campaigns */}
        <Card className="border border-gray-100 bg-white lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Active Campaigns</CardTitle>
            <Link href={`/${username}/campaigns`}>
              <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                View All <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activeCampaigns.length === 0 ? (
              <div className="text-center py-8">
                <Megaphone className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No active campaigns</p>
                <Link href={`/${username}/campaigns/new`}>
                  <Button size="sm" variant="outline" className="mt-3 rounded-full">
                    Create your first campaign
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeCampaigns.map((campaign, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{campaign.name}</p>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-medium">
                          Instagram
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{campaign.leadsCount}</p>
                      <p className="text-[10px] text-gray-400">leads</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Side */}
        <div className="space-y-6">
          {/* Campaign Status Donut */}
          <Card className="border border-gray-100 bg-white">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Campaign Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-2">
              {isLoading ? (
                <Skeleton className="h-40 w-40 rounded-full" />
              ) : totalCampaigns === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400">No campaigns yet</p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie
                          data={campaignStatusData}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={70}
                          paddingAngle={3} dataKey="value" strokeWidth={0}
                        >
                          {campaignStatusData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">{totalCampaigns}</span>
                      <span className="text-[10px] text-gray-400 font-medium">Total</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-2 w-full">
                    {campaignStatusData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        {entry.name} ({entry.value})
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Connected Accounts Activity */}
          <Card className="border border-gray-100 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {(igAccounts || []).length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400 mb-2">No Instagram accounts connected</p>
                  <Link href={`/${username}/instagram`}>
                    <Button size="sm" variant="outline" className="rounded-full">
                      Connect Account
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {(igAccounts || []).slice(0, 5).map((account) => (
                      <div key={account.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-gray-200">
                          <AvatarImage src={account.profile_pic_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white text-xs font-medium">
                            {(account.username || '?').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">@{account.username}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {account.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Automation Status */}
          <Card className="border border-gray-100 bg-gradient-to-br from-orange-50 to-pink-50 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Quick Stats</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overview?.leadsToday ?? 0}</p>
                  <p className="text-xs text-gray-500">Leads today</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overview?.emailsCaptured ?? 0}</p>
                  <p className="text-xs text-gray-500">Emails captured</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Quick Help Banner */}
      <motion.div variants={item}>
        <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Need quick help?</h3>
              <p className="text-white/80 text-sm">Check our tutorials or reach out to support.</p>
            </div>
          </div>
          <Link href={`/${username}/tutorials`}>
            <Button variant="secondary" className="bg-white text-orange-600 hover:bg-gray-50 font-medium rounded-full px-6">
              <MessageCircle className="h-4 w-4 mr-2" />
              Watch Tutorials
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
