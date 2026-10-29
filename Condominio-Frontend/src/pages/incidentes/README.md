# Sistema de Gestión de Incidentes

Este módulo permite gestionar incidentes residenciales con funcionalidades completas de CRUD y asociación con propietarios y multas.

## Funcionalidades

### 1. Gestión de Incidentes
- **Crear**: Nuevos incidentes con descripción, fecha, propietario y multa opcional
- **Editar**: Modificar incidentes existentes
- **Eliminar**: Remover incidentes del sistema
- **Listar**: Ver todos los incidentes con filtros de búsqueda
- **Ver Detalles**: Botón para ver descripción completa y detalles de multa

### 2. Campos del Incidente
- **Propietario**: Selección opcional de propietarios registrados
- **Descripción**: Campo de texto obligatorio para describir el incidente
- **Fecha del Incidente**: Fecha y hora obligatorias del incidente
- **Multa**: Selección opcional de multas disponibles
- **Fecha de Registro**: Automática al crear el incidente

### 3. Funcionalidades Especiales
- **Búsqueda Avanzada**: Por propietario, descripción, fecha o multa
- **Vista de Detalles**: Modal para ver descripción completa y multa
- **Validaciones**: Campos obligatorios y validaciones de datos
- **Estados de Carga**: Indicadores visuales durante operaciones

## Archivos del Sistema

### API (`src/api/incidenteApi.jsx`)
- `fetchAllIncidentes()`: Obtener todos los incidentes
- `createIncidente(data)`: Crear nuevo incidente
- `updateIncidente(id, data)`: Actualizar incidente existente
- `deleteIncidente(id)`: Eliminar incidente

### API Auxiliar (`src/api/multaApi.jsx`)
- `fetchAllMultas()`: Obtener multas disponibles para asociar

### Componentes
- **IncidentePage**: Componente principal que integra lista y formulario
- **IncidenteList**: Lista de incidentes con acciones y búsqueda
- **IncidenteForm**: Formulario para crear/editar incidentes

## Uso del Sistema

1. **Acceder**: Navegar a `/admin/incidentes` desde el sidebar
2. **Crear**: Hacer clic en "Nuevo Incidente" y llenar el formulario
3. **Ver Detalles**: Usar el botón "Ver Detalles" para información completa
4. **Editar**: Hacer clic en "Editar" en la lista de incidentes
5. **Eliminar**: Hacer clic en "Eliminar" con confirmación
6. **Buscar**: Usar la barra de búsqueda para filtrar incidentes

## Integración con Backend

El sistema se conecta con el endpoint `/incidentes/` del backend Django que incluye:
- CRUD básico de incidentes
- Serialización con datos relacionados (propietario, multa)
- Campos calculados (propietario_nombre, multa_detalle)
- Formateo de fechas automático

## Estructura de Datos

### Modelo Incidente
```python
class incidente(models.Model):
    id = models.AutoField(primary_key=True)
    propietario = models.ForeignKey('administracion.Persona', ...)
    multa = models.ForeignKey('finanzas.multa', ...)
    descripcion = models.TextField()
    fecha_incidente = models.DateTimeField()
    fecha_registro = models.DateTimeField(auto_now_add=True)
```

### Serializer Response
```json
{
  "id": 1,
  "propietario": 1,
  "multa": 2,
  "descripcion": "Descripción del incidente",
  "fecha_incidente": "15/01/2024 14:30",
  "fecha_registro": "15/01/2024 16:45",
  "propietario_nombre": "Juan Pérez",
  "multa_detalle": {
    "id": 2,
    "descripcion": "Multa por ruido",
    "monto": 50.00
  }
}
```

## Notas Técnicas

- Los campos propietario y multa son opcionales
- La descripción y fecha del incidente son obligatorios
- El sistema maneja fechas en formato datetime-local
- Búsqueda funciona en múltiples campos simultáneamente
- Validaciones tanto en frontend como backend
- Estados de carga para mejor UX
