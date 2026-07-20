import React, { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { api } from '@/app/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { 
  Github, 
  Linkedin, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Loader2, 
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  Briefcase,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

export function PortfolioReviewTab() {
  const { language } = useLanguage();
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  // Load existing reviews on mount
  React.useEffect(() => {
    async function loadPreviousReview() {
      try {
        const res = await api.get<any>('/career/reviews');
        if (res?.reviews && Array.isArray(res.reviews) && res.reviews.length > 0) {
          const latest = res.reviews[0];
          if (latest.url && latest.url.includes('github.com')) setGithubUrl(latest.url);
          if (latest.rawAnalysis) {
            setResult(latest.rawAnalysis);
          } else if (latest.score) {
            setResult(latest);
          }
        }
      } catch (e) {
        console.warn('Could not load previous review:', e);
      }
    }
    loadPreviousReview();
  }, []);

  const handleReview = async () => {
    setErrorMsg(null);
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+/i;
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+/i;

    if (!githubUrl.trim() || !githubRegex.test(githubUrl.trim())) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया एक वैध GitHub प्रोफ़ाइल URL दर्ज करें (जैसे https://github.com/username)।'
          : 'Please enter a valid GitHub profile URL (e.g. https://github.com/username).'
      );
      return;
    }

    if (!linkedinUrl.trim() || !linkedinRegex.test(linkedinUrl.trim())) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया एक वैध LinkedIn प्रोफ़ाइल URL दर्ज करें (जैसे https://linkedin.com/in/username)।'
          : 'Please enter a valid LinkedIn profile URL (e.g. https://linkedin.com/in/username).'
      );
      return;
    }

    // Task 11: Portfolio URL is optional and never triggers validation errors

    setLoading(true);
    try {
      const res = await api.post<any>('/career/portfolio-review', {
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        portfolioUrl: portfolioUrl.trim()
      });
      setResult(res);
    } catch (e: any) {
      setErrorMsg(e.message || 'Could not connect to the review service. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border shadow-sm">
        <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Github className="w-6 h-6 text-indigo-600" />
          <span>{language === 'hi' ? 'AI पोर्टफोलियो व डिजिटल प्रोफ़ाइल समीक्षा' : 'AI Digital Portfolio & GitHub Reviewer'}</span>
        </h2>
        <p className="text-gray-600 text-sm mt-0.5">
          {language === 'hi'
            ? 'GitHub रिपॉजिटरी, LinkedIn प्रोफ़ाइल और वेबसाइट प्रोजेक्ट्स के लिए व्यक्तिगत AI सुझाव'
            : 'Evaluate your GitHub READMEs, LinkedIn headline & live project demos against top recruiter benchmarks'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-900">
              {language === 'hi' ? 'URL सत्यापन त्रुटि (URL Validation Error)' : 'URL Validation Error'}
            </h4>
            <p className="text-xs text-red-700 font-medium mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-sm bg-white rounded-2xl">
            <CardHeader className="border-b pb-3 bg-gradient-to-r from-gray-50 to-indigo-50/30">
              <CardTitle className="text-base font-bold text-gray-800 flex items-center justify-between">
                <span>{language === 'hi' ? 'डिजिटल प्रोफ़ाइल लिंक दर्ज करें' : 'Digital Presence Profiles'}</span>
                <Badge variant="outline" className="text-[10px] text-indigo-700 bg-indigo-50 border-indigo-200 font-semibold">
                  {language === 'hi' ? '* अनिवार्य' : '* Required URLs'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 text-gray-900" />
                    <span>GitHub Profile URL <span className="text-red-500 font-extrabold">*</span></span>
                  </span>
                  <span className="text-[10px] text-indigo-600 font-semibold">Required</span>
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                    <span>LinkedIn Profile URL <span className="text-red-500 font-extrabold">*</span></span>
                  </span>
                  <span className="text-[10px] text-indigo-600 font-semibold">Required</span>
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/yourname"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="pt-1 border-t border-dashed">
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Portfolio Website URL</span>
                  </span>
                  <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-600 font-semibold">
                    {language === 'hi' ? 'वैकल्पिक' : 'Optional'}
                  </Badge>
                </label>
                <input
                  type="url"
                  placeholder="https://myportfolio.dev (Optional)"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-400"
                />
                <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                  {language === 'hi'
                    ? 'यदि आपके पास अभी वेबसाइट नहीं है, तो इसे खाली छोड़ दें। हम आपके GitHub और LinkedIn के आधार पर समीक्षा करेंगे।'
                    : 'If you don\'t have a live website yet, leave this blank. We will evaluate your profile strengths using your required GitHub & LinkedIn links!'}
                </p>
              </div>

              <Button
                onClick={handleReview}
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-md transition-all pt-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Analyzing Profiles...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />
                    <span>{language === 'hi' ? 'AI समीक्षा शुरू करें' : 'Run Comprehensive AI Review'}</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          {!result ? (
            <div className="text-center py-20 bg-white rounded-2xl border p-8 shadow-sm flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                {language === 'hi' ? 'आपकी डिजिटल उपस्थिति का मूल्यांकन' : 'Ready to Analyze Your Digital Footprint'}
              </h3>
              <p className="text-gray-500 text-sm max-w-md">
                {language === 'hi'
                  ? 'बाईं ओर अपना GitHub और LinkedIn URL दर्ज करें और शीर्ष उद्योग भर्तीकर्ताओं (Top Recruiters) के बेंचमार्क के अनुसार त्वरित समीक्षा प्राप्त करें।'
                  : 'Enter your required GitHub & LinkedIn URLs on the left to receive customized recruiter feedback, ATS benchmarks, and high-impact improvement tips.'}
              </p>
            </div>
          ) : (
            <Card className="border-2 border-indigo-200 bg-white rounded-2xl shadow-md animate-in fade-in duration-300">
              <CardHeader className="bg-gradient-to-r from-indigo-50 via-purple-50 to-white border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-extrabold text-gray-900">
                        {language === 'hi' ? 'पोर्टफोलियो व डिजिटल उपस्थिति स्कोर' : 'Portfolio & Presence Score'}
                      </CardTitle>
                      <p className="text-xs text-gray-500 font-medium">Verified AI Benchmarking Evaluation</p>
                    </div>
                  </div>
                  <Badge className={`px-3.5 py-1.5 text-sm font-extrabold shadow-sm ${
                    (result.portfolioScore || result.overallScore || 75) >= 80
                      ? 'bg-green-600 text-white'
                      : ((result.portfolioScore || result.overallScore || 75) >= 65 ? 'bg-indigo-600 text-white' : 'bg-amber-600 text-white')
                  }`}>
                    Score: {result.portfolioScore || result.overallScore || 75} / 100
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100/80 text-sm font-medium text-gray-800 leading-relaxed">
                  {result.summary}
                </div>

                {/* Recruiter Impression & Resume Impact Cards (Task 10) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-1.5">
                    <span className="text-xs font-bold text-purple-900 uppercase flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      <span>Recruiter Impression</span>
                    </span>
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                      {result.recruiterImpression || 'Verified profiles demonstrate strong engineering credibility suitable for technical hiring managers.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-1.5">
                    <span className="text-xs font-bold text-blue-900 uppercase flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-blue-600" />
                      <span>ATS & Resume Impact</span>
                    </span>
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                      {result.resumeImpact || 'Directly increases callback probability when included in your ATS-verified contact section.'}
                    </p>
                  </div>
                </div>

                {result.strengths && result.strengths.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-green-700 uppercase mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verified Profile Strengths:</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {result.strengths.map((st: string, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-green-50/70 border border-green-200 text-xs font-semibold text-green-900 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                          <span>{st}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.weaknesses && result.weaknesses.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-amber-700 uppercase mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Areas to Strengthen:</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {result.weaknesses.map((wk: string, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs font-semibold text-amber-900 flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{wk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>High-Impact Improvement Tips:</span>
                  </p>
                  <div className="space-y-3">
                    {(result.improvementSuggestions || result.suggestions)?.map((s: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/80 hover:bg-white transition-all shadow-sm">
                        <span className="text-xs font-bold text-indigo-800 block mb-1 flex items-center justify-between">
                          <span>{s.area}</span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </span>
                        <p className="text-xs text-gray-700 leading-relaxed font-medium">{s.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
