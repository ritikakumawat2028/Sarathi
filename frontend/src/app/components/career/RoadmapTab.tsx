import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { api } from '@/app/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { 
  Navigation, 
  Sparkles, 
  CheckCircle2, 
  Code, 
  Award, 
  Building2, 
  Loader2, 
  RefreshCw 
} from 'lucide-react';

export function RoadmapTab() {
  const { language } = useLanguage();
  const [targetRole, setTargetRole] = useState('Python & AI Engineer');
  const [currentLevel, setCurrentLevel] = useState('Intermediate');
  const [roadmap, setRoadmap] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const generateRoadmap = async () => {
    setLoading(true);
    try {
      const res = await api.post<any>('/career/roadmap', {
        targetRole,
        currentLevel
      });
      setRoadmap(res);
    } catch {
      setRoadmap(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateRoadmap();
  }, [targetRole, currentLevel]);

  return (
    <div className="space-y-6">
      {/* Header & Role Selector */}
      <div className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Navigation className="w-6 h-6 text-indigo-600" />
            <span>{language === 'hi' ? 'व्यक्तिगत लर्निंग रोडमैप जनरेटर' : 'Personalized AI Learning Roadmap'}</span>
          </h2>
          <p className="text-gray-600 text-sm mt-0.5">
            {language === 'hi'
              ? 'महीने-दर-महीने का संरचित रोडमैप, प्रोजेक्ट्स और इंटरव्यू तैयारी'
              : 'Detailed Month 1, Month 2, Month 3 timeline tailored to your target role'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-300 text-sm font-semibold bg-white"
          >
            <option value="Python & AI Engineer">Python & AI Engineer</option>
            <option value="Full Stack Software Engineer">Full Stack Engineer</option>
            <option value="Data Scientist & ML Engineer">Data Scientist & ML Engineer</option>
            <option value="Cyber Security Analyst">Cyber Security Analyst</option>
          </select>

          <select
            value={currentLevel}
            onChange={(e) => setCurrentLevel(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-300 text-sm font-semibold bg-white"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <Button
            size="sm"
            onClick={generateRoadmap}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 bg-white rounded-2xl border">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
          <p className="font-bold text-gray-700">AI is architecting your custom learning roadmap...</p>
        </div>
      ) : !roadmap ? (
        <div className="text-center py-20 bg-white rounded-2xl border p-8">
          <p className="text-gray-500 font-bold">Failed to generate roadmap. Click Regenerate above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Months Accordion / Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {roadmap.months?.map((m: any, mIdx: number) => (
              <Card key={mIdx} className="border-2 border-indigo-200 bg-white rounded-2xl shadow-sm flex flex-col justify-between">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b pb-4">
                  <Badge className="bg-indigo-600 text-white font-bold self-start mb-2">
                    Month #{mIdx + 1}
                  </Badge>
                  <CardTitle className="text-lg font-extrabold text-gray-900">
                    {m.month}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4 flex-1">
                  {m.weeks?.map((w: any, wIdx: number) => (
                    <div key={wIdx} className="p-3.5 rounded-xl border bg-gray-50/70">
                      <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        <span>{w.title}</span>
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">{w.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recommended Projects & Target Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border shadow-sm bg-white rounded-2xl">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-600" />
                  <span>Portfolio Projects to Build & Deploy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {roadmap.recommendedProjects?.map((proj: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl border bg-indigo-50/50">
                    <h4 className="font-bold text-gray-900 text-sm">{proj.name}</h4>
                    <p className="text-xs text-indigo-800 font-medium mt-0.5">Tech Stack: {proj.tech}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border shadow-sm bg-white rounded-2xl">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span>Target Certifications & Companies</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Recommended Certifications:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {roadmap.certificationsToTarget?.map((c: string, i: number) => (
                      <Badge key={i} className="bg-purple-100 text-purple-800 text-xs">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Expected Compensation:</p>
                  <span className="text-xl font-extrabold text-green-700">{roadmap.expectedSalary}</span>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Top Hiring Employers:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {roadmap.hiringCompanies?.map((co: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {co}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
