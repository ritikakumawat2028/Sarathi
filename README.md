# 🌟 Sarthi — Your AI Guide for Every Step of Life

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Sarthi** is a next-generation AI-powered citizen empowerment and educational platform built specifically for India. Designed with low-bandwidth friendliness, rich visual design, and comprehensive multilingual support, Sarthi connects Indian citizens, students, and job seekers with personalized AI guidance, verified government welfare schemes, structured career paths, and skill-building resources.

---

## ✨ Key Features & Modules

### 🌐 1. Global Multilingual Support (8 Indian Languages)
Sarthi breaks down language barriers across India with an instant, zero-reload language switcher located right in the top navigation header:
- **Supported Languages**: English (`en`), Hindi (`हिन्दी`), Bengali (`বাংলা`), Tamil (`தமிழ்`), Telugu (`తెలుగు`), Marathi (`मराठी`), Gujarati (`ગુજરાતી`), and Kannada (`ಕನ್ನಡ`).
- **Deep Localization**: Every page, navigation menu, dashboard card, AI chat prompt suggestion, notification, and form label dynamically updates instantly in the user's chosen language.

---

### 🤖 2. Gemini-Class Full-Screen AI Assistant (`/chat`)
A state-of-the-art conversational AI experience engineered for students and citizens:
- **Full-Screen Layout**: Maximized workspace with a collapsible sidebar (`LeftSidebar`) and information drawer (`RightPanel`).
- **Word-by-Word Streaming (SSE)**: Real-time response generation via `/api/chat/stream` with blinking cursor and stop-generation control.
- **Multilingual Voice STT & TTS**: Integrated Web Speech API enabling citizens to speak their questions and have AI responses read aloud (`Read Aloud`) in their native regional accent.
- **Context-Aware File Uploads**: Upload `PDF`, `DOCX`, `TXT`, `CSV`, or images to extract text and ask targeted questions against documents or study materials.
- **Rich Markdown & Code**: Code blocks with syntax highlighting and 1-click copy buttons, tables, headings, blockquotes, and verified external resource links.
- **Advanced Chat Management**: Organizes chats by *Today*, *Yesterday*, and *Older*. Supports custom folder grouping, pinning, inline renaming, search, and exporting conversations to `.txt`.

---

### 🏛️ 3. Government Schemes Module (`/government-schemes`)
A dedicated intelligence center connecting citizens with national and state welfare programs:
- **Dynamic AI Eligibility Checker (`/government-schemes/eligibility`)**: Evaluates age, gender, state, occupation, income, and caste category against comprehensive eligibility criteria, returning personalized eligibility scores, matched reasons, and actionable missing criteria.
- **AI Scheme Recommendations (`/government-schemes/recommendations`)**: AI engine suggests tailored welfare schemes ranked by match percentage.
- **Real-Time Dashboard Sync**: Performing an eligibility check or AI recommendation scan automatically increments the `schemeChecks` counter and updates the real-time activity log on the user's Dashboard (`/dashboard`).
- **Scheme Explorer & Comparisons**: Filter by category/state, compare multiple schemes side-by-side, bookmark favorites, generate AI summaries (`AI Summary`), and track check history.

---

### 🎓 4. Student Support & Career Guidance (`/student-support`, `/career-guidance`)
Empowering Indian students with structured learning and verified career opportunities:
- **AI Study Planner & Doubt Solving**: Personalized daily study planners, exam strategies, and instant doubt resolution across all subjects.
- **Verified Free Courses (Zero Broken Links)**: Curated educational opportunities featuring working, verified links to top free learning platforms:
  - **Internshala Free Training & Bootcamps**
  - **Physics Wallah (PW) Free Skills & Foundation Courses**
  - **NPTEL / SWAYAM National Courses**
  - **Coursera & edX Free University Programs**
- **Verified Job & Internship Openings**: Real job and internship listings (Internshala, Google, Physics Wallah, National Career Service) with platform filter tabs (`Internshala`, `Physics Wallah`) and robust fallback verification so no button ever returns an error or `#`.
- **Career Tools**: Interactive Resume Builder, AI Interview Coach, Roadmap Generator, Skill Assessments, and Scholarship tracker.

---

### 🔔 5. Citizen Notifications Center (`/notifications`)
An official real-time alert center ensuring citizens never miss critical deadlines:
- **Categorized Tabs**: Filter alerts by *All Alerts*, *Unread*, *Schemes & Eligibility* (urgent scholarship & scheme deadlines), *Study & Career*, and *System & AI*.
- **Interactive State**: Unread indicators, `Mark as Read/Unread`, `Mark All as Read`, and single-click direct action buttons (`Check Eligibility Now`, `View AI Recommendations`).

---

### 📊 6. Citizen Dashboard (`/dashboard`)
A central command hub summarizing the citizen's journey:
- Real-time statistics counters (`Scheme Checks`, `AI Study Plans`, `Doubts Solved`, `Saved Schemes`).
- **Citizen Recent Activity**: Live chronological activity log synced with the user's backend profile (`User.activityLog`).

---

## 🏗️ System Architecture & Folder Structure

```txt
sarathi ai/
├── backend/                  # Node.js + Express + MongoDB Backend Server
│   ├── src/
│   │   ├── controllers/      # Route controllers (chat, schemes, career, user, auth)
│   │   ├── models/           # Mongoose schemas (User, Scheme, SchemeHistory)
│   │   ├── routes/           # REST & SSE API endpoints (/api/chat, /api/schemes, etc.)
│   │   ├── services/         # Caching & external scheme data pipelines
│   │   ├── utils/            # JWT authentication, JSON file store & error handling
│   │   └── index.js          # Express server entry point (Port 4000)
│   ├── package.json
│   └── .env.example
│
├── frontend/                 # React + TypeScript + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Modular UI components
│   │   │   │   ├── ai-chat/  # Full-screen AI assistant modules (LeftSidebar, ChatInput, etc.)
│   │   │   │   ├── career/   # Career Guidance modules (CoursesTab, JobsTab, ResumeBuilder, etc.)
│   │   │   │   ├── schemes/  # Scheme cards, navigation, and detail modals
│   │   │   │   └── ui/       # Shadcn-inspired solid opaque design system components
│   │   │   ├── context/      # Global state (LanguageContext, AuthContext, UserDataContext)
│   │   │   ├── data/         # Curated scheme datasets and fallbacks
│   │   │   ├── lib/          # API wrappers (api.ts, schemesApi.ts)
│   │   │   ├── pages/        # Application screens (Landing, Dashboard, AIChat, Notifications, etc.)
│   │   │   ├── routes.tsx    # Centralized React Router configuration
│   │   │   └── App.tsx       # Root layout provider
│   │   ├── styles/           # Tailwind CSS tokens, theme colors & custom styling
│   │   └── main.tsx          # Frontend DOM mount
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── README.md                 # Project Documentation
```

---

## 🚀 Quick Start Guide

Follow these steps to run **Sarthi** locally on your machine.

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **MongoDB** (Local instance or free MongoDB Atlas cluster connection URI)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/ritikakumawat2028/Sarathi.git
cd "Sarathi/sarathi ai"
```

### 2️⃣ Start the Backend API Server (`Port 4000`)
Open your first terminal window and configure the backend:

```bash
cd backend
npm install

# Copy environment template
copy .env.example .env    # Windows CMD/PowerShell
# OR: cp .env.example .env (Linux/macOS)
```

Ensure your `backend/.env` contains valid keys or fallback settings:
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/sarthi_ai
JWT_SECRET=sarthi_super_secret_jwt_key_2026
GEMINI_API_KEY=your_gemini_api_key_here
```

Now launch the backend API server:
```bash
npm run dev
# Backend running on http://localhost:4000
```

### 3️⃣ Start the Frontend Web Application (`Port 5173`)
Open a second terminal window inside the `sarathi ai` folder and configure the frontend:

```bash
cd frontend
npm install

# Copy environment template if needed
copy .env.example .env    # Windows CMD/PowerShell
```

Ensure `frontend/.env` points to your backend:
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

Start the Vite development server:
```bash
npm run dev
# Frontend ready on http://localhost:5173/
```

### 4️⃣ Explore Sarthi
Open `http://localhost:5173` in your browser. You can:
- Switch languages from the header (`हिन्दी`, `বাংলা`, `தமிழ்`, etc.).
- Create a citizen account or sign in (`/login`).
- Check welfare scheme eligibility and watch your Dashboard stats increment (`/government-schemes/eligibility`).
- Chat with the full-screen AI Assistant (`/chat`).
- Explore free verified courses on **Internshala** and **Physics Wallah** (`/career-guidance`).

---

## 📜 Available Commands

### Frontend (`cd frontend`)
| Command | Description |
|---|---|
| `npm run dev` | Start fast Vite local development server with HMR |
| `npm run build` | Build production bundle to `frontend/dist/` |
| `npm run preview` | Locally preview the production build |
| `npm run typecheck` | Run strict TypeScript validation across all files |

### Backend (`cd backend`)
| Command | Description |
|---|---|
| `npm run dev` | Start Node.js API server with auto-reload (Nodemon) |
| `npm start` | Start Node.js API server in production mode |

---

## 🤝 Contributing

Contributions are welcome! To contribute to Sarthi:
1. **Fork** the repository.
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`).
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4. **Push** to the branch (`git push origin feature/AmazingFeature`).
5. **Open** a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License**. See the repository for details.

---
*Built with ❤️ for a digital and empowered Bharat.*
