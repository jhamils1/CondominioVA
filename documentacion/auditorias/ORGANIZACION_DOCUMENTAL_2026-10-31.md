# Organización documental del proyecto

Fecha: 2026-10-31. Alcance autorizado: auditoría y organización de documentación, contexto, memoria e instrucciones. No se autorizó implementar funcionalidades ni modificar infraestructura. Este informe reúne el inventario y el resultado para revisión del usuario.

## Estructura anterior y auditoría previa

Raíz confirmada mediante `git rev-parse --show-toplevel`: el proyecto de condominio compartido. Rama `main`, `git status --short` vacío; sin cambios rastreados pendientes ni archivos no rastreados visibles antes de comenzar. No se encontraron `AGENTS.md`, `contexto/`, `memoria/` o `.agents/` previos.

La raíz contenía `.git/`, `.gitignore` vacío, los tres componentes y `documentacion/`. Esta última tenía cuatro documentos sueltos y once archivos de base de datos, además de la subcarpeta vacía `base-datos/qa_word/`, que se conserva. Se encontraron informes de etapas y README dentro de componentes. No hay colisiones entre los cuatro originales y sus destinos ni nombres idénticos que obliguen a elegir una versión. Hay documentos de temas similares que corresponden a distintas etapas: se conservaron todos.

Archivos ignorados relevantes: entorno virtual, `.env` del backend, credencial Firebase local, cachés Python/Flutter/Gradle, node_modules, dist/build y respaldos locales. Se consultaron rutas y reglas, no valores secretos. La existencia de un archivo ignorado no demuestra protección de todo el historial Git.

Plan ejecutado: mover únicamente los cuatro documentos de `documentacion/`, crear las carpetas y archivos solicitados, conservar informes internos y enlazarlos desde un índice. Se respetó la indicación final de no modificar los tres componentes. No fue necesario apartarse de la estructura propuesta.

## Estructura nueva

```text
raíz/
├── AGENTS.md
├── contexto/
│   ├── README.md
│   ├── estado-proyecto.md
│   ├── arquitectura.md
│   ├── reglas-negocio.md
│   ├── roles-permisos.md
│   ├── seguridad-ia.md
│   ├── decisiones-tecnicas.md
│   └── integraciones-externas.md
├── memoria/
│   ├── README.md
│   ├── estado-actual.md
│   ├── historial-trabajo.md
│   ├── cambios-realizados.md
│   ├── pendientes.md
│   └── pruebas.md
├── .agents/skills/
│   ├── auditoria-django/SKILL.md
│   ├── seguridad-condominio/SKILL.md
│   └── vision-artificial/SKILL.md
├── documentacion/
│   ├── README.md
│   ├── requisitos/Enunciado Proyecto condominio.docx
│   ├── auditorias/
│   │   ├── Auditoria_tecnica_seguridad_IA_condominio.docx
│   │   └── ORGANIZACION_DOCUMENTAL_2026-10-31.md
│   ├── seguridad/
│   │   ├── GUIA_ROLES_SEGURIDAD_NOTIFICACIONES.md
│   │   └── PROPUESTA_ALTA_SEGURA_CUENTAS.md
│   └── base-datos/ (once archivos originales intactos)
├── Condominio-Backend/ (intacto)
├── Condominio-Frontend/ (intacto)
├── condominio-movil/ (intacto)
├── .gitignore (intacto)
└── .git/ (sin commit ni cambios de historial)
```

## Archivos creados y finalidad

Son veinte archivos nuevos; los cuatro traslados no son copias adicionales.

| Archivo | Finalidad |
| --- | --- |
| `AGENTS.md` | Entrada de instrucciones y mantenimiento de contexto/memoria |
| `contexto/README.md` | Índice y reglas de actualización del contexto |
| `contexto/estado-proyecto.md` | Estado por nivel de implementación/verificación |
| `contexto/arquitectura.md` | Componentes, comunicación, autenticación y límites |
| `contexto/reglas-negocio.md` | Relaciones comprobadas y decisiones del dominio |
| `contexto/roles-permisos.md` | Cuatro roles, actores, alcance y cuenta opcional |
| `contexto/seguridad-ia.md` | Visión futura separada de reconocimiento existente |
| `contexto/decisiones-tecnicas.md` | Decisiones, estados, consecuencias y fechas disponibles |
| `contexto/integraciones-externas.md` | Servicios, variables por nombre y estado de verificación |
| `memoria/README.md` | Cómo retomar y registrar trabajo sin duplicar informes |
| `memoria/estado-actual.md` | Punto de reanudación y alcance autorizado |
| `memoria/historial-trabajo.md` | Cronología resumida con fuentes |
| `memoria/cambios-realizados.md` | Cambios, motivo y evidencia |
| `memoria/pendientes.md` | Prioridades, dependencias y bloqueos |
| `memoria/pruebas.md` | Verificación actual frente a resultados históricos |
| `.agents/skills/auditoria-django/SKILL.md` | Auditoría del backend existente sin alterar un alcance de lectura |
| `.agents/skills/seguridad-condominio/SKILL.md` | Roles, privacidad, notificaciones y trazabilidad |
| `.agents/skills/vision-artificial/SKILL.md` | Trabajo autorizado con video local, RF-DETR y eventos |
| `documentacion/README.md` | Índice central y catálogo de informes conservados |
| `documentacion/auditorias/ORGANIZACION_DOCUMENTAL_2026-10-31.md` | Este informe de auditoría, movimientos y verificación |

## Documentos movidos

| Origen, relativo a raíz | Destino, relativo a raíz |
| --- | --- |
| `documentacion/Enunciado Proyecto condominio.docx` | `documentacion/requisitos/Enunciado Proyecto condominio.docx` |
| `documentacion/Auditoria_tecnica_seguridad_IA_condominio.docx` | `documentacion/auditorias/Auditoria_tecnica_seguridad_IA_condominio.docx` |
| `documentacion/GUIA_ROLES_SEGURIDAD_NOTIFICACIONES.md` | `documentacion/seguridad/GUIA_ROLES_SEGURIDAD_NOTIFICACIONES.md` |
| `documentacion/PROPUESTA_ALTA_SEGURA_CUENTAS.md` | `documentacion/seguridad/PROPUESTA_ALTA_SEGURA_CUENTAS.md` |

Se comprobaron rutas absolutas dentro del proyecto y destinos libres antes de mover mediante PowerShell. Git puede reconocer estos movimientos al revisar/agregar ambos extremos; no se preparó el índice ni se hizo commit automáticamente. No se alteró el contenido interno de los originales.

## Contexto, skills e instrucciones

Se documentaron tecnologías y módulos comprobados, relaciones entre residentes/vehículos/unidades, permisos, provisión de cuentas, revisión de eventos, separación de bandeja/push y limitaciones actuales. Se conserva la decisión reciente de cuenta opcional para empleados de cualquier cargo con uno de los cuatro roles y requisitos de perfil. La guía histórica no se trata como fuente única del estado actual.

Las habilidades son instrucciones reutilizables, no tareas automáticas. Auditoría Django se usa para examinar modelos, rutas y permisos; seguridad-condominio para cambios de acceso y notificaciones; vision-artificial para diseñar/evaluar video en una etapa autorizada, verificando compatibilidad/licencias antes de instalar. No se garantiza la carga automática de archivos locales: `AGENTS.md` indica dónde consultarlos.

`AGENTS.md` exige leer estado y pendientes al iniciar, contrastar contexto con código, preservar trabajo, respetar etapas, proteger secretos y mantener compatibilidad. Al terminar, exige registrar hechos, pruebas y pendientes sin declarar como hecho un plan. Crear memoria no garantiza recuerdo automático ni respaldo remoto.

## Revisión de Git y protección propuesta

La raíz tiene `.gitignore` vacío. El backend ignora `.env`, `env/`, pycache, `db.sqlite3` y `*.json`; la web ignora dependencias, dist y `.env`; Flutter tiene reglas de cachés/build. La regla amplia `*.json` del backend puede ocultar futuros archivos legítimos: proponer patrones de credenciales específicos en una etapa posterior, sin retirarla ahora.

Propuestas no aplicadas: cubrir `.env.*` salvo plantillas explícitamente revisadas, otros nombres de entornos virtuales, claves/cuentas de servicio, bases y respaldos locales, cachés, pesos grandes y videos de prueba en ubicaciones definidas. No usar exclusiones globales de JSON/documentación ni de todos los archivos de video sin revisar necesidades. Revisar con `git check-ignore` cada caso antes de aplicar cambios.

La búsqueda por nombres entre archivos rastreados encontró una plantilla `.env.example`, pero no credenciales privadas con los patrones consultados. No se abrió esa plantilla en esta etapa ni se analizó todo el historial/contenido: esto **no certifica ausencia de secretos**. Si se confirma uno versionado, requerirá rotación y limpieza autorizadas; no se ejecutó ninguna.

## Pendientes y conservación

No quedó un documento nuevo sin clasificar dentro de `documentacion/`. Los informes internos se conservaron deliberadamente, con su índice central, para no alterar componentes ni referencias existentes. Algunas fechas exactas de decisiones anteriores, credenciales operativas, hardware objetivo y estado de despliegue/base real permanecen sin verificar; están señalados en contexto/memoria.

Quedan pendientes aprobación de nueva etapa funcional y revisión/commit de estos cambios documentales. No se ejecutaron migraciones, instalaciones, pruebas con servicios externos, Firebase o dispositivos. No se modificó código funcional, modelos, API, permisos, datos ni infraestructura.

## Verificación final

- **Integridad:** SHA-256 coincide para los cuatro documentos trasladados y los once archivos de `base-datos/`, comparados con un manifiesto previo en el directorio temporal. La subcarpeta vacía `qa_word/` sigue presente. No se editaron ni regeneraron los Word.
- **Estructura:** veinte archivos nuevos solicitados/de informe, cuatro traslados, sin carpeta `proyectos/`. El índice enlaza los 46 Markdown rastreados de los componentes.
- **Enlaces:** 137 enlaces locales de los veinte documentos nuevos comprobados con resolución de rutas y espacios codificados; ninguno roto.
- **Skills:** `quick_validate.py` devolvió `Skill is valid!` para las tres. No se instalaron paquetes; esta comprobación valida estructura, no ejecución automática ni eficacia en todas las tareas futuras.
- **Preservación:** `git diff --exit-code -- Condominio-Backend Condominio-Frontend condominio-movil documentacion/base-datos .gitignore` terminó sin diferencias. Tampoco hay archivos nuevos no rastreados en esos componentes. No se alteraron configuraciones ni datos durante esta etapa.
- **Formato Git:** `git diff --check` terminó correctamente. Los originales movidos conservan bytes; los veinte documentos nuevos se leyeron como UTF-8 y se validaron sus enlaces.
- **Límites:** no se repitieron pruebas funcionales: este cambio solo organiza documentación. Las pruebas históricas se citan con su fuente, sin presentarlas como ejecución actual. La primera comprobación de cantidad de elementos de base-datos incluyó la subcarpeta vacía como si fuera archivo; se corrigió el verificador para comparar conjuntos de archivos y sus hashes, sin modificar esa carpeta.

Resultado de `git -c core.quotepath=false status --short` tras la organización:

```text
 D documentacion/Auditoria_tecnica_seguridad_IA_condominio.docx
 D "documentacion/Enunciado Proyecto condominio.docx"
 D documentacion/GUIA_ROLES_SEGURIDAD_NOTIFICACIONES.md
 D documentacion/PROPUESTA_ALTA_SEGURA_CUENTAS.md
?? .agents/
?? AGENTS.md
?? contexto/
?? documentacion/README.md
?? documentacion/auditorias/
?? documentacion/requisitos/
?? documentacion/seguridad/
?? memoria/
```

Las cuatro marcas `D` corresponden a las ubicaciones antiguas; sus documentos completos están en los nuevos destinos mostrados como no rastreados. No representan pérdida de contenido. Git agrupa los nuevos directorios en esta salida; la lista individual de los veinte archivos está arriba. No se hizo `git add`, commit, push ni modificación del historial.

ORGANIZACIÓN DOCUMENTAL COMPLETADA. NO SE MODIFICÓ EL CÓDIGO FUNCIONAL. ESPERANDO APROBACIÓN DEL USUARIO.
