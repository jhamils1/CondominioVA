"""Minimal URL surface for the disposable inbox demonstration only."""
from django.urls import path
from administracion.views import CustomTokenObtainPairView, CurrentUserView, LogoutView
from seguridad_IA.api_notificaciones import EventoViewSet, NotificacionViewSet

urlpatterns = [
    path('api/login/', CustomTokenObtainPairView.as_view()),
    path('api/me/', CurrentUserView.as_view()),
    path('api/logout/', LogoutView.as_view()),
    path('api/notificaciones-seguridad/', NotificacionViewSet.as_view({'get': 'list'})),
    path('api/notificaciones-seguridad/<uuid:pk>/leer/', NotificacionViewSet.as_view({'post': 'leer'})),
    path('api/eventos-seguridad/<uuid:pk>/', EventoViewSet.as_view({'get': 'retrieve'})),
]
