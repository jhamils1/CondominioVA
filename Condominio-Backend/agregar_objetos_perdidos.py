import os
import django
from datetime import timedelta
import random

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'condominioBACK.settings')
django.setup()

from django.utils import timezone
from residencial.models import ObjetoPerdido
from administracion.models import Persona

def crear_objetos_perdidos():
    print("Creando objetos perdidos encontrados en el condominio...")
    print(f"{'='*60}\n")
    
    # Obtener algunos propietarios para entregas
    propietarios = list(Persona.objects.filter(tipo='P'))
    
    # Fecha actual (con timezone)
    fecha_actual = timezone.now()
    
    # Definir objetos perdidos (entre 8-10)
    objetos_data = [
        {
            'titulo': 'Llaves de automóvil Toyota',
            'descripcion': 'Llavero con control remoto y llave de contacto. Tiene un llavero de cuero color café con las iniciales "CR"',
            'foto': 'https://res.cloudinary.com/demo/image/upload/v1/objetos/llaves_auto.jpg',
            'lugar_encontrado': 'Estacionamiento Bloque A',
            'fecha_encontrado': fecha_actual - timedelta(days=2),
            'estado': 'P'
        },
        {
            'titulo': 'Celular Samsung Galaxy',
            'descripcion': 'Teléfono Samsung Galaxy A54, color negro con funda transparente. Tiene protector de pantalla',
            'foto': 'https://res.cloudinary.com/demo/image/upload/v1/objetos/celular_samsung.jpg',
            'lugar_encontrado': 'Gimnasio',
            'fecha_encontrado': fecha_actual - timedelta(days=5),
            'estado': 'P'
        },
        {
            'titulo': 'Billetera de cuero',
            'descripcion': 'Billetera de cuero color negro marca Fossil. Contiene documentos y tarjetas',
            'foto': 'https://res.cloudinary.com/demo/image/upload/v1/objetos/billetera.jpg',
            'lugar_encontrado': 'Piscina Principal',
            'fecha_encontrado': fecha_actual - timedelta(days=7),
            'estado': 'P'
        },
        {
            'titulo': 'Gafas de sol Ray-Ban',
            'descripcion': 'Lentes de sol Ray-Ban Wayfarer, montura negra con estuche original',
            'foto': 'https://res.cloudinary.com/demo/image/upload/v1/objetos/gafas_sol.jpg',
            'lugar_encontrado': 'Área de BBQ/Parrillas',
            'fecha_encontrado': fecha_actual - timedelta(days=10),
            'estado': 'P'
        },
        {
            'titulo': 'Mochila deportiva Nike',
            'descripcion': 'Mochila deportiva Nike color azul marino con logo blanco. Contiene ropa deportiva',
            'foto': 'https://res.cloudinary.com/demo/image/upload/v1/objetos/mochila_nike.jpg',
            'lugar_encontrado': 'Cancha de Fútbol',
            'fecha_encontrado': fecha_actual - timedelta(days=15),
            'estado': 'E'  # Entregada
        },
        {
            'titulo': 'Reloj deportivo Garmin',
            'descripcion': 'Smartwatch Garmin Forerunner color negro con correa de silicona',
            'foto': 'https://res.cloudinary.com/demo/image/upload/v1/objetos/reloj_garmin.jpg',
            'lugar_encontrado': 'Gimnasio',
            'fecha_encontrado': fecha_actual - timedelta(days=20),
            'estado': 'E'  # Entregada
        },
        {
            'titulo': 'Paraguas negro',
            'descripcion': 'Paraguas grande de color negro, automático, en buen estado',
            'foto': 'https://res.cloudinary.com/demo/image/upload/v1/objetos/paraguas.jpg',
            'lugar_encontrado': 'Salón de Eventos',
            'fecha_encontrado': fecha_actual - timedelta(days=25),
            'estado': 'E'  # Entregada
        },
        {
            'titulo': 'Juguete de niño (Transformer)',
            'descripcion': 'Figura de acción Transformers Optimus Prime, aproximadamente 20cm de alto',
            'foto': 'https://res.cloudinary.com/demo/image/upload/v1/objetos/juguete_transformer.jpg',
            'lugar_encontrado': 'Parque Infantil',
            'fecha_encontrado': fecha_actual - timedelta(days=3),
            'estado': 'P'
        },
        {
            'titulo': 'Auriculares inalámbricos',
            'descripcion': 'Auriculares Bluetooth Sony WH-1000XM4, color negro con estuche de transporte',
            'foto': 'https://res.cloudinary.com/demo/image/upload/v1/objetos/auriculares.jpg',
            'lugar_encontrado': 'Sala de Cine',
            'fecha_encontrado': fecha_actual - timedelta(days=8),
            'estado': 'P'
        }
    ]
    
    objetos_creados = 0
    objetos_entregados = 0
    objetos_pendientes = 0
    
    for obj_data in objetos_data:
        try:
            # Verificar si ya existe un objeto similar
            existe = ObjetoPerdido.objects.filter(
                titulo=obj_data['titulo'],
                lugar_encontrado=obj_data['lugar_encontrado']
            ).exists()
            
            if existe:
                print(f"⚠ Objeto '{obj_data['titulo']}' ya existe")
                continue
            
            # Si el objeto fue entregado, asignar un propietario y fecha
            if obj_data['estado'] == 'E' and propietarios:
                propietario = random.choice(propietarios)
                fecha_entrega = obj_data['fecha_encontrado'] + timedelta(days=random.randint(1, 5))
                
                objeto = ObjetoPerdido.objects.create(
                    titulo=obj_data['titulo'],
                    descripcion=obj_data['descripcion'],
                    foto=obj_data['foto'],
                    lugar_encontrado=obj_data['lugar_encontrado'],
                    fecha_encontrado=obj_data['fecha_encontrado'],
                    estado=obj_data['estado'],
                    entregado_a=propietario,
                    fecha_entrega=fecha_entrega
                )
                objetos_entregados += 1
                print(f"✓ {objeto.titulo}")
                print(f"  📍 Lugar: {objeto.lugar_encontrado}")
                print(f"  📅 Encontrado: {objeto.fecha_encontrado.strftime('%d/%m/%Y')}")
                print(f"  ✅ Entregado a: {propietario.nombre_completo} el {fecha_entrega.strftime('%d/%m/%Y')}\n")
            else:
                objeto = ObjetoPerdido.objects.create(
                    titulo=obj_data['titulo'],
                    descripcion=obj_data['descripcion'],
                    foto=obj_data['foto'],
                    lugar_encontrado=obj_data['lugar_encontrado'],
                    fecha_encontrado=obj_data['fecha_encontrado'],
                    estado=obj_data['estado']
                )
                objetos_pendientes += 1
                print(f"✓ {objeto.titulo}")
                print(f"  📍 Lugar: {objeto.lugar_encontrado}")
                print(f"  📅 Encontrado: {objeto.fecha_encontrado.strftime('%d/%m/%Y')}")
                print(f"  ⏳ Estado: Pendiente de reclamo\n")
            
            objetos_creados += 1
            
        except Exception as e:
            print(f"✗ Error al crear objeto '{obj_data['titulo']}': {str(e)}\n")
    
    # Resumen
    print(f"{'='*60}")
    print("RESUMEN:")
    print(f"  • Total objetos creados: {objetos_creados}")
    print(f"  • Objetos entregados: {objetos_entregados}")
    print(f"  • Objetos pendientes de reclamo: {objetos_pendientes}")
    print(f"{'='*60}")
    
    # Estadísticas
    print("\nObjetos por estado:")
    pendientes = ObjetoPerdido.objects.filter(estado='P').count()
    entregados = ObjetoPerdido.objects.filter(estado='E').count()
    print(f"  • Pendientes de reclamo: {pendientes}")
    print(f"  • Entregados/Devueltos: {entregados}")
    
    print("\nLugares donde se encontraron más objetos:")
    from django.db.models import Count
    lugares = ObjetoPerdido.objects.values('lugar_encontrado').annotate(
        total=Count('id')
    ).order_by('-total')
    
    for lugar_stat in lugares:
        print(f"  • {lugar_stat['lugar_encontrado']}: {lugar_stat['total']} objeto(s)")
    
    print("\nObjetos pendientes de reclamo:")
    objetos_pendientes = ObjetoPerdido.objects.filter(estado='P').order_by('-fecha_encontrado')
    for obj in objetos_pendientes:
        dias = (timezone.now() - obj.fecha_encontrado).days
        print(f"  • {obj.titulo} - {obj.lugar_encontrado} (hace {dias} días)")

if __name__ == '__main__':
    crear_objetos_perdidos()
