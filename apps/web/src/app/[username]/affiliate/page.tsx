'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { motion } from 'framer-motion';
import { Copy, Share2, TrendingUp, Users, DollarSign, Gift, Wallet } from 'lucide-react';

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

interface Referral {
  id: string;
  username: string;
  date: string;
  status: 'pending' | 'completed' | 'paid';
  commission: number;
}

interface CouponCode {
  id: string;
  code: string;
  uses: number;
  createdAt: Date;
}

// Referrals will be populated from the database once the referral system backend is set up

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
  paid: { label: 'Paid', className: 'bg-blue-100 text-blue-700' },
};

export default function AffiliateReferralPage() {
  const { toast } = useToast();
  const referralCode = 'ref_abc123xyz';
  const referralLink = `https://chatrist.com/signup?ref=${referralCode}`;
  const [couponInput, setCouponInput] = useState('');
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [referrals] = useState<Referral[]>([]);

  const totalEarnings = referrals
    .filter(r => r.status === 'completed' || r.status === 'paid')
    .reduce((sum, r) => sum + r.commission, 0);
  const availableBalance = referrals
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.commission, 0);
  const totalReferralCount = referrals.length;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({ title: 'Referral link copied!' });
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Chatrist',
          text: 'Sign up for Chatrist and automate your Instagram DMs!',
          url: referralLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyCode();
    }
  };

  const handleCreateCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      toast({ title: 'Please enter a coupon code', variant: 'destructive' });
      return;
    }
    if (!/^[A-Z0-9]+$/.test(code)) {
      toast({ title: 'Coupon code must be alphanumeric', variant: 'destructive' });
      return;
    }
    const newCoupon: CouponCode = {
      id: crypto.randomUUID(),
      code,
      uses: 0,
      createdAt: new Date(),
    };
    setCoupons(prev => [newCoupon, ...prev]);
    setCouponInput('');
    toast({ title: 'Coupon code created!' });
  };

  const handlePayoutRequest = () => {
    toast({
      title: 'Payout requested',
      description: 'Your payout will be processed within 5-7 business days.',
    });
  };

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
          <h1 className="text-3xl font-bold text-[#0F172A]">Affiliate & Referral</h1>
          <p className="text-[#475569] text-sm mt-1">
            Earn 50% commission on every referral when they purchase monthly plan for the first time
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-[#CBD5E1] bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#475569] font-medium">Total Earnings</p>
                <p className="text-3xl font-bold text-[#0F172A] mt-1">${totalEarnings.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#CBD5E1] bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#475569] font-medium">Available Balance</p>
                <p className="text-3xl font-bold text-[#0F172A] mt-1">${availableBalance.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-[#22C55E]/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-[#22C55E]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#CBD5E1] bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#475569] font-medium">Total Referrals</p>
                <p className="text-3xl font-bold text-[#0F172A] mt-1">{totalReferralCount}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Referral Dashboard */}
      <motion.div variants={item}>
        <Card className="border border-[#CBD5E1] bg-white">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-slate-50 rounded-t-2xl">
            <CardTitle>Your Referral Dashboard</CardTitle>
            <CardDescription>
              Earn 50% commission on your every referral when they purchase monthly plan for the first time
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Referral Link */}
            <div className="space-y-2">
              <Label className="font-semibold">Your Referral Code & Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={referralLink}
                  className="rounded-lg bg-slate-50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-lg"
                  onClick={handleCopyCode}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-[#475569]">
                Share this code with your audience and earn 50% commission on every successful referral
              </p>
            </div>

            {/* Share Button */}
            <Button
              className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Your Referral Link
            </Button>

            {/* Create Coupon Code */}
            <div className="border-t border-[#CBD5E1] pt-6 space-y-2">
              <Label htmlFor="coupon-code" className="font-semibold">Create Custom Coupon Code</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon-code"
                  placeholder="e.g., MYCODE50"
                  className="rounded-lg"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateCoupon()}
                />
                <Button
                  className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg"
                  onClick={handleCreateCoupon}
                  disabled={!couponInput.trim()}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Create Code
                </Button>
              </div>
              <p className="text-xs text-[#475569]">
                Create custom coupon codes to share with your audience
              </p>

              {/* Created Coupons */}
              {coupons.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {coupons.map((coupon) => (
                    <Badge key={coupon.id} variant="secondary" className="text-sm px-3 py-1">
                      {coupon.code} ({coupon.uses} uses)
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Referral Details */}
      <motion.div variants={item}>
        <Card className="border border-[#CBD5E1] bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Referral Details</CardTitle>
                <CardDescription>Track your referrals and commissions</CardDescription>
              </div>
              {availableBalance > 0 && (
                <Button
                  className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg"
                  onClick={handlePayoutRequest}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Request Payout
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-[#CBD5E1] mx-auto mb-3" />
                <p className="text-[#475569] text-sm">No referrals yet</p>
                <p className="text-[#94A3B8] text-xs mt-1">Start sharing your referral code to earn commissions</p>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Username</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Commission</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => {
                      const config = statusConfig[referral.status];
                      return (
                        <TableRow key={referral.id}>
                          <TableCell className="font-medium">@{referral.username}</TableCell>
                          <TableCell className="text-[#475569]">
                            {new Date(referral.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
                              {config.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-semibold">${referral.commission.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Help Section */}
      <motion.div variants={item}>
        <Card className="border border-[#CBD5E1] bg-white">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { num: '1', title: 'Share Your Code', desc: 'Share your unique referral code with your audience' },
                { num: '2', title: 'They Sign Up', desc: 'Your referrals sign up using your code' },
                { num: '3', title: 'They Purchase', desc: 'When they buy a monthly plan, you get 50% commission' },
                { num: '4', title: 'Get Paid', desc: 'Withdraw your earnings to your preferred payment method' },
              ].map((step) => (
                <div key={step.num} className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-[#6366F1] font-bold text-sm">{step.num}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0F172A]">{step.title}</h4>
                    <p className="text-sm text-[#475569]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
