'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  BookOpen,
  Code,
  Zap,
  Settings,
  Shield,
  MessageSquare,
  BarChart3,
  Users,
  Webhook,
  Key,
  Terminal,
  FileCode,
  ChevronRight,
  ExternalLink,
  ArrowRight,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const docCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Set up your account and create your first automation.',
    icon: Zap,
    color: 'bg-orange-100 text-orange-600',
    articles: [
      { title: 'Quick Start Guide', href: '#quick-start' },
      { title: 'Account Setup', href: '#account-setup' },
      { title: 'Connecting Instagram', href: '#connecting-instagram' },
      { title: 'Dashboard Overview', href: '#dashboard' },
    ],
  },
  {
    id: 'flow-builder',
    title: 'Flow Builder',
    description: 'Learn how to create powerful automation flows.',
    icon: MessageSquare,
    color: 'bg-blue-100 text-blue-600',
    articles: [
      { title: 'Flow Builder Basics', href: '#flow-basics' },
      { title: 'Message Nodes', href: '#message-nodes' },
      { title: 'Condition Nodes', href: '#condition-nodes' },
      { title: 'Delay & Timing', href: '#delay-timing' },
      { title: 'Variables & Personalization', href: '#variables' },
    ],
  },
  {
    id: 'triggers',
    title: 'Triggers & Actions',
    description: 'Configure triggers and automated actions.',
    icon: Settings,
    color: 'bg-violet-100 text-violet-600',
    articles: [
      { title: 'Comment Triggers', href: '#comment-triggers' },
      { title: 'Story Reply Triggers', href: '#story-triggers' },
      { title: 'DM Keyword Triggers', href: '#dm-triggers' },
      { title: 'New Follower Triggers', href: '#follower-triggers' },
      { title: 'Webhook Triggers', href: '#webhook-triggers' },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics & Reporting',
    description: 'Track performance and measure results.',
    icon: BarChart3,
    color: 'bg-emerald-100 text-emerald-600',
    articles: [
      { title: 'Analytics Dashboard', href: '#analytics-dashboard' },
      { title: 'Campaign Metrics', href: '#campaign-metrics' },
      { title: 'Conversion Tracking', href: '#conversion-tracking' },
      { title: 'Exporting Reports', href: '#exporting-reports' },
    ],
  },
  {
    id: 'leads',
    title: 'Lead Management',
    description: 'Capture, manage, and export leads.',
    icon: Users,
    color: 'bg-pink-100 text-pink-600',
    articles: [
      { title: 'Capturing Leads', href: '#capturing-leads' },
      { title: 'Lead Database', href: '#lead-database' },
      { title: 'Segmentation & Tags', href: '#segmentation' },
      { title: 'CRM Integrations', href: '#crm-integrations' },
    ],
  },
  {
    id: 'security',
    title: 'Security & Compliance',
    description: 'Best practices for account safety.',
    icon: Shield,
    color: 'bg-amber-100 text-amber-600',
    articles: [
      { title: 'Rate Limiting', href: '#rate-limiting' },
      { title: 'Account Safety', href: '#account-safety' },
      { title: 'Data Privacy', href: '#data-privacy' },
      { title: 'Instagram Compliance', href: '#instagram-compliance' },
    ],
  },
];

const apiEndpoints = [
  {
    method: 'GET',
    endpoint: '/api/v1/flows',
    description: 'List all automation flows',
  },
  {
    method: 'POST',
    endpoint: '/api/v1/flows',
    description: 'Create a new automation flow',
  },
  {
    method: 'GET',
    endpoint: '/api/v1/campaigns',
    description: 'List all campaigns',
  },
  {
    method: 'POST',
    endpoint: '/api/v1/messages/send',
    description: 'Send a direct message',
  },
  {
    method: 'GET',
    endpoint: '/api/v1/analytics/summary',
    description: 'Get analytics summary',
  },
  {
    method: 'GET',
    endpoint: '/api/v1/leads',
    description: 'List captured leads',
  },
  {
    method: 'POST',
    endpoint: '/api/v1/webhooks',
    description: 'Create a webhook endpoint',
  },
];

const codeExamples = {
  authentication: `// Authentication with API Key
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
};

// Making an authenticated request
const response = await fetch('https://api.chatrist.com/v1/flows', {
  method: 'GET',
  headers
});

const flows = await response.json();`,

  createFlow: `// Create a new automation flow
const newFlow = {
  name: 'Welcome Message Flow',
  trigger: {
    type: 'new_follower'
  },
  nodes: [
    {
      type: 'message',
      content: 'Hey {{first_name}}! Thanks for following!',
      delay: 0
    },
    {
      type: 'delay',
      duration: 86400 // 24 hours in seconds
    },
    {
      type: 'message',
      content: 'Just checking in - any questions?',
      delay: 0
    }
  ]
};

const response = await fetch('https://api.chatrist.com/v1/flows', {
  method: 'POST',
  headers,
  body: JSON.stringify(newFlow)
});`,

  webhook: `// Webhook payload example
{
  "event": "message.received",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "message_id": "msg_abc123",
    "from_user": {
      "id": "user_xyz789",
      "username": "johndoe",
      "full_name": "John Doe"
    },
    "content": "I'm interested in your product",
    "campaign_id": "camp_def456"
  }
}`,
};

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-violet-500/20" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="container relative mx-auto px-4 lg:px-8"
        >
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 bg-orange-500/20 text-orange-300 hover:bg-orange-500/20 border-orange-500/30">
              Documentation
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Chatrist{' '}
              <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
                Documentation
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 leading-relaxed">
              Everything you need to build powerful Instagram DM automations. Explore our
              guides, API reference, and tutorials.
            </p>

            {/* Search */}
            <div className="mt-10 max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 rounded-full border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {['Quick Start', 'API Reference', 'Flow Builder', 'Webhooks'].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase().replace(' ', '-')}`}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Documentation Categories */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">Browse Documentation</h2>
            <p className="mt-4 text-lg text-gray-500">
              Explore our comprehensive guides organized by topic.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {docCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-xl',
                          category.color
                        )}
                      >
                        <category.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.articles.map((article) => (
                        <li key={article.title}>
                          <a
                            href={article.href}
                            className="flex items-center text-sm text-gray-600 hover:text-orange-600 transition-colors group"
                          >
                            <ChevronRight className="h-4 w-4 mr-2 text-gray-400 group-hover:text-orange-600" />
                            {article.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* API Reference Section */}
      <section id="api" className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-12"
          >
            <Badge className="mb-4 bg-violet-100 text-violet-700 hover:bg-violet-100">
              API Reference
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900">REST API</h2>
            <p className="mt-4 text-lg text-gray-500">
              Build custom integrations with our powerful REST API.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="endpoints" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                <TabsTrigger value="authentication">Authentication</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>

              <TabsContent value="endpoints">
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="h-5 w-5" />
                      API Endpoints
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Base URL: <code className="bg-gray-100 px-2 py-1 rounded">https://api.chatrist.com/v1</code>
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {apiEndpoints.map((endpoint, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Badge
                            className={cn(
                              'font-mono text-xs px-2 py-0.5',
                              endpoint.method === 'GET'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-blue-100 text-blue-700'
                            )}
                          >
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono text-gray-700 flex-1">
                            {endpoint.endpoint}
                          </code>
                          <span className="text-sm text-gray-500">{endpoint.description}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 text-center">
                      <Button variant="outline" className="rounded-full">
                        View Full API Reference
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="authentication">
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">API Keys</h4>
                        <p className="text-sm text-gray-500 mb-4">
                          Authenticate your requests using API keys. You can generate API keys
                          from your dashboard under Settings &gt; API Keys.
                        </p>
                      </div>

                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
                          <code>{codeExamples.authentication}</code>
                        </pre>
                        <button
                          onClick={() => copyCode(codeExamples.authentication, 'auth')}
                          className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          {copiedCode === 'auth' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <h4 className="font-semibold text-amber-800 mb-1">Security Note</h4>
                        <p className="text-sm text-amber-700">
                          Never expose your API keys in client-side code. Always make API
                          calls from your server.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="examples">
                <div className="space-y-6">
                  <Card className="border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileCode className="h-5 w-5" />
                        Create an Automation Flow
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
                          <code>{codeExamples.createFlow}</code>
                        </pre>
                        <button
                          onClick={() => copyCode(codeExamples.createFlow, 'flow')}
                          className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          {copiedCode === 'flow' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Webhook className="h-5 w-5" />
                        Webhook Payload Example
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
                          <code>{codeExamples.webhook}</code>
                        </pre>
                        <button
                          onClick={() => copyCode(codeExamples.webhook, 'webhook')}
                          className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          {copiedCode === 'webhook' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* SDKs Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">Official SDKs</h2>
            <p className="mt-4 text-lg text-gray-500">
              Use our official SDKs for faster integration.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { name: 'JavaScript / Node.js', package: 'npm install @chatrist/sdk', icon: '🟨' },
              { name: 'Python', package: 'pip install chatrist', icon: '🐍' },
              { name: 'PHP', package: 'composer require chatrist/sdk', icon: '🐘' },
            ].map((sdk, index) => (
              <motion.div
                key={sdk.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="border-gray-200 hover:shadow-md transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{sdk.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{sdk.name}</h3>
                    <code className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600">
                      {sdk.package}
                    </code>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Card className="h-full border-gray-200">
                <CardContent className="p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 mb-6">
                    <BookOpen className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Need help getting started?
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Check out our tutorials for step-by-step guidance on setting up your
                    first automation.
                  </p>
                  <Link href="/tutorials">
                    <Button className="rounded-full">
                      Browse Tutorials
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Card className="h-full border-gray-200">
                <CardContent className="p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 mb-6">
                    <Code className="h-6 w-6 text-violet-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Questions about the API?
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Join our developer community to get help from other developers and our
                    team.
                  </p>
                  <Link href="/community">
                    <Button variant="outline" className="rounded-full">
                      Join Community
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
