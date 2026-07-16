import { GovernmentScheme } from '@/app/data/governmentSchemes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ExternalLink, CheckCircle, FileText, Building } from 'lucide-react';
import { ScrollArea } from '@/app/components/ui/scroll-area';

interface SchemeDetailModalProps {
  scheme: GovernmentScheme | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SchemeDetailModal({ scheme, isOpen, onClose }: SchemeDetailModalProps) {
  if (!scheme) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl pr-8">{scheme.name}</DialogTitle>
              <DialogDescription className="mt-2">
                <Badge variant="secondary" className="mr-2">{scheme.category}</Badge>
                {scheme.eligible && <Badge className="bg-green-600">You're Eligible!</Badge>}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Ministry */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="w-4 h-4" />
              <span>{scheme.ministry}</span>
            </div>

            {/* Full Description */}
            <div>
              <h3 className="font-bold mb-2">About the Scheme</h3>
              <p className="text-gray-700">{scheme.fullDescription}</p>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="font-bold mb-2">Benefits</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-900">{scheme.benefits}</p>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div>
              <h3 className="font-bold mb-2">Eligibility Criteria</h3>
              <ul className="space-y-2">
                {scheme.eligibility.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Documents */}
            <div>
              <h3 className="font-bold mb-2">Required Documents</h3>
              <div className="grid grid-cols-2 gap-2">
                {scheme.documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Apply */}
            <div>
              <h3 className="font-bold mb-2">How to Apply</h3>
              <ol className="space-y-2">
                {scheme.howToApply.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Official Link */}
            <div className="pt-4 border-t">
              <Button
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                onClick={() => window.open(scheme.officialLink, '_blank')}
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Visit Official Portal
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                {scheme.officialLink}
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
