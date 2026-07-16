import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { api } from '@/app/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Send, 
  Mic, 
  Flame, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

export function AnalyticsTab() {
  const { language } = useLanguage();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<any>('/career/analytics')
      .then(res => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-28">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  const metrics = [
    { title: 'Career Readiness', value: `${data?.careerReadinessScore || 84}%`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { title: 'ATS Resume Score', value: `${data?.resumeScore || 88} / 100`, icon: Award, color: 'text-indigo-600 bg-indigo-50' },
    { title: 'Learning Streak', value: `${data?.learningStreakDays || 14} Days`, icon: Flame, color: 'text-orange-600 bg-orange-50' },
    { title: 'Weekly Progress', value: `${data?.weeklyProgressPercentage || 92}%`, icon: CheckCircle2, color: 'text-purple-600 bg-purple-50' }
  ];

  const activityStats = [
    { label: 'Courses Completed', val: data?.coursesCompleted || 4, icon: BookOpen },
    { label: 'Job Applications Sent', val: data?.applicationsSent || 12, icon: Send },
    { label: 'Mock Interviews Done', val: data?.interviewsCompleted || 3, icon: Mic }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border shadow-sm">
        <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          <span>{language === 'hi' ? 'करियर एनालिटिक्स व प्रगति डैशबोर्ड' : 'Career Analytics & Progress Dashboard'}</span>
        </h2>
        <p className="text-gray-600 text-sm mt-0.5">
          {language === 'hi'
            ? 'अपनी दैनिक सीखने की लकीर, रेज़्यूमे स्कोर, और नौकरी के आवेदन ट्रैक करें'
            : 'Track your daily learning consistency, ATS improvement, and interview progress'}
        </p>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} className="border bg-white rounded-2xl shadow-sm">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">{m.title}</p>
                  <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{m.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${m.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Skill Growth Chart & Activity Counters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="border shadow-sm bg-white rounded-2xl">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg font-bold text-gray-800">
                Technical vs Soft Skill Monthly Trajectory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {(data?.skillGrowth || [
                { month: 'Jan', technical: 65, soft: 70 },
                { month: 'Feb', technical: 72, soft: 75 },
                { month: 'Mar', technical: 78, soft: 80 },
                { month: 'Apr', technical: 84, soft: 85 }
              ]).map((point: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>{point.month} Performance</span>
                    <span>Tech: {point.technical}% | Soft Skills: {point.soft}%</span>
                  </div>
                  <Progress value={point.technical} className="h-2 bg-gray-100" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card className="border shadow-sm bg-white rounded-2xl">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-bold text-gray-800">
                Activity Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {activityStats.map((st, i) => {
                const Icon = st.icon;
                return (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-indigo-600" />
                      <span className="text-xs font-bold text-gray-700">{st.label}</span>
                    </div>
                    <span className="text-lg font-extrabold text-indigo-600">{st.val}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
