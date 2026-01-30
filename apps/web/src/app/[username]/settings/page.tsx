'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Lock, Bell, Shield, Palette, CreditCard, LogOut, Trash2, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { userApi, getErrorMessage } from '@/lib/api';
import { auth } from '@/lib/supabase/auth';
import { useAuth } from '@/lib/hooks/useAuth';
import { UpdateProfileSchema, UpdatePasswordSchema } from '@/lib/validations';
import { ErrorBoundary, LoadingFallback } from '@/components/ErrorBoundary';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormErrors {
  [key: string]: string;
}

export default function SettingsPage() {
  return (
    <ErrorBoundary>
      <SettingsContent />
    </ErrorBoundary>
  );
}

function SettingsContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, signOut, isLoading: authLoading } = useAuth();

  // Form states
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  });
  const [profileErrors, setProfileErrors] = useState<FormErrors>({});

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    campaignAlerts: true,
    weeklyReports: false,
    monthlyReports: true,
    dmUpdates: true,
    newFeatures: false,
  });

  const [preferences, setPreferences] = useState({
    timezone: 'UTC',
    language: 'en',
  });

  // Fetch user profile
  const { data: profileResult, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data, error } = await userApi.getProfile();
      if (error) throw error;
      return data;
    },
    retry: 1,
  });

  // Initialize form data from profile
  useEffect(() => {
    if (profileResult) {
      setProfileData({
        name: profileResult.name || '',
        email: user?.email || '',
      });
      setNotifications(profileResult.notificationPreferences);
      setPreferences({
        timezone: profileResult.timezone,
        language: profileResult.language,
      });
    }
  }, [profileResult, user?.email]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const { data: result, error } = await userApi.updateProfile(data);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({ title: 'Profile updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error) => {
      toast({ title: 'Failed to update profile', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
      const { data: result, error } = await auth.updatePassword(data);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({ title: 'Password updated successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    },
    onError: (error) => {
      toast({ title: 'Failed to update password', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  // Update notifications mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (prefs: typeof notifications) => {
      const { data: result, error } = await userApi.updateNotifications(prefs);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({ title: 'Notification settings saved' });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error) => {
      toast({ title: 'Failed to save settings', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (prefs: { timezone: string; language: string }) => {
      const { data: result, error } = await userApi.updateProfile(prefs);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({ title: 'Preferences saved' });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error) => {
      toast({ title: 'Failed to save preferences', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors({});

    // Validate with Zod
    const result = UpdateProfileSchema.safeParse({ name: profileData.name });
    if (!result.success) {
      const errors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        errors[field] = issue.message;
      });
      setProfileErrors(errors);
      return;
    }

    updateProfileMutation.mutate({ name: profileData.name });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    // Validate with Zod
    const result = UpdatePasswordSchema.safeParse(passwordData);
    if (!result.success) {
      const errors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        errors[field] = issue.message;
      });
      setPasswordErrors(errors);
      return;
    }

    updatePasswordMutation.mutate(passwordData);
  };

  const handleNotificationsSave = () => {
    updateNotificationsMutation.mutate(notifications);
  };

  const handlePreferencesSave = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (authLoading || profileLoading) {
    return <LoadingFallback message="Loading settings..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account profile details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={updateProfileMutation.isPending}
                    className={profileErrors.name ? 'border-red-500' : ''}
                  />
                  {profileErrors.name && (
                    <p className="text-sm text-red-500">{profileErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed here. Contact support if you need to update it.
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    disabled={updatePasswordMutation.isPending}
                    className={passwordErrors.currentPassword ? 'border-red-500' : ''}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    disabled={updatePasswordMutation.isPending}
                    className={passwordErrors.newPassword ? 'border-red-500' : ''}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    disabled={updatePasswordMutation.isPending}
                    className={passwordErrors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Security
              </CardTitle>
              <CardDescription>
                Additional security settings for your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Active Sessions</p>
                  <p className="text-sm text-muted-foreground">
                    Manage your active login sessions
                  </p>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how and when you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Email Notifications</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important events
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Campaign Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when campaigns need attention
                    </p>
                  </div>
                  <Switch
                    checked={notifications.campaignAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, campaignAlerts: checked })
                    }
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold">Reports</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Reports</p>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly summary of your campaign performance
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, weeklyReports: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Monthly Reports</p>
                    <p className="text-sm text-muted-foreground">
                      Get detailed monthly performance analytics
                    </p>
                  </div>
                  <Switch
                    checked={notifications.monthlyReports}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, monthlyReports: checked })
                    }
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold">System Updates</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">DM Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Notifications about messages and DM activity
                    </p>
                  </div>
                  <Switch
                    checked={notifications.dmUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, dmUpdates: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Features</p>
                    <p className="text-sm text-muted-foreground">
                      Be the first to know about new features and updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newFeatures}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, newFeatures: checked })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleNotificationsSave}
                disabled={updateNotificationsMutation.isPending}
                className="w-full"
              >
                {updateNotificationsMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>
                  Customize your app experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Asia/Kolkata">India Standard Time (IST)</SelectItem>
                      <SelectItem value="Europe/London">British Time (GMT/BST)</SelectItem>
                      <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handlePreferencesSave}
                  disabled={updatePreferencesMutation.isPending}
                >
                  {updatePreferencesMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>
                  Manage your billing and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Current Plan:</span>{' '}
                    <span className="text-green-600 font-semibold">Free</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">Max Accounts:</span> 5
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Status:</span>{' '}
                    <span className="text-green-600 font-medium">Active</span>
                  </p>
                </div>
                <Button className="w-full">
                  Upgrade Plan
                </Button>
                <Button variant="outline" className="w-full">
                  View Plan Details
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Free Plan Benefits</CardTitle>
                <CardDescription>
                  What's included in your free plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Up to 5 Connected Accounts</p>
                    <p className="text-sm text-muted-foreground">Manage multiple Instagram accounts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Basic Automation</p>
                    <p className="text-sm text-muted-foreground">Create and run basic campaigns</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Community Support</p>
                    <p className="text-sm text-muted-foreground">Get help from our community</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-900">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-100">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </Button>
                <Button variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-100">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account Permanently
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
