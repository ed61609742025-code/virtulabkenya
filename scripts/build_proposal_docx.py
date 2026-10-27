import os
import sys
import subprocess
from pathlib import Path

# Step 1: Ensure python-docx is installed
try:
    import docx
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
    from docx.oxml import OxmlElement, parse_xml
    from docx.oxml.ns import nsdecls, qn
except ImportError:
    print("Installing python-docx...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "python-docx"])
    import docx
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
    from docx.oxml import OxmlElement, parse_xml
    from docx.oxml.ns import nsdecls, qn

print("python-docx is available!")

# Step 2: Search for V10 docx file in common directories
search_roots = [
    Path(r"C:\Users\USER\Downloads"),
    Path(r"C:\Users\USER\Documents"),
    Path(r"C:\Users\USER\Desktop"),
    Path(r"c:\Users\USER\.gemini\antigravity\scratch"),
]

found_v10 = []
for root in search_roots:
    if root.exists():
        try:
            for p in root.rglob("*VirtuLab*V10*.docx"):
                found_v10.append(p)
        except Exception as e:
            pass

print(f"Found existing V10 files: {found_v10}")

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_styled_document():
    doc = docx.Document()
    # Set page margins to standard 1 inch (72 pt)
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(1)
        s.bottom_margin = Inches(1)
        s.left_margin = Inches(1)
        s.right_margin = Inches(1)
    
    # Configure default style: Calibri 11pt, 1.15 line spacing
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(0x22, 0x22, 0x22)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(4)
    
    return doc

def md_to_docx(md_path, docx_path, title_text=None):
    print(f"Converting {md_path.name} -> {docx_path.name}...")
    doc = create_styled_document()
    
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    in_code_block = False
    code_lines = []
    in_table = False
    table_rows = []
    
    def flush_table(rows):
        if not rows:
            return
        # Filter rows
        valid_rows = []
        for r in rows:
            if set(r.replace('|', '').replace('-', '').replace(':', '').strip()) == set():
                continue # Skip divider row
            cols = [c.strip() for c in r.split('|')]
            if cols and cols[0] == '':
                cols = cols[1:]
            if cols and cols[-1] == '':
                cols = cols[:-1]
            if cols:
                valid_rows.append(cols)
        
        if not valid_rows:
            return
            
        num_cols = max(len(r) for r in valid_rows)
        tbl = doc.add_table(rows=len(valid_rows), cols=num_cols)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        
        for r_idx, row_data in enumerate(valid_rows):
            is_header = (r_idx == 0)
            row = tbl.rows[r_idx]
            for c_idx in range(num_cols):
                cell = row.cells[c_idx]
                text = row_data[c_idx] if c_idx < len(row_data) else ""
                # Format cell text
                cell.text = text.replace('**', '').replace('`', '')
                set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
                if is_header:
                    set_cell_background(cell, "1F4E79") # Deep navy
                    for p in cell.paragraphs:
                        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        for run in p.runs:
                            run.font.bold = True
                            run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                            run.font.size = Pt(9.5)
                else:
                    bg = "F2F4F7" if r_idx % 2 == 1 else "FFFFFF"
                    set_cell_background(cell, bg)
                    for p in cell.paragraphs:
                        for run in p.runs:
                            run.font.size = Pt(9.5)
                            run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)

    def flush_code(lines):
        if not lines:
            return
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.rows[0].cells[0]
        set_cell_background(cell, "F4F5F7")
        set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
        p = cell.paragraphs[0]
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.space_after = Pt(2)
        run = p.add_run("\n".join(lines))
        run.font.name = 'Consolas'
        run.font.size = Pt(9)
        run.font.color.rgb = RGBColor(0x24, 0x29, 0x2E)
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    for line in lines:
        raw = line.rstrip('\r\n')
        stripped = raw.strip()
        
        # Code block handling
        if stripped.startswith('```'):
            if in_code_block:
                flush_code(code_lines)
                code_lines = []
                in_code_block = False
            else:
                if in_table:
                    flush_table(table_rows)
                    table_rows = []
                    in_table = False
                in_code_block = True
            continue
            
        if in_code_block:
            code_lines.append(raw)
            continue
            
        # Table handling
        if stripped.startswith('|') and stripped.endswith('|'):
            in_table = True
            table_rows.append(stripped)
            continue
        elif in_table:
            flush_table(table_rows)
            table_rows = []
            in_table = False
            
        # Headers
        if stripped.startswith('# '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(6)
            run = p.add_run(stripped[2:])
            run.font.bold = True
            run.font.size = Pt(18)
            run.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D) # Navy
        elif stripped.startswith('## '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run(stripped[3:])
            run.font.bold = True
            run.font.size = Pt(14)
            run.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)
        elif stripped.startswith('### '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run(stripped[4:])
            run.font.bold = True
            run.font.size = Pt(12)
            run.font.color.rgb = RGBColor(0x2E, 0x5B, 0x88)
        elif stripped.startswith('#### '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run(stripped[5:])
            run.font.bold = True
            run.font.size = Pt(11)
            run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
        elif stripped.startswith('> '):
            # Callout blockquote
            tbl = doc.add_table(rows=1, cols=1)
            cell = tbl.rows[0].cells[0]
            set_cell_background(cell, "EBF3FB") # Soft blue
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run(stripped[2:].replace('**', ''))
            run.font.italic = True
            run.font.size = Pt(10)
            run.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)
        elif stripped.startswith('* ') or stripped.startswith('- '):
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            content = stripped[2:]
            # Bold highlights
            parts = content.split('**')
            for idx, pt in enumerate(parts):
                run = p.add_run(pt)
                if idx % 2 == 1:
                    run.font.bold = True
        elif stripped.startswith(('1. ', '2. ', '3. ', '4. ', '5. ', '6. ', '7. ', '8. ', '9. ')):
            p = doc.add_paragraph(style='List Number')
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            content = stripped[3:]
            parts = content.split('**')
            for idx, pt in enumerate(parts):
                run = p.add_run(pt)
                if idx % 2 == 1:
                    run.font.bold = True
        elif stripped == '---':
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run("―" * 50)
            run.font.color.rgb = RGBColor(0xCC, 0xCC, 0xCC)
        elif stripped:
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.15
            parts = stripped.split('**')
            for idx, pt in enumerate(parts):
                run = p.add_run(pt)
                if idx % 2 == 1:
                    run.font.bold = True
                    
    if in_table:
        flush_table(table_rows)
    if in_code_block:
        flush_code(code_lines)
        
    doc.save(str(docx_path))
    print(f"Saved: {docx_path}")

# Source artifacts folder
brain_dir = Path(r"C:\Users\USER\.gemini\antigravity\brain\1347d73b-10ce-4cb1-92ea-39097135637a")
out_dir = Path(r"c:\Users\USER\.gemini\antigravity\scratch\virtulabkenya\docs")
out_dir.mkdir(parents=True, exist_ok=True)

artifacts = [
    ("VirtuLab_Kenya_Proposal_V11_Master_Patches.md", "VirtuLab_Kenya_Proposal_V11_Master_Patches.docx"),
    ("VirtuLab_Kenya_Proposal_V11_Figures_and_Schematics.md", "VirtuLab_Kenya_Proposal_V11_Figures_and_Schematics.docx"),
    ("VirtuLab_Kenya_KICD_CEMASTEA_Partnership_Brief.md", "VirtuLab_Kenya_KICD_CEMASTEA_Partnership_Brief.docx"),
    ("VirtuLab_Kenya_Proposal_Defense_Slide_Deck.md", "VirtuLab_Kenya_Proposal_Defense_Slide_Deck.docx"),
    ("VirtuLab_Kenya_NACOSTI_Ethical_Clearance_Package.md", "VirtuLab_Kenya_NACOSTI_Ethical_Clearance_Package.docx"),
    ("VirtuLab_Kenya_Proposal_V11_Revision_Plan.md", "VirtuLab_Kenya_Proposal_V11_Revision_Plan.docx")
]

for md_name, docx_name in artifacts:
    src = brain_dir / md_name
    dst = out_dir / docx_name
    if src.exists():
        md_to_docx(src, dst)
    else:
        print(f"Warning: {src} does not exist")

print("\nALL DOCX FILES COMPILED SUCCESSFULLY!")
