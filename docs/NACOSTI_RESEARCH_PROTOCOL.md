# NACOSTI Research Ethics & Field Pilot Protocol 📄🇰🇪

> **Institution:** Open University of Kenya (OUK) · Directorate of Research & Postgraduate Studies  
> **Degree Program:** Master of Science in Learning Design and Technology  
> **Target Body:** National Commission for Science, Technology and Innovation (NACOSTI)  
> **Target Examination:** KNEC KCSE Chemistry Paper 3 (233/3) Practical  
> **Project Title:** *Evaluating the Pedagogical Efficacy and Usability of an Offline-First Virtual Chemistry Laboratory Platform (VirtuLab Kenya) Among Secondary School Learners in Kenya*

---

## 1. Research Protocol Overview

### 1.1 Principal Investigator & Supervisory Team
- **Principal Investigator:** Candidate Name (OUK MSc Candidate in Learning Design & Technology)
- **Affiliated Institution:** Open University of Kenya, School of Education & Technology
- **Study Duration:** 8-Week Quasi-Experimental Field Intervention

### 1.2 Purpose of the Study
This study investigates the impact of **VirtuLab Kenya**—a zero-marginal-cost, curriculum-aligned, offline-first virtual chemistry laboratory—on secondary school learners' conceptual and procedural competencies in KCSE Chemistry Paper 3 (Practical Examination).

---

## 2. Research Design & Sampling Framework

### 2.1 Quasi-Experimental Convergent Mixed-Methods Design
- **Experimental Group ($E$, $n \approx 300$):** Receives blended instruction utilizing VirtuLab Kenya for pre-lab preparation, interactive titration and qualitative practical exercises, and homework assignments.
- **Control Group ($C$, $n \approx 300$):** Receives traditional classroom demonstration/lecture instruction without digital simulation access.

### 2.2 Stratified Cluster Sampling Matrix (10 Pilot Schools)

| Stratum | School Category | Participating Schools | Target Sample Size ($n$) | Baseline Lab Infrastructure |
|:---|:---|:---:|:---:|:---|
| **Stratum 1** | National / Extra-County | 2 Schools | $\approx 120$ Learners | High (Fully equipped physical laboratories) |
| **Stratum 2** | County Secondary | 3 Schools | $\approx 180$ Learners | Moderate (Equipped labs, limited chemical reagents) |
| **Stratum 3** | Sub-County Day | 5 Schools | $\approx 300$ Learners | Low / None (No functional science laboratory) |
| **Total** | | **10 Schools** | **$\approx 600$ Learners + 20 Educators** | |

---

## 3. Data Collection Instruments & Metrics

1. **Chemistry Practical Competency Achievement Test (CPCAT):**
   - 40-Mark standardized pre-test and post-test assessing:
     - Volumetric Titration & Stoichiometry (14 Marks)
     - Qualitative Inorganic Analysis & Deductions (10 Marks)
     - Reaction Rates & Chemical Energetics Calculations (10 Marks)
     - Qualitative Organic Chemistry & GHS Hazard Identification (6 Marks)
2. **System Usability Scale (SUS):**
   - 10-Item standardized international usability metric (Brooke, 1996) yielding a benchmark score from 0–100.
3. **Technology Acceptance Model (TAM 3) Questionnaire:**
   - 5-Point Likert scale evaluating Perceived Usefulness (PU), Perceived Ease of Use (PEOU), Facilitating Conditions (FC), and Behavioral Intention (BI).
4. **Server-Side Objective Telemetry:**
   - Quantitative database logs capturing titration trials per student, concordancy percentage ($\le 0.10 \text{ cm}^3$), indicator selection errors, and time-on-task.

---

## 4. Ethical Considerations & Kenya Data Protection Compliance

In strict compliance with the **Kenya Data Protection Act (2019)** and NACOSTI ethical guidelines:

1. **Institutional Consent:** Headteacher and Ministry of Education County Director approval secured prior to school entry.
2. **Parental Consent & Minor Assent:** Written informed consent forms provided to parents/guardians; written assent provided to participating minor students (under 18).
3. **Voluntary Participation:** Students and teachers may withdraw at any time without academic penalty or loss of privileges.
4. **Data Anonymization:** Student identities are masked using random alphanumeric identifiers (`STU-XXXX`).
5. **Data Security:** All records stored on encrypted PostgreSQL databases with access restricted to the principal investigator.

---

## 5. Statistical Triangulation Framework

- **Learning Gain:** Hake's Average Normalized Gain ($g$):
  $$g = \frac{\% \text{Posttest} - \% \text{Pretest}}{100\% - \% \text{Pretest}}$$
- **Hypothesis Testing:** Paired sample $t$-tests and Analysis of Covariance (ANCOVA) controlling for pre-test baseline scores.
- **Effect Size:** Cohen's $d = \frac{\bar{x}_1 - \bar{x}_2}{s_{\text{pooled}}}$.
- **Scale Reliability:** Cronbach's Alpha ($\alpha \ge 0.80$).

---

*VirtuLab Kenya · Open University of Kenya · Master of Science in Learning Design and Technology*
