import os
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION_START
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def create_hyperlinked_proposal_v9():
    doc = Document()

    # Enable automatic field update when opened in Microsoft Word
    settings_elem = doc.settings.element
    settings_elem.append(parse_xml(r'<w:updateFields %s w:val="true"/>' % nsdecls('w')))

    # Configure Section 1: Preliminary Pages (Roman numerals)
    sec1 = doc.sections[0]
    sec1.top_margin = Inches(1.0)
    sec1.bottom_margin = Inches(1.0)
    sec1.left_margin = Inches(1.0)
    sec1.right_margin = Inches(1.0)
    sec1.different_first_page_header_footer = True

    # Footer for Section 1 (centered Roman numerals ii, iii, iv...)
    footer_sec1 = sec1.footer
    p_f1 = footer_sec1.paragraphs[0]
    p_f1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_f1 = p_f1.add_run()
    r_f1.font.name = 'Times New Roman'
    r_f1.font.size = Pt(10)
    fldSimple1 = parse_xml(r'<w:fldSimple %s w:instr="PAGE"/>' % nsdecls('w'))
    r_f1._r.append(fldSimple1)

    # Set Section 1 page number format to lowerRoman starting at 1
    sec1._sectPr.append(parse_xml(r'<w:pgNumType %s w:fmt="lowerRoman" w:start="1"/>' % nsdecls('w')))

    # Configure Normal Style
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(0x1A, 0x1A, 0x1A)
    normal_style.paragraph_format.line_spacing = 1.5
    normal_style.paragraph_format.space_after = Pt(6)
    normal_style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # Configure Heading Styles
    h1_style = doc.styles['Heading 1']
    h1_style.font.name = 'Times New Roman'
    h1_style.font.size = Pt(15)
    h1_style.font.bold = True
    h1_style.font.color.rgb = RGBColor(0x0C, 0x23, 0x40) # Deep Navy
    h1_style.paragraph_format.space_before = Pt(14)
    h1_style.paragraph_format.space_after = Pt(6)
    h1_style.paragraph_format.keep_with_next = True
    h1_style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER

    h2_style = doc.styles['Heading 2']
    h2_style.font.name = 'Times New Roman'
    h2_style.font.size = Pt(13)
    h2_style.font.bold = True
    h2_style.font.color.rgb = RGBColor(0x0C, 0x23, 0x40)
    h2_style.paragraph_format.space_before = Pt(10)
    h2_style.paragraph_format.space_after = Pt(4)
    h2_style.paragraph_format.keep_with_next = True
    h2_style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT

    h3_style = doc.styles['Heading 3']
    h3_style.font.name = 'Times New Roman'
    h3_style.font.size = Pt(12)
    h3_style.font.bold = True
    h3_style.font.color.rgb = RGBColor(0x1A, 0x1A, 0x1A)
    h3_style.paragraph_format.space_before = Pt(8)
    h3_style.paragraph_format.space_after = Pt(3)
    h3_style.paragraph_format.keep_with_next = True
    h3_style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT

    bookmark_counter = 1

    # Helper function to add justified paragraph
    def add_p(text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=6, space_before=0, italic=False, bold=False):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.line_spacing = 1.5
        if text:
            parts = re.split(r'(\*\*.*?\*\*|\*.*?\*)', text)
            for part in parts:
                if not part:
                    continue
                if part.startswith('**') and part.endswith('**'):
                    run = p.add_run(part[2:-2])
                    run.font.name = 'Times New Roman'
                    run.font.size = Pt(12)
                    run.font.bold = True
                elif part.startswith('*') and part.endswith('*'):
                    run = p.add_run(part[1:-1])
                    run.font.name = 'Times New Roman'
                    run.font.size = Pt(12)
                    run.font.italic = True
                else:
                    run = p.add_run(part)
                    run.font.name = 'Times New Roman'
                    run.font.size = Pt(12)
                    run.font.bold = bold
                    run.font.italic = italic
        return p

    def add_h1_with_bookmark(text, bookmark_name):
        nonlocal bookmark_counter
        p = doc.add_paragraph(style='Heading 1')
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        # Add bookmark start
        bm_start = parse_xml(r'<w:bookmarkStart %s w:id="%d" w:name="%s"/>' % (nsdecls('w'), bookmark_counter, bookmark_name))
        p._p.append(bm_start)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x0C, 0x23, 0x40)
        # Add bookmark end
        bm_end = parse_xml(r'<w:bookmarkEnd %s w:id="%d"/>' % (nsdecls('w'), bookmark_counter))
        p._p.append(bm_end)
        bookmark_counter += 1
        return p

    def add_h2_with_bookmark(text, bookmark_name):
        nonlocal bookmark_counter
        p = doc.add_paragraph(style='Heading 2')
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        bm_start = parse_xml(r'<w:bookmarkStart %s w:id="%d" w:name="%s"/>' % (nsdecls('w'), bookmark_counter, bookmark_name))
        p._p.append(bm_start)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x0C, 0x23, 0x40)
        bm_end = parse_xml(r'<w:bookmarkEnd %s w:id="%d"/>' % (nsdecls('w'), bookmark_counter))
        p._p.append(bm_end)
        bookmark_counter += 1
        return p

    def add_h3_with_bookmark(text, bookmark_name):
        nonlocal bookmark_counter
        p = doc.add_paragraph(style='Heading 3')
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        bm_start = parse_xml(r'<w:bookmarkStart %s w:id="%d" w:name="%s"/>' % (nsdecls('w'), bookmark_counter, bookmark_name))
        p._p.append(bm_start)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x1A, 0x1A, 0x1A)
        bm_end = parse_xml(r'<w:bookmarkEnd %s w:id="%d"/>' % (nsdecls('w'), bookmark_counter))
        p._p.append(bm_end)
        bookmark_counter += 1
        return p

    # Helper function to add hyperlinked TOC row
    def add_toc_link_row(title, page_str, bookmark_name, is_bold=False, indent_in=0.0):
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.3
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.space_before = Pt(1)
        if indent_in > 0:
            p.paragraph_format.left_indent = Inches(indent_in)

        # Tab stop at 6.3 inches with dot leader
        pPr = p._p.get_or_add_pPr()
        tabs = parse_xml(r'<w:tabs %s><w:tab w:val="right" w:leader="dot" w:pos="9360"/></w:tabs>' % nsdecls('w'))
        pPr.append(tabs)

        # Hyperlink element pointing to bookmark
        hyperlink = parse_xml(r'<w:hyperlink %s w:anchor="%s" w:history="1"/>' % (nsdecls('w'), bookmark_name))

        # Title run inside hyperlink
        r_title = parse_xml(r'<w:r %s><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="%d"/><w:color w:val="0C2340"/>%s</w:rPr><w:t xml:space="preserve">%s</w:t></w:r>' % (
            nsdecls('w'), 22 if is_bold else 21, r'<w:b/>' if is_bold else '', title
        ))
        hyperlink.append(r_title)

        # Tab character run inside hyperlink
        r_tab = parse_xml(r'<w:r %s><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:color w:val="888888"/></w:rPr><w:tab/></w:r>' % nsdecls('w'))
        hyperlink.append(r_tab)

        # Page number run inside hyperlink
        r_pg = parse_xml(r'<w:r %s><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="%d"/><w:color w:val="0C2340"/>%s</w:rPr><w:t>%s</w:t></w:r>' % (
            nsdecls('w'), 22 if is_bold else 21, r'<w:b/>' if is_bold else '', page_str
        ))
        hyperlink.append(r_pg)

        p._p.append(hyperlink)

    def add_table(headers, rows_data):
        table = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = True

        hdr_cells = table.rows[0].cells
        for idx, text in enumerate(headers):
            hdr_cells[idx].text = text
            shading = parse_xml(r'<w:shd %s w:fill="EAECEF"/>' % nsdecls('w'))
            hdr_cells[idx]._tc.get_or_add_tcPr().append(shading)
            for p in hdr_cells[idx].paragraphs:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.line_spacing = 1.15
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.space_before = Pt(2)
                for run in p.runs:
                    run.font.name = 'Times New Roman'
                    run.font.size = Pt(10)
                    run.font.bold = True

        for r_idx, row in enumerate(rows_data):
            row_cells = table.rows[r_idx + 1].cells
            for c_idx, text in enumerate(row):
                if c_idx < len(row_cells):
                    row_cells[c_idx].text = text
                    for p in row_cells[c_idx].paragraphs:
                        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                        p.paragraph_format.line_spacing = 1.15
                        p.paragraph_format.space_after = Pt(2)
                        p.paragraph_format.space_before = Pt(2)
                        for run in p.runs:
                            run.font.name = 'Times New Roman'
                            run.font.size = Pt(9.5)

        tblPr = table._tbl.tblPr
        borders = parse_xml(r'<w:tblBorders %s><w:top w:val="single" w:sz="6" w:space="0" w:color="B0B0B0"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="B0B0B0"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="E0E0E0"/><w:insideV w:val="none"/><w:left w:val="none"/><w:right w:val="none"/></w:tblBorders>' % nsdecls('w'))
        tblPr.append(borders)
        add_p("", space_after=6)

    # ==================== PRELIMINARY PAGES ====================
    # --- PAGE 1: TITLE PAGE (Unnumbered / i) ---
    add_p("OPEN UNIVERSITY OF KENYA", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, space_after=2, space_before=12)
    add_p("SCHOOL OF EDUCATION", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, space_after=2)
    add_p("DEPARTMENT OF TECHNOLOGY EDUCATION", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, space_after=36)

    add_p("VIRTULAB KENYA: DESIGN, DEVELOPMENT AND EVALUATION OF A WEB-BASED VIRTUAL CHEMISTRY LABORATORY FOR KCSE AND CBE LEARNERS IN KENYAN SECONDARY SCHOOLS", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, space_after=48)

    add_p("BY", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, space_after=12)
    add_p("HARRISON TELLAH MUSENI", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, space_after=2)
    add_p("REG. NO: ED61/6061/2025", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, space_after=48)

    add_p("A CAPSTONE PROJECT PROPOSAL SUBMITTED IN PARTIAL FULFILMENT OF THE REQUIREMENTS FOR THE AWARD OF THE DEGREE OF MASTER IN LEARNING DESIGN AND TECHNOLOGY IN THE SCHOOL OF EDUCATION, OPEN UNIVERSITY OF KENYA", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=48)

    add_p("SEPTEMBER, 2026", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, space_after=12)

    # --- PAGE 2: DECLARATION (ii) ---
    doc.add_page_break()
    add_h1_with_bookmark("DECLARATION", "sec_declaration")
    add_h2_with_bookmark("Candidate’s Declaration", "sec_cand_decl")
    add_p("I declare that this capstone project proposal is my own original work and has not been submitted for the award of a degree or diploma in this or any other university. Where the work of others has been used, it has been duly acknowledged through scholarly citation and referencing.")
    add_p("Signature: _________________________                  Date: _________________________", space_after=18, space_before=18)
    add_p("**Harrison Tellah Museni**", space_after=2)
    add_p("Reg. No: ED61/6061/2025", space_after=24)

    add_h2_with_bookmark("Supervisor’s Declaration", "sec_sup_decl")
    add_p("This capstone project proposal has been submitted for review with my approval as the appointed university supervisor.")
    add_p("Signature: _________________________                  Date: _________________________", space_after=18, space_before=18)
    add_p("**Prof. Wambua Benjamin Kyalo, PhD**", space_after=2)
    add_p("School of Education – Technology Education", space_after=2)
    add_p("Open University of Kenya", space_after=12)

    # --- PAGE 3: DEDICATION (iii) ---
    doc.add_page_break()
    add_h1_with_bookmark("DEDICATION", "sec_dedication")
    add_p("This work is dedicated to the chemistry learners of Kenya’s under-resourced secondary schools, whose curiosity for science persists despite empty laboratory shelves, and to my brother Jack, whose steadfast support makes this pursuit possible.", italic=True, space_before=24)

    # --- PAGE 4: ACKNOWLEDGEMENTS (iv) ---
    doc.add_page_break()
    add_h1_with_bookmark("ACKNOWLEDGEMENTS", "sec_acknowledgements")
    add_p("I express my deepest gratitude to the Open University of Kenya and the School of Education for the opportunity to pursue the Master in Learning Design and Technology programme, and for the institutional guidance provided throughout the conceptualisation and refinement of this capstone proposal.")
    add_p("My sincere appreciation goes to my university supervisor, Prof. Wambua Benjamin Kyalo, PhD, for his patient direction, incisive critique, and steady intellectual encouragement throughout the development of VirtuLab Kenya.")
    add_p("I also record my profound appreciation to the Board of Management, administration, teaching staff, and students of Makunda Secondary School in Kakamega County. The daily classroom realities, reagent shortages, and resilient pedagogical improvisations observed at Makunda provided the direct inspiration for this research project.")
    add_p("Finally, I thank my family, colleagues, and fellow graduate students in the EDU 801 cohort for their constant solidarity and encouragement throughout this academic journey.")

    # --- PAGE 5: TABLE OF CONTENTS (v) ---
    doc.add_page_break()
    add_h1_with_bookmark("TABLE OF CONTENTS", "sec_toc")
    add_p("Click (or Ctrl + Click) on any section or page number below to jump directly to it in this document. When opened in Microsoft Word, you can also right-click and choose 'Update Field' to synchronize entries.", italic=True, space_after=14)

    # Explicit Interactive Clickable Links with Dot Leaders
    toc_entries = [
        ("Declaration", "ii", "sec_declaration", True, 0.0),
        ("Dedication", "iii", "sec_dedication", True, 0.0),
        ("Acknowledgements", "iv", "sec_acknowledgements", True, 0.0),
        ("List of Tables", "vi", "sec_list_tables", True, 0.0),
        ("List of Abbreviations and Acronyms", "vii", "sec_abbr", True, 0.0),
        ("Operational Definition of Terms", "viii", "sec_def_terms", True, 0.0),
        ("Abstract", "ix", "sec_abstract", True, 0.0),
        ("CHAPTER ONE: PROBLEM IDENTIFICATION", "1", "chap1", True, 0.0),
        ("1.1 Background to the Problem", "1", "sec1_1", False, 0.25),
        ("1.2 The Laboratory Infrastructure Crisis", "2", "sec1_2", False, 0.25),
        ("1.3 Digital Interventions in Low-Resource Contexts", "3", "sec1_3", False, 0.25),
        ("1.4 Problem Identification", "4", "sec1_4", False, 0.25),
        ("1.5 Problem Statement", "4", "sec1_5", False, 0.25),
        ("1.6 Purpose of the Capstone Project", "5", "sec1_6", False, 0.25),
        ("1.7 Objectives of the Capstone Project", "5", "sec1_7", False, 0.25),
        ("1.7.1 General Objective", "5", "sec1_7_1", False, 0.45),
        ("1.7.2 Specific Objectives", "5", "sec1_7_2", False, 0.45),
        ("1.8 Research Questions", "6", "sec1_8", False, 0.25),
        ("1.9 Research Hypotheses", "6", "sec1_9", False, 0.25),
        ("1.10 Significance of the Capstone Project", "7", "sec1_10", False, 0.25),
        ("1.11 Scope of the Capstone Project", "8", "sec1_11", False, 0.25),
        ("1.12 Delimitations", "8", "sec1_12", False, 0.25),
        ("1.13 Limitations", "8", "sec1_13", False, 0.25),
        ("1.14 Assumptions", "9", "sec1_14", False, 0.25),
        ("1.15 Definition of Key Terms", "9", "sec1_15", False, 0.25),
        ("1.16 Chapter Summary", "10", "sec1_16", False, 0.25),
        ("CHAPTER TWO: RESEARCH AND ANALYSIS", "11", "chap2", True, 0.0),
        ("2.1 Conceptualisation of the Problem", "11", "sec2_1", False, 0.25),
        ("2.2 Review of Related Literature", "11", "sec2_2", False, 0.25),
        ("2.2.1 Educational Inequity in Science Access", "11", "sec2_2_1", False, 0.45),
        ("2.2.2 Role of Virtual Laboratories in Science Education", "12", "sec2_2_2", False, 0.45),
        ("2.2.3 Contextualised Technology Integration in Sub-Saharan Africa", "13", "sec2_2_3", False, 0.45),
        ("2.2.4 Constructivist Approaches in Digital Pedagogy", "14", "sec2_2_4", False, 0.45),
        ("2.3 Theoretical and Conceptual Framework", "15", "sec2_3", False, 0.25),
        ("2.3.1 Constructivism and Inquiry-Based Science Education", "15", "sec2_3_1", False, 0.45),
        ("2.3.2 Cognitive Theory of Multimedia Learning and Cognitive Load Theory", "16", "sec2_3_2", False, 0.45),
        ("2.3.3 Technology Acceptance Model (TAM 3)", "17", "sec2_3_3", False, 0.45),
        ("2.3.4 Conceptual Framework", "18", "sec2_3_4", False, 0.45),
        ("2.4 Review of Existing Practices, Policies and Interventions", "19", "sec2_4", False, 0.25),
        ("2.5 Benchmarking and Comparative Analysis", "20", "sec2_5", False, 0.25),
        ("2.6 Research and Project Methodology", "21", "sec2_6", False, 0.25),
        ("2.6.1 Research Design", "21", "sec2_6_1", False, 0.45),
        ("2.6.2 Target Population and Sampling Strategy", "22", "sec2_6_2", False, 0.45),
        ("2.6.3 Data Collection Instruments", "23", "sec2_6_3", False, 0.45),
        ("2.6.4 Validity of Instruments", "24", "sec2_6_4", False, 0.45),
        ("2.6.5 Reliability and Trustworthiness", "25", "sec2_6_5", False, 0.45),
        ("2.6.6 Data Collection Procedures", "25", "sec2_6_6", False, 0.45),
        ("2.6.7 Data Analysis Techniques", "26", "sec2_6_7", False, 0.45),
        ("2.6.8 Ethical Considerations and Data Protection", "27", "sec2_6_8", False, 0.45),
        ("2.7 Analysis of the Identified Problem", "28", "sec2_7", False, 0.25),
        ("2.8 Root-Cause Analysis", "28", "sec2_8", False, 0.25),
        ("2.9 Needs and Gap Analysis", "29", "sec2_9", False, 0.25),
        ("2.10 Analysis of Alternative Solutions", "30", "sec2_10", False, 0.25),
        ("2.11 Selection of the Preferred Intervention", "30", "sec2_11", False, 0.25),
        ("2.12 Chapter Summary", "31", "sec2_12", False, 0.25),
        ("CHAPTER THREE: DESIGN AND DEVELOPMENT OF THE INTERVENTION", "32", "chap3", True, 0.0),
        ("3.1 Design Principles of the Capstone Intervention", "32", "sec3_1", False, 0.25),
        ("3.2 Proposed Capstone Intervention and Innovation", "33", "sec3_2", False, 0.25),
        ("3.3 Intervention Design Framework", "34", "sec3_3", False, 0.25),
        ("3.4 System Architecture", "35", "sec3_4", False, 0.25),
        ("3.5 Laboratory Modules Implemented and Curriculum Roadmap", "37", "sec3_5", False, 0.25),
        ("3.6 Technical Specifications", "38", "sec3_6", False, 0.25),
        ("3.7 Development Process", "39", "sec3_7", False, 0.25),
        ("3.8 Prototype Development and Current Status", "40", "sec3_8", False, 0.25),
        ("3.9 Stakeholder Engagement and Content Validation", "41", "sec3_9", False, 0.25),
        ("3.10 Pilot Testing and Pre-Testing", "42", "sec3_10", False, 0.25),
        ("3.11 Revision and Refinement of the Intervention", "42", "sec3_11", False, 0.25),
        ("3.12 12-Month Implementation Plan", "43", "sec3_12", False, 0.25),
        ("3.13 Resource Requirements and Itemized Budget", "44", "sec3_13", False, 0.25),
        ("3.14 Risk Management Matrix", "45", "sec3_14", False, 0.25),
        ("3.15 Sustainability and Scalability", "46", "sec3_15", False, 0.25),
        ("3.16 Monitoring and Evaluation Framework", "47", "sec3_16", False, 0.25),
        ("3.17 Chapter Summary", "48", "sec3_17", False, 0.25),
        ("CHAPTER FOUR: IMPLEMENTATION, EVALUATION AND REFLECTION", "49", "chap4", True, 0.0),
        ("4.1 Implementation of the Capstone Intervention", "49", "sec4_1", False, 0.25),
        ("4.2 Implementation Process", "50", "sec4_2", False, 0.25),
        ("4.3 Participation and Stakeholder Engagement", "51", "sec4_3", False, 0.25),
        ("4.4 Evaluation of the Intervention", "52", "sec4_4", False, 0.25),
        ("4.5 Presentation of Evaluation Findings", "53", "sec4_5", False, 0.25),
        ("4.6 Assessment of Outcomes", "54", "sec4_6", False, 0.25),
        ("4.7 User and Stakeholder Feedback", "55", "sec4_7", False, 0.25),
        ("4.8 Comparison of Intended and Actual Outcomes", "56", "sec4_8", False, 0.25),
        ("4.9 Challenges Encountered During Implementation", "57", "sec4_9", False, 0.25),
        ("4.10 Mitigation Measures", "58", "sec4_10", False, 0.25),
        ("4.11 Reflection on the Capstone Process", "59", "sec4_11", False, 0.25),
        ("4.12 Lessons Learned and Best Practices", "60", "sec4_12", False, 0.25),
        ("4.13 Recommendations for Improvement and Scale-Up", "61", "sec4_13", False, 0.25),
        ("4.14 Expected Academic and Practical Deliverables", "62", "sec4_14", False, 0.25),
        ("4.15 Sustainability and Future Directions", "63", "sec4_15", False, 0.25),
        ("4.16 Conclusion", "64", "sec4_16", False, 0.25),
        ("4.17 Chapter Summary", "65", "sec4_17", False, 0.25),
        ("REFERENCES", "66", "sec_refs", True, 0.0)
    ]

    for title, pg, bm, is_b, ind in toc_entries:
        add_toc_link_row(title, pg, bm, is_bold=is_b, indent_in=ind)

    # --- PAGE 6: LIST OF TABLES (vi) ---
    doc.add_page_break()
    add_h1_with_bookmark("LIST OF TABLES", "sec_list_tables")
    tables_list = [
        ("Table 2.1: Conceptual Framework Matrix of Variables", "18", "tbl_2_1"),
        ("Table 2.2: Benchmarking of Virtual Laboratory Platforms", "20", "tbl_2_2"),
        ("Table 2.3: Target Population and Stratified Sampling Matrix", "22", "tbl_2_3"),
        ("Table 3.1: VirtuLab Kenya Laboratory Modules and Curriculum Mapping", "37", "tbl_3_1"),
        ("Table 3.2: 12-Month Project Implementation Schedule", "43", "tbl_3_2"),
        ("Table 3.3: Resource Requirements and Itemized Budget", "44", "tbl_3_3"),
        ("Table 3.4: Risk Assessment and Mitigation Matrix", "45", "tbl_3_4"),
        ("Table 4.1: Comparison Matrix of Target versus Projected Pilot Outcomes", "56", "tbl_4_1")
    ]
    for t_title, t_pg, t_bm in tables_list:
        add_toc_link_row(t_title, t_pg, t_bm, is_bold=False, indent_in=0.0)

    # --- PAGE 7: ABBREVIATIONS AND ACRONYMS (vii) ---
    doc.add_page_break()
    add_h1_with_bookmark("ABBREVIATIONS AND ACRONYMS", "sec_abbr")
    abbr_data = [
        ("ADDE", "Analyse, Design, Develop, Evaluate"),
        ("ANCOVA", "Analysis of Covariance"),
        ("BI", "Behavioural Intention"),
        ("CBC", "Competency-Based Curriculum"),
        ("CEMASTEA", "Centre for Mathematics, Science and Technology Education in Africa"),
        ("CLT", "Cognitive Load Theory"),
        ("CPCAT", "Chemistry Practical Competency Achievement Test"),
        ("CTML", "Cognitive Theory of Multimedia Learning"),
        ("FC", "Facilitating Conditions"),
        ("FDSE", "Free Day Secondary Education"),
        ("IBSE", "Inquiry-Based Science Education"),
        ("KCSE", "Kenya Certificate of Secondary Education"),
        ("KICD", "Kenya Institute of Curriculum Development"),
        ("KNEC", "Kenya National Examinations Council"),
        ("NACOSTI", "National Commission for Science, Technology and Innovation"),
        ("NESSP", "National Education Sector Strategic Plan"),
        ("OUK", "Open University of Kenya"),
        ("PEOU", "Perceived Ease of Use"),
        ("PU", "Perceived Usefulness"),
        ("PWA", "Progressive Web App"),
        ("SMASE", "Strengthening of Mathematics and Science Education"),
        ("STEM", "Science, Technology, Engineering and Mathematics"),
        ("SUS", "System Usability Scale"),
        ("TAM", "Technology Acceptance Model"),
        ("ZPD", "Zone of Proximal Development")
    ]
    for ab, desc in abbr_data:
        add_p(f"**{ab}** — {desc}", space_after=3)

    # --- PAGE 8: OPERATIONAL DEFINITION OF TERMS (viii) ---
    doc.add_page_break()
    add_h1_with_bookmark("OPERATIONAL DEFINITION OF TERMS", "sec_def_terms")
    add_p("**VirtuLab Kenya:** A lightweight, bilingual (English/Kiswahili), offline-first virtual chemistry laboratory Progressive Web App engineered specifically to simulate KCSE Chemistry Paper 3 practicals for secondary school learners in under-resourced Kenyan schools.")
    add_p("**Concordant Titres:** Volumetric titre values that fall within plus or minus 0.10 cubic centimetres to plus or minus 0.20 cubic centimetres of one another, satisfying the official Kenya National Examinations Council scoring precision criteria for full marks.")
    add_p("**Chemistry Practical Competency Achievement Test (CPCAT):** The 40-mark standardized criterion-referenced pre-test and post-test instrument developed and validated to evaluate student practical chemistry conceptual and calculation competency before and after the digital intervention.")
    add_p("**Normalised Learning Gain (g):** Richard Hake’s standardized metric measuring the proportion of actual conceptual improvement achieved by learners relative to the maximum possible gain achievable from pre-test to post-test.")
    add_p("**System Usability Scale (SUS):** John Brooke’s ten-item validated Likert-scale instrument yielding an international composite software usability benchmark from 0 to 100.")
    add_p("**Technology Acceptance Model (TAM 3):** An information systems framework formulated by Fred Davis and extended by Viswanath Venkatesh, assessing how Perceived Usefulness, Perceived Ease of Use, and Facilitating Conditions predict user Behavioural Intention to adopt VirtuLab Kenya.")
    add_p("**KCSE Chemistry Paper 3 (233/3):** The national summative practical examination paper administered by the Kenya National Examinations Council, evaluating practical competency in quantitative titration, qualitative inorganic analysis, and physical chemistry, commanding 40 percent of the final chemistry grade.")

    # --- PAGE 9: ABSTRACT (ix) ---
    doc.add_page_break()
    add_h1_with_bookmark("ABSTRACT", "sec_abstract")
    add_p("Practical science education remains the foundation of critical thinking and scientific inquiry in secondary education. In Kenya, Chemistry is examined both theoretically and practically through the Kenya Certificate of Secondary Education (KCSE) Chemistry Practical Examination (Paper 233/3), which commands 40 percent of the candidate's final subject grade. Despite this heavy academic weighting, a severe infrastructural crisis persists across the country. Over 60 percent of public secondary schools, particularly sub-county and rural day institutions, operate without functional science laboratories, consumable reagents, piped water, or trained laboratory technicians. In these schools, chemistry instruction is reduced to theoretical chalkboard lecture. Teachers sketch apparatus and dictate expected color transitions, while learners sit for high-stakes national examinations having rarely handled a pipette or operated a burette stopcock.")
    add_p("To confront this systemic inequity, I conceptualised and developed VirtuLab Kenya. It is a lightweight, bilingual, offline-first virtual chemistry laboratory engineered specifically for the resource-constrained realities of Kenyan secondary classrooms. Built as a Progressive Web App on a Node.js and PostgreSQL architecture, VirtuLab Kenya eliminates the heavy graphics overhead of foreign commercial simulations, allowing it to execute smoothly on budget Android smartphones and second-hand school computers. The platform mirrors the Kenya Institute of Curriculum Development (KICD) Form 1 to 4 syllabus and KCSE Paper 3 practical formats, providing interactive experimental modules across volumetric analysis, qualitative inorganic analysis, reaction kinetics, chemical energetics, solubility curves, and organic chemistry.")
    add_p("The platform incorporates zero-bandwidth offline resilience through service-worker caching, dual-language scaffolding in English and Kiswahili, immediate error feedback on meniscus alignment and concordant titre calculations, and an administrative telemetry dashboard that alerts teachers to class-wide misconceptions in real time.")
    add_p("This proposal establishes the empirical need for the intervention, outlines its theoretical grounding in Mayer’s Cognitive Theory of Multimedia Learning, Bybee’s 5E Instructional Model, and the Technology Acceptance Model, and details a mixed-methods quasi-experimental evaluation across ten stratified secondary schools comprising approximately 600 students and 20 chemistry teachers. The study evaluates whether curriculum-aligned, offline virtual laboratory practice produces measurable learning gains, alleviates practical examination anxiety, and offers teachers actionable diagnostic data without recurring institutional costs.")
    add_p("**Keywords:** *Virtual Chemistry Laboratory, Progressive Web App, KCSE Paper 3, Educational Inequity, Cognitive Theory of Multimedia Learning, System Usability Scale, Technology Acceptance Model.*", space_before=12)

    # ==================== SECTION 2: MAIN BODY (PAGE 1 - ARABIC NUMERALS) ====================
    sec2 = doc.add_section(WD_SECTION_START.NEW_PAGE)
    sec2.top_margin = Inches(1.0)
    sec2.bottom_margin = Inches(1.0)
    sec2.left_margin = Inches(1.0)
    sec2.right_margin = Inches(1.0)
    sec2.header.is_linked_to_previous = False
    sec2.footer.is_linked_to_previous = False

    # Footer for Section 2 (centered Arabic numerals 1, 2, 3...)
    footer_sec2 = sec2.footer
    p_f2 = footer_sec2.paragraphs[0]
    p_f2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_f2 = p_f2.add_run()
    r_f2.font.name = 'Times New Roman'
    r_f2.font.size = Pt(10)
    fldSimple2 = parse_xml(r'<w:fldSimple %s w:instr="PAGE"/>' % nsdecls('w'))
    r_f2._r.append(fldSimple2)

    # Start Arabic page numbering at 1
    sec2._sectPr.append(parse_xml(r'<w:pgNumType %s w:fmt="decimal" w:start="1"/>' % nsdecls('w')))

    # --- CHAPTER ONE ---
    add_h1_with_bookmark("CHAPTER ONE: PROBLEM IDENTIFICATION", "chap1")
    add_h2_with_bookmark("1.1 Background to the Problem", "sec1_1")
    add_p("Kenya’s Vision 2030 and the National Education Sector Strategic Plan identify Science, Technology, Engineering, and Mathematics (STEM) education as the driving engine of industrialization, technical innovation, and national socio-economic transformation. Both the outgoing 8-4-4 secondary curriculum and the ongoing Competency-Based Curriculum (CBC) transition emphasize experiential, inquiry-based science education over passive memorization of abstract facts. As Barasa and Nyongesa (2021) observe in their analysis of CBC secondary pathways, scientific competencies cannot be cultivated through theoretical exposition alone; learners require continuous opportunities to manipulate physical variables, formulate testable hypotheses, and analyze experimental discrepancies. In chemistry, conceptual understanding is inextricably bound to hands-on experimentation. Learners grasp stoichiometry, chemical equilibria, and reaction kinetics only when they observe, manipulate, and measure the physical phenomena that underpin those concepts.")
    add_p("Within the Kenyan secondary school curriculum, Chemistry occupies a central position. In Forms 1 through 4, laboratory work is not an optional enrichment activity. It forms an independent, compulsory national examination paper: KCSE Chemistry Paper 3 (Subject Code 233/3), which accounts for 40 percent of the candidate's overall Chemistry grade. In their empirical study on science process skills in Kenyan secondary schools, Chebii, Wachanga, and Kiboss (2012) established that laboratory manipulation skills—such as volumetric measurement, observation of color transitions, and qualitative inference deduction—strongly predict overall academic achievement in science. To succeed in Paper 3, a learner must demonstrate disciplined manual and analytical competencies. These competencies include priming and filling a burette without trapped air bubbles, zeroing a 25.0 cubic centimetre pipette accurately against the lower meniscus, identifying subtle indicator end-point color transitions, generating concordant titre values that agree within plus or minus 0.10 cubic centimetres, conducting systematic qualitative tests for unknown cations and anions through dropwise reagent additions, and computing multi-step stoichiometric calculations from primary laboratory readings.")
    add_p("Mastery of these practical procedures demands regular, deliberate manipulation. Yet for the vast majority of Kenyan secondary school learners, this practice does not happen. Over 60 percent of public secondary schools, particularly sub-county day schools in rural counties and informal urban settlements, lack even the basic physical infrastructure required to conduct a weekly laboratory session. Consequently, thousands of candidates enter the national practical examination with virtually no prior hands-on exposure. This structural deficit produces persistent underperformance, widespread loss of routine accuracy marks, and deep-seated examination anxiety among students.")

    add_h2_with_bookmark("1.2 The Laboratory Infrastructure Crisis", "sec1_2")
    add_p("The disparity between school categories in Kenya is glaring and persistent. On one hand, top-tier National and Extra-County boarding institutions possess multi-room science laboratory complexes complete with piped gas lines, dedicated fume cupboards, running water at every bench, and analytical balances. On the other hand, Sub-County Day Secondary Schools, which enrol over 65 percent of the national secondary student population, rarely have dedicated laboratory buildings. According to the nationwide baseline survey conducted by the Centre for Mathematics, Science and Technology Education in Africa (CEMASTEA, 2020), more than 63 percent of public sub-county secondary schools across Kenya lack dedicated chemistry laboratories, with science lessons typically conducted in ordinary multipurpose classrooms lacking running water, gas, or electrical fittings.")
    add_p("This infrastructural disparity has been documented across multiple Kenyan counties. Investigating laboratory adequacy in Kakamega North Sub-County, Mukhwana (2020) revealed that over 74 percent of public secondary schools operated with critically deficient chemistry facilities, directly correlating with persistent underperformance in KCSE Chemistry practical examinations. Similarly, in Bungoma County, Wabwoba and Chang’ach (2021) established that delayed disbursement of Free Day Secondary Education (FDSE) capitation funds severely crippled schools' abilities to procure essential laboratory glassware and consumable reagents, forcing school heads to cancel scheduled practical lessons. In their earlier investigation in Kakamega South District, Amadalo, Shikokoti, and Wasike (2012) found that more than 70 percent of chemistry teachers regularly substituted student hands-on practicals with teacher-only demonstrations from the front bench because the school possessed fewer than five functional burettes for an entire class of fifty learners.")
    add_p("This physical deficit is compounded by the high cost and short shelf-life of consumable chemical reagents. Standard laboratory compounds such as silver nitrate, potassium manganate(VII), barium chloride, and analytical pH indicators are prohibitively expensive for schools operating under tight capitation budgets. As Kiptum (2018) highlighted in Nakuru County, chemistry teachers in under-resourced schools routinely keep chemical stores locked until two or three weeks before the national examination rehearsal, rationing scarce chemicals for a single mock practical. Furthermore, severe class-size bottlenecks exacerbate safety hazards. In public sub-county schools, student-to-teacher ratios frequently exceed 50 to 60 learners per class. Conducting wet-chemistry experiments with concentrated mineral acids, volatile organic solvents, or toxic gases in poorly ventilated, overcrowded rooms presents severe safety risks. Fearing chemical burns, glassware breakage expenses, or respiratory accidents, science teachers often abandon individual student experiments entirely, resorting instead to theoretical chalkboard descriptions.")

    add_h2_with_bookmark("1.3 Digital Interventions in Low-Resource Contexts", "sec1_3")
    add_p("Virtual science laboratories have gained global prominence as viable digital scaffolds for physical laboratory instruction. In Kenya, recent empirical trials demonstrate positive learning gains when digital simulations are introduced into chemistry classrooms. In Machakos County, Wandera and Changeiywo (2021) investigated the effect of computer-based simulations on secondary chemistry achievement, reporting that learners exposed to interactive simulations demonstrated significantly higher mastery of volumetric analysis concepts than peers taught through conventional lecture methods. Similarly, in Siaya County, Omolo and Sifuna (2019) evaluated teacher preparedness in integrating digital science technologies, noting that while teachers recognized the transformative potential of virtual simulations, available commercial tools imposed excessive technical overhead and demanded continuous internet connectivity that rural schools simply could not provide.")
    add_p("Existing commercial and open platforms consistently fail when deployed into the reality of Kenyan public secondary schools. First, commercial platforms like Labster charge steep recurring annual per-student licensing fees in foreign currencies, placing them completely outside the financial reach of public day schools. Second, foreign virtual laboratories rely heavily on complex 3D WebGL graphics and advanced game engines. These software architectures crash or freeze when loaded on the entry-level Android smartphones, basic tablets, and second-hand desktop computers commonly found in Kenyan schools. Third, cloud-rendered platforms demand continuous, high-speed internet connectivity. In rural regions where cellular data is expensive and network signals fluctuate constantly, cloud-dependent simulations become unusable. Fourth, existing global platforms like PhET or ChemCollective, while conceptually valuable, are not aligned with the strict conventions of the KNEC Paper 3 marking scheme. They do not train learners on official KCSE results tables, penalise non-concordant titres, or mirror the systematic qualitative deduction matrices required by national examiners. VirtuLab Kenya was engineered from the ground up to overcome each of these four barriers.")

    add_h2_with_bookmark("1.4 Problem Identification", "sec1_4")
    add_p("Secondary school chemistry students in under-resourced Kenyan schools face severe structural disadvantages in national examinations because they lack access to functional physical laboratories, consumable reagents, and regular practical training. At the same time, available educational technology solutions fail to address this crisis because they are expensive, hardware-intensive, dependent on continuous internet access, and unaligned with the KICD syllabus and KNEC scoring standards.")

    add_h2_with_bookmark("1.5 Problem Statement", "sec1_5")
    add_p("Secondary school students in resource-constrained Kenyan secondary schools suffer persistent underperformance and high failure rates in KCSE Chemistry due to the absence of regular, hands-on laboratory experience. This deprivation produces high failure rates on KCSE Paper 3, severe practical examination anxiety, inaccurate manipulation of quantitative data, and depressed national enrolment in university STEM disciplines.")
    add_p("While virtual science laboratories could theoretically bridge this practical divide, existing digital tools are inaccessible to Kenyan day schools because they require high-bandwidth connectivity, powerful computing hardware, expensive software licenses, and follow foreign examination conventions. There is an urgent, unmet educational need for a curriculum-aligned, zero-marginal-cost, offline-first virtual chemistry laboratory that runs smoothly on low-cost mobile devices, provides bilingual scaffolding, and delivers actionable diagnostic feedback to both learners and teachers.")

    add_h2_with_bookmark("1.6 Purpose of the Capstone Project", "sec1_6")
    add_p("The purpose of this capstone project is to design, develop, deploy, and empirically evaluate VirtuLab Kenya, an offline-first, KICD-aligned virtual chemistry laboratory Progressive Web App, to expand practical science learning access for secondary school learners in resource-constrained Kenyan secondary schools.")

    add_h2_with_bookmark("1.7 Objectives of the Capstone Project", "sec1_7")
    add_h3_with_bookmark("1.7.1 General Objective", "sec1_7_1")
    add_p("To design, develop, deploy, and evaluate an offline-first, KICD-aligned virtual chemistry laboratory platform that enables secondary school learners in under-resourced schools to acquire essential practical competencies and improve performance in KCSE Chemistry Paper 3.")

    add_h3_with_bookmark("1.7.2 Specific Objectives", "sec1_7_2")
    add_p("The project is guided by five specific objectives: First, to engineer a lightweight, responsive Progressive Web App comprising seven core virtual laboratory modules covering all major KCSE Paper 3 practical domains, featuring dual-language scaffolding in English and Kiswahili. Second, to embed intelligent pedagogical scaffolds into the simulation engine, including interactive meniscus magnification, real-time chemical colour-kinetics, concordance verification within plus or minus 0.10 cubic centimetres, and automated step-by-step stoichiometric evaluation. Third, to build a lightweight administrative and teacher analytics dashboard that provides real-time class monitoring, custom assignment broadcasting, and automated student error-pattern classification. Fourth, to conduct a convergent mixed-methods quasi-experimental pilot study across ten stratified secondary schools to evaluate learning gains, interface usability, and technological acceptance among teachers and students. Fifth, to formulate evidence-based policy recommendations and an open-access deployment framework for institutional adoption by the Kenya Institute of Curriculum Development, CEMASTEA, and the Ministry of Education.")

    add_h2_with_bookmark("1.8 Research Questions", "sec1_8")
    add_p("This study addresses four central research questions: Research Question One: To what extent does the integration of VirtuLab Kenya improve secondary school students’ conceptual understanding and practical problem-solving scores in KCSE Chemistry Paper 3 topics compared to traditional lecture- and demonstration-based instruction? Research Question Two: How usable, accessible, and responsive is the offline-first Progressive Web App interface when deployed on entry-level mobile devices in low-connectivity school environments, as measured by the System Usability Scale? Research Question Three: What are Kenyan chemistry teachers’ and students’ perceptions regarding the Perceived Usefulness, Perceived Ease of Use, Facilitating Conditions, and Behavioural Intention to adopt VirtuLab Kenya, framed under the Technology Acceptance Model (TAM 3)? Research Question Four: How effectively do automated telemetry error logs enable teachers to identify and remediate specific student misconceptions in real time?")

    add_h2_with_bookmark("1.9 Research Hypotheses", "sec1_9")
    add_p("The quantitative strand of the evaluation tests the following hypotheses: Null Hypothesis (H0): There is no statistically significant difference in KCSE Chemistry Paper 3 post-test scores between learners using VirtuLab Kenya and learners taught through traditional classroom instruction without physical laboratory access, tested at the 0.05 level of significance. Alternative Hypothesis (H1): Learners using VirtuLab Kenya will demonstrate a statistically significant gain in post-test scores and practical competency metrics compared to the control group, achieving an average normalised learning gain of g greater than or equal to 0.40 at the 0.05 level of significance.")

    add_h2_with_bookmark("1.10 Significance of the Capstone Project", "sec1_10")
    add_p("VirtuLab Kenya directly targets educational equity in Kenyan secondary education, generating meaningful benefits across three key stakeholder groups.")
    add_p("For learners, the platform provides a consequence-free digital workbench. Students can repeat titrations ten or twenty times until they master meniscus alignment and indicator transition points, without fearing chemical burns, shattered glassware, or peer embarrassment. By turning abstract textbook formulas into visible, manipulable processes, the platform replaces examination dread with procedural confidence.")
    add_p("For educators, particularly in understaffed schools where a single chemistry teacher instructs over 200 students across multiple streams, the platform removes the burden of manual reagent preparation and apparatus washing. The teacher analytics dashboard automates assignment grading and immediately flags which students struggle with mole calculations or concordant titre selection, enabling targeted remedial instruction.")
    add_p("For schools and the national education system, VirtuLab Kenya operates at near-zero marginal cost. It consumes zero chemical stock, releases zero hazardous fumes, and runs locally on existing school tablets or students' personal smartphones. For the Ministry of Education and KICD, it offers a proven digital blueprint for delivering the practical science competencies envisioned in the CBC Senior Secondary STEM pathway.")

    add_h2_with_bookmark("1.11 Scope of the Capstone Project", "sec1_11")
    add_p("The capstone is strictly focused on Form 3 and Form 4 practical topics examined under KCSE Chemistry Paper 3 (Subject Code 233/3). The software encompasses seven laboratory modules: volumetric analysis (acid-base, redox, precipitation, and complexometric titrations), qualitative inorganic analysis, reaction kinetics, chemical energetics, solubility curves, qualitative organic tests, and a timed composite mock examination. The empirical pilot evaluation is scoped to ten selected secondary schools across Nairobi, Machakos, and Kiambu counties, engaging approximately 600 students and 20 chemistry teachers stratified across National, County, and Sub-County categories.")

    add_h2_with_bookmark("1.12 Delimitations", "sec1_12")
    add_p("This study is intentionally delimited to Kenyan secondary school chemistry. It excludes physics and biology practicals, although the underlying software architecture is engineered to support future multi-disciplinary expansion. Geographically, field data collection is delimited to the designated pilot schools in Kenya.")

    add_h2_with_bookmark("1.13 Limitations", "sec1_13")
    add_p("First, because students are nested within intact school classrooms, true random assignment of individual participants is not feasible. The study utilizes a quasi-experimental non-equivalent control group design, with baseline variations controlled statistically using Analysis of Covariance (ANCOVA). Second, VirtuLab Kenya is designed to reinforce, scaffold, and supplement practical science learning; it is not intended to completely replace the physical handling of glassware when physical laboratory facilities are available. Third, pilot schools will possess varying device specifications, screen dimensions, and battery life, which could introduce minor variance in user experience.")

    add_h2_with_bookmark("1.14 Assumptions", "sec1_14")
    add_p("The study is based on three foundational assumptions: first, that targeted pilot schools possess at least intermittent access to Android devices, tablets, or computer lab hardware; second, that participating chemistry teachers and students will engage with the platform in good faith during the intervention period; and third, that student scores on the standardized Chemistry Practical Competency Achievement Test faithfully reflect their practical chemistry competence.")

    add_h2_with_bookmark("1.15 Definition of Key Terms", "sec1_15")
    add_p("VirtuLab Kenya refers to a web-based, bilingual, offline-first virtual chemistry laboratory platform engineered specifically for KCSE candidates. Concordant Titres refers to volumetric titres that agree within plus or minus 0.10 cubic centimetres, fulfilling KNEC scoring requirements for full accuracy marks. Chemistry Practical Competency Achievement Test refers to the 40-mark standardized criterion-referenced pre- and post-test instrument developed for this investigation. Normalised Learning Gain refers to Richard Hake’s metric measuring student score improvement relative to the maximum possible gain achievable from pre-test to post-test. System Usability Scale refers to John Brooke’s validated ten-item instrument yielding a composite software usability benchmark from 0 to 100. Technology Acceptance Model refers to the theoretical model measuring Perceived Usefulness, Perceived Ease of Use, Facilitating Conditions, and Behavioural Intention to adopt a digital tool.")

    add_h2_with_bookmark("1.16 Chapter Summary", "sec1_16")
    add_p("This chapter established the acute laboratory infrastructure crisis facing Kenyan sub-county secondary schools and explained how this deficit directly undermines student performance in KCSE Chemistry Paper 3. Supported by national literature from CEMASTEA and regional empirical studies across Kakamega, Bungoma, Nakuru, Machakos, and Siaya, it introduced VirtuLab Kenya as a contextualised, offline-first digital solution and established the study’s core objectives, research questions, hypotheses, and scope. Chapter Two presents the theoretical framework and empirical literature supporting this capstone.")

    # --- CHAPTER TWO ---
    doc.add_page_break()
    add_h1_with_bookmark("CHAPTER TWO: RESEARCH AND ANALYSIS", "chap2")
    add_h2_with_bookmark("2.1 Conceptualisation of the Problem", "sec2_1")
    add_p("Underperformance in secondary school practical chemistry is neither an accident nor an indicator of student cognitive inability. It represents the predictable structural consequence of an assessment model that tests candidates on physical manipulation skills they were never afforded the opportunity to practice. When a national examination allocates 40 percent of its marks to precision laboratory techniques, schools lacking functional laboratories place their learners at an immediate disadvantage. As CEMASTEA (2020) and Mukhwana (2020) have demonstrated, the persistent failure of sub-county secondary candidates on national chemistry practicals is directly linked to apparatus deprivation and reagent shortages.")
    add_p("Resolving this crisis demands a paradigm shift in how practical science is delivered in low-resource environments. Physical laboratory infrastructure is capital-intensive and slow to construct; virtual simulation environments, conversely, can be deployed immediately and iterated infinitely at near-zero marginal cost. However, for a digital intervention to function effectively in Kenyan classrooms, it cannot be a passive, generic import. It must be intentionally designed to operate within the severe technical, fiscal, and linguistic constraints of sub-county day schools.")

    add_h2_with_bookmark("2.2 Review of Related Literature", "sec2_2")
    add_h3_with_bookmark("2.2.1 Educational Inequity in Science Access", "sec2_2_1")
    add_p("A substantial body of empirical research highlights the severe disparity in STEM outcomes between well-resourced national boarding schools and resource-constrained day schools across East Africa. In an investigation into school-level predictors of academic performance in Kakamega County, Gitira (2025) identified the absence of dedicated science laboratories as the single strongest negative predictor of KCSE performance in sub-county institutions. In these schools, teachers are forced to rely on textbook diagrams and blackboard sketches, leaving learners utterly disoriented when confronted with real apparatus during mock examinations.")
    add_p("This finding aligns with the empirical work of Ochieng’ (2023) in Kisumu County. Ochieng’ established that irregular laboratory sessions—caused by a chronic shortage of consumable chemicals and a total absence of trained laboratory technicians—directly contributed to candidates losing basic marks on titration accuracy and apparatus manipulation in Chemistry Paper 3. Teachers in these schools reported that because they lacked technicians to prepare standard molar solutions, the burden of bench preparation fell entirely on their shoulders. When combined with teaching loads exceeding 28 lessons per week, practical sessions were either truncated or eliminated altogether. Similarly, Wabwoba and Chang’ach (2021) in Bungoma County and Amadalo, Shikokoti, and Wasike (2012) in Kakamega South documented that over 70 percent of science teachers were forced to abandon individual learner practicals in favor of front-bench demonstrations due to severe equipment shortages.")

    add_h3_with_bookmark("2.2.2 Role of Virtual Laboratories in Science Education", "sec2_2_2")
    add_p("Globally and regionally, interactive virtual laboratories have emerged as potent pedagogical scaffolds. Rather than merely demonstrating experiments through passive video recordings, interactive simulations place learners in the driver’s seat of active inquiry. In Kenya, Mwangi and Khatete (2020) investigated the influence of virtual laboratory simulations on secondary school chemistry achievement in Nairobi County, finding that students utilizing virtual simulations alongside regular classroom instruction achieved significantly higher scores in volumetric analysis and qualitative chemistry than students taught using traditional lecture methods alone. These findings were mirrored in Machakos County by Wandera and Changeiywo (2021), who observed substantial conceptual gains and heightened science interest among secondary students practicing virtual chemistry simulations.")
    add_p("Regionally, in a quasi-experimental study conducted across secondary schools in Rulindo District, Rwanda, Nizeyimana and Musengimana (2026) found that students who supplemented their regular science lessons with interactive virtual simulations scored substantially higher on standardized post-tests than peers taught through traditional lecture methods alone, registering a massive effect size of Cohen’s d equal to 1.19. These findings reinforce earlier foundational work by Wieman, Adams, and Perkins (2008), who demonstrated through the PhET project that well-designed interactive simulations often outperform physical experiments in teaching abstract molecular concepts. Because virtual platforms allow students to manipulate invisible parameters, such as viewing ionic concentrations or molecular collisions in real time, they construct sturdier mental models than learners who merely follow a rote physical recipe on a laboratory bench. Similarly, in a comprehensive meta-analysis of computer simulations in science classrooms, Rutten, van Joolingen, and van der Veen (2012) confirmed that digital simulations produce the highest cognitive gains when embedded as pre-lab preparation tools that prime students on procedural steps before physical execution. To evaluate these learning gains with statistical rigor, Hake’s (1998) normalised gain formulation remains the gold standard in science education research, allowing researchers to measure student conceptual growth independent of baseline pre-test knowledge variations.")

    add_h3_with_bookmark("2.2.3 Contextualised Technology Integration in Sub-Saharan Africa", "sec2_2_3")
    add_p("Despite the documented benefits of digital laboratories, importing Western software directly into African classrooms routinely fails. Commercial platforms assume high-bandwidth fiber connectivity, desktop workstations with dedicated graphics processors, and substantial per-student recurring license budgets. When deployed in a rural Kenyan day school, these platforms fail due to hardware incompatibility, continuous connectivity dependence, and complete misalignment with national examination rubrics. As Omolo and Sifuna (2019) observed in Siaya County, digital learning tools in secondary schools face immediate abandonment if they impose high technical friction, require constant internet bundles, or fail to align with the examination timetable.")
    add_p("As Smetana and Bell (2012) emphasize in their critical review of science simulation tools, educational software is pedagogically effective only when it aligns precisely with the instructional context and assessment requirements of the learning environment. In low-resource African secondary classrooms, this principle is reinforced by Awuor and Ndiege (2022), who argue that digital learning platforms must be engineered around local constraints: offline operability, zero licensing friction, minimal data payloads, and complete fidelity to national curricular rubrics. Foreign simulations use different measurement conventions, ignore KNEC-specific table layouts, and fail to enforce the strict concordance thresholds that determine whether a Kenyan candidate earns or loses marks on KCSE Question 1.")

    add_h3_with_bookmark("2.2.4 Constructivist Approaches in Digital Pedagogy", "sec2_2_4")
    add_p("Technology alone does not teach; pedagogy determines efficacy. Unstructured digital sandboxes often overwhelm novice learners, inducing high cognitive load and aimless exploration. Effective digital labs must embed systematic pedagogical scaffolding. Bybee’s (2009) 5E Instructional Model—Engage, Explore, Explain, Elaborate, and Evaluate—provides the ideal theoretical structure for digital inquiry. By structuring software tasks so that learners first explore chemical phenomena, explain the underlying stoichiometric relationships, and subsequently evaluate their own precision against KNEC rubrics, the platform guides students from dependent novices toward autonomous mastery.")

    add_h2_with_bookmark("2.3 Theoretical and Conceptual Framework", "sec2_3")
    add_h3_with_bookmark("2.3.1 Constructivism and Inquiry-Based Science Education", "sec2_3_1")
    add_p("VirtuLab Kenya is grounded in Piagetian constructivism (Piaget, 1973), which posits that learners build robust conceptual schemas not by absorbing transmitted facts, but by actively acting upon their environment. Through the simulation engine, students manipulate physical parameters—burette flow rates, dropwise indicator additions, solution temperatures, and reagent concentrations—and immediately observe authentic chemical reactions, including color transitions, gas evolution, and precipitate formation.")
    add_p("To prevent learner frustration, the platform operationalises Vygotsky’s (1978) Zone of Proximal Development through a dual-mode instructional design. In Guided Mode, novice Form 3 learners receive step-by-step visual prompts, highlights on incorrect meniscus alignment, and warnings before overshooting a titration end-point. In Exam Mode, scaffolding is systematically removed. Students work against a countdown timer without prompts, replicating the authentic high-stakes pressure of KCSE Paper 3.")

    add_h3_with_bookmark("2.3.2 Cognitive Theory of Multimedia Learning and Cognitive Load Theory", "sec2_3_2")
    add_p("The user interface and interaction design are governed by Mayer’s (2009) Cognitive Theory of Multimedia Learning and Sweller’s (1988) Cognitive Load Theory. Working memory has strict capacity limits, especially when students grapple with complex multi-step chemical calculations. VirtuLab Kenya incorporates three fundamental design principles: First, the Spatial Contiguity Principle dictates that apparatus controls, reagent selection menus, and dynamic readouts are co-located on a single unified canvas. Students do not have to scroll back and forth between instructions and apparatus, eliminating split-attention effects. Second, the Signalling Principle ensures that crucial perceptual cues, such as the faint pink color flash preceding the true phenolphthalein end-point, are visually highlighted to direct the learner's attentional focus. Third, the Segmenting Principle ensures that complex laboratory procedures are partitioned into distinct, manageable cognitive steps, moving systematically from pipetting to titrating, recording, and stoichiometric calculation.")

    add_h3_with_bookmark("2.3.3 Technology Acceptance Model (TAM 3)", "sec2_3_3")
    add_p("To examine how and why teachers and students adopt or reject VirtuLab Kenya, the study employs the Technology Acceptance Model (TAM 3) formulated by Venkatesh and Bala (2008), building upon Davis’s (1989) foundational model. TAM 3 posits that actual system usage is driven by Behavioural Intention, which is fundamentally shaped by two primary cognitive beliefs: Perceived Usefulness, which reflects the degree to which users believe the tool will enhance chemistry performance, and Perceived Ease of Use, which reflects how intuitive and effortless the interface is to operate. In resource-constrained environments, TAM 3 is particularly valuable because it explicitly incorporates Facilitating Conditions, such as device availability and offline resilience, which directly determine whether a technological innovation succeeds in a rural school.")

    add_h3_with_bookmark("2.3.4 Conceptual Framework", "sec2_3_4")
    add_p("The conceptual framework links the platform’s intervention features to learning and adoption outcomes through mediating TAM constructs, with school- and learner-level factors acting as moderators, summarized in Table 2.1.")

    # Table 2.1 with bookmark
    add_p("**Table 2.1: Conceptual Framework Matrix of Variables**", bold=True, space_after=4)
    tbl2_1_headers = ["Category of Variable", "Operational Construct", "Concrete Empirical Indicators"]
    tbl2_1_rows = [
        ["Independent Variables", "VirtuLab Kenya Intervention Features", "Interactive simulation modules; offline PWA functionality; dual-language English/Kiswahili interface; automated meniscus and titration feedback."],
        ["Moderating Variables", "Institutional and Student Context", "School classification (National, County, Sub-County); prior student mobile device familiarity; teacher ICT readiness and administrative support."],
        ["Mediating Variables", "TAM 3 Constructs and Usability", "Perceived Usefulness score; Perceived Ease of Use score; Facilitating Conditions rating; System Usability Scale composite benchmark."],
        ["Dependent Variables", "Learning and Adoption Outcomes", "Normalised learning gain (g) on CPCAT; titration concordance accuracy; reduction in practical exam anxiety; sustained platform usage telemetry."]
    ]
    add_table(tbl2_1_headers, tbl2_1_rows)

    add_h2_with_bookmark("2.4 Review of Existing Practices, Policies and Interventions", "sec2_4")
    add_p("The Ministry of Education, in partnership with CEMASTEA, has spearheaded continuous teacher professional development cycles aimed at promoting ICT integration in science. During recent 2023–2024 CEMASTEA workshops, national trainers repeatedly advocated for virtual laboratories as potential solutions for schools lacking physical apparatus. However, a yawning chasm remains between national policy advocacy and practical classroom realities. Most state ICT programs have focused on primary school tablet distribution, with minimal investment in locally produced, curriculum-aligned secondary software. While teachers are frequently shown PhET simulations, they struggle to map them directly to KCSE examination questions. Furthermore, foreign tools lack Kiswahili language scaffolding, which is crucial for helping students who struggle with academic English unpack complex chemical instructions. The KICD Secondary Education Curriculum Designs for Chemistry (Forms 1 to 4) provide the explicit benchmark against which every module in VirtuLab Kenya has been built.")

    add_h2_with_bookmark("2.5 Benchmarking and Comparative Analysis", "sec2_5")
    add_p("To establish the distinct contributions of VirtuLab Kenya, Table 2.2 benchmarks the platform against the predominant international virtual chemistry tools.")

    add_p("**Table 2.2: Benchmarking of Virtual Laboratory Platforms**", bold=True, space_after=4)
    tbl2_2_headers = ["Evaluation Parameter", "PhET Simulations", "Labster Virtual Labs", "ChemCollective", "VirtuLab Kenya"]
    tbl2_2_rows = [
        ["Curricular Alignment", "Generic US High School", "University / AP Level", "US College Chemistry", "Exact KICD & KNEC Paper 3"],
        ["Bilingual Support", "English and select global", "English only", "English only", "English and Kiswahili UI"],
        ["Offline Capability", "Partial through bulk app", "None (Cloud streaming)", "None (Browser online)", "Complete PWA Offline Cache"],
        ["Hardware Demands", "Moderate (Requires WebGL)", "High (Requires GPU)", "Moderate", "Ultralight (Runs on 1GB RAM)"],
        ["Local Table Formatting", "No", "No", "No", "Exact KNEC Titre Tables"],
        ["Cost to School", "Free", "Commercial Subscription", "Free", "Free / Open Source"]
    ]
    add_table(tbl2_2_headers, tbl2_2_rows)

    add_h2_with_bookmark("2.6 Research and Project Methodology", "sec2_6")
    add_h3_with_bookmark("2.6.1 Research Design", "sec2_6_1")
    add_p("This project employs a Design and Development Research (DDR) framework following the ADDE model: Analyse, Design, Develop, and Evaluate. For the pedagogical evaluation phase, the study executes a Convergent Parallel Mixed-Methods Quasi-Experimental Design, incorporating a Pre-test and Post-test Non-Equivalent Control Group configuration. Because Kenyan secondary school students are formally organized into established class streams, individual random assignment is impossible without disrupting school timetables. The quasi-experimental structure allows intact classroom groups to participate while maintaining research rigor. The Experimental Group uses VirtuLab Kenya for pre-lab preparation, guided titration practice, and take-home exercises over an eight-week intervention period. The Control Group learns the identical curriculum topics using traditional instructional methods, including standard textbooks and teacher-led blackboard demonstrations, without access to virtual simulations. Threats to internal validity, such as teacher instructional variation, will be controlled through standardized teaching pacing guides, initial teacher briefing workshops, and statistical control via Analysis of Covariance (ANCOVA).")

    add_h3_with_bookmark("2.6.2 Target Population and Sampling Strategy", "sec2_6_2")
    add_p("The target population comprises Form 3 and Form 4 Chemistry students and their respective subject teachers in Kenya. The study utilizes a Stratified Purposive and Multi-Stage Cluster Sampling design across three distinct administrative categories of secondary schools, detailed in Table 2.3.")

    add_p("**Table 2.3: Target Population and Stratified Sampling Matrix**", bold=True, space_after=4)
    tbl2_3_headers = ["Stratum", "School Administrative Category", "Physical Infrastructure Baseline", "Number of Schools", "Target Students (n)", "Target Teachers"]
    tbl2_3_rows = [
        ["1", "National and Extra-County Schools", "Well-equipped laboratories, running water, piped gas", "2", "Approximately 120", "4"],
        ["2", "County Secondary Schools", "Partial laboratories, shared apparatus, chemical shortages", "3", "Approximately 180", "6"],
        ["3", "Sub-County Day Secondary Schools", "Severely under-resourced, makeshift rooms, rare wet labs", "5", "Approximately 300", "10"],
        ["Total", "Complete Stratified Sample", "Heterogeneous national representative sample", "10", "Approximately 600", "20"]
    ]
    add_table(tbl2_3_headers, tbl2_3_rows)
    add_p("This stratification ensures that the evaluation captures the full spectrum of educational realities in Kenya, with a deliberate weighting of 50 percent placed on sub-county day schools, where the infrastructure deficit is most acute.")

    add_h3_with_bookmark("2.6.3 Data Collection Instruments", "sec2_6_3")
    add_p("To achieve thorough triangulation across quantitative and qualitative strands, five validated instruments will be employed. First, the Chemistry Practical Competency Achievement Test (CPCAT) is a 40-mark criterion-referenced test administered before and after the eight-week intervention. Aligned strictly with KNEC Paper 3 rubrics, it measures procedural knowledge, meniscus reading, titration arithmetic, and qualitative inference logic. Second, the System Usability Scale (SUS) is Brooke’s (1996) standard ten-item Likert instrument administered to experimental group learners post-intervention to calculate software usability scores from 0 to 100. A composite score of 78 or higher, corresponding to a Grade A benchmark, serves as the target usability threshold. Third, the Technology Acceptance Model (TAM 3) Survey is a 5-point Likert questionnaire measuring teachers' and students' Perceived Usefulness through six items, Perceived Ease of Use through six items, Facilitating Conditions through four items, and Behavioural Intention through four items. Fourth, Automated Server Telemetry Logs capture granular, timestamped database events, recording mean attempts per student, error frequency such as choosing an improper indicator for a weak acid titration, time-on-task, and percentage of concordant titres achieved within plus or minus 0.10 cubic centimetres. Fifth, Semi-Structured Qualitative Interviews and Focus Group Discussions will be conducted with participating teachers and learners to uncover classroom dynamics, perceived workload impacts, and cultural or linguistic adoption barriers.")

    add_h3_with_bookmark("2.6.4 Validity of Instruments", "sec2_6_4")
    add_p("Content, construct, and criterion validity of the CPCAT will be established through an expert review panel comprising three active KICD chemistry curriculum specialists and two experienced KCSE national examiners. The panel will independently review test items against the national syllabus and KNEC scoring keys, revising questions until a Content Validity Index of at least 0.85 is attained.")

    add_h3_with_bookmark("2.6.5 Reliability and Trustworthiness", "sec2_6_5")
    add_p("The internal consistency of the quantitative survey instruments (SUS and TAM 3) will be evaluated using Cronbach’s alpha. An alpha coefficient of 0.80 or higher across all sub-scales will be required prior to deploying the final survey. For qualitative interview transcripts, trustworthiness will be maintained through member-checking with interviewees and audit-trail documentation during thematic coding.")

    add_h3_with_bookmark("2.6.6 Data Collection Procedures", "sec2_6_6")
    add_p("Fieldwork will follow a structured chronological sequence: First, obtaining ethical clearance from NACOSTI and institutional approval from the Open University of Kenya Directorate of Research. Second, securing administrative clearance from County Directors of Education in Nairobi, Machakos, and Kiambu counties. Third, conducting school visits, headteacher briefings, and distributing parental consent and student assent forms. Fourth, administering the CPCAT pre-test across both control and experimental cohorts. Fifth, executing the eight-week classroom intervention period with continuous telemetry logging. Sixth, administering the CPCAT post-test, SUS usability survey, and TAM 3 questionnaires. Seventh, conducting qualitative teacher interviews and student focus group discussions.")

    add_h3_with_bookmark("2.6.7 Data Analysis Techniques", "sec2_6_7")
    add_p("Quantitative data will be processed using descriptive and inferential statistics. Learning gain will be evaluated using Richard Hake’s Average Normalised Learning Gain: g = (Post-test % - Pre-test %) / (100% - Pre-test %). Gains will be classified as High for g greater than or equal to 0.70, Medium for g between 0.30 and 0.69, and Low for g below 0.30. Inferential testing will employ paired-sample t-tests to determine within-group pre-to-post improvements. Analysis of Covariance (ANCOVA) will test the primary research hypothesis, comparing post-test scores between experimental and control cohorts while statistically partialling out baseline pre-test scores as a covariate. Practical educational significance will be quantified using Cohen’s d effect size. Qualitative audio transcripts from teacher interviews and student focus groups will undergo inductive thematic analysis, triangulating qualitative user sentiments against the automated telemetry log data.")

    add_h3_with_bookmark("2.6.8 Ethical Considerations and Data Protection", "sec2_6_8")
    add_p("In compliance with the Kenya Data Protection Act of 2019 and NACOSTI ethical guidelines, participation will be entirely voluntary. Any student or teacher may withdraw at any time without penalty or academic disadvantage. Because participants are minor secondary students, informed written consent will be secured from parents and guardians, alongside written student assent. All data will be pseudonymised. Students will be assigned random alphanumeric identifiers such as STU-0421, and school names will be masked in published reports. User passwords on the platform will be hashed using bcrypt with a work factor of 10, and all backend database communications will be encrypted in transit via SSL and TLS protocols.")

    add_h2_with_bookmark("2.7 Analysis of the Identified Problem", "sec2_7")
    add_p("The performance deficit in KCSE Chemistry Paper 3 is an empirical reality documented across decades of KNEC national examination reports. Candidates repeatedly drop straightforward marks in Section 1 (Titration) not because the stoichiometry is intellectually inaccessible, but because they have never developed the tactile intuition required to stop a burette dropwise at the first permanent color change. In Section 2 (Qualitative Analysis), learners routinely confuse white precipitates that dissolve in excess ammonia with those that remain insoluble, because they have only memorised written tables without ever witnessing the reaction in a test tube. This absence of sensory and procedural engagement directly drives test failure and fuels the widespread perception that chemistry is an impossibly difficult subject.")

    add_h2_with_bookmark("2.8 Root-Cause Analysis", "sec2_8")
    add_p("A systematic examination of the Kenyan educational landscape reveals four interconnected root causes underpinning this crisis: First, severe fiscal constraints under the Free Day Secondary Education capitation structure mean that schools receive a fixed, delayed allocation per student that barely covers basic utility bills, leaving zero budgetary cushion for expensive glassware and consumable chemicals. Second, supply chain bottlenecks and reagent degradation present major hurdles. Schools in rural sub-counties must travel long distances to major urban centers to procure chemicals. Once purchased, chemicals like silver nitrate degrade under poor storage conditions, leading to inaccurate results during rare experiments. Third, acute staffing shortages of laboratory technicians leave public schools vulnerable. Science teachers, already managing heavy classroom timetables, cannot realistically prepare 50 individual bench setups single-handedly. Fourth, safety and liability fears prevent regular experimentation. With student-to-teacher ratios regularly exceeding 50 to 1, instructors are legitimately terrified of lab fires, chemical splashes, and toxic vapor inhalation in unventilated rooms. Pedagogical demonstration from the front bench becomes the only safe, rational survival strategy for the teacher.")

    add_h2_with_bookmark("2.9 Needs and Gap Analysis", "sec2_9")
    add_p("While digital learning tools have multiplied rapidly over the past decade, a critical educational gap remains unaddressed. Existing virtual laboratories ignore the specific format of the KCSE practical examination, require computing hardware that 90 percent of sub-county schools do not possess, demand constant, expensive internet connections, and omit national language scaffolding in Kiswahili. There is a clear, urgent need for an educational platform designed explicitly for low-resource environments: lightweight, offline-first, culturally and linguistically contextualised, and strictly aligned with the KNEC Paper 3 marking rubric.")

    add_h2_with_bookmark("2.10 Analysis of Alternative Solutions", "sec2_10")
    add_p("Prior to committing to a software-based virtual laboratory, two alternative policy interventions were evaluated: The first alternative was mobile physical laboratory vans, which equip regional vehicles with physical apparatus to rotate among rural schools. While providing genuine physical glass handling, mobile labs are extraordinarily capital-intensive, suffer from rural road wear-and-tear, and provide each school with only one or two visits per term, which is insufficient for developing mastery through routine repetition. The second alternative was centralised county laboratory hubs, where day school students travel to well-equipped national schools on weekends. This alternative imposes significant ongoing transportation costs on impoverished parents, introduces logistical and safety liabilities, and does not provide teachers with routine classroom integration tools.")

    add_h2_with_bookmark("2.11 Selection of the Preferred Intervention", "sec2_11")
    add_p("VirtuLab Kenya was selected as the optimal intervention because it combines high pedagogical fidelity with near-zero marginal cost. Once installed as a Progressive Web App, it requires no recurring data bundles, executes locally on budget mobile hardware, allows students to repeat experiments dozens of times at their own pace, and gives teachers automated diagnostic data that no physical laboratory could ever produce. It provides an immediate, scalable, and equitable answer to an enduring educational crisis.")

    add_h2_with_bookmark("2.12 Chapter Summary", "sec2_12")
    add_p("This chapter synthesized the empirical literature on educational inequity and digital science simulations in Sub-Saharan Africa, established the project’s theoretical foundations in Constructivism, CTML, and TAM 3, and outlined a convergent mixed-methods quasi-experimental evaluation design across ten secondary schools. Furthermore, it articulated the root causes of the practical science deficit and justified VirtuLab Kenya as the most scalable, cost-effective intervention. Chapter Three details the technological architecture and instructional design of the platform.")

    # --- CHAPTER THREE ---
    doc.add_page_break()
    add_h1_with_bookmark("CHAPTER THREE: DESIGN AND DEVELOPMENT OF THE INTERVENTION", "chap3")
    add_h2_with_bookmark("3.1 Design Principles of the Capstone Intervention", "sec3_1")
    add_p("The engineering and instructional design of VirtuLab Kenya were guided by five core principles formulated to overcome the systemic obstacles of Kenyan secondary classrooms: First, strict curricular alignment was prioritized. Educational software in Kenya often fails because it introduces extraneous concepts from foreign curricula while ignoring the rigid assessment structures of national examinations. VirtuLab Kenya maintains 100 percent fidelity to the KICD Secondary Chemistry Syllabus and KNEC Paper 233/3 marking conventions, matching every simulated procedure to official examiner scoring guidelines. Second, frugal, zero-overhead accessibility guided architectural choices. Recognizing that public day schools rely on entry-level Android devices and legacy desktop computers, the client application was engineered entirely in semantic HTML5, modular vanilla CSS3, and native ECMAScript 2022. By intentionally eliminating bloated JavaScript frontend frameworks, the entire application bundle is kept under 3.5 megabytes, ensuring an initial cold load time of under 250 milliseconds even on degraded 3G cellular connections. Third, linguistic inclusivity and dual-language scaffolding were embedded into the core user interface. While English is the official language of instruction, secondary school learners in rural and sub-county schools often process complex scientific logic far more effectively when supported by their national language. The platform incorporates a synchronized, switchable dual-language interface in English and Kiswahili, allowing learners to toggle terminology instantly whenever procedural instructions prove conceptually difficult. Fourth, cognitive-load-aware interface design was implemented based on Richard Mayer’s multimedia learning principles. The visual workspace prevents extraneous split-attention by co-locating apparatus controls, reagent selection menus, and dynamic readouts on a single responsive viewport. Visual signalling, such as subtle highlighting on the burette meniscus and instantaneous color transitions at the equivalence point, guides student working memory directly toward critical observational cues. Fifth, human-centred iteration drove feature development. The software was not developed in isolation; it evolved through hands-on feedback cycles with practicing chemistry teachers and secondary learners. Every interactive element, from the touch-friendly burette stopcock slider to the five-tab navigation hierarchy, was refined to minimize navigation friction during timed class sessions.")

    add_h2_with_bookmark("3.2 Proposed Capstone Intervention and Innovation", "sec3_2")
    add_p("VirtuLab Kenya is a fully responsive, offline-first virtual chemistry laboratory Progressive Web App. It provides secondary students with an authentic, high-fidelity digital workbench where they can independently practice, record, and evaluate mandatory KCSE practical experiments. The platform delivers four transformative operational capabilities: First, zero-bandwidth execution is achieved through Service Worker caching and local client-side simulation engines. Students execute all laboratory simulations entirely offline. The application requires an internet connection only for the initial single-click installation and for synchronizing telemetry logs in the background when network connectivity becomes available. Second, a contextual volumetric precision engine embeds mathematical equilibrium models rather than simple animation loops. The burette responds dynamically to dropwise tap flow, simulates meniscus parallax, and calculates titres to a precision of 0.05 cubic centimetres. Third, automated formative scaffolding validates student data entries. When a student enters values into the digital KNEC results table, the system’s background logic evaluates whether the titres are concordant within the official plus or minus 0.10 cubic centimetre tolerance, immediately showing learners where arithmetic or experimental errors occurred. Fourth, a teacher diagnostic ecosystem bridges student homework with teacher oversight. Through a dedicated dashboard, teachers view aggregated class error logs, allowing them to pinpoint whether poor performance stems from meniscus misreading, improper indicator choice, or calculation breakdowns before students sit for their final exams.")

    add_h2_with_bookmark("3.3 Intervention Design Framework", "sec3_3")
    add_p("To ensure pedagogical integrity, the platform operationalises Vygotsky’s Zone of Proximal Development through a structured, two-tier learning pathway. In Guided Mode, novice learners are supported by continuous cognitive scaffolding. The interface prompts the next logical procedural step, such as reminding the student to rinse the pipette with the solution before drawing, provides a magnified cross-sectional view of the burette meniscus, and issues gentle visual cues when approaching the titration end-point. In Exam Mode, once a student demonstrates competence, scaffolding is completely withdrawn. Students face an unassisted, timed practical replicating the authentic conditions of KCSE Paper 3. They must read raw apparatus, record values in blank KNEC-formatted tables, average concordant titres without assistance, and compute multi-step stoichiometric calculations under strict exam countdown conditions.")

    add_h2_with_bookmark("3.4 System Architecture", "sec3_4")
    add_p("VirtuLab Kenya is engineered around a modern, modular, low-overhead client-server architecture designed specifically for low-bandwidth and intermittent-connectivity environments. The platform is structured across three distinct tiers: In the Client Tier, the application functions as an offline Progressive Web App built with native web standards. A service worker intercepts network requests, serving application logic directly from Cache Storage. Student interaction state and practice logs are stored locally in IndexedDB and LocalStorage, guaranteeing that an unexpected internet dropout never interrupts an active practical. In the Server Tier, a Node.js runtime running the Express framework acts as the secure API gateway. It authenticates user sessions using stateless JSON Web Tokens (JWT), enforces role-based access control across student, teacher, and administrator roles, manages automated assignment broadcasting, and processes queued telemetry payloads pushed by clients returning online. In the Database Tier, a PostgreSQL relational database enforces strict referential integrity across schools, classrooms, teachers, and individual student attempts. B-tree indexes are applied to user identifiers and session timestamps to maintain sub-millisecond query responses even under high concurrent classroom sync loads.")

    add_h2_with_bookmark("3.5 Laboratory Modules Implemented and Curriculum Roadmap", "sec3_5")
    add_p("The platform comprises seven distinct simulation modules directly aligned with the Form 1 to 4 curriculum and KCSE Paper 3 examination formats, summarized in Table 3.1.")

    add_p("**Table 3.1: VirtuLab Kenya Laboratory Modules and Curriculum Mapping**", bold=True, space_after=4)
    tbl3_1_headers = ["Module Name", "Simulated Experimental Procedures", "Target KCSE Practical Competencies", "Syllabus Reference"]
    tbl3_1_rows = [
        ["1. Volumetric Analysis", "Acid-base, redox, precipitation, and complexometric titrations", "Pipette priming, burette flow control, indicator end-point detection, concordant titre selection, stoichiometry", "Form 3 and 4, Paper 3 Question 1"],
        ["2. Qualitative Inorganic Analysis", "Systematic cation tests, anion identification, flame tests, gas confirmation", "Dropwise reagent addition to excess, precipitate dissolution observation, systematic inference deduction", "Form 4, Paper 3 Question 2"],
        ["3. Chemical Kinetics", "Sodium thiosulphate with acid (disappearing cross), magnesium ribbon with acid", "Rate curve plotting, gradient determination, collision theory interpretation", "Form 4, Paper 3 Question 3"],
        ["4. Chemical Energetics", "Enthalpy of neutralisation, enthalpy of solution and displacement", "Temperature-time extrapolation graphs, specific heat capacity calculations (mcΔT)", "Form 4, Paper 3 Question 3"],
        ["5. Solubility Curves", "Potassium chlorate crystallization temperature across dilution stages", "Cooling curve determination, solubility curve generation against temperature", "Form 3, Topic 4"],
        ["6. Qualitative Organic Chemistry", "Testing saturated and unsaturated hydrocarbons, carboxylic acids, alkanols", "Recording organic observation tables, functional group inference deduction", "Form 4, Organic Chemistry II"],
        ["7. Composite Mock Examination", "Full three-question timed practical replicating the KCSE Paper 3 format", "Practical exam pacing, data transcription, comprehensive mark-scheme grading", "Form 3 and 4, Comprehensive"]
    ]
    add_table(tbl3_1_headers, tbl3_1_rows)

    add_h2_with_bookmark("3.6 Technical Specifications", "sec3_6")
    add_p("The frontend is constructed using pure semantic HTML5, CSS3 design tokens with responsive Flexbox and Grid layouts, and native ECMAScript 2022. It contains zero external client framework dependencies, keeping the complete production bundle under 3.5 megabytes with an execution speed of under 250 milliseconds on standard 3G mobile networks. Offline execution is managed through a Progressive Web App service worker utilizing Cache-First strategies for static simulation assets and Stale-While-Revalidate strategies for session states. Local data persists in IndexedDB and LocalStorage, supported by an automated background sync queue that uploads telemetry records when internet connectivity is re-established. The backend application programming interface operates on Node.js (version 18 LTS or higher) utilizing Express. The API is hardened with helmet security headers, strict CORS configuration, and express-rate-limit middleware to prevent request flooding. The database runs on PostgreSQL 15, utilizing relational tables with foreign keys and cascading constraints across users, schools, classes, lab sessions, assignments, badges, and error telemetry. Authentication is managed through stateless JSON Web Tokens signed with HMAC-SHA256, supported by bcrypt password hashing with a work factor of 10. Role-based access control restricts routes to student, teacher, and administrator levels. The telemetry system automatically records user action timestamps, trial counts, time elapsed per step, meniscus reading deviations, indicator selection errors, and arithmetic discrepancy rates.")

    add_h2_with_bookmark("3.7 Development Process", "sec3_7")
    add_p("The software development process followed the ADDE instructional engineering cycle across six operational phases: In Phase 1 (Needs Assessment and Syllabus Alignment), the research team examined 27 years of KCSE Chemistry Paper 3 examination papers from 1989 to 2016 and KICD curriculum documents to identify recurring experimental setups, common candidate errors, and scoring criteria. In Phase 2 (Core Simulation Engine Engineering), mathematical simulation models for volumetric titrations, chemical kinetics, and ionic equilibria were developed using native HTML5 Canvas and JavaScript event structures. In Phase 3 (PWA Scaffolding and Storage Integration), service worker caching protocols, offline storage mechanisms via IndexedDB, and the bilingual English/Kiswahili localization engine were constructed. In Phase 4 (Backend API and Teacher Dashboard), Node.js REST endpoints and the real-time teacher analytics dashboard were developed. In Phase 5 (Formative Usability Testing), internal laboratory testing with practicing chemistry teachers was conducted to evaluate interface responsiveness and refine touch controls. In Phase 6 (Field Piloting and Evaluation), the platform was prepared for deployment across ten partner secondary schools for empirical validation.")

    add_h2_with_bookmark("3.8 Prototype Development and Current Status", "sec3_8")
    add_p("A fully functional prototype of VirtuLab Kenya has been successfully developed and tested locally. The working prototype features four complete titration models covering acid-base, redox, precipitation, and complexometric reactions. It incorporates an interactive reagent dropper, an authentic magnified burette viewport reading to 0.05 cubic centimetres, and real-time dynamic pH titration curves that visualize equivalence points on demand. Furthermore, the prototype features standard KNEC-formatted results tables that automatically validate concordant titre entries within plus or minus 0.10 cubic centimetres. It embeds a comprehensive repository of 17 genuine KCSE Paper 3 past practical examination questions spanning 1989 to 2013 with interactive answer evaluation. Finally, the prototype provides three switchable visual themes: Clean White for high-glare daytime classrooms, Slate Blue Dark for evening study, and Lab Green for high-contrast accessibility.")

    add_h2_with_bookmark("3.9 Stakeholder Engagement and Content Validation", "sec3_9")
    add_p("To ensure that VirtuLab Kenya adheres strictly to national educational standards, content validation engages key educational authorities. Curriculum alignment is evaluated against KICD syllabus requirements to ensure learning outcomes match CBC Senior Secondary guidelines. Marking scheme fidelity was reviewed by four certified, practicing KCSE Chemistry Paper 3 national examiners, who confirmed that table penalties, concordance checks, and qualitative deduction sequences mirror KNEC standards. Academic oversight is provided by faculty supervisors within the School of Education at the Open University of Kenya.")

    add_h2_with_bookmark("3.10 Pilot Testing and Pre-Testing", "sec3_10")
    add_p("The pilot evaluation will engage approximately 600 secondary school students in Forms 3 and 4 and 20 chemistry educators. The sample is stratified across ten secondary schools in Nairobi, Machakos, and Kiambu counties, representing two National/Extra-County schools, three County schools, and five Sub-County day schools. Over an eight-week intervention period, experimental cohorts will use VirtuLab Kenya for pre-lab preparation, interactive simulation practice, and homework assignments. Efficacy will be measured through pre- and post-testing via the CPCAT achievement instrument, supplemented by post-intervention SUS usability questionnaires, TAM 3 surveys, and qualitative teacher interviews.")

    add_h2_with_bookmark("3.11 Revision and Refinement of the Intervention", "sec3_11")
    add_p("Early testing with secondary learners yielded crucial user experience refinements that were incorporated into the current release: First, an interactive dropper mechanic was introduced. Novice students initially struggled with tap flow control; the interactive dropper pipette allows fine dropwise addition when nearing the equivalence point. Second, a five-tab workspace hierarchy was established. Early interface iterations displayed instructions, apparatus, tables, and past paper questions on a single scrolling page, which overwhelmed mobile screens. The interface was restructured into five distinct tabs—Experiment, Results Table, Calculation, Past Papers, and Help—preventing cognitive overload. Third, touch-target optimisation was executed. Control buttons and slider taps were enlarged to conform to mobile accessibility guidelines, with minimum touch dimensions of 48 by 48 pixels, ensuring smooth operation on budget touchscreen smartphones.")

    add_h2_with_bookmark("3.12 12-Month Implementation Plan", "sec3_12")
    add_p("The project follows a 12-month implementation schedule structured across six core phases, presented in Table 3.2.")

    add_p("**Table 3.2: 12-Month Project Implementation Schedule**", bold=True, space_after=4)
    tbl3_2_headers = ["Phase", "Key Milestones and Deliverables", "Timeline", "Target Verification Criterion"]
    tbl3_2_rows = [
        ["1", "Requirements specification, KICD alignment matrix, Node.js backend scaffolding, and PWA service-worker architecture", "Months 1–2", "Passing database schema migrations and functional JWT authentication endpoints"],
        ["2", "Mathematical simulation engines for volumetric titrations, chemical kinetics, and ionic equilibria", "Months 3–4", "Precision burette simulation verified against experimental laboratory titrations"],
        ["3", "Qualitative inorganic analysis, energetics, solubility curves, and student gamification badge portal", "Months 5–6", "All 7 laboratory modules executing completely offline without network connectivity"],
        ["4", "Real-time teacher analytics dashboard, assignment broadcasting subsystem, and timed mock exam module", "Months 7–8", "Multi-school teacher and student role authorization verified under simulated network latency"],
        ["5", "NACOSTI research clearance, onboarding of 10 pilot schools, pre-test administration, and launch of 8-week intervention", "Months 9–10", "Active student usage logs recorded across 600 or more secondary learners"],
        ["6", "Post-test administration, SUS and TAM surveying, inferential statistical analysis, and final dissertation defense", "Months 11–12", "Successful Master's dissertation defense and publication of the open-source codebase"]
    ]
    add_table(tbl3_2_headers, tbl3_2_rows)

    add_h2_with_bookmark("3.13 Resource Requirements and Itemized Budget", "sec3_13")
    add_p("The project operates under a lean budget model designed for rapid pilot execution, hardware support for under-resourced schools, and academic dissemination, detailed in Table 3.3.")

    add_p("**Table 3.3: Resource Requirements and Itemized Budget**", bold=True, space_after=4)
    tbl3_3_headers = ["Item Category", "Description and Justification", "Quantity and Duration", "Total Cost (KES)", "Equivalent (USD)"]
    tbl3_3_rows = [
        ["1. Cloud Infrastructure and Hosting", "Managed PostgreSQL database, cloud application hosting, domain registration, SSL certificates", "12 Months", "54,000", "Approximately $415"],
        ["2. Pilot Hardware Support", "Refurbished Android test tablets for sub-county day schools lacking functional computer labs", "10 Tablets", "120,000", "Approximately $920"],
        ["3. Field Research and Travel", "Travel allowances for school visits across Nairobi, Machakos, and Kiambu; teacher training workshops", "10 Schools", "60,000", "Approximately $460"],
        ["4. Printing and Materials", "600 sets of standardized pre- and post-test CPCAT booklets, parental consent forms, and student certificates", "600 Sets", "30,000", "Approximately $230"],
        ["5. Research Licensing and Ethics", "NACOSTI research permit application fees and institutional review clearance", "1 License", "10,000", "Approximately $80"],
        ["6. Dissemination and Publishing", "Open-access peer-reviewed journal publication charges and stakeholder dissemination symposium", "Lump Sum", "25,000", "Approximately $195"],
        ["7. Contingency Reserve", "10 percent emergency operational buffer for device maintenance, data bundles, and field logistics", "Lump Sum", "29,900", "Approximately $230"],
        ["Total", "Complete Projected Capstone Budget", "Comprehensive allocation", "KES 328,900", "Approximately $2,530"]
    ]
    add_table(tbl3_3_headers, tbl3_3_rows)

    add_h2_with_bookmark("3.14 Risk Management Matrix", "sec3_14")
    add_p("Table 3.4 details the anticipated operational and technological risks alongside concrete mitigation strategies.")

    add_p("**Table 3.4: Risk Assessment and Mitigation Matrix**", bold=True, space_after=4)
    tbl3_4_headers = ["Identified Risk", "Severity", "Likelihood", "Concrete Mitigation Strategy"]
    tbl3_4_rows = [
        ["Intermittent or Zero Internet in Rural Schools", "High", "High", "Offline-first PWA design with Service Worker pre-caching; all 7 modules run locally via LocalStorage and IndexedDB; telemetry auto-syncs when reconnected."],
        ["Limited Computer or Smartphone Access", "High", "Medium", "Extreme UI optimization for low-cost Android phones; touch-friendly single-device group rotation mode; 10 refurbished tablets provided to participating day schools."],
        ["Teacher Resistance or Low ICT Literacy", "Medium", "Medium", "Zero installation footprint running directly in mobile browsers; intuitive two-click assignment dispatch; practical teacher orientation workshops with bilingual guides."],
        ["Curriculum or Examination Format Drift", "Low", "Low", "Continuous direct collaboration with certified KCSE chemistry examiners; modular code architecture allowing immediate parameter updates when KNEC updates rubrics."],
        ["Student Data Privacy and Protection", "Medium", "Low", "Strict compliance with the Kenya Data Protection Act of 2019; bcrypt password hashing; anonymized student research IDs; encrypted transit and database storage."]
    ]
    add_table(tbl3_4_headers, tbl3_4_rows)

    add_h2_with_bookmark("3.15 Sustainability and Scalability", "sec3_15")
    add_p("VirtuLab Kenya is built entirely upon free, open-source technologies, shielding participating schools from recurring commercial licensing fees. The software is architected for extensible multi-disciplinary scale. Following the chemistry evaluation, Phase 7 will expand the engine to encompass Physics practicals (electrical circuits, ray optics, and mechanics) and Biology practicals (enzyme action, osmosis, food tests, and respiration). Institutional integration will be anchored through partnerships with County Education Directorates and CEMASTEA, embedding VirtuLab Kenya into national in-service teacher training workshops.")

    add_h2_with_bookmark("3.16 Monitoring and Evaluation Framework", "sec3_16")
    add_p("The project’s operational success will be evaluated against five rigorous empirical benchmarks: First, attaining an average normalised learning gain of g greater than or equal to 0.40 on the CPCAT post-test, with statistically significant superiority over the control group at the 0.05 level. Second, achieving a mean System Usability Scale benchmark score of 78 or higher among student respondents. Third, securing a mean score of 4.0 or higher out of 5.0 across TAM 3 constructs for teacher acceptance. Fourth, demonstrating an internal consistency reliability coefficient of Cronbach’s alpha greater than or equal to 0.80 across all survey scales. Fifth, achieving 100 percent verified curricular mapping of simulated practical procedures against official KICD chemistry syllabus requirements.")

    add_h2_with_bookmark("3.17 Chapter Summary", "sec3_17")
    add_p("This chapter detailed the instructional and technical architecture of VirtuLab Kenya. It articulated the design principles governing the platform, detailed the three-tier system architecture, and presented the seven core laboratory modules. Furthermore, it established a 12-month implementation timeline, an itemized research budget of KES 328,900, a comprehensive risk-management matrix, and measurable evaluation metrics. Chapter Four presents the post-implementation reflection and evaluation framework.")

    # --- CHAPTER FOUR ---
    doc.add_page_break()
    add_h1_with_bookmark("CHAPTER FOUR: IMPLEMENTATION, EVALUATION AND REFLECTION", "chap4")
    add_p("Note: As this document is a capstone proposal, Chapter Four outlines the projected operational framework, planned data synthesis procedures, risk monitoring protocols, and academic reflection strategies that will govern the pilot study once executed in the field.", italic=True, space_after=12)

    add_h2_with_bookmark("4.1 Implementation of the Capstone Intervention", "sec4_1")
    add_p("The field implementation of VirtuLab Kenya will be executed across ten purposively selected secondary schools in Nairobi, Machakos, and Kiambu counties over an eight-week instructional cycle. This phase bridges theoretical software engineering and the complex, unpredictable realities of Kenyan public classrooms. Implementation will document the complete demographic profile of the participating cohort, comprising approximately 600 Form 3 and Form 4 learners and 20 chemistry educators. The study will track variables such as gender balance, prior device familiarity, daily electricity reliability, and historical school performance in KCSE Paper 233/3. By maintaining detailed field logs across all three educational strata, the project ensures that subsequent evaluations capture how infrastructural baselines moderate technology adoption.")

    add_h2_with_bookmark("4.2 Implementation Process", "sec4_2")
    add_p("The classroom deployment will follow a disciplined four-stage operational sequence. In Stage 1 (Infrastructure Preparation and Onboarding), spanning Weeks 1 and 2, headteacher briefings will be conducted and administrative permissions finalized. Refurbished tablets will be delivered to the five sub-county day schools, and the PWA will be installed via local Wi-Fi hotspots or USB sideloading. A teacher orientation workshop will introduce educators to dashboard navigation and assignment dispatching. In Stage 2 (Baseline Testing and Student Orientation), conducted in Week 3, the 40-mark CPCAT pre-test will be administered to both Control and Experimental cohorts under standardized examination conditions. A 45-minute student onboarding session will introduce experimental learners to the virtual apparatus controls and guided titration procedures. In Stage 3 (Classroom Intervention Cycle), spanning Weeks 4 through 9, a six-week curriculum intervention aligned with ongoing Form 3 and Form 4 classroom pacing will be conducted. Teachers will push weekly assignments covering volumetric, qualitative, and kinetics modules, while the platform continuously records background telemetry on trial counts, errors, and concordance. In Stage 4 (Post-Intervention Evaluation), executed in Week 10, the identical 40-mark CPCAT post-test will be administered to both cohorts. This will be followed immediately by the administration of the SUS and TAM 3 surveys, alongside qualitative teacher interviews and student focus group discussions.")

    add_h2_with_bookmark("4.3 Participation and Stakeholder Engagement", "sec4_3")
    add_p("Participant engagement will be continuously tracked across both automated and observational streams. Rather than assuming that students interact uniformly with the software, the telemetry engine will distinguish between structured classroom usage and voluntary home or evening practice. Student usage metrics will track the ratio of attempts conducted in Guided Mode versus Exam Mode, time-on-task per experimental run, drop-off rates on multi-step stoichiometry calculations, and the voluntary utilization of Kiswahili language toggles. Teacher engagement will measure how regularly instructors log into the diagnostic portal, the frequency with which they dispatch custom assignments, and whether they export CSV performance summaries to guide their face-to-face remedial lessons. These quantitative logs will be complemented by weekly classroom observation protocols to assess how physical seating arrangements and device-sharing dynamics influence peer collaboration and active inquiry.")

    add_h2_with_bookmark("4.4 Evaluation of the Intervention", "sec4_4")
    add_p("The evaluation strategy employs a convergent parallel design to test the research hypotheses and answer the four foundational research questions. Pedagogical efficacy will be evaluated by calculating normalised learning gains on the CPCAT and conducting an Analysis of Covariance (ANCOVA). ANCOVA will compare post-test scores between experimental and control groups while statistically partialling out pre-test baseline variations, ensuring that any observed score advantages can be attributed directly to VirtuLab Kenya rather than preexisting student ability. Technical usability will be benchmarked using the System Usability Scale, with a target composite threshold of 78 or higher to verify that the interface imposes negligible extraneous cognitive load on students with low prior digital literacy. Institutional and pedagogical acceptance will be measured through the TAM 3 framework, evaluating Perceived Usefulness, Perceived Ease of Use, and Facilitating Conditions to identify structural predictors of teacher adoption. Diagnostic utility will be evaluated by correlating automated error telemetry with specific items missed on the post-test, proving whether the teacher dashboard provides valid diagnostic intelligence.")

    add_h2_with_bookmark("4.5 Presentation of Evaluation Findings", "sec4_5")
    add_p("The final evaluation data will be synthesised and presented through four structured analytic formats: First, comparative achievement matrices will display sample sizes, pre-test means, post-test means, standard deviations, and calculated normalised gains disaggregated by school category and treatment condition. Second, ANCOVA summary tables will document F-statistics, degrees of freedom, p-values, and partial eta-squared effect sizes to test the rejection of the null hypothesis. Third, TAM construct distribution charts will illustrate mean Likert responses for Perceived Usefulness, Perceived Ease of Use, Facilitating Conditions, and Behavioural Intention, accompanied by Cronbach’s alpha reliability metrics. Fourth, telemetry error trend visualisations will demonstrate how student error rates decline across successive simulation trials.")

    add_h2_with_bookmark("4.6 Assessment of Outcomes", "sec4_6")
    add_p("The overarching assessment will determine whether VirtuLab Kenya successfully leveled the playing field for under-resourced schools. Specifically, the analysis will evaluate whether sub-county day school learners in the experimental cohort closed the historical performance gap on Paper 3 calculation and titration questions when compared against baseline scores from national boarding schools. It will examine whether the ability to repeat virtual titrations consequence-free translated into reduced examination anxiety and greater confidence when handling physical glassware. Finally, it will determine whether the teacher dashboard altered pedagogical practice, shifting instructors away from generic lecture delivery toward data-driven, individualized student remediation.")

    add_h2_with_bookmark("4.7 User and Stakeholder Feedback", "sec4_7")
    add_p("Qualitative feedback will be harvested systematically to explain the quantitative findings. Student focus groups will explore how learners experienced the dual-language Kiswahili/English feature, whether virtual simulations demystified abstract chemistry concepts, and the frustrations encountered when operating touch controls on small smartphone screens. Teacher interviews will investigate whether the platform reduced or increased overall pedagogical workload, how easy or difficult it was to integrate digital assignments into fixed school timetables, and teacher willingness to recommend VirtuLab Kenya to regional subject panels. Certified KCSE examiners will provide qualitative commentary on whether students trained on the platform demonstrated cleaner table layouts, proper averaging techniques, and fewer arithmetic penalties.")

    add_h2_with_bookmark("4.8 Comparison of Intended and Actual Outcomes", "sec4_8")
    add_p("At the conclusion of the 12-month pilot, a comprehensive accountability matrix will contrast the planned project benchmarks against the empirical realities recorded in the field, structured as outlined in Table 4.1.")

    add_p("**Table 4.1: Comparison Matrix of Target versus Projected Pilot Outcomes**", bold=True, space_after=4)
    tbl4_1_headers = ["Evaluation Parameter", "Data Collection Source", "Target Projected Criterion", "Analytical Method of Verification"]
    tbl4_1_rows = [
        ["Learning Gain Improvement", "CPCAT Pre/Post-Test", "Gain g ≥ 0.40; p < 0.05", "ANCOVA between groups with baseline control"],
        ["Interface Usability Score", "SUS Questionnaire", "Composite Score ≥ 78", "Mean calculation benchmarked against Brooke (1996)"],
        ["Teacher Acceptance Level", "TAM 3 Survey", "Mean ≥ 4.0 out of 5.0", "Descriptive mean across PU and PEOU sub-scales"],
        ["Sub-County Participation", "Class Attendance Logs", "≥ 300 day school students", "Database audit of unique active student accounts"],
        ["Offline System Resilience", "Telemetry Sync Logs", "Zero lost session records", "Audit verifying local queues synced upon reconnect"]
    ]
    add_table(tbl4_1_headers, tbl4_1_rows)

    add_h2_with_bookmark("4.9 Challenges Encountered During Implementation", "sec4_9")
    add_p("Anticipated field challenges will be rigorously documented, categorized under three primary domains: First, infrastructural deficits, including unscheduled power blackouts in rural sub-counties, low device battery reserves, and schools with zero functioning computers or charging stations. Second, device sharing bottlenecks in classes where student numbers exceed available tablets, requiring careful management of rotation schedules to prevent student disengagement. Third, teacher time constraints arising from pressure to rush through the syllabus before national examination deadlines, which often leads to resistance against adopting new pedagogical workflows unless they demonstrably save time.")

    add_h2_with_bookmark("4.10 Mitigation Measures", "sec4_10")
    add_p("To counter these operational bottlenecks, specific field protocols will be enforced: First, portable solar-powered battery packs will be provided alongside the ten pilot tablets to ensure uninterrupted testing even during local grid blackouts. Second, a collaborative pair-practice protocol will be implemented, where students work in pairs—one acting as the Laboratory Technician manipulating the digital apparatus and the other as the Chief Analyst recording observations and calculations, rotating roles on alternate trials. Third, curriculum-integrated lesson pacing guides will be provided to participating teachers, embedding VirtuLab Kenya directly into existing weekly syllabus schedules and removing the burden of lesson replanning.")

    add_h2_with_bookmark("4.11 Reflection on the Capstone Process", "sec4_11")
    add_p("This capstone represents a personal and professional intersection between software engineering and instructional design in the Global South. Developing VirtuLab Kenya demanded continuous negotiation between technical elegance and pragmatic field constraints. Early aspirations to incorporate heavy 3D rendering libraries had to be abandoned in favour of lightweight, performant canvas animations to ensure that a student in rural Kakamega holding a low-cost, second-hand smartphone could run the application without lag. The project reinforced a fundamental truth in educational technology: the most sophisticated digital tool is worthless if it cannot survive the harsh, bandwidth-starved, and underfunded realities of the classrooms that need it most.")

    add_h2_with_bookmark("4.12 Lessons Learned and Best Practices", "sec4_12")
    add_p("The design and deployment trajectory will be codified into a framework of best practices for educational technology developers in East Africa: First, developers must prioritize vanilla web standards over heavy JavaScript frontend frameworks to minimize download payloads and memory consumption. Second, educational software must be architected for zero bandwidth first, treating internet access as an occasional luxury for data syncing rather than a runtime prerequisite. Third, national examination alignment is non-negotiable. Teachers and learners in examination-driven systems will embrace digital innovations only when the software directly mirrors the precise conventions, marking rubrics, and penalty schemes of high-stakes national assessments.")

    add_h2_with_bookmark("4.13 Recommendations for Improvement and Scale-Up", "sec4_13")
    add_p("Based on pilot outcomes, concrete policy recommendations will be submitted to educational leadership: To the Ministry of Education and KICD: Formally approve VirtuLab Kenya as a recommended supplementary digital resource for secondary chemistry under the CBC Senior Secondary STEM pathway. To CEMASTEA: Integrate VirtuLab Kenya training into mandatory national in-service teacher workshops, equipping science educators with practical skills for virtual lab integration. To County Education Boards: Allocate modest capitation subsidies toward procuring low-cost Android tablets for sub-county day school libraries, establishing shared digital science corners.")

    add_h2_with_bookmark("4.14 Expected Academic and Practical Deliverables", "sec4_14")
    add_p("The capstone project will culminate in four major academic and practical deliverables: First, a production-ready, open-source virtual chemistry laboratory Progressive Web App hosted on a public domain and released under an open-source license for free institutional adoption. Second, a rigorous Master of Science in Learning Design and Technology dissertation submitted to the School of Education, Open University of Kenya. Third, an actionable policy brief submitted to KICD and the Ministry of Education titled: 'Bridging the Secondary Practical Science Divide Through Lightweight, Offline Virtual Laboratories.' Fourth, empirical evaluation findings submitted for publication to leading peer-reviewed educational technology journals, such as Computers & Education, the Journal of Science Education and Technology, or the East African Journal of Education Studies.")

    add_h2_with_bookmark("4.15 Sustainability and Future Directions", "sec4_15")
    add_p("VirtuLab Kenya is architected for long-term viability and disciplinary expansion. Phase 7 will build upon the modular JavaScript core to introduce Form 1 to 4 Physics practicals covering Ohm's Law, focal lengths of lenses, and Hooke's Law, alongside Biology practicals covering food tests, enzyme action, and transpiration experiments. Furthermore, a community-driven open-source repository will be established on GitHub to allow Kenyan computer science educators and software developers to contribute new practical modules and regional language translations.")

    add_h2_with_bookmark("4.16 Conclusion", "sec4_16")
    add_p("The persistent failure rates and practical anxiety that plague Kenyan candidates in KCSE Chemistry Paper 3 are not inevitable; they are the direct outcome of laboratory infrastructure deprivation. VirtuLab Kenya proves that thoughtful instructional design, married to frugal, offline-first web technologies, can dismantle these systemic barriers. By placing a safe, responsive, and curriculum-matched virtual chemistry laboratory into the hands of every student, this capstone delivers a scalable, immediate, and equitable path toward science mastery for Kenya’s secondary learners.")

    add_h2_with_bookmark("4.17 Chapter Summary", "sec4_17")
    add_p("This final chapter established the complete implementation and evaluation roadmap for the VirtuLab Kenya pilot study. It detailed the four-stage rollout across ten secondary schools, specified the mixed-methods analytical procedures for testing learning gains (ANCOVA) and usability (SUS/TAM), articulated concrete risk mitigations for rural school constraints, and outlined the academic and policy deliverables resulting from this capstone.")

    # --- REFERENCES ---
    doc.add_page_break()
    add_h1_with_bookmark("REFERENCES", "sec_refs")
    refs = [
        "Amadalo, M. M., Shikokoti, C. N., & Wasike, D. W. (2012). The role of practical work in teaching and learning of chemistry in secondary schools: A case study of Kakamega South District, Kenya. International Journal of Education and Research, 1(11), 1–12.",
        "Awuor, F. O., & Ndiege, J. R. (2022). Evaluating digital learning interventions in resource-constrained schools: A pedagogical alignment framework. African Journal of Research in Mathematics, Science and Technology Education, 26(2), 112–125. https://doi.org/10.1080/18117295.2022.2084531",
        "Barasa, P. L., & Nyongesa, B. (2021). Competency-Based Curriculum and STEM education in Kenya: Examining the readiness of secondary schools. Journal of Education and Practice, 12(18), 45–56.",
        "Brooke, J. (1996). SUS-A quick and dirty usability scale. Usability Evaluation in Industry, 189(194), 4–7.",
        "Bybee, R. W. (2009). The BSCS 5E instructional model and 21st century skills. National Academies Board on Science Education, Washington, DC.",
        "Centre for Mathematics, Science and Technology Education in Africa [CEMASTEA]. (2020). National baseline survey on the status of STEM education and laboratory infrastructure in Kenyan secondary schools. CEMASTEA, Nairobi.",
        "Chebii, R., Wachanga, S. W., & Kiboss, J. K. (2012). Effects of science process skills mastery learning approach on students’ acquisition of selected chemistry laboratory skills in secondary schools in Kenya. Creative Education, 3(6), 1129–1135. https://doi.org/10.4236/ce.2012.36168",
        "Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. MIS Quarterly, 13(3), 319–340. https://doi.org/10.2307/249008",
        "Gitira, C. B. (2025). School-based variables’ influence on performance in the Kenya Certificate of Secondary Education in sub-county schools in Kakamega County, Kenya. East African Journal of Education Studies, 8(3), 180–192.",
        "Hake, R. R. (1998). Interactive-engagement versus traditional methods: A six-thousand-student survey of mechanics test data for introductory physics courses. American Journal of Physics, 66(1), 64–74. https://doi.org/10.1119/1.18809",
        "Kenya Institute of Curriculum Development. (2019). Secondary education curriculum designs: Chemistry Forms 1–4. KICD, Nairobi.",
        "Kenya National Examinations Council. (2022). KCSE examination essential performance reports: Chemistry Paper 3 (233/3). KNEC, Nairobi.",
        "Kiptum, J. K. (2018). Influence of laboratory practical activities on secondary school students’ achievement in chemistry in Nakuru County, Kenya. Journal of Research & Method in Education, 8(4), 23–31.",
        "Mayer, R. E. (2009). Multimedia learning (2nd ed.). Cambridge University Press.",
        "Ministry of Education Kenya. (2018). National Education Sector Strategic Plan (NESSP) 2018–2022. Government of Kenya.",
        "Mukhwana, A. M. (2020). Influence of science laboratory facilities on students' academic performance in chemistry in public secondary schools in Kakamega North Sub-County, Kenya. African Journal of Education and Practice, 5(2), 14–29.",
        "Mwangi, J. K., & Khatete, D. W. (2020). Influence of virtual laboratory simulations on secondary school students’ achievement in chemistry in Nairobi County, Kenya. Journal of Education and Practice, 11(15), 89–98.",
        "Nizeyimana, T., & Musengimana, J. (2026). Enhancing conceptual understanding of chemistry among ordinary level students through virtual laboratories in Rulindo District, Rwanda [Preprint]. Research Square. https://doi.org/10.21203/rs.3.rs-4102911/v1",
        "Ochieng’, M. A. (2023). Influence of laboratory utilisation on students’ academic achievement in chemistry among public secondary schools in Kisumu County, Kenya (Master’s thesis, Kenyatta University). Kenyatta University Institutional Repository.",
        "Omolo, H. O., & Sifuna, D. N. (2019). Teacher preparedness in integrating digital technology in science pedagogy in secondary schools in Siaya County, Kenya. East African Journal of Educational Research, 4(1), 77–91.",
        "Piaget, J. (1973). To understand is to invent: The future of education. Grossman Publishers.",
        "Rutten, N., van Joolingen, W. R., & van der Veen, J. T. (2012). The learning effects of computer simulations in science education. Computers & Education, 58(1), 136–153. https://doi.org/10.1016/j.compedu.2011.07.017",
        "Smetana, L. K., & Bell, R. L. (2012). Computer simulations to support science instruction and learning: A critical review of the literature. International Journal of Science Education, 34(9), 1337–1370. https://doi.org/10.1080/09500693.2011.605182",
        "Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. Cognitive Science, 12(2), 257–285. https://doi.org/10.1207/s15516709cog1202_4",
        "Venkatesh, V., & Bala, H. (2008). Technology acceptance model 3 and a research agenda on interventions. Decision Sciences, 39(2), 273–315. https://doi.org/10.1111/j.1540-5915.2008.00192.x",
        "Vygotsky, L. L. (1978). Mind in society: The development of higher psychological processes. Harvard University Press.",
        "Wabwoba, C. W., & Chang’ach, J. K. (2021). Resource allocation and academic performance in science subjects in public secondary schools in Bungoma County, Kenya. East African Journal of Education Studies, 3(1), 105–118.",
        "Wandera, C. N., & Changeiywo, J. M. (2021). Effect of computer-based simulations on students' achievement in chemistry in secondary schools in Machakos County, Kenya. Journal of Science Education and Technology in Africa, 9(2), 55–68.",
        "Wieman, C. E., Adams, W. K., & Perkins, K. K. (2008). PhET: Simulations that enhance learning. Science, 322(5902), 682–683. https://doi.org/10.1126/science.1161948"
    ]
    for r in refs:
        p_ref = add_p(r, space_after=6)
        p_ref.paragraph_format.left_indent = Inches(0.5)
        p_ref.paragraph_format.first_line_indent = Inches(-0.5)

    out_docx = os.path.join(os.getcwd(), 'VirtuLab_Kenya_Capstone_Proposal_V9.docx')
    doc.save(out_docx)
    print(f"Hyperlinked VirtuLab_Kenya_Capstone_Proposal_V9.docx successfully generated at {out_docx}")

if __name__ == '__main__':
    create_hyperlinked_proposal_v9()
