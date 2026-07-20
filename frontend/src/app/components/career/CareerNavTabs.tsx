import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { 
  Award, 
  BookOpen, 
  Map, 
  Briefcase, 
  Mic, 
  FileText, 
  CheckCircle, 
  Navigation, 
  Sparkles, 
  BarChart3, 
  Github, 
  GraduationCap, 
  Calendar 
} from 'lucide-react';

interface CareerNavTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

interface CareerTabItem {
  id: string;
  nameEn: string;
  nameHi: string;
  icon: React.ElementType;
  isNew?: boolean;
  isAI?: boolean;
}

export function CareerNavTabs({ activeTab, onTabChange }: CareerNavTabsProps) {
  const { language } = useLanguage();

  const tabs: CareerTabItem[] = [
    { id: 'skills', nameEn: 'Skills & Gap Analysis', nameHi: 'कौशल विश्लेषण', icon: Award },
    { id: 'courses', nameEn: 'Smart Courses', nameHi: 'स्मार्ट कोर्सेज', icon: BookOpen },
    { id: 'paths', nameEn: 'Career Paths', nameHi: 'करियर मार्ग', icon: Map },
    { id: 'jobs', nameEn: 'Jobs & Internships', nameHi: 'नौकरियां व इंटर्नशिप', icon: Briefcase },
    { id: 'interview', nameEn: 'Interview Prep', nameHi: 'इंटरव्यू तैयारी', icon: Mic, isNew: true },
    { id: 'resume', nameEn: 'ATS Resume Builder', nameHi: 'ATS रेज़्यूमे', icon: FileText, isNew: true },
    { id: 'certifications', nameEn: 'Certifications', nameHi: 'प्रमाणपत्र', icon: CheckCircle, isNew: true },
    { id: 'roadmap', nameEn: 'Learning Roadmap', nameHi: 'लर्निंग रोडमैप', icon: Navigation, isNew: true },
    { id: 'analytics', nameEn: 'Career Analytics', nameHi: 'करियर विश्लेषण', icon: BarChart3, isNew: true },
    { id: 'portfolio', nameEn: 'Portfolio Review', nameHi: 'पोर्टफोलियो समीक्षा', icon: Github, isNew: true },
    { id: 'scholarships', nameEn: 'Scholarships', nameHi: 'छात्रवृत्ति', icon: GraduationCap, isNew: true },
    { id: 'events', nameEn: 'Events & Fairs', nameHi: 'इवेंट्स व फेयर्स', icon: Calendar, isNew: true }
  ];

  return (
    <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto pb-3 visible-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? tab.isAI
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-600'}`} />
                <span>{language === 'hi' ? tab.nameHi : tab.nameEn}</span>

                {tab.isAI && !isActive && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-700 font-bold">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
