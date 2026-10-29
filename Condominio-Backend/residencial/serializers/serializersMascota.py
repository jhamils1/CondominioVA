from rest_framework import serializers
from ..models import Mascota

class MascotaSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Mascota
    """
    persona_nombre = serializers.CharField(source='persona.nombre_completo', read_only=True)
    persona_ci = serializers.CharField(source='persona.CI', read_only=True)
    
    class Meta:
        model = Mascota
        fields = [
            'id', 'nombre', 'especie', 'tipo', 'foto', 'raza', 
            'fecha_nacimiento', 'observaciones', 'fecha_registro',
            'persona', 'persona_nombre', 'persona_ci'
        ]
        read_only_fields = ['id', 'fecha_registro']
    
    def validate_persona(self, value):
        """
        Validar que la persona exista y sea válida
        """
        if not value:
            raise serializers.ValidationError("Debe seleccionar un propietario.")
        return value


class MascotaListSerializer(serializers.ModelSerializer):
    """
    Serializer para listar mascotas con información completa
    """
    persona_nombre = serializers.CharField(source='persona.nombre_completo', read_only=True)
    persona_ci = serializers.CharField(source='persona.CI', read_only=True)
    
    class Meta:
        model = Mascota
        fields = [
            'id', 'nombre', 'especie', 'tipo', 'foto', 'raza', 
            'fecha_nacimiento', 'observaciones', 'fecha_registro',
            'persona', 'persona_nombre', 'persona_ci'
        ]
