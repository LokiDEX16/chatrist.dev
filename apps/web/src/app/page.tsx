'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MessageSquare,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  Instagram,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  Mail,
  ShoppingBag,
  Globe,
  Smartphone,
  TrendingUp,
  Target,
  BookOpen,
  Video,
  FileText,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
// React hooks imported at top of file

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const getNavLinks = (username: string | null) => [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '#resources' },
];

const features = [
  {
    icon: Zap,
    title: 'Visual Flow Builder',
    description: 'Create complex automation flows with drag-and-drop simplicity. No coding required.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: MessageSquare,
    title: 'Multi-Trigger Support',
    description: 'Respond to comments, story replies, DM keywords, and new followers automatically.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Built-in rate limiting, queue management, and duplicate prevention to protect your account.',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track campaign performance, lead capture rates, and engagement metrics in real-time.',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
  },
];

const steps = [
  {
    number: '01',
    title: 'Connect Instagram',
    description: 'Link your Instagram Business or Creator account securely via OAuth in seconds.',
    icon: Instagram,
  },
  {
    number: '02',
    title: 'Build Your Flow',
    description: 'Use the visual editor to create personalized DM sequences with delays and conditions.',
    icon: Sparkles,
  },
  {
    number: '03',
    title: 'Launch & Track',
    description: 'Activate your campaign and watch leads flow in with real-time analytics.',
    icon: BarChart3,
  },
];

const integrations = [
  { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { name: 'Direct Messages', icon: MessageSquare, color: 'text-blue-600' },
  { name: 'Messenger', icon: MessageCircle, color: 'text-blue-500' },
  { name: 'WhatsApp', icon: Smartphone, color: 'text-green-500' },
  { name: 'Shopify', icon: ShoppingBag, color: 'text-green-600' },
  { name: 'Email', icon: Mail, color: 'text-amber-500' },
  { name: 'Web', icon: Globe, color: 'text-indigo-500' },
  { name: 'Analytics', icon: TrendingUp, color: 'text-violet-500' },
];

const stats = [
  { value: '3x', label: 'Faster response times', description: 'With automated DM flows' },
  { value: '24/7', label: 'Always-on engagement', description: 'Never miss a lead' },
  { value: '0', label: 'Code required', description: 'Visual drag-and-drop builder' },
  { value: '5 min', label: 'Setup time', description: 'Get started instantly' },
];

const resources = [
  {
    title: 'Getting Started Guide',
    description: 'Everything you need to set up your first automation.',
    icon: BookOpen,
    color: 'bg-blue-500/10 text-blue-600',
    tag: 'Guide',
  },
  {
    title: 'Video Tutorials',
    description: 'Watch step-by-step walkthroughs of every feature.',
    icon: Video,
    color: 'bg-pink-500/10 text-pink-600',
    tag: 'Video',
  },
  {
    title: 'Best Practices',
    description: 'Learn proven strategies for maximum engagement.',
    icon: Target,
    color: 'bg-amber-500/10 text-amber-600',
    tag: 'Strategy',
  },
  {
    title: 'Case Studies',
    description: 'See how top creators grow with Chatrist.',
    icon: FileText,
    color: 'bg-emerald-500/10 text-emerald-600',
    tag: 'Case Study',
  },
];

const earlyAdopterBenefits = [
  'Lock in early-bird pricing forever',
  'Direct access to founders',
  'Shape the product roadmap',
  'Priority support',
];

const whyChooseUs = [
  {
    title: 'Built by Creators, for Creators',
    description: 'We understand the pain of manually responding to hundreds of DMs. Chatrist was born from our own frustration.',
  },
  {
    title: 'Privacy-First Approach',
    description: 'Your data stays yours. We never sell or share your information with third parties.',
  },
];

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
      if (data.user) {
        // Get username from user metadata or generate fallback
        const userUsername = data.user.user_metadata?.username
          || data.user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30)
          || data.user.id.slice(0, 8);
        setUsername(userUsername);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Gradient Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-violet-600" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-pink-500">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">Chatrist</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {getNavLinks(username).map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {isLoggedIn && username ? (
                <Link href={`/${username}/dashboard`}>
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6">
                    My Account
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="hidden sm:inline-flex text-gray-700 font-medium">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </>
              )}
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pb-4 border-t border-gray-100 pt-4"
            >
              {getNavLinks(username).map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-orange-200/40 via-pink-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-100/30 to-transparent rounded-full blur-3xl" />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="container relative mx-auto px-4 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-32"
        >
          <motion.div variants={item} className="mx-auto max-w-5xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-200/60 px-5 py-2 text-sm">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span className="text-orange-700 font-medium">
                Now in Early Access — Join our founding members
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              Rewrite the rules of{' '}
              <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
                customer engagement
              </span>{' '}
              with AI
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg lg:text-xl text-gray-500 leading-relaxed">
              Build powerful DM automation flows with our visual editor. Respond to comments,
              story replies, and new followers automatically — while keeping your account safe.
            </p>

            <motion.div
              variants={item}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Link href="/register">
                <Button size="lg" className="h-13 px-8 text-base bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg shadow-gray-900/20">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 px-8 text-base rounded-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  See how it works
                </Button>
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={item}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500"
            >
              {['14-day free trial', 'No credit card required', 'Cancel anytime'].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {benefit}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Product Mockup */}
          <motion.div
            variants={item}
            className="mt-16 mx-auto max-w-5xl"
          >
            <div className="relative rounded-2xl bg-gradient-to-b from-gray-100 to-gray-50 border border-gray-200 p-2 shadow-2xl shadow-gray-200/50">
              <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 bg-white rounded-md text-xs text-gray-400 border border-gray-100">
                      app.chatrist.com/dashboard
                    </div>
                  </div>
                </div>
                <div className="aspect-[16/8] bg-gradient-to-br from-indigo-50 via-white to-orange-50 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="flex justify-center gap-3">
                      <div className="w-48 h-28 rounded-xl bg-white shadow-lg border border-gray-100 p-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 mb-2" />
                        <div className="h-2 bg-gray-200 rounded w-3/4 mb-1.5" />
                        <div className="h-2 bg-gray-100 rounded w-1/2" />
                        <div className="mt-3 h-6 bg-emerald-100 rounded text-emerald-600 text-xs flex items-center justify-center font-medium">+300%</div>
                      </div>
                      <div className="w-48 h-28 rounded-xl bg-white shadow-lg border border-gray-100 p-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-violet-500 mb-2" />
                        <div className="h-2 bg-gray-200 rounded w-2/3 mb-1.5" />
                        <div className="h-2 bg-gray-100 rounded w-1/2" />
                        <div className="mt-3 h-6 bg-blue-100 rounded text-blue-600 text-xs flex items-center justify-center font-medium">1,420 DMs</div>
                      </div>
                      <div className="hidden sm:block w-48 h-28 rounded-xl bg-white shadow-lg border border-gray-100 p-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 mb-2" />
                        <div className="h-2 bg-gray-200 rounded w-3/4 mb-1.5" />
                        <div className="h-2 bg-gray-100 rounded w-1/3" />
                        <div className="mt-3 h-6 bg-amber-100 rounded text-amber-600 text-xs flex items-center justify-center font-medium">248 Leads</div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-80 h-6 rounded-full bg-gradient-to-r from-orange-200 via-pink-200 to-violet-200 opacity-60" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Early Adopter Section */}
      <section className="py-12 border-y border-gray-100 bg-gradient-to-r from-orange-50 via-pink-50 to-violet-50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center"
          >
            <p className="text-sm font-medium text-orange-600 uppercase tracking-wider mb-4">
              Be an Early Adopter
            </p>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Join our founding community and help shape the future of Instagram automation
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {earlyAdopterBenefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section 1 - When technology moves fast */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          >
            <div>
              <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-4">
                Built for speed
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                When technology moves fast, marketers move faster
              </h2>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed">
                Chatrist gives you the tools to automate your Instagram engagement at scale.
                Set up once and let your campaigns run 24/7 — while you focus on creating content.
              </p>
              <div className="mt-8 space-y-4">
                {['Instant automated DM responses', 'Smart keyword detection', 'Real-time performance tracking'].map((point) => (
                  <div key={point} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100">
                      <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    </div>
                    <span className="text-gray-700 font-medium">{point}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Link href="/register">
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8 h-12">
                    Get started
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-pink-50 rounded-3xl -rotate-3" />
              <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
                    <Instagram className="h-8 w-8 text-pink-500" />
                    <div>
                      <p className="font-semibold text-gray-900">New Comment Detected</p>
                      <p className="text-sm text-gray-500">&quot;Love this product! Where can I buy?&quot;</p>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-px h-8 bg-gray-200" />
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <Zap className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-semibold text-gray-900">Flow Triggered</p>
                      <p className="text-sm text-gray-500">Sending personalized DM with purchase link...</p>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-px h-8 bg-gray-200" />
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    <div>
                      <p className="font-semibold text-gray-900">Lead Captured</p>
                      <p className="text-sm text-gray-500">Email collected and CRM updated automatically</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-gray-50/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-16"
          >
            <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-4">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Everything you need to scale DM outreach
            </h2>
            <p className="mt-6 text-lg text-gray-500">
              Powerful features designed to help you grow your Instagram presence effortlessly.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full bg-white border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 rounded-2xl">
                  <CardContent className="p-6 space-y-4">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-xl',
                        feature.bgColor
                      )}
                    >
                      <feature.icon className={cn('h-6 w-6', feature.color)} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                      <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-16"
          >
            <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-4">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Get started in minutes
            </h2>
            <p className="mt-6 text-lg text-gray-500">
              Three simple steps to automate your Instagram DMs.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[calc(50%+4rem)] w-[calc(100%-8rem)] h-px bg-gradient-to-r from-orange-200 to-pink-200" />
                )}

                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white border-2 border-gray-100 shadow-lg">
                      <step.icon className="h-10 w-10 text-gray-700" />
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-xs font-bold text-white shadow-md">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-gray-500 max-w-xs">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 lg:py-28 bg-gray-50/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-4">
              Integrations
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Add Chatrist to your dream stack
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Connect with the tools you already use to create seamless automated workflows.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <integration.icon className={cn('h-8 w-8', integration.color)} />
                  <span className="text-sm font-medium text-gray-700">{integration.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark CTA Banner */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-violet-500/10" />
        <div className="container relative mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              The only customer engagement platform you&apos;ll ever need
            </h2>
            <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
              From comment detection to lead capture, Chatrist handles your entire
              Instagram engagement pipeline automatically.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8 h-12 shadow-lg">
                  Start your free trial
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-white border-gray-600 hover:bg-gray-800 rounded-full px-8 h-12">
                  Learn more
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-pink-50" />
        <div className="container relative mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-4">
              Results
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Your brand has a message,{' '}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                how you deliver it matters.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm text-center">
                  <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-gray-900">{stat.label}</p>
                  <p className="mt-1 text-xs text-gray-400">{stat.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 lg:py-28 bg-gray-50/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-4">
              Why Chatrist
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Built different, on purpose
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="bg-white border-gray-100 rounded-2xl h-full">
                  <CardContent className="p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 mb-4">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-gray-500 mb-4">We&apos;re a small team with big ambitions. Have questions?</p>
            <Link href="/contact">
              <Button variant="outline" className="rounded-full">
                Talk to the founders
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-4">
              Resources
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Check out the resources
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Guides, tutorials, and best practices to help you succeed.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full bg-white border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 rounded-2xl cursor-pointer group">
                  <CardContent className="p-6">
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl mb-4', resource.color.split(' ')[0])}>
                      <resource.icon className={cn('h-6 w-6', resource.color.split(' ')[1])} />
                    </div>
                    <span className="text-xs font-medium text-orange-500 uppercase tracking-wider">{resource.tag}</span>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">{resource.title}</h3>
                    <p className="mt-2 text-sm text-gray-500">{resource.description}</p>
                    <div className="mt-4 flex items-center text-sm font-medium text-orange-500 group-hover:text-orange-600">
                      Read more
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              It&apos;s time to be a better marketer
            </h2>
            <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
              Be among the first to experience the future of Instagram engagement.
              Early adopters get exclusive benefits and lifetime discounts.
            </p>
            <div className="mt-10">
              <Link href="/register">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-10 h-13 text-base shadow-lg shadow-black/20">
                  Get Started for Free
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-pink-500">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Chatrist</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Be Absolutely Engaging.&trade;
              </p>
              <div className="flex gap-4 mt-6">
                <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href={username ? `/${username}/flows` : '/login?redirect=/flows'} className="hover:text-white transition-colors">Flow Builder</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/tutorials" className="hover:text-white transition-colors">Tutorials</Link></li>
                <li><Link href="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Chatrist. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
