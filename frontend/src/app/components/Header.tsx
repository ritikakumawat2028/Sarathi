import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { MobileMenu } from '@/app/components/MobileMenu';
import { 
  LogOut, 
  User, 
  Bell, 
  Globe, 
  ShieldCheck, 
  Landmark, 
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const languages = [
    { code: 'en' as const, name: 'English (EN)' },
    { code: 'hi' as const, name: 'हिन्दी (Hindi)' },
    { code: 'bn' as const, name: 'বাংলা (Bengali)' },
    { code: 'ta' as const, name: 'தமிழ் (Tamil)' },
    { code: 'te' as const, name: 'తెలుగు (Telugu)' },
    { code: 'mr' as const, name: 'मराठी (Marathi)' },
    { code: 'gu' as const, name: 'ગુજરાતી (Gujarati)' },
    { code: 'kn' as const, name: 'ಕನ್ನಡ (Kannada)' }
  ];

  const navLinks = [
    { label: t('dashboard') || 'Dashboard', path: '/dashboard' },
    { label: t('studentSupport') || 'Student Support', path: '/student-support' },
    { label: t('govSchemes') || 'Government Schemes', path: '/government-schemes' },
    { label: t('careerGuidance') || 'Career Guidance', path: '/career-guidance' },
    { label: t('aiAssistant') || 'AI Assistant', path: '/chat' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
      {/* 1. National Government Tricolor Top Strip */}
      <div className="gov-tricolor-bar w-full" />

      {/* 2. Government Top Authority Bar */}
      <div className="bg-[#0A1E40] text-white py-1.5 px-4 sm:px-6 lg:px-8 text-xs font-medium border-b border-[#1D4ED8]/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1D4ED8]/40 border border-[#1D4ED8]/60 text-[#F8FAFC] text-[11px] font-bold tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Government Digital Portal</span>
            </span>
            <span className="hidden sm:inline text-gray-300">
              National AI Service Platform for Citizens & Students
            </span>
          </div>

          <div className="flex items-center gap-4 text-gray-300">
            <span className="hidden md:inline">Toll Free Helpdesk: 1800-111-SARTHI</span>
            <div className="h-3 w-[1px] bg-white/20 hidden sm:block" />
            <span className="text-green-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Secure Portal 256-Bit SSL</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center min-h-[76px] py-2 gap-4">
          {/* Left: Government Emblem & 2-Line Logo */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated && <MobileMenu />}

            <div
              className="flex items-center gap-3 cursor-pointer group select-none"
              onClick={() => navigate('/')}
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0F2B5B] to-[#1D4ED8] flex items-center justify-center shadow-sm border border-[#1D4ED8]/30 group-hover:shadow-md transition-all shrink-0">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-[#0F2B5B] leading-none">
                    SARTHI
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F97316] text-white leading-none">
                    GOV
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-500 mt-1 leading-none hidden sm:block">
                  National AI Service Portal
                </span>
              </div>
            </div>
          </div>

          {/* Middle: Translated Navigation Menu Pills (ONLY SHOWN WHEN LOGGED IN) */}
          {isAuthenticated && (
            <nav className="hidden xl:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
                return (
                  <Button
                    key={link.path}
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(link.path)}
                    className={`text-xs font-bold px-3.5 h-10 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#EFF6FF] text-[#1D4ED8] shadow-2xs border border-[#1D4ED8]/20'
                        : 'text-[#0F2B5B] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]'
                    }`}
                  >
                    {link.label}
                  </Button>
                );
              })}
            </nav>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Reliable Native Select Language Switcher */}
            <div className="relative inline-flex items-center">
              <Globe className="w-3.5 h-3.5 text-[#1D4ED8] absolute left-3 pointer-events-none z-10" />
              <select
                aria-label="Select Portal Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="h-10 pl-8 pr-7 rounded-xl border border-gray-300 bg-white hover:border-[#1D4ED8] hover:bg-[#EFF6FF]/40 text-xs font-extrabold text-[#0F2B5B] shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 appearance-none transition-all"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-xs font-bold text-[#0F172A] bg-white py-1">
                    {lang.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 pointer-events-none z-10" />
            </div>

            {/* IF LOGGED IN: Show Notifications & Profile Menu */}
            {isAuthenticated ? (
              <>
                {/* Notification Icon */}
                <button
                  type="button"
                  onClick={() => navigate('/notifications')}
                  className="relative w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-[#EFF6FF] hover:border-[#1D4ED8] hover:text-[#1D4ED8] text-gray-600 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                  title="Official Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
                </button>

                {/* Cohesive Citizen Profile Pill with Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="h-10 pl-1.5 pr-2.5 rounded-xl border border-gray-200 bg-white hover:border-[#1D4ED8] hover:bg-[#EFF6FF]/40 shadow-2xs flex items-center gap-2.5 cursor-pointer transition-all"
                      title="Citizen Profile & Options"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#0F2B5B] text-white flex items-center justify-center text-xs font-extrabold shrink-0">
                        {user?.name ? user.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-bold text-[#0F172A] max-w-[130px] truncate hidden sm:inline">
                        {user?.name ? user.name : t('profile')}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5 shadow-2xl border-gray-200 bg-white dark:bg-[#111D36] opacity-100">
                    <DropdownMenuItem
                      onClick={() => navigate('/profile')}
                      className="text-xs font-bold text-[#0F172A] cursor-pointer rounded-lg py-2.5 px-3 flex items-center gap-2.5 hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                    >
                      <User className="w-4 h-4 text-[#1D4ED8]" />
                      <span>{t('profile')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate('/dashboard')}
                      className="text-xs font-bold text-[#0F172A] cursor-pointer rounded-lg py-2.5 px-3 flex items-center gap-2.5 hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                    >
                      <Landmark className="w-4 h-4 text-[#0F2B5B]" />
                      <span>{t('dashboard')}</span>
                    </DropdownMenuItem>
                    <div className="border-t border-gray-100 my-1" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-xs font-bold text-red-600 cursor-pointer rounded-lg py-2.5 px-3 flex items-center gap-2.5 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* IF NOT LOGGED IN: Only show Login and Register buttons */
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="h-10 px-4 rounded-xl border-gray-300 hover:border-[#1D4ED8] hover:bg-[#EFF6FF] text-xs font-bold text-[#0F2B5B]"
                >
                  Citizen Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/signup')}
                  className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#0F2B5B] to-[#1D4ED8] hover:opacity-95 text-white text-xs font-bold shadow-md"
                >
                  Register Citizen ID
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}