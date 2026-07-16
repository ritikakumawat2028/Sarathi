import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { Header } from '@/app/components/Header';
import { GovernmentSchemesNav } from '@/app/components/schemes/GovernmentSchemesNav';
import { SchemeCard, SchemeItem } from '@/app/components/schemes/SchemeCard';
import { api } from '@/app/lib/api';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Loader2,
  Building2,
  GraduationCap,
  HeartPulse,
  Briefcase,
  Home,
  Sprout
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent } from '@/app/components/ui/card';

export function GovernmentSchemesLanding() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('Central');
  const [stateSchemes, setStateSchemes] = useState<SchemeItem[]>([]);

  // Compare & Favorites state kept in local storage for instant UI persistence
  const [favorites, setFavorites] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('saved_schemes') || '[]'); } catch { return []; }
  });
  const [compared, setCompared] = useState<SchemeItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('compare_schemes') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    api.get<{ schemes: SchemeItem[] }>('/schemes?limit=30')
      .then(res => setSchemes(res.schemes || []))
      .catch(() => setSchemes([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get<{ availableSchemes: SchemeItem[] }>(`/schemes/state-explorer/${selectedState}`)
      .then(res => setStateSchemes(res.availableSchemes || []))
      .catch(() => setStateSchemes([]));
  }, [selectedState]);

  const toggleFavorite = async (id: number) => {
    const isFav = favorites.includes(id);
    const updated = isFav ? favorites.filter(favId => favId !== id) : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('saved_schemes', JSON.stringify(updated));

    try {
      if (isFav) {
        await api.del(`/schemes/saved/${id}`);
      } else {
        await api.post('/schemes/saved', { schemeId: id });
      }
    } catch {}
  };

  const toggleCompare = (scheme: SchemeItem) => {
    const isComp = compared.some(c => c.id === scheme.id);
    const updated = isComp 
      ? compared.filter(c => c.id !== scheme.id) 
      : compared.length < 4 ? [...compared, scheme] : compared;
    setCompared(updated);
    localStorage.setItem('compare_schemes', JSON.stringify(updated));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/government-schemes/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/government-schemes/search');
    }
  };

  const categories = [
    { id: 'agriculture', nameEn: 'Agriculture', nameHi: 'कृषि', icon: Sprout, color: 'text-green-600 bg-green-50' },
    { id: 'education', nameEn: 'Education & Scholarship', nameHi: 'शिक्षा व छात्रवृत्ति', icon: GraduationCap, color: 'text-blue-600 bg-blue-50' },
    { id: 'health', nameEn: 'Health & Wellness', nameHi: 'स्वास्थ्य सेवा', icon: HeartPulse, color: 'text-rose-600 bg-rose-50' },
    { id: 'business', nameEn: 'Business & Loans', nameHi: 'व्यवसाय व ऋण', icon: Briefcase, color: 'text-amber-600 bg-amber-50' },
    { id: 'housing', nameEn: 'Housing & Shelter', nameHi: 'आवास योजना', icon: Home, color: 'text-purple-600 bg-purple-50' },
    { id: 'social_security', nameEn: 'Social Security', nameHi: 'सामाजिक सुरक्षा', icon: Building2, color: 'text-indigo-600 bg-indigo-50' }
  ];

  const popularSearches = ['Student Scholarship', 'Farmer Subsidy', 'Mudra Loan', 'Ayushman Bharat', 'PM Awas Yojana', 'Women Empowerment'];
  const indianStates = ['Central', 'Maharashtra', 'Uttar Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'West Bengal', 'Bihar'];

  const trendingSchemes = schemes.slice(0, 4);
  const featuredSchemes = schemes.slice(4, 8);
  const recentlyAdded = schemes.slice(-4).reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-green-50/50 flex flex-col">
      <Header />
      <GovernmentSchemesNav compareCount={compared.length} favoritesCount={favorites.length} />

      <main className="flex-1 pb-16">
        {/* ── Hero Section ────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-green-600 text-white py-14 px-4 sm:px-6 lg:px-8 shadow-md">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
          
          <div className="max-w-5xl mx-auto relative z-10 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-semibold mb-4 border border-white/30">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>{language === 'hi' ? 'भारत सरकार की 100% सत्यापित योजनाएं' : '100% Verified Government of India Schemes'}</span>
            </span>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              {language === 'hi' ? 'अपनी पात्रता के अनुसार सही सरकारी योजनाएं खोजें' : 'Discover Government Schemes Tailored For You'}
            </h1>

            <p className="text-lg sm:text-xl text-orange-100 max-w-2xl mx-auto mb-8">
              {language === 'hi'
                ? 'छात्र, किसान, महिला, और छोटे व्यवसायी — एक ही स्थान पर सभी केंद्रीय व राज्य स्तरीय योजनाओं की जानकारी लें और आवेदन करें।'
                : 'Explore financial subsidies, student scholarships, healthcare coverage, and business loans across Central & State governments.'}
            </p>

            {/* Smart Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl shadow-2xl border border-white/40">
                <div className="relative flex-1 flex items-center">
                  <Search className="w-5 h-5 text-gray-400 absolute left-4" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={language === 'hi' ? 'योजना खोजें (उदा: छात्रवृत्ति, किसान, लोन, स्वास्थ्य)...' : 'Try "I am a student", "Farmer subsidy", "Business loan"...'}
                    className="pl-12 border-0 focus-visible:ring-0 text-gray-800 text-base h-12"
                  />
                </div>
                <Button type="submit" className="h-12 px-8 rounded-xl bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-bold shadow-lg">
                  {language === 'hi' ? 'खोजें' : 'Search Schemes'}
                </Button>
              </div>
            </form>

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-sm">
              <span className="text-orange-100 font-medium">{language === 'hi' ? 'लोकप्रिय खोजें:' : 'Popular:'}</span>
              {popularSearches.map(tag => (
                <Link
                  key={tag}
                  to={`/government-schemes/search?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors text-xs font-medium backdrop-blur-sm"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI Recommendation Banner ────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
          <Card className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-2 border-orange-500/40 shadow-2xl rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-green-500 flex items-center justify-center shrink-0 shadow-lg">
                  <Sparkles className="w-7 h-7 text-white animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {language === 'hi' ? 'AI द्वारा व्यक्तिगत योजना सिफारिशें प्राप्त करें' : 'Get Personalized AI Scheme Recommendations'}
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-base mt-1">
                    {language === 'hi'
                      ? 'अपनी आयु, आय और व्यवसाय बताएं — Sarthi आपके लिए सबसे उपयुक्त योजनाएं चुनेगा।'
                      : 'Powered by Google Gemini AI. Answer a few questions and let AI match you with eligible high-priority schemes.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                <Link to="/government-schemes/recommendations">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-bold px-6 py-5 rounded-xl shadow-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{language === 'hi' ? 'AI सिफारिशें देखें' : 'Get AI Recommendations'}</span>
                  </Button>
                </Link>
                <Link to="/government-schemes/eligibility">
                  <Button variant="outline" className="w-full sm:w-auto border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white font-semibold px-6 py-5 rounded-xl">
                    <span>{language === 'hi' ? 'पात्रता जांचें' : 'Eligibility Wizard'}</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Popular Categories ──────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'hi' ? 'लोकप्रिय श्रेणियां' : 'Popular Categories'}
              </h2>
              <p className="text-sm text-gray-600">
                {language === 'hi' ? 'अपनी आवश्यकता के अनुसार क्षेत्र चुनें' : 'Browse schemes by sector'}
              </p>
            </div>
            <Link to="/government-schemes/search">
              <Button variant="ghost" className="text-orange-600 hover:text-orange-700 font-semibold">
                {language === 'hi' ? 'सभी देखें' : 'View All'} →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  to={`/government-schemes/search?category=${cat.id}`}
                  className="bg-white border-2 border-gray-100 hover:border-orange-400 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:shadow-lg group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-gray-800 text-sm group-hover:text-orange-600">
                    {language === 'hi' ? cat.nameHi : cat.nameEn}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Trending Schemes ────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'hi' ? 'ट्रेंडिंग सरकारी योजनाएं' : 'Trending Schemes'}
              </h2>
            </div>
            <Link to="/government-schemes/search">
              <Button variant="outline" size="sm">
                {language === 'hi' ? 'सभी देखें' : 'View All'}
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingSchemes.map((scheme) => (
                <SchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  isFavorite={favorites.includes(scheme.id)}
                  onToggleFavorite={toggleFavorite}
                  isCompared={compared.some(c => c.id === scheme.id)}
                  onToggleCompare={toggleCompare}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── State-wise Explorer ─────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-gradient-to-r from-orange-50 to-green-50 border-2 border-orange-200 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-semibold text-xs mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>State Explorer</span>
                </span>
                <h2 className="text-2xl font-bold text-gray-900">
                  {language === 'hi' ? 'राज्य-वार योजना अन्वेषक' : 'India State Explorer'}
                </h2>
                <p className="text-sm text-gray-600">
                  {language === 'hi' ? 'अपने राज्य में उपलब्ध योजनाओं की जांच करें' : 'Select your state to discover applicable Central & State schemes'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {indianStates.map((state) => (
                  <button
                    key={state}
                    onClick={() => setSelectedState(state)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      selectedState === state
                        ? 'bg-gradient-to-r from-orange-500 to-green-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-orange-100 border border-gray-200'
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stateSchemes.slice(0, 4).map((scheme) => (
                <SchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  isFavorite={favorites.includes(scheme.id)}
                  onToggleFavorite={toggleFavorite}
                  isCompared={compared.some(c => c.id === scheme.id)}
                  onToggleCompare={toggleCompare}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured & Recently Added Schemes ───────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'hi' ? 'हाल ही में जोड़ी गई योजनाएं' : 'Recently Added & Featured'}
              </h2>
            </div>
            <Link to="/government-schemes/search">
              <Button variant="outline" size="sm">
                {language === 'hi' ? 'अधिक खोजें' : 'Explore More'}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyAdded.map((scheme) => (
              <SchemeCard
                key={`recent-${scheme.id}`}
                scheme={scheme}
                isFavorite={favorites.includes(scheme.id)}
                onToggleFavorite={toggleFavorite}
                isCompared={compared.some(c => c.id === scheme.id)}
                onToggleCompare={toggleCompare}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
