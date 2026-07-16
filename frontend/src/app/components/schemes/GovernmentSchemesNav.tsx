import { Link, useLocation } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { 
  Building2, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  Scale, 
  Heart, 
  History, 
  Languages 
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface GovernmentSchemesNavProps {
  compareCount?: number;
  favoritesCount?: number;
}

export function GovernmentSchemesNav({ compareCount = 0, favoritesCount = 0 }: GovernmentSchemesNavProps) {
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  const navItems = [
    {
      nameEn: 'Overview',
      nameHi: 'सिंहावलोकन',
      href: '/government-schemes',
      icon: Building2,
      exact: true
    },
    {
      nameEn: 'Smart Search',
      nameHi: 'स्मार्ट खोज',
      href: '/government-schemes/search',
      icon: Search
    },
    {
      nameEn: 'Eligibility Wizard',
      nameHi: 'पात्रता जांचकर्ता',
      href: '/government-schemes/eligibility',
      icon: CheckCircle2
    },
    {
      nameEn: 'AI Recommendations',
      nameHi: 'AI सिफारिशें',
      href: '/government-schemes/recommendations',
      icon: Sparkles
    },
    {
      nameEn: 'Compare',
      nameHi: 'तुलना करें',
      href: '/government-schemes/compare',
      icon: Scale,
      badge: compareCount > 0 ? compareCount : undefined
    },
    {
      nameEn: 'Favorites',
      nameHi: 'पसंदीदा',
      href: '/government-schemes/favorites',
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : undefined
    },
    {
      nameEn: 'History',
      nameHi: 'इतिहास',
      href: '/government-schemes/history',
      icon: History
    }
  ];

  const toggleLang = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 overflow-x-auto gap-4 no-scrollbar">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? location.pathname === item.href 
                : location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-green-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{language === 'hi' ? item.nameHi : item.nameEn}</span>
                  {item.badge !== undefined && (
                    <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full font-bold ${
                      isActive ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pl-2 border-l">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLang}
              className="flex items-center gap-1.5 text-xs font-semibold hover:border-orange-500 hover:text-orange-600 shrink-0"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'हिंदी में देखें' : 'English'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
