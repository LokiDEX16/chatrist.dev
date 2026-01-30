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
import { MessageSquare, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { auth } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRedirectAuthenticated } from '@/lib/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to dashboard if already logged in
  useRedirectAuthenticated('/dashboard');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { data: result, error } = await auth.signIn(data);

      if (error) {
        toast({
          title: 'Login failed',
          description: error.message || 'Invalid email or password',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Welcome back!',
          description: 'Redirecting to your dashboard...',
        });
        // Redirect to /dashboard - middleware will convert to /${username}/dashboard
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
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

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Automate your Instagram DMs
              <br />
              <span className="text-white/80">without the complexity.</span>
            </h1>
            <p className="text-lg text-white/70 max-w-md">
              Build powerful DM automations with our visual flow builder.
              No coding required.
            </p>
          </div>

          <p className="text-sm text-white/50">
            Trusted by 1,000+ creators and businesses
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
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
                Welcome back
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
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
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/register"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Create account
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
