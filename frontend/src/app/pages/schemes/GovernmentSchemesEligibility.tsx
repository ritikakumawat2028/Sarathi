import React, { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { Header } from '@/app/components/Header';
import { GovernmentSchemesNav } from '@/app/components/schemes/GovernmentSchemesNav';
import { SchemeCard, SchemeItem } from '@/app/components/schemes/SchemeCard';
import { api } from '@/app/lib/api';
import { 
  CheckCircle2, 
  HelpCircle, 
  AlertCircle, 
  FileText, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface EligibilityItem extends SchemeItem {
  eligibilityScore: number;
  reasons: string[];
  missingConditions: string[];
}

export function GovernmentSchemesEligibility() {
  const { language } = useLanguage();

  const [step, setStep] = useState(1);
  const [age, setAge] = useState('22');
  const [gender, setGender] = useState('male');
  const [state, setState] = useState('Maharashtra');
  const [occupation, setOccupation] = useState('student');
  const [income, setIncome] = useState('180000');
  const [category, setCategory] = useState('General');
  const [disability, setDisability] = useState(false);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    eligible: EligibilityItem[];
    possiblyEligible: EligibilityItem[];
    notEligible: EligibilityItem[];
  } | null>(null);

  const handleCheckEligibility = async () => {
    setLoading(true);
    try {
      const res = await api.post<{
        eligible: EligibilityItem[];
        possiblyEligible: EligibilityItem[];
        notEligible: EligibilityItem[];
      }>('/schemes/eligibility-check', {
        age: parseInt(age, 10),
        gender,
        state,
        occupation,
        income: parseInt(income, 10),
        category,
        disability
      });
      setResults(res);
      setStep(4); // Results step

      // Automatically log activity so Dashboard schemeChecks count and recent activity list update immediately
      await api.post('/user/activity', {
        type: 'eligibility',
        title: 'Checked Scheme Eligibility',
        detail: `Found ${res.eligible.length} eligible schemes (${res.possiblyEligible.length} conditional)`
      }).catch((err) => console.log('Log eligibility error:', err));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-green-50/40 flex flex-col">
      <Header />
      <GovernmentSchemesNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'स्मार्ट पात्रता जांच' : 'Interactive Eligibility Wizard'}</span>
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {language === 'hi' ? 'जानें आप किन सरकारी योजनाओं के पात्र हैं' : 'Check Your Eligibility For Government Schemes'}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {language === 'hi'
              ? '3 आसान चरणों में अपनी जानकारी भरें और तुरंत पात्रता स्कोर के साथ परिणाम पाएं'
              : 'Answer a few dynamic questions to calculate your qualification score across all verified schemes'}
          </p>
        </div>

        {step < 4 ? (
          <Card className="max-w-2xl mx-auto border-2 shadow-xl bg-white rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-green-600 p-4 text-white flex items-center justify-between">
              <span className="font-bold text-sm">
                {language === 'hi' ? `चरण ${step} / 3` : `Step ${step} of 3`}
              </span>
              <div className="flex gap-1.5">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`h-2 w-8 rounded-full ${s <= step ? 'bg-white' : 'bg-white/30'}`} />
                ))}
              </div>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {step === 1 && (
                <>
                  <h2 className="text-xl font-bold text-gray-800">
                    {language === 'hi' ? 'बुनियादी जानकारी' : 'Basic Demographics'}
                  </h2>

                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1 block">
                      {language === 'hi' ? 'आयु (वर्षों में)' : 'Age (Years)'}
                    </Label>
                    <Input
                      type="number"
                      value={age}
                      onChange={e => setAge(e.target.value)}
                      className="h-12 text-base"
                      placeholder="e.g. 21"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1 block">
                      {language === 'hi' ? 'लिंग' : 'Gender'}
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {['male', 'female', 'transgender'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`p-3 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${
                            gender === g
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1 block">
                      {language === 'hi' ? 'निवास का राज्य' : 'State of Residence'}
                    </Label>
                    <select
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full h-12 px-3 rounded-xl border border-gray-300 text-base text-gray-800 bg-white"
                    >
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="West Bengal">West Bengal</option>
                    </select>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-xl font-bold text-gray-800">
                    {language === 'hi' ? 'पेशा व वित्तीय स्थिति' : 'Occupation & Financial Profile'}
                  </h2>

                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1 block">
                      {language === 'hi' ? 'वर्तमान पेशा' : 'Current Occupation'}
                    </Label>
                    <select
                      value={occupation}
                      onChange={e => setOccupation(e.target.value)}
                      className="w-full h-12 px-3 rounded-xl border border-gray-300 text-base text-gray-800 bg-white"
                    >
                      <option value="student">{language === 'hi' ? 'छात्र (Student)' : 'Student'}</option>
                      <option value="farmer">{language === 'hi' ? 'किसान (Farmer)' : 'Farmer'}</option>
                      <option value="business_owner">{language === 'hi' ? 'व्यवसाय मालिक (Business Owner)' : 'Business Owner'}</option>
                      <option value="women">{language === 'hi' ? 'महिला उद्यमी / गृहिणी' : 'Women / Homemaker'}</option>
                      <option value="unemployed">{language === 'hi' ? 'बेरोजगार (Unemployed)' : 'Unemployed'}</option>
                      <option value="senior_citizen">{language === 'hi' ? 'वरिष्ठ नागरिक (Senior Citizen)' : 'Senior Citizen'}</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1 block">
                      {language === 'hi' ? 'वार्षिक पारिवारिक आय (₹ में)' : 'Annual Family Income (₹)'}
                    </Label>
                    <Input
                      type="number"
                      value={income}
                      onChange={e => setIncome(e.target.value)}
                      className="h-12 text-base"
                      placeholder="e.g. 150000"
                    />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="text-xl font-bold text-gray-800">
                    {language === 'hi' ? 'सामाजिक वर्ग व अन्य' : 'Social Category & Special Criteria'}
                  </h2>

                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1 block">
                      {language === 'hi' ? 'आरक्षण श्रेणी' : 'Social Category'}
                    </Label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full h-12 px-3 rounded-xl border border-gray-300 text-base text-gray-800 bg-white"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="Minority">Minority</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border">
                    <input
                      type="checkbox"
                      id="disability"
                      checked={disability}
                      onChange={e => setDisability(e.target.checked)}
                      className="w-5 h-5 text-orange-600 rounded"
                    />
                    <label htmlFor="disability" className="text-sm font-medium text-gray-800 cursor-pointer">
                      {language === 'hi' ? 'क्या आप दिव्यांग (Person with Disability) हैं?' : 'Are you a Person with Disability (Divyang)?'}
                    </label>
                  </div>
                </>
              )}

              <div className="flex justify-between pt-4 border-t">
                {step > 1 ? (
                  <Button variant="outline" onClick={() => setStep(step - 1)} className="flex items-center gap-1.5">
                    <ArrowLeft className="w-4 h-4" />
                    <span>{language === 'hi' ? 'पीछे' : 'Back'}</span>
                  </Button>
                ) : <div />}

                {step < 3 ? (
                  <Button onClick={() => setStep(step + 1)} className="bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold flex items-center gap-1.5 px-6">
                    <span>{language === 'hi' ? 'आगे' : 'Next'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleCheckEligibility}
                    disabled={loading}
                    className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-bold px-8 flex items-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{language === 'hi' ? 'पात्रता जांचें' : 'Calculate Eligibility'}</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Results View */
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>{language === 'hi' ? 'जानकारी संपादित करें' : 'Edit Demographics'}</span>
              </Button>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-600">
                  {language === 'hi' ? 'कुल जांच की गई योजनाएं: ' : 'Total Schemes Evaluated: '}
                </span>
                <span className="font-bold text-gray-900">
                  {(results?.eligible?.length || 0) + (results?.possiblyEligible?.length || 0) + (results?.notEligible?.length || 0)}
                </span>
              </div>
            </div>

            {/* Eligible Schemes (Score >= 80) */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  {language === 'hi' ? 'आप पूर्णतः पात्र हैं (Eligible)' : 'High Qualification Match (Eligible)'} ({results?.eligible?.length || 0})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results?.eligible?.map(item => (
                  <SchemeCard
                    key={item.id}
                    scheme={item}
                    eligibilityScore={item.eligibilityScore}
                    matchReason={item.reasons?.[0]}
                  />
                ))}
              </div>
            </div>

            {/* Possibly Eligible (Score 50-79) */}
            {(results?.possiblyEligible?.length || 0) > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-6 h-6 text-amber-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {language === 'hi' ? 'संभावित रूप से पात्र (Possibly Eligible)' : 'Possibly Eligible (Missing Minor Conditions)'} ({results?.possiblyEligible?.length || 0})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results?.possiblyEligible?.map(item => (
                    <SchemeCard
                      key={item.id}
                      scheme={item}
                      eligibilityScore={item.eligibilityScore}
                      matchReason={item.missingConditions?.[0] ? `Missing: ${item.missingConditions[0]}` : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
