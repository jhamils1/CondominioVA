from rest_framework import serializers
from ..models import Visita

class VisitaSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Visita
    """
    visitante_nombre = serializers.CharField(source='visitante.nombre_completo', read_only=True)
    visitante_ci = serializers.CharField(source='visitante.CI', read_only=True)
    recibe_persona_nombre = serializers.CharField(source='recibe_persona.nombre_completo', read_only=True)
    recibe_persona_ci = serializers.CharField(source='recibe_persona.CI', read_only=True)
    
    class Meta:
        model = Visita
        fields = [
            'id', 'estado', 'fecha_hora_entrada', 'fecha_hora_salida',
            'visitante', 'recibe_persona', 'fecha_registro',
            'visitante_nombre', 'visitante_ci', 'recibe_persona_nombre', 'recibe_persona_ci'
        ]
        read_only_fields = ['id', 'fecha_registro']
    
    def validate_visitante(self, value):
        """
        Validar que el visitante sea de tipo 'V'
        """
        if not value:
            raise serializers.ValidationError("Debe seleccionar un visitante.")
        if value.tipo != 'V':
            raise serializers.ValidationError("La persona seleccionada no es un visitante.")
        return value
    
    def validate_recibe_persona(self, value):
        """
        Validar que la persona que recibe sea propietario o inquilino
        """
        if not value:
            raise serializers.ValidationError("Debe seleccionar una persona que reciba la visita.")
        if value.tipo not in ['P', 'I']:
            raise serializers.ValidationError("La persona seleccionada debe ser propietario o inquilino.")
        return value


class VisitaListSerializer(serializers.ModelSerializer):
    """
    Serializer para listar visitas con información completa
    """
    visitante_nombre = serializers.CharField(source='visitante.nombre_completo', read_only=True)
    visitante_ci = serializers.CharField(source='visitante.CI', read_only=True)
    recibe_persona_nombre = serializers.CharField(source='recibe_persona.nombre_completo', read_only=True)
    recibe_persona_ci = serializers.CharField(source='recibe_persona.CI', read_only=True)
    
    class Meta:
        model = Visita
        fields = [
            'id', 'estado', 'fecha_hora_entrada', 'fecha_hora_salida',
            'visitante', 'recibe_persona', 'fecha_registro',
            'visitante_nombre', 'visitante_ci', 'recibe_persona_nombre', 'recibe_persona_ci'
        ]
