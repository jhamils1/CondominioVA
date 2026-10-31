from rest_framework import serializers
from django.contrib.auth.models import User, Group
from administracion.access import ROLE_NAMES, assigned_role

class GroupAuxSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'role_id', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance:
            self.fields['password'].required = False

    def get_role(self, obj):
        names = list(obj.groups.values_list('name', flat=True))
        return names[0] if len(names) == 1 else None

    def validate_username(self, value):
        if " " in value:
            raise serializers.ValidationError("El nombre de usuario no puede tener espacios.")
        if len(value) < 3:
            raise serializers.ValidationError("El nombre de usuario debe tener al menos 3 caracteres.")
        return value

    def validate_email(self, value):
        if self.instance:
            if User.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError("Este email ya está en uso.")
        else:
            if User.objects.filter(email=value).exists():
                raise serializers.ValidationError("Este email ya está en uso.")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("La contraseña debe contener al menos un número.")
        if not any(char.isalpha() for char in value):
            raise serializers.ValidationError("La contraseña debe contener al menos una letra.")
        return value

    def validate(self, data):
        if not self.instance and not data.get('role_id'):
            raise serializers.ValidationError({
                'role_id': 'Debe asignar un rol al usuario.'
            })
        group = data.get('role_id')
        if group and group.name.strip().casefold() not in ROLE_NAMES:
            raise serializers.ValidationError({'role_id': 'El rol no está autorizado.'})
        request = self.context.get('request')
        if self.instance and request:
            if self.instance.is_superuser and self.instance.pk != request.user.pk:
                raise serializers.ValidationError('Las cuentas técnicas se administran por separado.')
            current_groups = set(self.instance.groups.values_list('pk', flat=True))
            if request.user.pk == self.instance.pk and group and current_groups != {group.pk}:
                raise serializers.ValidationError({'role_id': 'No puede cambiar su propio rol.'})
            if request.user.pk == self.instance.pk and data.get('is_active') is False:
                raise serializers.ValidationError({'is_active': 'No puede desactivar su propia cuenta.'})
            removing_admin = assigned_role(self.instance) == 'administrador' and (
                data.get('is_active') is False or (group and ROLE_NAMES[group.name.strip().casefold()] != 'administrador')
            )
            if removing_admin and not User.objects.filter(
                is_active=True, groups__name__iexact='administrador'
            ).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError('Debe conservarse al menos un administrador activo.')
        return data

    def create(self, validated_data):
        group_data = validated_data.pop('role_id', None)
        user = User.objects.create_user(**validated_data)
        if group_data:
            user.groups.set([group_data])
        return user

    def update(self, instance, validated_data):
        group_data = validated_data.pop('role_id', None)
        if 'password' in validated_data:
            instance.set_password(validated_data.pop('password'))
        instance = super().update(instance, validated_data)
        if group_data is not None:
            instance.groups.set([group_data])
        return instance
