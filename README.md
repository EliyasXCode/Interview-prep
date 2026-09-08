# 🤖 AI-Powered Interview Preparation & ATS Resume Platform (PrepAI PRO)

A full-stack **AI-powered interview preparation and ATS resume platform** built with the **MERN Stack (MongoDB Atlas, Express 5, React 19, Node.js)** and powered by **Google Gemini 3.6 Flash**.

Candidates can upload their resume (PDF) or paste profile details alongside any target job description. The platform leverages Gemini 3.6 Flash structured JSON schema to generate an in-depth interview preparation strategy, an Applicant Tracking System (ATS) audit with keyword matching, technical and behavioral (STAR method) interview questions, skill gaps with severity ratings, an interactive 7-day preparation roadmap, and a downloadable, tailored ATS-friendly resume generated server-side via Puppeteer.

---

## 🚀 Key Features

* **User Authentication**: Secure JWT authentication with HTTP-only cookies and Bearer tokens, token blacklisting for safe logout, and protected client routes.
* **Dual Resume Input**: Upload resume PDF directly via Multer & `pdf-parse` or paste raw resume text, with optional candidate self-description.
* **Job Description Analysis**: Instant requirement extraction and keyword matching against candidate profiles.
* **Google Gemini 3.6 Flash Integration**: High-speed, structured JSON generation with strict Zod schemas ensuring zero missing fields.
* **ATS Compatibility & Resume Audit**:
  - Overall ATS Score (0-100) and readiness rating (Excellent, Good, Needs Improvement, Critical Issues).
  - Matched high-impact keywords vs. missing target keywords.
  - Actionable ATS recommendations to beat automated resume screeners.
  - Profile strengths summary.
* **Technical Interview Questions**: 4 to 6 role-specific questions complete with interviewer intentions, comprehensive model answers, and copy buttons.
* **Behavioral Interview Questions (STAR Method)**: 4 to 6 behavioral questions with structured STAR answers (Situation, Task, Action, Result).
* **Skill Gaps Analysis**: Identified missing or weak skills tagged with High, Medium, or Low severity and mitigation recommendations.
* **Interactive 7-Day Road Map**: Day-by-day practical checklist allowing candidates to mark tasks completed as they prepare.
* **Server-Side ATS Resume PDF Generation**: Headless Puppeteer Chromium renders a clean, single-column, ATS-compliant HTML resume and streams a downloadable PDF file.
* **Live In-Browser Resume Preview**: View the tailored ATS resume in a clean paper layout before downloading.
* **Strategy History**: Browse past interview preparation reports with match scores, dates, and instant resume re-download.
* **Modern Dark UI**: Glassmorphic dashboard, responsive layout, animated loading state with step progress, and smooth transitions.

---

## 🛠️ Tech Stack

### Frontend
* **React 19** & **Vite 8**
* **React Router v7**
* **SCSS** (Sass modern design system with glassmorphism)
* **Axios** (with credentials and blob response support)
* **Context API** (AuthContext & InterviewContext)

### Backend
* **Node.js** & **Express 5**
* **MongoDB Atlas** & **Mongoose 9**
* **JWT (jsonwebtoken)** & **bcryptjs**
* **Multer** & **pdf-parse**
* **CORS** & **cookie-parser**

### AI & PDF Generation
* **@google/genai** SDK (`gemini-3.6-flash`)
* **Zod** & **zod-to-json-schema**
* **Puppeteer** (Headless Chromium PDF printing)

---

## ⚙️ How to Run the Project

### 1. Project Location
The project is located at:
```text
C:\Users\samir mulla\.gemini\antigravity\scratch\ai-interview-prep-platform
### 2. Run Backend

Open a terminal:
```bash
cd "C:\Users\samir mulla\.gemini\antigravity\scratch\ai-interview-prep-platform\Backend"
node server.js
```
The backend starts on `http://localhost:3000` and automatically connects to MongoDB Atlas.

### 3. Run Frontend

Open a second terminal:
```bash
cd "C:\Users\samir mulla\.gemini\antigravity\scratch\ai-interview-prep-platform\Frontend"
npm run dev
```
Frontend runs on:
```text
http://localhost:5173
```
Open `http://localhost:5173` in your browser.

## 🔄 Application Flow

```text
Resume / Self Description
        +
Job Description
        ↓
Node.js Backend
        ↓
Google Gemini API
        ↓
AI Interview Report
        ↓
React Frontend
```

## 🔐 Important

Never upload your `.env` file or API keys to GitHub.

Add these to `.gitignore`:

```gitignore
node_modules/
.env
```

## 👨‍💻 Project Purpose

This project demonstrates practical knowledge of **MERN Stack development, REST APIs, JWT authentication, MongoDB, Generative AI integration, file uploads, React architecture, and PDF generation**.
