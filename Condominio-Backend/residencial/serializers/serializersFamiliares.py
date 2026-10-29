from rest_framework import serializers
from ..models import Familiares
from administracion.models import Persona
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import date


class FamiliaresSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Familiares que incluye todos los atributos de Persona
    """
    persona_relacionada_nombre = serializers.CharField(source='persona_relacionada.nombre_completo', read_only=True)
    persona_relacionada_ci = serializers.CharField(source='persona_relacionada.CI', read_only=True)
    nombre_completo = serializers.ReadOnlyField()
    luxand_uuid = serializers.ReadOnlyField()
    
    class Meta:
        model = Familiares
        fields = [
            # Atributos heredados de Persona
            'id', 'nombre', 'apellido', 'telefono', 'imagen', 'estado', 'sexo', 
            'tipo', 'fecha_registro', 'CI', 'fecha_nacimiento', 'nombre_completo', 'luxand_uuid',
            # Atributos específicos de Familiares
            'persona_relacionada', 'parentesco',
            # Campos calculados
            'persona_relacionada_nombre', 'persona_relacionada_ci'
        ]
        read_only_fields = ['id', 'fecha_registro', 'tipo', 'nombre_completo', 'luxand_uuid']
    
    def validate(self, data):
        """
        Validar que el familiar no sea el mismo que la persona relacionada
        """
        persona_relacionada = data.get('persona_relacionada')
        
        # Si estamos actualizando, verificar que no sea el mismo que la persona relacionada
        if self.instance and persona_relacionada and self.instance.id == persona_relacionada.id:
            raise serializers.ValidationError("El familiar no puede ser el mismo que la persona relacionada.")
        
        return data
    
    def create(self, validated_data):
        """
        Crear familiar asegurando que el tipo sea 'F'
        """
        validated_data['tipo'] = 'F'
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """
        Actualizar familiar manteniendo el tipo como 'F'
        """
        validated_data['tipo'] = 'F'
        return super().update(instance, validated_data)


class FamiliaresListSerializer(serializers.ModelSerializer):
    """
    Serializer para listar familiares con información completa
    """
    persona_relacionada_nombre = serializers.CharField(source='persona_relacionada.nombre_completo', read_only=True)
    persona_relacionada_ci = serializers.CharField(source='persona_relacionada.CI', read_only=True)
    nombre_completo = serializers.ReadOnlyField()
    luxand_uuid = serializers.ReadOnlyField()
    
    class Meta:
        model = Familiares
        fields = [
            # Atributos heredados de Persona
            'id', 'nombre', 'apellido', 'telefono', 'imagen', 'estado', 'sexo', 
            'tipo', 'fecha_registro', 'CI', 'fecha_nacimiento', 'nombre_completo', 'luxand_uuid',
            # Atributos específicos de Familiares
            'persona_relacionada', 'parentesco',
            # Campos calculados
            'persona_relacionada_nombre', 'persona_relacionada_ci'
        ]
