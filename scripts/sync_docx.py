# -*- coding: utf-8 -*-
"""
Synchronizes VirtuLab_Kenya_Capstone_Proposal_V11_Resolved.docx with V11 master patches.
"""

import docx
import shutil

docx_path = 'docs/capstone_proposals/VirtuLab_Kenya_Capstone_Proposal_V11_Resolved.docx'
out_path = 'docs/capstone_proposals/VirtuLab_Kenya_Capstone_Proposal_V11_Synchronized.docx'

doc = docx.Document(docx_path)

# 1. Update Title
for p in doc.paragraphs[:10]:
    if 'VIRTULAB KENYA: DESIGN' in p.text:
        p.text = "VIRTULAB KENYA: AN OFFLINE-FIRST VIRTUAL CHEMISTRY LABORATORY PROGRESSIVE WEB APPLICATION FOR ENHANCING PRACTICAL COMPETENCIES AMONG KCSE AND CBC/CBE LEARNERS IN RESOURCE-CONSTRAINED SECONDARY SCHOOLS"
        print("Updated Title in docx.")

# 2. Update Hypotheses (1.9)
hyp_replacement = """To evaluate the educational efficacy and affective impact of VirtuLab Kenya, the study formulates three distinct hypothesis sets, separating inferential between-group comparisons from descriptive normalized gain benchmarks:

1. Cognitive Achievement Hypotheses (CPCAT Post-Test Means)
• H01 (Null Hypothesis): There is no statistically significant difference in adjusted post-test KCSE Chemistry Paper 3 achievement scores on the Chemistry Practical Competency Achievement Test (CPCAT) between learners instructed through VirtuLab Kenya and learners instructed through conventional classroom methods, controlling for baseline pre-test scores and classroom cluster nesting (p ≥ 0.05).
• HA1 (Alternative Hypothesis): Learners instructed through VirtuLab Kenya achieve statistically significantly higher adjusted post-test KCSE Chemistry Paper 3 achievement scores on the CPCAT than learners instructed through conventional classroom methods, controlling for baseline pre-test scores and classroom cluster nesting (p < 0.05).

2. Descriptive Normalised Learning Gain Benchmark
• Project Achievement Criterion: Independent of the relative between-group inferential test, the experimental cohort utilizing VirtuLab Kenya will achieve an average cohort normalised learning gain of <g> ≥ 0.40 (satisfying Hake’s criterion for medium-to-high practical conceptual mastery).

3. Affective Practical Anxiety Hypotheses (CPAS Post-Intervention Means)
• H02 (Null Hypothesis): There is no statistically significant difference in adjusted post-intervention practical anxiety scores on the Chemistry Practical Anxiety Scale (CPAS) between learners utilizing VirtuLab Kenya and learners instructed through conventional classroom methods, controlling for baseline anxiety levels (p ≥ 0.05).
• HA2 (Alternative Hypothesis): Learners utilizing VirtuLab Kenya demonstrate statistically significantly lower adjusted post-intervention practical anxiety scores on the CPAS compared to learners instructed through conventional classroom methods, controlling for baseline anxiety levels (p < 0.05)."""

for i, p in enumerate(doc.paragraphs):
    if p.text.strip() == '1.9 Research Hypotheses':
        if i + 1 < len(doc.paragraphs):
            doc.paragraphs[i + 1].text = hyp_replacement
            print(f"Updated Section 1.9 text at paragraph {i+1}.")
            break

# 3. Update Scope (1.11)
scope_addition = "\n\nWhile baseline literature documents acute laboratory infrastructure deficits across Western Kenya, the selection of Nairobi, Kiambu, and Machakos counties for the 10-week quasi-experimental field pilot is grounded in three methodological and logistical criteria: (1) Ecological Representation of Target Deficits in peri-urban sub-county day schools; (2) Field Visit Frequency and Tablet Logistics requiring bi-weekly monitoring of rotating hardware; and (3) Curricular Stratification Feasibility co-locating National, County, and Sub-County strata within a manageable cluster."

for i, p in enumerate(doc.paragraphs):
    if p.text.strip() == '1.11 Scope of the Capstone Project':
        if i + 1 < len(doc.paragraphs):
            doc.paragraphs[i + 1].text += scope_addition
            print(f"Updated Section 1.11 scope at paragraph {i+1}.")
            break

# 4. Update Limitations (1.13)
lim_addition = "\n\nTo mitigate instructional time confounding, both experimental and control cohorts receive exactly 160 minutes of weekly chemistry instruction over the six-week active intervention phase. Control teachers assign structured paper-based calculation problem sets equivalent in estimated time (60 min/week) to experimental virtual homework practice, and all teachers maintain weekly instructional fidelity logs. The statistical model employs a Two-Level Linear Mixed-Effects Model (LMM) with pre-test covariates to control for classroom clustering and teacher variance."

for i, p in enumerate(doc.paragraphs):
    if p.text.strip() == '1.13 Limitations':
        if i + 1 < len(doc.paragraphs):
            doc.paragraphs[i + 1].text += lim_addition
            print(f"Updated Section 1.13 limitations at paragraph {i+1}.")
            break

doc.save(out_path)
print(f"Saved updated Word document successfully to {out_path}.")
