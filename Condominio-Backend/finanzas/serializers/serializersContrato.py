from rest_framework import serializers
from administracion.models import Persona
from ..models import contrato

class ContratoSerializer(serializers.ModelSerializer):
    contrato_PDF = serializers.CharField(read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    propietario_nombre = serializers.CharField(source='propietario.nombre', read_only=True)
    propietario_apellido = serializers.CharField(source='propietario.apellido', read_only=True)
    unidad_codigo = serializers.CharField(source='unidad.codigo', read_only=True)

    class Meta:
        model = contrato
        fields = "__all__"

