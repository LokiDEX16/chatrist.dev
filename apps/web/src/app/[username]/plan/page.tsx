'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Star, ArrowRight } from 'lucide-react';
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

const plans = [
  {
    name: 'Free',
    description: 'Get started with automation',
    price: '$0',
    period: '/forever',
    icon: Zap,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    features: [
      'Up to 5 Instagram Accounts',
      'Basic Automation',
      '50 DMs per day',
      'Basic Analytics',
      'Community Support',
      'Community Access',
    ],
    cta: 'Current Plan',
    highlighted: false,
    current: true,
  },
  {
    name: 'Starter',
    description: 'Perfect for growing creators',
    price: '$9',
    period: '/month',
    icon: Zap,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    features: [
      'Up to 10 Instagram Accounts',
      'Advanced Automation',
      '500 DMs per day',
      'Advanced Analytics',
      'Email Support',
      'Community Access',
      'API Access',
    ],
    cta: 'Upgrade',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'For scaling creators',
    price: '$29',
    period: '/month',
    icon: Star,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    features: [
      'Up to 50 Instagram Accounts',
      'Unlimited Automation',
      'Unlimited DMs',
      'Advanced Analytics',
      'Priority Email Support',
      'Community Access',
      'API Access',
      'Custom Integrations',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'For scaling businesses',
    price: 'Custom',
    period: 'pricing',
    icon: Crown,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    features: [
      'Unlimited Accounts',
      'Unlimited Campaigns',
      'Unlimited DMs',
      'Custom Analytics',
      '24/7 Phone Support',
      'Dedicated Account Manager',
      'Advanced API Access',
      'White Label Solutions',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function MyPlanPage() {
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
          <h1 className="text-3xl font-bold text-[#0F172A]">Choose Your Plan</h1>
          <p className="text-[#475569] text-sm mt-2 max-w-2xl mx-auto">
            Select the perfect plan for your Instagram automation needs. Upgrade or downgrade anytime.
          </p>
        </div>
      </motion.div>

      {/* Current Plan */}
      <motion.div variants={item}>
        <Card className="border-2 border-[#22C55E]/30 bg-gradient-to-r from-[#22C55E]/5 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#0F172A] text-lg">Your Current Plan: <span className="text-[#22C55E]">Free</span></h3>
                <p className="text-sm text-[#475569] mt-1">Max 5 connected accounts • Limited to 50 DMs/day</p>
              </div>
              <Button className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg">
                Upgrade Plan
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pricing Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {plans.map((plan: any) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.name}
              className={cn(
                'border border-[#CBD5E1] bg-white overflow-hidden transition-all duration-200',
                plan.current && 'border-2 border-[#22C55E] bg-[#22C55E]/5',
                plan.highlighted && 'border-2 border-[#6366F1] shadow-lg md:scale-100'
              )}
            >
              <CardHeader className={cn(
                'pb-4',
                plan.current && 'bg-gradient-to-r from-[#22C55E] to-emerald-500 text-white',
                plan.highlighted && 'bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white'
              )}>
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    plan.current ? 'bg-white/20' : plan.highlighted ? 'bg-white/20' : plan.iconBg
                  )}>
                    <Icon className={cn(
                      'h-6 w-6',
                      (plan.current || plan.highlighted) ? 'text-white' : plan.iconColor
                    )} />
                  </div>
                  {plan.current && (
                    <span className="bg-white/20 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      CURRENT
                    </span>
                  )}
                  {plan.highlighted && (
                    <span className="bg-white/20 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      POPULAR
                    </span>
                  )}
                </div>
                <CardTitle className={plan.current || plan.highlighted ? 'text-white' : ''}>{plan.name}</CardTitle>
                <CardDescription className={plan.current || plan.highlighted ? 'text-white/80' : ''}>
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Pricing */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[#0F172A]">{plan.price}</span>
                    <span className="text-[#475569] text-sm">{plan.period}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  disabled={plan.current}
                  className={cn(
                    'w-full rounded-lg',
                    plan.current
                      ? 'bg-[#22C55E] hover:bg-[#16A34A] text-white'
                      : plan.highlighted
                        ? 'bg-[#6366F1] hover:bg-[#4F46E5] text-white'
                        : 'border border-[#CBD5E1] text-[#0F172A] hover:bg-slate-50'
                  )}
                >
                  {plan.cta}
                </Button>

                {/* Features */}
                <div className="border-t border-[#CBD5E1] pt-6 space-y-3">
                  {plan.features.map((feature: string) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#6366F1] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#475569]">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* FAQ */}
      <motion.div variants={item}>
        <Card className="border border-[#CBD5E1] bg-white">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">Can I change my plan anytime?</h4>
              <p className="text-sm text-[#475569]">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="border-t border-[#CBD5E1] pt-4">
              <h4 className="font-semibold text-[#0F172A] mb-2">Do you offer refunds?</h4>
              <p className="text-sm text-[#475569]">
                We offer a 30-day money-back guarantee. If you're not satisfied, contact our support team.
              </p>
            </div>
            <div className="border-t border-[#CBD5E1] pt-4">
              <h4 className="font-semibold text-[#0F172A] mb-2">What payment methods do you accept?</h4>
              <p className="text-sm text-[#475569]">
                We accept all major credit cards, PayPal, and bank transfers for enterprise customers.
              </p>
            </div>
            <div className="border-t border-[#CBD5E1] pt-4">
              <h4 className="font-semibold text-[#0F172A] mb-2">Can I get a custom plan?</h4>
              <p className="text-sm text-[#475569]">
                Absolutely! Contact our sales team for custom pricing and features tailored to your needs.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
