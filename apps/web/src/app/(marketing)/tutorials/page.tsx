'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowRight,
  Play,
  Clock,
  BookOpen,
  Video,
  Zap,
  Instagram,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  Target,
  Sparkles,
  Search,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const categories = [
  { id: 'all', label: 'All Tutorials', icon: BookOpen },
  { id: 'getting-started', label: 'Getting Started', icon: Zap },
  { id: 'flows', label: 'Flow Builder', icon: Sparkles },
  { id: 'triggers', label: 'Triggers & Actions', icon: Target },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'advanced', label: 'Advanced', icon: Settings },
];

const tutorials = [
  {
    id: 1,
    title: 'Getting Started with Chatrist',
    description:
      'Learn how to set up your Chatrist account, connect your Instagram, and create your first automation in under 10 minutes.',
    category: 'getting-started',
    duration: '8 min',
    type: 'video',
    level: 'Beginner',
    featured: true,
    steps: [
      'Create your Chatrist account',
      'Connect your Instagram Business account',
      'Navigate the dashboard',
      'Create your first automation flow',
    ],
  },
  {
    id: 2,
    title: 'Connecting Your Instagram Account',
    description:
      'Step-by-step guide to connecting your Instagram Business or Creator account using the official Instagram Graph API.',
    category: 'getting-started',
    duration: '5 min',
    type: 'guide',
    level: 'Beginner',
    featured: false,
    steps: [
      'Ensure you have a Business or Creator account',
      'Connect your Facebook Page',
      'Authorize Chatrist permissions',
      'Verify the connection',
    ],
  },
  {
    id: 3,
    title: 'Building Your First DM Flow',
    description:
      'Create a complete DM automation flow from scratch using our visual flow builder. Perfect for beginners.',
    category: 'flows',
    duration: '12 min',
    type: 'video',
    level: 'Beginner',
    featured: true,
    steps: [
      'Understanding flow components',
      'Adding message nodes',
      'Setting up conditions',
      'Testing your flow',
    ],
  },
  {
    id: 4,
    title: 'Comment-to-DM Automation',
    description:
      'Set up automatic DM responses when users comment specific keywords on your posts. Great for lead generation.',
    category: 'triggers',
    duration: '10 min',
    type: 'video',
    level: 'Intermediate',
    featured: false,
    steps: [
      'Create a new campaign',
      'Set up comment triggers',
      'Configure keyword matching',
      'Design your DM sequence',
    ],
  },
  {
    id: 5,
    title: 'Story Reply Automations',
    description:
      'Automatically respond to story replies and mentions. Perfect for engagement and driving conversations.',
    category: 'triggers',
    duration: '8 min',
    type: 'guide',
    level: 'Intermediate',
    featured: false,
    steps: [
      'Enable story reply triggers',
      'Set up reply templates',
      'Add personalization tokens',
      'Monitor performance',
    ],
  },
  {
    id: 6,
    title: 'New Follower Welcome Sequences',
    description:
      'Create automated welcome messages for new followers to boost engagement and start conversations.',
    category: 'triggers',
    duration: '7 min',
    type: 'video',
    level: 'Beginner',
    featured: false,
    steps: [
      'Set up follower trigger',
      'Create welcome message',
      'Add delay nodes',
      'Include call-to-action',
    ],
  },
  {
    id: 7,
    title: 'Advanced Flow Conditions',
    description:
      'Learn how to use conditional logic to create personalized experiences based on user responses and behavior.',
    category: 'flows',
    duration: '15 min',
    type: 'video',
    level: 'Advanced',
    featured: false,
    steps: [
      'Understanding condition nodes',
      'Setting up branching logic',
      'Using variables and tags',
      'Creating dynamic responses',
    ],
  },
  {
    id: 8,
    title: 'Lead Capture and Export',
    description:
      'Collect user information through DM conversations and export leads to your CRM or email marketing tools.',
    category: 'advanced',
    duration: '11 min',
    type: 'guide',
    level: 'Intermediate',
    featured: true,
    steps: [
      'Add capture nodes to flows',
      'Configure data fields',
      'Set up integrations',
      'Export and manage leads',
    ],
  },
  {
    id: 9,
    title: 'Understanding Analytics',
    description:
      'Master the analytics dashboard to track campaign performance, engagement rates, and conversion metrics.',
    category: 'analytics',
    duration: '9 min',
    type: 'video',
    level: 'Beginner',
    featured: false,
    steps: [
      'Navigate the analytics dashboard',
      'Understand key metrics',
      'Track campaign performance',
      'Generate reports',
    ],
  },
  {
    id: 10,
    title: 'A/B Testing Your Messages',
    description:
      'Learn how to set up A/B tests to optimize your DM copy and improve conversion rates.',
    category: 'advanced',
    duration: '13 min',
    type: 'guide',
    level: 'Advanced',
    featured: false,
    steps: [
      'Create message variants',
      'Configure test parameters',
      'Monitor test results',
      'Implement winning variants',
    ],
  },
  {
    id: 11,
    title: 'Rate Limiting and Account Safety',
    description:
      'Best practices for keeping your Instagram account safe while using automation tools.',
    category: 'advanced',
    duration: '6 min',
    type: 'guide',
    level: 'Intermediate',
    featured: false,
    steps: [
      'Understanding Instagram limits',
      'Configuring rate limiting',
      'Queue management',
      'Monitoring account health',
    ],
  },
  {
    id: 12,
    title: 'Using the API for Custom Integrations',
    description:
      'Developer guide for using the Chatrist API to build custom integrations and workflows.',
    category: 'advanced',
    duration: '20 min',
    type: 'guide',
    level: 'Advanced',
    featured: false,
    steps: [
      'Generate API keys',
      'Authenticate requests',
      'Common API endpoints',
      'Webhooks and callbacks',
    ],
  },
];

const quickStartSteps = [
  {
    step: 1,
    title: 'Create Account',
    description: 'Sign up for Chatrist with your email or Google account.',
    icon: Users,
  },
  {
    step: 2,
    title: 'Connect Instagram',
    description: 'Link your Instagram Business or Creator account.',
    icon: Instagram,
  },
  {
    step: 3,
    title: 'Build a Flow',
    description: 'Use the visual builder to create your first automation.',
    icon: Sparkles,
  },
  {
    step: 4,
    title: 'Go Live',
    description: 'Activate your campaign and watch the engagement roll in.',
    icon: Zap,
  },
];

export default function TutorialsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTutorials = tutorials.filter((tutorial) => {
    const matchesCategory =
      selectedCategory === 'all' || tutorial.category === selectedCategory;
    const matchesSearch =
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredTutorials = tutorials.filter((t) => t.featured);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-orange-200/40 via-pink-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-100/30 to-transparent rounded-full blur-3xl" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="container relative mx-auto px-4 lg:px-8"
        >
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 bg-orange-100 text-orange-700 hover:bg-orange-100">
              Learn Chatrist
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              Tutorials &{' '}
              <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
                Getting Started
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 leading-relaxed">
              Learn how to master Instagram DM automation with our comprehensive tutorials,
              video guides, and step-by-step walkthroughs.
            </p>

            {/* Search */}
            <div className="mt-10 max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search tutorials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 rounded-full border-gray-200 bg-white shadow-sm"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Quick Start Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">Quick Start Guide</h2>
            <p className="mt-4 text-lg text-gray-500">
              Get up and running with Chatrist in just 4 simple steps.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-4 max-w-5xl mx-auto">
            {quickStartSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative"
              >
                {index < quickStartSteps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-px bg-gradient-to-r from-orange-200 to-pink-200" />
                )}
                <Card className="border-gray-200 text-center h-full">
                  <CardContent className="p-6">
                    <div className="relative inline-flex">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border-2 border-gray-100 shadow-sm">
                        <step.icon className="h-8 w-8 text-gray-700" />
                      </div>
                      <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-xs font-bold text-white">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tutorials */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">Featured Tutorials</h2>
            <p className="mt-4 text-lg text-gray-500">
              Start with our most popular guides recommended for new users.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {featuredTutorials.map((tutorial, index) => (
              <motion.div
                key={tutorial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge
                        className={cn(
                          'text-xs',
                          tutorial.type === 'video'
                            ? 'bg-pink-100 text-pink-700 hover:bg-pink-100'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                        )}
                      >
                        {tutorial.type === 'video' ? (
                          <Video className="h-3 w-3 mr-1" />
                        ) : (
                          <BookOpen className="h-3 w-3 mr-1" />
                        )}
                        {tutorial.type === 'video' ? 'Video' : 'Guide'}
                      </Badge>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {tutorial.duration}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {tutorial.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">{tutorial.description}</p>

                    <div className="space-y-2">
                      {tutorial.steps.slice(0, 3).map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          {step}
                        </div>
                      ))}
                      {tutorial.steps.length > 3 && (
                        <p className="text-sm text-gray-400 pl-6">
                          +{tutorial.steps.length - 3} more steps
                        </p>
                      )}
                    </div>

                    <div className="mt-6 flex items-center text-sm font-medium text-orange-600 group-hover:text-orange-700">
                      {tutorial.type === 'video' ? 'Watch Tutorial' : 'Read Guide'}
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Tutorials */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">All Tutorials</h2>
            <p className="mt-4 text-lg text-gray-500">
              Browse our complete library of tutorials and guides.
            </p>
          </motion.div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                )}
              >
                <category.icon className="h-4 w-4" />
                {category.label}
              </button>
            ))}
          </div>

          {/* Tutorial Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {filteredTutorials.map((tutorial, index) => (
              <motion.div
                key={tutorial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
              >
                <Card className="h-full border-gray-200 hover:border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        className={cn(
                          'text-xs',
                          tutorial.type === 'video'
                            ? 'bg-pink-100 text-pink-700 hover:bg-pink-100'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                        )}
                      >
                        {tutorial.type === 'video' ? 'Video' : 'Guide'}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          tutorial.level === 'Beginner' && 'border-emerald-200 text-emerald-600',
                          tutorial.level === 'Intermediate' && 'border-amber-200 text-amber-600',
                          tutorial.level === 'Advanced' && 'border-violet-200 text-violet-600'
                        )}
                      >
                        {tutorial.level}
                      </Badge>
                      <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {tutorial.duration}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {tutorial.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{tutorial.description}</p>

                    <div className="mt-4 flex items-center text-sm font-medium text-orange-600 group-hover:text-orange-700">
                      {tutorial.type === 'video' ? (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Watch
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4 mr-1" />
                          Read
                        </>
                      )}
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredTutorials.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tutorials found</h3>
              <p className="text-gray-500">
                Try adjusting your search or category filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-0 bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 shadow-2xl">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to get started?
                </h2>
                <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                  Create your free Chatrist account and start automating your Instagram
                  DMs in minutes.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8 h-12"
                    >
                      Start Free Trial
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                  <Link href="/documentation">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-white border-white/30 hover:bg-white/10 rounded-full px-8 h-12"
                    >
                      View Documentation
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
