
  # AI for Bharat Platform

# 🚀 React + Vite + Tailwind CSS Project

A modern, scalable frontend application built using **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.  
This project follows a clean folder structure with separation of concerns, making it easy to maintain, extend, and scale.

---

## 📌 Project Overview

This project is designed with:
- **Component-based architecture**
- **Centralized routing**
- **Reusable utilities and contexts**
- **Modern styling using Tailwind CSS**
- **Fast development & build performance with Vite**

It is suitable for:
- Startup MVPs
- Dashboard / SaaS products
- Portfolio or production-ready web apps

---
project view :

<img width="1884" height="847" alt="image" src="https://github.com/user-attachments/assets/e5c63596-887e-4f27-9a00-278d80add069" />

<img width="1882" height="801" alt="image" src="https://github.com/user-attachments/assets/499ad979-adca-468f-af5a-d891876d722d" />

<img width="1877" height="808" alt="image" src="https://github.com/user-attachments/assets/b025e894-3f58-46ff-8e94-d02b552caebd" />
<img width="1806" height="815" alt="image" src="https://github.com/user-attachments/assets/2ee4141f-b38a-490e-9d89-e0d6868da099" />

<img width="1021" height="831" alt="image" src="https://github.com/user-attachments/assets/07ec91bd-61a2-4c2a-8fe5-1e7d453a83f2" />
<img width="1130" height="823" alt="image" src="https://github.com/user-attachments/assets/482af297-f0e0-4cc4-9519-09a43b7546b4" />
<img width="979" height="811" alt="image" src="https://github.com/user-attachments/assets/956dcca4-2c66-4616-a918-788d0fafbcf7" />
<img width="1747" height="839" alt="image" src="https://github.com/user-attachments/assets/fcc529cf-c155-46d5-8c99-a68d5186967e" />
<img width="1825" height="846" alt="image" src="https://github.com/user-attachments/assets/c45c94a2-3061-42c9-a7d0-17dd62e0fbfd" />
<img width="1873" height="851" alt="image" src="https://github.com/user-attachments/assets/4d430b44-c116-4334-8419-5df9e819227b" />
<img width="1812" height="846" alt="image" src="https://github.com/user-attachments/assets/d7ba835c-459e-4511-ab30-5e99913deefc" />
<img width="1880" height="838" alt="image" src="https://github.com/user-attachments/assets/0998c1f1-74a1-439e-8cf0-a131a83dde65" />
<img width="1797" height="846" alt="image" src="https://github.com/user-attachments/assets/a4b7bdf5-0f06-4a09-9ce2-ed5d1dba5fe4" />
<img width="1765" height="841" alt="image" src="https://github.com/user-attachments/assets/74387558-e3d3-4b40-a63f-2bdc4ecc9c18" />


## 🗂️ Folder Structure

```txt
src/
│
├── app/
│   ├── components/     # Reusable UI components
│   ├── context/        # React Contexts (global state, auth, theme, etc.)
│   ├── data/           # Static data & constants
│   ├── pages/          # Page-level components
│   ├── utils/          # Helper functions & utilities
│   ├── App.tsx         # Root App component
│   └── routes.tsx     # Application routing
│
├── styles/
│   ├── fonts.css
│   ├── index.css
│   ├── tailwind.css
│   └── theme.css
│
├── main.tsx            # Application entry point
│
├── ATTRIBUTIONS.md     # Third-party credits
└── IMPLEMENTATION_GUIDE.md


⚙️ Tech Stack

React (with Hooks)

TypeScript

Vite

Tailwind CSS

PostCSS

ESLint (optional)

🧑‍💻 Prerequisites

Make sure you have the following installed:

Node.js (v18 or above recommended)

npm or yarn

Check versions:

3️⃣ Install dependencies

npm install

## 🔌 Backend (new)

This project now ships with a real backend in `/server` — Express + JWT auth, plus a
Government Scheme data pipeline that fetches real data from Government of India sources
(myScheme and data.gov.in) instead of a hardcoded list. See `server/README.md` for full
details. Quick start (in a second terminal):

```bash
cd server
cp .env.example .env
npm install
npm run dev        # http://localhost:4000
```

Then, at the project root, copy `.env.example` to `.env` (it already points
`VITE_API_BASE_URL` at `http://localhost:4000/api`) before running `npm run dev` for the
frontend. If the backend isn't running, the Government Schemes page automatically falls
back to a bundled offline dataset so the UI still works.

4️⃣ Start the development server

npm run dev


5️⃣ Open in browser

http://localhost:5173

🏗️ Build for Production

To create an optimized production build:

npm run build


Preview the production build locally:

npm run preview

📜 Available Scripts
Command	Description
npm run dev	Start development server
npm run build	Build for production
npm run preview	Preview production build
npm run typecheck	Type-check the project with tsc (no emit)
npm install	Install dependencies
🎨 Styling

Tailwind CSS is configured via tailwind.css

Global styles are located in styles/index.css

Theme-related styles are managed in theme.css

📘 Documentation

IMPLEMENTATION_GUIDE.md → Detailed implementation notes

ATTRIBUTIONS.md → Third-party libraries & credits

🤝 Contributing

Contributions are welcome!

Fork the repository

Create a new branch

Commit your changes

Open a Pull Request

📄 License

This project is licensed under the MIT License.











