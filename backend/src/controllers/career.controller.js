import { AppError } from '../utils/AppError.js';
import { config } from '../config.js';
import { User } from '../models/User.js';

// Helper to call Gemini AI Flash model safely
async function callGeminiAI(prompt, jsonMode = true) {
  const apiKey = config.geminiApiKey;
  if (!apiKey) {
    console.warn('Gemini API key is not configured.');
    return null;
  }

  const modelsToTry = ['gemini-flash-latest', 'gemini-3.5-flash', 'gemini-2.5-flash-lite', 'gemini-pro-latest'];
  for (const modelName of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: jsonMode ? { responseMimeType: 'application/json' } : {}
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log(`✅ Gemini AI call succeeded using model: ${modelName}`);
          return jsonMode ? JSON.parse(text) : text;
        }
      } else {
        const errText = await response.text();
        console.warn(`⚠️ Gemini API (${modelName}) returned status ${response.status}:`, errText);
      }
    } catch (err) {
      console.warn(`⚠️ Gemini API (${modelName}) error:`, err.message);
    }
  }
  console.error('❌ All Gemini AI models failed or timed out.');
  return null;
}

// ── 1. AI Career Coach Chat ──────────────────────────────────────────────────

export async function chatCareerCoach(req, res) {
  const { message, userProfile = {} } = req.body;
  if (!message) throw new AppError('Message is required', 400);

  const prompt = `You are Sarthi Career Coach, a Senior Product Designer, AI Engineer, and Career Mentor.
The user asks: "${message}"
User context: Target career: ${userProfile.targetCareer || 'Software Engineer'}, Skills: ${(userProfile.skills || ['Python', 'Problem Solving']).join(', ')}.

Provide an intelligent, encouraging, and highly structured markdown response addressing their question (career advice, skill roadmap, resume tips, interview prep, certification suggestion, or job search advice). Include clear bullet points and actionable next steps.`;

  const aiReply = await callGeminiAI(prompt, false);

  if (aiReply) {
    return res.json({ response: aiReply });
  }

  // Smart structured fallback response
  const lowerMsg = message.toLowerCase();
  let responseText = `### Sarthi Career Coach Advice\n\nHere are the top personalized recommendations for your career journey:\n\n`;

  if (lowerMsg.includes('resume') || lowerMsg.includes('cv')) {
    responseText += `1. **Tailor for ATS**: Ensure your resume includes keywords like *Python, React, API Design, and Cloud Deployment*.\n2. **Quantify Impact**: Use numbers (e.g., "Improved load speed by 35%").\n3. **Clean Structure**: Keep a single-column layout with clear headings for Experience, Projects, and Education.`;
  } else if (lowerMsg.includes('interview')) {
    responseText += `1. **STAR Method**: Structure behavioral answers using *Situation, Task, Action, Result*.\n2. **Practice Live Coding**: Focus on Arrays, HashMaps, and System Design patterns.\n3. **Mock Interviews**: Run AI Mock Interviews daily to boost confidence.`;
  } else if (lowerMsg.includes('certification') || lowerMsg.includes('cert')) {
    responseText += `1. **AWS Certified Solutions Architect**: High demand across cloud computing.\n2. **Google Professional Data Engineer**: Top credential for AI/Data careers.\n3. **NPTEL / SWAYAM**: Government-recognized free certificates from IITs.`;
  } else {
    responseText += `1. **Build 3 Core Projects**: A full-stack web application, an AI-integrated dashboard, and an open-source contribution.\n2. **Upskill in AI & Cloud**: Mastering GenAI APIs and Docker/AWS will put you in the top 5% of candidates.\n3. **Daily Consistent Practice**: Complete 1 practice interview or roadmap step each day.`;
  }

  res.json({ response: responseText });
}

// ── 2. AI Mock Interview Preparation ─────────────────────────────────────────

export async function generateInterviewQuestions(req, res) {
  const { role = 'Full Stack Developer', experience = 'Fresher', category = 'All' } = req.body;

  const prompt = `Generate 5 realistic interview questions for a ${experience} ${role}. Include Technical, HR, Behavioral, and Coding questions.
Return strictly a JSON array of objects:
[
  {
    "id": 1,
    "category": "Technical" | "HR" | "Behavioral" | "Coding",
    "question": "Question text",
    "difficulty": "Easy" | "Medium" | "Hard",
    "keyPoints": ["Expected concept 1", "Expected concept 2"]
  }
]`;

  const aiQuestions = await callGeminiAI(prompt, true);
  if (Array.isArray(aiQuestions) && aiQuestions.length > 0) {
    return res.json({ questions: aiQuestions });
  }

  // High quality fallback questions
  const fallbackQuestions = [
    {
      id: 1,
      category: 'Technical',
      question: `Explain how REST APIs work and how you handle authentication using JWT in a full-stack application.`,
      difficulty: 'Medium',
      keyPoints: ['Stateless HTTP endpoints', 'Token expiration and refreshing', 'Authorization headers']
    },
    {
      id: 2,
      category: 'Coding',
      question: `Given an array of integers and a target sum, find two numbers that add up to the target in O(N) time complexity.`,
      difficulty: 'Medium',
      keyPoints: ['Use HashMap to store complements', 'Single pass O(N) time and space complexity']
    },
    {
      id: 3,
      category: 'Behavioral',
      question: `Describe a situation where you faced a major technical obstacle or tight deadline on a project. How did you resolve it?`,
      difficulty: 'Medium',
      keyPoints: ['STAR structure', 'Root cause analysis', 'Communication with stakeholders']
    },
    {
      id: 4,
      category: 'Technical',
      question: `What are the differences between SQL (PostgreSQL/MySQL) and NoSQL (MongoDB) databases, and when would you choose each?`,
      difficulty: 'Medium',
      keyPoints: ['Relational vs Document schema', 'ACID transactions vs Horizontal scalability']
    },
    {
      id: 5,
      category: 'HR',
      question: `Where do you see your career heading over the next 3 years as a ${role}?`,
      difficulty: 'Easy',
      keyPoints: ['Continuous learning of modern tech', 'Leadership and mentorship growth']
    }
  ];

  res.json({ questions: fallbackQuestions });
}

export async function analyzeInterviewAnswer(req, res) {
  const { question, answer, role = 'Software Engineer' } = req.body;

  const prompt = `Evaluate the candidate's interview answer for a ${role} role.
Question: "${question}"
Candidate Answer: "${answer}"

Return strictly a JSON object:
{
  "confidenceScore": number (0-100),
  "performanceAnalysis": "2-sentence critique highlighting clarity and technical depth",
  "strengths": ["Strength 1", "Strength 2"],
  "improvementTips": ["Tip 1", "Tip 2"],
  "idealAnswerSnippet": "Brief example of how to make this answer 10/10"
}`;

  const aiEval = await callGeminiAI(prompt, true);
  if (aiEval && typeof aiEval.confidenceScore === 'number') {
    return res.json(aiEval);
  }

  // Dynamic fallback evaluation based on answer content
  const wordCount = (answer || '').split(/\s+/).filter(Boolean).length;
  const score = Math.min(95, Math.max(50, wordCount > 30 ? 85 : (wordCount > 10 ? 72 : 55)));
  const shortAnswer = wordCount < 20;

  res.json({
    confidenceScore: score,
    performanceAnalysis: shortAnswer 
      ? `Your answer "${(answer || '').substring(0, 50)}..." is a bit too brief. Elaborating on key concepts and providing real-world examples would make it stronger.`
      : `Your response demonstrates good familiarity with key concepts related to the question. You provided a solid explanation, though adding specific real-world metrics or architecture trade-offs would make it even stronger.`,
    strengths: shortAnswer ? ['Direct and to the point'] : ['Clear communication flow', 'Good detail and relevance to the prompt'],
    improvementTips: shortAnswer ? ['Provide more details', 'Use the STAR method for behavioral parts'] : ['Quantify your impact with percentages or time saved', 'Explicitly mention edge-case handling'],
    idealAnswerSnippet: `Begin with a direct 1-sentence summary, explain your reasoning, and finish with measurable project results.`
  });
}

// ── 3. ATS Professional Resume Builder & Reviewer ────────────────────────────

export async function reviewATSResume(req, res) {
  const { resumeText = '', targetRole = 'Full Stack Software Engineer' } = req.body;

  const prompt = `Review the following candidate resume text for a ${targetRole} position against strict ATS (Applicant Tracking System) standards.
Resume Text: "${resumeText.slice(0, 3000)}"

Return strictly a JSON object:
{
  "resumeScore": number (0-100),
  "atsScore": number (0-100),
  "grammarFeedback": "Grammar and readability review",
  "keywordSuggestions": ["React", "TypeScript", "System Design", "Docker", "CI/CD"],
  "missingSkills": ["Kubernetes", "GraphQL", "Automated Testing"],
  "improvedSummary": "A highly punchy 3-line professional ATS summary tailored for this role"
}`;

  const aiReview = await callGeminiAI(prompt, true);
  if (aiReview && typeof aiReview.resumeScore === 'number') {
    return res.json(aiReview);
  }

  // Dynamic Fallback ATS analysis based on resume input
  const wordCount = (resumeText || '').split(/\s+/).filter(Boolean).length;
  const score = Math.min(95, Math.max(50, wordCount > 200 ? 88 : 65));
  const hasReact = (resumeText || '').toLowerCase().includes('react');
  const hasNode = (resumeText || '').toLowerCase().includes('node');
  
  res.json({
    resumeScore: score - 5,
    atsScore: score,
    grammarFeedback: wordCount > 50 ? 'Good overall formatting and grammar detected in your content.' : 'Your resume is very short. Consider adding more details and bullet points.',
    keywordSuggestions: hasReact ? ['Advanced React Patterns', 'GraphQL', 'Next.js'] : ['React', 'Full Stack Development', 'Cloud Computing', 'Git Workflow', 'Agile/Scrum', 'CI/CD Pipelines'],
    missingSkills: hasNode ? ['Kubernetes Deployment', 'Performance Optimization'] : ['Node.js', 'API Design', 'End-to-End Testing (Cypress/Playwright)'],
    improvedSummary: `Results-driven ${targetRole} with proven expertise in building modern solutions. ${wordCount < 100 ? 'Needs more detailed project experience.' : 'Strong background in relevant technologies and user-centric solutions.'}`
  });
}

// ── 4. Personalized Learning Roadmap Generator ───────────────────────────────

export async function generateRoadmap(req, res) {
  const { targetRole = 'Python & AI Engineer', currentLevel = 'Intermediate' } = req.body;

  const prompt = `Create a detailed 3-month career learning roadmap for a candidate aiming to become a top ${targetRole} starting from ${currentLevel} level.
Return strictly a JSON object:
{
  "role": "${targetRole}",
  "months": [
    {
      "month": "Month 1: Core Fundamentals & Architecture",
      "weeks": [
        { "title": "Week 1-2: Advanced Language & Design Patterns", "description": "Master async programming, memory models, and clean code principles." },
        { "title": "Week 3-4: APIs & Database Modeling", "description": "Build production REST & GraphQL services with PostgreSQL and MongoDB." }
      ]
    },
    {
      "month": "Month 2: Cloud, AI & System Integration",
      "weeks": [
        { "title": "Week 5-6: Google Gemini AI & LLM Integration", "description": "Implement prompt engineering, function calling, and RAG pipelines." },
        { "title": "Week 7-8: Docker, CI/CD & Cloud Deployment", "description": "Containerize microservices and deploy scalable instances." }
      ]
    },
    {
      "month": "Month 3: Capstone Portfolio & Interview Readiness",
      "weeks": [
        { "title": "Week 9-10: Production-Ready Capstone Project", "description": "Develop and launch a comprehensive full-stack AI platform." },
        { "title": "Week 11-12: Mock Interviews & ATS Resume Optimization", "description": "Practice system design, algorithms, and behavioral interviews." }
      ]
    }
  ],
  "recommendedProjects": [
    { "name": "AI-Powered Career Guidance & Resume Analyzer", "tech": "React, Node.js, Google Gemini, MongoDB" },
    { "name": "Real-time Multilingual Citizen Support Bot", "tech": "Python, FastAPI, LLM, Docker" }
  ],
  "certificationsToTarget": ["Google Professional Cloud Developer", "AWS Certified Solutions Architect"],
  "expectedSalary": "₹8 LPA - ₹24 LPA",
  "hiringCompanies": ["Google", "Microsoft", "Amazon", "Infosys", "TCS", "Flipkart", "Zomato"]
}`;

  const aiRoadmap = await callGeminiAI(prompt, true);
  if (aiRoadmap && aiRoadmap.months) {
    return res.json(aiRoadmap);
  }

  // Dynamic roadmap logic based on role
  let domain = 'Software Engineering';
  let projects = [];
  let certifications = [];
  let salary = '₹6 LPA - ₹18 LPA';
  let companies = ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Tech Startups'];
  
  const lowerRole = targetRole.toLowerCase();
  
  if (lowerRole.includes('data') || lowerRole.includes('machine') || lowerRole.includes('ai')) {
    domain = 'Data & AI';
    projects = [
      { name: 'Predictive Analytics Dashboard', tech: 'Python, Pandas, Scikit-Learn' },
      { name: 'NLP Chatbot for Customer Support', tech: 'TensorFlow, React, FastAPI' }
    ];
    certifications = ['Google Data Analytics Certificate', 'AWS Machine Learning Specialty', 'IBM Data Science'];
    salary = '₹8 LPA - ₹24 LPA';
    companies = ['Google India', 'Microsoft India', 'Amazon', 'Mu Sigma', 'Fractal Analytics'];
  } else if (lowerRole.includes('cyber') || lowerRole.includes('security')) {
    domain = 'Cyber Security';
    projects = [
      { name: 'Vulnerability Scanner Tool', tech: 'Python, Nmap, Bash' },
      { name: 'Secure Authentication System', tech: 'Node.js, JWT, OWASP Guidelines' }
    ];
    certifications = ['CompTIA Security+', 'Certified Ethical Hacker (CEH)', 'CISSP'];
    salary = '₹7 LPA - ₹20 LPA';
    companies = ['PwC', 'Deloitte', 'CrowdStrike', 'Cisco', 'IBM Security'];
  } else if (lowerRole.includes('full stack') || lowerRole.includes('web')) {
    domain = 'Full Stack Development';
    projects = [
      { name: 'E-commerce Platform', tech: 'React, Node.js, MongoDB, Stripe' },
      { name: 'Real-time Chat Application', tech: 'Next.js, Socket.io, PostgreSQL' }
    ];
    certifications = ['Meta Front-End Developer', 'AWS Certified Developer', 'Full Stack Open'];
    salary = '₹6 LPA - ₹22 LPA';
    companies = ['Flipkart', 'Zomato', 'Swiggy', 'Amazon', 'Tech Startups'];
  } else {
    // Default / Python & AI Engineer
    projects = [
      { name: 'Intelligent Career Coach Platform', tech: 'React, Node.js, Gemini AI, MongoDB' },
      { name: 'Government Schemes Smart Portal', tech: 'Full Stack Web, Cloud Cache, Microservices' }
    ];
    certifications = ['Google Cloud Certified Professional', 'AWS Solutions Architect', 'NPTEL CS Certificate'];
    salary = '₹6 LPA - ₹22 LPA';
    companies = ['Google India', 'Microsoft India', 'Infosys', 'Wipro', 'Tech Startups'];
  }

  // Adjust timing based on level
  const speed = currentLevel.toLowerCase() === 'beginner' ? 'Foundational' : (currentLevel.toLowerCase() === 'advanced' ? 'Accelerated' : 'Standard');

  res.json({
    role: targetRole,
    months: [
      {
        month: `Month 1: ${speed} Core Mechanics for ${domain}`,
        weeks: [
          { title: `Week 1-2: Core ${domain} Principles`, description: `Deep dive into essential concepts, advanced syntax, and robust error handling for ${targetRole}.` },
          { title: 'Week 3-4: Modern Architecture & Database Engineering', description: 'Design high-performance systems and optimize data storage.' }
        ]
      },
      {
        month: `Month 2: ${domain} Capabilities & Cloud Architecture`,
        weeks: [
          { title: `Week 5-6: Building ${domain} Applications`, description: `Integrate industry-standard APIs, advanced search, and automated reasoning pipelines.` },
          { title: 'Week 7-8: DevOps, Docker & Cloud Deployment', description: 'Configure automated CI/CD builds and monitor production uptime.' }
        ]
      },
      {
        month: 'Month 3: Capstone Portfolio & Interview Mastery',
        weeks: [
          { title: 'Week 9-10: Enterprise Capstone Implementation', description: 'Deploy a full-fledged production project with real-time feedback and security headers.' },
          { title: 'Week 11-12: Technical & HR Interview Preparation', description: 'Refine ATS resume keywords, practice STAR responses, and ace live coding assessments.' }
        ]
      }
    ],
    recommendedProjects: projects,
    certificationsToTarget: certifications,
    expectedSalary: salary,
    hiringCompanies: companies
  });
}

// ── 5. Portfolio & Profile AI Reviewer ───────────────────────────────────────

export async function reviewPortfolio(req, res) {
  const { githubUrl, portfolioUrl, linkedinUrl, projects = [] } = req.body;

  let score = 50;
  let strengths = [];
  let suggestions = [];

  // Initial checks
  if (githubUrl && githubUrl.includes('github.com')) score += 15;
  if (linkedinUrl && linkedinUrl.includes('linkedin.com')) score += 15;
  if (portfolioUrl && portfolioUrl.includes('http')) score += 20;

  // Use AI if we have some data
  if (githubUrl || linkedinUrl || portfolioUrl) {
    const prompt = `As a strict Senior Technical Recruiter, review this candidate's digital footprint.
GitHub: ${githubUrl || 'None provided'}
LinkedIn: ${linkedinUrl || 'None provided'}
Portfolio: ${portfolioUrl || 'None provided'}

Return strictly a JSON object:
{
  "portfolioScore": number (${score} as base, adjust dynamically up to 100 based on presence of URLs),
  "summary": "1-sentence brutally honest summary of their digital footprint",
  "suggestions": [{"area": "string", "tip": "string"}],
  "strengths": ["string", "string"]
}`;

    const aiReview = await callGeminiAI(prompt, true);
    if (aiReview && typeof aiReview.portfolioScore === 'number') {
      return res.json(aiReview);
    }
  }

  // Fallback if AI fails or no URLs provided
  if (!githubUrl) suggestions.push({ area: 'GitHub Profile', tip: 'CRITICAL: You are missing a GitHub URL. Recruiters want to see your code. Add your GitHub profile immediately.' });
  else { strengths.push('Active GitHub presence identified.'); suggestions.push({ area: 'GitHub Profile', tip: 'Add detailed README.md files with architecture diagrams and live demo links.' }); }

  if (!linkedinUrl) suggestions.push({ area: 'LinkedIn Optimization', tip: 'CRITICAL: No LinkedIn URL provided. A strong LinkedIn profile is essential for modern networking.' });
  else { strengths.push('Professional LinkedIn network established.'); suggestions.push({ area: 'LinkedIn Optimization', tip: 'Include quantifiable achievements in your headline.' }); }

  if (!portfolioUrl) suggestions.push({ area: 'Live Portfolio Website', tip: 'Consider building a personal portfolio website to stand out from other candidates.' });
  else { strengths.push('Live portfolio website showcases your work practically.'); suggestions.push({ area: 'Live Portfolio Website', tip: 'Ensure your top 3 projects have interactive walkthroughs.' }); }

  if (score < 60) strengths.push('Starting to build digital footprint.');
  else if (score > 85) { strengths.push('Modern tech stack utilization'); strengths.push('Clean UI/UX design presentation'); }

  res.json({
    portfolioScore: score,
    summary: score > 80 ? 'Strong digital presence with well-documented profiles.' : (score > 60 ? 'Good foundation, but your digital profiles need more optimization.' : 'Your digital footprint is currently weak. Follow the suggestions to improve your visibility.'),
    suggestions,
    strengths
  });
}

// ── 6. Smart Course Recommendations Catalog ──────────────────────────────────

export async function getCourses(req, res) {
  const courses = [
    {
      id: 1,
      title: 'Google AI Essentials & Prompt Engineering',
      provider: 'Google',
      platform: 'Coursera',
      duration: '4 weeks',
      effort: '5-7 hours / week',
      level: 'Beginner',
      price: 'Free (Certificate available)',
      rating: 4.9,
      type: 'Online',
      hasCertificate: true,
      category: 'AI & Data',
      language: 'English & Hindi',
      enrollUrl: 'https://www.coursera.org/learn/google-ai-essentials',
      accreditation: 'Google Career Certificates & Coursera Verified',
      prerequisites: 'No prior programming experience required. Basic digital literacy.',
      recommendationReason: 'Essential foundation for modern software and product roles demanding AI productivity skills.',
      syllabus: [
        'Module 1: Introduction to Generative AI & Large Language Models',
        'Module 2: Prompt Engineering Principles & Multi-Turn Reasoning',
        'Module 3: Using AI for Automated Code Generation & Debugging',
        'Module 4: Responsible AI Ethics, Privacy & DPDP Compliance'
      ]
    },
    {
      id: 2,
      title: 'NPTEL Programming in Python & Data Analytics',
      provider: 'IIT Madras',
      platform: 'NPTEL / SWAYAM',
      duration: '8 weeks',
      effort: '6-8 hours / week',
      level: 'Intermediate',
      price: '100% Free Government Course',
      rating: 4.9,
      type: 'Government',
      hasCertificate: true,
      category: 'Data & AI',
      language: 'English & Hindi Subtitles',
      enrollUrl: 'https://onlinecourses.nptel.ac.in/noc25_cs28/preview',
      accreditation: 'Ministry of Education & IIT Madras Academic Council',
      prerequisites: 'Basic logic and high school mathematics.',
      recommendationReason: 'Government-recognized prestigious certificate accepted widely by top public and corporate recruiters.',
      syllabus: [
        'Module 1: Python Core Syntax, Control Structures & Functions',
        'Module 2: Data Structures, Lists, Dictionaries & Object-Oriented Python',
        'Module 3: Data Analysis with Pandas, NumPy & Matplotlib Visualization',
        'Module 4: Capstone Data Analytics Assignment & Proctored Certification Exam'
      ]
    },
    {
      id: 3,
      title: 'Web Development Training — HTML, CSS, JS & React',
      provider: 'Internshala Trainings',
      platform: 'Internshala',
      duration: '8 weeks',
      effort: '5-8 hours / week',
      level: 'Beginner',
      price: 'Free Preview / ₹3,499 Certificate',
      rating: 4.7,
      type: 'Online',
      hasCertificate: true,
      category: 'Software Engineering',
      language: 'English & Hindi',
      enrollUrl: 'https://internshala.com/trainings/web-development-training',
      accreditation: 'Internshala Verified Certificate',
      prerequisites: 'Basic computer knowledge.',
      recommendationReason: 'Most in-demand skill for freshers; Internshala certificate widely accepted by Indian startups and MNCs.',
      syllabus: [
        'Module 1: HTML5 Semantic Structure & CSS3 Animations',
        'Module 2: JavaScript ES6+, DOM Manipulation & APIs',
        'Module 3: React.js Components, Hooks & State Management',
        'Module 4: Final Project — Full Portfolio Website'
      ]
    },
    {
      id: 4,
      title: 'Physics Wallah — Java Full Stack Development (Sigma)',
      provider: 'Physics Wallah (PW Skills)',
      platform: 'Physics Wallah',
      duration: '6 months',
      effort: '4-6 hours / day',
      level: 'Beginner',
      price: '100% Free on YouTube / PW App',
      rating: 4.8,
      type: 'Online',
      hasCertificate: true,
      category: 'Software Engineering',
      language: 'Hindi',
      enrollUrl: 'https://www.pw.live/courses/sigma-2-0',
      accreditation: 'PW Skills Industry Verified',
      prerequisites: 'Class 12 pass / Any graduation stream.',
      recommendationReason: 'Completely free on YouTube & PW App; India\'s most affordable full-stack course by top educators in Hindi.',
      syllabus: [
        'Module 1: Core Java — OOP, Exception Handling & Collections',
        'Module 2: Database Design — MySQL, JDBC & Hibernate ORM',
        'Module 3: Spring Boot REST APIs & Microservices Architecture',
        'Module 4: React Frontend, Git & Full Stack Project Deployment'
      ]
    },
    {
      id: 5,
      title: 'Physics Wallah — Data Science & Machine Learning Mastery',
      provider: 'Physics Wallah (PW Skills)',
      platform: 'Physics Wallah',
      duration: '5 months',
      effort: '3-5 hours / day',
      level: 'Beginner',
      price: '100% Free on YouTube / PW App',
      rating: 4.8,
      type: 'Online',
      hasCertificate: true,
      category: 'AI & Data',
      language: 'Hindi',
      enrollUrl: 'https://www.pw.live/courses/data-science',
      accreditation: 'PW Skills Industry Verified',
      prerequisites: 'Class 12 Mathematics.',
      recommendationReason: 'Best free Data Science course in Hindi — covers Python, ML, Deep Learning and real projects.',
      syllabus: [
        'Module 1: Python for Data Science — NumPy, Pandas, Matplotlib',
        'Module 2: Machine Learning — Supervised, Unsupervised & Evaluation Metrics',
        'Module 3: Deep Learning — Neural Networks, CNN & NLP Basics',
        'Module 4: Capstone Project, Resume Building & Job Placement Support'
      ]
    },
    {
      id: 6,
      title: 'Digital India AI for Bharat Skill Certification',
      provider: 'MeitY & NASSCOM',
      platform: 'FutureSkills Prime',
      duration: '6 weeks',
      effort: '4-5 hours / week',
      level: 'Beginner',
      price: '100% Free Government Scheme',
      rating: 4.8,
      type: 'Government',
      hasCertificate: true,
      category: 'AI & Emerging Tech',
      language: 'English & Hindi',
      enrollUrl: 'https://futureskillsprime.in/',
      accreditation: 'Government of India MeitY & NASSCOM FutureSkills',
      prerequisites: 'Open to all Indian citizens and students.',
      recommendationReason: 'Directly funded under National Digital India initiative; boosts eligibility for government IT internships.',
      syllabus: [
        'Module 1: Foundations of Artificial Intelligence & Machine Learning',
        'Module 2: Natural Language Processing & Indic Language Models (Bhashini)',
        'Module 3: Cloud AI Tools & Indian Digital Public Infrastructure',
        'Module 4: Final Industry Assessment & Government Certificate Issuance'
      ]
    },
    {
      id: 7,
      title: 'Internshala — Python for Data Science Training',
      provider: 'Internshala Trainings',
      platform: 'Internshala',
      duration: '6 weeks',
      effort: '5 hours / week',
      level: 'Beginner',
      price: 'Free Preview / ₹2,799 Certificate',
      rating: 4.6,
      type: 'Online',
      hasCertificate: true,
      category: 'AI & Data',
      language: 'English',
      enrollUrl: 'https://internshala.com/trainings/data-science-training',
      accreditation: 'Internshala Verified',
      prerequisites: 'Basic mathematics.',
      recommendationReason: 'Top pick for freshers wanting data analytics jobs across Indian corporate and startup sectors.',
      syllabus: [
        'Module 1: Python Basics & Jupyter Notebook Setup',
        'Module 2: NumPy, Pandas & Data Cleaning Techniques',
        'Module 3: Data Visualization with Matplotlib & Seaborn',
        'Module 4: Capstone Project — Real World Data Analysis'
      ]
    },
    {
      id: 8,
      title: 'Full Stack Software Architecture & DevOps',
      provider: 'Microsoft',
      platform: 'edX',
      duration: '12 weeks',
      effort: '8-10 hours / week',
      level: 'Advanced',
      price: 'Free (Financial Aid available)',
      rating: 4.8,
      type: 'Online',
      hasCertificate: true,
      category: 'Software Engineering',
      language: 'English',
      enrollUrl: 'https://www.edx.org/learn/full-stack-development',
      accreditation: 'Microsoft Professional Program & edX Verified',
      prerequisites: 'Familiarity with JavaScript/TypeScript and web development.',
      recommendationReason: 'Matches top employer expectations for end-to-end cloud and web architecture mastery.',
      syllabus: [
        'Module 1: Scalable Microservices & REST/GraphQL API Design',
        'Module 2: Modern Frontend Engineering with React & Next.js',
        'Module 3: Containerization with Docker & Kubernetes Orchestration',
        'Module 4: CI/CD Pipelines, Azure Cloud & Automated Security Testing'
      ]
    },
    {
      id: 9,
      title: 'AWS Certified Solutions Architect — Free Digital Training',
      provider: 'Amazon Web Services',
      platform: 'AWS Skill Builder',
      duration: '6 weeks',
      effort: '6 hours / week',
      level: 'Intermediate',
      price: 'Free Digital Training',
      rating: 4.8,
      type: 'Online',
      hasCertificate: true,
      category: 'Cloud & Cyber Security',
      language: 'English',
      enrollUrl: 'https://skillbuilder.aws/learn',
      accreditation: 'AWS Official Training & Certification Directorate',
      prerequisites: 'Basic networking and operating system fundamentals.',
      recommendationReason: 'Cloud architecture skills offer a +25% salary premium in current Indian tech recruitment.',
      syllabus: [
        'Module 1: AWS Core Compute (EC2, Lambda) & Storage Systems (S3, EBS)',
        'Module 2: Virtual Private Clouds (VPC), IAM Security & Load Balancing',
        'Module 3: Serverless Databases (DynamoDB, RDS) & High Availability Design',
        'Module 4: Practice Exam Walkthrough & Well-Architected Framework'
      ]
    },
    {
      id: 10,
      title: 'Infosys Springboard — Digital Industry Skills',
      provider: 'Infosys Springboard',
      platform: 'Infosys Springboard',
      duration: '5 weeks',
      effort: '4 hours / week',
      level: 'Beginner',
      price: '100% Free',
      rating: 4.8,
      type: 'Corporate CSR',
      hasCertificate: true,
      category: 'Software Engineering',
      language: 'English & Hindi',
      enrollUrl: 'https://infyspringboard.onwingspan.com/',
      accreditation: 'Infosys Corporate Foundation & Skill India',
      prerequisites: 'None. Suitable for college students and job aspirants.',
      recommendationReason: 'Direct alignment with corporate campus recruitment criteria and technical interview prep.',
      syllabus: [
        'Module 1: Corporate Software Engineering Methodologies (Agile & Scrum)',
        'Module 2: Object-Oriented Problem Solving & Data Structures',
        'Module 3: Professional Communication & Resume Building for IT Drives',
        'Module 4: Capstone Assessment & Infosys Industry Ready Certificate'
      ]
    },
    {
      id: 11,
      title: 'IIT Bombay Spoken Tutorial — Python & C++',
      provider: 'IIT Bombay & Ministry of Education',
      platform: 'Spoken Tutorial',
      duration: '6 weeks',
      effort: '4 hours / week',
      level: 'Beginner',
      price: '100% Free Government Portal',
      rating: 4.9,
      type: 'Government',
      hasCertificate: true,
      category: 'Software Engineering',
      language: 'English, Hindi, Marathi, Bengali, Tamil, Telugu',
      enrollUrl: 'https://spoken-tutorial.org/tutorial-search/?search_foss=Python&search_language=English',
      accreditation: 'Ministry of Education (NMEICT) & IIT Bombay',
      prerequisites: 'School or college enrollment.',
      recommendationReason: 'Multilingual audio-video tutorials developed by IIT Bombay; highly recognized across Indian universities.',
      syllabus: [
        'Module 1: Python Scripting Basics & Control Structures',
        'Module 2: Functions, Modules & File Handling in Python',
        'Module 3: C++ OOP, Pointers & Standard Template Library (STL)',
        'Module 4: Online Proctored Test & Official IIT Bombay Certificate'
      ]
    },
    {
      id: 12,
      title: 'CS50 — Introduction to Computer Science',
      provider: 'Harvard University',
      platform: 'edX',
      duration: '10 weeks',
      effort: '8-10 hours / week',
      level: 'Intermediate',
      price: 'Free Open Courseware',
      rating: 4.9,
      type: 'Academic',
      hasCertificate: true,
      category: 'Software Engineering',
      language: 'English',
      enrollUrl: 'https://cs50.harvard.edu/x/',
      accreditation: 'HarvardX & edX Academic Board',
      prerequisites: 'High school mathematics and analytical thinking.',
      recommendationReason: 'Gold standard global introduction to computer science algorithms, C, Python, and web fundamentals.',
      syllabus: [
        'Module 1: C Programming, Memory Allocation & Core Algorithms',
        'Module 2: Data Structures (Hash Tables, Tries, Linked Lists)',
        'Module 3: Python, SQL & Database Backend Foundations',
        'Module 4: Web Applications with Flask/JavaScript & Final Project'
      ]
    },
    {
      id: 13,
      title: 'Google UX Design Professional Certificate',
      provider: 'Google',
      platform: 'Coursera',
      duration: '8 weeks',
      effort: '6 hours / week',
      level: 'Intermediate',
      price: 'Free (Financial Aid available)',
      rating: 4.8,
      type: 'Online',
      hasCertificate: true,
      category: 'Design & Product',
      language: 'English',
      enrollUrl: 'https://www.coursera.org/professional-certificates/google-ux-design',
      accreditation: 'Google Career Certificates',
      prerequisites: 'Passion for design and user empathy.',
      recommendationReason: 'High demand for developers who bridge premium visual aesthetics with clean code implementation.',
      syllabus: [
        'Module 1: User Research, Empathy Maps & User Journey Mapping',
        'Module 2: Wireframing & Interactive Prototyping in Figma',
        'Module 3: Responsive Web & Mobile Interface Design Systems',
        'Module 4: Usability Testing & Building a Professional UI/UX Portfolio'
      ]
    },
    {
      id: 14,
      title: 'National Career Service (NCS) Employability & Soft Skills',
      provider: 'Ministry of Labour & Employment',
      platform: 'NCS Portal',
      duration: '3 weeks',
      effort: '3 hours / week',
      level: 'Beginner',
      price: '100% Free Government Program',
      rating: 4.7,
      type: 'Government',
      hasCertificate: true,
      category: 'Career & Communication',
      language: 'English & Hindi',
      enrollUrl: 'https://www.ncs.gov.in/',
      accreditation: 'Government of India Directorate General of Employment',
      prerequisites: 'Registered Citizen ID or Job Aspirant profile.',
      recommendationReason: 'Essential preparation for government job interviews, public sector exams, and corporate group discussions.',
      syllabus: [
        'Module 1: Workplace Communication, Active Listening & Professional Etiquette',
        'Module 2: Resume Drafting & Cover Letter Tailoring for Government & Private Roles',
        'Module 3: Group Discussion Mastery & Mock HR Interview Practice',
        'Module 4: Ethics, Financial Literacy & National Employability Certification'
      ]
    },
    {
      id: 15,
      title: 'Internshala — Android App Development Training',
      provider: 'Internshala Trainings',
      platform: 'Internshala',
      duration: '8 weeks',
      effort: '6 hours / week',
      level: 'Intermediate',
      price: 'Free Preview / ₹3,999 Certificate',
      rating: 4.6,
      type: 'Online',
      hasCertificate: true,
      category: 'Software Engineering',
      language: 'English',
      enrollUrl: 'https://internshala.com/trainings/android-app-development-training',
      accreditation: 'Internshala Verified',
      prerequisites: 'Basic Java or Kotlin knowledge.',
      recommendationReason: 'Android development remains one of the highest-paying skills for Indian freelancers and startups.',
      syllabus: [
        'Module 1: Android Studio Setup, Kotlin Basics & UI Layouts',
        'Module 2: Activities, Intents, Fragments & Navigation',
        'Module 3: Firebase Integration — Auth, Firestore & Storage',
        'Module 4: Publish App to Google Play Store'
      ]
    },
    {
      id: 16,
      title: 'SWAYAM — Introduction to Machine Learning by IIT Kharagpur',
      provider: 'IIT Kharagpur',
      platform: 'NPTEL / SWAYAM',
      duration: '12 weeks',
      effort: '8 hours / week',
      level: 'Advanced',
      price: '100% Free (Exam fee ₹1,000)',
      rating: 4.9,
      type: 'Government',
      hasCertificate: true,
      category: 'AI & Data',
      language: 'English',
      enrollUrl: 'https://onlinecourses.nptel.ac.in/noc25_cs42/preview',
      accreditation: 'IIT Kharagpur & NPTEL — Govt. of India',
      prerequisites: 'Linear Algebra, Probability, Python basics.',
      recommendationReason: 'IIT-level ML training at zero cost; highly respected by tech recruiters and MNCs across India.',
      syllabus: [
        'Module 1: Supervised Learning — Regression, Classification & SVM',
        'Module 2: Unsupervised Learning — Clustering & Dimensionality Reduction',
        'Module 3: Neural Networks, Deep Learning & Backpropagation',
        'Module 4: Model Evaluation, Hyperparameter Tuning & Real Projects'
      ]
    },
    {
      id: 17,
      title: 'Physics Wallah — Apna College — DSA in Java (Free)',
      provider: 'Apna College / PW Skills',
      platform: 'Physics Wallah',
      duration: '4 months',
      effort: '3-4 hours / day',
      level: 'Intermediate',
      price: '100% Free on YouTube',
      rating: 4.9,
      type: 'Online',
      hasCertificate: false,
      category: 'Software Engineering',
      language: 'Hindi',
      enrollUrl: 'https://www.youtube.com/@ApnaCollegeOfficial',
      accreditation: 'Community Verified',
      prerequisites: 'Java basics.',
      recommendationReason: 'Most popular free DSA course in India — must-do before any FAANG or product company interview.',
      syllabus: [
        'Module 1: Arrays, Strings, Time Complexity & Recursion',
        'Module 2: Linked Lists, Stacks, Queues & Binary Trees',
        'Module 3: Graphs, Dynamic Programming & Backtracking',
        'Module 4: System Design Basics & LeetCode Practice Problems'
      ]
    },
    {
      id: 18,
      title: 'Internshala — Machine Learning with Python',
      provider: 'Internshala Trainings',
      platform: 'Internshala',
      duration: '8 weeks',
      effort: '6 hours / week',
      level: 'Intermediate',
      price: 'Free Preview / ₹3,499 Certificate',
      rating: 4.6,
      type: 'Online',
      hasCertificate: true,
      category: 'AI & Data',
      language: 'English',
      enrollUrl: 'https://internshala.com/trainings/machine-learning-training',
      accreditation: 'Internshala Verified',
      prerequisites: 'Python programming basics.',
      recommendationReason: 'Best structured ML learning path for students seeking data science internships in Indian companies.',
      syllabus: [
        'Module 1: Python for ML — NumPy, Pandas & Scikit-Learn',
        'Module 2: Regression, Classification & Decision Trees',
        'Module 3: Clustering, Natural Language Processing & Feature Engineering',
        'Module 4: Real World ML Project + Internshala Certificate'
      ]
    },
    {
      id: 19,
      title: 'Google Digital Garage — Digital Marketing Fundamentals',
      provider: 'Google',
      platform: 'Coursera',
      duration: '40 hours',
      effort: 'Self-paced',
      level: 'Beginner',
      price: '100% Free with Certificate',
      rating: 4.7,
      type: 'Online',
      hasCertificate: true,
      category: 'Software Engineering',
      language: 'English & Hindi',
      enrollUrl: 'https://learndigital.withgoogle.com/digitalgarage/course/digital-marketing',
      accreditation: 'Google & IAB Europe Certified',
      prerequisites: 'No prerequisites. Open to all.',
      recommendationReason: 'Free Google-certified course ideal for students and entrepreneurs wanting digital marketing skills.',
      syllabus: [
        'Module 1: Search Engine Optimization (SEO) & Google Search Ads',
        'Module 2: Social Media Marketing — Instagram, Facebook & LinkedIn',
        'Module 3: Email Marketing, Analytics & Conversion Optimization',
        'Module 4: Final Google Certification Exam & Badge'
      ]
    },
    {
      id: 20,
      title: 'Internshala — Core Python Programming (Free Tutorial)',
      provider: 'Internshala Trainings',
      platform: 'Internshala',
      duration: '6 weeks',
      effort: '4-5 hours / week',
      level: 'Beginner',
      price: '100% Free',
      rating: 4.5,
      type: 'Online',
      hasCertificate: false,
      category: 'Software Engineering',
      language: 'English & Hindi',
      enrollUrl: 'https://internshala.com/trainings/python-training',
      accreditation: 'Internshala',
      prerequisites: 'No prior coding experience needed.',
      recommendationReason: 'Perfect first step to coding for complete beginners — free, beginner-friendly & job-relevant.',
      syllabus: [
        'Module 1: Python syntax & variables',
        'Module 2: Data structures & Object-oriented programming',
        'Module 3: File handling & modules',
        'Module 4: Final Python scripting project'
      ]
    },
    {
      id: 21,
      title: 'freeCodeCamp — Responsive Web Design Certification',
      provider: 'freeCodeCamp',
      platform: 'freeCodeCamp',
      duration: '300 hours',
      effort: 'Self-paced',
      level: 'Beginner',
      price: '100% Free with Certificate',
      rating: 4.9,
      type: 'Online',
      hasCertificate: true,
      category: 'Software Engineering',
      language: 'English',
      enrollUrl: 'https://www.freecodecamp.org/learn/responsive-web-design/',
      accreditation: 'freeCodeCamp Developer Certification',
      prerequisites: 'No prerequisites. Open to all.',
      recommendationReason: 'Globally recognized free certification to master HTML, CSS, and modern responsive design layouts.',
      syllabus: [
        'Module 1: Basic HTML and HTML5',
        'Module 2: Basic CSS and Applied Visual Design',
        'Module 3: CSS Flexbox and CSS Grid',
        'Module 4: Responsive Web Design Projects and Certification'
      ]
    },
    {
      id: 22,
      title: 'freeCodeCamp — JavaScript Algorithms and Data Structures',
      provider: 'freeCodeCamp',
      platform: 'freeCodeCamp',
      duration: '300 hours',
      effort: 'Self-paced',
      level: 'Intermediate',
      price: '100% Free with Certificate',
      rating: 4.9,
      type: 'Online',
      hasCertificate: true,
      category: 'Software Engineering',
      language: 'English',
      enrollUrl: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
      accreditation: 'freeCodeCamp Developer Certification',
      prerequisites: 'Basic HTML/CSS knowledge recommended.',
      recommendationReason: 'The absolute best free course to master JavaScript syntax, algorithms, and technical interview logic.',
      syllabus: [
        'Module 1: Basic JavaScript and ES6',
        'Module 2: Regular Expressions and Debugging',
        'Module 3: Basic Data Structures and Object Oriented Programming',
        'Module 4: Functional Programming and Algorithm Scripting Projects'
      ]
    }
  ];

  res.json({ courses });
}

// ── 7. Dynamic Jobs & Internships Engine ─────────────────────────────────────

export async function getJobs(req, res) {
  const jobs = [
    {
      id: 101,
      title: 'Internshala — Software Engineering Intern (Web/AI)',
      company: 'Verified Tech Startups on Internshala',
      logo: 'IS',
      role: 'Internship',
      salary: '₹15,000 - ₹35,000 / month Stipend',
      location: 'Remote & Bangalore / Delhi / Pune',
      type: 'Internship',
      sector: 'Startup Jobs',
      skills: ['Python', 'React', 'Node.js', 'MongoDB', 'AI Prompts'],
      deadline: 'Apply Now (Thousands Active)',
      postedAgo: 'Today',
      applyUrl: 'https://internshala.com/internships/software-development-internship/'
    },
    {
      id: 102,
      title: 'Internshala — Data Science & Machine Learning Internships',
      company: 'Verified Analytics Firms on Internshala',
      logo: 'IS',
      role: 'Internship',
      salary: '₹20,000 - ₹45,000 / month Stipend',
      location: 'Remote & All India',
      type: 'Internship',
      sector: 'Private',
      skills: ['Python', 'Pandas', 'Machine Learning', 'SQL', 'PowerBI'],
      deadline: 'Active Openings',
      postedAgo: 'Just now',
      applyUrl: 'https://internshala.com/internships/data-science-internship/'
    },
    {
      id: 103,
      title: 'Python Developer / Backend Django Engineer Intern',
      company: 'Verified Python Startups on Internshala',
      logo: 'PY',
      role: 'Internship / Full-time',
      salary: '₹25,000 - ₹55,000 / month Stipend | ₹8-14 LPA',
      location: 'Remote (All India) / Bangalore / NCR',
      type: 'Private Jobs',
      sector: 'Startup Jobs',
      skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'REST API'],
      deadline: 'Apply Now (Hundreds Active)',
      postedAgo: 'Just now',
      applyUrl: 'https://internshala.com/internships/python-django-internship/'
    },
    {
      id: 104,
      title: 'Software Development Engineer Intern (AI/ML)',
      company: 'Google India',
      logo: 'G',
      role: 'Internship',
      salary: '₹65,000 / month Stipend',
      location: 'Bangalore / Hyderabad',
      type: 'Internship',
      sector: 'Private Jobs',
      skills: ['Python', 'C++', 'Gemini API', 'Data Structures', 'Algorithms'],
      deadline: '15 Days Left',
      postedAgo: '2 days ago',
      applyUrl: 'https://www.google.com/about/careers/applications/jobs/results/?location=India'
    },
    {
      id: 105,
      title: 'Assistant Information Officer (National e-Governance)',
      company: 'Government of India - Digital Bharat Portal',
      logo: 'GOI',
      role: 'Full-time Government Officer',
      salary: '₹8.5 LPA - ₹12 LPA (7th CPC Level 8)',
      location: 'New Delhi / All India Nodes',
      type: 'Government Jobs',
      sector: 'Government',
      skills: ['System Administration', 'Cyber Security', 'E-Governance'],
      deadline: '20 Days Left',
      postedAgo: '3 days ago',
      applyUrl: 'https://www.ncs.gov.in/Pages/Search.aspx'
    },
    {
      id: 106,
      title: 'Full Stack React & Node Engineer',
      company: 'Sarthi Tech Innovations',
      logo: 'S',
      role: 'Full-time Remote',
      salary: '₹10 LPA - ₹18 LPA',
      location: 'Remote (All India)',
      type: 'Remote Jobs',
      sector: 'Startup Jobs',
      skills: ['TypeScript', 'React 19', 'Node.js', 'MongoDB', 'Tailwind/CSS'],
      deadline: '10 Days Left',
      postedAgo: '1 day ago',
      applyUrl: 'https://internshala.com/jobs/full-stack-development-jobs/'
    },
    {
      id: 107,
      title: 'Campus Associate Software Engineer',
      company: 'Infosys / TCS Digital Campus Drive',
      logo: 'I',
      role: 'Campus Placements',
      salary: '₹6.5 LPA - ₹9 LPA',
      location: 'Pune / Hyderabad / Chennai',
      type: 'Campus Placements',
      sector: 'Private Jobs',
      skills: ['Java', 'SQL', 'Aptitude', 'Problem Solving'],
      deadline: '12 Days Left',
      postedAgo: '4 days ago',
      applyUrl: 'https://career.infosys.com/'
    },
    {
      id: 108,
      title: 'Freelance AI & Web Development Projects',
      company: 'Upwork & Internshala Freelance Gig Portal',
      logo: 'F',
      role: 'Contract / Freelance',
      salary: '₹1,500 - ₹3,000 / Hour',
      location: 'Remote Freelance',
      type: 'Freelance',
      sector: 'Private Jobs',
      skills: ['LLM Fine-tuning', 'Python', 'FastAPI', 'Next.js', 'UI/UX'],
      deadline: 'Open All Year',
      postedAgo: 'Just now',
      applyUrl: 'https://www.upwork.com/freelance-jobs/python/'
    }
  ];

  res.json({ jobs });
}

// ── 8. Industry Certifications Catalog ───────────────────────────────────────

export async function getCertifications(req, res) {
  const certifications = [
    {
      id: 1,
      name: 'Google Associate Cloud Engineer',
      provider: 'Google Cloud',
      difficulty: 'Intermediate',
      duration: '3 Months Prep',
      price: '$125 (Scholarship vouchers available)',
      careerValue: 'High (+30% Interview Shortlist Rate)',
      badge: 'Cloud Pro',
      enrollUrl: 'https://cloud.google.com/certification/associate-cloud-engineer'
    },
    {
      id: 2,
      name: 'AWS Certified Developer Associate',
      provider: 'Amazon Web Services',
      difficulty: 'Intermediate',
      duration: '2.5 Months Prep',
      price: '$150',
      careerValue: 'Very High (Widely accepted globally)',
      badge: 'AWS Certified',
      enrollUrl: 'https://aws.amazon.com/certification/certified-developer-associate/'
    },
    {
      id: 3,
      name: 'NPTEL Gold Certificate in Algorithms & AI',
      provider: 'IIT / Government of India (SWAYAM)',
      difficulty: 'Advanced',
      duration: '8-12 Weeks',
      price: 'Free Exam & Course',
      careerValue: 'Excellent for Government & Core Engineering jobs',
      badge: 'Govt Verified',
      enrollUrl: 'https://swayam.gov.in/nc_details/NPTEL'
    },
    {
      id: 4,
      name: 'Microsoft Certified: Azure AI Fundamentals (AI-900)',
      provider: 'Microsoft',
      difficulty: 'Beginner',
      duration: '3 Weeks Prep',
      price: '$99 (Free for students via university email)',
      careerValue: 'Essential foundation badge for AI careers',
      badge: 'Microsoft Certified',
      enrollUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/'
    }
  ];

  res.json({ certifications });
}

// ── 9. Scholarships Catalog ──────────────────────────────────────────────────

export async function getScholarships(req, res) {
  const scholarships = [
    {
      id: 1,
      title: 'PM-USP National Scholarship Scheme for College & University Students',
      provider: 'Ministry of Education, Government of India',
      type: 'Government Scholarships',
      amount: '₹20,000 to ₹50,000 / Year',
      eligibility: 'Meritorious students above 80th percentile in Class XII board exams',
      deadline: 'October 31',
      applyUrl: 'https://scholarships.gov.in/'
    },
    {
      id: 2,
      title: 'Google Generation Scholarship for Women in Computer Science',
      provider: 'Google India',
      type: 'Private Scholarships',
      amount: '$2,500 USD (~₹2,10,000)',
      eligibility: 'Female undergraduate students pursuing Computer Science / Engineering',
      deadline: 'December 15',
      applyUrl: 'https://buildyourfuture.withgoogle.com/scholarships'
    },
    {
      id: 3,
      title: 'Commonwealth Study Abroad STEM Masters Scholarship',
      provider: 'Commonwealth Scholarship Commission',
      type: 'Study Abroad',
      amount: '100% Tuition Fee + Monthly Living Allowance',
      eligibility: 'Indian citizens with First Class undergraduate STEM degree',
      deadline: 'November 10',
      applyUrl: 'https://cscuk.fcdo.gov.uk/scholarships/'
    },
    {
      id: 4,
      title: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0) Free Skill Certification',
      provider: 'MSDE Government of India',
      type: 'Skill Development Programs',
      amount: '100% Free Training + Certification Assessment Fee Covered',
      eligibility: 'Youth aged 18-35 seeking future digital and industrial upskilling',
      deadline: 'Open All Year',
      applyUrl: 'https://www.pmkvyofficial.org/'
    }
  ];

  res.json({ scholarships });
}

// ── 10. Tech & Career Events Catalog ─────────────────────────────────────────

export async function getEvents(req, res) {
  const events = [
    {
      id: 1,
      title: 'Smart India Hackathon (SIH 2026) Grand Finale',
      organizer: 'Government of India (MoE / AICTE)',
      category: 'Hackathons',
      date: 'August 24 - 26, 2026',
      mode: 'Hybrid (All India Nodes)',
      prizePool: '₹1,00,000 per problem statement + Direct Hiring Opportunities',
      registrationLink: 'https://sih.gov.in'
    },
    {
      id: 2,
      title: 'Google I/O Connect India Developer Summit',
      organizer: 'Google Developer Community',
      category: 'Google Events',
      date: 'September 12, 2026',
      mode: 'Bangalore & Online Stream',
      prizePool: 'Free Registration + Hands-on AI & Cloud Workshops',
      registrationLink: 'https://io.google/2026/'
    },
    {
      id: 3,
      title: 'National Career Service Mega Walk-in Placement Drive',
      organizer: 'Ministry of Labour & Employment, India',
      category: 'Career Fairs',
      date: 'Every Saturday',
      mode: 'Offline Model Career Centres across 100+ Districts',
      prizePool: '50+ Employers hiring freshers and experienced professionals',
      registrationLink: 'https://www.ncs.gov.in'
    },
    {
      id: 4,
      title: 'Microsoft Azure AI Bootcamp & Certification Challenge',
      organizer: 'Microsoft Student Ambassadors',
      category: 'Microsoft Events',
      date: 'October 5, 2026',
      mode: 'Virtual Webinar & Coding Competition',
      prizePool: 'Free Certification Vouchers + Swag Kits',
      registrationLink: 'https://learn.microsoft.com/en-us/training/challenges/'
    },
    {
      id: 5,
      title: 'Internshala Annual Student Hackathon & Career Fest',
      organizer: 'Internshala & Startup India',
      category: 'Hackathons',
      date: 'November 15, 2026',
      mode: 'Online (All India)',
      prizePool: '₹5,00,000 Cash Prizes + Top Tech Internships',
      registrationLink: 'https://internshala.com/'
    },
    {
      id: 6,
      title: 'Physics Wallah (PW) — Sigma Coding Fest & Job Fair',
      organizer: 'Physics Wallah Tech Community',
      category: 'Career Fairs',
      date: 'December 1, 2026',
      mode: 'Noida / Online Stream',
      prizePool: 'Direct Interviews + PW Swag & Scholarships',
      registrationLink: 'https://www.pw.live/'
    }
  ];

  res.json({ events });
}

// ── 11. Comprehensive Career Analytics Dashboard ─────────────────────────────

export async function getAnalytics(req, res) {
  const user = req.userId ? await User.findById(req.userId) : null;
  
  let activitiesCount = 0;
  let streakDays = 0;
  let readinessScore = 55;
  let coursesCompleted = 0;
  let appsSent = 0;
  let interviewsCompleted = 0;

  if (user) {
    activitiesCount = user.activityLog ? user.activityLog.length : 0;
    streakDays = Math.min(activitiesCount, 14); // Simulating streak based on activity
    readinessScore = Math.min(55 + (activitiesCount * 2), 98);
    coursesCompleted = Math.floor(activitiesCount / 5);
    appsSent = Math.floor(activitiesCount / 3);
    interviewsCompleted = Math.floor(activitiesCount / 10);
  }

  res.json({
    careerReadinessScore: readinessScore,
    readinessLevel: readinessScore > 80 ? 'Job Ready (Top 15% Profile)' : 'Developing Core Skills',
    skillGrowth: [
      { month: 'Jan', technical: Math.max(30, readinessScore - 15), soft: Math.max(40, readinessScore - 10) },
      { month: 'Feb', technical: Math.max(35, readinessScore - 10), soft: Math.max(45, readinessScore - 5) },
      { month: 'Mar', technical: Math.max(40, readinessScore - 5), soft: Math.max(50, readinessScore - 2) },
      { month: 'Apr', technical: readinessScore, soft: Math.min(readinessScore + 5, 100) }
    ],
    coursesCompleted: coursesCompleted,
    applicationsSent: appsSent,
    interviewsCompleted: interviewsCompleted,
    resumeScore: Math.min(50 + (activitiesCount * 3), 95),
    learningStreakDays: streakDays,
    weeklyProgressPercentage: Math.min(10 + (activitiesCount * 5), 100),
    topStrengths: ['Problem Solving', 'Adaptability', 'Continuous Learning'],
    nextRecommendedAction: activitiesCount < 5 ? 'Complete your Profile & Study Plan' : 'Take a Mock Technical Interview'
  });
}
