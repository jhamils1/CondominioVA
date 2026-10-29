from rest_framework import serializers
from ..models import multa

class MultaSerializer(serializers.ModelSerializer):
    class Meta:
        model = multa
        fields = '__all__'