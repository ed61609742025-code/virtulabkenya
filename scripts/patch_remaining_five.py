# -*- coding: utf-8 -*-
import re

def apply_patches():
    with open('docs/PROJECT_PROPOSAL.md', 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Patch 2.6.8 Ethical Considerations and Data Protection
    old_268 = """#### 2.6.8 Ethical Considerations and Data Protection
In strict compliance with the Kenya Data Protection Act of 2019 and NACOSTI research guidelines, study participation is entirely voluntary, and participants may withdraw at any stage without prejudice. Because students are minors, parents and guardians will receive comprehensive informed consent documents detailing the study's educational objectives, data collection procedures, and confidentiality safeguards. Learners will complete written assent forms prior to participating. Institutional approval will be obtained from school principals and Boards of Management. All quantitative data will be pseudonymised using research identifiers (e.g., STU-0421), and school names will be anonymized in research reports. User authentication relies on bcrypt password hashing with a work factor of 10, and database communications are encrypted using SSL and TLS protocols."""

    new_268 = """#### 2.6.8 Ethical Considerations and Data Protection
In strict compliance with the Kenya Data Protection Act of 2019 and NACOSTI research guidelines, study participation is entirely voluntary, and participants may withdraw at any stage without prejudice. Because students are minors, parents and guardians will receive comprehensive informed consent documents detailing the study's educational objectives, data collection procedures, and confidentiality safeguards. Learners will complete written assent forms prior to participating. Institutional approval will be obtained from school principals and Boards of Management.

##### 2.6.8.1 Waitlist Control (Delayed-Intervention) Protocol
Because participating Form 3 and Form 4 learners are preparing for high-stakes national KCSE Chemistry Paper 3 practical examinations (accounting for 40% of their final subject grade), withholding a potentially beneficial, zero-marginal-cost digital learning tool from control students presents an educational equity concern. To uphold the ethical research principles of beneficence and justice, the study implements a **Waitlist Control (Delayed-Intervention) Protocol**. Immediately following the completion of the Week 10 post-test assessments, control group chemistry teachers and students across all ten schools will receive full, unrestricted access to VirtuLab Kenya, comprehensive teacher orientation workshops, pre-cached school tablets, and digital learning manuals, ensuring equitable examination preparation prior to national examinations.

##### 2.6.8.2 Pseudonymisation and Local Master Key Security
To comply with the Kenya Data Protection Act (2019), all student performance metrics, survey responses, and telemetry logs will be strictly pseudonymized using non-identifying research identifiers (e.g., `STU-0421`). To ensure that teachers can utilize diagnostic telemetry logs for classroom remediation without exposing student personally identifiable information (PII) on central cloud servers, the master lookup key linking student names to research identifiers will be generated and held exclusively on the individual school teacher's local device, never uploaded to central project databases. Database communications and telemetry synchronizations are encrypted in transit using standard HTTPS/TLS 1.3 protocols."""

    if old_268 in text:
        text = text.replace(old_268, new_268, 1)
        print("Patched 2.6.8 successfully.")
    else:
        print("Warning: old_268 not found verbatim.")

    # 2. Patch 3.3 Intervention Design Framework
    old_33 = """### 3.3 Intervention Design Framework
The platform operationalises Vygotsky’s Zone of Proximal Development through a dual-mode instructional architecture. In Guided Mode, novice learners receive contextual prompts at each operational step, including reminders to rinse the pipette before drawing acid, visual cues indicating stopcock flow rate, and a magnified meniscus indicator. In Exam Mode, these scaffolds are withdrawn. Learners must independently navigate the procedure: managing an examination timer, taking raw apparatus readings, completing blank KNEC tables, calculating average concordant titres, and executing stoichiometric computations under authentic KCSE assessment conditions."""

    new_33 = """### 3.3 Intervention Design Framework
The platform operationalises Vygotsky’s Zone of Proximal Development through a dual-mode instructional architecture. In Guided Mode, novice learners receive contextual prompts at each operational step, including reminders to rinse the pipette before drawing acid, visual cues indicating stopcock flow rate, and a magnified meniscus indicator. In Exam Mode, these scaffolds are withdrawn. Learners must independently navigate the procedure: managing an examination timer, taking raw apparatus readings, completing blank KNEC tables, calculating average concordant titres, and executing stoichiometric computations under authentic KCSE assessment conditions.

#### 3.3.1 Linguistic Scaffolding and Assessment Integrity Protocol
To bridge the documented linguistic barrier in secondary science while preserving strict adherence to national examination standards, VirtuLab Kenya implements a bifurcated linguistic architecture:
1. **Guided Mode Scaffolding:** In Guided Mode, learners can toggle seamlessly between English and standard Kiswahili terminology (e.g., *burette* / *buret*, *pipette* / *pipet*, *meniscus* / *meniskasi*, *concordant titres* / *titre mwafaka*, *acid-base neutralisation* / *kusalimisha asidi na besi*). Dual-language callouts provide bilingual explanations of underlying chemical concepts, reducing cognitive load and demystifying abstract chemical terminology for learners whose first language is Kiswahili.
2. **Exam Mode and Marking Rule Enforcement:** Under KNEC KCSE Chemistry Paper 3 regulations, candidate examination scripts must be written exclusively in English; writing in Kiswahili or vernacular results in forfeiture of observational and inference marks. Therefore, when learners enter *Exam Mode*, the Kiswahili toggle is automatically locked, and the entire interface enforces English-only data tables, observation prompts, and inference selections. If a student attempts to input Kiswahili terminology during Exam Mode, the system generates a corrective pedagogical reminder citing KNEC language regulations."""

    if old_33 in text:
        text = text.replace(old_33, new_33, 1)
        print("Patched 3.3 successfully.")
    else:
        print("Warning: old_33 not found verbatim.")

    # 3. Patch 3.4 System Architecture
    old_34_tail = "In the Database Tier, a PostgreSQL database manages records for schools, classrooms, teachers, and student attempts. B-tree indexing on session tables ensures rapid querying during batch synchronisation cycles."
    new_34_tail = """In the Database Tier, a PostgreSQL database manages records for schools, classrooms, teachers, and student attempts. B-tree indexing on session tables ensures rapid querying during batch synchronisation cycles.

#### 3.4.1 Offline Multi-Tenant Client Architecture on Shared Devices
In under-resourced sub-county day schools, multiple learners must share a single tablet across consecutive periods. Because standard web browser `LocalStorage` and `IndexedDB` stores are origin-scoped rather than user-scoped, unmanaged multi-user rotations on a shared offline device risk data collisions and telemetry cross-contamination. VirtuLab Kenya resolves this challenge through a four-part offline multi-tenant client architecture:
1. **Pre-Cached Local Credential Roster:** During initial teacher setup (or whenever connectivity is briefly established), an encrypted, namespaced class roster is cached in `IndexedDB`. Each student authenticates offline using a lightweight 4-digit student research PIN (e.g., `STU-0421` + `****`), verified locally against client-side salted hashes.
2. **Namespaced Session Isolation:** Every simulation attempt, concordant table entry, stoichiometric calculation, and telemetry error event is keyed to a dedicated student object store in `IndexedDB` (`trials_${student_uuid}`). Active session state is held in volatile memory; when a student logs out or finishes a trial, runtime memory is wiped without clearing other students' persistent local records.
3. **Structured Dyadic Turn-Swap Workflow:** In shared-device classrooms, learners operate in paired dyads (*Navigator* and *Operator*). The interface features a prominent, single-tap **"Turn-Swap"** button. Tapping Turn-Swap automatically archives the active operator's trial telemetry, switches the active user profile, and resets apparatus positions for the partner's trial, ensuring that distinct student IDs receive accurate individual error attribution.
4. **Resilient Dual-Sync Queue:** Telemetry records stored in `IndexedDB` carry a boolean `synced: false` flag and a cryptographic checksum. When an offline device reconnects to internet connectivity (or connects to the teacher's local Wi-Fi hotspot), a background sync worker uploads queued telemetry in idempotent batches using a device-level sync token with extended expiration windows, avoiding stateless JWT expiration rejections."""

    if old_34_tail in text:
        text = text.replace(old_34_tail, new_34_tail, 1)
        print("Patched 3.4 successfully.")
    else:
        print("Warning: old_34_tail not found verbatim.")

    # 4. Patch 3.7 Development Process
    old_37 = "Phase 1 (Needs Assessment), 28 years of KCSE Chemistry Paper 3 past papers (1989–2016) and KICD curriculum guidelines were reviewed to identify recurring apparatus configurations, frequent candidate errors, and marking rubrics."
    new_37 = "Phase 1 (Needs Assessment), 16 consecutive years of KCSE Chemistry Paper 3 national past examination papers (2010–2025) and KICD curriculum guidelines were systematically audited to identify recurring apparatus configurations, frequent candidate deduction errors, and KNEC marking rubrics."
    if old_37 in text:
        text = text.replace(old_37, new_37, 1)
        print("Patched 3.7 successfully.")
    else:
        # Check without en-dash
        text = re.sub(r"Phase 1 \(Needs Assessment\), 28 years of KCSE Chemistry Paper 3 past papers.*?rubrics\.", new_37, text)
        print("Patched 3.7 via regex.")

    # 5. Patch 3.10 Pilot Testing and Pre-Testing
    old_310 = """### 3.10 Pilot Testing and Pre-Testing
The pilot study will involve approximately 600 Form 3 and Form 4 chemistry students and 20 teachers across ten secondary schools in Nairobi, Machakos, and Kiambu counties. The sample includes two National/Extra-County schools, three County schools, and five Sub-County Day schools.

The pilot evaluates the six-week active intervention period. Effectiveness and anxiety reduction will be measured through pre- and post-tests using the CPCAT and CPAS instruments, along with post-study SUS usability questionnaires, TAM 3 surveys, and teacher interviews."""

    new_310 = """### 3.10 Pilot Testing and Pre-Testing
The pilot study will involve approximately 600 Form 3 and Form 4 chemistry students and 20 teachers across ten secondary schools in Nairobi, Machakos, and Kiambu counties. The sample includes two National/Extra-County schools, three County schools, and five Sub-County Day schools.

#### 3.10.1 Circulating Mobile Tablet Kit Deployment Model
To resolve the acute hardware shortages in Sub-County day schools (where budgeting only 10 tablets across five schools would yield an unworkable 30:1 student-to-device ratio), hardware deployment utilizes a centralized **circulating mobile kit of 25 ruggedized Android tablets** housed in a portable protective charging cart. Managed by the researcher, this kit rotates across the five participating sub-county schools on designated practical days, ensuring a 2:1 student-to-device dyad ratio during active classroom intervention sessions. Between mobile kit visits, learners maintain simulation practice on available school desktop computers and teacher-supervised rotation stations.

Prior to the 10-week main evaluation, a preliminary two-week psychometric pre-test will be conducted with 40 Form 4 chemistry learners in a non-participating sub-county secondary school to establish CPCAT test-retest reliability, verify CPAS and TAM 3 construct clarity, and validate offline multi-tenant session isolation under realistic classroom conditions."""

    if old_310 in text:
        text = text.replace(old_310, new_310, 1)
        print("Patched 3.10 successfully.")
    else:
        # Try regex replacement for section 3.10
        patt_310 = re.compile(r"### 3\.10 Pilot Testing and Pre-Testing\s*.*?### 3\.11 Revision and Refinement", re.DOTALL)
        text = patt_310.sub(new_310 + "\n\n### 3.11 Revision and Refinement", text)
        print("Patched 3.10 via regex.")

    with open('docs/PROJECT_PROPOSAL.md', 'w', encoding='utf-8') as f:
        f.write(text)

    print("Completed all remaining patches. Final character count:", len(text))

if __name__ == '__main__':
    apply_patches()
