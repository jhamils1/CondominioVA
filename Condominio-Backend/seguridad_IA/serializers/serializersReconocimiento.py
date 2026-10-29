from rest_framework import serializers

class ReconocimientoRequestSerializer(serializers.Serializer):
    image_url = serializers.URLField(required=False, allow_blank=True)
    image_file = serializers.ImageField(required=False)
    umbral = serializers.FloatField(default=0.80, min_value=0.0, max_value=1.0)
    
    def validate(self, data):
        if not data.get('image_url') and not data.get('image_file'):
            raise serializers.ValidationError("Debe proporcionar image_url o image_file")
        return data

class ReconocimientoResponseSerializer(serializers.Serializer):
    ok = serializers.BooleanField()
    tipo = serializers.CharField(allow_null=True)
    id = serializers.IntegerField(allow_null=True)
    nombre = serializers.CharField(allow_null=True)
    similaridad = serializers.FloatField()
    uuid = serializers.CharField(allow_null=True)
    umbral = serializers.FloatField()
    reason = serializers.CharField(required=False, allow_null=True)
