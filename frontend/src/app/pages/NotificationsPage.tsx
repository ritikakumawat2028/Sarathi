import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '@/app/components/Header';
import { useLanguage } from '@/app/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { 
  Bell, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  AlertCircle, 
  Trash2, 
  CheckCheck, 
  ArrowRight, 
  Clock, 
  Filter,
  Info
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'schemes' | 'education' | 'system' | 'urgent';
  timestamp: string;
  unread: boolean;
  actionLabel?: string;
  actionPath?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Government Scheme Launched: PM Vishwakarma Yojana Phase 2',
    message: 'Applications are now open for traditional artisans and craftspeople. Check your exact eligibility score right now.',
    category: 'schemes',
    timestamp: '10 minutes ago',
    unread: true,
    actionLabel: 'Check Eligibility Now',
    actionPath: '/government-schemes/eligibility'
  },
  {
    id: 'notif-2',
    title: 'Citizen Scheme Eligibility Assessment Updated',
    message: 'Your recent profile update matches criteria for 4 newly announced state and central welfare programs.',
    category: 'schemes',
    timestamp: '2 hours ago',
    unread: true,
    actionLabel: 'View AI Recommendations',
    actionPath: '/government-schemes/recommendations'
  },
  {
    id: 'notif-3',
    title: 'Sarthi AI Multilingual Engine v2.0 Active',
    message: 'You can now speak and interact with Sarthi AI Assistant in 8 Indian languages (Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, & English).',
    category: 'system',
    timestamp: '5 hours ago',
    unread: true,
    actionLabel: 'Try AI Assistant',
    actionPath: '/chat'
  },
  {
    id: 'notif-4',
    title: 'Study Plan Progress Milestone Reached',
    message: 'Great job completing 3 real learning tasks in your customized Python & Full Stack roadmap. Keep up the momentum!',
    category: 'education',
    timestamp: '1 day ago',
    unread: false,
    actionLabel: 'View Dashboard & Progress',
    actionPath: '/dashboard'
  },
  {
    id: 'notif-5',
    title: 'National Scholarship Portal Deadline Alert',
    message: 'Application submission window for Post-Matric & Merit Scholarship schemes closes soon. Ensure your documents are uploaded.',
    category: 'urgent',
    timestamp: '2 days ago',
    unread: false,
    actionLabel: 'Explore Student Support',
    actionPath: '/student-support'
  }
];

export function NotificationsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'unread' | 'schemes' | 'education' | 'system'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('sarthi_citizen_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('sarthi_citizen_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return n.unread;
    if (filter === 'schemes') return n.category === 'schemes' || n.category === 'urgent';
    if (filter === 'education') return n.category === 'education';
    if (filter === 'system') return n.category === 'system';
    return true;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'schemes':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><ShieldCheck className="w-3 h-3 mr-1" /> Government Scheme</Badge>;
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse"><AlertCircle className="w-3 h-3 mr-1" /> Urgent Deadline</Badge>;
      case 'education':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><BookOpen className="w-3 h-3 mr-1" /> Career & Study</Badge>;
      case 'system':
      default:
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200"><Sparkles className="w-3 h-3 mr-1" /> System & AI</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Top Banner & Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-300 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F2B5B] to-[#1D4ED8] text-white flex items-center justify-center shadow-md">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2B5B]">
                  {t('notifications') || 'Citizen Notifications & Official Alerts'}
                </h1>
                {unreadCount > 0 && (
                  <Badge className="bg-[#F97316] text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                    {unreadCount} New
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Real-time updates on government schemes, eligibility assessments, study plans, and portal announcements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="rounded-xl border-gray-300 hover:border-[#1D4ED8] hover:bg-[#EFF6FF] text-xs font-bold text-[#0F2B5B] flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4 text-[#1D4ED8]" />
                Mark All as Read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="rounded-xl border-gray-300 hover:border-red-500 hover:bg-red-50 text-xs font-bold text-red-600 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3 rounded-2xl border border-slate-300 shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'ghost'}
              onClick={() => setFilter('all')}
              className={`rounded-xl text-xs font-bold shrink-0 ${
                filter === 'all' ? 'bg-[#0F2B5B] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Alerts ({notifications.length})
            </Button>
            <Button
              size="sm"
              variant={filter === 'unread' ? 'default' : 'ghost'}
              onClick={() => setFilter('unread')}
              className={`rounded-xl text-xs font-bold shrink-0 ${
                filter === 'unread' ? 'bg-[#F97316] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              size="sm"
              variant={filter === 'schemes' ? 'default' : 'ghost'}
              onClick={() => setFilter('schemes')}
              className={`rounded-xl text-xs font-bold shrink-0 ${
                filter === 'schemes' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Schemes & Eligibility
            </Button>
            <Button
              size="sm"
              variant={filter === 'education' ? 'default' : 'ghost'}
              onClick={() => setFilter('education')}
              className={`rounded-xl text-xs font-bold shrink-0 ${
                filter === 'education' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Study & Career
            </Button>
            <Button
              size="sm"
              variant={filter === 'system' ? 'default' : 'ghost'}
              onClick={() => setFilter('system')}
              className={`rounded-xl text-xs font-bold shrink-0 ${
                filter === 'system' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              System & AI
            </Button>
          </div>
          <span className="text-xs text-gray-400 font-semibold hidden md:inline">
            Showing {filteredNotifications.length} of {notifications.length} entries
          </span>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card className="border border-slate-300 rounded-[20px] bg-white text-center py-16 shadow-2xs">
            <CardContent className="space-y-3">
              <div className="w-16 h-16 bg-[#EFF6FF] rounded-full flex items-center justify-center mx-auto text-[#1D4ED8]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#0F2B5B]">No Notifications Found</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                {filter === 'unread' 
                  ? "You're all caught up! There are no unread citizen notifications." 
                  : "You don't have any notifications in this category right now."}
              </p>
              {filter !== 'all' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setFilter('all')}
                  className="mt-2 rounded-xl text-xs font-bold text-[#0F2B5B]"
                >
                  View All Notifications
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3.5">
            {filteredNotifications.map((notif) => (
              <Card
                key={notif.id}
                className={`border rounded-2xl transition-all shadow-2xs hover:shadow-md ${
                  notif.unread 
                    ? 'border-l-4 border-l-[#F97316] border-slate-300 bg-[#FFFBEB]/30' 
                    : 'border-slate-300 bg-white opacity-95'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="mt-1 shrink-0">
                        {notif.unread ? (
                          <div className="w-3 h-3 rounded-full bg-[#F97316] ring-4 ring-[#F97316]/20" />
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-gray-300" />
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                          {getCategoryBadge(notif.category)}
                          <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {notif.timestamp}
                          </span>
                        </div>
                        <h3 className={`text-sm sm:text-base font-extrabold ${notif.unread ? 'text-[#0F2B5B]' : 'text-gray-800'}`}>
                          {notif.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {notif.message}
                        </p>
                        {notif.actionLabel && notif.actionPath && (
                          <div className="pt-2">
                            <Button
                              size="sm"
                              onClick={() => navigate(notif.actionPath!)}
                              className="rounded-xl bg-[#0F2B5B] hover:bg-[#1D4ED8] text-white text-xs font-bold px-3.5 py-1.5 h-8 flex items-center gap-1.5 shadow-sm"
                            >
                              <span>{notif.actionLabel}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleRead(notif.id)}
                        className="rounded-xl text-xs font-bold text-gray-600 hover:text-[#1D4ED8] hover:bg-[#EFF6FF] px-2.5 h-8"
                        title={notif.unread ? 'Mark as read' : 'Mark as unread'}
                      >
                        {notif.unread ? 'Mark Read' : 'Unread'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notif.id)}
                        className="rounded-xl text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 w-8 h-8 p-0 flex items-center justify-center"
                        title="Delete alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
