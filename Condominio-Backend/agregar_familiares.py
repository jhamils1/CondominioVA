import os
import django
from datetime import date

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'condominioBACK.settings')
django.setup()

from administracion.models import Persona
from residencial.models import Familiares

def crear_familiares():
    print("Creando familiares para propietarios...")
    print(f"{'='*60}\n")
    
    # Obtener todos los propietarios
    propietarios = list(Persona.objects.filter(tipo='P').order_by('id'))
    print(f"Propietarios encontrados: {len(propietarios)}\n")
    
    # Datos de familiares para algunos propietarios (no todos)
    # Seleccionamos 10 propietarios que tendrán familiares
    familiares_data = [
        # Familiares de Carlos Rodríguez
        {
            "propietario_index": 0,  # Carlos Rodríguez
            "familiares": [
                {"nombre": "Elena", "apellido": "Rodríguez", "ci": "22345001", "telefono": "77722345", 
                 "sexo": "F", "fecha_nac": date(1987, 5, 20), "parentesco": "ESPOSA"},
                {"nombre": "Sebastián", "apellido": "Rodríguez", "ci": "32345001", "telefono": "77732345", 
                 "sexo": "M", "fecha_nac": date(2010, 8, 15), "parentesco": "HIJO"},
                {"nombre": "Isabella", "apellido": "Rodríguez", "ci": "32345002", "telefono": "77732346", 
                 "sexo": "F", "fecha_nac": date(2013, 3, 22), "parentesco": "HIJA"},
            ]
        },
        # Familiares de María González
        {
            "propietario_index": 1,  # María González
            "familiares": [
                {"nombre": "Ricardo", "apellido": "González", "ci": "22345002", "telefono": "77722346", 
                 "sexo": "M", "fecha_nac": date(1988, 9, 14), "parentesco": "ESPOSO"},
                {"nombre": "Valentina", "apellido": "González", "ci": "32345003", "telefono": "77732347", 
                 "sexo": "F", "fecha_nac": date(2015, 6, 10), "parentesco": "HIJA"},
            ]
        },
        # Familiares de Juan Pérez
        {
            "propietario_index": 2,  # Juan Pérez
            "familiares": [
                {"nombre": "Claudia", "apellido": "Pérez", "ci": "22345003", "telefono": "77722347", 
                 "sexo": "F", "fecha_nac": date(1980, 12, 5), "parentesco": "ESPOSA"},
                {"nombre": "Mateo", "apellido": "Pérez", "ci": "32345004", "telefono": "77732348", 
                 "sexo": "M", "fecha_nac": date(2008, 4, 18), "parentesco": "HIJO"},
                {"nombre": "Emma", "apellido": "Pérez", "ci": "32345005", "telefono": "77732349", 
                 "sexo": "F", "fecha_nac": date(2011, 11, 25), "parentesco": "HIJA"},
            ]
        },
        # Familiares de Ana Martínez
        {
            "propietario_index": 3,  # Ana Martínez
            "familiares": [
                {"nombre": "Santiago", "apellido": "Martínez", "ci": "32345006", "telefono": "77732350", 
                 "sexo": "M", "fecha_nac": date(2016, 2, 8), "parentesco": "HIJO"},
            ]
        },
        # Familiares de Luis López
        {
            "propietario_index": 4,  # Luis López
            "familiares": [
                {"nombre": "Teresa", "apellido": "López", "ci": "22345004", "telefono": "77722348", 
                 "sexo": "F", "fecha_nac": date(1977, 7, 30), "parentesco": "ESPOSA"},
                {"nombre": "Daniel", "apellido": "López", "ci": "32345007", "telefono": "77732351", 
                 "sexo": "M", "fecha_nac": date(2005, 10, 12), "parentesco": "HIJO"},
                {"nombre": "Lucía", "apellido": "López", "ci": "32345008", "telefono": "77732352", 
                 "sexo": "F", "fecha_nac": date(2007, 5, 28), "parentesco": "HIJA"},
            ]
        },
        # Familiares de Roberto Ramírez
        {
            "propietario_index": 6,  # Roberto Ramírez
            "familiares": [
                {"nombre": "Andrea", "apellido": "Ramírez", "ci": "22345005", "telefono": "77722349", 
                 "sexo": "F", "fecha_nac": date(1993, 3, 16), "parentesco": "ESPOSA"},
            ]
        },
        # Familiares de Patricia Torres
        {
            "propietario_index": 7,  # Patricia Torres
            "familiares": [
                {"nombre": "Martín", "apellido": "Torres", "ci": "22345006", "telefono": "77722350", 
                 "sexo": "M", "fecha_nac": date(1985, 8, 22), "parentesco": "ESPOSO"},
                {"nombre": "Sofía", "apellido": "Torres", "ci": "32345009", "telefono": "77732353", 
                 "sexo": "F", "fecha_nac": date(2012, 9, 7), "parentesco": "HIJA"},
                {"nombre": "Nicolás", "apellido": "Torres", "ci": "32345010", "telefono": "77732354", 
                 "sexo": "M", "fecha_nac": date(2014, 12, 19), "parentesco": "HIJO"},
            ]
        },
        # Familiares de Miguel Flores
        {
            "propietario_index": 8,  # Miguel Flores
            "familiares": [
                {"nombre": "Gabriela", "apellido": "Flores", "ci": "22345007", "telefono": "77722351", 
                 "sexo": "F", "fecha_nac": date(1982, 6, 11), "parentesco": "ESPOSA"},
                {"nombre": "Emilio", "apellido": "Flores", "ci": "32345011", "telefono": "77732355", 
                 "sexo": "M", "fecha_nac": date(2009, 1, 24), "parentesco": "HIJO"},
            ]
        },
        # Familiares de Diego Vargas
        {
            "propietario_index": 10,  # Diego Vargas
            "familiares": [
                {"nombre": "Valeria", "apellido": "Vargas", "ci": "22345008", "telefono": "77722352", 
                 "sexo": "F", "fecha_nac": date(1984, 10, 3), "parentesco": "ESPOSA"},
                {"nombre": "Joaquín", "apellido": "Vargas", "ci": "32345012", "telefono": "77732356", 
                 "sexo": "M", "fecha_nac": date(2010, 7, 15), "parentesco": "HIJO"},
                {"nombre": "Camila", "apellido": "Vargas", "ci": "32345013", "telefono": "77732357", 
                 "sexo": "F", "fecha_nac": date(2013, 4, 9), "parentesco": "HIJA"},
            ]
        },
        # Familiares de Fernando Castro
        {
            "propietario_index": 12,  # Fernando Castro
            "familiares": [
                {"nombre": "Carolina", "apellido": "Castro", "ci": "22345009", "telefono": "77722353", 
                 "sexo": "F", "fecha_nac": date(1988, 11, 27), "parentesco": "ESPOSA"},
                {"nombre": "Lucas", "apellido": "Castro", "ci": "32345014", "telefono": "77732358", 
                 "sexo": "M", "fecha_nac": date(2017, 5, 13), "parentesco": "HIJO"},
            ]
        },
    ]
    
    total_familiares_creados = 0
    propietarios_con_familia = 0
    
    for grupo in familiares_data:
        propietario = propietarios[grupo["propietario_index"]]
        print(f"Creando familiares para: {propietario.nombre_completo}")
        
        familiares_creados_propietario = 0
        for fam_data in grupo["familiares"]:
            try:
                # Verificar si ya existe
                if Persona.objects.filter(CI=fam_data["ci"]).exists():
                    print(f"  ⚠ Familiar con CI {fam_data['ci']} ya existe")
                    continue
                
                # Crear el familiar
                familiar = Familiares.objects.create(
                    nombre=fam_data["nombre"],
                    apellido=fam_data["apellido"],
                    CI=fam_data["ci"],
                    telefono=fam_data["telefono"],
                    sexo=fam_data["sexo"],
                    fecha_nacimiento=fam_data["fecha_nac"],
                    persona_relacionada=propietario,
                    parentesco=fam_data["parentesco"],
                    estado='A'
                )
                
                familiares_creados_propietario += 1
                total_familiares_creados += 1
                print(f"  ✓ {familiar.nombre_completo} ({familiar.get_parentesco_display()})")
                
            except Exception as e:
                print(f"  ✗ Error al crear familiar {fam_data['nombre']}: {str(e)}")
        
        if familiares_creados_propietario > 0:
            propietarios_con_familia += 1
        print()
    
    # Resumen
    print(f"{'='*60}")
    print("RESUMEN:")
    print(f"  • Total propietarios: {len(propietarios)}")
    print(f"  • Propietarios con familiares: {propietarios_con_familia}")
    print(f"  • Propietarios sin familiares: {len(propietarios) - propietarios_con_familia}")
    print(f"  • Total familiares creados: {total_familiares_creados}")
    print(f"{'='*60}")
    
    # Estadísticas por parentesco
    print("\nEstadísticas por parentesco:")
    for parentesco_code, parentesco_name in Familiares.PARENTESCO_CHOICES:
        count = Familiares.objects.filter(parentesco=parentesco_code).count()
        if count > 0:
            print(f"  • {parentesco_name}: {count}")

if __name__ == '__main__':
    crear_familiares()
