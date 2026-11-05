"""Comprueba un fotograma RTSP local sin guardarlo ni ejecutar inferencia."""
import configparser
import ipaddress
import os
from pathlib import Path
import subprocess
import sys
from urllib.parse import quote

CONFIG = Path(__file__).resolve().parent / "recursos" / "imou.local.ini"


def leer_configuracion():
    config = configparser.ConfigParser(interpolation=None)
    if not config.read(CONFIG, encoding="utf-8-sig"):
        raise ValueError("Falta recursos/imou.local.ini.")
    try:
        camara = config["camara"]
        direccion = ipaddress.IPv4Address(camara["ip"].strip())
        redes = ("10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16")
        if not any(direccion in ipaddress.IPv4Network(red) for red in redes):
            raise ValueError
        usuario = camara["usuario"].strip()
        clave = camara["clave"]
        puerto = camara.getint("puerto", 554)
        flujo = camara.getint("flujo", 1)
        if not usuario or not clave:
            raise ValueError("Completa usuario y clave de la cámara en imou.local.ini.")
        if not 1 <= puerto <= 65535 or flujo not in (0, 1):
            raise ValueError
    except (KeyError, configparser.Error, ValueError) as error:
        if str(error).startswith("Completa usuario"):
            raise
        raise ValueError("Revisa IP local, puerto, usuario y flujo (0 o 1).") from None
    return (
        f"rtsp://{quote(usuario, safe='')}:{quote(clave, safe='')}"
        f"@{direccion}:{puerto}/cam/realmonitor?channel=1&subtype={flujo}"
    )


def comprobar():
    # FFmpeg puede incluir la URL en sus errores. El proceso padre descarta
    # stderr a nivel del SO; nunca imprime excepciones que contengan la URL.
    os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"
    os.environ["OPENCV_LOG_LEVEL"] = "SILENT"
    import cv2

    captura = None
    try:
        captura = cv2.VideoCapture(
            leer_configuracion(), cv2.CAP_FFMPEG,
            [cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, 5000,
             cv2.CAP_PROP_READ_TIMEOUT_MSEC, 5000],
        )
        if not captura.isOpened():
            print("No se abrió el video. Revisa IP, credenciales y flujo configurado.")
            return 1
        valido, imagen = captura.read()
        if not valido or imagen is None:
            print("Se abrió la conexión, pero no se pudo decodificar una imagen.")
            return 1
        alto, ancho = imagen.shape[:2]
        print(f"Video accesible: imagen decodificada de {ancho} x {alto} píxeles.")
        print("Conexión cerrada. No se guardaron imágenes ni se enviaron avisos.")
        return 0
    except Exception:
        print("No se pudo completar la lectura. No se muestran datos de acceso.")
        return 1
    finally:
        if captura is not None:
            captura.release()


def main():
    # Validación antes de cargar OpenCV o contactar al dispositivo.
    try:
        leer_configuracion()
    except Exception as error:
        mensaje = str(error) if type(error) is ValueError else "Configuración inválida."
        print(mensaje)
        return 2
    if sys.argv[1:] == ["--lectura-interna"]:
        return comprobar()
    try:
        resultado = subprocess.run(
            [sys.executable, str(Path(__file__).resolve()), "--lectura-interna"],
            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
            timeout=20, text=True, encoding="utf-8", errors="replace",
            env={**os.environ, "PYTHONIOENCODING": "utf-8"},
        )
        print(resultado.stdout, end="")
        if resultado.returncode and not resultado.stdout:
            print("No se pudo iniciar el lector de video.")
        return resultado.returncode
    except subprocess.TimeoutExpired:
        print("La comprobación superó 20 segundos y se detuvo.")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
