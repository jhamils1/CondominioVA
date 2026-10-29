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

def crear_bloques_unidades_contratos():
    print("Iniciando creación de bloques, unidades y contratos...")
    print(f"{'='*60}\n")
    
    # Obtener todos los propietarios (tipo 'P')
    propietarios = list(Persona.objects.filter(tipo='P').order_by('id'))
    print(f"✓ Propietarios encontrados: {len(propietarios)}")
    
    if len(propietarios) < 15:
        print(f"✗ Error: Se necesitan al menos 15 propietarios. Solo hay {len(propietarios)}")
        return
    
    # Crear 2 bloques
    bloques_data = [
        {"nombre": "Bloque A", "direccion": "Av. Principal #123, Zona Norte"},
        {"nombre": "Bloque B", "direccion": "Av. Principal #125, Zona Norte"}
    ]
    
    bloques = []
    for data in bloques_data:
        bloque, created = Bloque.objects.get_or_create(
            nombre=data['nombre'],
            defaults={'direccion': data['direccion']}
        )
        bloques.append(bloque)
        if created:
            print(f"✓ Bloque creado: {bloque.nombre}")
        else:
            print(f"⚠ Bloque ya existe: {bloque.nombre}")
    
    print()
    
    # Crear unidades para cada bloque
    # Bloque A: 5 pisos, 4 unidades por piso = 20 unidades
    # Bloque B: 5 pisos, 4 unidades por piso = 20 unidades
    # Total: 40 unidades (18 ocupadas, 22 disponibles)
    
    unidades_creadas = []
    contratos_creados = []
    contador_ocupadas = 0
    propietario_index = 0
    
    tipos_unidad = ['A', 'A', 'A', 'C']  # Mayormente apartamentos, algunas casas
    
    for bloque in bloques:
        print(f"Creando unidades para {bloque.nombre}...")
        
        for piso in range(1, 6):  # 5 pisos
            for num_unidad in range(1, 5):  # 4 unidades por piso
                # Código de unidad: Ej. A-101, A-102, B-501, B-502
                codigo = f"{bloque.nombre.split()[1]}-{piso}{num_unidad:02d}"
                numero = f"{piso}{num_unidad:02d}"
                
                # Determinar si estará ocupada
                # Queremos exactamente 18 ocupadas (más de 15)
                # Bloque A: 10 ocupadas, Bloque B: 8 ocupadas
                if bloque.nombre == "Bloque A" and contador_ocupadas < 10:
                    estado = 'O'  # Ocupada
                    ocupar = True
                elif bloque.nombre == "Bloque B" and contador_ocupadas >= 10 and contador_ocupadas < 18:
                    estado = 'O'  # Ocupada
                    ocupar = True
                else:
                    estado = 'D'  # Disponible
                    ocupar = False
                
                # Tipo de unidad según el número
                tipo = tipos_unidad[num_unidad - 1]
                
                # Área según el tipo
                if tipo == 'A':  # Apartamento
                    area = Decimal(str(65.0 + (piso * 2)))  # 67-75 m²
                else:  # Casa
                    area = Decimal(str(90.0 + (piso * 5)))  # 95-110 m²
                
                # Verificar si la unidad ya existe
                unidad, created = Unidad.objects.get_or_create(
                    codigo=codigo,
                    defaults={
                        'numero': numero,
                        'bloque': bloque,
                        'numero_piso': piso,
                        'tipo_unidad': tipo,
                        'estado': estado,
                        'area_m2': area,
                        'dimensiones': f"{int(area/10)}m x {int(area/(area/10))}m",
                        'descripcion': f"{'Apartamento' if tipo == 'A' else 'Casa'} en piso {piso}"
                    }
                )
                
                if created:
                    unidades_creadas.append(unidad)
                    print(f"  ✓ Unidad {codigo} - Piso {piso} - Estado: {'Ocupada' if ocupar else 'Disponible'}")
                    
                    # Si está ocupada, crear contrato
                    if ocupar and propietario_index < len(propietarios):
                        propietario = propietarios[propietario_index]
                        
                        # Calcular cuota mensual basada en el área
                        cuota = Decimal(str(300 + (float(area) * 2.5)))  # Base + área
                        costo_compra = cuota * Decimal('120')  # ~10 años de cuotas
                        
                        # Crear contrato
                        contrato_obj = contrato.objects.create(
                            propietario=propietario,
                            unidad=unidad,
                            fecha_contrato=date(2024, 1, 15),
                            cuota_mensual=cuota,
                            costo_compra=costo_compra,
                            estado='A'  # Activo
                        )
                        
                        contratos_creados.append(contrato_obj)
                        print(f"    → Contrato creado para: {propietario.nombre_completo}")
                        
                        contador_ocupadas += 1
                        propietario_index += 1
                else:
                    print(f"  ⚠ Unidad {codigo} ya existe")
        
        print()
    
    # Resumen
    print(f"{'='*60}")
    print(f"RESUMEN:")
    print(f"  • Bloques: {len(bloques)}")
    print(f"  • Unidades creadas: {len(unidades_creadas)}")
    print(f"  • Unidades ocupadas: {contador_ocupadas}")
    print(f"  • Unidades disponibles: {len(unidades_creadas) - contador_ocupadas}")
    print(f"  • Contratos creados: {len(contratos_creados)}")
    print(f"{'='*60}")
    
    # Mostrar contratos creados
    if contratos_creados:
        print("\nContratos creados:")
        for c in contratos_creados[:5]:  # Mostrar primeros 5
            print(f"  - Unidad {c.unidad.codigo} → {c.propietario.nombre_completo} (Cuota: Bs. {c.cuota_mensual})")
        if len(contratos_creados) > 5:
            print(f"  ... y {len(contratos_creados) - 5} contratos más")

if __name__ == '__main__':
    crear_bloques_unidades_contratos()
