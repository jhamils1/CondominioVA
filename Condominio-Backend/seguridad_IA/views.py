import time, requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from .models import LecturaPlaca
from .serializers.serializersPlaca import LecturaPlacaSerializer
from residencial.modelsVehiculo import Vehiculo
from administracion.models import Persona, Empleado
from core.luxand import recognize, add_person
from administracion.access import AdministratorOnly, SecurityOperator

PLATE_URL = "https://api.platerecognizer.com/v1/plate-reader/"

class AlprScanView(APIView):
    permission_classes = [SecurityOperator]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        token = settings.PLATE_TOKEN
        if not token:
            return Response({"error": "Configura PLATE_TOKEN"}, status=500)

        f = request.FILES.get("upload")
        if not f:
            return Response({"error": "Debes enviar el archivo en 'upload'."}, status=400)
        if not getattr(f, "content_type", "").startswith("image/"):
            return Response({"error": "El archivo debe ser una imagen."}, status=400)

        camera_id = request.data.get("camera_id", "") or ""
        regions   = request.data.get("regions") or settings.PLATE_REGIONS

        headers = {"Authorization": f"Token {token}"}
        payload = {"regions": regions}
        if camera_id:
            payload["camera_id"] = camera_id

        files = {"upload": (getattr(f, "name", "frame.jpg"), f, getattr(f, "content_type", "image/jpeg"))}
        try:
            f.seek(0)
            r = requests.post(PLATE_URL, headers=headers, data=payload, files=files, timeout=20)
            if r.status_code == 429:
                time.sleep(1)
                f.seek(0)
                r = requests.post(PLATE_URL, headers=headers, data=payload, files=files, timeout=20)
        except requests.RequestException as e:
            return Response({"error": "No se pudo contactar al ALPR", "detail": str(e)}, status=502)

        # 🔧 ACEPTAR 200/201 COMO ÉXITO
        if r.status_code not in (200, 201):
            return Response({"error": "ALPR no respondió OK", "status_code": r.status_code, "detail": r.text}, status=r.status_code)

        js = r.json()
        results = js.get("results", [])

        if not results:
            l = LecturaPlaca.objects.create(placa="", score=0.0, camera_id=camera_id, image_url=None, vehiculo=None, match=False)
            return Response({
                "status": "no-plate-found",
                "plate": None, "score": None, "match": False,
                "vehiculo": None,
                "lectura": LecturaPlacaSerializer(l).data
            }, status=200)

        best      = max(results, key=lambda x: x.get("score", 0) or 0.0)
        plate_raw = (best.get("plate") or "").upper()
        score     = float(best.get("score") or 0.0)

        v_match = (Vehiculo.objects.filter(placa__iexact=plate_raw)   # BD ya normalizada
                .select_related("persona")
                .first())

        lectura = LecturaPlaca.objects.create(
            placa=plate_raw, score=score, camera_id=camera_id,
            image_url=None, vehiculo=v_match, match=bool(v_match)
        )

        from residencial.serializers.serializersVehiculo import VehiculoSerializer
        return Response({
            "status": "ok",
            "plate": plate_raw,
            "score": score,
            "match": bool(v_match),
            "vehiculo": VehiculoSerializer(v_match).data if v_match else None,
            "lectura": LecturaPlacaSerializer(lectura).data
        }, status=200)


def _norm(sim):
    try:
        sim = float(sim or 0.0)
    except:
        sim = 0.0
    return sim / 100.0 if sim > 1.0 else sim


class ReconocimientoGlobalView(APIView):
    permission_classes = [SecurityOperator]
    """
    Reconoce a una persona (residente) o a un empleado en una sola llamada.
    Body:
      - image_url (str)  ó  image_file (multipart)
      - umbral   (float, default=0.80)
    Respuesta:
      { ok, tipo, id, nombre, similaridad, uuid }
    """
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def post(self, request, *args, **kwargs):
        umbral = float(request.data.get("umbral", 0.80))
        image_url = request.data.get("image_url")
        image_file = request.FILES.get("image_file")

        if not image_url and not image_file:
            return Response({"detail": "Proporcione image_url o image_file"}, status=400)

        # Opción A: una sola colección para todo (recomendado)
        gallery = getattr(settings, "LUXAND_COLLECTION", "")

        try:
            # Validar formato de imagen si es archivo
            if image_file:
                if not image_file.content_type.startswith('image/'):
                    return Response({"detail": "El archivo debe ser una imagen"}, status=400)
                if image_file.size > 10 * 1024 * 1024:  # 10MB
                    return Response({"detail": "La imagen es demasiado grande (máximo 10MB)"}, status=400)

            fuente = image_url if image_url else image_file
            
            # Intentar reconocimiento con retry en caso de errores temporales
            max_retries = 3
            retry_delay = 2  # segundos
            
            for attempt in range(max_retries):
                try:
                    res = recognize(fuente, gallery=gallery)
                    break  # Si es exitoso, salir del loop
                except ValueError as e:
                    error_msg = str(e)
                    
                    # Si es un error 503 o 429, intentar de nuevo después de un delay
                    if ("503" in error_msg or "429" in error_msg or "timeout" in error_msg.lower()) and attempt < max_retries - 1:
                        import time
                        time.sleep(retry_delay)
                        retry_delay *= 2  # Exponential backoff
                        continue
                    else:
                        # Si no es un error temporal o ya se agotaron los intentos, re-lanzar el error
                        raise e
            
            # Verificar si hay error en la respuesta de Luxand
            if isinstance(res, dict) and "error" in res:
                return Response({
                    "ok": False, 
                    "reason": "error_luxand", 
                    "detail": res.get("error", "Error desconocido de Luxand")
                }, status=400)

            # Handle response structure according to Luxand documentation
            # The response should contain a list of candidates directly
            candidates = []
            if isinstance(res, list):
                # If response is directly a list of candidates
                candidates = res
            elif isinstance(res, dict):
                # If response is a dict, look for candidates in common fields
                candidates = (
                    res.get("candidates", [])
                    or res.get("matches", [])
                    or res.get("result", [])
                    or []
                )
                # If result is a dict, try to get candidates from it
                if isinstance(candidates, dict):
                    candidates = candidates.get("candidates", [])
            
            if not candidates:
                return Response({
                    "ok": False, 
                    "reason": "sin_coincidencias", 
                    "detail": "No se encontraron coincidencias en la base de datos"
                })

            # Ensure candidates is a list and has at least one item
            if not isinstance(candidates, list) or len(candidates) == 0:
                return Response({
                    "ok": False, 
                    "reason": "sin_coincidencias", 
                    "detail": "No se encontraron coincidencias válidas en la respuesta"
                })
            
            best = candidates[0]
            # Ensure best is a dictionary
            if not isinstance(best, dict):
                return Response({
                    "ok": False, 
                    "reason": "formato_invalido", 
                    "detail": "Formato de respuesta inválido de Luxand API"
                })
            
            # Extract UUID and similarity according to Luxand documentation
            # Luxand returns: uuid, probability, name, etc.
            uuid = best.get("uuid") or best.get("subject") or best.get("person_uuid")
            sim = _norm(best.get("probability") or best.get("similarity") or best.get("confidence") or best.get("score"))

            tipo = None
            obj = None
            if uuid:
                obj = Persona.objects.filter(luxand_uuid=uuid).first()
                if obj:
                    tipo = "persona"
                else:
                    obj = Empleado.objects.filter(luxand_uuid=uuid).first()
                    if obj:
                        tipo = "empleado"

            ok = bool(obj) and sim >= umbral
            nombre = f"{getattr(obj, 'nombre', '')} {getattr(obj, 'apellido', '')}".strip() if obj else None
            
            return Response({
                "ok": ok,
                "tipo": tipo,
                "id": getattr(obj, "id", None),
                "nombre": nombre,
                "similaridad": round(sim, 4),
                "uuid": uuid,
                "umbral": umbral,
                "raw": res  # quítalo en producción si no lo necesitas
            })
            
        except ValueError as e:
            # Errores específicos de Luxand API
            return Response({"detail": f"Error de API Luxand: {e}"}, status=400)
        except requests.RequestException as e:
            # Errores de conexión
            return Response({"detail": f"Error de conexión con Luxand: {e}"}, status=503)
        except Exception as e:
            # Otros errores
            return Response({"detail": f"Error interno: {e}"}, status=500)


class EnrolarPersonaView(APIView):
    permission_classes = [AdministratorOnly]
    """
    Enrola una persona en Luxand (registra su foto para reconocimiento futuro).
    Body:
      - persona_id (int) o empleado_id (int) - ID de la persona a enrolar
      - image_url (str) ó image_file (multipart) - Foto de la persona
    Respuesta:
      { ok, uuid, nombre, mensaje }
    """
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def post(self, request, *args, **kwargs):
        persona_id = request.data.get("persona_id")
        empleado_id = request.data.get("empleado_id")
        image_url = request.data.get("image_url")
        image_file = request.FILES.get("image_file")

        if not persona_id and not empleado_id:
            return Response({"detail": "Proporcione persona_id o empleado_id"}, status=400)
        
        if not image_url and not image_file:
            return Response({"detail": "Proporcione image_url o image_file"}, status=400)

        try:
            # Buscar la persona o empleado
            obj = None
            tipo = None
            
            if persona_id:
                obj = Persona.objects.filter(id=persona_id).first()
                tipo = "persona"
            else:
                obj = Empleado.objects.filter(id=empleado_id).first()
                tipo = "empleado"
            
            if not obj:
                return Response({"detail": f"{tipo.capitalize()} no encontrado"}, status=404)
            
            if obj.luxand_uuid:
                return Response({"detail": f"{tipo.capitalize()} ya está enrolado en Luxand"}, status=400)

            # Validar imagen
            if image_file:
                if not image_file.content_type.startswith('image/'):
                    return Response({"detail": "El archivo debe ser una imagen válida"}, status=400)
                if image_file.size > 10 * 1024 * 1024:  # 10MB
                    return Response({"detail": "La imagen es demasiado grande (máximo 10MB)"}, status=400)
                if image_file.size < 1024:  # 1KB mínimo
                    return Response({"detail": "La imagen es demasiado pequeña"}, status=400)

            # Enrolar en Luxand
            nombre_completo = f"{obj.nombre} {obj.apellido}"
            fuente = image_url if image_url else image_file
            
            gallery = getattr(settings, "LUXAND_COLLECTION", "")
            res = add_person(nombre_completo, fuente, collections=gallery)
            
            # Verificar si el enrolamiento fue exitoso
            if res.get("status") == "failure":
                error_msg = res.get("message", "Error desconocido de Luxand")
                if "Can't find faces" in error_msg:
                    return Response({
                        "detail": "No se detectó una cara en la imagen. Asegúrate de que la imagen muestre claramente el rostro de la persona, con buena iluminación y resolución."
                    }, status=400)
                else:
                    return Response({
                        "detail": f"Error de Luxand: {error_msg}"
                    }, status=400)
            
            uuid = res.get("uuid")
            if not uuid:
                return Response({"detail": "Error al obtener UUID de Luxand"}, status=500)
            
            # Guardar UUID en la base de datos
            obj.luxand_uuid = uuid
            obj.save()
            
            return Response({
                "ok": True,
                "uuid": uuid,
                "nombre": nombre_completo,
                "tipo": tipo,
                "mensaje": f"{tipo.capitalize()} enrolado exitosamente"
            })
            
        except Exception as e:
            return Response({"detail": f"Error al enrolar: {e}"}, status=500)


class VerificarEnrolamientoView(APIView):
    permission_classes = [AdministratorOnly]
    """
    Verifica el estado de enrolamiento de personas y empleados.
    Útil para debugging.
    """
    def get(self, request, *args, **kwargs):
        try:
            # Obtener todas las personas con luxand_uuid
            personas_enroladas = Persona.objects.filter(luxand_uuid__isnull=False).values(
                'id', 'nombre', 'apellido', 'luxand_uuid', 'tipo'
            )
            
            empleados_enrolados = Empleado.objects.filter(luxand_uuid__isnull=False).values(
                'id', 'nombre', 'apellido', 'luxand_uuid', 'cargo__nombre'
            )
            
            return Response({
                "personas_enroladas": list(personas_enroladas),
                "empleados_enrolados": list(empleados_enrolados),
                "total_personas": personas_enroladas.count(),
                "total_empleados": empleados_enrolados.count(),
                "gallery_config": getattr(settings, "LUXAND_COLLECTION", "")
            })
            
        except Exception as e:
            return Response({"detail": f"Error al verificar enrolamiento: {e}"}, status=500)


class VerificarLuxandAPIView(APIView):
    permission_classes = [AdministratorOnly]
    """
    Verifica el estado de la API de Luxand.
    Útil para debugging de problemas de conectividad.
    """
    def get(self, request, *args, **kwargs):
        try:
            import requests
            from django.conf import settings
            
            # Verificar configuración
            token = getattr(settings, "LUXAND_TOKEN", "")
            collection = getattr(settings, "LUXAND_COLLECTION", "")
            
            if not token:
                return Response({
                    "status": "error",
                    "message": "LUXAND_TOKEN no configurado"
                }, status=500)
            
            # Intentar una petición simple a Luxand
            headers = {"token": token}
            url = "https://api.luxand.cloud/v2/person"
            
            try:
                # Hacer una petición GET para verificar conectividad
                response = requests.get(url, headers=headers, timeout=10)
                
                return Response({
                    "status": "success" if response.status_code == 200 else "error",
                    "luxand_status_code": response.status_code,
                    "luxand_response": response.text[:200] if response.text else "No response body",
                    "token_configured": bool(token),
                    "collection_configured": collection,
                    "api_url": url
                })
                
            except requests.exceptions.Timeout:
                return Response({
                    "status": "error",
                    "message": "Timeout conectando a Luxand API",
                    "token_configured": bool(token),
                    "collection_configured": collection
                }, status=503)
                
            except requests.exceptions.ConnectionError:
                return Response({
                    "status": "error", 
                    "message": "No se puede conectar a Luxand API",
                    "token_configured": bool(token),
                    "collection_configured": collection
                }, status=503)
                
            except Exception as e:
                return Response({
                    "status": "error",
                    "message": f"Error verificando Luxand API: {e}",
                    "token_configured": bool(token),
                    "collection_configured": collection
                }, status=500)
                
        except Exception as e:
            return Response({"detail": f"Error interno: {e}"}, status=500)


class ProbarLuxandView(APIView):
    permission_classes = [AdministratorOnly]
    """
    Prueba la funcionalidad de Luxand con una imagen de prueba.
    Útil para debugging y verificación.
    """
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def post(self, request, *args, **kwargs):
        try:
            image_file = request.FILES.get("image_file")
            image_url = request.data.get("image_url")
            
            if not image_file and not image_url:
                return Response({"detail": "Proporcione image_file o image_url"}, status=400)
            
            # Usar la función de reconocimiento directamente
            from core.luxand import recognize
            gallery = getattr(settings, "LUXAND_COLLECTION", "")
            
            fuente = image_url if image_url else image_file
            res = recognize(fuente, gallery=gallery)
            
            return Response({
                "status": "success",
                "gallery_used": gallery,
                "luxand_response": res,
                "response_type": str(type(res)),
                "message": "Prueba de Luxand completada"
            })
            
        except Exception as e:
            return Response({
                "status": "error",
                "detail": f"Error en prueba de Luxand: {e}",
                "gallery_used": getattr(settings, "LUXAND_COLLECTION", "")
            }, status=500)
