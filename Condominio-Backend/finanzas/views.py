# apps/administracion/views.py
from io import BytesIO
from django.utils.text import slugify
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import cloudinary.uploader
from .models import contrato, expensa, multa
from .serializers.serializersContrato import ContratoSerializer
from .serializers.serializersExpensa import ExpensaSerializer
from .serializers.serializersMulta import MultaSerializer
from .common.pdf_utils import render_pdf_from_template
from rest_framework.permissions import IsAuthenticated

class ContratoViewSet(viewsets.ModelViewSet):
    queryset = contrato.objects.all()
    serializer_class = ContratoSerializer

    @action(detail=True, methods=["post"], url_path="generar_pdf")
    def generar_pdf(self, request, pk=None):
        obj = get_object_or_404(contrato, pk=pk)

        # 1) PDF
        try:
            pdf_bytes = render_pdf_from_template("pdf/contrato.html", {"contrato": obj})
        except Exception as e:
            return Response({"detail": f"Error al generar PDF: {e}"}, status=500)

        # 2) Cloudinary
        try:
            public_id = f"contratos/contrato-{obj.id}-{slugify(str(obj.unidad))}"
            upload_result = cloudinary.uploader.upload(
                file=BytesIO(pdf_bytes),
                resource_type="raw",
                public_id=public_id,
                overwrite=True,
                use_filename=True,
                unique_filename=False,
            )
        except Exception as e:
            return Response({"detail": f"Error al subir a Cloudinary: {e}"}, status=502)

        # 3) Guardar
        obj.contrato_PDF = upload_result.get("secure_url")
        obj.save(update_fields=["contrato_PDF"])

        # 4) Respuesta
        return Response(
            {"id": obj.id, "pdf_url": obj.contrato_PDF, "public_id": upload_result.get("public_id")},
            status=status.HTTP_200_OK
        )

class MultaViewSet(viewsets.ModelViewSet):
    queryset = multa.objects.all()
    serializer_class = MultaSerializer

class ExpensaViewSet(viewsets.ModelViewSet):
    serializer_class = ExpensaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = expensa.objects.select_related("unidad", "unidad__bloque")
        if user.is_superuser or user.is_staff:
            return queryset
        if user.groups.filter(name='administrador').exists():
            return queryset
        return queryset.filter(
            unidad__contratos_unidad__propietario__user=user,
            unidad__contratos_unidad__estado='A' 
        ).distinct()



