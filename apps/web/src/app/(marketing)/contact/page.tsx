'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  Building2,
  Users,
  Headphones,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get help from our support team',
    value: 'support@chatrist.com',
    href: 'mailto:support@chatrist.com',
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Talk to a specialist',
    value: '1-800-CHATRIST',
    href: 'tel:1-800-CHATRIST',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with us in real-time',
    value: 'Available 24/7',
    href: '#',
  },
  {
    icon: MapPin,
    title: 'Headquarters',
    description: 'Visit our office',
    value: 'San Francisco, CA',
    href: '#',
  },
];

const inquiryTypes = [
  { value: 'general', label: 'General Inquiry', icon: HelpCircle },
  { value: 'sales', label: 'Sales & Pricing', icon: Building2 },
  { value: 'support', label: 'Technical Support', icon: Headphones },
  { value: 'partnership', label: 'Partnerships', icon: Users },
];

const offices = [
  {
    city: 'San Francisco',
    country: 'United States',
    address: '123 Creator Way, Suite 500',
    zipCode: 'San Francisco, CA 94102',
    phone: '+1 (415) 555-0100',
    email: 'sf@chatrist.com',
    isHQ: true,
  },
  {
    city: 'London',
    country: 'United Kingdom',
    address: '45 Tech Square, Floor 3',
    zipCode: 'London, EC2A 4BX',
    phone: '+44 20 7946 0958',
    email: 'london@chatrist.com',
    isHQ: false,
  },
  {
    city: 'Singapore',
    country: 'Singapore',
    address: '10 Marina Boulevard, #25-01',
    zipCode: 'Singapore 018983',
    phone: '+65 6789 0123',
    email: 'singapore@chatrist.com',
    isHQ: false,
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    inquiryType: 'general',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

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
              Get in Touch
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              We would love to{' '}
              <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
                hear from you
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 leading-relaxed">
              Have questions about Chatrist? Our team is here to help. Reach out and we
              will get back to you as soon as possible.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Contact Methods */}
      <section className="pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {contactMethods.map((method, index) => (
              <motion.a
                key={method.title}
                href={method.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 mx-auto mb-4">
                      <method.icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {method.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">{method.description}</p>
                    <p className="text-sm font-medium text-orange-600">{method.value}</p>
                  </CardContent>
                </Card>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Form */}
              <div className="lg:col-span-3">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                >
                  <Card className="border-gray-200">
                    <CardContent className="p-8">
                      {isSubmitted ? (
                        <div className="text-center py-12">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-6">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Message Sent!
                          </h3>
                          <p className="text-gray-500 mb-6">
                            Thank you for reaching out. We will get back to you within 24
                            hours.
                          </p>
                          <Button
                            onClick={() => {
                              setIsSubmitted(false);
                              setFormData({
                                name: '',
                                email: '',
                                company: '',
                                inquiryType: 'general',
                                subject: '',
                                message: '',
                              });
                            }}
                            variant="outline"
                            className="rounded-full"
                          >
                            Send Another Message
                          </Button>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Send us a Message
                          </h2>
                          <p className="text-gray-500 mb-8">
                            Fill out the form below and our team will respond promptly.
                          </p>

                          <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                  id="name"
                                  name="name"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  placeholder="John Doe"
                                  required
                                  className="rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  placeholder="john@example.com"
                                  required
                                  className="rounded-xl"
                                />
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="company">Company (Optional)</Label>
                                <Input
                                  id="company"
                                  name="company"
                                  value={formData.company}
                                  onChange={handleInputChange}
                                  placeholder="Your Company"
                                  className="rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="inquiryType">Inquiry Type *</Label>
                                <select
                                  id="inquiryType"
                                  name="inquiryType"
                                  value={formData.inquiryType}
                                  onChange={handleInputChange}
                                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                  required
                                >
                                  {inquiryTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                      {type.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="subject">Subject *</Label>
                              <Input
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                placeholder="How can we help you?"
                                required
                                className="rounded-xl"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="message">Message *</Label>
                              <Textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="Tell us more about your inquiry..."
                                rows={6}
                                required
                                className="rounded-xl resize-none"
                              />
                            </div>

                            <Button
                              type="submit"
                              className="w-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  Send Message
                                  <Send className="h-4 w-4 ml-2" />
                                </>
                              )}
                            </Button>
                          </form>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-2 space-y-6">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                >
                  <Card className="border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                          <Clock className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Response Time</h3>
                          <p className="text-sm text-gray-500">Within 24 hours</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        Our support team typically responds within 24 hours during business
                        days. For urgent issues, please use our live chat or phone support.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                >
                  <Card className="border-gray-200 bg-gradient-to-br from-orange-50 to-pink-50">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Enterprise Inquiries
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Looking for custom solutions, volume pricing, or dedicated support?
                        Our enterprise team is ready to help.
                      </p>
                      <Button variant="outline" className="w-full rounded-full">
                        Contact Enterprise Sales
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                >
                  <Card className="border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Frequently Asked Questions
                      </h3>
                      <ul className="space-y-3">
                        {[
                          'How do I connect my Instagram account?',
                          'What are the pricing plans?',
                          'Is there a free trial available?',
                          'How do I cancel my subscription?',
                        ].map((question) => (
                          <li key={question}>
                            <a
                              href="/documentation"
                              className="text-sm text-gray-600 hover:text-orange-600 transition-colors flex items-center gap-2"
                            >
                              <HelpCircle className="h-4 w-4" />
                              {question}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">Our Offices</h2>
            <p className="mt-4 text-lg text-gray-500">
              Visit us at one of our global offices.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {offices.map((office, index) => (
              <motion.div
                key={office.city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card
                  className={cn(
                    'h-full border-gray-200 transition-all duration-300 hover:shadow-lg',
                    office.isHQ && 'border-orange-200 bg-orange-50/30'
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {office.city}
                        </h3>
                        <p className="text-sm text-gray-500">{office.country}</p>
                      </div>
                      {office.isHQ && (
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                          HQ
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>{office.address}</p>
                      <p>{office.zipCode}</p>
                      <div className="pt-3 border-t border-gray-100 space-y-1">
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {office.phone}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {office.email}
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
    </div>
  );
}
