# Registro Imou y configuración pendiente — 2026-11-05

El usuario informó que dejaron de registrarse eventos y recibirse avisos.
Consulta de solo lectura en Django local: no había registros en `ZonaImou`;
las 24 entregas existentes figuraban `ENVIADA`, sin entregas pendientes.
Ese estado no certifica recepción del teléfono ni ejecución actual del procesador.

En el frontend, dibujar una zona, cambiar el tiempo o marcar la opción automática
pausa el registro hasta guardar la configuración. El análisis puede seguir
mostrando rojo con el borrador sin enviar un evento. No se inspeccionó el estado
en memoria de la pestaña del usuario; la ausencia de configuración persistida
sí quedó comprobada.

Se hizo visible el estado del registro también fuera de Configuración de análisis:
cambios pendientes, ausencia de zona, IA detenida, registro activo, desactivado
o pausado por un evento pendiente. El botón de guardar queda accesible en monitoreo
cuando hay cambios pendientes, y confirma el guardado. La casilla explica que
requiere guardar; las operaciones de zona se bloquean mientras se guarda y no se
permite guardar para reactivar avisos mientras queda un envío por confirmar.

No se guardó una zona inventada ni se activó la opción en la base. El administrador
debe completar la zona, marcar el registro automático y pulsar **Guardar
configuración Imou**. Con IA activa debe aparecer **Registro automático activo**.
Al guardar se reinicia el conteo para evaluar nuevos hallazgos con la regla aplicada.

Verificación: 13 pruebas Node, ESLint, build Vite y recorrido Edge con API/cámara
simuladas correctos. El recorrido comprueba ausencia de envíos con borrador,
aviso visible en monitoreo, guardado fallido sin activar envíos, guardado exitoso,
envío con JPEG, pausa/reintento con mismo identificador y guardia sin controles de
escritura. `git diff --check` sin errores; build conserva aviso de tamaño de bundle.
No se modificó backend, Flutter, Firebase, pesos ni reglas de permanencia en esta
corrección. Falta confirmar guardado y evento real en la sesión del usuario.
