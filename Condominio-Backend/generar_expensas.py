import os
import django
from datetime import date, timedelta
from decimal import Decimal
import random

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'condominioBACK.settings')
django.setup()

def add_months(source_date, months):
    """Añade meses a una fecha"""
    month = source_date.month - 1 + months
    year = source_date.year + month // 12
    month = month % 12 + 1
    day = min(source_date.day, [31, 29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
    return date(year, month, day)

from finanzas.models import contrato, expensa
from residencial.modelsVehiculo import Unidad

def generar_expensas():
    print("Generando expensas mensuales desde 2022 hasta diciembre 2025...")
    print(f"{'='*60}\n")
    
    # Obtener todos los contratos
    contratos = list(contrato.objects.filter(estado='A').select_related('unidad'))
    print(f"Contratos activos encontrados: {len(contratos)}\n")
    
    if not contratos:
        print("✗ No hay contratos activos para generar expensas")
        return
    
    # Fecha actual
    fecha_actual = date(2025, 12, 17)
    
    # Definir fechas de inicio para los contratos
    # 60% empiezan en 2022, 25% en 2023, 15% en 2024
    fechas_inicio = []
    
    # 60% desde 2022 (primeros 11 contratos)
    for i in range(int(len(contratos) * 0.6)):
        mes = random.choice([1, 2, 3, 4, 5, 6])  # Primeros 6 meses de 2022
        fechas_inicio.append(date(2022, mes, 1))
    
    # 25% desde 2023 (siguientes 4-5 contratos)
    for i in range(int(len(contratos) * 0.25)):
        mes = random.choice([1, 3, 6, 9])
        fechas_inicio.append(date(2023, mes, 1))
    
    # El resto desde 2024
    while len(fechas_inicio) < len(contratos):
        mes = random.choice([1, 4, 7, 10])
        fechas_inicio.append(date(2024, mes, 1))
    
    # Mezclar para asignar aleatoriamente
    random.shuffle(fechas_inicio)
    
    total_expensas_creadas = 0
    expensas_pagadas = 0
    expensas_pendientes = 0
    
    for idx, cont in enumerate(contratos):
        fecha_inicio_contrato = fechas_inicio[idx]
        
        print(f"Generando expensas para Unidad {cont.unidad.codigo} ({cont.propietario.nombre_completo})")
        print(f"  Inicio: {fecha_inicio_contrato.strftime('%B %Y')}")
        
        # Calcular monto de expensa basado en el área de la unidad
        area = float(cont.unidad.area_m2) if cont.unidad.area_m2 else 70.0
        monto_base = Decimal(str(200 + (area * 1.5)))  # Monto base según área
        
        expensas_unidad = 0
        fecha_expensa = fecha_inicio_contrato
        
        while fecha_expensa <= fecha_actual:
            # Verificar si ya existe una expensa para este mes y año
            expensa_existente = expensa.objects.filter(
                unidad=cont.unidad,
                fecha_emision__year=fecha_expensa.year,
                fecha_emision__month=fecha_expensa.month
            ).exists()
            
            if not expensa_existente:
                # Calcular fecha de vencimiento (30 días después)
                fecha_venc = fecha_expensa + timedelta(days=30)
                
                # Determinar si está pagada
                # Las expensas más antiguas tienen mayor probabilidad de estar pagadas
                meses_antiguedad = (fecha_actual.year - fecha_expensa.year) * 12 + (fecha_actual.month - fecha_expensa.month)
                
                if meses_antiguedad > 6:
                    # Expensas de hace más de 6 meses: 90% pagadas
                    pagada = random.random() < 0.90
                elif meses_antiguedad > 3:
                    # Expensas de hace 3-6 meses: 70% pagadas
                    pagada = random.random() < 0.70
                elif meses_antiguedad > 0:
                    # Expensas de hace 1-3 meses: 40% pagadas
                    pagada = random.random() < 0.40
                else:
                    # Expensas del mes actual: 10% pagadas
                    pagada = random.random() < 0.10
                
                # Pequeña variación en el monto (±5%)
                variacion = Decimal(str(random.uniform(-0.05, 0.05)))
                monto_final = monto_base * (Decimal('1') + variacion)
                monto_final = monto_final.quantize(Decimal('0.01'))
                
                # Crear la expensa
                nueva_expensa = expensa.objects.create(
                    unidad=cont.unidad,
                    monto=monto_final,
                    fecha_emision=fecha_expensa,
                    fecha_vencimiento=fecha_venc,
                    pagada=pagada,
                    descripcion=f"Expensa mensual - {fecha_expensa.strftime('%B %Y')}"
                )
                
                expensas_unidad += 1
                total_expensas_creadas += 1
                
                if pagada:
                    expensas_pagadas += 1
                else:
                    expensas_pendientes += 1
            
            # Siguiente mes
            fecha_expensa = add_months(fecha_expensa, 1)
        
        print(f"  ✓ {expensas_unidad} expensas creadas\n")
    
    # Resumen
    print(f"{'='*60}")
    print("RESUMEN:")
    print(f"  • Total expensas creadas: {total_expensas_creadas}")
    print(f"  • Expensas pagadas: {expensas_pagadas} ({expensas_pagadas*100//total_expensas_creadas if total_expensas_creadas > 0 else 0}%)")
    print(f"  • Expensas pendientes: {expensas_pendientes} ({expensas_pendientes*100//total_expensas_creadas if total_expensas_creadas > 0 else 0}%)")
    print(f"  • Periodo: 2022 - Diciembre 2025")
    print(f"{'='*60}")
    
    # Estadísticas por año
    print("\nExpensas por año:")
    for year in [2022, 2023, 2024, 2025]:
        count = expensa.objects.filter(fecha_emision__year=year).count()
        pagadas_year = expensa.objects.filter(fecha_emision__year=year, pagada=True).count()
        print(f"  • {year}: {count} expensas ({pagadas_year} pagadas, {count-pagadas_year} pendientes)")
    
    # Mostrar algunas expensas recientes
    print("\nExpensas más recientes:")
    expensas_recientes = expensa.objects.order_by('-fecha_emision')[:5]
    for exp in expensas_recientes:
        estado = "✓ Pagada" if exp.pagada else "✗ Pendiente"
        print(f"  • {exp.unidad.codigo} - {exp.fecha_emision.strftime('%b %Y')} - Bs. {exp.monto} - {estado}")

if __name__ == '__main__':
    generar_expensas()
