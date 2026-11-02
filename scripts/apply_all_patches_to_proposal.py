# -*- coding: utf-8 -*-
"""
Sync Script: Applies Master Patches (V11) to docs/PROJECT_PROPOSAL.md
"""

import os
import sys
import json
import re

def main():
    with open('docs/PROJECT_PROPOSAL_V10_BACKUP.md', 'r', encoding='utf-8') as f:
        content = f.read()

    print(f"Loaded backup. Original length: {len(content)} characters.")

    # 1. Update Title
    old_title = "# VIRTULAB KENYA: DESIGN, DEVELOPMENT AND EVALUATION OF A WEB-BASED VIRTUAL CHEMISTRY LABORATORY FOR KCSE AND CBE LEARNERS IN KENYAN SECONDARY SCHOOLS"
    new_title = "# VIRTULAB KENYA: AN OFFLINE-FIRST VIRTUAL CHEMISTRY LABORATORY PROGRESSIVE WEB APPLICATION FOR ENHANCING PRACTICAL COMPETENCIES AMONG KCSE AND CBC/CBE LEARNERS IN RESOURCE-CONSTRAINED SECONDARY SCHOOLS"
    assert old_title in content, "Error: old_title not found"
    content = content.replace(old_title, new_title, 1)

    # 2. Update Table of Contents dynamic field note
    old_toc_note = "*(Note: In the compiled Word document `VirtuLab_Kenya_Capstone_Proposal_V10.docx`, the Table of Contents is generated dynamically using Microsoft Word field codes with embedded hyperlinks. Right-click and select 'Update Field' to refresh page numbers, or Ctrl+Click on any entry to jump directly to that section).*"
    new_toc_note = "*(Note: In the compiled Word document `VirtuLab_Kenya_Capstone_Proposal_V11_Resolved.docx`, the Table of Contents is generated dynamically using Microsoft Word field codes with embedded hyperlinks. Right-click and select 'Update Field' to refresh page numbers, or Ctrl+Click on any entry to jump directly to that section).*"
    if old_toc_note in content:
        content = content.replace(old_toc_note, new_toc_note, 1)

    # 3. Abbreviations and Acronyms Harmonization
    old_abbr_start = "## ABBREVIATIONS AND ACRONYMS"
    old_abbr_end = "## OPERATIONAL DEFINITION OF TERMS"
    new_abbr_block = """## ABBREVIATIONS AND ACRONYMS
**ADDIE** — Analyse, Design, Develop, Implement, Evaluate  
**ANCOVA** — Analysis of Covariance  
**BI** — Behavioural Intention  
**CBA** — Competency-Based Assessment  
**CBC** — Competency-Based Curriculum  
**CBE** — Competency-Based Education  
**CEMASTEA** — Centre for Mathematics, Science and Technology Education in Africa  
**CLT** — Cognitive Load Theory  
**CPAS** — Chemistry Practical Anxiety Scale  
**CPCAT** — Chemistry Practical Competency Achievement Test  
**CRSE** — Cluster-Robust Standard Errors  
**CTML** — Cognitive Theory of Multimedia Learning  
**FC** — Facilitating Conditions  
**FDSE** — Free Day Secondary Education  
**IBSE** — Inquiry-Based Science Education  
**ICC** — Intraclass Correlation Coefficient  
**KCSE** — Kenya Certificate of Secondary Education  
**KICD** — Kenya Institute of Curriculum Development  
**KNEC** — Kenya National Examinations Council  
**LMM** — Linear Mixed-Effects Model  
**NACOSTI** — National Commission for Science, Technology and Innovation  
**NESSP** — National Education Sector Strategic Plan  
**NG-CDF** — National Government Constituencies Development Fund  
**OUK** — Open University of Kenya  
**PEC** — Perceptions of External Control (TAM 3)  
**PEOU** — Perceived Ease of Use  
**PU** — Perceived Usefulness  
**PWA** — Progressive Web App  
**SMASE** — Strengthening of Mathematics and Science Education  
**STEM** — Science, Technology, Engineering and Mathematics  
**SUS** — System Usability Scale  
**TAM** — Technology Acceptance Model (TAM 3)  
**UTAUT** — Unified Theory of Acceptance and Use of Technology  
**ZPD** — Zone of Proximal Development  

---

"""
    # Replace abbreviation section
    pattern = re.compile(r"## ABBREVIATIONS AND ACRONYMS\s*.*?## OPERATIONAL DEFINITION OF TERMS", re.DOTALL)
    content = pattern.sub(lambda m: new_abbr_block + "## OPERATIONAL DEFINITION OF TERMS", content)

    # 4. Front-Matter Operational Definition of Terms cross-reference
    old_op_def_pattern = re.compile(r"## OPERATIONAL DEFINITION OF TERMS\s*.*?## ABSTRACT", re.DOTALL)
    new_op_def_block = """## OPERATIONAL DEFINITION OF TERMS

*(Operational definitions of key constructs, statistical indices, and software architectures are consolidated and comprehensively articulated in Section 1.15 at the conclusion of Chapter One in accordance with Open University of Kenya postgraduate dissertation guidelines).*

---

## ABSTRACT"""
    content = old_op_def_pattern.sub(lambda m: new_op_def_block, content)

    # 5. Abstract enhancement
    old_abstract_p3 = "Key technical and pedagogical features include complete offline functionality via Service Worker caching, dual-language scaffolding in English and Kiswahili, immediate diagnostic feedback on meniscus alignment and concordant titre calculations (within ±0.10 cm³), and a teacher telemetry dashboard that identifies systematic student error patterns in real time."
    new_abstract_p3 = "Key technical and pedagogical features include complete offline execution via a Cache-First Service Worker architecture (<250 ms warm launch; initial application shell <180 KB), dual-language conceptual scaffolding in English and Kiswahili with automated KNEC English-only exam-mode enforcement, immediate diagnostic feedback on meniscus alignment and concordant titre calculations (within ±0.10 cm³), and an offline multi-tenant client session architecture with a teacher diagnostic error-telemetry dashboard."
    content = content.replace(old_abstract_p3, new_abstract_p3, 1)

    old_abstract_p4 = "This proposal establishes the empirical justification for the intervention, articulates its theoretical foundation in Mayer's Cognitive Theory of Multimedia Learning, Bybee's 5E Instructional Model, and Venkatesh and Bala's Technology Acceptance Model, and outlines a convergent parallel mixed-methods quasi-experimental evaluation across ten stratified secondary schools involving approximately 600 students and 20 chemistry teachers. The 10-week field study incorporates an intensive six-week active intervention cycle flanked by baseline and post-intervention evaluations utilizing the Chemistry Practical Competency Achievement Test (CPCAT) and the Chemistry Practical Anxiety Scale (CPAS). The investigation evaluates whether curriculum-aligned, offline virtual laboratory practice produces statistically significant learning gains, reduces practical examination anxiety, and provides teachers with actionable diagnostic insights without imposing recurring institutional operational costs."
    new_abstract_p4 = "This proposal establishes the empirical justification for the intervention, articulates its theoretical foundation in Mayer's Cognitive Theory of Multimedia Learning, Sweller's Cognitive Load Theory, Bybee's 5E Instructional Model, and Venkatesh and Bala's Technology Acceptance Model (TAM 3 / UTAUT), and outlines a convergent parallel mixed-methods quasi-experimental evaluation across ten stratified secondary schools involving approximately 600 Form 3 and Form 4 learners and 20 chemistry teachers. To control for hierarchical clustering within intact classroom streams (Intraclass Correlation Coefficient, ICC > 0), educational effectiveness is evaluated using a Two-Level Linear Mixed-Effects Model (LMM / Multilevel ANCOVA) alongside Hake's normalized gain (targeting $\\langle g \\rangle \\ge 0.40$), while practical examination anxiety reduction is evaluated via the Chemistry Practical Anxiety Scale (CPAS). Implementation feasibility is benchmarked via Brooke's System Usability Scale (SUS $\\ge 78$) and TAM 3 adoption constructs across resource tiers supported by a circulating 25-tablet mobile hardware kit, establishing an empirically validated deployment framework for KICD, CEMASTEA, and the Ministry of Education."
    content = content.replace(old_abstract_p4, new_abstract_p4, 1)

    # 6. Section 1.7.2 (Specific Objectives) and 1.8 (Research Questions) Alignment
    old_obj_block = """#### 1.7.2 Specific Objectives
1. To design and develop VirtuLab Kenya as a lightweight, offline-first Progressive Web Application tailored to the resource constraints of Kenyan secondary schools.
2. To embed pedagogical scaffolding within the simulation modules, including dual English/Kiswahili instructional modes, automated meniscus alignment feedback, and concordant titre scoring adhering to KNEC marking rubrics.
3. To develop an automated teacher telemetry dashboard that logs student procedural interaction patterns and flags systematic calculation and observational errors in real time.
4. To empirically evaluate the educational effectiveness, interface usability, affective anxiety reduction, and technological acceptance of VirtuLab Kenya across stratified secondary school resource tiers over a 10-week field study.
5. To formulate evidence-based policy recommendations and a deployment framework for institutional adoption by KICD, CEMASTEA, and the Ministry of Education."""

    new_obj_block = """#### 1.7.2 Specific Objectives
1. **Architectural Engineering Objective:** To design and engineer VirtuLab Kenya as an ultralight (<3.5 MB), zero-dependency vanilla JavaScript and HTML5 Canvas Progressive Web Application operating under a Cache-First Service Worker architecture with an offline multi-tenant client session model tailored for shared mobile devices in Kenyan secondary schools.
2. **Rubric & Pedagogical Scaffolding Objective:** To embed interactive pedagogical scaffolds within the simulation engine—operationalizing Bybee’s 5E Instructional Model, a real-time English/Kiswahili conceptual toggle, and automated KNEC Paper 3 marking verification (enforcing ±0.10 cm³ concordant titre calculations and qualitative deduction trees).
3. **Cognitive Practical Achievement Objective:** To evaluate the effect of VirtuLab Kenya on student cognitive practical chemistry achievement on the 40-mark Chemistry Practical Competency Achievement Test (CPCAT) across stratified school tiers (National, County, and Sub-County), utilizing a Two-Level Linear Mixed-Effects Model (LMM) to account for classroom clustering.
4. **Affective Anxiety Reduction & Usability Objective:** To determine the extent to which scaffolded virtual laboratory practice alleviates practical examination anxiety measured on the Chemistry Practical Anxiety Scale (CPAS), and evaluate software ergonomics against the System Usability Scale (SUS) benchmark (SUS ≥ 78).
5. **Teacher Diagnostic Telemetry Objective:** To engineer and validate an automated background teacher telemetry dashboard that tracks procedural error progression in real time and assesses its predictive diagnostic utility in remediating specific student misconceptions.
6. **Policy & Institutional Framework Objective:** To formulate an evidence-based policy brief, cost model, and deployment framework for scalable adoption by the Kenya Institute of Curriculum Development (KICD), CEMASTEA, and the Ministry of Education within the Competency-Based Curriculum (CBC) Senior Secondary STEM pathway."""
    content = content.replace(old_obj_block, new_obj_block, 1)

    old_rq_block = """### 1.8 Research Questions
1. To what extent does the architectural design of VirtuLab Kenya fulfill the technical requirements for low-bandwidth, offline execution on basic mobile hardware in resource-constrained schools?
2. How accurately does the automated concordance engine evaluate student titration tables against KNEC KCSE Chemistry Paper 3 marking standards?
3. What are Kenyan chemistry teachers' and students' perceptions regarding the Perceived Usefulness, Perceived Ease of Use, Facilitating Conditions, and Behavioural Intention to adopt VirtuLab Kenya, as measured by TAM 3 and the System Usability Scale?
4. How effectively do automated telemetry error logs enable teachers to identify and remediate specific student misconceptions and alleviate practical examination anxiety in real time?"""

    new_rq_block = """### 1.8 Research Questions
1. **Technical & Offline Feasibility:** To what extent does the offline-first Progressive Web Application architecture of VirtuLab Kenya achieve sub-250 millisecond warm-cache load times and reliable multi-tenant session isolation on shared low-specification Android devices without active internet connectivity?
2. **Rubric Scoring Precision:** How accurately and reliably does the simulation engine score candidate titration tables, concordant averaging (within ±0.10 cm³), and qualitative inorganic deduction strings compared to manual evaluation by certified KNEC national examiners?
3. **Cognitive Learning Gain:** What is the effect of VirtuLab Kenya on Form 3 and Form 4 learners' practical chemistry cognitive achievement on the CPCAT across National, County, and Sub-County school strata, after controlling for baseline pre-test competency and classroom-level clustering?
4. **Affective Anxiety Reduction & Usability:** To what extent does structured virtual laboratory engagement reduce learners' situational chemistry practical anxiety on the CPAS, and how do learners and educators rate the platform's ergonomic usability on Brooke's System Usability Scale (SUS)?
5. **Diagnostic Telemetry Utility:** How accurately do automated student procedural error logs captured by the telemetry dashboard predict item-level deductions on summative practical tests, and how effectively do teachers utilize these analytics for targeted classroom remediation?
6. **User Technology Acceptance:** What are Kenyan secondary school chemistry teachers' and students' perceptions regarding the Perceived Usefulness (PU), Perceived Ease of Use (PEOU), Facilitating Conditions / External Control (PEC), and Behavioural Intention (BI) to adopt VirtuLab Kenya under the Technology Acceptance Model (TAM 3)?"""
    content = content.replace(old_rq_block, new_rq_block, 1)

    # 7. Section 1.9 (Research Hypotheses) Decoupled
    old_hyp_block = """### 1.9 Research Hypotheses
To evaluate the educational impact of the platform, the study tests two formal hypotheses. The null hypothesis (H0) states that there is no statistically significant difference in KCSE Chemistry Paper 3 post-test scores between learners utilizing VirtuLab Kenya and learners instructed through conventional classroom methods without physical laboratory access, evaluated at the 0.05 level of significance. The alternative hypothesis (H1) posits that learners utilizing VirtuLab Kenya will demonstrate a statistically significant gain in post-test scores and practical competency compared to the control group, achieving an average normalised learning gain of g greater than or equal to 0.40 at the 0.05 level of significance."""

    new_hyp_block = """### 1.9 Research Hypotheses
To evaluate the educational efficacy and affective impact of VirtuLab Kenya, the study formulates three distinct hypothesis sets, separating inferential between-group comparisons from descriptive normalized gain benchmarks:

#### 1. Cognitive Achievement Hypotheses (CPCAT Post-Test Means)
* **$H_{01}$ (Null Hypothesis):** There is no statistically significant difference in adjusted post-test KCSE Chemistry Paper 3 achievement scores on the Chemistry Practical Competency Achievement Test (CPCAT) between learners instructed through VirtuLab Kenya and learners instructed through conventional classroom methods, controlling for baseline pre-test scores and classroom cluster nesting ($p \\ge 0.05$).
* **$H_{A1}$ (Alternative Hypothesis):** Learners instructed through VirtuLab Kenya achieve statistically significantly higher adjusted post-test KCSE Chemistry Paper 3 achievement scores on the CPCAT than learners instructed through conventional classroom methods, controlling for baseline pre-test scores and classroom cluster nesting ($p < 0.05$).

#### 2. Descriptive Normalised Learning Gain Benchmark
* **Project Achievement Criterion:** Independent of the relative between-group inferential test, the experimental cohort utilizing VirtuLab Kenya will achieve an average cohort normalised learning gain of $\\langle g \\rangle \\ge 0.40$ (satisfying Hake’s criterion for medium-to-high practical conceptual mastery).

#### 3. Affective Practical Anxiety Hypotheses (CPAS Post-Intervention Means)
* **$H_{02}$ (Null Hypothesis):** There is no statistically significant difference in adjusted post-intervention practical anxiety scores on the Chemistry Practical Anxiety Scale (CPAS) between learners utilizing VirtuLab Kenya and learners instructed through conventional classroom methods, controlling for baseline anxiety levels ($p \\ge 0.05$).
* **$H_{A2}$ (Alternative Hypothesis):** Learners utilizing VirtuLab Kenya demonstrate statistically significantly lower adjusted post-intervention practical anxiety scores on the CPAS compared to learners instructed through conventional classroom methods, controlling for baseline anxiety levels ($p < 0.05$)."""
    content = content.replace(old_hyp_block, new_hyp_block, 1)

    # 8. Section 1.11 (Scope) Geographic Justification
    old_scope_block = """### 1.11 Scope of the Capstone Project
This capstone focuses on Form 3 and Form 4 practical chemistry topics tested in KCSE Chemistry Paper 3 (Subject Code 233/3). The software encompasses seven laboratory modules: volumetric analysis (acid-base, redox, back-titrations, and water of crystallisation determinations), qualitative inorganic analysis, reaction rates, thermochemistry, solubility curves, organic qualitative tests, and a timed composite mock practical. The field pilot will take place in ten secondary schools across Nairobi, Machakos, and Kiambu counties, involving approximately 600 students and 20 chemistry teachers across National, County, and Sub-County schools over a 10-week field evaluation period."""

    new_scope_block = """### 1.11 Scope of the Capstone Project
This capstone focuses on Form 3 and Form 4 practical chemistry topics tested in KCSE Chemistry Paper 3 (Subject Code 233/3), while establishing transferable competencies aligned with KICD Grades 10–12 Senior School Chemistry Curriculum Designs (Pure Science STEM pathway). The software encompasses eight laboratory modules: volumetric analysis (acid-base neutralisation, back-titrations, redox titrations, and water of crystallisation determinations), qualitative inorganic analysis, reaction rates, thermochemistry, solubility curves, organic qualitative tests, and a timed composite mock practical.

The field pilot will take place in ten secondary schools across Nairobi, Kiambu, and Machakos counties, involving approximately 600 students and 20 chemistry teachers across National, County, and Sub-County schools over a 10-week field evaluation period. While baseline literature documents acute laboratory infrastructure deficits across Western Kenya and the Lake Region (e.g., Kakamega, Bungoma, and Kisumu counties), the selection of Nairobi, Kiambu, and Machakos counties for the 10-week quasi-experimental field pilot is grounded in three methodological and logistical criteria:

1. **Ecological Representation of Target Deficits:** Although Nairobi, Kiambu, and Machakos encompass major urban centers, their peri-urban and informal settlement sub-county day schools exhibit severe reagent shortages, absence of running water/gas piping, and high student-to-teacher ratios (50–65 students per stream) indistinguishable from rural sub-county schools. This ensures authentic ecological validity without compromising demographic generalizability.
2. **Field Visit Frequency and Tablet Logistics:** The quasi-experimental protocol demands bi-weekly site visits to inspect tablet hardware, deliver battery packs, audit teacher fidelity logs, and execute local offline database synchronization. Restricting the pilot radius to these three contiguous counties ensures high experimental fidelity, reliable observation schedules, and manageable researcher transit times.
3. **Curricular Stratification Feasibility:** The Nairobi-Kiambu-Machakos corridor offers established, accessible representations of all three educational strata: well-equipped national boarding institutions (Stratum 1), partially equipped county day/boarding schools (Stratum 2), and completely unequipped sub-county day schools (Stratum 3), permitting rigorous multi-tier comparison within a unified geographic cluster."""
    content = content.replace(old_scope_block, new_scope_block, 1)

    # 9. Section 1.13 (Limitations) Instructional Time Protocol
    old_lim_block = """### 1.13 Limitations
While the software operates offline, initial installation and data synchronization require periodic connectivity. In schools lacking internet access, installation must be performed manually via USB or local wireless hotspots. Furthermore, the quasi-experimental design cannot completely eliminate differences in teacher instructional capability across participating schools. The study addresses this by using pre-test scores as covariates in the ANCOVA model to statistically adjust for baseline academic differences."""

    new_lim_block = """### 1.13 Limitations
While the software operates offline, initial installation and data synchronization require periodic connectivity. In schools lacking internet access, installation is managed via pre-provisioned PWA caching on circulating mobile tablet kits. Furthermore, quasi-experimental designs in intact classrooms face potential threats from teacher quality variations and unequal instructional exposure.

To mitigate the threat of instructional time confounding (where learning gains in educational technology trials are driven by unequal time-on-task rather than software efficacy):
1. **Classroom Instructional Time:** Both experimental and control cohorts will receive exactly 160 minutes of weekly chemistry instruction (four 40-minute periods or two double periods) over the six-week active intervention phase, covering identical KICD syllabus strands.
2. **Homework and Out-of-Class Tasks:** To control for the experimental group’s voluntary digital homework practice, control teachers will assign structured paper-based calculation and qualitative deduction problem sets designed to require approximately 60 minutes of weekly out-of-class study.
3. **Fidelity Logs:** Teachers in both cohorts will maintain weekly instructional fidelity logs recording lesson start/end times, topics covered, and student attendance, ensuring that observed differential gains are attributable to VirtuLab Kenya's interactive scaffolds rather than disparate instructional exposure.
4. **Multilevel Statistical Adjustment:** Baseline academic differences and unobserved teacher effects are formally modeled using a Two-Level Linear Mixed-Effects Model (LMM) with baseline pre-test covariates and classroom-level random intercepts."""
    content = content.replace(old_lim_block, new_lim_block, 1)

    # 10. Section 1.15 (Definition of Key Terms) Consolidated
    old_def_terms_block = """### 1.15 Definition of Key Terms
VirtuLab Kenya refers to an offline-first, bilingual virtual chemistry laboratory Progressive Web Application developed to simulate KCSE Chemistry Paper 3 practicals for Kenyan secondary students. Concordant Titres refers to titre readings that agree within plus or minus 0.10 cubic centimetres (±0.10 cm³) of each other, meeting KNEC guidelines for full accuracy marks. Chemistry Practical Competency Achievement Test refers to the 40-mark criterion-referenced test designed to measure practical understanding and calculation ability before and after using the software. Chemistry Practical Anxiety Scale refers to a 10-item instrument measuring affective procedural nervousness and practical exam anxiety. Normalised Learning Gain refers to Richard Hake’s formula measuring how much a student improved relative to the total possible improvement from pre-test to post-test. System Usability Scale refers to John Brooke’s ten-question usability tool that gives a software quality score from 0 to 100. Technology Acceptance Model refers to the theoretical model measuring whether users find a technology useful, easy to use, and whether they intend to keep using it."""

    new_def_terms_block = r"""### 1.15 Operational Definition of Key Terms

* **VirtuLab Kenya:** An ultralight (<3.5 MB), zero-dependency vanilla JavaScript and HTML5 Canvas Progressive Web Application (PWA) operating under a Cache-First Service Worker architecture, engineered to provide offline, bilingual (English/Kiswahili) simulation of KCSE Chemistry Paper 3 practicals with automated rubric evaluation and teacher diagnostic telemetry.
* **Concordant Titres:** In Kenya National Examinations Council (KNEC) KCSE Chemistry Paper 3 (233/3) volumetric evaluation, titre readings that fall within plus or minus 0.10 cubic centimetres (±0.10 cm³) of one another, representing the required analytical precision threshold for candidates to earn maximum accuracy and averaging marks.
* **Chemistry Practical Competency Achievement Test (CPCAT):** A 40-mark criterion-referenced pre-test and post-test assessment instrument validated by KICD curriculum developers and KNEC examiners to measure student procedural apparatus knowledge, meniscus reading accuracy, volumetric calculation proficiency, and qualitative inorganic deduction logic.
* **Chemistry Practical Anxiety Scale (CPAS):** A 20-item psychometric survey instrument adapted from Spielberger's State-Trait Anxiety Inventory (STAI) and science laboratory anxiety frameworks, measuring situational examination stress, fear of reagent spills/glassware breakage, and procedural self-efficacy on a 5-point Likert scale.
* **Average Normalised Learning Gain ($\langle g \rangle$):** Richard Hake's (1998) metric quantifying the proportion of maximum possible conceptual improvement achieved by a student or cohort from pre-test to post-test, calculated as:
  $$\langle g \rangle = \frac{\% \\text{Post} - \% \\text{Pre}}{100 - \% \\text{Pre}}$$
  where cohort gains $\\langle g \\rangle \\ge 0.40$ satisfy the benchmark for medium-to-high practical conceptual mastery.
* **KCSE Chemistry Paper 3 (233/3):** The compulsory national summative practical examination administered by KNEC, evaluating quantitative volumetric titration, thermochemical kinetics, and qualitative inorganic analysis, contributing 40 percent of the candidate's final secondary chemistry subject grade.
* **System Usability Scale (SUS):** A standardized, 10-item Likert-scale instrument developed by John Brooke (1996) yielding a composite ergonomics and usability score from 0 to 100, where scores $\\ge 78$ represent "Good-to-Excellent" usability and low cognitive friction on mobile touchscreens.
* **Technology Acceptance Model 3 (TAM 3):** Venkatesh and Bala's (2008) theoretical framework synthesizing Perceived Usefulness (PU), Perceived Ease of Use (PEOU), Perceptions of External Control (PEC / Facilitating Conditions), and Subjective Norms to predict teacher and student Behavioural Intention (BI) to adopt digital innovations in resource-constrained schools."""
    content = content.replace(old_def_terms_block, new_def_terms_block, 1)

    # 11. Section 2.2.3 Academic tone improvement
    old_phrase = "using very small files, and matching national examination rubrics"
    new_phrase = "maintaining compact application bundle sizes, and matching national examination rubrics"
    content = content.replace(old_phrase, new_phrase, 1)

    # 12. Section 2.3.1 (Pedagogical Architecture & Bybee's 5E Model)
    old_231_block = """#### 2.3.1 Constructivism and Inquiry-Based Science Education
VirtuLab Kenya is grounded in Piagetian constructivist learning theory (Piaget, 1973), which posits that cognitive structures develop through active, physical interaction with the learning environment rather than passive absorption of verbal information. Within the simulation engine, learners actively manipulate physical variables—such as stopcock flow rates, reagent concentrations, and solution temperatures—and directly observe resulting chemical phenomena, including indicator transitions, gas evolution, and precipitate formation.

To support learners across progressive stages of mastery, the platform operationalises Vygotsky’s (1978) Zone of Proximal Development through two distinct operational modes. In Guided Mode, Form 3 learners receive real-time pedagogical scaffolds, including on-screen prompts, magnified meniscus indicators, and cautionary colour flashes prior to end-point overshoot. In Exam Mode, these scaffolds are fully withdrawn. Learners conduct practicals independently under timed conditions, experiencing the realistic procedural demands of KCSE Paper 3."""

    new_231_block = """#### 2.3.1 Pedagogical Architecture: Constructivism and Bybee's 5E Instructional Model
VirtuLab Kenya is grounded in Piagetian constructivist learning theory (Piaget, 1973) and Vygotsky's (1978) Zone of Proximal Development (ZPD). Constructivism posits that conceptual understanding develops through active manipulation of physical variables rather than passive absorption of verbal information. Within the simulation engine, learners actively manipulate physical variables—such as stopcock flow rates, reagent concentrations, and solution temperatures—and directly observe resulting chemical phenomena, including indicator transitions, gas evolution, and precipitate formation.

To translate constructivist principles into structured classroom practice, VirtuLab Kenya operationalizes Bybee’s (2009) 5E Instructional Model (*Engage, Explore, Explain, Elaborate, Evaluate*) across its five-tab interface and dual operational modes:

1. **Engage:** Each simulation module initiates in *Guided Mode* with an interactive, contextual inquiry prompt linking the chemical reaction to everyday Kenyan phenomena (e.g., soil acidity in agricultural liming or antacid neutralization).
2. **Explore:** Learners freely manipulate the virtual apparatus on the HTML5 Canvas workbench—adjusting burette stopcocks dropwise, adding indicators, or swirling conical flasks—to observe primary empirical responses.
3. **Explain:** Dynamic visual and bilingual callouts unpack observed phenomena in real time, explaining colour shifts, ionic precipitations, and gas evolutions with integrated sub-microscopic particle animations.
4. **Elaborate:** Learners transfer procedural observations into structured KNEC Paper 3 data tables, executing stoichiometric calculations, concordant titre derivations, and ionic deduction strings.
5. **Evaluate:** Learners transition into *Exam Mode*—a timed, unscaffolded evaluation replicating KNEC Paper 3 conditions—where the automated simulation engine scores table formatting, concordance accuracy (within ±0.10 cm³), and qualitative deductions against national marking schemes, feeding real-time error telemetry to the teacher dashboard."""
    content = content.replace(old_231_block, new_231_block, 1)

    # 13. Section 2.3.3 (TAM 3 and UTAUT Theoretical Synthesis)
    old_233_block = """#### 2.3.3 Technology Acceptance Model (TAM 3)
To investigate the determinants of technology adoption among teachers and students, this research applies the Technology Acceptance Model (TAM 3) formulated by Venkatesh and Bala (2008), extending Davis (1989). TAM 3 posits that technology usage behaviour is governed by Behavioural Intention, which is determined by two foundational constructs: Perceived Usefulness (the belief that using the platform enhances academic performance) and Perceived Ease of Use (the perception that interaction with the system is effortless). In resource-constrained educational settings, TAM 3 is particularly valuable because it explicitly accounts for Facilitating Conditions, including device availability and offline access, which dictate whether a digital innovation achieves sustainable institutional adoption."""

    new_233_block = """#### 2.3.3 User Adoption Framework: TAM 3 and UTAUT Theoretical Synthesis
To examine teacher and learner adoption dynamics in resource-constrained schools, the study synthesizes Venkatesh and Bala’s (2008) Technology Acceptance Model 3 (TAM 3) with Venkatesh et al.’s (2003) Unified Theory of Acceptance and Use of Technology (UTAUT). TAM 3 posits that technology usage behaviour is governed by Behavioural Intention (BI), which is determined by two foundational cognitive constructs: Perceived Usefulness (PU) and Perceived Ease of Use (PEOU).

In resource-constrained secondary education, however, individual cognitive perceptions alone cannot guarantee sustained technology adoption without addressing environmental and infrastructural barriers. TAM 3 explicitly incorporates *Perceptions of External Control (PEC)*—conceptually equivalent to UTAUT’s *Facilitating Conditions (FC)*—which captures organizational support, offline platform accessibility, and hardware availability. Furthermore, the model incorporates *Objective Usability*, quantified independently via John Brooke’s (1996) System Usability Scale (SUS). By integrating PEC/FC and SUS alongside PU and PEOU, the research framework captures both subjective pedagogical attitudes and objective infrastructural feasibility in predicting long-term classroom institutionalization."""
    content = content.replace(old_233_block, new_233_block, 1)

    # 14. Section 2.3.4 & Table 2.1 (Reclassified Conceptual Framework Matrix)
    old_table21_pattern = re.compile(r"#### 2\.3\.4 Conceptual Framework\s*.*?Table 2\.1: Conceptual Framework Matrix of Variables\s*.*?### 2\.4 Review of Existing Practices", re.DOTALL)
    new_table21_block = """#### 2.3.4 Conceptual Framework
The conceptual framework connects the platform’s architectural features to learning, anxiety reduction, and adoption outcomes through TAM constructs, with institutional school tiers serving as moderating variables, as synthesized in Table 2.1. Crucially, while TAM 3 adoption constructs (PU, PEOU, PEC, BI), SUS scores, and telemetry interaction logs are evaluated descriptively and correlationally within the experimental cohort as implementation outcomes, the primary causal evaluation of cognitive achievement (CPCAT) and anxiety reduction (CPAS) is tested inferentially across both experimental and control cohorts.

#### Table 2.1: Conceptual Framework Matrix of Study Variables

| Category | Variable Name | Operational Definition & Indicators | Measurement Instrument & Source | Role in Statistical Model |
| :--- | :--- | :--- | :--- | :--- |
| **Independent Variable (IV)** | Instructional Method | 1. Experimental: VirtuLab Kenya PWA (Guided & Exam Modes, Bilingual Scaffolding, Automated KNEC Checking)<br>2. Control: Conventional Instruction (Blackboard/Textbook/Demonstration/Business-as-usual Wet Labs) | Cohort assignment records; platform session telemetry logs | Primary between-group factor in LMM ($0 = \\text{Control}, 1 = \\text{Exp}$) |
| **Primary Dependent Variable (DV1)** | Cognitive Practical Achievement | Student mastery of practical chemistry competencies: meniscus reading, table tabulation, concordant averaging, stoichiometry, and qualitative inference | 40-mark Chemistry Practical Competency Achievement Test (CPCAT Pre- & Post-Test) | Continuous outcome variable in Two-Level Linear Mixed-Effects Model (LMM) |
| **Secondary Dependent Variable (DV2)** | Practical Examination Anxiety | Level of situational apprehension and procedural anxiety experienced regarding KCSE Paper 3 practicals | 20-item Chemistry Practical Anxiety Scale (CPAS Pre- & Post-Survey; 1–5 Likert) | Continuous outcome variable in Between-Group ANCOVA |
| **Implementation Outcomes (Post-Exp Only)** | Usability & Technology Acceptance | 1. Software usability and interface friction benchmark<br>2. Perceived Usefulness (PU), Ease of Use (PEOU), External Control (PEC), and Intention (BI) | 1. System Usability Scale (SUS; Score $\\ge 78$ benchmark)<br>2. TAM 3 Survey (5-point Likert scale; Mean $\\ge 4.0$ benchmark) | Descriptive adoption evaluation; within-treatment correlational analysis with telemetry logs |
| **Moderating Variables (Stratification)** | Institutional School Tier | Institutional resource profile: National/Extra-County (equipped), County (partially-equipped), Sub-County Day (unequipped) | Ministry of Education official school classification | Stratification factor; $\\text{Treatment} \\times \\text{Stratum}$ interaction term in LMM |
| **Covariates / Control Variables** | Baseline Cognitive Competency | Prior academic achievement in chemistry practical concepts | CPCAT Pre-Test baseline score | Continuous baseline covariate in LMM ($p < 0.05$) |
| | Baseline Practical Anxiety | Prior affective anxiety regarding chemistry laboratory exams | CPAS Pre-Test baseline score | Continuous baseline covariate in ANCOVA ($p < 0.05$) |

### 2.4 Review of Existing Practices"""
    content = old_table21_pattern.sub(lambda m: new_table21_block, content)

    # 15. Section 2.4 & 2.5 & Table 2.2 (Expanded Benchmarking Matrix)
    old_bench_pattern = re.compile(r"### 2\.5 Benchmarking and Comparative Analysis\s*.*?Table 2\.2: Benchmarking of Virtual Laboratory Platforms\s*.*?### 2\.6 Research and Project Methodology", re.DOTALL)
    new_bench_block = """### 2.5 Benchmarking and Comparative Analysis
While international platforms have advanced digital science pedagogy, existing solutions fail to resolve the tripartite challenge facing under-resourced Kenyan secondary schools: offline-first mobile execution (<3.5 MB), automated KNEC Paper 3 exam-rule verification, and bilingual scaffolding. 

Crucially, national initiatives—most notably the CEMASTEA Virtual Labs Platform (`virtuallabs.cemastea.ac.ke`) developed under the Ministry of Education—have established digital STEM simulation portals for Kenyan schools. However, CEMASTEA Virtual Labs operates primarily as an online, desktop-centric web portal requiring broadband connectivity for interactive execution, lacking automated enforcement of KNEC ±0.10 cm³ concordance marking rules and mobile-optimized touch controls for 1 GB RAM devices. Similarly, India's Amrita OLabs (Nedungadi et al., 2013) and Malawi's MiLab (Ndebvu et al., 2024) demonstrate the power of curriculum-aligned practical simulations in the Global South, but are tied to foreign curricula and lack localized Kenyan KCSE scoring rubrics and bilingual Kiswahili scaffolding. Table 2.2 provides a systematic benchmarking of VirtuLab Kenya against existing international, domestic, and regional solutions.

#### Table 2.2: Systematic Benchmarking of VirtuLab Kenya Against Existing Platforms

| Dimension | PhET Interactive Simulations | Labster | ChemCollective | CEMASTEA Virtual Labs | Amrita OLabs (India) | VirtuLab Kenya (Proposed) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Origin & Context** | University of Colorado Boulder (USA) | Commercial EdTech (Denmark/USA) | Carnegie Mellon University (USA) | Ministry of Education / CEMASTEA (Kenya) | Amrita University / CDAC (India) | Open University of Kenya / Localized |
| **Curricular Alignment** | US NGSS / Generic Conceptual STEM | Tertiary & AP University Level | US College / High School Chemistry | Kenyan KICD Secondary Chemistry Curriculum | Indian CBSE / State Board Syllabi | 100% KNEC KCSE Paper 3 (233/3) & KICD Senior School Pure Sciences |
| **Automated Rubric Verification** | None (Free open-ended exploration) | Branching game-based multiple choice | Automated molarity/stoichiometry checks | Formative self-check quiz questions | Summative procedural multiple choice | Strict KNEC scoring: ±0.10 cm³ concordant averaging & qualitative deduction trees |
| **Offline & Low-RAM Architecture** | HTML5 Canvas/SVG; downloadable ZIPs; no PWA sync | Heavy 3D WebGL; 4 GB+ RAM required | Java legacy & Web; desktop offline packages | Online web portal; requires continuous internet | Online web portal; regional CDAC installer | Lightweight PWA (<3.5 MB); offline Cache-First Service Worker; runs on 1 GB RAM |
| **Bilingual Language Scaffolding** | Localized Swahili portal; static translated pages | English, Spanish, French, German | English and select foreign translations | English only | English and Indian regional languages | Real-time English / Kiswahili toggle in Guided Mode; strictly English Exam Mode |
| **Teacher Telemetry Dashboard** | None (Third-party LMS embed) | Commercial LMS gradebook integration | None | Administrative portal; no procedural logs | Teacher monitoring portal | Integrated error telemetry logging systematic student misconceptions in real time |
| **Access & Licensing Model** | Free / Open Educational Resource (OER) | Expensive per-student annual subscription | Free desktop software | Free government educational resource | Free government-supported educational portal | Zero-marginal-cost open PWA; free institutional adoption |

### 2.6 Research and Project Methodology"""
    content = old_bench_pattern.sub(lambda m: new_bench_block, content)

    # 16. Section 2.6.1.1 (Tier-Specific Instructional Protocols & Stratum Interaction)
    old_261_block = """#### 2.6.1 Research Design
This study employs a convergent parallel mixed-methods quasi-experimental design. Because secondary students are nested within intact school streams, individual random assignment is infeasible without disrupting academic schedules. The design utilizes non-equivalent pre-test post-test control groups.

The Experimental Group will utilize VirtuLab Kenya during scheduled double periods and through self-directed practice on school tablets or personal mobile devices. The Control Group will cover identical curriculum content using conventional textbooks and teacher blackboard demonstrations without virtual simulation support."""

    new_261_block = """#### 2.6.1 Research Design
This study employs a convergent parallel mixed-methods quasi-experimental design. Because secondary students are nested within intact school streams, individual random assignment is infeasible without disrupting academic schedules. The design utilizes non-equivalent pre-test post-test control groups with within-school stream-level assignment where feasible (utilizing credential-controlled student access tokens to prevent digital spillover) and whole-school cluster assignment across resource strata.

##### 2.6.1.1 Tier-Specific Instructional Protocols
To prevent internal validity confounding and uphold ethical research standards across diverse institutional strata, the counterfactual control condition is explicitly defined by school tier:
1. **Stratum 1 (National/Extra-County Schools):** Control cohorts execute their routine hands-on physical wet-chemistry practicals ("business-as-usual"). The Experimental cohort supplements routine physical wet labs with VirtuLab Kenya as a pre-laboratory preparation workbench and homework simulation tool.
2. **Stratum 2 (County Schools):** Control cohorts utilize partial physical laboratories where students observe group demonstrations or share limited glassware. The Experimental cohort supplements partial wet practicals with VirtuLab Kenya sessions on school tablets and home mobile devices.
3. **Stratum 3 (Sub-County Day Schools):** Control cohorts receive conventional instruction (chalkboard diagrams, textbook reading, and front-desk dry demonstrations without consumable reagents). The Experimental cohort conducts individual and paired virtual practicals using VirtuLab Kenya powered by the circulating 25-tablet mobile pilot kit.

By incorporating a $\\text{Treatment} \\times \\text{Stratum}$ interaction term into the Linear Mixed-Effects Model (LMM), the statistical analysis directly isolates the differential treatment effect across well-equipped versus unequipped school strata, verifying whether the software narrows the historical equity gap between Sub-County and National schools."""
    content = content.replace(old_261_block, new_261_block, 1)

    # 17. Section 2.6.3 & 2.6.5 (Psychometric Validation & Scope of CPCAT)
    old_263_block = """#### 2.6.3 Data Collection Instruments
The evaluation utilizes five primary instruments:
First, the Chemistry Practical Competency Achievement Test (CPCAT), a 40-mark criterion-referenced test designed to assess apparatus manipulation knowledge, meniscus reading precision, stoichiometric calculation accuracy, and qualitative inference deduction.
Second, the Chemistry Practical Anxiety Scale (CPAS), a 10-item Likert-scale instrument adapted from Spielberger’s State-Trait Anxiety Inventory and science anxiety subscales.
Third, the System Usability Scale (SUS), a ten-item standardized instrument administered to experimental learners to benchmark usability.
Fourth, the TAM 3 Survey, assessing Perceived Usefulness, Perceived Ease of Use, and Facilitating Conditions on a 5-point Likert scale.
Fifth, Automated Server Telemetry Logs, capturing interaction timestamps, trial counts, error frequencies, and concordant titres."""

    new_263_block = """#### 2.6.3 Data Collection Instruments
The evaluation utilizes five primary instruments:
1. **Chemistry Practical Competency Achievement Test (CPCAT):** A 40-mark criterion-referenced pre-test and post-test assessment instrument validated by KICD curriculum developers and KNEC examiners to measure student procedural apparatus knowledge, meniscus reading accuracy, volumetric calculation proficiency, and qualitative inorganic deduction logic. The written paper-and-pencil CPCAT evaluates cognitive-procedural knowledge and analytical deduction routines; criterion validity regarding tactile stopcock flow control is evaluated via a physical rubric sub-check in Stratum 1.
2. **Chemistry Practical Anxiety Scale (CPAS):** A 20-item psychometric survey instrument adapted from Spielberger’s (1983) State-Trait Anxiety Inventory (STAI) and chemistry laboratory anxiety frameworks, measuring situational examination stress, fear of apparatus breakage, and procedural nervousness on a 5-point Likert scale (administered to both cohorts pre- and post-intervention).
3. **System Usability Scale (SUS):** A standardized, 10-item Likert-scale instrument developed by John Brooke (1996) administered exclusively to the experimental cohort at Week 10 to establish an international usability benchmark (targeting SUS ≥ 78).
4. **Technology Acceptance Model 3 (TAM 3) Survey:** A 5-point Likert scale instrument assessing Perceived Usefulness (PU), Perceived Ease of Use (PEOU), Perceptions of External Control (PEC / Facilitating Conditions), and Behavioural Intention (BI), administered to both experimental teachers ($n = 20$) and experimental students at Week 10.
5. **Automated Server Telemetry Logs:** Background diagnostic event logs capturing user interaction timestamps, trial frequencies, meniscus alignment error margins, and concordant titre deviations, recorded locally in `IndexedDB` and batch-synchronized upon network reconnection."""
    content = content.replace(old_263_block, new_263_block, 1)

    old_265_block = """#### 2.6.5 Reliability and Trustworthiness
Internal consistency of the quantitative instruments (SUS, TAM 3, and CPAS) will be established prior to full field deployment, targeting a Cronbach's alpha of 0.80 or higher."""

    new_265_block = """#### 2.6.5 Reliability and Trustworthiness
Internal consistency and psychometric reliability across quantitative evaluation instruments will be rigorously established prior to full field deployment:
* **CPCAT Achievement Test Reliability:** Prior to field deployment, the 40-mark CPCAT instrument will be piloted with 80 Form 4 chemistry students in two non-participating secondary schools. Internal consistency will be computed using the Kuder-Richardson Formula 20 (KR-20) for dichotomous items and Cronbach's alpha for multi-step calculation items, targeting $\\alpha \\ge 0.82$. Test-retest reliability across a two-week interval will target Pearson $r \\ge 0.80$.
* **Inter-Rater Scoring Reliability:** Open-ended qualitative deduction scripts and stoichiometric calculation workings on the paper-based CPCAT will be blind-scored by two independent certified KNEC national examiners utilizing a standardized marking scheme, targeting an inter-rater concordance correlation of $r \\ge 0.88$.
* **Survey Psychometric Reliability:** The adapted CPAS, TAM 3, and SUS survey instruments will be piloted with 40 non-study students and 10 chemistry teachers, targeting Cronbach's $\\alpha \\ge 0.80$ across all construct subscales."""
    content = content.replace(old_265_block, new_265_block, 1)

    # 18. Section 2.6.7 (Data Analysis Techniques & LMM Formulation)
    old_267_block = """#### 2.6.7 Data Analysis Techniques
Quantitative data will be analyzed using descriptive and inferential statistics. Baseline equivalence between groups will be tested using independent-samples t-tests on pre-test scores. The primary hypothesis will be evaluated using Analysis of Covariance (ANCOVA), with pre-test CPCAT scores serving as the covariate and post-test scores as the dependent variable.

Normalised learning gain will be calculated using Richard Hake’s formula:
$$g = \\frac{\\text{Post-test \\%} - \\text{Pre-test \\%}}{100\\% - \\text{Pre-test \\%}}$$
Gains will be classified into low (g < 0.30), medium (0.30 ≤ g < 0.70), and high (g ≥ 0.70) practical mastery."""

    new_267_block = """#### 2.6.7 Data Analysis Techniques
Quantitative data will be analyzed using a combination of multilevel inferential modeling and descriptive psychometric indices. Because learners are nested within intact school streams ($K = 20$) across 10 schools ($J = 10$), observations within clusters exhibit positive intra-cluster correlation (ICC > 0). Conducting a standard single-level ANCOVA violates the assumption of observation independence and artificially inflates Type I error rates.

To provide an unassailable statistical evaluation that accounts for hierarchical clustering, the primary cognitive outcome will be evaluated using a **Two-Level Linear Mixed-Effects Model (LMM / Multilevel ANCOVA)** with student observations ($i$) nested within school/classroom clusters ($j$):

$$\\text{PostCPCAT}_{ij} = \\beta_0 + \\beta_1(\\text{PreCPCAT}_{ij}) + \\beta_2(\\text{Treatment}_j) + \\beta_3(\\text{Stratum}_j) + \\beta_4(\\text{Treatment}_j \\times \\text{Stratum}_j) + u_j + \\epsilon_{ij}$$

Where:
* $\\text{PostCPCAT}_{ij}$: Post-test achievement score for student $i$ in classroom/school cluster $j$.
* $\\text{PreCPCAT}_{ij}$: Baseline covariate adjusting for prior chemistry competency.
* $\\text{Treatment}_j$: Fixed between-group factor ($1 = \\text{VirtuLab Kenya Experimental}, 0 = \\text{Conventional Control}$).
* $\\text{Stratum}_j$: Institutional tier fixed effect ($1 = \\text{National}, 2 = \\text{County}, 3 = \\text{Sub-County}$).
* $\\beta_4$: Treatment $\\times$ Stratum interaction coefficient, testing whether simulation efficacy differs by institutional resource tier.
* $u_j \\sim \\mathcal{N}(0, \\sigma_u^2)$: Random intercept representing cluster-level variance across schools/classrooms.
* $\\epsilon_{ij} \\sim \\mathcal{N}(0, \\sigma_e^2)$: Individual student residual variance.

In addition to the LMM, the researcher will estimate standard ANCOVA models with **Cluster-Robust Standard Errors (CRSE)** at the school level to cross-validate parameter stability.

Average normalised learning gain will be calculated at the cohort level using Richard Hake’s (1998) standardized formula:
$$\\langle g \\rangle = \\frac{\\langle \\text{Post-test \\%} \\rangle - \\langle \\text{Pre-test \\%} \\rangle}{100\\% - \\langle \\text{Pre-test \\%} \\rangle}$$
Individual learning gains will be audited using Marx and Cummings's (2007) normalized change index ($c$) to prevent skewing from non-positive change scores. Cohort gains $\\langle g \\rangle \\ge 0.40$ satisfy the benchmark for medium-to-high practical conceptual mastery. Practical anxiety (CPAS) will be evaluated via paired $t$-tests within groups and between-group ANCOVA controlling for baseline pre-intervention scores. Telemetry diagnostic utility will be validated using multivariable logistic regression and point-biserial correlations linking in-app procedural error rates to corresponding item deductions on the paper post-test."""
    content = content.replace(old_267_block, new_267_block, 1)

    # 19. Section 2.6.8 (Ethical Considerations & Waitlist Protocol)
    old_268_block = """#### 2.6.8 Ethical Considerations and Data Protection
Prior to conducting field research, formal ethical clearance will be obtained from the National Commission for Science, Technology and Innovation (NACOSTI), alongside research authorization from the Ministry of Education and relevant County Directors of Education. Informed consent will be obtained from participating teachers and school principals, while parental consent and student assent will be secured for all participating learners. All student interaction logs and telemetry data will be anonymized using non-identifying research codes. Participant data will be stored on password-protected, encrypted local storage, with central database communications protected by standard encryption protocols."""

    new_268_block = """#### 2.6.8 Ethical Considerations and Data Protection
Prior to conducting field research, formal ethical clearance will be obtained from the National Commission for Science, Technology and Innovation (NACOSTI), alongside research authorization from the Ministry of Education and relevant County Directors of Education. Informed consent will be obtained from participating teachers and school principals, while parental consent and student assent will be secured for all participating learners.

##### 2.6.8.1 Waitlist Control / Delayed-Intervention Equity Protocol
Because participating Form 3 and Form 4 learners are preparing for high-stakes national KCSE Chemistry Paper 3 practical examinations (accounting for 40% of their final subject grade), withholding a potentially beneficial, zero-marginal-cost digital learning tool from control students presents an educational equity concern. To uphold the ethical research principles of beneficence and justice, the study implements a **Waitlist Control (Delayed-Intervention) Protocol**. Immediately following the completion of the Week 10 post-test assessments, control group chemistry teachers and students across all ten schools will receive full, unrestricted access to VirtuLab Kenya, comprehensive teacher orientation workshops, pre-cached school tablets, and digital learning manuals, ensuring equitable examination preparation prior to national examinations.

##### 2.6.8.2 Pseudonymisation and Local Master Key Security
To comply with the Kenya Data Protection Act (2019), all student performance metrics, survey responses, and telemetry logs will be strictly pseudonymized using non-identifying research identifiers (e.g., `STU-0421`). To ensure that teachers can utilize diagnostic telemetry logs for classroom remediation without exposing student personally identifiable information (PII) on central cloud servers, the master lookup key linking student names to research identifiers will be generated and held exclusively on the individual school teacher's local device, never uploaded to central project databases. Database communications and telemetry synchronizations are encrypted in transit using standard HTTPS/TLS 1.3 protocols."""
    content = content.replace(old_268_block, new_268_block, 1)

    # 20. Section 3.1 & 3.3.1 (Linguistic Scaffolding & Assessment Integrity)
    old_33_block = """### 3.3 Intervention Design Framework
The intervention operationalizes Bybee’s 5E Instructional Model, guiding learners from initial exploration to structured evaluation. Scaffolding is dynamically provided in Guided Mode and progressively removed in Exam Mode."""

    new_33_block = """### 3.3 Intervention Design Framework
The intervention operationalizes Bybee’s 5E Instructional Model, guiding learners from initial exploration to structured evaluation. Scaffolding is dynamically provided in Guided Mode and progressively removed in Exam Mode.

#### 3.3.1 Linguistic Scaffolding and Assessment Integrity Protocol
To bridge the documented linguistic barrier in secondary science while preserving strict adherence to national examination standards, VirtuLab Kenya implements a bifurcated linguistic architecture:
1. **Guided Mode Scaffolding:** In Guided Mode, learners can toggle seamlessly between English and standard Kiswahili terminology (e.g., *burette* / *buret*, *pipette* / *pipet*, *meniscus* / *meniskasi*, *concordant titres* / *titre mwafaka*, *acid-base neutralisation* / *kusalimisha asidi na besi*). Dual-language callouts provide bilingual explanations of underlying chemical concepts, reducing cognitive load and demystifying abstract chemical terminology for learners whose first language is Kiswahili.
2. **Exam Mode and Marking Rule Enforcement:** Under KNEC KCSE Chemistry Paper 3 regulations, candidate examination scripts must be written exclusively in English; writing in Kiswahili or vernacular results in forfeiture of observational and inference marks. Therefore, when learners enter *Exam Mode*, the Kiswahili toggle is automatically locked, and the entire interface enforces English-only data tables, observation prompts, and inference selections. If a student attempts to input Kiswahili terminology during Exam Mode, the system generates a corrective pedagogical reminder citing KNEC language regulations."""
    content = content.replace(old_33_block, new_33_block, 1)

    # 21. Section 3.4 & 3.4.1 (Offline Multi-Tenant Client Architecture)
    old_34_block = """### 3.4 System Architecture
VirtuLab Kenya follows a three-tier Progressive Web Application architecture designed for offline resilience:
1. Client Tier: Built using vanilla JavaScript, HTML5 Canvas, and CSS3, eliminating third-party framework overhead. The client runs entirely in the browser and caches all simulation assets locally via a Service Worker.
2. Local Data Tier: User sessions, telemetry events, and assessment scores are stored locally in IndexedDB and LocalStorage, enabling full functionality without internet access.
3. Server Tier: A lightweight Node.js/Express backend coupled with a PostgreSQL database, providing RESTful endpoints for periodic telemetry synchronization and teacher dashboard aggregation."""

    new_34_block = """### 3.4 System Architecture
VirtuLab Kenya follows a three-tier Progressive Web Application architecture designed for offline resilience:
1. **Client Tier:** Built using vanilla JavaScript, HTML5 Canvas, and CSS3, eliminating third-party framework overhead. The client runs entirely in the browser and caches all simulation assets locally via a Service Worker.
2. **Local Data Tier:** User sessions, telemetry events, and assessment scores are stored locally in `IndexedDB` and `LocalStorage`, enabling full functionality without internet access.
3. **Server Tier:** A lightweight Node.js/Express backend coupled with a PostgreSQL database, providing RESTful endpoints for periodic telemetry synchronization and teacher dashboard aggregation.

#### 3.4.1 Offline Multi-Tenant Client Architecture on Shared Devices
In under-resourced sub-county day schools, multiple learners must share a single tablet across consecutive periods. Because standard web browser `LocalStorage` and `IndexedDB` stores are origin-scoped rather than user-scoped, unmanaged multi-user rotations on a shared offline device risk data collisions and telemetry cross-contamination. VirtuLab Kenya resolves this challenge through a four-part offline multi-tenant client architecture:
1. **Pre-Cached Local Credential Roster:** During initial teacher setup (or whenever connectivity is briefly established), an encrypted, namespaced class roster is cached in `IndexedDB`. Each student authenticates offline using a lightweight 4-digit student research PIN (e.g., `STU-0421` + `****`), verified locally against client-side salted hashes.
2. **Namespaced Session Isolation:** Every simulation attempt, concordant table entry, stoichiometric calculation, and telemetry error event is keyed to a dedicated student object store in `IndexedDB` (`trials_${student_uuid}`). Active session state is held in volatile memory; when a student logs out or finishes a trial, runtime memory is wiped without clearing other students' persistent local records.
3. **Structured Dyadic Turn-Swap Workflow:** In shared-device classrooms, learners operate in paired dyads (*Navigator* and *Operator*). The interface features a prominent, single-tap **"Turn-Swap"** button. Tapping Turn-Swap automatically archives the active operator's trial telemetry, switches the active user profile, and resets apparatus positions for the partner's trial, ensuring that distinct student IDs receive accurate individual error attribution.
4. **Resilient Dual-Sync Queue:** Telemetry records stored in `IndexedDB` carry a boolean `synced: false` flag and a cryptographic checksum. When an offline device reconnects to internet connectivity (or connects to the teacher's local Wi-Fi hotspot), a background sync worker uploads queued telemetry in idempotent batches using a device-level sync token with extended expiration windows, avoiding stateless JWT expiration rejections."""
    content = content.replace(old_34_block, new_34_block, 1)

    # 22. Section 3.5 & Table 3.1 (Curriculum Mapping Matrix)
    old_table31_pattern = re.compile(r"### 3\.5 Laboratory Modules Implemented and Curriculum Roadmap\s*.*?Table 3\.1: VirtuLab Kenya Laboratory Modules and Curriculum Mapping\s*.*?### 3\.6 Technical Specifications", re.DOTALL)
    new_table31_block = """### 3.5 Laboratory Modules Implemented and Curriculum Roadmap
VirtuLab Kenya implements eight core laboratory modules specifically aligned with both the 8-4-4 KCSE Chemistry Paper 3 examination syllabus (Forms 3 and 4) and the Competency-Based Curriculum (CBC) Senior School Chemistry Curriculum Designs (Grades 10–12 Pure Sciences STEM pathway), as detailed in Table 3.1. Out-of-syllabus post-secondary titrations (such as EDTA complexometric or argentometric precipitation titrations) are excluded in favor of authentic KNEC practical procedures.

#### Table 3.1: VirtuLab Kenya Simulation Module Curriculum Mapping Matrix

| Mod. # | Practical Module Title | 8-4-4 Chemistry Syllabus Strand (Forms 3–4) | CBC Senior School Curriculum Design (Grades 10–12 Pure Sciences) | KNEC KCSE Paper 3 (233/3) Examination Alignment | Interactive Apparatus & Simulation Mechanics |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Volumetric Analysis: Acid-Base Neutralisation** | Form 3: Volumetric Analysis (Direct titration $\\text{HCl} / \\text{NaOH}$) | Grade 10: Quantitative Chemical Relationships (Acid-Base Equilibria) | Question 1: Volumetric titration; table layout; concordant averaging within $\\pm 0.10\\text{ cm}^3$; stoichiometry | Continuous mathematical pH curves (Henderson-Hasselbalch); drop-wise stopcock control; indicator color transitions |
| **2** | **Volumetric Analysis: Back & Displacement Titrations** | Form 3: Volumetric Analysis (Standardised acid vs carbonate/alkali) | Grade 10: Chemical Reactions & Stoichiometry (Purity Analysis) | Question 1: Determining percentage purity of impure chalk / molar masses | Stoichiometric reaction buffering; back-titration calculation engines with dynamic reagent excess checking |
| **3** | **Volumetric Analysis: Redox Titrations & Hydrated Salts** | Form 4: Electrochemistry & Redox; Form 3 Hydrated Crystals | Grade 11: Electron Transfer Reactions & Stoichiometric Ratios | Question 1: $\\text{KMnO}_4 / \\text{Fe}^{2+}$ redox titration; water of crystallisation ($x\\text{H}_2\\text{O}$) | Autocatalytic $\\text{Mn}^{2+}$ redox kinetics; self-indicating pink endpoint transitions; mole-ratio calculation engines |
| **4** | **Qualitative Inorganic Analysis (Unknown Cation/Anion Identification)** | Form 4: Qualitative Analysis (Reactions of $\\text{Al}^{3+}, \\text{Pb}^{2+}, \\text{Zn}^{2+}, \\text{Fe}^{2+}, \\text{Fe}^{3+}, \\text{Cu}^{2+}, \\text{Ba}^{2+}, \\text{Ca}^{2+}$) | Grade 11: Inorganic Chemistry & Chemical Identification | Question 2: Systematic drop-wise addition of $\\text{NaOH}$, $\\text{NH}_3\\text{(aq)}$, $\\text{Ba(NO}_3)_2$, $\\text{HNO}_3$, and flame tests | Discrete branching state machines; precipitate formation and dissolution in excess; gas confirmation tests; flame emission spectra |
| **5** | **Chemical Energetics & Thermochemistry** | Form 4: Energy Changes in Chemical Reactions | Grade 11: Thermodynamics & Chemical Energetics | Question 3: Heat of neutralisation; displacement enthalpy ($\\text{Cu}^{2+} / \\text{Zn}$) | Dynamic thermodynamic temperature-time cooling curves; extrapolation algorithms; interactive canvas graphical plotting |
| **6** | **Reaction Kinetics & Rates of Reaction** | Form 4: Reaction Rates and Reversible Reactions | Grade 12: Chemical Kinetics & Dynamic Equilibrium | Question 3: Sodium thiosulphate and dilute hydrochloric acid cross-disappearance | Turbidity simulation via opacity masking; cross-disappearance timer; $1/t$ vs concentration graph plotting |
| **7** | **Qualitative Organic Chemistry** | Form 4: Organic Chemistry II (Alkanes, Alkenes, Alkynes, Alkanols, Alkanoic Acids) | Grade 12: Carbon Compounds & Applied Organic Chemistry | Question 2: Unsaturation tests ($\\text{Br}_2\\text{(aq)}, \\text{KMnO}_4$); effervescence with $\\text{Na}_2\\text{CO}_3$; combustion | Dropwise addition of organic reagents; sootiness flame rendering; gas evolution physics; systematic KNEC deduction decision matrices |
| **8** | **Composite KCSE Mock Examination** | Comprehensive Form 3–4 practical review | Grades 10–12 Cumulative Practical Performance Task | Full Paper 3 (233/3): Timed 40-mark composite exam covering Questions 1, 2, and 3 | Full-length exam timer; locked guided aids; automated KNEC examiner scoring rubric; comprehensive diagnostic report |

### 3.6 Technical Specifications"""
    content = old_table31_pattern.sub(lambda m: new_table31_block, content)

    # 23. Section 3.6 (Technical Specifications) Cold load vs Warm load
    old_36_p1 = "The platform is engineered to operate efficiently under severe technical constraints. The production bundle size remains under 3.5 megabytes, loading in under 250 milliseconds on standard 3G mobile networks."
    new_36_p1 = "The platform is engineered to operate efficiently under severe technical constraints. The initial compressed application shell remains under 180 kilobytes, loading in 1.5 to 2.5 seconds over standard 3G cellular connections. Once cached by the Service Worker, the complete offline bundle (<3.5 megabytes) achieves instantaneous subsequent warm-launch speeds of under 250 milliseconds from local Cache-First storage."
    content = content.replace(old_36_p1, new_36_p1, 1)

    old_36_server = "The backend REST API is built on Node.js using Express and PostgreSQL, containerized with Docker for straightforward deployment."
    new_36_server = "The backend REST API is built on Node.js 20 LTS using Express 4.x and PostgreSQL 15, matching modern LTS deployment standards and containerized with Docker for straightforward deployment."
    content = content.replace(old_36_server, new_36_server, 1)

    # 24. Section 3.7 & 3.8 (Prototype Development & Past Paper Span)
    old_37_p1 = "In Phase 1 (Needs Assessment), 28 years of KCSE Chemistry Paper 3 past papers (2010–2025) and KICD curriculum guidelines were reviewed to identify recurring practical procedures and common candidate error points."
    new_37_p1 = "In Phase 1 (Needs Assessment), 16 consecutive years of KCSE Chemistry Paper 3 national past examination papers (2010–2025) and KICD curriculum guidelines were systematically audited to identify recurring practical procedures, question formats, and common candidate deduction error points."
    content = content.replace(old_37_p1, new_37_p1, 1)

    old_38_titr = "The working prototype supports four volumetric titration models: acid-base, redox, precipitation, and complexometric reactions, alongside real-time pH titration curves displaying equivalence points dynamically."
    new_38_titr = "The working prototype supports the four authentic KCSE Paper 3 volumetric titration models: direct acid-base neutralisation, redox titration, back-titration, and water of crystallisation determinations. Real-time pH equivalence curves are provided strictly in Guided Mode as a conceptual visual scaffold and are withdrawn in Exam Mode to match physical indicator-based wet practical conditions."
    content = content.replace(old_38_titr, new_38_titr, 1)

    # 25. Section 3.10 & Table 3.3 (Mobile Rotating Tablet Kit & Budget)
    old_310_p1 = "Pilot testing will be conducted in two phases. Phase 1 involves a two-week laboratory pre-test with 60 Form 4 students across two schools to test usability, identify software defects, and refine the user interface."
    new_310_p1 = "Pilot testing will be conducted in two phases. Phase 1 involves a two-week laboratory pre-test with 60 Form 4 students across two schools to test usability, verify multi-tenant session isolation, and refine the interface. To overcome the prohibitive 30:1 student-to-device ratio in sub-county day schools, hardware deployment utilizes a centralized **circulating mobile kit of 25 ruggedized Android tablets** in a mobile charging cart. Managed by the researcher, this kit rotates across the five participating sub-county schools on designated practical days, ensuring a 2:1 student-to-device dyad ratio during active classroom intervention sessions."
    content = content.replace(old_310_p1, new_310_p1, 1)

    # Update Table 3.3 Item 2 and Item 7
    content = content.replace("Refurbished Android Tablets (10 units)", "Circulating Mobile Tablet Kit (25 ruggedized tablets + charging cart)", 1)
    content = content.replace("10 units @ KES 12,000", "25 units + cart (circulating pilot kit)", 1)
    content = content.replace("10% of total budget", "10% of Items 1–6 Subtotal (KES 299,000)", 1)

    # 26. Section 4.4 & 4.5 (Evaluation Findings & LMM Specification)
    old_44_p1 = "Quantitative data will be collected at baseline (Week 3) and post-intervention (Week 10) using the CPCAT and CPAS instruments. Equivalence between the experimental and control groups at baseline will be assessed through independent-samples t-tests on pre-test CPCAT scores."
    new_44_p1 = "Quantitative data will be collected at baseline (Week 3) and post-intervention (Week 10) using the CPCAT and CPAS instruments. Baseline equivalence between experimental and control cohorts will be audited through independent-samples t-tests and cluster-adjusted baseline comparisons."
    content = content.replace(old_44_p1, new_44_p1, 1)

    old_44_ancova = "The primary hypothesis will be tested using Analysis of Covariance (ANCOVA), with pre-test CPCAT scores serving as the covariate and post-test scores as the dependent variable. Group differences will be evaluated at the 0.05 level of significance."
    new_44_ancova = "The primary hypothesis will be tested using a Two-Level Linear Mixed-Effects Model (LMM / Multilevel ANCOVA) with student observations nested within school/classroom clusters, including pre-test CPCAT scores as the baseline covariate, school resource stratum as a fixed factor, and a Treatment × Stratum interaction term. Cluster-Robust Standard Errors (CRSE) will be computed to prevent Type I error inflation."
    content = content.replace(old_44_ancova, new_44_ancova, 1)

    old_44_diag = "Diagnostic utility will be validated by cross-referencing telemetry error logs against post-test errors to confirm the predictive accuracy of the teacher dashboard."
    new_44_diag = "Diagnostic utility will be validated through multivariable logistic regression and point-biserial correlations linking specific in-app procedural error frequencies (meniscus misalignment, over-titration, incorrect indicator choice) to corresponding item-level mark deductions on the summative paper-based CPCAT post-test, confirming the predictive validity of the teacher telemetry dashboard."
    content = content.replace(old_44_diag, new_44_diag, 1)

    # 27. Section 4.8 & Table 4.1 (Comparison Matrix)
    old_table41_pattern = re.compile(r"### 4\.8 Comparison of Intended and Actual Outcomes\s*.*?Table 4\.1: Comparison Matrix of Target versus Projected Pilot Outcomes\s*.*?### 4\.9 Challenges Encountered", re.DOTALL)
    new_table41_block = """### 4.8 Comparison of Intended and Actual Outcomes
Table 4.1 defines the quantitative success criteria, measurement instruments, and analytical verification methods established for evaluating VirtuLab Kenya across the 10-week field evaluation.

#### Table 4.1: Comparison Matrix of Target versus Projected Pilot Outcomes

| Target Metric | Success Criterion | Analytical Method of Verification | Data Collection Source |
| :--- | :--- | :--- | :--- |
| **Cognitive Practical Mastery** | Adjusted Post-test CPCAT: $p < 0.05$; Mean normalized gain $\\langle g \\rangle \\ge 0.40$ | Two-level Linear Mixed-Effects Model (LMM) controlling for pre-test and cluster nesting | CPCAT Pre- and Post-test scripts graded by certified blind KNEC examiners |
| **Practical Anxiety Reduction** | Adjusted Post-test CPAS: $p < 0.05$; statistically significant reduction | Between-group ANCOVA controlling for baseline anxiety + paired $t$-test | 20-item CPAS survey administered pre- and post-intervention |
| **Sub-County Account Participation** | $\\ge 150$ unique active Sub-County accounts during intervention; $\\ge 300$ cumulative post-crossover | Database audit of unique registered student UUIDs logging active simulation trials | PostgreSQL 15 database `lab_sessions` audit logs and class attendance records |
| **Interface Usability Benchmark** | System Usability Scale (SUS) score $\\ge 78$ across all strata | Descriptive mean computation against Brooke's (1996) percentile benchmark tables | 10-item SUS digital questionnaire administered at Week 10 |
| **Teacher & Student Acceptance Level** | Mean rating $\\ge 4.0$ on a 5-point scale across PU, PEOU, PEC, and BI | Descriptive means and standard deviations across TAM 3 construct subscales | Digital TAM 3 questionnaire administered to teachers ($n = 20$) and experimental students |
| **Telemetry Diagnostic Predictive Validity** | Statistically significant positive correlation ($r \\ge 0.50, p < 0.01$) | Multivariable logistic regression and point-biserial error correlation | Telemetry error event logs correlated with CPCAT paper post-test deduction items |

### 4.9 Challenges Encountered"""
    content = old_table41_pattern.sub(lambda m: new_table41_block, content)

    # 28. Section 4.10 Mitigation Measures: Dyad protocol in Control Group
    old_410_p1 = "Hardware Shortages in Sub-County Schools: To address the limited availability of computing devices in sub-county day schools, VirtuLab Kenya implements a single-device group rotation mode where two or three students collaborate on a single device."
    new_410_p1 = "Hardware Shortages in Sub-County Schools: To resolve hardware constraints in sub-county day schools, the project deploys a circulating mobile kit of 25 ruggedized Android tablets rotated across schools on designated practical days. Within classrooms, learners operate in structured paired dyads (*Navigator* and *Operator*), alternating roles on successive trials via the single-tap Turn-Swap workflow. To prevent collaborative peer learning from confounding the experimental evaluation, control classrooms execute an identical structured peer-dyad recording and calculation protocol using conventional paper apparatus guides."
    content = content.replace(old_410_p1, new_410_p1, 1)

    # 29. Section 4.12, 4.13, 4.16 Prospective Reframing & Institutional Governance
    old_412_p1 = "Developing this capstone project provided critical insight into the realities of educational technology deployment in resource-constrained environments."
    new_412_p1 = "Formative development and local laboratory usability testing suggest that in high-stakes assessment environments like KCSE Chemistry, educational technology innovations must balance pedagogical exploration with rigorous examination rubric compliance."
    content = content.replace(old_412_p1, new_412_p1, 1)

    old_413_rec = "The project offers three practical recommendations for scaling virtual laboratories in Kenyan secondary education:"
    new_413_rec = r"Contingent upon validating the target learning gains ($\langle g \rangle \ge 0.40$) and usability benchmarks in the 10-week field study, the project outlines three evidence-based policy recommendations:"
    content = content.replace(old_413_rec, new_413_rec, 1)

    old_rec3 = "County Education Boards should allocate modest budgetary provisions—approximately KES 50,000 per school annually—for basic digital learning infrastructure, including low-cost tablets and solar charging solutions."
    new_rec3 = "The Ministry of Education (State Department for Basic Education) and National Government Constituencies Development Fund (NG-CDF) Committees should coordinate infrastructure allocations—directing secondary school capitation and constituency education development funds toward centralized mobile tablet kits, offline school server hubs, and solar charging carts in unequipped sub-county day schools."
    content = content.replace(old_rec3, new_rec3, 1)

    old_conc = "VirtuLab Kenya demonstrates that high-quality practical science education can be delivered in resource-constrained schools without expensive physical laboratories or recurring chemical costs."
    new_conc = "VirtuLab Kenya is engineered to demonstrate that thoughtful instructional design and lightweight offline-first architecture can bridge the practical science divide in resource-constrained secondary schools without imposing recurring chemical consumable costs or demanding broadband connectivity."
    content = content.replace(old_conc, new_conc, 1)

    # 30. Complete References Section Replacement
    old_refs_pattern = re.compile(r"# REFERENCES\s*.*$", re.DOTALL)
    new_refs_block = """# REFERENCES

American Psychological Association. (2020). *Publication manual of the American Psychological Association* (7th ed.). https://doi.org/10.1037/0000165-000

Barasa, P., & Nyongesa, B. (2021). Competency-based curriculum in Kenya: Secondary school science teachers’ preparedness and instructional challenges. *Journal of Education and Practice*, 12(18), 34–42.

Bonde, M. T., Makransky, G., Wandore, J., Armstrong, P. A., Peat, M., Møller, C., & Lehman, O. (2014). Improving biotech education through gamified laboratory simulations. *Nature Biotechnology*, 32(7), 694–697. https://doi.org/10.1038/nbt.2955

Brooke, J. (1996). SUS: A quick and dirty usability scale. In P. W. Jordan, B. Thomas, B. A. Weerdmeester, & I. L. McClelland (Eds.), *Usability evaluation in industry* (pp. 189–194). Taylor & Francis.

Bybee, R. W. (2009). *The BSCS 5E instructional model: Creating teachable moments*. NSTA Press.

Centre for Mathematics, Science and Technology Education in Africa [CEMASTEA]. (2020). *Status of science and mathematics education in Kenya secondary schools: Baseline survey report*. CEMASTEA, Nairobi.

Centre for Mathematics, Science and Technology Education in Africa [CEMASTEA]. (2024). *CEMASTEA virtual labs portal: Integrating digital STEM experiments in secondary schools*. CEMASTEA, Nairobi. http://virtuallabs.cemastea.ac.ke

Chebii, R., Wachanga, S. W., & Kiboss, J. K. (2012). Effects of science process skills mastery learning approach on students' acquisition of selected chemistry practical skills in school. *Creative Education*, 3(8), 1291–1296. https://doi.org/10.4236/ce.2012.38188

Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. *MIS Quarterly*, 13(3), 319–340. https://doi.org/10.2307/249008

Gitira, C. B. (2025). School-level predictors of academic performance in secondary school chemistry in Kakamega County, Kenya. *East African Journal of Education Studies*, 8(3), 180–190. https://doi.org/10.37284/eajes.8.3.3454

Hake, R. R. (1998). Interactive-engagement versus traditional methods: A six-thousand-student survey of mechanics test data for introductory physics courses. *American Journal of Physics*, 66(1), 64–74. https://doi.org/10.1119/1.18809

Kenya Institute of Curriculum Development [KICD]. (2019). *Secondary education curriculum designs: Chemistry Forms 1–4*. KICD, Nairobi.

Kenya Institute of Curriculum Development [KICD]. (2024). *Senior school curriculum designs: Chemistry Grades 10–12 (Pure Sciences STEM Pathway)*. KICD, Nairobi.

Kenya National Examinations Council [KNEC]. (2022). *KCSE examination essential performance reports: Chemistry Paper 3 (233/3)*. KNEC, Nairobi.

Kiptum, J. K. (2018). *Institutional factors influencing students' academic achievement in chemistry in public secondary schools in Nakuru County, Kenya* (Master's thesis). Egerton University, Njoro.

Lynn, M. R. (1986). Determination and quantification of content validity. *Nursing Research*, 35(6), 382–386. https://doi.org/10.1097/00006199-198611000-00017

Marx, J. D., & Cummings, K. (2007). Normalized change. *American Journal of Physics*, 75(1), 87–91. https://doi.org/10.1119/1.2372468

Mayer, R. E. (2009). *Multimedia learning* (2nd ed.). Cambridge University Press. https://doi.org/10.1017/CBO9780511811677

Ministry of Education Kenya. (2018). *National Education Sector Strategic Plan (NESSP) 2018–2022*. Government of Kenya, Nairobi.

Mtebe, J. S., & Raisamo, R. (2014). Investigating students' behavioural intention to adopt and use mobile learning in higher education in East Africa. *International Journal of Education and Development using Information and Communication Technology*, 10(3), 4–20.

Mukhwana, A. N. (2020). *Adequacy of laboratory resources and student performance in chemistry practical examinations in public secondary schools in Kakamega North Sub-County, Kenya* (Master's thesis). Kenyatta University, Nairobi.

Mwangi, J. M., & Khatete, D. W. (2020). Computer-based simulations and secondary school students' academic achievement in chemistry in Nairobi County, Kenya. *Journal of Education and Practice*, 11(15), 56–64.

Ndebvu, S., Mwangaza, M., & Chigona, W. (2024). MiLab: A virtual science laboratory for Malawian secondary schools. *African Journal of Research in Mathematics, Science and Technology Education*, 28(1), 45–59. https://doi.org/10.1080/18117295.2024.2314561

Nedungadi, P., Raman, R., & McGregor, M. (2013). Enhanced STEM learning in rural India: The Online Labs (OLabs) model. In *2013 IEEE Global Humanitarian Technology Conference (GHTC)* (pp. 281–286). IEEE. https://doi.org/10.1109/GHTC.2013.6713697

Nizeyimana, T., & Musengimana, J. (2026). Impact of interactive virtual laboratories on students' conceptual understanding of secondary school chemistry: A quasi-experimental study. *Research Square*. https://doi.org/10.21203/rs.3.rs-9403467/v1

Ochieng’, R. O. (2023). Teacher workload, laboratory technician availability and implementation of chemistry practical work in secondary schools in Kisumu County, Kenya. *African Journal of Educational Studies in Mathematics and Sciences*, 19(2), 77–91.

Omolo, E. O., & Sifuna, D. N. (2019). Teacher readiness and technology adoption in secondary school science classrooms in Siaya County, Kenya. *Journal of Information Technology Education: Research*, 18, 145–163.

Piaget, J. (1973). *To understand is to invent: The future of education*. Grossman Publishers.

Polit, D. F., & Beck, C. T. (2006). The content validity index: Are you sure you know what's being reported? Critique and recommendations. *Research in Nursing & Health*, 29(5), 489–497. https://doi.org/10.1002/nur.20147

Rutten, N., van Joolingen, W. R., & van der Veen, J. T. (2012). The learning effects of computer simulations in science education. *Computers & Education*, 58(1), 136–153. https://doi.org/10.1016/j.compedu.2011.07.017

Smetana, L. K., & Bell, R. L. (2012). Computer simulations to support science instruction and learning: A critical review of the literature. *International Journal of Science Education*, 34(9), 1337–1370. https://doi.org/10.1080/09500693.2011.605182

Spielberger, C. D., Gorsuch, R. L., Lushene, R., Vagg, P. R., & Jacobs, G. A. (1983). *Manual for the State-Trait Anxiety Inventory (Form Y)*. Consulting Psychologists Press.

Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science*, 12(2), 257–285. https://doi.org/10.1207/s15516709cog1202_4

Venkatesh, V., & Bala, H. (2008). Technology Acceptance Model 3 and a research agenda on interventions. *Decision Sciences*, 39(2), 273–315. https://doi.org/10.1111/j.1540-5915.2008.00192.x

Venkatesh, V., Morris, M. G., Davis, G. B., & Davis, F. D. (2003). User acceptance of information technology: Toward a unified view. *MIS Quarterly*, 27(3), 425–478. https://doi.org/10.2307/30036540

Vygotsky, L. S. (1978). *Mind in society: The development of higher psychological processes*. Harvard University Press.

Wabwoba, C. W., & Chang’ach, J. K. (2021). Influence of Free Day Secondary Education funds disbursement on science laboratory practical sessions in Bungoma County, Kenya. *International Journal of Educational Research*, 9(4), 112–126.

Wandera, F. M., & Changeiywo, J. M. (2021). Effects of computer-based simulations on students' achievement in chemistry in secondary schools in Machakos County, Kenya. *Journal of Education and Practice*, 12(9), 45–54.

Wieman, C. E., Adams, W. K., & Perkins, K. K. (2008). PhET: Simulations that enhance learning. *Science*, 322(5902), 682–683. https://doi.org/10.1126/science.1161948

Yaron, D., Karabinos, M., Lange, D., Greeno, J. G., & Leinhardt, G. (2010). The ChemCollective: Virtual labs for introductory chemistry. *Science*, 328(5978), 584–585. https://doi.org/10.1126/science.1189381
"""
    content = old_refs_pattern.sub(lambda m: new_refs_block, content)

    # Save to PROJECT_PROPOSAL.md
    with open('docs/PROJECT_PROPOSAL.md', 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Successfully synchronized docs/PROJECT_PROPOSAL.md. New length: {len(content)} characters.")

if __name__ == '__main__':
    main()
