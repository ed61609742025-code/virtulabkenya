# VirtuLab Kenya 🧪

> *"Every student deserves a laboratory."*

<<<<<<< HEAD
A web-based virtual chemistry laboratory for KCSE learners in Kenya — built to make high-quality practical science education accessible to every secondary school student, regardless of whether their school has a functioning physical laboratory.

---

## 🎯 The Problem

Over 60% of Kenyan secondary schools lack adequately equipped chemistry laboratories. Many students sit the KCSE Paper 3 practical examination having never performed or visualized the actual chemical reactions and techniques. **VirtuLab Kenya** bridges this gap through realistic, interactive, curriculum-aligned simulations that work across desktop computers, tablets, and mobile smartphones — even offline.

---

## ✨ Key Features

- **Students**:
  - Perform realistic virtual practicals mapped directly to the KNEC KCSE Chemistry Paper 3 syllabus.
  - Interactive SVG glassware rigs with drop-wise stopcock addition, meniscus lens viewfinders ($0.10\text{ cm}^3$ precision), flame test wire loops, and chemical precipitation reactions.
  - Practice self-paced experiments with instant feedback or take timed **15-Minute KCSE Exam Mode** simulations scored with official KNEC grades (A–E).
  - Step-by-step interactive guided tutorial walkthroughs.
  - Full session history, accuracy tracking, and achievement badges.
- **Teachers**:
  - Real-time class analytics dashboard with student drill-down performance profiles.
  - Create and grade assignments with due dates and custom instructions.
  - One-click printable PDF class performance reports and CSV data export.
- **System Administrators**:
  - National platform metrics, school registration & CRUD management, user roster management (active/suspended states, password resets), security audit logs, and broadcast announcements.
- **Offline & Low-Bandwidth Optimized**:
  - Progressive Web App (PWA) with Service Worker precaching so labs run smoothly without an active internet connection.
- **Bilingual**:
  - Full English and Kiswahili (`🇬🇧 EN` / `🇰🇪 SW`) support across all learner and teacher interfaces.

---

## 🧪 Current Practical Modules

| Practical Module | Type | KCSE Paper | Status |
|---|---|---|---|
| **Acid–Base Titration** ($HCl$ vs $NaOH$) | Volumetric Analysis | Paper 3 (Q1) | ✅ Built & Verified |
| **Redox Titration** ($Fe^{2+}$ vs $KMnO_4$) | Volumetric Analysis | Paper 3 (Q1) | ✅ Built & Verified |
| **Precipitation Titration** ($Cl^-$ vs $AgNO_3$, Mohr's) | Volumetric Analysis | Paper 3 (Q1) | ✅ Built & Verified |
| **Complexometric Titration** ($Ca^{2+}/Mg^{2+}$ vs EDTA) | Volumetric Analysis | Paper 3 (Q1) | ✅ Built & Verified |
| **Dibasic & Tribasic Acid Titrations** ($H_2SO_4$, $H_3PO_4$) | Volumetric Analysis | Paper 3 (Q1) | ✅ Built & Verified |
| **Weak Acid & Weak Base Systems** ($CH_3COOH$, $NH_3$) | Volumetric Analysis | Paper 3 (Q1) | ✅ Built & Verified |
| **Qualitative Salt Analysis** (10 Unknown Salts) | Inorganic Chemistry | Paper 3 (Q2) | ✅ Built & Verified |
| **Flame Test Bench** (Cation Emission Identification) | Inorganic Chemistry | Paper 3 (Q2) | ✅ Built & Verified |
| **Organic Chemistry Functional Group Lab** | Organic Chemistry | Paper 3 (Q3) | ✅ Built & Verified |
| **Gas Preparation Lab** (Simulated gas collection) | Inorganic Practical | Paper 3 | 🔄 Planned (Phase 6) |

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3 (Vanilla CSS design system), Vanilla JavaScript (ES6+) |
| **Backend** | Node.js + Express REST API |
| **Database** | PostgreSQL with automated schema migration safety |
| **Security & Middleware** | JWT (JSON Web Tokens), bcryptjs, Helmet headers, Rate Limiting, Input Sanitization, Gzip/Brotli Compression |
| **Testing** | Node.js Test Runner (28 Automated Unit & Integration Tests) |
| **PWA & Offline** | Service Worker (`sw.js`), Web App Manifest (`manifest.json`) |
| **Bilingual Engine** | Custom client-side dictionary (`i18n.js`) with English & Kiswahili |

---

## 📁 Project Structure
=======
A web-based virtual chemistry laboratory for KCSE learners in Kenya — built to make high-quality practical science education accessible to every secondary school student, regardless of whether their school has a functioning lab.

---

## The Problem

Over 60% of Kenyan secondary schools lack adequately equipped chemistry laboratories. Students sit the KCSE Paper 3 practical exam having never performed the actual experiments. VirtuLab Kenya changes that.

## What It Does

- **Students** log in from any browser or smartphone and perform realistic virtual chemistry practicals — titrations, qualitative analysis, gas preparation — mapped directly to the KCSE/KICD syllabus
- **Teachers** get a real-time dashboard showing every student's results, accuracy, and struggles — without being in the same room
- **Works offline** — built as a Progressive Web App so it functions even with poor connectivity
- **Bilingual** — full English and Kiswahili support

## Current Practicals

| Practical | Type | KCSE Paper | Status |
|---|---|---|---|
| Acid–Base Titration | Titration | Paper 3 | ✅ Built |
| Redox Titration | Titration | Paper 3 | ✅ Built |
| Precipitation Titration | Titration | Paper 3 | ✅ Built |
| Complexometric Titration | Titration | Paper 3 | ✅ Built |
| Qualitative Analysis | Salt analysis | Paper 3 | 🔄 Phase 5 |
| Gas Preparation | Practical | Paper 3 | 🔄 Phase 5 |

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Authentication | JWT (JSON Web Tokens) |
| Hosting | Railway (pilot) |
| Offline support | Progressive Web App (PWA) |

## Project Structure
>>>>>>> 74e471700462c14fcb25509826ece705e831d8d8

```
virtulabkenya/
├── client/
<<<<<<< HEAD
│   ├── student/          # Student portal (home, lab, qualitative, organic, history, login)
│   ├── teacher/          # Teacher analytics dashboard and login
│   ├── admin/            # National system administration portal
│   ├── shared/           # Design system CSS, API client, and i18n translations
│   ├── manifest.json     # PWA Web App Manifest
│   └── sw.js             # Service Worker for offline asset precaching
├── server/
│   ├── routes/           # REST endpoints (auth, sessions, assignments, qualitative, organic, admin, errors)
│   ├── middleware/       # JWT verification, rate limiting, error tracking
│   ├── db/               # Database pool connection and schema.sql
│   ├── tests/            # Automated node API test suite (28 test cases)
│   └── index.js          # Express app entrypoint
├── docs/                 # Curriculum alignment and deployment guides
└── README.md
```

---

## 🚦 Quick Start & Local Development

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/) database

### 2. Setup Server
```bash
cd server
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install
```

### 3. Run Automated Tests
```bash
npm test
# Runs node --test tests/node_api.test.js (28/28 tests passing)
```

### 4. Start the Application
```bash
npm start
# Server listens on http://localhost:3000 (and local network IP for mobile testing)
```

---

## 🗺️ Development Roadmap

| Phase | Focus | Status |
|---|---|---|
| **Phase 1** | Core Titration Bench, SVG apparatus physics, Buret lens, stopcock controls | ✅ Completed |
| **Phase 2** | Qualitative Salt Analysis, 10 unknown salts, flame tests, precipitate reactions | ✅ Completed |
| **Phase 3** | Student & Teacher Portals, class analytics, assignments, PDF reporting | ✅ Completed |
| **Phase 4** | Organic Chemistry functional group lab, timed KCSE Exam Mode, responsive flanking workbench | ✅ Completed |
| **Phase 5** | System Admin portal, Helmet security, rate limiting, PWA offline caching, automated test suite | ✅ Completed |
| **Phase 6** | Pilot Study, pre/post-test module, SUS/TAM research evaluation, and dissertation analysis | 🔄 Active |

---

## 🎓 Academic & Research Context

This project serves as the capstone research and development project for a **Master's in Learning Design and Technology** at the **Open University of Kenya**. The evaluation framework utilizes:
- **Technology Acceptance Model (TAM)** — Teacher acceptance and perceived usefulness questionnaires.
- **System Usability Scale (SUS)** — Student usability and satisfaction surveys.
- **Pre/Post-Test Knowledge Modules** — Empirical measurement of student learning gains.
- **Objective Telemetry Logs** — Anonymized session duration, trial counts, and error patterns.

---

## 📜 Curriculum Alignment

All laboratory experiments and mark schemes strictly adhere to the **Kenya Institute of Curriculum Development (KICD)** Secondary Chemistry Syllabus and the **Kenya National Examinations Council (KNEC)** KCSE Paper 3 (233/3) examination format.

---

## 📬 Contact & Contribution
=======
│   ├── student/          # Student-facing pages (login, home, lab, history)
│   ├── teacher/          # Teacher dashboard pages
│   └── shared/           # Shared CSS and API utility functions
├── server/
│   ├── routes/           # API route handlers (auth, sessions, assignments)
│   ├── middleware/        # JWT authentication middleware
│   └── db/               # Database schema and query functions
├── docs/                 # API documentation, KICD alignment, deployment guide
├── research/             # Questionnaires, pre/post tests, pilot study materials
└── README.md
```

## Development Roadmap

| Phase | Focus | Timeline |
|---|---|---|
| 1 | Server, database, login system | Months 1–2 |
| 2 | Connect lab to server (live data) | Months 3–4 |
| 3 | Student platform (progress, history, certificates) | Months 5–6 |
| 4 | Teacher tools (assignments, reporting) | Months 7–8 |
| 5 | New practicals (qualitative analysis, gas preparation) | Months 9–10 |
| 6 | Pilot study, evaluation, dissertation | Months 11–12 |

## Academic Context

This project is the capstone for a **Master's in Learning and Technology** at the **Open University of Kenya**. The evaluation framework uses:
- Technology Acceptance Model (TAM) — teacher questionnaires
- System Usability Scale (SUS) — student questionnaires  
- Pre/post knowledge tests — measuring learning gain
- Usage logs — objective session data from the database

## Curriculum Alignment

All practicals are aligned to the **Kenya Institute of Curriculum Development (KICD)** Chemistry Syllabus and the **KCSE Paper 3** practical examination format.

## Future Plans

VirtuLab Kenya is designed to expand beyond chemistry:
- **Physics** — circuits, optics, Hooke's law, radioactivity
- **Biology** — photosynthesis, osmosis, enzyme activity
- **All Forms** — covering Forms 1 through 4 across all three sciences

## Contact

Built by a Kenyan learner, for Kenyan learners.  
GitHub: [@ed61609742025-code](https://github.com/ed61609742025-code)

---

*VirtuLab Kenya · Open University of Kenya · Master's in Learning and Technology*

# VirtuLab Kenya 🧪

> *"Every student deserves a laboratory."*

A web-based virtual chemistry laboratory for KCSE learners in Kenya — built to make high-quality practical science education accessible to every secondary school student, regardless of whether their school has a functioning lab.

---

## The Problem

Over 60% of Kenyan secondary schools lack adequately equipped chemistry laboratories. Students sit the KCSE Paper 3 practical exam having never performed the actual experiments. VirtuLab Kenya changes that.

## What It Does

- **Students** log in from any browser or smartphone and perform realistic virtual chemistry practicals — titrations, qualitative analysis, gas preparation — mapped directly to the KCSE/KICD syllabus
- **Teachers** get a real-time dashboard showing every student's results, accuracy, and struggles — without being in the same room
- **Works offline** — built as a Progressive Web App so it functions even with poor connectivity
- **Bilingual** — full English and Kiswahili support

## Current Practicals

| Practical | Type | KCSE Paper | Status |
|---|---|---|---|
| Acid–Base Titration | Titration | Paper 3 | ✅ Built |
| Redox Titration | Titration | Paper 3 | ✅ Built |
| Precipitation Titration | Titration | Paper 3 | ✅ Built |
| Complexometric Titration | Titration | Paper 3 | ✅ Built |
| Qualitative Analysis | Salt analysis | Paper 3 | 🔄 Phase 5 |
| Gas Preparation | Practical | Paper 3 | 🔄 Phase 5 |

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Authentication | JWT (JSON Web Tokens) |
| Hosting | Railway (pilot) |
| Offline support | Progressive Web App (PWA) |

## Project Structure

```
virtulabkenya/
├── client/
│   ├── student/          # Student-facing pages (login, home, lab, history)
│   ├── teacher/          # Teacher dashboard pages
│   └── shared/           # Shared CSS and API utility functions
├── server/
│   ├── routes/           # API route handlers (auth, sessions, assignments)
│   ├── middleware/        # JWT authentication middleware
│   └── db/               # Database schema and query functions
├── docs/                 # API documentation, KICD alignment, deployment guide
├── research/             # Questionnaires, pre/post tests, pilot study materials
└── README.md
```

## Development Roadmap

| Phase | Focus | Timeline |
|---|---|---|
| 1 | Server, database, login system | Months 1–2 |
| 2 | Connect lab to server (live data) | Months 3–4 |
| 3 | Student platform (progress, history, certificates) | Months 5–6 |
| 4 | Teacher tools (assignments, reporting) | Months 7–8 |
| 5 | New practicals (qualitative analysis, gas preparation) | Months 9–10 |
| 6 | Pilot study, evaluation, dissertation | Months 11–12 |

## Academic Context

This project is the capstone for a **Master's in Learning and Technology** at the **Open University of Kenya**. The evaluation framework uses:
- Technology Acceptance Model (TAM) — teacher questionnaires
- System Usability Scale (SUS) — student questionnaires  
- Pre/post knowledge tests — measuring learning gain
- Usage logs — objective session data from the database

## Curriculum Alignment

All practicals are aligned to the **Kenya Institute of Curriculum Development (KICD)** Chemistry Syllabus and the **KCSE Paper 3** practical examination format.

## Future Plans

VirtuLab Kenya is designed to expand beyond chemistry:
- **Physics** — circuits, optics, Hooke's law, radioactivity
- **Biology** — photosynthesis, osmosis, enzyme activity
- **All Forms** — covering Forms 1 through 4 across all three sciences

## Contact
>>>>>>> 74e471700462c14fcb25509826ece705e831d8d8

Built by a Kenyan learner, for Kenyan learners.  
GitHub: [@ed61609742025-code](https://github.com/ed61609742025-code)

---

*VirtuLab Kenya · Open University of Kenya · Master's in Learning Design and Technology*
