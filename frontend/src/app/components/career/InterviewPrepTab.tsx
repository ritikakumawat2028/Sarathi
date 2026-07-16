import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { api } from '@/app/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { 
  Mic, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Send, 
  Loader2, 
  Award, 
  HelpCircle 
} from 'lucide-react';

interface QuestionItem {
  id: number;
  category: string;
  question: string;
  difficulty: string;
  keyPoints: string[];
}

export function InterviewPrepTab() {
  const { language } = useLanguage();
  const [role, setRole] = useState('Full Stack Software Engineer');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const [activeQIndex, setActiveQIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    setEvaluation(null);
    setUserAnswer('');
    try {
      const res = await api.post<{ questions: QuestionItem[] }>('/career/interview-prep', {
        role
      });
      setQuestions(res.questions || []);
      setActiveQIndex(0);
    } catch {
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [role]);

  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim() || questions.length === 0) return;
    setEvaluating(true);
    try {
      const currentQ = questions[activeQIndex];
      const res = await api.post<any>('/career/interview-analyze', {
        question: currentQ.question,
        answer: userAnswer,
        role
      });
      setEvaluation(res);
    } catch {}
    setEvaluating(false);
  };

  const currentQuestion = questions[activeQIndex];

  return (
    <div className="space-y-6">
      {/* Header & Role Selector */}
      <div className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Mic className="w-6 h-6 text-purple-600" />
            <span>{language === 'hi' ? 'AI मॉ़क इंटरव्यू तैयारी' : 'AI Mock Interview Simulator'}</span>
          </h2>
          <p className="text-gray-600 text-sm mt-0.5">
            {language === 'hi'
              ? 'Gemini AI से तकनीकी, HR और कोडिंग प्रश्न उत्पन्न करें और अपनी प्रतिक्रिया का विश्लेषण करें'
              : 'Practice Technical, HR, Behavioral & Coding rounds with instant Gemini AI evaluation'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-300 text-sm font-semibold bg-white"
          >
            <option value="Full Stack Software Engineer">Full Stack Engineer</option>
            <option value="Python & AI Developer">Python & AI Developer</option>
            <option value="Data Scientist & ML Engineer">Data Scientist</option>
            <option value="Cyber Security Analyst">Cyber Security Analyst</option>
            <option value="Frontend React Developer">Frontend React Developer</option>
          </select>

          <Button
            size="sm"
            onClick={loadQuestions}
            disabled={loadingQuestions}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loadingQuestions ? 'animate-spin' : ''}`} />
            <span>New Questions</span>
          </Button>
        </div>
      </div>

      {loadingQuestions ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-3" />
          <p className="font-bold text-gray-700">Generating tailored interview questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border p-8">
          <p className="text-gray-500 font-bold">Failed to load questions. Click New Questions to try again.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Questions List & Tabs */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border p-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Questions for {role}
              </h3>
              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setActiveQIndex(idx);
                      setEvaluation(null);
                      setUserAnswer('');
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      activeQIndex === idx
                        ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge className="bg-purple-100 text-purple-800 text-[10px]">
                        Q{idx + 1}: {q.category}
                      </Badge>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 line-clamp-2">
                      {q.question}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Active Question & Evaluator */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-2 border-purple-200 bg-white rounded-2xl shadow-md">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b pb-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-600 text-white font-bold">
                    {currentQuestion.category} Question #{activeQIndex + 1}
                  </Badge>
                  <Badge variant="outline" className="text-purple-800 border-purple-300">
                    Difficulty: {currentQuestion.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-extrabold text-gray-900 mt-2">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                {/* Expected key points hint */}
                <div className="p-3.5 rounded-xl bg-gray-50 border text-xs text-gray-700">
                  <p className="font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                    <span>Expected Key Concepts to Mention:</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {currentQuestion.keyPoints.map((kp, i) => (
                      <Badge key={i} variant="secondary" className="text-[11px] bg-purple-100 text-purple-900">
                        {kp}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Candidate Answer Textarea */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {language === 'hi' ? 'अपना उत्तर लिखें (STAR विधि का प्रयोग करें):' : 'Your Answer Response (Use STAR Structure):'}
                  </label>
                  <textarea
                    rows={4}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your interview response here... (e.g. 'In my recent project, I designed stateless REST endpoints using JWT tokens...')"
                    className="w-full p-3.5 rounded-xl border border-gray-300 text-sm focus:border-purple-600 focus:outline-none"
                  />
                  <Button
                    onClick={handleEvaluateAnswer}
                    disabled={evaluating || !userAnswer.trim()}
                    className="mt-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-6 h-11 w-full flex items-center justify-center gap-2"
                  >
                    {evaluating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI Analyzing Response...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span>Evaluate & Score My Answer</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* AI Evaluation Output */}
                {evaluation && (
                  <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-purple-200 pb-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-6 h-6 text-purple-600" />
                        <span className="font-extrabold text-gray-900">Confidence & Quality Score</span>
                      </div>
                      <span className="text-2xl font-extrabold text-purple-700">
                        {evaluation.confidenceScore} / 100
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">Performance Analysis:</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">
                        {evaluation.performanceAnalysis}
                      </p>
                    </div>

                    {evaluation.strengths && (
                      <div>
                        <p className="text-xs font-bold text-green-700 uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Strengths Detected:</span>
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-700 mt-1 space-y-1">
                          {evaluation.strengths.map((st: string, i: number) => (
                            <li key={i}>{st}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {evaluation.improvementTips && (
                      <div>
                        <p className="text-xs font-bold text-amber-700 uppercase flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Actionable Improvement Tips:</span>
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-700 mt-1 space-y-1">
                          {evaluation.improvementTips.map((tip: string, i: number) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
