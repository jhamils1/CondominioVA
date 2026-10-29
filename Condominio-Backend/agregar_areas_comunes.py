import os
import django
from datetime import time

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'condominioBACK.settings')
django.setup()

from residencial.models import AreasComunes

def crear_areas_comunes():
    print("Creando áreas comunes para el condominio...")
    print(f"{'='*60}\n")
    
    # Definir las 10 áreas comunes con sus características
    areas_data = [
        {
            'nombre': 'Piscina Principal',
            'descripcion': 'Piscina olímpica con área de chapoteo para niños, incluye camastros y sombrillas',
            'ubicacion': 'Planta baja - Zona recreativa central',
            'capacidad_maxima': 50,
            'horario_apertura': time(8, 0),
            'horario_cierre': time(20, 0),
            'estado': 'A'
        },
        {
            'nombre': 'Salón de Eventos',
            'descripcion': 'Amplio salón para celebraciones, reuniones y eventos sociales. Incluye sillas, mesas y cocina equipada',
            'ubicacion': 'Planta baja - Edificio principal',
            'capacidad_maxima': 80,
            'horario_apertura': time(10, 0),
            'horario_cierre': time(23, 0),
            'estado': 'A'
        },
        {
            'nombre': 'Gimnasio',
            'descripcion': 'Equipado con máquinas cardiovasculares, pesas libres, máquinas de musculación y área de estiramiento',
            'ubicacion': 'Planta baja - Bloque B',
            'capacidad_maxima': 25,
            'horario_apertura': time(6, 0),
            'horario_cierre': time(22, 0),
            'estado': 'A'
        },
        {
            'nombre': 'Cancha de Tenis',
            'descripcion': 'Cancha de tenis profesional con superficie sintética e iluminación nocturna',
            'ubicacion': 'Zona deportiva exterior',
            'capacidad_maxima': 4,
            'horario_apertura': time(7, 0),
            'horario_cierre': time(21, 0),
            'estado': 'A'
        },
        {
            'nombre': 'Cancha de Fútbol',
            'descripcion': 'Cancha multideportiva de césped sintético para fútbol, básquet y vóley',
            'ubicacion': 'Zona deportiva exterior',
            'capacidad_maxima': 20,
            'horario_apertura': time(7, 0),
            'horario_cierre': time(21, 0),
            'estado': 'A'
        },
        {
            'nombre': 'Parque Infantil',
            'descripcion': 'Área de juegos para niños con columpios, toboganes, sube y baja, y piso de seguridad',
            'ubicacion': 'Zona familiar - Jardín central',
            'capacidad_maxima': 30,
            'horario_apertura': time(8, 0),
            'horario_cierre': time(19, 0),
            'estado': 'A'
        },
        {
            'nombre': 'Área de BBQ/Parrillas',
            'descripcion': 'Espacio con 6 parrillas, mesas, bancas y área techada para reuniones al aire libre',
            'ubicacion': 'Zona recreativa - Lateral Bloque A',
            'capacidad_maxima': 40,
            'horario_apertura': time(10, 0),
            'horario_cierre': time(22, 0),
            'estado': 'A'
        },
        {
            'nombre': 'Sala de Juegos',
            'descripcion': 'Sala con mesa de pool, ping pong, futbolín y área de juegos de mesa',
            'ubicacion': 'Planta baja - Bloque A',
            'capacidad_maxima': 20,
            'horario_apertura': time(9, 0),
            'horario_cierre': time(21, 0),
            'estado': 'A'
        },
        {
            'nombre': 'Sauna y Jacuzzi',
            'descripcion': 'Área de relajación con sauna seco, sauna húmedo y jacuzzi para 8 personas',
            'ubicacion': 'Planta baja - Zona de piscina',
            'capacidad_maxima': 12,
            'horario_apertura': time(10, 0),
            'horario_cierre': time(20, 0),
            'estado': 'A'
        },
        {
            'nombre': 'Sala de Cine',
            'descripcion': 'Sala audiovisual con proyector, pantalla grande y asientos tipo cine para 30 personas',
            'ubicacion': 'Planta baja - Edificio principal',
            'capacidad_maxima': 30,
            'horario_apertura': time(14, 0),
            'horario_cierre': time(23, 0),
            'estado': 'A'
        },
    ]
    
    areas_creadas = 0
    
    for area_data in areas_data:
        try:
            # Verificar si ya existe
            if AreasComunes.objects.filter(nombre=area_data['nombre']).exists():
                print(f"⚠ Área '{area_data['nombre']}' ya existe")
                continue
            
            # Crear el área común
            area = AreasComunes.objects.create(**area_data)
            
            areas_creadas += 1
            print(f"✓ {area.nombre}")
            print(f"  Ubicación: {area.ubicacion}")
            print(f"  Capacidad: {area.capacidad_maxima} personas")
            print(f"  Horario: {area.horario_apertura.strftime('%H:%M')} - {area.horario_cierre.strftime('%H:%M')}")
            print(f"  Estado: {'Activo' if area.estado == 'A' else 'Inactivo'}\n")
            
        except Exception as e:
            print(f"✗ Error al crear área '{area_data['nombre']}': {str(e)}\n")
    
    # Resumen
    print(f"{'='*60}")
    print("RESUMEN:")
    print(f"  • Total áreas comunes creadas: {areas_creadas}")
    print(f"  • Total áreas en BD: {AreasComunes.objects.count()}")
    print(f"{'='*60}")
    
    # Mostrar todas las áreas
    print("\nÁreas comunes del condominio:")
    areas = AreasComunes.objects.all().order_by('nombre')
    for i, area in enumerate(areas, 1):
        estado_emoji = "🟢" if area.estado == 'A' else "🔴"
        print(f"{i:2d}. {estado_emoji} {area.nombre} - Cap: {area.capacidad_maxima} personas")

if __name__ == '__main__':
    crear_areas_comunes()
