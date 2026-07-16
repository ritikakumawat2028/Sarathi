import React, { useState } from 'react';
import { Link } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { Header } from '@/app/components/Header';
import { GovernmentSchemesNav } from '@/app/components/schemes/GovernmentSchemesNav';
import { SchemeItem } from '@/app/components/schemes/SchemeCard';
import { Scale, Trash2, ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

export function GovernmentSchemesCompare() {
  const { language } = useLanguage();
  const [compared, setCompared] = useState<SchemeItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('compare_schemes') || '[]'); } catch { return []; }
  });

  const removeScheme = (id: number) => {
    const updated = compared.filter(s => s.id !== id);
    setCompared(updated);
    localStorage.setItem('compare_schemes', JSON.stringify(updated));
  };

  const clearAll = () => {
    setCompared([]);
    localStorage.setItem('compare_schemes', '[]');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-green-50/40 flex flex-col">
      <Header />
      <GovernmentSchemesNav compareCount={compared.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <Scale className="w-8 h-8 text-orange-600" />
              <span>{language === 'hi' ? 'योजनाओं की तुलना' : 'Side-by-Side Scheme Comparison'}</span>
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {language === 'hi'
                ? 'एक साथ 4 योजनाओं के लाभ, पात्रता, और आवेदन प्रक्रिया की तुलना करें'
                : 'Compare benefits, eligibility criteria, required documents, and application modes for up to 4 schemes'}
            </p>
          </div>

          {compared.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              <span>{language === 'hi' ? 'तुलना रीसेट करें' : 'Clear Comparison'}</span>
            </Button>
          )}
        </div>

        {compared.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border p-8 max-w-lg mx-auto shadow-sm">
            <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {language === 'hi' ? 'तुलना के लिए कोई योजना नहीं चुनी गई' : 'No schemes selected for comparison'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {language === 'hi'
                ? 'किसी भी योजना कार्ड पर तराजू आइकन पर क्लिक करके योजनाओं को तुलना सूची में जोड़ें।'
                : 'Click the compare (scale) button on any scheme card to add it to your side-by-side comparison.'}
            </p>
            <Link to="/government-schemes/search">
              <Button className="bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold px-6">
                <span>{language === 'hi' ? 'योजनाएं खोजें' : 'Browse Schemes'}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border shadow-lg overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gradient-to-r from-orange-50 to-green-50 border-b">
                  <th className="p-4 w-48 font-bold text-gray-700 uppercase text-xs">
                    {language === 'hi' ? 'विशेषता / मापदंड' : 'Feature / Criterion'}
                  </th>
                  {compared.map((scheme) => (
                    <th key={scheme.id} className="p-4 align-top border-l w-64">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-base text-gray-900 line-clamp-2">
                          {scheme.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeScheme(scheme.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <Badge className="mt-2 bg-orange-100 text-orange-800 uppercase text-xs">
                        {scheme.category}
                      </Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50/50">
                    {language === 'hi' ? 'राज्य / स्तर' : 'Level / State'}
                  </td>
                  {compared.map((s) => (
                    <td key={s.id} className="p-4 border-l font-medium">
                      {s.state || 'Central'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50/50">
                    {language === 'hi' ? 'मुख्य लाभ' : 'Key Benefits'}
                  </td>
                  {compared.map((s) => (
                    <td key={s.id} className="p-4 border-l text-gray-800 font-semibold">
                      {s.benefits || 'See official portal for benefit details.'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50/50">
                    {language === 'hi' ? 'पात्रता मापदंड' : 'Eligibility Criteria'}
                  </td>
                  {compared.map((s) => (
                    <td key={s.id} className="p-4 border-l">
                      <ul className="list-disc list-inside space-y-1 text-gray-600 text-xs">
                        {(s.eligibility || []).slice(0, 4).map((el, idx) => (
                          <li key={idx}>{el}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50/50">
                    {language === 'hi' ? 'आवेदन का माध्यम' : 'Application Mode'}
                  </td>
                  {compared.map((s) => (
                    <td key={s.id} className="p-4 border-l">
                      <Badge variant="outline" className="text-xs">
                        {s.applicationMode || 'Online'}
                      </Badge>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50/50">
                    {language === 'hi' ? 'अनुमानित समय' : 'Processing Time'}
                  </td>
                  {compared.map((s) => (
                    <td key={s.id} className="p-4 border-l text-gray-600">
                      {s.processingTime || '15-30 Days'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50/50">
                    {language === 'hi' ? 'कार्रवाई' : 'Action'}
                  </td>
                  {compared.map((s) => (
                    <td key={s.id} className="p-4 border-l">
                      <Link to={`/government-schemes/scheme/${s.id}`}>
                        <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-green-600 text-white font-medium">
                          <span>{language === 'hi' ? 'विवरण देखें' : 'View Details'}</span>
                        </Button>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
