from django.contrib.admin import AdminSite

from administracion.access import ROLE_NAMES


class TechnicalAdminSite(AdminSite):
    """Do not grant Django Admin access merely through an application role."""
    def has_permission(self, request):
        if not super().has_permission(request):
            return False
        persona = getattr(request.user, 'persona', None)
        if persona and persona.tipo in ('F', 'V'):
            return False
        names = list(request.user.groups.values_list('name', flat=True))
        roles = {ROLE_NAMES.get(name.strip().casefold()) for name in names}
        if roles.intersection({'guardia', 'propietario', 'inquilino'}):
            return False
        return request.user.is_superuser
