from django.db import IntegrityError, transaction
from django.contrib.auth import get_user_model
from django.contrib.admin.models import ADDITION, CHANGE
from django.db.models import Q
from django.utils import timezone
from fcm_django.api.rest_framework import FCMDeviceAuthorizedViewSet, FCMDeviceSerializer
from rest_framework import serializers, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.exceptions import TokenError
from administracion.audit import record_action
from administracion.access import effective_role
from administracion.models import SesionAplicacion
from .models import ProcedenciaFCM
from .procedencia_fcm import huella, validar_token, proyecto_configurado


class DispositivoRolAdmitido(BasePermission):
    def has_permission(self, request, view):
        return effective_role(request.user) in ('administrador', 'guardia', 'propietario', 'inquilino')


class SincronizarDispositivoSerializer(serializers.Serializer):
    registration_id = serializers.CharField(max_length=4096, trim_whitespace=False)
    previous_registration_id = serializers.CharField(max_length=4096, trim_whitespace=False,
                                                      allow_null=True, required=False)
    type = serializers.ChoiceField(choices=('android', 'ios'))


class DesregistrarDispositivoSerializer(serializers.Serializer):
    registration_id = serializers.CharField(max_length=4096, trim_whitespace=False)


class DispositivoPropioSerializer(FCMDeviceSerializer):
    def validate(self, attrs):
        # The library's cross-user validation can deactivate other users' rows.
        # Ownership is checked by the view and uniqueness by the database.
        return attrs


class DispositivoPropioViewSet(FCMDeviceAuthorizedViewSet):
    """Evita reasignar dispositivos ajenos al registrar o cambiar un token."""
    serializer_class = DispositivoPropioSerializer
    permission_classes = (*FCMDeviceAuthorizedViewSet.permission_classes, DispositivoRolAdmitido)

    @staticmethod
    def validar_vigencia(request):
        try:
            request.auth.check_exp(current_time=timezone.now())
        except TokenError:
            raise AuthenticationFailed('La sesión no está activa.') from None

    @staticmethod
    def sesion_activa(request, bloquear=False):
        token = request.auth
        if token is None or not token.get('session_id'):
            raise AuthenticationFailed('La sesión no está activa.')
        try:
            DispositivoPropioViewSet.validar_vigencia(request)
            query = SesionAplicacion.objects
            if bloquear:
                query = query.select_for_update()
            session = query.filter(pk=token.get('session_id'), usuario=request.user, revocada__isnull=True).first()
            DispositivoPropioViewSet.validar_vigencia(request)
        except (TokenError, ValueError, TypeError):
            session = None
        if not session:
            raise AuthenticationFailed('La sesión no está activa.')
        return session

    @staticmethod
    def bloquear_usuario(request):
        user = get_user_model().objects.select_for_update().get(pk=request.user.pk)
        if effective_role(user) not in ('administrador', 'guardia', 'propietario', 'inquilino'):
            raise PermissionDenied('Este rol no admite registro de dispositivos.')
        return user

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return queryset.select_for_update()
        return queryset

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        # La ruta heredada no valida proyecto: solo sincronizar puede registrar.
        raise ValidationError({'detail': 'Utiliza la sincronización del dispositivo.'})

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        # No permitir que un cliente anterior reactive dispositivos desconocidos.
        raise ValidationError({'detail': 'Utiliza la sincronización del dispositivo.'})

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        sesion = self.sesion_activa(request, bloquear=True)
        self.bloquear_usuario(request)
        instance = self.get_object()
        self.validar_vigencia(request)
        if ProcedenciaFCM.objects.filter(dispositivo=instance, sesion__isnull=False, sesion__revocada__isnull=True).exclude(sesion=sesion).exists():
            raise ValidationError({'detail': 'No se puede desregistrar este dispositivo.'})
        sesion.version_fcm += 1
        sesion.save(update_fields=['version_fcm'])
        # Keep the token ownership reservation, even after a legacy DELETE.
        if instance.active:
            instance.active = False
            instance.save(update_fields=['active'])
            record_action(request.user, instance, 'Dispositivo de notificaciones desactivado.', CHANGE)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], url_path='sincronizar')
    def sincronizar(self, request):
        serializer = SincronizarDispositivoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        current = data['registration_id']
        previous = data.get('previous_registration_id')
        version_inicial = self.sesion_activa(request).version_fcm
        if effective_role(request.user) not in ('administrador', 'guardia', 'propietario', 'inquilino'):
            raise PermissionDenied('Este rol no admite registro de dispositivos.')
        # No consultar FCM para tokens que ya se sabe que son de otra cuenta.
        if self.queryset.model.objects.filter(Q(registration_id=current) | Q(registration_id=previous)).exclude(user=request.user).exists():
            raise ValidationError({'detail': 'No se puede sincronizar este dispositivo.'})
        proyecto = validar_token(current)  # Red fuera de bloqueos/transacción.
        try:
            with transaction.atomic():
                sesion = self.sesion_activa(request, bloquear=True)
                if sesion.version_fcm != version_inicial:
                    raise ValidationError({'detail': 'La sincronización fue cancelada; inténtalo de nuevo.'})
                # Serialize concurrent changes belonging to the same account.
                self.bloquear_usuario(request)
                devices = list(self.queryset.model.objects.select_for_update().filter(
                    Q(registration_id=current) | Q(registration_id=previous)).order_by('pk'))
                self.validar_vigencia(request)
                if any(device.user_id != request.user.pk for device in devices):
                    raise ValidationError({'detail': 'No se puede sincronizar este dispositivo.'})
                if proyecto_configurado()[0] != proyecto:
                    raise ValidationError({'detail': 'No se puede sincronizar este dispositivo.'})
                new_device = next((device for device in devices if device.registration_id == current), None)
                if new_device is None:
                    new_device = self.queryset.model.objects.create(
                        user=request.user, registration_id=current, type=data['type'], active=True)
                    record_action(request.user, new_device, 'Dispositivo de notificaciones registrado.', ADDITION)
                else:
                    was_active = new_device.active
                    new_device.type = data['type']
                    new_device.active = True
                    new_device.save(update_fields=['type', 'active'])
                    if not was_active:
                        record_action(request.user, new_device, 'Dispositivo de notificaciones reactivado.', CHANGE)
                ProcedenciaFCM.objects.update_or_create(dispositivo=new_device,
                    defaults={'proyecto': proyecto, 'token_hash': huella(current), 'sesion': sesion})
                if previous and previous != current:
                    previous_device = next((device for device in devices if device.registration_id == previous), None)
                    if previous_device and ProcedenciaFCM.objects.filter(dispositivo=previous_device, sesion__isnull=False, sesion__revocada__isnull=True).exclude(sesion=sesion).exists():
                        raise ValidationError({'detail': 'No se puede sincronizar este dispositivo.'})
                    if previous_device and previous_device.active:
                        previous_device.active = False
                        previous_device.save(update_fields=['active'])
                        record_action(request.user, previous_device, 'Dispositivo de notificaciones desactivado.', CHANGE)
        except IntegrityError:
            # A concurrent registration must never transfer another user's token.
            raise ValidationError({'detail': 'No se puede sincronizar este dispositivo.'})
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], url_path='desregistrar')
    @transaction.atomic
    def desregistrar(self, request):
        serializer = DesregistrarDispositivoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sesion = self.sesion_activa(request, bloquear=True)
        self.bloquear_usuario(request)
        token = serializer.validated_data['registration_id']
        device = self.queryset.model.objects.select_for_update().filter(registration_id=token).first()
        self.validar_vigencia(request)
        if device and device.user_id != request.user.pk:
            raise ValidationError({'detail': 'No se puede desregistrar este dispositivo.'})
        if device and ProcedenciaFCM.objects.filter(dispositivo=device, sesion__isnull=False, sesion__revocada__isnull=True).exclude(sesion=sesion).exists():
            raise ValidationError({'detail': 'No se puede desregistrar este dispositivo.'})
        sesion.version_fcm += 1
        sesion.save(update_fields=['version_fcm'])
        if device and device.active:
            device.active = False
            device.save(update_fields=['active'])
            record_action(request.user, device, 'Dispositivo de notificaciones desactivado.', CHANGE)
        return Response(status=status.HTTP_204_NO_CONTENT)
