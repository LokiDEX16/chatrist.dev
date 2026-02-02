'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Calendar,
  Clock,
  User,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Instagram,
  MessageSquare,
  Target,
  Sparkles,
  Users,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const categories = [
  { id: 'all', label: 'All Posts' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'tutorials', label: 'Tutorials' },
  { id: 'case-studies', label: 'Case Studies' },
  { id: 'product', label: 'Product Updates' },
  { id: 'industry', label: 'Industry News' },
];

const blogPosts = [
  {
    id: 1,
    title: '10 Instagram DM Automation Strategies That Actually Work in 2025',
    excerpt:
      'Discover proven DM automation strategies that top creators and businesses are using to grow their engagement without getting flagged by Instagram.',
    category: 'strategy',
    author: 'Sarah Chen',
    authorRole: 'CEO',
    date: 'Jan 12, 2025',
    readTime: '8 min read',
    featured: true,
    image: null,
    tags: ['Instagram', 'Automation', 'Strategy'],
  },
  {
    id: 2,
    title: 'How CreatorPro Increased Sales by 340% with Comment-to-DM Flows',
    excerpt:
      'Learn how this fitness influencer used Chatrist to turn Instagram comments into paying customers with a simple automation setup.',
    category: 'case-studies',
    author: 'Marcus Rodriguez',
    authorRole: 'CTO',
    date: 'Jan 10, 2025',
    readTime: '6 min read',
    featured: true,
    image: null,
    tags: ['Case Study', 'E-commerce', 'Success Story'],
  },
  {
    id: 3,
    title: 'The Complete Guide to Instagram Lead Generation in 2025',
    excerpt:
      'Everything you need to know about capturing leads through Instagram DMs, from setup to scaling your outreach.',
    category: 'tutorials',
    author: 'Emma Thompson',
    authorRole: 'VP of Product',
    date: 'Jan 8, 2025',
    readTime: '12 min read',
    featured: true,
    image: null,
    tags: ['Lead Generation', 'Guide', 'Instagram'],
  },
  {
    id: 4,
    title: 'New Feature: Advanced A/B Testing for DM Campaigns',
    excerpt:
      'Introducing our new A/B testing capabilities that help you optimize your message copy and improve conversion rates.',
    category: 'product',
    author: 'David Kim',
    authorRole: 'VP of Engineering',
    date: 'Jan 5, 2025',
    readTime: '4 min read',
    featured: false,
    image: null,
    tags: ['Product Update', 'A/B Testing', 'Features'],
  },
  {
    id: 5,
    title: 'Instagram Algorithm Changes 2025: What Marketers Need to Know',
    excerpt:
      'Breaking down the latest Instagram algorithm updates and how they affect your DM automation strategy.',
    category: 'industry',
    author: 'James Wilson',
    authorRole: 'Head of Marketing',
    date: 'Jan 3, 2025',
    readTime: '7 min read',
    featured: false,
    image: null,
    tags: ['Instagram', 'Algorithm', 'Industry News'],
  },
  {
    id: 6,
    title: 'Building High-Converting Welcome Sequences for New Followers',
    excerpt:
      'Step-by-step tutorial on creating automated welcome flows that turn new followers into engaged community members.',
    category: 'tutorials',
    author: 'Priya Patel',
    authorRole: 'Head of Customer Success',
    date: 'Dec 28, 2024',
    readTime: '9 min read',
    featured: false,
    image: null,
    tags: ['Tutorial', 'Welcome Flows', 'Engagement'],
  },
  {
    id: 7,
    title: 'How Beauty Brand GlowUp Scaled to 100K DMs per Month',
    excerpt:
      'Inside look at how this beauty brand automated their customer support and sales through Instagram DMs.',
    category: 'case-studies',
    author: 'Sarah Chen',
    authorRole: 'CEO',
    date: 'Dec 22, 2024',
    readTime: '10 min read',
    featured: false,
    image: null,
    tags: ['Case Study', 'Beauty', 'Scaling'],
  },
  {
    id: 8,
    title: '5 Common DM Automation Mistakes (And How to Avoid Them)',
    excerpt:
      'Learn from others failures. These are the most common mistakes we see brands make with Instagram DM automation.',
    category: 'strategy',
    author: 'James Wilson',
    authorRole: 'Head of Marketing',
    date: 'Dec 18, 2024',
    readTime: '6 min read',
    featured: false,
    image: null,
    tags: ['Strategy', 'Best Practices', 'Tips'],
  },
  {
    id: 9,
    title: 'Chatrist Year in Review: 2024 Highlights and 2025 Roadmap',
    excerpt:
      'Reflecting on our biggest milestones in 2024 and sharing our exciting plans for the year ahead.',
    category: 'product',
    author: 'Sarah Chen',
    authorRole: 'CEO',
    date: 'Dec 15, 2024',
    readTime: '5 min read',
    featured: false,
    image: null,
    tags: ['Company News', 'Year in Review', 'Roadmap'],
  },
];

const popularPosts = blogPosts.slice(0, 4);

const newsletterTopics = [
  'Instagram marketing tips',
  'DM automation strategies',
  'Case studies & success stories',
  'Product updates & new features',
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter((post) => post.featured);

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
              Blog
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              Insights for{' '}
              <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
                Instagram Growth
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 leading-relaxed">
              Expert strategies, tutorials, and success stories to help you master
              Instagram DM automation and grow your business.
            </p>

            {/* Search */}
            <div className="mt-10 max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 rounded-full border-gray-200 bg-white shadow-sm"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Featured Posts */}
      <section className="pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900">Featured Articles</h2>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {featuredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={cn(index === 0 && 'lg:col-span-2 lg:row-span-2')}
              >
                <Card
                  className={cn(
                    'h-full border-gray-200 hover:border-orange-200 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden',
                    index === 0 ? 'bg-gradient-to-br from-orange-50 to-pink-50' : ''
                  )}
                >
                  <CardContent className={cn('p-6', index === 0 && 'p-8')}>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge
                        variant="outline"
                        className="text-xs border-orange-200 text-orange-600"
                      >
                        {categories.find((c) => c.id === post.category)?.label}
                      </Badge>
                      <span className="text-xs text-gray-400">{post.date}</span>
                    </div>

                    <h3
                      className={cn(
                        'font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors',
                        index === 0 ? 'text-2xl lg:text-3xl' : 'text-lg'
                      )}
                    >
                      {post.title}
                    </h3>

                    <p
                      className={cn(
                        'text-gray-500 mb-6',
                        index === 0 ? 'text-base lg:text-lg' : 'text-sm line-clamp-2'
                      )}
                    >
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                          {post.author
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{post.author}</p>
                          <p className="text-xs text-gray-400">{post.readTime}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="mb-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">All Articles</h2>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                          'px-4 py-2 rounded-full text-sm font-medium transition-all',
                          selectedCategory === category.id
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        )}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Post Grid */}
                <div className="space-y-6">
                  {filteredPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                    >
                      <Card className="border-gray-200 hover:border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer group">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-start gap-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <Badge
                                  variant="outline"
                                  className="text-xs border-orange-200 text-orange-600"
                                >
                                  {categories.find((c) => c.id === post.category)?.label}
                                </Badge>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {post.date}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {post.readTime}
                                </span>
                              </div>

                              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                                {post.title}
                              </h3>
                              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                {post.excerpt}
                              </p>

                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                                    {post.author
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')}
                                  </div>
                                  <span className="text-sm text-gray-600">{post.author}</span>
                                </div>
                                <div className="flex gap-2">
                                  {post.tags.slice(0, 2).map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <ChevronRight className="hidden md:block h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all mt-2" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {filteredPosts.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No articles found
                    </h3>
                    <p className="text-gray-500">
                      Try adjusting your search or category filter.
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-8">
                {/* Newsletter */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                >
                  <Card className="border-gray-200 bg-gradient-to-br from-orange-50 to-pink-50">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Subscribe to our newsletter
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Get the latest Instagram marketing insights delivered to your inbox.
                      </p>
                      <div className="space-y-3">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="rounded-xl bg-white"
                        />
                        <Button className="w-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                          Subscribe
                        </Button>
                      </div>
                      <ul className="mt-4 space-y-2">
                        {newsletterTopics.map((topic) => (
                          <li
                            key={topic}
                            className="text-xs text-gray-500 flex items-center gap-2"
                          >
                            <div className="h-1 w-1 bg-orange-400 rounded-full" />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Popular Posts */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                >
                  <Card className="border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        Popular Articles
                      </h3>
                      <div className="space-y-4">
                        {popularPosts.map((post, index) => (
                          <div
                            key={post.id}
                            className="flex gap-3 cursor-pointer group"
                          >
                            <span className="text-2xl font-bold text-gray-200 group-hover:text-orange-200 transition-colors">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                                {post.title}
                              </h4>
                              <p className="text-xs text-gray-400 mt-1">{post.readTime}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Topics */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                >
                  <Card className="border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Browse by Topic</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Instagram',
                          'Automation',
                          'Lead Generation',
                          'DM Marketing',
                          'E-commerce',
                          'Engagement',
                          'Strategy',
                          'Case Studies',
                        ].map((topic) => (
                          <Badge
                            key={topic}
                            variant="outline"
                            className="cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-colors"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
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
                  Ready to put these strategies into action?
                </h2>
                <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                  Start automating your Instagram DMs today and see the results for
                  yourself.
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
                  <Link href="/tutorials">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-white border-white/30 hover:bg-white/10 rounded-full px-8 h-12"
                    >
                      View Tutorials
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
