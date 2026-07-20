# 🌟 Sarthi — Your AI Guide for Every Step of Life

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-1.5_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Sarthi** is a next-generation, production-ready AI-powered citizen empowerment platform built for India. It connects citizens, students, and job seekers with personalized AI career guidance, 100+ government welfare schemes, structured learning paths, and real-time notifications — in 8 Indian languages.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Career Guidance Module (SaaS-grade AI Platform)](#-career-guidance-module-saas-grade-ai-platform)
- [MongoDB Data Model](#-mongodb-data-model)
- [Backend API Reference](#-backend-api-reference)
- [Frontend Pages & Components](#-frontend-pages--components)
- [Multilingual Language System](#-multilingual-language-system)
- [Real-Time Notifications](#-real-time-notifications)
- [Quick Start Guide](#-quick-start-guide)
- [Environment Variables](#-environment-variables)
- [Available Commands](#-available-commands)
- [Contributing](#-contributing)

---

## ✨ Features

| Module | Description |
|---|---|
| 🤖 **Gemini AI Assistant** | Full-screen streaming chat with SSE, voice STT/TTS, file uploads, and conversation history |
| 🎓 **Career Guidance Platform** | AI-powered resume ATS scanner, roadmap generator, portfolio reviewer, skill gap analysis, interview coach |
| 🏛️ **Government Schemes** | 100+ schemes with AI eligibility checker, comparisons, favorites, recommendations |
| 📊 **Career Analytics Dashboard** | Real-time career readiness score, goal tracker, achievement badges, activity timeline |
| 🔔 **Citizen Notifications** | Real-time polling every 20s, all career actions push MongoDB notifications |
| 🌐 **8 Indian Languages** | Instant language switching — EN, HI, TA, TE, BN, MR, GU, KN; persists across sessions |
| 👤 **Student Support** | Study planner, doubt solving, mental wellness tracker, scholarship finder |
| 🔐 **Auth & Persistence** | JWT authentication, all user data persisted in MongoDB Atlas |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 6.x | Build tool & HMR dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| React Router | 7 | Client-side routing |
| Lucide React | Latest | Icon library |
| Shadcn/ui components | Custom | Card, Button, Badge, Progress, Dropdown |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 5.x | HTTP server & routing |
| MongoDB + Mongoose | 8.x | Database & ODM |
| Google Gemini AI | gemini-1.5-flash | AI inference (career, chat, schemes) |
| bcryptjs | Latest | Password hashing |
| jsonwebtoken | Latest | JWT auth tokens |

---

## 🏗️ System Architecture

```
sarathi ai/
├── backend/                        # Node.js + Express + MongoDB API Server
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js        # Registration, login, JWT issue
│   │   │   ├── career.controller.js      # All career AI endpoints + scoring engine
│   │   │   ├── chat.controller.js        # Gemini streaming AI chat (SSE)
│   │   │   ├── schemes.controller.js     # Government scheme eligibility & recommendations
│   │   │   └── user.controller.js        # Profile, activity, notifications, doubts, wellness
│   │   ├── models/
│   │   │   ├── User.js                   # Unified Mongoose schema (all user data)
│   │   │   ├── Scheme.js                 # Government scheme data model
│   │   │   └── SchemeHistory.js          # User scheme eligibility check history
│   │   ├── middleware/
│   │   │   └── auth.middleware.js        # requireAuth + attachUserIfPresent JWT guards
│   │   ├── routes/
│   │   │   ├── auth.routes.js            # POST /api/auth/register, /api/auth/login
│   │   │   ├── career.routes.js          # All /api/career/* endpoints
│   │   │   ├── chat.routes.js            # /api/chat/stream (SSE), /api/chat
│   │   │   ├── schemes.routes.js         # /api/schemes/*
│   │   │   └── user.routes.js            # /api/user/* (profile, notifications, plans)
│   │   ├── utils/
│   │   │   ├── asyncHandler.js           # Express async error wrapper
│   │   │   └── AppError.js              # Structured API error class
│   │   └── index.js                      # Express app entry point (Port 4000)
│   ├── package.json
│   ├── .env.example
│   └── ecosystem.config.cjs             # PM2 production process config
│
├── frontend/                       # React + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── Header.tsx            # Sticky nav, language switcher, notification bell
│   │   │   │   ├── MobileMenu.tsx        # Responsive mobile navigation drawer
│   │   │   │   ├── Root.tsx              # App root with providers (Auth, Language, UserData)
│   │   │   │   ├── ProtectedRoute.tsx    # JWT auth guard for protected pages
│   │   │   │   ├── career/               # Career Guidance tab components (15 files)
│   │   │   │   │   ├── AnalyticsTab.tsx        # Career progress dashboard + scoring
│   │   │   │   │   ├── PortfolioReviewTab.tsx  # GitHub + LinkedIn + Portfolio reviewer
│   │   │   │   │   ├── ResumeBuilderTab.tsx    # ATS resume scanner + builder
│   │   │   │   │   ├── RoadmapTab.tsx          # AI learning roadmap generator
│   │   │   │   │   ├── SkillsTab.tsx           # Skill gap analysis + self-rating
│   │   │   │   │   ├── AICareerCoachTab.tsx    # AI career chat coach
│   │   │   │   │   ├── InterviewPrepTab.tsx    # Mock interview AI prep
│   │   │   │   │   ├── CoursesTab.tsx          # Verified free courses listings
│   │   │   │   │   ├── JobsTab.tsx             # Live job & internship openings
│   │   │   │   │   ├── CertificationsTab.tsx   # Free certification tracker
│   │   │   │   │   ├── ScholarshipsTab.tsx     # Scholarship opportunities
│   │   │   │   │   ├── EventsTab.tsx           # Hackathons & career events
│   │   │   │   │   ├── CareerPathsTab.tsx      # Visual career path explorer
│   │   │   │   │   ├── CareerHeader.tsx        # Page-level header & readiness score
│   │   │   │   │   └── CareerNavTabs.tsx       # Tab navigation controller
│   │   │   │   ├── ai-chat/              # Full-screen AI chat components
│   │   │   │   ├── schemes/              # Government scheme cards & UI
│   │   │   │   └── ui/                   # Design system (Card, Button, Badge, etc.)
│   │   │   ├── context/
│   │   │   │   ├── LanguageContext.tsx    # 8-language context + html lang sync
│   │   │   │   ├── AuthContext.tsx        # JWT auth state management
│   │   │   │   └── UserDataContext.tsx    # Citizen dashboard data provider
│   │   │   ├── lib/
│   │   │   │   ├── api.ts                # Thin fetch wrapper (GET/POST/PUT/DELETE + JWT)
│   │   │   │   └── schemesApi.ts         # Government schemes data access layer
│   │   │   ├── pages/
│   │   │   │   ├── LandingPage.tsx       # Public homepage
│   │   │   │   ├── LoginPage.tsx         # Citizen authentication
│   │   │   │   ├── SignupPage.tsx         # Citizen registration
│   │   │   │   ├── Dashboard.tsx         # Citizen stats & activity dashboard
│   │   │   │   ├── CareerGuidance.tsx    # Career guidance page router
│   │   │   │   ├── AIChat.tsx            # Full-screen AI assistant
│   │   │   │   ├── NotificationsPage.tsx # Real-time notifications center
│   │   │   │   ├── StudentSupport.tsx    # Study tools & student resources
│   │   │   │   ├── ProfilePage.tsx       # User profile management
│   │   │   │   └── schemes/              # Government schemes sub-pages
│   │   │   ├── routes.tsx                # Centralized React Router v7 config
│   │   │   └── App.tsx                   # Root React component
│   │   ├── styles/
│   │   │   └── index.css                 # Tailwind base + custom tokens
│   │   └── main.tsx                      # Vite DOM mount point
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```

---

## 🎯 Career Guidance Module (SaaS-grade AI Platform)

The Career Guidance module is a **production-ready AI career platform** with full MongoDB persistence, real-time scoring, and achievement gamification.

### Career Readiness Scoring Engine

Every career action triggers an automatic readiness recalculation using a **10-factor weighted formula**:

| Factor | Weight | Data Source |
|---|---|---|
| Technical Skills (self-rated 1–10 avg) | **35%** | `user.careerSkills` |
| Projects & Real Progress | **15%** | `coursesCompleted` + completed goals |
| ATS Resume Score | **10%** | `resumeData.atsScore` |
| GitHub Profile Verification | **10%** | `github_connected` achievement |
| LinkedIn Network Strength | **10%** | `linkedin_completed` achievement |
| Certifications & Courses | **5%** | `first_course` / courses count |
| Mock Interview Practice | **5%** | `first_interview` / interviews count |
| Verified Job Applications | **5%** | `applicationsSent` count |
| Smart Goals Completed | **5%** | `careerGoals` completion ratio |
| Personalized Roadmap | **5%** | `careerRoadmap` presence |

**Readiness Levels:**
- 🟢 **Job Ready** → Score ≥ 75%
- 🟡 **Interview Ready** → Score ≥ 50%
- 🔵 **Active Learner** → Score < 50%

### Career Sub-Modules

| Tab | Features |
|---|---|
| **Analytics Dashboard** | Real-time career readiness score, interactive progress tracker, smart goal setter, activity timeline, achievement badges, monthly skill trajectory chart |
| **Resume Builder** | AI ATS scanner, keyword suggestions, missing skill detection, AI-rewritten executive summary, resume save/load from MongoDB |
| **Portfolio & GitHub Review** | GitHub profile analysis (required), LinkedIn profile analysis (required), live portfolio website analysis (optional), score history |
| **Roadmap Generator** | AI-generated 3-month upskilling roadmap saved to MongoDB, role-specific milestones, current level targeting |
| **Skill Gap Analysis** | Self-rate 15+ technical and soft skills (1–10), AI benchmarks against target role, visual gap chart |
| **AI Career Coach** | Conversational Gemini AI career advisor with context awareness |
| **Interview Prep** | AI-generated role-specific interview questions, answer analysis with feedback |
| **Courses** | Verified free courses from NPTEL, Coursera, edX, Internshala, Physics Wallah |
| **Jobs** | Live internship and job listings with platform filters |
| **Certifications** | Industry certification tracker and links |
| **Scholarships** | National scholarship database |
| **Events** | Hackathons, career fairs, tech events |
| **Career Paths** | Visual career trajectory explorer |

### Achievement Badges (Auto-Unlocked)

| Badge ID | Title | Unlock Condition |
|---|---|---|
| `profile_completed` | Career Profile Completed | Career setup wizard completed |
| `skill_assessment` | First Skill Assessment | Skill gap analysis run once |
| `first_resume_review` | First Resume Review | ATS resume scan completed |
| `github_connected` | GitHub Connected | GitHub URL reviewed |
| `linkedin_completed` | LinkedIn Completed | LinkedIn URL reviewed |
| `portfolio_added` | Portfolio Added | Portfolio URL reviewed |
| `first_course` | Course Completed | 1+ courses logged |
| `apps_10` | 10 Job Applications | 10+ applications sent |
| `streak_30` | 30-Day Streak | 30+ day learning streak |
| `first_interview` | First Mock Interview | 1+ interviews completed |
| `roadmap_generated` | Roadmap Generated | Personalized roadmap created |

---

## 🗄️ MongoDB Data Model

All user data is stored in a **single unified `User` document** in MongoDB. Key sub-schemas:

```js
User {
  // Identity
  name, email, passwordHash,

  // Personal Profile
  phone, dateOfBirth, gender, occupation, annualIncome, category,
  education: { level, degree, branch, university, board, cgpa, ... },
  address: { city, state, district, pincode },

  // User Activity
  activityLog: [{ type, module, title, detail, timestamp }],  // last 50 entries
  notifications: [{ id, title, category, content, unread, actionUrl }],  // last 60

  // Student Tools
  studyPlans: [{ time, subject, topic, completed }],
  doubts: [{ question, subject, answer, status }],
  wellnessLog: [{ mood, note }],
  savedSchemes: [Number],

  // Career Platform (all persisted in MongoDB)
  careerProfile: { targetJobRole, experienceLevel, degree, setupCompleted },
  careerSkills: { Mixed },           // skill name → rating (1–10)
  careerAnalytics: { Mixed },        // readiness score, counters, weekly %
  careerGoals: [{ title, progress, completed }],
  careerAchievements: [{ id, title, description, icon, unlockedAt }],
  careerReviews: [{ type, url, score, strengths, weaknesses, recommendations }],
  careerRoadmap: { Mixed },          // full roadmap object with phases
  resumeData: { Mixed },             // resume text, ATS score, last review
}
```

---

## 📡 Backend API Reference

Base URL: `http://localhost:4000/api`

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create citizen account |
| POST | `/auth/login` | Public | Login + receive JWT token |

### User (`/api/user`) — Requires JWT
| Method | Endpoint | Description |
|---|---|---|
| GET | `/user/profile` | Get full user profile |
| PUT | `/user/profile` | Update profile fields |
| GET | `/user/stats` | Get dashboard counters |
| GET | `/user/activity` | Get activity log |
| POST | `/user/activity` | Add activity entry |
| GET | `/user/study-plans` | Get all study plans |
| POST | `/user/study-plans` | Create study plan |
| PUT | `/user/study-plans/:id` | Toggle plan completion |
| DELETE | `/user/study-plans/:id` | Delete study plan |
| GET | `/user/doubts` | Get submitted doubts |
| POST | `/user/doubts` | Submit a doubt |
| POST | `/user/doubt-solver` | AI solve a doubt |
| POST | `/user/chat` | General AI chat |
| GET | `/user/wellness` | Get wellness/mood log |
| POST | `/user/wellness` | Log mood entry |
| GET | `/user/notifications` | Get all notifications |
| PUT | `/user/notifications/read-all` | Mark all as read |
| PUT | `/user/notifications/:id/read` | Toggle single read state |
| DELETE | `/user/notifications/all` | Clear all notifications |
| DELETE | `/user/notifications/:id` | Delete single notification |

### Career (`/api/career`) — Auth optional (full features need JWT)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/career/chat` | AI career coach conversation |
| POST | `/career/interview-prep` | Generate interview questions |
| POST | `/career/interview-analyze` | Analyze interview answer |
| POST | `/career/resume-review` | ATS resume scan + AI feedback |
| GET | `/career/resume` | Load saved resume from MongoDB |
| POST | `/career/resume` | Save resume data to MongoDB |
| POST | `/career/roadmap` | Generate AI learning roadmap |
| GET | `/career/roadmap` | Load saved roadmap from MongoDB |
| POST | `/career/portfolio-review` | GitHub + LinkedIn + Portfolio analysis |
| GET | `/career/reviews` | Get career review history |
| POST | `/career/reviews` | Save a career review |
| GET | `/career/analytics` | Get career analytics data |
| POST | `/career/analytics/update` | Update progress counters → recalculate score |
| POST | `/career/skills-gap-analysis` | Run AI skill gap analysis |
| GET | `/career/profile` | Get career profile |
| POST | `/career/profile` | Update career setup profile |
| POST | `/career/goals` | Create/toggle/delete career goal |
| POST | `/career/activity` | Log career activity |
| GET | `/career/courses` | Get verified free courses |
| GET | `/career/jobs` | Get job & internship listings |
| GET | `/career/certifications` | Get certification opportunities |
| GET | `/career/scholarships` | Get scholarship listings |
| GET | `/career/events` | Get hackathons & career events |

### AI Chat (`/api/chat`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat` | Standard Gemini AI response |
| GET/POST | `/chat/stream` | SSE word-by-word streaming response |

### Government Schemes (`/api/schemes`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/schemes` | List all schemes (with filters) |
| GET | `/schemes/:id` | Get single scheme detail |
| POST | `/schemes/eligibility` | AI eligibility check against profile |
| POST | `/schemes/recommendations` | AI-ranked scheme recommendations |
| GET | `/schemes/history` | User's eligibility check history |

---

## 🖥️ Frontend Pages & Components

| Route | Page | Description |
|---|---|---|
| `/` | `LandingPage` | Public homepage with features overview |
| `/language` | `LanguageSelection` | First-time language picker |
| `/login` | `LoginPage` | Citizen authentication |
| `/signup` | `SignupPage` | Citizen registration |
| `/dashboard` | `Dashboard` | Stats, activity feed, quick links |
| `/chat` | `AIChat` | Full-screen Gemini AI assistant |
| `/career-guidance` | `CareerGuidance` | Career module with 13 tabs |
| `/student-support` | `StudentSupport` | Study planner, doubts, wellness |
| `/government-schemes` | `GovernmentSchemesLanding` | Scheme explorer home |
| `/government-schemes/eligibility` | `GovernmentSchemesEligibility` | AI eligibility checker |
| `/government-schemes/recommendations` | `GovernmentSchemesRecommendations` | Personalized AI scheme picks |
| `/government-schemes/search` | `GovernmentSchemesSearch` | Search & filter all schemes |
| `/government-schemes/favorites` | `GovernmentSchemesFavorites` | Saved/bookmarked schemes |
| `/government-schemes/compare` | `GovernmentSchemesCompare` | Side-by-side scheme comparison |
| `/government-schemes/history` | `GovernmentSchemesHistory` | Past eligibility checks |
| `/notifications` | `NotificationsPage` | Real-time notification center |
| `/profile` | `ProfilePage` | Citizen profile management |

---

## 🌐 Multilingual Language System

Sarthi supports **8 Indian languages** with instant switching:

| Code | Language | Script |
|---|---|---|
| `en` | English | Latin |
| `hi` | हिन्दी (Hindi) | Devanagari |
| `bn` | বাংলা (Bengali) | Bengali |
| `ta` | தமிழ் (Tamil) | Tamil |
| `te` | తెలుగు (Telugu) | Telugu |
| `mr` | मराठी (Marathi) | Devanagari |
| `gu` | ગુજરાતી (Gujarati) | Gujarati |
| `kn` | ಕನ್ನಡ (Kannada) | Kannada |

**How it works:**
- Language preference is saved to `localStorage` under key `sarathi_language`
- The `LanguageContext` sets `document.documentElement.lang` on every switch so the browser, screen readers, and spellcheck use the correct language
- The header `<select>` dropdown triggers an instant full-app re-render — no page reload needed
- Every page and component reads from the `t(key)` translation function or checks `language === 'hi'` for conditional rendering

---

## 🔔 Real-Time Notifications

The `NotificationsPage` polls the backend every **20 seconds** for fresh notifications.

**What triggers a notification:**
| Action | Notification |
|---|---|
| ATS resume scan | "ATS Resume Review Completed — scored X/100" |
| Roadmap generated | "Learning Roadmap Generated for [role]" |
| Portfolio/GitHub reviewed | "Digital Profile Review Saved — scored X/100" |
| Progress analytics updated | "Career Progress Updated" |
| Skill gap analysis run | "AI Skill Assessment Ready" |
| Career profile saved | "Career Profile & Setup Saved" |
| Smart goal added/updated | "Smart Career Target Added / Updated" |
| Career review saved | "Resume/GitHub Review Saved" |

**Filter categories:**
- **All** — every notification
- **Unread** — unread only
- **Schemes** — welfare scheme & government alerts
- **Career** — career guidance, skills, resume, progression
- **System** — platform & AI system alerts

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9+
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) free cluster
- **Google Gemini API Key** — get one free at [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/ritikakumawat2028/Sarathi.git
cd "Sarathi/sarathi ai"
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env       # Linux/macOS
# copy .env.example .env   # Windows PowerShell
```

Edit `backend/.env` with your credentials:
```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/sarthi_ai
JWT_SECRET=your_strong_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend:
```bash
npm start          # Production mode
# npm run dev      # Dev mode with auto-reload (if nodemon is installed)
```
Backend runs at → `http://localhost:4000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env       # Linux/macOS
# copy .env.example .env   # Windows PowerShell
```

Edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

Start the frontend:
```bash
npm run dev
```
Frontend runs at → `http://localhost:5173`

### 4. Open the App
Navigate to `http://localhost:5173` and:
1. **Create a citizen account** via `/signup`
2. **Switch language** using the header dropdown (`हिन्दी`, `தமிழ்`, etc.)
3. **Complete your Career Profile** at `/career-guidance` → Analytics tab → Career Profile Setup
4. **Run ATS Resume Scan** to get your first AI career score
5. **Check Government Scheme eligibility** at `/government-schemes/eligibility`
6. **Chat with AI** at `/chat`

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Server port (default: `4000`) |
| `MONGODB_URI` | Yes | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `GEMINI_API_KEY` | Yes | Google Gemini AI API key |
| `NODE_ENV` | Optional | `development` or `production` |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend API base URL (e.g. `http://localhost:4000/api`) |

---

## 📜 Available Commands

### Frontend (`cd frontend`)
| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR at port 5173 |
| `npm run build` | Build production bundle to `frontend/dist/` |
| `npm run preview` | Preview production build locally |
| `npx tsc --noEmit` | Validate TypeScript types |

### Backend (`cd backend`)
| Command | Description |
|---|---|
| `npm start` | Start Node.js API server (production) |
| `npm run dev` | Start with auto-reload (nodemon) |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

Please follow conventional commits (`feat:`, `fix:`, `chore:`, `docs:`) for commit messages.

---

## 📄 License

This project is licensed under the **MIT License**.

---

*Built with ❤️ for a digital and empowered Bharat. Jai Hind! 🇮🇳*
