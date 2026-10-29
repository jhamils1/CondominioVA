# Sistema de Gestión de Multas

Este módulo permite gestionar multas residenciales con funcionalidades completas de CRUD y asociación con expensas.

## Funcionalidades

### 1. Gestión de Multas
- **Crear**: Nuevas multas con expensa, monto y tipo
- **Editar**: Modificar multas existentes
- **Eliminar**: Remover multas del sistema
- **Listar**: Ver todas las multas con filtros de búsqueda
- **Ver Detalles**: Botón para ver información completa de la multa

### 2. Campos de la Multa
- **Expensa**: Selección obligatoria de expensas disponibles
- **Monto**: Campo numérico obligatorio (mayor a $0.00)
- **Tipo**: Selección entre Incidente, Falta de Pago, u Otros
- **Fecha Multa**: Automática al crear la multa

### 3. Estadísticas y Dashboard
- **Total Multas**: Contador de multas registradas
- **Monto Total**: Suma de todos los montos de multas
- **Por Incidentes**: Contador de multas tipo "Incidente"
- **Búsqueda Avanzada**: Por ID, monto, tipo o fecha

## Archivos del Sistema

### API (`src/api/multaApi.jsx`)
- `fetchAllMultas()`: Obtener todas las multas
- `createMulta(data)`: Crear nueva multa
- `updateMulta(id, data)`: Actualizar multa existente
- `deleteMulta(id)`: Eliminar multa

### API Auxiliar (`src/api/expensaApi.jsx`)
- `fetchAllExpensas()`: Obtener expensas disponibles para asociar

### Componentes
- **MultaPage**: Componente principal que integra lista y formulario
- **MultaList**: Lista de multas con estadísticas y acciones
- **MultaForm**: Formulario para crear/editar multas

## Uso del Sistema

1. **Acceder**: Navegar a `/admin/multas` desde el sidebar
2. **Crear**: Hacer clic en "Nueva Multa" y llenar el formulario
3. **Ver Estadísticas**: Dashboard con métricas importantes
4. **Ver Detalles**: Usar el botón "Ver Detalles" para información completa
5. **Editar**: Hacer clic en "Editar" en la lista de multas
6. **Eliminar**: Hacer clic en "Eliminar" con confirmación
7. **Buscar**: Usar la barra de búsqueda para filtrar multas

## Integración con Backend

El sistema se conecta con el endpoint `/multas/` del backend Django que incluye:
- CRUD básico de multas
- Serialización simple con todos los campos
- Asociación con expensas mediante ForeignKey

## Estructura de Datos

### Modelo Multa
```python
class multa(models.Model):
    TIPO_CHOISES = [
        ('I', 'Incidente'),
        ('F', 'falta de pago'),
        ('O', 'otros'),
    ]
    id = models.AutoField(primary_key=True)
    expensa = models.ForeignKey(expensa, ...)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_multa = models.DateField(auto_now_add=True)
    tipo = models.CharField(max_length=1, choices=TIPO_CHOISES, default='I')
```

### Serializer Response
```json
{
  "id": 1,
  "expensa": 5,
  "monto": "50.00",
  "fecha_multa": "2024-01-15",
  "tipo": "I"
}
```

## Tipos de Multa

### **Incidente (I)**
- Multa aplicada por algún incidente reportado
- Se asocia con incidentes específicos
- Color azul en la interfaz

### **Falta de Pago (F)**
- Multa por retraso en el pago de expensas
- Relacionada con pagos vencidos
- Color rojo en la interfaz

### **Otros (O)**
- Multa por otras razones no especificadas
- Casos especiales o administrativos
- Color gris en la interfaz

## Características Especiales

1. **Dashboard Estadístico**: Métricas visuales importantes
2. **Validaciones Robustas**: Monto mayor a $0.00, expensa obligatoria
3. **Búsqueda Inteligente**: Múltiples campos de búsqueda
4. **Formato de Moneda**: Montos formateados con separadores de miles
5. **Tipos Visuales**: Códigos de colores para diferentes tipos
6. **Estados de Carga**: Indicadores visuales durante operaciones

## Notas Técnicas

- La fecha de multa se asigna automáticamente al crear
- El monto se valida tanto en frontend como backend
- Las multas se pueden asociar con incidentes
- Búsqueda funciona en múltiples campos simultáneamente
- Estadísticas se calculan en tiempo real
- Validaciones tanto en frontend como backend
