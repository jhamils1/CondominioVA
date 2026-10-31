from rest_framework import serializers
from django.contrib.auth.models import Group, Permission
from administracion.access import ROLE_NAMES

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename']

class RolSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Permission.objects.all(),
        write_only=True,
        source='permissions'
    )

    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions', 'permission_ids']

    def validate_name(self, value):
        canonical = ROLE_NAMES.get(value.strip().casefold())
        if not canonical:
            raise serializers.ValidationError('Solo se permiten los cuatro roles funcionales.')
        for group in Group.objects.exclude(pk=getattr(self.instance, 'pk', None)):
            if ROLE_NAMES.get(group.name.strip().casefold()) == canonical:
                raise serializers.ValidationError('Ya existe un rol equivalente.')
        if self.instance and ROLE_NAMES.get(self.instance.name.strip().casefold()) != canonical:
            raise serializers.ValidationError('No se puede cambiar el significado de un rol existente.')
        return value.strip()

class RolListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']

