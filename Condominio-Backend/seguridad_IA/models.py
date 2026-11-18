from django.db import models
from django.utils import timezone
from residencial.modelsVehiculo import Vehiculo
from django.conf import settings
import uuid


class ZonaImou(models.Model):
    # Una sola fuente Imou local, no representa todavía un inventario de cámaras.
    id = models.PositiveSmallIntegerField(primary_key=True, default=1, editable=False)
    puntos = models.JSONField(default=list)
    segundos = models.PositiveSmallIntegerField(default=5)
    automatico = models.BooleanField(default=False)
    actualizado = models.DateTimeField(default=timezone.now)
    actualizado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)


class HistorialZonaImou(models.Model):
    puntos = models.JSONField()
    segundos = models.PositiveSmallIntegerField()
    automatico = models.BooleanField(default=False)
    fecha = models.DateTimeField(default=timezone.now)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)


class ZonaCamara(models.Model):
    camara = models.OneToOneField('camaras.Camara', on_delete=models.PROTECT, related_name='zona_seguridad')
    puntos = models.JSONField(default=list)
    segundos = models.PositiveSmallIntegerField(default=5)
    automatico = models.BooleanField(default=False)
    actualizado = models.DateTimeField(default=timezone.now)
    actualizado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)


class HistorialZonaCamara(models.Model):
    camara = models.ForeignKey('camaras.Camara', on_delete=models.PROTECT)
    puntos = models.JSONField()
    segundos = models.PositiveSmallIntegerField()
    automatico = models.BooleanField(default=False)
    fecha = models.DateTimeField(default=timezone.now)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)


class ReglaPiscina(models.Model):
    fuente = models.CharField(max_length=64, primary_key=True)
    puntos = models.JSONField(default=list)
    segundos = models.PositiveSmallIntegerField(default=10)
    automatico = models.BooleanField(default=False)
    actualizado = models.DateTimeField(default=timezone.now)
    actualizado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)


class HistorialReglaPiscina(models.Model):
    fuente = models.CharField(max_length=64)
    puntos = models.JSONField(default=list)
    segundos = models.PositiveSmallIntegerField(default=10)
    automatico = models.BooleanField(default=False)
    fecha = models.DateTimeField(default=timezone.now)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)


class ReglaMascota(models.Model):
    fuente = models.CharField(max_length=64, primary_key=True)
    puntos = models.JSONField(default=list)
    segundos = models.PositiveSmallIntegerField(default=0)
    automatico = models.BooleanField(default=False)
    actualizado = models.DateTimeField(default=timezone.now)
    actualizado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)


class HistorialReglaMascota(models.Model):
    fuente = models.CharField(max_length=64)
    puntos = models.JSONField(default=list)
    segundos = models.PositiveSmallIntegerField(default=0)
    automatico = models.BooleanField(default=False)
    fecha = models.DateTimeField(default=timezone.now)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)


class EventoSeguridad(models.Model):
    PENDIENTE = 'PENDIENTE_REVISION'
    CONFIRMADO = 'CONFIRMADA'
    FALSO = 'FALSO_POSITIVO'
    EN_ATENCION = 'EN_ATENCION'
    RESUELTA = 'RESUELTA'
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    origen = models.CharField(max_length=10, choices=[('MANUAL', 'Manual'), ('IA', 'IA')])
    categoria = models.CharField(max_length=80)
    descripcion = models.TextField()
    camara = models.CharField(max_length=100, blank=True)
    ubicacion = models.CharField(max_length=150, blank=True)
    prioridad = models.CharField(max_length=30, blank=True)
    fecha_evento = models.DateTimeField()
    fecha_recepcion = models.DateTimeField(default=timezone.now)
    estado = models.CharField(max_length=24, default=PENDIENTE, choices=[(PENDIENTE, 'Pendiente'), (CONFIRMADO, 'Confirmada'), (FALSO, 'Falso positivo'), (EN_ATENCION, 'En atención'), (RESUELTA, 'Resuelta')])
    sin_guardias = models.BooleanField(default=False)
    revisor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, null=True, related_name='eventos_revisados')
    fecha_revision = models.DateTimeField(null=True)
    motivo_descarte = models.TextField(blank=True)
    atendido_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, null=True, related_name='eventos_atendidos')
    observaciones = models.TextField(blank=True)
    fecha_resolucion = models.DateTimeField(null=True)
    incidencia = models.OneToOneField('residencial.incidente', on_delete=models.PROTECT, null=True, related_name='evento_seguridad')


class EvidenciaEventoSeguridad(models.Model):
    # Se guarda fuera de MEDIA_ROOT y solo se entrega mediante una API autorizada.
    evento = models.OneToOneField(EventoSeguridad, on_delete=models.PROTECT,
                                  primary_key=True, related_name='evidencia_privada')
    imagen = models.BinaryField()
    sha256 = models.CharField(max_length=64)
    creada = models.DateTimeField(default=timezone.now)


class ClipEventoSeguridad(models.Model):
    # Se almacena en la base persistente y se entrega solo a operadores autorizados.
    evento = models.OneToOneField(EventoSeguridad, on_delete=models.PROTECT,
                                  primary_key=True, related_name='clip_privado')
    video = models.BinaryField()
    sha256 = models.CharField(max_length=64)
    creado = models.DateTimeField(default=timezone.now)


class NotificacionSeguridad(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    evento = models.ForeignKey(EventoSeguridad, on_delete=models.PROTECT, related_name='notificaciones')
    destinatario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='notificaciones_seguridad')
    tipo = models.CharField(max_length=30, choices=[('REVISION', 'Revisión'), ('CONFIRMADA', 'Confirmada'), ('AVISO_RESIDENTE', 'Aviso a residente')])
    creada = models.DateTimeField(default=timezone.now)
    leida_en = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['evento', 'destinatario', 'tipo'], name='notificacion_seguridad_unica')]
        ordering = ['-creada', '-id']


class EntregaFCMSeguridad(models.Model):
    notificacion = models.ForeignKey(NotificacionSeguridad, on_delete=models.PROTECT, related_name='entregas_fcm')
    dispositivo = models.ForeignKey('fcm_django.FCMDevice', on_delete=models.SET_NULL, null=True, related_name='entregas_seguridad')
    token_hash = models.CharField(max_length=64)
    estado = models.CharField(max_length=16, default='PENDIENTE', choices=[('PENDIENTE', 'Pendiente'), ('EN_PROCESO', 'En proceso'), ('ENVIADA', 'Enviada'), ('FALLIDA', 'Fallida'), ('CANCELADA', 'Cancelada')])
    intentos = models.PositiveSmallIntegerField(default=0)
    siguiente_intento = models.DateTimeField(default=timezone.now)
    reserva_hasta = models.DateTimeField(null=True, blank=True)
    reserva_id = models.UUIDField(null=True, blank=True)
    enviada_en = models.DateTimeField(null=True, blank=True)
    error_codigo = models.CharField(max_length=50, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['notificacion', 'dispositivo'], name='entrega_seguridad_dispositivo_unica')]
        indexes = [models.Index(fields=['estado', 'siguiente_intento'], name='entrega_fcm_pendiente_idx')]


class HistorialEventoSeguridad(models.Model):
    evento = models.ForeignKey(EventoSeguridad, on_delete=models.PROTECT, related_name='historial')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, null=True)
    accion = models.CharField(max_length=30)
    fecha = models.DateTimeField(default=timezone.now)
    observacion = models.TextField(blank=True)

class LecturaPlaca(models.Model):
    id = models.AutoField(primary_key=True)
    placa = models.CharField(max_length=20)
    score = models.FloatField()
    camera_id = models.CharField(max_length=50, blank=True)
    image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.CASCADE, null=True)
    match = models.BooleanField(default=False)

    class Meta:
        db_table = "lectura_placa"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.placa} ({self.score:.2f}) @ {self.created_at:%Y-%m-%d %H:%M}"

# Create your models here.
