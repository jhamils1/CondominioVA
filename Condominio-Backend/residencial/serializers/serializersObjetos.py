from rest_framework import serializers
from residencial.models import ObjetoPerdido

class ObjetoPerdidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjetoPerdido
        fields = '__all__'