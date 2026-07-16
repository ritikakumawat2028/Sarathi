import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { api } from '@/app/lib/api';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Share2, 
  Bookmark, 
  ExternalLink, 
  Building2, 
  Loader2 
} from 'lucide-react';

interface JobItem {
  id: number;
  title: string;
  company: string;
  logo: string;
  role: string;
  salary: string;
  location: string;
  type: string;
  sector: string;
  skills: string[];
  deadline: string;
  postedAgo: string;
  applyUrl: string;
}

export function JobsTab() {
  const { language } = useLanguage();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSector, setSelectedSector] = useState('All');
  const [savedJobIds, setSavedJobIds] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('saved_jobs') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    setLoading(true);
    api.get<{ jobs: JobItem[] }>('/career/jobs')
      .then(res => setJobs(res.jobs || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const jobTypes = [
    'All', 'Internship', 'Remote Jobs', 'Government Jobs', 'Private Jobs', 'Startup Jobs', 'Freelance', 'Walk-in', 'Campus Placements'
  ];

  const filteredJobs = jobs.filter(j => {
    if (selectedType !== 'All' && !j.type.toLowerCase().includes(selectedType.toLowerCase())) return false;
    if (selectedSector !== 'All' && j.sector !== selectedSector) return false;
    return true;
  });

  const toggleSaveJob = (id: number) => {
    const updated = savedJobIds.includes(id) ? savedJobIds.filter(item => item !== id) : [...savedJobIds, id];
    setSavedJobIds(updated);
    localStorage.setItem('saved_jobs', JSON.stringify(updated));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Job link copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header & Category Filters */}
      <div className="bg-white rounded-2xl p-6 border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-indigo-600" />
              <span>{language === 'hi' ? 'नौकरियां व इंटर्नशिप' : 'Dynamic Jobs & Internships Engine'}</span>
            </h2>
            <p className="text-gray-600 text-sm mt-0.5">
              {language === 'hi'
                ? 'सरकारी नौकरियां, इंटर्नशिप, स्टार्टअप अवसर और रिमोट नौकरियां एक ही स्थान पर'
                : 'Verified openings across Government, Private Corporations, Tech Startups & Remote Internships'}
            </p>
          </div>

          <Badge className="bg-indigo-100 text-indigo-800 font-bold">
            {filteredJobs.length} Openings
          </Badge>
        </div>

        {/* Category Type Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {jobTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedType === type
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Sector Filter */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs font-bold text-gray-500">Sector:</span>
          {['All', 'Government', 'Private', 'Startup Jobs'].map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                selectedSector === sec
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border p-8">
          <p className="text-gray-500 font-bold">No job openings found matching your filter selection.</p>
          <Button onClick={() => { setSelectedType('All'); setSelectedSector('All'); }} className="mt-3">
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((j) => {
            const isSaved = savedJobIds.includes(j.id);
            return (
              <Card key={j.id} className="border-2 border-gray-200 hover:border-indigo-400 transition-all bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-extrabold text-lg shrink-0">
                        {j.logo}
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-gray-900 leading-snug">
                          {j.title}
                        </h3>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{j.company}</span>
                        </p>
                      </div>
                    </div>

                    <Badge className="bg-indigo-100 text-indigo-800 font-bold shrink-0 text-xs">
                      {j.type}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl border">
                    <div>
                      <span className="text-gray-400 block font-semibold">Compensation</span>
                      <span className="font-extrabold text-green-700">{j.salary}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold">Location</span>
                      <span className="font-bold text-gray-800 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{j.location}</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Required Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {j.skills.map((s, idx) => (
                        <Badge key={idx} variant="secondary" className="text-[11px] bg-indigo-50 text-indigo-800">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Deadline: {j.deadline}</span>
                    </span>
                    <span>Posted {j.postedAgo}</span>
                  </div>
                </CardContent>

                <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSaveJob(j.id)}
                      className={isSaved ? 'text-indigo-600 border-indigo-300 bg-indigo-50' : ''}
                    >
                      <Bookmark className={`w-4 h-4 mr-1 ${isSaved ? 'fill-indigo-600' : ''}`} />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </Button>

                    <Button size="sm" variant="outline" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <a href={j.applyUrl && j.applyUrl !== '#' ? j.applyUrl : 'https://internshala.com/internships/'} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-6">
                      <span>Apply Now</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
