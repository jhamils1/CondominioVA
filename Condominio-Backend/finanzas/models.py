from django.db import models
from administracion.models import Persona
from residencial.modelsVehiculo import Unidad
from django.utils import timezone
from datetime import timedelta


class contrato(models.Model):
    ESTADO_CHOICES = [
        ('A', 'Activo'),
        ('I', 'Inactivo'),
        ('P', 'Pendiente'),
        ('F', 'Finalizado'),
    ]
    
    id = models.AutoField(primary_key=True)
    propietario = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name='contratos_propietario')
    unidad = models.ForeignKey(Unidad, on_delete=models.CASCADE, related_name='contratos_unidad')
    fecha_contrato = models.DateField()
    cuota_mensual = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estado = models.CharField(max_length=1, choices=ESTADO_CHOICES, default='P')
    costo_compra = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    contrato_PDF = models.URLField(max_length=200, blank=True, null=True)
    
    class Meta:
        db_table = 'contrato'
        verbose_name = "Contrato"
        verbose_name_plural = "Contratos"
        
    def __str__(self):
        return f"Contrato {self.id} - Propietario: {self.propietario.nombre} {self.propietario.apellido}"

class expensa(models.Model):
    id = models.AutoField(primary_key=True)
    unidad = models.ForeignKey(Unidad, on_delete=models.CASCADE, related_name='expensas_unidad')
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_emision = models.DateField(auto_now_add=True)
    fecha_vencimiento = models.DateField(blank=True, null=True)
    pagada = models.BooleanField(default=False)
    stripe_session_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    currency = models.CharField(max_length=10, default="usd")
    descripcion = models.CharField(max_length=255, default="Expensa de condominio")

    class Meta:
        db_table = 'expensa'
        verbose_name = "Expensa"
        verbose_name_plural = "Expensas"

    def __str__(self):
        return f"Expensa {self.id} - Unidad: {self.unidad_id} - Monto: {self.monto}"

    @property
    def amount_cents(self) -> int:
        return int(self.monto * 100)

    def save(self, *args, **kwargs):
        if not self.fecha_vencimiento:
            fecha_base = self.fecha_emision or timezone.now().date()
            self.fecha_vencimiento = fecha_base + timedelta(days=30)
        super().save(*args, **kwargs)

class multa(models.Model):
    TIPO_CHOISES = [
        ('I', 'Incidente'),
        ('F', 'falta de pago'),
        ('O', 'otros'),
    ]
    id = models.AutoField(primary_key=True)
    expensa = models.ForeignKey(expensa, on_delete=models.CASCADE, related_name='multas_expensa')
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_multa = models.DateField(auto_now_add=True)
    tipo = models.CharField(max_length=1, choices=TIPO_CHOISES, default='I')
    
    class Meta:
        db_table = 'multa'
        verbose_name = "Multa"
        verbose_name_plural = "Multas"
    
    def __str__(self):
        return f"Multa {self.id} - Expensa: {self.expensa.id} - Monto: {self.monto}"

