import { getSchemes } from '../services/schemeSource.service.js';
import { User } from '../models/User.js';

/**
 * POST /api/eligibility/check
 *
 * Multi-factor eligibility engine. Uses the authenticated user's full MongoDB
 * profile (gender, caste category, income, state, education level, occupation)
 * to determine which government schemes they qualify for — and *why*.
 *
 * Falls back to body params (occupation, income, age) for unauthenticated / quick checks.
 */
export async function checkEligibility(req, res) {
  // --- Resolve user profile ---
  let profileData = {};
  if (req.userId) {
    const user = await User.findById(req.userId).catch(() => null);
    if (user) {
      // Calculate age from DOB
      const dob = user.dateOfBirth ? new Date(user.dateOfBirth) : null;
      const age = dob ? Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : null;

      profileData = {
        occupation: user.occupation || '',
        income: user.annualIncome || 0,
        age: age || 0,
        gender: user.gender || '',
        category: user.category || '',            // general, obc, sc, st, ews
        state: user.address?.state || '',
        educationLevel: user.education?.level || '',
      };

      // Log this eligibility check
      user.activityLog.push({ type: 'eligibility', title: 'Checked scheme eligibility', detail: '' });
      if (user.activityLog.length > 50) user.activityLog = user.activityLog.slice(-50);
      await user.save().catch(() => {});
    }
  }

  // Override with body params if provided (manual override / quick check)
  const occupation = req.body.occupation || profileData.occupation || '';
  const income     = parseInt(req.body.income, 10)  || profileData.income || 0;
  const age        = parseInt(req.body.age, 10)     || profileData.age    || 0;
  const gender     = req.body.gender     || profileData.gender     || '';
  const category   = req.body.category   || profileData.category   || '';
  const state      = req.body.state      || profileData.state      || '';
  const education  = req.body.education  || profileData.educationLevel || '';

  const { schemes } = await getSchemes();
  const eligible   = [];
  const ineligible = [];

  const isFemale  = gender === 'female';
  const isFarmer  = occupation === 'farmer';
  const isStudent = occupation === 'student' || ['10th','12th','undergraduate','postgraduate','diploma'].includes(education);
  const isSC      = category === 'sc';
  const isST      = category === 'st';
  const isOBC     = category === 'obc';
  const isEWS     = category === 'ews';
  const isReserved = isSC || isST || isOBC || isEWS;

  for (const scheme of schemes.filter(s => s.isActive)) {
    const reasons = [];
    let schemeEligible = false;

    const name = (scheme.name || '').toLowerCase();
    const desc = (scheme.description || '').toLowerCase();
    const text = `${name} ${desc}`;
    const cat  = scheme.category;

    // ── Education / Scholarship Schemes ──────────────────────────────────────
    if (cat === 'education') {
      if (isStudent && income < 600000) {
        schemeEligible = true;
        reasons.push('Student with annual family income below ₹6 lakh');
      }
      if (isReserved && income < 800000) {
        schemeEligible = true;
        reasons.push(`${category.toUpperCase()} category — eligible for reserved scholarships`);
      }
      if (isFemale && isStudent) {
        schemeEligible = true;
        reasons.push('Female student — eligible for girl scholarship schemes');
      }
      // Post-matric scholarship
      if ((text.includes('post matric') || text.includes('post-matric')) && isReserved) {
        schemeEligible = true;
        reasons.push('SC/ST/OBC Post-Matric Scholarship');
      }
    }

    // ── Health Schemes ────────────────────────────────────────────────────────
    if (cat === 'health') {
      if (income < 500000) {
        schemeEligible = true;
        reasons.push('Annual income below ₹5 lakh — eligible for health schemes');
      }
      if (text.includes('ayushman') || text.includes('pmjay')) {
        if (income < 250000 || isReserved) {
          schemeEligible = true;
          reasons.push('Below poverty line or reserved category — Ayushman Bharat eligible');
        }
      }
    }

    // ── Agriculture Schemes ───────────────────────────────────────────────────
    if (cat === 'agriculture') {
      if (isFarmer) {
        schemeEligible = true;
        reasons.push('Registered as Farmer');
      }
      if (text.includes('kisan') || text.includes('pm-kisan')) {
        if (isFarmer) {
          schemeEligible = true;
          reasons.push('PM-KISAN: Small/marginal farmer');
        }
      }
    }

    // ── Business / Entrepreneurship Schemes ──────────────────────────────────
    if (cat === 'business') {
      if (['self-employed', 'business', 'unemployed'].includes(occupation)) {
        schemeEligible = true;
        reasons.push('Self-employed / business owner / seeking livelihood');
      }
      if (text.includes('mudra')) {
        if (income < 1000000) {
          schemeEligible = true;
          reasons.push('MUDRA Loan: Income below ₹10 lakh');
        }
      }
      if (isFemale && (text.includes('mahila') || text.includes('women'))) {
        schemeEligible = true;
        reasons.push('Female entrepreneur — eligible for women entrepreneurship scheme');
      }
    }

    // ── Employment / Skill Schemes ────────────────────────────────────────────
    if (cat === 'employment') {
      if (age >= 15 && age <= 45) {
        schemeEligible = true;
        reasons.push(`Age ${age} — within 15–45 working-age bracket`);
      }
      if (text.includes('pmkvy') || text.includes('skill india') || text.includes('kaushal')) {
        schemeEligible = true;
        reasons.push('Skill India / PMKVY: Any citizen can apply');
      }
    }

    // ── Social Security / Pension Schemes ─────────────────────────────────────
    if (cat === 'social_security') {
      if (age >= 18 && age <= 40 && income < 1000000) {
        schemeEligible = true;
        reasons.push(`Age ${age}, income ₹${income.toLocaleString('en-IN')} — eligible for social security scheme`);
      }
      if (text.includes('atal pension') || text.includes('apy')) {
        if (age >= 18 && age <= 40) {
          schemeEligible = true;
          reasons.push('Atal Pension Yojana: Age 18–40, unorganised sector');
        }
      }
    }

    // ── Housing Schemes ───────────────────────────────────────────────────────
    if (cat === 'housing') {
      if (income < 600000 && (text.includes('awas') || text.includes('pmay'))) {
        schemeEligible = true;
        reasons.push('PMAY: Income below ₹6 lakh — EWS/LIG category');
      } else if (income < 600000) {
        schemeEligible = true;
        reasons.push('Low income — eligible for affordable housing scheme');
      }
      if (isFemale && text.includes('awas')) {
        schemeEligible = true;
        reasons.push('Female applicant — co-ownership mandatory (bonus)');
      }
    }

    // ── Beti Bachao / Women-Specific ─────────────────────────────────────────
    if (isFemale && (text.includes('beti') || text.includes('sukanya') || text.includes('women') || text.includes('mahila'))) {
      schemeEligible = true;
      reasons.push('Female — specifically designed for women/girls');
    }

    // ── SC/ST Specific ────────────────────────────────────────────────────────
    if ((isSC || isST) && (text.includes('scheduled caste') || text.includes('sc/st') || text.includes('dalit') || text.includes('tribal'))) {
      schemeEligible = true;
      reasons.push(`${category.toUpperCase()} category — scheme specifically for SC/ST beneficiaries`);
    }

    // ── Minority schemes ─────────────────────────────────────────────────────
    if (text.includes('minority') && isOBC) {
      schemeEligible = true;
      reasons.push('OBC/Minority — eligible for minority welfare scheme');
    }

    const schemeWithReason = {
      ...scheme,
      eligible: schemeEligible,
      matchReasons: schemeEligible ? [...new Set(reasons)] : [],
    };

    (schemeEligible ? eligible : ineligible).push(schemeWithReason);
  }

  res.json({
    eligible,
    ineligible,
    profileUsed: { occupation, income, age, gender, category, state, education },
  });
}
