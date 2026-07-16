import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { Header } from '@/app/components/Header';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { 
  Languages, 
  Wifi, 
  Heart, 
  GraduationCap, 
  Briefcase, 
  FileText,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Search,
  MessageSquare,
  CheckCircle2,
  Bell,
  Building2,
  ExternalLink,
  Award
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [heroSearchQuery, setHeroSearchQuery] = useState('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      navigate('/schemes');
    }
  };

  const quickAccessCards = [
    {
      id: 'student-support',
      title: t('studentSupport') || 'Student Support',
      description: 'AI Study Planner, Doubt Solving, Mental Wellness, Task Manager & Productivity Dashboard',
      path: '/student-support',
      badge: 'Education & Study',
      icon: GraduationCap,
      gradient: 'from-[#0F2B5B] to-[#1D4ED8]',
      accentColor: '#1D4ED8'
    },
    {
      id: 'government-schemes',
      title: t('govSchemes') || 'Government Schemes',
      description: 'National Eligibility Checker, AI Recommendations, Category Explorer & Direct Scheme Applications',
      path: '/government-schemes',
      badge: 'National Portal',
      icon: FileText,
      gradient: 'from-[#1D4ED8] to-[#2563EB]',
      accentColor: '#0F2B5B'
    },
    {
      id: 'career-guidance',
      title: t('careerGuidance') || 'Career Guidance',
      description: 'AI Career Coach, ATS Resume Builder, Mock Interviews, Roadmap Generator & Jobs Portal',
      path: '/career-guidance',
      badge: 'Skills & Jobs',
      icon: Briefcase,
      gradient: 'from-[#F97316] to-[#EA580C]',
      accentColor: '#F97316'
    },
    {
      id: 'ai-assistant',
      title: t('aiAssistant') || 'AI Assistant',
      description: '24/7 Multilingual AI Citizen Helpline with voice & text conversation in 8+ Indian languages',
      path: '/chat',
      badge: 'Citizen Helpdesk',
      icon: MessageSquare,
      gradient: 'from-[#16A34A] to-[#15803D]',
      accentColor: '#16A34A'
    }
  ];

  const portalStats = [
    { value: '50,000+', label: 'Verified Citizens & Students Assisted', icon: CheckCircle2 },
    { value: '1,200+', label: 'Central & State Government Schemes', icon: Building2 },
    { value: '8+', label: 'Indian Regional Languages Supported', icon: Languages },
    { value: '100%', label: 'Free Citizen Digital Public Good', icon: Award }
  ];

  const announcements = [
    'PM-Vidyalaxmi Education Loan & Scholarship portal applications open for Academic Year 2026-27.',
    'New AI Career ATS Resume Reviewer & Interview Simulator launched for engineering students.',
    'DigiLocker & MyScheme API integration active across all state citizen portals.'
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      {/* 1. National Government Digital Portal Header */}
      <Header />

      {/* 2. Official Announcements Ticker */}
      <div className="bg-[#EFF6FF] border-b border-[#1D4ED8]/20 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1D4ED8] text-white text-xs font-bold shrink-0 uppercase tracking-wider">
            <Bell className="w-3.5 h-3.5" />
            <span>Official Update</span>
          </span>
          <div className="overflow-hidden whitespace-nowrap flex-1">
            <p className="text-xs sm:text-sm font-semibold text-[#0F2B5B] inline-block animate-pulse">
              🇮🇳 {announcements[0]}
            </p>
          </div>
        </div>
      </div>

      {/* 3. National Hero Section (Navy Blue & Saffron Aesthetics) */}
      <section className="relative bg-gradient-to-b from-[#0F2B5B] via-[#0A1E40] to-[#0F2B5B] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* National Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs sm:text-sm font-bold tracking-wide">
              <Shield className="w-4 h-4 text-[#F97316]" />
              <span>National Citizen Digital Platform • Digital India Initiative</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Empowering Citizens Through{' '}
              <span className="text-[#F97316] underline decoration-white/20">
                Intelligent Government Services
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-xl text-gray-200 max-w-2xl mx-auto font-normal leading-relaxed">
              Access verified government welfare schemes, student education planners, personalized career coaching, and 24/7 multilingual AI assistance.
            </p>

            {/* Central Portal Search Box */}
            <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto pt-4">
              <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-2xl border border-white/20">
                <Search className="w-6 h-6 text-gray-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={heroSearchQuery}
                  onChange={(e) => setHeroSearchQuery(e.target.value)}
                  placeholder="Search schemes, scholarships, career roadmaps, study resources..."
                  className="w-full h-12 px-4 text-sm sm:text-base text-[#0F172A] placeholder-gray-400 focus:outline-none bg-transparent"
                />
                <Button
                  type="submit"
                  className="bg-[#1D4ED8] hover:bg-[#0F2B5B] text-white font-bold px-6 sm:px-8 h-12 rounded-xl shrink-0 transition-all shadow-md"
                >
                  <span>Search Portal</span>
                  <ArrowRight className="w-4 h-4 ml-2 hidden sm:inline" />
                </Button>
              </div>
            </form>

            {/* Quick Keyword Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-semibold text-gray-300">
              <span className="text-gray-400">Popular Searches:</span>
              {['PM-Vidyalaxmi Scholarship', 'AI Resume Reviewer', 'PM-KISAN Yojana', 'Study Planner'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setHeroSearchQuery(tag);
                    navigate('/schemes');
                  }}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Statistics Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 pt-8 border-t border-white/15">
            {portalStats.map((st, i) => {
              const Icon = st.icon;
              return (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F97316]/20 border border-[#F97316]/40 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-[#F97316]" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white">{st.value}</div>
                    <div className="text-xs text-gray-300 font-medium mt-0.5">{st.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. QUICK ACCESS CARDS SECTION (Student Support, Government Schemes, Career Guidance, AI Assistant) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>National Citizen Portal Services</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2B5B] tracking-tight">
              Quick Access Services
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              Select an official module below to access personalized citizen assistance, AI tools, and government registries.
            </p>
          </div>
        </div>

        {/* 4 Cards Grid (Rounded 20px, Soft Shadow, Hover Lift, Large Icon) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickAccessCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => navigate(card.path)}
                className="gov-card p-6 flex flex-col justify-between cursor-pointer group bg-white border border-[#E2E8F0] rounded-[20px]"
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#1D4ED8]">
                      {card.badge}
                    </span>
                    <span className="text-xs font-bold text-gray-400 group-hover:text-[#1D4ED8] transition-colors">
                      Official Service
                    </span>
                  </div>

                  {/* Large Icon inside Gradient Background */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-5`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-extrabold text-[#0F2B5B] group-hover:text-[#1D4ED8] transition-colors mb-2">
                    {card.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Arrow Button */}
                <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F2B5B] group-hover:text-[#1D4ED8] transition-colors">
                    Access Portal Module
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] group-hover:bg-[#1D4ED8] flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4 text-[#1D4ED8] group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Why Citizens Trust Sarthi (National Standards) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-[#0F2B5B]">
              National Trust & Accessibility Standards
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              Designed according to Government of India Digital Portal Guidelines for high accessibility and security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Languages,
                title: 'Multilingual Inclusion',
                desc: 'Support across 8+ Indian regional languages ensuring seamless comprehension for every citizen.'
              },
              {
                icon: Shield,
                title: 'Citizen Privacy & Security',
                desc: 'Strict security standards ensuring all citizen queries and profile documents remain protected.'
              },
              {
                icon: Wifi,
                title: 'Low Bandwidth Optimization',
                desc: 'Fast loading speeds and accessible interfaces suitable for both urban and rural internet connections.'
              }
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <Card key={idx} className="border border-[#E2E8F0] rounded-[20px] shadow-sm bg-[#F8FAFC]">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0F2B5B] text-white flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0F2B5B]">{f.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Footer (Official Portal Theme) */}
      <footer className="bg-[#0A1E40] text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-[#1D4ED8]/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F2B5B] to-[#1D4ED8] flex items-center justify-center border border-[#1D4ED8]/40">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight">SARTHI PORTAL</div>
              <div className="text-xs text-gray-400">National Citizen & Student Digital Assistant</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-300 font-medium">
            <a href="/schemes" className="hover:text-white transition-colors">Government Schemes</a>
            <a href="/career-guidance" className="hover:text-white transition-colors">Career Guidance</a>
            <a href="/student-support" className="hover:text-white transition-colors">Student Support</a>
            <a href="/chat" className="hover:text-white transition-colors">AI Citizen Helpline</a>
          </div>

          <div className="text-xs text-gray-400 text-center md:text-right">
            <div>© 2026 Sarthi Platform. Digital India Citizen Initiative.</div>
            <div className="mt-0.5 text-gray-500">Accessible • Multilingual • Secure</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
