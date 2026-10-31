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
from administracion.access import ApplicationRolePermission, effective_role, roles_for
from django.db.models import F
from django.utils import timezone
from residencial.viewsVehiculo import unidades_propietario


def expensas_permitidas(user):
    queryset = expensa.objects.select_related('unidad', 'unidad__bloque')
    role = effective_role(user)
    if role == 'administrador':
        return queryset
    if role == 'propietario':
        return queryset.filter(unidad__in=unidades_propietario(user),
                               unidad__contratos_unidad__propietario__user=user,
                               unidad__contratos_unidad__estado='A',
                               unidad__contratos_unidad__fecha_contrato__lte=timezone.localdate(),
                               fecha_emision__gte=F('unidad__contratos_unidad__fecha_contrato')).distinct()
    return queryset.none()

class ContratoViewSet(viewsets.ModelViewSet):
    queryset = contrato.objects.all()
    serializer_class = ContratoSerializer
    permission_classes = [ApplicationRolePermission]
    role_access = roles_for(read=('administrador', 'propietario', 'inquilino'), write=('administrador',),
                            extra={'generar_pdf': ('administrador',)})

    def get_queryset(self):
        role = effective_role(self.request.user)
        if role == 'administrador':
            return super().get_queryset()
        if role == 'propietario':
            return super().get_queryset().filter(propietario__user=self.request.user)
        return super().get_queryset().none()

    @action(detail=True, methods=["post"], url_path="generar_pdf")
    def generar_pdf(self, request, pk=None):
        obj = self.get_object()

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
    permission_classes = [ApplicationRolePermission]
    role_access = roles_for(read=('administrador', 'propietario', 'inquilino'), write=('administrador',))

    def get_queryset(self):
        role = effective_role(self.request.user)
        if role == 'administrador':
            return super().get_queryset()
        return super().get_queryset().filter(expensa__in=expensas_permitidas(self.request.user))

class ExpensaViewSet(viewsets.ModelViewSet):
    serializer_class = ExpensaSerializer
    permission_classes = [ApplicationRolePermission]
    role_access = roles_for(read=('administrador', 'propietario', 'inquilino'), write=('administrador',))

    def get_queryset(self):
        return expensas_permitidas(self.request.user)



