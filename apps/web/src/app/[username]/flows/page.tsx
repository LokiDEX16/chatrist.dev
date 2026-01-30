'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreVertical, Trash2, Edit, Copy, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { flowApi } from '@/lib/api';
import type { DatabaseFlow } from '@/lib/validations';
import { useToast } from '@/components/ui/use-toast';

type Flow = DatabaseFlow;

export default function FlowsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const params = useParams();
  const username = params?.username as string;

  const { data, isLoading } = useQuery({
    queryKey: ['flows'],
    queryFn: async () => {
      const response = await flowApi.list();
      return response.data as Flow[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => flowApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      toast({ title: 'Flow deleted successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete flow',
        description: error.message || 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const flows = data || [];
  const userFlows = flows.filter((f) => !f.is_template);
  const templates = flows.filter((f) => f.is_template);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Flows</h1>
          <p className="text-muted-foreground">
            Build visual automation flows for your Instagram DMs
          </p>
        </div>
        <Link href={`/${username}/flows/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Flow
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-full bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* User Flows */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Your Flows</h2>
            {userFlows.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No flows created yet</p>
                  <Link href={`/${username}/flows/new`}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create your first flow
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userFlows.map((flow) => (
                  <FlowCard
                    key={flow.id}
                    flow={flow}
                    username={username}
                    onDelete={() => deleteMutation.mutate(flow.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Templates */}
          {templates.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Templates</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((flow) => (
                  <FlowCard key={flow.id} flow={flow} username={username} isTemplate />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FlowCard({
  flow,
  username,
  onDelete,
  isTemplate = false,
}: {
  flow: Flow;
  username: string;
  onDelete?: () => void;
  isTemplate?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{flow.name}</CardTitle>
              {isTemplate && <Badge variant="secondary">Template</Badge>}
            </div>
            {flow.description && (
              <CardDescription className="line-clamp-2">
                {flow.description}
              </CardDescription>
            )}
          </div>
          {!isTemplate && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href={`/${username}/flows/${flow.id}`}>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{flow.nodes?.length || 0} nodes</span>
        </div>
        <Link href={isTemplate ? `/${username}/flows/new?template=${flow.id}` : `/${username}/flows/${flow.id}`}>
          <Button variant="outline" size="sm" className="w-full">
            {isTemplate ? 'Use Template' : 'Open Editor'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
