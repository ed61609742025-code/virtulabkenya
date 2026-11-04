import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    # Remove existing shd if any
    for child in list(tcPr):
        if child.tag.endswith('shd'):
            tcPr.remove(child)
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=140, bottom=140, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    for child in list(tcPr):
        if child.tag.endswith('tcMar'):
            tcPr.remove(child)
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="B0BEC5", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    for child in list(tblPr):
        if child.tag.endswith('tblBorders'):
            tblPr.remove(child)
    borders = parse_xml(f'<w:tblBorders {nsdecls("w")}>'
                        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                        f'<w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                        f'<w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                        f'<w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                        f'</w:tblBorders>')
    tblPr.append(borders)

def build_document():
    doc = Document()
    
    # Page setup - Standard Letter/A4 with 0.8 inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)
        
    # Styling defaults
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = RGBColor(0x22, 0x22, 0x22)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(3)

    # University Header
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_after = Pt(2)
    run_inst = p_inst.add_run("OPEN UNIVERSITY OF KENYA")
    run_inst.font.name = 'Calibri'
    run_inst.font.size = Pt(13)
    run_inst.font.bold = True
    run_inst.font.color.rgb = RGBColor(0x0F, 0x2D, 0x59) # Deep Navy

    p_school = doc.add_paragraph()
    p_school.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_school.paragraph_format.space_after = Pt(2)
    run_school = p_school.add_run("SCHOOL OF EDUCATION | DEPARTMENT OF TECHNOLOGY EDUCATION")
    run_school.font.name = 'Calibri'
    run_school.font.size = Pt(10)
    run_school.font.bold = True
    run_school.font.color.rgb = RGBColor(0x55, 0x55, 0x55)

    p_prog = doc.add_paragraph()
    p_prog.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_prog.paragraph_format.space_after = Pt(12)
    run_prog = p_prog.add_run("Master in Learning Design and Technology (MLDT)")
    run_prog.font.name = 'Calibri'
    run_prog.font.size = Pt(10)
    run_prog.font.italic = True
    run_prog.font.color.rgb = RGBColor(0x44, 0x44, 0x44)

    # Document Title Box
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(16)
    run_title = p_title.add_run("CAPSTONE PROJECT PARTICIPANT INFORMATION")
    run_title.font.name = 'Calibri'
    run_title.font.size = Pt(12)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(0x0F, 0x2D, 0x59)

    # Form Data Table
    table_data = [
        ("Participant’s Name", [
            ("bold", "Harrison Tellah Museni")
        ]),
        ("Participant’s Number", [
            ("bold", "ED61/6061/2025")
        ]),
        ("Participant’s Discipline", [
            ("bold", "Technology Education / Learning Design and Technology"),
            ("normal", "School of Education, Open University of Kenya")
        ]),
        ("Capstone Project Timeline", [
            ("bold", "Expected Duration: 12 Months (September 2026 – August 2027)"),
            ("bullet", "Months 1–4 (Foundations & Core Engine): Requirements specification, KICD syllabus mapping, mathematical titration/kinetics engines, and offline PWA service-worker scaffolding."),
            ("bullet", "Months 5–8 (Module Expansion & Systems): Qualitative analysis engine, real-time teacher analytics dashboard, assignment broadcasting subsystem, and timed mock exam module."),
            ("bullet", "Months 9–10 (Field Deployment): NACOSTI research clearance, county educational approvals, onboarding 10 pilot schools (600 students, 20 teachers), and launch of 10-week field evaluation."),
            ("bullet", "Months 11–12 (Evaluation & Defense): Post-test administration (CPCAT, CPAS, SUS, TAM 3), inferential statistical analysis (LMM / ANCOVA), open-source publication, and dissertation defense.")
        ]),
        ("Proposed Topic", [
            ("bold", "VIRTULAB KENYA: AN OFFLINE-FIRST VIRTUAL CHEMISTRY LABORATORY PROGRESSIVE WEB APPLICATION FOR ENHANCING PRACTICAL COMPETENCIES AMONG KCSE AND CBC/CBE LEARNERS IN RESOURCE-CONSTRAINED SECONDARY SCHOOLS")
        ]),
        ("Project Type", [
            ("bold", "Individual Capstone Project (No - Not in Groups)"),
            ("normal", "Conducted independently by Harrison Tellah Museni under the academic supervision of Prof. Wambua Benjamin Kyalo, PhD (School of Education – Technology Education, Open University of Kenya).")
        ]),
        ("Other Participants", [
            ("bold", "None (Individual Project)"),
            ("bullet", "Academic Supervisor: Prof. Wambua Benjamin Kyalo, PhD (Open University of Kenya)"),
            ("bullet", "Partner Fieldwork School: Makunda Secondary School, Kakamega County (Principal, BOM, and Science Department)"),
            ("bullet", "Institutional Content Validation: Curriculum specialists from KICD and certified national examiners from KNEC and CEMASTEA")
        ]),
        ("Demographic Issues", [
            ("bullet", "Target Age Group: 14 to 19 years (Secondary school learners across Form 1 to Form 4 / Senior School Grades 10–12)."),
            ("bullet", "Population Affected: Over 600,000 KCSE Chemistry candidates sit Paper 3 annually in Kenya; specifically addresses learners in over 60% of public secondary schools operating without functional laboratories. The pilot field study directly encompasses 600 Form 3 and Form 4 learners and 20 chemistry teachers across 10 stratified schools."),
            ("bullet", "Gender Distribution: Gender-inclusive; encompasses both male and female learners across co-educational, boys', and girls' secondary schools."),
            ("bullet", "Socio-Economic Status: Low to lower-middle socio-economic status. Specifically targets public Sub-County Day Secondary Schools in rural counties and informal urban settlements operating under constrained Free Day Secondary Education (FDSE) capitation without dedicated laboratory facilities or chemical procurement budgets.")
        ]),
        ("Importance of Addressing Problem", [
            ("bold", "Critical Empirical & Curricular Gap:"),
            ("bullet", "KCSE Chemistry Paper 3 (Subject Code 233/3) carries 40% of the candidate's final national Chemistry grade. Mastering Paper 3 demands meticulous hands-on manipulative precision: purging air bubbles, aligning the burette meniscus, executing dropwise titration, achieving concordant titres within ±0.10 cm³, and systematic qualitative ionic deductions."),
            ("bullet", "Over 60% of public secondary schools (and >74% in rural sub-counties) lack functional laboratories, piped water, or consumable reagents, reducing chemistry instruction to theoretical chalkboard lectures and depriving candidates of necessary tactile manipulation experience."),
            ("bullet", "Existing digital interventions (PhET, Labster, ChemCollective, CEMASTEA Virtual Labs) fail in low-resource Kenyan classrooms: they require continuous high-bandwidth internet, depend on heavy 3D GPU graphics that crash on budget 1 GB RAM Android phones, omit authentic KNEC scoring rubrics (such as the ±0.10 cm³ concordance rule), lack bilingual Kiswahili scaffolding, or impose unaffordable recurring per-seat subscription fees."),
            ("bullet", "VirtuLab Kenya bridges this gap by providing an offline-first (<3.5 MB), zero-marginal-cost Progressive Web App engineered specifically for low-cost mobile devices and aligned 100% with the KICD syllabus and KNEC scoring standards.")
        ]),
        ("Social Challenge", [
            ("bold", "Educational Inequity and Structural Disparity in Secondary STEM Education:"),
            ("normal", "A profound infrastructural divide separates elite National/Extra-County boarding schools from under-resourced Sub-County day schools. Learners attending rural and poor urban schools are systematically disadvantaged in national practical science examinations not due to lack of intellectual capability, but due to severe laboratory infrastructure deficits. This disparity depresses national mean scores, disqualifies underprivileged youth from competitive tertiary STEM degree programs (medicine, pharmacy, engineering, computer science), and perpetuates intergenerational socio-economic inequality.")
        ]),
        ("Value to Society", [
            ("bullet", "Democratization of Practical Science: Extends safe, repeated, inquiry-based chemistry experimentation to every secondary learner in Kenya regardless of school tier or geographic location."),
            ("bullet", "Academic Achievement & Anxiety Reduction: Empirically improves practical competencies, data tabulation, and stoichiometric calculation accuracy while significantly mitigating chemistry practical examination dread."),
            ("bullet", "Substantial Economic Savings: Eliminates recurrent expenditures for expensive laboratory reagents (silver nitrate, potassium manganate(VII), barium chloride) and glassware breakages in financially distressed public schools."),
            ("bullet", "Laboratory Safety: Guarantees zero risk of chemical burns, acid spills, toxic gas inhalation, or hazardous waste disposal in overcrowded, unventilated classrooms."),
            ("bullet", "Teacher Empowerment & Remediation: Equips science teachers with automated assignment dispatch tools and a real-time diagnostic error-telemetry dashboard that pinpoints individual student misconceptions prior to national examinations.")
        ]),
        ("Client Role", [
            ("bold", "Is the client (user affected by the learning need) the financier? No."),
            ("bullet", "Explanation: The primary end-users—secondary school learners and science educators in resource-constrained public schools—are not the financiers. The target learners come from low-income households attending subsidized public day schools that lack discretionary funding for EdTech."),
            ("bullet", "Financing & Sustainability: The project is self-financed and developed as a postgraduate academic research initiative by the researcher (total lean operational budget of KES 328,900 / ~$2,530 covering tablet hardware kits, cloud infrastructure, and field logistics) at the Open University of Kenya."),
            ("bullet", "VirtuLab Kenya is architected as a Zero-Marginal-Cost Open Educational Resource (OER) to be provided completely free of charge to public schools, with long-term scaling pursued through institutional partnerships with KICD, CEMASTEA, and the Ministry of Education.")
        ]),
        ("Visualization Techniques", [
            ("bullet", "Theoretical & Conceptual Framework Maps: Diagrams synthesizing Bybee's 5E Instructional Model (Engage, Explore, Explain, Elaborate, Evaluate), Mayer's Cognitive Theory of Multimedia Learning (CTML), Sweller's Cognitive Load Theory (CLT), and Venkatesh's TAM 3 / UTAUT adoption models."),
            ("bullet", "Storyboards & Learner Journey Maps: Step-by-step visual storyboards illustrating the five-phase student interaction workflow (Apparatus Priming → Dropwise Burette Manipulation → Meniscus Alignment → KNEC Table Tabulation → Stoichiometric Deduction)."),
            ("bullet", "System Architecture & Offline Dataflow Schematics: Technical diagrams detailing the three-tier offline-first architecture (Cache-First Service Worker, IndexedDB/LocalStorage sync queue, Node.js Express REST API, PostgreSQL database)."),
            ("bullet", "Apparatus Engineering Schematics & Viewfinders: High-fidelity SVG apparatus diagrams featuring calibrated burette tubes, thermodynamic Bunsen burner flame cones, and magnified meniscus lens viewfinders with ±0.10 cm³ precision.")
        ]),
        ("Success Criteria", [
            ("bold", "The success of the capstone intervention is quantitatively and qualitatively benchmarked against seven empirical criteria:"),
            ("bullet", "1. Cognitive Practical Mastery: Statistically significant post-test gain (p < 0.05) on the 40-mark Chemistry Practical Competency Achievement Test (CPCAT) with an average normalized learning gain of <g> ≥ 0.40 over the control group via a Two-Level Linear Mixed-Effects Model (LMM)."),
            ("bullet", "2. Examination Anxiety Reduction: Statistically significant reduction (p < 0.05) in practical anxiety scores on the 20-item Chemistry Practical Anxiety Scale (CPAS)."),
            ("bullet", "3. Software Usability Benchmark: Brooke's System Usability Scale (SUS) score of ≥ 78 (Grade A) across both student and teacher cohorts."),
            ("bullet", "4. Technology Acceptance Rating: Mean evaluation score of ≥ 4.0 out of 5.0 across TAM 3 adoption constructs (Perceived Usefulness, Perceived Ease of Use, Facilitating Conditions, Behavioral Intention)."),
            ("bullet", "5. Sub-County Student Engagement: Active participation of ≥ 150 unique sub-county day school learners logging simulation trials during the intervention (≥ 300 cumulative post-crossover)."),
            ("bullet", "6. Telemetry Predictive Validity: Statistically significant correlation (r ≥ 0.50, p < 0.01) between in-app procedural telemetry error rates and paper-based post-test deductions."),
            ("bullet", "7. Curriculum & Examination Validation: 100% alignment with KICD Secondary Chemistry designs and KNEC Paper 3 rubrics, verified through formal review by certified national examiners.")
        ]),
        ("Beneficiaries & Stakeholders", [
            ("bold", "Primary Beneficiaries:"),
            ("bullet", "Secondary Chemistry Learners (Forms 1–4 / Grades 10–12): Direct access to safe, autonomous, bilingual practical simulation practice; mastery of KNEC exam routines; reduced exam anxiety; enhanced KCSE performance."),
            ("bullet", "Secondary Chemistry Educators: Automated assignment dispatch, eliminated bench setup workload, and objective diagnostic telemetry to target remedial teaching."),
            ("bullet", "Resource-Constrained Public Schools: Overcoming physical laboratory deficits without incurring recurring reagent, glassware, or laboratory technician costs."),
            ("bullet", "Parents & Guardians: Relief from extra laboratory levies and enhanced tertiary STEM admission opportunities for their children."),
            ("bold", "Key Institutional Stakeholders:"),
            ("bullet", "Open University of Kenya (School of Education): Academic awarding and institutional research supervision authority."),
            ("bullet", "Ministry of Education (MoE): National policy coordination, digital literacy initiatives, and senior secondary STEM pathways."),
            ("bullet", "Kenya Institute of Curriculum Development (KICD): Curriculum alignment, digital content vetting, and official educational accreditation."),
            ("bullet", "Kenya National Examinations Council (KNEC): National examination body setting assessment rubrics for KCSE Chemistry Paper 3."),
            ("bullet", "CEMASTEA: National in-service teacher capacity building and institutional partner for virtual laboratory pedagogical training."),
            ("bullet", "NACOSTI: National ethical clearance and scientific research licensing authority."),
            ("bullet", "School Boards of Management (BOM) & Principals: School-level authorization, timetabling, and ICT infrastructure access.")
        ])
    ]

    # Create Table
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Widths: Aspect = 2.0 inches, Information = 4.9 inches (Total = 6.9 inches, fits 8.5" width with 0.8" margins)
    col_widths = [Inches(2.0), Inches(4.9)]
    set_table_borders(table, color="B0BEC5", sz="4", val="single")

    # Header Row
    hdr_cells = table.rows[0].cells
    hdr_cells[0].width = col_widths[0]
    hdr_cells[1].width = col_widths[1]

    hdr_cells[0].text = "Aspect"
    hdr_cells[1].text = "Information"

    for i, cell in enumerate(hdr_cells):
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        set_cell_background(cell, "0F2D59") # Dark Navy Blue
        set_cell_margins(cell, top=140, bottom=140, left=160, right=160)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT if i == 0 else WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.0
        for run in p.runs:
            run.font.name = 'Calibri'
            run.font.bold = True
            run.font.size = Pt(10.5)
            run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    # Data Rows
    for row_idx, (aspect_text, info_items) in enumerate(table_data):
        row = table.add_row()
        c_aspect = row.cells[0]
        c_info = row.cells[1]

        c_aspect.width = col_widths[0]
        c_info.width = col_widths[1]

        c_aspect.vertical_alignment = WD_ALIGN_VERTICAL.TOP
        c_info.vertical_alignment = WD_ALIGN_VERTICAL.TOP

        # Aspect styling
        set_cell_background(c_aspect, "F4F6F9") # Soft grey/blue tint
        set_cell_margins(c_aspect, top=120, bottom=120, left=140, right=140)
        p_asp = c_aspect.paragraphs[0]
        p_asp.paragraph_format.space_after = Pt(0)
        p_asp.paragraph_format.line_spacing = 1.15
        run_asp = p_asp.add_run(aspect_text)
        run_asp.font.name = 'Calibri'
        run_asp.font.bold = True
        run_asp.font.size = Pt(10)
        run_asp.font.color.rgb = RGBColor(0x0F, 0x2D, 0x59)

        # Info styling
        # Alternate subtle row background for readability: white vs very light cream/grey
        info_bg = "FFFFFF" if row_idx % 2 == 0 else "FBFCFD"
        set_cell_background(c_info, info_bg)
        set_cell_margins(c_info, top=120, bottom=120, left=160, right=160)

        for item_idx, item in enumerate(info_items):
            item_type, item_text = item
            if item_idx == 0:
                p_inf = c_info.paragraphs[0]
            else:
                p_inf = c_info.add_paragraph()

            p_inf.paragraph_format.line_spacing = 1.15
            p_inf.paragraph_format.space_after = Pt(3)

            if item_type == "bold":
                run = p_inf.add_run(item_text)
                run.font.name = 'Calibri'
                run.font.bold = True
                run.font.size = Pt(10)
                run.font.color.rgb = RGBColor(0x11, 0x11, 0x11)
            elif item_type == "normal":
                run = p_inf.add_run(item_text)
                run.font.name = 'Calibri'
                run.font.size = Pt(10)
                run.font.color.rgb = RGBColor(0x2A, 0x2A, 0x2A)
            elif item_type == "bullet":
                p_inf.paragraph_format.left_indent = Inches(0.2)
                p_inf.paragraph_format.first_line_indent = Inches(-0.15)
                bullet_run = p_inf.add_run("•  ")
                bullet_run.font.name = 'Calibri'
                bullet_run.font.bold = True
                bullet_run.font.color.rgb = RGBColor(0x0F, 0x2D, 0x59)

                # Check if item_text has a bold lead-in (e.g., "Heading: description")
                if ":" in item_text and not item_text.startswith("http"):
                    parts = item_text.split(":", 1)
                    lead_run = p_inf.add_run(parts[0] + ":")
                    lead_run.font.name = 'Calibri'
                    lead_run.font.bold = True
                    lead_run.font.size = Pt(9.5)
                    lead_run.font.color.rgb = RGBColor(0x22, 0x22, 0x22)

                    body_run = p_inf.add_run(parts[1])
                    body_run.font.name = 'Calibri'
                    body_run.font.size = Pt(9.5)
                    body_run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
                else:
                    body_run = p_inf.add_run(item_text)
                    body_run.font.name = 'Calibri'
                    body_run.font.size = Pt(9.5)
                    body_run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)

    # Spacing before signature section
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Signature Section
    p_sig_hdr = doc.add_paragraph()
    p_sig_hdr.paragraph_format.space_after = Pt(6)
    run_sig_hdr = p_sig_hdr.add_run("DECLARATION & INSTITUTIONAL ENDORSEMENT")
    run_sig_hdr.font.name = 'Calibri'
    run_sig_hdr.font.bold = True
    run_sig_hdr.font.size = Pt(10.5)
    run_sig_hdr.font.color.rgb = RGBColor(0x0F, 0x2D, 0x59)

    sig_table = doc.add_table(rows=2, cols=2)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_table.autofit = False
    set_table_borders(sig_table, color="D0D7DE", sz="4", val="single")

    sig_widths = [Inches(3.45), Inches(3.45)]
    for row in sig_table.rows:
        for idx, cell in enumerate(row.cells):
            cell.width = sig_widths[idx]
            set_cell_background(cell, "FAFAFA")
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)

    # Cell 0,0: Candidate Declaration
    c00 = sig_table.cell(0, 0)
    p = c00.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("Candidate's Signature:")
    r.font.bold = True
    r.font.size = Pt(9.5)
    p2 = c00.add_paragraph()
    p2.paragraph_format.space_after = Pt(4)
    p2.add_run("_______________________________________").font.size = Pt(9.5)
    p3 = c00.add_paragraph()
    p3.paragraph_format.space_after = Pt(1)
    r_name = p3.add_run("Harrison Tellah Museni")
    r_name.font.bold = True
    r_name.font.size = Pt(9.5)
    p4 = c00.add_paragraph()
    p4.paragraph_format.space_after = Pt(0)
    p4.add_run("Reg. No: ED61/6061/2025").font.size = Pt(9)

    # Cell 0,1: Candidate Date
    c01 = sig_table.cell(0, 1)
    p = c01.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("Submission Date:")
    r.font.bold = True
    r.font.size = Pt(9.5)
    p2 = c01.add_paragraph()
    p2.paragraph_format.space_after = Pt(4)
    p2.add_run("Date: __________________________________").font.size = Pt(9.5)
    p3 = c01.add_paragraph()
    p3.paragraph_format.space_after = Pt(0)
    p3.add_run("Academic Year: 2026 / 2027").font.size = Pt(9)

    # Cell 1,0: Supervisor Approval
    c10 = sig_table.cell(1, 0)
    p = c10.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("University Supervisor Approval:")
    r.font.bold = True
    r.font.size = Pt(9.5)
    p2 = c10.add_paragraph()
    p2.paragraph_format.space_after = Pt(4)
    p2.add_run("_______________________________________").font.size = Pt(9.5)
    p3 = c10.add_paragraph()
    p3.paragraph_format.space_after = Pt(1)
    r_sup = p3.add_run("Prof. Wambua Benjamin Kyalo, PhD")
    r_sup.font.bold = True
    r_sup.font.size = Pt(9.5)
    p4 = c10.add_paragraph()
    p4.paragraph_format.space_after = Pt(0)
    p4.add_run("School of Education – Technology Education").font.size = Pt(9)

    # Cell 1,1: Supervisor Date
    c11 = sig_table.cell(1, 1)
    p = c11.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("Supervisor Endorsement Date:")
    r.font.bold = True
    r.font.size = Pt(9.5)
    p2 = c11.add_paragraph()
    p2.paragraph_format.space_after = Pt(4)
    p2.add_run("Date: __________________________________").font.size = Pt(9.5)
    p3 = c11.add_paragraph()
    p3.paragraph_format.space_after = Pt(0)
    p3.add_run("Open University of Kenya").font.size = Pt(9)

    # Save documents
    target_dir = os.path.join(os.getcwd(), "docs")
    target_proposals = os.path.join(target_dir, "capstone_proposals")
    
    out_path1 = os.path.join(target_dir, "Capstone_Project_Participant_Information.docx")
    out_path2 = os.path.join(target_proposals, "Capstone_Project_Participant_Information.docx")
    
    doc.save(out_path1)
    print(f"Successfully generated: {out_path1}")
    
    doc.save(out_path2)
    print(f"Successfully generated copy: {out_path2}")

if __name__ == "__main__":
    build_document()
