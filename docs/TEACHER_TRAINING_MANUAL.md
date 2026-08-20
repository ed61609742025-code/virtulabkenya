# VirtuLab Kenya — Secondary Chemistry Teacher Facilitation Manual 👨‍🏫🧪

> **Target Audience:** Secondary School Chemistry Educators (Forms 1 through 4)  
> **Curriculum Alignment:** KICD Secondary Chemistry Syllabus & KNEC KCSE Paper 3 (233/3)  
> **Platform URL:** `https://virtulab.co.ke` (or local school network deployment)

---

## 1. Pedagogical Rationale & Objectives

VirtuLab Kenya is engineered to support secondary chemistry teachers across three key dimensions:
1. **Pre-Laboratory Scaffolding:** Familiarize learners with apparatus assembly, burette meniscus alignment, and indicator transitions before entering the physical laboratory.
2. **Zero-Chemical-Cost Remediation:** Enable infinite repetition of complex practicals (e.g. redox titration with expensive $\text{KMnO}_4$, complexometric titrations with EDTA, organic tests) without chemical waste or safety hazards.
3. **Formative Diagnostic Telemetry:** Identify class-wide stoichiometric and observation errors in real time.

---

## 2. Classroom Integration Models

### Model A: The Flipped Practical Model (Recommended)
- **Pre-Class (Homework):** Students complete the **Guided Titration** or **Qualitative Bench** module on their smartphones or home computers.
- **In-Class:** Teacher uses class time directly for advanced stoichiometric interpretation and discussion of discordant data.
- **Post-Class:** Teacher assigns a timed **15-Minute KCSE Exam Mode** practical as an online assessment.

### Model B: Single-Device Station Rotation
For schools with a single teacher laptop or a few shared tablets:
- Divide the class into 4 stations:
  - **Station 1:** Hands-on apparatus manipulation / glassware handling.
  - **Station 2:** VirtuLab Kenya digital simulation bench on shared tablet.
  - **Station 3:** Mark scheme calculation & mole ratio worksheets.
  - **Station 4:** Chemical safety (SDS) hazard interpretation.
- Rotate students every 15 minutes.

---

## 3. Step-by-Step Teacher Portal Guide

### 3.1 Teacher Registration & Class Linkage
1. Navigate to `/teacher/register.html`.
2. Select your registered secondary school from the dropdown list.
3. Provide your official name, email, and password.
4. Your unique **Teacher Access Code** (e.g., `MWALIMU01`) will be generated.
5. Instruct your students to enter this code during their registration so their session telemetry links automatically to your dashboard.

### 3.2 Creating & Dispatching Assignments
1. On your **Teacher Dashboard** (`/teacher/dashboard.html`), navigate to the **Assignments** tab.
2. Select the **Practical Type**:
   - Volumetric (Acid-Base, Redox, Precipitation, Complexometric)
   - Qualitative Salt Analysis (10 Unknown Salts)
   - Reaction Rates (Disappearing Cross)
   - Thermochemistry & Energetics
   - Solubility Curves & Crystallization
   - Organic Chemistry Functional Groups
   - Gas Preparation & Collection
   - Full 40-Mark Composite KCSE Mock Exam
3. Set custom title, due date, and instructions.
4. Click **"Dispatch Assignment"**. All linked students will receive an instant in-app notification.

### 3.3 Interpreting Diagnostic Telemetry
- **Titre Discordance Rate:** Highlights students who consistently average non-concordant titres ($> 0.20 \text{ cm}^3$ difference).
- **Indicator Mismatch:** Flags students who select inappropriate indicators (e.g. Methyl Orange for weak acid - strong base titrations).
- **Precipitate Deduction Confusion:** Identifies students struggling to distinguish between amphoteric hydroxides ($\text{Al}^{3+}, \text{Pb}^{2+}, \text{Zn}^{2+}$) that dissolve in excess $\text{NaOH}$.

---

## 4. Troubleshooting & Offline Support

- **No Internet Connection:** VirtuLab Kenya is an offline-first PWA. Once students open the platform once while online, the Service Worker caches all modules. Practical experiments execute fully offline and automatically queue results to sync when reconnected.

---

*VirtuLab Kenya · Open University of Kenya · Master of Science in Learning Design & Technology*
