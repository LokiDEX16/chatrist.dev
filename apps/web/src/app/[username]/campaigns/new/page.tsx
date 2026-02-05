'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, MessageCircle, Send, Workflow } from 'lucide-react';
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
import { cn } from '@/lib/utils';
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

type AutomationMode = 'simple' | 'flow';
type SimpleAction = 'send_dm' | 'reply_comment';

export default function NewCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;
  const { toast } = useToast();

  const [automationMode, setAutomationMode] = useState<AutomationMode>('simple');
  const [simpleAction, setSimpleAction] = useState<SimpleAction>('send_dm');
  const [simpleMessage, setSimpleMessage] = useState('');

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

    // Build trigger config with simple action settings if using simple mode
    const triggerConfig: Record<string, unknown> = {
      keywords: keywords.length > 0 ? keywords : undefined,
      matchAll: false,
      caseSensitive: false,
    };

    if (automationMode === 'simple' && simpleMessage) {
      triggerConfig.simpleAction = simpleAction;
      triggerConfig.simpleMessage = simpleMessage;
    }

    createMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      instagramAccountId: formData.instagramAccountId || undefined,
      triggerType: formData.triggerType,
      flowId: automationMode === 'flow' ? formData.flowId || undefined : undefined,
      triggerConfig,
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
            <CardTitle>Automation Action</CardTitle>
            <CardDescription>
              Choose how to respond when triggered
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAutomationMode('simple')}
                className={cn(
                  'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all',
                  automationMode === 'simple'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className={cn(
                  'h-12 w-12 rounded-xl flex items-center justify-center',
                  automationMode === 'simple' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'
                )}>
                  <Send className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className={cn('font-medium', automationMode === 'simple' ? 'text-purple-700' : 'text-gray-700')}>
                    Simple Action
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Send a quick DM or reply
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAutomationMode('flow')}
                className={cn(
                  'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all',
                  automationMode === 'flow'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className={cn(
                  'h-12 w-12 rounded-xl flex items-center justify-center',
                  automationMode === 'flow' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'
                )}>
                  <Workflow className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className={cn('font-medium', automationMode === 'flow' ? 'text-purple-700' : 'text-gray-700')}>
                    Custom Flow
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Use advanced flow builder
                  </p>
                </div>
              </button>
            </div>

            {/* Simple Action Options */}
            {automationMode === 'simple' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Action Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSimpleAction('send_dm')}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-lg border transition-all text-left',
                        simpleAction === 'send_dm'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <Send className="h-4 w-4" />
                      <span className="text-sm font-medium">Send DM</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimpleAction('reply_comment')}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-lg border transition-all text-left',
                        simpleAction === 'reply_comment'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Reply to Comment</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="simpleMessage">
                    {simpleAction === 'send_dm' ? 'DM Message' : 'Comment Reply'} *
                  </Label>
                  <Textarea
                    id="simpleMessage"
                    value={simpleMessage}
                    onChange={(e) => setSimpleMessage(e.target.value)}
                    placeholder={
                      simpleAction === 'send_dm'
                        ? "Hey {{username}}! Thanks for your interest. Here's more info..."
                        : "Thanks for commenting, {{username}}! Check your DMs for more info."
                    }
                    rows={4}
                    required={automationMode === 'simple'}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {'{{username}}'} to personalize with the user's name
                  </p>
                </div>
              </div>
            )}

            {/* Custom Flow Selection */}
            {automationMode === 'flow' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Select Flow</Label>
                  <Select
                    value={formData.flowId}
                    onValueChange={(value) => setFormData({ ...formData, flowId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a flow" />
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
                </div>
              </div>
            )}
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
          <Button
            type="submit"
            disabled={
              createMutation.isPending ||
              !formData.instagramAccountId ||
              (automationMode === 'simple' && !simpleMessage) ||
              (automationMode === 'flow' && !formData.flowId)
            }
          >
            {createMutation.isPending ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </div>
  );
}
