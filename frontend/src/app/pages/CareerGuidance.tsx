import React, { useState } from 'react';
import { Header } from '@/app/components/Header';
import { CareerHeader } from '@/app/components/career/CareerHeader';
import { CareerNavTabs } from '@/app/components/career/CareerNavTabs';

// All 13 Sub-Module Tabs
import { SkillsTab } from '@/app/components/career/SkillsTab';
import { CoursesTab } from '@/app/components/career/CoursesTab';
import { CareerPathsTab } from '@/app/components/career/CareerPathsTab';
import { JobsTab } from '@/app/components/career/JobsTab';
import { InterviewPrepTab } from '@/app/components/career/InterviewPrepTab';
import { ResumeBuilderTab } from '@/app/components/career/ResumeBuilderTab';
import { CertificationsTab } from '@/app/components/career/CertificationsTab';
import { RoadmapTab } from '@/app/components/career/RoadmapTab';
import { AICareerCoachTab } from '@/app/components/career/AICareerCoachTab';
import { AnalyticsTab } from '@/app/components/career/AnalyticsTab';
import { PortfolioReviewTab } from '@/app/components/career/PortfolioReviewTab';
import { ScholarshipsTab } from '@/app/components/career/ScholarshipsTab';
import { EventsTab } from '@/app/components/career/EventsTab';

import { Sparkles, MessageSquare, X } from 'lucide-react';

export function CareerGuidance() {
  const [activeTab, setActiveTab] = useState('skills');
  const [showFloatingCoach, setShowFloatingCoach] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40 flex flex-col">
      {/* Existing Global Header */}
      <Header />

      {/* Upgraded Global Career Header with Progress & Quick Actions */}
      <CareerHeader
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
      />

      {/* 13-Module Navigation Bar */}
      <CareerNavTabs
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === 'skills' && (
          <SkillsTab onOpenRoadmap={() => setActiveTab('roadmap')} />
        )}
        {activeTab === 'courses' && <CoursesTab />}
        {activeTab === 'paths' && <CareerPathsTab />}
        {activeTab === 'jobs' && <JobsTab />}
        {activeTab === 'interview' && <InterviewPrepTab />}
        {activeTab === 'resume' && <ResumeBuilderTab />}
        {activeTab === 'certifications' && <CertificationsTab />}
        {activeTab === 'roadmap' && <RoadmapTab />}
        {activeTab === 'coach' && <AICareerCoachTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'portfolio' && <PortfolioReviewTab />}
        {activeTab === 'scholarships' && <ScholarshipsTab />}
        {activeTab === 'events' && <EventsTab />}
      </main>

      {/* Floating AI Career Coach Assistant Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => {
            if (activeTab !== 'coach') {
              setActiveTab('coach');
              window.scrollTo({ top: 350, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-extrabold shadow-2xl hover:scale-105 transition-all border-2 border-white/20"
          title="Ask AI Career Coach"
        >
          <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
          <span className="text-sm">Ask AI Career Coach</span>
        </button>
      </div>
    </div>
  );
}