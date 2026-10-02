import os
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION_START
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def create_humanized_proposal_v10():
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
        bm_start = parse_xml(r'<w:bookmarkStart %s w:id="%d" w:name="%s"/>' % (nsdecls('w'), bookmark_counter, bookmark_name))
        p._p.append(bm_start)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x0C, 0x23, 0x40)
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

    def add_toc_link_row(title, page_str, bookmark_name, is_bold=False, indent_in=0.0):
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.3
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.space_before = Pt(1)
        if indent_in > 0:
            p.paragraph_format.left_indent = Inches(indent_in)

        pPr = p._p.get_or_add_pPr()
        tabs = parse_xml(r'<w:tabs %s><w:tab w:val="right" w:leader="dot" w:pos="9360"/></w:tabs>' % nsdecls('w'))
        pPr.append(tabs)

        hyperlink = parse_xml(r'<w:hyperlink %s w:anchor="%s" w:history="1"/>' % (nsdecls('w'), bookmark_name))

        safe_title = title.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        safe_pg = page_str.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

        r_title = parse_xml(r'<w:r %s><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="%d"/><w:color w:val="0C2340"/>%s</w:rPr><w:t xml:space="preserve">%s</w:t></w:r>' % (
            nsdecls('w'), 22 if is_bold else 21, r'<w:b/>' if is_bold else '', safe_title
        ))
        hyperlink.append(r_title)

        r_tab = parse_xml(r'<w:r %s><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:color w:val="888888"/></w:rPr><w:tab/></w:r>' % nsdecls('w'))
        hyperlink.append(r_tab)

        r_pg = parse_xml(r'<w:r %s><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="%d"/><w:color w:val="0C2340"/>%s</w:rPr><w:t>%s</w:t></w:r>' % (
            nsdecls('w'), 22 if is_bold else 21, r'<w:b/>' if is_bold else '', safe_pg
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

    add_p("A Capstone Project Proposal Submitted in Partial Fulfilment of the Requirements for the Award of the Degree of Master in Learning Design and Technology in the School of Education, Open University of Kenya", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=48)

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

    for title, pg, bm, bold_flag, indent_val in toc_entries:
        add_toc_link_row(title, pg, bm, is_bold=bold_flag, indent_in=indent_val)

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
        ("CPAS", "Chemistry Practical Anxiety Scale"),
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
    add_p("**Concordant Titres:** Volumetric titre values that agree within plus or minus 0.10 cubic centimetres (±0.10 cm³) of one another, fulfilling the official Kenya National Examinations Council (KNEC) scoring precision criteria for full accuracy marks in KCSE Chemistry Paper 3.")
    add_p("**Chemistry Practical Competency Achievement Test (CPCAT):** The 40-mark standardized criterion-referenced pre-test and post-test instrument developed and validated to evaluate student practical chemistry conceptual and calculation competency before and after the digital intervention.")
    add_p("**Chemistry Practical Anxiety Scale (CPAS):** A 10-item Likert-scale instrument adapted from Spielberger’s State-Trait Anxiety Inventory and science anxiety subscales, measuring procedural nervousness, fear of apparatus breakage, and examination anxiety during practical chemistry tasks.")
    add_p("**Normalised Learning Gain (g):** Richard Hake’s standardized metric measuring the proportion of actual conceptual improvement achieved by learners relative to the maximum possible gain achievable from pre-test to post-test.")
    add_p("**System Usability Scale (SUS):** John Brooke’s ten-item validated Likert-scale instrument yielding an international composite software usability benchmark from 0 to 100.")
    add_p("**Technology Acceptance Model (TAM 3):** The theoretical information systems framework established by Fred Davis and extended by Viswanath Venkatesh, assessing how Perceived Usefulness, Perceived Ease of Use, and Facilitating Conditions predict user Behavioural Intention to adopt a technology.")
    add_p("**KCSE Chemistry Paper 3:** The national summative practical examination paper (Subject Code 233/3) assessing quantitative titration, qualitative inorganic analysis, and physical chemistry concepts, contributing 40 percent of the final secondary chemistry grade.")

    # --- PAGE 9: ABSTRACT (ix) ---
    doc.add_page_break()
    add_h1_with_bookmark("ABSTRACT", "sec_abstract")
    add_p("Practical science education forms the bedrock of scientific inquiry and problem-solving in secondary education. In Kenya, secondary Chemistry is examined both theoretically and practically through the Kenya Certificate of Secondary Education (KCSE) Chemistry Practical Examination (Paper 233/3), which commands 40 percent of the candidate's final subject grade. Despite this substantial academic weighting, an acute infrastructural deficit persists across public secondary schools. Over 60 percent of institutions, particularly sub-county day schools in rural and low-income urban areas, operate without functional science laboratories, consumable reagents, piped water, or trained laboratory technicians. Under these conditions, chemistry instruction is frequently restricted to theoretical lectures and whiteboard demonstrations, leaving candidates to sit for high-stakes national practical examinations without adequate hands-on manipulation experience.")
    add_p("To address this educational challenge, this study presents the design, development, and empirical evaluation of VirtuLab Kenya, a lightweight, bilingual, offline-first virtual chemistry laboratory Progressive Web Application engineered specifically for resource-constrained secondary classrooms. Developed using Node.js and PostgreSQL, VirtuLab Kenya minimizes graphics rendering overhead to run efficiently on low-cost Android smartphones, basic tablets, and legacy school desktop computers. The platform aligns with the Kenya Institute of Curriculum Development (KICD) Form 1 to 4 syllabus and KCSE Paper 3 examination formats, providing interactive simulations across volumetric analysis, qualitative inorganic analysis, reaction kinetics, chemical energetics, solubility curves, and organic chemistry.")
    add_p("Key technical and pedagogical features include complete offline functionality via Service Worker caching, dual-language scaffolding in English and Kiswahili, immediate diagnostic feedback on meniscus alignment and concordant titre calculations (within ±0.10 cm³), and a teacher telemetry dashboard that identifies systematic student error patterns in real time.")
    add_p("This proposal establishes the empirical justification for the intervention, articulates its theoretical foundation in Mayer's Cognitive Theory of Multimedia Learning, Bybee's 5E Instructional Model, and Venkatesh and Bala's Technology Acceptance Model, and outlines a convergent parallel mixed-methods quasi-experimental evaluation across ten stratified secondary schools involving approximately 600 students and 20 chemistry teachers. The 10-week field study incorporates an intensive six-week active intervention cycle flanked by baseline and post-intervention evaluations utilizing the Chemistry Practical Competency Achievement Test (CPCAT) and the Chemistry Practical Anxiety Scale (CPAS). The investigation evaluates whether curriculum-aligned, offline virtual laboratory practice produces statistically significant learning gains, reduces practical examination anxiety, and provides teachers with actionable diagnostic insights without imposing recurring institutional operational costs.")
    add_p("**Keywords:** *Virtual Chemistry Laboratory, Progressive Web App, KCSE Paper 3, Educational Inequity, Cognitive Theory of Multimedia Learning, System Usability Scale, Technology Acceptance Model, Chemistry Practical Anxiety Scale.*")

    # ==================== SECTION 2: CHAPTERS 1-4 & REFERENCES ====================
    sec2 = doc.add_section(WD_SECTION_START.NEW_PAGE)
    sec2.top_margin = Inches(1.0)
    sec2.bottom_margin = Inches(1.0)
    sec2.left_margin = Inches(1.0)
    sec2.right_margin = Inches(1.0)
    sec2.different_first_page_header_footer = False

    # Footer for Section 2 (Arabic numbers 1, 2, 3...)
    footer_sec2 = sec2.footer
    footer_sec2.is_linked_to_previous = False
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
    add_p("Kenya’s national development framework, Vision 2030, positions science, technology, engineering, and mathematics (STEM) education as a primary driver of technical innovation, industrial growth, and economic transformation. The Ministry of Education has reaffirmed this priority across both the 8-4-4 educational system and the Competency-Based Curriculum (CBC). Both curricular frameworks emphasize experiential, inquiry-based pedagogy, asserting that scientific competencies develop through experimental engagement rather than passive rote memorization. Barasa and Nyongesa (2021), examining CBC secondary pathways, argue that practical competencies cannot be cultivated through theoretical exposition alone; learners require systematic opportunities to manipulate apparatus, test hypotheses, and analyze experimental outcomes. In chemistry education, physical experimentation is particularly critical, as conceptual understanding in stoichiometry, chemical equilibria, and reaction kinetics relies heavily on observing and measuring tangible physical phenomena.")
    add_p("Within the secondary school curriculum, Chemistry occupies a central position. In Forms 1 through 4, laboratory work is not an ancillary enrichment activity; it forms an independent, compulsory national assessment paper: KCSE Chemistry Paper 3 (Subject Code 233/3), which contributes 40 percent of the candidate's final Chemistry grade. In their empirical study on science process skills in Kenyan secondary schools, Chebii, Wachanga, and Kiboss (2012) established that laboratory manipulation skills—such as reading a meniscus accurately, detecting subtle colour transitions, and deducing qualitative inferences—strongly correlate with overall academic achievement in science. Succeeding in Paper 3 requires candidates to master precise manual and analytical routines: purging air bubbles from a burette, aligning the bottom of the meniscus in a 25.0 cubic centimetre pipette, detecting faint indicator end-point colour changes, recording concordant titres within plus or minus 0.10 cubic centimetres, executing systematic dropwise qualitative reagent additions, and computing multi-step stoichiometric equations from primary observational data.")
    add_p("Developing these competencies requires deliberate, repeated practice. In most public secondary institutions, however, opportunities for hands-on experimentation remain severely constrained. Over 60 percent of public secondary schools—especially sub-county day schools in rural counties and informal urban settlements—operate without functional laboratories. As a result, thousands of candidates enter summative national practical examinations without having independently conducted a complete titration cycle. This systemic deficit leads to depressed examination scores, forfeiture of routine procedural marks, and heightened anxiety during practical assessments.")

    add_h2_with_bookmark("1.2 The Laboratory Infrastructure Crisis", "sec1_2")
    add_p("Infrastructural disparities across Kenyan secondary school tiers remain pronounced. National and Extra-County boarding schools often possess multi-room science laboratory complexes equipped with dedicated gas lines, running water at every student workstation, fume hoods, and analytical digital balances. Conversely, Sub-County Day Secondary Schools, which accommodate more than 65 percent of the national secondary student cohort, seldom have dedicated laboratory buildings. A nationwide baseline survey conducted by the Centre for Mathematics, Science and Technology Education in Africa (CEMASTEA, 2020) revealed that approximately 63 percent of public sub-county secondary schools lack dedicated chemistry laboratories. In these institutions, science instruction takes place in general classrooms with standard wooden desks, devoid of running water, gas burners, or electrical connections.")
    add_p("Empirical investigations across multiple counties document the severity of this infrastructural deficit. Investigating laboratory adequacy in Kakamega North Sub-County, Mukhwana (2020) reported that over 74 percent of surveyed public secondary schools operated with critically deficient chemistry facilities, a condition that correlated directly with persistent underperformance in KCSE Chemistry practical examinations. In Bungoma County, Wabwoba and Chang’ach (2021) observed that administrative delays in the disbursement of Free Day Secondary Education (FDSE) capitation funds crippled the capacity of school principals to procure basic glassware and consumable reagents, frequently leading to the cancellation of scheduled practical sessions. Earlier fieldwork by Amadalo, Shikokoti, and Wasike (2012) in Kakamega South District revealed that more than 70 percent of surveyed chemistry teachers relied entirely on teacher-led demonstrations from the front desk, as schools possessed fewer than five operational burettes for classes of fifty or more learners.")
    add_p("The recurring cost and limited shelf-life of laboratory reagents compound this physical deficit. Standard analytical compounds—such as silver nitrate, potassium manganate(VII), barium chloride, and commercial acid-base indicators—represent major budget items for schools operating under restricted capitation. Kiptum (2018), in a study of Nakuru County secondary schools, documented that chemistry teachers routinely kept chemical storage cabinets locked until several weeks before the national examination, rationing scarce reagents for a single rehearsal practical. Large class enrolments further compound these operational difficulties. In public sub-county schools, student-teacher ratios frequently exceed 50 to 60 learners per stream. Conducting wet-chemistry procedures with concentrated mineral acids and volatile reagents in crowded, poorly ventilated classrooms presents severe safety hazards. Faced with the risks of chemical burns, glassware breakage expenses, and respiratory irritation, teachers often substitute individual student experiments with theoretical chalkboard descriptions.")

    add_h2_with_bookmark("1.3 Digital Interventions in Low-Resource Contexts", "sec1_3")
    add_p("Virtual science laboratories present a viable, cost-effective digital pathway to supplement physical science instruction. Recent empirical research in Kenya underscores the pedagogical potential of digital simulations in secondary chemistry. In Machakos County, Wandera and Changeiywo (2021) evaluated the effect of computer-based simulations on chemistry achievement, finding that learners who engaged with interactive simulations demonstrated significantly higher conceptual understanding of volumetric analysis than peers taught through conventional lecture methods. In Siaya County, Omolo and Sifuna (2019) assessed teacher preparedness in integrating digital technology, observing that while science educators recognized the instructional value of virtual simulations, available commercial tools imposed excessive technical overhead and demanded high-bandwidth internet connectivity that rural schools could not sustain.")
    add_p("Existing international virtual laboratory platforms face substantial adoption barriers within Kenyan public day schools. First, commercial platforms such as Labster require recurring annual per-seat subscription fees in foreign currencies, placing them beyond the budgetary reach of public institutions. Second, international simulations rely heavily on 3D WebGL graphics and complex game engines that freeze or crash on the entry-level Android smartphones, basic tablets, and older computers commonly available in Kenyan classrooms. Third, cloud-dependent platforms require sustained broadband connectivity, rendering them unusable in rural areas where cellular data is costly and network signals fluctuate. Fourth, generic platforms such as PhET or ChemCollective, although conceptually sound, do not align with the structural conventions of the KCSE Paper 3 examination. They omit official KNEC data recording tables, do not enforce the ±0.10 cubic centimetre concordance rule, and fail to replicate national marking schemes for qualitative deductions. VirtuLab Kenya was designed and engineered specifically to resolve these technical, economic, and curricular challenges.")

    add_h2_with_bookmark("1.4 Problem Identification", "sec1_4")
    add_p("Secondary school chemistry students in under-resourced Kenyan schools face severe academic disadvantages in national examinations due to a lack of functional physical laboratories, consumable reagents, and consistent practical training. Concurrently, available digital learning solutions fail to alleviate this disparity because they are cost-prohibitive, hardware-intensive, dependent on continuous internet access, and unaligned with the KICD syllabus and KNEC scoring standards.")

    add_h2_with_bookmark("1.5 Problem Statement", "sec1_5")
    add_p("Students in resource-constrained Kenyan secondary schools experience persistent underperformance and high failure rates in KCSE Chemistry (Paper 233/3) due to inadequate hands-on laboratory experience. This deficiency fosters practical examination anxiety, compromises quantitative data manipulation skills, and limits student progression into university STEM disciplines.")
    add_p("While virtual laboratories could theoretically alleviate this practical divide, existing platforms remain inaccessible to public day schools because they require high-bandwidth connectivity, specialized computing hardware, expensive commercial licenses, and foreign curricular conventions. Consequently, an urgent educational need exists for a curriculum-aligned, zero-marginal-cost, offline-first virtual chemistry laboratory that operates efficiently on low-cost mobile devices, provides bilingual scaffolding, and delivers actionable diagnostic feedback to both learners and teachers.")

    add_h2_with_bookmark("1.6 Purpose of the Capstone Project", "sec1_6")
    add_p("The purpose of this capstone project is to design, develop, deploy, and evaluate VirtuLab Kenya—an offline-first, KICD-aligned virtual chemistry laboratory Progressive Web Application—to broaden access to practical science learning for secondary school students in resource-constrained Kenyan schools.")

    add_h2_with_bookmark("1.7 Objectives of the Capstone Project", "sec1_7")
    add_h3_with_bookmark("1.7.1 General Objective", "sec1_7_1")
    add_p("To design, develop, deploy, and evaluate an offline-first, KICD-aligned virtual chemistry laboratory platform that enables secondary school learners in under-resourced schools to acquire essential practical competencies and enhance academic performance in KCSE Chemistry Paper 3.")

    add_h3_with_bookmark("1.7.2 Specific Objectives", "sec1_7_2")
    add_p("The study is guided by five specific objectives. The first objective is to engineer a lightweight, responsive Progressive Web Application comprising seven core virtual laboratory modules covering major KCSE Paper 3 practical domains, featuring dual-language scaffolding in English and Kiswahili. The second objective is to embed pedagogical scaffolds within the simulation engine, including magnified meniscus displays, real-time chemical colour-kinetics, automated verification of concordant titres within plus or minus 0.10 cubic centimetres, and step-by-step stoichiometric evaluation. The third objective is to develop a teacher telemetry and administrative dashboard that tracks student attempts, identifies systematic procedural error patterns, and facilitates assignment distribution. The fourth objective is to evaluate the educational effectiveness, interface usability, affective anxiety reduction, and technological acceptance of the platform through a 10-week field study (incorporating a six-week active simulation cycle) across ten stratified secondary schools. The fifth objective is to formulate evidence-based policy recommendations and a deployment framework for institutional adoption by KICD, CEMASTEA, and the Ministry of Education.")

    add_h2_with_bookmark("1.8 Research Questions", "sec1_8")
    add_p("The investigation addresses four central research questions. First, to what extent does the integration of VirtuLab Kenya improve secondary school students’ conceptual understanding and practical problem-solving scores in KCSE Chemistry Paper 3 topics compared to traditional lecture- and demonstration-based instruction? Second, how usable, responsive, and accessible is the offline-first Progressive Web Application interface when deployed on entry-level mobile devices in low-connectivity school environments, as measured by the System Usability Scale? Third, what are Kenyan chemistry teachers’ and students’ perceptions regarding the Perceived Usefulness, Perceived Ease of Use, Facilitating Conditions, and Behavioural Intention to adopt VirtuLab Kenya under the Technology Acceptance Model (TAM 3)? Fourth, how effectively do automated telemetry error logs enable teachers to identify and remediate specific student misconceptions and alleviate practical examination anxiety in real time?")

    add_h2_with_bookmark("1.9 Research Hypotheses", "sec1_9")
    add_p("To evaluate the educational impact of the platform, the study tests two formal hypotheses. The null hypothesis (H0) states that there is no statistically significant difference in KCSE Chemistry Paper 3 post-test scores between learners utilizing VirtuLab Kenya and learners instructed through conventional classroom methods without physical laboratory access, evaluated at the 0.05 level of significance. The alternative hypothesis (H1) posits that learners utilizing VirtuLab Kenya will demonstrate a statistically significant gain in post-test scores and practical competency compared to the control group, achieving an average normalised learning gain of g greater than or equal to 0.40 at the 0.05 level of significance.")

    add_h2_with_bookmark("1.10 Significance of the Capstone Project", "sec1_10")
    add_p("VirtuLab Kenya contributes directly to educational equity in Kenyan secondary schooling, offering substantive pedagogical and operational benefits across three distinct stakeholder groups.")
    add_p("For learners, the platform serves as a risk-free digital workbench. Students can repeat titrations and qualitative procedures multiple times until they master meniscus alignment, dropwise stopcock control, and indicator transition points, without concern over chemical spills, broken glassware, or peer embarrassment. By transforming abstract textbook reactions into dynamic, interactive phenomena, the simulation helps replace practical examination anxiety with procedural confidence.")
    add_p("For teachers, particularly in understaffed day schools where single educators manage several hundred learners across multiple streams, the platform substantially reduces the time required for reagent preparation and apparatus maintenance. The integrated analytics dashboard automates the assessment of titration tables and calculation steps, immediately identifying students who struggle with stoichiometry or concordant value determination and allowing for timely, targeted remedial instruction.")
    add_p("For schools and the broader educational system, VirtuLab Kenya operates at near-zero marginal cost following initial deployment. It consumes no physical chemical stock, generates no hazardous chemical waste, and executes locally on pre-existing school tablets or student-owned mobile devices. For curriculum planners at KICD and the Ministry of Education, it offers an empirically tested digital model for realizing the practical science competencies envisioned within the Competency-Based Curriculum Senior Secondary STEM pathway.")

    add_h2_with_bookmark("1.11 Scope of the Capstone Project", "sec1_11")
    add_p("This capstone focuses on Form 3 and Form 4 practical chemistry topics tested in KCSE Chemistry Paper 3 (Subject Code 233/3). The software encompasses seven laboratory modules: volumetric analysis (acid-base, redox, precipitation, and complexometric titrations), qualitative inorganic analysis, reaction rates, thermochemistry, solubility curves, organic qualitative tests, and a timed composite mock practical. The field pilot will take place in ten secondary schools across Nairobi, Machakos, and Kiambu counties, involving approximately 600 students and 20 chemistry teachers across National, County, and Sub-County schools over a 10-week field evaluation period.")

    add_h2_with_bookmark("1.12 Delimitations", "sec1_12")
    add_p("This study is strictly delimited to secondary chemistry in Kenya. It does not cover physics or biology experiments, although the codebase is structured so that other subjects can be added in post-capstone expansion. Geographically, data collection will take place only within the designated pilot schools in Kenya.")

    add_h2_with_bookmark("1.13 Limitations", "sec1_13")
    add_p("Three methodological limitations should be noted. First, because learners belong to existing school classrooms, random assignment of individual participants is not feasible without disrupting school timetables. The investigation therefore employs a quasi-experimental non-equivalent control group design, adjusting for baseline variations through Analysis of Covariance (ANCOVA). Second, VirtuLab Kenya is engineered to scaffold and reinforce practical science competencies; it is not designed to replace tactile apparatus handling in contexts where physical laboratory facilities are available. Third, variations in device hardware specifications, display dimensions, and battery life across participating schools may introduce minor variations in user experience.")

    add_h2_with_bookmark("1.14 Assumptions", "sec1_14")
    add_p("The investigation proceeds on three foundational assumptions: first, that designated pilot institutions possess periodic access to Android mobile devices, tablets, or computer laboratory screens; second, that participating science teachers and learners will engage conscientiously with the intervention during the study period; and third, that student achievement on the Chemistry Practical Competency Achievement Test accurately reflects practical laboratory competence.")

    add_h2_with_bookmark("1.15 Definition of Key Terms", "sec1_15")
    add_p("VirtuLab Kenya refers to an offline-first, bilingual virtual chemistry laboratory Progressive Web Application developed to simulate KCSE Chemistry Paper 3 practicals for Kenyan secondary students. Concordant Titres refers to titre readings that agree within plus or minus 0.10 cubic centimetres (±0.10 cm³) of each other, meeting KNEC guidelines for full accuracy marks. Chemistry Practical Competency Achievement Test refers to the 40-mark criterion-referenced test designed to measure practical understanding and calculation ability before and after using the software. Chemistry Practical Anxiety Scale refers to a 10-item instrument measuring affective procedural nervousness and practical exam anxiety. Normalised Learning Gain refers to Richard Hake’s formula measuring how much a student improved relative to the total possible improvement from pre-test to post-test. System Usability Scale refers to John Brooke’s ten-question usability tool that gives a software quality score from 0 to 100. Technology Acceptance Model refers to the theoretical model measuring whether users find a technology useful, easy to use, and whether they intend to keep using it.")

    add_h2_with_bookmark("1.16 Chapter Summary", "sec1_16")
    add_p("This chapter outlined the laboratory infrastructure deficit in Kenyan secondary education and examined how this constraint impairs student achievement in KCSE Chemistry Paper 3. Drawing on baseline data from CEMASTEA and regional empirical studies across Kakamega, Bungoma, Nakuru, Machakos, and Siaya counties, the discussion established the rationale for VirtuLab Kenya as a contextualised, offline-first digital intervention. It formally stated the study’s objectives, research questions, hypotheses, and scope. Chapter Two reviews the theoretical and empirical literature that underpins this project.")

    # --- CHAPTER TWO ---
    doc.add_page_break()
    add_h1_with_bookmark("CHAPTER TWO: RESEARCH AND ANALYSIS", "chap2")
    add_h2_with_bookmark("2.1 Conceptualisation of the Problem", "sec2_1")
    add_p("Underperformance in secondary school practical chemistry is fundamentally structural rather than cognitive. KCSE Chemistry Paper 3 accounts for 40 percent of the summative subject mark, evaluating manual laboratory techniques including meniscus reading, dropwise burette titration, and fine observational discrimination during qualitative reactions. In schools without chemical stocks, glassware, or running water, learners are systematically denied the opportunity to develop these manual proficiencies. Expecting students to demonstrate mastery in an examination assessing skills they have never physically practiced creates an insurmountable barrier to achievement. Empirical findings from CEMASTEA (2020) and Mukhwana (2020) establish that low achievement in sub-county secondary schools is the direct consequence of severe laboratory equipment deficits.")
    add_p("Addressing this systemic challenge requires an economically viable and scalable pedagogical model. Constructing physical laboratories across thousands of under-resourced schools requires capital allocations that exceed current educational budgets. Interactive digital simulations provide an immediate alternative, offering reproducible experimental practice at zero marginal cost. However, imported software architectures fail to function within local operational realities. To succeed in Kenyan classrooms, digital interventions must be engineered directly around the technical constraints of sub-county day schools: limited bandwidth, low-specification hardware, teacher shortages, and the exact requirements of national examinations.")

    add_h2_with_bookmark("2.2 Review of Related Literature", "sec2_2")
    add_h3_with_bookmark("2.2.1 Educational Inequity in Science Access", "sec2_2_1")
    add_p("Educational research in East Africa consistently documents a pronounced achievement gap between well-resourced national institutions and under-equipped day schools. In Kakamega County, Gitira (2025) analyzed school-level predictors of KCSE outcomes and identified the absence of operational science laboratories as the single greatest impediment to student academic achievement in sub-county institutions. In these schools, teachers rely on textbook illustrations and blackboard diagrams, leaving learners ill-prepared when encountering real apparatus in summative examinations.")
    add_p("Ochieng’ (2023) observed an identical pattern in Kisumu County, finding that irregular practical sessions—stemming from chronic chemical shortages and an absence of qualified laboratory technicians—directly contributed to candidate mark deductions in titration accuracy and apparatus assembly. Teachers indicated that in the absence of technicians, preparing standard molar solutions consumed extensive instructional time, forcing them to curtail practical sessions amid heavy teaching schedules exceeding 28 lessons weekly. Correspondingly, Wabwoba and Chang’ach (2021) in Bungoma County and Amadalo, Shikokoti, and Wasike (2012) in Kakamega South demonstrated that over 70 percent of surveyed science educators routinely abandon learner-centred experiments in favor of cursory front-bench demonstrations due to severe glassware shortages.")

    add_h3_with_bookmark("2.2.2 Role of Virtual Laboratories in Science Education", "sec2_2_2")
    add_p("Interactive virtual laboratories have demonstrated substantial pedagogical efficacy across diverse educational contexts. Unlike passive video viewings, interactive simulations place learners in direct control of experimental variables. In Nairobi County, Mwangi and Khatete (2020) evaluated virtual laboratory simulations in secondary chemistry, establishing that students who supplemented regular lessons with simulations achieved significantly higher scores in volumetric and qualitative chemistry than peers instructed exclusively through lectures. Wandera and Changeiywo (2021) reported corresponding findings in Machakos County, documenting heightened conceptual retention and improved student attitudes toward science.")
    add_p("Regionally, a quasi-experimental study by Nizeyimana and Musengimana (2026) in Rulindo District, Rwanda, showed that secondary students who supplemented their regular lessons with virtual chemistry simulations scored substantially higher than peers taught through traditional lectures, achieving a large effect size (Cohen’s d = 1.19). These empirical outcomes corroborate the theoretical findings of Wieman, Adams, and Perkins (2008) on the PhET project, which demonstrated that well-designed interactive software can actually teach molecular concepts better than physical lab benches because students can see invisible processes like ions and molecular collisions. In their comprehensive meta-analysis of science simulations, Rutten, van Joolingen, and van der Veen (2012) concluded that simulations yield optimal learning gains when utilized as pre-laboratory preparatory exercises, orienting students to experimental logic prior to physical execution. To measure these learning gains accurately, Hake’s (1998) normalised gain formula remains the standard metric, allowing researchers to evaluate real learning progress regardless of pre-test differences.")

    add_h3_with_bookmark("2.2.3 Contextualised Technology Integration in Sub-Saharan Africa", "sec2_2_3")
    add_p("Despite the demonstrable benefits of educational simulations, importing software engineered for well-resourced Western school systems into African classrooms often fails. Commercial platforms presuppose high-bandwidth fiber internet, powerful dedicated graphics processors, and institutional funds for annual subscription licenses. When installed on budget mobile devices in rural institutions, such platforms regularly stall. Omolo and Sifuna (2019), observing digital tool adoption in Siaya County, established that secondary school teachers rapidly abandon digital platforms that require continuous internet connectivity, exhibit slow load times, or do not fit cleanly within the standard 40-minute instructional period.")
    add_p("Smetana and Bell (2012) emphasized that science simulations only improve learning when they match the curriculum and assessment rules of the local education system. In African schools, Awuor and Ndiege (2022) argued that educational technology must be built around local realities: working offline, requiring no subscription fees, using very small files, and matching national examination rubrics. Foreign programs use different measuring units, ignore KNEC table formats, and do not enforce the ±0.10 cubic centimetre concordance rules that determine whether a Kenyan student passes or fails Question 1 in KCSE Paper 3.")

    add_h3_with_bookmark("2.2.4 Constructivist Approaches in Digital Pedagogy", "sec2_2_4")
    add_p("Providing digital access alone does not ensure effective learning; instructional design is paramount. In unstructured digital sandbox environments, novice learners frequently experience cognitive overload, interacting aimlessly without comprehending underlying scientific concepts. Systematic instructional scaffolding is essential. Bybee’s (2009) 5E Instructional Model—comprising Engage, Explore, Explain, Elaborate, and Evaluate—provides an effective structural foundation for digital inquiry. By structuring virtual tasks so that students first explore physical relationships, formulate scientific explanations, and subsequently evaluate quantitative precision against examination criteria, the platform guides learners systematically from introductory competence to confident examination performance.")

    add_h2_with_bookmark("2.3 Theoretical and Conceptual Framework", "sec2_3")
    add_h3_with_bookmark("2.3.1 Constructivism and Inquiry-Based Science Education", "sec2_3_1")
    add_p("VirtuLab Kenya is grounded in Piagetian constructivist learning theory (Piaget, 1973), which posits that cognitive structures develop through active, physical interaction with the learning environment rather than passive absorption of verbal information. Within the simulation engine, learners actively manipulate physical variables—such as stopcock flow rates, reagent concentrations, and solution temperatures—and directly observe resulting chemical phenomena, including indicator transitions, gas evolution, and precipitate formation.")
    add_p("To support learners across progressive stages of mastery, the platform operationalises Vygotsky’s (1978) Zone of Proximal Development through two distinct operational modes. In Guided Mode, Form 3 learners receive real-time pedagogical scaffolds, including on-screen prompts, magnified meniscus indicators, and cautionary colour flashes prior to end-point overshoot. In Exam Mode, these scaffolds are fully withdrawn. Learners conduct practicals independently under timed conditions, experiencing the realistic procedural demands of KCSE Paper 3.")

    add_h3_with_bookmark("2.3.2 Cognitive Theory of Multimedia Learning and Cognitive Load Theory", "sec2_3_2")
    add_p("The platform’s user interface design is governed by Mayer’s (2009) Cognitive Theory of Multimedia Learning and Sweller’s (1988) Cognitive Load Theory. Working memory capacity is strictly limited, particularly when novice learners simultaneously monitor apparatus, track volume changes, and perform stoichiometric calculations. VirtuLab Kenya implements three central design principles: First, the Spatial Contiguity Principle co-locates apparatus controls, reagent containers, and measurement readouts on a unified viewport, eliminating split-attention effects caused by excessive scrolling. Second, the Signalling Principle applies visual cues, such as momentary pink flashes preceding the titration end-point, directing student attention to critical observational markers. Third, the Segmenting Principle divides complex practical workflows into coherent instructional phases: apparatus priming, titration execution, data recording, and stoichiometric deduction.")

    add_h3_with_bookmark("2.3.3 Technology Acceptance Model (TAM 3)", "sec2_3_3")
    add_p("To investigate the determinants of technology adoption among teachers and students, this research applies the Technology Acceptance Model (TAM 3) formulated by Venkatesh and Bala (2008), extending Davis (1989). TAM 3 posits that technology usage behaviour is governed by Behavioural Intention, which is determined by two foundational constructs: Perceived Usefulness (the belief that using the platform enhances academic performance) and Perceived Ease of Use (the perception that interaction with the system is effortless). In resource-constrained educational settings, TAM 3 is particularly valuable because it explicitly accounts for Facilitating Conditions, including device availability and offline access, which dictate whether a digital innovation achieves sustainable institutional adoption.")

    add_h3_with_bookmark("2.3.4 Conceptual Framework", "sec2_3_4")
    add_p("The conceptual framework connects the platform’s architectural features to learning, anxiety reduction, and adoption outcomes through TAM constructs, with institutional and learner characteristics serving as moderating variables, as synthesized in Table 2.1.")

    add_p("**Table 2.1: Conceptual Framework Matrix of Variables**", bold=True, space_after=4)
    tbl2_1_headers = ["Category of Variable", "Operational Construct", "Concrete Empirical Indicators"]
    tbl2_1_rows = [
        ["Independent Variables", "VirtuLab Kenya Features", "Interactive simulation modules; offline PWA support; dual English/Kiswahili interface; automated meniscus and titration feedback."],
        ["Moderating Variables", "School and Learner Context", "School type (National, County, Sub-County); previous student phone experience; teacher ICT confidence and school support."],
        ["Mediating Variables", "TAM 3 Constructs and Usability", "Perceived Usefulness rating; Perceived Ease of Use rating; Facilitating Conditions score; System Usability Scale benchmark."],
        ["Dependent Variables", "Learning and Adoption Results", "Normalised gain (g) on CPCAT; titration concordance accuracy; reduction in mean CPAS anxiety score; ongoing platform usage telemetry."]
    ]
    add_table(tbl2_1_headers, tbl2_1_rows)

    add_h2_with_bookmark("2.4 Review of Existing Practices, Policies and Interventions", "sec2_4")
    add_p("The Ministry of Education and CEMASTEA have conducted continuous professional development initiatives to promote ICT integration in secondary science teaching. In national workshops, educational trainers have endorsed virtual laboratories as effective compensatory tools for schools lacking physical equipment. A significant divide persists, however, between policy intent and classroom implementation. Government digital literacy programmes have prioritized primary school tablet distribution, leaving secondary science education with minimal investment in locally contextualised digital tools. While teachers encounter PhET simulations during professional workshops, they report difficulty mapping these generic tools to KCSE assessment rubrics. Foreign simulations lack Kiswahili terminology, which educators frequently utilize to bridge comprehension gaps for learners struggling with English scientific jargon. VirtuLab Kenya addresses this gap by aligning directly with the KICD Secondary Chemistry Curriculum Designs (Forms 1 to 4) to ensure contextual and pedagogical alignment.")

    add_h2_with_bookmark("2.5 Benchmarking and Comparative Analysis", "sec2_5")
    add_p("To illustrate the comparative advantages of VirtuLab Kenya, Table 2.2 benchmarks the platform against leading international virtual chemistry environments.")

    add_p("**Table 2.2: Benchmarking of Virtual Laboratory Platforms**", bold=True, space_after=4)
    tbl2_2_headers = ["Evaluation Parameter", "PhET Simulations", "Labster Virtual Labs", "ChemCollective", "VirtuLab Kenya"]
    tbl2_2_rows = [
        ["Curricular Alignment", "Generic US High School", "University / AP Level", "US College Chemistry", "Exact KICD & KNEC Paper 3"],
        ["Bilingual Support", "English and select foreign", "English only", "English only", "English and Kiswahili UI"],
        ["Offline Capability", "Partial through offline app", "None (Cloud streaming)", "None (Browser online)", "Complete PWA Offline Cache"],
        ["Hardware Demands", "Moderate (Requires WebGL)", "High (Requires GPU)", "Moderate", "Ultralight (Runs on 1GB RAM)"],
        ["Local Table Formatting", "No", "No", "No", "Exact KNEC Titre Tables"],
        ["Cost to School", "Free", "Commercial Subscription", "Free", "Free / Open Source"]
    ]
    add_table(tbl2_2_headers, tbl2_2_rows)

    add_h2_with_bookmark("2.6 Research and Project Methodology", "sec2_6")
    add_h3_with_bookmark("2.6.1 Research Design", "sec2_6_1")
    add_p("This project follows a Design and Development Research (DDR) model structured around the ADDE cycle: Analyse, Design, Develop, and Evaluate. To evaluate educational impact, the study utilizes a Convergent Parallel Mixed-Methods Quasi-Experimental Design with a Pre-test and Post-test Non-Equivalent Control Group structure. Because students are nested within intact school streams, individual random assignment is infeasible without disrupting academic schedules. Utilizing intact classrooms preserves natural pedagogical settings while maintaining research integrity. The field study spans a 10-week implementation period, comprising an intensive six-week active simulation intervention (Weeks 4–9) flanked by baseline assessment and post-intervention evaluation phases. The Experimental Group will utilize VirtuLab Kenya for pre-laboratory preparation, guided simulation practice, and homework assignments throughout the six-week active intervention. The Control Group will cover identical curriculum content using conventional textbooks and teacher blackboard demonstrations without virtual simulation support. To control for teacher instructional variation, the researcher will provide standardized instructional pacing guides, conduct orientation briefings, and statistically adjust for pre-test baseline variations using Analysis of Covariance (ANCOVA).")

    add_h3_with_bookmark("2.6.2 Target Population and Sampling Strategy", "sec2_6_2")
    add_p("The target population comprises Form 3 and Form 4 Chemistry students and their teachers in public secondary schools in Kenya. The study employs a Stratified Purposive and Cluster Sampling design across three institutional strata, detailed in Table 2.3.")

    add_p("**Table 2.3: Target Population and Stratified Sampling Matrix**", bold=True, space_after=4)
    tbl2_3_headers = ["Stratum", "School Category", "Laboratory Infrastructure Baseline", "Schools", "Target Students (n)", "Teachers"]
    tbl2_3_rows = [
        ["1", "National and Extra-County", "Well-equipped laboratories, running water, gas lines", "2", "Approximately 120", "4"],
        ["2", "County Secondary Schools", "Partial laboratories, shared equipment, chemical shortages", "3", "Approximately 180", "6"],
        ["3", "Sub-County Day Schools", "Severely under-resourced, makeshift rooms, rare lab work", "5", "Approximately 300", "10"],
        ["Total", "Complete Stratified Sample", "Broad representative sample across school tiers", "10", "Approximately 600", "20"]
    ]
    add_table(tbl2_3_headers, tbl2_3_rows)
    add_p("This stratified sampling matrix ensures comprehensive institutional representation across secondary school categories, allocating 50 percent of the sample to sub-county day schools where laboratory infrastructure deficits are most severe.")

    add_h3_with_bookmark("2.6.3 Data Collection Instruments", "sec2_6_3")
    add_p("The investigation utilizes six distinct empirical instruments to collect comprehensive quantitative and qualitative data. First, the Chemistry Practical Competency Achievement Test (CPCAT) is a 40-mark criterion-referenced test administered at baseline (Week 3) and post-intervention (Week 10). Grounded in KNEC Paper 3 rubrics, it assesses apparatus manipulation knowledge, meniscus reading precision, stoichiometric calculation accuracy, and qualitative inference deduction. Second, the Chemistry Practical Anxiety Scale (CPAS) is a 10-item Likert-scale instrument adapted from Spielberger’s State-Trait Anxiety Inventory and science anxiety subscales, measuring procedural nervousness, fear of chemical accidents or glassware breakage, and practical examination dread before and after the intervention. Third, the System Usability Scale (SUS) is Brooke’s (1996) validated ten-item instrument administered to experimental participants, benchmarking software usability from 0 to 100 with a target of 78 or higher (Grade A). Fourth, the TAM 3 Survey utilizes a 5-point Likert scale to measure Perceived Usefulness, Perceived Ease of Use, Facilitating Conditions, and Behavioural Intention. Fifth, Automated Server Telemetry Logs record participant interactions, including attempt frequencies, titration error rates, time-on-task, and the proportion of concordant titres achieved within ±0.10 cubic centimetres. Sixth, Semi-Structured Interviews and Focus Group Discussions capture qualitative feedback from educators and learners regarding instructional dynamics, workload alterations, language scaffolding utility, and reductions in practical examination anxiety.")

    add_h3_with_bookmark("2.6.4 Validity of Instruments", "sec2_6_4")
    add_p("Content, construct, and criterion validity for the CPCAT and CPAS instruments will be established through an expert review panel comprising three KICD chemistry curriculum specialists and four certified KCSE Chemistry Paper 3 national examiners. The panel will evaluate all test items against curriculum outcomes, psychological constructs, and KNEC scoring keys, revising items until attaining a Content Validity Index of at least 0.85.")

    add_h3_with_bookmark("2.6.5 Reliability and Trustworthiness", "sec2_6_5")
    add_p("The internal consistency of survey instruments (SUS, TAM 3, and CPAS) will be evaluated using Cronbach’s alpha, requiring a reliability threshold of 0.80 or higher prior to full field deployment. Qualitative data trustworthiness will be established through member-checking with interview participants and maintaining comprehensive audit trails during thematic coding.")

    add_h3_with_bookmark("2.6.6 Data Collection Procedures", "sec2_6_6")
    add_p("Fieldwork will follow seven sequential stages: First, securing ethical clearance from NACOSTI and institutional approval from the Open University of Kenya Directorate of Research. Second, obtaining research permits from County Directors of Education in Nairobi, Machakos, and Kiambu counties. Third, conducting school entry visits, briefing principals, and gathering signed parental consent and student assent forms. Fourth, administering the CPCAT pre-test and CPAS baseline anxiety survey to experimental and control cohorts under examination conditions in Week 3. Fifth, executing the six-week active simulation intervention (Weeks 4–9) while server telemetry logs background usage. Sixth, administering the CPCAT post-test, CPAS post-intervention survey, SUS usability questionnaire, and TAM 3 survey in Week 10. Seventh, conducting teacher interviews and student focus group discussions.")

    add_h3_with_bookmark("2.6.7 Data Analysis Techniques", "sec2_6_7")
    add_p("Quantitative data will be analyzed using descriptive and inferential statistical methods. Learning gains will be evaluated using Richard Hake’s Average Normalised Learning Gain: g = (Post-test % - Pre-test %) / (100% - Pre-test %). Learning gains will be categorized as High for g of 0.70 or higher, Medium for g between 0.30 and 0.69, and Low for g below 0.30. Paired t-tests will examine within-group score improvements and changes in CPAS anxiety ratings. Analysis of Covariance (ANCOVA) will test the primary hypothesis by comparing post-test scores between experimental and control groups while adjusting for pre-test baseline differences as a covariate. Practical significance will be quantified using Cohen’s d effect size. Qualitative interview transcripts will be analyzed via thematic coding to contextualize quantitative outcomes.")

    add_h3_with_bookmark("2.6.8 Ethical Considerations and Data Protection", "sec2_6_8")
    add_p("In strict compliance with the Kenya Data Protection Act of 2019 and NACOSTI research guidelines, study participation is entirely voluntary, and participants may withdraw at any stage without prejudice. Because students are minors, parents and guardians will execute written consent forms, complemented by student assent forms. Participant data will be pseudonymised using research identifiers such as STU-0421, and institutional names will be anonymized in research reports. User authentication relies on bcrypt password hashing with a work factor of 10, and database communications are encrypted using SSL and TLS protocols.")

    add_h2_with_bookmark("2.7 Analysis of the Identified Problem", "sec2_7")
    add_p("KNEC annual examination performance reports confirm that secondary candidates lose practical chemistry marks primarily due to avoidable procedural errors. In Section 1 (Titration), candidates forfeit marks because they lack the tactile precision needed to control burette flow dropwise at the first permanent colour change. In Section 2 (Qualitative Analysis), learners frequently confuse precipitates that dissolve in excess ammonia with those that remain insoluble, having memorised written summary charts without witnessing actual precipitate dissolution. Denying learners physical practice converts straightforward empirical observations into abstract, error-prone memorisation.")

    add_h2_with_bookmark("2.8 Root-Cause Analysis", "sec2_8")
    add_p("An institutional analysis of Kenyan secondary education reveals four underlying causes for this practical deficit: First, persistent delays in the disbursement of Free Day Secondary Education capitation leave school administrations without funds to replace broken glassware or purchase fresh reagents. Second, sub-county day schools in rural areas must travel long distances to urban commercial centres to purchase chemicals, with sensitive reagents such as silver nitrate frequently degrading during transit and substandard storage. Third, public schools face an acute shortage of trained laboratory technicians, requiring subject teachers with teaching loads exceeding 28 lessons per week to prepare individual apparatus setups single-handedly. Fourth, valid safety concerns in overcrowded classrooms with 50 to 60 learners per room make the use of concentrated mineral acids and toxic gases dangerous, rendering teacher-led demonstrations the only practical option.")

    add_h2_with_bookmark("2.9 Needs and Gap Analysis", "sec2_9")
    add_p("While educational technology initiatives have expanded across Kenya, a critical curricular gap persists. Existing virtual science applications neglect KCSE examination formats, impose excessive hardware demands that exceed public day school capabilities, require continuous internet connections, and provide no Kiswahili instructional support. Secondary schools urgently require an educational platform designed specifically for resource-constrained environments: lightweight, fully offline, linguistically accessible, and rigorously aligned with KNEC scoring rubrics.")

    add_h2_with_bookmark("2.10 Analysis of Alternative Solutions", "sec2_10")
    add_p("Prior to developing VirtuLab Kenya, the researcher evaluated two alternative pedagogical models: The first was mobile laboratory vans equipped with physical apparatus traveling between schools. While mobile vans provide physical apparatus handling, they incur prohibitive fuel and maintenance costs, struggle on rural road networks, and reach schools only once or twice per term—insufficient for developing manual precision. The second alternative was weekend laboratory hubs hosted at national boarding schools. This model imposes travel expenses on low-income families, introduces student safety risks during transit, and fails to support routine weekly classroom instruction.")

    add_h2_with_bookmark("2.11 Selection of the Preferred Intervention", "sec2_11")
    add_p("VirtuLab Kenya was selected as the preferred intervention because it provides authentic practical training at near-zero marginal cost following deployment. Once cached as a Progressive Web Application, it requires no internet connectivity, runs on entry-level Android smartphones, permits unlimited repetitive trial practice, and generates granular error telemetry that physical classrooms cannot replicate. It represents an immediate, scalable, and equitable solution to an enduring educational challenge.")

    add_h2_with_bookmark("2.12 Chapter Summary", "sec2_12")
    add_p("This chapter reviewed empirical research on educational inequity and virtual laboratory interventions in Sub-Saharan Africa, established theoretical foundations in Constructivism, Cognitive Load Theory, CTML, and TAM 3, and outlined a convergent mixed-methods quasi-experimental design across ten secondary schools. It also analyzed the systemic root causes of laboratory shortages and justified VirtuLab Kenya as the most scalable pedagogical response. Chapter Three details the technical architecture and design framework of the platform.")

    # --- CHAPTER THREE ---
    doc.add_page_break()
    add_h1_with_bookmark("CHAPTER THREE: DESIGN AND DEVELOPMENT OF THE INTERVENTION", "chap3")
    add_h2_with_bookmark("3.1 Design Principles of the Capstone Intervention", "sec3_1")
    add_p("The engineering and pedagogical architecture of VirtuLab Kenya is governed by five core design principles: First, strict curricular alignment. Educational technology frequently fails in Kenya because it introduces foreign concepts while neglecting national assessment conventions. VirtuLab Kenya mirrors the KICD Secondary Chemistry Syllabus and KNEC Paper 3 rubrics, ensuring every simulation step aligns with official examination grading keys. Second, low-overhead technical accessibility. Because public day schools rely on basic Android devices and legacy computers, the client application is authored in semantic HTML5, modular CSS3, and native ECMAScript 2022. By omitting external frontend frameworks, the production build remains under 3.5 megabytes, loading in under 250 milliseconds on 3G cellular connections. Third, bilingual instructional scaffolding. While English is the official medium of instruction in secondary schools, learners in under-resourced schools grasp complex procedural nuances more effectively when supported by Kiswahili explanations. The platform integrates a real-time English/Kiswahili toggle, allowing learners to clarify instructions instantly. Fourth, cognitive-load-aware interface design derived from Mayer’s research. The interface co-locates apparatus controls, reagent containers, and data displays on a single screen to eliminate split-attention effects. Visual signals, such as burette meniscus magnification and indicator colour flashes, guide learner focus to critical empirical observations. Fifth, user-driven iterative refinement. The platform evolved through continuous testing with practicing chemistry teachers and secondary students, refining tap sliders and touch targets to ensure responsive operation on compact smartphone screens.")

    add_h2_with_bookmark("3.2 Proposed Capstone Intervention and Innovation", "sec3_2")
    add_p("VirtuLab Kenya is an offline-first virtual chemistry laboratory Progressive Web Application providing secondary school learners with an authentic digital workbench to execute, record, and evaluate KCSE practical experiments independently. The platform introduces four central innovations: First, complete offline execution via Service Worker caching. Once loaded, all seven simulation modules run entirely without internet access, requiring connectivity only for initial caching and subsequent telemetry synchronisation. Second, a volumetric precision engine based on mathematical chemical equilibria rather than static animations. The simulated burette responds accurately to dropwise stopcock adjustments, displays parallax meniscus curves, and measures volume to 0.05 cubic centimetres. Third, automated scoring feedback. When learners input values into the digital KNEC results table, the system evaluates concordance against the ±0.10 cubic centimetre tolerance and pinpoints procedural discrepancies immediately. Fourth, a teacher telemetry dashboard that connects student homework practice with classroom instruction. Educators can inspect class-wide error summaries, identifying whether learners struggle with meniscus readings, indicator selection, or stoichiometric calculations prior to national examinations.")

    add_h2_with_bookmark("3.3 Intervention Design Framework", "sec3_3")
    add_p("The platform operationalises Vygotsky’s Zone of Proximal Development through a dual-mode instructional architecture. In Guided Mode, novice learners receive contextual prompts at each operational step, including reminders to rinse the pipette before drawing acid, magnified meniscus readouts, and cautionary colour flashes preceding end-point overshoot. In Exam Mode, all pedagogical scaffolding is withdrawn. Learners work independently against an examination timer, taking raw apparatus readings, completing blank KNEC tables, calculating average concordant titres, and executing stoichiometric computations under authentic KCSE assessment conditions.")

    add_h2_with_bookmark("3.4 System Architecture", "sec3_4")
    add_p("VirtuLab Kenya utilizes a modular three-tier architecture optimized for low-bandwidth and intermittent connectivity environments. In the Client Tier, the application operates as an offline Progressive Web Application built on modern web standards. A service worker intercepts network calls and serves cached application assets locally. Practice data and session states are persisted locally via IndexedDB and LocalStorage, ensuring that sudden connectivity loss never disrupts an ongoing experiment. In the Server Tier, a Node.js runtime with Express manages API requests. It handles JSON Web Token authentication, administers student and teacher roles, broadcasts assignments, and receives queued telemetry records when devices reconnect. In the Database Tier, a PostgreSQL database manages records for schools, classrooms, teachers, and student attempts. B-tree indexing on session tables ensures rapid querying during batch synchronisation cycles.")

    add_h2_with_bookmark("3.5 Laboratory Modules Implemented and Curriculum Roadmap", "sec3_5")
    add_p("The platform includes seven core simulation modules covering the Form 1 to 4 syllabus and KCSE Paper 3 practical formats, summarized in Table 3.1.")

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
    add_p("The frontend uses clean HTML5, CSS3 responsive grid layouts, and native ECMAScript 2022. It contains no external JavaScript framework dependencies, keeping the complete production file under 3.5 megabytes with an opening speed of under 250 milliseconds on standard 3G mobile networks. Offline operability is handled by a service worker that uses Cache-First caching for simulation graphics and Stale-While-Revalidate for application state. Local data is saved in IndexedDB and LocalStorage, supported by a background sync queue that uploads practice records when connectivity returns. The backend API runs on Node.js version 18 with Express, secured using helmet HTTP headers, CORS whitelisting, and express-rate-limit to protect against request flooding. The database operates on PostgreSQL 15, using relational tables with foreign keys and cascade rules across users, schools, classes, lab sessions, assignments, badges, and telemetry logs. Security relies on stateless JSON Web Tokens signed with HMAC-SHA256 and bcrypt password hashing with a work factor of 10. Access control separates student, teacher, and administrator accounts. The telemetry engine automatically logs timestamps, trial counts, time per step, meniscus reading errors, indicator mistakes, and calculation discrepancies.")

    add_h2_with_bookmark("3.7 Development Process", "sec3_7")
    add_p("Software development followed the ADDE instructional design cycle across six distinct phases: In Phase 1 (Needs Assessment), 28 years of KCSE Chemistry Paper 3 past papers (1989–2016) and KICD curriculum guidelines were reviewed to identify recurring apparatus configurations, frequent candidate errors, and marking rubrics. In Phase 2 (Simulation Engine Engineering), mathematical simulation models for titrations, kinetics, and chemical equilibria were developed using HTML5 Canvas and JavaScript event handling. In Phase 3 (Offline PWA Scaffolding), service-worker caching, IndexedDB local persistence, and the bilingual English/Kiswahili interface switcher were implemented. In Phase 4 (Backend API and Teacher Portal), Node.js REST endpoints and the real-time teacher analytics dashboard were constructed. In Phase 5 (Formative Usability Testing), the software was evaluated with practicing secondary chemistry teachers to optimize touch targets and UI responsiveness. In Phase 6 (Field Piloting), the system was prepared for multi-school deployment across ten pilot institutions.")

    add_h2_with_bookmark("3.8 Prototype Development and Current Status", "sec3_8")
    add_p("A fully functional working prototype of VirtuLab Kenya has been engineered and validated locally. The prototype supports four volumetric titration models: acid-base, redox, precipitation, and complexometric reactions. It incorporates an interactive reagent dropper, a magnified burette viewport measuring to 0.05 cubic centimetres, and real-time pH titration curves displaying equivalence points dynamically. In addition, the prototype includes standard KNEC-formatted results tables that automatically verify concordance within plus or minus 0.10 cubic centimetres. It contains 17 genuine KCSE Paper 3 past exam practical questions from 1989 to 2013 with answer validation. The app also offers three visual themes: Clean White for daytime classrooms, Slate Blue Dark for evening revision, and Lab Green for high-contrast accessibility.")

    add_h2_with_bookmark("3.9 Stakeholder Engagement and Content Validation", "sec3_9")
    add_p("To ensure the software matches national educational standards, content validation involves key education specialists. Curriculum alignment is checked against KICD syllabus guidelines to confirm that learning outcomes fit CBC Senior Secondary pathways. Marking accuracy and table rubrics were reviewed by four certified KCSE Chemistry Paper 3 national examiners alongside three KICD curriculum developers, verifying that table penalties, concordance rules, and qualitative deduction steps reflect official KNEC grading. Academic guidance is provided by faculty supervisors in the School of Education at the Open University of Kenya.")

    add_h2_with_bookmark("3.10 Pilot Testing and Pre-Testing", "sec3_10")
    add_p("The pilot study will involve approximately 600 Form 3 and Form 4 chemistry students and 20 teachers across ten secondary schools in Nairobi, Machakos, and Kiambu counties. The sample includes two National/Extra-County schools, three County schools, and five Sub-County day schools. Over a 10-week field study (incorporating a six-week active simulation intervention), experimental classes will use VirtuLab Kenya for pre-lab prep, guided simulation practice, and homework tasks. Learning progress and anxiety reduction will be measured through pre- and post-tests using the CPCAT and CPAS instruments, along with post-study SUS usability questionnaires, TAM 3 surveys, and teacher interviews.")

    add_h2_with_bookmark("3.11 Revision and Refinement of the Intervention", "sec3_11")
    add_p("Formative usability testing with secondary school learners informed three significant user interface refinements: First, a dedicated interactive dropper tool was integrated. Novice learners experienced difficulty managing continuous flow on touchscreens; the dropper enables precise dropwise addition near the titration end-point. Second, a five-tab workspace layout was introduced. The original interface presented instructions, simulation apparatus, results tables, and past examination problems on a single scrollable page, which proved overwhelming on compact mobile displays. Segmenting the workspace into five tabs—Experiment, Results Table, Calculation, Past Papers, and Help—reduced cognitive load. Third, interactive touch targets were enlarged to a minimum of 48 by 48 pixels to ensure reliable touch responsiveness on budget Android smartphones.")

    add_h2_with_bookmark("3.12 12-Month Implementation Plan", "sec3_12")
    add_p("The project follows a 12-month schedule structured across six core phases, presented in Table 3.2.")

    add_p("**Table 3.2: 12-Month Project Implementation Schedule**", bold=True, space_after=4)
    tbl3_2_headers = ["Phase", "Key Milestones and Deliverables", "Timeline", "Target Verification Criterion"]
    tbl3_2_rows = [
        ["1", "Requirements specification, KICD alignment matrix, Node.js backend scaffolding, and PWA service-worker architecture", "Months 1–2", "Passing database schema migrations and functional JWT authentication endpoints"],
        ["2", "Mathematical simulation engines for volumetric titrations, chemical kinetics, and ionic equilibria", "Months 3–4", "Precision burette simulation verified against experimental laboratory titrations"],
        ["3", "Qualitative inorganic analysis, energetics, solubility curves, and student gamification badge portal", "Months 5–6", "All 7 laboratory modules executing completely offline without network connectivity"],
        ["4", "Real-time teacher analytics dashboard, assignment broadcasting subsystem, and timed mock exam module", "Months 7–8", "Multi-school teacher and student role authorization verified under simulated network latency"],
        ["5", "NACOSTI research clearance, onboarding of 10 pilot schools, pre-test administration, and launch of 10-week field evaluation", "Months 9–10", "Active student usage logs recorded across 600 or more secondary learners"],
        ["6", "Post-test administration, SUS, TAM, and CPAS surveying, inferential statistical analysis, and final dissertation defense", "Months 11–12", "Successful Master's dissertation defense and publication of the open-source codebase"]
    ]
    add_table(tbl3_2_headers, tbl3_2_rows)

    add_h2_with_bookmark("3.13 Resource Requirements and Itemized Budget", "sec3_13")
    add_p("The project runs on a lean budget designed for pilot software development, tablet hardware support for day schools, and academic dissemination, outlined in Table 3.3.")

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
    add_p("Table 3.4 outlines potential operational and technical risks alongside concrete mitigation plans.")

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
    add_p("VirtuLab Kenya is built completely on free open-source software, protecting schools from ongoing licensing bills. The system is designed to expand into other subjects. Following completion of the capstone evaluation, subsequent post-dissertation development will extend the simulation engine to secondary Physics (Ohm's Law, lens focal lengths, Hooke's Law) and Biology practicals (food tests, enzyme digestion, transpiration). I will also work with County Education offices and CEMASTEA to include VirtuLab Kenya in national teacher training workshops.")

    add_h2_with_bookmark("3.16 Monitoring and Evaluation Framework", "sec3_16")
    add_p("The project evaluates implementation success against five rigorous benchmarks: First, attaining an average normalised learning gain of g ≥ 0.40 on the CPCAT post-test, demonstrating statistically significant gains over the control group at the 0.05 level. Second, achieving an average System Usability Scale score of 78 or higher among student participants. Third, securing a statistically significant reduction in practical examination anxiety on the CPAS instrument (p < 0.05). Fourth, securing a teacher acceptance rating of 4.0 or higher out of 5.0 across TAM 3 constructs. Fifth, verifying test score reliability with Cronbach’s alpha of 0.80 or higher across evaluation instruments and establishing 100 percent curriculum alignment with KICD chemistry requirements verified through national examiner audit.")

    add_h2_with_bookmark("3.17 Chapter Summary", "sec3_17")
    add_p("This chapter detailed the engineering architecture and pedagogical framework of VirtuLab Kenya. It established five core design principles, presented the three-tier system architecture, and specified the seven laboratory simulation modules. The chapter also articulated the 12-month implementation timeline, the KES 328,900 operational budget, the risk management matrix, and the monitoring and evaluation framework. Chapter Four outlines the implementation, evaluation, and reflection plan for the capstone study.")

    # --- CHAPTER FOUR ---
    doc.add_page_break()
    add_h1_with_bookmark("CHAPTER FOUR: IMPLEMENTATION, EVALUATION AND REFLECTION", "chap4")
    add_p("Note: As this document is a capstone proposal, Chapter Four outlines the projected operational framework, planned data synthesis procedures, risk monitoring protocols, and academic reflection strategies that will govern the pilot study once executed in the field.", italic=True, space_after=12)

    add_h2_with_bookmark("4.1 Implementation of the Capstone Intervention", "sec4_1")
    add_p("Field implementation of VirtuLab Kenya will take place across ten secondary schools in Nairobi, Machakos, and Kiambu counties over a 10-week instructional period. This deployment evaluates the platform's empirical efficacy in authentic classroom settings. Participating cohorts will comprise approximately 600 Form 3 and Form 4 learners and 20 chemistry teachers. Baseline demographic and institutional data—including student gender, prior mobile device exposure, electrical grid stability, and historical school performance in KCSE Paper 3—will be systematically recorded to account for contextual variations across National, County, and Sub-County institutional strata.")

    add_h2_with_bookmark("4.2 Implementation Process", "sec4_2")
    add_p("Field deployment will be structured across four sequential stages: Stage 1 (Institutional Setup and Educator Onboarding), spanning Weeks 1 and 2, entails securing school administrative permissions, delivering refurbished tablets to five sub-county day schools, caching the offline PWA, and conducting orientation workshops for chemistry teachers on dashboard analytics. Stage 2 (Baseline Assessment and Learner Orientation) in Week 3 involves administering the 40-mark CPCAT pre-test and CPAS baseline anxiety survey to experimental and control cohorts under examination conditions, followed by a 45-minute orientation where experimental learners familiarize themselves with touch-based titration controls. Stage 3 (Intervention Instructional Cycle), running from Week 4 through Week 9 across six active weeks, integrates weekly virtual simulation exercises aligned with classroom syllabus pacing, while the platform logs attempt frequencies, procedural errors, and titre concordance in the background. Stage 4 (Post-Intervention Assessment) in Week 10 administers the CPCAT post-test, distributes the CPAS anxiety scale, SUS usability surveys, and TAM 3 questionnaires, and conducts teacher interviews and student focus group discussions.")

    add_h2_with_bookmark("4.3 Participation and Stakeholder Engagement", "sec4_3")
    add_p("Learner and educator engagement will be tracked through automated database telemetry logs and observational classroom site visits. To capture authentic usage patterns, the system distinguishes between scheduled classroom practice and voluntary home study. Student logs record the distribution of Guided Mode versus Exam Mode attempts, time-on-task per module, drop-off rates during stoichiometric calculations, and the frequency of Kiswahili language toggle usage. Teacher logs monitor how frequently educators access the analytics dashboard, broadcast assignments, and export performance summaries for remedial instruction. These quantitative metrics will be triangulated with qualitative classroom observations assessing student collaboration during shared-device sessions.")

    add_h2_with_bookmark("4.4 Evaluation of the Intervention", "sec4_4")
    add_p("The evaluation phase tests research hypotheses and answers the four research questions using mixed-methods analyses. Learning gains will be quantified by comparing pre-test and post-test scores on the CPCAT, utilizing Analysis of Covariance (ANCOVA) to control for baseline differences between groups. Anxiety reduction will be evaluated by comparing pre- and post-intervention scores on the Chemistry Practical Anxiety Scale (CPAS) using paired t-tests. Platform usability will be evaluated through the System Usability Scale, benchmarked against a target score of 78. Technology acceptance will be measured using the TAM 3 framework across Perceived Usefulness, Perceived Ease of Use, and Facilitating Conditions. Diagnostic utility will be validated by cross-referencing telemetry error logs against post-test errors to confirm the predictive accuracy of the teacher dashboard.")

    add_h2_with_bookmark("4.5 Presentation of Evaluation Findings", "sec4_5")
    add_p("Evaluation outcomes will be presented across four analytical formats: First, comparative performance tables detailing sample sizes, pre-test means, post-test means, standard deviations, and normalised gains (g) disaggregated by school tier and treatment group. Second, ANCOVA summary tables displaying F-statistics, degrees of freedom, p-values, and partial eta-squared effect sizes to test the primary research hypothesis. Third, mean rating tables for TAM 3 constructs and CPAS anxiety reductions accompanied by Cronbach’s alpha internal consistency coefficients. Fourth, error-reduction progression charts tracking how systematic errors—such as meniscus misreadings or non-concordant titres—decrease across successive simulation attempts.")

    add_h2_with_bookmark("4.6 Assessment of Outcomes", "sec4_6")
    add_p("The final evaluation will determine whether VirtuLab Kenya successfully narrows the practical achievement gap for under-resourced schools. Specifically, the analysis will assess whether sub-county day school learners utilizing the platform catch up on Paper 3 titration accuracy and stoichiometric calculation marks relative to national school baselines. The study will also evaluate whether repeated virtual practice reduces examination anxiety on the CPAS instrument and builds procedural confidence. Finally, it will investigate whether telemetry analytics encourage educators to adopt targeted, data-driven remedial instructional practices.")

    add_h2_with_bookmark("4.7 User and Stakeholder Feedback", "sec4_7")
    add_p("Qualitative stakeholder feedback will contextualize and explain quantitative findings. Student focus group sessions will explore user experiences with the Kiswahili language toggle, conceptual comprehension gains, and usability challenges on compact smartphone screens. Educator interviews will evaluate whether the platform reduced bench preparation workload, integrated smoothly into school timetables, and warranted institutional adoption. Certified KCSE national examiners will review student practical scripts to evaluate whether virtual simulation practice produced clearer table layouts, accurate concordant averaging (within ±0.10 cm³), and reduced stoichiometric computation errors.")

    add_h2_with_bookmark("4.8 Comparison of Intended and Actual Outcomes", "sec4_8")
    add_p("Upon conclusion of the pilot evaluation, projected targets will be systematically benchmarked against empirical field outcomes, as summarized in Table 4.1.")

    add_p("**Table 4.1: Comparison Matrix of Target versus Projected Pilot Outcomes**", bold=True, space_after=4)
    tbl4_1_headers = ["Evaluation Parameter", "Data Collection Source", "Target Projected Criterion", "Analytical Method of Verification"]
    tbl4_1_rows = [
        ["Learning Gain Improvement", "CPCAT Pre/Post-Test", "Gain g ≥ 0.40; p < 0.05", "ANCOVA between groups with baseline control"],
        ["Practical Anxiety Reduction", "CPAS Pre/Post Survey", "Statistically significant reduction (p < 0.05)", "Paired t-test comparing pre- and post-intervention means"],
        ["Interface Usability Score", "SUS Questionnaire", "Composite Score ≥ 78", "Mean calculation benchmarked against Brooke (1996)"],
        ["Teacher Acceptance Level", "TAM 3 Survey", "Mean ≥ 4.0 out of 5.0", "Descriptive mean across PU and PEOU sub-scales"],
        ["Sub-County Participation", "Class Attendance Logs", "≥ 300 day school students", "Database audit of unique active student accounts"],
        ["Offline System Resilience", "Telemetry Sync Logs", "Zero lost session records", "Audit verifying local queues synced upon reconnect"]
    ]
    add_table(tbl4_1_headers, tbl4_1_rows)

    add_h2_with_bookmark("4.9 Challenges Encountered During Implementation", "sec4_9")
    add_p("The researcher anticipates three primary operational challenges during field deployment: First, physical infrastructural constraints, including rural power outages, depleted tablet batteries, and inadequate classroom charging outlets. Second, shared-device management in large classrooms where learner enrolment exceeds available hardware, requiring structured rotation protocols. Third, syllabus completion pressures, which may cause teacher reluctance toward adopting new instructional tools unless they clearly save instructional time.")

    add_h2_with_bookmark("4.10 Mitigation Measures", "sec4_10")
    add_p("To mitigate these operational risks, three proactive strategies will be deployed: First, equipping test tablet kits with high-capacity solar power banks to ensure uninterrupted classroom operation during power blackouts. Second, instituting a structured paired-learning protocol where learner dyads share a device—one student manipulating the virtual apparatus while the other records readings and performs stoichiometric calculations, reversing roles on alternate trials. Third, providing educators with modular 40-minute lesson pacing guides that embed VirtuLab Kenya directly into existing weekly schemes of work without requiring additional preparation.")

    add_h2_with_bookmark("4.11 Reflection on the Capstone Process", "sec4_11")
    add_p("Developing this capstone project provided critical insight into the balance between advanced software capabilities and the infrastructural realities of Kenyan public secondary schools. Initial technical explorations favored rich 3D graphics libraries, but empirical testing revealed that such architectures crashed on entry-level Android devices commonly used in rural schools. Transitioning to lightweight canvas animations ensured that learners using low-cost hardware could engage with simulations smoothly. This design evolution reinforced a foundational principle of educational technology: pedagogical efficacy depends not on graphical complexity, but on operational reliability within the learning environments that need it most.")

    add_h2_with_bookmark("4.12 Lessons Learned and Best Practices", "sec4_12")
    add_p("The project offers three practical recommendations for educational technology design in Sub-Saharan Africa: First, prioritize vanilla web standards over heavy frontend frameworks to minimize application bundle size and memory consumption. Second, engineer for zero bandwidth first, treating internet connectivity as an intermittent convenience for telemetry synchronisation rather than an operational prerequisite. Third, align software mechanics directly with national examination rubrics. In high-stakes assessment systems, educators and learners adopt digital tools only when they authentically mirror the table conventions, precision criteria, and scoring rubrics of national assessments.")

    add_h2_with_bookmark("4.13 Recommendations for Improvement and Scale-Up", "sec4_13")
    add_p("Drawing on pilot findings, the study presents three actionable policy recommendations: To the Ministry of Education and KICD: Formally accredit VirtuLab Kenya as a recommended supplementary digital learning platform for secondary chemistry under the CBC Senior Secondary STEM pathway. To CEMASTEA: Integrate VirtuLab Kenya into national teacher in-service training workshops, equipping science educators with practical competencies in virtual laboratory pedagogy. To County Education Boards: Allocate targeted capitation grants toward procuring low-cost Android tablets for day school libraries, establishing digital science corners for self-directed practical learning.")

    add_h2_with_bookmark("4.14 Expected Academic and Practical Deliverables", "sec4_14")
    add_p("This capstone produces four major deliverables: First, a production-ready, open-source virtual chemistry laboratory Progressive Web Application deployed online and accessible free of charge to Kenyan secondary schools. Second, a complete Master in Learning Design and Technology dissertation submitted to the School of Education at the Open University of Kenya. Third, an evidence-based policy brief submitted to KICD and the Ministry of Education titled: 'Bridging the Secondary Practical Science Divide Through Lightweight, Offline Virtual Laboratories.' Fourth, empirical research manuscripts submitted to peer-reviewed international journals such as Computers & Education, the Journal of Science Education and Technology, or the East African Journal of Education Studies.")

    add_h2_with_bookmark("4.15 Sustainability and Future Directions", "sec4_15")
    add_p("VirtuLab Kenya is architected for long-term sustainability and cross-disciplinary expansion. Following completion of the capstone evaluation, subsequent post-dissertation development will extend the simulation engine to secondary Physics (Ohm's Law, focal length determinations, Hooke's Law) and Biology practicals (food tests, enzyme kinetics, transpiration). An open-source repository will be maintained on GitHub to enable Kenyan computer science educators and software engineers to contribute experimental modules and regional language translations.")

    add_h2_with_bookmark("4.16 Conclusion", "sec4_16")
    add_p("Persistent disparities and examination anxiety in KCSE Chemistry Paper 3 are not inevitable; they represent the structural consequence of severe laboratory infrastructure deficits. VirtuLab Kenya demonstrates that thoughtful instructional design and lightweight offline web technologies can dismantle these educational barriers. By placing a safe, responsive, and curriculum-aligned virtual chemistry laboratory into the hands of secondary learners, this capstone offers a scalable, economically viable, and equitable pathway toward practical science mastery across Kenya.")

    add_h2_with_bookmark("4.17 Chapter Summary", "sec4_17")
    add_p("This final chapter articulated the implementation and evaluation roadmap for the VirtuLab Kenya pilot study. It outlined the four-stage school rollout across ten secondary schools over a 10-week field study (featuring a six-week active intervention), specified the mixed-methods analytical framework for evaluating learning gains (ANCOVA) and usability (SUS/TAM 3/CPAS), established concrete operational mitigation strategies for rural infrastructure challenges, and detailed the academic and policy deliverables resulting from this capstone project.")

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
        "Vygotsky, L. S. (1978). Mind in society: The development of higher psychological processes. Harvard University Press.",
        "Wabwoba, C. W., & Chang’ach, J. K. (2021). Resource allocation and academic performance in science subjects in public secondary schools in Bungoma County, Kenya. East African Journal of Education Studies, 3(1), 105–118.",
        "Wandera, C. N., & Changeiywo, J. M. (2021). Effect of computer-based simulations on students' achievement in chemistry in secondary schools in Machakos County, Kenya. Journal of Science Education and Technology in Africa, 9(2), 55–68.",
        "Wieman, C. E., Adams, W. K., & Perkins, K. K. (2008). PhET: Simulations that enhance learning. Science, 322(5902), 682–683. https://doi.org/10.1126/science.1161948"
    ]
    for r in refs:
        p_ref = add_p(r, space_after=6)
        p_ref.paragraph_format.left_indent = Inches(0.5)
        p_ref.paragraph_format.first_line_indent = Inches(-0.5)

    out_docx = os.path.join(os.getcwd(), 'VirtuLab_Kenya_Capstone_Proposal_V10.docx')
    fallback_docx = os.path.join(os.getcwd(), 'VirtuLab_Kenya_Capstone_Proposal_V10_Resolved.docx')
    try:
        doc.save(out_docx)
        print(f"Scholarly humanized VirtuLab_Kenya_Capstone_Proposal_V10.docx successfully generated at {out_docx}")
    except PermissionError:
        print(f"Notice: {out_docx} is locked (currently open in Microsoft Word).")
    
    # Always save resolved version as well to ensure latest copy is accessible
    doc.save(fallback_docx)
    print(f"Successfully generated {fallback_docx}")

if __name__ == '__main__':
    create_humanized_proposal_v10()
