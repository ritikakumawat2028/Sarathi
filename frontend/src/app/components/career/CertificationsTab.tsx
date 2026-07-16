import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { api } from '@/app/lib/api';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { 
  CheckCircle, 
  Award, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  ExternalLink, 
  Loader2 
} from 'lucide-react';

interface CertItem {
  id: number;
  name: string;
  provider: string;
  difficulty: string;
  duration: string;
  price: string;
  careerValue: string;
  badge: string;
  enrollUrl?: string;
}

export function CertificationsTab() {
  const { language } = useLanguage();
  const [certifications, setCertifications] = useState<CertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<{ certifications: CertItem[] }>('/career/certifications')
      .then(res => setCertifications(res.certifications || []))
      .catch(() => setCertifications([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span>{language === 'hi' ? 'शीर्ष उद्योग व सरकारी प्रमाणपत्र' : 'Top Industry & Government Certifications'}</span>
          </h2>
          <p className="text-gray-600 text-sm mt-0.5">
            {language === 'hi'
              ? 'Google, AWS, Azure, Microsoft, NPTEL और SWAYAM से करियर को गति देने वाले मान्यता प्राप्त प्रमाणपत्र'
              : 'Verified credentials from Google, AWS, Azure, Meta, Microsoft, Cisco, Infosys & NPTEL/SWAYAM'}
          </p>
        </div>

        <Badge className="bg-green-100 text-green-800 font-bold self-start sm:self-center">
          High ROI Credentials
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-green-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications.map((c) => (
            <Card key={c.id} className="border-2 border-green-100 hover:border-green-400 transition-all bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge className="bg-green-100 text-green-800 font-bold text-xs mb-2">
                      {c.provider}
                    </Badge>
                    <h3 className="text-lg font-extrabold text-gray-900 leading-snug">
                      {c.name}
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-xs font-bold text-gray-700">
                    {c.badge}
                  </Badge>
                </div>

                <div className="p-3.5 rounded-xl bg-green-50/70 border border-green-200 text-xs text-gray-800">
                  <p className="font-bold text-green-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                    <span>Career Impact & Value:</span>
                  </p>
                  <p className="font-semibold">{c.careerValue}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-3 rounded-xl border">
                  <div>
                    <span className="text-gray-400 block font-semibold">Difficulty</span>
                    <span className="font-extrabold text-gray-800">{c.difficulty}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Prep Time</span>
                    <span className="font-bold text-gray-800">{c.duration}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Price</span>
                    <span className="font-bold text-indigo-700">{c.price}</span>
                  </div>
                </div>
              </CardContent>

              <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                  <Award className="w-4 h-4 text-green-600" />
                  <span>Globally Recognized</span>
                </span>
                <a href={c.enrollUrl || 'https://swayam.gov.in/'} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold px-5">
                    <span>Enroll / Official Link</span>
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
