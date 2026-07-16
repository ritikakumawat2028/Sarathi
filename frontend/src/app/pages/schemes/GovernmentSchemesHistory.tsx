import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { Header } from '@/app/components/Header';
import { GovernmentSchemesNav } from '@/app/components/schemes/GovernmentSchemesNav';
import { api } from '@/app/lib/api';
import { History, Search, Eye, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface HistoryEntry {
  _id: string;
  type: 'view' | 'search' | 'recommendation';
  title: string;
  detail?: string;
  schemeId?: number;
  query?: string;
  createdAt: string;
}

export function GovernmentSchemesHistory() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    api.get<{ history: HistoryEntry[] }>('/schemes/history')
      .then(res => setHistory(res.history || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-green-50/40 flex flex-col">
      <Header />
      <GovernmentSchemesNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <History className="w-8 h-8 text-orange-600" />
            <span>{language === 'hi' ? 'आपकी गतिविधि इतिहास' : 'Your Activity History'}</span>
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {language === 'hi'
              ? 'हाल ही में देखी गई योजनाएं, खोजे गए कीवर्ड और AI सिफारिशें'
              : 'Chronological timeline of your viewed schemes, search queries, and AI recommendation runs'}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border p-8 max-w-lg mx-auto shadow-sm">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {language === 'hi' ? 'कोई इतिहास नहीं मिला' : 'No recent activity'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {language === 'hi'
                ? 'जब आप योजनाएं खोजेंगे या विवरण देखेंगे, तो आपकी गतिविधि यहां दिखाई देगी।'
                : 'As you search for schemes or view details, your activity timeline will appear here automatically.'}
            </p>
            <Link to="/government-schemes/search">
              <Button className="bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold px-6">
                <span>{language === 'hi' ? 'योजनाएं खोजें' : 'Start Exploring'}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <Card key={entry._id} className="border hover:border-orange-300 transition-colors bg-white">
                <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      entry.type === 'search' ? 'bg-blue-50 text-blue-600' :
                      entry.type === 'recommendation' ? 'bg-orange-50 text-orange-600' :
                      'bg-green-50 text-green-600'
                    }`}>
                      {entry.type === 'search' ? <Search className="w-5 h-5" /> :
                       entry.type === 'recommendation' ? <Sparkles className="w-5 h-5" /> :
                       <Eye className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs uppercase font-bold">
                          {entry.type}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mt-1">
                        {entry.title}
                      </h3>
                      {entry.detail && (
                        <p className="text-xs text-gray-600 mt-0.5">{entry.detail}</p>
                      )}
                    </div>
                  </div>

                  {entry.schemeId && (
                    <Link to={`/government-schemes/scheme/${entry.schemeId}`}>
                      <Button size="sm" variant="outline" className="shrink-0">
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
