'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Play, BookOpen, Users, Zap, MessageSquare, Settings, Clock, Search, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const tutorials = [
  {
    id: 'getting-started',
    title: 'Getting Started with Chatrist',
    description: 'Learn the basics of setting up your Instagram automation',
    duration: '8:30',
    category: 'Basics',
    icon: Play,
    thumbnail: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'first-campaign',
    title: 'Creating Your First Campaign',
    description: 'Step-by-step guide to create and launch your first automation campaign',
    duration: '12:45',
    category: 'Campaigns',
    icon: Zap,
    thumbnail: 'bg-gradient-to-br from-blue-500 to-blue-600',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'advanced-flows',
    title: 'Building Advanced Flows',
    description: 'Master the visual flow builder with advanced node types and logic',
    duration: '15:20',
    category: 'Flows',
    icon: MessageSquare,
    thumbnail: 'bg-gradient-to-br from-pink-500 to-pink-600',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'lead-capture',
    title: 'Lead Capture & CRM Setup',
    description: 'Capture and manage leads effectively from your Instagram campaigns',
    duration: '10:15',
    category: 'Leads',
    icon: Users,
    thumbnail: 'bg-gradient-to-br from-[#22C55E] to-emerald-600',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'analytics',
    title: 'Analytics & Performance Tracking',
    description: 'Understand your campaign metrics and optimize for better results',
    duration: '9:40',
    category: 'Analytics',
    icon: BookOpen,
    thumbnail: 'bg-gradient-to-br from-amber-500 to-amber-600',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'account-settings',
    title: 'Account Settings & Configuration',
    description: 'Configure your account settings and integration options',
    duration: '7:25',
    category: 'Settings',
    icon: Settings,
    thumbnail: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
];

const categories = ['All', 'Basics', 'Campaigns', 'Flows', 'Leads', 'Analytics', 'Settings'];

export default function TutorialsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTutorial, setSelectedTutorial] = useState<typeof tutorials[0] | null>(null);
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());

  const filteredTutorials = tutorials.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlayTutorial = (tutorial: typeof tutorials[0]) => {
    setSelectedTutorial(tutorial);
    setWatchedIds(prev => new Set(prev).add(tutorial.id));
  };

  const handleCloseDialog = () => {
    setSelectedTutorial(null);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#0F172A]">Video Tutorials</h1>
          <p className="text-[#475569] text-sm mt-2 max-w-2xl mx-auto">
            Learn how to master Chatrist with our comprehensive video guides. From basics to advanced strategies.
          </p>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={item}>
        <div className="relative w-full max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569]" />
          <Input
            placeholder="Search tutorials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl"
          />
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div variants={item}>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-1 h-auto p-1 bg-transparent">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="rounded-full px-4 text-sm data-[state=active]:bg-[#6366F1] data-[state=active]:text-white"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Featured Video */}
      <motion.div variants={item}>
        <Card
          className="border border-[#CBD5E1] bg-white overflow-hidden cursor-pointer"
          onClick={() => handlePlayTutorial(tutorials[0])}
        >
          <div className="aspect-video bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            {watchedIds.has(tutorials[0].id) && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-emerald-500 text-white rounded-full gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Watched
                </Badge>
              </div>
            )}
            <button className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-white/90 hover:bg-white transition-colors group-hover:scale-110">
              <Play className="h-6 w-6 text-[#6366F1] ml-1" />
            </button>
          </div>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold text-[#0F172A]">Getting Started with Chatrist</h3>
            <p className="text-[#475569] text-sm mt-2">
              This comprehensive guide will walk you through setting up your first Instagram automation campaign.
              Learn how to connect your account, create campaigns, and start automating your DMs.
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-[#475569]">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                8:30 minutes
              </span>
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">Basics</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tutorial Grid */}
      <motion.div variants={item}>
        <div>
          <h2 className="text-xl font-semibold text-[#0F172A] mb-4">All Tutorials</h2>

          {filteredTutorials.length === 0 ? (
            <Card className="border-dashed border-2 border-[#CBD5E1]">
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 text-[#CBD5E1] mx-auto mb-3" />
                <p className="text-[#475569] text-sm font-medium">No tutorials found</p>
                <p className="text-[#94A3B8] text-xs mt-1">Try adjusting your search or filter</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTutorials.map((tutorial) => (
                <Card
                  key={tutorial.id}
                  className="border border-[#CBD5E1] bg-white overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handlePlayTutorial(tutorial)}
                >
                  <div className={cn(
                    'aspect-video flex items-center justify-center relative overflow-hidden',
                    tutorial.thumbnail
                  )}>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    {watchedIds.has(tutorial.id) && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-emerald-500 text-white rounded-full gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3" /> Watched
                        </Badge>
                      </div>
                    )}
                    <button className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white/90 group-hover:bg-white transition-colors group-hover:scale-110">
                      <Play className="h-4 w-4 text-[#0F172A] ml-0.5" />
                    </button>
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-[#0F172A] text-sm line-clamp-2">{tutorial.title}</h3>
                    <p className="text-[#475569] text-xs mt-1 line-clamp-2">{tutorial.description}</p>
                    <div className="flex items-center justify-between mt-3 text-xs text-[#475569]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {tutorial.duration}
                      </span>
                      <span className="px-2 py-1 bg-slate-100 text-[#475569] rounded text-xs font-medium">
                        {tutorial.category}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Resources */}
      <motion.div variants={item}>
        <Card className="border border-[#CBD5E1] bg-white">
          <CardHeader>
            <CardTitle>Additional Resources</CardTitle>
            <CardDescription>Learn more about Chatrist features and strategies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto flex-col items-start p-4 rounded-lg border-[#CBD5E1] justify-start">
                <BookOpen className="h-5 w-5 text-[#6366F1] mb-2" />
                <span className="font-semibold">Documentation</span>
                <span className="text-xs text-[#475569] mt-1">Read our detailed guides and API docs</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col items-start p-4 rounded-lg border-[#CBD5E1] justify-start">
                <Users className="h-5 w-5 text-blue-600 mb-2" />
                <span className="font-semibold">Community</span>
                <span className="text-xs text-[#475569] mt-1">Connect with other creators</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col items-start p-4 rounded-lg border-[#CBD5E1] justify-start">
                <MessageSquare className="h-5 w-5 text-pink-600 mb-2" />
                <span className="font-semibold">Support</span>
                <span className="text-xs text-[#475569] mt-1">Get help from our support team</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col items-start p-4 rounded-lg border-[#CBD5E1] justify-start">
                <Zap className="h-5 w-5 text-amber-600 mb-2" />
                <span className="font-semibold">Best Practices</span>
                <span className="text-xs text-[#475569] mt-1">Tips for maximum engagement</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedTutorial} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="sm:max-w-2xl rounded-2xl p-0 overflow-hidden">
          <div className="aspect-video bg-black relative">
            {selectedTutorial && (
              <div className={cn(
                'w-full h-full flex items-center justify-center',
                selectedTutorial.thumbnail
              )}>
                <div className="text-center text-white">
                  <Play className="h-16 w-16 mx-auto mb-4 opacity-80" />
                  <p className="text-lg font-semibold">Video Player</p>
                  <p className="text-sm opacity-70 mt-1">Video playback coming soon</p>
                </div>
              </div>
            )}
          </div>
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-lg">{selectedTutorial?.title}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-[#475569] mt-2">{selectedTutorial?.description}</p>
            <div className="flex items-center gap-3 mt-3 text-sm text-[#475569]">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selectedTutorial?.duration}
              </span>
              <Badge variant="secondary" className="rounded-full">{selectedTutorial?.category}</Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
