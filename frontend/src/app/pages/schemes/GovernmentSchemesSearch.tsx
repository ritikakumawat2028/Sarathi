import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { Header } from '@/app/components/Header';
import { GovernmentSchemesNav } from '@/app/components/schemes/GovernmentSchemesNav';
import { SchemeCard, SchemeItem } from '@/app/components/schemes/SchemeCard';
import { api } from '@/app/lib/api';
import { 
  Search, 
  Filter, 
  X, 
  Loader2, 
  Sparkles,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

export function GovernmentSchemesSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'all');
  const [selectedOccupation, setSelectedOccupation] = useState(searchParams.get('occupation') || 'all');
  const [centralOrState, setCentralOrState] = useState('all');

  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [favorites, setFavorites] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('saved_schemes') || '[]'); } catch { return []; }
  });
  const [compared, setCompared] = useState<SchemeItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('compare_schemes') || '[]'); } catch { return []; }
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setLoading(true);
    const queryParts = [];
    if (searchTerm.trim()) queryParts.push(`q=${encodeURIComponent(searchTerm.trim())}`);
    if (selectedCategory !== 'all') queryParts.push(`category=${encodeURIComponent(selectedCategory)}`);
    if (selectedState !== 'all') queryParts.push(`state=${encodeURIComponent(selectedState)}`);
    if (selectedOccupation !== 'all') queryParts.push(`occupation=${encodeURIComponent(selectedOccupation)}`);

    const url = `/schemes/search?${queryParts.join('&')}`;

    api.get<{ schemes: SchemeItem[] }>(url)
      .then(res => {
        let list = res.schemes || [];
        if (centralOrState === 'Central') {
          list = list.filter(s => !s.state || s.state === 'Central');
        } else if (centralOrState === 'State') {
          list = list.filter(s => s.state && s.state !== 'Central');
        }
        setSchemes(list);
        setCurrentPage(1);
      })
      .catch(() => setSchemes([]))
      .finally(() => setLoading(false));
  }, [searchTerm, selectedCategory, selectedState, selectedOccupation, centralOrState]);

  const toggleFavorite = (id: number) => {
    const isFav = favorites.includes(id);
    const updated = isFav ? favorites.filter(favId => favId !== id) : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('saved_schemes', JSON.stringify(updated));
  };

  const toggleCompare = (scheme: SchemeItem) => {
    const isComp = compared.some(c => c.id === scheme.id);
    const updated = isComp 
      ? compared.filter(c => c.id !== scheme.id) 
      : compared.length < 4 ? [...compared, scheme] : compared;
    setCompared(updated);
    localStorage.setItem('compare_schemes', JSON.stringify(updated));
  };

  const naturalLanguageExamples = [
    'I am a student',
    'Farmer subsidy',
    'Scholarship',
    'Business loan',
    'Housing scheme'
  ];

  const totalPages = Math.ceil(schemes.length / itemsPerPage) || 1;
  const paginatedSchemes = schemes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-green-50/40 flex flex-col">
      <Header />
      <GovernmentSchemesNav compareCount={compared.length} favoritesCount={favorites.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {language === 'hi' ? 'स्मार्ट योजना खोज' : 'Smart Scheme Search'}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {language === 'hi'
              ? 'कीवर्ड, श्रेणी, राज्य या प्राकृतिक भाषा द्वारा खोजें'
              : 'Search across all Central & State government schemes with natural language support'}
          </p>
        </div>

        {/* Natural Language Search Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border-2 border-orange-100 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'hi' ? 'उदा: "मैं छात्र हूं", "किसान सब्सिडी", "लोन"...' : 'Type natural query e.g. "I am a student", "Farmer subsidy", "Scholarship"...'}
                className="pl-12 h-12 text-base border-gray-300 focus:border-orange-500 rounded-xl"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Natural Language Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
            <span className="text-gray-500 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>{language === 'hi' ? 'उदाहरण:' : 'Try Examples:'}</span>
            </span>
            {naturalLanguageExamples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setSearchTerm(ex)}
                className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 font-medium transition-colors border border-orange-200"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Layout: Filters Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm h-fit">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-orange-600" />
                <span>{language === 'hi' ? 'फ़िल्टर' : 'Filters'}</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedState('all');
                  setSelectedOccupation('all');
                  setCentralOrState('all');
                  setSearchTerm('');
                }}
                className="text-xs font-semibold text-orange-600 hover:underline"
              >
                {language === 'hi' ? 'रीसेट करें' : 'Reset All'}
              </button>
            </div>

            {/* Central vs State */}
            <div>
              <Label className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 block">
                {language === 'hi' ? 'स्तर' : 'Government Level'}
              </Label>
              <div className="flex flex-col gap-1.5">
                {['all', 'Central', 'State'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setCentralOrState(lvl)}
                    className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      centralOrState === lvl
                        ? 'bg-orange-50 text-orange-700 font-semibold border border-orange-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {lvl === 'all' ? (language === 'hi' ? 'सभी' : 'All Levels') : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Label className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 block">
                {language === 'hi' ? 'श्रेणी' : 'Category'}
              </Label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-sm text-gray-800 bg-white"
              >
                <option value="all">{language === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}</option>
                <option value="agriculture">{language === 'hi' ? 'कृषि' : 'Agriculture'}</option>
                <option value="education">{language === 'hi' ? 'शिक्षा व छात्रवृत्ति' : 'Education & Scholarship'}</option>
                <option value="health">{language === 'hi' ? 'स्वास्थ्य' : 'Health'}</option>
                <option value="business">{language === 'hi' ? 'व्यवसाय व ऋण' : 'Business & Loans'}</option>
                <option value="housing">{language === 'hi' ? 'आवास' : 'Housing'}</option>
                <option value="social_security">{language === 'hi' ? 'सामाजिक सुरक्षा' : 'Social Security'}</option>
              </select>
            </div>

            {/* Occupation Filter */}
            <div>
              <Label className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 block">
                {language === 'hi' ? 'लक्षित समूह / पेशा' : 'Target Group / Occupation'}
              </Label>
              <select
                value={selectedOccupation}
                onChange={(e) => setSelectedOccupation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-sm text-gray-800 bg-white"
              >
                <option value="all">{language === 'hi' ? 'सभी समूह' : 'All Groups'}</option>
                <option value="student">{language === 'hi' ? 'छात्र' : 'Student'}</option>
                <option value="farmer">{language === 'hi' ? 'किसान' : 'Farmer'}</option>
                <option value="business_owner">{language === 'hi' ? 'व्यवसाय मालिक' : 'Business Owner'}</option>
                <option value="women">{language === 'hi' ? 'महिलाएं' : 'Women'}</option>
                <option value="senior_citizen">{language === 'hi' ? 'वरिष्ठ नागरिक' : 'Senior Citizen'}</option>
                <option value="disabled">{language === 'hi' ? 'दिव्यांग' : 'Disabled'}</option>
              </select>
            </div>

            {/* State Selection */}
            <div>
              <Label className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 block">
                {language === 'hi' ? 'राज्य' : 'State'}
              </Label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-sm text-gray-800 bg-white"
              >
                <option value="all">{language === 'hi' ? 'सभी राज्य (All India)' : 'All States'}</option>
                <option value="Central">Central (Government of India)</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Delhi">Delhi</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Rajasthan">Rajasthan</option>
              </select>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-700">
                {language === 'hi' ? `कुल ${schemes.length} योजनाएं मिलीं` : `Found ${schemes.length} schemes matching criteria`}
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-3" />
                <p className="text-gray-500 font-medium">{language === 'hi' ? 'योजनाएं खोजी जा रही हैं...' : 'Searching schemes...'}</p>
              </div>
            ) : paginatedSchemes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border p-6">
                <p className="text-lg font-bold text-gray-700 mb-2">{language === 'hi' ? 'कोई योजना नहीं मिली' : 'No matching schemes found'}</p>
                <p className="text-sm text-gray-500 mb-6">{language === 'hi' ? 'कृपया अपने फ़िल्टर रीसेट करें या कीवर्ड बदलें' : 'Try adjusting your search keywords or resetting the filters'}</p>
                <Button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSelectedState('all'); setSelectedOccupation('all'); }}>
                  {language === 'hi' ? 'फ़िल्टर रीसेट करें' : 'Reset Filters'}
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedSchemes.map((scheme) => (
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-semibold px-4">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
