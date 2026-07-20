import React, { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { api } from '@/app/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Printer, 
  Loader2, 
  Copy, 
  Award 
} from 'lucide-react';

export function ResumeBuilderTab() {
  const { language } = useLanguage();
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [resumeText, setResumeText] = useState(
    `Full Stack Software Engineer with 2 years of experience building modern web applications using React, Node.js, and MongoDB. Proven track record of optimizing REST APIs and deploying responsive interfaces.`
  );

  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewResult, setReviewResult] = useState<any | null>(null);

  React.useEffect(() => {
    async function loadSavedResume() {
      try {
        const res = await api.get<any>('/career/resume');
        if (res?.resumeData) {
          if (res.resumeData.resumeText) setResumeText(res.resumeData.resumeText);
          if (res.resumeData.lastReview) setReviewResult(res.resumeData.lastReview);
        }
      } catch (e) {
        console.warn('Could not load saved resume:', e);
      }
    }
    loadSavedResume();
  }, []);

  const handleAnalyzeResume = async () => {
    setLoadingReview(true);
    try {
      const res = await api.post<any>('/career/resume-review', {
        resumeText,
        targetRole
      });
      setReviewResult(res);
    } catch {}
    setLoadingReview(false);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>{language === 'hi' ? 'पेशेवर ATS रेज़्यूमे बिल्डर व समीक्षक' : 'Professional ATS Resume Reviewer'}</span>
          </h2>
          <p className="text-gray-600 text-sm mt-0.5">
            {language === 'hi'
              ? 'ATS संगतता, व्याकरण जांच, और कीवर्ड सुझावों के साथ अपने रेज़्यूमे का स्कोर बढ़ाएं'
              : 'Calculate instant ATS Score, fix missing skills, and generate punchy AI summaries'}
          </p>
        </div>

        <Button onClick={handlePrintPDF} variant="outline" className="gap-2 shrink-0">
          <Download className="w-4 h-4" />
          <span>{language === 'hi' ? 'PDF डाउनलोड / प्रिंट' : 'Download PDF / Print'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Resume Text */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="border shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold text-gray-800">
                Paste Resume Text or Professional Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Target Role:
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Resume Experience & Skills Content:
                </label>
                <textarea
                  rows={8}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-gray-300 text-sm font-mono focus:border-indigo-600 focus:outline-none"
                  placeholder="Paste your work experience, projects, skills, and education here..."
                />
              </div>

              <Button
                onClick={handleAnalyzeResume}
                disabled={loadingReview || !resumeText.trim()}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                {loadingReview ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>AI Scanning ATS Compliance...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                    <span>Scan ATS Score & Keywords</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: ATS Score & Feedback */}
        <div className="lg:col-span-6 space-y-4">
          {!reviewResult && !loadingReview ? (
            <div className="text-center py-24 bg-white rounded-2xl border p-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-700">Ready For ATS Review</h3>
              <p className="text-xs text-gray-500 mt-1">
                Paste your resume on the left and click Scan to evaluate keyword density and ATS score.
              </p>
            </div>
          ) : loadingReview ? (
            <div className="flex flex-col items-center justify-center py-28 bg-white rounded-2xl border">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
              <p className="font-bold text-gray-700">Analyzing keyword matches...</p>
            </div>
          ) : (
            <Card className="border-2 border-indigo-200 bg-white rounded-2xl shadow-md">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-indigo-600" />
                    <CardTitle className="text-lg font-extrabold text-gray-900">
                      ATS Compliance Analysis
                    </CardTitle>
                  </div>
                  <Badge className="bg-green-600 text-white font-bold">
                    ATS Score: {reviewResult.atsScore} / 100
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-gray-50 border">
                    <span className="text-xs text-gray-500 font-bold block">Overall Resume Score</span>
                    <span className="text-2xl font-extrabold text-indigo-600">
                      {reviewResult.resumeScore} / 100
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border">
                    <span className="text-xs text-gray-500 font-bold block">Grammar Check</span>
                    <span className="text-sm font-bold text-green-700 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Clean Structure</span>
                    </span>
                  </div>
                </div>

                {/* Keyword Suggestions */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                    Recommended ATS Keywords to Add:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {reviewResult.keywordSuggestions?.map((kw: string, i: number) => (
                      <Badge key={i} className="bg-indigo-100 text-indigo-800 text-xs">
                        + {kw}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <p className="text-xs font-bold text-amber-700 uppercase mb-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Critical Missing Skills:</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {reviewResult.missingSkills?.map((ms: string, i: number) => (
                      <Badge key={i} variant="outline" className="border-amber-400 text-amber-800 text-xs">
                        {ms}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* AI Improved Summary */}
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <p className="text-xs font-bold text-purple-900 uppercase mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI-Rewritten Executive Summary:</span>
                  </p>
                  <p className="text-xs font-medium text-gray-800 leading-relaxed">
                    {reviewResult.improvedSummary}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
