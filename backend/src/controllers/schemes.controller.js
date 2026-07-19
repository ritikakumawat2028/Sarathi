import jwt from 'jsonwebtoken';
import { getSchemes, refreshSchemes } from '../services/schemeSource.service.js';
import { User } from '../models/User.js';
import { SchemeHistory } from '../models/SchemeHistory.js';
import { AppError } from '../utils/AppError.js';
import { config } from '../config.js';

// Helper to filter schemes with multi-criteria rules
function filterSchemesList(schemes, query) {
  const {
    category,
    q,
    state,
    occupation,
    income,
    gender,
    centralOrState,
    tag
  } = query;

  let filtered = schemes.filter((s) => s.isActive !== false);

  if (category && category !== 'all') {
    filtered = filtered.filter((s) => s.category?.toLowerCase() === category.toLowerCase());
  }
  if (state && state !== 'all') {
    filtered = filtered.filter((s) => {
      if (!s.state || s.state === 'Central') return true;
      return s.state.toLowerCase() === String(state).toLowerCase();
    });
  }
  if (centralOrState && centralOrState !== 'all') {
    if (centralOrState === 'Central') {
      filtered = filtered.filter((s) => !s.state || s.state === 'Central');
    } else if (centralOrState === 'State') {
      filtered = filtered.filter((s) => s.state && s.state !== 'Central');
    }
  }
  if (occupation && occupation !== 'all') {
    const occLower = occupation.toLowerCase();
    filtered = filtered.filter((s) => {
      const occList = Array.isArray(s.occupation) ? s.occupation : [s.occupation || 'all'];
      return occList.some(o => o.toLowerCase() === occLower || o.toLowerCase() === 'all');
    });
  }
  if (gender && gender !== 'all') {
    const genderLower = gender.toLowerCase();
    filtered = filtered.filter((s) => !s.gender || s.gender.toLowerCase() === 'all' || s.gender.toLowerCase() === genderLower);
  }
  if (tag && tag !== 'all') {
    const tagLower = tag.toLowerCase();
    filtered = filtered.filter((s) => (s.tags || []).some(t => t.toLowerCase() === tagLower));
  }
  if (q) {
    const lower = String(q).toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.description.toLowerCase().includes(lower) ||
        (s.fullDescription || '').toLowerCase().includes(lower) ||
        (s.tags || []).some(t => t.toLowerCase().includes(lower))
    );
  }

  return filtered;
}

export async function listSchemes(req, res) {
  const { page = 1, limit = 20 } = req.query;
  const { schemes, meta } = await getSchemes();

  const filtered = filterSchemesList(schemes, req.query);

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(startIndex, startIndex + limitNum);

  res.json({
    schemes: paginated,
    total: filtered.length,
    page: pageNum,
    totalPages: Math.ceil(filtered.length / limitNum),
    meta
  });
}

export async function smartSearchSchemes(req, res) {
  const { q = '', category, state, occupation } = req.query;
  const { schemes, meta } = await getSchemes();

  const queryLower = String(q).toLowerCase().trim();
  let filtered = schemes.filter((s) => s.isActive !== false);

  // Natural language query interpretation
  if (queryLower.includes('student') || queryLower.includes('study') || queryLower.includes('scholarship')) {
    filtered = filtered.filter(s => s.category === 'education' || (s.tags || []).includes('student'));
  } else if (queryLower.includes('farmer') || queryLower.includes('kisan') || queryLower.includes('subsidy')) {
    filtered = filtered.filter(s => s.category === 'agriculture' || (s.tags || []).includes('farmer'));
  } else if (queryLower.includes('business') || queryLower.includes('loan') || queryLower.includes('mudra') || queryLower.includes('startup')) {
    filtered = filtered.filter(s => s.category === 'business' || (s.tags || []).includes('business_owner'));
  } else if (queryLower.includes('housing') || queryLower.includes('home') || queryLower.includes('awas')) {
    filtered = filtered.filter(s => s.category === 'housing');
  } else if (queryLower.includes('health') || queryLower.includes('hospital') || queryLower.includes('insurance')) {
    filtered = filtered.filter(s => s.category === 'health');
  } else if (queryLower) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(queryLower) ||
      s.description.toLowerCase().includes(queryLower) ||
      (s.fullDescription || '').toLowerCase().includes(queryLower) ||
      (s.tags || []).some(t => t.toLowerCase().includes(queryLower))
    );
  }

  if (category && category !== 'all') {
    filtered = filtered.filter(s => s.category === category);
  }
  if (state && state !== 'all') {
    filtered = filtered.filter(s => !s.state || s.state === 'Central' || s.state.toLowerCase() === state.toLowerCase());
  }
  if (occupation && occupation !== 'all') {
    filtered = filtered.filter(s => (s.occupation || []).includes(occupation) || (s.occupation || []).includes('all'));
  }

  // Log search to history asynchronously
  try {
    if (queryLower) {
      await SchemeHistory.create({
        userId: req.userId || null,
        type: 'search',
        title: `Search: ${q}`,
        query: q,
        resultsCount: filtered.length
      });
    }
  } catch (err) {
    // Ignore non-fatal log error
  }

  res.json({ schemes: filtered, total: filtered.length, meta });
}

export async function getSchemeById(req, res) {
  const id = parseInt(req.params.id, 10);
  const { schemes } = await getSchemes();
  const scheme = schemes.find((s) => s.id === id);
  if (!scheme) throw new AppError('Scheme not found', 404);

  // Find related schemes
  const related = schemes
    .filter(s => s.id !== scheme.id && (s.category === scheme.category || s.state === scheme.state))
    .slice(0, 4);

  res.json({ scheme, related });
}

export async function listCategories(_req, res) {
  const { schemes } = await getSchemes();
  const counts = {};
  for (const s of schemes) {
    counts[s.category] = (counts[s.category] || 0) + 1;
  }
  res.json({ categories: counts });
}

export async function refreshSchemesNow(_req, res) {
  const result = await refreshSchemes();
  res.json({ message: 'Scheme data refreshed from live sources', meta: result.meta });
}

export async function getMeta(_req, res) {
  const { meta } = await getSchemes();
  res.json({ meta });
}

// ── State Explorer Analytics ─────────────────────────────────────────────────

export async function getStateExplorerData(req, res) {
  const stateName = req.params.state || 'Central';
  const { schemes } = await getSchemes();

  const stateSchemes = schemes.filter(s => {
    if (stateName === 'Central') return !s.state || s.state === 'Central';
    return !s.state || s.state === 'Central' || (s.state && s.state.toLowerCase() === stateName.toLowerCase());
  });

  const categoryCounts = {};
  for (const s of stateSchemes) {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  }

  res.json({
    state: stateName,
    totalSchemes: stateSchemes.length,
    availableSchemes: stateSchemes,
    popularSchemes: stateSchemes.slice(0, 4),
    newSchemes: stateSchemes.slice(-4),
    categoryDistribution: categoryCounts
  });
}

// ── Step-by-Step Dynamic Eligibility Checker Wizard ──────────────────────────

export async function checkDynamicEligibility(req, res) {
  const {
    age,
    gender,
    occupation,
    income,
    category: casteCat,
    state,
    education,
    disability
  } = req.body;

  const { schemes } = await getSchemes();
  const numAge = parseInt(age, 10) || 25;
  const numIncome = parseInt(income, 10) || 0;

  const eligible = [];
  const possiblyEligible = [];
  const notEligible = [];

  for (const scheme of schemes) {
    let score = 100;
    const reasons = [];
    const missingConditions = [];

    // Check category match
    if (occupation) {
      const occList = Array.isArray(scheme.occupation) ? scheme.occupation : [scheme.occupation || 'all'];
      if (occList.includes('all') || occList.includes(occupation.toLowerCase())) {
        reasons.push(`Occupation matches (${occupation})`);
      } else {
        score -= 25;
        missingConditions.push(`Target occupation is ${occList.join(', ')}`);
      }
    }

    // Check age
    if (scheme.ageLimitMin && numAge < scheme.ageLimitMin) {
      score -= 30;
      missingConditions.push(`Minimum age is ${scheme.ageLimitMin} years`);
    } else if (scheme.ageLimitMax && numAge > scheme.ageLimitMax) {
      score -= 30;
      missingConditions.push(`Maximum age is ${scheme.ageLimitMax} years`);
    } else {
      reasons.push('Age criteria fulfilled');
    }

    // Check income
    if (scheme.incomeLimit && scheme.incomeLimit > 0 && numIncome > scheme.incomeLimit) {
      score -= 35;
      missingConditions.push(`Income limit is ₹${scheme.incomeLimit.toLocaleString()}/yr`);
    } else {
      reasons.push('Income criteria fulfilled');
    }

    // Check state
    if (scheme.state && scheme.state !== 'Central' && state && scheme.state.toLowerCase() !== state.toLowerCase()) {
      score -= 40;
      missingConditions.push(`Specific to residents of ${scheme.state}`);
    } else {
      reasons.push(`Available in ${state || 'All India'}`);
    }

    const finalScore = Math.max(0, Math.min(100, score));

    const item = {
      ...scheme,
      eligibilityScore: finalScore,
      reasons,
      missingConditions
    };

    if (finalScore >= 80) {
      eligible.push(item);
    } else if (finalScore >= 50) {
      possiblyEligible.push(item);
    } else {
      notEligible.push(item);
    }
  }

  // Automatically record eligibility check inside User activityLog so Dashboard updates immediately
  try {
    let userId = req.userId;
    if (!userId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sarathi_secret_key_2026');
      if (decoded && decoded.id) userId = decoded.id;
    }
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.activityLog.push({
          type: 'eligibility',
          title: 'Checked Scheme Eligibility',
          detail: `Found ${eligible.length} eligible schemes (${possiblyEligible.length} conditional)`
        });
        if (user.activityLog.length > 50) user.activityLog = user.activityLog.slice(-50);
        await user.save();
      }
    }
  } catch (err) {
    console.log('Eligibility check auto-log error:', err.message);
  }

  res.json({
    eligible,
    possiblyEligible,
    notEligible,
    summary: {
      totalChecked: schemes.length,
      eligibleCount: eligible.length,
      possiblyEligibleCount: possiblyEligible.length
    }
  });
}

// ── Gemini AI Recommendation System ──────────────────────────────────────────

export async function getAIRecommendations(req, res) {
  const {
    age,
    gender,
    state,
    district,
    income,
    occupation,
    education,
    disability,
    casteCategory,
    employmentStatus
  } = req.body;

  const { schemes } = await getSchemes();
  const apiKey = config.geminiApiKey;

  // Filter top matches heuristically first
  const candidateSchemes = schemes.filter(s => {
    if (s.state && s.state !== 'Central' && state && s.state.toLowerCase() !== state.toLowerCase()) return false;
    return true;
  }).slice(0, 10);

  let aiRecommendations = [];

  if (apiKey) {
    try {
      const prompt = `You are Sarthi (AI for Bharat). Analyze the following user profile and government schemes.
User Profile:
- Age: ${age || 'N/A'}
- Gender: ${gender || 'N/A'}
- State/District: ${state || 'N/A'}, ${district || 'N/A'}
- Annual Income: ₹${income || 'N/A'}
- Occupation: ${occupation || 'N/A'}
- Education: ${education || 'N/A'}
- Disability: ${disability ? 'Yes' : 'No'}
- Caste Category: ${casteCategory || 'General'}
- Employment Status: ${employmentStatus || 'N/A'}

Candidate Schemes:
${JSON.stringify(candidateSchemes.map(s => ({ id: s.id, name: s.name, category: s.category, benefits: s.benefits })), null, 2)}

Return a JSON array of up to 5 recommended schemes. Each item MUST follow exactly this JSON shape:
{
  "schemeId": number,
  "priority": "High" | "Medium",
  "estimatedEligibility": "95%" | "85%" | "75%",
  "whyUserQualifies": "Clear explanation of why this user qualifies based on occupation/age/income",
  "benefitsSummary": "Brief benefits summary",
  "alternativeSchemes": ["Name of an alternative scheme"]
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            aiRecommendations = parsed.map(item => {
              const scheme = schemes.find(s => s.id === item.schemeId) || candidateSchemes[0];
              return {
                scheme,
                priority: item.priority || 'High',
                estimatedEligibility: item.estimatedEligibility || '90%',
                whyUserQualifies: item.whyUserQualifies || 'Matches your profile occupation and location.',
                benefitsSummary: item.benefitsSummary || scheme.benefits,
                alternativeSchemes: item.alternativeSchemes || []
              };
            });
          }
        }
      }
    } catch (err) {
      console.error('Gemini AI Recommendation error:', err.message);
    }
  }

  // Fallback if Gemini unavailable or not configured
  if (!aiRecommendations.length) {
    aiRecommendations = candidateSchemes.slice(0, 5).map((s, idx) => ({
      scheme: s,
      priority: idx < 2 ? 'High' : 'Medium',
      estimatedEligibility: idx === 0 ? '95%' : idx === 1 ? '88%' : '78%',
      whyUserQualifies: `Matches your occupation (${occupation || 'citizen'}) and location (${state || 'India'}).`,
      benefitsSummary: s.benefits,
      alternativeSchemes: ['PM Jan Dhan Yojana']
    }));
  }

  // Log recommendation history and user activity
  try {
    let userId = req.userId;
    if (!userId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sarathi_secret_key_2026');
      if (decoded && decoded.id) userId = decoded.id;
    }
    await SchemeHistory.create({
      userId: userId || null,
      type: 'recommendation',
      title: `AI Recommendation for ${occupation || 'Citizen'}`,
      profileData: req.body,
      resultsCount: aiRecommendations.length
    });
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.activityLog.push({
          type: 'scheme',
          title: 'AI Scheme Recommendations Checked',
          detail: `Found ${aiRecommendations.length} tailored schemes`
        });
        if (user.activityLog.length > 50) user.activityLog = user.activityLog.slice(-50);
        await user.save();
      }
    }
  } catch (err) {}

  res.json({ recommendations: aiRecommendations });
}

// ── Gemini AI Scheme Summary & FAQs ──────────────────────────────────────────

export async function getSchemeAISummary(req, res) {
  const id = parseInt(req.params.id, 10);
  const { schemes } = await getSchemes();
  const scheme = schemes.find(s => s.id === id);
  if (!scheme) throw new AppError('Scheme not found', 404);

  const apiKey = config.geminiApiKey;
  if (apiKey) {
    try {
      const prompt = `You are Sarthi. Provide a concise AI Summary, Key Eligibility criteria, and 3 Practical FAQs for the following scheme:
Name: ${scheme.name}
Description: ${scheme.fullDescription}
Benefits: ${scheme.benefits}

Return strictly a JSON object:
{
  "summary": "2 sentence clear summary",
  "faqs": [
    {"q": "Question 1", "a": "Answer 1"},
    {"q": "Question 2", "a": "Answer 2"},
    {"q": "Question 3", "a": "Answer 3"}
  ]
}`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });
      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json(parsed);
        }
      }
    } catch (err) {}
  }

  // Fallback summary
  res.json({
    summary: `${scheme.name} is a key Government scheme providing ${scheme.benefits}.`,
    faqs: [
      { q: `Who can apply for ${scheme.name}?`, a: (scheme.eligibility || []).join(' ') },
      { q: 'What documents are needed?', a: (scheme.documents || []).join(', ') },
      { q: 'How can I apply?', a: (scheme.howToApply || []).join(' ') }
    ]
  });
}

// ── Saved Schemes / Favorites ────────────────────────────────────────────────

export async function listSavedSchemes(req, res) {
  if (!req.userId) return res.json({ schemeIds: [] });
  const user = await User.findById(req.userId).select('savedSchemes');
  if (!user) return res.json({ schemeIds: [] });

  const { schemes } = await getSchemes();
  const savedList = schemes.filter(s => user.savedSchemes.includes(s.id));
  res.json({ schemeIds: user.savedSchemes, schemes: savedList });
}

export async function saveScheme(req, res) {
  const schemeId = parseInt(req.body.schemeId, 10);
  if (!schemeId) throw new AppError('schemeId is required', 400);

  if (!req.userId) {
    return res.status(201).json({ message: 'Saved locally', schemeIds: [schemeId] });
  }

  const user = await User.findById(req.userId);
  if (!user) throw new AppError('User not found.', 404);

  if (!user.savedSchemes.includes(schemeId)) {
    user.savedSchemes.push(schemeId);
    user.activityLog.push({ type: 'scheme', title: 'Saved a government scheme', detail: `Scheme ID: ${schemeId}` });
    if (user.activityLog.length > 50) user.activityLog = user.activityLog.slice(-50);
    await user.save();
  }
  res.status(201).json({ message: 'Scheme saved', schemeIds: user.savedSchemes });
}

export async function unsaveScheme(req, res) {
  const schemeId = parseInt(req.params.schemeId, 10);

  if (!req.userId) {
    return res.json({ message: 'Removed locally', schemeIds: [] });
  }

  const user = await User.findById(req.userId);
  if (!user) throw new AppError('User not found.', 404);

  user.savedSchemes = user.savedSchemes.filter(id => id !== schemeId);
  await user.save();
  res.json({ message: 'Scheme removed from saved list', schemeIds: user.savedSchemes });
}

// ── Activity History (Viewed, Searched, Recommendations) ─────────────────────

export async function getHistory(req, res) {
  try {
    const history = await SchemeHistory.find(req.userId ? { userId: req.userId } : {})
      .sort({ createdAt: -1 })
      .limit(30);
    res.json({ history });
  } catch (err) {
    res.json({ history: [] });
  }
}

export async function logHistoryItem(req, res) {
  const { type, title, detail, schemeId, query } = req.body;
  try {
    const entry = await SchemeHistory.create({
      userId: req.userId || null,
      type: type || 'view',
      title: title || 'Viewed Scheme',
      detail,
      schemeId,
      query
    });
    res.status(201).json({ success: true, entry });
  } catch (err) {
    res.status(201).json({ success: false });
  }
}
