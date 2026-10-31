from django.db import IntegrityError, transaction
from django.contrib.auth import get_user_model
from django.contrib.admin.models import ADDITION, CHANGE
from django.db.models import Q
from fcm_django.api.rest_framework import FCMDeviceAuthorizedViewSet, FCMDeviceSerializer
from rest_framework import serializers, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from administracion.audit import record_action


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

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return queryset.select_for_update()
        return queryset

    @staticmethod
    def estado_dispositivo(device):
        return (device.registration_id, device.active, device.type, device.name, device.device_id)

    def comprobar_token(self, request):
        token = request.data.get('registration_id')
        if token and self.queryset.model.objects.select_for_update().filter(
                registration_id=token).exclude(user=request.user).exists():
            raise ValidationError({'registration_id': 'No se puede registrar este dispositivo.'})

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        get_user_model().objects.select_for_update().get(pk=request.user.pk)
        self.comprobar_token(request)
        instance = self.get_queryset().filter(registration_id=request.data.get('registration_id')).first()
        before = self.estado_dispositivo(instance) if instance else None
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                if instance:
                    self.perform_update(serializer)
                else:
                    self.perform_create(serializer)
                if instance is None:
                    record_action(request.user, serializer.instance, 'Dispositivo de notificaciones registrado.', ADDITION)
                elif before != self.estado_dispositivo(serializer.instance):
                    record_action(request.user, serializer.instance, 'Dispositivo de notificaciones actualizado.', CHANGE)
        except IntegrityError:
            raise ValidationError({'detail': 'No se puede registrar este dispositivo.'})
        return Response(serializer.data, status=status.HTTP_200_OK if instance else status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        get_user_model().objects.select_for_update().get(pk=request.user.pk)
        instance = self.get_object()
        before = self.estado_dispositivo(instance)
        replacement = request.data.get('registration_id')
        if replacement is not None and replacement != instance.registration_id:
            raise ValidationError({'detail': 'Para cambiar el token utiliza la sincronización del dispositivo.'})
        self.comprobar_token(request)
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                self.perform_update(serializer)
                if before != self.estado_dispositivo(serializer.instance):
                    record_action(request.user, serializer.instance, 'Dispositivo de notificaciones actualizado.', CHANGE)
        except IntegrityError:
            raise ValidationError({'detail': 'No se puede actualizar este dispositivo.'})
        return Response(serializer.data)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        get_user_model().objects.select_for_update().get(pk=request.user.pk)
        instance = self.get_object()
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
        try:
            with transaction.atomic():
                # Serialize concurrent changes belonging to the same account.
                get_user_model().objects.select_for_update().get(pk=request.user.pk)
                devices = list(self.queryset.model.objects.select_for_update().filter(
                    Q(registration_id=current) | Q(registration_id=previous)).order_by('pk'))
                if any(device.user_id != request.user.pk for device in devices):
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
                if previous and previous != current:
                    previous_device = next((device for device in devices if device.registration_id == previous), None)
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
        get_user_model().objects.select_for_update().get(pk=request.user.pk)
        token = serializer.validated_data['registration_id']
        device = self.queryset.model.objects.select_for_update().filter(registration_id=token).first()
        if device and device.user_id != request.user.pk:
            raise ValidationError({'detail': 'No se puede desregistrar este dispositivo.'})
        if device and device.active:
            device.active = False
            device.save(update_fields=['active'])
            record_action(request.user, device, 'Dispositivo de notificaciones desactivado.', CHANGE)
        return Response(status=status.HTTP_204_NO_CONTENT)
