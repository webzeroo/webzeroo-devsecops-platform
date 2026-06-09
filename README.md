# 🎓 WebZero LMS Platform

A modern Learning Management System built with **Next.js 14**, **Firebase**, and deployed on **Vercel** with a full **DevSecOps CI/CD pipeline**.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-orange?logo=firebase)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)
![CodeQL](https://img.shields.io/badge/Security-CodeQL-blue)

---

## ✨ Features

### 🛡️ Admin Portal
- **Dashboard** — Stats cards + Chart.js analytics (Users by Month, Assessment Results, Course Progress)
- **Users** — View all users with role badges, sort, paginate
- **Courses** — Create, Edit, Delete, Publish courses with thumbnails
- **Lessons** — Add Video URLs, PDFs, PPTs, DOCX files to courses
- **Assessments** — Build MCQ quizzes with multiple questions, set passing marks
- **Reports** — Score distribution charts, pass/fail analytics, results table
- **Settings** — Platform configuration

### 🎓 Learner Portal
- **Dashboard** — Enrolled courses, completed assessments, average score
- **My Courses** — Browse & enroll in published courses
- **Lessons** — Access course materials (video, PDF, PPT, DOCX)
- **Assessments** — Take MCQ quizzes with auto-grading
- **My Results** — View all scores and pass/fail history
- **Profile** — Update display name

### 🔐 Authentication
- Firebase Authentication (Email + Password)
- Role-based access control (Admin / Learner)
- Protected routes with auto-redirect

### 🔌 API Routes (for DevSecOps Testing)
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/login` | Verify Firebase token | Public |
| GET | `/api/courses` | List courses | Required |
| POST | `/api/courses` | Create course | Admin |
| GET | `/api/lessons` | List lessons | Required |
| POST | `/api/lessons` | Create lesson | Admin |
| GET | `/api/assessments` | List assessments | Required |
| POST | `/api/assessments` | Create assessment | Admin |
| POST | `/api/submit` | Submit quiz answers | Learner |
| GET | `/api/reports` | Get report data | Admin |

### 🔄 DevSecOps Pipeline
- **CI** — ESLint, npm audit, Jest tests, production build
- **CodeQL** — Static analysis for JavaScript vulnerabilities
- **Deploy** — Automatic Vercel deployment on push to main

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm
- Firebase project (see setup below)
- GitHub account
- Vercel account

### 1. Clone the Repo

```bash
git clone https://github.com/webzeroo/webzeroo-devsecops-platform.git
cd webzeroo-devsecops-platform
npm install
```

### 2. Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Name it: `webzero-lms`
4. Disable Google Analytics (optional)
5. Click **Create Project**

#### Enable Authentication:
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Click **Save**

#### Enable Firestore:
1. Go to **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (for development)
4. Choose your region → **Enable**

#### Get Client Config:
1. Go to **Project Settings** → **General**
2. Under **Your apps**, click **Web** (</> icon)
3. Register app name: `webzero-lms`
4. Copy the `firebaseConfig` values

#### Get Service Account Key:
1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate new private key**
3. Save the JSON file securely

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=webzero-lms.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=webzero-lms
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=webzero-lms.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

> **Tip:** For the service account key, copy the entire JSON content and paste it as a single line.

### 4. Seed the Database

```bash
# Set the path to your service account key
set FIREBASE_SERVICE_ACCOUNT_KEY=path/to/serviceAccountKey.json

# Run the seed script
node scripts/seed.js
```

This creates:
- **admin@webzeroo.com** (password: `admin123`)
- **learner@webzeroo.com** (password: `learner123`)
- Sample course with lessons and an assessment

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚢 Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit: WebZero LMS Platform"
git remote add origin https://github.com/webzeroo/webzeroo-devsecops-platform.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Import Project** → Select your GitHub repo
3. Add all environment variables from `.env.local`
4. Click **Deploy**

### 3. Set Up GitHub Secrets (for CI/CD)

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

| Secret Name | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Your auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Your storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Your app ID |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Full JSON service account key |
| `VERCEL_TOKEN` | Get from Vercel → Settings → Tokens |

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run linting
npm run lint

# Security audit
npm audit
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.js              # Login page
│   ├── admin/               # Admin portal (8 pages)
│   ├── learner/             # Learner portal (7 pages)
│   └── api/                 # REST API routes (6 endpoints)
├── components/              # Reusable components
├── lib/                     # Firebase config & auth context
└── styles/                  # Component stylesheets
```

---

## 🎨 Design

- **Dark theme** with glassmorphism effects
- **Inter** font from Google Fonts
- **Animated** stat cards with counting numbers
- **Chart.js** with dark-theme styled charts
- **Responsive** layout (desktop + mobile)

---

## 📜 License

MIT License © 2026 WebZeroo

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

The CI pipeline will automatically run linting, tests, and CodeQL analysis on your PR.
