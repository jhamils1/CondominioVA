from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LogoutView, UserViewSet, RolViewSet,
    PersonaViewSet, CargoViewSet, EmpleadoViewSet, GroupAuxViewSet, PermissionViewSet, CustomTokenObtainPairView, CSRFTokenView, CurrentUserView
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .authentication import ApplicationTokenRefreshSerializer
from .provision import ProvisionarCuentaView

class ApplicationTokenRefreshView(TokenRefreshView):
    serializer_class = ApplicationTokenRefreshSerializer

# Router principal
router = DefaultRouter()

# URLs existentes (CU1, CU2, CU3, CU4, CU5)
router.register(r'users', UserViewSet, basename='users')
router.register(r'roles', RolViewSet, basename='roles')
router.register(r'groupsAux', GroupAuxViewSet, basename='groupsAux')
router.register(r'permissions', PermissionViewSet, basename='permissions')

# URLs para gestionar personas
router.register(r'personas', PersonaViewSet, basename='personas')

# URLs para gestionar empleados
router.register(r'cargos', CargoViewSet, basename='cargos')
router.register(r'empleados', EmpleadoViewSet, basename='empleados')

urlpatterns = [
    path('provisionar-cuenta/', ProvisionarCuentaView.as_view(), name='provisionar-cuenta'),
    path('', include(router.urls)),
    
    # Usa tu vista personalizada para el login
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('refresh/', ApplicationTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    # Añade la ruta para la vista del token CSRF
    path('csrf/', CSRFTokenView.as_view(), name='csrf_token'),
]
