from rest_framework import serializers
from django.utils import timezone
from ..models import expensa as Expensa  # ajusta si tu clase es Expensa con mayúscula

class ExpensaSerializer(serializers.ModelSerializer):
    destinatario = serializers.SerializerMethodField()
    unidad_detalle = serializers.SerializerMethodField()
    dias_restantes = serializers.SerializerMethodField()
    vencida = serializers.SerializerMethodField()  # opcional útil para el front

    class Meta:
        model = Expensa
        fields = "__all__"  # incluye campos del modelo + los SerializerMethodField
        read_only_fields = [
            "fecha_emision",
            "stripe_session_id",
            "stripe_payment_intent_id",
        ]

    # --- A quién le corresponde la expensa ---
    def get_destinatario(self, obj):
        unidad = getattr(obj, "unidad", None)
        if not unidad:
            return None

        # 1) si Unidad tiene FK directo a contrato
        contrato = getattr(unidad, "contrato", None)

        # 2) si es relación inversa (varios contratos)
        if contrato is None:
            contratos_rel = getattr(unidad, "contratos", None)
            if hasattr(contratos_rel, "filter"):
                contrato = contratos_rel.filter(estado='A').order_by("-id").first()

        if not contrato:
            return None

        persona = getattr(contrato, "persona", None)
        if not persona:
            propietario = getattr(contrato, "propietario", None)
            if propietario:
                persona = getattr(propietario, "persona", None)

        if not persona:
            return None

        return {
            "id": getattr(persona, "id", None),
            "nombre": getattr(persona, "nombre", None),
            "apellido": getattr(persona, "apellido", None),
            "nombre_completo": f"{getattr(persona, 'nombre', '')} {getattr(persona, 'apellido', '')}".strip() or None,
        }

    # --- Detalle de la unidad ---
    def get_unidad_detalle(self, obj):
        u = getattr(obj, "unidad", None)
        if not u:
            return None

        bloque = getattr(u, "bloque", None)
        return {
            "id": getattr(u, "id", None),
            "numero": getattr(u, "numero", None),
            "bloque": {
                "id": getattr(bloque, "id", None),
                "nombre": getattr(bloque, "nombre", None),
            } if bloque else None,
        }

    # --- Días restantes al vencimiento ---
    def get_dias_restantes(self, obj):
        fv = getattr(obj, "fecha_vencimiento", None)
        if not fv:
            return None
        hoy = timezone.now().date()
        return (fv - hoy).days

    # --- Conveniencia para el front ---
    def get_vencida(self, obj):
        fv = getattr(obj, "fecha_vencimiento", None)
        if not fv:
            return None
        return fv < timezone.now().date()

