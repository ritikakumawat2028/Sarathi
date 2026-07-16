import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  MapPin, 
  Briefcase, 
  Globe, 
  ShieldCheck, 
  Landmark, 
  CheckCircle2, 
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Building2,
  BookOpen,
  Award,
  Sparkles,
  Check,
  Hash
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh'
];

const OCCUPATIONS = [
  { value: 'Student', label: 'Student / Scholar', desc: 'School, College, or University Aspirant' },
  { value: 'Job Seeker', label: 'Job Seeker / Aspirant', desc: 'Preparing for Government or Private Roles' },
  { value: 'Working Professional', label: 'Working Professional', desc: 'Employed in Private / Corporate Sector' },
  { value: 'Government Employee', label: 'Government Officer', desc: 'State or Central Government Servant' },
  { value: 'Farmer', label: 'Farmer / Agriculturist', desc: 'Agricultural & Rural Enterprise' },
  { value: 'Business Owner', label: 'Entrepreneur / Business', desc: 'MSME, Startup & Business Owner' }
];

const SOCIAL_CATEGORIES = [
  { value: 'General', label: 'General / Unreserved' },
  { value: 'OBC', label: 'OBC (Other Backward Class)' },
  { value: 'SC', label: 'SC (Scheduled Caste)' },
  { value: 'ST', label: 'ST (Scheduled Tribe)' },
  { value: 'EWS', label: 'EWS (Economically Weaker Section)' }
];

const EDUCATION_LEVELS = [
  { value: '10th', label: 'Class 10th / Secondary' },
  { value: '12th', label: 'Class 12th / Higher Secondary' },
  { value: 'Diploma', label: 'Diploma / ITI / Polytechnic' },
  { value: 'Undergraduate', label: 'Undergraduate (B.Tech, BA, BSc, B.Com)' },
  { value: 'Postgraduate', label: 'Postgraduate (M.Tech, MBA, MA, MSc)' },
  { value: 'PhD', label: 'PhD / Research Scholar' }
];

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: 'EN' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: 'HI' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: 'BN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: 'TA' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: 'TE' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: 'MR' }
];

export function SignupPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signup } = useAuth();

  // Wizard Step State (1 to 4)
  const [step, setStep] = useState(1);

  // Step 1: Personal & Credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 2: Location & Language
  const [state, setState] = useState('Maharashtra');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [languagePref, setLanguagePref] = useState('en');

  // Step 3: Occupation & Academic Profile
  const [occupation, setOccupation] = useState('Student');
  const [category, setCategory] = useState('General');
  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [cgpa, setCgpa] = useState('');

  // Step 4: Consent & Submission
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  // Password Strength
  const getPasswordStrength = () => {
    if (!password) return { label: 'None', color: 'bg-gray-200 text-gray-500', width: 'w-0' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9!@#$%^&*]/.test(password)) score++;

    if (score <= 1) return { label: 'Weak', color: 'bg-red-500 text-red-600', width: 'w-1/4' };
    if (score === 2) return { label: 'Medium', color: 'bg-yellow-500 text-yellow-600', width: 'w-2/4' };
    if (score === 3) return { label: 'Strong', color: 'bg-green-500 text-green-600', width: 'w-3/4' };
    return { label: 'Government Grade Encrypted', color: 'bg-[#1D4ED8] text-[#1D4ED8]', width: 'w-full' };
  };

  const strength = getPasswordStrength();

  // Validate Step transitions
  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!name.trim() || !email.trim() || !phone.trim() || !password) {
        toast.error('Please enter your full name, mobile number, email, and password.');
        return false;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters.');
        return false;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!state) {
        toast.error('Please select your state or union territory.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!occupation) {
        toast.error('Please select your current occupation.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    if (!agreeTerms) {
      toast.error('You must agree to the National Portal Terms & Digital Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        city: city.trim(),
        state,
        pincode: pincode.trim(),
        occupation,
        category,
        educationLevel,
        institution: institution.trim(),
        degree: degree.trim(),
        branch: branch.trim(),
        yearOfStudy: yearOfStudy.trim(),
        cgpa: cgpa.trim()
      });
      toast.success('National Sarthi Citizen ID registered successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const STEPS_META = [
    { num: 1, title: 'Personal Info', desc: 'Citizen identity & account' },
    { num: 2, title: 'Location', desc: 'State, district & language' },
    { num: 3, title: 'Education', desc: 'Occupation & academic profile' },
    { num: 4, title: 'Final Review', desc: 'Verify & activate ID' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col lg:flex-row overflow-x-hidden">
      {/* ======================================================
          LEFT SIDE: NATIONAL GOVERNMENT PORTAL ARTWORK
          ====================================================== */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-[#0F2B5B] via-[#1D4ED8] to-[#0A192F] text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden select-none">
        {/* Decorative ambient lighting */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#F97316]/20 pointer-events-none blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#38BDF8]/20 pointer-events-none blur-3xl" />

        {/* Top Header Logo */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-3 relative z-10 cursor-pointer select-none hover:opacity-85 transition-opacity"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
            <Landmark className="w-6 h-6 text-[#F97316]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">
                SARTHI
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F97316] text-white shadow-sm">
                GOV.IN
              </span>
            </div>
            <p className="text-xs font-semibold text-white/70">
              National AI Assistance & Empowerment Portal
            </p>
          </div>
        </div>

        {/* Center Artwork & Feature Highlights */}
        <div className="my-auto space-y-6 relative z-10 max-w-lg">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4 text-[#F97316]" />
              Universal Digital Citizen ID
            </span>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Create Your National Sarthi Citizen Profile
            </h1>
            <p className="text-sm text-white/80 mt-3 leading-relaxed">
              Complete your profile in 4 quick steps to unlock AI scheme eligibility checks, personalized student roadmaps, government job matching, and verified civic services.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm flex items-start gap-3.5">
              <CheckCircle2 className="w-5 h-5 text-[#4ADE80] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">Single Sign-On for 6 Core Modules</h3>
                <p className="text-xs text-white/70 mt-0.5">
                  Seamlessly access Government Schemes, Student Support, Career Guidance, Jobs, and AI Chat Assistant.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm flex items-start gap-3.5">
              <CheckCircle2 className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">Hyper-Personalized AI Matching</h3>
                <p className="text-xs text-white/70 mt-0.5">
                  Your state, occupation, and education profile enable precision eligibility matching with zero guesswork.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm flex items-start gap-3.5">
              <CheckCircle2 className="w-5 h-5 text-[#38BDF8] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">100% Free & Encrypted</h3>
                <p className="text-xs text-white/70 mt-0.5">
                  Protected by 256-Bit Government SSL Encryption and strict Digital Personal Data Protection standards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Statistics */}
        <div className="pt-6 border-t border-white/15 flex items-center justify-between text-xs text-white/80 relative z-10">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
            <span>DPDP Act 2023 Compliant</span>
          </div>
          <div className="font-bold text-white/60">
            <span>Toll Free: 1800-111-SARTHI</span>
          </div>
        </div>
      </div>

      {/* ======================================================
          RIGHT SIDE: MULTI-STEP REGISTRATION CARD & FORM
          ====================================================== */}
      <div className="w-full lg:w-7/12 min-h-screen flex flex-col justify-between p-4 sm:p-8 xl:p-12 relative">
        {/* Top Mobile Header */}
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
            onClick={() => navigate('/login')}
            className="text-xs font-bold rounded-xl h-8"
          >
            Login
          </Button>
        </div>

        {/* Center Vertical Wizard Container */}
        <div className="my-auto w-full max-w-2xl mx-auto space-y-6">
          {/* Header & Step Indicator Bar */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F97316]">
                    Citizen Registration Wizard
                  </span>
                </div>
                <h2 className="text-2xl font-black text-[#0F2B5B] tracking-tight">
                  {STEPS_META[step - 1].title}
                </h2>
                <p className="text-xs text-gray-500">
                  Step {step} of 4: {STEPS_META[step - 1].desc}
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-gray-500">Already a citizen?</span>
                <Button
                  variant="link"
                  onClick={() => navigate('/login')}
                  className="text-xs font-extrabold text-[#1D4ED8] p-0 ml-1.5 h-auto"
                >
                  Sign In →
                </Button>
              </div>
            </div>

            {/* Stepper Progress Visual */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {STEPS_META.map((item) => {
                const isActive = step === item.num;
                const isCompleted = step > item.num;
                return (
                  <button
                    key={item.num}
                    type="button"
                    onClick={() => {
                      if (item.num < step) setStep(item.num);
                    }}
                    disabled={item.num > step}
                    className={`flex flex-col items-center sm:items-start p-2.5 sm:p-3 rounded-2xl border transition-all text-left ${
                      isActive
                        ? 'border-[#1D4ED8] bg-[#EFF6FF] shadow-sm'
                        : isCompleted
                        ? 'border-[#16A34A]/30 bg-[#F0FDF4] cursor-pointer hover:border-[#16A34A]'
                        : 'border-gray-200 bg-gray-50/60 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted
                            ? 'bg-[#16A34A] text-white'
                            : isActive
                            ? 'bg-[#1D4ED8] text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : item.num}
                      </span>
                      {isActive && (
                        <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-[#1D4ED8] animate-ping" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold truncate w-full ${
                        isActive
                          ? 'text-[#1D4ED8]'
                          : isCompleted
                          ? 'text-[#16A34A]'
                          : 'text-gray-500'
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Body Card */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ======================================================
                  STEP 1: PERSONAL DETAILS & ACCOUNT CREDENTIALS
                  ====================================================== */}
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in-50 duration-300">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-base font-extrabold text-[#0F172A]">
                      Personal Identity & Credentials
                    </h3>
                    <p className="text-xs text-gray-500">
                      Enter your official name and contact details to establish your citizen account.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullname" className="text-xs font-bold text-[#0F172A]">
                        Full Name (as per official ID) *
                      </Label>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <Input
                          id="fullname"
                          type="text"
                          placeholder="e.g., Priya Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="h-12 rounded-2xl pl-10 pr-3 text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-bold text-[#0F172A]">
                        Mobile Phone Number *
                      </Label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="h-12 rounded-2xl pl-10 pr-3 text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-[#0F172A]">
                      Official Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="priya.sharma@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 rounded-2xl pl-10 pr-3 text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs font-bold text-[#0F172A]">
                        Create Password *
                      </Label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-12 rounded-2xl pl-10 pr-10 text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-xs font-bold text-[#0F172A]">
                        Confirm Password *
                      </Label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <Input
                          id="confirmPassword"
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Re-type password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="h-12 rounded-2xl pl-10 pr-10 text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-500">Security Encryption Grade:</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${strength.color}`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strength.width} ${
                            strength.label === 'Government Grade Encrypted' || strength.label === 'Strong'
                              ? 'bg-[#16A34A]'
                              : strength.label === 'Medium'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================
                  STEP 2: LOCATION & DEMOGRAPHICS
                  ====================================================== */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in-50 duration-300">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-base font-extrabold text-[#0F172A]">
                      State, District & Language Preferences
                    </h3>
                    <p className="text-xs text-gray-500">
                      We use your location to surface state-specific schemes, local career opportunities, and scholarships.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-xs font-bold text-[#0F172A]">
                      State / Union Territory *
                    </Label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="h-12 w-full rounded-2xl pl-10 pr-4 text-xs font-semibold bg-white border border-gray-300 focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs font-bold text-[#0F172A]">
                        City / District
                      </Label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <Input
                          id="city"
                          type="text"
                          placeholder="e.g., Pune, Lucknow, Kolkata"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="h-12 rounded-2xl pl-10 pr-3 text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="pincode" className="text-xs font-bold text-[#0F172A]">
                        PIN Code (6 digits)
                      </Label>
                      <div className="relative">
                        <Hash className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <Input
                          id="pincode"
                          type="text"
                          maxLength={6}
                          placeholder="e.g., 411001"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                          className="h-12 rounded-2xl pl-10 pr-3 text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-[#1D4ED8]" /> Preferred Communication Language
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {LANGUAGES.map((lang) => {
                        const active = languagePref === lang.code;
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => setLanguagePref(lang.code)}
                            className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                              active
                                ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#0F2B5B] shadow-sm font-bold'
                                : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-extrabold">{lang.native}</p>
                              <p className="text-[10px] text-gray-500">{lang.name}</p>
                            </div>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                active ? 'bg-[#1D4ED8] text-white' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {lang.flag}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================
                  STEP 3: OCCUPATION & EDUCATION PROFILE
                  ====================================================== */}
              {step === 3 && (
                <div className="space-y-5 animate-in fade-in-50 duration-300">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-base font-extrabold text-[#0F172A]">
                      Occupation & Academic Profile
                    </h3>
                    <p className="text-xs text-gray-500">
                      Your occupation and education details allow Sarthi to filter scholarships, jobs, and study tracks tailored for you.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="occupation" className="text-xs font-bold text-[#0F172A]">
                        Current Occupation *
                      </Label>
                      <select
                        id="occupation"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="h-12 w-full rounded-2xl px-3 text-xs font-semibold bg-white border border-gray-300 focus:border-[#1D4ED8]"
                      >
                        {OCCUPATIONS.map((occ) => (
                          <option key={occ.value} value={occ.value}>
                            {occ.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="category" className="text-xs font-bold text-[#0F172A]">
                        Social Category (Scheme Eligibility)
                      </Label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="h-12 w-full rounded-2xl px-3 text-xs font-semibold bg-white border border-gray-300 focus:border-[#1D4ED8]"
                      >
                        {SOCIAL_CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="eduLevel" className="text-xs font-bold text-[#0F172A]">
                      Highest Education Level
                    </Label>
                    <select
                      id="eduLevel"
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className="h-12 w-full rounded-2xl px-3 text-xs font-semibold bg-white border border-gray-300 focus:border-[#1D4ED8]"
                    >
                      {EDUCATION_LEVELS.map((edu) => (
                        <option key={edu.value} value={edu.value}>
                          {edu.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="institution" className="text-xs font-bold text-[#0F172A]">
                      Institution / School / University Name
                    </Label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <Input
                        id="institution"
                        type="text"
                        placeholder="e.g., IIT Bombay / Delhi University / KV High School"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="h-12 rounded-2xl pl-10 pr-3 text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="degree" className="text-xs font-bold text-[#0F172A]">
                        Degree / Branch / Stream
                      </Label>
                      <Input
                        id="degree"
                        type="text"
                        placeholder="e.g., B.Tech CSE"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        className="h-12 rounded-2xl px-3 text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="yearOfStudy" className="text-xs font-bold text-[#0F172A]">
                        Year / Batch
                      </Label>
                      <Input
                        id="yearOfStudy"
                        type="text"
                        placeholder="e.g., 3rd Year / 2026"
                        value={yearOfStudy}
                        onChange={(e) => setYearOfStudy(e.target.value)}
                        className="h-12 rounded-2xl px-3 text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cgpa" className="text-xs font-bold text-[#0F172A]">
                        CGPA or Marks %
                      </Label>
                      <Input
                        id="cgpa"
                        type="text"
                        placeholder="e.g., 8.5 / 85%"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        className="h-12 rounded-2xl px-3 text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================
                  STEP 4: FINAL REVIEW & DIGITAL PRIVACY AGREEMENT
                  ====================================================== */}
              {step === 4 && (
                <div className="space-y-5 animate-in fade-in-50 duration-300">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-base font-extrabold text-[#0F172A]">
                      Review Your National Citizen Profile
                    </h3>
                    <p className="text-xs text-gray-500">
                      Please confirm your details below before activating your Citizen ID.
                    </p>
                  </div>

                  {/* Summary Cards */}
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          Personal Details
                        </span>
                        <p className="text-sm font-extrabold text-[#0F2B5B]">{name}</p>
                        <p className="text-xs text-gray-600">{email} • {phone}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep(1)}
                        className="text-xs font-bold text-[#1D4ED8] h-8"
                      >
                        Edit
                      </Button>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          Location & Language
                        </span>
                        <p className="text-sm font-extrabold text-[#0F2B5B]">{state}</p>
                        <p className="text-xs text-gray-600">
                          {city ? `${city}, ` : ''}{pincode ? `PIN: ${pincode} • ` : ''}Language: {LANGUAGES.find(l => l.code === languagePref)?.name}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep(2)}
                        className="text-xs font-bold text-[#1D4ED8] h-8"
                      >
                        Edit
                      </Button>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          Education & Occupation
                        </span>
                        <p className="text-sm font-extrabold text-[#0F2B5B]">{occupation} ({category})</p>
                        <p className="text-xs text-gray-600">
                          {educationLevel} {degree ? `• ${degree}` : ''} {institution ? `at ${institution}` : ''}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep(3)}
                        className="text-xs font-bold text-[#1D4ED8] h-8"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#1D4ED8]/20 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-[#1D4ED8] focus:ring-[#1D4ED8] cursor-pointer"
                    />
                    <Label
                      htmlFor="terms"
                      className="text-xs text-gray-700 font-medium leading-relaxed cursor-pointer"
                    >
                      I hereby confirm that all citizen information provided above is correct. I agree to the{' '}
                      <span className="font-bold text-[#1D4ED8] underline">
                        National AI Sarthi Terms of Service
                      </span>{' '}
                      and consent to digital identity verification under the DPDP Act 2023.
                    </Label>
                  </div>
                </div>
              )}

              {/* ======================================================
                  WIZARD FOOTER NAVIGATION BUTTONS
                  ====================================================== */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className="h-12 px-6 rounded-2xl font-bold text-xs border-gray-300 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="h-12 px-8 rounded-2xl font-extrabold text-xs bg-gradient-to-r from-[#0F2B5B] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#0F2B5B] text-white shadow-lg shadow-[#1D4ED8]/20 flex items-center gap-2 ml-auto"
                  >
                    Continue to Step {step + 1}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 px-8 rounded-2xl font-extrabold text-xs bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#F97316] text-white shadow-lg shadow-[#F97316]/25 flex items-center gap-2 ml-auto"
                  >
                    {loading ? (
                      'Creating Citizen Account...'
                    ) : (
                      <>
                        Activate Citizen ID & Enter Portal
                        <Sparkles className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
