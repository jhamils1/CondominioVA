from django.db import models
from django.utils import timezone

class Vehiculo(models.Model):
    TIPO_CHOICES = [
        ('Automóvil', 'Automóvil'),
        ('Camioneta', 'Camioneta'),
        ('SUV', 'SUV'),
        ('Motocicleta', 'Motocicleta'),
        ('Furgoneta', 'Furgoneta'),
        ('Crossover', 'Crossover'),
    ]
    
    id = models.AutoField(primary_key=True)
    color = models.CharField(max_length=20, verbose_name='Color')
    marca = models.CharField(max_length=20, verbose_name='Marca')
    modelo = models.CharField(max_length=20, verbose_name='Modelo')
    placa = models.CharField(max_length=20, verbose_name='Placa')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, verbose_name='Tipo')
    imagen = models.URLField(blank=True, null=True, verbose_name='Imagen')
    fecha_registro = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Registro')
    persona = models.ForeignKey('administracion.Persona',on_delete=models.CASCADE,verbose_name='Propietario')
    
    class Meta:
        db_table = 'vehiculo'
        verbose_name = "Vehículo"
        verbose_name_plural = "Vehículos"
        ordering = ['marca', 'modelo']
    
    def __str__(self):
        return f"{self.marca} {self.modelo} - {self.placa}"

class Bloque(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=20, verbose_name="Nombre del Bloque")
    direccion = models.CharField(max_length=100, verbose_name="Dirección")
    
    class Meta:
        db_table = 'bloque'
        verbose_name = "Bloque"
        verbose_name_plural = "Bloques"
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre

class Unidad(models.Model):
    TIPO_UNIDAD_CHOICES = [
        ('A', 'Apartamento'),
        ('C', 'Casa'),
        ('L', 'Local Comercial'),
        ('E', 'Estacionamiento'),
    ]
    ESTADO_CHOICES = [
        ('D', 'Disponible'),
        ('O', 'Ocupada'),
        ('M', 'En Mantenimiento'),
        ('R', 'Reservada'),
    ]
    
    id = models.AutoField(primary_key=True)
    numero = models.CharField(max_length=10, verbose_name="Número de Unidad")
    codigo = models.CharField(max_length=20, unique=True, verbose_name="Código de Unidad")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción")
    imagen = models.URLField(blank=True, null=True, verbose_name='Imagen')
    dimensiones = models.CharField(max_length=100, blank=True, null=True, verbose_name="Dimensiones")
    tipo_unidad = models.CharField(max_length=1, choices=TIPO_UNIDAD_CHOICES, default='A', verbose_name="Tipo de Unidad")
    estado = models.CharField(max_length=1, choices=ESTADO_CHOICES, default='D', verbose_name="Estado")
    bloque = models.ForeignKey(Bloque, on_delete=models.CASCADE, verbose_name="Bloque")
    numero_piso = models.PositiveIntegerField(default=1, verbose_name="Número de Piso")
    area_m2 = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True,verbose_name="Área en m²")
    fecha_creacion = models.DateTimeField(default=timezone.now, verbose_name="Fecha de Creación")
    
    class Meta:
        db_table = 'unidad'
        verbose_name = "Unidad"
        verbose_name_plural = "Unidades"
        ordering = ['bloque', 'numero_piso', 'numero']
        unique_together = ['bloque', 'numero']
    
    def __str__(self):
        return f"{self.codigo} - {self.numero}"

class incidente(models.Model):
    id = models.AutoField(primary_key=True)
    propietario = models.ForeignKey('administracion.Persona', on_delete=models.CASCADE, related_name='incidentes_propietario', null=True, blank=True)
    multa = models.ForeignKey('finanzas.multa', on_delete=models.CASCADE, related_name='incidentes_multa', null=True, blank=True)
    descripcion = models.TextField()
    fecha_incidente = models.DateTimeField()
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'incidente'
        verbose_name = "Incidente"
        verbose_name_plural = "Incidentes"
        
    def __str__(self):
        if self.propietario:
            return f"Incidente {self.id} - Propietario: {self.propietario.nombre} {self.propietario.apellido}"
        return f"Incidente {self.id} - Sin propietario"