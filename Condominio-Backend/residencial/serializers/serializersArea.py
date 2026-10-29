from rest_framework import serializers
from residencial.models import AreasComunes

class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AreasComunes
        fields = '__all__'