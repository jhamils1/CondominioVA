from rest_framework import status, viewsets, filters, generics
from django.contrib.auth.models import User, Group, Permission
from django.db.models import Q, Count, Avg, Sum
from django.db.models import ProtectedError
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from .serializers.serializersUser import UserSerializer, GroupAuxSerializer
from .serializers.serializersRol import RolSerializer, RolListSerializer, PermissionSerializer
from .serializers.serializersPersona import PersonaSerializer
from .serializers.serializersEmpleado import CargoSerializer, EmpleadoSerializer, EmpleadoListSerializer
from .models import Persona, Cargo, Empleado
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
import requests
from django.conf import settings
from core.luxand import add_person, add_face, recognize


# Create your views here.
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist() 
            return Response({"message": "Logout exitoso"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {"detail": "No se puede eliminar este usuario porque está asociado a otros registros"},
                status=status.HTTP_400_BAD_REQUEST
            )

class GroupAuxViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupAuxSerializer

class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer

class RolViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return RolListSerializer  
        return RolSerializer          


# ==================== VISTAS PARA GESTIONAR PERSONAS ====================

class PersonaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar personas con subida de imágenes a ImgBB
    """
    queryset = Persona.objects.all()
    serializer_class = PersonaSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'apellido', 'CI', 'telefono']
    ordering_fields = ['nombre', 'apellido', 'fecha_registro', 'CI']
    ordering = ['apellido', 'nombre']
    
    def get_queryset(self):
        """
        Filtrar por tipo de persona si se especifica
        """
        queryset = super().get_queryset()
        tipo = self.request.query_params.get('tipo', None)
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        return queryset
    
    def create(self, request, *args, **kwargs):
        """
        Crear persona con subida de imagen a ImgBB
        """
        return self.handle_image_upload(request, super().create, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Actualizar persona con subida de imagen a ImgBB
        """
        return self.handle_image_upload(request, super().update, *args, **kwargs)
    
    def handle_image_upload(self, request, action, *args, **kwargs):
        """
        Maneja la subida de imágenes a ImgBB API
        """
        imagen_file = request.FILES.get('imagen')
        
        if imagen_file:
            try:
                # Leer el archivo una sola vez y resetear el puntero
                imagen_file.seek(0)
                file_content = imagen_file.read()
                imagen_file.seek(0)  # Resetear para que el serializer pueda leerlo
                
                # Subir imagen a ImgBB
                url = "https://api.imgbb.com/1/upload"
                payload = {"key": settings.IMGBB_API_KEY}
                files = {"image": file_content}
                
                response = requests.post(url, payload, files=files)
                
                if response.status_code == 200:
                    # Extraer URL de la imagen subida
                    image_url = response.json()["data"]["url"]
                    
                    # Actualizar los datos de la request con la URL de la imagen
                    data = request.data.copy()
                    data["imagen"] = image_url
                    # Remover el archivo de FILES para evitar problemas de serialización
                    request._files = {}
                    request._full_data = data
                else:
                    return Response(
                        {"error": "Error al subir imagen a ImgBB"}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            except Exception as e:
                return Response(
                    {"error": f"Error al procesar imagen: {str(e)}"}, 
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
    
    def perform_create(self, serializer):
        instance = serializer.save()
        self._enroll_luxand(instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        self._enroll_luxand(instance)

    def _enroll_luxand(self, persona: Persona):
        # Solo si hay imagen (URL ImgBB) y aún no fue enrolada
        if not persona.imagen or persona.luxand_uuid:
            return
        try:
            full_name = f"{persona.nombre} {persona.apellido}".strip() or f"persona-{persona.pk}"
            col = getattr(settings, "LUXAND_COLLECTION", "")
            res = add_person(full_name, persona.imagen, col)
            uuid = res.get("uuid")
            if uuid:
                persona.luxand_uuid = uuid
                persona.save(update_fields=["luxand_uuid"])
        except Exception as e:
            # No rompemos el CRUD si falla Luxand (cuota/red/imagen inválida)
            print(f"[Luxand] No se pudo enrolar Persona {persona.pk}: {e}")

    @action(detail=False, methods=["post"])
    def reconocimiento_facial(self, request):
        """
        Reconocimiento facial que acepta tanto image_url como archivo de imagen.
        COMPATIBLE CON WEB Y MÓVIL.
        """
        image_url = request.data.get("image_url")
        image_file = request.FILES.get("image")
        
        # Debug logs
        print(f"=== DEBUG RECONOCIMIENTO FACIAL ===")
        print(f"image_url recibido: {image_url}")
        print(f"image_file recibido: {image_file}")
        
        # Validar que se proporcione al menos una imagen
        if not image_url and not image_file:
            return Response({"detail": "image_url o image es requerido"}, status=400)
        
        umbral = float(request.data.get("umbral", 0.50))
        gallery = getattr(settings, "LUXAND_COLLECTION", "")
        
        try:
            # CASO 1: Si viene image_url (WEB) - FUNCIONA EXACTAMENTE IGUAL QUE ANTES
            if image_url and not image_file:
                print("DEBUG - Modo WEB: Usando image_url directamente")
                # Llamar a Luxand directamente con la URL
                luxand_url = "https://api.luxand.cloud/photo/search/v2"
                luxand_headers = {"token": settings.LUXAND_TOKEN}
                luxand_data = {
                    "photo": image_url,
                    "gallery": gallery
                }
                
                luxand_response = requests.post(luxand_url, headers=luxand_headers, data=luxand_data, timeout=30)
                
                if luxand_response.status_code != 200:
                    return Response({"detail": f"Error en Luxand: {luxand_response.text}"}, status=500)
                
                res = luxand_response.json()
            
            # CASO 2: Si viene archivo (MÓVIL) - NUEVA FUNCIONALIDAD
            elif image_file:
                print("DEBUG - Modo MÓVIL: Subiendo archivo a ImgBB")
                # Subir imagen a ImgBB
                url = "https://api.imgbb.com/1/upload"
                payload = {"key": settings.IMGBB_API_KEY}
                files = {"image": image_file}
                
                response = requests.post(url, payload, files=files)
                print(f"DEBUG - ImgBB response status: {response.status_code}")
                
                if response.status_code == 200:
                    image_url = response.json()["data"]["url"]
                    print(f"DEBUG - ImgBB URL obtenida: {image_url}")
                    
                    # Llamar a Luxand directamente con la URL
                    luxand_url = "https://api.luxand.cloud/photo/search/v2"
                    luxand_headers = {"token": settings.LUXAND_TOKEN}
                    luxand_data = {
                        "photo": image_url,
                        "gallery": gallery
                    }
                    
                    luxand_response = requests.post(luxand_url, headers=luxand_headers, data=luxand_data, timeout=30)
                    
                    if luxand_response.status_code != 200:
                        return Response({"detail": f"Error en Luxand: {luxand_response.text}"}, status=500)
                    
                    res = luxand_response.json()
                else:
                    print(f"DEBUG - Error ImgBB: {response.text}")
                    return Response({"detail": "Error al subir imagen a ImgBB"}, status=500)
            
            # CASO 3: Si vienen ambos (no debería pasar, pero por seguridad)
            else:
                print("DEBUG - Ambos parámetros presentes, usando image_url")
                luxand_url = "https://api.luxand.cloud/photo/search/v2"
                luxand_headers = {"token": settings.LUXAND_TOKEN}
                luxand_data = {
                    "photo": image_url,
                    "gallery": gallery
                }
                
                luxand_response = requests.post(luxand_url, headers=luxand_headers, data=luxand_data, timeout=30)
                
                if luxand_response.status_code != 200:
                    return Response({"detail": f"Error en Luxand: {luxand_response.text}"}, status=500)
                
                res = luxand_response.json()
            
            # PROCESAR RESPUESTA - MANEJAR TANTO LISTA COMO DICCIONARIO
            print(f"DEBUG - Tipo de respuesta: {type(res)}")
            print(f"DEBUG - Contenido de respuesta: {res}")
            
            # Si res es una lista, usar directamente
            if isinstance(res, list):
                candidates = res
            else:
                # Si res es un diccionario, extraer candidates
                candidates = (
                    res.get("candidates")
                    or res.get("matches")
                    or res.get("result", {}).get("candidates")
                    or []
                )
            
            if not candidates:
                return Response({"ok": False, "reason": "sin_coincidencias", "raw": res})
            
            best = candidates[0]
            uuid = best.get("uuid") or best.get("subject") or best.get("person_uuid")
            sim = best.get("similarity") or best.get("confidence") or best.get("probability") or 0.0
            
            print(f"DEBUG - Best candidate: {best}")
            print(f"DEBUG - UUID: {uuid}")
            print(f"DEBUG - Similarity before normalization: {sim}")
            
            # Normalizar similitud si viene 0..100
            if isinstance(sim, (int, float)) and sim > 1.0:
                sim = sim / 100.0
            
            print(f"DEBUG - Similarity after normalization: {sim}")
            print(f"DEBUG - Threshold: {umbral}")
            
            persona = None
            if uuid:
                persona = Persona.objects.filter(luxand_uuid=uuid).first()
                print(f"DEBUG - Persona found: {persona}")
            
            # Lógica más permisiva: si la confianza es muy alta (>= 0.9), ser más flexible
            if sim >= 0.9:
                # Con muy alta confianza, aceptar incluso si no encuentra la persona exacta
                ok = True
                print(f"DEBUG - Alta confianza detectada ({sim:.3f} >= 0.9), aceptando reconocimiento")
            else:
                # Lógica normal para confianza media/baja
                ok = bool(persona) and sim >= umbral
                print(f"DEBUG - Confianza normal ({sim:.3f} < 0.9), verificando persona y umbral")
            
            print(f"DEBUG - OK result: {ok} (persona: {bool(persona)}, sim >= umbral: {sim >= umbral})")
            
            return Response({
                "ok": ok,
                "persona_id": persona.id if persona else None,
                "similaridad": round(float(sim), 4),
                "uuid": uuid,
                "nombre": persona.nombre_completo if persona else None,
                "tipo": persona.tipo if persona else None,
                "raw": res
            })
            
        except Exception as e:
            print(f"DEBUG - Error general: {e}")
            return Response({"detail": f"Error en reconocimiento: {e}"}, status=500)

    @action(detail=True, methods=["post"])
    def agregar_foto(self, request, pk=None):
        """
        (Opcional) Sube fotos extra de la misma persona para mejorar precisión.
        Body: { "image_url": "https://..." }
        """
        persona = self.get_object()
        if not persona.luxand_uuid:
            return Response({"detail": "La Persona aún no está enrolada en Luxand."}, status=400)
        image_url = request.data.get("image_url")
        if not image_url:
            return Response({"detail": "image_url es requerido"}, status=400)
        try:
            res = add_face(persona.luxand_uuid, image_url)
            return Response({"ok": True, "raw": res})
        except Exception as e:
            return Response({"detail": f"Error al agregar foto: {e}"}, status=500)


# ==================== VISTAS PARA GESTIONAR EMPLEADOS ====================

class CargoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar cargos
    """
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre']
    ordering_fields = ['nombre']
    ordering = ['nombre']


class EmpleadoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar empleados con subida de imágenes a ImgBB
    """
    queryset = Empleado.objects.select_related('cargo').all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'nombre', 'apellido', 'CI', 'cargo__nombre'
    ]
    ordering_fields = [
        'apellido', 'nombre', 'sueldo', 'estado'
    ]
    ordering = ['apellido', 'nombre']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EmpleadoListSerializer
        return EmpleadoSerializer
    
    def get_queryset(self):
        """
        Filtrar empleados por diferentes criterios
        """
        queryset = super().get_queryset()
        
        # Filtrar por estado del empleado
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado=estado)
        
        # Filtrar por cargo
        cargo = self.request.query_params.get('cargo', None)
        if cargo:
            queryset = queryset.filter(cargo_id=cargo)
        
        # Filtrar por rango de sueldo
        sueldo_min = self.request.query_params.get('sueldo_min', None)
        sueldo_max = self.request.query_params.get('sueldo_max', None)
        if sueldo_min:
            queryset = queryset.filter(sueldo__gte=sueldo_min)
        if sueldo_max:
            queryset = queryset.filter(sueldo__lte=sueldo_max)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """
        Crear empleado con subida de imagen a ImgBB
        """
        return self.handle_image_upload(request, super().create, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Actualizar empleado con subida de imagen a ImgBB
        """
        return self.handle_image_upload(request, super().update, *args, **kwargs)
    
    def handle_image_upload(self, request, action, *args, **kwargs):
        """
        Maneja la subida de imágenes a ImgBB API
        """
        imagen_file = request.FILES.get('imagen')
        
        if imagen_file:
            try:
                # Leer el archivo una sola vez y resetear el puntero
                imagen_file.seek(0)
                file_content = imagen_file.read()
                imagen_file.seek(0)  # Resetear para que el serializer pueda leerlo
                
                # Subir imagen a ImgBB
                url = "https://api.imgbb.com/1/upload"
                payload = {"key": settings.IMGBB_API_KEY}
                files = {"image": file_content}
                
                response = requests.post(url, payload, files=files)
                
                if response.status_code == 200:
                    # Extraer URL de la imagen subida
                    image_url = response.json()["data"]["url"]
                    
                    # Actualizar los datos de la request con la URL de la imagen
                    data = request.data.copy()
                    data["imagen"] = image_url
                    # Remover el archivo de FILES para evitar problemas de serialización
                    request._files = {}
                    request._full_data = data
                else:
                    return Response(
                        {"error": "Error al subir imagen a ImgBB"}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            except Exception as e:
                return Response(
                    {"error": f"Error al procesar imagen: {str(e)}"}, 
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
    def perform_create(self, serializer):
        instance = serializer.save()
        self._enroll_luxand_empleado(instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        self._enroll_luxand_empleado(instance)

    def _enroll_luxand_empleado(self, empleado: Empleado):
        # Solo si hay imagen (URL ImgBB) y aún no fue enrolado
        if not empleado.imagen or empleado.luxand_uuid:
            return
        try:
            full_name = f"{empleado.nombre} {empleado.apellido}".strip() or f"empleado-{empleado.pk}"
            # Puedes usar la MISMA colección que Persona (p.ej. settings.LUXAND_COLLECTION)
            # o una específica para empleados (p.ej. settings.LUXAND_COLLECTION_EMPLEADOS)
            col = getattr(settings, "LUXAND_COLLECTION_EMPLEADOS", getattr(settings, "LUXAND_COLLECTION", ""))
            res = add_person(full_name, empleado.imagen, col)
            uuid = res.get("uuid")
            if uuid:
                empleado.luxand_uuid = uuid
                empleado.save(update_fields=["luxand_uuid"])
        except Exception as e:
            print(f"[Luxand] No se pudo enrolar Empleado {empleado.pk}: {e}")
    @action(detail=True, methods=["post"])
    def agregar_foto(self, request, pk=None):
        """
        Agrega fotos extra del empleado. Body: { "image_url": "https://..." }
        """
        empleado = self.get_object()
        if not empleado.luxand_uuid:
            return Response({"detail": "El Empleado aún no está enrolado en Luxand."}, status=400)
        image_url = request.data.get("image_url")
        if not image_url:
            return Response({"detail": "image_url es requerido"}, status=400)
        try:
            res = add_face(empleado.luxand_uuid, image_url)
            return Response({"ok": True, "raw": res})
        except Exception as e:
            return Response({"detail": f"Error al agregar foto: {e}"}, status=500)



@method_decorator(csrf_exempt, name='dispatch')
class CustomTokenObtainPairView(TokenObtainPairView):
    authentication_classes = []
    permission_classes = [AllowAny]

@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFTokenView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({ "detail": "CSRF cookie set" })