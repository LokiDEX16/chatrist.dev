'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Download,
  Search,
  Tag,
  Mail,
  Trash2,
  MoreHorizontal,
  Users,
  TrendingUp,
  Calendar,
  Instagram,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { leadApi } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

interface Lead {
  id: string;
  ig_user_id: string;
  ig_username: string;
  email?: string;
  name?: string;
  tags: string[];
  source?: string;
  created_at: string;
}

interface LeadStats {
  total: number;
  withEmail: number;
  emailCaptureRate: number;
  last7Days: number;
}

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
  icon: Icon,
  trend,
  loading,
}: {
  title: string;
  value: string | number;
  icon: typeof Users;
  trend?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="stat-label">{title}</p>
            <p className="stat-value">{value}</p>
            {trend && (
              <p className="text-xs text-emerald-600 font-medium">{trend}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function LeadsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newTag, setNewTag] = useState('');

  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', search],
    queryFn: async () => {
      const response = await leadApi.list({ page: 1, limit: 50, search: search || undefined });
      return response.data as { data: Lead[]; pagination: { total: number; page: number; limit: number } };
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['lead-stats'],
    queryFn: async () => {
      const response = await leadApi.list({ page: 1, limit: 100 });
      const responseData = response.data as { data: Lead[]; pagination: { total: number } };
      const leads = responseData?.data || [];
      const pagination = responseData?.pagination;
      return {
        total: pagination?.total || 0,
        withEmail: leads.filter((l) => l.email).length,
        emailCaptureRate: leads.length > 0
          ? (leads.filter((l) => l.email).length / leads.length) * 100
          : 0,
        last7Days: leads.filter(
          (l) => new Date(l.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
      } as LeadStats;
    },
  });

  const addTagMutation = useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) =>
      leadApi.addTags(id, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Tag added' });
      setNewTag('');
      setSelectedLead(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
      toast({ title: 'Lead deleted' });
    },
  });

  const handleExport = async () => {
    try {
      const response = await leadApi.export({ page: 1, limit: 10000, search });
      const leads = (response.data || []) as Lead[];
      // Convert leads to CSV
      const headers = ['ID', 'Username', 'Email', 'Source', 'Tags', 'Created At'];
      const rows = leads.map((l) => [
        l.id,
        l.ig_username || '',
        l.email || '',
        l.source || '',
        (l.tags || []).join(';'),
        l.created_at || '',
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.map((c) => `"${c}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: 'Export started', description: 'Your CSV file is downloading.' });
    } catch (error) {
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  };

  const leads = leadsData?.data || [];

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
          <h1 className="page-title">Leads</h1>
          <p className="page-description">
            Manage your captured Instagram leads
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" size="lg">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Leads"
          value={stats?.total || 0}
          icon={Users}
          loading={statsLoading}
        />
        <StatCard
          title="With Email"
          value={stats?.withEmail || 0}
          icon={Mail}
          loading={statsLoading}
        />
        <StatCard
          title="Capture Rate"
          value={`${stats?.emailCaptureRate?.toFixed(1) || 0}%`}
          icon={TrendingUp}
          loading={statsLoading}
        />
        <StatCard
          title="Last 7 Days"
          value={stats?.last7Days || 0}
          icon={Calendar}
          loading={statsLoading}
        />
      </motion.div>

      {/* Search and Table */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="border-b border-border/50">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg">All Leads</CardTitle>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username, email, or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 rounded-xl"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <TableSkeleton />
              </div>
            ) : leads.length === 0 ? (
              <div className="empty-state py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <p className="empty-state-title">
                  {search ? 'No leads match your search' : 'No leads yet'}
                </p>
                <p className="empty-state-description">
                  {search
                    ? 'Try adjusting your search terms'
                    : 'Leads will appear here when users interact with your campaigns'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-medium">Username</TableHead>
                      <TableHead className="font-medium">Name</TableHead>
                      <TableHead className="font-medium">Email</TableHead>
                      <TableHead className="font-medium">Tags</TableHead>
                      <TableHead className="font-medium">Source</TableHead>
                      <TableHead className="font-medium">Date</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead, index) => (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="group border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
                              <Instagram className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-foreground">@{lead.ig_username}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {lead.name || <span className="text-muted-foreground/50">-</span>}
                        </TableCell>
                        <TableCell>
                          {lead.email ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-4 w-4 text-emerald-500" />
                              <span className="truncate max-w-[200px]">{lead.email}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1.5 flex-wrap">
                            {lead.tags.length > 0 ? (
                              lead.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="rounded-full text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground/50 text-sm">No tags</span>
                            )}
                            {lead.tags.length > 2 && (
                              <Badge variant="outline" className="rounded-full text-xs">
                                +{lead.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {lead.source || <span className="text-muted-foreground/50">-</span>}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(lead.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl">
                              <DropdownMenuItem
                                onClick={() => setSelectedLead(lead)}
                                className="rounded-lg cursor-pointer"
                              >
                                <Tag className="mr-2 h-4 w-4" />
                                Add tag
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => deleteMutation.mutate(lead.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete lead
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Tag Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add tag to @{selectedLead?.ig_username}</DialogTitle>
            <DialogDescription>
              Tags help you organize and filter your leads for better targeting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedLead?.tags && selectedLead.tags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Current tags</Label>
                <div className="flex gap-2 flex-wrap">
                  {selectedLead.tags.map((tag) => (
                    <Badge key={tag} className="rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newTag">New tag</Label>
              <Input
                id="newTag"
                placeholder="e.g., vip, interested, hot-lead"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTag && selectedLead) {
                    e.preventDefault();
                    addTagMutation.mutate({ id: selectedLead.id, tags: [newTag] });
                  }
                }}
                className="h-11 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                Press Enter to add the tag
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setSelectedLead(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (newTag && selectedLead) {
                  addTagMutation.mutate({ id: selectedLead.id, tags: [newTag] });
                }
              }}
              disabled={!newTag || addTagMutation.isPending}
              className="rounded-xl"
            >
              Add tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
