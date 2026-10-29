# vehiculo/views.py
import requests
from rest_framework import viewsets, status
from rest_framework.response import Response
from .serializers.serializersVehiculo import VehiculoSerializer, PersonaAuxSerializers
from .serializers.serializersBloque import BloqueSerializer
from .serializers.serializersUnidad import UnidadSerializer, BloqueAuxSerializer
from .serializers.serializersIncidente import IncidenteSerializer
from .modelsVehiculo import Vehiculo, Bloque, Unidad, incidente
from decouple import config
from .models import Persona
from django.conf import settings
from residencial.serializers.serializersObjetos import ObjetoPerdidoSerializer
from residencial.models import ObjetoPerdido


class VehiculoViewSet(viewsets.ModelViewSet):
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer

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
    
class personaAuxViewSet(viewsets.ModelViewSet):
    queryset = Persona.objects.all()
    serializer_class = PersonaAuxSerializers

class BloqueViewSet(viewsets.ModelViewSet):
    queryset = Bloque.objects.all()
    serializer_class = BloqueSerializer

class UnidadViewSet(viewsets.ModelViewSet):
    queryset = Unidad.objects.all()
    serializer_class = UnidadSerializer

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

class IncidenteViewSet(viewsets.ModelViewSet):
    queryset = incidente.objects.all()
    serializer_class = IncidenteSerializer

class ObjetoPerdidoViewSet(viewsets.ModelViewSet):
    queryset = ObjetoPerdido.objects.all()
    serializer_class = ObjetoPerdidoSerializer

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