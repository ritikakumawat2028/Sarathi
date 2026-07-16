import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { api } from '@/app/lib/api';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { 
  BookOpen, 
  Sparkles, 
  Star, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  Loader2, 
  Search,
  Bookmark,
  Award,
  ListChecks,
  X,
  Share2,
  Building2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export interface CourseItem {
  id: number;
  title: string;
  provider: string;
  platform: string;
  duration: string;
  effort?: string;
  level: string;
  price: string;
  rating: number;
  type: string;
  hasCertificate: boolean;
  category: string;
  language: string;
  enrollUrl?: string;
  accreditation?: string;
  prerequisites?: string;
  recommendationReason: string;
  syllabus?: string[];
}

export function CoursesTab() {
  const { language } = useLanguage();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');

  // Saved courses in local storage
  const [savedCourseIds, setSavedCourseIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('sarathi_saved_courses');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Modal Detail state
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get<{ courses: CourseItem[] }>('/career/courses')
      .then(res => setCourses(res.courses || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleSaveCourse = (courseId: number) => {
    setSavedCourseIds(prev => {
      const isSaved = prev.includes(courseId);
      const updated = isSaved ? prev.filter(id => id !== courseId) : [...prev, courseId];
      localStorage.setItem('sarathi_saved_courses', JSON.stringify(updated));
      if (!isSaved) {
        toast.success('Course saved to your AI Learning Roadmap!');
      } else {
        toast.info('Course removed from saved list.');
      }
      return updated;
    });
  };

  const platforms = [
    'All', 'Internshala', 'Physics Wallah', 'Coursera', 'NPTEL / SWAYAM', 'edX', 'FutureSkills Prime', 'AWS Skill Builder', 'Infosys Springboard', 'Spoken Tutorial'
  ];

  const filteredCourses = courses.filter(c => {
    if (selectedLevel !== 'All' && c.level !== selectedLevel) return false;
    if (selectedPrice === 'Free' && !c.price.toLowerCase().includes('free')) return false;
    if (selectedPrice === 'Paid' && c.price.toLowerCase().includes('free')) return false;
    if (selectedPlatform !== 'All' && !c.platform.toLowerCase().includes(selectedPlatform.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = c.title.toLowerCase().includes(q);
      const provMatch = c.provider.toLowerCase().includes(q);
      const platMatch = c.platform.toLowerCase().includes(q);
      const catMatch = c.category.toLowerCase().includes(q);
      if (!titleMatch && !provMatch && !platMatch && !catMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Official Certification Hub
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-green-50 text-green-700 border border-green-200">
                100% Direct Portal Enrollment
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-indigo-600" />
              <span>{language === 'hi' ? 'स्मार्ट कोर्स व प्रमाणन कैटलॉग' : 'Curated Course & Certification Hub'}</span>
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {language === 'hi'
                ? 'सरकारी (SWAYAM, FutureSkills, Spoken Tutorial) व शीर्ष कॉर्पोरेट कोर्स में सीधे एनरोल करें।'
                : 'Direct enrollment links to official SWAYAM/NPTEL, MeitY FutureSkills Prime, IIT Bombay, Coursera, edX & AWS portals.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-800 font-extrabold px-3 py-1.5 text-xs">
              {filteredCourses.length} Courses Found
            </Badge>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search courses by title, skill, IIT/provider, or technology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-12 pr-4 rounded-2xl text-sm border-gray-300 focus:border-indigo-600 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 mr-1">Difficulty:</span>
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedLevel === lvl
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {lvl}
              </button>
            ))}

            <span className="text-xs font-bold text-gray-500 ml-4 mr-1">Pricing:</span>
            {['All', 'Free', 'Paid'].map(prc => (
              <button
                key={prc}
                onClick={() => setSelectedPrice(prc)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedPrice === prc
                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {prc}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-bold text-gray-500 mr-1">Platform:</span>
            {platforms.map(plat => (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                  selectedPlatform === plat
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-3xl border border-gray-200">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-sm font-semibold text-gray-600">Loading verified courses from SWAYAM & partners...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8 space-y-3">
          <AlertCircle className="w-10 h-10 text-gray-400 mx-auto" />
          <p className="text-gray-700 font-bold text-base">No courses found matching selected filters.</p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setSelectedLevel('All');
              setSelectedPrice('All');
              setSelectedPlatform('All');
            }}
            className="rounded-xl font-bold"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((c) => {
            const isSaved = savedCourseIds.includes(c.id);
            const enrollLink = c.enrollUrl && c.enrollUrl !== '#' ? c.enrollUrl : 'https://swayam.gov.in/';
            return (
              <Card
                key={c.id}
                className="border-2 border-gray-200/80 hover:border-indigo-400 transition-all bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`font-extrabold text-xs px-2.5 py-0.5 ${
                            c.type === 'Government'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          }`}
                        >
                          {c.platform}
                        </Badge>
                        {c.hasCertificate && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                            <Award className="w-3 h-3" /> Certificate
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{c.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-gray-900 leading-snug">
                      {c.title}
                    </h3>
                    <p className="text-xs font-bold text-gray-500 mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1 text-indigo-700">
                        <Building2 className="w-3.5 h-3.5" /> {c.provider}
                      </span>
                      <span>•</span>
                      <span>{c.language}</span>
                    </p>
                  </div>

                  {/* AI Recommendation Badge */}
                  <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200">
                    <p className="text-[11px] font-extrabold text-purple-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>AI Match Rationale</span>
                    </p>
                    <p className="text-xs font-medium text-gray-800 leading-relaxed">
                      {c.recommendationReason}
                    </p>
                  </div>

                  {/* Metadata badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                    <Badge variant="outline" className="flex items-center gap-1 font-bold">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span>{c.duration}</span>
                    </Badge>
                    {c.effort && (
                      <Badge variant="outline" className="font-semibold text-gray-600">
                        {c.effort}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="font-bold text-indigo-800 bg-indigo-50">
                      {c.level}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 border border-green-200 font-extrabold">
                      {c.price}
                    </Badge>
                  </div>
                </CardContent>

                {/* Bottom Action Footer */}
                <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSaveCourse(c.id)}
                      className={`rounded-xl font-bold text-xs h-9 ${
                        isSaved
                          ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:text-white'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                      title={isSaved ? 'Saved to learning plan' : 'Save course'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 mr-1.5 ${isSaved ? 'fill-white' : ''}`} />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedCourse(c)}
                      className="rounded-xl font-bold text-xs h-9 border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      <ListChecks className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                      <span>Syllabus</span>
                    </Button>
                  </div>

                  {/* Direct Official Course Link Button */}
                  <a
                    href={enrollLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button
                      size="sm"
                      className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white font-extrabold text-xs h-9 px-5 shadow-md"
                    >
                      <span>Enroll / Official Link</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ======================================================
          COURSE SYLLABUS & DETAILS MODAL
          ====================================================== */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-100 text-indigo-800 font-bold text-xs">
                  {selectedCourse.platform}
                </Badge>
                <span className="text-xs font-bold text-gray-500">•</span>
                <span className="text-xs font-bold text-gray-700">{selectedCourse.provider}</span>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-tight">
                  {selectedCourse.title}
                </h3>
                <p className="text-xs font-bold text-gray-500 mt-1">
                  Level: {selectedCourse.level} • Duration: {selectedCourse.duration}{' '}
                  {selectedCourse.effort ? `(${selectedCourse.effort})` : ''} • Price: {selectedCourse.price}
                </p>
              </div>

              {selectedCourse.accreditation && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                  <Award className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-extrabold text-amber-900">Official Accreditation Authority</p>
                    <p className="text-xs text-amber-800">{selectedCourse.accreditation}</p>
                  </div>
                </div>
              )}

              {/* Syllabus / Curriculum */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-indigo-600" />
                  <span>Course Curriculum & Modules</span>
                </h4>
                {selectedCourse.syllabus && selectedCourse.syllabus.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCourse.syllabus.map((mod, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span>{mod}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Official syllabus available on provider portal.</p>
                )}
              </div>

              {selectedCourse.prerequisites && (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Prerequisites & Eligibility
                  </p>
                  <p className="text-xs text-gray-600">{selectedCourse.prerequisites}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedCourse(null)}
                className="rounded-xl font-bold text-xs"
              >
                Close
              </Button>

              <a
                href={selectedCourse.enrollUrl || 'https://swayam.gov.in/'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white font-extrabold text-xs h-10 px-6 shadow-lg">
                  <span>Proceed to Official Portal ({selectedCourse.platform})</span>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
