'use client';

import { usePathname, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Instagram,
  Calendar,
  BarChart3,
  Megaphone,
  Users,
  Link2,
  Crown,
  DollarSign,
  PlayCircle,
  Settings,
  Globe,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  AlertCircle,
  ChevronUp,
  Check,
  Loader2,
  Search,
  Bell,
  GitBranch,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface ConnectedAccount {
  id: string;
  username: string;
  profile_pic_url?: string;
  is_active: boolean;
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const urlUsername = params.username as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountSwitcherOpen, setAccountSwitcherOpen] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<ConnectedAccount | null>(null);

  // Get the actual username from user metadata
  const actualUsername = useMemo(() => {
    if (user?.user_metadata?.username) {
      return user.user_metadata.username;
    }
    // Fallback: use first part of email or user ID
    if (user?.email) {
      return user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30) || user.id?.slice(0, 8);
    }
    return user?.id?.slice(0, 8) || 'user';
  }, [user]);

  // Dynamic navigation with username
  const navigation = useMemo(() => [
    { name: 'Dashboard', href: `/${actualUsername}/dashboard`, icon: BarChart3 },
    { name: 'Campaigns', href: `/${actualUsername}/campaigns`, icon: Megaphone },
    { name: 'Flows', href: `/${actualUsername}/flows`, icon: GitBranch },
    { name: 'Leads', href: `/${actualUsername}/leads`, icon: Users },
    { name: 'Instagram DM', href: `/${actualUsername}/instagram`, icon: Instagram },
    { name: 'Later', href: `/${actualUsername}/later`, icon: Calendar },
    { name: 'Public Profile', href: `/${actualUsername}/public-profile`, icon: Globe },
    { name: 'Instant Open', href: `/${actualUsername}/instant-open`, icon: Link2 },
    { name: 'My Plan', href: `/${actualUsername}/plan`, icon: Crown },
    { name: 'Affiliate & Referral', href: `/${actualUsername}/affiliate`, icon: DollarSign },
    { name: 'Watch Video', href: `/${actualUsername}/tutorials`, icon: PlayCircle },
    { name: 'Account Settings', href: `/${actualUsername}/settings`, icon: Settings },
  ], [actualUsername]);

  // Map route patterns to page titles
  const getPageTitle = (path: string): string => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length < 2) return 'Dashboard';

    const section = segments[1];
    const titleMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'campaigns': 'Campaigns',
      'flows': 'Flows',
      'leads': 'Leads',
      'instagram': 'Instagram DM',
      'later': 'Later',
      'public-profile': 'Public Profile',
      'instant-open': 'Instant Open',
      'plan': 'My Plan',
      'affiliate': 'Affiliate & Referral',
      'tutorials': 'Watch Video',
      'settings': 'Account Settings',
      'analytics': 'Analytics',
    };

    return titleMap[section] || 'Dashboard';
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setLoading(false);

        if (!user) {
          router.push('/login');
          return;
        }

        // Fetch connected Instagram accounts
        const { data: accounts } = await supabase
          .from('instagram_accounts')
          .select('id, username, profile_pic_url, is_active')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (accounts && accounts.length > 0) {
          setConnectedAccounts(accounts);
          setSelectedAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setLoading(false);
        router.push('/login');
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Check if URL username matches actual username and redirect if needed
  useEffect(() => {
    if (!loading && user && urlUsername && actualUsername && urlUsername !== actualUsername) {
      // Redirect to correct URL with actual username
      const correctedPath = pathname.replace(`/${urlUsername}/`, `/${actualUsername}/`);
      router.replace(correctedPath);
    }
  }, [loading, user, urlUsername, actualUsername, pathname, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const pageTitle = getPageTitle(pathname);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen bg-[#F8FAFC]">
        {/* Mobile menu overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex flex-col bg-white h-screen',
            'border-r border-[#CBD5E1] shadow-sm',
            'transition-all duration-300 ease-out',
            sidebarCollapsed ? 'w-[68px]' : 'w-72',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          {/* Logo */}
          <div className="flex h-14 items-center justify-between px-4 flex-shrink-0">
            <Link
              href={`/${actualUsername}/dashboard`}
              className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-pink-500">
                <span className="text-white font-bold text-lg">!</span>
              </div>
              {!sidebarCollapsed && (
                <span className="text-xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Chat</span>rist
                </span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-8 w-8 lg:flex"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <ChevronLeft
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform duration-300',
                  sidebarCollapsed && 'rotate-180'
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-0.5 px-3 py-2 overflow-y-auto min-h-0">
            {navigation.map((navItem) => {
              const dashboardHref = `/${actualUsername}/dashboard`;
              const isActive = pathname === navItem.href ||
                (navItem.href !== dashboardHref && pathname.startsWith(navItem.href));
              const isHomeActive = navItem.href === dashboardHref && pathname === dashboardHref;
              const active = navItem.href === dashboardHref ? isHomeActive : isActive;

              const NavLink = (
                <Link
                  key={navItem.name}
                  href={navItem.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                    'transition-all duration-200',
                    active
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-[#475569] hover:bg-slate-100 hover:text-[#0F172A]'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-orange-400 to-pink-500" />
                  )}
                  <navItem.icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0 transition-transform duration-200',
                      active ? 'text-orange-600' : 'text-[#475569]',
                      !active && 'group-hover:scale-110'
                    )}
                  />
                  {!sidebarCollapsed && <span>{navItem.name}</span>}
                </Link>
              );

              if (sidebarCollapsed) {
                return (
                  <Tooltip key={navItem.name}>
                    <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {navItem.name}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return NavLink;
            })}
          </nav>

          {/* Bottom Section */}
          <div className="flex-shrink-0 mt-auto border-t border-[#CBD5E1] bg-white">
            {!sidebarCollapsed && (
              <div className="px-3 py-2">
                <Link href={`/${actualUsername}/settings`}>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors border border-red-200">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Automation Not working?
                  </button>
                </Link>
              </div>
            )}

            {/* Account Switcher */}
            {connectedAccounts.length > 0 && (
              <div className="px-3 py-2">
                <div
                  className="relative"
                  onMouseEnter={() => setAccountSwitcherOpen(true)}
                  onMouseLeave={() => setAccountSwitcherOpen(false)}
                >
                  <button
                    className={cn(
                      'w-full flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 transition-colors',
                      sidebarCollapsed && 'justify-center'
                    )}
                  >
                    <Avatar className="h-8 w-8 border-2 border-[#CBD5E1]">
                      <AvatarImage src={selectedAccount?.profile_pic_url} />
                      <AvatarFallback className="bg-orange-50 text-orange-600 font-medium text-xs">
                        {selectedAccount?.username?.charAt(0).toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    {!sidebarCollapsed && (
                      <>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-xs font-semibold text-[#0F172A] truncate">
                            @{selectedAccount?.username}
                          </p>
                        </div>
                        <ChevronUp className={cn(
                          'h-4 w-4 text-[#475569] transition-transform',
                          accountSwitcherOpen && 'rotate-180'
                        )} />
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {accountSwitcherOpen && !sidebarCollapsed && connectedAccounts.length > 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-[#CBD5E1] overflow-hidden z-50"
                      >
                        <div className="max-h-48 overflow-y-auto py-1">
                          {connectedAccounts.map((account) => (
                            <button
                              key={account.id}
                              onClick={() => {
                                setSelectedAccount(account);
                                setAccountSwitcherOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors"
                            >
                              <Avatar className="h-7 w-7 border border-[#CBD5E1]">
                                <AvatarImage src={account.profile_pic_url} />
                                <AvatarFallback className="bg-slate-100 text-[#475569] text-xs font-medium">
                                  {account.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="flex-1 text-left text-xs font-medium text-[#475569] truncate">
                                @{account.username}
                              </span>
                              {account.is_active && (
                                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                                  <Check className="h-2.5 w-2.5 text-white" />
                                </div>
                              )}
                              {selectedAccount?.id === account.id && (
                                <Check className="h-3 w-3 text-orange-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!sidebarCollapsed && connectedAccounts.length > 1 && (
                  <p className="text-[10px] text-[#475569] mt-1 px-2">
                    {connectedAccounts.length - 1} More account{connectedAccounts.length > 2 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {/* No accounts connected message */}
            {connectedAccounts.length === 0 && !sidebarCollapsed && (
              <div className="px-3 py-2">
                <Link href={`/${actualUsername}/instagram`}>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-200">
                    <Instagram className="h-3.5 w-3.5" />
                    Connect Instagram Account
                  </button>
                </Link>
              </div>
            )}

            {/* User Menu */}
            <div className="px-3 py-2 border-t border-[#CBD5E1] bg-white">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-2 rounded-lg h-auto py-2 hover:bg-slate-50',
                      sidebarCollapsed && 'justify-center px-2'
                    )}
                  >
                    <Avatar className="h-7 w-7 border border-[#CBD5E1]">
                      <AvatarFallback className="bg-orange-50 text-orange-600 font-medium text-xs">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {!sidebarCollapsed && (
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-xs font-medium truncate text-[#0F172A]">
                          {userName}
                        </p>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={sidebarCollapsed ? 'center' : 'end'}
                  side="top"
                  className="w-56 rounded-xl"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground">{userEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href={`/${actualUsername}/settings`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className={cn(
          'flex flex-1 flex-col min-w-0 h-screen transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-72'
        )}>
          {/* Mobile Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[#CBD5E1] bg-white px-4 lg:hidden shadow-sm flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-pink-500">
                <span className="text-white font-bold text-sm">!</span>
              </div>
              <span className="text-lg font-black tracking-tight">
                <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Chat</span>rist
              </span>
            </div>
          </header>

          {/* Desktop Top Bar */}
          <header className="hidden lg:flex h-14 items-center justify-between border-b border-[#CBD5E1] bg-white px-6 flex-shrink-0">
            <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-9 w-64 rounded-full border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-orange-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 transition-colors"
                />
              </div>
              <button className="relative h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500" />
              </button>
              <Avatar className="h-8 w-8 border border-[#CBD5E1]">
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white font-medium text-xs">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
            <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
