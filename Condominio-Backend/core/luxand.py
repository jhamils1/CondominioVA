# core/luxand.py
import requests
from django.conf import settings

BASE = "https://api.luxand.cloud"
TOKEN = settings.LUXAND_TOKEN
COLLECTION = getattr(settings, "LUXAND_COLLECTION", "")  # opcional

HEADERS = {"token": TOKEN}

def _filefield_for(path_or_url, field_name: str):
    # Luxand acepta pasar una URL directamente como valor del campo 'photo'/'photos'
    if isinstance(path_or_url, str):
        if path_or_url.startswith("http://") or path_or_url.startswith("https://"):
            return {field_name: path_or_url}
        # o un archivo local
        return {field_name: open(path_or_url, "rb")}
    else:
        # Es un objeto de archivo de Django (InMemoryUploadedFile, TemporaryUploadedFile, etc.)
        return {field_name: path_or_url}

def create_collection(name: str):
    # opcional: crear colección
    url = f"{BASE}/collection"
    return requests.post(url, headers=HEADERS, files={"name": (None, name)}, timeout=20).json()

def add_person(name: str, image_path_or_url: str, collections: str = ""):
    """
    Enrola una persona en Luxand (devuelve UUID).
    """
    url = f"{BASE}/v2/person"
    files = _filefield_for(image_path_or_url, "photos")
    data = {"name": name, "store": "1"}
    if collections:
        data["collections"] = collections
    r = requests.post(url, headers=HEADERS, files=files, data=data, timeout=30)
    if r.status_code != 200:
        raise ValueError(f"Luxand add_person error: {r.text}")
    return r.json()  # incluye 'uuid'

def add_face(person_uuid: str, image_path_or_url: str):
    """
    Agrega fotos adicionales a una persona (mejora la precisión).
    Según la documentación oficial, usa 'photo' (singular) no 'photos'.
    """
    url = f"{BASE}/v2/person/{person_uuid}"
    files = _filefield_for(image_path_or_url, "photo")  # 'photo' según documentación
    data = {"store": "1"}
    r = requests.post(url, headers=HEADERS, files=files, data=data, timeout=30)
    if r.status_code != 200:
        raise ValueError(f"Luxand add_face error: {r.text}")
    return r.json()

def recognize(image_path_or_url: str, gallery: str = ""):
    """
    Reconoce personas en una imagen usando el endpoint correcto de Luxand.
    Usa /photo/search/v2 según la documentación oficial.
    """
    url = f"{BASE}/photo/search/v2"
    files = _filefield_for(image_path_or_url, "photo")
    data = {}
    if gallery:
        data["gallery"] = gallery
    
    print(f"🔍 LUXAND RECOGNIZE DEBUG:")
    print(f"   URL: {url}")
    print(f"   Gallery: {gallery}")
    print(f"   Headers: {HEADERS}")
    print(f"   Data: {data}")
    
    try:
        r = requests.post(url, headers=HEADERS, files=files, data=data, timeout=30)
        print(f"   Status Code: {r.status_code}")
        print(f"   Response: {r.text[:500]}...")
        
        if r.status_code == 503:
            raise ValueError(f"Luxand service unavailable (503). This may be due to rate limiting or service issues. Response: {r.text}")
        elif r.status_code == 429:
            raise ValueError(f"Luxand rate limit exceeded (429). Please wait before trying again. Response: {r.text}")
        elif r.status_code != 200:
            raise ValueError(f"Luxand recognize error ({r.status_code}): {r.text}")
        
        return r.json()
    except requests.exceptions.Timeout:
        raise ValueError("Luxand API timeout. The service may be slow or unavailable.")
    except requests.exceptions.ConnectionError:
        raise ValueError("Cannot connect to Luxand API. Check your internet connection.")
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Network error connecting to Luxand: {e}")
