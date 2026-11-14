from django.contrib.admin.models import ADDITION, CHANGE
from django.db import transaction, IntegrityError
from collections.abc import Mapping
from urllib.parse import parse_qsl
from django.core.exceptions import ImproperlyConfigured
from django.conf import settings
from django.http import HttpResponse
import http.client
import json
import re
from rest_framework import serializers, viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from administracion.access import AdministratorOnly, SecurityOperator
from administracion.audit import record_action
from seguridad_IA.api_camara_demo import SoloConexionLocal
from .models import Camara, MonitorImou, FuncionesPropuestasCamara
from .imou import direccion_imou_configurada, estado_vinculo, credenciales_imou_local, ruta_imou_local
from .credenciales import cifrar_contrasena, descifrar_contrasena
from .prueba_rtsp import probar_rtsp
from .descubrimiento import descubrir
from .onvif import consultar_perfiles, ErrorOnvif
from .fuente_monitor import fuente_camara


class CamaraSerializer(serializers.ModelSerializer):
    vinculo_imou = serializers.SerializerMethodField()
    contrasena_nueva = serializers.CharField(write_only=True, required=False, trim_whitespace=False, max_length=512)
    eliminar_contrasena = serializers.BooleanField(write_only=True, required=False, default=False)
    contrasena_configurada = serializers.SerializerMethodField()
    monitor_en_catalogo = serializers.SerializerMethodField()
    class Meta:
        model = Camara
        fields = ['id', 'nombre', 'ubicacion', 'tipo', 'fabricante', 'modelo',
                  'direccion_ip', 'puerto_rtsp', 'usuario_dispositivo', 'ruta_rtsp',
                  'contrasena_nueva', 'eliminar_contrasena', 'contrasena_configurada',
                  'activa', 'creada', 'actualizada', 'vinculo_imou', 'monitor_en_catalogo']
        read_only_fields = ['id', 'creada', 'actualizada']

    def get_vinculo_imou(self, obj):
        return estado_vinculo(obj, self.context.get('imou_configurada'))

    def get_contrasena_configurada(self, obj):
        return bool(obj.contrasena_cifrada)

    def get_monitor_en_catalogo(self, obj):
        return MonitorImou.objects.filter(pk=1, camara_id=obj.pk).exists()

    def validate_ruta_rtsp(self, valor):
        if not valor:
            return valor
        if (not valor.startswith('/') or valor.startswith('//') or '@' in valor or '#' in valor
                or any(c.isspace() or ord(c) < 32 for c in valor)):
            raise serializers.ValidationError('Indica solo la ruta del flujo, sin dirección ni credenciales.')
        if '?' in valor:
            for clave, _ in parse_qsl(valor.split('?', 1)[1], keep_blank_values=True):
                if any(s in clave.casefold() for s in ('user', 'pass', 'token', 'secret', 'clave', 'auth')):
                    raise serializers.ValidationError('No incluyas credenciales en la ruta.')
        return valor

    def to_internal_value(self, data):
        if isinstance(data, Mapping) and set(data.keys()) - set(self.fields):
            raise serializers.ValidationError({'detail': 'Se incluyeron campos no admitidos. Esta etapa no guarda credenciales.'})
        return super().to_internal_value(data)

    def validate(self, data):
        tipo = data.get('tipo', getattr(self.instance, 'tipo', None))
        ip = data.get('direccion_ip', getattr(self.instance, 'direccion_ip', None))
        puerto = data.get('puerto_rtsp', getattr(self.instance, 'puerto_rtsp', None))
        usuario = data.get('usuario_dispositivo', getattr(self.instance, 'usuario_dispositivo', ''))
        ruta = data.get('ruta_rtsp', getattr(self.instance, 'ruta_rtsp', ''))
        nueva = data.pop('contrasena_nueva', None)
        eliminar = data.pop('eliminar_contrasena', False)
        anterior = bool(self.instance and self.instance.contrasena_cifrada)
        if nueva and eliminar:
            raise serializers.ValidationError({'detail': 'No se puede reemplazar y eliminar la contraseña a la vez.'})
        if tipo == 'RED' and (not ip or not puerto):
            raise serializers.ValidationError({'detail': 'Una cámara de red requiere dirección IPv4 y puerto RTSP.'})
        if tipo == 'LOCAL' and (ip or puerto):
            raise serializers.ValidationError({'detail': 'Una cámara local no utiliza dirección IP ni puerto RTSP.'})
        if tipo == 'LOCAL' and (usuario or ruta or nueva or (anterior and not eliminar)):
            raise serializers.ValidationError({'detail': 'Elimina las credenciales y la ruta de red antes de usar una cámara local.'})
        if puerto is not None and not 1 <= puerto <= 65535:
            raise serializers.ValidationError({'puerto_rtsp': 'Introduce un puerto entre 1 y 65535.'})
        if nueva:
            try:
                data['contrasena_cifrada'] = cifrar_contrasena(nueva)
            except ImproperlyConfigured:
                raise serializers.ValidationError({'detail': 'No está disponible el cifrado de credenciales de cámaras.'}) from None
        elif eliminar:
            data['contrasena_cifrada'] = None
        return data


class CamaraViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                    mixins.CreateModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Camara.objects.all()
    serializer_class = CamaraSerializer
    permission_classes = [AdministratorOnly]

    @action(detail=True, methods=['get', 'put'], url_path='funciones-propuestas')
    def funciones_propuestas(self, request, pk=None):
        """Guarda preferencias de diseño; no activa procesos ni cambia la Imou."""
        camara = self.get_object()
        if request.method == 'GET':
            config = FuncionesPropuestasCamara.objects.filter(camara=camara).first()
            return Response({'lectura_placas': config.lectura_placas if config else False,
                             'incidencias_zona': config.incidencias_zona if config else False,
                             'operativas': False})
        claves = {'lectura_placas', 'incidencias_zona'}
        if not isinstance(request.data, Mapping) or set(request.data) != claves or any(type(request.data[k]) is not bool for k in claves):
            return Response({'detail': 'Indica ambas funciones con valores booleanos.'}, status=400)
        with transaction.atomic():
            config, _ = FuncionesPropuestasCamara.objects.update_or_create(
                camara=camara, defaults={k: request.data[k] for k in claves})
            record_action(request.user, camara, 'Preferencias futuras de cámara modificadas.', CHANGE)
        return Response({'lectura_placas': config.lectura_placas,
                         'incidencias_zona': config.incidencias_zona, 'operativas': False})

    @action(detail=False, methods=['get'], url_path='disponibles-monitor',
            permission_classes=[AdministratorOnly, SoloConexionLocal])
    def disponibles_monitor(self, request):
        """Catálogo mínimo para visualizar: nunca expone direcciones ni accesos."""
        camaras = Camara.objects.filter(activa=True, tipo='RED').order_by('nombre', 'pk')
        vinculo = MonitorImou.objects.filter(pk=1).values_list('camara_id', flat=True).first()
        datos = [{'id': c.pk, 'nombre': c.nombre, 'ubicacion': c.ubicacion,
                  'es_imou_vinculada': c.pk == vinculo} for c in camaras]
        respuesta = Response(datos)
        respuesta['Cache-Control'] = 'private, no-store'
        return respuesta

    @action(detail=True, methods=['post'], url_path='fotograma-monitor',
            permission_classes=[AdministratorOnly, SoloConexionLocal])
    def fotograma_monitor(self, request, pk=None):
        camara = self.get_object()
        if MonitorImou.objects.filter(pk=1, camara=camara).exists():
            return Response({'detail': 'Usa el monitor Imou existente.'}, status=409)
        try:
            fuente = fuente_camara(camara)
            token = (settings.BASE_DIR / 'seguridad_vision' / 'recursos' / 'camaras_catalogo.token').read_text(encoding='ascii')
            if not re.fullmatch(r'[A-Za-z0-9_-]{43}', token):
                raise ValueError
            contenido = json.dumps({'id': camara.pk, 'fuente': fuente}, ensure_ascii=True).encode('utf-8')
            conexion = http.client.HTTPConnection('127.0.0.1', 28768, timeout=3)
            try:
                conexion.request('POST', '/fotograma', contenido, headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'})
                origen = conexion.getresponse()
                imagen = origen.read(1024 * 1024 + 1)
                codigo = origen.status
            finally:
                conexion.close()
            if codigo == 202:
                return HttpResponse(status=202, headers={'Cache-Control': 'private, no-store'})
            if codigo == 200 and 0 < len(imagen) <= 1024 * 1024 and imagen.startswith(b'\xff\xd8\xff'):
                return HttpResponse(imagen, content_type='image/jpeg', headers={'Cache-Control': 'private, no-store'})
        except (ImproperlyConfigured, OSError, UnicodeError, ValueError, http.client.HTTPException):
            pass
        return Response({'detail': 'No se pudo recibir imagen de la cámara.'}, status=503)

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'imou_configurada': direccion_imou_configurada()}

    @action(detail=False, methods=['post'], url_path='buscar-red', permission_classes=[AdministratorOnly, SoloConexionLocal])
    def buscar_red(self, request):
        estado, dispositivos = descubrir()
        respuesta = Response({'estado': estado, 'direcciones': [d['ip'] for d in dispositivos], 'dispositivos': dispositivos})
        respuesta['Cache-Control'] = 'private, no-store'
        return respuesta

    @action(detail=False, methods=['post'], url_path='consultar-onvif', permission_classes=[AdministratorOnly, SoloConexionLocal])
    def consultar_onvif(self, request):
        if set(request.data) != {'ip', 'puerto_onvif', 'usuario', 'contrasena'}:
            return Response({'detail': 'Revisa los datos de conexión ONVIF.'}, status=400)
        try:
            perfiles = consultar_perfiles(request.data['ip'], request.data['puerto_onvif'], request.data['usuario'], request.data['contrasena'])
        except ErrorOnvif:
            return Response({'detail': 'No se pudieron consultar los perfiles. Revisa la IP, el puerto ONVIF, las credenciales y la compatibilidad.'}, status=400)
        respuesta = Response({'perfiles': perfiles})
        respuesta['Cache-Control'] = 'private, no-store'
        return respuesta

    @action(detail=True, methods=['get', 'post'], url_path='acceso-local', permission_classes=[AdministratorOnly, SoloConexionLocal])
    def acceso_local(self, request, pk=None):
        camara = self.get_object()
        vinculo = estado_vinculo(camara, direccion_imou_configurada())
        catalogo = MonitorImou.objects.filter(pk=1, camara=camara).exists()
        if vinculo in ('vinculada', 'deshabilitada') and not catalogo:
            acceso = credenciales_imou_local()
            if acceso is None:
                return Response({'detail': 'No se pudo leer la configuración local de la cámara.'}, status=409)
            usuario, clave = acceso
        else:
            usuario = camara.usuario_dispositivo
            clave = None
            if request.method == 'POST' and camara.contrasena_cifrada:
                try:
                    clave = descifrar_contrasena(camara.contrasena_cifrada)
                except ImproperlyConfigured:
                    return Response({'detail': 'No se pudo recuperar la contraseña de la cámara.'}, status=409)
        if request.method == 'POST' and not clave:
            return Response({'detail': 'No hay contraseña guardada para esta cámara.'}, status=404)
        datos = {'usuario': usuario}
        if request.method == 'GET' and vinculo in ('vinculada', 'deshabilitada'):
            datos['ruta_rtsp_local'] = camara.ruta_rtsp if catalogo else ruta_imou_local()
        if request.method == 'POST':
            datos['contrasena'] = clave
        respuesta = Response(datos)
        respuesta['Cache-Control'] = 'private, no-store'
        return respuesta

    @action(detail=True, methods=['post'], url_path='vincular-monitor', permission_classes=[AdministratorOnly, SoloConexionLocal])
    def vincular_monitor(self, request, pk=None):
        camara = self.get_object()
        config = direccion_imou_configurada()
        if estado_vinculo(camara, config) != 'vinculada' or not config:
            return Response({'detail': 'Solo se puede vincular la Imou local existente y habilitada.'}, status=409)
        acceso, ruta = credenciales_imou_local(), ruta_imou_local()
        if not acceso or not ruta:
            return Response({'detail': 'No está completa la configuración local de Imou.'}, status=409)
        try:
            with transaction.atomic():
                actual = MonitorImou.objects.select_for_update().filter(pk=1).first()
                if actual:
                    return Response({'detail': 'Ya hay una cámara vinculada al monitor.'}, status=409)
                camara = Camara.objects.select_for_update().get(pk=camara.pk)
                if not camara.activa or camara.tipo != 'RED' or (camara.direccion_ip, camara.puerto_rtsp) != config:
                    return Response({'detail': 'La cámara cambió durante la operación; vuelve a intentar.'}, status=409)
                if camara.contrasena_cifrada or (camara.usuario_dispositivo and camara.usuario_dispositivo != acceso[0]) or (camara.ruta_rtsp and camara.ruta_rtsp != ruta):
                    return Response({'detail': 'El registro tiene datos de acceso propios; revísalos antes de vincularlo.'}, status=409)
                camara.usuario_dispositivo = acceso[0]
                camara.contrasena_cifrada = cifrar_contrasena(acceso[1])
                camara.ruta_rtsp = ruta
                camara.save(update_fields=['usuario_dispositivo', 'contrasena_cifrada', 'ruta_rtsp', 'actualizada'])
                MonitorImou.objects.create(pk=1, camara=camara)
                record_action(request.user, camara, 'Cámara local vinculada al monitor del catálogo.', CHANGE)
        except (ImproperlyConfigured, IntegrityError):
            return Response({'detail': 'No se pudo vincular el monitor; comprueba el cifrado y vuelve a intentar.'}, status=409)
        respuesta = Response(self.get_serializer(camara).data)
        respuesta['Cache-Control'] = 'private, no-store'
        return respuesta

    @action(detail=False, methods=['post'], url_path='registrar-imou', permission_classes=[AdministratorOnly, SoloConexionLocal])
    def registrar_imou(self, request):
        configurada = direccion_imou_configurada()
        if not configurada:
            return Response({'detail': 'No se encontró una configuración local válida de Imou.'}, status=409)
        with transaction.atomic():
            existentes = Camara.objects.filter(tipo='RED', direccion_ip=configurada[0], puerto_rtsp=configurada[1])
            if existentes.exists():
                return Response({'detail': 'Ya existe un registro con la dirección y el puerto de la Imou.'}, status=409)
            camara = Camara.objects.create(nombre='Cámara Imou', fabricante='Imou', tipo='RED',
                                            direccion_ip=configurada[0], puerto_rtsp=configurada[1])
            record_action(request.user, camara, 'Imou local agregada al catálogo.', ADDITION)
        response = Response(self.get_serializer(camara).data, status=201)
        response['Cache-Control'] = 'private, no-store'
        return response

    @action(detail=True, methods=['post'], url_path='probar-imou', permission_classes=[AdministratorOnly, SoloConexionLocal])
    def probar_imou(self, request, pk=None):
        camara = self.get_object()
        if estado_vinculo(camara, direccion_imou_configurada()) != 'vinculada':
            return Response({'estado': 'no_vinculada', 'detail': 'El registro debe coincidir de forma única con la Imou local y estar habilitado.'}, status=status.HTTP_409_CONFLICT)
        # El puente solo puede llamar al archivo local existente, nunca a la IP enviada por la web.
        from seguridad_IA.api_imou_local import obtener_fotograma
        codigo, _ = obtener_fotograma()
        estado = {200: 'disponible', 202: 'conectando'}.get(codigo, 'no_disponible')
        response = Response({'estado': estado})
        response['Cache-Control'] = 'private, no-store'
        return response

    @action(detail=True, methods=['post'], url_path='probar-red', permission_classes=[AdministratorOnly, SoloConexionLocal])
    def probar_red(self, request, pk=None):
        camara = self.get_object()
        if estado_vinculo(camara, direccion_imou_configurada()) != 'sin_vinculo':
            return Response({'estado': 'no_disponible'}, status=409)
        respuesta = Response({'estado': probar_rtsp(camara)})
        respuesta['Cache-Control'] = 'private, no-store'
        return respuesta

    @transaction.atomic
    def perform_create(self, serializer):
        instance = serializer.save()
        record_action(self.request.user, instance, 'Cámara registrada.', ADDITION)

    @transaction.atomic
    def perform_update(self, serializer):
        instance = serializer.save()
        record_action(self.request.user, instance, 'Configuración de cámara modificada.', CHANGE)
