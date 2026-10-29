import os
import django
from datetime import date
from decimal import Decimal

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'condominioBACK.settings')
django.setup()

from residencial.modelsVehiculo import Bloque, Unidad
from finanzas.models import contrato
from administracion.models import Persona

def verificar_y_crear_contratos():
    print("Verificando estado actual...")
    print(f"{'='*60}\n")
    
    # Verificar bloques
    bloques = Bloque.objects.all()
    print(f"Bloques en BD: {bloques.count()}")
    for bloque in bloques:
        print(f"  - {bloque.nombre}: {bloque.direccion}")
    
    # Verificar unidades
    unidades = Unidad.objects.all()
    unidades_ocupadas = unidades.filter(estado='O')
    unidades_disponibles = unidades.filter(estado='D')
    
    print(f"\nUnidades en BD: {unidades.count()}")
    print(f"  - Ocupadas: {unidades_ocupadas.count()}")
    print(f"  - Disponibles: {unidades_disponibles.count()}")
    
    # Verificar contratos
    contratos_existentes = contrato.objects.all()
    print(f"\nContratos en BD: {contratos_existentes.count()}")
    
    # Verificar propietarios
    propietarios = Persona.objects.filter(tipo='P')
    print(f"Propietarios disponibles: {propietarios.count()}")
    
    # Si hay unidades ocupadas sin contratos, crearlos
    print(f"\n{'='*60}")
    
    if unidades_ocupadas.count() > contratos_existentes.count():
        print("Creando contratos faltantes...\n")
        
        propietarios_sin_contrato = propietarios.exclude(
            contratos_propietario__isnull=False
        )[:unidades_ocupadas.count()]
        
        unidades_sin_contrato = []
        for unidad in unidades_ocupadas:
            if not contrato.objects.filter(unidad=unidad).exists():
                unidades_sin_contrato.append(unidad)
        
        print(f"Unidades ocupadas sin contrato: {len(unidades_sin_contrato)}")
        print(f"Propietarios sin contrato: {propietarios_sin_contrato.count()}\n")
        
        contratos_creados = 0
        for i, unidad in enumerate(unidades_sin_contrato):
            if i < propietarios_sin_contrato.count():
                propietario = list(propietarios_sin_contrato)[i]
                
                # Calcular cuota mensual
                area = float(unidad.area_m2) if unidad.area_m2 else 70.0
                cuota = Decimal(str(300 + (area * 2.5)))
                costo_compra = cuota * Decimal('120')
                
                # Crear contrato
                nuevo_contrato = contrato.objects.create(
                    propietario=propietario,
                    unidad=unidad,
                    fecha_contrato=date(2024, 1, 15),
                    cuota_mensual=cuota,
                    costo_compra=costo_compra,
                    estado='A'
                )
                
                contratos_creados += 1
                print(f"✓ Contrato creado: Unidad {unidad.codigo} → {propietario.nombre_completo} (Bs. {cuota:.2f}/mes)")
        
        print(f"\n{'='*60}")
        print(f"Total contratos creados: {contratos_creados}")
    else:
        print("Todos los contratos necesarios ya existen.")
    
    # Resumen final
    print(f"\n{'='*60}")
    print("RESUMEN FINAL:")
    print(f"  • Bloques: {bloques.count()}")
    print(f"  • Total unidades: {unidades.count()}")
    print(f"  • Unidades ocupadas: {unidades_ocupadas.count()}")
    print(f"  • Unidades disponibles: {unidades_disponibles.count()}")
    print(f"  • Total contratos: {contrato.objects.count()}")
    print(f"{'='*60}")

if __name__ == '__main__':
    verificar_y_crear_contratos()
