import React, { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { 
  Award, 
  Sparkles, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  BookOpen, 
  ArrowRight, 
  Cpu 
} from 'lucide-react';

interface SkillsTabProps {
  onOpenRoadmap: () => void;
}

export function SkillsTab({ onOpenRoadmap }: SkillsTabProps) {
  const { language } = useLanguage();
  const [selectedSkill, setSelectedSkill] = useState<string | null>('AI Skills');

  const skills = [
    {
      name: 'AI Skills & Prompt Engineering',
      category: 'Technical',
      level: 85,
      levelLabel: 'Advanced',
      suggestion: 'Master function calling and RAG workflows with Google Gemini API.',
      courses: ['Google AI Essentials', 'Gemini Pro Developer Bootcamp'],
      resources: ['Google AI Studio Docs', 'Prompt Engineering Interactive Lab'],
      feedback: 'Excellent foundation! You are ready to build production agentic workflows.'
    },
    {
      name: 'Programming (Python / TypeScript)',
      category: 'Technical',
      level: 80,
      levelLabel: 'Advanced',
      suggestion: 'Practice async concurrency and design patterns for microservices.',
      courses: ['Full Stack React & TypeScript', 'Advanced Python Architecture'],
      resources: ['LeetCode 150 Core List', 'System Design Primer'],
      feedback: 'Strong syntax fluidity and clean architecture awareness.'
    },
    {
      name: 'Data Analysis & SQL',
      category: 'Technical',
      level: 70,
      levelLabel: 'Intermediate',
      suggestion: 'Optimize index performance and complex window functions in PostgreSQL.',
      courses: ['NPTEL Data Analytics', 'SQL Performance Tuning'],
      resources: ['SQLZoo Practice', 'Kaggle Dataset Challenges'],
      feedback: 'Good query mechanics; practice indexing large datasets.'
    },
    {
      name: 'Problem Solving & Algorithms',
      category: 'Soft Skills',
      level: 78,
      levelLabel: 'Intermediate',
      suggestion: 'Focus on dynamic programming and graph traversals under timed constraints.',
      courses: ['Algorithms & Data Structures Pro'],
      resources: ['HackerRank Competitions', 'NeetCode Roadmap'],
      feedback: 'High analytical speed; practice verbalizing trade-offs.'
    },
    {
      name: 'Communication & Technical Presentation',
      category: 'Soft Skills',
      level: 85,
      levelLabel: 'Advanced',
      suggestion: 'Consolidate executive summaries into concise 2-minute briefings.',
      courses: ['Executive Leadership & Communication'],
      resources: ['TED Talk Structure Analysis', 'Mock Interview Recordings'],
      feedback: 'Articulate and clear documentation style.'
    },
    {
      name: 'Leadership & Project Ownership',
      category: 'Soft Skills',
      level: 72,
      levelLabel: 'Intermediate',
      suggestion: 'Lead cross-functional code reviews and mentor junior peers.',
      courses: ['Agile Team Management & Scrum'],
      resources: ['GitHub Code Review Best Practices'],
      feedback: 'Great collaborative attitude with initiative.'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Overall Score Banner */}
      <Card className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white border-none shadow-xl">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Award className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 mb-2">
                {language === 'hi' ? 'समग्र करियर स्कोर' : 'Overall Career Score: 84 / 100'}
              </Badge>
              <h2 className="text-2xl font-extrabold">
                {language === 'hi' ? 'आप उद्योग के शीर्ष 15% उम्मीदवारों में हैं' : 'You rank in the Top 15% of Industry Candidates'}
              </h2>
              <p className="text-gray-300 text-sm mt-1">
                {language === 'hi'
                  ? 'तकनीकी और सॉफ्ट स्किल्स का बेहतरीन संतुलन। कुछ क्षेत्रों में सुधार से 95+ स्कोर संभव है।'
                  : 'Balanced technical mastery and communication. Addressing minor gaps in Cloud & Testing will push you above 90%.'}
              </p>
            </div>
          </div>

          <Button
            onClick={onOpenRoadmap}
            className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-bold px-6 py-6 rounded-xl shadow-lg shrink-0"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            <span>{language === 'hi' ? 'व्यक्तिगत लर्निंग प्लान बनाएं' : 'Generate Learning Plan'}</span>
          </Button>
        </CardContent>
      </Card>

      {/* Skills Assessment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {skills.map((s) => (
          <Card
            key={s.name}
            onClick={() => setSelectedSkill(s.name)}
            className={`cursor-pointer transition-all border-2 ${
              selectedSkill === s.name
                ? 'border-indigo-600 shadow-md bg-indigo-50/20'
                : 'border-gray-200 hover:border-indigo-300 bg-white'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="outline" className="text-xs text-indigo-700 border-indigo-200 mb-1">
                    {s.category}
                  </Badge>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    {s.name}
                  </CardTitle>
                </div>
                <span className="text-lg font-extrabold text-indigo-600">{s.level}%</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1 font-semibold">
                  <span>Proficiency: {s.levelLabel}</span>
                  <span>Target: 95%</span>
                </div>
                <Progress value={s.level} className="h-2.5" />
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700">
                <p className="font-bold text-gray-800 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>AI Feedback & Suggestion:</span>
                </p>
                <p>{s.suggestion}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-gray-500">Recommended Courses:</span>
                {s.courses.map((c, i) => (
                  <Badge key={i} variant="secondary" className="text-[11px] bg-indigo-50 text-indigo-800">
                    {c}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skill Gap Analysis Section */}
      <Card className="border-2 border-indigo-200 shadow-lg bg-white rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>{language === 'hi' ? 'स्किल गैप विश्लेषण (Skill Gap Analysis)' : 'Industry Skill Gap Analysis'}</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Strengths */}
          <div className="p-4 rounded-xl bg-green-50/70 border border-green-200">
            <h3 className="font-bold text-green-900 flex items-center gap-1.5 mb-3">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Key Strengths</span>
            </h3>
            <ul className="space-y-2 text-xs text-green-900 font-medium">
              <li>• Prompt Engineering & LLM API Integration</li>
              <li>• Full Stack React & TypeScript Architecture</li>
              <li>• Articulate Technical Communication</li>
              <li>• Agile Collaboration & Problem Solving</li>
            </ul>
          </div>

          {/* Weaknesses / Areas for Growth */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <h3 className="font-bold text-amber-900 flex items-center gap-1.5 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Areas to Strengthen</span>
            </h3>
            <ul className="space-y-2 text-xs text-amber-900 font-medium">
              <li>• Kubernetes & Container Orchestration</li>
              <li>• Automated E2E Testing (Playwright / Cypress)</li>
              <li>• High-concurrency Database Indexing</li>
              <li>• System Design Trade-off Verbalization</li>
            </ul>
          </div>

          {/* Future & Trending Skills */}
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
            <h3 className="font-bold text-purple-900 flex items-center gap-1.5 mb-3">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>Trending Future Skills</span>
            </h3>
            <ul className="space-y-2 text-xs text-purple-900 font-medium">
              <li>• Agentic AI & Autonomous Tool Execution</li>
              <li>• Vector Database Retrieval (RAG & PgVector)</li>
              <li>• Cloud-Native Microservices on AWS/Azure</li>
              <li>• Edge AI Deployment & Performance Tuning</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
