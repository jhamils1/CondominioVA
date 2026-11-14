from unittest.mock import patch
from io import StringIO
from types import SimpleNamespace
from pathlib import Path
from tempfile import TemporaryDirectory
from django.contrib.auth import get_user_model
from django.contrib.admin.models import LogEntry
from django.test import TestCase
from django.test import override_settings
from django.urls import resolve
from rest_framework.test import APIRequestFactory, force_authenticate
from cryptography.fernet import Fernet
from .api import CamaraViewSet
from .credenciales import descifrar_contrasena
from .models import Camara, MonitorImou
from .prueba_rtsp import probar_rtsp


class CamarasTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='usuario-ficticio')
        self.factory = APIRequestFactory()
        self.datos = {'nombre': 'Entrada', 'tipo': 'RED', 'direccion_ip': '192.168.20.10', 'puerto_rtsp': 554}

    def test_funciones_propuestas_aisladas_y_solo_admin(self):
        camara = Camara.objects.create(**self.datos)
        otra = Camara.objects.create(nombre='Otra', tipo='LOCAL')
        def llamar(rol, metodo, datos=None, pk=None):
            request = getattr(self.factory, metodo)('/', datos or {}, format='json')
            force_authenticate(request, user=self.user)
            with patch('administracion.access.effective_role', return_value=rol):
                return CamaraViewSet.as_view({metodo: 'funciones_propuestas'})(request, pk=pk or camara.pk)
        self.assertEqual(llamar('administrador', 'get').data,
                         {'lectura_placas': False, 'incidencias_zona': False, 'operativas': False})
        datos = {'lectura_placas': True, 'incidencias_zona': True}
        self.assertEqual(llamar('guardia', 'put', datos).status_code, 403)
        self.assertEqual(llamar('administrador', 'put', {'lectura_placas': 'true', 'incidencias_zona': True}).status_code, 400)
        self.assertEqual(llamar('administrador', 'put', datos).status_code, 200)
        self.assertTrue(llamar('administrador', 'get').data['lectura_placas'])
        self.assertFalse(llamar('administrador', 'get', pk=otra.pk).data['lectura_placas'])
        camara.refresh_from_db()
        self.assertTrue(camara.activa)

    def test_catalogo_monitor_solo_operadores_locales_sin_credenciales(self):
        camara = Camara.objects.create(**self.datos, usuario_dispositivo='usuario-ficticio', ruta_rtsp='/flujo')
        Camara.objects.create(nombre='Deshabilitada', tipo='RED', direccion_ip='192.168.20.11', puerto_rtsp=554, activa=False)
        MonitorImou.objects.create(pk=1, camara=camara)
        def consultar(rol, ip='127.0.0.1'):
            request = self.factory.get('/api/camaras/disponibles-monitor/', REMOTE_ADDR=ip)
            force_authenticate(request, user=self.user)
            with patch('administracion.access.effective_role', return_value=rol):
                return resolve('/api/camaras/disponibles-monitor/').func(request)
        for rol in ('administrador',):
            respuesta = consultar(rol)
            self.assertEqual(respuesta.status_code, 200)
            self.assertEqual(respuesta.data, [{'id': camara.pk, 'nombre': 'Entrada', 'ubicacion': '', 'es_imou_vinculada': True}])
            self.assertIn('no-store', respuesta['Cache-Control'])
        self.assertEqual(consultar('guardia').status_code, 403)
        self.assertEqual(consultar('propietario').status_code, 403)
        self.assertEqual(consultar('guardia', '192.168.1.20').status_code, 403)

    @override_settings(CAMARAS_CLAVE_CIFRADO=Fernet.generate_key().decode())
    def test_fotograma_monitor_aisla_imou_y_autoriza_guardia_local(self):
        from .credenciales import cifrar_contrasena
        camara = Camara.objects.create(**self.datos, ruta_rtsp='/flujo', usuario_dispositivo='operador',
                                       contrasena_cifrada=cifrar_contrasena('clave-ficticia'))
        def solicitar(rol, ip='127.0.0.1'):
            request = self.factory.post('/fotograma/', REMOTE_ADDR=ip)
            force_authenticate(request, user=self.user)
            with patch('administracion.access.effective_role', return_value=rol):
                return resolve(f'/api/camaras/{camara.pk}/fotograma-monitor/').func(request, pk=camara.pk)
        conexion = SimpleNamespace(request=lambda *a, **k: None,
                                  getresponse=lambda: SimpleNamespace(status=200, read=lambda n: b'\xff\xd8\xffficticio'),
                                  close=lambda: None)
        with (patch('pathlib.Path.read_text', return_value='a' * 43),
              patch('camaras.api.http.client.HTTPConnection', return_value=conexion)):
            self.assertEqual(solicitar('administrador').status_code, 200)
            self.assertEqual(solicitar('guardia').status_code, 403)
            self.assertEqual(solicitar('propietario').status_code, 403)
            self.assertEqual(solicitar('guardia', '192.168.1.20').status_code, 403)
            MonitorImou.objects.create(pk=1, camara=camara)
            self.assertEqual(solicitar('administrador').status_code, 409)

    @override_settings(CAMARAS_CLAVE_CIFRADO=Fernet.generate_key().decode())
    def test_consultar_acceso_solo_admin_local_y_sin_cache(self):
        creada = self.llamar('administrador', datos={**self.datos, 'usuario_dispositivo': 'operador', 'contrasena_nueva': 'clave-ficticia'})
        pk = creada.data['id']
        self.assertNotIn('contrasena_nueva', creada.data)
        vista = resolve(f'/api/camaras/{pk}/acceso-local/').func
        def consultar(rol, metodo='post', ip='127.0.0.1'):
            request = getattr(self.factory, metodo)('/acceso/', REMOTE_ADDR=ip)
            force_authenticate(request, user=self.user)
            with patch('administracion.access.effective_role', return_value=rol):
                return vista(request, pk=pk)
        with patch('camaras.api.direccion_imou_configurada', return_value=None):
            respuesta = consultar('administrador')
            self.assertEqual(respuesta.status_code, 200)
            self.assertEqual(respuesta.data, {'usuario': 'operador', 'contrasena': 'clave-ficticia'})
            self.assertIn('no-store', respuesta['Cache-Control'])
            self.assertEqual(consultar('administrador', 'get').data, {'usuario': 'operador'})
            self.assertEqual(consultar('guardia').status_code, 403)
            self.assertEqual(consultar('administrador', ip='192.168.1.3').status_code, 403)

    def test_acceso_imou_usa_configuracion_local_solo_si_vinculo_es_unico(self):
        camara = Camara.objects.create(**self.datos)
        request = self.factory.post('/acceso/', REMOTE_ADDR='127.0.0.1')
        force_authenticate(request, user=self.user)
        with (patch('administracion.access.effective_role', return_value='administrador'),
              patch('camaras.api.direccion_imou_configurada', return_value=('192.168.20.10', 554)),
              patch('camaras.api.credenciales_imou_local', return_value=('usuario-ficticio', 'clave-ficticia')) as acceso):
            vista = resolve(f'/api/camaras/{camara.pk}/acceso-local/').func
            respuesta = vista(request, pk=camara.pk)
            self.assertEqual(respuesta.data['contrasena'], 'clave-ficticia')
            acceso.assert_called_once()

    def test_ruta_imou_desde_flujo_sin_credenciales(self):
        from .imou import ruta_imou_local
        with TemporaryDirectory() as carpeta, override_settings(BASE_DIR=Path(carpeta)):
            config = Path(carpeta) / 'seguridad_vision' / 'recursos' / 'imou.local.ini'
            config.parent.mkdir(parents=True)
            config.write_text('[camara]\nusuario=usuario-ficticio\nclave=clave-ficticia\nflujo=0\n', encoding='utf-8')
            self.assertEqual(ruta_imou_local(), '/cam/realmonitor?channel=1&subtype=0')
            config.write_text('[camara]\n', encoding='utf-8')
            self.assertEqual(ruta_imou_local(), '/cam/realmonitor?channel=1&subtype=1')
            config.write_text('[camara]\nflujo=9\n', encoding='utf-8')
            self.assertIsNone(ruta_imou_local())

    def test_ruta_imou_solo_admin_local_y_sin_password(self):
        camara = Camara.objects.create(**self.datos)
        def consultar(rol, ip='127.0.0.1'):
            request = self.factory.get('/acceso/', REMOTE_ADDR=ip)
            force_authenticate(request, user=self.user)
            with patch('administracion.access.effective_role', return_value=rol):
                return resolve(f'/api/camaras/{camara.pk}/acceso-local/').func(request, pk=camara.pk)
        with (patch('camaras.api.direccion_imou_configurada', return_value=('192.168.20.10', 554)),
              patch('camaras.api.credenciales_imou_local', return_value=('usuario', 'clave-ficticia')),
              patch('camaras.api.ruta_imou_local', return_value='/cam/realmonitor?channel=1&subtype=0')):
            resultado = consultar('administrador')
            self.assertEqual(resultado.data['ruta_rtsp_local'], '/cam/realmonitor?channel=1&subtype=0')
            self.assertNotIn('contrasena', resultado.data)
            self.assertEqual(consultar('guardia').status_code, 403)
            self.assertEqual(consultar('administrador', '192.168.1.5').status_code, 403)

    def test_prueba_red_permisos_y_aislamiento_imou(self):
        camara = Camara.objects.create(**self.datos, ruta_rtsp='/flujo')
        def solicitar(rol, ip='127.0.0.1'):
            request = self.factory.post('/probar-red/', REMOTE_ADDR=ip)
            force_authenticate(request, user=self.user)
            with patch('administracion.access.effective_role', return_value=rol):
                return resolve(f'/api/camaras/{camara.pk}/probar-red/').func(request, pk=camara.pk)
        with (patch('camaras.api.direccion_imou_configurada', return_value=None),
              patch('camaras.api.probar_rtsp', return_value='disponible') as prueba):
            self.assertEqual(solicitar('guardia').status_code, 403)
            self.assertEqual(solicitar('administrador', '192.168.1.3').status_code, 403)
            self.assertEqual(solicitar('administrador').data, {'estado': 'disponible'})
            prueba.assert_called_once()
        with (patch('camaras.api.direccion_imou_configurada', return_value=('192.168.20.10', 554)),
              patch('camaras.api.probar_rtsp') as prueba):
            self.assertEqual(solicitar('administrador').status_code, 409)
            prueba.assert_not_called()

    @override_settings(CAMARAS_CLAVE_CIFRADO=Fernet.generate_key().decode())
    def test_prueba_rtsp_restringe_red_y_no_pasa_claves_en_argumentos(self):
        from .credenciales import cifrar_contrasena
        camara = Camara(**self.datos, ruta_rtsp='/flujo', usuario_dispositivo='usuario',
                        contrasena_cifrada=cifrar_contrasena('clave-ficticia'))
        with (patch('camaras.prueba_rtsp.Path.is_file', return_value=True),
              patch('camaras.prueba_rtsp.subprocess.run') as proceso):
            proceso.return_value.returncode = 0
            self.assertEqual(probar_rtsp(camara), 'disponible')
            argumentos, opciones = proceso.call_args
            self.assertNotIn('clave-ficticia', str(argumentos))
            self.assertIn('clave-ficticia', opciones['input'])
            self.assertIsNotNone(opciones['timeout'])
            camara.direccion_ip = '8.8.8.8'
            self.assertEqual(probar_rtsp(camara), 'configuracion_incompleta')
            camara.direccion_ip = '192.168.20.10'
            camara.ruta_rtsp = '/flujo?password=oculta'
            self.assertEqual(probar_rtsp(camara), 'configuracion_incompleta')
            camara.ruta_rtsp = '/flujo'
            camara.activa = False
            self.assertEqual(probar_rtsp(camara), 'configuracion_incompleta')
            proceso.assert_called_once()

    def test_lector_aislado_decodifica_y_libera_con_cv_simulado(self):
        from seguridad_vision.probar_rtsp_catalogo import main
        from unittest.mock import Mock
        captura = Mock()
        captura.isOpened.return_value = True
        captura.read.return_value = (True, object())
        cv = SimpleNamespace(VideoCapture=Mock(return_value=captura), CAP_FFMPEG=1,
                             CAP_PROP_OPEN_TIMEOUT_MSEC=2, CAP_PROP_READ_TIMEOUT_MSEC=3)
        datos = '{"usuario":"usuario", "clave":"clave-ficticia", "ip":"192.168.20.10", "puerto":554, "ruta":"/flujo"}'
        with patch('sys.stdin', StringIO(datos)), patch.dict('sys.modules', {'cv2': cv}):
            self.assertEqual(main(), 0)
        captura.release.assert_called_once()

    def test_descubrimiento_valida_respuesta_y_origen(self):
        from .descubrimiento import _respuesta_ip, _respuesta_dispositivo
        def respuesta(ip='192.168.20.10', mensaje='urn:uuid:ficticio'):
            return (f'<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" '
                    'xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" '
                    'xmlns:d="http://schemas.xmlsoap.org/ws/2005/04/discovery">'
                    f'<s:Header><a:RelatesTo>{mensaje}</a:RelatesTo></s:Header><s:Body><d:ProbeMatches>'
                    f'<d:ProbeMatch><d:XAddrs>http://{ip}/onvif/device_service</d:XAddrs>'
                    '</d:ProbeMatch></d:ProbeMatches></s:Body></s:Envelope>').encode()
        self.assertEqual(_respuesta_ip(respuesta(), '192.168.20.10', 'urn:uuid:ficticio'), '192.168.20.10')
        self.assertIsNone(_respuesta_ip(respuesta(), '192.168.20.11', 'urn:uuid:ficticio'))
        self.assertIsNone(_respuesta_ip(respuesta(), '192.168.20.10', 'urn:uuid:otra'))
        self.assertIsNone(_respuesta_ip(respuesta('8.8.8.8'), '8.8.8.8', 'urn:uuid:ficticio'))
        self.assertIsNone(_respuesta_ip(b'<!DOCTYPE a><a/>', '192.168.20.10', 'urn:uuid:ficticio'))
        self.assertEqual(_respuesta_dispositivo(respuesta(), '192.168.20.10', 'urn:uuid:ficticio')['puerto_onvif'], 80)
        otro_puerto = respuesta().replace(b'192.168.20.10/onvif', b'192.168.20.10:8080/onvif')
        self.assertEqual(_respuesta_dispositivo(otro_puerto, '192.168.20.10', 'urn:uuid:ficticio')['puerto_onvif'], 8080)
        solo_https = respuesta().replace(b'http://192.168.20.10/onvif', b'https://192.168.20.10/onvif')
        self.assertIsNone(_respuesta_dispositivo(solo_https, '192.168.20.10', 'urn:uuid:ficticio')['puerto_onvif'])
        diferente_ruta = respuesta().replace(b'/onvif/device_service', b'/otro/servicio')
        self.assertIsNone(_respuesta_dispositivo(diferente_ruta, '192.168.20.10', 'urn:uuid:ficticio')['puerto_onvif'])

    def test_onvif_obtiene_ruta_y_rechaza_destinos_no_autorizados(self):
        from xml.etree import ElementTree as ET
        from .onvif import consultar_perfiles, ErrorOnvif
        caps = ET.fromstring('<r xmlns:tt="http://www.onvif.org/ver10/schema"><tt:Media><tt:XAddr>http://192.168.20.10/onvif/media</tt:XAddr></tt:Media></r>')
        perfiles = ET.fromstring('<r xmlns:trt="http://www.onvif.org/ver10/media/wsdl" xmlns:tt="http://www.onvif.org/ver10/schema"><trt:Profiles token="p1"><tt:Name>Secundario</tt:Name></trt:Profiles></r>')
        ruta = ET.fromstring('<r xmlns:tt="http://www.onvif.org/ver10/schema"><tt:Uri>rtsp://192.168.20.10:8554/video</tt:Uri></r>')
        with patch('camaras.onvif._consultar', side_effect=[caps, perfiles, ruta]):
            self.assertEqual(consultar_perfiles('192.168.20.10', 80, 'usuario', 'clave'), [{'nombre': 'Secundario', 'puerto_rtsp': 8554, 'ruta_rtsp': '/video'}])
        for uri in ('http://192.168.20.11/media', 'http://usuario:clave@192.168.20.10/media', 'http://127.0.0.1/media'):
            caps.find('.//{http://www.onvif.org/ver10/schema}XAddr').text = uri
            with patch('camaras.onvif._consultar', return_value=caps), self.assertRaises(ErrorOnvif):
                consultar_perfiles('192.168.20.10', 80, 'usuario', 'clave')
        with self.assertRaises(ErrorOnvif):
            consultar_perfiles('8.8.8.8', 80, 'usuario', 'clave')

    def test_consulta_onvif_solo_admin_local_y_sin_credenciales_en_respuesta(self):
        vista = resolve('/api/camaras/consultar-onvif/').func
        datos = {'ip': '192.168.20.10', 'puerto_onvif': 80, 'usuario': 'ficticio', 'contrasena': 'clave-ficticia'}
        def solicitar(rol, ip='127.0.0.1'):
            request = self.factory.post('/consultar/', datos, format='json', REMOTE_ADDR=ip)
            force_authenticate(request, user=self.user)
            with patch('administracion.access.effective_role', return_value=rol):
                return vista(request)
        with patch('camaras.api.consultar_perfiles', return_value=[{'nombre': 'Secundario', 'puerto_rtsp': 554, 'ruta_rtsp': '/video'}]) as consulta:
            self.assertEqual(solicitar('guardia').status_code, 403)
            self.assertEqual(solicitar('administrador', '192.168.20.11').status_code, 403)
            respuesta = solicitar('administrador')
            self.assertEqual(respuesta.status_code, 200)
            self.assertNotIn('clave-ficticia', str(respuesta.data))
            self.assertIn('no-store', respuesta['Cache-Control'])
            consulta.assert_called_once()

    def test_onvif_soap_oculta_clave_y_rechaza_redireccion_y_dtd(self):
        from unittest.mock import MagicMock
        from .onvif import _consultar, ErrorOnvif
        respuesta = MagicMock()
        respuesta.__enter__.return_value = respuesta
        respuesta.status_code = 200
        respuesta.iter_content.return_value = [b'<ok/>']
        sesion = MagicMock()
        sesion.post.return_value = respuesta
        _consultar(sesion, 'http://192.168.20.10/onvif/device_service', '<tds:GetCapabilities/>', 'ficticio', 'clave-ficticia')
        opciones = sesion.post.call_args.kwargs
        self.assertNotIn(b'clave-ficticia', opciones['data'])
        self.assertFalse(opciones['allow_redirects'])
        respuesta.iter_content.return_value = [b'<!DOCTYPE a [<!ENTITY x "data">]><a/>']
        with self.assertRaises(ErrorOnvif):
            _consultar(sesion, 'http://192.168.20.10/onvif/device_service', '<tds:GetCapabilities/>', 'ficticio', 'clave-ficticia')
        respuesta.status_code = 302
        with self.assertRaises(ErrorOnvif):
            _consultar(sesion, 'http://192.168.20.10/onvif/device_service', '<tds:GetCapabilities/>', 'ficticio', 'clave-ficticia')

    def test_busqueda_solo_administrador_local(self):
        vista = resolve('/api/camaras/buscar-red/').func
        def solicitar(rol, ip='127.0.0.1'):
            request = self.factory.post('/buscar/', REMOTE_ADDR=ip)
            force_authenticate(request, user=self.user)
            with patch('administracion.access.effective_role', return_value=rol):
                return vista(request)
        with patch('camaras.api.descubrir', return_value=('completado', [{'ip': '192.168.20.10', 'puerto_onvif': 8080}])) as servicio:
            self.assertEqual(solicitar('guardia').status_code, 403)
            self.assertEqual(solicitar('administrador', '192.168.20.11').status_code, 403)
            respuesta = solicitar('administrador')
            self.assertEqual(respuesta.data, {'estado': 'completado', 'direcciones': ['192.168.20.10'], 'dispositivos': [{'ip': '192.168.20.10', 'puerto_onvif': 8080}]})
            self.assertIn('no-store', respuesta['Cache-Control'])
            servicio.assert_called_once()

    def test_busqueda_envia_multicast_y_deduplica_respuestas_simuladas(self):
        import socket
        from unittest.mock import MagicMock
        from .descubrimiento import descubrir
        paquete = (b'<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" '
                   b'xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" '
                   b'xmlns:d="http://schemas.xmlsoap.org/ws/2005/04/discovery"><s:Header>'
                   b'<a:RelatesTo>urn:uuid:12345678-1234-5678-1234-567812345678</a:RelatesTo>'
                   b'</s:Header><s:Body><d:ProbeMatches><d:ProbeMatch>'
                   b'<d:XAddrs>http://192.168.20.10/onvif/device_service</d:XAddrs>'
                   b'</d:ProbeMatch></d:ProbeMatches></s:Body></s:Envelope>')
        canal = MagicMock()
        canal.__enter__.return_value = canal
        canal.recvfrom.side_effect = [(paquete, ('192.168.20.10', 3702)),
                                      (paquete, ('192.168.20.10', 3702)), socket.timeout(), socket.timeout()]
        with (patch('camaras.descubrimiento.socket.socket', return_value=canal),
              patch('camaras.descubrimiento.uuid.uuid4', side_effect=['12345678-1234-5678-1234-567812345678', '87654321-4321-8765-4321-876543218765'])):
            self.assertEqual(descubrir(), ('completado', [{'ip': '192.168.20.10', 'puerto_onvif': 80}]))
        self.assertEqual(canal.sendto.call_args.args[1], ('239.255.255.250', 3702))
        self.assertEqual(canal.sendto.call_count, 2)
        self.assertNotEqual(canal.sendto.call_args_list[0].args[0], canal.sendto.call_args_list[1].args[0])

    def llamar(self, role, metodo='post', datos=None, pk=None):
        request = getattr(self.factory, metodo)('/camaras/', data=datos, format='json')
        force_authenticate(request, user=self.user)
        acciones = {'post': 'create', 'get': 'retrieve' if pk else 'list', 'patch': 'partial_update', 'delete': 'destroy'}
        with patch('administracion.access.effective_role', return_value=role):
            return CamaraViewSet.as_view({metodo: acciones[metodo]})(request, **({'pk': pk} if pk else {}))

    def test_registro_edicion_y_auditoria(self):
        response = self.llamar('administrador', datos=self.datos)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.llamar('administrador', 'patch', {'activa': False}, response.data['id']).status_code, 200)
        self.assertFalse(Camara.objects.get().activa)
        self.assertEqual(LogEntry.objects.count(), 2)
        self.assertNotIn('delete', resolve(f"/api/camaras/{response.data['id']}/").func.actions)

    def test_permiso_y_validacion(self):
        for rol in ('guardia', 'propietario', 'inquilino', None):
            self.assertEqual(self.llamar(rol, datos=self.datos).status_code, 403)
            self.assertEqual(self.llamar(rol, 'get').status_code, 403)
        for cambios in ({'direccion_ip': 'no-es-ip'}, {'puerto_rtsp': 65536}, {'puerto_rtsp': 0}, {'password': 'no-guardar'}, {'tipo': 'LOCAL'}):
            self.assertEqual(self.llamar('administrador', datos={**self.datos, **cambios}).status_code, 400)
        self.assertEqual(Camara.objects.count(), 0)
        self.assertEqual(self.llamar('administrador', datos={'nombre': 'Webcam', 'tipo': 'LOCAL'}).status_code, 201)

    def test_probar_solo_imou_configurada_sin_exponer_imagen(self):
        camara = Camara.objects.create(**self.datos)
        def probar(rol, ip='127.0.0.1'):
            request = self.factory.post('/probar/', REMOTE_ADDR=ip)
            force_authenticate(request, user=self.user)
            with patch('administracion.access.effective_role', return_value=rol):
                vista = resolve(f'/api/camaras/{camara.pk}/probar-imou/').func
                return vista(request, pk=camara.pk)
        with (patch('camaras.api.direccion_imou_configurada', return_value=('192.168.20.10', 554)),
              patch('seguridad_IA.api_imou_local.obtener_fotograma', return_value=(200, b'imagen-privada')) as puente):
            respuesta = probar('administrador')
            self.assertEqual(respuesta.data, {'estado': 'disponible'})
            self.assertNotIn('imagen-privada', str(respuesta.data))
            self.assertEqual(probar('guardia').status_code, 403)
            self.assertEqual(probar('administrador', '192.168.1.2').status_code, 403)
            self.assertEqual(puente.call_count, 1)
            Camara.objects.create(**{**self.datos, 'nombre': 'Duplicada'})
            self.assertEqual(probar('administrador').status_code, 409)
            self.assertEqual(puente.call_count, 1)

    def test_agregar_imou_local_con_auditoria_y_sin_duplicar(self):
        def agregar(rol, ip='127.0.0.1'):
            request = self.factory.post('/registrar/', REMOTE_ADDR=ip)
            force_authenticate(request, user=self.user)
            with patch('administracion.access.effective_role', return_value=rol):
                return resolve('/api/camaras/registrar-imou/').func(request)
        with patch('camaras.api.direccion_imou_configurada', return_value=('192.168.20.10', 554)):
            self.assertEqual(agregar('guardia').status_code, 403)
            self.assertEqual(agregar('administrador', '192.168.1.2').status_code, 403)
            respuesta = agregar('administrador')
            self.assertEqual(respuesta.status_code, 201)
            self.assertEqual(respuesta.data['vinculo_imou'], 'vinculada')
            self.assertEqual(agregar('administrador').status_code, 409)
        self.assertEqual(Camara.objects.count(), 1)
        self.assertEqual(LogEntry.objects.count(), 1)

    @override_settings(CAMARAS_CLAVE_CIFRADO=Fernet.generate_key().decode())
    def test_vinculo_traslada_configuracion_y_sobrevive_cambio_ip(self):
        from django.core.exceptions import ImproperlyConfigured
        from .fuente_monitor import fuente_monitor
        camara = Camara.objects.create(**self.datos)
        def vincular(rol, ip='127.0.0.1'):
            request = self.factory.post('/vincular/', REMOTE_ADDR=ip)
            force_authenticate(request, user=self.user)
            with patch('administracion.access.effective_role', return_value=rol):
                return resolve(f'/api/camaras/{camara.pk}/vincular-monitor/').func(request, pk=camara.pk)
        with (patch('camaras.api.direccion_imou_configurada', return_value=('192.168.20.10', 554)),
              patch('camaras.api.credenciales_imou_local', return_value=('operador', 'clave-ficticia')),
              patch('camaras.api.ruta_imou_local', return_value='/video')):
            self.assertEqual(vincular('guardia').status_code, 403)
            self.assertEqual(vincular('administrador', '192.168.20.11').status_code, 403)
            respuesta = vincular('administrador')
            self.assertEqual(respuesta.status_code, 200)
            self.assertTrue(respuesta.data['monitor_en_catalogo'])
            self.assertNotIn('clave-ficticia', str(respuesta.data))
            self.assertEqual(vincular('administrador').status_code, 409)
        camara.refresh_from_db()
        self.assertNotIn(b'clave-ficticia', bytes(camara.contrasena_cifrada))
        self.assertEqual(MonitorImou.objects.get(pk=1).camara_id, camara.pk)
        camara.direccion_ip = '192.168.20.11'
        camara.save()
        self.assertEqual(fuente_monitor()['ip'], '192.168.20.11')
        from .imou import estado_vinculo
        self.assertEqual(estado_vinculo(camara, ('192.168.20.10', 554)), 'vinculada')
        camara.activa = False
        camara.save()
        with self.assertRaises(ImproperlyConfigured):
            fuente_monitor()

    @override_settings(CAMARAS_CLAVE_CIFRADO=Fernet.generate_key().decode())
    def test_vinculo_no_sobrescribe_credenciales_existentes(self):
        from .credenciales import cifrar_contrasena
        camara = Camara.objects.create(**self.datos, contrasena_cifrada=cifrar_contrasena('original'))
        req = self.factory.post('/vincular/', REMOTE_ADDR='127.0.0.1')
        force_authenticate(req, user=self.user)
        with (patch('administracion.access.effective_role', return_value='administrador'),
              patch('camaras.api.direccion_imou_configurada', return_value=('192.168.20.10', 554)),
              patch('camaras.api.credenciales_imou_local', return_value=('operador', 'otra')),
              patch('camaras.api.ruta_imou_local', return_value='/video')):
            self.assertEqual(resolve(f'/api/camaras/{camara.pk}/vincular-monitor/').func(req, pk=camara.pk).status_code, 409)
        self.assertFalse(MonitorImou.objects.exists())
        camara.refresh_from_db()
        self.assertEqual(descifrar_contrasena(camara.contrasena_cifrada), 'original')

    @override_settings(CAMARAS_CLAVE_CIFRADO=Fernet.generate_key().decode('ascii'))
    def test_credencial_cifrada_no_se_devuelve_y_puede_reemplazarse_o_eliminarse(self):
        entrada = {**self.datos, 'usuario_dispositivo': 'operador-ficticio',
                   'ruta_rtsp': '/cam/realmonitor?channel=1&subtype=1', 'contrasena_nueva': 'clave-ficticia'}
        respuesta = self.llamar('administrador', datos=entrada)
        self.assertEqual(respuesta.status_code, 201)
        self.assertNotIn('clave-ficticia', str(respuesta.data))
        self.assertNotIn('contrasena_nueva', respuesta.data)
        self.assertNotIn('contrasena_cifrada', respuesta.data)
        camara = Camara.objects.get()
        self.assertNotIn(b'clave-ficticia', bytes(camara.contrasena_cifrada))
        self.assertEqual(descifrar_contrasena(camara.contrasena_cifrada), 'clave-ficticia')
        self.assertEqual(self.llamar('guardia', 'get').status_code, 403)
        self.assertEqual(self.llamar('administrador', 'patch', {'nombre': 'Cambio'}, camara.pk).status_code, 200)
        camara.refresh_from_db()
        self.assertEqual(descifrar_contrasena(camara.contrasena_cifrada), 'clave-ficticia')
        self.assertEqual(self.llamar('administrador', 'patch', {'contrasena_nueva': 'otra-ficticia'}, camara.pk).status_code, 200)
        camara.refresh_from_db()
        self.assertEqual(descifrar_contrasena(camara.contrasena_cifrada), 'otra-ficticia')
        self.assertEqual(self.llamar('administrador', 'patch', {'eliminar_contrasena': True}, camara.pk).status_code, 200)
        camara.refresh_from_db()
        self.assertIsNone(camara.contrasena_cifrada)
        self.assertFalse(any('ficticia' in item.change_message for item in LogEntry.objects.all()))

    @override_settings(CAMARAS_CLAVE_CIFRADO='')
    def test_clave_ausente_o_credencial_en_ruta_se_rechazan(self):
        self.assertEqual(self.llamar('administrador', datos={**self.datos, 'contrasena_nueva': 'ficticia'}).status_code, 400)
        for ruta in ('rtsp://user:pass@192.168.20.10/live', '/live?password=ficticia'):
            self.assertEqual(self.llamar('administrador', datos={**self.datos, 'ruta_rtsp': ruta}).status_code, 400)
        self.assertEqual(Camara.objects.count(), 0)
