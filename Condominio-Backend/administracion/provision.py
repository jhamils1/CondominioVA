"""Creación o vinculación de cuentas a perfiles existentes, en una transacción."""
from django.contrib.admin.models import ADDITION, CHANGE
from django.contrib.auth.models import Group, User
from django.db import transaction
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from administracion.access import AdministratorOnly, ROLE_NAMES, assigned_role, effective_role
from administracion.audit import record_action
from administracion.models import Empleado, Persona
from administracion.serializers.serializersUser import UserSerializer
from residencial.models import Inquilino


class ProvisionInputSerializer(serializers.Serializer):
    tipo = serializers.ChoiceField(choices=['empleado', 'propietario', 'inquilino'])
    perfil_id = serializers.IntegerField(min_value=1)
    modo = serializers.ChoiceField(choices=['crear', 'vincular'])
    username = serializers.CharField(required=False, max_length=150)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(required=False, write_only=True, trim_whitespace=False)
    usuario_id = serializers.IntegerField(required=False, min_value=1)
    rol = serializers.ChoiceField(choices=['administrador', 'guardia', 'propietario', 'inquilino'], required=False)

    def validate(self, data):
        if data['modo'] == 'crear':
            if any(not data.get(field) for field in ('username', 'email', 'password')):
                raise serializers.ValidationError('Indique usuario, correo y contraseña.')
            if 'usuario_id' in data:
                raise serializers.ValidationError('No indique una cuenta existente al crear.')
        else:
            if 'usuario_id' not in data:
                raise serializers.ValidationError('Indique la cuenta existente.')
            if any(field in data for field in ('username', 'email', 'password')):
                raise serializers.ValidationError('No envíe credenciales al vincular una cuenta existente.')
        return data


class ProvisionarCuentaView(APIView):
    permission_classes = [AdministratorOnly]

    @transaction.atomic
    def post(self, request):
        input_serializer = ProvisionInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data
        tipo, perfil_id = data['tipo'], data['perfil_id']
        role = data.get('rol', 'guardia') if tipo == 'empleado' else tipo
        if tipo != 'empleado' and 'rol' in data and data['rol'] != tipo:
            raise serializers.ValidationError({'rol': 'El rol no corresponde al perfil.'})
        if tipo == 'empleado':
            perfil = Empleado.objects.select_for_update().filter(pk=perfil_id).first()
        else:
            persona_type = 'P' if tipo == 'propietario' else 'I'
            perfil = Persona.objects.select_for_update().filter(pk=perfil_id, tipo=persona_type).first()
            if perfil and tipo == 'inquilino' and not Inquilino.objects.filter(pk=perfil.pk).exists():
                perfil = None
        if not perfil:
            raise serializers.ValidationError({'perfil_id': 'No existe un perfil compatible.'})
        if perfil.estado != 'A':
            raise serializers.ValidationError({'perfil_id': 'El perfil debe estar activo.'})
        if perfil.user_id:
            raise serializers.ValidationError({'perfil_id': 'El perfil ya tiene una cuenta vinculada.'})

        residential = None
        if tipo == 'empleado' and role in ('propietario', 'inquilino'):
            expected = 'P' if role == 'propietario' else 'I'
            residential = Persona.objects.select_for_update().filter(CI=perfil.CI, tipo=expected, estado='A').first()
            if not residential or (role == 'inquilino' and not Inquilino.objects.filter(pk=residential.pk).exists()):
                raise serializers.ValidationError({'rol': 'Se requiere un perfil residencial activo del mismo empleado y tipo de rol.'})
            if data['modo'] == 'crear' and residential.user_id:
                raise serializers.ValidationError({'rol': 'El perfil residencial ya tiene cuenta; vincule esa cuenta existente.'})

        if data['modo'] == 'crear':
            groups = [group for group in Group.objects.select_for_update().all()
                      if ROLE_NAMES.get(group.name.strip().casefold()) == role]
            if len(groups) != 1:
                raise serializers.ValidationError({'rol': 'Debe existir un único rol compatible.'})
            account_serializer = UserSerializer(data={'username': data['username'], 'email': data['email'],
                'password': data['password'], 'role_id': groups[0].pk}, context={'request': request})
            account_serializer.is_valid(raise_exception=True)
            user = account_serializer.save()
            record_action(request.user, user, 'Creación de cuenta vinculada', ADDITION)
        else:
            user = User.objects.select_for_update().filter(pk=data['usuario_id']).first()
            if not user or user.is_staff or user.is_superuser or assigned_role(user) != role:
                raise serializers.ValidationError({'usuario_id': 'La cuenta debe estar activa y tener el rol compatible, sin privilegios técnicos.'})
            other_persona = Persona.objects.filter(user=user).first()
            incompatible_persona = other_persona and (
                tipo != 'empleado' or other_persona.CI != perfil.CI or other_persona.estado != 'A')
            if Empleado.objects.filter(user=user).exists() or (not residential and incompatible_persona):
                raise serializers.ValidationError({'usuario_id': 'La cuenta ya está vinculada a un perfil.'})
            if residential and (residential.user_id != user.pk or effective_role(user) != role):
                raise serializers.ValidationError({'usuario_id': 'La cuenta debe pertenecer al perfil residencial activo del mismo empleado.'})
        if residential and data['modo'] == 'crear':
            residential.user = user
            residential.save(update_fields=['user'])
            record_action(request.user, residential, 'Vinculación de cuenta residencial', CHANGE)
        perfil.user = user
        perfil.save(update_fields=['user'])
        record_action(request.user, perfil, 'Vinculación de cuenta', CHANGE)
        return Response({'id': user.pk, 'username': user.username, 'role': role, 'perfil_id': perfil.pk},
                        status=status.HTTP_201_CREATED if data['modo'] == 'crear' else status.HTTP_200_OK)
