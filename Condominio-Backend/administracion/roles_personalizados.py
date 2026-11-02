"""Gestión inicial de roles personalizados; no usa permisos técnicos de Django."""
import unicodedata

from django.conf import settings
from django.contrib.admin.models import ADDITION, CHANGE
from django.contrib.auth.models import Group, User
from django.db import transaction
from fcm_django.models import FCMDevice
from rest_framework import serializers, status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import APIView

from administracion.access import AdministratorOnly, ROLE_NAMES
from administracion.audit import record_action
from administracion.models import AsignacionRolPersonalizado, CapacidadRolPersonalizado, Empleado, RolPersonalizado

CAPACIDAD_VISITAS = 'visitas.consultar_operativas'


class FuncionNoHabilitada(APIException):
    status_code = 503
    default_detail = 'Los roles personalizados aún no están habilitados en este entorno.'


def exigir_activacion():
    if not getattr(settings, 'ROLES_PERSONALIZADOS_ACTIVOS', False):
        raise FuncionNoHabilitada()


def normalizar(nombre):
    return ' '.join(unicodedata.normalize('NFKC', nombre).split()).casefold()


def bloqueo_administradores():
    list(Group.objects.select_for_update().filter(name__iexact='administrador'))


def representacion(role):
    return {'id': str(role.pk), 'nombre': role.nombre, 'activo': role.activo,
            'consultar_visitas': role.capacidades.filter(codigo=CAPACIDAD_VISITAS).exists(),
            'usuarios_asignados': role.asignaciones.count()}


class CrearRolInput(serializers.Serializer):
    nombre = serializers.CharField(max_length=100)

    def validate_nombre(self, value):
        value = ' '.join(unicodedata.normalize('NFKC', value).split())
        if not value or len(value) > 100 or any(unicodedata.category(c).startswith('C') for c in value):
            raise serializers.ValidationError('Indica un nombre válido.')
        key = normalizar(value)
        reserved = {normalizar(name) for name in ROLE_NAMES} | {'guardia', 'personalizado'}
        if key in reserved or any(normalizar(name) == key for name in Group.objects.values_list('name', flat=True)):
            raise serializers.ValidationError('El nombre coincide con un rol o grupo existente.')
        if any(normalizar(name) == key for name in RolPersonalizado.objects.values_list('nombre', flat=True)):
            raise serializers.ValidationError('Ya existe un rol con ese nombre.')
        return value


class AjustarRolInput(serializers.Serializer):
    activo = serializers.BooleanField(required=False)
    consultar_visitas = serializers.BooleanField(required=False)

    def validate(self, data):
        if not data or set(self.initial_data) - {'activo', 'consultar_visitas'}:
            raise serializers.ValidationError('Indica solo los ajustes disponibles.')
        return data


class ListaRolesPersonalizados(APIView):
    permission_classes = [AdministratorOnly]

    def get(self, request):
        exigir_activacion()
        return Response([representacion(role) for role in RolPersonalizado.objects.order_by('nombre')])

    @transaction.atomic
    def post(self, request):
        exigir_activacion()
        bloqueo_administradores()
        serializer = CrearRolInput(data=request.data)
        if set(request.data) != {'nombre'}:
            raise serializers.ValidationError('Un rol nuevo se crea sin permisos y solo requiere un nombre.')
        serializer.is_valid(raise_exception=True)
        role = RolPersonalizado.objects.create(nombre=serializer.validated_data['nombre'])
        record_action(request.user, role, 'Creación de rol personalizado sin permisos', ADDITION)
        return Response(representacion(role), status=status.HTTP_201_CREATED)


class DetalleRolPersonalizado(APIView):
    permission_classes = [AdministratorOnly]

    @transaction.atomic
    def patch(self, request, rol_id):
        exigir_activacion()
        bloqueo_administradores()
        role = RolPersonalizado.objects.select_for_update().filter(pk=rol_id).first()
        if not role:
            return Response({'detail': 'Rol no encontrado.'}, status=404)
        serializer = AjustarRolInput(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if 'activo' in data:
            role.activo = data['activo']
            role.save(update_fields=['activo'])
        if 'consultar_visitas' in data:
            if data['consultar_visitas']:
                CapacidadRolPersonalizado.objects.get_or_create(rol=role, codigo=CAPACIDAD_VISITAS)
            else:
                CapacidadRolPersonalizado.objects.filter(rol=role, codigo=CAPACIDAD_VISITAS).delete()
        record_action(request.user, role, 'Cambio de estado o capacidad de rol personalizado', CHANGE)
        return Response(representacion(role))


class AsignarRolPersonalizado(APIView):
    permission_classes = [AdministratorOnly]

    @transaction.atomic
    def post(self, request, rol_id):
        exigir_activacion()
        bloqueo_administradores()
        if set(request.data) != {'usuario_id'}:
            raise serializers.ValidationError('Indica únicamente el identificador del usuario.')
        field = serializers.IntegerField(min_value=1)
        user_id = field.run_validation(request.data['usuario_id'])
        role = RolPersonalizado.objects.select_for_update().filter(pk=rol_id, activo=True).first()
        user = User.objects.select_for_update().filter(pk=user_id, is_active=True).first()
        if not role or not user:
            raise serializers.ValidationError('El rol y la cuenta deben existir y estar activos.')
        employee = Empleado.objects.select_for_update().filter(user=user, estado='A').first()
        group_names = user.groups.values_list('name', flat=True)
        has_admin_group = any(ROLE_NAMES.get(name.strip().casefold()) == 'administrador' for name in group_names)
        if (not employee or user.pk == request.user.pk or user.is_staff or user.is_superuser
                or getattr(user, 'persona', None) or has_admin_group):
            raise serializers.ValidationError('Se requiere una cuenta de empleado activo sin perfil residencial ni privilegios administrativos o técnicos.')
        if FCMDevice.objects.filter(user=user).exists():
            raise serializers.ValidationError('La cuenta tiene dispositivos registrados; su cambio de rol requiere revisar primero las notificaciones existentes.')
        # El rol personalizado es exclusivo: no acumular grupos de Django.
        user.groups.clear()
        AsignacionRolPersonalizado.objects.update_or_create(usuario=user, defaults={'rol': role})
        record_action(request.user, user, 'Asignación de rol personalizado', CHANGE)
        return Response({'detail': 'Rol asignado.'})
