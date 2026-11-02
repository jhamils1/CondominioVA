# Prueba web aislada de roles

Desde `Condominio-Frontend`, con las dependencias instaladas y el entorno Python del backend preparado:

```powershell
npm run test:e2e
```

Requiere Node.js 20 o posterior, Microsoft Edge instalado y puertos **15173 y 18081 libres**. Usa Playwright 1.64.1 como dependencia de desarrollo. No instala navegadores ni utiliza el perfil habitual del navegador.

El comando arranca el runner Django `--web-check`, que crea una SQLite temporal, aplica migraciones exclusivamente allí y genera dos cuentas ficticias. Playwright arranca Vite con `VITE_API_URL=http://127.0.0.1:18081/api/`, sin editar `.env` y sin reutilizar servidores existentes. La prueba valida la identidad del backend antes de iniciar sesión.

El escenario usa formularios React reales para crear, activar, asignar, conceder y revocar permisos y desactivar el rol; comprueba rutas, consulta de visitas, cierre y rechazo de tokens. Backend y navegador bloquean conexiones ajenas al entorno de prueba; Firebase no se inicializa. La carga anticipada de Stripe produce el error esperado `Failed to load Stripe.js` porque su CDN está bloqueada: pagos quedan excluidos y otros errores JavaScript hacen fallar la prueba.

Las capturas de tres estados se guardan en `test-results/` (ignorado por Git y reemplazado en la siguiente ejecución). No se guardan trazas de red, videos ni sesiones autenticadas. Los contextos del navegador se cierran en `finally`; Playwright cierra Vite y Django cierra su servidor/conexiones y elimina la SQLite al terminar, incluso si las aserciones fallan. Una terminación forzada del proceso o del equipo puede impedir esa limpieza: verificar únicamente los procesos/directorios de esa ejecución, nunca borrar bases o procesos habituales.

No ejecutar contra otra URL ni agregar credenciales reales al test. Un puerto ocupado hace fallar el arranque; no detener automáticamente el proceso que lo ocupa.

Resultado y límites: [informe de integración web](../../documentacion/seguridad/PRUEBA_INTEGRACION_WEB_ROLES.md).
