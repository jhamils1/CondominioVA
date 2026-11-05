from pathlib import Path
import re
from pypdf import PdfReader
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

root = Path(__file__).resolve().parents[1]
source = PdfReader(root / 'output/pdf/caratula_indice_condominio.pdf')
original = PdfReader(root / 'PROYECTO-SI2 (3).pdf')
logo = root / 'tmp/logo_condominio.png'
original.pages[0].images[0].image.save(logo)
doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Inches(8.5), Inches(11)
sec.left_margin = sec.right_margin = Inches(1)
sec.top_margin = sec.bottom_margin = Inches(.7)
normal = doc.styles['Normal']
normal.font.name = 'Times New Roman'
normal.font.size = Pt(11.5)
normal.paragraph_format.space_after = Pt(0)
normal.paragraph_format.space_before = Pt(0)

def cover(text='', size=12, bold=True, after=0, before=0):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.space_before = Pt(before)
    r = p.add_run(text)
    r.font.name = 'Arial'
    r.font.size = Pt(size)
    r.bold = bold
    return p

cover('UNIVERSIDAD AUTÓNOMA GABRIEL RENÉ MORENO', 13, after=5)
cover('FACULTAD DE INGENIERÍA EN CIENCIAS DE LA COMPUTACIÓN', 12, after=5)
cover('Y TELECOMUNICACIÓN', 12, after=6)
p=cover()
p.add_run().add_picture(str(logo), width=Inches(2.05))
cover('GRUPO N.º __________', 12, after=8)
cover('SISTEMA WEB Y MÓVIL PARA LA GESTIÓN', 12, after=6)
cover('Y SEGURIDAD INTELIGENTE DE CONDOMINIOS', 12, after=6)
cover('MEDIANTE VISIÓN ARTIFICIAL', 12, after=10)
p=doc.add_paragraph(); p.add_run('INTEGRANTES:').bold=True
p.paragraph_format.space_after=Pt(4)
for i in range(6):
    p=doc.add_paragraph('Nombre: __________________________________   Registro: ______________')
    p.paragraph_format.left_indent=Inches(.3); p.paragraph_format.line_spacing=Pt(19)
p=doc.add_paragraph(); p.paragraph_format.space_before=Pt(8)
p.add_run('DOCENTE: ').bold=True; p.add_run('__________________________________________________')
cover('SANTA CRUZ - BOLIVIA', 12, before=12)
doc.add_page_break()

for pi in range(1,7):
    lines = [x.strip() for x in source.pages[pi].extract_text().splitlines() if x.strip()]
    if pi == 1 and lines[0] == 'ÍNDICE':
        p=doc.add_paragraph('ÍNDICE'); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
        p.runs[0].bold=True; p.paragraph_format.line_spacing=Pt(17)
        lines=lines[1:]
    titles=[]
    for line in lines:
        if re.fullmatch(r'\.{2,}', line):
            continue
        if re.fullmatch(r'\d+', line):
            title=' '.join(titles); titles=[]
            p=doc.add_paragraph()
            p.paragraph_format.line_spacing=Pt(17)
            p.paragraph_format.tab_stops.add_tab_stop(Inches(6.5), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
            if re.match(r'^\d+\.\d+\.\d+', title) or title.startswith(('Caso de estudio', 'RF-DETR')):
                p.paragraph_format.left_indent=Inches(.4)
            elif re.match(r'^\d+\.\d+', title):
                p.paragraph_format.left_indent=Inches(.2)
            run=p.add_run(title+'\t'+line)
            run.bold=title.startswith(('CAPÍTULO', 'SPRINT '))
        else:
            titles.append(line)
    assert not titles, titles
    if pi < 6: doc.add_page_break()
out=root/'output/pdf/caratula_indice_condominio_editable.docx'
doc.save(out)
assert len(Document(out).paragraphs)>190
print(out)
