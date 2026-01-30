'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { flowApi } from '@/lib/api';
import type { CreateFlowInput } from '@/lib/validations';
import { useToast } from '@/components/ui/use-toast';

function NewFlowContent() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const templateId = searchParams.get('template');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateFlowInput) => flowApi.create(data),
    onSuccess: (response) => {
      toast({ title: 'Flow created successfully' });
      const flowId = response.data?.id;
      if (flowId) router.push(`/${username}/flows/${flowId}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create flow',
        description: error.message || 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const defaultNodes: CreateFlowInput['nodes'] = [
      {
        id: 'start-1',
        type: 'message' as const,
        position: { x: 250, y: 100 },
        data: {
          content: 'Hi {{username}}! Thanks for reaching out.',
          personalization: true,
        },
      },
    ];

    createMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      nodes: defaultNodes,
      edges: [],
      isTemplate: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${username}/flows`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {templateId ? 'Create Flow from Template' : 'Create New Flow'}
          </h1>
          <p className="text-muted-foreground">
            Build a visual automation flow for your Instagram DMs
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Flow Details</CardTitle>
            <CardDescription>
              Give your flow a name and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Flow Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Welcome Message Flow"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description for this flow"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/${username}/flows`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={createMutation.isPending || !formData.name}>
            {createMutation.isPending ? 'Creating...' : 'Create & Open Editor'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewFlowPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewFlowContent />
    </Suspense>
  );
}
