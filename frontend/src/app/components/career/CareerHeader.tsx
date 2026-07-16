import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { 
  Sparkles, 
  FileText, 
  Briefcase, 
  Award, 
  Map, 
  TrendingUp, 
  Target, 
  CheckCircle2 
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';

interface CareerHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  readinessScore?: number;
  userName?: string;
}

export function CareerHeader({
  activeTab,
  onTabChange,
  readinessScore = 84,
  userName = 'Explorer'
}: CareerHeaderProps) {
  const { language } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 text-white border-b border-indigo-800/40 shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Greeting & Title */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                <span>{language === 'hi' ? 'AI करियर कोच व मार्गदर्शन' : 'AI Career Coach & Platform'}</span>
              </span>
              <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 text-xs">
                {language === 'hi' ? 'वर्तमान लक्ष्य: फुल स्टैक / AI इंजीनियर' : 'Current Goal: Full Stack / AI Engineer'}
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {language === 'hi' ? `नमस्ते, ${userName}!` : `Hello, ${userName}! Let's Accelerate Your Career`}
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-2xl">
              {language === 'hi'
                ? 'कौशल का विश्लेषण करें, ATS रेज़्यूमे तैयार करें, AI के साथ इंटरव्यू की प्रैक्टिस करें, और शीर्ष नौकरियां खोजें।'
                : 'Discover intelligent career roadmaps, practice AI mock interviews, build ATS-optimized resumes, and unlock high-growth jobs & internships.'}
            </p>
          </div>

          {/* Career Progress Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 min-w-[280px] sm:min-w-[340px] shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span>{language === 'hi' ? 'करियर तत्परता स्कोर' : 'Career Readiness Score'}</span>
              </span>
              <span className="text-2xl font-extrabold text-green-400">{readinessScore}%</span>
            </div>

            <Progress value={readinessScore} className="h-2.5 bg-white/20 mb-3" />

            <div className="flex items-center justify-between text-xs text-gray-300 font-medium">
              <span>{language === 'hi' ? 'स्तर: जॉब रेडी (शीर्ष 15%)' : 'Level: Job Ready (Top 15%)'}</span>
              <span className="text-indigo-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                <span>4 Courses Completed</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">
            {language === 'hi' ? 'त्वरित कार्रवाई:' : 'Quick Actions:'}
          </span>

          <Button
            size="sm"
            onClick={() => onTabChange('resume')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'रेज़्यूमे समीक्षा' : 'Resume Review'}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onTabChange('coach')}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>{language === 'hi' ? 'AI करियर चैट' : 'AI Career Chat'}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onTabChange('jobs')}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-semibold rounded-xl flex items-center gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'इंटर्नशिप खोजें' : 'Find Internship'}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onTabChange('skills')}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-semibold rounded-xl flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'कौशल मूल्यांकन' : 'Skill Assessment'}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onTabChange('roadmap')}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-semibold rounded-xl flex items-center gap-1.5"
          >
            <Map className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'रोडमैप' : 'Roadmap'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
