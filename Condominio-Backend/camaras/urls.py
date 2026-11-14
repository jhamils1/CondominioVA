from rest_framework.routers import SimpleRouter
from .api import CamaraViewSet

router = SimpleRouter()
router.register('camaras', CamaraViewSet, basename='camaras')
urlpatterns = router.urls
