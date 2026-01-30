'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, Loader2, User, Mail, Lock, ArrowRight, Check } from 'lucide-react';
import { auth } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRedirectAuthenticated } from '@/lib/hooks/useAuth';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const features = [
  'Visual flow builder for DM automations',
  'Automatic lead capture & export',
  'Comment & story reply triggers',
  'Unlimited campaigns & flows',
];

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to dashboard if already logged in
  useRedirectAuthenticated('/dashboard');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      console.log('Attempting registration with:', { email: data.email, name: data.name });
      const { data: result, error } = await auth.signUp(data);

      if (error) {
        console.error('Registration error:', error);
        toast({
          title: 'Registration failed',
          description: error.message || 'Something went wrong',
          variant: 'destructive',
        });
      } else {
        console.log('Registration successful:', result);
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
        });
        router.push('/login');
      }
    } catch (error: any) {
      console.error('Registration exception:', error);
      toast({
        title: 'Registration failed',
        description: error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 via-primary to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <MessageSquare className="h-6 w-6" />
            </div>
            <span className="text-xl font-semibold">Chatrist</span>
          </Link>

          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight">
                Start automating
                <br />
                <span className="text-white/80">in minutes.</span>
              </h1>
              <p className="text-lg text-white/70 max-w-md">
                Join thousands of creators using Chatrist to grow their Instagram.
              </p>
            </div>

            <ul className="space-y-3">
              {features.map((feature, index) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 text-white/90"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <Check className="h-4 w-4" />
                  </div>
                  {feature}
                </motion.li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-white/50">
            Free 14-day trial. No credit card required.
          </p>
        </div>
      </div>

      {/* Right side - Register form */}
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-semibold">Chatrist</span>
          </div>

          <Card className="border-0 shadow-xl lg:shadow-none lg:border lg:border-border/50">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Create an account
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your details to get started with Chatrist
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className={cn(
                        'pl-10 h-11 rounded-xl',
                        errors.name && 'border-destructive focus-visible:ring-destructive'
                      )}
                      {...register('name')}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive"
                    >
                      {errors.name.message}
                    </motion.p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className={cn(
                        'pl-10 h-11 rounded-xl',
                        errors.email && 'border-destructive focus-visible:ring-destructive'
                      )}
                      {...register('email')}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      className={cn(
                        'pl-10 h-11 rounded-xl',
                        errors.password && 'border-destructive focus-visible:ring-destructive'
                      )}
                      {...register('password')}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className={cn(
                        'pl-10 h-11 rounded-xl',
                        errors.confirmPassword && 'border-destructive focus-visible:ring-destructive'
                      )}
                      {...register('confirmPassword')}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive"
                    >
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="underline hover:text-foreground">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="underline hover:text-foreground">
                    Privacy Policy
                  </Link>
                </p>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
