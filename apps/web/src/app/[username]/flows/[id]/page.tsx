'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Node, Edge } from '@xyflow/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlowBuilder } from '@/components/flow-builder/FlowBuilder';
import { flowApi } from '@/lib/api';
import type { UpdateFlowInput } from '@/lib/validations';
import { useToast } from '@/components/ui/use-toast';

interface Flow {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
}

export default function FlowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const flowId = params.id as string;
  const username = params.username as string;

  const { data: flow, isLoading } = useQuery({
    queryKey: ['flow', flowId],
    queryFn: async () => {
      const response = await flowApi.get(flowId);
      return response.data as Flow;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { nodes: Node[]; edges: Edge[] }) =>
      flowApi.update(flowId, data as unknown as UpdateFlowInput),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow', flowId] });
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      toast({ title: 'Flow saved successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to save flow',
        description: error.message || 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const handleSave = (nodes: Node[], edges: Edge[]) => {
    updateMutation.mutate({ nodes, edges });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-180px)]">
        <div className="animate-pulse text-muted-foreground">Loading flow...</div>
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)]">
        <p className="text-muted-foreground mb-4">Flow not found</p>
        <Link href={`/${username}/flows`}>
          <Button variant="outline">Back to Flows</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href={`/${username}/flows`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{flow.name}</h1>
          {flow.description && (
            <p className="text-sm text-muted-foreground">{flow.description}</p>
          )}
        </div>
      </div>

      <FlowBuilder
        initialNodes={flow.nodes || []}
        initialEdges={flow.edges || []}
        onSave={handleSave}
        isSaving={updateMutation.isPending}
      />
    </div>
  );
}
