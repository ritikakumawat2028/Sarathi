import React, { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { 
  Map, 
  TrendingUp, 
  Clock, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Award, 
  Code 
} from 'lucide-react';

export function CareerPathsTab() {
  const { language } = useLanguage();
  const [activeRoadmapRole, setActiveRoadmapRole] = useState<any | null>(null);

  const paths = [
    {
      title: 'Full Stack Software Engineer',
      salary: '₹8 LPA - ₹24 LPA',
      demand: 'Very High',
      growth: '+26%',
      timeToLearn: '6 Months',
      experienceNeeded: '0-2 Years',
      skills: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
      companies: ['Google', 'Microsoft', 'Amazon', 'Infosys', 'Zomato'],
      roadmapSummary: 'Frontend Mastery -> Backend APIs -> Database Scaling -> DevOps & AI Deployment'
    },
    {
      title: 'Python & AI Application Engineer',
      salary: '₹10 LPA - ₹28 LPA',
      demand: 'Very High',
      growth: '+38%',
      timeToLearn: '4-5 Months',
      experienceNeeded: '0-3 Years',
      skills: ['Python 3.12', 'FastAPI', 'Google Gemini API', 'RAG / Vector DB', 'Docker'],
      companies: ['Google India', 'Startups', 'Flipkart', 'TCS AI Labs'],
      roadmapSummary: 'Python Advanced -> Prompt Engineering -> RAG Vector Pipelines -> Production Deploy'
    },
    {
      title: 'Data Scientist & ML Engineer',
      salary: '₹9 LPA - ₹25 LPA',
      demand: 'High',
      growth: '+31%',
      timeToLearn: '6-8 Months',
      experienceNeeded: '1-3 Years',
      skills: ['Python', 'PyTorch', 'SQL', 'Feature Engineering', 'MLOps'],
      companies: ['Accenture', 'Wipro AI', 'Swiggy', 'PhonePe'],
      roadmapSummary: 'Statistics -> Supervised ML -> Deep Learning -> Fine-Tuning -> Model Deployment'
    },
    {
      title: 'Cyber Security & Cloud Defense Engineer',
      salary: '₹7 LPA - ₹20 LPA',
      demand: 'High',
      growth: '+24%',
      timeToLearn: '5 Months',
      experienceNeeded: '0-2 Years',
      skills: ['Network Protocols', 'Linux Admin', 'AWS Security', 'Penetration Testing'],
      companies: ['Cisco', 'Palo Alto', 'Infosys Cyber', 'HDFC Bank'],
      roadmapSummary: 'Network Fundamentals -> Linux Hardening -> Ethical Hacking -> Cloud IAM Defense'
    },
    {
      title: 'Government e-Governance IT Officer',
      salary: '₹8.5 LPA - ₹15 LPA (Govt Perks)',
      demand: 'Steady High',
      growth: '+15%',
      timeToLearn: '4 Months',
      experienceNeeded: 'Fresher / Qualified',
      skills: ['E-Governance Infrastructure', 'SQL Admin', 'National Cyber Standards'],
      companies: ['NIC', 'Digital India Corporation', 'State IT Depts'],
      roadmapSummary: 'Aptitude & GATE CS -> e-Governance Architecture -> Security Compliance -> Public Portal Management'
    },
    {
      title: 'Frontend React & UI/UX Specialist',
      salary: '₹6 LPA - ₹18 LPA',
      demand: 'High',
      growth: '+22%',
      timeToLearn: '3-4 Months',
      experienceNeeded: '0-2 Years',
      skills: ['React', 'Tailwind CSS', 'Figma Design Tokens', 'Web Vitals Performance'],
      companies: ['Razorpay', 'CRED', 'Flipkart', 'Freshworks'],
      roadmapSummary: 'Modern CSS & Animation -> React 19 Ecosystem -> Micro-Frontends -> Accessibility (a11y)'
    }
  ];

  if (activeRoadmapRole) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setActiveRoadmapRole(null)}>
            ← Back to All Career Paths
          </Button>
          <Badge className="bg-purple-100 text-purple-800 font-bold">
            Detailed Learning Timeline
          </Badge>
        </div>

        <Card className="border-2 border-indigo-200 bg-white rounded-2xl shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 mb-2">
                  Growth: {activeRoadmapRole.growth}
                </Badge>
                <h1 className="text-3xl font-extrabold">{activeRoadmapRole.title}</h1>
                <p className="text-indigo-200 text-sm mt-1">
                  Expected Salary: <strong className="text-white">{activeRoadmapRole.salary}</strong> • Time to Learn: <strong className="text-white">{activeRoadmapRole.timeToLearn}</strong>
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-8">
            {/* Week by Week Learning Timeline */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Map className="w-5 h-5 text-indigo-600" />
                <span>Week-by-Week Learning Roadmap Timeline</span>
              </h3>

              <div className="space-y-4">
                {[
                  { week: 'Weeks 1 - 3: Core Language & Architectural Patterns', detail: 'Master clean coding, async concurrency, strict typing, and object-oriented design.' },
                  { week: 'Weeks 4 - 6: Production APIs & Database Schema Engineering', detail: 'Build robust REST and GraphQL endpoints with PostgreSQL and Redis caching.' },
                  { week: 'Weeks 7 - 9: Google Gemini AI & Cloud Integration', detail: 'Embed generative LLM capabilities, function calling, and containerize via Docker.' },
                  { week: 'Weeks 10 - 12: Portfolio Capstone & Interview Readiness', detail: 'Deploy enterprise full-stack app, optimize ATS resume, and run mock technical rounds.' }
                ].map((step, idx) => (
                  <div key={idx} className="p-4 rounded-xl border-l-4 border-l-indigo-600 bg-gray-50/80 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{step.week}</h4>
                      <p className="text-sm text-gray-600 mt-0.5">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects & Certifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200">
                <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-600" />
                  <span>Capstone Portfolio Projects</span>
                </h4>
                <ul className="space-y-2 text-sm text-gray-800">
                  <li>• <strong>AI Career Assistant Platform</strong> — Built with React, Node, and Gemini API</li>
                  <li>• <strong>Real-time E-Governance Analytics Dashboard</strong> — Built with PostgreSQL & Docker</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Recommended Certifications</span>
                </h4>
                <ul className="space-y-2 text-sm text-gray-800">
                  <li>• Google Associate Cloud Engineer</li>
                  <li>• NPTEL Gold Certificate in Computer Science</li>
                  <li>• AWS Certified Solutions Architect</li>
                </ul>
              </div>
            </div>

            {/* Resume & Interview Preparation Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border bg-white">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span>Resume & ATS Tips</span>
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Include explicit keywords for this role: {activeRoadmapRole.skills.join(', ')}. Quantify project impact with percentages and attach GitHub demo links.
                </p>
              </div>

              <div className="p-5 rounded-2xl border bg-white">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <span>Top Hiring Companies</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeRoadmapRole.companies.map((co: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {co}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Map className="w-6 h-6 text-indigo-600" />
            <span>{language === 'hi' ? 'लोकप्रिय करियर मार्ग' : 'High-Demand Career Paths'}</span>
          </h2>
          <p className="text-gray-600 text-sm mt-0.5">
            {language === 'hi'
              ? 'वेतन, मांग, आवश्यक कौशल और विस्तृत साप्ताहिक रोडमैप देखें'
              : 'Explore salary expectations, required skills, hiring companies, and interactive weekly roadmaps'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paths.map((p, idx) => (
          <Card key={idx} className="border-2 border-gray-200 hover:border-indigo-500 transition-all bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-green-100 text-green-800 font-bold">
                    Demand: {p.demand}
                  </Badge>
                  <span className="text-xs font-extrabold text-indigo-600">{p.growth} Growth</span>
                </div>

                <h3 className="text-xl font-extrabold text-gray-900">
                  {p.title}
                </h3>
                <p className="text-sm font-bold text-indigo-700 mt-1">
                  Salary: {p.salary}
                </p>
              </div>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Time to Learn:</span>
                  <strong className="text-gray-900">{p.timeToLearn}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Experience Needed:</span>
                  <strong className="text-gray-900">{p.experienceNeeded}</strong>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Core Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {p.skills.map((skill, sIdx) => (
                    <Badge key={sIdx} variant="secondary" className="text-[11px] bg-indigo-50 text-indigo-800">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border text-xs text-gray-700">
                <p className="font-semibold text-gray-800 mb-0.5">Roadmap Path:</p>
                <p className="line-clamp-2">{p.roadmapSummary}</p>
              </div>
            </CardContent>

            <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Top companies: {p.companies.slice(0, 2).join(', ')}
              </span>
              <Button
                size="sm"
                onClick={() => setActiveRoadmapRole(p)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                <span>View Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
