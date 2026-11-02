"""Selecciona credenciales del servidor sin incluirlas en el código fuente."""
import json
from pathlib import Path


def seleccionar_credencial(config, credentials, base_dir):
    """Conserva la prioridad histórica del JSON, con opción de archivo privado."""
    raw = config('FIREBASE_CREDENTIALS_JSON', default=None)
    if raw:
        return credentials.Certificate(json.loads(raw))
    filename = config('FIREBASE_CREDENTIALS_PATH', default=None)
    if filename:
        path = Path(filename).expanduser()
        if not path.is_absolute():
            path = Path(base_dir) / path
        return credentials.Certificate(str(path))
    # Compatibilidad con instalaciones existentes que aún no han migrado.
    return credentials.Certificate('smart-condominiun-firebase-adminsdk-fbsvc-30dd8b557d.json')
