from pathlib import Path
import re
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

root = Path(__file__).resolve().parents[1]
doc = Document(root/'output/pdf/PROYECTO CONDOMINIO VISION ARTIFICIAL.docx')
entries=[]
for p in doc.paragraphs:
    if '\t' in p.text:
        title, page = p.text.rsplit('\t',1)
        if page.isdigit(): entries.append(title)
assert len(entries)==193
body=doc._element.body
cut=False
for p in list(body):
    if p.tag == qn('w:sectPr'): continue
    if cut: body.remove(p)
    elif p.xpath('.//w:br[@w:type="page"]'): cut=True

for level in range(1,5):
    st=doc.styles[f'Heading {level}']
    st.font.name='Times New Roman'; st.font.size=Pt(14 if level==1 else 12)
    st.font.color.rgb=RGBColor(0,0,0); st.font.bold=True
    st.paragraph_format.space_before=Pt(10)
    st.paragraph_format.space_after=Pt(5)
    st.paragraph_format.keep_with_next=True
    st.next_paragraph_style=doc.styles['Normal']
    name=f'TOC {level}'
    toc=doc.styles[name] if name in doc.styles else doc.styles.add_style(name,WD_STYLE_TYPE.PARAGRAPH)
    toc.font.name='Times New Roman'; toc.font.size=Pt(11.5)
    toc.font.bold=level==1; toc.font.color.rgb=RGBColor(0,0,0)
    toc.paragraph_format.left_indent=Inches((level-1)*.18)
    toc.paragraph_format.space_before=Pt(0); toc.paragraph_format.space_after=Pt(0)
    toc.paragraph_format.line_spacing=Pt(17)
    toc.paragraph_format.keep_with_next=False
    toc.paragraph_format.tab_stops.add_tab_stop(Inches(6.5),WD_TAB_ALIGNMENT.RIGHT,WD_TAB_LEADER.DOTS)
p=doc.add_paragraph('ÍNDICE'); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
p.runs[0].bold=True; p.runs[0].font.size=Pt(14)
doc.add_paragraph('[[TOC]]')
doc.add_page_break()

chapter=0; sprint=False
for title in entries:
    if title.startswith('CAPÍTULO'):
        chapter=int(re.search(r'\d',title).group()); sprint=False; level=1
    elif title.startswith('SPRINT '): sprint=True; level=2
    elif chapter==4 and sprint:
        if re.match(r'^\d+\.\d+\.\d+',title): level=4
        elif re.match(r'^\d+\.\d+',title): level=4
        elif title.startswith('SEMANA'): level=4
        else: level=3
    elif re.match(r'^\d+\.\d+\.\d+',title): level=3
    elif re.match(r'^\d+\.\d+',title): level=2
    elif re.match(r'^[a-z]\. ',title) or re.match(r'^\d+ ',title): level=2
    elif title.startswith(('Caso de estudio','Servidor','Cliente','Medios de comunicación','RF-DETR')): level=3
    elif title.startswith(('Burndown','BurnUp')): level=2
    else: level=1
    p=doc.add_paragraph(title,style=f'Heading {level}')
    if title.startswith(('CAPÍTULO','SPRINT ')): p.paragraph_format.page_break_before=True
    doc.add_paragraph('')
footer=doc.sections[0].footer.paragraphs[0]
footer.alignment=WD_ALIGN_PARAGRAPH.CENTER
fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); footer._p.append(fld)
doc.sections[0].different_first_page_header_footer=True
doc.core_properties.title='Gestión y seguridad inteligente de condominios'
doc.core_properties.author=''
doc.save(root/'output/pdf/caratula_indice_condominio_automatico.docx')
print('193 títulos fuente preparados')
