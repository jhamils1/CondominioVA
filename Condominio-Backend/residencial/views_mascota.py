from rest_framework import status, viewsets, filters
from rest_framework.response import Response
from .models import Mascota
from .serializers.serializersMascota import MascotaSerializer, MascotaListSerializer
import requests
from django.conf import settings

class MascotaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para CRUD completo de mascotas con subida de imágenes a ImgBB
    """
    queryset = Mascota.objects.select_related('persona').all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'nombre', 'especie', 'raza', 'persona__nombre', 'persona__apellido', 'persona__CI'
    ]
    ordering_fields = [
        'nombre', 'especie', 'fecha_registro', 'persona__apellido'
    ]
    ordering = ['-fecha_registro']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MascotaListSerializer
        return MascotaSerializer
    
    def get_queryset(self):
        """
        Filtrar mascotas por diferentes criterios
        """
        queryset = super().get_queryset()
        
        # Filtrar por especie
        especie = self.request.query_params.get('especie', None)
        if especie:
            queryset = queryset.filter(especie=especie)
        
        # Filtrar por propietario específico
        persona = self.request.query_params.get('persona', None)
        if persona:
            queryset = queryset.filter(persona_id=persona)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """
        Crear mascota con subida de imagen a ImgBB
        """
        return self.handle_image_upload(request, super().create, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Actualizar mascota con subida de imagen a ImgBB
        """
        return self.handle_image_upload(request, super().update, *args, **kwargs)
    
    def handle_image_upload(self, request, action, *args, **kwargs):
        """
        Maneja la subida de imágenes a ImgBB API
        """
        imagen_file = request.FILES.get('foto')
        
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
                data["foto"] = image_url
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
                if not data.get("foto"):
                    data["foto"] = instance.foto
                request._full_data = data
        
        return action(request, *args, **kwargs)
