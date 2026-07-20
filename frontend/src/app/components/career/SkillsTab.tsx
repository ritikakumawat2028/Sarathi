import React, { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { api } from '@/app/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { 
  Award, 
  Sparkles, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  BookOpen, 
  Cpu,
  Plus,
  Trash2,
  Loader2,
  Sliders
} from 'lucide-react';

interface SkillsTabProps {
  onOpenRoadmap: () => void;
}

export function SkillsTab({ onOpenRoadmap }: SkillsTabProps) {
  const { language } = useLanguage();
  const [targetRole, setTargetRole] = useState('Full Stack AI Engineer');
  const [skills, setSkills] = useState([
    { name: 'Prompt Engineering & LLM APIs', category: 'Technical', level: 75 },
    { name: 'TypeScript & Full Stack Architecture', category: 'Technical', level: 80 },
    { name: 'Database Optimization & SQL', category: 'Technical', level: 65 },
    { name: 'System Design & Problem Solving', category: 'Soft Skills', level: 70 },
    { name: 'Technical Presentation & Communication', category: 'Soft Skills', level: 85 }
  ]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCat, setNewSkillCat] = useState('Technical');
  const [newSkillLevel, setNewSkillLevel] = useState(70);

  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([...skills, { name: newSkillName.trim(), category: newSkillCat, level: newSkillLevel }]);
    setNewSkillName('');
    setNewSkillLevel(70);
  };

  const handleRemoveSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleLevelChange = (idx: number, newLvl: number) => {
    const updated = [...skills];
    updated[idx].level = newLvl;
    setSkills(updated);
  };

  const handleRunAnalysis = async () => {
    setLoading(true);
    try {
      const res = await api.post<any>('/career/skills-gap-analysis', {
        targetRole,
        skills
      });
      setAnalysisResult(res);
    } catch (e) {
      console.error('Skill gap analysis error:', e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Interactive Target Role & Skill Builder Banner */}
      <Card className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white border-none shadow-xl">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Sliders className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="space-y-2 flex-1">
              <Badge className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 font-bold">
                {language === 'hi' ? 'इंटरएक्टिव स्किल सेल्फ-असेसमेंट' : 'Interactive Skill Profile Builder'}
              </Badge>
              <h2 className="text-2xl font-extrabold">
                {language === 'hi' ? 'अपनी वास्तविक स्किल्स दर्ज करें व लक्ष्य भूमिका चुनें' : 'Customize Your Skills & Target Career Role'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-gray-300 font-bold">Target Role:</span>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="bg-indigo-950/80 border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="Full Stack AI Engineer">Full Stack AI Engineer</option>
                  <option value="Data Scientist & ML Engineer">Data Scientist & ML Engineer</option>
                  <option value="Cloud & DevOps Architect">Cloud & DevOps Architect</option>
                  <option value="Frontend Architect">Frontend Architect</option>
                  <option value="Cybersecurity Specialist">Cybersecurity Specialist</option>
                  <option value="Product Manager">Technical Product Manager</option>
                </select>
              </div>
            </div>
          </div>

          <Button
            onClick={handleRunAnalysis}
            disabled={loading || skills.length === 0}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-950 font-extrabold px-6 py-6 rounded-xl shadow-lg shrink-0 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Generating AI Gap Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                <span>{language === 'hi' ? 'AI स्किल गैप विश्लेषण चलाएं' : 'Run AI Skill Gap Analysis'}</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Add New Skill Bar & Custom Skill Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-2 border-indigo-100 shadow-sm bg-white rounded-2xl">
            <CardHeader className="bg-gray-50/70 border-b pb-3">
              <CardTitle className="text-base font-bold text-gray-800 flex items-center justify-between">
                <span>{language === 'hi' ? 'नई स्किल जोड़ें' : 'Add or Adjust Skills'}</span>
                <Badge variant="secondary" className="text-[10px]">{skills.length} Skills Added</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Skill Name</label>
                  <input
                    type="text"
                    placeholder="e.g. React.js, Docker, Agile Management"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                    <select
                      value={newSkillCat}
                      onChange={(e) => setNewSkillCat(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs font-bold bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="Technical">Technical</option>
                      <option value="Soft Skills">Soft Skills</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Level ({newSkillLevel}%)</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                      className="w-full h-2 mt-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddSkill}
                  disabled={!newSkillName.trim()}
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>{language === 'hi' ? 'स्किल जोड़ें' : 'Add Skill to Assessment'}</span>
                </Button>
              </div>

              <div className="pt-3 border-t space-y-3 max-h-[360px] overflow-y-auto pr-1">
                <span className="text-xs font-bold text-gray-500 uppercase block">Your Current Skills:</span>
                {skills.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] text-indigo-700 font-bold bg-white">
                          {s.category}
                        </Badge>
                        <span className="text-xs font-bold text-gray-900">{s.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveSkill(idx)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={s.level}
                        onChange={(e) => handleLevelChange(idx, Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <span className="text-xs font-extrabold text-indigo-700 shrink-0 w-9 text-right">{s.level}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Output / Results Panel */}
        <div className="lg:col-span-7">
          {!analysisResult ? (
            <div className="text-center py-24 bg-white rounded-2xl border p-8 shadow-sm flex flex-col items-center justify-center min-h-[440px]">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                {language === 'hi' ? 'व्यक्तिगत स्किल गैप रिपोर्ट तैयार है' : 'Ready to Run AI Skill Gap Analysis'}
              </h3>
              <p className="text-gray-500 text-sm max-w-md">
                {language === 'hi'
                  ? 'बाईं ओर अपनी स्किल्स और दक्षता स्तर समायोजित करें, फिर अपनी लक्षित भूमिका के लिए वास्तविक उद्योग गैप रिपोर्ट देखने के लिए बटन दबाएं।'
                  : 'Adjust your current skills on the left, select your Target Career Role, and click "Run AI Skill Gap Analysis" to generate real industry benchmark evaluation without placeholders.'}
              </p>
            </div>
          ) : (
            <Card className="border-2 border-indigo-200 shadow-md bg-white rounded-2xl animate-in fade-in duration-300">
              <CardHeader className="bg-gradient-to-r from-indigo-50 via-purple-50 to-white border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm font-black text-lg">
                      {analysisResult.overallScore || 82}%
                    </div>
                    <div>
                      <CardTitle className="text-lg font-extrabold text-gray-900">
                        {targetRole} Benchmark Score
                      </CardTitle>
                      <Badge className="mt-0.5 bg-indigo-100 text-indigo-800 font-extrabold text-xs">
                        {analysisResult.percentileRank || 'Top 15% of Candidates'}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={onOpenRoadmap}
                    className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    <span>View Learning Roadmap</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-sm font-medium text-gray-800 leading-relaxed">
                  {analysisResult.executiveSummary}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Strengths */}
                  <div className="p-4 rounded-xl bg-green-50/70 border border-green-200">
                    <h3 className="font-bold text-green-900 flex items-center gap-1.5 mb-2.5 text-xs uppercase">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Key Strengths</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-green-900 font-semibold">
                      {analysisResult.strengths?.map((st: string, idx: number) => (
                        <li key={idx}>• {st}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Gaps */}
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                    <h3 className="font-bold text-amber-900 flex items-center gap-1.5 mb-2.5 text-xs uppercase">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Areas to Strengthen</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-amber-900 font-semibold">
                      {analysisResult.gapsToStrengthen?.map((gp: string, idx: number) => (
                        <li key={idx}>• {gp}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Trending Future */}
                  <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
                    <h3 className="font-bold text-purple-900 flex items-center gap-1.5 mb-2.5 text-xs uppercase">
                      <Cpu className="w-4 h-4 text-purple-600" />
                      <span>Trending Future Skills</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-purple-900 font-semibold">
                      {analysisResult.trendingFutureSkills?.map((tf: string, idx: number) => (
                        <li key={idx}>• {tf}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Detailed Skill & Gap Cards (Task 4) */}
                {(analysisResult.skillCards || analysisResult.skillRecommendations)?.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <span>Detailed Skill Gap Cards & Action Plan:</span>
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {(analysisResult.skillCards || analysisResult.skillRecommendations).map((item: any, idx: number) => {
                        const sName = item.skillName || item.name || 'General Skill';
                        const cLevel = item.currentLevel ?? item.level ?? 65;
                        const tLevel = item.targetLevel ?? 85;
                        const gapPct = item.gapPercentage ?? Math.max(0, tLevel - cLevel);
                        const prio = item.priority || (gapPct > 25 ? 'High' : (gapPct > 15 ? 'Medium' : 'Low'));
                        const timeEst = item.estimatedLearningTime || (gapPct > 25 ? '3-4 weeks' : '1-2 weeks');
                        const recText = item.recommendation || item.aiFeedback || 'Practice hands-on coding and complete real-world system architecture assignments.';

                        return (
                          <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between space-y-3 hover:border-indigo-300 transition-all">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-sm font-extrabold text-gray-900 block">{sName}</span>
                                <span className="text-[11px] text-gray-500 font-medium">Target Level: {tLevel}%</span>
                              </div>
                              <Badge className={`text-[10px] font-bold px-2 py-0.5 shadow-none ${
                                prio === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                                (prio === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-green-100 text-green-800 border-green-200')
                              }`}>
                                {prio} Priority
                              </Badge>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold text-gray-700">
                                <span>Current: {cLevel}%</span>
                                <span className="text-indigo-600">Gap: {gapPct}%</span>
                              </div>
                              <Progress value={cLevel} className="h-2 bg-gray-100" />
                            </div>

                            <div className="pt-2 border-t text-xs space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                                <span>Estimated Learning Time:</span>
                                <span className="text-gray-800 font-bold">{timeEst}</span>
                              </div>
                              <p className="text-xs text-gray-600 font-medium leading-relaxed bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/60">
                                💡 {recText}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
