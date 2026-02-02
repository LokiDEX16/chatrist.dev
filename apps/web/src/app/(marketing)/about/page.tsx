'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Target,
  Heart,
  Lightbulb,
  Users,
  Rocket,
  Globe,
  Award,
  MessageSquare,
  Linkedin,
  Twitter,
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const values = [
  {
    icon: Target,
    title: 'Customer Obsession',
    description:
      'Every feature we build starts with a real customer problem. We listen, iterate, and deliver solutions that make a measurable impact on your growth.',
  },
  {
    icon: Heart,
    title: 'Transparency',
    description:
      'No hidden fees, no surprise charges, no dark patterns. We believe in honest pricing, clear communication, and building trust through every interaction.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'Social media moves fast, and so do we. We are constantly pushing the boundaries of what is possible with DM automation while keeping your account safe.',
  },
  {
    icon: Users,
    title: 'Community',
    description:
      'We are building more than a product. We are building a community of creators helping creators. Your success stories inspire our roadmap.',
  },
];

const milestones = [
  {
    year: '2022',
    title: 'The Beginning',
    description:
      'Founded in San Francisco by two Instagram creators frustrated with manual DM management. First prototype built in a garage.',
  },
  {
    year: '2023',
    title: 'Product-Market Fit',
    description:
      'Launched public beta and reached 1,000 users in 3 months. Secured seed funding from top-tier investors who believed in our vision.',
  },
  {
    year: '2024',
    title: 'Rapid Growth',
    description:
      'Scaled to 10,000+ active users. Launched visual flow builder, advanced analytics, and enterprise features. Expanded team to 25 people.',
  },
  {
    year: '2025',
    title: 'Global Expansion',
    description:
      'Now serving creators and businesses in 50+ countries. Launched multi-language support and opened offices in London and Singapore.',
  },
];

const team = [
  {
    name: 'Sarah Chen',
    role: 'Co-Founder & CEO',
    bio: 'Former growth lead at Instagram. Built communities of 500K+ followers before starting Chatrist.',
    image: null,
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Co-Founder & CTO',
    bio: 'Ex-Meta engineer with 10 years experience building scalable systems. Passionate about creator economy.',
    image: null,
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Emma Thompson',
    role: 'VP of Product',
    bio: 'Product leader from Shopify. Expert in building tools that empower small businesses to compete.',
    image: null,
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'David Kim',
    role: 'VP of Engineering',
    bio: 'Led engineering teams at Twilio and Stripe. Focused on building reliable, developer-friendly APIs.',
    image: null,
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Priya Patel',
    role: 'Head of Customer Success',
    bio: 'Built support teams at HubSpot. Obsessed with turning customers into advocates through exceptional service.',
    image: null,
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'James Wilson',
    role: 'Head of Marketing',
    bio: 'Growth marketing veteran. Helped 3 startups achieve hypergrowth. Creator of the "DM-first" marketing framework.',
    image: null,
    linkedin: '#',
    twitter: '#',
  },
];

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '10M+', label: 'DMs Automated' },
  { value: '50+', label: 'Countries Served' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const investors = [
  'Sequoia Capital',
  'Andreessen Horowitz',
  'Y Combinator',
  'Index Ventures',
];

export default function AboutPage() {
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
              Our Story
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              Building the future of{' '}
              <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
                creator engagement
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 leading-relaxed">
              We started Chatrist because we believe every creator deserves the tools to
              build meaningful connections with their audience at scale.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                Our Mission
              </h2>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed">
                Instagram creators spend an average of 4 hours per day managing DMs
                manually. That is time taken away from what they do best: creating content
                and building their brands.
              </p>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                Our mission is to give that time back. We are building intelligent
                automation tools that help creators and businesses engage with their
                audiences authentically, at scale, without sacrificing the personal touch
                that makes Instagram special.
              </p>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                We believe that automation should enhance human connection, not replace
                it. Every feature we build is designed to help you have more meaningful
                conversations with the people who matter most to your business.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-pink-50 rounded-3xl -rotate-3" />
              <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500">
                    <MessageSquare className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">Chatrist</p>
                    <p className="text-gray-500">Be Absolutely Engaging</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Rocket className="h-5 w-5 text-orange-500" />
                    <span className="text-gray-700">Empowering 50,000+ creators</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-orange-500" />
                    <span className="text-gray-700">Active in 50+ countries</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-orange-500" />
                    <span className="text-gray-700">Industry-leading uptime</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <p className="text-4xl lg:text-5xl font-bold text-white">{stat.value}</p>
                <p className="mt-2 text-white/80">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Our Values</h2>
            <p className="mt-4 text-lg text-gray-500">
              The principles that guide everything we do.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 mb-6">
                      <value.icon className="h-7 w-7 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Our Journey</h2>
            <p className="mt-4 text-lg text-gray-500">
              From a garage startup to a global platform.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative pl-8 pb-12 last:pb-0"
              >
                {/* Timeline line */}
                {index < milestones.length - 1 && (
                  <div className="absolute left-[11px] top-8 bottom-0 w-px bg-gradient-to-b from-orange-400 to-pink-400" />
                )}
                {/* Timeline dot */}
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm ml-4">
                  <Badge className="mb-3 bg-orange-100 text-orange-700 hover:bg-orange-100">
                    {milestone.year}
                  </Badge>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-500">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Meet Our Team
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              The people behind Chatrist who are passionate about helping creators succeed.
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full border-gray-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-orange-600 font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">{member.bio}</p>
                    <div className="flex justify-center gap-3">
                      <a
                        href={member.linkedin}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                      <a
                        href={member.twitter}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investors Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center"
          >
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">
              Backed by world-class investors
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
              {investors.map((investor) => (
                <span
                  key={investor}
                  className="text-xl font-bold text-gray-300 hover:text-gray-400 transition-colors"
                >
                  {investor}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-20 lg:py-28">
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
                  Join Our Team
                </h2>
                <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                  We are always looking for talented people who are passionate about
                  empowering creators. Check out our open positions and help us build the
                  future of social engagement.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/contact">
                    <Button
                      size="lg"
                      className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8 h-12"
                    >
                      View Open Positions
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-white border-white/30 hover:bg-white/10 rounded-full px-8 h-12"
                    >
                      Contact Us
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
