from rest_framework import serializers
from ..modelsVehiculo import Bloque, Unidad

class BloqueAuxSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bloque
        fields = ['id', 'nombre']

class UnidadSerializer(serializers.ModelSerializer):
    bloque_nombre = serializers.CharField(source='bloque.nombre', read_only=True)
    class Meta:
        model = Unidad
        fields = '__all__'