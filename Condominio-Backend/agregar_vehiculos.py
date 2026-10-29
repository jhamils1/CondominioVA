import os
import django
import random

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'condominioBACK.settings')
django.setup()

from residencial.modelsVehiculo import Vehiculo
from administracion.models import Persona

def crear_vehiculos():
    print("Creando vehículos para propietarios...")
    print(f"{'='*60}\n")
    
    # Obtener propietarios
    propietarios = list(Persona.objects.filter(tipo='P').order_by('id'))
    print(f"Propietarios disponibles: {len(propietarios)}\n")
    
    # Placas proporcionadas
    placas = [
        '4696SCR', '4994FBT', '5312RYK', '5341RZR', '5300DBB',
        '4015TDT', '6431FDK', '3846YTU', '6319RYC', '5997PLS'
    ]
    
    # Datos de vehículos variados
    marcas_modelos = [
        {'marca': 'Toyota', 'modelo': 'Corolla', 'tipo': 'Automóvil'},
        {'marca': 'Honda', 'modelo': 'CR-V', 'tipo': 'SUV'},
        {'marca': 'Chevrolet', 'modelo': 'Spark', 'tipo': 'Automóvil'},
        {'marca': 'Nissan', 'modelo': 'Frontier', 'tipo': 'Camioneta'},
        {'marca': 'Mazda', 'modelo': 'CX-5', 'tipo': 'SUV'},
        {'marca': 'Ford', 'modelo': 'Ranger', 'tipo': 'Camioneta'},
        {'marca': 'Hyundai', 'modelo': 'Tucson', 'tipo': 'Crossover'},
        {'marca': 'Suzuki', 'modelo': 'Vitara', 'tipo': 'SUV'},
        {'marca': 'Kia', 'modelo': 'Rio', 'tipo': 'Automóvil'},
        {'marca': 'Volkswagen', 'modelo': 'Gol', 'tipo': 'Automóvil'},
    ]
    
    colores = [
        'Blanco', 'Negro', 'Gris', 'Plata', 'Rojo',
        'Azul', 'Verde', 'Café', 'Dorado', 'Beige'
    ]
    
    vehiculos_creados = 0
    
    for i, placa in enumerate(placas):
        try:
            # Verificar si ya existe
            if Vehiculo.objects.filter(placa=placa).exists():
                print(f"⚠ Vehículo con placa {placa} ya existe")
                continue
            
            # Asignar propietario
            propietario = propietarios[i % len(propietarios)]
            
            # Datos del vehículo
            vehiculo_data = marcas_modelos[i]
            color = colores[i]
            
            # Crear vehículo
            vehiculo = Vehiculo.objects.create(
                placa=placa,
                marca=vehiculo_data['marca'],
                modelo=vehiculo_data['modelo'],
                tipo=vehiculo_data['tipo'],
                color=color,
                persona=propietario
            )
            
            vehiculos_creados += 1
            print(f"✓ {vehiculo.marca} {vehiculo.modelo} ({placa}) - Color: {color}")
            print(f"  → Propietario: {propietario.nombre_completo}\n")
            
        except Exception as e:
            print(f"✗ Error al crear vehículo con placa {placa}: {str(e)}\n")
    
    # Resumen
    print(f"{'='*60}")
    print("RESUMEN:")
    print(f"  • Total vehículos creados: {vehiculos_creados}")
    print(f"  • Placas proporcionadas: {len(placas)}")
    print(f"{'='*60}")
    
    # Estadísticas por tipo
    print("\nVehículos por tipo:")
    for tipo_code, tipo_name in Vehiculo.TIPO_CHOICES:
        count = Vehiculo.objects.filter(tipo=tipo_code).count()
        if count > 0:
            print(f"  • {tipo_name}: {count}")
    
    # Mostrar todos los vehículos creados
    print("\nTodos los vehículos registrados:")
    vehiculos = Vehiculo.objects.all().order_by('fecha_registro')
    for v in vehiculos:
        print(f"  • {v.placa} - {v.marca} {v.modelo} ({v.tipo}) - {v.persona.nombre_completo}")

if __name__ == '__main__':
    crear_vehiculos()
