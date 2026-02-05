'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { campaignApi, flowApi, instagramApi } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  instagramAccountId: string;
  triggerType: string;
  triggerConfig: {
    keywords?: string[];
  };
  flowId?: string;
  hourlyLimit: number;
  dailyLimit: number;
}

interface InstagramAccount {
  id: string;
  username: string;
}

interface Flow {
  id: string;
  name: string;
}

const triggerTypes = [
  { value: 'COMMENT', label: 'Comment' },
  { value: 'STORY_REPLY', label: 'Story Reply' },
  { value: 'DM_KEYWORD', label: 'DM Keyword' },
  { value: 'NEW_FOLLOWER', label: 'New Follower' },
];

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const campaignId = params.id as string;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerType: 'COMMENT',
    flowId: '',
    keywords: '',
    hourlyLimit: 20,
    dailyLimit: 100,
  });

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const response = await campaignApi.get(campaignId);
      if (!response.data) return null;
      // Map database snake_case to local camelCase
      const c = response.data;
      return {
        id: c.id,
        name: c.name,
        description: c.description,
        instagramAccountId: c.instagram_account_id || '',
        triggerType: c.trigger_type,
        triggerConfig: c.trigger_config,
        flowId: c.flow_id,
        hourlyLimit: c.hourly_limit,
        dailyLimit: c.daily_limit,
      } as Campaign;
    },
  });

  const { data: flows } = useQuery({
    queryKey: ['flows'],
    queryFn: async () => {
      const response = await flowApi.list();
      if (!response.data) return [];
      return (response.data || []).map((f) => ({ id: f.id, name: f.name })) as Flow[];
    },
  });

  // Update form when campaign loads
  useEffect(() => {
    if (campaign) {
      const keywords = campaign.triggerConfig?.keywords;
      setFormData({
        name: campaign.name || '',
        description: campaign.description || '',
        triggerType: campaign.triggerType || 'COMMENT',
        flowId: campaign.flowId || '',
        keywords: Array.isArray(keywords) ? keywords.join(', ') : '',
        hourlyLimit: campaign.hourlyLimit || 20,
        dailyLimit: campaign.dailyLimit || 100,
      });
    }
  }, [campaign]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => campaignApi.update(campaignId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      toast({ title: 'Campaign updated successfully' });
      router.push(`/${username}/campaigns`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update campaign',
        description: error.message || 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const keywords = formData.keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    updateMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      triggerType: formData.triggerType,
      flowId: formData.flowId || undefined,
      triggerConfig: {
        keywords: keywords.length > 0 ? keywords : undefined,
      },
      hourlyLimit: formData.hourlyLimit,
      dailyLimit: formData.dailyLimit,
    });
  };

  if (campaignLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">Campaign not found</p>
        <Link href={`/${username}/campaigns`}>
          <Button variant="outline">Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${username}/campaigns`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Campaign</h1>
          <p className="text-muted-foreground">Update your campaign settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update your campaign name and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trigger Configuration</CardTitle>
            <CardDescription>Define when this campaign should activate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Trigger Type *</Label>
              <Select
                value={formData.triggerType}
                onValueChange={(value) => setFormData({ ...formData, triggerType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {triggerTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(formData.triggerType === 'COMMENT' || formData.triggerType === 'DM_KEYWORD') && (
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="e.g., info, interested, price"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automation Flow</CardTitle>
            <CardDescription>Select the flow to execute when triggered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Flow</Label>
              <Select
                value={formData.flowId || 'none'}
                onValueChange={(value) => setFormData({ ...formData, flowId: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a flow" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No flow selected</SelectItem>
                  {flows?.map((flow) => (
                    <SelectItem key={flow.id} value={flow.id}>
                      {flow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rate Limits</CardTitle>
            <CardDescription>Set limits to stay within Instagram guidelines</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hourlyLimit">Hourly Limit</Label>
              <Input
                id="hourlyLimit"
                type="number"
                min={1}
                max={50}
                value={formData.hourlyLimit}
                onChange={(e) => setFormData({ ...formData, hourlyLimit: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailyLimit">Daily Limit</Label>
              <Input
                id="dailyLimit"
                type="number"
                min={1}
                max={500}
                value={formData.dailyLimit}
                onChange={(e) => setFormData({ ...formData, dailyLimit: parseInt(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/${username}/campaigns`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
