# Condominio

Sistema de gestión y seguridad con backend Django, frontend React y aplicación móvil Flutter.

## Requisitos

- Python, Node.js y PostgreSQL para desarrollo local.
- Un archivo privado `Condominio-Backend/.env`, basado en `.env.example`. Configura `SECRET_KEY` y `DATABASE_URL`; Django también requiere que estén definidas `PLATE_TOKEN`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` y `LUXAND_TOKEN`, aunque estén vacías cuando no se usen esas integraciones. No compartas el `.env`.
- Para cámaras e IA: entorno independiente en `Condominio-Backend/seguridad_vision/.venv` y recursos locales. No se incluyen en Git; consulta la [guía de visión](Condominio-Backend/seguridad_vision/README.md).

Los comandos siguientes son para **PowerShell en Windows**. Inicia cada componente en una terminal distinta.

## Backend

```powershell
cd Condominio-Backend
python -m venv env
.\env\Scripts\python.exe -m pip install -r requirements.txt
.\env\Scripts\python.exe manage.py migrate
.\env\Scripts\python.exe manage.py runserver
```

Ejecuta las migraciones solo sobre tu base local de desarrollo, después de configurarla. No uses estos comandos contra una base compartida sin coordinarlo.

## Frontend

```powershell
cd Condominio-Frontend
npm install
npm run dev
```

Abre la dirección que muestra Vite, normalmente `http://localhost:5173`. El frontend usa por defecto `http://127.0.0.1:8000/api/`.

## Cámaras e IA local

Al iniciar Django con `manage.py runserver`, los puentes locales de Imou y de cámaras de catálogo se inician automáticamente si está preparado el entorno de visión. Para utilizar la IA local, ejecuta por separado desde la **raíz del proyecto**:

```powershell
# IA local, en otra terminal
.\Condominio-Backend\seguridad_vision\.venv\Scripts\python.exe .\Condominio-Backend\seguridad_vision\camara_local.py
```

Entra como administrador a **Cámaras → Gestión de cámaras** para configurarlas y a **Cámaras → Monitor en vivo** para verlas. La cámara debe ser accesible desde la PC por Wi‑Fi o Ethernet. La lectura de placas usa Plate Recognizer y requiere internet y un token configurado. La supervisión de puentes se aplica al servidor local `runserver`; en producción necesitan una configuración de servicios propia. La IA local se inicia y detiene por separado.

La lectura automática, las alertas para cámaras adicionales y la notificación móvil al residente aún requieren pruebas e integración completas. Más información en [documentación](documentacion/README.md) y [pendientes](memoria/pendientes.md).

La web también permite seleccionar un procesador de IA por internet. Requiere un servidor propio configurado; no hay ningún servicio contratado o activado por defecto. Consulta [IA por internet](Condominio-Backend/seguridad_vision/IA_POR_INTERNET.md).
