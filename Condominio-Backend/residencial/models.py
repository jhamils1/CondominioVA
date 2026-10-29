from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from administracion.models import Persona

# Create your models here.

class Inquilino(Persona):
    """
    Modelo para inquilinos que hereda de Persona y tiene relación con propietarios
    """
    ESTADO_INQUILINO_CHOICES = [
        ('A', 'Activo'),
        ('I', 'Inactivo'),
        ('F', 'Finalizado'),
    ]
    
    # Atributos específicos del inquilino
    propietario = models.ForeignKey(
        Persona, 
        on_delete=models.CASCADE, 
        related_name='inquilinos_propietario',
        verbose_name="Propietario",
        limit_choices_to={'tipo': 'P'}  # Solo puede ser propietario
    )
    fecha_inicio = models.DateField(verbose_name="Fecha de Inicio", null=True, blank=True)
    fecha_fin = models.DateField(verbose_name="Fecha de Fin", null=True, blank=True)
    estado_inquilino = models.CharField(
        max_length=1, 
        choices=ESTADO_INQUILINO_CHOICES, 
        default='A', 
        verbose_name="Estado del Inquilino"
    )
    
    class Meta:
        db_table = 'inquilino'
        verbose_name = "Inquilino"
        verbose_name_plural = "Inquilinos"
        ordering = ['-fecha_registro']
    
    def save(self, *args, **kwargs):
        # Asegurar que el tipo sea 'I' para inquilino
        self.tipo = 'I'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.nombre_completo} (Inquilino) - Propietario: {self.propietario.nombre_completo}"

class Familiares(Persona):
    """
    Modelo para familiares que hereda de Persona y tiene relación con otra persona
    """
    PARENTESCO_CHOICES = [
        ('PADRE', 'Padre'),
        ('MADRE', 'Madre'),
        ('HIJO', 'Hijo'),
        ('HIJA', 'Hija'),
        ('HERMANO', 'Hermano'),
        ('HERMANA', 'Hermana'),
        ('ESPOSO', 'Esposo'),
        ('ESPOSA', 'Esposa'),
    ]
    
    # Relación con la persona de la cual es familiar
    persona_relacionada = models.ForeignKey(
        'administracion.Persona',
        on_delete=models.CASCADE,
        related_name='familiares_de',
        verbose_name="Persona Relacionada",
        limit_choices_to={'tipo__in': ['P', 'I']}  # Solo propietarios o inquilinos
    )
    parentesco = models.CharField(
        max_length=10,
        choices=PARENTESCO_CHOICES,
        verbose_name="Parentesco"
    )
    
    class Meta:
        db_table = 'familiares'
        verbose_name = "Familiar"
        verbose_name_plural = "Familiares"
        ordering = ['-fecha_registro']
    
    def save(self, *args, **kwargs):
        # Asegurar que el tipo sea 'F' para familiar
        self.tipo = 'F'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.nombre_completo} ({self.get_parentesco_display()}) - {self.persona_relacionada.nombre_completo}"


class Visitante(Persona):
    """
    Modelo para visitantes que hereda de Persona
    """
    MOTIVO_VISITA_CHOICES = [
        ('FAMILIA', 'Visita Familiar'),
        ('TRABAJO', 'Trabajo'),
        ('SERVICIO', 'Servicio'),
        ('SOCIAL', 'Social'),
        ('OTRO', 'Otro'),
    ]
    
    # Atributos específicos del visitante
    motivo_visita = models.CharField(
        max_length=10,
        choices=MOTIVO_VISITA_CHOICES,
        default='FAMILIA',
        verbose_name="Motivo de Visita"
    )
    observaciones = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Observaciones"
    )
    
    class Meta:
        db_table = 'visitante'
        verbose_name = "Visitante"
        verbose_name_plural = "Visitantes"
        ordering = ['-fecha_registro']
    
    def save(self, *args, **kwargs):
        # Asegurar que el tipo sea 'V' para visitante
        self.tipo = 'V'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.nombre_completo} (Visitante) - {self.get_motivo_visita_display()}"


class Mascota(models.Model):
    """
    Modelo para mascotas con relación a Persona
    """
    ESPECIE_CHOICES = [
        ('PERRO', 'Perro'),
        ('GATO', 'Gato'),
        ('AVE', 'Ave'),
        ('ROEDOR', 'Roedor'),
        ('REPTIL', 'Reptil'),
        ('OTRO', 'Otro'),
    ]
    
    TIPO_CHOICES = [
        ('MACHO', 'Macho'),
        ('HEMBRA', 'Hembra'),
    ]
    
    # Atributos de la mascota
    especie = models.CharField(
        max_length=10,
        choices=ESPECIE_CHOICES,
        default='PERRO',
        verbose_name="Especie"
    )
    tipo = models.CharField(
        max_length=10,
        choices=TIPO_CHOICES,
        default='MACHO',
        verbose_name="Tipo"
    )
    foto = models.URLField(blank=True, null=True, verbose_name='Foto')
    nombre = models.CharField(max_length=50, verbose_name="Nombre de la Mascota")
    raza = models.CharField(max_length=50, blank=True, null=True, verbose_name="Raza")
    fecha_nacimiento = models.DateField(blank=True, null=True, verbose_name="Fecha de Nacimiento")
    observaciones = models.TextField(blank=True, null=True, verbose_name="Observaciones")
    fecha_registro = models.DateTimeField(default=timezone.now, verbose_name="Fecha de Registro")
    
    # Relación con Persona (propietario de la mascota)
    persona = models.ForeignKey(
        'administracion.Persona',
        on_delete=models.CASCADE,
        related_name='mascotas',
        verbose_name="Propietario"
    )
    
    class Meta:
        db_table = 'mascota'
        verbose_name = "Mascota"
        verbose_name_plural = "Mascotas"
        ordering = ['-fecha_registro']
    
    def __str__(self):
        return f"{self.nombre} ({self.get_especie_display()}) - {self.persona.nombre_completo}"


class Visita(models.Model):
    """
    Modelo para registrar visitas, relacionando un visitante con un propietario o inquilino
    """
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('ACTIVA', 'Activa'),
        ('FINALIZADA', 'Finalizada'),
        ('CANCELADA', 'Cancelada'),
    ]
    
    estado = models.CharField(
        max_length=10,
        choices=ESTADO_CHOICES,
        default='PENDIENTE',
        verbose_name="Estado de la Visita"
    )
    fecha_hora_entrada = models.DateTimeField(
        verbose_name="Fecha y Hora de Entrada"
    )
    fecha_hora_salida = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha y Hora de Salida"
    )
    
    # Relación con el visitante (Persona de tipo 'V')
    visitante = models.ForeignKey(
        'administracion.Persona',
        on_delete=models.CASCADE,
        related_name='visitas_realizadas',
        limit_choices_to={'tipo': 'V'},
        verbose_name="Visitante"
    )
    
    # Relación con la persona que recibe la visita (Propietario o Inquilino)
    recibe_persona = models.ForeignKey(
        'administracion.Persona',
        on_delete=models.CASCADE,
        related_name='visitas_recibidas',
        limit_choices_to=models.Q(tipo='P') | models.Q(tipo='I'),
        verbose_name="Persona que Recibe"
    )
    
    fecha_registro = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Registro"
    )
    
    class Meta:
        db_table = 'visita'
        verbose_name = "Visita"
        verbose_name_plural = "Visitas"
        ordering = ['-fecha_hora_entrada']
    
    def __str__(self):
        return f"Visita de {self.visitante.nombre_completo} a {self.recibe_persona.nombre_completo} ({self.estado})"

class ObjetoPerdido(models.Model):
    ESTADOS = [
        ('P', 'Pendiente de reclamo'),
        ('E', 'Entregado/Devuelto'),
    ]

    titulo = models.CharField(max_length=100, verbose_name="Qué es")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Detalles")
    foto = models.URLField(verbose_name="Foto del objeto") # Usas la URL de Cloudinary
    lugar_encontrado = models.CharField(max_length=100, default="Áreas Comunes")
    fecha_encontrado = models.DateTimeField(default=timezone.now)
    
    estado = models.CharField(max_length=1, choices=ESTADOS, default='P')
    
    # Opcional: Para saber a quién se lo devolvieron
    entregado_a = models.ForeignKey(Persona, on_delete=models.SET_NULL, null=True, blank=True, related_name="objetos_reclamados")
    fecha_entrega = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-fecha_encontrado']
        verbose_name = "Objeto Perdido"
        verbose_name_plural = "Objetos Perdidos"

    def __str__(self):
        return f"{self.titulo} ({self.get_estado_display()})"

class AreasComunes(models.Model):
    CHOISES_ESTADO = [
        ('A', 'Activo'),
        ('I', 'Inactivo'),
    ]
    nombre = models.CharField(max_length=100, verbose_name="Nombre del Área")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción")
    ubicacion = models.CharField(max_length=100, verbose_name="Ubicación dentro del residencial")
    capacidad_maxima = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="Capacidad Máxima"
    )
    horario_apertura = models.TimeField(verbose_name="Horario de Apertura")
    horario_cierre = models.TimeField(verbose_name="Horario de Cierre")
    estado = models.CharField(
        max_length=1,
        choices=CHOISES_ESTADO,
        default='A',
        verbose_name="Estado del Área"
    )

    class Meta:
        ordering = ['nombre']
        verbose_name = "Área Común"
        verbose_name_plural = "Áreas Comunes"

    def __str__(self):
        return self.nombre

class ReservaAreaComun(models.Model):
    ESTADO_RESERVA_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('CONFIRMADA', 'Confirmada'),
        ('CANCELADA', 'Cancelada'),
        ('COMPLETADA', 'Completada'),
    ]

    area_comun = models.ForeignKey(
        AreasComunes,
        on_delete=models.CASCADE,
        related_name='reservas',
        verbose_name="Área Común"
    )
    persona = models.ForeignKey(
        'administracion.Persona',
        on_delete=models.CASCADE,
        related_name='reservas_area_comun',
        limit_choices_to=models.Q(tipo='P') | models.Q(tipo='I'),
        verbose_name="Persona que Reserva"
    )
    fecha_reserva = models.DateField(verbose_name="Fecha de la Reserva")
    hora_inicio = models.TimeField(verbose_name="Hora de Inicio")
    hora_fin = models.TimeField(verbose_name="Hora de Fin")
    estado_reserva = models.CharField(
        max_length=10,
        choices=ESTADO_RESERVA_CHOICES,
        default='PENDIENTE',
        verbose_name="Estado de la Reserva"
    )
    fecha_registro = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Registro")

    class Meta:
        db_table = 'reserva_area_comun'
        verbose_name = "Reserva de Área Común"
        verbose_name_plural = "Reservas de Áreas Comunes"
        ordering = ['-fecha_reserva', '-hora_inicio']

    def __str__(self):
        return f"Reserva de {self.persona.nombre_completo} para {self.area_comun.nombre} el {self.fecha_reserva}"
