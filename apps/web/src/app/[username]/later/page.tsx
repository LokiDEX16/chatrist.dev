'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Play,
  Plus,
  MessageSquare,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Image,
  Video,
  FileText,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
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

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface ScheduledPost {
  id: string;
  date: Date;
  time: string;
  caption: string;
  mediaType: 'image' | 'video' | 'carousel' | 'reel';
  status: 'scheduled' | 'published';
}

const mediaTypeConfig: Record<string, { label: string; icon: typeof Image; color: string; bgColor: string }> = {
  image: { label: 'Image', icon: Image, color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  video: { label: 'Video', icon: Video, color: 'text-pink-600', bgColor: 'bg-pink-500/10' },
  carousel: { label: 'Carousel', icon: FileText, color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
  reel: { label: 'Reel', icon: Play, color: 'text-purple-600', bgColor: 'bg-purple-500/10' },
};

function getFirstDayOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getLastDayOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatDateCell(date: Date): string {
  return date.getDate().toString();
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

function isCurrentMonth(date: Date, monthDate: Date): boolean {
  return date.getMonth() === monthDate.getMonth() && date.getFullYear() === monthDate.getFullYear();
}

export default function LaterPage() {
  const { toast } = useToast();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(today);
    d.setDate(1);
    return d;
  });

  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newPost, setNewPost] = useState({
    time: '09:00',
    caption: '',
    mediaType: 'image' as ScheduledPost['mediaType'],
  });

  const { calendarDays, monthStart, monthEnd } = useMemo(() => {
    const start = getFirstDayOfMonth(currentMonth);
    const end = getLastDayOfMonth(currentMonth);
    const startingDayOfWeek = start.getDay();

    const prevMonthEnd = new Date(start);
    prevMonthEnd.setDate(0);
    const prevMonthDays = [];
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(prevMonthEnd);
      day.setDate(prevMonthEnd.getDate() - i);
      prevMonthDays.push(day);
    }

    const currentMonthDays = [];
    for (let i = 1; i <= end.getDate(); i++) {
      const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      day.setHours(0, 0, 0, 0);
      currentMonthDays.push(day);
    }

    const totalCells = 42;
    const filledCells = prevMonthDays.length + currentMonthDays.length;
    const nextMonthDays = [];
    for (let i = 1; i <= totalCells - filledCells; i++) {
      const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i);
      day.setHours(0, 0, 0, 0);
      nextMonthDays.push(day);
    }

    return {
      calendarDays: [...prevMonthDays, ...currentMonthDays, ...nextMonthDays],
      monthStart: start,
      monthEnd: end,
    };
  }, [currentMonth]);

  const goToPrev = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    newMonth.setDate(1);
    setCurrentMonth(newMonth);
  };

  const goToNext = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    newMonth.setDate(1);
    setCurrentMonth(newMonth);
  };

  const goToToday = () => {
    const d = new Date(today);
    d.setDate(1);
    setCurrentMonth(d);
  };

  const getPostsForDay = (day: Date): ScheduledPost[] => {
    return scheduledPosts.filter(p => isSameDay(p.date, day));
  };

  const handleCellClick = (day: Date) => {
    setSelectedDate(day);
    setNewPost({ time: '09:00', caption: '', mediaType: 'image' });
    setDialogOpen(true);
  };

  const handleSchedulePost = () => {
    if (!selectedDate || !newPost.caption.trim()) return;

    const post: ScheduledPost = {
      id: crypto.randomUUID(),
      date: selectedDate,
      time: newPost.time,
      caption: newPost.caption.trim(),
      mediaType: newPost.mediaType,
      status: 'scheduled',
    };

    setScheduledPosts(prev => [...prev, post]);
    setDialogOpen(false);
    toast({
      title: 'Post scheduled!',
      description: `Scheduled for ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at ${newPost.time}`,
    });
  };

  const handleDeletePost = (id: string) => {
    setScheduledPosts(prev => prev.filter(p => p.id !== id));
    toast({ title: 'Scheduled post removed' });
  };

  const handleNewScheduleClick = () => {
    setSelectedDate(new Date());
    setNewPost({ time: '09:00', caption: '', mediaType: 'image' });
    setDialogOpen(true);
  };

  const rows = Array.from({ length: 6 }).map((_, rowIndex) =>
    calendarDays.slice(rowIndex * 7, (rowIndex + 1) * 7)
  );

  const upcomingPosts = [...scheduledPosts]
    .filter(p => p.status === 'scheduled')
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.time.localeCompare(b.time));

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
          <h1 className="text-2xl font-semibold text-gray-900">
            Chatrist&apos;s Later - Schedule Content with AutoDM
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Plan and manage all your upcoming instagram posts. Click on a date to schedule a post.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <Play className="h-4 w-4 mr-2" />
            How to use? Watch Video!
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            onClick={handleNewScheduleClick}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
            <CalendarIcon className="h-4 w-4 ml-2" />
          </Button>
          <Button variant="outline" className="rounded-lg border-gray-200">
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
          </Button>
        </div>
      </motion.div>

      {/* Calendar Card */}
      <motion.div variants={item}>
        <Card className="border border-gray-100 bg-white overflow-hidden">
          <CardContent className="p-0">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {formatMonthYear(currentMonth)}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {monthStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {monthEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToPrev} className="rounded-lg border-gray-200">
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday} className="rounded-lg border-gray-200">
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={goToNext} className="rounded-lg border-gray-200">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {WEEKDAYS.map((day) => (
                <div key={day} className="px-4 py-3 text-center font-semibold text-gray-700 text-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div>
              {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-7">
                  {row.map((day, dayIndex) => {
                    const isToday = isSameDay(day, today);
                    const isCurrentMonthDay = isCurrentMonth(day, currentMonth);
                    const dayPosts = getPostsForDay(day);

                    return (
                      <div
                        key={dayIndex}
                        onClick={() => handleCellClick(day)}
                        className={cn(
                          'min-h-[120px] border-b border-r border-gray-200 p-2 cursor-pointer transition-colors',
                          dayIndex === 6 && 'border-r-0',
                          rowIndex === 5 && 'border-b-0',
                          isCurrentMonthDay && 'bg-white hover:bg-blue-50/50',
                          !isCurrentMonthDay && 'bg-gray-50/50 hover:bg-gray-100/50'
                        )}
                      >
                        <div
                          className={cn(
                            'inline-flex items-center justify-center w-7 h-7 rounded-lg font-semibold text-sm mb-1',
                            isToday
                              ? 'bg-blue-600 text-white'
                              : isCurrentMonthDay
                                ? 'text-gray-900'
                                : 'text-gray-400'
                          )}
                        >
                          {formatDateCell(day)}
                        </div>
                        {/* Scheduled post indicators */}
                        <div className="space-y-1">
                          {dayPosts.slice(0, 2).map((post) => {
                            const config = mediaTypeConfig[post.mediaType];
                            return (
                              <div
                                key={post.id}
                                className={cn(
                                  'text-xs truncate px-1.5 py-0.5 rounded font-medium',
                                  config.bgColor, config.color
                                )}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {post.time} {config.label}
                              </div>
                            );
                          })}
                          {dayPosts.length > 2 && (
                            <div className="text-xs text-gray-400 px-1.5 font-medium">
                              +{dayPosts.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Scheduled Posts */}
      {upcomingPosts.length > 0 && (
        <motion.div variants={item}>
          <Card className="border border-gray-100 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Scheduled Posts</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {upcomingPosts.map((post) => {
                  const config = mediaTypeConfig[post.mediaType];
                  const MediaIcon = config.icon;
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', config.bgColor)}>
                        <MediaIcon className={cn('h-5 w-5', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{post.caption}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {post.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.time}
                          </span>
                          <Badge variant="secondary" className="text-xs rounded-full px-2 py-0">
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Tips */}
      <motion.div variants={item}>
        <Card className="border border-gray-100 bg-white">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                Click on any date to schedule a new post with automated DM responses
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                Posts will be published at your selected time with AutoDM enabled
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                Drag and drop posts to reschedule them to different dates
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Schedule Post Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Schedule a Post</DialogTitle>
            <DialogDescription>
              Schedule content for{' '}
              {selectedDate?.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="post-time">Time</Label>
              <Input
                id="post-time"
                type="time"
                value={newPost.time}
                onChange={(e) => setNewPost({ ...newPost, time: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Media Type</Label>
              <Select
                value={newPost.mediaType}
                onValueChange={(v) => setNewPost({ ...newPost, mediaType: v as ScheduledPost['mediaType'] })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="reel">Reel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-caption">Caption</Label>
              <Textarea
                id="post-caption"
                placeholder="Write your caption..."
                value={newPost.caption}
                onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                className="rounded-xl min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSchedulePost}
              disabled={!newPost.caption.trim()}
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              Schedule Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
