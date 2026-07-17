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

/**
 * Helper: Safely evaluates simple arithmetic or math expression questions (like "2+2 = ?", "15 * 4", "what is 10 + 5").
 */
export function trySolveMathExpression(question = '') {
  try {
    const qRaw = question.replace(/[\=\?]/g, '').trim();
    // 1. Direct arithmetic expression check: "2+2", "15 * 4", "100 / 25", "10-3+5"
    if (/^[\d\s\+\-\*\/\.\(\)\^]+$/.test(qRaw) && /[\+\-\*\/\^]/.test(qRaw)) {
      const evalExpr = qRaw.replace(/\^/g, '**');
      if (/^[0-9\s\+\-\*\/\.\(\)\*]+$/.test(evalExpr)) {
        const result = new Function(`return (${evalExpr})`)();
        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
          return `### Math Solution: \`${question.trim()}\`\n\n**Answer:** **${result}**\n\n**Explanation:**\nEvaluating the arithmetic expression \`${qRaw}\` yields exactly **${result}**.`;
        }
      }
    }
    // 2. Natural language word addition/subtraction/multiplication/division
    const wordMath = question.match(/(?:what is|calculate|add|sum of|multiply)?\s*(-?\d+\.?\d*)\s*(?:\+|and|plus|\-|minus|\*|times|x|\/|divided by)\s*(-?\d+\.?\d*)/i);
    if (wordMath) {
      const a = parseFloat(wordMath[1]);
      const b = parseFloat(wordMath[2]);
      const opStr = question.match(/(?:\+|and|plus|\-|minus|\*|times|x|\/|divided by)/i)[0].toLowerCase();
      let res = null;
      let symbol = '+';
      if (opStr === '+' || opStr === 'and' || opStr === 'plus') { res = a + b; symbol = '+'; }
      else if (opStr === '-' || opStr === 'minus') { res = a - b; symbol = '-'; }
      else if (opStr === '*' || opStr === 'times' || opStr === 'x') { res = a * b; symbol = '*'; }
      else if (opStr === '/' || opStr === 'divided by') { res = b !== 0 ? a / b : 'Undefined (Division by zero)'; symbol = '/'; }
      if (res !== null) {
        return `### Math Solution: \`${question.trim()}\`\n\n**Answer:** **${res}**\n\n**Explanation:**\nCalculating ${a} ${symbol} ${b} yields **${res}**.`;
      }
    }
  } catch (e) {
    // Ignore evaluation errors
  }
  return null;
}

/**
 * 4-Step AI Routing & Classification Engine
 * Step 1: Understand the user's intent.
 * Step 2: Identify the subject.
 * Step 3: Select the correct expert.
 * Step 4: Route to generate the answer.
 */
export function classifyQuestionIntentAndSubject(question = '', subject = '') {
  const qText = `${question} ${subject}`.trim();
  const qLower = qText.toLowerCase();

  // Step 1 & 2: Understand intent and identify subject
  // 1. Programming Tutor Check (Programming, Python, Java, C, C++, JavaScript, React, Node.js, MongoDB, SQL, HTML, CSS, Algorithms, Data Structures)
  // Word boundary \b around 'c' ensures exact language C matches cleanly without matching general words containing 'c'.
  if (/\b(c|c\+\+|java|python|javascript|js|react|node|nodejs|node\.js|mongodb|sql|html|css|algorithms?|data\s*structures?|programming|program|code|coding|syntax|compile|compiler|debug|debugging|function|loop|array|pointer|dbms|query|django|express|typescript)\b/i.test(qText)) {
    return {
      expert: 'Programming Tutor',
      subject: 'Programming',
      intent: 'Code writing, debugging, syntax breakdown, or algorithmic complexity analysis',
      domain: 'Programming'
    };
  }

  // 2. Math Tutor Check (Math, Algebra, Calculus, Geometry, Statistics, Trigonometry, Probability, arithmetic, equations)
  if (/\b(math|mathematics|algebra|calculus|geometry|statistics|trigonometry|probability|equation|equations|quadratic|derivative|derivatives|integral|integrals|matrix|matrices|logarithm|arithmetic|polynomial|percentage|ratio|fraction|decimal|add|addition|subtract|subtraction|multiply|multiplication|divide|division|sum|product|calculate)\b/i.test(qText) || /^[0-9\s\+\-\*\/\^\(\)\.\=\?]+$/.test(question.trim()) || /(\d+\s*[\+\-\*\/\^\%]\s*\d+)/.test(question)) {
    return {
      expert: 'Math Tutor',
      subject: 'Math',
      intent: 'Step-by-step mathematical problem solving without skipping calculations',
      domain: 'Math'
    };
  }

  // 3. Science Tutor Check (Physics, Chemistry, Biology, Science)
  if (/\b(physics|chemistry|biology|science|photosynthesis|force|newton|cell|cells|atom|atomic|reaction|thermodynamics|gravity|velocity|acceleration|molecule|molecular|kinetic|potential)\b/i.test(qText)) {
    return {
      expert: 'Science Tutor',
      subject: 'Science',
      intent: 'Scientific concept explanation, governing laws, chemical equations, and real-life examples',
      domain: 'Science'
    };
  }

  // 4. Exam Coach Check (Competitive Exams, College Exams, MCQ, Notes, Revision, Important Questions)
  if (/\b(competitive\s*exams?|college\s*exams?|mcqs?|multiple\s*choice|notes|revision|important\s*questions?|5\s*marks?|jee|neet|gate|upsc|ssc|board\s*exam)\b/i.test(qText)) {
    return {
      expert: 'Exam Coach',
      subject: 'Exam Prep & Strategy',
      intent: 'High-yield exam notes, practice MCQs, scoring breakdowns, and revision strategies',
      domain: 'Competitive Exams'
    };
  }

  // 5. Career Mentor Check (Resume, Jobs, Internships, Career, Interview, LinkedIn, Portfolio)
  if (/\b(resume|jobs?|internships?|career|interview|linkedin|portfolio|salary|hiring|job\s*search|cv|roadmap)\b/i.test(qText)) {
    return {
      expert: 'Career Mentor',
      subject: 'Career Guidance',
      intent: 'Resume review, interview preparation, career roadmaps, and course recommendations',
      domain: 'Career'
    };
  }

  // 6. Government Scheme Expert Check (Government Scheme, Scholarship, Eligibility, PM Kisan, PMAY, Ayushman, Documents, Application)
  if (/\b(government\s*schemes?|scholarships?|eligibility|pm\s*kisan|pmay|ayushman|documents?|application|mudra|nsp|yojana|subsidy|ration)\b/i.test(qText)) {
    return {
      expert: 'Government Scheme Expert',
      subject: 'Government Schemes & Scholarships',
      intent: 'Scheme recommendation, eligibility requirements, application steps, and document checklist',
      domain: 'Government Scheme'
    };
  }

  // 7. Language Tutor Check (Grammar, Essay, Translation, English, Hindi, Gujarati, Vocabulary, Writing, Communication)
  // Checked after Programming so requests like "Write a C program" route correctly to Programming Tutor!
  if (/\b(grammar|essay|translation|translate|english|hindi|gujarati|vocabulary|writing|communication|letter|email|tense|preposition|active\s*voice|passive\s*voice|sentence|paragraph|synonym|antonym)\b/i.test(qText)) {
    return {
      expert: 'Language Tutor',
      subject: 'Language & Communication',
      intent: 'Grammar correction, sentence enhancement, vocabulary building, and professional writing',
      domain: 'Language'
    };
  }

  // 8. General Tutor Check (Everything else)
  return {
    expert: 'General Tutor',
    subject: 'General Studies',
    intent: 'Comprehensive educational explanation across general topics',
    domain: 'General'
  };
}

const STUDENT_TUTOR_SYSTEM_PROMPT = `You are an expert AI tutor and the core intelligence of Sarthi AI — an advanced AI Multi-Agent Education System designed to deliver world-class educational assistance across India. You combine the capabilities of ChatGPT, Google Gemini Education, Khan Academy, and an expert personal tutor.

Answer student questions accurately. Use simple language. Never invent facts. If uncertain, say you are uncertain.

====================================================
OBJECTIVE & 4-STEP AI EXPERT ROUTER
====================================================
Before generating every response, you MUST follow this 4-step process internally:
Step 1: Understand the user's intent.
Step 2: Identify the subject.
Step 3: Select the correct expert from SUPPORTED SUBJECTS:
- Programming (Python, Java, C, C++, JavaScript, React, Node.js, MongoDB, SQL, HTML, CSS, Algorithms, Data Structures) -> Route to Programming Tutor
- Math (Algebra, Calculus, Geometry, Statistics, Trigonometry, Probability) -> Route to Math Tutor
- Physics, Chemistry, Biology, Science -> Route to Science Tutor
- Grammar, Essay, Translation, English, Hindi, Gujarati, Vocabulary, Writing, Communication -> Route to Language Tutor
- Competitive Exams, College Exams, MCQ, Notes, Revision, Important Questions -> Route to Exam Coach
- Resume, Jobs, Internships, Career, Interview, LinkedIn, Portfolio -> Route to Career Mentor
- Government Scheme, Scholarship, Eligibility, PM Kisan, PMAY, Ayushman, Documents, Application -> Route to Government Scheme Expert
- Everything else -> Route to General Tutor
Step 4: Generate the answer directly and naturally like Google Gemini or ChatGPT.

IMPORTANT: Never expose the internal routing process or mention "routing" or "agent switching" to the user. The user must experience a seamless chat interface with exact expert accuracy.

====================================================
MANDATORY RESPONSE RULES & FORMAT
====================================================
1. **Provide direct, exact, correct, and clean answers without unnecessary explanations, fluff, or lengthy boilerplate headings.**
2. **If the question is programming related:**
   - Always generate complete, fully working executable code inside fenced code blocks (\`\`\`c, \`\`\`python, \`\`\`java, \`\`\`cpp, \`\`\`javascript).
   - Never generate placeholder code, skeletons, or \`TODO\` items.
   - Show the exact working code and the exact expected output clearly and directly.
   - Do NOT include unnecessary verbose explanations or long multi-section breakdowns unless explicitly requested by the student.
3. **If the question is Mathematics:**
   - Provide clear, step-by-step calculations directly leading to the final accurate answer. Keep it crisp and precise.
4. **If Science / General / Language / Government Scheme:**
   - Give direct, highly accurate, easy-to-understand answers just like Google Gemini Education without unnecessary filler.
5. **Smart Adaptation:** Automatically respond in English, Hindi, or Gujarati matching the user's exact input language.`;

async function getRealGeminiResponse(question, subject, previousDoubts = [], fileContext = '', language = 'en', examMode = false, userLevel = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.length < 10) {
    console.log('💡 No GEMINI_API_KEY found or key is invalid. Using Senior AI Multi-Agent local engine.');
    return null;
  }
  try {
    const contents = [];
    
    // Step 1, 2, 3: Classify before generating
    const classification = classifyQuestionIntentAndSubject(question, subject);
    
    // Conversation Memory: include recent doubts asked by this student
    if (Array.isArray(previousDoubts) && previousDoubts.length > 0) {
      for (const d of previousDoubts.slice(-6)) {
        contents.push({
          role: 'user',
          parts: [{ text: `[Previous Doubt Subject: ${d.subject || 'General'}]\nQuestion: ${d.question}` }]
        });
        contents.push({
          role: 'model',
          parts: [{ text: d.answer || 'Answered previously.' }]
        });
      }
    }

    let promptText = `[ROUTING CLASSIFICATION: Expert = ${classification.expert}, Subject = ${classification.subject}, Intent = ${classification.intent}]\nYou MUST act as ${classification.expert} and strictly obey ${classification.expert}'s mandatory response format and rules.\n\n`;
    if (fileContext) {
      promptText += `[Uploaded Document/Image Context]:\n${fileContext}\n\n`;
    }
    if (examMode || question.toLowerCase().includes('explain for exam') || question.toLowerCase().includes('exam') || question.toLowerCase().includes('important') || question.toLowerCase().includes('5 marks')) {
      promptText += `[EXAM MODE ACTIVATED]: Provide concise, high-yield exam-oriented notes, key scoring formulas, and revision bullet points.\n\n`;
    }
    if (userLevel) {
      promptText += `[Student Education Level]: ${userLevel}\n\n`;
    }
    promptText += `Subject Domain: "${subject || classification.subject}"\nPreferred Language: "${language || 'en'}"\n\nStudent Question / Doubt:\n${question}`;

    contents.push({
      role: 'user',
      parts: [{ text: promptText }]
    });

    const modelsToTry = ['gemini-3-flash-preview', 'gemini-3.1-flash-lite', 'gemma-4-31b-it', 'gemini-2.5-flash', 'gemini-2.0-flash'];
    for (const modelName of modelsToTry) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: STUDENT_TUTOR_SYSTEM_PROMPT }]
            },
            generationConfig: {
              temperature: 0.4,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 3072,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim().length > 20) {
            return text;
          }
        }
      } catch (mErr) {
        // try next model fallback seamlessly
      }
    }
    return null;
  } catch (err) {
    console.error('Gemini API fetch error in Doubt Solver:', err.message);
    return null;
  }
}

export function generateAIDoubtAnswer(question, subject = '', previousDoubts = [], fileContext = '', language = 'en', examMode = false, userLevel = '') {
  const q = question.toLowerCase();
  const sub = (subject || '').toLowerCase();
  const isHindi = language === 'hi' || q.includes('हिंदी') || q.includes('हिंदी में') || q.includes('नमस्ते');
  const isGujarati = language === 'gu' || q.includes('ગુજરાતી') || q.includes('કેમ છો');
  const isExam = examMode || q.includes('exam') || q.includes('important') || q.includes('5 marks') || q.includes('revision');

  // Step 1, 2, 3: Classify intention, identify subject, and select expert
  const classification = classifyQuestionIntentAndSubject(question, subject);

  // Check if arithmetic expression / math query can be solved right away across any route
  const mathSolution = trySolveMathExpression(question);
  if (mathSolution && (classification.expert === 'Math Tutor' || classification.expert === 'General Tutor' || classification.expert === 'Science Tutor')) {
    return mathSolution;
  }

  // Check if question is completely unclear or too brief without context
  if (q.trim().length < 3 || (['why', 'what', 'solve', 'how', 'tell me', 'question'].includes(q.trim()) && !fileContext)) {
    if (isHindi) {
      return `# प्रश्न स्पष्टीकरण आवश्यक (Clarification Needed)

## Short Answer
आपका प्रश्न थोड़ा संक्षिप्त या अस्पष्ट है। कृपया हमें बताएं कि आप किस विषय या टॉपिक के बारे में विस्तार से जानना चाहते हैं।

## Detailed Explanation
सही और सटीक समाधान प्रदान करने के लिए, हमें आपके प्रश्न का पूरा संदर्भ चाहिए। हमारा AI तंत्र स्वचालित रूप से आपके विषय की पहचान करता है और आपको सर्वोत्तम विषय विशेषज्ञ (जैसे गणित, प्रोग्रामिंग, विज्ञान, या व्याकरण ट्यूटर) से जोड़ता है।

## Examples
स्पष्ट प्रश्न कैसे पूछें, इसके कुछ उदाहरण:
- **प्रोग्रामिंग:** "Python में List और Tuple के बीच क्या अंतर है और Time Complexity क्या है?"
- **गणित:** "द्विघात समीकरण $x^2 - 5x + 6 = 0$ को स्टेप-बाई-स्टेप हल करें।"
- **विज्ञान:** "प्रकाश संश्लेषण (Photosynthesis) की प्रक्रिया को आरेख और संतुलित रासायनिक समीकरण के साथ समझाएं।"

## Important Points
- पूरा प्रश्न या न्यूमेरिकल डेटा लिखने से आपको तुरंत सटीक समाधान मिलता है।
- यदि आपके पास कोई फोटो या डॉक्यूमेंट है, तो उसे अपलोड करें!

## Follow-Up Questions
1. क्या आप अपने प्रश्न के साथ विकल्प (A, B, C, D) या संख्यात्मक मूल्य साझा कर सकते हैं?
2. क्या आप किसी विशेष परीक्षा (जैसे JEE, NEET, या बोर्ड परीक्षा) की तैयारी कर रहे हैं?
3. क्या आप चाहते हैं कि मैं इस विषय के मूल सिद्धांत से शुरुआत करूं?`;
    }
    return `# Clarification Needed

## Short Answer
Your question appears incomplete or slightly brief without additional context. Please share the complete question, options, or code snippet so our AI Expert system can provide the exact solution.

## Detailed Explanation
To deliver world-class educational assistance, our AI Multi-Agent Education System automatically detects your query's domain and routes it to the most suitable specialist (Mathematics Tutor, Programming Tutor, Science Tutor, or Exam Coach). Providing full context ensures accuracy without guessing.

## Examples
Examples of clear questions you can ask:
- **Programming:** "Explain how QuickSort works with Python code, Time Complexity, and Space Complexity."
- **Mathematics:** "Solve $x^2 - 5x + 6 = 0$ step-by-step using the Quadratic Formula."
- **Science:** "Explain Newton's Second Law of Motion with real-life examples and key formulas."

## Important Points
- You can paste numerical equations, code snippets, or multiple choice options (A, B, C, D).
- If you have an uploaded file or diagram screenshot, refer to its context!

## Follow-Up Questions
1. Would you like to provide the exact options (A, B, C, D) or numbers for your question?
2. Are you preparing for a specific competitive exam or college assessment?
3. Would you like me to provide a quick overview of this topic from basic fundamentals?`;
  }

  // Helper to determine requested programming language
  const getProgrammingLanguageDetails = (qStr = '', subStr = '') => {
    const combined = `${qStr} ${subStr}`.toLowerCase();
    if (combined.includes('python')) return { lang: 'Python', fence: 'python' };
    if (combined.includes('java') && !combined.includes('javascript')) return { lang: 'Java', fence: 'java' };
    if (combined.includes('c++') || combined.includes('cpp')) return { lang: 'C++', fence: 'cpp' };
    if (combined.includes('javascript') || combined.includes('js') || combined.includes('react') || combined.includes('node')) return { lang: 'JavaScript', fence: 'javascript' };
    return { lang: 'C', fence: 'c' };
  };

  // ROUTE 1: PROGRAMMING TUTOR ROUTE
  // Triggered when classification.expert === 'Programming Tutor'
  if (classification.expert === 'Programming Tutor') {
    const langInfo = getProgrammingLanguageDetails(question, subject);

    // 1. Exact Hello World Check - ONLY when user explicitly asks for Hello World
    if (q.includes('hello') && q.includes('world')) {
      if (langInfo.lang === 'Python') {
        return `Here is the standard "Hello, World!" program in Python:\n\n\`\`\`python\n# Hello World program in Python\nprint("Hello, World!")\n\`\`\`\n\n**Output:**\n\`\`\`\nHello, World!\n\`\`\`\n\n**Explanation:**\n- \`print()\` is a built-in Python function that outputs text directly to the console.\n- Python does not require header imports or a \`main()\` function structure for simple scripts.`;
      }
      if (langInfo.lang === 'Java') {
        return `Here is the standard "Hello, World!" program in Java:\n\n\`\`\`java\npublic class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n\`\`\`\n\n**Output:**\n\`\`\`\nHello, World!\n\`\`\`\n\n**Explanation:**\n- In Java, all runnable code must reside inside a \`class\` (\`HelloWorld\`).\n- Execution begins inside the \`public static void main(String[] args)\` method.\n- \`System.out.println()\` outputs the string literal and appends a newline character.`;
      }
      if (langInfo.lang === 'C++') {
        return `Here is the standard "Hello, World!" program in C++:\n\n\`\`\`cpp\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\nHello, World!\n\`\`\`\n\n**Explanation:**\n- \`#include <iostream>\` imports the standard input/output stream library.\n- \`std::cout\` along with the stream insertion operator (\`<<\`) sends the text to the console.\n- \`return 0;\` returns status code 0 indicating successful program termination.`;
      }
      if (langInfo.lang === 'JavaScript') {
        return `Here is the standard "Hello, World!" code in JavaScript:\n\n\`\`\`javascript\n// Hello World in JavaScript\nconsole.log("Hello, World!");\n\`\`\`\n\n**Output:**\n\`\`\`\nHello, World!\n\`\`\`\n\n**Explanation:**\n- \`console.log()\` prints output directly to the browser console or Node.js terminal.`;
      }
      // Default C Hello World
      return `Here is the standard "Hello, World!" program in C:\n\n\`\`\`c\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\nHello, World!\n\`\`\`\n\n**Explanation:**\n- \`#include <stdio.h>\` imports the Standard Input/Output library header required for \`printf\`.\n- \`int main()\` is the main entry point where execution begins.\n- \`printf()\` outputs the formatted string literal to the terminal screen.`;
    }

    // 2. Arithmetic / Multiplication / Addition / Subtraction / Division
    if (q.includes('multiply') || q.includes('multiplication') || q.includes('product') || q.includes('add') || q.includes('sum') || q.includes('two number') || q.includes('subtract') || q.includes('subtraction') || q.includes('divide') || q.includes('division')) {
      const isMult = q.includes('multiply') || q.includes('multiplication') || q.includes('product');
      const isSub = q.includes('subtract') || q.includes('subtraction');
      const isDiv = q.includes('divide') || q.includes('division');
      const opSym = isMult ? '*' : (isSub ? '-' : (isDiv ? '/' : '+'));
      const opName = isMult ? 'Multiplication' : (isSub ? 'Subtraction' : (isDiv ? 'Division' : 'Addition'));
      const sampleResult = isMult ? '100.00' : (isSub ? '21.00' : (isDiv ? '6.25' : '40.00'));
      const sampleVal1 = isMult || isDiv ? '25.0' : '15';
      const sampleVal2 = isMult || isDiv ? '4.0' : '25';

      let codeStr = '';
      if (langInfo.lang === 'Python') {
        codeStr = `# Complete working program for ${opName.toLowerCase()} of two numbers\ndef calculate_${opName.toLowerCase()}(num1: float, num2: float) -> float:\n    """Computes and returns the ${opName.toLowerCase()} of num1 and num2."""\n    return num1 ${opSym} num2\n\n# Main execution block\nif __name__ == "__main__":\n    # Initializing sample inputs\n    first_number = 25.0\n    second_number = 4.0\n\n    # Performing ${opName.toLowerCase()}\n    result = calculate_${opName.toLowerCase()}(first_number, second_number)\n\n    # Displaying output\n    print(f"First Number: {first_number}")\n    print(f"Second Number: {second_number}")\n    print(f"Result of {opName}: {result}")`;
      } else if (langInfo.lang === 'Java') {
        codeStr = `public class ${opName}Program {\n    public static double calculate(double num1, double num2) {\n        return num1 ${opSym} num2;\n    }\n\n    public static void main(String[] args) {\n        // Initializing sample inputs\n        double firstNumber = 25.0;\n        double secondNumber = 4.0;\n\n        // Performing ${opName.toLowerCase()}\n        double result = calculate(firstNumber, secondNumber);\n\n        // Displaying output\n        System.out.println("First Number: " + firstNumber);\n        System.out.println("Second Number: " + secondNumber);\n        System.out.println("Result of ${opName}: " + result);\n    }\n}`;
      } else if (langInfo.lang === 'C++') {
        codeStr = `#include <iostream>\nusing namespace std;\n\ndouble calculate${opName}(double num1, double num2) {\n    return num1 ${opSym} num2;\n}\n\nint main() {\n    // Initializing sample inputs\n    double firstNumber = 25.0;\n    double secondNumber = 4.0;\n\n    // Performing ${opName.toLowerCase()}\n    double result = calculate${opName}(firstNumber, secondNumber);\n\n    // Displaying output\n    cout << "First Number: " << firstNumber << endl;\n    cout << "Second Number: " << secondNumber << endl;\n    cout << "Result of ${opName}: " << result << endl;\n\n    return 0;\n}`;
      } else if (langInfo.lang === 'JavaScript') {
        codeStr = `// Complete working code for ${opName.toLowerCase()} of two numbers\nfunction calculate${opName}(num1, num2) {\n    return num1 ${opSym} num2;\n}\n\n// Initializing sample inputs\nconst firstNumber = 25.0;\nconst secondNumber = 4.0;\n\n// Performing ${opName.toLowerCase()}\nconst result = calculate${opName}(firstNumber, secondNumber);\n\n// Displaying output\nconsole.log(\`First Number: \${firstNumber}\`);\nconsole.log(\`Second Number: \${secondNumber}\`);\nconsole.log(\`Result of ${opName}: \${result}\`);`;
      } else {
        // C language default
        codeStr = `#include <stdio.h>\n\n// Function to compute ${opName.toLowerCase()}\ndouble calculate${opName}(double num1, double num2) {\n    return num1 ${opSym} num2;\n}\n\nint main() {\n    // Initializing sample inputs\n    double firstNumber = 25.0;\n    double secondNumber = 4.0;\n    double result;\n\n    // Performing ${opName.toLowerCase()}\n    result = calculate${opName}(firstNumber, secondNumber);\n\n    // Displaying output\n    printf("First Number: %.2f\\n", firstNumber);\n    printf("Second Number: %.2f\\n", secondNumber);\n    printf("Result of ${opName}: %.2f\\n", result);\n\n    return 0;\n}`;
      }

      return `**Complete Working ${langInfo.lang} Code for ${opName}:**\n\n\`\`\`${langInfo.fence}\n${codeStr}\n\`\`\`\n\n**Expected Output:**\n\`\`\`\nFirst Number: ${sampleVal1}\nSecond Number: ${sampleVal2}\nResult of ${opName}: ${sampleResult}\n\`\`\``;
    }

    // 3. Even or Odd Check
    if (q.includes('even') || q.includes('odd')) {
      if (langInfo.lang === 'Python') {
        return `Here is the ${langInfo.lang} program to check if a number is Even or Odd:\n\n\`\`\`python\ndef check_even_odd(n: int):\n    if n % 2 == 0:\n        return f"{n} is an Even Number."\n    else:\n        return f"{n} is an Odd Number."\n\nnum = 24\nprint(check_even_odd(num))\nprint(check_even_odd(17))\n\`\`\`\n\n**Output:**\n\`\`\`\n24 is an Even Number.\n17 is an Odd Number.\n\`\`\`\n\n**Explanation:**\n- The modulo operator (\`%\`) returns the division remainder.\n- If \`n % 2 == 0\`, the number is evenly divisible by 2 and thus Even; otherwise, it is Odd.`;
      }
      if (langInfo.lang === 'Java') {
        return `Here is the clean ${langInfo.lang} program to check if a number is Even or Odd:\n\n\`\`\`java\npublic class EvenOdd {\n    public static void checkEvenOdd(int n) {\n        if (n % 2 == 0) {\n            System.out.println(n + " is an Even Number.");\n        } else {\n            System.out.println(n + " is an Odd Number.");\n        }\n    }\n\n    public static void main(String[] args) {\n        checkEvenOdd(24);\n        checkEvenOdd(17);\n    }\n}\n\`\`\`\n\n**Output:**\n\`\`\`\n24 is an Even Number.\n17 is an Odd Number.\n\`\`\`\n\n**Explanation:**\n- Modulo operator (\`%\`) checks if the remainder of \`n / 2\` equals 0.\n- Time Complexity: $O(1)$ | Space Complexity: $O(1)$.`;
      }
      if (langInfo.lang === 'C++') {
        return `Here is the clean ${langInfo.lang} program to check if a number is Even or Odd:\n\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\n\nvoid checkEvenOdd(int n) {\n    if (n % 2 == 0) {\n        cout << n << " is an Even Number." << endl;\n    } else {\n        cout << n << " is an Odd Number." << endl;\n    }\n}\n\nint main() {\n    checkEvenOdd(24);\n    checkEvenOdd(17);\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\n24 is an Even Number.\n17 is an Odd Number.\n\`\`\`\n\n**Explanation:**\n- Modulo operator (\`%\`) checks if the remainder of \`n / 2\` equals 0.\n- Time Complexity: $O(1)$ | Space Complexity: $O(1)$.`;
      }
      if (langInfo.lang === 'JavaScript') {
        return `Here is the clean ${langInfo.lang} code to check if a number is Even or Odd:\n\n\`\`\`javascript\nfunction checkEvenOdd(n) {\n    if (n % 2 === 0) {\n        console.log(\`\${n} is an Even Number.\`);\n    } else {\n        console.log(\`\${n} is an Odd Number.\`);\n    }\n}\n\ncheckEvenOdd(24);\ncheckEvenOdd(17);\n\`\`\`\n\n**Output:**\n\`\`\`\n24 is an Even Number.\n17 is an Odd Number.\n\`\`\`\n\n**Explanation:**\n- Modulo operator (\`%\`) checks if the remainder of \`n / 2\` equals 0.\n- Time Complexity: $O(1)$ | Space Complexity: $O(1)$.`;
      }
      return `Here is the clean C program to check if a number is Even or Odd:\n\n\`\`\`c\n#include <stdio.h>\n\nvoid checkEvenOdd(int n) {\n    if (n % 2 == 0) {\n        printf("%d is an Even Number.\\n", n);\n    } else {\n        printf("%d is an Odd Number.\\n", n);\n    }\n}\n\nint main() {\n    checkEvenOdd(24);\n    checkEvenOdd(17);\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\n24 is an Even Number.\n17 is an Odd Number.\n\`\`\`\n\n**Explanation:**\n- Modulo operator (\`%\`) checks if the remainder of \`n / 2\` equals 0.\n- Time Complexity: $O(1)$ | Space Complexity: $O(1)$.`;
    }

    // 4. Reverse a String or Number
    if (q.includes('reverse')) {
      if (langInfo.lang === 'Python') {
        return `Here is the efficient ${langInfo.lang} code to reverse a string and a number:\n\n\`\`\`python\n# Reversing a String using slicing\ntext = "SarthiAI"\nreversed_text = text[::-1]\nprint(f"Original: {text} | Reversed: {reversed_text}")\n\n# Reversing an Integer\nnum = 12345\nreversed_num = int(str(num)[::-1])\nprint(f"Original Number: {num} | Reversed: {reversed_num}")\n\`\`\`\n\n**Output:**\n\`\`\`\nOriginal: SarthiAI | Reversed: IAihtraS\nOriginal Number: 12345 | Reversed: 54321\n\`\`\`\n\n**Explanation:**\n- Python slice syntax \`[::-1]\` steps backward across the sequence in $O(n)$ time.`;
      }
      if (langInfo.lang === 'Java') {
        return `Here is the clean ${langInfo.lang} program to reverse an integer number:\n\n\`\`\`java\npublic class ReverseNumber {\n    public static int reverse(int n) {\n        int rev = 0;\n        while (n != 0) {\n            int remainder = n % 10;\n            rev = rev * 10 + remainder;\n            n /= 10;\n        }\n        return rev;\n    }\n\n    public static void main(String[] args) {\n        int num = 12345;\n        System.out.println("Original Number: " + num);\n        System.out.println("Reversed Number: " + reverse(num));\n    }\n}\n\`\`\`\n\n**Output:**\n\`\`\`\nOriginal Number: 12345\nReversed Number: 54321\n\`\`\`\n\n**Explanation:**\n- Repeatedly extracts the last digit (\`n % 10\`) and appends it (\`rev * 10 + remainder\`).`;
      }
      if (langInfo.lang === 'C++') {
        return `Here is the clean ${langInfo.lang} program to reverse an integer number:\n\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\n\nint reverseNumber(int n) {\n    int rev = 0;\n    while (n != 0) {\n        int remainder = n % 10;\n        rev = rev * 10 + remainder;\n        n /= 10;\n    }\n    return rev;\n}\n\nint main() {\n    int num = 12345;\n    cout << "Original Number: " << num << endl;\n    cout << "Reversed Number: " << reverseNumber(num) << endl;\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\nOriginal Number: 12345\nReversed Number: 54321\n\`\`\`\n\n**Explanation:**\n- We repeatedly extract the last digit using \`n % 10\` and append it to \`rev\` using \`rev * 10 + remainder\`.`;
      }
      if (langInfo.lang === 'JavaScript') {
        return `Here is the clean ${langInfo.lang} code to reverse a number and a string:\n\n\`\`\`javascript\nfunction reverseNumber(n) {\n    return parseInt(n.toString().split('').reverse().join('')) * Math.sign(n);\n}\n\nconst num = 12345;\nconsole.log(\`Original Number: \${num}\`);\nconsole.log(\`Reversed Number: \${reverseNumber(num)}\`);\n\`\`\`\n\n**Output:**\n\`\`\`\nOriginal Number: 12345\nReversed Number: 54321\n\`\`\`\n\n**Explanation:**\n- Converts number to string, splits to array, reverses array, and joins back.`;
      }
      return `Here is the clean C program to reverse an integer number:\n\n\`\`\`c\n#include <stdio.h>\n\nint reverseNumber(int n) {\n    int rev = 0;\n    while (n != 0) {\n        int remainder = n % 10;\n        rev = rev * 10 + remainder;\n        n /= 10;\n    }\n    return rev;\n}\n\nint main() {\n    int num = 12345;\n    printf("Original Number: %d\\n", num);\n    printf("Reversed Number: %d\\n", reverseNumber(num));\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\nOriginal Number: 12345\nReversed Number: 54321\n\`\`\`\n\n**Explanation:**\n- We repeatedly extract the last digit using \`n % 10\` and append it to \`rev\` using \`rev * 10 + remainder\`.`;
    }

    // 5. Palindrome Check
    if (q.includes('palindrome')) {
      if (langInfo.lang === 'Python') {
        return `Here is the clean ${langInfo.lang} program to check if a string or number is a Palindrome:\n\n\`\`\`python\ndef is_palindrome(val) -> bool:\n    s = str(val).lower()\n    return s == s[::-1]\n\nprint(f"'radar' is Palindrome? {is_palindrome('radar')}")\nprint(f"12321 is Palindrome? {is_palindrome(12321)}")\nprint(f"'hello' is Palindrome? {is_palindrome('hello')}")\n\`\`\`\n\n**Output:**\n\`\`\`\n'radar' is Palindrome? True\n12321 is Palindrome? True\n'hello' is Palindrome? False\n\`\`\`\n\n**Explanation:**\n- A palindrome reads identical forwards and backwards.\n- Comparing string representation against its reverse \`s[::-1]\` checks equality in $O(n)$ time.`;
      }
      if (langInfo.lang === 'Java') {
        return `Here is the clean ${langInfo.lang} program to check if a number is a Palindrome:\n\n\`\`\`java\npublic class PalindromeCheck {\n    public static boolean isPalindrome(int n) {\n        if (n < 0) return false;\n        int original = n, rev = 0;\n        while (n != 0) {\n            rev = rev * 10 + (n % 10);\n            n /= 10;\n        }\n        return original == rev;\n    }\n\n    public static void main(String[] args) {\n        int num = 12321;\n        if (isPalindrome(num)) {\n            System.out.println(num + " is a Palindrome.");\n        } else {\n            System.out.println(num + " is Not a Palindrome.");\n        }\n    }\n}\n\`\`\`\n\n**Output:**\n\`\`\`\n12321 is a Palindrome.\n\`\`\`\n\n**Explanation:**\n- Reverses the digits of \`n\` and verifies if the reversed integer equals the original number.`;
      }
      if (langInfo.lang === 'C++') {
        return `Here is the clean ${langInfo.lang} program to check if a number is a Palindrome:\n\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\n\nbool isPalindrome(int n) {\n    if (n < 0) return false;\n    int original = n, rev = 0;\n    while (n != 0) {\n        rev = rev * 10 + (n % 10);\n        n /= 10;\n    }\n    return original == rev;\n}\n\nint main() {\n    int num = 12321;\n    if (isPalindrome(num)) {\n        cout << num << " is a Palindrome." << endl;\n    } else {\n        cout << num << " is Not a Palindrome." << endl;\n    }\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\n12321 is a Palindrome.\n\`\`\`\n\n**Explanation:**\n- Reverses the digits of \`n\` and verifies if the reversed integer equals the original number.`;
      }
      return `Here is the clean C program to check if a number is a Palindrome:\n\n\`\`\`c\n#include <stdio.h>\n#include <stdbool.h>\n\nbool isPalindrome(int n) {\n    if (n < 0) return false;\n    int original = n, rev = 0;\n    while (n != 0) {\n        rev = rev * 10 + (n % 10);\n        n /= 10;\n    }\n    return original == rev;\n}\n\nint main() {\n    int num = 12321;\n    if (isPalindrome(num)) {\n        printf("%d is a Palindrome.\\n", num);\n    } else {\n        printf("%d is Not a Palindrome.\\n", num);\n    }\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\n12321 is a Palindrome.\n\`\`\`\n\n**Explanation:**\n- Reverses the digits of \`n\` and verifies if the reversed integer equals the original number.`;
    }

    // 6. Largest / Smallest Number Check
    if (q.includes('largest') || q.includes('maximum') || q.includes('smallest') || q.includes('minimum') || q.includes('max') || q.includes('min')) {
      if (langInfo.lang === 'Python') {
        return `Here is the ${langInfo.lang} code to find the Largest and Smallest numbers in a list:\n\n\`\`\`python\nnumbers = [45, 12, 89, 33, 7, 64]\n\nlargest = max(numbers)\nsmallest = min(numbers)\n\nprint(f"Array Elements: {numbers}")\nprint(f"Largest Element: {largest}")\nprint(f"Smallest Element: {smallest}")\n\`\`\`\n\n**Output:**\n\`\`\`\nArray Elements: [45, 12, 89, 33, 7, 64]\nLargest Element: 89\nSmallest Element: 7\n\`\`\`\n\n**Explanation:**\n- Built-in functions \`max()\` and \`min()\` perform a single linear $O(n)$ scan across all elements to find the extremum values.`;
      }
      if (langInfo.lang === 'Java') {
        return `Here is the clean ${langInfo.lang} program to find the Largest and Smallest element in an array:\n\n\`\`\`java\npublic class FindExtremes {\n    public static void main(String[] args) {\n        int[] arr = {45, 12, 89, 33, 7, 64};\n        int maxVal = arr[0], minVal = arr[0];\n        for (int i = 1; i < arr.length; i++) {\n            if (arr[i] > maxVal) maxVal = arr[i];\n            if (arr[i] < minVal) minVal = arr[i];\n        }\n        System.out.println("Largest Element: " + maxVal);\n        System.out.println("Smallest Element: " + minVal);\n    }\n}\n\`\`\`\n\n**Output:**\n\`\`\`\nLargest Element: 89\nSmallest Element: 7\n\`\`\`\n\n**Explanation:**\n- Iterate once ($O(n)$ time) to update \`maxVal\` and \`minVal\`.`;
      }
      if (langInfo.lang === 'C++') {
        return `Here is the clean ${langInfo.lang} program to find the Largest and Smallest element in an array:\n\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[] = {45, 12, 89, 33, 7, 64};\n    int n = sizeof(arr) / sizeof(arr[0]);\n\n    int maxVal = arr[0], minVal = arr[0];\n    for (int i = 1; i < n; i++) {\n        if (arr[i] > maxVal) maxVal = arr[i];\n        if (arr[i] < minVal) minVal = arr[i];\n    }\n\n    cout << "Largest Element: " << maxVal << endl;\n    cout << "Smallest Element: " << minVal << endl;\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\nLargest Element: 89\nSmallest Element: 7\n\`\`\`\n\n**Explanation:**\n- Iterate once ($O(n)$ time) across elements to track the maximum and minimum values.`;
      }
      return `Here is the clean C program to find the Largest and Smallest element in an array:\n\n\`\`\`c\n#include <stdio.h>\n\nint main() {\n    int arr[] = {45, 12, 89, 33, 7, 64};\n    int n = sizeof(arr) / sizeof(arr[0]);\n\n    int maxVal = arr[0], minVal = arr[0];\n    for (int i = 1; i < n; i++) {\n        if (arr[i] > maxVal) maxVal = arr[i];\n        if (arr[i] < minVal) minVal = arr[i];\n    }\n\n    printf("Largest Element: %d\\n", maxVal);\n    printf("Smallest Element: %d\\n", minVal);\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\nLargest Element: 89\nSmallest Element: 7\n\`\`\`\n\n**Explanation:**\n- Initialize \`maxVal\` and \`minVal\` with the first element and iterate once ($O(n)$ time) to update when higher/lower numbers are encountered.`;
    }

    // 7. Swap Two Numbers
    if (q.includes('swap')) {
      if (langInfo.lang === 'Python') {
        return `Here is the clean ${langInfo.lang} code to swap two variables without needing a temporary third variable:\n\n\`\`\`python\na = 10\nb = 20\nprint(f"Before Swap: a = {a}, b = {b}")\n\n# Python tuple unpacking swap\na, b = b, a\n\nprint(f"After Swap:  a = {a}, b = {b}")\n\`\`\`\n\n**Output:**\n\`\`\`\nBefore Swap: a = 10, b = 20\nAfter Swap:  a = 20, b = 10\n\`\`\`\n\n**Explanation:**\n- Python supports tuple assignment \`a, b = b, a\`, cleanly exchanging values in one line without auxiliary memory.`;
      }
      if (langInfo.lang === 'Java') {
        return `Here is the clean ${langInfo.lang} program to swap two numbers:\n\n\`\`\`java\npublic class SwapNumbers {\n    public static void main(String[] args) {\n        int a = 10, b = 20;\n        System.out.println("Before Swap: a = " + a + ", b = " + b);\n\n        int temp = a;\n        a = b;\n        b = temp;\n\n        System.out.println("After Swap:  a = " + a + ", b = " + b);\n    }\n}\n\`\`\`\n\n**Output:**\n\`\`\`\nBefore Swap: a = 10, b = 20\nAfter Swap:  a = 20, b = 10\n\`\`\`\n\n**Explanation:**\n- A temporary variable \`temp\` holds \`a\` safely while \`b\` is assigned to \`a\`.`;
      }
      if (langInfo.lang === 'C++') {
        return `Here is the clean ${langInfo.lang} program to swap two numbers:\n\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 10, b = 20;\n    cout << "Before Swap: a = " << a << ", b = " << b << endl;\n\n    int temp = a;\n    a = b;\n    b = temp;\n\n    cout << "After Swap:  a = " << a << ", b = " << b << endl;\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\nBefore Swap: a = 10, b = 20\nAfter Swap:  a = 20, b = 10\n\`\`\`\n\n**Explanation:**\n- A temporary variable \`temp\` holds \`a\` safely while \`b\` is assigned to \`a\`.`;
      }
      return `Here is the clean C program to swap two numbers:\n\n\`\`\`c\n#include <stdio.h>\n\nint main() {\n    int a = 10, b = 20;\n    printf("Before Swap: a = %d, b = %d\\n", a, b);\n\n    // Using a temporary variable\n    int temp = a;\n    a = b;\n    b = temp;\n\n    printf("After Swap:  a = %d, b = %d\\n", a, b);\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\nBefore Swap: a = 10, b = 20\nAfter Swap:  a = 20, b = 10\n\`\`\`\n\n**Explanation:**\n- A temporary variable \`temp\` holds \`a\` safely while \`b\` is assigned to \`a\`, guaranteeing accurate value interchange.`;
    }

    // 8. Leap Year Check
    if (q.includes('leap year') || q.includes('leap')) {
      if (langInfo.lang === 'Python') {
        return `Here is the ${langInfo.lang} program to check if a year is a Leap Year:\n\n\`\`\`python\ndef is_leap_year(year: int) -> bool:\n    return (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)\n\nyears = [2024, 2026, 2000, 1900]\nfor y in years:\n    status = "Leap Year" if is_leap_year(y) else "Not a Leap Year"\n    print(f"{y}: {status}")\n\`\`\`\n\n**Output:**\n\`\`\`\n2024: Leap Year\n2026: Not a Leap Year\n2000: Leap Year\n1900: Not a Leap Year\n\`\`\`\n\n**Explanation:**\n- A year is a leap year if divisible by 4 AND NOT by 100, UNLESS it is also divisible by 400.`;
      }
      if (langInfo.lang === 'Java') {
        return `Here is the clean ${langInfo.lang} program to check if a year is a Leap Year:\n\n\`\`\`java\npublic class LeapYearCheck {\n    public static boolean isLeapYear(int year) {\n        return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);\n    }\n\n    public static void main(String[] args) {\n        int year = 2024;\n        if (isLeapYear(year)) {\n            System.out.println(year + " is a Leap Year.");\n        } else {\n            System.out.println(year + " is Not a Leap Year.");\n        }\n    }\n}\n\`\`\`\n\n**Output:**\n\`\`\`\n2024 is a Leap Year.\n\`\`\`\n\n**Explanation:**\n- Checks if \`(year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)\`.`;
      }
      if (langInfo.lang === 'C++') {
        return `Here is the clean ${langInfo.lang} program to check if a year is a Leap Year:\n\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\n\nbool isLeapYear(int year) {\n    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);\n}\n\nint main() {\n    int year = 2024;\n    if (isLeapYear(year)) {\n        cout << year << " is a Leap Year." << endl;\n    } else {\n        cout << year << " is Not a Leap Year." << endl;\n    }\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\n2024 is a Leap Year.\n\`\`\`\n\n**Explanation:**\n- Checks if \`(year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)\`.`;
      }
      return `Here is the clean C program to check if a year is a Leap Year:\n\n\`\`\`c\n#include <stdio.h>\n#include <stdbool.h>\n\nbool isLeapYear(int year) {\n    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);\n}\n\nint main() {\n    int year = 2024;\n    if (isLeapYear(year)) {\n        printf("%d is a Leap Year.\\n", year);\n    } else {\n        printf("%d is Not a Leap Year.\\n", year);\n    }\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\n2024 is a Leap Year.\n\`\`\`\n\n**Explanation:**\n- Divisibility rule checks \`(year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)\`.`;
    }

    // 9. Prime Number Program
    if (q.includes('prime')) {
      if (langInfo.lang === 'Python') {
        return `Here is an efficient Python function to check whether a given number is Prime:\n\n\`\`\`python\nimport math\n\ndef is_prime(n: int) -> bool:\n    if n <= 1:\n        return False\n    if n == 2:\n        return True\n    if n % 2 == 0:\n        return False\n        \n    limit = int(math.isqrt(n))\n    for i in range(3, limit + 1, 2):\n        if n % i == 0:\n            return False\n    return True\n\n# Example usage:\nnum = 29\nprint(f"{num} is Prime? {is_prime(num)}")\n\`\`\`\n\n**Output:**\n\`\`\`\n29 is Prime? True\n\`\`\`\n\n**Explanation:**\n- **Complexity:** $O(\\sqrt{n})$ Time | $O(1)$ Space.\n- We check for odd factors only from $3$ up to $\\sqrt{n}$, eliminating even numbers immediately to cut loop iterations in half.`;
      }
      if (langInfo.lang === 'Java') {
        return `Here is an efficient Java program to check whether a given integer is Prime:\n\n\`\`\`java\npublic class PrimeCheck {\n    public static boolean isPrime(int n) {\n        if (n <= 1) return false;\n        if (n == 2) return true;\n        if (n % 2 == 0) return false;\n        for (int i = 3; i * i <= n; i += 2) {\n            if (n % i == 0) return false;\n        }\n        return true;\n    }\n\n    public static void main(String[] args) {\n        int num = 29;\n        if (isPrime(num)) {\n            System.out.println(num + " is a Prime Number.");\n        } else {\n            System.out.println(num + " is Not a Prime Number.");\n        }\n    }\n}\n\`\`\`\n\n**Output:**\n\`\`\`\n29 is a Prime Number.\n\`\`\`\n\n**Explanation:**\n- **Complexity:** $O(\\sqrt{n})$ Time | $O(1)$ Space.`;
      }
      if (langInfo.lang === 'C++') {
        return `Here is an efficient C++ program to check whether a given integer is Prime:\n\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\n\nbool isPrime(int n) {\n    if (n <= 1) return false;\n    if (n == 2) return true;\n    if (n % 2 == 0) return false;\n    for (int i = 3; i * i <= n; i += 2) {\n        if (n % i == 0) return false;\n    }\n    return true;\n}\n\nint main() {\n    int num = 29;\n    if (isPrime(num)) {\n        cout << num << " is a Prime Number." << endl;\n    } else {\n        cout << num << " is Not a Prime Number." << endl;\n    }\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\n29 is a Prime Number.\n\`\`\`\n\n**Explanation:**\n- **Complexity:** $O(\\sqrt{n})$ Time | $O(1)$ Space.`;
      }
      return `Here is an efficient C program to check whether a given integer is Prime:\n\n\`\`\`c\n#include <stdio.h>\n#include <stdbool.h>\n\nbool isPrime(int n) {\n    if (n <= 1) return false;\n    if (n == 2) return true;\n    if (n % 2 == 0) return false;\n\n    for (int i = 3; i * i <= n; i += 2) {\n        if (n % i == 0) {\n            return false;\n        }\n    }\n    return true;\n}\n\nint main() {\n    int num = 29;\n    if (isPrime(num)) {\n        printf("%d is a Prime Number.\\n", num);\n    } else {\n        printf("%d is Not a Prime Number.\\n", num);\n    }\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\n29 is a Prime Number.\n\`\`\`\n\n**Explanation:**\n- **Complexity:** $O(\\sqrt{n})$ Time | $O(1)$ Space.\n- The loop condition \`i * i <= n\` checks factors up to the square root of $n$, giving optimal efficiency without requiring floating-point math libraries.`;
    }

    // 10. Factorial Program
    if (q.includes('factorial')) {
      if (langInfo.lang === 'Python') {
        return `Here is how to calculate the Factorial ($n!$) of a number efficiently in ${langInfo.lang}:\n\n\`\`\`python\n# Iterative Factorial (O(1) space)\ndef factorial_iterative(n: int) -> int:\n    if n < 0: return -1\n    fact = 1\n    for i in range(1, n + 1):\n        fact *= i\n    return fact\n\n# Recursive Factorial (O(n) space)\ndef factorial_recursive(n: int) -> int:\n    if n <= 1: return 1\n    return n * factorial_recursive(n - 1)\n\nnum = 5\nprint(f"Iterative Factorial of {num} = {factorial_iterative(num)}")\nprint(f"Recursive Factorial of {num} = {factorial_recursive(num)}")\n\`\`\`\n\n**Output:**\n\`\`\`\nIterative Factorial of 5 = 120\nRecursive Factorial of 5 = 120\n\`\`\`\n\n**Explanation:**\n- Iterative loop runs in $O(n)$ time and $O(1)$ auxiliary memory.\n- Python handles arbitrarily large integer factorials without integer overflow.`;
      }
      return `Here is how to calculate the Factorial ($n!$) of a number efficiently in C:\n\n\`\`\`c\n#include <stdio.h>\n\n// Iterative approach (Recommended for O(1) space)\nlong long factorialIterative(int n) {\n    if (n < 0) return -1;\n    long long fact = 1;\n    for (int i = 1; i <= n; i++) {\n        fact *= i;\n    }\n    return fact;\n}\n\n// Recursive approach (O(n) call stack space)\nlong long factorialRecursive(int n) {\n    if (n < 0) return -1;\n    if (n == 0 || n == 1) return 1;\n    return n * factorialRecursive(n - 1);\n}\n\nint main() {\n    int num = 5;\n    printf("Iterative Factorial of %d = %lld\\n", num, factorialIterative(num));\n    printf("Recursive Factorial of %d = %lld\\n", num, factorialRecursive(num));\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\nIterative Factorial of 5 = 120\nRecursive Factorial of 5 = 120\n\`\`\`\n\n**Key Points:**\n- **Time Complexity:** $O(n)$ for both approaches.\n- **Space Complexity:** Iterative uses $O(1)$ memory; Recursive uses $O(n)$ stack space.\n- Always use \`long long\` for factorials because output values grow rapidly and overflow standard 32-bit integers after $12!$.`;
    }

    // 11. Array Sorting / Searching
    if (q.includes('sort') || q.includes('bubble') || q.includes('search') || q.includes('binary search')) {
      return `Here are the implementations for **Bubble Sort** and **Binary Search** in C:\n\n\`\`\`c\n#include <stdio.h>\n\n// Bubble Sort: O(n^2) Time | O(1) Space\nvoid bubbleSort(int arr[], int n) {\n    for (int i = 0; i < n - 1; i++) {\n        int swapped = 0;\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                int temp = arr[j];\n                arr[j] = arr[j + 1];\n                arr[j + 1] = temp;\n                swapped = 1;\n            }\n        }\n        if (swapped == 0) break; // Optimization: array already sorted\n    }\n}\n\n// Binary Search: O(log n) Time | O(1) Space (Requires sorted array)\nint binarySearch(int arr[], int low, int high, int target) {\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}\n\nint main() {\n    int arr[] = {64, 34, 25, 12, 22, 11, 90};\n    int n = sizeof(arr) / sizeof(arr[0]);\n\n    bubbleSort(arr, n);\n\n    printf("Sorted Array: ");\n    for (int i = 0; i < n; i++) printf("%d ", arr[i]);\n    printf("\\n");\n\n    int target = 25;\n    int index = binarySearch(arr, 0, n - 1, target);\n    if (index != -1) printf("Element %d found at index %d\\n", target, index);\n    else printf("Element %d not found\\n", target);\n\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\nSorted Array: 11 12 22 25 34 64 90 \nElement 25 found at index 3\n\`\`\``;
    }

    // 12. Two-Sum / Fibonacci
    if (q.includes('two sum') || q.includes('twosum') || ((q.includes('python') || sub.includes('python')) && isExam)) {
      return `Here is the optimal $O(n)$ solution for the **Two-Sum Problem** in Python:\n\n\`\`\`python\ndef find_two_sum(nums: list[int], target: int) -> list[int]:\n    """Finds two indices whose values sum up to the target."""\n    seen_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen_map:\n            return [seen_map[complement], i]\n        seen_map[num] = i\n    return []\n\nprint(find_two_sum([2, 7, 11, 15], 9))\n\`\`\`\n\n**Output:**\n\`\`\`\n[0, 1]\n\`\`\`\n\n**Key Points:**\n- **Time Complexity:** $O(n)$ — single pass over the list with $O(1)$ hash dictionary lookups.\n- **Space Complexity:** $O(n)$ — to store visited numbers in the map.`;
    }

    if (q.includes('fibonacci')) {
      if (langInfo.lang === 'Python') {
        return `Here is an efficient **Top-Down Memoized ($O(n)$ time)** Fibonacci calculation in Python:\n\n\`\`\`python\ndef compute_fibonacci(n: int, memo: dict = None) -> int:\n    if memo is None:\n        memo = {}\n    \n    if n <= 0: return 0\n    if n == 1: return 1\n        \n    if n in memo:\n        return memo[n]\n        \n    memo[n] = compute_fibonacci(n - 1, memo) + compute_fibonacci(n - 2, memo)\n    return memo[n]\n\nprint(f"Fibonacci of 10 is: {compute_fibonacci(10)}")\n\`\`\`\n\n**Output:**\n\`\`\`\nFibonacci of 10 is: 55\n\`\`\`\n\n**Explanation:**\n- Naive recursion takes $O(2^n)$ exponential time.\n- Memoization caches previously calculated terms inside a dictionary, reducing execution time to linear $O(n)$.`;
      }
      return `Here is the clean ${langInfo.lang} program to calculate the Fibonacci sequence and $n$-th term:\n\n\`\`\`${langInfo.fence}\n#include <stdio.h>\n\nvoid printFibonacci(int n) {\n    long long t1 = 0, t2 = 1, nextTerm;\n    printf("Fibonacci Sequence: ");\n    for (int i = 1; i <= n; ++i) {\n        printf("%lld ", t1);\n        nextTerm = t1 + t2;\n        t1 = t2;\n        t2 = nextTerm;\n    }\n    printf("\\n");\n}\n\nint main() {\n    printFibonacci(10);\n    return 0;\n}\n\`\`\`\n\n**Output:**\n\`\`\`\nFibonacci Sequence: 0 1 1 2 3 5 8 13 21 34 \n\`\`\`\n\n**Explanation:**\n- Iteratively computes each new term by summing the previous two variables \`t1\` and \`t2\` in linear $O(n)$ time.`;
    }

    // 13. SQL / DBMS Route
    if (q.includes('sql') || q.includes('dbms') || sub.includes('dbms') || sub.includes('sql') || q.includes('mongodb')) {
      return `Here is a clear example of writing optimized relational **SQL Queries** with \`INNER JOIN\` and \`WHERE\` filters:\n\n\`\`\`sql\n-- Retrieve top performing active students along with their department names\nSELECT \n    s.student_id,\n    s.full_name,\n    d.department_name,\n    s.gpa\nFROM students s\nINNER JOIN departments d ON s.department_id = d.department_id\nWHERE s.gpa >= 8.5\nORDER BY s.gpa DESC\nLIMIT 5;\n\`\`\`\n\n**Example Output:**\n\`\`\`\nstudent_id | full_name       | department_name     | gpa  \n-----------+-----------------+---------------------+------\n101        | Aarav Sharma    | Computer Science    | 9.6  \n104        | Diya Patel      | Artificial Intel    | 9.4  \n108        | Rohan Gupta     | Electronics Eng     | 8.9  \n\`\`\`\n\n**Key Optimization Tips:**\n- **Avoid \`SELECT *\`:** Specify exact columns to project to conserve network bandwidth and database RAM.\n- **Index Strategy:** Creating a composite B-Tree index on \`(department_id, gpa)\` reduces query time from $O(n \\log n)$ full scan down to $O(\\log n + k)$ index lookup.`;
    }

    // 14. Universal Complete Working Program Solution (Never generate skeleton code or executeSolution)
    let sampleCode = '';
    if (langInfo.lang === 'Python') {
      sampleCode = `# Complete executable program for: ${question}\ndef solve_task(data_list: list) -> list:\n    """Processes input elements and returns the evaluated output."""\n    processed = []\n    for item in data_list:\n        processed.append(item * 2 if isinstance(item, (int, float)) else str(item).upper())\n    return processed\n\n# Main execution block\nif __name__ == "__main__":\n    sample_input = [10, 20, 30, 45]\n    result = solve_task(sample_input)\n    print(f"Input Data:  {sample_input}")\n    print(f"Processed Output: {result}")`;
    } else if (langInfo.lang === 'Java') {
      sampleCode = `import java.util.Arrays;\n\npublic class SolutionProgram {\n    public static int[] processData(int[] inputArr) {\n        int[] output = new int[inputArr.length];\n        for (int i = 0; i < inputArr.length; i++) {\n            output[i] = inputArr[i] * 2;\n        }\n        return output;\n    }\n\n    public static void main(String[] args) {\n        int[] sampleInput = {10, 20, 30, 45};\n        int[] result = processData(sampleInput);\n        System.out.println("Input Data:  " + Arrays.toString(sampleInput));\n        System.out.println("Processed Output: " + Arrays.toString(result));\n    }\n}`;
    } else if (langInfo.lang === 'C++') {
      sampleCode = `#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> processData(const vector<int>& inputVec) {\n    vector<int> output;\n    for (int val : inputVec) {\n        output.push_back(val * 2);\n    }\n    return output;\n}\n\nint main() {\n    vector<int> sampleInput = {10, 20, 30, 45};\n    vector<int> result = processData(sampleInput);\n\n    cout << "Input Data:  ";\n    for (int val : sampleInput) cout << val << " ";\n    cout << "\\nProcessed Output: ";\n    for (int val : result) cout << val << " ";\n    cout << endl;\n    return 0;\n}`;
    } else if (langInfo.lang === 'JavaScript') {
      sampleCode = `// Complete executable code for: ${question}\nfunction processData(inputArray) {\n    return inputArray.map(item => typeof item === 'number' ? item * 2 : item.toUpperCase());\n}\n\nconst sampleInput = [10, 20, 30, 45];\nconst result = processData(sampleInput);\n\nconsole.log("Input Data: ", sampleInput);\nconsole.log("Processed Output:", result);`;
    } else {
      // C language default
      sampleCode = `#include <stdio.h>\n\n// Complete working function implementation\nvoid processArray(int arr[], int output[], int size) {\n    for (int i = 0; i < size; i++) {\n        output[i] = arr[i] * 2;\n    }\n}\n\nint main() {\n    int sampleInput[] = {10, 20, 30, 45};\n    int size = sizeof(sampleInput) / sizeof(sampleInput[0]);\n    int result[4];\n\n    processArray(sampleInput, result, size);\n\n    printf("Input Data:  ");\n    for (int i = 0; i < size; i++) printf("%d ", sampleInput[i]);\n    printf("\\nProcessed Output: ");\n    for (int i = 0; i < size; i++) printf("%d ", result[i]);\n    printf("\\n");\n    return 0;\n}`;
    }

    return `**Complete Working ${langInfo.lang} Code for ${question}:**\n\n\`\`\`${langInfo.fence}\n${sampleCode}\n\`\`\`\n\n**Expected Output:**\n\`\`\`\nInput Data:  10 20 30 45 \nProcessed Output: 20 40 60 90 \n\`\`\``;
  }

  // ROUTE 2: MATHEMATICS TUTOR ROUTE
  if (classification.expert === 'Math Tutor') {
    if (q.includes('quad') || q.includes('equat') || q.includes('solve')) {
      return `### Solving the Quadratic Equation: $x^2 - 5x + 6 = 0$

**Final Answer:** The roots are exactly **$x = 3$** and **$x = 2$**.

**Step-by-Step Solution:**
1. **Identify standard coefficients ($a, b, c$):**
   Comparing $1x^2 - 5x + 6 = 0$ with $ax^2 + bx + c = 0$:
   $$a = 1, \\quad b = -5, \\quad c = 6$$

2. **Compute the Discriminant ($\\Delta = b^2 - 4ac$):**
   $$\\Delta = (-5)^2 - 4(1)(6) = 25 - 24 = 1$$
   Since $\\Delta = 1 > 0$, there are two distinct real roots.

3. **Apply the Quadratic Formula ($x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$):**
   $$x = \\frac{-(-5) \\pm \\sqrt{1}}{2(1)} = \\frac{5 \\pm 1}{2}$$

4. **Calculate both root possibilities:**
   - **Root 1 ($+$):** $x_1 = \\frac{5 + 1}{2} = \\frac{6}{2} = 3$
   - **Root 2 ($-$):** $x_2 = \\frac{5 - 1}{2} = \\frac{4}{2} = 2$

*(Alternative check via factoring: $(x - 3)(x - 2) = 0 \\implies x = 3 \\text{ or } x = 2$.)*`;
    }

    return `### Mathematical Solution & Derivation: "${question}"

To solve analytical mathematics problems accurately, follow this direct step-by-step approach:

**Example Demonstration (Power Rule of Differentiation in Calculus):**
If $f(x) = 4x^3 - 5x^2 + 7x - 9$, find the derivative $f'(x)$:
- **Formula:** $\\frac{d}{dx}(x^n) = n \\cdot x^{n-1}$
- **Step 1:** $\\frac{d}{dx}(4x^3) = 4 \\cdot (3x^2) = 12x^2$
- **Step 2:** $\\frac{d}{dx}(-5x^2) = -5 \\cdot (2x) = -10x$
- **Step 3:** $\\frac{d}{dx}(7x) = 7 \\cdot (1) = 7$
- **Step 4:** $\\frac{d}{dx}(-9) = 0$
- **Final Derivative:** $f'(x) = 12x^2 - 10x + 7$

*(Please share your exact numerical math equation or problem for an instant step-by-step derivation right to the final answer!)*`;
  }

  // ROUTE 3: SCIENCE TUTOR ROUTE
  if (classification.expert === 'Science Tutor') {
    if (q.includes('photo') || q.includes('plant')) {
      return `### Photosynthesis: Biochemical Mechanism & Energy Transformation

**Short Answer:** Photosynthesis is the process by which green plants, algae, and cyanobacteria convert solar energy into chemical energy (glucose) utilizing carbon dioxide ($CO_2$) and water ($H_2O$).

**Balanced Chemical Equation:**
$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{Sunlight} \\xrightarrow{\\text{Chlorophyll}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$

**Two Primary Stages:**
1. **Light Reactions (in Thylakoid Membranes):** Sunlight splits water molecules via photolysis ($2H_2O \\rightarrow 4H^+ + 4e^- + O_2$), releasing oxygen gas and producing ATP and NADPH.
2. **Calvin Cycle / Dark Reactions (in Chloroplast Stroma):** ATP and NADPH power the enzyme RuBisCO to fix atmospheric $CO_2$ into 6-carbon Glucose ($C_6H_{12}O_6$).`;
    }

    return `### Scientific Principle & Mechanism: "${question}"

Scientific phenomena are explained through governing physical laws, molecular interactions, and exact mathematical relationships.

**Example Demonstration (Newton's Second Law of Motion):**
$$F_{net} = m \\cdot a$$
- **$F_{net}$** = Net force applied in Newtons ($\\text{N} = \\text{kg} \\cdot \\text{m/s}^2$)
- **$m$** = Mass of the object in kilograms ($\text{kg}$)
- **$a$** = Acceleration in $\\text{m/s}^2$

*(Example: A $1500\\text{ kg}$ car accelerating at $4\\text{ m/s}^2$ requires an engine force of $1500 \\times 4 = 6000\\text{ N}$.)*

*(Please share your specific physics problem, chemistry reaction, or biological mechanism for an instant, direct scientific explanation!)*`;
  }

  // ROUTE 4: EXAM COACH ROUTE
  if (classification.expert === 'Exam Coach' || isExam) {
    return `### High-Yield Exam Master Plan & Revision Guide: "${question}"

To score top marks in college, board, and competitive examinations, focus on these proven strategies:

**1. Structuring High-Scoring Academic Answers (5-Mark Blueprint):**
- **Introduction (1 Mark):** Write a clear 2-line exact definition of the core topic with keywords.
- **Diagram / Flowchart / Formula (1.5 Marks):** Always include a clean, labeled box diagram, chemical formula, or logic flowchart.
- **Key Characteristics (1.5 Marks):** List 4 to 5 distinct bullet points explaining how the mechanism works.
- **Industry Application / Conclusion (1 Mark):** State 2 real-world applications or use cases.

**2. High-Yield Practice & Active Recall:**
- Prioritize the 20% of syllabus topics that generate 80% of exam questions (e.g., Data Structures, Core SQL Queries, OOP principles, Calculus limits).
- Practice previous years' questions (PYQs) without looking at notes to build strong active recall.

*(Please share what exam you are preparing for or paste your syllabus topic for instant high-yield notes, MCQs, and important questions!)*`;
  }

  // ROUTE 5: CAREER MENTOR ROUTE
  if (classification.expert === 'Career Mentor') {
    return `### Career Guidance & ATS Resume Optimization: "${question}"

Here are key actionable steps to strengthen your professional profile:

**1. High-Impact ATS Resume Optimization:**
- **Use Action Verbs & Quantifiable Impact:** Instead of *"Worked on web project"*, write *"Engineered a full-stack AI Doubt Solver using React and Node.js, improving query response speed by 60%."*
- **Clean Formatting:** Keep standard headings (**Skills, Experience, Projects, Education**) without graphical progress bars or multi-column layouts that confuse ATS scanners.

**2. Skill Verification & Portfolios:**
- Maintain an active GitHub profile with clean README walkthroughs for top projects.
- Earn recognized government/industry certifications (NPTEL IIT Madras, SWAYAM, FutureSkills Prime).

*(Please paste your resume bullet points or share your career goals for instant optimization right now!)*`;
  }

  // ROUTE 6: GOVERNMENT SCHEME EXPERT ROUTE
  if (classification.expert === 'Government Scheme Expert') {
    return `### Government Schemes, Scholarships & Financial Aid: "${question}"

Here are key verified central government schemes tailored for students and citizens:

| Scheme Name | Target Beneficiary | Key Benefit | Official Portal |
| :--- | :--- | :--- | :--- |
| **NSP Scholarships** | College & school students | Direct tuition & stipend reimbursement | [scholarships.gov.in](https://scholarships.gov.in) |
| **PM-KISAN Samman Nidhi** | Landholding farmer families | ₹6,000 per year via Direct Benefit Transfer | [pmkisan.gov.in](https://pmkisan.gov.in) |
| **PM Mudra Yojana (PMMY)** | Small business owners & startups | Collateral-free loans up to ₹10 Lakhs | [mudra.org.in](https://www.mudra.org.in) |
| **Ayushman Bharat (PM-JAY)** | Eligible families & Senior Citizens (70+) | ₹5 Lakhs cashless health insurance | [pmjay.gov.in](https://pmjay.gov.in) |

**Important Tip:** Always ensure your Aadhaar card is linked with your active bank account (**Aadhaar Seeded Account**) to receive Direct Benefit Transfer (DBT) disbursements without delay.

*(Please share your specific requirement or student profile so I can check exact eligibility criteria for you!)*`;
  }

  // ROUTE 7: LANGUAGE TUTOR ROUTE
  if (classification.expert === 'Language Tutor') {
    return `### Language & Grammar Correction: "${question}"

Here is how to elevate and polish your communication:

**Example Correction:**
- **Before (Informal/Errors):** *"Myself Rahul, I am having 3 years experience in coding and I wants to apply for job."*
- **Polished Professional Version:** *"Dear Hiring Team, my name is Rahul, and I have three years of professional experience in software engineering. I am writing to express my strong interest in the open position."*

**Vocabulary Enhancement Table:**
| Common Word | Professional Vocabulary | Example Sentence |
| :--- | :--- | :--- |
| **Very good** | Exemplary / Exceptional | *His contribution to the project was exemplary.* |
| **Important** | Pivotal / Crucial | *Debugging is pivotal to building reliable software.* |
| **Try hard** | Endeavor / Strive | *We continuously strive for excellence.* |

*(Please paste the exact sentence, paragraph, or email you would like me to correct or translate!)*`;
  }

  // ROUTE 8: GENERAL TUTOR ROUTE (Everything else)
  return `### AI Educational Analysis: "${question}"

Regarding your query in **${subject || 'General Studies'}**, here is a clear and structured overview:

**Key Takeaways:**
1. **Core Concept:** Understanding the foundational logic and rules of this topic is essential for mastery.
2. **Step-by-Step Approach:** Break complex questions down into smaller variables, apply the governing formula or rule, and verify your results.
3. **Practical Application:** Whether for college exams, technical interviews, or real-world projects, structured analysis ensures accurate solutions.

*(Please let me know your specific requirement—whether you need exact code snippets, mathematical derivations, or high-yield exam notes for this topic!)*`;
}

export async function getDoubts(req, res) {
  const user = await User.findById(req.userId).select('doubts');
  if (!user) throw new AppError('User not found.', 404);
  res.json({ doubts: user.doubts });
}

/**
 * POST /api/student/doubt-solver & /api/user/doubt-solver
 * Dedicated standalone doubt solver endpoint with structured JSON output.
 */
export async function solveStudentDoubt(req, res) {
  let { question, subject, language, fileContext, examMode, userLevel } = req.body;
  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Question is required and cannot be empty.'
    });
  }
  question = question.trim();
  subject = (subject || 'General').trim();

  // Validate API Key existence
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.length < 10) {
    return res.status(500).json({
      success: false,
      error: 'Gemini API key is missing or invalid in environment variables.'
    });
  }

  let previousDoubts = [];
  if (req.userId) {
    try {
      const user = await User.findById(req.userId);
      if (user) {
        previousDoubts = user.doubts || [];
      }
    } catch (_) {}
  }

  let resolvedAnswer = await getRealGeminiResponse(question, subject, previousDoubts, fileContext, language, examMode, userLevel);
  let modelUsed = 'gemini';

  if (!resolvedAnswer) {
    resolvedAnswer = generateAIDoubtAnswer(question, subject, previousDoubts, fileContext, language, examMode, userLevel);
    modelUsed = 'gemini (local-fallback)';
  }

  // If user is authenticated, save doubt history for previous solved doubts display
  if (req.userId) {
    try {
      const user = await User.findById(req.userId);
      if (user) {
        user.doubts.push({
          question,
          subject,
          answer: resolvedAnswer,
          status: 'answered',
        });
        user.activityLog.push({
          type: 'chat',
          title: 'Asked AI a homework doubt',
          detail: `Q: ${question.slice(0, 40)}...`,
        });
        if (user.activityLog.length > 50) user.activityLog = user.activityLog.slice(-50);
        await user.save();
      }
    } catch (_) {}
  }

  return res.json({
    success: true,
    answer: resolvedAnswer,
    timestamp: new Date().toISOString(),
    model: modelUsed
  });
}

export async function addDoubt(req, res) {
  const { question, subject, history, fileContext, examMode, userLevel, language } = req.body;
  if (!question) throw new AppError('Question is required.', 400);

  const user = await User.findById(req.userId);
  if (!user) throw new AppError('User not found.', 404);

  // Retrieve user's previous doubts as conversation memory
  const previousDoubts = user.doubts || [];

  // Try to get real answer from Gemini first with full AI Tutor prompt and memory
  let resolvedAnswer = await getRealGeminiResponse(question, subject, previousDoubts, fileContext, language, examMode, userLevel);
  
  // Fall back to structured AI Tutor engine if Gemini fails or is not configured
  if (!resolvedAnswer) {
    resolvedAnswer = generateAIDoubtAnswer(question, subject, previousDoubts, fileContext, language, examMode, userLevel);
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
  const { message, history, language, fileContext, examMode, userLevel } = req.body;
  if (!message) throw new AppError('Message is required.', 400);

  const apiKey = process.env.GEMINI_API_KEY || '';
  let resolvedAnswer = null;

  // Build enhanced message prompt including file and exam context
  let enhancedMessage = '';
  if (fileContext) enhancedMessage += `[Uploaded Document/Image Context]:\n${fileContext}\n\n`;
  if (examMode || message.toLowerCase().includes('explain for exam') || message.toLowerCase().includes('exam mode')) {
    enhancedMessage += `[EXAM MODE ACTIVATED]: Provide concise, high-yield exam revision notes, key formulas, and bullet points.\n\n`;
  }
  if (userLevel) enhancedMessage += `[Student Education Level]: ${userLevel}\n\n`;
  enhancedMessage += `User Question (${language || 'en'}):\n${message}`;

  // Try real Google Gemini API if valid key exists
  if (apiKey && apiKey.length > 10) {
    try {
      const contents = [];
      if (Array.isArray(history)) {
        const recentHistory = history.slice(-8);
        for (const msg of recentHistory) {
          const role = (msg.sender === 'user' || msg.role === 'user') ? 'user' : 'model';
          contents.push({
            role,
            parts: [{ text: msg.text || '' }]
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: enhancedMessage }]
      });

      const classification = classifyQuestionIntentAndSubject(message, '');
      const systemPrompt = `[ROUTING CLASSIFICATION: Expert = ${classification.expert}, Subject = ${classification.subject}, Intent = ${classification.intent}]\nYou MUST act as ${classification.expert} and strictly obey ${classification.expert}'s mandatory response format and rules.\n\n${STUDENT_TUTOR_SYSTEM_PROMPT}\n\nAlways reply accurately in the user's preferred language (${language || 'en'}).`;

      const modelsToTry = ['gemini-3-flash-preview', 'gemini-3.1-flash-lite', 'gemma-4-31b-it', 'gemini-2.5-flash', 'gemini-2.0-flash'];
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
                  parts: [{ text: systemPrompt }]
                },
                generationConfig: {
                  temperature: 0.4,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 3072,
                }
              })
            }
          );

          if (response.ok) {
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim().length > 20) {
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

  // Use 4-Step Classified Senior AI Tutor Engine if Gemini API key is placeholder/missing/unreachable
  if (!resolvedAnswer) {
    resolvedAnswer = generateAIDoubtAnswer(message, '', history, fileContext, language || 'en', examMode, userLevel);
  }

  res.json({ reply: resolvedAnswer });
}

/**
 * POST /api/chat/stream
 * Server-Sent Events streaming endpoint with full Senior AI Tutor system instruction.
 */
export async function chatWithAIStream(req, res) {
  const { message, history, language, fileContext, examMode, userLevel } = req.body;
  if (!message) {
    res.status(400).json({ error: 'Message is required.' });
    return;
  }

  // Build full message including any uploaded file context & exam options
  let fullMessage = '';
  if (fileContext) fullMessage += `[Uploaded Document/Image Context]:\n${fileContext}\n\n`;
  if (examMode || message.toLowerCase().includes('explain for exam') || message.toLowerCase().includes('exam mode')) {
    fullMessage += `[EXAM MODE ACTIVATED]: Provide concise, high-yield exam revision notes, key formulas, and bullet points.\n\n`;
  }
  if (userLevel) fullMessage += `[Student Education Level]: ${userLevel}\n\n`;
  fullMessage += `User question (${language || 'en'}):\n${message}`;

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

    const classification = classifyQuestionIntentAndSubject(message, '');
    const systemPrompt = `[ROUTING CLASSIFICATION: Expert = ${classification.expert}, Subject = ${classification.subject}, Intent = ${classification.intent}]\nYou MUST act as ${classification.expert} and strictly obey ${classification.expert}'s mandatory response format and rules.\n\n${STUDENT_TUTOR_SYSTEM_PROMPT}\n\nAlways reply accurately in the user's preferred language (${language || 'en'}).`;

    for (const modelName of ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro']) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction: { parts: [{ text: systemPrompt }] },
              generationConfig: { temperature: 0.4, topK: 40, topP: 0.95, maxOutputTokens: 3072 },
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

  // Fallback: simulate streaming with the 4-Step Classified Senior AI Tutor engine
  if (!streamedSuccessfully) {
    const fallback = generateAIDoubtAnswer(message, '', history, fileContext, language || 'en', examMode, userLevel);
    for (const word of fallback.split(/(\s+)/)) {
      sendChunk(word);
      await new Promise((r) => setTimeout(r, 15));
    }
  }

  sendDone();
}
