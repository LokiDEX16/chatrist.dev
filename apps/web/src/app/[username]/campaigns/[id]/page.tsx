'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit, TrendingUp, MessageSquare, Users, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { campaignApi, analyticsApi } from '@/lib/api';
import type { CampaignAnalyticsData } from '@/lib/supabase/database';

interface CampaignStats {
  campaignId: string;
  campaignName: string;
  status: string;
  totals: {
    triggers: number;
    dmsSent: number;
    dmsDelivered: number;
    replies: number;
    emailsCaptured: number;
    flowCompletions: number;
    deliveryRate: number;
    replyRate: number;
    conversionRate: number;
  };
  dailyStats: Array<{
    date: string;
    triggers: number;
    dmsSent: number;
    replies: number;
    conversions: number;
  }>;
}

function buildCampaignStats(
  campaignId: string,
  campaignName: string,
  campaignStatus: string,
  analyticsRow: CampaignAnalyticsData
): CampaignStats {
  const totals = {
    triggers: analyticsRow.triggerCount || 0,
    dmsSent: analyticsRow.dmsSent || 0,
    dmsDelivered: analyticsRow.dmsDelivered || 0,
    replies: analyticsRow.replies || 0,
    emailsCaptured: analyticsRow.emailsCaptured || 0,
    flowCompletions: analyticsRow.flowCompletions || 0,
  };

  const deliveryRate = totals.dmsSent > 0 ? Math.round((totals.dmsDelivered / totals.dmsSent) * 100) : 0;
  const replyRate = totals.dmsSent > 0 ? Math.round((totals.replies / totals.dmsSent) * 100) : 0;
  const conversionRate = totals.triggers > 0 ? Math.round((totals.emailsCaptured / totals.triggers) * 100) : 0;

  return {
    campaignId,
    campaignName,
    status: campaignStatus,
    totals: { ...totals, deliveryRate, replyRate, conversionRate },
    dailyStats: [], // Not used in this page
  };
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  ARCHIVED: 'bg-gray-100 text-gray-600',
};

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const username = params.username as string;

  const { data: stats, isLoading } = useQuery({
    queryKey: ['campaign-stats', campaignId],
    queryFn: async () => {
      const [campaignRes, analyticsRes] = await Promise.all([
        campaignApi.get(campaignId),
        analyticsApi.campaign(campaignId),
      ]);

      if (campaignRes.error || !campaignRes.data) return null;

      const campaign = campaignRes.data;
      const analyticsRow = analyticsRes.data as CampaignAnalyticsData;

      return buildCampaignStats(
        campaign.id,
        campaign.name,
        campaign.status,
        analyticsRow
      );
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Campaign not found</p>
        <Link href={`/${username}/campaigns`}>
          <Button variant="outline" className="mt-4">
            Back to Campaigns
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${username}/campaigns`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{stats.campaignName}</h1>
              <Badge className={statusColors[stats.status]}>{stats.status}</Badge>
            </div>
            <p className="text-muted-foreground">Campaign analytics and performance</p>
          </div>
        </div>
        <Link href={`/${username}/campaigns/${campaignId}/edit`}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Campaign
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Triggers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totals.triggers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DMs Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totals.dmsSent}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totals.deliveryRate}% delivery rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replies</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totals.replies}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totals.replyRate}% reply rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Captured</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totals.emailsCaptured}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totals.conversionRate}% conversion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Performance</CardTitle>
          <CardDescription>Last 30 days of activity</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.dailyStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No activity data yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-right py-2">Triggers</th>
                    <th className="text-right py-2">DMs Sent</th>
                    <th className="text-right py-2">Replies</th>
                    <th className="text-right py-2">Conversions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.dailyStats.slice(0, 10).map((day) => (
                    <tr key={day.date} className="border-b">
                      <td className="py-2">{day.date}</td>
                      <td className="text-right py-2">{day.triggers}</td>
                      <td className="text-right py-2">{day.dmsSent}</td>
                      <td className="text-right py-2">{day.replies}</td>
                      <td className="text-right py-2">{day.conversions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
