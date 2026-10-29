# Guía de Reconocimiento Facial - Frontend

## Funcionalidades Implementadas

### 1. Reconocimiento Facial (`/admin/reconocimiento-facial`)

**Propósito**: Identificar personas en tiempo real usando Luxand.cloud

**Características**:
- Captura de imagen desde archivo o cámara web
- Configuración de umbral de confianza (50% - 100%)
- Reconocimiento de residentes y empleados
- Indicadores visuales de acceso (verde/rojo)
- Vista previa de imagen procesada

**Flujo de Uso**:
1. Seleccionar imagen desde archivo o capturar con cámara
2. Ajustar umbral de confianza según necesidades
3. Hacer clic en "Reconocer Persona"
4. Ver resultado con información de la persona identificada

**Respuesta del Sistema**:
```json
{
  "ok": true,
  "tipo": "persona",
  "id": 123,
  "nombre": "Juan Pérez",
  "similaridad": 0.8542,
  "uuid": "luxand-uuid-aqui",
  "umbral": 0.80
}
```

### 2. Enrolar Persona (`/admin/enrolar-persona`)

**Propósito**: Registrar personas en el sistema de reconocimiento facial

**Características**:
- Selección entre residente o empleado
- Captura de imagen desde archivo o cámara web
- Validación de ID existente en base de datos
- Confirmación de enrolamiento exitoso

**Flujo de Uso**:
1. Seleccionar tipo de persona (Residente/Empleado)
2. Ingresar ID de la persona en el sistema
3. Capturar o subir foto de la persona
4. Hacer clic en "Enrolar Persona"
5. Ver confirmación de enrolamiento

**Respuesta del Sistema**:
```json
{
  "ok": true,
  "uuid": "luxand-uuid-aqui",
  "nombre": "Juan Pérez",
  "tipo": "persona",
  "mensaje": "Persona enrolado exitosamente"
}
```

## API Functions Disponibles

### `recognizeFace(imageFile, threshold)`
- **Parámetros**: 
  - `imageFile`: Archivo de imagen
  - `threshold`: Umbral de confianza (0.5 - 1.0)
- **Retorna**: Objeto con resultado del reconocimiento

### `recognizeFaceFromUrl(imageUrl, threshold)`
- **Parámetros**:
  - `imageUrl`: URL de la imagen
  - `threshold`: Umbral de confianza (0.5 - 1.0)
- **Retorna**: Objeto con resultado del reconocimiento

### `enrollPerson(personId, employeeId, imageFile)`
- **Parámetros**:
  - `personId`: ID de persona (opcional)
  - `employeeId`: ID de empleado (opcional)
  - `imageFile`: Archivo de imagen
- **Retorna**: Objeto con resultado del enrolamiento

## Configuración Requerida

### Variables de Entorno
```env
VITE_API_URL=http://localhost:8000/api
```

### Backend Endpoints Utilizados
- `POST /api/reconocimiento/` - Reconocimiento facial
- `POST /api/enrolar/` - Enrolar persona

## Características Técnicas

### Validaciones Frontend
- ✅ Formato de imagen válido (image/*)
- ✅ Tamaño máximo de archivo (10MB)
- ✅ Campos requeridos completados
- ✅ ID de persona válido

### Manejo de Errores
- ✅ Errores de conexión con backend
- ✅ Errores de validación de datos
- ✅ Errores de API Luxand
- ✅ Mensajes de error descriptivos

### UX/UI
- ✅ Indicadores visuales de estado
- ✅ Cámara web con espejo para mejor UX
- ✅ Vista previa de imágenes
- ✅ Botones de estado (procesando/deshabilitado)
- ✅ Colores de resultado (verde/rojo)

## Flujo de Trabajo Recomendado

1. **Configuración Inicial**:
   - Asegurar que el backend tenga `LUXAND_TOKEN` configurado
   - Verificar que las personas/empleados existan en la base de datos

2. **Enrolamiento**:
   - Usar `/admin/enrolar-persona` para registrar personas
   - Capturar fotos claras con buena iluminación
   - Verificar que el ID de persona sea correcto

3. **Reconocimiento**:
   - Usar `/admin/reconocimiento-facial` para identificar personas
   - Ajustar umbral según necesidades de seguridad
   - Monitorear resultados y ajustar configuración

4. **Monitoreo**:
   - Revisar logs del backend para detectar problemas
   - Verificar conectividad con Luxand.cloud
   - Ajustar umbrales según tasa de éxito

## Troubleshooting

### Problemas Comunes

**"Error de conexión con Luxand"**:
- Verificar `LUXAND_TOKEN` en backend
- Comprobar conectividad a internet
- Revisar logs del backend

**"Persona no encontrada"**:
- Verificar que la persona esté enrolada
- Comprobar que el ID sea correcto
- Ajustar umbral de confianza

**"No se pudo acceder a la cámara"**:
- Verificar permisos del navegador
- Usar HTTPS en producción
- Probar con diferentes navegadores

### Logs Útiles
- Console del navegador para errores frontend
- Logs del backend Django para errores de API
- Dashboard de Luxand.cloud para uso de API
