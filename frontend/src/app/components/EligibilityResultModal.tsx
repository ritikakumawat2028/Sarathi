import { GovernmentScheme } from '@/app/data/governmentSchemes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { CheckCircle, XCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/app/components/ui/scroll-area';

interface EligibilityResultModalProps {
  eligibleSchemes: GovernmentScheme[];
  ineligibleSchemes: GovernmentScheme[];
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: (scheme: GovernmentScheme) => void;
}

export function EligibilityResultModal({
  eligibleSchemes,
  ineligibleSchemes,
  isOpen,
  onClose,
  onViewDetails,
}: EligibilityResultModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Your Eligibility Analysis</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{eligibleSchemes.length}</span>
                </div>
                <p className="text-sm text-green-700">Schemes You're Eligible For</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-600">{ineligibleSchemes.length}</span>
                </div>
                <p className="text-sm text-orange-700">Not Currently Eligible</p>
              </div>
            </div>

            {/* Eligible Schemes */}
            {eligibleSchemes.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  You Can Apply For These Schemes
                </h3>
                <div className="space-y-3">
                  {eligibleSchemes.map((scheme) => (
                    <div key={scheme.id} className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold">{scheme.name}</h4>
                            <Badge className="bg-green-600">Eligible</Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{scheme.description}</p>
                          <div className="bg-white border border-green-200 rounded p-2 mb-2">
                            <p className="text-sm font-medium text-green-800">
                              <strong>Benefits:</strong> {scheme.benefits}
                            </p>
                          </div>
                          <p className="text-xs text-gray-600">{scheme.ministry}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewDetails(scheme)}
                        >
                          View Full Details
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => window.open(scheme.officialLink, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ineligible Schemes - Why Not Eligible */}
            {ineligibleSchemes.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-orange-600" />
                  Not Currently Eligible
                </h3>
                <div className="space-y-3">
                  {ineligibleSchemes.map((scheme) => (
                    <div key={scheme.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold mb-1">{scheme.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{scheme.description}</p>
                          <div className="bg-orange-50 border border-orange-200 rounded p-2">
                            <p className="text-xs text-orange-800">
                              <strong>Reason:</strong> Based on your profile, you may not meet all eligibility criteria. 
                              You can still check detailed requirements.
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => onViewDetails(scheme)}
                      >
                        View Requirements
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Next Steps
              </h3>
              <ul className="text-sm text-blue-900 space-y-1 ml-7">
                <li>• Review each eligible scheme carefully</li>
                <li>• Gather required documents</li>
                <li>• Apply through official portals</li>
                <li>• Keep checking for new schemes regularly</li>
                <li>• Need help? Chat with our AI Assistant</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
