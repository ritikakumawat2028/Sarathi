import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAuth } from '@/app/context/AuthContext';
import { Header } from '@/app/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { 
  BookOpen, Calendar, Heart, MessageCircle, Brain,
  CheckCircle, TrendingUp, Clock, Target, Plus, Trash2,
  Smile, Laugh, Meh, Frown, AlertCircle, Loader2, Sparkles,
  HelpCircle
} from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { toast } from 'sonner';
import { api } from '@/app/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface StudyPlanItem {
  _id: string;
  time: string;
  subject: string;
  topic: string;
  completed: boolean;
  createdAt: string;
}

interface DoubtItem {
  _id: string;
  question: string;
  subject: string;
  answer: string;
  status: 'pending' | 'answered';
  createdAt: string;
}

interface WellnessLogItem {
  _id: string;
  mood: string;
  note: string;
  createdAt: string;
}

interface UserStats {
  studySessions: number;
  totalStudyPlans: number;
  completedStudyPlans: number;
  studyProgressPercentage: number;
  solvedDoubtsCount: number;
  moodLogsCount: number;
}

const MOOD_EMOJIS = [
  { emoji: '😊', label: 'Happy', color: 'hover:bg-green-50 border-green-200 text-green-600' },
  { emoji: '😌', label: 'Calm', color: 'hover:bg-blue-50 border-blue-200 text-blue-600' },
  { emoji: '😐', label: 'Neutral', color: 'hover:bg-gray-50 border-gray-200 text-gray-600' },
  { emoji: '😔', label: 'Sad', color: 'hover:bg-amber-50 border-amber-200 text-amber-600' },
  { emoji: '😰', label: 'Stressed', color: 'hover:bg-red-50 border-red-200 text-red-600' },
];

export function StudentSupport() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  // State arrays loaded from MongoDB
  const [studyPlan, setStudyPlan] = useState<StudyPlanItem[]>([]);
  const [doubts, setDoubts] = useState<DoubtItem[]>([]);
  const [wellnessLogs, setWellnessLogs] = useState<WellnessLogItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);

  // Loaders
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingDoubts, setLoadingDoubts] = useState(true);
  const [loadingWellness, setLoadingWellness] = useState(true);

  // Form states
  const [newSubject, setNewSubject] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newTime, setNewTime] = useState('');
  const [addingPlan, setAddingPlan] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);

  // Doubt form states
  const [doubtSubject, setDoubtSubject] = useState('');
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [askingDoubt, setAskingDoubt] = useState(false);

  // Wellness form states
  const [selectedMood, setSelectedMood] = useState('');
  const [wellnessNote, setWellnessNote] = useState('');
  const [savingWellness, setSavingWellness] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchStudyPlans();
    fetchDoubts();
    fetchWellnessLogs();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get<{ stats: UserStats }>('/user/stats');
      setStats(res.stats);
    } catch {}
  };

  const fetchStudyPlans = async () => {
    setLoadingPlan(true);
    try {
      const res = await api.get<{ studyPlans: StudyPlanItem[] }>('/user/study-plans');
      setStudyPlan(res.studyPlans || []);
    } catch {
      toast.error('Failed to load study plan');
    } finally {
      setLoadingPlan(false);
    }
  };

  const fetchDoubts = async () => {
    setLoadingDoubts(true);
    try {
      const res = await api.get<{ doubts: DoubtItem[] }>('/user/doubts');
      setDoubts((res.doubts || []).reverse()); // Show latest doubts first
    } catch {
      toast.error('Failed to load doubts');
    } finally {
      setLoadingDoubts(false);
    }
  };

  const fetchWellnessLogs = async () => {
    setLoadingWellness(true);
    try {
      const res = await api.get<{ wellnessLog: WellnessLogItem[] }>('/user/wellness');
      setWellnessLogs((res.wellnessLog || []).reverse());
    } catch {
      toast.error('Failed to load mood check-ins');
    } finally {
      setLoadingWellness(false);
    }
  };

  // Add Study Plan Item
  const handleAddStudyPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newTopic.trim()) {
      toast.error('Please enter subject and topic');
      return;
    }
    setAddingPlan(true);
    try {
      const res = await api.post<{ studyPlans: StudyPlanItem[] }>('/user/study-plans', {
        time: newTime || 'Flexible Time',
        subject: newSubject.trim(),
        topic: newTopic.trim(),
      });
      setStudyPlan(res.studyPlans || []);
      toast.success('Study plan added!');
      setIsPlanDialogOpen(false);
      setNewSubject('');
      setNewTopic('');
      setNewTime('');
      fetchStats();
    } catch {
      toast.error('Failed to create study plan');
    } finally {
      setAddingPlan(false);
    }
  };

  // Toggle Completion
  const handleTogglePlan = async (planId: string) => {
    try {
      const res = await api.put<{ studyPlans: StudyPlanItem[] }>(`/user/study-plans/${planId}`, {});
      setStudyPlan(res.studyPlans || []);
      toast.success('Progress updated!');
      fetchStats();
    } catch {
      toast.error('Failed to update progress');
    }
  };

  // Delete Plan Item
  const handleDeletePlan = async (planId: string) => {
    try {
      const res = await api.del<{ studyPlans: StudyPlanItem[] }>(`/user/study-plans/${planId}`);
      setStudyPlan(res.studyPlans || []);
      toast.success('Plan deleted');
      fetchStats();
    } catch {
      toast.error('Failed to delete plan item');
    }
  };

  // Submit Doubt to AI (Inline Solving)
  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtQuestion.trim()) {
      toast.error('Please write a question');
      return;
    }
    setAskingDoubt(true);
    try {
      const res = await api.post<{ doubts: DoubtItem[] }>('/user/doubts', {
        question: doubtQuestion.trim(),
        subject: doubtSubject.trim() || 'General',
      });
      setDoubts((res.doubts || []).reverse());
      toast.success('AI solved your doubt!');
      setDoubtQuestion('');
      setDoubtSubject('');
      fetchStats();
    } catch {
      toast.error('Doubt solver failed. Please try again.');
    } finally {
      setAskingDoubt(false);
    }
  };

  // Submit Wellness / Mood
  const handleLogWellness = async () => {
    if (!selectedMood) {
      toast.error('Please pick a mood emoji');
      return;
    }
    setSavingWellness(true);
    try {
      const res = await api.post<{ wellnessLog: WellnessLogItem[] }>('/user/wellness', {
        mood: selectedMood,
        note: wellnessNote.trim(),
      });
      setWellnessLogs((res.wellnessLog || []).reverse());
      toast.success('Mood logged! Thank you for check-in.');
      setSelectedMood('');
      setWellnessNote('');
      fetchStats();
    } catch {
      toast.error('Failed to log mood');
    } finally {
      setSavingWellness(false);
    }
  };

  // Calculate subject progress dynamically from custom plan
  const subjectsList = studyPlan.length > 0 
    ? Array.from(new Set(studyPlan.map(p => p.subject))) 
    : ['Mathematics', 'Science', 'English', 'Social Studies'];

  const getSubjectProgress = (sub: string) => {
    const subPlans = studyPlan.filter(p => p.subject.toLowerCase() === sub.toLowerCase());
    if (subPlans.length === 0) return 0;
    const completed = subPlans.filter(p => p.completed).length;
    return Math.round((completed / subPlans.length) * 100);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF8F2' }}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #1E3A8A, #3B5BBD)' }}>
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            {t('studentSupport')}
          </h1>
          <p className="text-gray-500">Your live AI-powered study guide and mental wellness companion</p>
        </div>

        <Tabs defaultValue="planner" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="planner" className="gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{t('studyPlanner')}</span>
            </TabsTrigger>
            <TabsTrigger value="doubts" className="gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>Doubt Solver</span>
            </TabsTrigger>
            <TabsTrigger value="wellness" className="gap-1.5">
              <Heart className="w-4 h-4" />
              <span>Wellness & Mood</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>Progress Tracker</span>
            </TabsTrigger>
          </TabsList>

          {/* ── STUDY PLANNER TAB ────────────────────────────────────────── */}
          <TabsContent value="planner" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Today's Schedule */}
              <Card className="border lg:col-span-2" style={{ borderColor: 'rgba(30,58,138,0.15)' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      <Clock className="w-5 h-5 text-indigo-600" /> Study Schedule
                    </CardTitle>
                    <CardDescription>Customized topics and schedules created by you</CardDescription>
                  </div>

                  {/* Add plan dialog */}
                  <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="text-white gap-1 shadow-sm" style={{ background: 'linear-gradient(135deg, #E8720C, #F59E0B)' }}>
                        <Plus className="w-4 h-4" /> Create Custom Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Study Task</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddStudyPlan} className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label>Subject</Label>
                          <Input placeholder="e.g. Mathematics, Science" value={newSubject} onChange={e => setNewSubject(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Topic</Label>
                          <Input placeholder="e.g. Quadratic equations formulas" value={newTopic} onChange={e => setNewTopic(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Time slot / Duration</Label>
                          <Input placeholder="e.g. 06:00 AM - 07:00 AM" value={newTime} onChange={e => setNewTime(e.target.value)} />
                        </div>
                        <Button type="submit" className="w-full text-white font-semibold" style={{ background: 'linear-gradient(135deg, #E8720C, #F59E0B)' }} disabled={addingPlan}>
                          {addingPlan ? 'Saving...' : 'Add Study Task'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loadingPlan ? (
                    <div className="text-center py-8 text-gray-400 gap-2 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" /> Loading schedule...
                    </div>
                  ) : studyPlan.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed rounded-xl">
                      <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-500">Your study planner is empty. Create a plan above!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {studyPlan.map((item) => (
                        <div
                          key={item._id}
                          className={`p-3.5 rounded-xl border flex items-center justify-between transition-all hover:shadow-sm ${
                            item.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => handleTogglePlan(item._id)}
                              className="w-4 h-4 rounded mt-1 accent-green-600 cursor-pointer"
                            />
                            <div className="min-w-0">
                              <p className={`font-semibold text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                {item.subject}
                              </p>
                              <p className={`text-xs ${item.completed ? 'text-gray-400' : 'text-gray-600'}`}>{item.topic}</p>
                              <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 font-medium">
                                <Clock className="w-3 h-3" /> {item.time}
                              </span>
                            </div>
                          </div>

                          <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeletePlan(item._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subject Progress */}
              <Card className="border lg:col-span-1" style={{ borderColor: 'rgba(30,58,138,0.15)' }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <Target className="w-5 h-5 text-indigo-600" /> Subject Progress
                  </CardTitle>
                  <CardDescription>Real tracker based on completed tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subjectsList.map((subject) => {
                    const progress = getSubjectProgress(subject);
                    return (
                      <div key={subject} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-gray-700">{subject}</span>
                          <span className="font-bold text-indigo-600">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* AI Study recommendation card */}
            <Card className="border bg-gradient-to-r from-blue-50 to-indigo-50" style={{ borderColor: 'rgba(30,58,138,0.15)' }}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #1E3A8A, #3B5BBD)' }}>
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>AI Study Coach Guidance</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      {stats && stats.studyProgressPercentage < 50 
                        ? 'You have some pending study tasks in your queue. Try completing one subject block today to keep your daily study streak alive!'
                        : 'Great progress this week! Focus more on practicing formulas in Mathematics and chemistry processes in Science.'}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => navigate('/chat')} className="gap-1 border-indigo-200 hover:bg-white text-indigo-700">
                      <Sparkles className="w-4 h-4 text-indigo-600" /> Ask AI for study tips
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── DOUBT SOLVING TAB (INLINE AI RESPONSE) ─────────────────── */}
          <TabsContent value="doubts" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Ask Doubt panel */}
              <Card className="border lg:col-span-1" style={{ borderColor: 'rgba(30,58,138,0.15)' }}>
                <CardHeader>
                  <CardTitle className="text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>Ask AI Doubt Solver</CardTitle>
                  <CardDescription>Get step-by-step explanations instantly without redirection</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAskDoubt} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Select value={doubtSubject} onValueChange={setDoubtSubject}>
                        <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                        <SelectContent>
                          {subjectsList.map((sub) => (
                            <SelectItem key={sub} value={sub}>
                              📚 {sub}
                            </SelectItem>
                          ))}
                          <SelectItem value="General">💡 General Doubt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Your Question *</Label>
                      <textarea
                        className="w-full h-32 p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                        placeholder="e.g. How to solve quadratic equations? / Explain photosynthesis in detail."
                        value={doubtQuestion}
                        onChange={e => setDoubtQuestion(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full text-white font-semibold" style={{ background: 'linear-gradient(135deg, #1E3A8A, #3B5BBD)' }} disabled={askingDoubt}>
                      {askingDoubt ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Solving...</> : 'Ask AI Solver'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Resolved doubts feed */}
              <Card className="border lg:col-span-2" style={{ borderColor: 'rgba(30,58,138,0.15)' }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <MessageCircle className="w-5 h-5 text-indigo-600" /> Resolved Doubts
                  </CardTitle>
                  <CardDescription>Your educational Q&A history solved by Sarthi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingDoubts ? (
                    <div className="text-center py-8 text-gray-400 gap-2 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" /> Loading doubts history...
                    </div>
                  ) : doubts.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-25" />
                      <p>Ask your first homework question to see instant explanations here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                      {doubts.map((doubt) => (
                        <div key={doubt._id} className="p-4 border rounded-xl bg-white space-y-2 shadow-sm" style={{ borderColor: 'rgba(30,58,138,0.08)' }}>
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{doubt.subject}</span>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">✓ AI Answered</Badge>
                          </div>
                          <p className="font-bold text-sm text-gray-800">Q: {doubt.question}</p>
                          <div className="p-3 bg-gray-50 rounded-lg text-xs leading-relaxed text-gray-700 whitespace-pre-line border border-gray-100">
                            {doubt.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── MENTAL HEALTH & WELLNESS TAB ───────────────────────────── */}
          <TabsContent value="wellness" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Log Mood Panel */}
              <Card className="border lg:col-span-1" style={{ borderColor: 'rgba(232,114,12,0.15)' }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <Smile className="w-5 h-5 text-orange-500" /> Mood Log Check-in
                  </CardTitle>
                  <CardDescription>Log your current emotional state just for fun time!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="block mb-2 font-medium">Select your current mood:</Label>
                    <div className="flex justify-between items-center gap-2">
                      {MOOD_EMOJIS.map(m => (
                        <button
                          key={m.emoji}
                          type="button"
                          onClick={() => setSelectedMood(m.emoji)}
                          className={`text-3xl p-2.5 rounded-xl border-2 transition-all hover:scale-110 flex-1 flex flex-col items-center gap-1 ${m.color} ${
                            selectedMood === m.emoji ? 'border-orange-500 bg-orange-50 scale-105 shadow-sm' : 'border-gray-100 bg-white'
                          }`}
                        >
                          <span>{m.emoji}</span>
                          <span className="text-[9px] font-bold text-gray-500">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Optional check-in note</Label>
                    <Input
                      placeholder="e.g. Feeling motivated to study / a bit tired today"
                      value={wellnessNote}
                      onChange={e => setWellnessNote(e.target.value)}
                    />
                  </div>

                  <Button
                    className="w-full text-white font-semibold"
                    style={{ background: 'linear-gradient(135deg, #E8720C, #F59E0B)' }}
                    onClick={handleLogWellness}
                    disabled={savingWellness}
                  >
                    {savingWellness ? 'Saving...' : 'Submit Mood Check-in'}
                  </Button>
                </CardContent>
              </Card>

              {/* Mood history log */}
              <Card className="border lg:col-span-2" style={{ borderColor: 'rgba(232,114,12,0.15)' }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <Heart className="w-5 h-5 text-orange-500" /> Mood Check-in History
                  </CardTitle>
                  <CardDescription>Track your emotional wellness over study weeks</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingWellness ? (
                    <div className="text-center py-8 text-gray-400 gap-2 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" /> Loading logs...
                    </div>
                  ) : wellnessLogs.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <Meh className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p>No wellness entries yet. Submit your current mood on the left!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {wellnessLogs.map((log) => (
                        <div key={log._id} className="p-3 border rounded-xl bg-white flex items-center gap-4 shadow-sm border-orange-50">
                          <div className="text-3xl bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                            {log.mood}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">
                              {log.note || `Checked in feeling ${MOOD_EMOJIS.find(m => m.emoji === log.mood)?.label || 'Good'}`}
                            </p>
                            <span className="text-[10px] text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* General Mental Wellness Tips */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {[
                { icon: '🧘', title: 'Take Regular Breaks', desc: 'Study 45 mins using Pomodoro method, then stretch.' },
                { icon: '💧', title: 'Stay Hydrated', desc: 'Dehydration leads to loss of concentration. Keep water close!' },
                { icon: '😴', title: 'Sleep 7-8 Hours', desc: 'Rest consolidates your memory of topics you studied.' },
                { icon: '🏃', title: 'Light Activity', desc: 'Jogging or walking boosts circulation and releases dopamine.' },
              ].map((tip, idx) => (
                <Card key={idx} className="border border-orange-100 hover:shadow-md transition-shadow">
                  <CardContent className="pt-5 flex gap-3">
                    <span className="text-3xl flex-shrink-0">{tip.icon}</span>
                    <div>
                      <h4 className="font-bold text-xs text-gray-800 mb-1">{tip.title}</h4>
                      <p className="text-[11px] text-gray-500 leading-snug">{tip.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── PROGRESS TRACKER TAB ────────────────────────────────────── */}
          <TabsContent value="progress" className="space-y-6">
            {stats && (
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border" style={{ borderColor: 'rgba(30,58,138,0.15)' }}>
                  <CardContent className="pt-6 text-center">
                    <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-7 h-7 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold mb-1" style={{ color: '#10B981', fontFamily: 'Outfit, sans-serif' }}>
                      {stats.studySessions}
                    </p>
                    <p className="text-sm font-semibold text-gray-700">Study Sessions Completed</p>
                    <p className="text-xs text-gray-400 mt-1">Based on tasks marked done</p>
                  </CardContent>
                </Card>

                <Card className="border" style={{ borderColor: 'rgba(30,58,138,0.15)' }}>
                  <CardContent className="pt-6 text-center">
                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <HelpCircle className="w-7 h-7 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold mb-1" style={{ color: '#1E3A8A', fontFamily: 'Outfit, sans-serif' }}>
                      {stats.solvedDoubtsCount}
                    </p>
                    <p className="text-sm font-semibold text-gray-700">Doubt Solved Logs</p>
                    <p className="text-xs text-gray-400 mt-1">Homework questions answered by AI</p>
                  </CardContent>
                </Card>

                <Card className="border" style={{ borderColor: 'rgba(30,58,138,0.15)' }}>
                  <CardContent className="pt-6 text-center">
                    <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Smile className="w-7 h-7 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold mb-1" style={{ color: '#8B5CF6', fontFamily: 'Outfit, sans-serif' }}>
                      {stats.moodLogsCount}
                    </p>
                    <p className="text-sm font-semibold text-gray-700">Mood Check-ins logged</p>
                    <p className="text-xs text-gray-400 mt-1">Daily self wellness checks</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Custom progress log bar */}
            <Card className="border" style={{ borderColor: 'rgba(30,58,138,0.15)' }}>
              <CardHeader>
                <CardTitle className="text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>Total Study Completion Progress</CardTitle>
                <CardDescription>Calculated in real-time from your planner items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats && (
                  <div>
                    <div className="flex justify-between items-center text-sm font-semibold mb-2">
                      <span>Overall Progress</span>
                      <span style={{ color: '#1E3A8A' }}>{stats.studyProgressPercentage}%</span>
                    </div>
                    <Progress value={stats.studyProgressPercentage} className="h-3" />
                  </div>
                )}

                <div className="rounded-xl p-4 border text-sm text-gray-600 bg-gray-50">
                  <p className="font-semibold mb-1 flex items-center gap-1.5" style={{ color: '#1E3A8A' }}>
                    <AlertCircle className="w-4 h-4" /> Live Tracking Info
                  </p>
                  Every time you write a new study task in the "Study Planner" and mark it as completed, your progress stats adjust dynamically. 
                  Similarly, asking AI doubt solver updates your doubts log, keeping all metrics persistent in MongoDB.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
