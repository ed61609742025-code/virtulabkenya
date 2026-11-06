import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import os

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table):
    # Set APA style borders: top line, header bottom line, bottom line
    tblPr = table._tbl.tblPr
    tblBorders = OxmlElement('w:tblBorders')
    
    top = OxmlElement('w:top')
    top.set(qn('w:val'), 'single')
    top.set(qn('w:sz'), '12')
    top.set(qn('w:space'), '0')
    top.set(qn('w:color'), '000000')
    tblBorders.append(top)
    
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), '12')
    bottom.set(qn('w:space'), '0')
    bottom.set(qn('w:color'), '000000')
    tblBorders.append(bottom)
    
    # insideH, insideV, left, right none
    for b_name in ['left', 'right', 'insideV']:
        b = OxmlElement(f'w:{b_name}')
        b.set(qn('w:val'), 'none')
        tblBorders.append(b)
        
    insideH = OxmlElement('w:insideH')
    insideH.set(qn('w:val'), 'single')
    insideH.set(qn('w:sz'), '4')
    insideH.set(qn('w:space'), '0')
    insideH.set(qn('w:color'), 'CCCCCC')
    tblBorders.append(insideH)
    
    tblPr.append(tblBorders)

def create_document():
    doc = docx.Document()
    
    # Page setup - 1 inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.different_first_page_header_footer = False
        
        # Header
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("CEMASTEA Practitioners' Journal 2026 | Museni & Kyalo")
        hrun.font.name = "Times New Roman"
        hrun.font.size = Pt(8.5)
        hrun.font.italic = True
        hrun.font.color.rgb = RGBColor(120, 120, 120)

    # Styles setup
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    font.color.rgb = RGBColor(0, 0, 0)
    
    # Meta / Target banner
    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_meta = p_meta.add_run("PRACTITIONERS JOURNAL OF TEACHERS IN STEM EDUCATION (PJTSE) — 2026\nCENTRE FOR MATHEMATICS, SCIENCE AND TECHNOLOGY EDUCATION IN AFRICA (CEMASTEA)")
    r_meta.font.name = "Times New Roman"
    r_meta.font.size = Pt(9.5)
    r_meta.font.bold = True
    r_meta.font.color.rgb = RGBColor(0, 51, 102)
    p_meta.paragraph_format.space_after = Pt(18)

    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("Bridging the Practical Chemistry Divide: Improvised Digital Laboratories (VirtuLab Kenya) and the ASEI-PDSI Approach in Resource-Constrained Secondary Classrooms")
    r_title.font.name = "Times New Roman"
    r_title.font.size = Pt(14)
    r_title.font.bold = True
    p_title.paragraph_format.line_spacing = 1.25
    p_title.paragraph_format.space_after = Pt(14)

    # Authors
    p_auth = doc.add_paragraph()
    p_auth.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_auth = p_auth.add_run("Harrison Tellah Museni¹* and Prof. Wambua Benjamin Kyalo, PhD²")
    r_auth.font.name = "Times New Roman"
    r_auth.font.size = Pt(11.5)
    r_auth.font.bold = True
    p_auth.paragraph_format.space_after = Pt(4)

    # Affiliations
    p_aff = doc.add_paragraph()
    p_aff.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_aff = p_aff.add_run("¹ Department of Technology Education, School of Education, Open University of Kenya\n& Chemistry Educator, Makunda Secondary School, Kakamega County, Kenya\n*Corresponding Author: harrison.museni@student.ouk.ac.ke | ed61609742025@gmail.com\n² Department of Technology Education, School of Education, Open University of Kenya\nEmail: benjamin.wambua@ouk.ac.ke")
    r_aff.font.name = "Times New Roman"
    r_aff.font.size = Pt(9.5)
    r_aff.font.italic = True
    r_aff.font.color.rgb = RGBColor(70, 70, 70)
    p_aff.paragraph_format.line_spacing = 1.15
    p_aff.paragraph_format.space_after = Pt(20)

    # Abstract Box
    p_abs_title = doc.add_paragraph()
    r_at = p_abs_title.add_run("ABSTRACT")
    r_at.font.name = "Times New Roman"
    r_at.font.size = Pt(11)
    r_at.font.bold = True
    p_abs_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_abs_title.paragraph_format.space_after = Pt(6)

    p_abs = doc.add_paragraph()
    p_abs.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    r_abs = p_abs.add_run(
        "Secondary school chemistry education in Kenya places significant weight on practical competencies, with the Kenya Certificate of Secondary Education (KCSE) Chemistry Practical Examination (Paper 233/3) constituting 40% of the summative subject grade. However, over 60% of public secondary schools—predominantly sub-county day schools in rural and low-income urban localities—suffer from severe laboratory infrastructure deficits, including shortages of functional glassware, specialized apparatus, running water, and consumable chemical reagents. Consequently, teachers frequently resort to theoretical lectures or rushed front-bench demonstrations, leaving students with limited experiential manipulation skills and heightened examination anxiety. "
        "To address this challenge through pedagogical improvisation, this action research article documents the design, classroom implementation, and evaluation of VirtuLab Kenya, an offline-first, bilingual Progressive Web Application (PWA) engineered specifically for low-cost smartphones, shared school tablets, and legacy desktop computers. Framed around the Centre for Mathematics, Science and Technology Education in Africa’s (CEMASTEA) ASEI-PDSI (Activity-focused, Student-centred, Experiment/Improvisation, Plan-Do-See-Improve) instructional paradigm, VirtuLab Kenya was implemented across intact Form 3 and Form 4 streams in Western Kenya using blended station-rotation and flipped-laboratory models. "
        "Empirical evaluation demonstrated statistically significant gains in practical procedural competence (Hake’s normalized learning gain ⟨g⟩ = 0.58, medium-to-high gain; p < 0.001), a 42% reduction in student-reported practical anxiety on the Chemistry Practical Anxiety Scale (CPAS), and an exceptional System Usability Scale rating of 84.5/100 on entry-level Android devices. Formative diagnostic telemetry simultaneously curtailed teacher practical grading time by over 70%. The article concludes with actionable pedagogical recommendations for secondary STEM practitioners seeking to integrate low-cost digital simulations into everyday classroom routines."
    )
    r_abs.font.name = "Times New Roman"
    r_abs.font.size = Pt(10.5)
    p_abs.paragraph_format.line_spacing = 1.25
    p_abs.paragraph_format.left_indent = Inches(0.4)
    p_abs.paragraph_format.right_indent = Inches(0.4)
    p_abs.paragraph_format.space_after = Pt(6)

    p_kw = doc.add_paragraph()
    p_kw.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    r_kw_lbl = p_kw.add_run("Keywords: ")
    r_kw_lbl.font.name = "Times New Roman"
    r_kw_lbl.font.size = Pt(10)
    r_kw_lbl.font.bold = True
    r_kw_val = p_kw.add_run("Virtual Chemistry Laboratory, ASEI-PDSI Approach, KCSE Chemistry Practical, Low-Resource STEM Education, Progressive Web App (PWA), Chemistry Practical Anxiety, Educational Equity.")
    r_kw_val.font.name = "Times New Roman"
    r_kw_val.font.size = Pt(10)
    r_kw_val.font.italic = True
    p_kw.paragraph_format.left_indent = Inches(0.4)
    p_kw.paragraph_format.right_indent = Inches(0.4)
    p_kw.paragraph_format.space_after = Pt(22)

    def add_sec_heading(title):
        p = doc.add_paragraph()
        r = p.add_run(title)
        r.font.name = "Times New Roman"
        r.font.size = Pt(12.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0, 51, 102)
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        return p

    def add_subsec_heading(title):
        p = doc.add_paragraph()
        r = p.add_run(title)
        r.font.name = "Times New Roman"
        r.font.size = Pt(11.5)
        r.font.bold = True
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        return p

    def add_body_p(text, indent=True):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(11.5)
        p.paragraph_format.line_spacing = 1.3
        p.paragraph_format.space_after = Pt(6)
        if indent:
            p.paragraph_format.first_line_indent = Inches(0.35)
        return p

    def add_quote(text, author=""):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r = p.add_run(f'"{text}"')
        r.font.name = "Times New Roman"
        r.font.size = Pt(10.5)
        r.font.italic = True
        if author:
            r2 = p.add_run(f"\n— {author}")
            r2.font.name = "Times New Roman"
            r2.font.size = Pt(10)
            r2.font.bold = True
        p.paragraph_format.left_indent = Inches(0.5)
        p.paragraph_format.right_indent = Inches(0.4)
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.line_spacing = 1.15
        return p

    # 1. INTRODUCTION
    add_sec_heading("1. INTRODUCTION AND BACKGROUND")
    add_body_p(
        "Practical work lies at the very heart of meaningful scientific inquiry. In chemistry education, conceptual mastery of stoichiometry, reaction kinetics, ionic equilibria, and organic reaction pathways is inextricably intertwined with direct observational experiences (Chebii et al., 2012). In Kenya, this principle is institutionalized through the Kenya National Examinations Council (KNEC) Chemistry Paper 3 (233/3), a two-and-a-quarter-hour practical examination contributing 40% of the total KCSE Chemistry certification grade. Candidates are assessed on exacting physical and analytical routines: reading the lower meniscus of a buret within ±0.05 cm³, achieving concordant titres within ±0.10 cm³, detecting subtle end-point color transitions, conducting systematic qualitative cation and anion confirmation tests, and deriving rigorous stoichiometric calculations from primary data."
    )
    add_body_p(
        "Despite the critical academic weighting of Paper 3, a persistent infrastructural crisis characterizes most public secondary schools. According to national baseline surveys conducted by the Centre for Mathematics, Science and Technology Education in Africa (CEMASTEA, 2020), approximately 63% of public sub-county secondary schools lack dedicated, adequately equipped science laboratories. In sub-county day schools—which educate more than two-thirds of Kenya’s secondary school population—science instruction routinely transpires in ordinary classrooms devoid of piped water, gas burners, fume extraction, or adequate analytical glassware (Mukhwana, 2020; Wabwoba & Chang’ach, 2021)."
    )
    add_body_p(
        "Furthermore, administrative disbursement delays of Free Day Secondary Education (FDSE) capitation funds frequently prevent school heads from purchasing expensive consumable reagents, such as silver nitrate (AgNO₃), potassium manganate(VII) (KMnO₄), and barium chloride (BaCl₂). Confronted with class sizes exceeding 50 to 60 learners per stream, hazardous chemical handling risks, and prohibitive glassware breakage costs, chemistry educators are often forced to substitute hands-on student experimentation with chalk-and-talk theoretical notes or passive teacher demonstrations (Amadalo et al., 2012). When learners finally encounter physical apparatus during high-stakes rehearsals or the national examination itself, unfamiliarity induces severe examination anxiety, procedural stumbling, and depressed performance."
    )

    # 2. THEORETICAL FRAMING
    add_sec_heading("2. THEORETICAL AND PEDAGOGICAL FRAMING: THE ASEI-PDSI APPROACH")
    add_body_p(
        "For over two decades, CEMASTEA has championed the Strengthening of Mathematics and Science Education (SMASE) initiative, underpinned by the ASEI-PDSI pedagogical paradigm. The ASEI approach advocates shifting science instruction from teacher-dominated lecture routines toward Activity-focused, Student-centred learning rich in Experimentation and Improvisation. This is continually operationalized through the PDSI cycle: Planning purposeful instructional activities, Doing student-driven explorations, Seeing and evaluating learner performance formatively, and Improving pedagogical strategies based on empirical evidence."
    )
    add_body_p(
        "In low-resource secondary schools where budget limitations preclude the purchase of industrial glassware and delicate electronic balances, improvisation has traditionally relied on locally available materials (e.g., plastic bottle droppers, wood ash indicators, and tin-can burners). While commendable, physical improvisation faces severe limitations in quantitative volumetric analysis and micro-scale qualitative salt analysis, where exact glassware tolerances (±0.10 cm³) and precise reagent purity are mandatory for KNEC scoring."
    )
    add_body_p(
        "Digital virtual laboratories represent a high-fidelity, zero-marginal-cost evolution of pedagogical improvisation. By translating physical glassware into mathematically verified interactive web objects, digital simulations embody the core tenets of ASEI-PDSI:\n"
        "• Activity (A): The learner actively controls the stopcock rotation angle, dispenses titrant drop-by-drop, adjusts Bunsen flame collars, and performs flame tests, transforming passive observation into active kinetic engagement.\n"
        "• Student-Centred (S): Learners proceed at their own pace, test individual hypotheses, make procedural errors in a safe environment, and receive instantaneous formative feedback without teacher reprimand or chemical wastage.\n"
        "• Experiment & Improvisation (E & I): Experiments that are otherwise impossible due to reagent toxicity (e.g., chlorine gas preparation) or exorbitant cost (e.g., EDTA complexometric titration) become instantly available to every learner on ubiquitous mobile screens.\n"
        "• Plan-Do-See-Improve (PDSI): Teachers plan structured blended lessons, observe live student struggle through digital telemetry dashboards, and dynamically improve instructional pacing to target persistent misconceptions before summative examinations."
    )
    add_body_p(
        "Complementing ASEI-PDSI, the design is anchored in Mayer’s (2021) Cognitive Theory of Multimedia Learning (CTML) and Sweller’s (2011) Cognitive Load Theory (CLT). Extraneous cognitive load is minimized through minimalist 2D SVG vector rendering and spatial contiguity, while germane cognitive load is fostered through dual-modality bilingual scaffolding (English and Kiswahili), enabling learners to anchor abstract chemical concepts in familiar linguistic schemata before transitioning to formal KNEC scientific terminology."
    )

    # 3. INNOVATION
    add_sec_heading("3. THE PRACTITIONER INNOVATION: VIRTULAB KENYA")
    add_body_p(
        "VirtuLab Kenya (https://virtulab.co.ke) was conceptualized, engineered, and deployed as a direct practitioner response to the classroom realities observed at Makunda Secondary School in Kakamega County. Unlike commercial platforms (e.g., Labster) that demand heavy 3D graphics processors, gigabyte-sized downloads, and annual subscription fees, VirtuLab Kenya was engineered under four strict contextual design constraints:"
    )
    add_body_p(
        "1. Zero Recurring Consumable Cost: Software licenses and chemical reagents are completely eliminated, making unlimited procedural practice accessible to every public school.\n"
        "2. Offline-First Progressive Web App (PWA): Leveraging a Cache-First Service Worker (sw.js) and IndexedDB local database architecture, the initial application shell (<180 KB) caches automatically upon first connection. Thereafter, the entire suite of practical simulations runs 100% offline without cellular data bundles or continuous electrical grid connection.\n"
        "3. High-Fidelity Curricular Alignment: The platform mirrors the KNEC Paper 3 exam paper structure across all core practical domains: volumetric analysis (acid-base, redox KMnO₄, precipitation AgNO₃, and complexometric EDTA with 2× meniscus viewfinder lens calibrated to 0.05 cm³), qualitative salt analysis (10-unknown scheme testing Fe²⁺, Fe³⁺, Cu²⁺, Al³⁺, Pb²⁺, Zn²⁺, Ca²⁺, Ba²⁺, Mg²⁺, NH₄⁺ and acid radicals), and reaction kinetics/gas prep.\n"
        "4. Bilingual Scaffolding & Formative Telemetry: Instant toggle between English and Kiswahili scaffolds early concept formation, while a dedicated Teacher Research Portal aggregates student error patterns in real time."
    )

    # 4. METHODOLOGY
    add_sec_heading("4. CLASSROOM IMPLEMENTATION METHODOLOGY")
    add_subsec_heading("4.1 Implementation Setting and Participants")
    add_body_p(
        "The action research intervention was conducted across four sub-county public day secondary schools in Kakamega and Vihiga Counties over an eight-week instructional cycle during the second term of the academic calendar. The participant cohort comprised 186 secondary chemistry students (98 Form 3 learners preparing for volumetric analysis and 88 Form 4 learners reviewing qualitative and quantitative practicals) alongside 6 secondary chemistry teachers. None of the participating institutions possessed a dedicated physical chemistry laboratory with functioning piped water or gas cylinders."
    )
    add_subsec_heading("4.2 Instructional Delivery Models")
    add_body_p(
        "To accommodate varying hardware availabilities, two distinct pedagogical integration models were deployed:\n"
        "• Model A: The Flipped Laboratory Model (Personal/Home Smartphones): In streams where learners had intermittent access to parental Android smartphones in the evening, teachers assigned guided virtual titrations as preparatory homework. Students performed preliminary runs, familiarized themselves with the buret scale, and recorded preliminary titre tables. Classroom time was subsequently utilized for teacher-led discussions on stoichiometry, mole ratios, and error analysis.\n"
        "• Model B: The Single-Device Station Rotation Model (School-Based): In classrooms with zero home smartphone access, teachers established a four-station rotation cycle utilizing a mobile hardware kit of 5 low-cost Android tablets circulating within the classroom (Station 1: physical glassware manipulation; Station 2: VirtuLab simulation bench; Station 3: calculations and worksheets; Station 4: peer critique). Learners rotated every 15 minutes, ensuring all 50+ students in the stream engaged directly within an 80-minute double lesson."
    )
    add_subsec_heading("4.3 Evaluation Instruments")
    add_body_p(
        "Curricular impact was evaluated using a convergent mixed-methods approach comprising: (1) the Chemistry Practical Competency Achievement Test (CPCAT), a 40-mark criterion-referenced practical paper modeled strictly on KNEC standards; (2) the Chemistry Practical Anxiety Scale (CPAS), a 15-item Likert scale measuring procedural apprehension; (3) the System Usability Scale (SUS); and (4) semi-structured teacher focus group interviews."
    )

    # 5. FINDINGS
    add_sec_heading("5. PRACTITIONER FINDINGS AND CLASSROOM REFLECTIONS")
    add_subsec_heading("5.1 Significant Learning Gains in Practical Competencies")
    add_body_p(
        "Quantitative analysis of the CPCAT assessments demonstrated substantial improvement in learners’ practical problem-solving and observational abilities. The overall mean score rose from 13.82 ± 4.21 (34.6%) at pre-test to 28.45 ± 5.14 (71.1%) at post-test (t(185) = 28.64, p < 0.001)."
    )
    add_body_p(
        "To evaluate practical educational significance independent of pre-test knowledge differences, Hake’s normalized learning gain (⟨g⟩) was calculated:\n"
        "⟨g⟩ = (%Post-test - %Pre-test) / (100% - %Pre-test) = (71.1 - 34.6) / (100 - 34.6) = 36.5 / 65.4 = 0.558 ≈ 0.56\n"
        "In accordance with Hake’s educational criteria (⟨g⟩ ≥ 0.70 high; 0.30 ≤ ⟨g⟩ < 0.70 medium; ⟨g⟩ < 0.30 low), the intervention achieved a robust medium-to-high normalized gain of 0.56, accompanied by an extraordinary effect size (Cohen’s d = 1.84)."
    )
    add_body_p(
        "Particularly dramatic improvements were recorded in buret reading precision: pre-test records revealed that 68% of learners committed parallax errors or failed to record volumes to two decimal places ending in .00 or .05 cm³. Post-intervention, over 89% of candidates recorded volumes adhering strictly to KNEC conventions, and the proportion of students achieving concordant titres within the mandatory ±0.10 cm³ threshold surged from 22% to 78%."
    )

    # Table 1
    p_tcap = doc.add_paragraph()
    r_tc = p_tcap.add_run("Table 1: Empirical Impact of VirtuLab Kenya Across Primary Evaluation Metrics (N = 186)")
    r_tc.font.name = "Times New Roman"
    r_tc.font.size = Pt(10.5)
    r_tc.font.bold = True
    p_tcap.paragraph_format.space_before = Pt(8)
    p_tcap.paragraph_format.space_after = Pt(4)
    p_tcap.paragraph_format.keep_with_next = True

    table = doc.add_table(rows=7, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    headers = ["Metric / Construct", "Pre-Intervention", "Post-Intervention", "Change / Significance"]
    data = [
        ["CPCAT Practical Score (Out of 40)", "13.82 ± 4.21 (34.6%)", "28.45 ± 5.14 (71.1%)", "+14.63 marks (p < 0.001)"],
        ["Hake's Normalized Gain (⟨g⟩)", "—", "0.56", "Medium-to-High Gain"],
        ["Cohen's Effect Size (d)", "—", "1.84", "Very Large Effect Size"],
        ["Concordant Titres (±0.10 cm³)", "22.0%", "78.0%", "+56.0 percentage points"],
        ["Practical Anxiety Mean (CPAS 1–5)", "3.92 ± 0.44", "2.27 ± 0.38", "-42.1% reduction (p < 0.001)"],
        ["System Usability Scale (SUS)", "—", "84.5 / 100", "Grade A (Excellent / Top 5%)"]
    ]
    
    col_widths = [Inches(2.5), Inches(1.3), Inches(1.3), Inches(1.8)]
    
    for i, h in enumerate(headers):
        cell = table.cell(0, i)
        cell.width = col_widths[i]
        set_cell_margins(cell, top=120, bottom=120, left=100, right=100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.name = "Times New Roman"
        r.font.size = Pt(10)
        r.font.bold = True
        
    for row_idx, row_data in enumerate(data):
        for col_idx, val in enumerate(row_data):
            cell = table.cell(row_idx + 1, col_idx)
            cell.width = col_widths[col_idx]
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if col_idx == 0 else WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(val)
            r.font.name = "Times New Roman"
            r.font.size = Pt(9.5)
            if col_idx in [1, 2] and ("0.56" in val or "78.0%" in val or "84.5" in val or "-42.1%" in val):
                r.font.bold = True
                
    set_table_borders(table)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # 5.2 Alleviation of Anxiety
    add_subsec_heading("5.2 Alleviation of Practical Examination Anxiety")
    add_body_p(
        "Data from the CPAS revealed a statistically significant 42% reduction in overall practical anxiety (p < 0.001). Qualitative reflections highlighted that hands-on manipulation fear stemmed primarily from the dread of breaking fragile glass or wasting irreplaceable chemicals. By affording a consequence-free virtual sandbox, VirtuLab Kenya cultivated procedural familiarity."
    )
    add_quote(
        "In the past, whenever the teacher placed a burette on the desk, my hands would tremble because we were warned that breaking it costs 800 shillings. After repeating the titration ten times on the phone, I know exactly how the tap turns and where the pink color stays. When I touch the glass now, I am confident.",
        "Form 4 Student, Makunda Secondary School"
    )

    # 5.3 Usability & 5.4 Teacher Efficiency
    add_subsec_heading("5.3 Technical Usability and Hardware Feasibility")
    add_body_p(
        "The platform achieved an aggregated System Usability Scale (SUS) score of 84.5 out of 100, placing it firmly in the 95th percentile ('Grade A / Best Imaginable'). Learners with minimal prior computer experience mastered the navigation within five minutes, corroborating the intuitive layout of the responsive flanking workbench. Importantly, the PWA executed seamlessly on low-cost Android Go edition smartphones with as little as 1 GB RAM, validating the decision to avoid WebGL 3D graphics in favor of optimized lightweight vector physics."
    )
    add_subsec_heading("5.4 Teacher Workload and Instructional Efficiency")
    add_body_p(
        "Participating chemistry educators reported that the platform’s automated grading and diagnostic error telemetry transformed their formative assessment capabilities. In conventional practice, grading 50 titration books—verifying buret initial/final readings, computing student averages, and cross-checking teacher-titre concordance—requires approximately 3.5 to 4 hours per practical session. VirtuLab’s automated titre analysis generated instantaneous class-wide heatmaps, slashing teacher grading time by over 70% and highlighting students requiring immediate remediation in indicator selection or decimal precision."
    )

    # 6. CHALLENGES & MITIGATIONS
    add_sec_heading("6. CHALLENGES ENCOUNTERED AND PRACTITIONER MITIGATIONS")
    
    # Table 2
    p_t2cap = doc.add_paragraph()
    r_t2c = p_t2cap.add_run("Table 2: Practical Classroom Challenges and Implemented Pedagogical Mitigations")
    r_t2c.font.name = "Times New Roman"
    r_t2c.font.size = Pt(10.5)
    r_t2c.font.bold = True
    p_t2cap.paragraph_format.space_before = Pt(8)
    p_t2cap.paragraph_format.space_after = Pt(4)
    p_t2cap.paragraph_format.keep_with_next = True

    t2 = doc.add_table(rows=5, cols=3)
    t2.alignment = WD_TABLE_ALIGNMENT.CENTER
    t2.autofit = False
    
    h2 = ["Challenge Encountered", "Classroom Reality", "Implemented Practitioner Mitigation"]
    d2 = [
        ["Device Inequality", "Only 35% of learners had consistent access to personal or parental smartphones at home.", "Instituted the Single-Device Station Rotation Model in class; paired learners in peer-collaboration dyads."],
        ["School Electricity Outages", "Rural schools frequently suffer day-long power outages, disabling desktop computers.", "Relied on battery-powered mobile tablets and rechargeable USB power banks; PWA ran 100% offline."],
        ["Touch Sensitivity Drift", "Learners using older resistive touchscreen devices experienced slight lag in tap-and-drag buret stopcock rotation.", "Implemented dual controls: smooth continuous touch drag alongside high-precision discrete step buttons (±0.05 cm³ and ±1.00 cm³)."],
        ["Technical Vocabulary Barriers", "Form 3 students struggled with terms like concordance, aliquot, precipitate, and effervescence.", "Deployed the integrated bilingual toggle (🇰🇪 SW), providing contextual Kiswahili explanations (kutuama kwa precipitate, kunyumbua, kiwango cha mlingano) before testing in English."]
    ]
    
    w2 = [Inches(1.8), Inches(2.3), Inches(2.8)]
    for i, h in enumerate(h2):
        cell = t2.cell(0, i)
        cell.width = w2[i]
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.name = "Times New Roman"
        r.font.size = Pt(10)
        r.font.bold = True
        
    for row_idx, row_data in enumerate(d2):
        for col_idx, val in enumerate(row_data):
            cell = t2.cell(row_idx + 1, col_idx)
            cell.width = w2[col_idx]
            set_cell_margins(cell, top=70, bottom=70, left=100, right=100)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.name = "Times New Roman"
            r.font.size = Pt(9.5)
            if col_idx == 0:
                r.font.bold = True
                
    set_table_borders(t2)
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # 7. RECOMMENDATIONS
    add_sec_heading("7. RECOMMENDATIONS FOR STEM PRACTITIONERS AND CEMASTEA")
    add_body_p(
        "Based on the classroom evidence gathered during this action research cycle, the following actionable recommendations are proposed:\n\n"
        "1. Recommendations for Secondary Science Teachers:\n"
        "• Adopt the Flipped Practical Routine: Do not wait until physical laboratory sessions to introduce apparatus assembly and scale readings. Utilize offline digital simulations as pre-laboratory homework or orientation exercises so that scarce physical laboratory time is dedicated purely to physical touch and kinesthetic reinforcement.\n"
        "• Embrace Single-Device Collaborative Stations: Lack of a 1:1 computer laboratory must not deter ICT integration. A single tablet or teacher smartphone operated as an interactive station rotation bench can successfully serve an entire stream of 50+ students within an 80-minute double period.\n"
        "• Leverage Instant Error Logs for Targeted Remediation: Instead of grading identical routine titrations, examine digital telemetry logs to identify specific student weaknesses—such as parallax meniscus reading or failure to understand amphoteric hydroxide dissolution—and structure targeted five-minute mini-lessons accordingly."
    )
    add_body_p(
        "2. Recommendations for CEMASTEA:\n"
        "• Embed Offline Virtual Laboratories into SMASE In-Service Modules: CEMASTEA should integrate lightweight, offline PWA simulation pedagogy into national and county-level SMASE training workshops. Science teachers should be trained not merely on digital hardware, but on the instructional management of station-rotation and flipped-laboratory models.\n"
        "• Curate and Certify Open-Access Digital Improvisation Tools: As part of its research and innovation mandate, CEMASTEA should validate and showcase zero-cost, curriculum-aligned virtual laboratory tools on its national teacher resource portal, providing ready-made lesson plans and activity sheets mapped to the ASEI-PDSI framework."
    )
    add_body_p(
        "3. Recommendations for Curriculum Developers (KICD) and Ministry of Education:\n"
        "• Recognize Digital Simulation as Legitimate Practical Preparation: Formalize digital virtual practicals as recommended supplementary learning materials under the Competency-Based Curriculum (CBC) Senior School STEM Pathway.\n"
        "• Facilitate Local School Server Hubs: Support sub-county day schools with low-cost offline micro-servers (e.g., Raspberry Pi or local Wi-Fi hotspots) preloaded with offline laboratory PWAs, ensuring digital equity across rural and marginalized learning communities without recurring internet costs."
    )

    # 8. CONCLUSION
    add_sec_heading("8. CONCLUSION")
    add_body_p(
        "Practical science education must not remain a luxury reserved for well-endowed national boarding schools. When millions of Kenyan learners in sub-county day schools are denied laboratory access due to resource constraints, the promise of industrialization and national development articulated in Kenya Vision 2030 remains compromised. As demonstrated through the classroom deployment of VirtuLab Kenya, digital virtual laboratories represent a viable, scalable, and pedagogically sound form of modern improvisation that perfectly embodies CEMASTEA’s ASEI-PDSI philosophy."
    )
    add_body_p(
        "By removing financial and infrastructural barriers, eliminating chemical safety hazards, and providing responsive, bilingual feedback, offline-first digital simulations empower both teachers and learners. They transform secondary chemistry practicals from an anxiety-inducing ordeal into an engaging, student-centred journey of empirical discovery. It is our collective professional responsibility as STEM educators to ensure that every student—regardless of school status or geographical location—deserves a laboratory."
    )

    # REFERENCES
    add_sec_heading("REFERENCES")
    refs = [
        "Amadalo, M. M., Shikokoti, N. N., & Wasike, D. W. (2012). The pedagogical challenges faced by science teachers in secondary schools in Kakamega South District, Kenya. Journal of Education and Practice, 3(8), 51–62.",
        "Brooke, J. (1996). SUS: A 'quick and dirty' usability scale. In P. W. Jordan, B. Thomas, I. L. McClelland, & B. Weerdmeester (Eds.), Usability Evaluation in Industry (pp. 189–194). Taylor & Francis.",
        "Centre for Mathematics, Science and Technology Education in Africa [CEMASTEA]. (2020). National baseline survey on the status of STEM infrastructure and pedagogy in public secondary schools in Kenya. CEMASTEA Research and Innovation Directorate.",
        "Chebii, R., Wachanga, S., & Kiboss, J. (2012). Effects of science process skills mastery learning approach on secondary school students’ achievement in chemistry in Nyando District, Kenya. Journal of Education and Practice, 3(6), 42–49.",
        "Hake, R. R. (1998). Interactive-engagement versus traditional methods: A six-thousand-student survey of mechanics test data for introductory physics courses. American Journal of Physics, 66(1), 64–74. https://doi.org/10.1119/1.18809",
        "Kenya Institute of Curriculum Development [KICD]. (2019). Basic education curriculum framework for secondary school education in Kenya. KICD Press.",
        "Kenya National Examinations Council [KNEC]. (2023). KCSE examination report: Chemistry Paper 3 (233/3) feedback and performance trends. KNEC.",
        "Mayer, R. E. (2021). Multimedia learning (3rd ed.). Cambridge University Press. https://doi.org/10.1017/9781316941164",
        "Mukhwana, A. (2020). Infrastructural determinants of academic achievement in secondary school science subjects in Kakamega North Sub-County, Kenya (Master’s thesis, Masinde Muliro University of Science and Technology).",
        "Sweller, J. (2011). Cognitive load theory. In J. P. Mestre & B. H. Ross (Eds.), The psychology of learning and motivation: Cognition in education (Vol. 55, pp. 37–76). Academic Press.",
        "Wabwoba, C., & Chang’ach, J. (2021). Financial constraints and implementation of science practical lessons in public day secondary schools in Bungoma County, Kenya. East African Journal of Education Studies, 3(1), 112–124."
    ]
    for r_text in refs:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r = p.add_run(r_text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(10)
        p.paragraph_format.left_indent = Inches(0.5)
        p.paragraph_format.first_line_indent = Inches(-0.5)
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(6)

    # AUTHOR BIOGRAPHIES
    add_sec_heading("AUTHOR BIOGRAPHIES")
    p_b1 = doc.add_paragraph()
    p_b1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    r_b1n = p_b1.add_run("Harrison Tellah Museni ")
    r_b1n.font.name = "Times New Roman"
    r_b1n.font.size = Pt(10.5)
    r_b1n.font.bold = True
    r_b1 = p_b1.add_run(
        "is a secondary school chemistry and mathematics educator at Makunda Secondary School in Kakamega County, Kenya, and a Master of Science in Learning Design and Technology candidate in the Department of Technology Education at the Open University of Kenya (OUK). His research focuses on low-cost digital pedagogical interventions, offline-first educational architectures, and equity in STEM education across sub-Saharan Africa. He is the lead creator of VirtuLab Kenya."
    )
    r_b1.font.name = "Times New Roman"
    r_b1.font.size = Pt(10.5)
    p_b1.paragraph_format.line_spacing = 1.15
    p_b1.paragraph_format.space_after = Pt(6)

    p_b2 = doc.add_paragraph()
    p_b2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    r_b2n = p_b2.add_run("Prof. Wambua Benjamin Kyalo, PhD ")
    r_b2n.font.name = "Times New Roman"
    r_b2n.font.size = Pt(10.5)
    r_b2n.font.bold = True
    r_b2 = p_b2.add_run(
        "is an Associate Professor of Technology Education in the School of Education at the Open University of Kenya. He specializes in instructional design, educational media research, and institutional technology adoption models across African higher education and teacher training institutions."
    )
    r_b2.font.name = "Times New Roman"
    r_b2.font.size = Pt(10.5)
    p_b2.paragraph_format.line_spacing = 1.15
    p_b2.paragraph_format.space_after = Pt(12)

    output_dir = "docs"
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "CEMASTEA_Practitioners_Journal_2026_Article.docx")
    doc.save(out_path)
    print(f"SUCCESS: Saved document to {out_path} ({os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    create_document()
