import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'condominioBACK.settings')
django.setup()

from finanzas.models import expensa

# Verificar expensas
expensas = expensa.objects.all().order_by('fecha_emision')
print(f"Total expensas: {expensas.count()}\n")

if expensas.exists():
    print("Primeras 10 expensas:")
    for exp in expensas[:10]:
        print(f"  {exp.id} - Unidad: {exp.unidad.codigo} - Fecha: {exp.fecha_emision} - Monto: {exp.monto}")
    
    print("\nÚltimas 10 expensas:")
    for exp in expensas[expensas.count()-10:]:
        print(f"  {exp.id} - Unidad: {exp.unidad.codigo} - Fecha: {exp.fecha_emision} - Monto: {exp.monto}")
    
    print("\nExpensas por año:")
    for year in [2022, 2023, 2024, 2025]:
        count = expensas.filter(fecha_emision__year=year).count()
        print(f"  {year}: {count}")
