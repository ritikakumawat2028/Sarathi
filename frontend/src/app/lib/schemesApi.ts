import { api } from '@/app/lib/api';
import { GovernmentScheme } from '@/app/data/governmentSchemes';

export interface SchemesMeta {
  generatedAt: string;
  totalSchemes: number;
  sources: Record<string, { count: number; error?: string | null }>;
  error?: string;
}

export interface SchemesResponse {
  schemes: GovernmentScheme[];
  meta: SchemesMeta;
}

export function fetchSchemes(params?: { category?: string; q?: string; state?: string }) {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all') query.set('category', params.category);
  if (params?.q) query.set('q', params.q);
  if (params?.state) query.set('state', params.state);
  const qs = query.toString();
  return api.get<SchemesResponse>(`/schemes${qs ? `?${qs}` : ''}`);
}

export function fetchSchemeById(id: number) {
  return api.get<{ scheme: GovernmentScheme }>(`/schemes/${id}`);
}

export interface EligibilityInput {
  occupation: string;
  income: string | number;
  age: string | number;
}

export function checkEligibility(input: EligibilityInput) {
  return api.post<{ eligible: GovernmentScheme[]; ineligible: GovernmentScheme[] }>(
    '/eligibility/check',
    input
  );
}

export function fetchSavedSchemeIds() {
  return api.get<{ schemeIds: number[] }>('/schemes/saved');
}

export function saveScheme(schemeId: number) {
  return api.post('/schemes/saved', { schemeId });
}

export function unsaveScheme(schemeId: number) {
  return api.del(`/schemes/saved/${schemeId}`);
}
