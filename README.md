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

Con el backend y frontend iniciados, ejecuta desde la **raíz del proyecto**:

```powershell
# Puente para la cámara Imou
.\Condominio-Backend\seguridad_vision\.venv\Scripts\python.exe .\Condominio-Backend\seguridad_vision\imou_local.py
```

```powershell
# IA local, en otra terminal
.\Condominio-Backend\seguridad_vision\.venv\Scripts\python.exe .\Condominio-Backend\seguridad_vision\camara_local.py
```

Para otras cámaras de red registradas, inicia también este puente en otra terminal:

```powershell
.\Condominio-Backend\seguridad_vision\.venv\Scripts\python.exe .\Condominio-Backend\seguridad_vision\camaras_catalogo.py
```

Entra como administrador a **Cámaras → Gestión de cámaras** para configurarlas y a **Cámaras → Monitor en vivo** para verlas. La cámara debe ser accesible desde la PC por Wi‑Fi o Ethernet. La lectura de placas usa Plate Recognizer y requiere internet y un token configurado. Los servicios se inician manualmente; `Ctrl+C` los detiene.

La lectura automática, las alertas para cámaras adicionales y la notificación móvil al residente aún requieren pruebas e integración completas. Más información en [documentación](documentacion/README.md) y [pendientes](memoria/pendientes.md).
