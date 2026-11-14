"""Servicio local de inferencia para la demostración de cámara; no graba imágenes."""
import hmac
import json
import os
import secrets
import socket
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

BASE = Path(__file__).resolve().parent
RECURSOS = BASE / "recursos"
os.environ["RF_HOME"] = str(RECURSOS / "cache_roboflow")
os.environ["HF_HOME"] = str(RECURSOS / "cache_huggingface")
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
os.environ["DO_NOT_TRACK"] = "1"

import cv2
import numpy as np
import torch
from PIL import Image
from rfdetr import RFDETRNano

PUERTO = 28765
MAX_BYTES = 1024 * 1024
CLAVE = secrets.token_urlsafe(32)
ARCHIVO_CLAVE = RECURSOS / "camara_local.token"


class ServidorLocal(HTTPServer):
    request_queue_size = 1
    allow_reuse_address = False

    def server_bind(self):
        if hasattr(socket, "SO_EXCLUSIVEADDRUSE"):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


class Procesador(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # No registrar imágenes, cabeceras ni tokens.

    def responder(self, estado, datos):
        cuerpo = json.dumps(datos, ensure_ascii=True).encode("utf-8")
        self.send_response(estado)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(cuerpo)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(cuerpo)

    def autorizado(self):
        valor = self.headers.get("Authorization", "")
        return hmac.compare_digest(valor, "Bearer " + CLAVE)

    def do_GET(self):
        if not self.autorizado():
            return self.responder(403, {"error": "No autorizado"})
        if self.path != "/estado":
            return self.responder(404, {"error": "No disponible"})
        self.responder(200, {"disponible": True})

    def do_POST(self):
        if not self.autorizado():
            return self.responder(403, {"error": "No autorizado"})
        if self.path != "/detectar":
            return self.responder(404, {"error": "No disponible"})
        try:
            longitud = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            longitud = 0
        if not 0 < longitud <= MAX_BYTES:
            return self.responder(400, {"error": "Imagen inválida"})
        self.connection.settimeout(5)
        try:
            datos = self.rfile.read(longitud)
            imagen = cv2.imdecode(np.frombuffer(datos, dtype=np.uint8), cv2.IMREAD_COLOR)
            if imagen is None or max(imagen.shape[:2]) > 1280:
                return self.responder(400, {"error": "Imagen inválida"})
            rgb = Image.fromarray(cv2.cvtColor(imagen, cv2.COLOR_BGR2RGB))
            resultado = self.server.modelo.predict(rgb, threshold=0.5)
            detecciones = [
                {"caja": [round(float(x), 2) for x in caja],
                 "clase": str(clase), "confianza": round(float(confianza), 3)}
                for caja, clase, confianza in zip(
                    resultado.xyxy, resultado.data["class_name"], resultado.confidence
                )
            ]
            self.responder(200, {"detecciones": detecciones})
        except Exception:
            self.responder(500, {"error": "No se pudo analizar la imagen"})


def main():
    RECURSOS.mkdir(exist_ok=True)
    if not (RECURSOS / "cache_roboflow" / "rf-detr-nano.pth").is_file():
        raise SystemExit("Faltan los pesos locales de RF-DETR Nano.")
    servidor = ServidorLocal(("127.0.0.1", PUERTO), Procesador)
    try:
        torch.set_num_threads(2)
        print("Cargando el modelo local...", flush=True)
        servidor.modelo = RFDETRNano(device="cpu")
        with ARCHIVO_CLAVE.open("w", encoding="ascii") as archivo:
            archivo.write(CLAVE)
        print("Servicio local de cámara listo. Cierra esta ventana para detenerlo.", flush=True)
        servidor.serve_forever()
    finally:
        servidor.server_close()
        if ARCHIVO_CLAVE.is_file() and ARCHIVO_CLAVE.read_text(encoding="ascii") == CLAVE:
            ARCHIVO_CLAVE.unlink()


if __name__ == "__main__":
    main()
