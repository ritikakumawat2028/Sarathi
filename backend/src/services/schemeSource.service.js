import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { config } from '../config.js';
import { getMem, setMem, readDiskCache, writeDiskCache } from './cache.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.resolve(__dirname, '../data/seedSchemes.json');

const CACHE_KEY = 'schemes:all';

function loadSeed() {
  const raw = fs.readFileSync(SEED_PATH, 'utf-8');
  return JSON.parse(raw);
}

const CATEGORY_KEYWORDS = {
  agriculture: ['farmer', 'crop', 'agri', 'kisan', 'fasal'],
  health: ['health', 'hospital', 'ayushman', 'medical', 'insurance'],
  education: ['scholarship', 'student', 'education', 'school', 'shiksha'],
  business: ['loan', 'mudra', 'enterprise', 'business', 'msme', 'startup'],
  housing: ['awas', 'housing', 'home', 'ghar'],
  employment: ['skill', 'employment', 'rozgar', 'kaushal', 'job'],
  social_security: ['pension', 'insurance', 'suraksha', 'social security', 'bima'],
};

function guessCategory(text = '') {
  const lower = text.toLowerCase();
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) return cat;
  }
  return 'other';
}

function slugToId(text, salt = 0) {
  // Deterministic numeric id so repeated fetches upsert instead of duplicating.
  let hash = salt;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return 100000 + (hash % 900000);
}

/**
 * Normalizes a record from the myScheme public search API into our GovernmentScheme shape.
 * myScheme's response fields have changed shape over time (it's not a stable, versioned API),
 * so this reads defensively from several possible field names.
 */
function normalizeMyScheme(raw) {
  const src = raw?._source || raw || {};
  const name = src.schemeName || src.scheme_name || src.title || src.name;
  if (!name) return null;

  const description =
    src.briefDescription || src.brief_description || src.tagLine || src.description || '';
  const fullDescription =
    src.detailedDescription || src.detailed_description || description;

  const eligibilityRaw = src.eligibilityDescription || src.eligibility || '';
  const eligibility = Array.isArray(eligibilityRaw)
    ? eligibilityRaw
    : String(eligibilityRaw)
        .split(/\r?\n|•|;/)
        .map((s) => s.trim())
        .filter(Boolean);

  const benefitsRaw = src.benefits || src.schemeBenefits || '';
  const benefits = Array.isArray(benefitsRaw) ? benefitsRaw.join('; ') : String(benefitsRaw);

  const documentsRaw = src.documents || src.documentsRequired || [];
  const documents = Array.isArray(documentsRaw)
    ? documentsRaw.map((d) => (typeof d === 'string' ? d : d?.title || d?.name)).filter(Boolean)
    : [];

  const applyRaw = src.applicationProcess || src.howToApply || [];
  const howToApply = Array.isArray(applyRaw)
    ? applyRaw.map((s) => (typeof s === 'string' ? s : s?.description || s?.step)).filter(Boolean)
    : String(applyRaw)
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);

  const ministry = src.ministryName || src.nodalMinistryName || src.department || 'Government of India';
  const slug = src.slug || src.schemeSlug;
  const officialLink = slug
    ? `https://www.myscheme.gov.in/schemes/${slug}`
    : src.applicationLink || src.officialLink || 'https://www.myscheme.gov.in/';

  return {
    id: slugToId(slug || name, 7),
    name,
    category: guessCategory(`${name} ${description}`),
    description: description ? String(description).slice(0, 220) : 'Government of India scheme.',
    fullDescription: fullDescription || description || 'See official portal for full details.',
    eligibility: eligibility.length ? eligibility : ['See official scheme page for detailed eligibility criteria.'],
    benefits: benefits || 'See official scheme page for benefit details.',
    documents: documents.length ? documents : ['Aadhaar Card', 'See official portal for full document list'],
    howToApply: howToApply.length ? howToApply : ['Visit the official scheme link and follow the application instructions.'],
    officialLink,
    ministry,
    eligible: false,
    isActive: true,
    source: 'myscheme.gov.in',
  };
}

/**
 * Normalizes a raw record from a data.gov.in resource (OGD Platform India) dataset.
 * data.gov.in datasets are tabular and each Ministry defines its own columns, so this maps
 * the handful of very common field name patterns and otherwise keeps the raw row so nothing
 * is silently dropped.
 */
function normalizeDataGovIn(row, resourceMeta) {
  const name =
    row.scheme_name || row.scheme || row.name_of_scheme || row.title || row.name;
  if (!name) return null;

  const description =
    row.description || row.details || row.scheme_details || row.brief || '';
  const ministry = row.ministry || row.department || resourceMeta?.org || 'Government of India';

  return {
    id: slugToId(String(name), 13),
    name: String(name),
    category: guessCategory(`${name} ${description}`),
    description: description ? String(description).slice(0, 220) : `Dataset entry from ${resourceMeta?.title || 'data.gov.in'}`,
    fullDescription: String(description || JSON.stringify(row)).slice(0, 1000),
    eligibility: row.eligibility
      ? String(row.eligibility).split(/\r?\n|;/).map((s) => s.trim()).filter(Boolean)
      : ['Refer to the source dataset / scheme guidelines for eligibility.'],
    benefits: row.benefit || row.benefits || row.amount || 'See dataset / official scheme guidelines.',
    documents: ['See official scheme guidelines for required documents.'],
    howToApply: ['Refer to the concerned Ministry/Department portal linked in the dataset.'],
    officialLink: row.url || row.link || row.website || 'https://www.data.gov.in/',
    ministry,
    eligible: false,
    isActive: true,
    source: `data.gov.in:${resourceMeta?.resourceId || 'unknown'}`,
  };
}

async function fetchFromMyScheme() {
  if (!config.myschemeFetchEnabled) return { items: [], error: 'disabled' };
  try {
    // myScheme's SPA calls a search endpoint that accepts pagination + a keyword filter.
    // We pull a broad set of categories/keywords to build a reasonably representative list
    // since there is no official "list everything" endpoint.
    const keywords = ['farmer', 'student', 'health', 'women', 'employment', 'housing', 'pension', 'business'];
    const results = [];
    for (const kw of keywords) {
      const url = `${config.myschemeApiBase}/schemes`;
      const { data } = await axios.get(url, {
        params: { lang: 'en', q: kw, from: 0, size: 10 },
        timeout: 8000,
        headers: { Accept: 'application/json', 'User-Agent': 'AIForBharat/1.0 (+backend scheme sync)' },
      });
      const hits = data?.data?.hits?.items || data?.hits?.hits || data?.data || [];
      for (const hit of hits) {
        const normalized = normalizeMyScheme(hit);
        if (normalized) results.push(normalized);
      }
    }
    return { items: results, error: null };
  } catch (err) {
    return { items: [], error: err.message };
  }
}

async function fetchFromDataGovIn() {
  if (!config.dataGovInResourceIds.length) return { items: [], error: 'no resource ids configured' };
  const results = [];
  let lastError = null;
  for (const resourceId of config.dataGovInResourceIds) {
    try {
      const { data } = await axios.get(`https://api.data.gov.in/resource/${resourceId}`, {
        params: { 'api-key': config.dataGovInApiKey, format: 'json', limit: 100 },
        timeout: 8000,
      });
      const records = data?.records || [];
      for (const row of records) {
        const normalized = normalizeDataGovIn(row, { resourceId, title: data?.title, org: (data?.org || []).join(', ') });
        if (normalized) results.push(normalized);
      }
    } catch (err) {
      lastError = err.message;
    }
  }
  return { items: results, error: results.length ? null : lastError };
}

function enrichSchemeMetadata(scheme) {
  const text = `${scheme.name || ''} ${scheme.description || ''} ${scheme.fullDescription || ''} ${(scheme.eligibility || []).join(' ')}`.toLowerCase();
  
  // Infer occupations
  const occ = new Set(['all']);
  if (text.includes('farmer') || text.includes('kisan') || text.includes('crop') || text.includes('agri')) occ.add('farmer');
  if (text.includes('student') || text.includes('scholarship') || text.includes('education') || text.includes('college')) occ.add('student');
  if (text.includes('business') || text.includes('startup') || text.includes('mudra') || text.includes('msme') || text.includes('loan')) occ.add('business_owner');
  if (text.includes('women') || text.includes('mahila') || text.includes('girl') || text.includes('beti')) occ.add('women');
  if (text.includes('senior citizen') || text.includes('vriddha') || text.includes('pension')) occ.add('senior_citizen');
  if (text.includes('disabled') || text.includes('divyang')) occ.add('disabled');

  // Infer gender
  let gender = 'all';
  if (text.includes('women only') || text.includes('for women') || text.includes('mahila') || text.includes('beti')) {
    gender = 'female';
  }

  // Infer state
  let state = 'Central';
  const indianStates = ['Maharashtra', 'Uttar Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'West Bengal', 'Bihar', 'Madhya Pradesh', 'Kerala', 'Punjab', 'Haryana'];
  for (const st of indianStates) {
    if (text.includes(st.toLowerCase())) {
      state = st;
      break;
    }
  }

  // Generate tags
  const tags = Array.from(new Set([
    scheme.category || 'general',
    state.toLowerCase(),
    ...Array.from(occ),
    ...(scheme.name ? scheme.name.split(/\s+/).slice(0, 3).map(w => w.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()).filter(Boolean) : [])
  ]));

  return {
    ...scheme,
    incomeLimit: scheme.incomeLimit ?? (text.includes('5 lakh') ? 500000 : text.includes('2.5 lakh') ? 250000 : 0),
    ageLimitMin: scheme.ageLimitMin ?? (text.includes('18 year') ? 18 : 0),
    ageLimitMax: scheme.ageLimitMax ?? (text.includes('60 year') ? 60 : 100),
    gender: scheme.gender || gender,
    occupation: scheme.occupation || Array.from(occ),
    state: scheme.state || state,
    subcategory: scheme.subcategory || 'General Welfare',
    applicationMode: scheme.applicationMode || 'Online',
    processingTime: scheme.processingTime || '15-30 Days',
    lastUpdated: scheme.lastUpdated || new Date().toISOString(),
    tags
  };
}

function dedupeById(schemes) {
  const map = new Map();
  for (const s of schemes) map.set(s.id, enrichSchemeMetadata(s)); // later entries overwrite earlier (live data wins over seed on id collision)
  return Array.from(map.values());
}

/**
 * Fetches live scheme data from Government sources, merges it with the bundled seed
 * dataset, and caches the result. Always resolves (never throws) — on total failure it
 * falls back to the last good disk cache, then to the seed dataset alone, so the API/UI
 * never breaks even if every external Government source is unreachable or has changed shape.
 */
export async function refreshSchemes() {
  const seed = loadSeed().map((s) => enrichSchemeMetadata({ ...s, source: 'seed:verified' }));

  const [mySchemeResult, dataGovResult] = await Promise.all([
    fetchFromMyScheme(),
    fetchFromDataGovIn(),
  ]);

  const liveItems = [...mySchemeResult.items, ...dataGovResult.items];
  const merged = dedupeById([...seed, ...liveItems]);

  const meta = {
    generatedAt: new Date().toISOString(),
    totalSchemes: merged.length,
    sources: {
      seed: { count: seed.length },
      myscheme: { count: mySchemeResult.items.length, error: mySchemeResult.error },
      dataGovIn: { count: dataGovResult.items.length, error: dataGovResult.error },
    },
  };

  const payload = { schemes: merged, meta };

  if (liveItems.length > 0) {
    // Only overwrite the cache if we actually got *something* live, so a bad run doesn't
    // wipe out a previously successful fetch.
    writeDiskCache(payload);
  } else if (!readDiskCache()) {
    // First run ever and everything failed — still persist the seed so cold starts work.
    writeDiskCache(payload);
  }

  setMem(CACHE_KEY, payload);
  return payload;
}

export async function getSchemes({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const mem = getMem(CACHE_KEY);
    if (mem) return mem;

    const disk = readDiskCache();
    if (disk) {
      setMem(CACHE_KEY, disk);
      return disk;
    }
  }

  try {
    return await refreshSchemes();
  } catch (err) {
    // Absolute last resort: seed only, annotated with the failure.
    const seed = loadSeed().map((s) => enrichSchemeMetadata({ ...s, source: 'seed:verified' }));
    return {
      schemes: seed,
      meta: {
        generatedAt: new Date().toISOString(),
        totalSchemes: seed.length,
        sources: { seed: { count: seed.length } },
        error: `Live refresh failed: ${err.message}`,
      },
    };
  }
}
