from rest_framework import serializers
from django.utils import timezone
from django.db import models  # <--- FALTABA ESTO IMPORTANTE
from datetime import timedelta, datetime
from administracion.models import Persona
# Ajusta la importación según tu estructura de carpetas real
from residencial.models import ReservaAreaComun, AreasComunes 

class ReservaAreaComunSerializer(serializers.ModelSerializer):
    nombre_area = serializers.CharField(source='area_comun.nombre', read_only=True)
    nombre_persona = serializers.CharField(source='persona.nombre_completo', read_only=True)
    persona = serializers.PrimaryKeyRelatedField(
        queryset=Persona.objects.all(), 
        required=False,  # <--- ESTO ES LA CLAVE
        allow_null=True
    )

    class Meta:
        model = ReservaAreaComun
        fields = [
            'id', 'area_comun', 'nombre_area', 
            'persona', 'nombre_persona', 
            'fecha_reserva', 'hora_inicio', 'hora_fin', 
            'estado_reserva', 'fecha_registro'
        ]
        read_only_fields = ['fecha_registro']

    def validate(self, data):
        fecha_reserva = data.get('fecha_reserva')
        hora_inicio = data.get('hora_inicio')
        hora_fin = data.get('hora_fin')
        area = data.get('area_comun')

        # 1. Validar fecha pasada
        if fecha_reserva < timezone.now().date():
            raise serializers.ValidationError({"fecha_reserva": "La fecha no puede ser en el pasado."})

        # --- PREPARACIÓN DE FECHAS (Lógica de Medianoche) ---
        dummy_date = datetime(2000, 1, 1).date()
        req_inicio = datetime.combine(dummy_date, hora_inicio)
        req_fin = datetime.combine(dummy_date, hora_fin)
        
        # Si termina al día siguiente (Ej: 22:00 a 02:00)
        if hora_fin < hora_inicio:
            req_fin += timedelta(days=1)
        
        # Evitar reservas de duración 0 o negativas lógicas inmediatas
        if req_inicio == req_fin:
            raise serializers.ValidationError({"hora_fin": "La duración de la reserva no es válida."})
        
        if area.estado != 'A':
            raise serializers.ValidationError({
                "area_comun": f"El área '{area.nombre}' no está disponible (Estado: {area.get_estado_display()})."
            })
        # 2. Validar Horario de Apertura del Área (RECOMENDADO AGREGAR)
        # Verifica que la reserva esté dentro del horario de funcionamiento del lugar
        area_inicio = datetime.combine(dummy_date, area.horario_apertura)
        area_fin = datetime.combine(dummy_date, area.horario_cierre)
        if area.horario_cierre < area.horario_apertura:
            area_fin += timedelta(days=1)
            
        if req_inicio < area_inicio or req_fin > area_fin:
            raise serializers.ValidationError({
                "non_field_errors": f"La reserva está fuera del horario de atención del área ({area.horario_apertura} - {area.horario_cierre})."
            })

        # --- BÚSQUEDA DE CONFLICTOS ---
        
        # A. Reservas de HOY
        reservas_hoy = ReservaAreaComun.objects.filter(
            area_comun=area,
            fecha_reserva=fecha_reserva,
            estado_reserva__in=['PENDIENTE', 'CONFIRMADA']
        )
        
        # B. Reservas de AYER que terminan HOY (Resacas)
        fecha_ayer = fecha_reserva - timedelta(days=1)
        reservas_ayer = ReservaAreaComun.objects.filter(
            area_comun=area,
            fecha_reserva=fecha_ayer,
            estado_reserva__in=['PENDIENTE', 'CONFIRMADA'],
            hora_fin__lt=models.F('hora_inicio') # Requiere 'from django.db import models'
        )

        todas_reservas = list(reservas_hoy) + list(reservas_ayer)

        if self.instance:
            todas_reservas = [r for r in todas_reservas if r.id != self.instance.id]

        for reserva in todas_reservas:
            # Normalizar tiempos de la reserva existente a Dummy Date
            if reserva.fecha_reserva == fecha_ayer:
                # Viene de ayer
                res_inicio = datetime.combine(dummy_date - timedelta(days=1), reserva.hora_inicio)
                res_fin = datetime.combine(dummy_date, reserva.hora_fin)
            else:
                # Es de hoy
                res_inicio = datetime.combine(dummy_date, reserva.hora_inicio)
                res_fin = datetime.combine(dummy_date, reserva.hora_fin)
                if reserva.hora_fin < reserva.hora_inicio:
                    res_fin += timedelta(days=1)

            # Lógica de intersección
            if req_inicio < res_fin and req_fin > res_inicio:
                raise serializers.ValidationError({
                    "non_field_errors": [
                        f"Conflicto de horario. Ya existe una reserva ocupando ese espacio."
                    ]
                })

        return data