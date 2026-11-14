from django.db import models


class Camara(models.Model):
    TIPO = [('RED', 'Cámara de red'), ('LOCAL', 'Cámara local')]
    nombre = models.CharField(max_length=100)
    ubicacion = models.CharField(max_length=150, blank=True)
    tipo = models.CharField(max_length=10, choices=TIPO)
    fabricante = models.CharField(max_length=80, blank=True)
    modelo = models.CharField(max_length=100, blank=True)
    direccion_ip = models.GenericIPAddressField(protocol='IPv4', blank=True, null=True)
    puerto_rtsp = models.PositiveIntegerField(blank=True, null=True)
    usuario_dispositivo = models.CharField(max_length=150, blank=True)
    ruta_rtsp = models.CharField(max_length=500, blank=True)
    contrasena_cifrada = models.BinaryField(blank=True, null=True, editable=False)
    activa = models.BooleanField(default=True)
    creada = models.DateTimeField(auto_now_add=True)
    actualizada = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nombre', 'id']
        verbose_name = 'cámara'

    def __str__(self):
        return self.nombre


class MonitorImou(models.Model):
    """Vínculo estable de la zona Imou existente con una cámara del catálogo."""
    camara = models.OneToOneField(Camara, on_delete=models.PROTECT, related_name='monitor_imou')
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Cámara del monitor Imou'
        constraints = [models.CheckConstraint(condition=models.Q(id=1), name='monitor_imou_unico')]


class FuncionesPropuestasCamara(models.Model):
    """Preferencias preparatorias; no controlan el procesamiento actual."""
    camara = models.OneToOneField(Camara, on_delete=models.CASCADE, related_name='funciones_propuestas')
    lectura_placas = models.BooleanField(default=False)
    incidencias_zona = models.BooleanField(default=False)
    actualizado = models.DateTimeField(auto_now=True)
