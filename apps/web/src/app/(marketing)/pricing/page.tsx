'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  X,
  Zap,
  Users,
  Building2,
  ArrowRight,
  HelpCircle,
  MessageSquare,
  BarChart3,
  Shield,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started with Instagram DM automation.',
    icon: Zap,
    price: { monthly: 0, yearly: 0 },
    popular: false,
    features: [
      { name: '1 Instagram account', included: true },
      { name: '100 automated DMs/month', included: true },
      { name: '3 automation flows', included: true },
      { name: 'Basic triggers (comments, DM keywords)', included: true },
      { name: 'Basic analytics', included: true },
      { name: 'Email support', included: true },
      { name: 'Lead capture', included: false },
      { name: 'Advanced flow conditions', included: false },
      { name: 'Team collaboration', included: false },
      { name: 'API access', included: false },
      { name: 'White-label', included: false },
    ],
    cta: 'Start Free',
    ctaVariant: 'outline' as const,
  },
  {
    name: 'Pro',
    description: 'For creators and small businesses ready to scale.',
    icon: Users,
    price: { monthly: 29, yearly: 290 },
    popular: true,
    features: [
      { name: '3 Instagram accounts', included: true },
      { name: 'Unlimited automated DMs', included: true },
      { name: 'Unlimited automation flows', included: true },
      { name: 'All triggers (comments, stories, follows, DMs)', included: true },
      { name: 'Advanced analytics & reports', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Lead capture & export', included: true },
      { name: 'Advanced flow conditions', included: true },
      { name: 'A/B testing', included: true },
      { name: 'API access', included: false },
      { name: 'White-label', included: false },
    ],
    cta: 'Start Pro Trial',
    ctaVariant: 'default' as const,
  },
  {
    name: 'Business',
    description: 'For agencies and enterprises with advanced needs.',
    icon: Building2,
    price: { monthly: 99, yearly: 990 },
    popular: false,
    features: [
      { name: 'Unlimited Instagram accounts', included: true },
      { name: 'Unlimited automated DMs', included: true },
      { name: 'Unlimited automation flows', included: true },
      { name: 'All triggers + custom webhooks', included: true },
      { name: 'Custom analytics & dashboards', included: true },
      { name: 'Dedicated support + onboarding', included: true },
      { name: 'Advanced lead scoring & CRM sync', included: true },
      { name: 'Advanced flow conditions', included: true },
      { name: 'A/B testing with AI optimization', included: true },
      { name: 'Full API access', included: true },
      { name: 'White-label solution', included: true },
    ],
    cta: 'Contact Sales',
    ctaVariant: 'outline' as const,
  },
];

const faqs = [
  {
    question: 'What happens when I reach my DM limit on the Free plan?',
    answer:
      'When you reach your monthly DM limit, your automation flows will pause until the next billing cycle. You can upgrade to Pro or Business at any time for unlimited DMs.',
  },
  {
    question: 'Can I change plans at any time?',
    answer:
      'Yes! You can upgrade, downgrade, or cancel your plan at any time. When you upgrade, you will be charged a prorated amount for the remainder of your billing cycle. When you downgrade, the new rate will apply at your next billing date.',
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer:
      'Yes, both Pro and Business plans come with a 14-day free trial. No credit card required to start. You can explore all features before committing to a subscription.',
  },
  {
    question: 'Do you offer discounts for nonprofits or educational institutions?',
    answer:
      'Yes, we offer special pricing for nonprofits and educational institutions. Please contact our sales team at sales@chatrist.com with proof of your organization status.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and wire transfers for annual Business plans. All payments are processed securely through Stripe.',
  },
  {
    question: 'Can I get a refund if I am not satisfied?',
    answer:
      'We offer a 30-day money-back guarantee for all paid plans. If you are not satisfied with Chatrist for any reason, contact our support team within 30 days of your purchase for a full refund.',
  },
];

const comparisonFeatures = [
  { name: 'Instagram Accounts', free: '1', pro: '3', business: 'Unlimited' },
  { name: 'Automated DMs/month', free: '100', pro: 'Unlimited', business: 'Unlimited' },
  { name: 'Automation Flows', free: '3', pro: 'Unlimited', business: 'Unlimited' },
  { name: 'Comment Triggers', free: true, pro: true, business: true },
  { name: 'Story Reply Triggers', free: false, pro: true, business: true },
  { name: 'New Follower Triggers', free: false, pro: true, business: true },
  { name: 'Lead Capture', free: false, pro: true, business: true },
  { name: 'A/B Testing', free: false, pro: true, business: true },
  { name: 'Advanced Analytics', free: false, pro: true, business: true },
  { name: 'Team Members', free: '1', pro: '5', business: 'Unlimited' },
  { name: 'API Access', free: false, pro: false, business: true },
  { name: 'White-label', free: false, pro: false, business: true },
  { name: 'Dedicated Support', free: false, pro: false, business: true },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

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
              Simple, Transparent Pricing
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              Choose the plan that{' '}
              <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
                fits your growth
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 leading-relaxed">
              Start free and scale as you grow. All plans include our visual flow builder,
              core automation features, and dedicated support.
            </p>

            {/* Billing Toggle */}
            <div className="mt-10 inline-flex items-center gap-4 p-1.5 bg-gray-100 rounded-full">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={cn(
                  'px-6 py-2 text-sm font-medium rounded-full transition-all',
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={cn(
                  'px-6 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-2',
                  billingPeriod === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Yearly
                <span className="text-xs text-emerald-600 font-semibold">Save 17%</span>
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 lg:pb-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card
                  className={cn(
                    'h-full flex flex-col',
                    plan.popular
                      ? 'border-2 border-orange-200 shadow-xl shadow-orange-100/50'
                      : 'border-gray-200'
                  )}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-xl',
                          plan.popular
                            ? 'bg-gradient-to-br from-orange-400 to-pink-500'
                            : 'bg-gray-100'
                        )}
                      >
                        <plan.icon
                          className={cn(
                            'h-6 w-6',
                            plan.popular ? 'text-white' : 'text-gray-600'
                          )}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-gray-500">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">
                          ${billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly}
                        </span>
                        <span className="text-gray-500">
                          /{billingPeriod === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                      {billingPeriod === 'yearly' && plan.price.yearly > 0 && (
                        <p className="mt-1 text-sm text-emerald-600">
                          Save ${plan.price.monthly * 12 - plan.price.yearly}/year
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature.name} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 shrink-0 mt-0.5" />
                          )}
                          <span
                            className={cn(
                              'text-sm',
                              feature.included ? 'text-gray-700' : 'text-gray-400'
                            )}
                          >
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8">
                      <Link href="/register">
                        <Button
                          className={cn(
                            'w-full rounded-full',
                            plan.popular
                              ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white'
                              : ''
                          )}
                          variant={plan.ctaVariant}
                        >
                          {plan.cta}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Compare all features
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              A detailed breakdown of what is included in each plan.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                    Features
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">
                    Free
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900 bg-orange-50 rounded-t-xl">
                    Pro
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">
                    Business
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr
                    key={feature.name}
                    className={cn(
                      'border-b border-gray-100',
                      index === comparisonFeatures.length - 1 && 'border-b-0'
                    )}
                  >
                    <td className="py-4 px-6 text-sm text-gray-700">{feature.name}</td>
                    <td className="py-4 px-6 text-center">
                      {typeof feature.free === 'boolean' ? (
                        feature.free ? (
                          <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-gray-700">{feature.free}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center bg-orange-50">
                      {typeof feature.pro === 'boolean' ? (
                        feature.pro ? (
                          <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {feature.pro}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof feature.business === 'boolean' ? (
                        feature.business ? (
                          <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-gray-700">{feature.business}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why Choose Chatrist */}
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
              Why choose Chatrist?
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Built specifically for Instagram creators and businesses who want to grow.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {[
              {
                icon: MessageSquare,
                title: 'Purpose-Built',
                description:
                  'Designed specifically for Instagram DM automation, not a generic chatbot platform.',
              },
              {
                icon: Shield,
                title: 'Account Safety',
                description:
                  'Built-in rate limiting and queue management to protect your Instagram account.',
              },
              {
                icon: BarChart3,
                title: 'Real Analytics',
                description:
                  'Track every DM, lead, and conversion with detailed performance metrics.',
              },
              {
                icon: Sparkles,
                title: 'Easy to Use',
                description:
                  'Visual flow builder requires no coding. Set up automations in minutes.',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 mb-4">
                      <feature.icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Everything you need to know about our pricing.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
              >
                <Card className="border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <HelpCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 relative overflow-hidden">
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
              Ready to automate your Instagram growth?
            </h2>
            <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
              Join thousands of creators and businesses using Chatrist to scale their
              engagement. Start your free trial today.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8 h-12 shadow-lg"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white/30 hover:bg-white/10 rounded-full px-8 h-12"
                >
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
