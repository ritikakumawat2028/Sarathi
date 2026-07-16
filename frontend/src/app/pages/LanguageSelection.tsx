import { useNavigate } from 'react-router';
import { useLanguage, Language } from '@/app/context/LanguageContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Check } from 'lucide-react';

export function LanguageSelection() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  ];

  const handleLanguageSelect = (code: Language) => {
    setLanguage(code);
  };

  const handleContinue = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-4xl border-2 shadow-xl">
        <CardContent className="pt-8 pb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">AI</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">{t('selectLanguage')}</h1>
            <p className="text-gray-600">Choose your preferred language for the best experience</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  language === lang.code
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">🇮🇳</span>
                  {language === lang.code && (
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg mb-1">{lang.nativeName}</p>
                  <p className="text-sm text-gray-600">{lang.name}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/')}
            >
              Back
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
              onClick={handleContinue}
            >
              {t('continue')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
