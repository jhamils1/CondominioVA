from rest_framework import serializers
from ..modelsVehiculo import Vehiculo
from administracion.models import Persona  
from administracion.access import effective_role


class VehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = '__all__'
        read_only_fields = ['fecha_registro']

    def validate_persona(self, value):
        request = self.context.get('request')
        if request and effective_role(request.user) in ('propietario', 'inquilino') and value.user_id != request.user.pk:
            raise serializers.ValidationError('Solo puede gestionar sus propios vehículos.')
        return value

class PersonaAuxSerializers(serializers.ModelSerializer):
    class Meta:
        model = Persona
        fields = ['id', 'nombre']
