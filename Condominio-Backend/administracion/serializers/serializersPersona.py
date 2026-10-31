from rest_framework import serializers
from ..models import Persona
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import date
from django.contrib.auth.models import User
from administracion.access import assigned_role


def validar_vinculo_persona(user, tipo):
    if not user:
        return
    if tipo in ('F', 'V'):
        raise serializers.ValidationError('Familiares y visitantes no pueden tener cuentas de acceso.')
    rol = assigned_role(user)
    if rol not in ('administrador', {'P': 'propietario', 'I': 'inquilino'}.get(tipo)):
        raise serializers.ValidationError('El rol de la cuenta no corresponde al tipo de persona.')


class PersonaSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Persona (incluye el campo tipo)
    """
    nombre_completo = serializers.ReadOnlyField()
    luxand_uuid = serializers.ReadOnlyField()
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        allow_null=True,
        required=False
    )
    class Meta:
        model = Persona
        fields = [
            'id', 'nombre', 'apellido', 'telefono', 'imagen', 'estado', 
            'sexo', 'tipo', 'fecha_registro', 'CI', 'fecha_nacimiento', 
            'nombre_completo', 'luxand_uuid', 'user'
        ]
        read_only_fields = ['id', 'fecha_registro', 'luxand_uuid']
    
    def validate_CI(self, value):
        """
        Validar que la cédula sea única
        """
        if self.instance:
            if Persona.objects.filter(CI=value).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError("Esta cédula ya está registrada.")
        else:
            if Persona.objects.filter(CI=value).exists():
                raise serializers.ValidationError("Esta cédula ya está registrada.")
        return value
    
    def validate_fecha_nacimiento(self, value):
        """
        Validar que la fecha de nacimiento no sea futura
        """
        if value > date.today():
            raise serializers.ValidationError("La fecha de nacimiento no puede ser futura.")
        return value

    def validate(self, data):
        tipo = data.get('tipo', getattr(self.instance, 'tipo', None))
        user = data.get('user', getattr(self.instance, 'user', None))
        validar_vinculo_persona(user, tipo)
        return data


class PersonaSinTipoSerializer(serializers.ModelSerializer):
    """
    Serializer base para personas sin el campo tipo (se asigna automáticamente)
    """
    nombre_completo = serializers.ReadOnlyField()
    luxand_uuid = serializers.ReadOnlyField()
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        allow_null=True,
        required=False
    )
    class Meta:
        model = Persona
        fields = [
            'id', 'nombre', 'apellido', 'telefono', 'imagen', 'estado', 
            'sexo', 'fecha_registro', 'CI', 'fecha_nacimiento', 
            'nombre_completo', 'luxand_uuid', 'user'
        ]
        read_only_fields = ['id', 'fecha_registro', 'luxand_uuid']
    
    def validate_CI(self, value):
        """
        Validar que la cédula sea única
        """
        if self.instance:
            if Persona.objects.filter(CI=value).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError("Esta cédula ya está registrada.")
        else:
            if Persona.objects.filter(CI=value).exists():
                raise serializers.ValidationError("Esta cédula ya está registrada.")
        return value
    
    def validate_fecha_nacimiento(self, value):
        """
        Validar que la fecha de nacimiento no sea futura
        """
        if value > date.today():
            raise serializers.ValidationError("La fecha de nacimiento no puede ser futura.")
        return value

    def validate(self, data):
        tipo = getattr(self.instance, 'tipo', None)
        if self.__class__.__name__ == 'PropietarioSerializer':
            tipo = 'P'
        elif self.__class__.__name__ == 'VisitanteSerializer':
            tipo = 'V'
        user = data.get('user', getattr(self.instance, 'user', None))
        validar_vinculo_persona(user, tipo)
        return data


# Serializers específicos para cada tipo de persona
class PropietarioSerializer(PersonaSinTipoSerializer):
    """Serializer para propietarios (tipo='P')"""
    pass


class InquilinoSerializer(PersonaSinTipoSerializer):
    """Serializer para inquilinos (tipo='I')"""
    pass


class FamiliarSerializer(PersonaSinTipoSerializer):
    """Serializer para familiares (tipo='F')"""
    pass


class VisitanteSerializer(PersonaSinTipoSerializer):
    """Serializer para visitantes (tipo='V')"""
    pass
