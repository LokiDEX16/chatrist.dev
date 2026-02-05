'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
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
import type { CreateCampaignInput } from '@/lib/validations';

interface InstagramAccount {
  id: string;
  username: string;
  profilePic?: string;
}

interface Flow {
  id: string;
  name: string;
}

const triggerTypes = [
  { value: 'COMMENT', label: 'Comment', description: 'Trigger when someone comments on your post' },
  { value: 'STORY_REPLY', label: 'Story Reply', description: 'Trigger when someone replies to your story' },
  { value: 'DM_KEYWORD', label: 'DM Keyword', description: 'Trigger when someone sends a DM with specific keywords' },
  { value: 'NEW_FOLLOWER', label: 'New Follower', description: 'Trigger when someone follows you' },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;
  const { toast } = useToast();

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    instagramAccountId: string;
    triggerType: CreateCampaignInput['triggerType'];
    flowId: string;
    keywords: string;
    hourlyLimit: number;
    dailyLimit: number;
  }>({
    name: '',
    description: '',
    instagramAccountId: '',
    triggerType: 'COMMENT',
    flowId: '',
    keywords: '',
    hourlyLimit: 20,
    dailyLimit: 100,
  });

  const { data: accounts } = useQuery({
    queryKey: ['instagram-accounts'],
    queryFn: async () => {
      const response = await instagramApi.accounts();
      return (response.data || []) as InstagramAccount[];
    },
  });

  const { data: flows } = useQuery({
    queryKey: ['flows'],
    queryFn: async () => {
      const response = await flowApi.list();
      return (response.data || []) as Flow[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCampaignInput) => campaignApi.create(data),
    onSuccess: () => {
      toast({ title: 'Campaign created successfully' });
      router.push(`/${username}/campaigns`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create campaign',
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

    createMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      instagramAccountId: formData.instagramAccountId || undefined,
      triggerType: formData.triggerType,
      flowId: formData.flowId || undefined,
      triggerConfig: {
        keywords: keywords.length > 0 ? keywords : undefined,
        matchAll: false,
        caseSensitive: false,
      },
      hourlyLimit: formData.hourlyLimit,
      dailyLimit: formData.dailyLimit,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${username}/campaigns`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Campaign</h1>
          <p className="text-muted-foreground">
            Set up a new Instagram DM automation campaign
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Give your campaign a name and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Welcome New Followers"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description for this campaign"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instagram Account</CardTitle>
            <CardDescription>
              Select the Instagram account for this campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Instagram Account *</Label>
              <Select
                value={formData.instagramAccountId}
                onValueChange={(value) => setFormData({ ...formData, instagramAccountId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      @{account.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(!accounts || accounts.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  No Instagram accounts connected.{' '}
                  <Link href={`/${username}/instagram`} className="text-primary hover:underline">
                    Connect an account
                  </Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trigger Configuration</CardTitle>
            <CardDescription>
              Define when this campaign should activate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Trigger Type *</Label>
              <Select
                value={formData.triggerType}
                onValueChange={(value) => setFormData({ ...formData, triggerType: value as CreateCampaignInput['triggerType'] })}
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
              <p className="text-sm text-muted-foreground">
                {triggerTypes.find((t) => t.value === formData.triggerType)?.description}
              </p>
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
                <p className="text-sm text-muted-foreground">
                  Leave empty to trigger on all {formData.triggerType === 'COMMENT' ? 'comments' : 'DMs'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automation Flow</CardTitle>
            <CardDescription>
              Select the flow to execute when triggered
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Flow</Label>
              <Select
                value={formData.flowId}
                onValueChange={(value) => setFormData({ ...formData, flowId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a flow (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {flows?.map((flow) => (
                    <SelectItem key={flow.id} value={flow.id}>
                      {flow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(!flows || flows.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  No flows created yet.{' '}
                  <Link href={`/${username}/flows/new`} className="text-primary hover:underline">
                    Create a flow
                  </Link>
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                You can add a flow later, but the campaign cannot be activated without one.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rate Limits</CardTitle>
            <CardDescription>
              Set limits to stay within Instagram guidelines
            </CardDescription>
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
          <Button type="submit" disabled={createMutation.isPending || !formData.instagramAccountId}>
            {createMutation.isPending ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </div>
  );
}
