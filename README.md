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

Built by a Kenyan learner, for Kenyan learners.  
GitHub: [@ed61609742025-code](https://github.com/ed61609742025-code)

---

*VirtuLab Kenya · Open University of Kenya · Master's in Learning Design and Technology*
