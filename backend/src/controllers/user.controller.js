import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

/**
 * GET /api/user/profile
 * Returns the full user profile from MongoDB.
 */
export async function getProfile(req, res) {
  const user = await User.findById(req.userId);
  if (!user) throw new AppError('User not found.', 404);
  res.json({ profile: user.toPublic() });
}

/**
 * PUT /api/user/profile
 * Merges the incoming fields into the user document in MongoDB.
 */
export async function upsertProfile(req, res) {
  if (!req.body || typeof req.body !== 'object') {
    throw new AppError('Profile payload is required.', 400);
  }

  const {
    name, phone, dateOfBirth, gender,
    occupation, annualIncome, category,
    education, address, interests, goals,
  } = req.body;

  const user = await User.findById(req.userId);
  if (!user) throw new AppError('User not found.', 404);

  // Update basic fields if provided
  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone;
  if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
  if (gender !== undefined) user.gender = gender;
  if (occupation !== undefined) user.occupation = occupation;
  if (annualIncome !== undefined) user.annualIncome = parseInt(annualIncome, 10) || 0;
  if (category !== undefined) user.category = category;

  // Update education sub-document
  if (education && typeof education === 'object') {
    Object.assign(user.education, education);
  }

  // Update address sub-document
  if (address && typeof address === 'object') {
    Object.assign(user.address, address);
  }

  if (Array.isArray(interests)) user.interests = interests;
  if (Array.isArray(goals)) user.goals = goals;

  // Log profile update
  user.activityLog.push({ type: 'profile', title: 'Profile updated', detail: '' });
  if (user.activityLog.length > 50) user.activityLog = user.activityLog.slice(-50);

  await user.save();
  res.json({ profile: user.toPublic() });
}

/**
 * POST /api/user/activity
 * Add an activity entry to the user's log.
 */
export async function addActivity(req, res) {
  const { type, title, detail } = req.body;
  if (!title) throw new AppError('Activity title is required.', 400);

  const user = await User.findById(req.userId);
  if (!user) throw new AppError('User not found.', 404);

  user.activityLog.push({ type: type || 'chat', title, detail: detail || '' });
  if (user.activityLog.length > 50) user.activityLog = user.activityLog.slice(-50);
  await user.save();

  res.status(201).json({ message: 'Activity logged' });
}

/**
 * GET /api/user/activity
 * Returns recent activity log (latest 20 entries).
 */
export async function getActivity(req, res) {
  const user = await User.findById(req.userId).select('activityLog');
  if (!user) throw new AppError('User not found.', 404);

  const recentActivity = [...user.activityLog].reverse().slice(0, 20);
  res.json({ activity: recentActivity });
}

/**
 * GET /api/user/stats
 * Returns aggregate stats for profile card.
 */
/**
 * GET /api/user/stats
 * Returns aggregate stats based on real user activity in MongoDB.
 */
export async function getStats(req, res) {
  const user = await User.findById(req.userId);
  if (!user) throw new AppError('User not found.', 404);

  const totalActivities = user.activityLog.length;
  const schemeChecks = user.activityLog.filter(a => a.type === 'scheme' || a.type === 'eligibility').length;
  const chatCount = user.activityLog.filter(a => a.type === 'chat').length;
  
  // Real progress calculations
  const totalStudyPlans = user.studyPlans.length;
  const completedStudyPlans = user.studyPlans.filter(p => p.completed).length;
  const studyProgressPercentage = totalStudyPlans > 0 ? Math.round((completedStudyPlans / totalStudyPlans) * 100) : 0;
  
  const solvedDoubtsCount = user.doubts.filter(d => d.status === 'answered').length;
  const moodLogsCount = user.wellnessLog.length;

  res.json({
    stats: {
      savedSchemes: user.savedSchemes.length,
      totalActivities,
      schemeChecks,
      chatCount,
      studySessions: completedStudyPlans, // completed tasks counts as study sessions
      totalStudyPlans,
      completedStudyPlans,
      studyProgressPercentage,
      solvedDoubtsCount,
      moodLogsCount,
    },
  });
}

// ── Study Plan Controller Methods ────────────────────────────────────────────

export async function getStudyPlans(req, res) {
  const user = await User.findById(req.userId).select('studyPlans');
  if (!user) throw new AppError('User not found.', 404);
  res.json({ studyPlans: user.studyPlans });
}

export async function addStudyPlan(req, res) {
  const { time, subject, topic } = req.body;
  if (!subject || !topic) throw new AppError('Subject and topic are required.', 400);

  const user = await User.findById(req.userId);
  if (!user) throw new AppError('User not found.', 404);

  user.studyPlans.push({
    time: time || 'Flexible Time',
    subject,
    topic,
    completed: false,
  });

  user.activityLog.push({
    type: 'study',
    title: 'Created a new study plan item',
    detail: `${subject} - ${topic}`,
  });
  if (user.activityLog.length > 50) user.activityLog = user.activityLog.slice(-50);

  await user.save();
  res.status(201).json({ studyPlans: user.studyPlans });
}

export async function toggleStudyPlan(req, res) {
  const { planId } = req.params;
  const user = await User.findById(req.userId);
  if (!user) throw new AppError('User not found.', 404);

  const plan = user.studyPlans.id(planId);
  if (!plan) throw new AppError('Study plan item not found.', 404);

  plan.completed = !plan.completed;

  // Log completion activity
  if (plan.completed) {
    user.activityLog.push({
      type: 'study',
      title: `Completed study session`,
      detail: `${plan.subject}: ${plan.topic}`,
    });
    if (user.activityLog.length > 50) user.activityLog = user.activityLog.slice(-50);
  }

  await user.save();
  res.json({ studyPlans: user.studyPlans });
}

export async function deleteStudyPlan(req, res) {
  const { planId } = req.params;
  const user = await User.findById(req.userId);
  if (!user) throw new AppError('User not found.', 404);

  user.studyPlans.pull({ _id: planId });
  await user.save();

  res.json({ studyPlans: user.studyPlans });
}

// ── Doubts Q&A Solver Method (Real Gemini API + Local Fallback Heuristics) ───

async function getRealGeminiResponse(question, subject) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('💡 No GEMINI_API_KEY found in environment. Falling back to heuristics.');
    return null;
  }
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert AI tutor. Solve the following homework doubt in detail for the subject "${subject}". Provide step-by-step explanations, clear answers, formulas if any, and keep it easy to understand for students. Question:\n\n${question}`
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('Gemini API Error details:', errData);
      return null;
    }
    
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.error('Gemini API fetch error:', err.message);
    return null;
  }
}

function generateAIDoubtAnswer(question, subject) {
  const q = question.toLowerCase();
  const sub = (subject || '').toLowerCase();

  const answers = {
    math: {
      quadratic: `To solve a quadratic equation of the form ax² + bx + c = 0, you can use the Quadratic Formula:\n\nx = [-b ± √(b² - 4ac)] / 2a\n\n**Example:** Solve x² - 5x + 6 = 0\n1. Identify a = 1, b = -5, c = 6.\n2. Calculate discriminant: d = b² - 4ac = (-5)² - 4(1)(6) = 25 - 24 = 1.\n3. Apply formula: x = [-(-5) ± √1] / 2 = (5 ± 1) / 2.\n4. Roots are x = 3 and x = 2.`,
      trigonometry: `Trigonometry studies relationships between side lengths and angles of triangles. Basic functions:\n\n* **sin(θ)** = Opposite / Hypotenuse\n* **cos(θ)** = Adjacent / Hypotenuse\n* **tan(θ)** = Opposite / Adjacent\n\n**Key Identity:** sin²(θ) + cos²(θ) = 1.`,
      calculus: `Calculus consists of two main branches:\n1. **Differential Calculus**: Studies rates of change (derivatives, slopes of curves). d/dx (xⁿ) = n·xⁿ⁻¹.\n2. **Integral Calculus**: Studies accumulation of quantities (areas under curves, antiderivatives). ∫ xⁿ dx = (xⁿ⁺¹)/(n+1) + C.`,
    },
    science: {
      photosynthesis: `Photosynthesis is the process by which green plants manufacture carbohydrates from carbon dioxide and water in the presence of sunlight and chlorophyll:\n\n**Chemical Equation:**\n6CO₂ + 6H₂O + Sunlight ──► C₆H₁₂O₆ + 6O₂\n\n* Occurs inside chloroplasts.\n* Involves Light Reactions (producing ATP & NADPH) and Light-Independent Reactions (Calvin Cycle).`,
      newton: `Newton's Three Laws of Motion:\n1. **First Law (Inertia)**: An object remains at rest or in uniform motion unless acted upon by an external net force.\n2. **Second Law (F=ma)**: Force equals mass times acceleration.\n3. **Third Law (Action/Reaction)**: For every action, there is an equal and opposite reaction.`,
      cell: `A Cell is the basic structural and functional unit of life:\n* **Cell Membrane**: Controls entry/exit of substances.\n* **Nucleus**: Storehouse of DNA/genetic code (The Brain of the Cell).\n* **Mitochondria**: Energy producer (Powerhouse of the Cell).\n* **Ribosomes**: Synthesis of proteins.`,
    }
  };

  // Subject matching
  if (sub.includes('math') || sub.includes('algebra') || sub.includes('calc')) {
    if (q.includes('quad') || q.includes('equat')) return answers.math.quadratic;
    if (q.includes('tri') || q.includes('angle') || q.includes('sin') || q.includes('cos')) return answers.math.trigonometry;
    if (q.includes('limit') || q.includes('deriv') || q.includes('integ') || q.includes('calculus')) return answers.math.calculus;
    return `Step-by-step solution solver explanation for your mathematics question:\n"${question}"\n\n1. Breakdown the given problem into variables.\n2. Isolate unknown variables using algebraic properties.\n3. Substitute values and verify. Let me know if you need specific steps for this question!`;
  }

  if (sub.includes('sci') || sub.includes('phys') || sub.includes('bio') || sub.includes('chem')) {
    if (q.includes('photo') || q.includes('plant') || q.includes('leaf')) return answers.science.photosynthesis;
    if (q.includes('newt') || q.includes('law') || q.includes('force') || q.includes('motion')) return answers.science.newton;
    if (q.includes('cell') || q.includes('mitoch') || q.includes('organ')) return answers.science.cell;
    return `AI Scientific Analysis for your query:\n"${question}"\n\nBased on physics/chemistry/biology principles:\n1. Formulate a hypothesis based on observed parameters.\n2. Apply the relevant natural laws.\n3. Conclusion matches experimental observations. Feel free to narrow down your question!`;
  }

  // General fallback dynamic solver response
  return `Here is a comprehensive explanation for your query:\n"${question}"\n\n1. **Overview**: This topic relates to ${subject || 'general learning'}.\n2. **Detailed Breakdown**: Let's review the fundamental principles. Understanding this concept requires understanding the underlying causes and terms.\n3. **Key Takeaways**: Ensure you practice exercises relating to this, and remember to divide complex questions into small steps.\n\nSarthi is always here to guide you step-by-step! Let me know if you want to explore any sub-topic.`;
}

export async function getDoubts(req, res) {
  const user = await User.findById(req.userId).select('doubts');
  if (!user) throw new AppError('User not found.', 404);
  res.json({ doubts: user.doubts });
}

export async function addDoubt(req, res) {
  const { question, subject } = req.body;
  if (!question) throw new AppError('Question is required.', 400);

  const user = await User.findById(req.userId);
  if (!user) throw new AppError('User not found.', 404);

  // Try to get real answer from Gemini first
  let resolvedAnswer = await getRealGeminiResponse(question, subject);
  
  // Fall back to rule-based parser if Gemini fails or is not configured
  if (!resolvedAnswer) {
    resolvedAnswer = generateAIDoubtAnswer(question, subject);
  }

  user.doubts.push({
    question,
    subject: subject || 'General',
    answer: resolvedAnswer,
    status: 'answered',
  });

  // Log doubt activity
  user.activityLog.push({
    type: 'chat',
    title: 'Asked AI a homework doubt',
    detail: `Q: ${question.slice(0, 40)}...`,
  });
  if (user.activityLog.length > 50) user.activityLog = user.activityLog.slice(-50);

  await user.save();
  res.status(201).json({ doubts: user.doubts });
}

// ── Wellness / Mood Tracker Controller Methods ───────────────────────────────

export async function getWellnessLog(req, res) {
  const user = await User.findById(req.userId).select('wellnessLog');
  if (!user) throw new AppError('User not found.', 404);
  res.json({ wellnessLog: user.wellnessLog });
}

export async function addWellnessLog(req, res) {
  const { mood, note } = req.body;
  if (!mood) throw new AppError('Mood emoji/label is required.', 400);

  const user = await User.findById(req.userId);
  if (!user) throw new AppError('User not found.', 404);

  user.wellnessLog.push({
    mood,
    note: note || '',
  });

  // Log wellness activity
  user.activityLog.push({
    type: 'profile',
    title: `Logged mood: ${mood}`,
    detail: note || 'Self check-in completed',
  });
  if (user.activityLog.length > 50) user.activityLog = user.activityLog.slice(-50);

  await user.save();
  res.status(201).json({ wellnessLog: user.wellnessLog });
}

// ── General AI Chat Method (Real Gemini API + Local Fallback) ────────────────

const aiChatFallbackResponses = {
  greeting: {
    en: "Hello! I'm your AI assistant for Bharat. How can I help you today? I can assist with studies, government schemes, career guidance, and more.",
    hi: "नमस्ते! मैं भारत के लिए आपका AI सहायक हूं। मैं आज आपकी कैसे मदद कर सकता हूं? मैं पढ़ाई, सरकारी योजनाओं, करियर मार्गदर्शन और बहुत कुछ में मदद कर सकता हूं।",
  },
  study: {
    en: "I can help you with your studies! I offer:\n\n1. Study planning and scheduling\n2. Doubt solving in any subject\n3. Exam preparation tips\n4. Memory techniques\n5. Mental wellness support\n\nWhich subject do you need help with?",
    hi: "मैं आपकी पढ़ाई में मदद कर सकता हूं! मैं प्रदान करता हूं:\n\n1. अध्ययन योजना और शेड्यूलिंग\n2. किसी भी विषय में संदेह समाधान\n3. परीक्षा की तैयारी के टिप्स\n4. स्मृति तकनीक\n5. मानसिक स्वास्थ्य सहायता\n\nआपको किस विषय में मदद चाहिए?",
  },
  schemes: {
    en: "I can help you find government schemes! Here are some popular schemes:\n\n1. PM-KISAN - Direct income support for farmers\n2. Ayushman Bharat - Health insurance\n3. Pradhan Mantri Mudra Yojana - Small business loans\n4. National Scholarship Portal - Education scholarships\n\nTell me your background (student, farmer, business owner, etc.) and I'll suggest relevant schemes.",
    hi: "मैं आपको सरकारी योजनाएं खोजने में मदद कर सकता हूं! यहां कुछ लोकप्रिय योजनाएं हैं:\n\n1. PM-KISAN - किसानों के लिए प्रत्यक्ष आय सहायता\n2. आयुष्मान भारत - स्वास्थ्य बीमा\n3. प्रधानमंत्री मुद्रा योजना - छोटे व्यवसाय ऋण\n4. राष्ट्रीय छात्रवृत्ति पोर्टल - शिक्षा छात्रवृत्ति\n\nमुझे अपनी पृष्ठभूमि बताएं (छात्र, किसान, व्यवसाय मालिक, आदि) और मैं प्रासंगिक योजनाओं का सुझाव दूंगा।",
  },
  career: {
    en: "I can guide you in your career! Here's what I offer:\n\n1. Skill assessment and recommendations\n2. Resume and cover letter tips\n3. Interview preparation\n4. Job and internship awareness\n5. Course suggestions based on your interests\n\nWhat's your current education level and career interest?",
    hi: "मैं आपके करियर में मार्गदर्शन कर सकता हूं! यहां मैं क्या प्रदान करता हूं:\n\n1. कौशल मूल्यांकन और सिफारिशें\n2. रिज्यूमे और कवर लेटर टिप्स\n3. साक्षात्कार की तैयारी\n4. नौकरी और इंटर्नशिप जागरूकता\n5. आपकी रुचियों के आधार पर पाठ्यक्रम सुझाव\n\nआपका वर्तमान शिक्षा स्तर और करियर रुचि क्या है?",
  },
};

function getAIResponseFallback(message, lang = 'en') {
  const q = (message || '').toLowerCase();
  const isHindi = lang === 'hi' || q.includes('नमस्ते') || q.includes('योजना') || q.includes('हिंदी');

  // 1. PM-KISAN / Farmer Schemes
  if (q.includes('pm kisan') || q.includes('kisan') || q.includes('farmer') || q.includes('किसान')) {
    return isHindi ? `### 🌾 प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)

**PM-KISAN** भारत सरकार की एक प्रमुख योजना है जो भूमिधारी किसान परिवारों को प्रत्यक्ष आय सहायता प्रदान करती है।

#### 💡 मुख्य लाभ:
- **₹6,000 प्रति वर्ष** सीधे किसान के बैंक खाते में DBT के माध्यम से।
- यह राशि ₹2,000 की 3 समान किस्तों (हर 4 महीने में) में जमा की जाती है।

#### ✅ पात्रता व दस्तावेज:
1. वैध आधार कार्ड (बैंक खाते से लिंक होना अनिवार्य)।
2. जमीन के मालिकाना हक के दस्तावेज (खतौनी/भू-अभिलेख)।
3. e-KYC पूरा होना अनिवार्य है।

🔗 **आधिकारिक पोर्टल:** [pmkisan.gov.in](https://pmkisan.gov.in)` : `### 🌾 Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)

**PM-KISAN** is a Central Sector Scheme providing direct income support to all landholding farmer families across India.

#### 💡 Key Financial Benefit:
- **₹6,000 per year** transferred directly into the bank accounts of farmer families via DBT.
- Distributed in **3 equal installments of ₹2,000** every 4 months.

#### ✅ Eligibility & Required Documents:
1. Valid **Aadhaar Card** (must be linked to bank account).
2. Land ownership records (Khatauni / Land registry).
3. Mandatory **e-KYC completion** on the official portal.

🔗 **Official Portal:** [pmkisan.gov.in](https://pmkisan.gov.in)`;
  }

  // 2. Ayushman Bharat / Health Insurance
  if (q.includes('ayushman') || q.includes('pmjay') || q.includes('health') || q.includes('medical') || q.includes('आयुष्मान')) {
    return isHindi ? `### 🏥 आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना (PM-JAY)

**PM-JAY** दुनिया की सबसे बड़ी स्वास्थ्य आश्वासन योजना है जो पात्र परिवारों को अस्पताल में भर्ती होने के लिए कैशलेस स्वास्थ्य बीमा प्रदान करती है।

#### 💡 मुख्य लाभ:
- प्रति परिवार प्रति वर्ष **₹5,00,000 (5 लाख रुपये)** तक का स्वास्थ्य बीमा।
- सरकारी और पैनल में शामिल निजी अस्पतालों में **कैशलेस व पेपरलेस इलाज**।
- 70 वर्ष से अधिक आयु के सभी वरिष्ठ नागरिकों के लिए भी मुफ्त बीमा कवरेज।

🔗 **आधिकारिक पोर्टल:** [pmjay.gov.in](https://pmjay.gov.in)` : `### 🏥 Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)

**PM-JAY** is the world's largest government-backed health insurance scheme providing cashless secondary and tertiary hospitalization care.

#### 💡 Key Benefits:
- **₹5,00,000 (5 Lakh INR)** health insurance cover per family per year.
- **100% Cashless & Paperless treatment** at empanelled public and private hospitals across India.
- Free universal coverage expanded for **all senior citizens aged 70+ years**.

🔗 **Official Portal:** [pmjay.gov.in](https://pmjay.gov.in)`;
  }

  // 3. Mudra Yojana / Business Loans
  if (q.includes('mudra') || q.includes('loan') || q.includes('business') || q.includes('startup') || q.includes('मुद्रा') || q.includes('ऋण')) {
    return isHindi ? `### 💼 प्रधानमंत्री मुद्रा योजना (PMMY)

छोटे व्यवसायों, दुकानदारों और उद्यमियों को बिना किसी गारंटी के ऋण प्रदान करने की सरकारी योजना।

#### 💡 ऋण की 3 श्रेणियां:
1. **शिशु (Shishu):** ₹50,000 तक का ऋण (नए व्यवसायों के लिए)।
2. **किशोर (Kishore):** ₹50,000 से ₹5,00,000 तक का ऋण।
3. **तरुण (Tarun):** ₹5,00,000 से ₹10,00,000 तक का ऋण।

🔗 **आधिकारिक पोर्टल:** [mudra.org.in](https://www.mudra.org.in)` : `### 💼 Pradhan Mantri MUDRA Yojana (PMMY)

Provides collateral-free institutional credit to non-corporate, non-farm small/micro enterprises across India.

#### 💡 3 Loan Categories:
1. **Shishu:** Loans up to **₹50,000** for starting micro-enterprises.
2. **Kishore:** Loans from **₹50,000 to ₹5,00,000** for established small businesses.
3. **Tarun:** Loans from **₹5,00,000 to ₹10,00,000** for business scaling.

🔗 **Official Portal:** [mudra.org.in](https://www.mudra.org.in)`;
  }

  // 4. Scholarships / NSP
  if (q.includes('scholarship') || q.includes('nsp') || q.includes('financial aid') || q.includes('छात्रवृत्ति')) {
    return isHindi ? `### 🎓 राष्ट्रीय छात्रवृत्ति पोर्टल (National Scholarship Portal - NSP)

भारत सरकार के शिक्षा मंत्रालय व विभिन्न मंत्रालयों द्वारा छात्रों के लिए छात्रवृत्तियां:

1. **PM-USP नेशनल स्कॉलरशिप:** 12वीं कक्षा में 80+ परसेंटाइल वाले छात्रों के लिए ₹20,000 से ₹50,000/वर्ष।
2. **पोस्ट-मैट्रिक छात्रवृत्ति:** SC, ST, OBC व अल्पसंख्यक छात्रों के लिए ट्यूशन व रख-रखाव भत्ता।

🔗 **आधिकारिक पोर्टल:** [scholarships.gov.in](https://scholarships.gov.in)` : `### 🎓 National Scholarship Portal (NSP) & Career Funding

Centralized government portal offering direct financial aid to meritorious and deserving students:

1. **PM-USP Central Sector Scholarship:** ₹20,000 to ₹50,000 / year for college students scoring above the 80th percentile in Class XII board exams.
2. **Post-Matric Scholarships:** Tuition reimbursement and living stipend for SC, ST, OBC, and EWS students.

🔗 **Official Portal:** [scholarships.gov.in](https://scholarships.gov.in)`;
  }

  // 5. Courses / Skills / NPTEL / SWAYAM
  if (q.includes('course') || q.includes('learn') || q.includes('swayam') || q.includes('nptel') || q.includes('certification') || q.includes('कोर्स')) {
    return isHindi ? `### 📚 SWAYAM / NPTEL एवं फ्यूचर स्किल्स सर्टिफिकेशन

भारत सरकार व IITs द्वारा मान्यता प्राप्त शीर्ष निःशुल्क पाठ्यक्रम:

1. **NPTEL Python & Data Analytics (IIT Madras):** 100% मुफ्त अध्ययन व परीक्षा के बाद सरकारी प्रमाण पत्र।
2. **Digital India AI for Bharat (MeitY):** फ्यूचर स्किल्स प्राइम पोर्टल पर AI व डिजिटल कौशल प्रमाणन।

🔗 **SWAYAM पोर्टल:** [swayam.gov.in](https://swayam.gov.in)` : `### 📚 SWAYAM / NPTEL & FutureSkills Prime Verified Courses

Enroll in Government of India & IIT recognized skill certifications:

1. **NPTEL Python & Data Analytics (IIT Madras):** 100% Free digital courseware with optional proctored IIT certification exam.
2. **Digital India AI for Bharat (MeitY & NASSCOM):** Free foundational AI certification on FutureSkills Prime.

🔗 **Official SWAYAM Portal:** [swayam.gov.in](https://swayam.gov.in)`;
  }

  // 6. Career / Resume / AI Engineer Roadmap
  if (q.includes('career') || q.includes('engineer') || q.includes('job') || q.includes('roadmap') || q.includes('interview') || q.includes('करियर')) {
    return isHindi ? `### 🚀 फुल स्टैक / AI इंजीनियर करियर रोडमैप

सफल सॉफ्टवेयर व AI इंजीनियर बनने के लिए 3-चरण योजना:

1. **चरण 1 (महीना 1-2):** Python, JavaScript/TypeScript और डेटा स्ट्रक्चर्स पर मजबूत पकड़ बनाएं।
2. **चरण 2 (महीना 3-4):** React, Next.js, Node.js व RESTful API का उपयोग करके प्रोजेक्ट्स बनाएं।
3. **चरण 3 (महीना 5-6):** Google Gemini API, RAG (Vector Search) और क्लाउड डिप्लॉयमेंट (AWS/Docker) सीखें।

🔗 **नेशनल करियर सर्विस (NCS):** [ncs.gov.in](https://www.ncs.gov.in)` : `### 🚀 Full Stack & AI Engineer Career Roadmap

Actionable 3-Phase roadmap to succeed in modern AI & software engineering roles:

1. **Phase 1 (Months 1-2): Core Fundamentals**
   - Master Python & TypeScript syntax, asynchronous programming, and Data Structures.
2. **Phase 2 (Months 3-4): Full Stack Web Systems**
   - Build responsive frontend apps with React & Tailwind CSS coupled with Node.js & MongoDB APIs.
3. **Phase 3 (Months 5-6): AI Capabilities & Cloud Architecture**
   - Integrate Google Gemini AI APIs, Vector Embeddings, and deploy containers on AWS/Docker.

🔗 **National Career Service Portal:** [ncs.gov.in](https://www.ncs.gov.in)`;
  }

  // 7. Study / Exam / Wellness
  if (q.includes('study') || q.includes('exam') || q.includes('focus') || q.includes('schedule') || q.includes('पढ़ाई')) {
    return isHindi ? `### 📖 स्मार्ट अध्ययन योजना एवं परीक्षा तैयारी

प्रभावी अध्ययन के लिए वैज्ञानिक तरीके:
1. **पोमोडोरो तकनीक (Pomodoro Technique):** 50 मिनट एकाग्रता से पढ़ाई करें, फिर 10 मिनट का ब्रेक लें।
2. **एक्टिव रिकॉल (Active Recall):** सिर्फ पढ़ने के बजाय बिना देखे मुख्य बिंदुओं को याद करके लिखें।
3. **मॉक टेस्ट अभ्यास:** हर सप्ताह कम से कम 2 पूर्ण अभ्यास टेस्ट हल करें।` : `### 📖 Smart Study Strategy & Exam Mastery

Proven techniques to boost retention and academic focus:
1. **Pomodoro Focus Sessions:** Study strictly for 50 minutes, followed by a mindful 10-minute break.
2. **Active Recall & Spaced Repetition:** Test yourself on concepts rather than passively reading notes.
3. **Weekly Practice Exams:** Complete timed mock assessments every Sunday to simulate exam pressure.`;
  }

  // 8. Python & Coding / Programming / Web Dev Queries
  if (q.includes('python') || q.includes('code') || q.includes('coding') || q.includes('javascript') || q.includes('react') || q.includes('django') || q.includes('java') || q.includes('sql') || q.includes('bug') || q.includes('program')) {
    if (q.includes('python')) {
      return isHindi ? `### 🐍 पायथन (Python) प्रोग्रामिंग मार्गदर्शन एवं समाधान

पायथन आज के समय में आर्टिफिशियल इंटेलिजेंस, डेटा साइंस और वेब डेवलपमेंट (Django/FastAPI) के लिए सबसे महत्वपूर्ण भाषा है।

#### 💡 पायथन का मूल उदाहरण (Syntax & Example):
\`\`\`python
# Python function to calculate Fibonacci series or process data
def get_fibonacci(n):
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

print(get_fibonacci(7))  # Output: [0, 1, 1, 2, 3, 5, 8]
\`\`\`

#### 🚀 सीखने और करियर के सर्वोत्तम स्रोत:
1. **NPTEL Python & Data Analytics (IIT Madras):** 100% मुफ्त प्रमाण पत्र।
2. **Internshala Python & Django Internships:** तुरंत अप्लाई करने योग्य इंटर्नशिप्स।
3. **Physics Wallah (PW) Data Science Mastery:** हिंदी में मुफ्त कोर्सेज।` : `### 🐍 Python Programming Mastery & Solution

Python is the industry-standard language for Artificial Intelligence, Data Analytics, and modern Backend Engineering (Django/FastAPI).

#### 💡 Core Syntax & Code Example:
\`\`\`python
# Professional utility to generate sequences or process data structures
def solve_or_compute(n: int) -> list:
    result = [0, 1]
    for _ in range(2, n):
        result.append(result[-1] + result[-2])
    return result

print(f"Computed Series: {solve_or_compute(7)}") # Output: [0, 1, 1, 2, 3, 5, 8]
\`\`\`

#### 🚀 Recommended Next Steps & Career Opportunities:
1. **Internshala Python & Django Internships:** Check our **Career Guidance > Jobs** tab for active stipend openings.
2. **NPTEL Python & Data Analytics:** Free government certification from IIT Madras.
3. **Best Practices:** Always write modular functions, use type hinting (\`typing\`), and practice algorithmic problems daily.`;
    }

    return isHindi ? `### 💻 सॉफ्टवेयर एवं वेब डेवलपमेंट समाधान

सॉफ्टवेयर इंजीनियरिंग में किसी भी समस्या को सुलझाने के लिए निम्नलिखित प्रक्रिया अपनाएं:

#### 💡 डिबगिंग एवं कोड स्ट्रक्चर (Best Practices):
1. **त्रुटि (Error) को समझें:** कंसोल या लॉग्स में दिए गए सटीक लाइन नंबर और एरर मैसेज को ध्यान से पढ़ें।
2. **मॉड्युलर कोड बनाएं:** छोटे, पुन: उपयोग होने वाले फंक्शन्स (Functions/Components) लिखें।
3. **डेटा स्ट्रक्चर्स एवं एल्गोरिदम (DSA):** सही डेटा स्ट्रक्चर (जैसे Hash Map, Array, Tree) का चयन कोड की स्पीड 10 गुना बढ़ा देता है।

*यदि आप किसी विशिष्ट कोड या एरर (Error) का समाधान चाहते हैं, तो कृपया अपना कोड यहाँ पेस्ट करें!*` : `### 💻 Software & Web Development Solution

To effectively build features or resolve technical issues in software development, follow this structured framework:

#### 💡 Architecture & Debugging Best Practices:
1. **Isolate the Root Cause:** Carefully inspect terminal logs, stack traces, and API responses (Network tab).
2. **Clean & Modular Code:** Break down monolithic logic into clean, reusable functions and React components.
3. **Algorithmic Efficiency:** Utilizing optimal data structures (Hash Maps, Sets, Dynamic Programming) drastically reduces time complexity from $O(n^2)$ to $O(n)$.

*If you need help debugging a specific code snippet or error message, simply paste your code below and I will provide the corrected solution!*`;
  }

  // 9. Math / Science / Academic Doubts
  if (q.includes('math') || q.includes('calculus') || q.includes('algebra') || q.includes('trigonometry') || q.includes('physics') || q.includes('chemistry') || q.includes('biology') || q.includes('equation') || q.includes('formula')) {
    if (q.includes('quad') || q.includes('equat') || q.includes('algebra')) {
      return `### 📐 Algebraic & Quadratic Equation Solver

To solve any quadratic equation of the standard form **$ax^2 + bx + c = 0$**, apply the universal Quadratic Formula:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

#### 📝 Step-by-Step Walkthrough Example:
Solve $x^2 - 5x + 6 = 0$
1. **Identify Coefficients:** $a = 1$, $b = -5$, $c = 6$.
2. **Calculate Discriminant ($\\Delta$):** $\\Delta = b^2 - 4ac = (-5)^2 - 4(1)(6) = 25 - 24 = 1$.
3. **Substitute into Formula:** $x = \\frac{-(-5) \\pm \\sqrt{1}}{2(1)} = \\frac{5 \\pm 1}{2}$.
4. **Final Roots:** $x_1 = \\frac{6}{2} = 3$ and $x_2 = \\frac{4}{2} = 2$.`;
    }
    return `### 🔬 Scientific & Academic Concept Explanation

To understand **"${message}"** thoroughly, let's look at the fundamental scientific principles:

1. **Theoretical Foundation:** Every academic topic is governed by core laws and analytical relationships. Break down complex formulas into individual variables.
2. **Analytical Derivation & Application:** Verify unit consistency and apply step-by-step logic from initial conditions to the final state.
3. **Practice & Exam Tips:** Regularly solve numerical problems and timed mock papers to solidify conceptual mastery.

*Feel free to share the exact numerical values or homework problem you want me to solve step-by-step!*`;
  }

  // 10. Check if user simply sent a brief greeting / help prompt
  if (q === 'hi' || q === 'hello' || q === 'hey' || q === 'help' || q === 'start' || q === 'नमस्ते' || q === 'हाय' || q === 'हेलो') {
    return isHindi ? `### 👋 नमस्ते! मैं **सारथि AI (Sarthi AI for Bharat)** हूं।

मैं भारत के नागरिकों और छात्रों के लिए आपका डिजिटल सलाहकार हूं। आप मुझसे निम्नलिखित विषयों पर पूछ सकते हैं:

- 🌾 **सरकारी योजनाएं:** PM-KISAN, आयुष्मान भारत (PM-JAY), मुद्रा लोन पात्रता व आवेदन प्रक्रिया।
- 🎓 **छात्रवृत्ति व फंडिंग:** नेशनल स्कॉलरशिप पोर्टल (NSP) व छात्र सहायता।
- 🚀 **करियर व कोर्सेज:** SWAYAM, NPTEL, Python Developer इंटर्नशिप्स व रेज्यूमे टिप्स।
- 📖 **अध्ययन व परीक्षा तैयारी:** स्मार्ट स्टडी शेड्यूल व करियर परामर्श।

कृपया अपना प्रश्न पूछें, मैं तुरंत सटीक जानकारी प्रदान करूंगा!` : `### 👋 Welcome! I am **Sarthi AI for Bharat**.

Your intelligent national digital assistant designed to empower citizens, students, and professionals across India. How can I assist you today?

#### 🌟 What You Can Ask Me:
- 🌾 **Government Schemes:** *PM-KISAN*, *Ayushman Bharat (PM-JAY)*, *PM Mudra Yojana* eligibility & direct portal links.
- 🎓 **Scholarships & Funding:** *National Scholarship Portal (NSP)* & STEM grants.
- 🚀 **Career & Courses:** Official *SWAYAM/NPTEL* courses, Python Developer Internships, and interview prep.
- 📖 **Study & Exam Strategy:** Scientifically proven study schedules and academic guidance.

*Ask any question above or type your specific query!*`;
  }

  // 11. Universal High-Quality Question Solver (For ANY Question / Query)
  const displayTitle = message.length > 55 ? message.slice(0, 55) + '...' : message;
  return isHindi ? `### 💡 आपके प्रश्न का विस्तृत समाधान: "${displayTitle}"

**1. मुख्य अवधारणा एवं परिचय:**
"${message}" के संबंध में, किसी भी विषय को सही और सटीक रूप से समझने के लिए उसके बुनियादी सिद्धांतों (Core Fundamentals) पर ध्यान केंद्रित करना आवश्यक है। यह विषय आधुनिक तकनीकी, शैक्षणिक एवं व्यावहारिक जीवन में महत्वपूर्ण भूमिका निभाता है।

**2. चरण-दर-चरण विश्लेषण एवं महत्वपूर्ण बिंदु:**
- **तार्किक दृष्टिकोण (Logical Approach):** समस्या या प्रश्न को छोटे, स्पष्ट चरणों में विभाजित करें ताकि प्रत्येक पहलू का सटीक उत्तर मिल सके।
- **व्यावहारिक उपयोग एवं कार्यप्रणाली:** इस सिद्धांत या तकनीक का उपयोग वास्तविक जीवन के प्रोजेक्ट्स, परीक्षा की तैयारी और पेशेवर कार्यक्षेत्र में किया जाता है।
- **सर्वोत्तम सलाह (Best Practices):** हमेशा प्रामाणिक स्रोतों, सरकारी पोर्टल्स और वैज्ञानिक विधियों का पालन करें।

**3. अगला कदम:**
यदि आप इस विषय में कोई विशिष्ट कोड, सूत्र, उदाहरण या और अधिक गहराई से जानकारी चाहते हैं, तो कृपया मुझे बताएं! **सारथि AI** आपकी हर संभव सहायता के लिए सदैव तत्पर है।` : `### 💡 Comprehensive AI Answer: "${displayTitle}"

**1. Overview & Core Principles:**
Regarding your question **"${message}"**, let's break down the foundational concepts and methodology. A complete understanding requires evaluating both theoretical foundations and real-world practical applications.

**2. Detailed Step-by-Step Analysis:**
- **Core Mechanism & Logic:** Every complex topic or problem is best solved by decomposing it into structured, manageable components. Identify the primary objective and supporting variables first.
- **Practical Application & Best Practices:** Whether you are working on software engineering, academic examinations, or professional projects, applying systematic frameworks guarantees accuracy and high efficiency.
- **Strategic Guidance:** We recommend verifying technical implementations with official reference documentation and practicing with real-world case studies.

**3. Next Steps & Interactive Follow-up:**
Would you like me to provide exact code snippets, mathematical derivations, tailored study notes, or specific examples for this query? **Sarthi AI** is here to assist you step-by-step!`;
}

export async function chatWithAI(req, res) {
  const { message, history, language } = req.body;
  if (!message) throw new AppError('Message is required.', 400);

  const apiKey = process.env.GEMINI_API_KEY || '';
  let resolvedAnswer = null;

  // Try real Google Gemini API if valid key exists
  if (apiKey && apiKey.length > 10) {
    try {
      const contents = [];
      if (Array.isArray(history)) {
        const recentHistory = history.slice(-8);
        for (const msg of recentHistory) {
          const role = msg.sender === 'user' ? 'user' : 'model';
          contents.push({
            role,
            parts: [{ text: msg.text || '' }]
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash'];
      for (const modelName of modelsToTry) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents,
                systemInstruction: {
                  parts: [{
                    text: `You are Sarthi AI for Bharat, an official-grade, friendly, and highly knowledgeable AI Assistant for Indian Citizens and Students.
Always reply in clean, well-structured GitHub-style Markdown with clear headings (###), bold key phrases, bullet points, and official portal URLs (e.g., https://pmkisan.gov.in, https://pmjay.gov.in, https://swayam.gov.in, https://scholarships.gov.in, https://www.ncs.gov.in) when relevant.
Answer accurately in the user's preferred language (${language || 'en'}).`
                  }]
                }
              })
            }
          );

          if (response.ok) {
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              resolvedAnswer = text;
              break;
            }
          }
        } catch (mErr) {
          // try next model
        }
      }
    } catch (err) {
      console.error('Gemini Chat API fetch error:', err.message);
    }
  }

  // Use Sarthi Knowledge Engine if Gemini API key is placeholder/missing/unreachable
  if (!resolvedAnswer) {
    resolvedAnswer = getAIResponseFallback(message, language || 'en');
  }

  res.json({ reply: resolvedAnswer });
}

/**
 * POST /api/chat/stream
 * Server-Sent Events streaming endpoint.
 * Sends Gemini tokens as they arrive; falls back to word-by-word simulation.
 */
export async function chatWithAIStream(req, res) {
  const { message, history, language, fileContext } = req.body;
  if (!message) {
    res.status(400).json({ error: 'Message is required.' });
    return;
  }

  // Build full message including any uploaded file context
  const fullMessage = fileContext
    ? `${fileContext}\n\nUser question: ${message}`
    : message;

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendChunk = (text) => {
    res.write(`data: ${JSON.stringify({ text })}\n\n`);
  };

  const sendDone = () => {
    res.write('data: [DONE]\n\n');
    res.end();
  };

  req.on('close', () => { try { res.end(); } catch {} });

  const apiKey = process.env.GEMINI_API_KEY || '';
  let streamedSuccessfully = false;

  if (apiKey && apiKey.length > 10) {
    const contents = [];
    if (Array.isArray(history)) {
      for (const msg of history.slice(-8)) {
        const role = (msg.sender === 'user' || msg.role === 'user') ? 'user' : 'model';
        contents.push({ role, parts: [{ text: msg.text || '' }] });
      }
    }
    contents.push({ role: 'user', parts: [{ text: fullMessage }] });

    const systemPrompt = `You are Sarthi AI for Bharat, an official-grade, friendly, and highly knowledgeable AI Assistant for Indian Citizens and Students.
Always reply in clean, well-structured GitHub-style Markdown with clear headings (###), bold key phrases, bullet points, and official portal URLs when relevant.
When users upload files, analyze them thoroughly and answer questions about the content.
Answer accurately in the user's preferred language (${language || 'en'}).`;

    for (const modelName of ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest']) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction: { parts: [{ text: systemPrompt }] },
              generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 2048 },
            }),
          }
        );

        if (!geminiRes.ok || !geminiRes.body) continue;

        const decoder = new TextDecoder();
        const reader = geminiRes.body.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (!data || data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) { sendChunk(text); streamedSuccessfully = true; }
            } catch {}
          }
        }
        if (streamedSuccessfully) break;
      } catch (err) {
        console.error(`Stream error with ${modelName}:`, err.message);
      }
    }
  }

  // Fallback: simulate streaming with the rule-based engine
  if (!streamedSuccessfully) {
    const fallback = getAIResponseFallback(message, language || 'en');
    for (const word of fallback.split(/(\s+)/)) {
      sendChunk(word);
      await new Promise((r) => setTimeout(r, 15));
    }
  }

  sendDone();
}
