import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'condominioBACK.settings')
django.setup()

from django.contrib.auth.models import User, Group
from administracion.models import Persona
from datetime import date

def crear_propietarios():
    # Obtener el grupo de propietario (id=2 según la imagen)
    try:
        grupo_propietario = Group.objects.get(id=2)
        print(f"✓ Grupo encontrado: {grupo_propietario.name}")
    except Group.DoesNotExist:
        print("✗ Error: No se encontró el grupo 'propietario' con id=2")
        return

    # Datos de los 15 propietarios
    propietarios_data = [
        {"nombre": "Carlos", "apellido": "Rodríguez", "ci": "12345001", "telefono": "77712345", "sexo": "M", "fecha_nac": date(1985, 3, 15)},
        {"nombre": "María", "apellido": "González", "ci": "12345002", "telefono": "77712346", "sexo": "F", "fecha_nac": date(1990, 7, 22)},
        {"nombre": "Juan", "apellido": "Pérez", "ci": "12345003", "telefono": "77712347", "sexo": "M", "fecha_nac": date(1978, 11, 8)},
        {"nombre": "Ana", "apellido": "Martínez", "ci": "12345004", "telefono": "77712348", "sexo": "F", "fecha_nac": date(1982, 5, 30)},
        {"nombre": "Luis", "apellido": "López", "ci": "12345005", "telefono": "77712349", "sexo": "M", "fecha_nac": date(1975, 9, 12)},
        {"nombre": "Carmen", "apellido": "Sánchez", "ci": "12345006", "telefono": "77712350", "sexo": "F", "fecha_nac": date(1988, 2, 18)},
        {"nombre": "Roberto", "apellido": "Ramírez", "ci": "12345007", "telefono": "77712351", "sexo": "M", "fecha_nac": date(1992, 6, 25)},
        {"nombre": "Patricia", "apellido": "Torres", "ci": "12345008", "telefono": "77712352", "sexo": "F", "fecha_nac": date(1987, 10, 5)},
        {"nombre": "Miguel", "apellido": "Flores", "ci": "12345009", "telefono": "77712353", "sexo": "M", "fecha_nac": date(1980, 4, 14)},
        {"nombre": "Laura", "apellido": "Morales", "ci": "12345010", "telefono": "77712354", "sexo": "F", "fecha_nac": date(1995, 8, 20)},
        {"nombre": "Diego", "apellido": "Vargas", "ci": "12345011", "telefono": "77712355", "sexo": "M", "fecha_nac": date(1983, 12, 3)},
        {"nombre": "Sofía", "apellido": "Herrera", "ci": "12345012", "telefono": "77712356", "sexo": "F", "fecha_nac": date(1991, 1, 27)},
        {"nombre": "Fernando", "apellido": "Castro", "ci": "12345013", "telefono": "77712357", "sexo": "M", "fecha_nac": date(1986, 7, 9)},
        {"nombre": "Gabriela", "apellido": "Mendoza", "ci": "12345014", "telefono": "77712358", "sexo": "F", "fecha_nac": date(1989, 11, 16)},
        {"nombre": "Andrés", "apellido": "Gutiérrez", "ci": "12345015", "telefono": "77712359", "sexo": "M", "fecha_nac": date(1984, 3, 21)},
    ]

    contador_exitosos = 0
    
    for data in propietarios_data:
        try:
            # Crear el usuario
            username = f"{data['nombre'].lower()}.{data['apellido'].lower()}"
            email = f"{username}@condominio.com"
            
            # Verificar si el usuario ya existe
            if User.objects.filter(username=username).exists():
                print(f"⚠ El usuario '{username}' ya existe, saltando...")
                continue
            
            # Verificar si la CI ya existe
            if Persona.objects.filter(CI=data['ci']).exists():
                print(f"⚠ La persona con CI '{data['ci']}' ya existe, saltando...")
                continue
            
            # Crear el usuario
            user = User.objects.create_user(
                username=username,
                email=email,
                password='propietario123',
                first_name=data['nombre'],
                last_name=data['apellido']
            )
            
            # Asignar el grupo de propietario al usuario
            user.groups.add(grupo_propietario)
            
            # Crear la persona
            persona = Persona.objects.create(
                nombre=data['nombre'],
                apellido=data['apellido'],
                CI=data['ci'],
                telefono=data['telefono'],
                sexo=data['sexo'],
                fecha_nacimiento=data['fecha_nac'],
                tipo='P',  # P = Propietario
                estado='A',  # A = Activo
                user=user
            )
            
            contador_exitosos += 1
            print(f"✓ Propietario creado: {persona.nombre_completo} (Usuario: {username})")
            
        except Exception as e:
            print(f"✗ Error al crear propietario {data['nombre']} {data['apellido']}: {str(e)}")
    
    print(f"\n{'='*60}")
    print(f"Resumen: Se crearon {contador_exitosos} de {len(propietarios_data)} propietarios exitosamente")
    print(f"{'='*60}")

if __name__ == '__main__':
    print("Iniciando creación de propietarios...")
    print(f"{'='*60}\n")
    crear_propietarios()
