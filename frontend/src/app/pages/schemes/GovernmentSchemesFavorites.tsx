import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { Header } from '@/app/components/Header';
import { GovernmentSchemesNav } from '@/app/components/schemes/GovernmentSchemesNav';
import { SchemeCard, SchemeItem } from '@/app/components/schemes/SchemeCard';
import { api } from '@/app/lib/api';
import { Heart, Trash2, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export function GovernmentSchemesFavorites() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('saved_schemes') || '[]'); } catch { return []; }
  });
  const [savedSchemes, setSavedSchemes] = useState<SchemeItem[]>([]);

  useEffect(() => {
    api.get<{ schemes: SchemeItem[] }>('/schemes?limit=100')
      .then(res => {
        const all = res.schemes || [];
        setSavedSchemes(all.filter(s => favoriteIds.includes(s.id)));
      })
      .catch(() => setSavedSchemes([]))
      .finally(() => setLoading(false));
  }, [favoriteIds]);

  const removeFavorite = async (id: number) => {
    const updated = favoriteIds.filter(favId => favId !== id);
    setFavoriteIds(updated);
    localStorage.setItem('saved_schemes', JSON.stringify(updated));

    try {
      await api.del(`/schemes/saved/${id}`);
    } catch {}
  };

  const clearAllFavorites = () => {
    setFavoriteIds([]);
    setSavedSchemes([]);
    localStorage.setItem('saved_schemes', '[]');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-green-50/40 flex flex-col">
      <Header />
      <GovernmentSchemesNav favoritesCount={favoriteIds.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              <span>{language === 'hi' ? 'आपकी पसंदीदा योजनाएं' : 'My Saved Favorites'}</span>
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {language === 'hi'
                ? 'वे योजनाएं जिन्हें आपने भविष्य में आवेदन या तुलना के लिए सहेजा है'
                : 'Bookmark schemes you want to apply for or compare later'}
            </p>
          </div>

          {savedSchemes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFavorites}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              <span>{language === 'hi' ? 'सभी हटाएं' : 'Clear All'}</span>
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : savedSchemes.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border p-8 max-w-lg mx-auto shadow-sm">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {language === 'hi' ? 'कोई योजना सहेजी नहीं गई है' : 'No saved schemes yet'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {language === 'hi'
                ? 'योजना कार्डों पर दिल के आइकन पर क्लिक करके योजनाओं को अपनी पसंदीदा सूची में जोड़ें।'
                : 'Click the heart icon on any scheme card to save it here for quick access.'}
            </p>
            <Link to="/government-schemes/search">
              <Button className="bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold px-6">
                <span>{language === 'hi' ? 'योजनाएं खोजें' : 'Browse Schemes'}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedSchemes.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                isFavorite={true}
                onToggleFavorite={() => removeFavorite(scheme.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
