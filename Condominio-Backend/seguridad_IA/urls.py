# seguridad_IA/urls.py
from django.urls import path
from .views import AlprScanView, ReconocimientoGlobalView, EnrolarPersonaView, VerificarEnrolamientoView, VerificarLuxandAPIView, ProbarLuxandView

urlpatterns = [
    path("alpr/", AlprScanView.as_view(), name="alpr-scan"),
    path("reconocimiento/", ReconocimientoGlobalView.as_view(), name="reconocimiento-global"),
    path("enrolar/", EnrolarPersonaView.as_view(), name="enrolar-persona"),
    path("verificar-enrolamiento/", VerificarEnrolamientoView.as_view(), name="verificar-enrolamiento"),
    path("verificar-luxand/", VerificarLuxandAPIView.as_view(), name="verificar-luxand"),
    path("probar-luxand/", ProbarLuxandView.as_view(), name="probar-luxand"),
]
