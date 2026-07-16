import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { api } from '@/app/lib/api';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { 
  GraduationCap, 
  DollarSign, 
  Clock, 
  ExternalLink, 
  Loader2 
} from 'lucide-react';

interface ScholarshipItem {
  id: number;
  title: string;
  provider: string;
  type: string;
  amount: string;
  eligibility: string;
  deadline: string;
  applyUrl?: string;
}

export function ScholarshipsTab() {
  const { language } = useLanguage();
  const [scholarships, setScholarships] = useState<ScholarshipItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<{ scholarships: ScholarshipItem[] }>('/career/scholarships')
      .then(res => setScholarships(res.scholarships || []))
      .catch(() => setScholarships([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border shadow-sm">
        <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-indigo-600" />
          <span>{language === 'hi' ? 'करियर छात्रवृत्ति व वित्तीय सहायता' : 'Scholarships & Career Funding'}</span>
        </h2>
        <p className="text-gray-600 text-sm mt-0.5">
          {language === 'hi'
            ? 'सरकारी छात्रवृत्ति, कॉर्पोरेट छात्रवृत्ति, विदेश अध्ययन व कौशल विकास कार्यक्रम'
            : 'Explore Verified Government Scholarships, Corporate STEM Grants & Study Abroad Funding'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scholarships.map((s) => (
            <Card key={s.id} className="border-2 border-indigo-100 hover:border-indigo-400 transition-all bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <Badge className="bg-indigo-100 text-indigo-800 font-bold text-xs">
                    {s.type}
                  </Badge>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Deadline: {s.deadline}</span>
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-gray-900 leading-snug">
                  {s.title}
                </h3>

                <div className="p-3.5 rounded-xl bg-gray-50 border text-xs text-gray-800 space-y-1">
                  <p><strong>Provider:</strong> {s.provider}</p>
                  <p><strong>Amount / Benefit:</strong> <span className="text-green-700 font-extrabold">{s.amount}</span></p>
                  <p><strong>Eligibility:</strong> {s.eligibility}</p>
                </div>
              </CardContent>

              <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Official Portal Application</span>
                <a href={s.applyUrl || 'https://scholarships.gov.in/'} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5">
                    <span>Apply / Official Link</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
