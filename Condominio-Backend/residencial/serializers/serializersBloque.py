from rest_framework import serializers
from ..modelsVehiculo import Bloque

class BloqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bloque
        fields = '__all__'

