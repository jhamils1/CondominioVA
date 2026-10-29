from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone

# Create your models here.

class Persona(models.Model):
    """
    Modelo base para todas las personas en el sistema.
    Esta tabla servirá como base para propietarios, copropietarios, familiares, visitantes y administradores.
    """
    SEXO_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
    ]
    
    ESTADO_CHOICES = [
        ('A', 'Activo'),
        ('I', 'Inactivo'),
        ('S', 'Suspendido'),
    ]
    
    TIPO_CHOICES = [
        ('P', 'Propietario'),
        ('I', 'Inquilino'),
        ('F', 'Familiar'),
        ('V', 'Visitante'),
    ]
    
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, verbose_name="Nombre")
    apellido = models.CharField(max_length=100, verbose_name="Apellido")
    telefono = models.CharField(max_length=15, verbose_name="Teléfono", blank=True, null=True)
    imagen = models.URLField(blank=True, null=True, verbose_name='Imagen')
    estado = models.CharField(max_length=1, choices=ESTADO_CHOICES, default='A', verbose_name="Estado")
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES, verbose_name="Sexo")
    tipo = models.CharField(max_length=1, choices=TIPO_CHOICES, verbose_name="Tipo de Persona")
    fecha_registro = models.DateTimeField(default=timezone.now, verbose_name="Fecha de Registro")
    CI = models.CharField(max_length=20, unique=True, verbose_name="Cédula de Identidad")
    fecha_nacimiento = models.DateField(verbose_name="Fecha de Nacimiento")
    luxand_uuid = models.CharField(max_length=64, blank=True, null=True)
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        blank=True, 
        null=True, 
        verbose_name="Usuario Asociado"
    )
    
    class Meta:
        db_table = 'persona'
        verbose_name = "Persona"
        verbose_name_plural = "Personas"
        ordering = ['apellido', 'nombre']
    
    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.CI}"
    
    @property
    def nombre_completo(self):
        return f"{self.nombre} {self.apellido}"


class Cargo(models.Model):
    """
    Modelo para los cargos/posiciones de los empleados
    """
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Nombre del Cargo")
    salario_base = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Salario Base", default=0.00)
    
    class Meta:
        db_table = 'cargo'
        verbose_name = "Cargo"
        verbose_name_plural = "Cargos"
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre


class Empleado(models.Model):
    """
    Modelo para empleados según el ERD
    """
    SEXO_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
    ]
    
    ESTADO_CHOICES = [
        ('A', 'Activo'),
        ('I', 'Inactivo'),
        ('S', 'Suspendido'),
    ]
    
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, verbose_name="Nombre")
    apellido = models.CharField(max_length=100, verbose_name="Apellido")
    telefono = models.CharField(max_length=15, verbose_name="Teléfono", blank=True, null=True)
    direccion = models.TextField(verbose_name="Dirección")
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES, verbose_name="Sexo")
    CI = models.CharField(max_length=20, unique=True, verbose_name="Cédula de Identidad")
    fecha_nacimiento = models.DateField(verbose_name="Fecha de Nacimiento", default='1990-01-01')
    estado = models.CharField(max_length=1, choices=ESTADO_CHOICES, default='A', verbose_name="Estado")
    sueldo = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Sueldo")
    imagen = models.URLField(blank=True, null=True, verbose_name='Imagen')
    fecha_registro = models.DateTimeField(default=timezone.now, verbose_name="Fecha de Registro")
    luxand_uuid = models.CharField(max_length=64, blank=True, null=True)
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        blank=True, 
        null=True, 
        verbose_name="Usuario Asociado"
    )
    
    # Relación con Cargo
    cargo = models.ForeignKey(
        Cargo, 
        on_delete=models.PROTECT, 
        verbose_name="Cargo"
    )
    
    class Meta:
        db_table = 'empleado'
        verbose_name = "Empleado"
        verbose_name_plural = "Empleados"
        ordering = ['apellido', 'nombre']
    
    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.cargo.nombre}"
    
    @property
    def nombre_completo(self):
        return f"{self.nombre} {self.apellido}"

