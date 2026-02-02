'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  MessageSquare,
  Users,
  Sparkles,
  Heart,
  Star,
  Trophy,
  BookOpen,
  Video,
  Calendar,
  ExternalLink,
  ChevronRight,
  Zap,
  Gift,
  Award,
  Globe,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const communityPlatforms = [
  {
    name: 'Discord',
    description: 'Join our Discord server for real-time discussions, support, and networking with fellow Chatrist users.',
    members: '12,500+',
    icon: MessageSquare,
    color: 'bg-indigo-100 text-indigo-600',
    buttonColor: 'bg-indigo-600 hover:bg-indigo-700',
    link: '#',
    features: [
      'Live chat with the community',
      'Direct access to the Chatrist team',
      'Exclusive beta features',
      'Weekly office hours',
    ],
  },
  {
    name: 'Facebook Group',
    description: 'Connect with Instagram marketers and automation experts in our private Facebook community.',
    members: '8,200+',
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    link: '#',
    features: [
      'Strategy discussions',
      'Success story sharing',
      'Weekly challenges',
      'Expert AMAs',
    ],
  },
  {
    name: 'Community Forum',
    description: 'Browse and contribute to our knowledge base with tutorials, guides, and Q&A discussions.',
    members: '15,000+',
    icon: BookOpen,
    color: 'bg-emerald-100 text-emerald-600',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    link: '#',
    features: [
      'Searchable archives',
      'Expert answers',
      'Feature requests',
      'Community guides',
    ],
  },
];

const upcomingEvents = [
  {
    title: 'Instagram DM Automation Masterclass',
    date: 'Jan 25, 2025',
    time: '2:00 PM EST',
    type: 'Webinar',
    speaker: 'Sarah Chen',
    description: 'Learn advanced automation strategies from our CEO.',
  },
  {
    title: 'Community Office Hours',
    date: 'Jan 28, 2025',
    time: '11:00 AM EST',
    type: 'Live Q&A',
    speaker: 'Product Team',
    description: 'Get your questions answered by our product team.',
  },
  {
    title: 'Case Study: How to 10x Your DM Engagement',
    date: 'Feb 1, 2025',
    time: '3:00 PM EST',
    type: 'Webinar',
    speaker: 'James Wilson',
    description: 'Real strategies from real success stories.',
  },
  {
    title: 'New Feature Preview: AI Message Generation',
    date: 'Feb 5, 2025',
    time: '1:00 PM EST',
    type: 'Product Demo',
    speaker: 'David Kim',
    description: 'First look at our upcoming AI features.',
  },
];

const communityStats = [
  { value: '50K+', label: 'Community Members', icon: Users },
  { value: '100+', label: 'Countries', icon: Globe },
  { value: '500+', label: 'Success Stories', icon: Trophy },
  { value: '24/7', label: 'Active Discussions', icon: MessageSquare },
];

const ambassadorPerks = [
  {
    title: 'Exclusive Access',
    description: 'Get early access to new features and beta programs.',
    icon: Zap,
  },
  {
    title: 'Free Premium Plan',
    description: 'Enjoy a complimentary Business plan subscription.',
    icon: Gift,
  },
  {
    title: 'Recognition',
    description: 'Featured spotlight and special community badge.',
    icon: Award,
  },
  {
    title: 'Direct Line',
    description: 'Private channel with the Chatrist leadership team.',
    icon: MessageSquare,
  },
];

const featuredMembers = [
  {
    name: 'Alex Rivera',
    role: 'E-commerce Coach',
    achievement: 'Helped 200+ businesses automate their DMs',
    quote: 'The Chatrist community has been instrumental in scaling my coaching business.',
  },
  {
    name: 'Maya Johnson',
    role: 'Fitness Influencer',
    achievement: 'Generated 50K leads through DM automation',
    quote: 'I learned more from this community in a month than years of trial and error.',
  },
  {
    name: 'Daniel Park',
    role: 'Agency Owner',
    achievement: 'Manages 30+ client accounts on Chatrist',
    quote: 'The support and resources here are unmatched. Truly a game-changer.',
  },
];

const resources = [
  {
    title: 'Community Templates',
    description: 'Download free automation flow templates created by community members.',
    icon: Sparkles,
    count: '50+ templates',
  },
  {
    title: 'Video Library',
    description: 'Watch recorded webinars, tutorials, and success story interviews.',
    icon: Video,
    count: '100+ videos',
  },
  {
    title: 'Playbooks',
    description: 'Step-by-step guides for different industries and use cases.',
    icon: BookOpen,
    count: '25+ playbooks',
  },
];

export default function CommunityPage() {
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
              Join 50,000+ Members
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              Welcome to the{' '}
              <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
                Chatrist Community
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 leading-relaxed">
              Connect with Instagram marketers, automation experts, and fellow creators.
              Learn, share, and grow together.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 px-8 h-12"
              >
                Join Discord
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-12"
              >
                Browse Forum
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {communityStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="h-5 w-5 text-orange-500" />
                  <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Platforms */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">Join the Conversation</h2>
            <p className="mt-4 text-lg text-gray-500">
              Choose your preferred platform to connect with the community.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
            {communityPlatforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full border-gray-200 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={cn(
                          'flex h-14 w-14 items-center justify-center rounded-2xl',
                          platform.color
                        )}
                      >
                        <platform.icon className="h-7 w-7" />
                      </div>
                      <Badge variant="outline" className="text-gray-500">
                        {platform.members} members
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{platform.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-2">{platform.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {platform.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <a href={platform.link} target="_blank" rel="noopener noreferrer">
                      <Button className={cn('w-full rounded-full', platform.buttonColor)}>
                        Join {platform.name}
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-12"
          >
            <Badge className="mb-4 bg-violet-100 text-violet-700 hover:bg-violet-100">
              <Calendar className="h-3 w-3 mr-1" />
              Events
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
            <p className="mt-4 text-lg text-gray-500">
              Join live webinars, Q&A sessions, and exclusive member events.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-4">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="border-gray-200 hover:border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="md:w-32 shrink-0">
                        <p className="text-sm font-semibold text-orange-600">{event.date}</p>
                        <p className="text-xs text-gray-500">{event.time}</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {event.type}
                          </Badge>
                          <span className="text-xs text-gray-400">with {event.speaker}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                      </div>
                      <Button variant="outline" className="rounded-full md:w-auto w-full shrink-0">
                        Register
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" className="rounded-full">
              View All Events
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Members */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-12"
          >
            <Badge className="mb-4 bg-pink-100 text-pink-700 hover:bg-pink-100">
              <Heart className="h-3 w-3 mr-1" />
              Community Spotlight
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900">Featured Members</h2>
            <p className="mt-4 text-lg text-gray-500">
              Meet some of the amazing people in our community.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {featuredMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full border-gray-200 text-center">
                  <CardContent className="p-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-orange-600 mb-3">{member.role}</p>
                    <Badge variant="outline" className="mb-4 text-xs">
                      <Trophy className="h-3 w-3 mr-1" />
                      {member.achievement}
                    </Badge>
                    <p className="text-sm text-gray-500 italic">&quot;{member.quote}&quot;</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Resources */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">Community Resources</h2>
            <p className="mt-4 text-lg text-gray-500">
              Free resources created by and for our community members.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 mb-4">
                      <resource.icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{resource.description}</p>
                    <p className="text-xs font-medium text-orange-600">{resource.count}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ambassador Program */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Card className="border-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
                <CardContent className="p-12">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <Badge className="mb-4 bg-orange-500/20 text-orange-300 border-orange-500/30">
                        <Award className="h-3 w-3 mr-1" />
                        Ambassador Program
                      </Badge>
                      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Become a Chatrist Ambassador
                      </h2>
                      <p className="text-gray-400 mb-8">
                        Are you passionate about helping others succeed with Instagram
                        automation? Join our ambassador program and get exclusive perks.
                      </p>
                      <Button className="rounded-full bg-white text-gray-900 hover:bg-gray-100">
                        Apply Now
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {ambassadorPerks.map((perk, index) => (
                        <div
                          key={perk.title}
                          className="bg-white/5 rounded-xl p-4 border border-white/10"
                        >
                          <perk.icon className="h-6 w-6 text-orange-400 mb-3" />
                          <h3 className="text-white font-semibold text-sm mb-1">
                            {perk.title}
                          </h3>
                          <p className="text-gray-400 text-xs">{perk.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ready to join the community?
            </h2>
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              Start connecting with fellow Instagram marketers and automation experts
              today. It is completely free to join!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 px-8 h-12"
              >
                Join Discord
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-12"
              >
                Join Facebook Group
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
