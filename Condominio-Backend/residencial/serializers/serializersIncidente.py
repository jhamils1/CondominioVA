from rest_framework import serializers
from ..modelsVehiculo import incidente

class IncidenteSerializer(serializers.ModelSerializer):
    propietario_nombre = serializers.SerializerMethodField()
    multa_detalle = serializers.SerializerMethodField()
    fecha_incidente = serializers.DateTimeField(format="%d/%m/%Y %H:%M", required=False)
    fecha_registro = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)

    class Meta:
        model = incidente
        fields = '__all__'  # Incluye todos los campos originales
        extra_fields = ['propietario_nombre', 'multa_detalle']  # Agregados

    def get_propietario_nombre(self, obj):
        if obj.propietario:
            return f"{obj.propietario.nombre} {obj.propietario.apellido}"
        return None

    def get_multa_detalle(self, obj):
        if obj.multa:
            return {
                "id": obj.multa.id,
                "descripcion": getattr(obj.multa, "descripcion", None),
                "monto": getattr(obj.multa, "monto", None),
            }
        return None
