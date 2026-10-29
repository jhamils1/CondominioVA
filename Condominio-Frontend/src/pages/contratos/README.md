# Sistema de Gestión de Contratos

Este módulo permite gestionar contratos de unidades residenciales con funcionalidades completas de CRUD y generación de PDFs.

## Funcionalidades

### 1. Gestión de Contratos
- **Crear**: Nuevos contratos con propietario, unidad, fechas y datos financieros
- **Editar**: Modificar contratos existentes
- **Eliminar**: Remover contratos del sistema
- **Listar**: Ver todos los contratos con filtros de búsqueda

### 2. Generación de PDF
- **Generar PDF**: Crear documento PDF del contrato usando el template del backend
- **Almacenamiento**: El PDF se guarda automáticamente en Cloudinary
- **Descarga**: Descargar el PDF generado directamente al dispositivo

### 3. Campos del Contrato
- **Propietario**: Selección de propietarios registrados
- **Unidad**: Selección de unidades disponibles
- **Fecha del Contrato**: Fecha de inicio del contrato
- **Estado**: Pendiente, Activo, Inactivo, Finalizado
- **Cuota Mensual**: Monto mensual a pagar (opcional)
- **Costo de Compra**: Costo total de la unidad (opcional)

## Archivos del Sistema

### API (`src/api/contratoApi.jsx`)
- `fetchAllContratos()`: Obtener todos los contratos
- `createContrato(data)`: Crear nuevo contrato
- `updateContrato(id, data)`: Actualizar contrato existente
- `deleteContrato(id)`: Eliminar contrato
- `generarPDFContrato(id)`: Generar PDF del contrato
- `descargarPDFContrato(url)`: Descargar PDF desde URL

### Componentes
- **ContratoPage**: Componente principal que integra lista y formulario
- **ContratoList**: Lista de contratos con acciones de PDF
- **ContratoForm**: Formulario para crear/editar contratos

## Uso del Sistema

1. **Acceder**: Navegar a `/admin/contratos` desde el sidebar
2. **Crear**: Hacer clic en "Nuevo Contrato" y llenar el formulario
3. **Generar PDF**: Usar el botón "Generar PDF" en la lista
4. **Descargar**: Usar el botón "Descargar PDF" cuando esté disponible
5. **Editar**: Hacer clic en "Editar" en la lista de contratos
6. **Eliminar**: Hacer clic en "Eliminar" con confirmación

## Integración con Backend

El sistema se conecta con el endpoint `/contratos/` del backend Django que incluye:
- CRUD básico de contratos
- Endpoint especial `/contratos/{id}/generar_pdf/` para generar PDFs
- Almacenamiento automático en Cloudinary
- Serialización con datos relacionados (propietario, unidad)

## Notas Técnicas

- Los PDFs se generan usando templates HTML del backend
- Cloudinary maneja el almacenamiento y entrega de archivos
- El sistema maneja estados de carga para mejor UX
- Validación de campos requeridos en el frontend
- Búsqueda por propietario, unidad y estado


