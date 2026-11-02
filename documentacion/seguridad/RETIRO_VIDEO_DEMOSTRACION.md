# Retiro del video público fijo — 2026-11-02

Con aprobación del usuario se retiraron de la pantalla la sección del video
público fijo y los componentes de frontend y backend usados exclusivamente
para servirlo. También se retiraron su prueba específica y el script inicial
que solo analizaba esa muestra. Se borraron únicamente el archivo público
original y sus dos copias procesadas identificadas en el informe histórico.
Los pesos del modelo, la base de datos, otros archivos y el procesador local
se conservaron.

Siguen disponibles la prueba de cámara y el análisis de un video elegido por
el usuario. El script general `procesar_video.py` ahora requiere indicar
`--entrada`, al no existir ya un archivo de muestra predeterminado.

Verificación: compilación del frontend correcta con el aviso de tamaño
preexistente; tres pruebas aisladas de la API de cámara correctas. En Edge
headless con sesión simulada se comprobó que aparecen la cámara y el análisis
de archivos, y que ya no aparece la sección del video fijo. No se probó una
sesión real después del cambio ni se generaron eventos o notificaciones.
Los informes anteriores se conservan como historial y sus rutas de la muestra
ya no apuntan a archivos existentes.
