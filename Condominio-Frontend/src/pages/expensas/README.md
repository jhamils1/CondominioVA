# Sistema de Gestión de Expensas

Este módulo permite gestionar expensas residenciales con funcionalidades completas de CRUD y seguimiento de estados de pago.

## Funcionalidades

### 1. Gestión de Expensas
- **Crear**: Nuevas expensas con unidad, monto y fecha de vencimiento
- **Editar**: Modificar expensas existentes
- **Eliminar**: Remover expensas del sistema
- **Listar**: Ver todas las expensas con filtros de búsqueda
- **Ver Detalles**: Botón para ver información completa de la expensa

### 2. Campos de la Expensa
- **Unidad**: Selección obligatoria de unidades disponibles
- **Monto**: Campo numérico obligatorio (mayor a $0.00)
- **Fecha de Vencimiento**: Campo de fecha obligatorio (no puede ser en el pasado)
- **Estado de Pago**: Checkbox para marcar como pagada
- **Fecha de Emisión**: Automática al crear la expensa

### 3. Estados de Expensa
- **🟢 Pagada**: Expensa que ha sido cancelada completamente
- **🟡 Pendiente**: Expensa que aún no ha sido pagada
- **🔴 Vencida**: Expensa que ha pasado su fecha de vencimiento sin pagar

### 4. Dashboard Estadístico
- **Total Expensas**: Contador de expensas registradas
- **Pagadas**: Contador de expensas pagadas
- **Vencidas**: Contador de expensas vencidas
- **Monto Total**: Suma de todos los montos de expensas

## Archivos del Sistema

### API (`src/api/expensaApi.jsx`)
- `fetchAllExpensas()`: Obtener todas las expensas
- `createExpensa(data)`: Crear nueva expensa
- `updateExpensa(id, data)`: Actualizar expensa existente
- `deleteExpensa(id)`: Eliminar expensa

### Componentes
- **ExpensaPage**: Componente principal que integra lista y formulario
- **ExpensaList**: Lista de expensas con estadísticas y acciones
- **ExpensaForm**: Formulario para crear/editar expensas

## Uso del Sistema

1. **Acceder**: Navegar a `/admin/expensas` desde el sidebar
2. **Crear**: Hacer clic en "Nueva Expensa" y llenar el formulario
3. **Ver Estadísticas**: Dashboard con métricas importantes
4. **Ver Detalles**: Usar el botón "Ver Detalles" para información completa
5. **Editar**: Hacer clic en "Editar" en la lista de expensas
6. **Eliminar**: Hacer clic en "Eliminar" con confirmación
7. **Buscar**: Usar la barra de búsqueda para filtrar expensas

## Integración con Backend

El sistema se conecta con el endpoint `/expensas/` del backend Django que incluye:
- CRUD básico de expensas
- Serialización simple con todos los campos
- Asociación con unidades mediante ForeignKey

## Estructura de Datos

### Modelo Expensa
```python
class expensa(models.Model):
    id = models.AutoField(primary_key=True)
    unidad = models.ForeignKey(Unidad, ...)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_emision = models.DateField(auto_now_add=True)
    fecha_vencimiento = models.DateField()
    pagada = models.BooleanField(default=False)
```

### Serializer Response
```json
{
  "id": 1,
  "unidad": 5,
  "monto": "150.00",
  "fecha_emision": "2024-01-15",
  "fecha_vencimiento": "2024-02-15",
  "pagada": false
}
```

## Validaciones Implementadas

### **Frontend**
- Unidad obligatoria
- Monto mayor a $0.00
- Fecha de vencimiento obligatoria
- Fecha de vencimiento no puede ser en el pasado
- Validación de tipos de datos

### **Backend**
- Validaciones de modelo Django
- Campos requeridos según el modelo
- Validaciones de ForeignKey

## Características Especiales

1. **Dashboard Estadístico**: Métricas visuales en tiempo real
2. **Estados Automáticos**: Cálculo automático de estados (Pagada/Pendiente/Vencida)
3. **Validaciones Robustas**: Fechas y montos validados
4. **Búsqueda Inteligente**: Múltiples campos de búsqueda simultánea
5. **Formato de Moneda**: Montos con separadores de miles
6. **Estados Visuales**: Códigos de colores para diferentes estados
7. **Estados de Carga**: Indicadores visuales durante operaciones

## Relaciones del Sistema

### **Con Unidades**
- Cada expensa pertenece a una unidad específica
- Selector de unidades con información del bloque

### **Con Multas**
- Las expensas vencidas pueden generar multas
- Las multas se pueden asociar con expensas específicas

## Notas Técnicas

- La fecha de emisión se asigna automáticamente al crear
- El monto se valida tanto en frontend como backend
- Las expensas vencidas se identifican automáticamente
- Búsqueda funciona en múltiples campos simultáneamente
- Estadísticas se calculan en tiempo real
- Validaciones tanto en frontend como backend
- Estados de expensa se calculan dinámicamente
