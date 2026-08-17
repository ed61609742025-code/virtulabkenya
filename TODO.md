# VirtuLab Kenya — Master To-Do & Roadmap Tracker 📋🧪

> **Project:** VirtuLab Kenya — An Offline-First Virtual Chemistry Laboratory for KCSE Learners  
> **Institution:** Open University of Kenya (OUK) · MSc in Learning Design and Technology  
> **Target Syllabus:** KICD Form 1–4 Chemistry & KCSE Paper 3 (233/3) Practical  
> **Last Updated:** August 2026  

---

## 📊 Overall Completion Status: **~85% Complete**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Phase 1: Architecture, Auth & Foundation           [████████████] 100% DONE │
│  Phase 2: Core Volumetric & Kinetics Engines        [████████████] 100% DONE │
│  Phase 3: Thermochemistry, Qualitative & Organic    [████████████] 100% DONE │
│  Phase 4: Teacher Ecosystem & 40-Mark Mock Exam     [████████████] 100% DONE │
│  Phase 5: PWA, Android App & Cloud Backend          [██████████░░]  85% IP   │
│  Phase 6: Field Pilot, TAM/SUS Study & Dissertation [░░░░░░░░░░░░]   0% TODO │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Laboratory Simulation Engines (KCSE Paper 3)

| Module | KCSE Topic / Exam Paper | Status |
| :--- | :--- | :---: |
| **Acid-Base Titration** | Volumetric Analysis (Paper 3, Q1) | ✅ Complete |
| **Redox Titration** | $\text{KMnO}_4\text{ / } \text{Fe}^{2+}$ Analysis (Paper 3, Q1) | ✅ Complete |
| **Precipitation & Complexometric** | $\text{AgNO}_3\text{ / EDTA}$ Titrations | ✅ Complete |
| **Thermochemistry (Energy Changes)** | Enthalpies of Solution, Neutralization & Displacement | ✅ Complete |
| **Reaction Rates & Kinetics** | Disappearing Cross, Gas Syringe & Collision Theory | ✅ Complete |
| **Qualitative Analysis (Salts)** | Cation ($\text{Fe}^{2+}, \text{Fe}^{3+}, \text{Cu}^{2+}, \text{Pb}^{2+}, \text{Al}^{3+}, \text{Zn}^{2+}, \text{Ca}^{2+}$) & Anion Identification | ✅ Complete |
| **Organic Chemistry Tests** | Unsaturation ($\text{Br}_2\text{, } \text{KMnO}_4$), Alcohols, Carboxylic Acids | ✅ Complete |
| **Solubility & Curves** | Solute Curves, Saturation & Fractional Crystallization | ✅ Complete |
| **40-Mark Composite KCSE Mock Exam** | Full-length KNEC-style Paper 3 Practical Simulation | ✅ Complete |

---

## 2. Platform Features & User Experience

- [x] **Student Platform**
  - [x] Student registration & login with school/teacher link
  - [x] Interactive virtual workbench with 60 FPS animations & sound effects
  - [x] Intelligent KNEC marking rubrics with step-by-step calculation feedback
  - [x] Practice history, score tracking, and automated KCSE certificate generation
  - [x] Gamified "Speed Battle" challenge mode
  - [x] Chemical safety and GHS hazard symbol library
  - [x] Real-time AI Chemistry Tutor & scaffolded hint system
- [x] **Teacher Platform**
  - [x] Teacher portal & class creation
  - [x] Assignment builder with custom due dates & titration parameters
  - [x] Real-time student session analytics, score distribution, and error telemetry
  - [x] Gradebook export to CSV for school reporting
- [x] **Admin Platform**
  - [x] School onboarding & access code management
  - [x] User roster management (Teachers & Students)
  - [x] System audit logging & activity analytics

---

## 3. Backend & Native Mobile Development

- [x] **Node.js / Express REST API** (16 route controllers, robust error handling & JWT security)
- [x] **PostgreSQL Database** (Full relational schema, migrations, and seed scripts)
- [x] **Offline-First PWA** (ServiceWorker cache and IndexedDB background sync queue)
- [x] **Capacitor 6 Android Project Structure** (`ke.co.virtulab.app`, AndroidX, Gradle configs, icons)
- [ ] **Build & Test Android APK** (Generate `app-debug.apk` via `./gradlew assembleDebug`)
- [ ] **Deploy Backend to Production** (Deploy Express + PostgreSQL to Railway / Render / DigitalOcean)
- [ ] **Configure Live Domain & SSL** (Link `https://virtulab.co.ke` or production HTTPS endpoint)

---

## 4. Academic Pilot Study & Dissertation (Phases 5 & 6)

- [ ] **NACOSTI Research Clearance**: Obtain official ethical clearance and permit from the National Commission for Science, Technology and Innovation (NACOSTI).
- [ ] **Pilot School Recruitment**: Onboard 10 secondary schools in Nairobi, Kiambu, and Machakos counties (2 National, 3 County, 5 Sub-County Day schools; $n \approx 600$ learners).
- [ ] **CPCAT Pre-Test Administration**: Measure baseline Chemistry Practical Competency before intervention.
- [ ] **8-Week Classroom & Mobile Intervention**: Regular practical exercises via web and offline Android app.
- [ ] **CPCAT Post-Test & Usability Surveys**: Administer post-intervention test, System Usability Scale (SUS), and Technology Acceptance Model (TAM) questionnaires.
- [ ] **Statistical Triangulation**: Compute Hake's normalized learning gain ($g$), Cohen's $d$ effect sizes, and ANCOVA models.
- [ ] **MSc Dissertation Submission**: Final thesis submission to the Open University of Kenya and policy brief to KICD / Ministry of Education.
