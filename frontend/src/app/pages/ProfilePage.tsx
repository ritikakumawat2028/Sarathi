import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage, Language } from '@/app/context/LanguageContext';
import { useAuth } from '@/app/context/AuthContext';
import { Header } from '@/app/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  User, Settings, History, Bell, Languages, Moon, Sun,
  CheckCircle, Clock, MessageCircle, Loader2, GraduationCap,
  MapPin, Briefcase, IndianRupee, ShieldCheck, CheckCircle2,
  Landmark, Sparkles, LogOut, Award, BookOpen, Building2,
  Hash, Calendar, Edit3, Save, ArrowRight
} from 'lucide-react';
import { Switch } from '@/app/components/ui/switch';
import { toast } from 'sonner';
import { api } from '@/app/lib/api';

interface ActivityEntry {
  type: string;
  title: string;
  detail?: string;
  timestamp: string;
}

interface UserStats {
  savedSchemes: number;
  totalActivities: number;
  schemeChecks: number;
  chatCount: number;
  studySessions: number;
}

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

const CATEGORY_LABELS: Record<string, string> = {
  General: 'General / Unreserved',
  general: 'General / Unreserved',
  OBC: 'OBC',
  obc: 'OBC',
  SC: 'SC',
  sc: 'SC',
  ST: 'ST',
  st: 'ST',
  EWS: 'EWS',
  ews: 'EWS',
};

const OCCUPATION_LABELS: Record<string, string> = {
  Student: 'Student / Scholar',
  student: 'Student / Scholar',
  'Job Seeker': 'Job Seeker / Aspirant',
  Farmer: 'Farmer / Agriculturist',
  farmer: 'Farmer / Agriculturist',
  'Working Professional': 'Working Professional',
  employed: 'Employed Professional',
  'Government Employee': 'Government Employee',
  'Business Owner': 'Business Owner / Entrepreneur',
  unemployed: 'Job Seeker / Aspirant',
  homemaker: 'Homemaker',
  retired: 'Retired Citizen',
};

const EDUCATION_LEVELS = [
  { value: '10th', label: 'Class 10th / Secondary' },
  { value: '12th', label: 'Class 12th / Higher Secondary' },
  { value: 'Diploma', label: 'Diploma / ITI / Polytechnic' },
  { value: 'Undergraduate', label: 'Undergraduate (B.Tech, BA, BSc, B.Com)' },
  { value: 'Postgraduate', label: 'Postgraduate (M.Tech, MBA, MA, MSc)' },
  { value: 'PhD', label: 'PhD / Research Scholar' },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { user, setUser, logout } = useAuth();

  const [saving, setSaving] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);

  // Personal Fields
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editDob, setEditDob] = useState(user?.dateOfBirth || '');
  const [editGender, setEditGender] = useState(user?.gender || '');
  const [editOccupation, setEditOccupation] = useState(user?.occupation || 'Student');
  const [editCategory, setEditCategory] = useState(user?.category || 'General');
  const [editIncome, setEditIncome] = useState(user?.annualIncome ? String(user.annualIncome) : '');

  // Location Fields
  const [editCity, setEditCity] = useState(user?.address?.city || '');
  const [editState, setEditState] = useState(user?.address?.state || 'Maharashtra');
  const [editPincode, setEditPincode] = useState(user?.address?.pincode || '');

  // Education Fields
  const [editEduLevel, setEditEduLevel] = useState(user?.education?.level || 'Undergraduate');
  const [editEduInstitution, setEditEduInstitution] = useState(user?.education?.institution || '');
  const [editEduDegree, setEditEduDegree] = useState(user?.education?.degree || '');
  const [editEduBranch, setEditEduBranch] = useState(user?.education?.branch || '');
  const [editEduYear, setEditEduYear] = useState(user?.education?.yearOfStudy || '');
  const [editEduCgpa, setEditEduCgpa] = useState(user?.education?.cgpa || '');

  // Populate fields when user data changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditDob(user.dateOfBirth || '');
      setEditGender(user.gender || '');
      setEditOccupation(user.occupation || 'Student');
      setEditCategory(user.category || 'General');
      setEditIncome(user.annualIncome ? String(user.annualIncome) : '');

      setEditCity(user.address?.city || '');
      setEditState(user.address?.state || 'Maharashtra');
      setEditPincode(user.address?.pincode || '');

      setEditEduLevel(user.education?.level || 'Undergraduate');
      setEditEduInstitution(user.education?.institution || '');
      setEditEduDegree(user.education?.degree || '');
      setEditEduBranch(user.education?.branch || '');
      setEditEduYear(user.education?.yearOfStudy || '');
      setEditEduCgpa(user.education?.cgpa || '');
    }
  }, [user]);

  // Load activity & stats
  useEffect(() => {
    setLoadingActivity(true);
    Promise.all([
      api.get<{ activity: ActivityEntry[] }>('/user/activity').catch(() => ({ activity: [] })),
      api.get<{ stats: UserStats }>('/user/stats').catch(() => ({ stats: null })),
    ])
      .then(([actRes, statsRes]) => {
        setActivity(actRes.activity || []);
        setStats(statsRes.stats || null);
      })
      .finally(() => setLoadingActivity(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put<{ profile: typeof user }>('/user/profile', {
        name: editName,
        phone: editPhone,
        dateOfBirth: editDob,
        gender: editGender,
        occupation: editOccupation,
        annualIncome: editIncome ? parseInt(editIncome, 10) : 0,
        category: editCategory,
        address: {
          state: editState,
          city: editCity,
          pincode: editPincode,
        },
        education: {
          level: editEduLevel,
          institution: editEduInstitution,
          degree: editEduDegree,
          branch: editEduBranch,
          yearOfStudy: editEduYear,
          cgpa: editEduCgpa,
        },
      });
      setUser(res.profile as any);
      toast.success('National Sarthi Citizen Profile updated successfully!');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    toast.success('Language preferences updated!');
  };

  const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: 'EN' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: 'HI' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: 'TA' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: 'TE' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: 'BN' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: 'MR' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: 'GU' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: 'KN' },
  ];

  const formatTimeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hrs > 0) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    if (mins > 0) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pb-16">
      <Header />

      {/* ======================================================
          HERO CITIZEN ID BANNER (MATCHING MODERN THEME)
          ====================================================== */}
      <div className="bg-gradient-to-r from-[#0F2B5B] via-[#1D4ED8] to-[#0A192F] text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient decorative elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#F97316]/20 pointer-events-none blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#38BDF8]/20 pointer-events-none blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center shadow-xl border-2 border-white/30 text-white text-3xl font-black shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Citizen ID
                </span>
                <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-white/10 text-white/90 border border-white/20">
                  DPDP Protected
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {user?.name || 'Citizen Profile'}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 mt-1 flex flex-wrap items-center gap-3">
                <span>{user?.email}</span>
                {user?.phone && <span>• {user.phone}</span>}
                {editState && (
                  <span className="flex items-center gap-1">
                    • <MapPin className="w-3.5 h-3.5 text-[#F97316]" /> {editCity ? `${editCity}, ` : ''}{editState}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Profile Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex-1 md:flex-none h-11 px-6 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#F97316] text-white shadow-lg shadow-[#F97316]/25"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Profile Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                navigate('/');
                toast.success('Signed out successfully.');
              }}
              className="h-11 px-4 rounded-2xl font-bold text-xs bg-white/10 border-white/20 hover:bg-white/20 text-white"
            >
              <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* ======================================================
          MAIN DASHBOARD CONTENT
          ====================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {/* STATS METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-[#1D4ED8] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#0F2B5B]">
                {stats ? stats.savedSchemes : 0}
              </p>
              <p className="text-xs font-semibold text-gray-500">Saved Schemes</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] flex items-center justify-center text-[#F97316] shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#0F2B5B]">
                {stats ? stats.chatCount : 0}
              </p>
              <p className="text-xs font-semibold text-gray-500">AI Consultations</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] flex items-center justify-center text-[#16A34A] shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#0F2B5B]">
                {stats ? stats.totalActivities : 0}
              </p>
              <p className="text-xs font-semibold text-gray-500">Portal Actions</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#0F2B5B]">100%</p>
              <p className="text-xs font-semibold text-gray-500">Profile Complete</p>
            </div>
          </div>
        </div>

        {/* ======================================================
            INTERACTIVE PROFILE TABS
            ====================================================== */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap sm:inline-flex h-auto gap-1">
            <TabsTrigger
              value="personal"
              className="rounded-xl px-4 py-2.5 text-xs font-bold data-[state=active]:bg-[#1D4ED8] data-[state=active]:text-white gap-1.5"
            >
              <User className="w-3.5 h-3.5" /> Personal Details
            </TabsTrigger>
            <TabsTrigger
              value="location"
              className="rounded-xl px-4 py-2.5 text-xs font-bold data-[state=active]:bg-[#1D4ED8] data-[state=active]:text-white gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" /> Location & Address
            </TabsTrigger>
            <TabsTrigger
              value="education"
              className="rounded-xl px-4 py-2.5 text-xs font-bold data-[state=active]:bg-[#1D4ED8] data-[state=active]:text-white gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5" /> Education & Career
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-xl px-4 py-2.5 text-xs font-bold data-[state=active]:bg-[#1D4ED8] data-[state=active]:text-white gap-1.5"
            >
              <History className="w-3.5 h-3.5" /> Activity Log
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-xl px-4 py-2.5 text-xs font-bold data-[state=active]:bg-[#1D4ED8] data-[state=active]:text-white gap-1.5"
            >
              <Languages className="w-3.5 h-3.5" /> Language & Preferences
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: PERSONAL DETAILS ──────────────────────────── */}
          <TabsContent value="personal" className="space-y-6">
            <Card className="rounded-3xl border border-gray-200/80 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-black text-[#0F2B5B] flex items-center gap-2">
                  <User className="w-5 h-5 text-[#1D4ED8]" />
                  Personal Information & Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#0F172A]">Full Name (as per ID)</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-12 rounded-2xl text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#0F172A]">Registered Email Address</Label>
                    <Input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="h-12 rounded-2xl text-xs font-medium bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#0F172A]">Mobile Phone Number</Label>
                    <Input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="h-12 rounded-2xl text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#0F172A]">Date of Birth</Label>
                    <Input
                      type="date"
                      value={editDob}
                      onChange={(e) => setEditDob(e.target.value)}
                      className="h-12 rounded-2xl text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#0F172A]">Gender</Label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      className="h-12 w-full rounded-2xl px-3 text-xs font-semibold bg-white border border-gray-300 focus:border-[#1D4ED8]"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#0F172A]">Current Occupation</Label>
                    <select
                      value={editOccupation}
                      onChange={(e) => setEditOccupation(e.target.value)}
                      className="h-12 w-full rounded-2xl px-3 text-xs font-semibold bg-white border border-gray-300 focus:border-[#1D4ED8]"
                    >
                      <option value="Student">Student / Scholar</option>
                      <option value="Job Seeker">Job Seeker / Aspirant</option>
                      <option value="Working Professional">Working Professional</option>
                      <option value="Government Employee">Government Officer</option>
                      <option value="Farmer">Farmer / Agriculturist</option>
                      <option value="Business Owner">Business Owner</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#0F172A]">Social Category (Scheme Matching)</Label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="h-12 w-full rounded-2xl px-3 text-xs font-semibold bg-white border border-gray-300 focus:border-[#1D4ED8]"
                    >
                      <option value="General">General / Unreserved</option>
                      <option value="OBC">OBC (Other Backward Class)</option>
                      <option value="SC">SC (Scheduled Caste)</option>
                      <option value="ST">ST (Scheduled Tribe)</option>
                      <option value="EWS">EWS (Economically Weaker Section)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#0F172A]">Annual Family Income (₹)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 250000"
                      value={editIncome}
                      onChange={(e) => setEditIncome(e.target.value)}
                      className="h-12 rounded-2xl text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="h-11 px-8 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#0F2B5B] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#0F2B5B] text-white shadow-md"
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Personal Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 2: LOCATION & ADDRESS ────────────────────────── */}
          <TabsContent value="location" className="space-y-6">
            <Card className="rounded-3xl border border-gray-200/80 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-black text-[#0F2B5B] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#F97316]" />
                  Location & Citizen Jurisdiction
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#0F172A]">State / Union Territory</Label>
                    <select
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      className="h-12 w-full rounded-2xl px-3 text-xs font-semibold bg-white border border-gray-300 focus:border-[#1D4ED8]"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#0F172A]">City / District</Label>
                    <Input
                      placeholder="e.g., Pune, Lucknow, Jaipur"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="h-12 rounded-2xl text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#0F172A]">PIN Code (6 digits)</Label>
                    <Input
                      maxLength={6}
                      placeholder="e.g., 411001"
                      value={editPincode}
                      onChange={(e) => setEditPincode(e.target.value.replace(/\D/g, ''))}
                      className="h-12 rounded-2xl text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#1D4ED8]/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Landmark className="w-5 h-5 text-[#1D4ED8]" />
                    <div>
                      <p className="text-xs font-bold text-[#0F2B5B]">State AI Jurisdiction Enabled</p>
                      <p className="text-[11px] text-gray-600">
                        Government schemes for <span className="font-bold">{editState}</span> are automatically prioritized in your searches.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="h-11 px-8 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#0F2B5B] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#0F2B5B] text-white shadow-md"
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Location Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 3: EDUCATION & CAREER ────────────────────────── */}
          <TabsContent value="education" className="space-y-6">
            <Card className="rounded-3xl border border-gray-200/80 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-black text-[#0F2B5B] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#1D4ED8]" />
                  Academic Profile & Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#0F172A]">Highest Education Level</Label>
                    <select
                      value={editEduLevel}
                      onChange={(e) => setEditEduLevel(e.target.value)}
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
                    <Label className="text-xs font-bold text-[#0F172A]">Institution / School / University</Label>
                    <Input
                      placeholder="e.g., IIT Bombay / Delhi University"
                      value={editEduInstitution}
                      onChange={(e) => setEditEduInstitution(e.target.value)}
                      className="h-12 rounded-2xl text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#0F172A]">Degree / Course / Stream</Label>
                    <Input
                      placeholder="e.g., B.Tech Computer Science"
                      value={editEduDegree}
                      onChange={(e) => setEditEduDegree(e.target.value)}
                      className="h-12 rounded-2xl text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#0F172A]">Year / Batch</Label>
                    <Input
                      placeholder="e.g., 3rd Year / 2026"
                      value={editEduYear}
                      onChange={(e) => setEditEduYear(e.target.value)}
                      className="h-12 rounded-2xl text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#0F172A]">CGPA / Marks %</Label>
                    <Input
                      placeholder="e.g., 8.8 / 88%"
                      value={editEduCgpa}
                      onChange={(e) => setEditEduCgpa(e.target.value)}
                      className="h-12 rounded-2xl text-xs font-medium border-gray-300 focus:border-[#1D4ED8]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="h-11 px-8 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#0F2B5B] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#0F2B5B] text-white shadow-md"
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Academic Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 4: ACTIVITY HISTORY ──────────────────────────── */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="rounded-3xl border border-gray-200/80 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-black text-[#0F2B5B] flex items-center gap-2">
                  <History className="w-5 h-5 text-[#16A34A]" />
                  Citizen Activity & Audit Log
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingActivity ? (
                  <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1D4ED8]" />
                    <p className="text-xs font-medium">Loading recent citizen activities...</p>
                  </div>
                ) : activity.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-bold">No activity recorded yet</p>
                    <p className="text-xs mt-1">Check schemes or speak with the AI assistant to log actions.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activity.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-start justify-between gap-4 hover:bg-gray-100/60 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-200 shrink-0 mt-0.5">
                            <CheckCircle2 className="w-4 h-4 text-[#1D4ED8]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#0F172A]">{item.title}</p>
                            {item.detail && <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>}
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-gray-400 shrink-0">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 5: LANGUAGE & SETTINGS ───────────────────────── */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="rounded-3xl border border-gray-200/80 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-black text-[#0F2B5B] flex items-center gap-2">
                  <Languages className="w-5 h-5 text-[#F97316]" />
                  Language Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {languages.map((lang) => {
                    const active = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                          active
                            ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#0F2B5B] shadow-sm font-bold'
                            : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-white border border-gray-200">
                            {lang.flag}
                          </span>
                          {active && <CheckCircle2 className="w-4 h-4 text-[#1D4ED8]" />}
                        </div>
                        <p className="font-extrabold text-sm">{lang.nativeName}</p>
                        <p className="text-xs text-gray-500">{lang.name}</p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
