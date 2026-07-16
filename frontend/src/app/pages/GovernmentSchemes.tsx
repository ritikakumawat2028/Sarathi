import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAuth } from '@/app/context/AuthContext';
import { Header } from '@/app/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { SchemeDetailModal } from '@/app/components/SchemeDetailModal';
import { EligibilityResultModal } from '@/app/components/EligibilityResultModal';
import { governmentSchemes as fallbackSchemes, GovernmentScheme } from '@/app/data/governmentSchemes';
import { fetchSchemes, checkEligibility, SchemesMeta } from '@/app/lib/schemesApi';
import { api } from '@/app/lib/api';
import { toast } from 'sonner';
import { 
  FileText, 
  Search,
  CheckCircle,
  TrendingUp,
  Users,
  Heart,
  Home,
  Briefcase,
  GraduationCap,
  ExternalLink,
  Building,
  Loader2,
  WifiOff
} from 'lucide-react';

export function GovernmentSchemes() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEligibilityResultOpen, setIsEligibilityResultOpen] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [profileEligibleSchemes, setProfileEligibleSchemes] = useState<(GovernmentScheme & { matchReasons?: string[] })[]>([]);
  const [profileChecked, setProfileChecked] = useState(false);

  const [schemes, setSchemes] = useState<GovernmentScheme[]>(fallbackSchemes);
  const [schemesMeta, setSchemesMeta] = useState<SchemesMeta | null>(null);
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const [eligibilityResults, setEligibilityResults] = useState<{
    eligible: (GovernmentScheme & { matchReasons?: string[] })[];
    ineligible: GovernmentScheme[];
  }>({ eligible: [], ineligible: [] });

  // Eligibility checker form — pre-filled from profile
  const calcAge = () => {
    if (!user?.dateOfBirth) return '';
    const dob = new Date(user.dateOfBirth);
    return String(Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25)));
  };
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [income, setIncome] = useState(user?.annualIncome ? String(user.annualIncome) : '');
  const [age, setAge] = useState(calcAge());
  const [state, setState] = useState(user?.address?.state || '');
  const [category, setCategory] = useState(user?.category || '');
  const [gender, setGender] = useState(user?.gender || '');

  useEffect(() => {
    let cancelled = false;
    setIsLoadingSchemes(true);
    fetchSchemes()
      .then((res) => {
        if (cancelled) return;
        setSchemes(res.schemes);
        setSchemesMeta(res.meta);
        setIsOffline(false);
      })
      .catch(() => {
        if (cancelled) return;
        setSchemes(fallbackSchemes);
        setIsOffline(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSchemes(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Auto-check eligibility using user's profile when they open the page
  useEffect(() => {
    if (!user || profileChecked) return;
    setProfileChecked(true);
    api.post<{ eligible: any[]; ineligible: any[] }>('/eligibility/check', {})
      .then(res => {
        setProfileEligibleSchemes(res.eligible || []);
      })
      .catch(() => {});
  }, [user, profileChecked]);

  const categories = [
    { id: 'all', name: 'All Schemes', icon: FileText },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'health', name: 'Health', icon: Heart },
    { id: 'agriculture', name: 'Agriculture', icon: TrendingUp },
    { id: 'business', name: 'Business', icon: Briefcase },
    { id: 'housing', name: 'Housing', icon: Home },
    { id: 'employment', name: 'Employment', icon: Users },
    { id: 'social_security', name: 'Social Security', icon: Building },
  ];

  const filteredSchemes = schemes.filter((scheme) => {
    const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
    const matchesSearch = scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && scheme.isActive;
  });

  const eligibleSchemes = profileEligibleSchemes.length > 0 ? profileEligibleSchemes : schemes.filter(s => s.eligible && s.isActive);

  const handleViewDetails = (scheme: GovernmentScheme) => {
    setSelectedScheme(scheme);
    setIsDetailModalOpen(true);
  };

  const handleCheckEligibility = async () => {
    if (!occupation) {
      toast.error('Please select your occupation');
      return;
    }
    setIsCheckingEligibility(true);
    try {
      const result = await api.post<{ eligible: any[]; ineligible: any[]; profileUsed: any }>('/eligibility/check', {
        occupation, income, age, gender, category, state,
      });
      setEligibilityResults({ eligible: result.eligible || [], ineligible: result.ineligible || [] });
    } catch {
      // Simple local fallback
      const incomeNum = parseInt(income) || 0;
      const ageNum = parseInt(age) || 25;
      const eligible = schemes.filter(s => s.isActive && (
        (s.category === 'education' && incomeNum < 600000) ||
        (s.category === 'health' && incomeNum < 500000) ||
        (s.category === 'agriculture' && occupation === 'farmer') ||
        (s.category === 'employment' && ageNum >= 15 && ageNum <= 45)
      ));
      setEligibilityResults({ eligible, ineligible: [] });
    } finally {
      setIsCheckingEligibility(false);
    }
    setSelectedScheme(null);
    setIsEligibilityResultOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            {t('govSchemes')}
          </h1>
          <p className="text-gray-600 flex items-center gap-2 flex-wrap">
            <span>Discover {schemes.filter(s => s.isActive).length} active government schemes you are eligible for</span>
            {isLoadingSchemes && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <Loader2 className="w-3 h-3 animate-spin" /> syncing live data...
              </span>
            )}
            {!isLoadingSchemes && isOffline && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                <WifiOff className="w-3 h-3" /> Backend unreachable — showing offline data
              </span>
            )}
            {!isLoadingSchemes && !isOffline && schemesMeta && (
              <span className="text-xs text-gray-400">
                Updated {new Date(schemesMeta.generatedAt).toLocaleString()}
              </span>
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Eligible Schemes</p>
                  <p className="text-3xl font-bold text-green-600">{eligibleSchemes.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Schemes</p>
                  <p className="text-3xl font-bold">{schemes.filter(s => s.isActive).length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Saved Schemes</p>
                  <p className="text-3xl font-bold">{savedSchemes.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Schemes</TabsTrigger>
            <TabsTrigger value="eligible">Eligible for You</TabsTrigger>
            <TabsTrigger value="checker">Eligibility Checker</TabsTrigger>
          </TabsList>

          {/* Browse Schemes */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filter */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search schemes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <Button
                          key={cat.id}
                          variant={selectedCategory === cat.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedCategory(cat.id)}
                          className="gap-2"
                        >
                          <Icon className="w-4 h-4" />
                          {cat.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schemes List */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredSchemes.map((scheme) => {
                const categoryIcon = categories.find(c => c.id === scheme.category)?.icon || FileText;
                const Icon = categoryIcon;
                return (
                  <Card key={scheme.id} className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base leading-tight">{scheme.name}</CardTitle>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {scheme.category}
                            </Badge>
                          </div>
                        </div>
                        {scheme.eligible && (
                          <Badge className="bg-green-600 flex-shrink-0">Eligible</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-700">{scheme.description}</p>
                      
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <p className="text-xs font-medium text-green-800">
                          <strong>Benefits:</strong> {scheme.benefits}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          onClick={() => handleViewDetails(scheme)}
                        >
                          {t('viewDetails')}
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(scheme.officialLink, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Eligible Schemes */}
          <TabsContent value="eligible" className="space-y-6">
            <Card className="border" style={{ borderColor: 'rgba(30,58,138,0.2)', background: 'linear-gradient(135deg, rgba(30,58,138,0.04), rgba(232,114,12,0.04))' }}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #1E3A8A, #3B5BBD)' }}>
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {eligibleSchemes.length > 0 ? `You are eligible for ${eligibleSchemes.length} schemes!` : 'Running eligibility check...'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {user ? 'Based on your profile — gender, category, income, education and occupation.' : 'Log in to get personalized eligibility based on your profile.'}
                    </p>
                    {!user && (
                      <Button size="sm" className="mt-3 text-white" style={{ background: 'linear-gradient(135deg, #E8720C, #F59E0B)' }}
                        onClick={() => navigate('/login')}>Login for Personalized Results</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {eligibleSchemes.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No eligible schemes found. Try updating your profile with income, occupation and category for better results.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/profile')}>Update Profile</Button>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {eligibleSchemes.map((scheme: any) => {
                const categoryIcon = categories.find(c => c.id === scheme.category)?.icon || FileText;
                const Icon = categoryIcon;
                return (
                  <Card key={scheme.id} className="border hover:shadow-xl transition-all hover:-translate-y-0.5" style={{ borderColor: 'rgba(30,58,138,0.2)' }}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(30,58,138,0.1)' }}>
                            <Icon className="w-6 h-6" style={{ color: '#1E3A8A' }} />
                          </div>
                          <CardTitle className="text-sm font-semibold leading-snug" style={{ fontFamily: 'Outfit, sans-serif' }}>{scheme.name}</CardTitle>
                        </div>
                        <Badge className="text-white flex-shrink-0 ml-2" style={{ backgroundColor: '#10B981' }}>✓ Eligible</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">{scheme.description}</p>
                      {/* Match reasons */}
                      {scheme.matchReasons && scheme.matchReasons.length > 0 && (
                        <div className="rounded-lg p-3 text-xs space-y-1" style={{ backgroundColor: 'rgba(16,185,129,0.06)', borderLeft: '3px solid #10B981' }}>
                          <p className="font-semibold text-green-700 mb-1">Why you qualify:</p>
                          {scheme.matchReasons.map((r: string, i: number) => (
                            <p key={i} className="text-green-700">• {r}</p>
                          ))}
                        </div>
                      )}
                      <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(30,58,138,0.05)' }}>
                        <p className="text-xs text-gray-700"><strong>Benefits:</strong> {scheme.benefits}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 text-white" style={{ background: 'linear-gradient(135deg, #1E3A8A, #3B5BBD)' }}
                          onClick={() => handleViewDetails(scheme)}>
                          How to Apply
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => window.open(scheme.officialLink, '_blank')}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Eligibility Checker */}
          <TabsContent value="checker" className="space-y-6">
            <Card className="border" style={{ borderColor: 'rgba(232,114,12,0.15)' }}>
              <CardHeader>
                <CardTitle className="text-xl" style={{ fontFamily: 'Outfit, sans-serif' }}>{t('checkEligibility')}</CardTitle>
                <p className="text-sm text-gray-500">
                  {user ? '✅ Pre-filled from your profile — update any field and check' : 'Fill in your details to find matching government schemes'}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Occupation *</Label>
                    <Select value={occupation} onValueChange={setOccupation}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="farmer">Farmer</SelectItem>
                        <SelectItem value="employed">Salaried Employee</SelectItem>
                        <SelectItem value="self-employed">Self-Employed</SelectItem>
                        <SelectItem value="business">Business Owner</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                        <SelectItem value="homemaker">Homemaker</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Annual Family Income (₹)</Label>
                    <Input type="number" placeholder="e.g., 300000" value={income} onChange={e => setIncome(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Your Age</Label>
                    <Input type="number" placeholder="e.g., 22" value={age} onChange={e => setAge(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input placeholder="e.g., Maharashtra" value={state} onChange={e => setState(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="obc">OBC</SelectItem>
                        <SelectItem value="sc">SC</SelectItem>
                        <SelectItem value="st">ST</SelectItem>
                        <SelectItem value="ews">EWS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  className="w-full text-white font-semibold"
                  style={{ background: 'linear-gradient(135deg, #E8720C, #F59E0B)' }}
                  onClick={handleCheckEligibility}
                  disabled={isCheckingEligibility}
                >
                  {isCheckingEligibility ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Checking...</> : 'Check My Eligibility'}
                </Button>
              </CardContent>
            </Card>

            {/* AI Assistant Card */}
            <Card className="border-2 bg-gradient-to-r from-orange-50 to-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Need Help?</h3>
                    <p className="text-gray-700 mb-4">
                      Our AI assistant can explain any government scheme in simple language and guide you through the application process.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/chat')}
                    >
                      Chat with AI Assistant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <SchemeDetailModal
        scheme={selectedScheme}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      <EligibilityResultModal
        eligibleSchemes={eligibilityResults.eligible}
        ineligibleSchemes={eligibilityResults.ineligible}
        isOpen={isEligibilityResultOpen}
        onClose={() => setIsEligibilityResultOpen(false)}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}
