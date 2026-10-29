# Sistema de Reservas de Áreas Comunes - Implementación Móvil

## Descripción
Se ha implementado un sistema completo de gestión de reservas de áreas comunes en la aplicación móvil Flutter, permitiendo a los usuarios:
- Ver las áreas comunes disponibles
- Crear reservas de áreas comunes
- Ver su historial de reservas
- Cancelar reservas pendientes

## Archivos Creados

### Modelos (`lib/models/`)
1. **area_comun.dart**
   - Clase `AreaComun` con todos los campos del modelo Django
   - Métodos helper: `estaActivo`, `estadoDisplay`
   - Serialización JSON (fromJson/toJson)

2. **reserva_area_comun.dart**
   - Clase `ReservaAreaComun` con todos los campos del modelo Django
   - Métodos helper: `estadoDisplay`, `puedeSerCancelada`, `estaActiva`
   - Serialización JSON

### Servicios (`lib/services/`)
1. **area_comun_service.dart**
   - `getAreas()`: Obtener todas las áreas comunes
   - `getArea(id)`: Obtener un área específica
   - `filterAreasByEstado()`: Filtrar áreas por estado (activo/inactivo)
   - `sortAreasByNombre()`: Ordenar áreas alfabéticamente

2. **reserva_service.dart**
   - `getReservas()`: Obtener reservas del usuario
   - `getReserva(id)`: Obtener una reserva específica
   - `crearReserva()`: Crear nueva reserva
   - `cancelarReserva(id)`: Cancelar/eliminar reserva
   - Métodos de filtrado y ordenamiento

### Páginas (`lib/pages/`)
1. **areas_comunes_page.dart**
   - Lista todas las áreas comunes disponibles
   - Filtro para mostrar solo áreas activas
   - Navegación a detalle de área
   - Iconos dinámicos según el tipo de área
   - Pull-to-refresh

2. **area_comun_detalle_page.dart**
   - Muestra información detallada del área
   - Formulario para crear reserva
   - Selectores de fecha y hora
   - Validación de campos requeridos
   - Manejo de errores del backend

3. **mis_reservas_page.dart**
   - Lista todas las reservas del usuario
   - Filtros por estado (Todas, Activas, Pendientes, Confirmadas, Canceladas, Completadas)
   - Función para cancelar reservas pendientes
   - Confirmación antes de cancelar
   - Códigos de color por estado

## Configuración

### API Config (`lib/config/api_config.dart`)
Se agregaron dos nuevos endpoints:
```dart
static const String areasEndpoint = '/areas/';
static const String reservasEndpoint = '/reservas/';
```

### Dependencias (`pubspec.yaml`)
Se agregó la dependencia:
```yaml
intl: ^0.19.0  # Para formateo de fechas
```

### Navegación (`lib/main.dart`)
Se agregaron las rutas:
- `/areas-comunes`: Lista de áreas comunes
- `/mis-reservas`: Lista de reservas del usuario

### Menú Principal (`lib/pages/perfil_page.dart`)
Se agregaron en el drawer:
- **Áreas Comunes**: Acceso a la lista de áreas
- **Mis Reservas**: Acceso al historial de reservas

## Características Implementadas

### 1. Visualización de Áreas Comunes
- ✅ Lista completa de áreas con información clave
- ✅ Iconos personalizados según el tipo de área (piscina, gimnasio, salón, cancha, etc.)
- ✅ Indicador visual de estado (activo/inactivo)
- ✅ Información de capacidad, ubicación y horarios
- ✅ Filtro para mostrar solo áreas activas
- ✅ Diseño responsive y atractivo

### 2. Creación de Reservas
- ✅ Formulario intuitivo con selectores de fecha y hora
- ✅ Validación de campos requeridos
- ✅ Solo permite reservar áreas activas
- ✅ Manejo de errores del backend (conflictos de horario, validaciones, etc.)
- ✅ Feedback visual durante el proceso
- ✅ Mensajes de éxito/error claros

### 3. Gestión de Reservas
- ✅ Historial completo de reservas del usuario
- ✅ Filtros por estado de reserva
- ✅ Información detallada de cada reserva
- ✅ Cancelación de reservas pendientes
- ✅ Confirmación antes de cancelar
- ✅ Códigos de color por estado (Pendiente: naranja, Confirmada: verde, Cancelada: rojo, Completada: azul)
- ✅ Ordenamiento por fecha (más recientes primero)

### 4. Integración con Backend
- ✅ Consume endpoints: `/api/areas/` y `/api/reservas/`
- ✅ Autenticación con Bearer token
- ✅ Manejo de errores HTTP
- ✅ Extracción de mensajes de error del backend
- ✅ Compatibilidad con el sistema de permisos Django (admin vs usuario)

## Flujo de Usuario

1. **Ver Áreas Comunes**
   - Usuario accede desde el menú lateral → "Áreas Comunes"
   - Ve lista de áreas disponibles
   - Puede filtrar por activas/todas
   - Toca un área para ver detalles

2. **Crear Reserva**
   - Desde detalle de área, ve el formulario
   - Selecciona fecha (solo futuras)
   - Selecciona hora de inicio
   - Selecciona hora de fin
   - Toca "Confirmar Reserva"
   - Sistema valida y crea la reserva
   - Vuelve a la lista de áreas

3. **Gestionar Reservas**
   - Usuario accede desde el menú → "Mis Reservas"
   - Ve todas sus reservas
   - Puede filtrar por estado
   - Para reservas pendientes/confirmadas futuras, puede cancelar
   - Confirma la cancelación
   - Sistema actualiza la lista

## Validaciones del Backend Implementadas

El backend realiza las siguientes validaciones que el móvil maneja:
- ✅ Fecha no puede ser en el pasado
- ✅ Horario debe estar dentro del horario de atención del área
- ✅ No puede haber conflictos con otras reservas
- ✅ Solo se pueden cancelar reservas pendientes (usuarios normales)
- ✅ Área debe estar activa

## Notas de Seguridad

- Los usuarios normales solo pueden reservar a su nombre (el backend asigna automáticamente su persona)
- Los usuarios normales solo ven sus propias reservas
- Los administradores pueden ver y gestionar todas las reservas
- Las reservas confirmadas/completadas no pueden ser canceladas por usuarios normales

## Testing

Para probar la funcionalidad:

1. Asegúrate de tener áreas comunes creadas en el backend
2. Inicia sesión en la app móvil
3. Navega a "Áreas Comunes" desde el menú
4. Selecciona un área y crea una reserva
5. Navega a "Mis Reservas" para ver tu reserva
6. Intenta cancelar una reserva pendiente

## Posibles Mejoras Futuras

- [ ] Agregar calendario visual para seleccionar fecha
- [ ] Mostrar disponibilidad en tiempo real del área
- [ ] Notificaciones push para recordatorios de reservas
- [ ] Compartir reserva con otros residentes
- [ ] QR code para acceso al área reservada
- [ ] Galería de imágenes de las áreas
- [ ] Reseñas y calificaciones de áreas
- [ ] Repetir reserva (semanal, quincenal)
