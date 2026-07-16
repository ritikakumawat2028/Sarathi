import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Landmark, 
  FileText, 
  Briefcase, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight,
  Globe
} from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Citizen session authenticated successfully!');
      const fromPath = (location.state as any)?.from || '/dashboard';
      navigate(fromPath);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col lg:flex-row overflow-x-hidden">
      {/* ======================================================
          LEFT SIDE: NATIONAL GOVERNMENT PORTAL BRANDING & ARTWORK
          (Hidden on small screens, split screen on desktop/laptop)
          ====================================================== */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#FFF7ED] border-r border-gray-200 p-10 xl:p-14 flex-col justify-between relative overflow-hidden select-none">
        {/* Subtle Decorative Background Circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#1D4ED8]/5 pointer-events-none blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#F97316]/5 pointer-events-none blur-3xl" />

        {/* Top Header Logo */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-3 relative z-10 cursor-pointer select-none hover:opacity-85 transition-opacity"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F2B5B] to-[#1D4ED8] flex items-center justify-center shadow-md border border-[#1D4ED8]/30">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-[#0F2B5B]">
                SARTHI
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#F97316] text-white">
                GOV
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500">
              National Digital Citizen Assistance Platform
            </p>
          </div>
        </div>

        {/* Center Artwork & Floating Feature Highlights */}
        <div className="my-auto space-y-6 relative z-10 max-w-lg">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F2B5B]/10 border border-[#0F2B5B]/20 text-[#0F2B5B] text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F97316]" />
              Official Citizen Portal
            </span>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-[#0F2B5B] tracking-tight leading-tight">
              Empowering Citizens & Students with AI
            </h1>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Access 4,500+ Central & State Government schemes, AI-driven career roadmaps, study planners, and 24/7 multilingual support.
            </p>
          </div>

          {/* Floating Feature Highlight Cards */}
          <div className="space-y-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-start gap-3.5 hover:border-[#1D4ED8] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Instant Scheme Eligibility Checker</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Automated matching with scholarships, subsidies, and citizen welfare schemes.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-start gap-3.5 hover:border-[#F97316] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">AI Career & Resume Architect</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Build ATS-ready resumes, practice interviews, and discover personalized jobs.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-start gap-3.5 hover:border-[#16A34A] transition-all">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-[#16A34A] flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">24/7 Multilingual Sarathi Helpdesk</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Real-time assistance available in Hindi, Bengali, Tamil, Telugu, Marathi, and more.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Left Bottom Trust Statistics */}
        <div className="pt-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600 relative z-10">
          <div className="flex items-center gap-2 font-bold text-[#0F2B5B]">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            <span>Trusted by 10+ Lakh Indian Citizens</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-gray-500">
            <span>Toll Free: 1800-111-SARTHI</span>
          </div>
        </div>
      </div>

      {/* ======================================================
          RIGHT SIDE: AUTHENTICATION CARD & SECURE FORM
          ====================================================== */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-4 sm:p-8 xl:p-12 relative">
        {/* Top Mobile Header (Only visible on mobile) */}
        <div className="flex lg:hidden items-center justify-between mb-6">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0F2B5B] flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-extrabold text-lg text-[#0F2B5B]">SARTHI</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="text-xs font-bold rounded-xl h-8"
          >
            Home
          </Button>
        </div>

        {/* Center Vertical Form Container */}
        <div className="my-auto w-full max-w-md mx-auto">
          {/* Premium White Auth Card (Rounded 24px) */}
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-xl p-6 sm:p-8 space-y-6">
            {/* Card Brand Title */}
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F2B5B] to-[#1D4ED8] flex items-center justify-center mx-auto shadow-md mb-3">
                <Landmark className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-[#0F2B5B] tracking-tight">
                Welcome Back, Citizen
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Access your secure National AI Portal & Dashboard
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-[#0F172A]">
                  Registered Email Address
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-[14px] pl-10 pr-4 text-xs font-medium border-gray-300 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold text-[#0F172A]">
                    Password / Access PIN
                  </Label>
                  <button
                    type="button"
                    onClick={() => toast.info('Contact Helpdesk 1800-111-SARTHI to reset your Citizen PIN.')}
                    className="text-xs font-bold text-[#1D4ED8] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-[14px] pl-10 pr-10 text-xs font-medium border-gray-300 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]"
                />
                <Label htmlFor="remember" className="text-xs text-gray-600 font-medium cursor-pointer">
                  Remember my secure citizen session on this device
                </Label>
              </div>

              {/* Primary Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#0F2B5B] to-[#1D4ED8] hover:opacity-95 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Authenticating Citizen Identity...</span>
                ) : (
                  <>
                    <span>Secure Citizen Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200" />
              <span className="flex-shrink mx-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                OR
              </span>
              <div className="flex-grow border-t border-gray-200" />
            </div>

            {/* Create Account Action */}
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-600 font-medium">
                Don&apos;t have a registered Citizen ID?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/signup')}
                className="w-full h-11 rounded-[14px] border-gray-300 hover:border-[#1D4ED8] hover:bg-[#EFF6FF] text-xs font-bold text-[#0F2B5B] transition-all"
              >
                Register Citizen ID / Create Account
              </Button>
            </div>
          </div>

          {/* SECURITY UI: Trust Bar Below Form */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold text-gray-600 bg-white/80 border border-gray-200 rounded-2xl p-3 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
              <span>Secure Auth</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0" />
              <span>Gov Grade Security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
              <span>Privacy Protected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
              <span>SSL 256-Bit</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <footer className="mt-8 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-4 font-semibold">
            <button onClick={() => navigate('/')} className="hover:text-[#0F2B5B]">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => navigate('/')} className="hover:text-[#0F2B5B]">Terms & Conditions</button>
            <span>•</span>
            <span>Helpdesk: 1800-111-SARTHI</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-gray-400">
            <Globe className="w-3.5 h-3.5" />
            <span>National Digital Portal v2.4.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
