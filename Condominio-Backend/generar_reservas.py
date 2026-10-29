import os
import django
from datetime import date, time, timedelta
import random

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'condominioBACK.settings')
django.setup()

from residencial.models import AreasComunes, ReservaAreaComun
from administracion.models import Persona

def generar_reservas():
    print("Generando reservas de áreas comunes desde 2022...")
    print(f"{'='*60}\n")
    
    # Obtener propietarios (solo tipo 'P')
    propietarios = list(Persona.objects.filter(tipo='P'))
    print(f"Propietarios disponibles: {len(propietarios)}")
    
    # Obtener áreas comunes
    areas = list(AreasComunes.objects.filter(estado='A'))
    print(f"Áreas comunes disponibles: {len(areas)}\n")
    
    if not propietarios or not areas:
        print("✗ No hay propietarios o áreas comunes para crear reservas")
        return
    
    # Fecha actual
    fecha_actual = date(2025, 12, 17)
    
    # Generar reservas distribuidas desde 2022
    reservas_creadas = 0
    reservas_por_año = {2022: 0, 2023: 0, 2024: 0, 2025: 0}
    
    # Generar entre 50-60 reservas distribuidas
    num_reservas = random.randint(50, 60)
    
    print(f"Generando {num_reservas} reservas...\n")
    
    for i in range(num_reservas):
        try:
            # Seleccionar propietario y área aleatoriamente
            propietario = random.choice(propietarios)
            area = random.choice(areas)
            
            # Generar fecha aleatoria entre 2022 y 2025
            # 20% en 2022, 25% en 2023, 30% en 2024, 25% en 2025
            rand = random.random()
            if rand < 0.20:
                año = 2022
            elif rand < 0.45:
                año = 2023
            elif rand < 0.75:
                año = 2024
            else:
                año = 2025
            
            mes = random.randint(1, 12)
            if año == 2025 and mes > 12:
                mes = 12
            
            # Día del mes
            dias_del_mes = [31, 28 if año % 4 != 0 else 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
            dia = random.randint(1, dias_del_mes[mes-1])
            
            fecha_reserva = date(año, mes, dia)
            
            # Si la fecha es futura, ajustar
            if fecha_reserva > fecha_actual:
                fecha_reserva = fecha_actual - timedelta(days=random.randint(1, 30))
            
            # Generar horas dentro del horario del área
            hora_apertura = area.horario_apertura
            hora_cierre = area.horario_cierre
            
            # Convertir a minutos para facilitar el cálculo
            minutos_apertura = hora_apertura.hour * 60 + hora_apertura.minute
            minutos_cierre = hora_cierre.hour * 60 + hora_cierre.minute
            
            # Duración de la reserva: entre 1 y 4 horas
            duracion_minutos = random.choice([60, 120, 180, 240])
            
            # Hora de inicio aleatoria dentro del horario
            minutos_disponibles = minutos_cierre - minutos_apertura - duracion_minutos
            if minutos_disponibles > 0:
                minutos_inicio = minutos_apertura + random.randint(0, minutos_disponibles)
            else:
                minutos_inicio = minutos_apertura
            
            hora_inicio = time(minutos_inicio // 60, minutos_inicio % 60)
            
            # Calcular hora fin
            minutos_fin = minutos_inicio + duracion_minutos
            hora_fin = time(minutos_fin // 60, minutos_fin % 60)
            
            # Determinar estado de la reserva según la fecha
            dias_diferencia = (fecha_actual - fecha_reserva).days
            
            if dias_diferencia < 0:
                # Reserva futura
                estado = 'PENDIENTE' if random.random() < 0.7 else 'CONFIRMADA'
            elif dias_diferencia == 0:
                # Reserva de hoy
                estado = random.choice(['CONFIRMADA', 'PENDIENTE'])
            elif dias_diferencia <= 7:
                # Última semana
                estado = random.choice(['COMPLETADA', 'CONFIRMADA', 'CANCELADA'])
            else:
                # Reservas antiguas
                if random.random() < 0.75:
                    estado = 'COMPLETADA'
                elif random.random() < 0.85:
                    estado = 'CONFIRMADA'
                else:
                    estado = 'CANCELADA'
            
            # Crear la reserva
            reserva = ReservaAreaComun.objects.create(
                area_comun=area,
                persona=propietario,
                fecha_reserva=fecha_reserva,
                hora_inicio=hora_inicio,
                hora_fin=hora_fin,
                estado_reserva=estado
            )
            
            reservas_creadas += 1
            reservas_por_año[año] += 1
            
            if reservas_creadas <= 10 or reservas_creadas % 10 == 0:
                print(f"✓ Reserva {reservas_creadas}: {area.nombre} - {fecha_reserva.strftime('%d/%m/%Y')} - {propietario.nombre_completo} ({estado})")
            
        except Exception as e:
            print(f"✗ Error al crear reserva: {str(e)}")
    
    # Resumen
    print(f"\n{'='*60}")
    print("RESUMEN:")
    print(f"  • Total reservas creadas: {reservas_creadas}")
    print(f"{'='*60}")
    
    # Estadísticas por año
    print("\nReservas por año:")
    for año in [2022, 2023, 2024, 2025]:
        count = ReservaAreaComun.objects.filter(fecha_reserva__year=año).count()
        print(f"  • {año}: {count} reservas")
    
    # Estadísticas por estado
    print("\nReservas por estado:")
    for estado_code, estado_name in ReservaAreaComun.ESTADO_RESERVA_CHOICES:
        count = ReservaAreaComun.objects.filter(estado_reserva=estado_code).count()
        print(f"  • {estado_name}: {count}")
    
    # Áreas más reservadas
    print("\nÁreas más reservadas (Top 5):")
    from django.db.models import Count
    areas_top = ReservaAreaComun.objects.values('area_comun__nombre').annotate(
        total=Count('id')
    ).order_by('-total')[:5]
    
    for i, area_stat in enumerate(areas_top, 1):
        print(f"  {i}. {area_stat['area_comun__nombre']}: {area_stat['total']} reservas")
    
    # Propietarios más activos
    print("\nPropietarios más activos (Top 5):")
    propietarios_top = ReservaAreaComun.objects.values(
        'persona__nombre', 'persona__apellido'
    ).annotate(
        total=Count('id')
    ).order_by('-total')[:5]
    
    for i, prop_stat in enumerate(propietarios_top, 1):
        print(f"  {i}. {prop_stat['persona__nombre']} {prop_stat['persona__apellido']}: {prop_stat['total']} reservas")

if __name__ == '__main__':
    generar_reservas()
