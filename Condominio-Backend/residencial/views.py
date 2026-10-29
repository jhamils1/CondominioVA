from rest_framework import status, viewsets, filters, generics, permissions, serializers
from django.db.models import Q, Count, Avg
from django.db.models import ProtectedError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from administracion.models import Persona
from administracion.serializers.serializersPersona import (
    PersonaSerializer, PropietarioSerializer, VisitanteSerializer
)
from .models import Inquilino, Familiares, Visitante, Mascota, AreasComunes, ReservaAreaComun
from .serializers.serializersInquilino import InquilinoSerializer, InquilinoListSerializer
from .serializers.serializersFamiliares import FamiliaresSerializer, FamiliaresListSerializer
from .serializers.serializersMascota import MascotaSerializer, MascotaListSerializer
import requests
from django.conf import settings
from residencial.serializers.serializersArea import AreaSerializer
from residencial.serializers.serializersReserva import ReservaAreaComunSerializer
from rest_framework.exceptions import PermissionDenied, ValidationError

# Create your views here.

# ==================== VISTAS ESPECÍFICAS POR TIPO DE PERSONA ====================

class PropietarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para CRUD completo de propietarios con subida de imágenes a ImgBB
    """
    serializer_class = PropietarioSerializer
    queryset = Persona.objects.filter(tipo='P')
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'apellido', 'CI', 'telefono']
    ordering_fields = ['nombre', 'apellido', 'fecha_registro', 'CI']
    ordering = ['apellido', 'nombre']
    
    def perform_create(self, serializer):
        user_id = serializer.validated_data.get('user')
        serializer.save(tipo='P')
    
    def perform_update(self, serializer):
        # Mantener el tipo como 'P' al actualizar
        serializer.save(tipo='P')
    
    def create(self, request, *args, **kwargs):
        """
        Crear propietario con subida de imagen a ImgBB
        """
        return self.handle_image_upload(request, super().create, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Actualizar propietario con subida de imagen a ImgBB
        """
        return self.handle_image_upload(request, super().update, *args, **kwargs)
    
    def handle_image_upload(self, request, action, *args, **kwargs):
        """
        Maneja la subida de imágenes a ImgBB API
        """
        imagen_file = request.FILES.get('imagen')
        
        if imagen_file:
            # Subir imagen a ImgBB
            url = "https://api.imgbb.com/1/upload"
            payload = {"key": settings.IMGBB_API_KEY}
            files = {"image": imagen_file.read()}
            
            response = requests.post(url, payload, files=files)
            
            if response.status_code == 200:
                # Extraer URL de la imagen subida
                image_url = response.json()["data"]["url"]
                
                # Actualizar los datos de la request con la URL de la imagen
                data = request.data.copy()
                data["imagen"] = image_url
                request._full_data = data
            else:
                return Response(
                    {"error": "Error al subir imagen a ImgBB"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            # Si no se sube nueva imagen en PUT/PATCH, mantener la existente
            if request.method in ["PUT", "PATCH"]:
                instance = self.get_object()
                data = request.data.copy()
                if not data.get("imagen"):
                    data["imagen"] = instance.imagen
                request._full_data = data
        
        return action(request, *args, **kwargs)


class InquilinoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para CRUD completo de inquilinos que hereda de Persona
    """
    queryset = Inquilino.objects.select_related('propietario').all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'nombre', 'apellido', 'CI', 'telefono',
        'propietario__nombre', 'propietario__apellido', 'propietario__CI'
    ]
    ordering_fields = [
        'fecha_inicio', 'fecha_fin', 'estado_inquilino', 'fecha_registro',
        'apellido', 'propietario__apellido'
    ]
    ordering = ['-fecha_registro']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return InquilinoListSerializer
        return InquilinoSerializer
    
    def get_queryset(self):
        """
        Filtrar inquilinos por diferentes criterios
        """
        queryset = super().get_queryset()
        
        # Filtrar por estado del inquilino
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado=estado)
        
        # Filtrar por estado específico del inquilino
        estado_inquilino = self.request.query_params.get('estado_inquilino', None)
        if estado_inquilino:
            queryset = queryset.filter(estado_inquilino=estado_inquilino)
        
        # Filtrar por propietario específico
        propietario = self.request.query_params.get('propietario', None)
        if propietario:
            queryset = queryset.filter(propietario_id=propietario)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """
        Crear inquilino con subida de imagen a ImgBB
        """
        return self.handle_image_upload(request, super().create, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Actualizar inquilino con subida de imagen a ImgBB
        """
        return self.handle_image_upload(request, super().update, *args, **kwargs)
    
    def handle_image_upload(self, request, action, *args, **kwargs):
        """
        Maneja la subida de imágenes a ImgBB API
        """
        imagen_file = request.FILES.get('imagen')
        
        if imagen_file:
            # Subir imagen a ImgBB
            url = "https://api.imgbb.com/1/upload"
            payload = {"key": settings.IMGBB_API_KEY}
            files = {"image": imagen_file.read()}
            
            response = requests.post(url, payload, files=files)
            
            if response.status_code == 200:
                # Extraer URL de la imagen subida
                image_url = response.json()["data"]["url"]
                
                # Actualizar los datos de la request con la URL de la imagen
                data = request.data.copy()
                data["imagen"] = image_url
                request._full_data = data
            else:
                return Response(
                    {"error": "Error al subir imagen a ImgBB"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            # Si no se sube nueva imagen en PUT/PATCH, mantener la existente
            if request.method in ["PUT", "PATCH"]:
                instance = self.get_object()
                data = request.data.copy()
                if not data.get("imagen"):
                    data["imagen"] = instance.imagen
                request._full_data = data
        
        return action(request, *args, **kwargs)


class FamiliaresViewSet(viewsets.ModelViewSet):
    """
    ViewSet para CRUD completo de familiares que hereda de Persona
    """
    queryset = Familiares.objects.select_related('persona_relacionada').all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'nombre', 'apellido', 'CI', 'telefono',
        'persona_relacionada__nombre', 'persona_relacionada__apellido', 'persona_relacionada__CI'
    ]
    ordering_fields = [
        'parentesco', 'fecha_registro', 'apellido', 'persona_relacionada__apellido'
    ]
    ordering = ['-fecha_registro']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return FamiliaresListSerializer
        return FamiliaresSerializer
    
    def get_queryset(self):
        """
        Filtrar familiares por diferentes criterios
        """
        queryset = super().get_queryset()
        
        # Filtrar por estado del familiar
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado=estado)
        
        # Filtrar por parentesco
        parentesco = self.request.query_params.get('parentesco', None)
        if parentesco:
            queryset = queryset.filter(parentesco=parentesco)
        
        # Filtrar por persona relacionada específica
        persona_relacionada = self.request.query_params.get('persona_relacionada', None)
        if persona_relacionada:
            queryset = queryset.filter(persona_relacionada_id=persona_relacionada)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """
        Crear familiar con subida de imagen a ImgBB
        """
        return self.handle_image_upload(request, super().create, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Actualizar familiar con subida de imagen a ImgBB
        """
        return self.handle_image_upload(request, super().update, *args, **kwargs)
    
    def handle_image_upload(self, request, action, *args, **kwargs):
        """
        Maneja la subida de imágenes a ImgBB API
        """
        imagen_file = request.FILES.get('imagen')
        
        if imagen_file:
            # Subir imagen a ImgBB
            url = "https://api.imgbb.com/1/upload"
            payload = {"key": settings.IMGBB_API_KEY}
            files = {"image": imagen_file.read()}
            
            response = requests.post(url, payload, files=files)
            
            if response.status_code == 200:
                # Extraer URL de la imagen subida
                image_url = response.json()["data"]["url"]
                
                # Actualizar los datos de la request con la URL de la imagen
                data = request.data.copy()
                data["imagen"] = image_url
                request._full_data = data
            else:
                return Response(
                    {"error": "Error al subir imagen a ImgBB"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            # Si no se sube nueva imagen en PUT/PATCH, mantener la existente
            if request.method in ["PUT", "PATCH"]:
                instance = self.get_object()
                data = request.data.copy()
                if not data.get("imagen"):
                    data["imagen"] = instance.imagen
                request._full_data = data
        
        return action(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def personas_disponibles(self, request):
        """
        Obtener personas de tipo P (propietarios) e I (inquilinos) para seleccionar como persona relacionada
        """
        personas = Persona.objects.filter(tipo__in=['P', 'I']).values(
            'id', 'nombre', 'apellido', 'CI', 'tipo'
        )
        
        # Agregar nombre_completo calculado
        personas_data = []
        for persona in personas:
            persona_data = dict(persona)
            persona_data['nombre_completo'] = f"{persona['nombre']} {persona['apellido']}"
            personas_data.append(persona_data)
        
        return Response(personas_data)


class VisitanteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para CRUD completo de visitantes con subida de imágenes a ImgBB
    """
    serializer_class = VisitanteSerializer
    queryset = Persona.objects.filter(tipo='V')
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'apellido', 'CI', 'telefono']
    ordering_fields = ['nombre', 'apellido', 'fecha_registro', 'CI']
    ordering = ['apellido', 'nombre']
    
    def perform_create(self, serializer):
        serializer.save(tipo='V')
    
    def perform_update(self, serializer):
        # Mantener el tipo como 'V' al actualizar
        serializer.save(tipo='V')
    
    def create(self, request, *args, **kwargs):
        """
        Crear visitante con subida de imagen a ImgBB
        """
        return self.handle_image_upload(request, super().create, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Actualizar visitante con subida de imagen a ImgBB
        """
        return self.handle_image_upload(request, super().update, *args, **kwargs)
    
    def handle_image_upload(self, request, action, *args, **kwargs):
        """
        Maneja la subida de imágenes a ImgBB API
        """
        imagen_file = request.FILES.get('imagen')
        
        if imagen_file:
            # Subir imagen a ImgBB
            url = "https://api.imgbb.com/1/upload"
            payload = {"key": settings.IMGBB_API_KEY}
            files = {"image": imagen_file.read()}
            
            response = requests.post(url, payload, files=files)
            
            if response.status_code == 200:
                # Extraer URL de la imagen subida
                image_url = response.json()["data"]["url"]
                
                # Actualizar los datos de la request con la URL de la imagen
                data = request.data.copy()
                data["imagen"] = image_url
                request._full_data = data
            else:
                return Response(
                    {"error": "Error al subir imagen a ImgBB"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            # Si no se sube nueva imagen en PUT/PATCH, mantener la existente
            if request.method in ["PUT", "PATCH"]:
                instance = self.get_object()
                data = request.data.copy()
                if not data.get("imagen"):
                    data["imagen"] = instance.imagen
                request._full_data = data
        
        return action(request, *args, **kwargs)

class AreaViewSet(viewsets.ModelViewSet):
    serializer_class = AreaSerializer
    queryset = AreasComunes.objects.all()

class ReservaAreaComunViewSet(viewsets.ModelViewSet):
    serializer_class = ReservaAreaComunSerializer
    permission_classes = [permissions.IsAuthenticated]

    def es_administrador(self, user):
        """
        Método auxiliar para verificar si el usuario es Admin.
        Verifica si está en el grupo 'Administrador' o si es Superusuario.
        """
        return user.groups.filter(name='administrador').exists() or user.is_superuser

    def get_queryset(self):
        """
        Filtrado de reservas:
        - Admin: Ve TODO.
        - Propietario/Inquilino: Ve solo SU historial.
        """
        user = self.request.user

        if self.es_administrador(user):
            # El administrador ve todas las reservas para gestionarlas
            return ReservaAreaComun.objects.all()
        
        # Si no es admin, debe tener una Persona asociada
        if hasattr(user, 'persona'):
            return ReservaAreaComun.objects.filter(persona=user.persona)
        
        # Si es un usuario sin rol y sin persona, no ve nada
        return ReservaAreaComun.objects.none()

    def perform_create(self, serializer):
        """
        Creación de reserva:
        - Admin: Puede reservar a nombre de CUALQUIER persona (debe enviar el ID).
        - Propietario: Se le asigna automáticamente su propia Persona.
        """
        user = self.request.user

        if self.es_administrador(user):
            # CASO ADMIN:
            # Confiamos en el 'persona' que viene en el body del request.
            # El serializer ya validó que el ID enviado exista.
            serializer.save()
        else:
            # CASO PROPIETARIO:
            # Verificamos que tenga perfil de persona
            if not hasattr(user, 'persona'):
                raise ValidationError("Tu usuario no tiene un perfil de residente asociado.")
            
            # Forzamos que la reserva sea para él mismo, ignorando lo que envíe en el JSON
            serializer.save(persona=user.persona)

    def destroy(self, request, *args, **kwargs):
        """
        Eliminación:
        - Admin: Puede borrar cualquier reserva.
        - Propietario: Solo puede borrar si está PENDIENTE.
        """
        instance = self.get_object()
        user = request.user

        # Si NO es administrador, aplicamos restricciones
        if not self.es_administrador(user):
            # 1. Verificar que la reserva sea suya (por seguridad extra)
            if instance.persona.user != user:
                raise PermissionDenied("No puedes eliminar una reserva que no es tuya.")

            # 2. Verificar estado
            if instance.estado_reserva != 'PENDIENTE':
                return Response(
                    {"error": "Solo puedes cancelar reservas que aún están pendientes. Contacta a administración."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return super().destroy(request, *args, **kwargs)
