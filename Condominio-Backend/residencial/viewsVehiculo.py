# vehiculo/views.py
import requests
import json
from rest_framework import viewsets, status
from rest_framework.response import Response
from .serializers.serializersVehiculo import VehiculoSerializer, PersonaAuxSerializers
from .serializers.serializersBloque import BloqueSerializer
from .serializers.serializersUnidad import UnidadSerializer, BloqueAuxSerializer
from .serializers.serializersIncidente import IncidenteSerializer, IncidenteGuardiaSerializer
from .modelsVehiculo import Vehiculo, Bloque, Unidad, incidente
from decouple import config
from .models import Persona
from django.conf import settings
from residencial.serializers.serializersObjetos import ObjetoPerdidoSerializer
from residencial.models import ObjetoPerdido
from administracion.access import ApplicationRolePermission, effective_role, roles_for
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.db.models import Count, Exists, OuterRef, Subquery
from django.db.models.deletion import ProtectedError
from django.db import connection, transaction
from django.contrib.admin.models import ADDITION, CHANGE, DELETION
from administracion.audit import record_action
from django.utils import timezone


def unidades_propietario(user):
    # Excluir contratos simultáneos de propietarios distintos: su alcance es ambiguo.
    from finanzas.models import contrato
    contratos = contrato.objects.filter(unidad_id=OuterRef('pk'), estado='A',
                                        fecha_contrato__lte=timezone.localdate())
    return Unidad.objects.annotate(
        contrato_propio=Exists(contratos.filter(propietario__user=user)),
        contratos_vigentes=Subquery(contratos.values('unidad').annotate(total=Count('pk')).values('total')),
    ).filter(contrato_propio=True, contratos_vigentes=1)


class VehiculoViewSet(viewsets.ModelViewSet):
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer
    permission_classes = [ApplicationRolePermission]
    role_access = roles_for(read=('administrador', 'guardia', 'propietario', 'inquilino'),
                            write=('administrador', 'propietario', 'inquilino'))

    def get_queryset(self):
        queryset = super().get_queryset()
        if effective_role(self.request.user) in ('propietario', 'inquilino'):
            queryset = queryset.filter(persona__user=self.request.user)
        return queryset

    def create(self, request, *args, **kwargs):
        self.validate_persona_before_upload(request)
        return self.handle_image_upload(request, super().create)

    def update(self, request, *args, **kwargs):
        self.get_object()
        self.validate_persona_before_upload(request)
        return self.handle_image_upload(request, super().update, *args, **kwargs)

    def validate_persona_before_upload(self, request):
        if effective_role(request.user) in ('propietario', 'inquilino'):
            persona = request.data.get('persona')
            if persona is not None and str(persona) != str(request.user.persona.pk):
                raise ValidationError({'persona': 'Solo puede gestionar sus propios vehículos.'})

    def handle_image_upload(self, request, action, *args, **kwargs):
        imagen_file = request.FILES.get("imagen")

        if imagen_file:
            url = "https://api.imgbb.com/1/upload"
            payload = {"key": settings.IMGBB_API_KEY}
            files = {"image": imagen_file.read()}
            response = requests.post(url, payload, files=files)

            if response.status_code == 200:
                image_url = response.json()["data"]["url"]
                data = request.data.copy()
                data["imagen"] = image_url
                request._full_data = data
            else:
                return Response({"error": "Error al subir imagen a ImgBB"}, status=500)

        else:
            if request.method in ["PUT", "PATCH"]:
                instance = self.get_object()
                data = request.data.copy()
                if not data.get("imagen"):
                    data["imagen"] = instance.imagen
                    request._full_data = data

        return action(request, *args, **kwargs)
    
class personaAuxViewSet(viewsets.ModelViewSet):
    queryset = Persona.objects.all()
    serializer_class = PersonaAuxSerializers
    permission_classes = [ApplicationRolePermission]
    role_access = roles_for(read=('administrador', 'guardia'), write=('administrador',))

class BloqueViewSet(viewsets.ModelViewSet):
    queryset = Bloque.objects.all()
    serializer_class = BloqueSerializer
    permission_classes = [ApplicationRolePermission]
    role_access = roles_for(read=('administrador', 'guardia', 'propietario', 'inquilino'), write=('administrador',))

    def get_queryset(self):
        role = effective_role(self.request.user)
        if role == 'propietario':
            return super().get_queryset().filter(unidad__in=unidades_propietario(self.request.user)).distinct()
        if role == 'inquilino':
            return super().get_queryset().none()
        return super().get_queryset()

class UnidadViewSet(viewsets.ModelViewSet):
    queryset = Unidad.objects.all()
    serializer_class = UnidadSerializer
    permission_classes = [ApplicationRolePermission]
    role_access = roles_for(read=('administrador', 'guardia', 'propietario', 'inquilino'), write=('administrador',))

    def get_queryset(self):
        role = effective_role(self.request.user)
        if role == 'propietario':
            return unidades_propietario(self.request.user)
        if role == 'inquilino':
            return super().get_queryset().none()
        return super().get_queryset()

    def create(self, request, *args, **kwargs):
        return self.handle_image_upload(request, super().create)

    def update(self, request, *args, **kwargs):
        return self.handle_image_upload(request, super().update, *args, **kwargs)

    def handle_image_upload(self, request, action, *args, **kwargs):
        imagen_file = request.FILES.get("imagen")

        if imagen_file:
            url = "https://api.imgbb.com/1/upload"
            payload = {"key": settings.IMGBB_API_KEY}
            files = {"image": imagen_file.read()}
            response = requests.post(url, payload, files=files)

            if response.status_code == 200:
                image_url = response.json()["data"]["url"]
                data = request.data.copy()
                data["imagen"] = image_url
                request._full_data = data
            else:
                return Response({"error": "Error al subir imagen a ImgBB"}, status=500)

        else:
            if request.method in ["PUT", "PATCH"]:
                instance = self.get_object()
                data = request.data.copy()
                if not data.get("imagen"):
                    data["imagen"] = instance.imagen
                    request._full_data = data

        return action(request, *args, **kwargs)


class BloqueAuxViewSet(viewsets.ModelViewSet):
    queryset = Bloque.objects.all()
    serializer_class = BloqueAuxSerializer
    permission_classes = [ApplicationRolePermission]
    role_access = roles_for(read=('administrador', 'guardia'), write=('administrador',))

class IncidenteViewSet(viewsets.ModelViewSet):
    queryset = incidente.objects.all()
    serializer_class = IncidenteSerializer
    permission_classes = [ApplicationRolePermission]
    role_access = roles_for(read=('administrador', 'guardia'), write=('administrador', 'guardia'),
                            extra={'destroy': ('administrador',)})

    def get_serializer_class(self):
        if effective_role(self.request.user) == 'guardia':
            return IncidenteGuardiaSerializer
        return self.serializer_class

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        if not getattr(settings, 'NOTIFICACIONES_SEGURIDAD_ACTIVAS', False):
            from seguridad_IA.models import EventoSeguridad
            if EventoSeguridad._meta.db_table not in connection.introspection.table_names():
                return Response({'detail': 'La eliminación no está disponible hasta configurar el módulo de seguridad.'}, status=503)
        instance = self.get_object()
        record_action(request.user, instance, 'Eliminación de incidente', DELETION)
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            raise ValidationError('No se puede eliminar una incidencia con historial de seguridad.')

    def perform_create(self, serializer):
        if effective_role(self.request.user) == 'guardia' and any(k in self.request.data for k in ('propietario', 'multa')):
            raise PermissionDenied('El guardia no puede asignar responsables ni multas.')
        instance = serializer.save()
        record_action(self.request.user, instance, 'Registro manual de incidente', ADDITION)
        if effective_role(self.request.user) == 'guardia' and getattr(settings, 'NOTIFICACIONES_SEGURIDAD_ACTIVAS', False):
            from seguridad_IA.notificaciones import registrar_incidencia_manual_confirmada
            registrar_incidencia_manual_confirmada(self.request.user, instance)

    def perform_update(self, serializer):
        if effective_role(self.request.user) == 'guardia' and any(k in self.request.data for k in ('propietario', 'multa')):
            raise PermissionDenied('El guardia no puede modificar responsables ni multas.')
        evento = None
        if getattr(settings, 'NOTIFICACIONES_SEGURIDAD_ACTIVAS', False):
            from seguridad_IA.models import EventoSeguridad
            evento = EventoSeguridad.objects.select_for_update().filter(incidencia=serializer.instance).first()
        instance = serializer.save()
        if evento:
            from seguridad_IA.models import HistorialEventoSeguridad
            anterior = {'descripcion': evento.descripcion, 'fecha_evento': evento.fecha_evento.isoformat()}
            evento.descripcion = instance.descripcion
            evento.fecha_evento = instance.fecha_incidente
            evento.save(update_fields=['descripcion', 'fecha_evento'])
            HistorialEventoSeguridad.objects.create(evento=evento, actor=self.request.user, accion='INCIDENCIA_EDITADA',
                observacion=json.dumps({'anterior': anterior, 'actual': {'descripcion': evento.descripcion,
                    'fecha_evento': evento.fecha_evento.isoformat()}}, ensure_ascii=False))
        record_action(self.request.user, instance, 'Actualización de incidente', CHANGE)

class ObjetoPerdidoViewSet(viewsets.ModelViewSet):
    queryset = ObjetoPerdido.objects.all()
    serializer_class = ObjetoPerdidoSerializer
    permission_classes = [ApplicationRolePermission]
    role_access = roles_for(read=('administrador', 'propietario', 'inquilino'), write=('administrador',))

    # --- Lógica de Filtros Opcional ---
    def get_queryset(self):
        """
        Permite filtrar por estado (ej: /api/objetos-perdidos/?estado=P)
        para ver solo los pendientes.
        """
        queryset = super().get_queryset()
        estado = self.request.query_params.get('estado')
        if estado:
            queryset = queryset.filter(estado=estado)
        return queryset

    # --- Métodos Sobrescritos para ImgBB ---

    def create(self, request, *args, **kwargs):
        # Interceptamos la creación para subir la foto primero
        return self.handle_image_upload(request, super().create)

    def update(self, request, *args, **kwargs):
        # Interceptamos la actualización
        return self.handle_image_upload(request, super().update, *args, **kwargs)

    def handle_image_upload(self, request, action, *args, **kwargs):
        # 1. Buscamos el archivo con la clave 'foto'
        imagen_file = request.FILES.get("foto")

        if imagen_file:
            # 2. Configuración de ImgBB
            url = "https://api.imgbb.com/1/upload"
            payload = {"key": settings.IMGBB_API_KEY}
            files = {"image": imagen_file.read()}
            
            # 3. Petición a ImgBB
            try:
                response = requests.post(url, payload, files=files)
                
                if response.status_code == 200:
                    image_url = response.json()["data"]["url"]
                    
                    # 4. Modificamos el request.data con la URL que nos dio ImgBB
                    data = request.data.copy()
                    data["foto"] = image_url # Guardamos la URL en el campo 'foto'
                    request._full_data = data # Hack para DRF
                else:
                    return Response(
                        {"error": "Error al subir imagen a ImgBB", "detalle": response.text}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            except Exception as e:
                return Response({"error": f"Error de conexión con ImgBB: {str(e)}"}, status=500)

        else:
            # Lógica para mantener la foto antigua si no se sube una nueva al editar
            if request.method in ["PUT", "PATCH"]:
                instance = self.get_object()
                data = request.data.copy()
                # Si no envían 'foto', mantenemos la que ya tenía la instancia
                if not data.get("foto"):
                    data["foto"] = instance.foto
                    request._full_data = data

        # 5. Ejecutamos la acción original (create o update)
        return action(request, *args, **kwargs)
