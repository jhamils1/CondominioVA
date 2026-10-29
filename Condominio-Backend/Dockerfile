# Usa la imagen base de Python (3.10 es una buena elección)
FROM python:3.10-slim

# Instala las dependencias del sistema y las herramientas de compilación
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    # 🚨 NUEVO: Herramientas de compilación y headers de Python
    build-essential \
    python3-dev \
    # Dependencias existentes para pycairo/xhtml2pdf
    pkg-config \
    libcairo2-dev \
    && \
    # Limpia la caché para reducir el tamaño final de la imagen
    rm -rf /var/lib/apt/lists/*

# Configura el directorio de trabajo
WORKDIR /usr/src/app

# Copia los requisitos e instálalos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código del proyecto
COPY . .

# Comando de inicio (Asegúrate que 'condominioBACK' es correcto)
CMD ["gunicorn", "condominioBACK.wsgi:application"]