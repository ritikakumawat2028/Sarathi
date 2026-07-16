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
  AlertCircle 
} from 'lucide-react';

export function PortfolioReviewTab() {
  const { language } = useLanguage();
  const [githubUrl, setGithubUrl] = useState('https://github.com/developer');
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com/in/developer');
  const [portfolioUrl, setPortfolioUrl] = useState('https://myportfolio.dev');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleReview = async () => {
    setLoading(true);
    try {
      const res = await api.post<any>('/career/portfolio-review', {
        githubUrl,
        linkedinUrl,
        portfolioUrl
      });
      setResult(res);
    } catch {}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-sm bg-white rounded-2xl">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-bold text-gray-800">
                Digital Presence Profiles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Profile URL</span>
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                  <span>LinkedIn Profile URL</span>
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Live Portfolio Website URL</span>
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <Button
                onClick={handleReview}
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Analyzing Profiles...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />
                    <span>Run Comprehensive AI Review</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          {!result ? (
            <div className="text-center py-20 bg-white rounded-2xl border p-8">
              <Github className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-bold">Paste your URLs on the left and run review.</p>
            </div>
          ) : (
            <Card className="border-2 border-indigo-200 bg-white rounded-2xl shadow-md">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-indigo-600" />
                    <CardTitle className="text-lg font-extrabold text-gray-900">
                      Portfolio & Presence Score
                    </CardTitle>
                  </div>
                  <Badge className="bg-green-600 text-white font-bold">
                    Score: {result.portfolioScore} / 100
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm font-medium text-gray-800">{result.summary}</p>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">High-Impact Improvement Tips:</p>
                  <div className="space-y-3">
                    {result.suggestions?.map((s: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl border bg-gray-50">
                        <span className="text-xs font-bold text-indigo-800 block">{s.area}</span>
                        <p className="text-xs text-gray-700 mt-0.5">{s.tip}</p>
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
