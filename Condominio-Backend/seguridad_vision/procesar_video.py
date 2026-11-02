"""Genera una copia de video con detecciones locales; no crea eventos Django."""

import argparse
import os
from datetime import datetime
from pathlib import Path
from time import perf_counter

BASE = Path(__file__).resolve().parent
RECURSOS = BASE / "recursos"
SALIDAS = BASE / "salidas"
os.environ.setdefault("HF_HOME", str(RECURSOS / "cache_huggingface"))
os.environ.setdefault("RF_HOME", str(RECURSOS / "cache_roboflow"))
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")
os.environ.setdefault("DO_NOT_TRACK", "1")

import cv2
import torch
from PIL import Image
from rfdetr import RFDETRNano

ETIQUETAS = {
    "person": "persona",
    "car": "automovil",
    "motorcycle": "motocicleta",
    "bus": "autobus",
    "truck": "camion",
    "dog": "perro",
    "cat": "gato",
}


def procesar(entrada: Path, salida: Path, umbral: float) -> None:
    entrada, salida = entrada.resolve(), salida.resolve()
    if not entrada.is_file():
        raise ValueError("No se encontró el video de entrada.")
    if entrada == salida or salida.exists():
        raise ValueError("La salida ya existe o coincide con el video de entrada.")
    if salida.suffix.lower() not in (".webm", ".mp4"):
        raise ValueError("La salida debe tener extensión .webm o .mp4.")
    salida.parent.mkdir(parents=True, exist_ok=True)
    captura = cv2.VideoCapture(str(entrada))
    if not captura.isOpened():
        captura.release()
        raise ValueError("No se pudo abrir el video.")
    grabador = None
    total = 0
    inicio = perf_counter()
    try:
        fps = captura.get(cv2.CAP_PROP_FPS)
        ancho = int(captura.get(cv2.CAP_PROP_FRAME_WIDTH))
        alto = int(captura.get(cv2.CAP_PROP_FRAME_HEIGHT))
        esperados = int(captura.get(cv2.CAP_PROP_FRAME_COUNT))
        if fps <= 0 or ancho <= 0 or alto <= 0:
            raise ValueError("El video no contiene dimensiones o velocidad válidas.")
        escala = min(1, 960 / max(ancho, alto))
        # Los códecs de video suelen necesitar dimensiones pares.
        tamano = (max(2, int(ancho * escala) // 2 * 2),
                  max(2, int(alto * escala) // 2 * 2))
        codec = "VP80" if salida.suffix.lower() == ".webm" else "mp4v"
        grabador = cv2.VideoWriter(str(salida), cv2.VideoWriter_fourcc(*codec), fps, tamano)
        if not grabador.isOpened():
            raise RuntimeError("No se pudo crear el video de salida.")
        torch.set_num_threads(2)
        print("Cargando modelo en CPU...", flush=True)
        modelo = RFDETRNano(device="cpu")
        print(f"Procesando video: {esperados or '?'} fotogramas.", flush=True)
        while True:
            ok, fotograma = captura.read()
            if not ok:
                break
            fotograma = cv2.resize(fotograma, tamano)
            imagen = Image.fromarray(cv2.cvtColor(fotograma, cv2.COLOR_BGR2RGB))
            detecciones = modelo.predict(imagen, threshold=umbral)
            for caja, confianza, nombre in zip(
                detecciones.xyxy, detecciones.confidence, detecciones.data["class_name"]
            ):
                x1, y1, x2, y2 = (int(valor) for valor in caja)
                cv2.rectangle(fotograma, (x1, y1), (x2, y2), (0, 230, 0), 2)
                etiqueta = f"{ETIQUETAS.get(str(nombre), str(nombre))} {confianza:.0%}"
                (texto_ancho, texto_alto), base = cv2.getTextSize(
                    etiqueta, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1
                )
                tx = max(0, min(x1, tamano[0] - texto_ancho - 4))
                ty = max(texto_alto + 4, min(y1 + texto_alto + 4, tamano[1] - base))
                cv2.rectangle(fotograma, (tx, ty - texto_alto - 3),
                              (min(tamano[0] - 1, tx + texto_ancho + 4), ty + base),
                              (0, 0, 0), -1)
                cv2.putText(fotograma, etiqueta, (tx + 2, ty - 1),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)
            grabador.write(fotograma)
            total += 1
            if total % 15 == 0:
                print(f"Procesados: {total}/{esperados or '?'}", flush=True)
        if total == 0:
            raise RuntimeError("No se pudo leer ningún fotograma.")
        if esperados > 0 and total < esperados:
            raise RuntimeError(f"Video incompleto: se leyeron {total} de {esperados} fotogramas.")
    except Exception:
        print(f"Proceso interrumpido; la salida puede estar incompleta: {salida}", flush=True)
        raise
    finally:
        captura.release()
        if grabador is not None:
            grabador.release()
    print(f"Terminado: {total} fotogramas en {perf_counter() - inicio:.1f} s.", flush=True)
    print(f"Video generado: {salida}", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--entrada", type=Path, required=True, help="Ruta del video local que se va a analizar.")
    parser.add_argument("--salida", type=Path)
    parser.add_argument("--umbral", type=float, default=0.5)
    args = parser.parse_args()
    if not 0 < args.umbral <= 1:
        parser.error("El umbral debe ser mayor que 0 y menor o igual a 1.")
    salida = args.salida or SALIDAS / f"demostracion_{datetime.now():%Y%m%d_%H%M%S_%f}.webm"
    try:
        procesar(args.entrada, salida, args.umbral)
    except (ValueError, RuntimeError) as error:
        parser.exit(1, f"Error: {error}\n")


if __name__ == "__main__":
    main()
