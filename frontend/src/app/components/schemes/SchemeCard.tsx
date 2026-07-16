import React from 'react';
import { Link } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Heart, Scale, ExternalLink, CheckCircle, ArrowRight } from 'lucide-react';

export interface SchemeItem {
  id: number;
  name: string;
  category: string;
  description: string;
  fullDescription?: string;
  benefits: string;
  eligibility: string[];
  state?: string;
  tags?: string[];
  officialLink?: string;
  applicationMode?: string;
  processingTime?: string;
}

interface SchemeCardProps {
  scheme: SchemeItem;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  isCompared?: boolean;
  onToggleCompare?: (scheme: SchemeItem) => void;
  matchReason?: string;
  eligibilityScore?: number;
}

export function SchemeCard({
  scheme,
  isFavorite = false,
  onToggleFavorite,
  isCompared = false,
  onToggleCompare,
  matchReason,
  eligibilityScore
}: SchemeCardProps) {
  const { language } = useLanguage();

  return (
    <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-400 bg-white group relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-green-600" />
      
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 mb-1">
            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 capitalize font-medium">
              {scheme.category}
            </Badge>
            <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
              {scheme.state || 'Central'}
            </Badge>
            {scheme.applicationMode && (
              <Badge variant="secondary" className="text-xs">
                {scheme.applicationMode}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(scheme)}
                title={language === 'hi' ? 'तुलना के लिए जोड़ें' : 'Add to Compare'}
                className={`p-1.5 rounded-full transition-colors ${
                  isCompared
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <Scale className="w-4 h-4" />
              </button>
            )}

            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(scheme.id)}
                title={language === 'hi' ? 'पसंदीदा में जोड़ें' : 'Add to Favorites'}
                className={`p-1.5 rounded-full transition-colors ${
                  isFavorite
                    ? 'text-red-500 bg-red-50'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`} />
              </button>
            )}
          </div>
        </div>

        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
          {scheme.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-0 gap-3">
        <div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {scheme.description}
          </p>

          <div className="p-2.5 rounded-lg bg-gradient-to-r from-orange-50 to-green-50 border border-orange-100 mb-3">
            <p className="text-xs font-semibold text-orange-800 uppercase tracking-wider mb-0.5">
              {language === 'hi' ? 'मुख्य लाभ' : 'Key Benefit'}
            </p>
            <p className="text-xs font-medium text-gray-800 line-clamp-2">
              {scheme.benefits || 'See official portal for benefit details.'}
            </p>
          </div>

          {matchReason && (
            <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200 mb-2">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium line-clamp-1">{matchReason}</span>
            </div>
          )}

          {eligibilityScore !== undefined && (
            <div className="flex items-center justify-between text-xs font-semibold px-2 py-1 bg-gray-100 rounded mb-2">
              <span>{language === 'hi' ? 'पात्रता स्कोर' : 'Eligibility Score'}:</span>
              <span className={eligibilityScore >= 80 ? 'text-green-600' : eligibilityScore >= 50 ? 'text-amber-600' : 'text-red-600'}>
                {eligibilityScore}%
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t flex items-center justify-between gap-2 mt-auto">
          <Link to={`/government-schemes/scheme/${scheme.id}`} className="flex-1">
            <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-medium shadow flex items-center justify-center gap-1.5">
              <span>{language === 'hi' ? 'विवरण देखें' : 'View Details'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>

          {scheme.officialLink && (
            <a
              href={scheme.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              title="Official Website"
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-orange-600 hover:border-orange-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
