import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '@/app/components/Header';
import { useLanguage } from '@/app/context/LanguageContext';
import { api } from '@/app/lib/api';
import { Card, CardContent } from '@/app/components/ui/card';
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
  RefreshCw,
  BriefcaseBusiness,
  GraduationCap,
  Megaphone,
  Info
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: string;
  timestamp: string;
  unread: boolean;
  actionLabel?: string;
  actionPath?: string;
}

// Map backend notifications to our local shape
function mapBackendNotif(n: any): NotificationItem {
  return {
    id: n.id || n._id?.toString() || `notif-${Date.now()}-${Math.random()}`,
    title: n.title || 'System Notification',
    message: n.content || n.message || 'Notification details available.',
    category: n.category || 'system',
    timestamp: (() => {
      const d = n.date || n.timestamp;
      if (!d) return 'Just now';
      const date = new Date(d);
      if (isNaN(date.getTime())) return String(d);
      const diff = Date.now() - date.getTime();
      const mins = Math.floor(diff / 60000);
      const hrs = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      if (mins < 2) return 'Just now';
      if (mins < 60) return `${mins} minutes ago`;
      if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
      if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    })(),
    unread: n.unread !== false,
    actionLabel: n.actionText || n.actionLabel || 'View Details',
    actionPath: n.actionUrl || n.actionPath || '/career'
  };
}

const FILTER_CATEGORIES = {
  schemes: ['schemes', 'urgent', 'welfare schemes', 'welfare', 'government', 'gov'],
  career: ['career', 'career guidance & skills', 'skill gap analysis', 'career progression', 'skills', 'resume'],
  system: ['system', 'system alert', 'career & system alert', 'platform', 'welcome', 'ai'],
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'unread' | 'schemes' | 'career' | 'system'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchNotifications = useCallback(async () => {
    try {
      const res: any = await api.get('/notifications');
      if (res && Array.isArray(res.notifications)) {
        const mapped = res.notifications.map(mapBackendNotif);
        setNotifications(mapped);
        setLastRefreshed(new Date());
      }
    } catch (e) {
      // Keep existing notifications on error
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount + every 20 seconds (real-time polling)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    try { await api.put('/notifications/read-all', {}); } catch {}
  };

  const handleToggleRead = async (id: string) => {
    const target = notifications.find(n => n.id === id);
    const newUnread = target ? !target.unread : false;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: newUnread } : n));
    try { await api.put(`/notifications/${id}/read`, { unread: newUnread }); } catch {}
  };

  const handleDelete = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try { await api.del(`/notifications/${id}`); } catch {}
  };

  const handleClearAll = async () => {
    setNotifications([]);
    try { await api.del('/notifications/all'); } catch {}
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return n.unread;
    const cat = n.category.toLowerCase();
    if (filter === 'schemes') return FILTER_CATEGORIES.schemes.some(k => cat.includes(k));
    if (filter === 'career') return FILTER_CATEGORIES.career.some(k => cat.includes(k));
    if (filter === 'system') return FILTER_CATEGORIES.system.some(k => cat.includes(k));
    return true;
  });

  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (FILTER_CATEGORIES.schemes.some(k => c.includes(k))) {
      return (
        <div className="w-10 h-10 rounded-xl bg-green-100 border border-green-200 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-green-600" />
        </div>
      );
    }
    if (c.includes('urgent') || c.includes('deadline') || c.includes('alert')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
      );
    }
    if (FILTER_CATEGORIES.career.some(k => c.includes(k))) {
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
          <BriefcaseBusiness className="w-5 h-5 text-blue-600" />
        </div>
      );
    }
    if (c.includes('education') || c.includes('study') || c.includes('learn') || c.includes('course')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-indigo-600" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
        <Sparkles className="w-5 h-5 text-purple-600" />
      </div>
    );
  };

  const getCategoryBadge = (cat: string) => {
    const c = cat.toLowerCase();
    if (FILTER_CATEGORIES.schemes.some(k => c.includes(k))) {
      return <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] font-bold"><ShieldCheck className="w-3 h-3 mr-1" />Govt Scheme</Badge>;
    }
    if (c.includes('urgent') || c.includes('deadline')) {
      return <Badge className="bg-red-100 text-red-800 border-red-200 text-[10px] font-bold animate-pulse"><AlertCircle className="w-3 h-3 mr-1" />Urgent</Badge>;
    }
    if (FILTER_CATEGORIES.career.some(k => c.includes(k))) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] font-bold"><BriefcaseBusiness className="w-3 h-3 mr-1" />Career & Skills</Badge>;
    }
    if (c.includes('education') || c.includes('study') || c.includes('course')) {
      return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-[10px] font-bold"><GraduationCap className="w-3 h-3 mr-1" />Education</Badge>;
    }
    return <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px] font-bold"><Sparkles className="w-3 h-3 mr-1" />System</Badge>;
  };

  const timeRefreshed = lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Language-aware labels
  const labels: Record<string, Record<string, string>> = {
    en: {
      title: 'Citizen Notifications & Official Alerts',
      subtitle: 'Real-time updates on government schemes, career progress, study milestones, and portal alerts.',
      markAllRead: 'Mark All Read',
      clearAll: 'Clear All',
      allAlerts: 'All',
      unread: 'Unread',
      schemes: 'Schemes',
      career: 'Career',
      system: 'System',
      showing: 'Showing',
      of: 'of',
      allClear: "You're all caught up!",
      noneInCategory: 'No notifications in this category yet.',
      viewAll: 'View All Notifications',
      refreshed: 'Refreshed at',
    },
    hi: {
      title: 'नागरिक सूचनाएं और आधिकारिक अलर्ट',
      subtitle: 'सरकारी योजनाओं, करियर प्रगति, अध्ययन और पोर्टल अलर्ट के रियल-टाइम अपडेट।',
      markAllRead: 'सभी पढ़ें',
      clearAll: 'सभी हटाएं',
      allAlerts: 'सभी',
      unread: 'अपठित',
      schemes: 'योजनाएं',
      career: 'करियर',
      system: 'सिस्टम',
      showing: 'दिखाया जा रहा है',
      of: 'में से',
      allClear: 'सब अपडेट हैं!',
      noneInCategory: 'इस श्रेणी में कोई सूचना नहीं।',
      viewAll: 'सभी सूचनाएं देखें',
      refreshed: 'ताज़ा किया गया',
    },
  };
  const L = labels[language as 'en' | 'hi'] || labels.en;

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
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2B5B]">
                  {L.title}
                </h1>
                {unreadCount > 0 && (
                  <Badge className="bg-[#F97316] text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full animate-pulse">
                    {unreadCount} New
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{L.subtitle}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                {L.refreshed} {timeRefreshed} · Auto-refreshes every 20s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotifications}
              className="rounded-xl border-gray-300 hover:border-[#1D4ED8] hover:bg-[#EFF6FF] text-xs font-bold text-[#0F2B5B] flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#1D4ED8]" />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="rounded-xl border-gray-300 hover:border-[#1D4ED8] hover:bg-[#EFF6FF] text-xs font-bold text-[#0F2B5B] flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4 text-[#1D4ED8]" />
                {L.markAllRead}
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
                {L.clearAll}
              </Button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3 rounded-2xl border border-slate-300 shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {([
              { key: 'all', label: `${L.allAlerts} (${notifications.length})`, color: 'bg-[#0F2B5B]' },
              { key: 'unread', label: `${L.unread} (${unreadCount})`, color: 'bg-[#F97316]' },
              { key: 'schemes', label: L.schemes, color: 'bg-green-600' },
              { key: 'career', label: L.career, color: 'bg-blue-600' },
              { key: 'system', label: L.system, color: 'bg-purple-600' },
            ] as const).map(btn => (
              <Button
                key={btn.key}
                size="sm"
                variant={filter === btn.key ? 'default' : 'ghost'}
                onClick={() => setFilter(btn.key)}
                className={`rounded-xl text-xs font-bold shrink-0 ${
                  filter === btn.key ? `${btn.color} text-white` : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {btn.label}
              </Button>
            ))}
          </div>
          <span className="text-xs text-gray-400 font-semibold hidden md:inline">
            {L.showing} {filteredNotifications.length} {L.of} {notifications.length}
          </span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-300">
            <RefreshCw className="w-8 h-8 animate-spin text-[#1D4ED8] mb-3" />
            <p className="text-sm font-bold text-gray-600">Loading your notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="border border-slate-300 rounded-[20px] bg-white text-center py-16 shadow-sm">
            <div className="space-y-3">
              <div className="w-16 h-16 bg-[#EFF6FF] rounded-full flex items-center justify-center mx-auto text-[#1D4ED8]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#0F2B5B]">No Notifications Found</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto px-6">
                {filter === 'unread' ? L.allClear : L.noneInCategory}
              </p>
              {filter !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="mt-2 rounded-xl text-xs font-bold text-[#0F2B5B]"
                >
                  {L.viewAll}
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-3.5">
            {filteredNotifications.map((notif) => (
              <Card
                key={notif.id}
                className={`border rounded-2xl transition-all shadow-sm hover:shadow-md ${
                  notif.unread
                    ? 'border-l-4 border-l-[#F97316] border-slate-300 bg-[#FFFBEB]/30'
                    : 'border-slate-300 bg-white opacity-95'
                }`}
              >
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {getCategoryIcon(notif.category)}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                          {getCategoryBadge(notif.category)}
                          {notif.unread && (
                            <span className="w-2 h-2 rounded-full bg-[#F97316] shrink-0" title="Unread" />
                          )}
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
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
