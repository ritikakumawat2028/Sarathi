import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { Header } from '@/app/components/Header';
import { GovernmentSchemesNav } from '@/app/components/schemes/GovernmentSchemesNav';
import { SchemeCard, SchemeItem } from '@/app/components/schemes/SchemeCard';
import { api } from '@/app/lib/api';
import { 
  Building2, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  Share2, 
  Printer, 
  Heart, 
  Sparkles, 
  Loader2, 
  ArrowLeft,
  Calendar,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface DetailedScheme extends SchemeItem {
  howToApply?: string[];
  documents?: string[];
  ministry?: string;
  applicationLink?: string;
  lastUpdated?: string;
}

export function GovernmentSchemeDetail() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();

  const [scheme, setScheme] = useState<DetailedScheme | null>(null);
  const [related, setRelated] = useState<SchemeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [aiSummary, setAiSummary] = useState<{
    summary?: string;
    faqs?: { q: string; a: string }[];
  } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [copied, setCopied] = useState(false);

  const [favorites, setFavorites] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('saved_schemes') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get<{ scheme: DetailedScheme; related?: SchemeItem[] }>(`/schemes/${id}`)
      .then(res => {
        setScheme(res.scheme);
        setRelated(res.related || []);

        // Log view to history
        api.post('/schemes/history', {
          type: 'view',
          title: res.scheme.name,
          detail: res.scheme.category,
          schemeId: res.scheme.id
        }).catch(() => {});
      })
      .catch(() => setScheme(null))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchAISummary = async () => {
    if (!scheme) return;
    setLoadingAI(true);
    try {
      const res = await api.post<{ summary: string; faqs: { q: string; a: string }[] }>(`/schemes/${scheme.id}/ai-summary`, {});
      setAiSummary(res);
    } catch {}
    setLoadingAI(false);
  };

  const toggleFavorite = () => {
    if (!scheme) return;
    const isFav = favorites.includes(scheme.id);
    const updated = isFav ? favorites.filter(favId => favId !== scheme.id) : [...favorites, scheme.id];
    setFavorites(updated);
    localStorage.setItem('saved_schemes', JSON.stringify(updated));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-green-50/40 flex flex-col">
        <Header />
        <GovernmentSchemesNav />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-green-50/40 flex flex-col">
        <Header />
        <GovernmentSchemesNav />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Scheme Not Found</h1>
          <Link to="/government-schemes/search">
            <Button>Back to Schemes</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.includes(scheme.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-green-50/40 flex flex-col">
      <Header />
      <GovernmentSchemesNav favoritesCount={favorites.length} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full print:p-0">
        <Link to="/government-schemes/search" className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 mb-6 print:hidden">
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'hi' ? 'खोज पर वापस जाएं' : 'Back to Scheme Search'}</span>
        </Link>

        {/* Top Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border shadow-md relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-green-600" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-2">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-orange-100 text-orange-800 uppercase font-bold">
                  {scheme.category}
                </Badge>
                <Badge variant="outline" className="text-gray-700">
                  {scheme.state || 'Central Government'}
                </Badge>
                <Badge variant="secondary" className="text-gray-700">
                  {scheme.applicationMode || 'Online Mode'}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                {scheme.name}
              </h1>

              {scheme.ministry && (
                <p className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <span>{scheme.ministry}</span>
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFavorite}
                className={`gap-1.5 ${isFavorite ? 'text-red-600 border-red-300 bg-red-50' : ''}`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{isFavorite ? (language === 'hi' ? 'सहेजा गया' : 'Saved') : (language === 'hi' ? 'सहेजें' : 'Save')}</span>
              </Button>

              <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
                <Share2 className="w-4 h-4" />
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </Button>

              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {/* Overview Section */}
            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg font-bold text-gray-800">
                  {language === 'hi' ? 'योजना का विवरण' : 'Scheme Overview'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {scheme.fullDescription || scheme.description}
                </p>
              </CardContent>
            </Card>

            {/* Benefits Breakdown */}
            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-3 border-b bg-gradient-to-r from-orange-50/50 to-green-50/50">
                <CardTitle className="text-lg font-bold text-orange-900">
                  {language === 'hi' ? 'प्रदान किए जाने वाले मुख्य लाभ' : 'Key Benefits Provided'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-gray-800 font-semibold leading-relaxed">
                  {scheme.benefits}
                </div>
              </CardContent>
            </Card>

            {/* Eligibility Criteria */}
            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg font-bold text-gray-800">
                  {language === 'hi' ? 'पात्रता मापदंड' : 'Eligibility Criteria'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {(scheme.eligibility || []).map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Gemini AI Summary & FAQs Section */}
            <Card className="border-2 border-orange-300 shadow-md bg-white">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-green-600 text-white flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span>{language === 'hi' ? 'Gemini AI सारांश और सामान्य प्रश्न' : 'Gemini AI Instant Summary & FAQs'}</span>
                </CardTitle>
                {!aiSummary && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={fetchAISummary}
                    disabled={loadingAI}
                    className="bg-white text-orange-700 font-bold hover:bg-orange-50 shrink-0"
                  >
                    {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate AI FAQs'}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-6">
                {aiSummary ? (
                  <div className="space-y-5">
                    <div className="p-4 rounded-xl bg-gray-50 border">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">AI Executive Summary</p>
                      <p className="text-gray-800 font-medium">{aiSummary.summary}</p>
                    </div>

                    {aiSummary.faqs && aiSummary.faqs.length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-orange-600" />
                          <span>Practical FAQs</span>
                        </h4>
                        <div className="space-y-3">
                          {aiSummary.faqs.map((f, i) => (
                            <div key={i} className="p-3.5 rounded-xl border bg-white">
                              <p className="font-bold text-gray-900 text-sm mb-1">Q: {f.q}</p>
                              <p className="text-gray-600 text-sm">A: {f.a}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Click "Generate AI FAQs" above to let Gemini AI answer common questions regarding required eligibility and document verification for this scheme.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Application Steps & Required Documents */}
          <div className="lg:col-span-4 space-y-6">
            {/* Direct Application Card */}
            <Card className="bg-white border-2 border-green-500 shadow-lg">
              <CardContent className="p-6 space-y-4 text-center">
                <h3 className="font-bold text-lg text-gray-900">
                  {language === 'hi' ? 'आधिकारिक पोर्टल पर आवेदन करें' : 'Ready to Apply?'}
                </h3>
                <p className="text-xs text-gray-600">
                  {language === 'hi'
                    ? 'कृपया आवेदन के लिए केवल भारत सरकार के आधिकारिक पोर्टल का उपयोग करें।'
                    : 'Applications are submitted directly through the verified Government portal.'}
                </p>

                {scheme.officialLink ? (
                  <a
                    href={scheme.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-bold shadow-md transition-all"
                  >
                    <span>{language === 'hi' ? 'आधिकारिक वेबसाइट पर जाएं' : 'Visit Official Portal'}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <Button disabled className="w-full">
                    Official Portal Link Available Soon
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Required Documents */}
            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  <span>{language === 'hi' ? 'आवश्यक दस्तावेज' : 'Required Documents'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <ul className="space-y-2.5">
                  {(scheme.documents || ['Aadhaar Card', 'Passport size photo', 'Bank Account details']).map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Schemes */}
        {related.length > 0 && (
          <section className="mt-16 pt-8 border-t print:hidden">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {language === 'hi' ? 'संबंधित सरकारी योजनाएं' : 'Related Government Schemes'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((item) => (
                <SchemeCard key={item.id} scheme={item} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
