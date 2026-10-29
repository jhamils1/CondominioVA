import os
import django
from datetime import date, timedelta
from decimal import Decimal
import random

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'condominioBACK.settings')
django.setup()

from django.db import connection
from finanzas.models import contrato, expensa
from residencial.modelsVehiculo import Unidad

def add_months(source_date, months):
    """Añade meses a una fecha"""
    month = source_date.month - 1 + months
    year = source_date.year + month // 12
    month = month % 12 + 1
    day = min(source_date.day, [31, 29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
    return date(year, month, day)

def limpiar_expensas_incorrectas():
    """Elimina todas las expensas existentes para empezar de cero"""
    count = expensa.objects.count()
    if count > 0:
        respuesta = input(f"¿Desea eliminar las {count} expensas existentes? (s/n): ")
        if respuesta.lower() == 's':
            expensa.objects.all().delete()
            print(f"✓ {count} expensas eliminadas\n")
            return True
    return count == 0

def generar_expensas_sql():
    print("Generando expensas mensuales desde 2022 hasta diciembre 2025...")
    print(f"{'='*60}\n")
    
    if not limpiar_expensas_incorrectas():
        print("Operación cancelada")
        return
    
    # Obtener todos los contratos
    contratos = list(contrato.objects.filter(estado='A').select_related('unidad'))
    print(f"Contratos activos encontrados: {len(contratos)}\n")
    
    if not contratos:
        print("✗ No hay contratos activos para generar expensas")
        return
    
    # Fecha actual
    fecha_actual = date(2025, 12, 17)
    
    # Definir fechas de inicio para los contratos
    fechas_inicio = []
    
    # 60% desde 2022
    for i in range(int(len(contratos) * 0.6)):
        mes = random.choice([1, 2, 3, 4, 5, 6])
        fechas_inicio.append(date(2022, mes, 1))
    
    # 25% desde 2023
    for i in range(int(len(contratos) * 0.25)):
        mes = random.choice([1, 3, 6, 9])
        fechas_inicio.append(date(2023, mes, 1))
    
    # El resto desde 2024
    while len(fechas_inicio) < len(contratos):
        mes = random.choice([1, 4, 7, 10])
        fechas_inicio.append(date(2024, mes, 1))
    
    random.shuffle(fechas_inicio)
    
    total_expensas_creadas = 0
    expensas_pagadas = 0
    expensas_pendientes = 0
    
    with connection.cursor() as cursor:
        for idx, cont in enumerate(contratos):
            fecha_inicio_contrato = fechas_inicio[idx]
            
            print(f"Generando expensas para Unidad {cont.unidad.codigo} ({cont.propietario.nombre_completo})")
            print(f"  Inicio: {fecha_inicio_contrato.strftime('%B %Y')}")
            
            # Calcular monto base
            area = float(cont.unidad.area_m2) if cont.unidad.area_m2 else 70.0
            monto_base = Decimal(str(200 + (area * 1.5)))
            
            expensas_unidad = 0
            fecha_expensa = fecha_inicio_contrato
            
            while fecha_expensa <= fecha_actual:
                fecha_venc = fecha_expensa + timedelta(days=30)
                
                # Determinar si está pagada
                meses_antiguedad = (fecha_actual.year - fecha_expensa.year) * 12 + (fecha_actual.month - fecha_expensa.month)
                
                if meses_antiguedad > 6:
                    pagada = random.random() < 0.90
                elif meses_antiguedad > 3:
                    pagada = random.random() < 0.70
                elif meses_antiguedad > 0:
                    pagada = random.random() < 0.40
                else:
                    pagada = random.random() < 0.10
                
                # Variación en el monto
                variacion = Decimal(str(random.uniform(-0.05, 0.05)))
                monto_final = monto_base * (Decimal('1') + variacion)
                monto_final = monto_final.quantize(Decimal('0.01'))
                
                # Insertar directamente con SQL para evitar auto_now_add
                cursor.execute("""
                    INSERT INTO expensa 
                    (unidad_id, monto, fecha_emision, fecha_vencimiento, pagada, descripcion, currency)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, [
                    cont.unidad.id,
                    float(monto_final),
                    fecha_expensa,
                    fecha_venc,
                    pagada,
                    f"Expensa mensual - {fecha_expensa.strftime('%B %Y')}",
                    "usd"
                ])
                
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
    
    # Expensas pendientes actuales
    pendientes_actuales = expensa.objects.filter(pagada=False, fecha_emision__year=2025).count()
    print(f"\n✗ Expensas pendientes en 2025: {pendientes_actuales}")

if __name__ == '__main__':
    generar_expensas_sql()
