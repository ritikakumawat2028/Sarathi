import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { api } from '@/app/lib/api';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Award, 
  ExternalLink, 
  Loader2 
} from 'lucide-react';

interface EventItem {
  id: number;
  title: string;
  organizer: string;
  category: string;
  date: string;
  mode: string;
  prizePool: string;
  registrationLink: string;
}

export function EventsTab() {
  const { language } = useLanguage();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<{ events: EventItem[] }>('/career/events')
      .then(res => setEvents(res.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border shadow-sm">
        <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-600" />
          <span>{language === 'hi' ? 'करियर इवेंट्स, हैकथॉन व वर्कशॉप' : 'Tech Hackathons, Webinars & Career Fairs'}</span>
        </h2>
        <p className="text-gray-600 text-sm mt-0.5">
          {language === 'hi'
            ? 'Smart India Hackathon, Google I/O, Microsoft Bootcamp और रोजगार मेले'
            : 'Participate in verified Hackathons, Google/Microsoft summits & National Career Fairs'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((ev) => (
            <Card key={ev.id} className="border-2 border-indigo-100 hover:border-indigo-400 transition-all bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <Badge className="bg-indigo-100 text-indigo-800 font-bold text-xs">
                    {ev.category}
                  </Badge>
                  <span className="text-xs font-bold text-gray-500">
                    {ev.date}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-gray-900 leading-snug">
                  {ev.title}
                </h3>

                <div className="p-3.5 rounded-xl bg-gray-50 border text-xs text-gray-800 space-y-1.5">
                  <p><strong>Organizer:</strong> {ev.organizer}</p>
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span><strong>Mode/Venue:</strong> {ev.mode}</span>
                  </p>
                  <p className="flex items-center gap-1 text-green-700 font-bold">
                    <Award className="w-3.5 h-3.5" />
                    <span><strong>Benefits/Prize:</strong> {ev.prizePool}</span>
                  </p>
                </div>
              </CardContent>

              <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Registration Open</span>
                <a href={ev.registrationLink && ev.registrationLink !== '#' ? ev.registrationLink : 'https://internshala.com/'} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5">
                    <span>Register Free</span>
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
