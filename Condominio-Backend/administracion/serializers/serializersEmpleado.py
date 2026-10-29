from rest_framework import serializers
from ..models import Empleado, Cargo
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import date



class CargoSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Cargo
    """
    class Meta:
        model = Cargo
        fields = ['id', 'nombre', 'salario_base']
    
    def validate_nombre(self, value):
        """
        Validar que el nombre del cargo sea único
        """
        if self.instance:
            if Cargo.objects.filter(nombre=value).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError("Ya existe un cargo con este nombre.")
        else:
            if Cargo.objects.filter(nombre=value).exists():
                raise serializers.ValidationError("Ya existe un cargo con este nombre.")
        return value
    
    def validate_salario_base(self, value):
        """
        Validar que el salario base sea positivo
        """
        if value <= 0:
            raise serializers.ValidationError("El salario base debe ser mayor a 0.")
        return value


class EmpleadoSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Empleado
    """
    cargo_nombre = serializers.CharField(source='cargo.nombre', read_only=True)
    nombre_completo = serializers.ReadOnlyField()
    luxand_uuid = serializers.ReadOnlyField()
    
    class Meta:
        model = Empleado
        fields = [
            'id', 'nombre', 'apellido', 'telefono', 'direccion', 'sexo', 'CI', 
            'fecha_nacimiento', 'estado', 'sueldo', 'imagen', 'fecha_registro', 'cargo', 'cargo_nombre', 
            'nombre_completo', 'luxand_uuid'
        ]
        read_only_fields = ['id', 'fecha_registro', 'luxand_uuid']
    def validate_CI(self, value):
        """
        Validar que la cédula sea única
        """
        if self.instance:
            if Empleado.objects.filter(CI=value).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError("Esta cédula ya está registrada.")
        else:
            if Empleado.objects.filter(CI=value).exists():
                raise serializers.ValidationError("Esta cédula ya está registrada.")
        return value
    
    def validate_sueldo(self, value):
        """
        Validar que el sueldo sea positivo
        """
        if value <= 0:
            raise serializers.ValidationError("El sueldo debe ser mayor a 0.")
        return value
    
    def validate_cargo(self, value):
        """
        Validar que el cargo exista
        """
        if not value:
            raise serializers.ValidationError("El cargo es requerido.")
        return value


class EmpleadoListSerializer(serializers.ModelSerializer):
    """
    Serializer para listar empleados con todos los campos necesarios
    """
    cargo_nombre = serializers.CharField(source='cargo.nombre', read_only=True)
    nombre_completo = serializers.ReadOnlyField()
    luxand_uuid = serializers.ReadOnlyField()
    class Meta:
        model = Empleado
        fields = [
            'id', 'nombre', 'apellido', 'nombre_completo', 'telefono', 'direccion', 
            'sexo', 'CI', 'fecha_nacimiento', 'estado', 'sueldo', 'imagen', 'fecha_registro',
            'cargo', 'cargo_nombre', 'luxand_uuid'
        ]
        read_only_fields = ['id', 'fecha_registro', 'luxand_uuid']