# Prueba inicial de RF-DETR Nano — 2026-11-01

El usuario no dispone todavía de cámara ni video. Se usó un [video público de
Pexels](https://www.pexels.com/video/a-parking-lot-with-cars-parked-in-it-27668854/),
autor Matheus Bertelli; consultar [licencia](https://www.pexels.com/license/).
Es un clip vertical de tres segundos de un estacionamiento, no una cámara del
condominio ni una demostración de conducta indebida.

Se instaló un entorno virtual independiente, actualmente ubicado en
`Condominio-Backend/seguridad_vision/.venv`, con
Python 3.13, PyTorch 2.9.1+cpu, torchvision 0.24.1+cpu, rfdetr 1.11.2 y
opencv-python-headless 5.0.0.93. `pip check` no encontró conflictos. El
modelo RF-DETR Nano y su licencia Apache 2.0 figuran en la [ficha oficial de
RF-DETR](https://pypi.org/project/rfdetr/1.11.2/). Los pesos se descargaron desde
la fuente oficial que utiliza el paquete y este verificó su MD5. Video, pesos y
entorno están ignorados por Git y permanecen locales.

Equipo: Intel i7-1165G7, 15,7 GiB de RAM, gráfica Intel integrada; prueba en
CPU con dos hilos. Se analizaron tres fotogramas, redimensionados a un lado
máximo de 960 píxeles y con umbral 0,5. Resultado de la ejecución final:

| Segundo del video | Tiempo de inferencia | Detecciones |
|---|---:|---|
| 0 | 0,40 s | 6 automóviles, 4 personas |
| 1 | 0,23 s | 6 automóviles, 4 personas |
| 2 | 0,23 s | 6 automóviles, 4 personas |

Son predicciones, no identidades verificadas ni evaluación de exactitud. El
primer resultado se descartó porque el script interpretaba mal los índices
COCO; se corrigió para usar `data["class_name"]` provisto por el modelo y se
repitió. La segunda ejecución reutilizó los pesos con las variables de modo
offline de Hugging Face activadas; no se desconectó la red, por lo que esto no
demuestra autonomía completa sin internet. No se midieron consumo ni FPS de
video continuo, y tres fotogramas no permiten asegurar rendimiento en tiempo
real o varias cámaras. No se evaluaron perros, gatos ni precisión de detección.

No se enviaron fotogramas a servicios de visión en nube ni se integró Django.
No se creó evento, incidencia ni alerta; no se accedió al teléfono o cámara.
La siguiente etapa requiere diseñar y probar procesamiento de video con zonas,
tiempos y revisión humana antes de conectar una futura ingesta autenticada
y la infraestructura de notificaciones. Una detección por sí sola
no demuestra una infracción.

## Reorganización posterior

El 2026-11-01 se trasladó la carpeta de prueba a
`Condominio-Backend/seguridad_vision` para agrupar el procesamiento con el
backend. El proceso continúa separado de Django y todavía no está integrado.
Se actualizó el entorno virtual en su nueva ruta, `pip check` no detectó
conflictos y la prueba volvió a detectar 6 automóviles y 4 personas en cada
uno de los tres fotogramas. No se modificó la base de datos ni se enviaron
notificaciones. El primer intento de ejecución tuvo un error de escritura en
la ruta; el segundo utilizó la ruta correcta y terminó con éxito.
