from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContratoViewSet, ExpensaViewSet, MultaViewSet
from .views_payments import CreatePaymentIntentExpensa, VerifyPaymentIntentExpensa
from .viewsDashboard import (
    dashboard_resumen_financiero,
    grafico_expensas_estado,
    grafico_ingresos_mensuales,
    grafico_morosos_ranking,
    grafico_comparativo_anual
)
from fcm_django.api.rest_framework import FCMDeviceAuthorizedViewSet


# Router
router = DefaultRouter()
router.register(r'contratos', ContratoViewSet, basename='contratos')
router.register(r'expensas', ExpensaViewSet, basename='expensas')
router.register(r'multas', MultaViewSet, basename='multas')
router.register(r'devices', FCMDeviceAuthorizedViewSet, basename='devices')

urlpatterns = [
    path('', include(router.urls)),
    path("create-payment-intent/", CreatePaymentIntentExpensa.as_view()),
    path("verify-payment-intent/", VerifyPaymentIntentExpensa.as_view()),
    
    # Dashboard endpoints
    path('resumen/', dashboard_resumen_financiero, name='dashboard-resumen'),
    path('grafico-expensas/', grafico_expensas_estado, name='grafico-expensas'),
    path('grafico-ingresos/', grafico_ingresos_mensuales, name='grafico-ingresos'),
    path('grafico-morosos/', grafico_morosos_ranking, name='grafico-morosos'),
    path('grafico-comparativo/', grafico_comparativo_anual, name='grafico-comparativo'),
]