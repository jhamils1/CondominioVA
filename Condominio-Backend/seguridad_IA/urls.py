# seguridad_IA/urls.py
from django.urls import include, path
from rest_framework.routers import SimpleRouter
from .api_notificaciones import EventoViewSet, NotificacionViewSet
from .api_camara_demo import CamaraAnalizarDemo, CamaraEstadoDemo
from .views import AlprScanView, ReconocimientoGlobalView, EnrolarPersonaView, VerificarEnrolamientoView, VerificarLuxandAPIView, ProbarLuxandView

router = SimpleRouter()
router.register('eventos-seguridad', EventoViewSet, basename='eventos-seguridad')
router.register('notificaciones-seguridad', NotificacionViewSet, basename='notificaciones-seguridad')

urlpatterns = [
    path('vision-camara/estado/', CamaraEstadoDemo.as_view(), name='vision-camara-estado'),
    path('vision-camara/analizar/', CamaraAnalizarDemo.as_view(), name='vision-camara-analizar'),
    path('', include(router.urls)),
    path("alpr/", AlprScanView.as_view(), name="alpr-scan"),
    path("reconocimiento/", ReconocimientoGlobalView.as_view(), name="reconocimiento-global"),
    path("enrolar/", EnrolarPersonaView.as_view(), name="enrolar-persona"),
    path("verificar-enrolamiento/", VerificarEnrolamientoView.as_view(), name="verificar-enrolamiento"),
    path("verificar-luxand/", VerificarLuxandAPIView.as_view(), name="verificar-luxand"),
    path("probar-luxand/", ProbarLuxandView.as_view(), name="probar-luxand"),
]
