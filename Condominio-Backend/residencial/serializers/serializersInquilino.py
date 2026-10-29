from rest_framework import serializers
from ..models import Inquilino
from administracion.models import Persona
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import date
from ..modelsVehiculo import Vehiculo




class InquilinoSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Inquilino que incluye todos los atributos de Persona
    """
    propietario_nombre = serializers.CharField(source='propietario.nombre_completo', read_only=True)
    propietario_ci = serializers.CharField(source='propietario.CI', read_only=True)
    nombre_completo = serializers.ReadOnlyField()
    luxand_uuid = serializers.ReadOnlyField()
    
    class Meta:
        model = Inquilino
        fields = [
            # Atributos heredados de Persona
            'id', 'nombre', 'apellido', 'telefono', 'imagen', 'estado', 'sexo', 
            'tipo', 'fecha_registro', 'CI', 'fecha_nacimiento', 'nombre_completo', 'luxand_uuid',
            # Atributos específicos de Inquilino
            'propietario', 'fecha_inicio', 'fecha_fin', 'estado_inquilino',
            # Campos calculados
            'propietario_nombre', 'propietario_ci'
        ]
        read_only_fields = ['id', 'fecha_registro', 'tipo', 'nombre_completo', 'luxand_uuid']
    
    def validate_fecha_fin(self, value):
        """
        Validar que la fecha de fin sea posterior a la fecha de inicio
        """
        fecha_inicio = self.initial_data.get('fecha_inicio')
        if fecha_inicio and value and value < date.fromisoformat(fecha_inicio):
            raise serializers.ValidationError("La fecha de fin debe ser posterior a la fecha de inicio.")
        return value
    
    def validate(self, data):
        """
        Validar que el inquilino no sea el mismo que el propietario
        """
        propietario = data.get('propietario')
        
        # Si estamos actualizando, verificar que no sea el mismo que el propietario
        if self.instance and propietario and self.instance.id == propietario.id:
            raise serializers.ValidationError("El inquilino no puede ser el mismo que el propietario.")
        
        return data
    
    def create(self, validated_data):
        """
        Crear inquilino asegurando que el tipo sea 'I'
        """
        validated_data['tipo'] = 'I'
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """
        Actualizar inquilino manteniendo el tipo como 'I'
        """
        validated_data['tipo'] = 'I'
        return super().update(instance, validated_data)


class InquilinoListSerializer(serializers.ModelSerializer):
    """
    Serializer para listar inquilinos con información completa
    """
    propietario_nombre = serializers.CharField(source='propietario.nombre_completo', read_only=True)
    propietario_ci = serializers.CharField(source='propietario.CI', read_only=True)
    nombre_completo = serializers.ReadOnlyField()
    luxand_uuid = serializers.ReadOnlyField()
    
    class Meta:
        model = Inquilino
        fields = [
            # Atributos heredados de Persona
            'id', 'nombre', 'apellido', 'telefono', 'imagen', 'estado', 'sexo', 
            'tipo', 'fecha_registro', 'CI', 'fecha_nacimiento', 'nombre_completo', 'luxand_uuid',
            # Atributos específicos de Inquilino
            'propietario', 'fecha_inicio', 'fecha_fin', 'estado_inquilino',
            # Campos calculados
            'propietario_nombre', 'propietario_ci'
        ]


class VehiculoSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Vehiculo
    """
    propietario_nombre = serializers.CharField(source='persona.nombre_completo', read_only=True)
    
    class Meta:
        model = Vehiculo
        fields = [
            'id', 'color', 'marca', 'modelo', 'placa', 'tipo', 'imagen', 
            'fecha_registro', 'persona', 'propietario_nombre'
        ]
        read_only_fields = ['id', 'fecha_registro']
    
    def validate_placa(self, value):
        """
        Validar que la placa sea única
        """
        if self.instance:
            if Vehiculo.objects.filter(placa=value).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError("Ya existe un vehículo con esta placa.")
        else:
            if Vehiculo.objects.filter(placa=value).exists():
                raise serializers.ValidationError("Ya existe un vehículo con esta placa.")
        return value
