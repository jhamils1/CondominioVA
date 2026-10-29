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

def ajustar_unidades_y_contratos():
    print("Ajustando unidades y contratos...")
    print(f"{'='*60}\n")
    
    # Obtener todos los propietarios
    propietarios = list(Persona.objects.filter(tipo='P').order_by('id'))
    print(f"Propietarios disponibles: {len(propietarios)}")
    
    # Obtener todos los contratos existentes
    contratos_existentes = contrato.objects.all()
    unidades_con_contrato = [c.unidad.id for c in contratos_existentes]
    
    print(f"Contratos existentes: {contratos_existentes.count()}")
    print(f"Unidades con contrato: {len(unidades_con_contrato)}\n")
    
    # Obtener todas las unidades
    todas_unidades = Unidad.objects.all().order_by('bloque__nombre', 'numero_piso', 'numero')
    
    # Primero, marcar como disponibles todas las unidades sin contrato
    unidades_sin_contrato = todas_unidades.exclude(id__in=unidades_con_contrato)
    actualizadas_a_disponible = unidades_sin_contrato.filter(estado='O').update(estado='D')
    print(f"✓ Unidades sin contrato marcadas como disponibles: {actualizadas_a_disponible}")
    
    # Asegurar que las unidades con contrato estén ocupadas
    unidades_con_contrato_obj = todas_unidades.filter(id__in=unidades_con_contrato)
    actualizadas_a_ocupada = unidades_con_contrato_obj.exclude(estado='O').update(estado='O')
    print(f"✓ Unidades con contrato marcadas como ocupadas: {actualizadas_a_ocupada}")
    
    # Contar cuántos contratos tenemos y si necesitamos más
    contratos_actuales = contrato.objects.count()
    print(f"\n{'='*60}")
    print(f"Contratos actuales: {contratos_actuales}")
    
    # Si necesitamos llegar a más de 15 contratos (ej. 18) y tenemos solo 15 propietarios
    # verificamos si hay propietarios que puedan tener más de una unidad
    if contratos_actuales < 18:
        print(f"Necesitamos crear {18 - contratos_actuales} contratos más para tener exactamente 18 ocupadas")
        print("Como solo hay 15 propietarios, algunos propietarios tendrán múltiples unidades.\n")
        
        # Obtener unidades disponibles
        unidades_disponibles = list(Unidad.objects.filter(estado='D').order_by('bloque__nombre', 'numero_piso', 'numero')[:3])
        
        contratos_nuevos = 0
        for i, unidad in enumerate(unidades_disponibles):
            # Asignar a un propietario (puede ser uno que ya tiene contrato)
            propietario = propietarios[i % len(propietarios)]
            
            # Calcular cuota
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
            
            # Actualizar unidad a ocupada
            unidad.estado = 'O'
            unidad.save()
            
            contratos_nuevos += 1
            print(f"✓ Nuevo contrato: Unidad {unidad.codigo} → {propietario.nombre_completo} (Bs. {cuota:.2f}/mes)")
        
        print(f"\n✓ Contratos nuevos creados: {contratos_nuevos}")
    
    # Resumen final
    print(f"\n{'='*60}")
    print("RESUMEN FINAL:")
    bloques = Bloque.objects.all()
    unidades = Unidad.objects.all()
    unidades_ocupadas = unidades.filter(estado='O')
    unidades_disponibles = unidades.filter(estado='D')
    total_contratos = contrato.objects.count()
    
    print(f"  • Bloques: {bloques.count()}")
    for bloque in bloques:
        print(f"    - {bloque.nombre}: {Unidad.objects.filter(bloque=bloque).count()} unidades")
    print(f"  • Total unidades: {unidades.count()}")
    print(f"  • Unidades ocupadas: {unidades_ocupadas.count()}")
    print(f"  • Unidades disponibles: {unidades_disponibles.count()}")
    print(f"  • Total contratos: {total_contratos}")
    print(f"{'='*60}")
    
    # Mostrar algunos contratos
    print("\nEjemplos de contratos:")
    for c in contrato.objects.all()[:5]:
        print(f"  - {c.unidad.codigo} ({c.unidad.bloque.nombre}) → {c.propietario.nombre_completo}")
    if total_contratos > 5:
        print(f"  ... y {total_contratos - 5} contratos más")

if __name__ == '__main__':
    ajustar_unidades_y_contratos()
