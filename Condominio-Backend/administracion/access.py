"""Application roles and data scopes; Django's staff flags are separate."""
from rest_framework.permissions import BasePermission


ROLE_NAMES = {
    'administrador': 'administrador',
    'seguridad': 'guardia',
    'guardia de seguridad': 'guardia',
    'propietario': 'propietario',
    'inquilino': 'inquilino',
}


def assigned_role(user):
    """Return a role only when the account has one recognized group."""
    if not user or not user.is_authenticated or not user.is_active:
        return None
    persona = getattr(user, 'persona', None)
    if persona and persona.tipo in ('F', 'V'):
        return None
    names = list(user.groups.values_list('name', flat=True))
    if len(names) != 1:
        return None
    return ROLE_NAMES.get(names[0].strip().casefold())


def effective_role(user):
    role = assigned_role(user)
    if role in ('propietario', 'inquilino'):
        persona = getattr(user, 'persona', None)
        expected = 'P' if role == 'propietario' else 'I'
        if not persona or persona.tipo != expected or persona.estado != 'A':
            return None
        if role == 'inquilino' and not hasattr(persona, 'inquilino'):
            return None
    elif role == 'guardia':
        employee = getattr(user, 'empleado', None)
        if not employee or employee.estado != 'A':
            return None
    return role


def is_admin(user):
    return effective_role(user) == 'administrador'


def owner_persona(user):
    if effective_role(user) in ('propietario', 'inquilino'):
        return user.persona
    return None


class ApplicationRolePermission(BasePermission):
    """Views specify role sets per action; unknown actions are denied."""
    def has_permission(self, request, view):
        role = effective_role(request.user)
        if role is None:
            return False
        action = getattr(view, 'action', None) or request.method.lower()
        allowed = getattr(view, 'role_access', {}).get(action, ())
        return role in allowed


class AdministratorOnly(BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user)


class SecurityOperator(BasePermission):
    def has_permission(self, request, view):
        return effective_role(request.user) in ('administrador', 'guardia')


def roles_for(read=(), write=(), extra=None):
    roles = {'list': read, 'retrieve': read, 'create': write, 'update': write,
             'partial_update': write, 'destroy': write, 'metadata': read}
    roles.update(extra or {})
    return roles
