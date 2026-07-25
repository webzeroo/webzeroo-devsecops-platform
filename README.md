#  WebZero

A modern Learning Management System built with **Next.js 14** and **Firebase**.

##  Features  Test

###  Admin Portal
- **Dashboard** — Stats cards + Analytics (Users, Assessment Results, Course Progress)
- **Users** — View all users with role badges, sort, paginate
- **Courses** — Create, Edit, Delete, Publish courses with thumbnails
- **Lessons** — Add Video URLs, PDFs, PPTs, DOCX files to courses
- **Assessments** — Build MCQ quizzes with multiple questions, set passing marks
- **Reports** — Score distribution charts, pass/fail analytics, results table
- **Settings** — Platform configuration

### Learner Portal
- **Dashboard** — Enrolled courses, completed assessments, average score
- **My Courses** — Browse & enroll in published courses
- **Lessons** — Access course materials (video, PDF, PPT, DOCX)
- **Assessments** — Take MCQ quizzes with auto-grading
- **My Results** — View all scores and pass/fail history
- **Profile** — Update display name

###  Authentication
- Firebase Authentication (Email + Password)
- Role-based access control (Admin / Learner)
- Protected routes with auto-redirect

##  DevSecOps Pipeline

This project is secured by a state-of-the-art **Automated DevSecOps Pipeline** via GitHub Actions. It implements a complete "Holy Trinity" of security checks on every Pull Request and Push to the `main` branch.

### 1. Dynamic SAST (Static Application Security Testing)
The pipeline intelligently switches SAST tools based on the repository's visibility:
- **CodeQL**: If the repository is Public, the pipeline runs deep semantic taint analysis using GitHub Advanced Security CodeQL.
- **Semgrep**: If the repository is Private, the pipeline automatically skips CodeQL (avoiding billing issues) and runs Semgrep for lightning-fast syntactic security scanning.

### 2. SCA (Software Composition Analysis)
- **Dependabot**: Automatically scans all NPM packages in `package.json` for known CVEs and vulnerabilities.

### 3. API Security & Functional Testing (Jest)
- **[Hacker Path]**: Negative security tests simulating unauthorized attacks, missing tokens, and role violations.
- **[Happy Path]**: Positive functional tests proving endpoints return the correct JSON data for authorized users.

### 4. End-to-End UI Checks (Playwright)
- Headless browser tests verify Role-Based Access Control, ensuring Learners cannot access the Admin Portal, and validates core UI flows.

### 5. DAST (Dynamic Application Security Testing)
- **OWASP ZAP**: After the application compiles, the pipeline boots a background Next.js server and launches the official OWASP ZAP Docker container against `localhost:3000` to actively attack the live endpoints for XSS, CSRF, and Injection vulnerabilities.

###  Executive Summary Dashboard
Upon completion, the pipeline generates a dynamic Markdown dashboard summarizing the security posture of the current commit, accompanied by downloadable HTML reports for Jest, Playwright, and ZAP.

##  License
MIT License © 2026 WebZeroo
