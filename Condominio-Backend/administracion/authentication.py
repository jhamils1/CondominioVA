from django.contrib.auth import get_user_model
from django.db import transaction
from django.core.exceptions import ValidationError
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.admin.models import CHANGE
import logging

from .access import effective_role
from .audit import record_action
from .models import SesionAplicacion

logger = logging.getLogger(__name__)


class ApplicationJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        if not effective_role(user):
            raise AuthenticationFailed('La cuenta no tiene un rol o perfil autorizado.')
        session_id = validated_token.get('session_id')
        try:
            active = session_id and SesionAplicacion.objects.filter(
                pk=session_id, usuario=user, revocada__isnull=True).exists()
        except (ValidationError, ValueError, TypeError):
            active = False
        if not active:
            raise AuthenticationFailed('La sesión no está activa. Inicia sesión de nuevo.')
        return user


class ApplicationTokenObtainSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        session = SesionAplicacion.objects.create(usuario=user)
        token['session_id'] = str(session.pk)
        return token

    @transaction.atomic
    def validate(self, attrs):
        try:
            result = super().validate(attrs)
        except AuthenticationFailed:
            logger.warning('Intento de inicio de sesión rechazado')
            raise
        if not effective_role(self.user):
            logger.warning('Inicio de sesión rechazado por rol o perfil')
            raise AuthenticationFailed('La cuenta no tiene un rol o perfil autorizado.')
        record_action(self.user, self.user, 'Inicio de sesión', CHANGE)
        return result


class ApplicationTokenRefreshSerializer(TokenRefreshSerializer):
    @transaction.atomic
    def validate(self, attrs):
        token = RefreshToken(attrs['refresh'])
        user_id = token.get(api_settings.USER_ID_CLAIM)
        user = get_user_model().objects.filter(**{api_settings.USER_ID_FIELD: user_id}).first()
        if not user or not effective_role(user):
            raise AuthenticationFailed('La cuenta no tiene un rol o perfil autorizado.')
        try:
            session = SesionAplicacion.objects.select_for_update().filter(
                pk=token.get('session_id'), usuario=user, revocada__isnull=True).first()
        except (ValidationError, ValueError, TypeError):
            session = None
        if not session:
            raise AuthenticationFailed('La sesión no está activa. Inicia sesión de nuevo.')
        # Revalidar tras adquirir el bloqueo: otra petición pudo revocar el refresh.
        RefreshToken(attrs['refresh'])
        return super().validate(attrs)
