import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def build_presentation(output_path):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5) # 16:9 Widescreen

    # Color Palette
    NAVY = RGBColor(12, 35, 64)       # #0C2340 Primary brand
    GOLD = RGBColor(197, 155, 39)     # #C59B27 Accent gold
    SLATE = RGBColor(71, 85, 105)     # #475569 Subtitles
    DARK = RGBColor(30, 41, 59)       # #1E293B Body text
    LIGHT_BG = RGBColor(248, 250, 252)# #F8FAFC
    CARD_BG = RGBColor(255, 255, 255) # Pure white cards
    BORDER_COL = RGBColor(226, 232, 240)
    ACCENT_BLUE = RGBColor(30, 58, 138)
    GREEN = RGBColor(22, 101, 52)

    blank_layout = prs.slide_layouts[6]

    def add_header(slide, title_text, category_text="CAPSTONE PROJECT PROPOSAL DEFENSE"):
        # Top banner background shape
        banner = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(1.15))
        banner.fill.solid()
        banner.fill.fore_color.rgb = NAVY
        banner.line.color.rgb = NAVY

        # Category tracker
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.12), Inches(11.7), Inches(0.3))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.name = "Arial"
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = GOLD

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.38), Inches(11.7), Inches(0.65))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.name = "Georgia"
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = RGBColor(255, 255, 255)

        # Gold decorative accent line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(1.15), Inches(13.333), Inches(0.06))
        line.fill.solid()
        line.fill.fore_color.rgb = GOLD
        line.line.color.rgb = GOLD

    def add_card(slide, left, top, width, height, title="", border_rgb=BORDER_COL, bg_rgb=CARD_BG):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_rgb
        card.line.color.rgb = border_rgb
        card.line.width = Pt(1.5)

        if title:
            tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), width - Inches(0.4), Inches(0.45))
            tf = tb.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = title
            p.font.name = "Georgia"
            p.font.size = Pt(13)
            p.font.bold = True
            p.font.color.rgb = NAVY

        return card

    # ==================== SLIDE 1: TITLE SLIDE ====================
    slide1 = prs.slides.add_slide(blank_layout)
    bg1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = NAVY
    bg1.line.color.rgb = NAVY

    # Institution
    tb_inst = slide1.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.333), Inches(0.6))
    p = tb_inst.text_frame.paragraphs[0]
    p.text = "OPEN UNIVERSITY OF KENYA  |  SCHOOL OF EDUCATION"
    p.font.name = "Arial"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = GOLD
    p.alignment = PP_ALIGN.CENTER

    p2 = tb_inst.text_frame.add_paragraph()
    p2.text = "DEPARTMENT OF TECHNOLOGY EDUCATION"
    p2.font.name = "Arial"
    p2.font.size = Pt(11)
    p2.font.color.rgb = RGBColor(200, 215, 235)
    p2.alignment = PP_ALIGN.CENTER

    # Project Title
    tb_title = slide1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.333), Inches(2.2))
    p = tb_title.text_frame.paragraphs[0]
    p.text = "VIRTULAB KENYA: DESIGN, DEVELOPMENT AND EVALUATION OF A WEB-BASED VIRTUAL CHEMISTRY LABORATORY FOR KCSE AND CBE LEARNERS IN KENYAN SECONDARY SCHOOLS"
    p.font.name = "Georgia"
    p.font.size = Pt(26)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)
    p.alignment = PP_ALIGN.CENTER

    # Gold separator
    sep = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(4.5), Inches(4.3), Inches(4.333), Inches(0.05))
    sep.fill.solid()
    sep.fill.fore_color.rgb = GOLD
    sep.line.color.rgb = GOLD

    # Degree Details
    tb_deg = slide1.shapes.add_textbox(Inches(1.0), Inches(4.6), Inches(11.333), Inches(0.6))
    p = tb_deg.text_frame.paragraphs[0]
    p.text = "Master of Science in Learning Design and Technology — Capstone Project Proposal Defense"
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.italic = True
    p.font.color.rgb = RGBColor(220, 230, 242)
    p.alignment = PP_ALIGN.CENTER

    # Author & Supervisor Box
    card_info = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(2.2), Inches(5.4), Inches(8.933), Inches(1.4))
    card_info.fill.solid()
    card_info.fill.fore_color.rgb = RGBColor(18, 48, 86)
    card_info.line.color.rgb = GOLD
    card_info.line.width = Pt(1.5)

    tb_cand = slide1.shapes.add_textbox(Inches(2.4), Inches(5.5), Inches(4.1), Inches(1.1))
    tf = tb_cand.text_frame
    p = tf.paragraphs[0]
    p.text = "CANDIDATE"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = GOLD
    p2 = tf.add_paragraph()
    p2.text = "Harrison Tellah Museni"
    p2.font.size = Pt(14)
    p2.font.bold = True
    p2.font.color.rgb = RGBColor(255, 255, 255)
    p3 = tf.add_paragraph()
    p3.text = "Reg. No: ED61/6061/2025"
    p3.font.size = Pt(11)
    p3.font.color.rgb = RGBColor(200, 215, 235)

    tb_sup = slide1.shapes.add_textbox(Inches(6.8), Inches(5.5), Inches(4.1), Inches(1.1))
    tf = tb_sup.text_frame
    p = tf.paragraphs[0]
    p.text = "UNIVERSITY SUPERVISOR"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = GOLD
    p2 = tf.add_paragraph()
    p2.text = "Prof. Wambua Benjamin Kyalo, PhD"
    p2.font.size = Pt(14)
    p2.font.bold = True
    p2.font.color.rgb = RGBColor(255, 255, 255)
    p3 = tf.add_paragraph()
    p3.text = "School of Education — Technology Education"
    p3.font.size = Pt(11)
    p3.font.color.rgb = RGBColor(200, 215, 235)


    # ==================== SLIDE 2: BACKGROUND & CONTEXT ====================
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "Background to the Study & National Context")

    # 3 Columns
    add_card(slide2, Inches(0.8), Inches(1.5), Inches(3.6), Inches(5.4), "National STEM Policy Mandate")
    tb = slide2.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(3.2), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Kenya’s Vision 2030 and the National Education Sector Strategic Plan (NESSP) place STEM at the heart of industrialisation and national socio-economic transformation."
    p.font.size = Pt(12)
    p.font.name = "Arial"
    p.font.color.rgb = DARK
    p2 = tf.add_paragraph()
    p2.text = "Both the ongoing Competency-Based Curriculum (CBC) transition and the 8-4-4 secondary framework demand active inquiry and hands-on experimentation over passive rote memorisation."
    p2.font.size = Pt(12)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK

    add_card(slide2, Inches(4.8), Inches(1.5), Inches(3.7), Inches(5.4), "KCSE Paper 3 (233/3) Weighting")
    tb = slide2.shapes.add_textbox(Inches(5.0), Inches(2.2), Inches(3.3), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "In secondary Chemistry, laboratory work constitutes a compulsory standalone national examination paper: KCSE Paper 3 (Subject Code 233/3)."
    p.font.size = Pt(12)
    p.font.name = "Arial"
    p.font.color.rgb = DARK
    p2 = tf.add_paragraph()
    p2.text = "Paper 3 commands 40% of the candidate's final Chemistry grade. A candidate cannot pass Chemistry without mastering practical laboratory techniques."
    p2.font.size = Pt(12)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK

    add_card(slide2, Inches(8.9), Inches(1.5), Inches(3.6), Inches(5.4), "Mandatory Exam Competencies")
    tb = slide2.shapes.add_textbox(Inches(9.1), Inches(2.2), Inches(3.2), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Precision burette handling, dropwise flow regulation, and meniscus zeroing to 0.05 cm³."
    p.font.size = Pt(11.5)
    p.font.name = "Arial"
    p.font.color.rgb = DARK
    p2 = tf.add_paragraph()
    p2.text = "Concordant titre determination within ±0.10 cm³ to ±0.20 cm³ tolerances."
    p2.font.size = Pt(11.5)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK
    p3 = tf.add_paragraph()
    p3.text = "Systematic qualitative analysis (cation/anion dropwise testing and gas identification)."
    p3.font.size = Pt(11.5)
    p3.font.name = "Arial"
    p3.font.color.rgb = DARK
    p4 = tf.add_paragraph()
    p4.text = "Reaction kinetics, thermochemical calculations (mcΔT), and organic functional testing."
    p4.font.size = Pt(11.5)
    p4.font.name = "Arial"
    p4.font.color.rgb = DARK


    # ==================== SLIDE 3: PROBLEM STATEMENT ====================
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "The Problem: The Secondary Laboratory Infrastructure Crisis")

    # Big Statistic Box
    stat_card = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(11.733), Inches(1.5))
    stat_card.fill.solid()
    stat_card.fill.fore_color.rgb = RGBColor(254, 242, 242) # soft red
    stat_card.line.color.rgb = RGBColor(239, 68, 68)
    stat_card.line.width = Pt(1.5)

    tb = slide3.shapes.add_textbox(Inches(1.1), Inches(1.6), Inches(11.1), Inches(1.3))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Over 60% of Kenyan secondary schools—predominantly public Sub-County Day Secondary Schools enrolling over 65% of all students—lack functional science laboratories, consumable reagents, piped water, or trained laboratory technicians."
    p.font.size = Pt(14)
    p.font.name = "Georgia"
    p.font.bold = True
    p.font.color.rgb = RGBColor(185, 28, 28)

    # 3 Root Cause Cards
    add_card(slide3, Inches(0.8), Inches(3.3), Inches(3.7), Inches(3.6), "Reagent Cost & Rationing")
    tb = slide3.shapes.add_textbox(Inches(1.0), Inches(3.9), Inches(3.3), Inches(2.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Chemical reagents (AgNO3, KMnO4, indicators) are costly and degrade rapidly. Schools operating on delayed FDSE capitation lock chemical stores until weeks before KCSE, denying students routine experimental practice."
    p.font.size = Pt(11.5)
    p.font.name = "Arial"
    p.font.color.rgb = DARK

    add_card(slide3, Inches(4.8), Inches(3.3), Inches(3.7), Inches(3.6), "Class Sizes & Safety Bottlenecks")
    tb = slide3.shapes.add_textbox(Inches(5.0), Inches(3.9), Inches(3.3), Inches(2.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Student-teacher ratios exceed 50:1. Conducting wet-chemistry with hot acids and toxic gases in crowded, unventilated rooms creates severe safety hazards. Teachers resort to theoretical chalkboard lectures."
    p.font.size = Pt(11.5)
    p.font.name = "Arial"
    p.font.color.rgb = DARK

    add_card(slide3, Inches(8.8), Inches(3.3), Inches(3.7), Inches(3.6), "The Failure of Global Virtual Labs")
    tb = slide3.shapes.add_textbox(Inches(9.0), Inches(3.9), Inches(3.3), Inches(2.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Foreign tools like Labster and PhET fail in rural Kenya: expensive subscriptions, heavy 3D graphics that crash budget Android phones, internet dependence, and zero alignment with KNEC Paper 3 rubrics."
    p.font.size = Pt(11.5)
    p.font.name = "Arial"
    p.font.color.rgb = DARK


    # ==================== SLIDE 4: PURPOSE & OBJECTIVES ====================
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "Project Purpose & Specific Research Objectives")

    # General Objective Card
    add_card(slide4, Inches(0.8), Inches(1.5), Inches(11.733), Inches(1.5), "General Objective", bg_rgb=RGBColor(240, 249, 255), border_rgb=ACCENT_BLUE)
    tb = slide4.shapes.add_textbox(Inches(1.1), Inches(2.05), Inches(11.1), Inches(0.85))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "To design, develop, deploy, and empirically evaluate an offline-first, KICD-aligned virtual chemistry laboratory platform (VirtuLab Kenya) that enables secondary school learners in under-resourced schools to acquire essential practical competencies and improve performance in KCSE Chemistry Paper 3."
    p.font.size = Pt(13)
    p.font.name = "Georgia"
    p.font.color.rgb = ACCENT_BLUE

    # Specific Objectives
    add_card(slide4, Inches(0.8), Inches(3.2), Inches(5.7), Inches(3.7), "Specific Objectives (Technical & Pedagogical)")
    tb = slide4.shapes.add_textbox(Inches(1.0), Inches(3.8), Inches(5.3), Inches(2.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "1. Design & Engineering: Build a lightweight, responsive PWA featuring 7 laboratory modules covering all KCSE Paper 3 domains with English/Kiswahili bilingual UI."
    p.font.size = Pt(11.5)
    p.font.name = "Arial"
    p.font.color.rgb = DARK
    p2 = tf.add_paragraph()
    p2.text = "2. Cognitive Scaffolding: Implement meniscus magnification, real-time color kinetics, concordance checks (±0.10 cm³), and step-by-step stoichiometry feedback."
    p2.font.size = Pt(11.5)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK
    p3 = tf.add_paragraph()
    p3.text = "3. Teacher Diagnostics: Develop a teacher analytics dashboard providing real-time class monitoring, error classification, and assignment dispatch."
    p3.font.size = Pt(11.5)
    p3.font.name = "Arial"
    p3.font.color.rgb = DARK

    add_card(slide4, Inches(6.8), Inches(3.2), Inches(5.733), Inches(3.7), "Specific Objectives (Evaluation & Policy)")
    tb = slide4.shapes.add_textbox(Inches(7.0), Inches(3.8), Inches(5.3), Inches(2.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "4. Empirical Evaluation: Conduct a convergent mixed-methods quasi-experimental pilot across 10 stratified schools (N ≈ 600 students, N ≈ 20 teachers) measuring learning gains, usability (SUS), and acceptance (TAM 3)."
    p.font.size = Pt(12)
    p.font.name = "Arial"
    p.font.color.rgb = DARK
    p2 = tf.add_paragraph()
    p2.text = "5. Policy & Dissemination: Formulate actionable policy guidelines and an open-access deployment framework for institutional adoption by KICD, CEMASTEA, and the Ministry of Education."
    p2.font.size = Pt(12)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK


    # ==================== SLIDE 5: RESEARCH QUESTIONS & HYPOTHESES ====================
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "Research Questions & Hypotheses")

    add_card(slide5, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.4), "Core Research Questions")
    tb = slide5.shapes.add_textbox(Inches(1.0), Inches(2.1), Inches(5.3), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "RQ1 (Learning Gains): To what extent does VirtuLab Kenya improve students' conceptual understanding and practical problem-solving scores in KCSE Paper 3 compared to traditional lecture/demonstration instruction?"
    p.font.size = Pt(11.5)
    p.font.name = "Arial"
    p.font.color.rgb = DARK
    p2 = tf.add_paragraph()
    p2.text = "RQ2 (Interface Usability): How usable, accessible, and responsive is the offline PWA interface on budget mobile devices in low-connectivity schools, as measured by the System Usability Scale (SUS ≥ 78)?"
    p2.font.size = Pt(11.5)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK
    p3 = tf.add_paragraph()
    p3.text = "RQ3 (Technological Acceptance): What are teachers' and students' perceptions regarding Perceived Usefulness, Perceived Ease of Use, and Behavioural Intention under TAM 3?"
    p3.font.size = Pt(11.5)
    p3.font.name = "Arial"
    p3.font.color.rgb = DARK
    p4 = tf.add_paragraph()
    p4.text = "RQ4 (Diagnostic Utility): How effectively do automated server error logs enable teachers to identify and remediate misconceptions in real time?"
    p4.font.size = Pt(11.5)
    p4.font.name = "Arial"
    p4.font.color.rgb = DARK

    add_card(slide5, Inches(6.8), Inches(1.5), Inches(5.733), Inches(5.4), "Empirical Hypotheses Tested")
    tb = slide5.shapes.add_textbox(Inches(7.0), Inches(2.1), Inches(5.3), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Null Hypothesis (H0):"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = RGBColor(185, 28, 28)
    p2 = tf.add_paragraph()
    p2.text = "There is no statistically significant difference in KCSE Chemistry Paper 3 post-test scores between learners using VirtuLab Kenya and learners taught through traditional classroom instruction without physical lab access (p > 0.05)."
    p2.font.size = Pt(12)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK

    p3 = tf.add_paragraph()
    p3.text = "Alternative Hypothesis (H1):"
    p3.font.size = Pt(13)
    p3.font.bold = True
    p3.font.color.rgb = GREEN
    p4 = tf.add_paragraph()
    p4.text = "Learners utilizing VirtuLab Kenya will demonstrate a statistically significant gain in post-test scores and practical competency metrics compared to the control group (p < 0.05, normalised learning gain g ≥ 0.40)."
    p4.font.size = Pt(12)
    p4.font.name = "Arial"
    p4.font.color.rgb = DARK


    # ==================== SLIDE 6: THEORETICAL FRAMEWORK ====================
    slide6 = prs.slides.add_slide(blank_layout)
    add_header(slide6, "Theoretical Grounding & Pedagogical Models")

    # 4 Cards
    add_card(slide6, Inches(0.8), Inches(1.5), Inches(2.75), Inches(5.4), "Constructivism & IBSE")
    tb = slide6.shapes.add_textbox(Inches(0.95), Inches(2.1), Inches(2.45), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Piaget (1973) & Bybee (2009)"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = GOLD
    p2 = tf.add_paragraph()
    p2.text = "Learners construct schemas through active variable manipulation (reagent volume, temperature, drop speed) and observing dynamic reactions. Operationalised via Bybee’s 5E Instructional Model (Engage, Explore, Explain, Elaborate, Evaluate)."
    p2.font.size = Pt(11)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK

    add_card(slide6, Inches(3.8), Inches(1.5), Inches(2.75), Inches(5.4), "Vygotsky's ZPD")
    tb = slide6.shapes.add_textbox(Inches(3.95), Inches(2.1), Inches(2.45), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Vygotsky (1978) - Scaffolding"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = GOLD
    p2 = tf.add_paragraph()
    p2.text = "Zone of Proximal Development is operationalised through a dual-tier interface: Guided Mode provides hints and validation for beginners, while Exam Mode removes scaffolds under timed KCSE conditions."
    p2.font.size = Pt(11)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK

    add_card(slide6, Inches(6.8), Inches(1.5), Inches(2.75), Inches(5.4), "CTML & Cognitive Load")
    tb = slide6.shapes.add_textbox(Inches(6.95), Inches(2.1), Inches(2.45), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Mayer (2009) & Sweller (1988)"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = GOLD
    p2 = tf.add_paragraph()
    p2.text = "Spatial Contiguity co-locates apparatus and readouts to prevent split attention. Signalling subtly flashes meniscus and end-point color cues. Segmenting partitions complex titration steps."
    p2.font.size = Pt(11)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK

    add_card(slide6, Inches(9.8), Inches(1.5), Inches(2.75), Inches(5.4), "Technology Acceptance")
    tb = slide6.shapes.add_textbox(Inches(9.95), Inches(2.1), Inches(2.45), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Davis (1989) & Venkatesh (2008)"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = GOLD
    p2 = tf.add_paragraph()
    p2.text = "TAM 3 evaluates Perceived Usefulness, Perceived Ease of Use, and Facilitating Conditions (device access, offline ability) as direct predictors of Behavioural Intention and sustained adoption."
    p2.font.size = Pt(11)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK


    # ==================== SLIDE 7: ARCHITECTURE & ZERO-BANDWIDTH ====================
    slide7 = prs.slides.add_slide(blank_layout)
    add_header(slide7, "System Architecture: Frugal, Offline-First Engineering")

    # 3 Tier Cards Horizontal
    add_card(slide7, Inches(0.8), Inches(1.5), Inches(11.733), Inches(1.6), "CLIENT TIER — Progressive Web App (PWA)", bg_rgb=RGBColor(241, 245, 249))
    tb = slide7.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.3), Inches(0.95))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Semantic HTML5, Modular Vanilla CSS3, Vanilla ECMAScript 2022 (Zero React/Vue bundle penalty). Service Worker Cache-First strategy. Runs 100% offline. Student dashboard, simulation engine, and local IndexedDB session cache. Cold load <250ms on 3G."
    p.font.size = Pt(11.5)
    p.font.name = "Arial"
    p.font.color.rgb = DARK

    add_card(slide7, Inches(0.8), Inches(3.3), Inches(11.733), Inches(1.6), "SERVER TIER — Node.js & Express REST API", bg_rgb=RGBColor(241, 245, 249))
    tb = slide7.shapes.add_textbox(Inches(1.0), Inches(3.8), Inches(11.3), Inches(0.95))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Express REST API Gateway (/api/auth, /api/sessions, /api/assignments). JWT verification, bcrypt password hashing, role-based access control (Student, Teacher, Admin), helmet security headers, and background telemetry synchronization queue."
    p.font.size = Pt(11.5)
    p.font.name = "Arial"
    p.font.color.rgb = DARK

    add_card(slide7, Inches(0.8), Inches(5.1), Inches(11.733), Inches(1.8), "DATABASE TIER — PostgreSQL Relational Schema", bg_rgb=RGBColor(241, 245, 249))
    tb = slide7.shapes.add_textbox(Inches(1.0), Inches(5.6), Inches(11.3), Inches(1.15))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Relational integrity with foreign keys across users, schools, classes, lab_sessions, assignments, badges, and error_telemetry. B-tree indexes for fast concurrent querying during classroom sync spikes. Full compliance with the Kenya Data Protection Act 2019."
    p.font.size = Pt(11.5)
    p.font.name = "Arial"
    p.font.color.rgb = DARK


    # ==================== SLIDE 8: 7 LABORATORY MODULES ====================
    slide8 = prs.slides.add_slide(blank_layout)
    add_header(slide8, "Curricular Alignment: 7 Core KCSE Paper 3 Modules")

    # Table of Modules
    rows = 8
    cols = 4
    tbl_shape = slide8.shapes.add_table(rows, cols, Inches(0.8), Inches(1.5), Inches(11.733), Inches(5.4))
    tbl = tbl_shape.table
    tbl.columns[0].width = Inches(2.2)
    tbl.columns[1].width = Inches(4.2)
    tbl.columns[2].width = Inches(3.5)
    tbl.columns[3].width = Inches(1.833)

    mod_data = [
        ("Module", "Simulated Chemical Experiment", "Target KCSE Practical Skills", "Syllabus Ref."),
        ("1. Volumetric Analysis", "Acid-Base, Redox, Precipitation, Complexometric Titrations", "Pipette priming, burette flow, end-point, concordant titres (±0.10 cm³)", "Form 3/4, Paper 3 Q1"),
        ("2. Qualitative Inorganic", "Cations (Fe2+, Cu2+, Al3+, etc.), Anions, Flame tests & gas tests", "Dropwise addition to excess, precipitate dissolution observation", "Form 4, Paper 3 Q2"),
        ("3. Chemical Kinetics", "Thiosulphate + acid (disappearing cross), Mg ribbon + acid volume", "Reaction rate curve plotting, gradient calculation, collision theory", "Form 4, Paper 3 Q3"),
        ("4. Chemical Energetics", "Enthalpy of neutralisation, enthalpy of solution & displacement", "Temperature-time cooling curve extrapolation, mcΔT calculation", "Form 4, Paper 3 Q3"),
        ("5. Solubility Curves", "KClO3 crystallisation temperature measurement across dilutions", "Cooling curve determination, solubility curve generation", "Form 3, Topic 4"),
        ("6. Qualitative Organic", "Saturated vs unsaturated, carboxylic acids, alkanol esterification", "Organic observation table recording, functional group deduction", "Form 4, Org Chem II"),
        ("7. Composite Mock Exam", "Full 3-question timed composite practical replicating KCSE Paper 3", "Exam pacing, data transcription, comprehensive mark-scheme grading", "All Forms (Summative)")
    ]

    for r_idx, row in enumerate(mod_data):
        for c_idx, val in enumerate(row):
            cell = tbl.cell(r_idx, c_idx)
            cell.text = val
            p = cell.text_frame.paragraphs[0]
            p.font.name = "Arial"
            if r_idx == 0:
                p.font.bold = True
                p.font.size = Pt(11)
                p.font.color.rgb = RGBColor(255, 255, 255)
                cell.fill.solid()
                cell.fill.fore_color.rgb = NAVY
            else:
                p.font.size = Pt(10)
                p.font.color.rgb = DARK
                if r_idx % 2 == 1:
                    cell.fill.solid()
                    cell.fill.fore_color.rgb = RGBColor(248, 250, 252)


    # ==================== SLIDE 9: RESEARCH METHODOLOGY ====================
    slide9 = prs.slides.add_slide(blank_layout)
    add_header(slide9, "Methodology: Convergent Mixed-Methods Quasi-Experiment")

    add_card(slide9, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.4), "Quasi-Experimental Design")
    tb = slide9.shapes.add_textbox(Inches(1.0), Inches(2.1), Inches(5.3), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Pre-test / Post-test Non-Equivalent Control Group Design"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    p2 = tf.add_paragraph()
    p2.text = "Due to established school streams, individual random assignment is impossible. Intact classroom streams participate."
    p2.font.size = Pt(11.5)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK
    p3 = tf.add_paragraph()
    p3.text = "• Experimental Group: Hybrid instruction using VirtuLab Kenya for pre-lab prep, guided simulation practice, and homework (8-week intervention)."
    p3.font.size = Pt(11.5)
    p3.font.name = "Arial"
    p3.font.color.rgb = DARK
    p4 = tf.add_paragraph()
    p4.text = "• Control Group: Traditional instruction (standard textbooks, chalkboard sketches, and teacher demonstrations) without virtual lab tools."
    p4.font.size = Pt(11.5)
    p4.font.name = "Arial"
    p4.font.color.rgb = DARK
    p5 = tf.add_paragraph()
    p5.text = "Threats to internal validity controlled through teacher pacing guides and statistical control via ANCOVA."
    p5.font.size = Pt(11.5)
    p5.font.name = "Arial"
    p5.font.color.rgb = DARK

    add_card(slide9, Inches(6.8), Inches(1.5), Inches(5.733), Inches(5.4), "Stratified Sampling Matrix (N ≈ 600)")
    tb = slide9.shapes.add_textbox(Inches(7.0), Inches(2.1), Inches(5.3), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Stratified Purposive & Multi-Stage Cluster Sampling"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    p2 = tf.add_paragraph()
    p2.text = "Stratum 1: National & Extra-County Schools (High physical lab infrastructure baseline) — 2 schools, n ≈ 120 students, 4 teachers."
    p2.font.size = Pt(11.5)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK
    p3 = tf.add_paragraph()
    p3.text = "Stratum 2: County Secondary Schools (Moderate lab infrastructure baseline) — 3 schools, n ≈ 180 students, 6 teachers."
    p3.font.size = Pt(11.5)
    p3.font.name = "Arial"
    p3.font.color.rgb = DARK
    p4 = tf.add_paragraph()
    p4.text = "Stratum 3: Sub-County Day Secondary Schools (Low/zero lab infrastructure baseline) — 5 schools, n ≈ 300 students, 10 teachers."
    p4.font.size = Pt(11.5)
    p4.font.name = "Arial"
    p4.font.color.rgb = DARK
    p5 = tf.add_paragraph()
    p5.text = "Total Cohort: 10 Schools, ≈ 600 Form 3 & 4 Students, 20 Chemistry Teachers across Nairobi, Machakos, and Kiambu counties."
    p5.font.size = Pt(11.5)
    p5.font.bold = True
    p5.font.color.rgb = NAVY


    # ==================== SLIDE 10: INSTRUMENTS & ANALYSIS ====================
    slide10 = prs.slides.add_slide(blank_layout)
    add_header(slide10, "Data Collection Instruments & Statistical Analysis")

    add_card(slide10, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.4), "Data Collection Instruments")
    tb = slide10.shapes.add_textbox(Inches(1.0), Inches(2.1), Inches(5.3), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "1. CPCAT Achievement Test: 40-mark criterion-referenced pre/post test aligned with KNEC Paper 3 rubrics (validated by KICD specialists & KCSE examiners, CVI ≥ 0.85)."
    p.font.size = Pt(11)
    p.font.name = "Arial"
    p.font.color.rgb = DARK
    p2 = tf.add_paragraph()
    p2.text = "2. System Usability Scale (SUS): 10-item international usability scale (Brooke, 1996) administered post-intervention. Benchmark threshold: SUS ≥ 78 (Grade A)."
    p2.font.size = Pt(11)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK
    p3 = tf.add_paragraph()
    p3.text = "3. TAM 3 Questionnaire: 5-point Likert survey measuring PU, PEOU, Facilitating Conditions, and Behavioural Intention (Cronbach's α ≥ 0.80)."
    p3.font.size = Pt(11)
    p3.font.name = "Arial"
    p3.font.color.rgb = DARK
    p4 = tf.add_paragraph()
    p4.text = "4. Automated Server Telemetry: Trial counts, titration error rates, concordant percentages (±0.10 cm³), time-on-task."
    p4.font.size = Pt(11)
    p4.font.name = "Arial"
    p4.font.color.rgb = DARK
    p5 = tf.add_paragraph()
    p5.text = "5. Qualitative Interviews & Focus Groups: Teacher in-depth interviews & student FGDs exploring classroom dynamics and workload."
    p5.font.size = Pt(11)
    p5.font.name = "Arial"
    p5.font.color.rgb = DARK

    add_card(slide10, Inches(6.8), Inches(1.5), Inches(5.733), Inches(5.4), "Statistical Data Analysis Plan")
    tb = slide10.shapes.add_textbox(Inches(7.0), Inches(2.1), Inches(5.3), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Learning Gain Calculation:"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    p2 = tf.add_paragraph()
    p2.text = "Hake's Average Normalised Learning Gain (g):"
    p2.font.size = Pt(11)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK
    p3 = tf.add_paragraph()
    p3.text = "g = (%Post-test - %Pre-test) / (100% - %Pre-test)"
    p3.font.size = Pt(11.5)
    p3.font.bold = True
    p3.font.color.rgb = NAVY
    p4 = tf.add_paragraph()
    p4.text = "Target: g ≥ 0.40 (Medium to High Gain)."
    p4.font.size = Pt(11)
    p4.font.name = "Arial"
    p4.font.color.rgb = DARK

    p5 = tf.add_paragraph()
    p5.text = "Inferential Testing & Effect Size:"
    p5.font.size = Pt(12)
    p5.font.bold = True
    p5.font.color.rgb = ACCENT_BLUE
    p6 = tf.add_paragraph()
    p6.text = "• ANCOVA: Tests post-test differences between Experimental and Control groups while controlling baseline pre-test scores as a covariate."
    p6.font.size = Pt(11)
    p6.font.name = "Arial"
    p6.font.color.rgb = DARK
    p7 = tf.add_paragraph()
    p7.text = "• Cohen's d: Establishes educational practical significance."
    p7.font.size = Pt(11)
    p7.font.name = "Arial"
    p7.font.color.rgb = DARK
    p8 = tf.add_paragraph()
    p8.text = "• Thematic Coding: Inductive qualitative analysis of transcripts."
    p8.font.size = Pt(11)
    p8.font.name = "Arial"
    p8.font.color.rgb = DARK


    # ==================== SLIDE 11: PROTOTYPE & CURRENT STATUS ====================
    slide11 = prs.slides.add_slide(blank_layout)
    add_header(slide11, "Working Prototype & Completed Development Milestones")

    add_card(slide11, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.4), "Current Prototype Accomplishments")
    tb = slide11.shapes.add_textbox(Inches(1.0), Inches(2.1), Inches(5.3), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Fully functional single-page PWA prototype completed and tested locally:"
    p.font.size = Pt(11.5)
    p.font.name = "Arial"
    p.font.color.rgb = DARK
    p2 = tf.add_paragraph()
    p2.text = "• 4 Titration Types operational (Acid-Base, Redox, Precipitation, Complexometric)."
    p2.font.size = Pt(11)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK
    p3 = tf.add_paragraph()
    p3.text = "• Interactive dropper pipette mechanic & magnified burette reading viewport (0.05 cm³ resolution)."
    p3.font.size = Pt(11)
    p3.font.name = "Arial"
    p3.font.color.rgb = DARK
    p4 = tf.add_paragraph()
    p4.text = "• Automated KNEC table validation checking concordance within ±0.10 cm³."
    p4.font.size = Pt(11)
    p4.font.name = "Arial"
    p4.font.color.rgb = DARK
    p5 = tf.add_paragraph()
    p5.text = "• Dynamic real-time pH titration curves."
    p5.font.size = Pt(11)
    p5.font.name = "Arial"
    p5.font.color.rgb = DARK
    p6 = tf.add_paragraph()
    p6.text = "• 17 Genuine KCSE Past Paper Practical Questions (1989–2013) with full answer verification."
    p6.font.size = Pt(11)
    p6.font.name = "Arial"
    p6.font.color.rgb = DARK

    add_card(slide11, Inches(6.8), Inches(1.5), Inches(5.733), Inches(5.4), "User-Centred Iterations Completed")
    tb = slide11.shapes.add_textbox(Inches(7.0), Inches(2.1), Inches(5.3), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Refinements from Early Teacher & Student Feedback:"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    p2 = tf.add_paragraph()
    p2.text = "1. Reagent Dropper Tool: Added after early testers struggled with burette stopcock tap sensitivity on touchscreens."
    p2.font.size = Pt(11)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK
    p3 = tf.add_paragraph()
    p3.text = "2. 5-Tab Workspace Hierarchy: Restructured sprawling screen into Experiment, Results Table, Calculation, Past Papers, and Help to prevent visual overload."
    p3.font.size = Pt(11)
    p3.font.name = "Arial"
    p3.font.color.rgb = DARK
    p4 = tf.add_paragraph()
    p4.text = "3. Mobile Touch Optimization: Expanded button tap areas to ≥ 48x48 px for low-cost Android smartphones."
    p4.font.size = Pt(11)
    p4.font.name = "Arial"
    p4.font.color.rgb = DARK
    p5 = tf.add_paragraph()
    p5.text = "4. Three Visual Themes: Clean White (outdoor glare), Slate Blue Dark (night revision), and Lab Green (accessibility)."
    p5.font.size = Pt(11)
    p5.font.name = "Arial"
    p5.font.color.rgb = DARK


    # ==================== SLIDE 12: WORK PLAN & BUDGET ====================
    slide12 = prs.slides.add_slide(blank_layout)
    add_header(slide12, "Implementation Timeline & Sustainable Budget")

    add_card(slide12, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.4), "12-Month Project Timeline")
    tb = slide12.shapes.add_textbox(Inches(1.0), Inches(2.1), Inches(5.3), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Phase 1 (Months 1–2): Requirements, KICD matrix, Node.js backend, PWA service worker scaffolding."
    p.font.size = Pt(11)
    p.font.name = "Arial"
    p.font.color.rgb = DARK
    p2 = tf.add_paragraph()
    p2.text = "Phase 2 (Months 3–4): Volumetric titration engine (4 types), chemical kinetics & equilibrium models."
    p2.font.size = Pt(11)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK
    p3 = tf.add_paragraph()
    p3.text = "Phase 3 (Months 5–6): Qualitative inorganic analysis, energetics, solubility curves, student badge portal."
    p3.font.size = Pt(11)
    p3.font.name = "Arial"
    p3.font.color.rgb = DARK
    p4 = tf.add_paragraph()
    p4.text = "Phase 4 (Months 7–8): Teacher analytics dashboard, assignment broadcasting, composite mock exam engine."
    p4.font.size = Pt(11)
    p4.font.name = "Arial"
    p4.font.color.rgb = DARK
    p5 = tf.add_paragraph()
    p5.text = "Phase 5 (Months 9–10): NACOSTI clearance, onboarding 10 pilot schools, pre-testing, 8-week intervention."
    p5.font.size = Pt(11)
    p5.font.name = "Arial"
    p5.font.color.rgb = DARK
    p6 = tf.add_paragraph()
    p6.text = "Phase 6 (Months 11–12): Post-testing, TAM/SUS surveys, ANCOVA analysis, dissertation defense, policy brief."
    p6.font.size = Pt(11)
    p6.font.name = "Arial"
    p6.font.color.rgb = DARK

    add_card(slide12, Inches(6.8), Inches(1.5), Inches(5.733), Inches(5.4), "Itemized Project Budget")
    tb = slide12.shapes.add_textbox(Inches(7.0), Inches(2.1), Inches(5.3), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Total Projected Budget: KES 328,900 (~ $2,530 USD)"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = GREEN
    p2 = tf.add_paragraph()
    p2.text = "1. Cloud Infrastructure & Hosting (12 mos): KES 54,000"
    p2.font.size = Pt(11)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK
    p3 = tf.add_paragraph()
    p3.text = "2. Pilot Hardware Support (10 Refurbished Android Tablets for under-resourced day schools): KES 120,000"
    p3.font.size = Pt(11)
    p3.font.name = "Arial"
    p3.font.color.rgb = DARK
    p4 = tf.add_paragraph()
    p4.text = "3. Field Research & Travel (10 Schools, Workshops): KES 60,000"
    p4.font.size = Pt(11)
    p4.font.name = "Arial"
    p4.font.color.rgb = DARK
    p5 = tf.add_paragraph()
    p5.text = "4. Printing & Materials (600 CPCAT Booklets): KES 30,000"
    p5.font.size = Pt(11)
    p5.font.name = "Arial"
    p5.font.color.rgb = DARK
    p6 = tf.add_paragraph()
    p6.text = "5. NACOSTI Research Permit & Ethics: KES 10,000"
    p6.font.size = Pt(11)
    p6.font.name = "Arial"
    p6.font.color.rgb = DARK
    p7 = tf.add_paragraph()
    p7.text = "6. Dissemination & Journal Publication: KES 25,000"
    p7.font.size = Pt(11)
    p7.font.name = "Arial"
    p7.font.color.rgb = DARK
    p8 = tf.add_paragraph()
    p8.text = "7. Operational Contingency Reserve (10%): KES 29,900"
    p8.font.size = Pt(11)
    p8.font.name = "Arial"
    p8.font.color.rgb = DARK


    # ==================== SLIDE 13: ETHICS & RISK MITIGATION ====================
    slide13 = prs.slides.add_slide(blank_layout)
    add_header(slide13, "Ethical Governance & Risk Mitigation Strategies")

    add_card(slide13, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.4), "Ethical Clearance & Data Governance")
    tb = slide13.shapes.add_textbox(Inches(1.0), Inches(2.1), Inches(5.3), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Statutory Ethical Protocols:"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    p2 = tf.add_paragraph()
    p2.text = "• NACOSTI research license & Open University of Kenya Directorate of Research clearance."
    p2.font.size = Pt(11)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK
    p3 = tf.add_paragraph()
    p3.text = "• County Director of Education administrative permissions in Nairobi, Machakos, and Kiambu counties."
    p3.font.size = Pt(11)
    p3.font.name = "Arial"
    p3.font.color.rgb = DARK
    p4 = tf.add_paragraph()
    p4.text = "• Parental consent & student assent for participating minors; voluntary withdrawal with zero academic penalty."
    p4.font.size = Pt(11)
    p4.font.name = "Arial"
    p4.font.color.rgb = DARK
    p5 = tf.add_paragraph()
    p5.text = "• Strict compliance with Kenya Data Protection Act 2019: Anonymized student research IDs (STU-XXXX), bcrypt password hashing, and encrypted database storage."
    p5.font.size = Pt(11)
    p5.font.name = "Arial"
    p5.font.color.rgb = DARK

    add_card(slide13, Inches(6.8), Inches(1.5), Inches(5.733), Inches(5.4), "Anticipated Risks & Concrete Mitigations")
    tb = slide13.shapes.add_textbox(Inches(7.0), Inches(2.1), Inches(5.3), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Intermittent/Zero Internet in Rural Schools:"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p2 = tf.add_paragraph()
    p2.text = "Mitigation: Offline-first PWA with Service Worker pre-caching; full simulation runs offline; telemetry auto-syncs on reconnect."
    p2.font.size = Pt(10.5)
    p2.font.name = "Arial"
    p2.font.color.rgb = DARK

    p3 = tf.add_paragraph()
    p3.text = "Hardware Shortages in Sub-County Day Schools:"
    p3.font.size = Pt(11)
    p3.font.bold = True
    p3.font.color.rgb = NAVY
    p4 = tf.add_paragraph()
    p4.text = "Mitigation: 10 refurbished Android tablets provided; collaborative pair-practice protocol (Technician vs Analyst)."
    p4.font.size = Pt(10.5)
    p4.font.name = "Arial"
    p4.font.color.rgb = DARK

    p5 = tf.add_paragraph()
    p5.text = "Power Grid Blackouts:"
    p5.font.size = Pt(11)
    p5.font.bold = True
    p5.font.color.rgb = NAVY
    p6 = tf.add_paragraph()
    p6.text = "Mitigation: Solar-powered battery power packs provided with tablets to maintain battery charge."
    p6.font.size = Pt(10.5)
    p6.font.name = "Arial"
    p6.font.color.rgb = DARK


    # ==================== SLIDE 14: DELIVERABLES & POLICY IMPACT ====================
    slide14 = prs.slides.add_slide(blank_layout)
    add_header(slide14, "Expected Deliverables & Policy Significance")

    # 4 Cards Grid
    add_card(slide14, Inches(0.8), Inches(1.5), Inches(5.7), Inches(2.5), "1. Operational Open-Access Platform")
    tb = slide14.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "A production-grade, open-source virtual chemistry laboratory PWA hosted at zero cost to Kenyan learners, teachers, and institutions under an MIT open-source license."
    p.font.size = Pt(11.5)
    p.font.name = "Arial"
    p.font.color.rgb = DARK

    add_card(slide14, Inches(6.8), Inches(1.5), Inches(5.733), Inches(2.5), "2. Master's Research Dissertation")
    tb = slide14.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "An empirically rigorous Master of Science dissertation documenting learning gains, effect sizes, and adoption factors across Kenyan secondary school tiers."
    p.font.size = Pt(11.5)
    p.font.name = "Arial"
    p.font.color.rgb = DARK

    add_card(slide14, Inches(0.8), Inches(4.3), Inches(5.7), Inches(2.6), "3. Policy Brief for KICD & MoE")
    tb = slide14.shapes.add_textbox(Inches(1.0), Inches(4.8), Inches(5.3), Inches(1.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "An actionable policy white paper submitted to KICD, CEMASTEA, and the Ministry of Education detailing strategic frameworks for scaling offline virtual STEM labs under the CBC Senior Secondary STEM pathway."
    p.font.size = Pt(11.5)
    p.font.name = "Arial"
    p.font.color.rgb = DARK

    add_card(slide14, Inches(6.8), Inches(4.3), Inches(5.733), Inches(2.6), "4. Peer-Reviewed Journal Publication")
    tb = slide14.shapes.add_textbox(Inches(7.0), Inches(4.8), Inches(5.3), Inches(1.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Empirical findings submitted to reputable journals such as Computers & Education, Journal of Science Education and Technology, or the African Journal of Research in Mathematics, Science and Technology Education."
    p.font.size = Pt(11.5)
    p.font.name = "Arial"
    p.font.color.rgb = DARK


    # ==================== SLIDE 15: CONCLUSION & Q&A ====================
    slide15 = prs.slides.add_slide(blank_layout)
    bg15 = slide15.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg15.fill.solid()
    bg15.fill.fore_color.rgb = NAVY
    bg15.line.color.rgb = NAVY

    # Conclusion Banner
    tb = slide15.shapes.add_textbox(Inches(1.0), Inches(1.2), Inches(11.333), Inches(1.0))
    p = tb.text_frame.paragraphs[0]
    p.text = "CONCLUSION & CORE VALUE PROPOSITION"
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = GOLD
    p.alignment = PP_ALIGN.CENTER

    tb_msg = slide15.shapes.add_textbox(Inches(1.5), Inches(2.2), Inches(10.333), Inches(2.4))
    tf = tb_msg.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "“Underperformance in KCSE Chemistry Paper 3 is not an intellectual deficit among students; it is an infrastructure deficit. VirtuLab Kenya demonstrates that thoughtful instructional design, coupled with frugal, offline-first web technologies, can democratise practical science learning and deliver equity to Kenya’s most under-resourced classrooms.”"
    p.font.name = "Georgia"
    p.font.size = Pt(18)
    p.font.italic = True
    p.font.color.rgb = RGBColor(255, 255, 255)
    p.alignment = PP_ALIGN.CENTER

    # Thank you / Q&A Box
    card_qa = slide15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.5), Inches(4.8), Inches(6.333), Inches(1.8))
    card_qa.fill.solid()
    card_qa.fill.fore_color.rgb = RGBColor(18, 48, 86)
    card_qa.line.color.rgb = GOLD
    card_qa.line.width = Pt(1.5)

    tb_qa = slide15.shapes.add_textbox(Inches(3.7), Inches(5.0), Inches(5.933), Inches(1.4))
    tf = tb_qa.text_frame
    p = tf.paragraphs[0]
    p.text = "THANK YOU FOR YOUR ATTENTION"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)
    p.alignment = PP_ALIGN.CENTER

    p2 = tf.add_paragraph()
    p2.text = "I warmly welcome questions, critique, and guidance from the examination panel."
    p2.font.size = Pt(12)
    p2.font.color.rgb = RGBColor(200, 215, 235)
    p2.alignment = PP_ALIGN.CENTER

    p3 = tf.add_paragraph()
    p3.text = "Harrison Tellah Museni | ED61/6061/2025 | Open University of Kenya"
    p3.font.size = Pt(11)
    p3.font.italic = True
    p3.font.color.rgb = GOLD
    p3.alignment = PP_ALIGN.CENTER

    prs.save(output_path)
    print(f"Presentation created successfully at {output_path}")

if __name__ == '__main__':
    out_file = os.path.join(os.getcwd(), 'VirtuLab_Kenya_Capstone_Defense_Presentation.pptx')
    build_presentation(out_file)
