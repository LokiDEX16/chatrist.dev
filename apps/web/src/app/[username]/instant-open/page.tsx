'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Plus, Copy, ExternalLink, Link2, Trash2, MousePointerClick, BarChart3 } from 'lucide-react';

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

interface SmartLink {
  id: string;
  name: string;
  destinationUrl: string;
  slug: string;
  campaign: string;
  clicks: number;
  createdAt: Date;
}

export default function InstantOpenPage() {
  const { toast } = useToast();
  const [links, setLinks] = useState<SmartLink[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    destinationUrl: '',
    slug: '',
    campaign: '',
  });

  const handleCreateLink = () => {
    if (!formData.name.trim() || !formData.destinationUrl.trim()) {
      toast({ title: 'Please fill in the required fields', variant: 'destructive' });
      return;
    }

    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newLink: SmartLink = {
      id: crypto.randomUUID(),
      name: formData.name.trim(),
      destinationUrl: formData.destinationUrl.trim(),
      slug,
      campaign: formData.campaign.trim(),
      clicks: Math.floor(Math.random() * 50),
      createdAt: new Date(),
    };

    setLinks(prev => [newLink, ...prev]);
    setFormData({ name: '', destinationUrl: '', slug: '', campaign: '' });
    toast({ title: 'Smart link created!' });
  };

  const handleCopyLink = async (slug: string) => {
    const url = `https://chatrist.link/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied to clipboard' });
    } catch {
      toast({ title: 'Failed to copy link', variant: 'destructive' });
    }
  };

  const handleDeleteLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
    toast({ title: 'Link deleted' });
  };

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Instant Open</h1>
          <p className="text-[#475569] text-sm mt-1">
            Create links that directly open your app and create short URLs
          </p>
        </div>
        <Button
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg"
          onClick={() => document.getElementById('link-name')?.focus()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Smart Link
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border border-[#CBD5E1] bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#475569] font-medium">Total Links</p>
                <p className="text-3xl font-bold text-[#0F172A] mt-1">{links.length}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Link2 className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-[#CBD5E1] bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#475569] font-medium">Total Clicks</p>
                <p className="text-3xl font-bold text-[#0F172A] mt-1">{totalClicks}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <MousePointerClick className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Card */}
      <motion.div variants={item}>
        <Card className="border border-[#CBD5E1] bg-white">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-slate-50 rounded-t-2xl">
            <CardTitle className="text-lg">About Instant Open</CardTitle>
            <CardDescription>
              Create deep links that directly open your app, bypassing the browser
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-[#0F172A] mb-2">How it works:</h3>
                <ul className="space-y-2 text-sm text-[#475569]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#6366F1] font-bold">1.</span>
                    <span>Create a smart link that opens your app directly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6366F1] font-bold">2.</span>
                    <span>Share the link with your audience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6366F1] font-bold">3.</span>
                    <span>Users click the link and instantly open your app</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6366F1] font-bold">4.</span>
                    <span>Track analytics and optimize your links</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Link Form */}
      <motion.div variants={item}>
        <Card className="border border-[#CBD5E1] bg-white">
          <CardHeader>
            <CardTitle>Create New Smart Link</CardTitle>
            <CardDescription>Set up a custom link for your campaigns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="link-name">Link Name *</Label>
                <Input
                  id="link-name"
                  placeholder="e.g., Summer Campaign"
                  className="rounded-lg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-url">Destination URL *</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  className="rounded-lg"
                  value={formData.destinationUrl}
                  onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-slug">Custom Slug</Label>
                <Input
                  id="custom-slug"
                  placeholder="summer-campaign"
                  className="rounded-lg"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign">Campaign (Optional)</Label>
                <Input
                  id="campaign"
                  placeholder="Select a campaign"
                  className="rounded-lg"
                  value={formData.campaign}
                  onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                />
              </div>
            </div>
            <Button
              className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg"
              onClick={handleCreateLink}
              disabled={!formData.name.trim() || !formData.destinationUrl.trim()}
            >
              Create Smart Link
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Smart Links List */}
      <motion.div variants={item}>
        <Card className="border border-[#CBD5E1] bg-white">
          <CardHeader>
            <CardTitle>Your Smart Links</CardTitle>
            <CardDescription>Manage and track your created links</CardDescription>
          </CardHeader>
          <CardContent>
            {links.length === 0 ? (
              <div className="text-center py-12">
                <Link2 className="h-12 w-12 text-[#CBD5E1] mx-auto mb-3" />
                <p className="text-[#475569] text-sm">No smart links created yet</p>
                <p className="text-[#94A3B8] text-xs mt-1">Create your first smart link to get started</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {links.map((link, index) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border border-gray-100 bg-gray-50/50 hover:shadow-md transition-shadow">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-[#0F172A] text-sm">{link.name}</h4>
                            {link.campaign && (
                              <Badge variant="secondary" className="mt-1 text-xs">{link.campaign}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#475569]">
                            <MousePointerClick className="h-3 w-3" />
                            {link.clicks}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <a
                            href={link.destinationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline truncate"
                          >
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{link.destinationUrl}</span>
                          </a>
                          <p className="text-xs text-[#475569] font-mono bg-white px-2 py-1 rounded border border-gray-100">
                            chatrist.link/{link.slug}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-lg text-xs"
                            onClick={() => handleCopyLink(link.slug)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteLink(link.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
