# Recuperación ante una invalidación de Firebase incierta

## Decisión de esta etapa

Conservar el estado `deletionUncertain` y no habilitar el registro push de la nueva cuenta. No se añadió un botón para saltar este estado ni un mecanismo que lo declare resuelto: todavía no se dispone de una forma verificada de demostrar qué token invalidó Firebase cuando se pierde la respuesta. La coordinación y el almacén preparados continúan desconectados de la aplicación real.

El complemento instalado `firebase_messaging` 16.0.4 expone `deleteToken()` sin parámetro de token, y su código Android llama al método correspondiente de Firebase sin pasar uno. También ofrece obtención del token y configuración de inicio automático, pero esa interfaz no demuestra una comparación e invalidación atómicas del token esperado. Ver un token diferente después no demuestra, por sí solo, qué ocurrió ni controla una renovación concurrente. Esta conclusión se limita al código instalado revisado; no afirma que sea imposible encontrar otro mecanismo validado.

## Comportamiento previsto

| Situación | Acción segura prevista |
| --- | --- |
| Respuesta de invalidación perdida o error | Conservar el estado incierto y no repetir el borrado automáticamente. |
| Aparece un token distinto | Mantener el bloqueo; la diferencia no constituye prueba suficiente. |
| La persona vuelve a iniciar sesión en la cuenta anterior | Mantener el bloqueo hasta contar con un procedimiento de verificación válido. |
| Se inicia sesión en la cuenta nueva | La bandeja interna debe seguir disponible; el push del dispositivo permanece pendiente. Esto aún debe integrarse y probarse en la app. |
| No se conoce la cuenta anterior | No modificar ni reclamar su registro; no asumir propiedad por tener el teléfono. |
| Estado guardado corrupto o inaccesible | No considerar que el cambio haya terminado; informar el fallo cuando exista interfaz. |

## Requisitos para una recuperación futura

Antes de habilitar una transición a «listo» será necesario documentar y comprobar una fuente de evidencia fiable para el token y la operación específicos, además de la identidad y el consentimiento de la cuenta anterior. El procedimiento deberá coordinar la renovación, las instancias de la app y la persistencia; preservar el vínculo de propiedad del servidor y no registrar información sensible. Si las garantías no pueden demostrarse, debe continuar bloqueado y ofrecerse una alternativa autorizada por la política del proyecto.

No se implementó un verificador ficticio que pueda confundirse con una prueba real de Firebase. Tampoco se definió una recuperación administrativa o un procedimiento para borrar datos, porque la autorización y sus consecuencias no están establecidos.

## Pruebas de esta etapa

Pasaron 26 pruebas Flutter con servicios simulados y análisis estático sin observaciones. Se añadieron casos para respuesta perdida, cambio de sesión, aparición de un token distinto, regreso a la cuenta anterior y recarga del estado mediante el complemento de almacenamiento simulado. En todos ellos el flujo incierto permanece bloqueado y no vuelve a llamar a la invalidación ni registra la nueva cuenta.

La recarga simulada crea nuevos objetos con el mismo almacén simulado; no equivale a reiniciar Android ni valida la persistencia en un teléfono. No hubo conexión a Firebase, envíos push, instalación de aplicaciones ni cambios de datos reales. Sigue pendiente estudiar y probar un mecanismo de evidencia real y la coordinación entre procesos en un dispositivo de prueba autorizado.
