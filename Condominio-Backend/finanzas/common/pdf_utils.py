from io import BytesIO
from django.template.loader import render_to_string
from xhtml2pdf import pisa

def render_pdf_from_template(template_name: str, context: dict) -> bytes:
    html = render_to_string(template_name, context)
    out = BytesIO()
    result = pisa.CreatePDF(html, dest=out, encoding='utf-8')
    if result.err:
        raise ValueError("Error al generar el PDF con xhtml2pdf.")
    return out.getvalue()
