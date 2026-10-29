# residencial/views_payments.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.conf import settings
from django.shortcuts import get_object_or_404
from decimal import Decimal
import stripe
from .models import expensa as Expensa

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreatePaymentIntentExpensa(APIView):
    """
    POST { "expensa_id": 123 }
    -> crea un PaymentIntent y devuelve { client_secret }
    Usar con Stripe Elements en el frontend (sin redirección).
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        expensa_id = request.data.get("expensa_id")
        exp = get_object_or_404(Expensa, id=expensa_id)
        amount_cents = int(Decimal(exp.monto) * 100)

        # Idempotencia por si el front reintenta
        idem_key = f"pi-expensa-{exp.id}"

        pi = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",                      # en test usa USD
            metadata={"expensa_id": str(exp.id)},
            automatic_payment_methods={"enabled": True},
            idempotency_key=idem_key
        )

        # (Opcional) guarda el id del PI en la expensa
        if hasattr(exp, "stripe_payment_intent_id"):
            exp.stripe_payment_intent_id = pi.id
            exp.save(update_fields=["stripe_payment_intent_id"])

        return Response({"client_secret": pi.client_secret}, status=status.HTTP_201_CREATED)


class VerifyPaymentIntentExpensa(APIView):
    """
    GET ?payment_intent_id=pi_xxx
    -> devuelve estado del PaymentIntent y marca pagada=True si 'succeeded'
    (útil si quieres verificar desde el front sin webhooks).
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        pi_id = request.query_params.get("payment_intent_id")
        if not pi_id:
            return Response({"error": "payment_intent_id requerido"}, status=400)

        pi = stripe.PaymentIntent.retrieve(pi_id)
        status_pi = pi.get("status")  # 'succeeded', 'requires_payment_method', etc.
        expensa_id = (pi.get("metadata") or {}).get("expensa_id")

        if status_pi == "succeeded" and expensa_id:
            Expensa.objects.filter(id=expensa_id).update(pagada=True)

        return Response({"status": status_pi, "expensa_id": expensa_id})
