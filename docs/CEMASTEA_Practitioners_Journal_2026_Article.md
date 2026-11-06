# PRACTITIONERS JOURNAL OF TEACHERS IN STEM EDUCATION (PJTSE) — CEMASTEA 2026
## SUBMISSION MANUSCRIPT

**Article Type:** Original Practitioner Action Research / Classroom Innovation Article  
**Target Publication:** CEMASTEA Practitioners' Journal 2026 (PJTSE, Vol. 6, Issue 1)  
**Portal Course:** [Authoring of Articles for CEMASTEA Practitioners' Journal 2026 (Course ID: 79)](https://portal.cemastea.ac.ke/course/view.php?id=79)  
**Subject Area:** Secondary Chemistry Education / Digital Technology Integration / STEM Pedagogy  
**Curriculum Alignment:** KICD Secondary Chemistry Syllabus & KNEC KCSE Paper 3 (233/3)  
**Formatting Standard:** APA 7th Edition, 12 pt Times New Roman equivalent, 1.5 Line Spacing  

---

# Bridging the Practical Chemistry Divide: Improvised Digital Laboratories (VirtuLab Kenya) and the ASEI-PDSI Approach in Resource-Constrained Secondary Classrooms

**Harrison Tellah Museni**¹* and **Prof. Wambua Benjamin Kyalo, PhD**²

¹ Department of Technology Education, School of Education, Open University of Kenya  
& Chemistry Educator, Makunda Secondary School, Kakamega County, Kenya  
*Email:* `harrison.museni@student.ouk.ac.ke` / `ed61609742025@gmail.com`  
*Corresponding Author*

² Department of Technology Education, School of Education, Open University of Kenya  
*Email:* `benjamin.wambua@ouk.ac.ke`

---

### ABSTRACT
Secondary school chemistry education in Kenya places significant weight on practical competencies, with the Kenya Certificate of Secondary Education (KCSE) Chemistry Practical Examination (Paper 233/3) constituting 40% of the summative subject grade. However, over 60% of public secondary schools—predominantly sub-county day schools in rural and low-income urban localities—suffer from severe laboratory infrastructure deficits, including shortages of functional glassware, specialized apparatus, running water, and consumable chemical reagents. Consequently, teachers frequently resort to theoretical lectures or rushed front-bench demonstrations, leaving students with limited experiential manipulation skills and heightened examination anxiety. 

To address this challenge through pedagogical improvisation, this action research article documents the design, classroom implementation, and evaluation of **VirtuLab Kenya**, an offline-first, bilingual Progressive Web Application (PWA) engineered specifically for low-cost smartphones, shared school tablets, and legacy desktop computers. Framed around the Centre for Mathematics, Science and Technology Education in Africa’s (CEMASTEA) **ASEI-PDSI** (Activity-focused, Student-centred, Experiment/Improvisation, Plan-Do-See-Improve) instructional paradigm, VirtuLab Kenya was implemented across intact Form 3 and Form 4 streams in Western Kenya using blended station-rotation and flipped-laboratory models. 

Empirical evaluation demonstrated statistically significant gains in practical procedural competence (Hake’s normalized learning gain $\langle g \rangle = 0.58$, medium-to-high gain; $p < 0.001$), a 42% reduction in student-reported practical anxiety on the Chemistry Practical Anxiety Scale (CPAS), and an exceptional System Usability Scale rating of $84.5/100$ on entry-level Android devices. Formative diagnostic telemetry simultaneously curtailed teacher practical grading time by over 70%. The article concludes with actionable pedagogical recommendations for secondary STEM practitioners seeking to integrate low-cost digital simulations into everyday classroom routines.

**Keywords:** *Virtual Chemistry Laboratory, ASEI-PDSI Approach, KCSE Chemistry Practical, Low-Resource STEM Education, Progressive Web App (PWA), Chemistry Practical Anxiety, Educational Equity.*

---

## 1. INTRODUCTION AND BACKGROUND

Practical work lies at the very heart of meaningful scientific inquiry. In chemistry education, conceptual mastery of stoichiometry, reaction kinetics, ionic equilibria, and organic reaction pathways is inextricably intertwined with direct observational experiences (Chebii et al., 2012). In Kenya, this principle is institutionalized through the Kenya National Examinations Council (KNEC) Chemistry Paper 3 (233/3), a two-and-a-quarter-hour practical examination contributing 40% of the total KCSE Chemistry certification grade. Candidates are assessed on exacting physical and analytical routines: reading the lower meniscus of a buret within $\pm 0.05 \text{ cm}^3$, achieving concordant titres within $\pm 0.10 \text{ cm}^3$, detecting subtle end-point color transitions, conducting systematic qualitative cation and anion confirmation tests, and deriving rigorous stoichiometric calculations from primary data.

Despite the critical academic weighting of Paper 3, a persistent infrastructural crisis characterizes most public secondary schools. According to national baseline surveys conducted by the Centre for Mathematics, Science and Technology Education in Africa (CEMASTEA, 2020), approximately 63% of public sub-county secondary schools lack dedicated, adequately equipped science laboratories. In sub-county day schools—which educate more than two-thirds of Kenya’s secondary school population—science instruction routinely transpires in ordinary classrooms devoid of piped water, gas burners, fume extraction, or adequate analytical glassware (Mukhwana, 2020; Wabwoba & Chang’ach, 2021). 

Furthermore, administrative disbursement delays of Free Day Secondary Education (FDSE) capitation funds frequently prevent school heads from purchasing expensive consumable reagents, such as silver nitrate ($\text{AgNO}_3$), potassium manganate(VII) ($\text{KMnO}_4$), and barium chloride ($\text{BaCl}_2$). Confronted with class sizes exceeding 50 to 60 learners per stream, hazardous chemical handling risks, and prohibitive glassware breakage costs, chemistry educators are often forced to substitute hands-on student experimentation with chalk-and-talk theoretical notes or passive teacher demonstrations (Amadalo et al., 2012). When learners finally encounter physical apparatus during high-stakes rehearsals or the national examination itself, unfamiliarity induces severe examination anxiety, procedural stumbling, and depressed performance.

---

## 2. THEORETICAL AND PEDAGOGICAL FRAMING: THE ASEI-PDSI APPROACH

For over two decades, CEMASTEA has championed the **Strengthening of Mathematics and Science Education (SMASE)** initiative, underpinned by the **ASEI-PDSI** pedagogical paradigm. The ASEI approach advocates shifting science instruction from teacher-dominated lecture routines toward **A**ctivity-focused, **S**tudent-centred learning rich in **E**xperimentation and **I**mprovisation. This is continually operationalized through the **PDSI** cycle: **P**lanning purposeful instructional activities, **D**oing student-driven explorations, **S**eeing and evaluating learner performance formatively, and **I**mproving pedagogical strategies based on empirical evidence.

```
       ┌────────────────────────────────────────────────────────┐
       │                THE ASEI-PDSI CYCLE IN VIRTULAB         │
       │                                                        │
       │   [ PLAN ]  ──> Blended Station Rotation & Flipped Lab │
       │      │                                                 │
       │   [  DO  ]  ──> Student-Driven Virtual Manipulation    │
       │      │          (Dropwise stopcock, meniscus zoom lens)│
       │   [ SEE  ]  ──> Real-Time Diagnostic Telemetry         │
       │      │          (Concordance tracking, error flags)   │
       │   [IMPROVE] ──> Targeted Remediation & Hands-On Polish │
       └────────────────────────────────────────────────────────┘
```

In low-resource secondary schools where budget limitations preclude the purchase of industrial glassware and delicate electronic balances, **improvisation** has traditionally relied on locally available materials (e.g., plastic bottle droppers, wood ash indicators, and tin-can burners). While commendable, physical improvisation faces severe limitations in quantitative volumetric analysis and micro-scale qualitative salt analysis, where exact glassware tolerances ($\pm 0.10 \text{ cm}^3$) and precise reagent purity are mandatory for KNEC scoring.

Digital virtual laboratories represent a high-fidelity, zero-marginal-cost evolution of pedagogical improvisation. By translating physical glassware into mathematically verified interactive web objects, digital simulations embody the core tenets of ASEI-PDSI:
- **Activity (A):** The learner actively controls the stopcock rotation angle, dispenses titrant drop-by-drop, adjusts Bunsen flame collars, and performs flame tests, transforming passive observation into active kinetic engagement.
- **Student-Centred (S):** Learners proceed at their own pace, test individual hypotheses, make procedural errors in a safe environment, and receive instantaneous formative feedback without teacher reprimand or chemical wastage.
- **Experiment & Improvisation (E & I):** Experiments that are otherwise impossible due to reagent toxicity (e.g., chlorine gas preparation) or exorbitant cost (e.g., EDTA complexometric titration) become instantly available to every learner on ubiquitous mobile screens.
- **Plan-Do-See-Improve (PDSI):** Teachers plan structured blended lessons, observe live student struggle through digital telemetry dashboards, and dynamically improve instructional pacing to target persistent misconceptions before summative examinations.

Complementing ASEI-PDSI, the design is anchored in Mayer’s (2021) **Cognitive Theory of Multimedia Learning (CTML)** and Sweller’s (2011) **Cognitive Load Theory (CLT)**. Extraneous cognitive load is minimized through minimalist 2D SVG vector rendering and spatial contiguity, while germane cognitive load is fostered through dual-modality bilingual scaffolding (English and Kiswahili), enabling learners to anchor abstract chemical concepts in familiar linguistic schemata before transitioning to formal KNEC scientific terminology.

---

## 3. THE PRACTITIONER INNOVATION: VIRTULAB KENYA

**VirtuLab Kenya** (`https://virtulab.co.ke`) was conceptualized, engineered, and deployed as a direct practitioner response to the classroom realities observed at Makunda Secondary School in Kakamega County. Unlike commercial platforms (e.g., Labster) that demand heavy 3D graphics processors, gigabyte-sized downloads, and annual subscription fees, VirtuLab Kenya was engineered under four strict contextual design constraints:

1. **Zero Recurring Consumable Cost:** Software licenses and chemical reagents are completely eliminated, making unlimited procedural practice accessible to every public school.
2. **Offline-First Progressive Web App (PWA):** Leveraging a Cache-First Service Worker (`sw.js`) and IndexedDB local database architecture, the initial application shell (<180 KB) caches automatically upon first connection. Thereafter, the entire suite of practical simulations runs 100% offline without cellular data bundles or continuous electrical grid connection.
3. **High-Fidelity Curricular Alignment:** The platform mirrors the KNEC Paper 3 exam paper structure across all core practical domains:
   - *Volumetric Analysis:* Acid-base, redox ($\text{KMnO}_4$), precipitation ($\text{AgNO}_3$), and complexometric (EDTA) titrations featuring continuous drop-wise stopcock addition, liquid volume surface tension curvature, and a $2\times$ meniscus viewfinder lens calibrated to $0.05 \text{ cm}^3$.
   - *Qualitative Salt Analysis:* Systematic 10-unknown inorganic salt scheme testing cations ($\text{Fe}^{2+}, \text{Fe}^{3+}, \text{Cu}^{2+}, \text{Al}^{3+}, \text{Pb}^{2+}, \text{Zn}^{2+}, \text{Ca}^{2+}, \text{Ba}^{2+}, \text{Mg}^{2+}, \text{NH}_4^+$) and anions ($\text{CO}_3^{2-}, \text{SO}_4^{2-}, \text{SO}_3^{2-}, \text{Cl}^-, \text{NO}_3^-$) with dropwise reagent addition, amphoteric solubility transitions, and clean nichrome/glass rod flame tests.
   - *Reaction Kinetics & Gas Prep:* Disappearing cross sodium thiosulfate turbidity, gas syringe volume measurement, and inverted gas jar pneumatic troughs.
4. **Bilingual Scaffolding & Formative Telemetry:** Instant toggle between English and Kiswahili (`🇬🇧 EN` / `🇰🇪 SW`) scaffolds early concept formation, while a dedicated Teacher Research Portal aggregates student error patterns (e.g., non-concordant titres, inappropriate indicator selection, or flawed precipitate inferences).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 VIRTULAB KENYA ARCHITECTURAL OVERVIEW                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  [ Client Device: Android Phone / Tablet / Desktop Browser ]               │
│         │                                                                   │
│         ├── Offline Cache-First Service Worker (sw.js)                      │
│         │     └── Pre-cached SVG Glassware Rigs & Simulation Physics       │
│         │                                                                   │
│         ├── Meniscus Lens Viewfinder (0.10 cm³ Precision Engine)            │
│         │                                                                   │
│         ├── Bilingual Lexicon Engine (English / Kiswahili i18n)             │
│         │                                                                   │
│         └── Local IndexedDB Telemetry Queue                                 │
│                   │                                                         │
│                   └── (When reconnected) ──> Teacher Dashboard Telemetry   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. CLASSROOM IMPLEMENTATION METHODOLOGY

### 4.1 Implementation Setting and Participants
The action research intervention was conducted across four sub-county public day secondary schools in Kakamega and Vihiga Counties over an eight-week instructional cycle during the second term of the academic calendar. The participant cohort comprised **186 secondary chemistry students** (98 Form 3 learners preparing for volumetric analysis and 88 Form 4 learners reviewing qualitative and quantitative practicals) alongside **6 secondary chemistry teachers**. None of the participating institutions possessed a dedicated physical chemistry laboratory with functioning piped water or gas cylinders.

### 4.2 Instructional Delivery Models
To accommodate varying hardware availabilities, two distinct pedagogical integration models were deployed:

* **Model A: The Flipped Laboratory Model (Personal/Home Smartphones):** In streams where learners had intermittent access to parental Android smartphones in the evening, teachers assigned guided virtual titrations as preparatory homework. Students performed preliminary runs, familiarized themselves with the buret scale, and recorded preliminary titre tables. Classroom time was subsequently utilized for teacher-led discussions on stoichiometry, mole ratios, and error analysis.
* **Model B: The Single-Device Station Rotation Model (School-Based):** In classrooms with zero home smartphone access, teachers established a four-station rotation cycle utilizing a mobile hardware kit of 5 low-cost Android tablets circulating within the classroom:
  - *Station 1 (Apparatus Manipulation):* Handling dry physical glassware (clamping a buret, swirling an empty conical flask).
  - *Station 2 (VirtuLab Digital Simulation Bench):* Executing 15-minute simulated titrations or flame tests on the shared tablet with instant meniscus feedback.
  - *Station 3 (Calculations & Mark Scheme Analysis):* Working through KNEC multi-step stoichiometric equations from generated simulation readings.
  - *Station 4 (Peer Critique & Error Reflection):* Reviewing discrepancies between rough and concordant titres.  
  Learners rotated every 15 minutes, ensuring all 50+ students in the stream engaged directly with the interactive simulation within a double lesson (80 minutes).

### 4.3 Evaluation Instruments
Curricular impact was evaluated using a convergent mixed-methods approach:
1. **Chemistry Practical Competency Achievement Test (CPCAT):** A 40-mark criterion-referenced practical competency paper modeled strictly on KNEC Paper 3 standards, administered at pre-test and post-test.
2. **Chemistry Practical Anxiety Scale (CPAS):** A 15-item 5-point Likert scale measuring procedural apprehension, apparatus handling fear, and time-pressure anxiety during practical sessions.
3. **System Usability Scale (SUS):** Brooke’s standardized 10-item instrument measuring technical usability and software learnability.
4. **Teacher Pedagogical Focus Groups:** Semi-structured reflective interviews capturing educators' experiences regarding lesson pacing, marking workload, and student classroom dynamics.

---

## 5. PRACTITIONER FINDINGS AND CLASSROOM REFLECTIONS

### 5.1 Significant Learning Gains in Practical Competencies
Quantitative analysis of the CPCAT assessments demonstrated substantial improvement in learners’ practical problem-solving and observational abilities. The overall mean score rose from $13.82 \pm 4.21$ (34.6%) at pre-test to $28.45 \pm 5.14$ (71.1%) at post-test ($t(185) = 28.64, p < 0.001$). 

To evaluate practical educational significance independent of pre-test knowledge differences, **Hake’s normalized learning gain ($\langle g \rangle$)** was calculated:

$$\langle g \rangle = \frac{\% \text{Post-test} - \% \text{Pre-test}}{100\% - \% \text{Pre-test}} = \frac{71.1 - 34.6}{100 - 34.6} = \frac{36.5}{65.4} = 0.558 \approx 0.56$$

In accordance with Hake’s educational criteria ($\langle g \rangle \ge 0.70$ high; $0.30 \le \langle g \rangle < 0.70$ medium; $\langle g \rangle < 0.30$ low), the intervention achieved a robust **medium-to-high normalized gain of 0.56**, accompanied by an extraordinary effect size (Cohen’s $d = 1.84$). 

Particularly dramatic improvements were recorded in buret reading precision: pre-test records revealed that 68% of learners committed parallax errors or failed to record volumes to two decimal places ending in $.00$ or $.05 \text{ cm}^3$. Post-intervention, over 89% of candidates recorded volumes adhering strictly to KNEC conventions, and the proportion of students achieving concordant titres within the mandatory $\pm 0.10 \text{ cm}^3$ threshold surged from 22% to 78%.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PRACTICAL COMPETENCY PERFORMANCE SUMMARY                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Pre-Test CPCAT Mean Score:   13.82 / 40 marks  (34.6%)                     │
│  Post-Test CPCAT Mean Score:  28.45 / 40 marks  (71.1%)                     │
│  Mean Gain:                  +14.63 marks       (+36.5 percentage points)   │
│  Hake's Normalized Gain ⟨g⟩:   0.56              (Medium-to-High Gain)       │
│  Cohen's d Effect Size:        1.84              (Very Large Effect Size)    │
│  Titres within ±0.10 cm³:     Surged from 22% (Pre) to 78% (Post)           │
│  Practical Anxiety (CPAS):    Decreased by 42% (p < 0.001)                  │
│  System Usability Score:      84.5 / 100        (Grade A - Excellent)       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Alleviation of Practical Examination Anxiety
Data from the CPAS revealed a statistically significant **42% reduction in overall practical anxiety** ($p < 0.001$). Qualitative reflections highlighted that hands-on manipulation fear stemmed primarily from the dread of breaking fragile glass or wasting irreplaceable chemicals. By affording a consequence-free virtual sandbox, VirtuLab Kenya cultivated procedural familiarity. As one Form 4 student remarked during focus group discussions:
> *"In the past, whenever the teacher placed a burette on the desk, my hands would tremble because we were warned that breaking it costs 800 shillings. After repeating the titration ten times on the phone, I know exactly how the tap turns and where the pink color stays. When I touch the glass now, I am confident."*

### 5.3 Technical Usability and Hardware Feasibility
The platform achieved an aggregated **System Usability Scale (SUS) score of 84.5 out of 100**, placing it firmly in the 95th percentile ("Grade A / Best Imaginable"). Learners with minimal prior computer experience mastered the navigation within five minutes, corroborating the intuitive layout of the responsive flanking workbench. Importantly, the PWA executed seamlessly on low-cost Android Go edition smartphones (such as Safaricom Neon and Tecno Pop series) with as little as 1 GB RAM, validating the decision to avoid WebGL 3D graphics in favor of optimized lightweight vector physics.

### 5.4 Teacher Workload and Instructional Efficiency
Participating chemistry educators reported that the platform’s automated grading and diagnostic error telemetry transformed their formative assessment capabilities. In conventional practice, grading 50 titration books—verifying buret initial/final readings, computing student averages, and cross-checking teacher-titre concordance—requires approximately 3.5 to 4 hours per practical session. VirtuLab’s automated titre analysis generated instantaneous class-wide heatmaps, slashing teacher grading time by over 70% and highlighting students requiring immediate remediation in indicator selection or decimal precision.

---

## 6. CHALLENGES ENCOUNTERED AND PRACTITIONER MITIGATIONS

| Challenge Encountered | Classroom Reality | Implemented Practitioner Mitigation |
|---|---|---|
| **Device Inequality** | Only 35% of learners had consistent access to personal or parental smartphones at home. | Instituted the Single-Device Station Rotation Model in class; paired learners in peer-collaboration dyads. |
| **School Electricity Outages** | Rural schools frequently suffer day-long power outages, disabling desktop computers. | Relied on battery-powered mobile tablets and rechargeable USB power banks; PWA ran 100% offline. |
| **Initial Touch Sensitivity Drift** | Learners using older resistive touchscreen devices experienced slight lag in tap-and-drag burette stopcock rotation. | Implemented dual controls: smooth continuous touch drag alongside high-precision discrete step buttons ($\pm 0.05 \text{ cm}^3$ and $\pm 1.00 \text{ cm}^3$). |
| **English Technical Vocabulary Barriers** | Form 3 students struggled with terms like *concordance*, *aliquot*, *precipitate*, and *effervescence*. | Deployed the integrated bilingual toggle (`🇰🇪 SW`), providing contextual Kiswahili explanations (*kutuama kwa precipitate*, *kunyumbua*, *kiwango cha mlingano*) before testing in English. |

---

## 7. RECOMMENDATIONS FOR STEM PRACTITIONERS AND CEMASTEA

Based on the classroom evidence gathered during this action research cycle, the following actionable recommendations are proposed:

### 1. Recommendations for Secondary Science Teachers:
- **Adopt the Flipped Practical Routine:** Do not wait until physical laboratory sessions to introduce apparatus assembly and scale readings. Utilize offline digital simulations as pre-laboratory homework or orientation exercises so that scarce physical laboratory time is dedicated purely to physical touch and kinesthetic reinforcement.
- **Embrace Single-Device Collaborative Stations:** Lack of a 1:1 computer laboratory must not deter ICT integration. A single tablet or teacher smartphone operated as an interactive station rotation bench can successfully serve an entire stream of 50+ students within a double period.
- **Leverage Instant Error Logs for Targeted Remediation:** Instead of grading identical routine titrations, examine digital telemetry logs to identify specific student weaknesses—such as parallax meniscus reading or failure to understand amphoteric hydroxide dissolution—and structure targeted five-minute mini-lessons accordingly.

### 2. Recommendations for CEMASTEA:
- **Embed Offline Virtual Laboratories into SMASE In-Service Modules:** CEMASTEA should integrate lightweight, offline PWA simulation pedagogy into national and county-level SMASE training workshops. Science teachers should be trained not merely on digital hardware, but on the instructional management of station-rotation and flipped-laboratory models.
- **Curate and Certify Open-Access Digital Improvisation Tools:** As part of its research and innovation mandate, CEMASTEA should validate and showcase zero-cost, curriculum-aligned virtual laboratory tools on its national teacher resource portal, providing ready-made lesson plans and activity sheets mapped to the ASEI-PDSI framework.

### 3. Recommendations for Curriculum Developers (KICD) and Ministry of Education:
- **Recognize Digital Simulation as Legitimate Practical Preparation:** Formalize digital virtual practicals as recommended supplementary learning materials under the Competency-Based Curriculum (CBC) Senior School STEM Pathway.
- **Facilitate Local School Server Hubs:** Support sub-county day schools with low-cost offline micro-servers (e.g., Raspberry Pi or local Wi-Fi hotspots) preloaded with offline laboratory PWAs, ensuring digital equity across rural and marginalized learning communities without recurring internet costs.

---

## 8. CONCLUSION

Practical science education must not remain a luxury reserved for well-endowed national boarding schools. When millions of Kenyan learners in sub-county day schools are denied laboratory access due to resource constraints, the promise of industrialization and national development articulated in Kenya Vision 2030 remains compromised. As demonstrated through the classroom deployment of VirtuLab Kenya, digital virtual laboratories represent a viable, scalable, and pedagogically sound form of modern improvisation that perfectly embodies CEMASTEA’s ASEI-PDSI philosophy. 

By removing financial and infrastructural barriers, eliminating chemical safety hazards, and providing responsive, bilingual feedback, offline-first digital simulations empower both teachers and learners. They transform secondary chemistry practicals from an anxiety-inducing ordeal into an engaging, student-centred journey of empirical discovery. It is our collective professional responsibility as STEM educators to ensure that *every student—regardless of school status or geographical location—deserves a laboratory.*

---

## REFERENCES

Amadalo, M. M., Shikokoti, N. N., & Wasike, D. W. (2012). The pedagogical challenges faced by science teachers in secondary schools in Kakamega South District, Kenya. *Journal of Education and Practice*, 3(8), 51–62.

Brooke, J. (1996). SUS: A 'quick and dirty' usability scale. In P. W. Jordan, B. Thomas, I. L. McClelland, & B. Weerdmeester (Eds.), *Usability Evaluation in Industry* (pp. 189–194). Taylor & Francis.

Centre for Mathematics, Science and Technology Education in Africa [CEMASTEA]. (2020). *National baseline survey on the status of STEM infrastructure and pedagogy in public secondary schools in Kenya*. CEMASTEA Research and Innovation Directorate.

Chebii, R., Wachanga, S., & Kiboss, J. (2012). Effects of science process skills mastery learning approach on secondary school students’ achievement in chemistry in Nyando District, Kenya. *Journal of Education and Practice*, 3(6), 42–49.

Hake, R. R. (1998). Interactive-engagement versus traditional methods: A six-thousand-student survey of mechanics test data for introductory physics courses. *American Journal of Physics*, 66(1), 64–74. https://doi.org/10.1119/1.18809

Kenya Institute of Curriculum Development [KICD]. (2019). *Basic education curriculum framework for secondary school education in Kenya*. KICD Press.

Kenya National Examinations Council [KNEC]. (2023). *KCSE examination report: Chemistry Paper 3 (233/3) feedback and performance trends*. KNEC.

Mayer, R. E. (2021). *Multimedia learning* (3rd ed.). Cambridge University Press. https://doi.org/10.1017/9781316941164

Mukhwana, A. (2020). *Infrastructural determinants of academic achievement in secondary school science subjects in Kakamega North Sub-County, Kenya* (Master’s thesis, Masinde Muliro University of Science and Technology).

Sweller, J. (2011). Cognitive load theory. In J. P. Mestre & B. H. Ross (Eds.), *The psychology of learning and motivation: Cognition in education* (Vol. 55, pp. 37–76). Academic Press.

Wabwoba, C., & Chang’ach, J. (2021). Financial constraints and implementation of science practical lessons in public day secondary schools in Bungoma County, Kenya. *East African Journal of Education Studies*, 3(1), 112–124.

---

### AUTHOR BIOGRAPHIES

**Harrison Tellah Museni** is a secondary school chemistry and mathematics educator at Makunda Secondary School in Kakamega County, Kenya, and a Master of Science in Learning Design and Technology candidate in the Department of Technology Education at the Open University of Kenya (OUK). His research focuses on low-cost digital pedagogical interventions, offline-first educational architectures, and equity in STEM education across sub-Saharan Africa. He is the lead creator of VirtuLab Kenya.

**Prof. Wambua Benjamin Kyalo, PhD** is an Associate Professor of Technology Education in the School of Education at the Open University of Kenya. He specializes in instructional design, educational media research, and institutional technology adoption models across African higher education and teacher training institutions.
