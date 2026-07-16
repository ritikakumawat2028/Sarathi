import React, { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { Header } from '@/app/components/Header';
import { GovernmentSchemesNav } from '@/app/components/schemes/GovernmentSchemesNav';
import { SchemeCard, SchemeItem } from '@/app/components/schemes/SchemeCard';
import { api } from '@/app/lib/api';
import { 
  Sparkles, 
  CheckCircle, 
  Award, 
  Loader2, 
  ArrowRight, 
  RefreshCw, 
  Info 
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface AIRecommendationItem {
  scheme: SchemeItem;
  priority: 'High' | 'Medium';
  estimatedEligibility: string;
  whyUserQualifies: string;
  benefitsSummary: string;
  alternativeSchemes?: string[];
}

export function GovernmentSchemesRecommendations() {
  const { language } = useLanguage();

  const [age, setAge] = useState('22');
  const [gender, setGender] = useState('male');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Pune');
  const [income, setIncome] = useState('180000');
  const [occupation, setOccupation] = useState('student');
  const [education, setEducation] = useState('Graduate');
  const [disability, setDisability] = useState(false);
  const [casteCategory, setCasteCategory] = useState('General');
  const [employmentStatus, setEmploymentStatus] = useState('Student');

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendationItem[] | null>(null);

  const handleGetRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ recommendations: AIRecommendationItem[] }>('/schemes/recommendations', {
        age: parseInt(age, 10),
        gender,
        state,
        district,
        income: parseInt(income, 10),
        occupation,
        education,
        disability,
        casteCategory,
        employmentStatus
      });
      setRecommendations(res.recommendations || []);

      // Automatically log activity so Dashboard updates immediately
      await api.post('/user/activity', {
        type: 'scheme',
        title: 'Checked AI Scheme Recommendations',
        detail: `Found ${res.recommendations?.length || 0} tailored AI recommendations`
      }).catch((err) => console.log('Log recommendations error:', err));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-green-50/40 flex flex-col">
      <Header />
      <GovernmentSchemesNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>{language === 'hi' ? 'Gemini AI द्वारा संचालित' : 'Powered by Google Gemini AI'}</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            {language === 'hi' ? 'व्यक्तिगत AI योजना सिफारिशें' : 'AI Scheme Recommendation System'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-2xl mx-auto">
            {language === 'hi'
              ? 'अपनी प्रोफ़ाइल विवरण भरें और Sarthi से जानें कि आप किन योजनाओं के लिए सर्वोच्च प्राथमिकता रखते हैं'
              : 'Our Gemini AI engine evaluates your demographic, income, and educational details to recommend top-priority schemes with detailed qualification rationales.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-5">
            <Card className="border-2 border-orange-200 shadow-lg bg-white rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-green-50 border-b pb-4">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  <span>{language === 'hi' ? 'आपकी प्रोफ़ाइल' : 'Your Demographic Profile'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <form onSubmit={handleGetRecommendations} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-gray-700 mb-1 block">
                        {language === 'hi' ? 'आयु' : 'Age'}
                      </Label>
                      <Input
                        type="number"
                        value={age}
                        onChange={e => setAge(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-gray-700 mb-1 block">
                        {language === 'hi' ? 'लिंग' : 'Gender'}
                      </Label>
                      <select
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm bg-white"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="transgender">Transgender</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-gray-700 mb-1 block">
                        {language === 'hi' ? 'राज्य' : 'State'}
                      </Label>
                      <Input
                        type="text"
                        value={state}
                        onChange={e => setState(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-gray-700 mb-1 block">
                        {language === 'hi' ? 'ज़िला' : 'District'}
                      </Label>
                      <Input
                        type="text"
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-gray-700 mb-1 block">
                        {language === 'hi' ? 'पेशा' : 'Occupation'}
                      </Label>
                      <select
                        value={occupation}
                        onChange={e => setOccupation(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm bg-white"
                      >
                        <option value="student">Student</option>
                        <option value="farmer">Farmer</option>
                        <option value="business_owner">Business Owner</option>
                        <option value="women">Women / Homemaker</option>
                        <option value="senior_citizen">Senior Citizen</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-gray-700 mb-1 block">
                        {language === 'hi' ? 'वार्षिक आय (₹)' : 'Annual Income (₹)'}
                      </Label>
                      <Input
                        type="number"
                        value={income}
                        onChange={e => setIncome(e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-gray-700 mb-1 block">
                        {language === 'hi' ? 'शिक्षा' : 'Education Level'}
                      </Label>
                      <select
                        value={education}
                        onChange={e => setEducation(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm bg-white"
                      >
                        <option value="School Student">School Student</option>
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Graduate">Graduate</option>
                        <option value="Post Graduate">Post Graduate</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-gray-700 mb-1 block">
                        {language === 'hi' ? 'जाति वर्ग' : 'Caste Category'}
                      </Label>
                      <select
                        value={casteCategory}
                        onChange={e => setCasteCategory(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm bg-white"
                      >
                        <option value="General">General</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="Minority">Minority</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{language === 'hi' ? 'AI विश्लेषण कर रहा है...' : 'AI Analyzing Profile...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>{language === 'hi' ? 'सिफारिशें प्राप्त करें' : 'Analyze & Recommend Schemes'}</span>
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations Output List */}
          <div className="lg:col-span-7 space-y-6">
            {!recommendations && !loading && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
                <Sparkles className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-700 mb-1">
                  {language === 'hi' ? 'AI सिफारिशें तैयार हैं' : 'Ready For Your AI Analysis'}
                </h3>
                <p className="text-sm text-gray-500">
                  {language === 'hi'
                    ? 'बाईं ओर अपनी जानकारी भरें और "सिफारिशें प्राप्त करें" पर क्लिक करें।'
                    : 'Fill your profile on the left and click analyze to let Gemini AI match you with eligible high-priority schemes.'}
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border">
                <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
                <p className="font-bold text-gray-800">
                  {language === 'hi' ? 'Gemini AI आपकी पात्रता का मूल्यांकन कर रहा है...' : 'Gemini AI is evaluating your profile against schemes...'}
                </p>
              </div>
            )}

            {recommendations && !loading && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {language === 'hi' ? 'सर्वोत्तम अनुशंसित योजनाएं' : 'Top Recommended Schemes for You'}
                  </h2>
                  <Badge className="bg-green-100 text-green-800">
                    {recommendations.length} Matches Found
                  </Badge>
                </div>

                {recommendations.map((item, idx) => (
                  <Card key={idx} className="border-2 border-orange-200/80 shadow-md hover:shadow-xl transition-shadow bg-white rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-50 to-green-50 px-5 py-3 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-500 text-white font-bold">
                          #{idx + 1} {item.priority} Priority
                        </Badge>
                        <Badge variant="outline" className="text-green-700 border-green-300 font-bold">
                          Est. Eligibility: {item.estimatedEligibility}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-4">
                      <div>
                        <h3 className="text-xl font-extrabold text-gray-900 mb-1">
                          {item.scheme.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.scheme.description}
                        </p>
                      </div>

                      {/* Why user qualifies explanation */}
                      <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200">
                        <p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-orange-600" />
                          <span>{language === 'hi' ? 'आप क्यों योग्य हैं' : 'Why You Qualify'}</span>
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          {item.whyUserQualifies}
                        </p>
                      </div>

                      {/* Benefits */}
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          {language === 'hi' ? 'लाभ विवरण' : 'Benefits Highlight'}
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {item.benefitsSummary || item.scheme.benefits}
                        </p>
                      </div>

                      {/* Alternative schemes */}
                      {item.alternativeSchemes && item.alternativeSchemes.length > 0 && (
                        <div className="flex items-center gap-2 pt-2 border-t text-xs text-gray-600">
                          <span className="font-semibold text-gray-500">
                            {language === 'hi' ? 'वैकल्पिक योजनाएं:' : 'Alternatives:'}
                          </span>
                          {item.alternativeSchemes.map((alt, aIdx) => (
                            <span key={aIdx} className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                              {alt}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
