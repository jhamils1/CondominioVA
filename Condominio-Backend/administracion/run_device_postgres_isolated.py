"""Run device race tests against a fresh, temporary local PostgreSQL cluster.

Never reads the project's database settings or connects to an existing server.
"""
import os
import secrets
import socket
import subprocess
import tempfile
import threading
import time
import unittest
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path
from unittest.mock import patch


def main():
    binary_dir = Path(r'C:\Program Files\PostgreSQL\17\bin')
    initdb = binary_dir / 'initdb.exe'
    postgres = binary_dir / 'postgres.exe'
    pg_ctl = binary_dir / 'pg_ctl.exe'
    if not all(path.is_file() for path in (initdb, postgres, pg_ctl)):
        raise RuntimeError('No se encontraron los binarios locales de PostgreSQL 17.')

    with tempfile.TemporaryDirectory(prefix='condominio-pg-aislado-') as temp:
        root = Path(temp)
        data = root / 'data'
        password = secrets.token_hex(24)
        password_file = root / 'password.txt'
        password_file.write_text(password, encoding='ascii')
        hidden = getattr(subprocess, 'CREATE_NO_WINDOW', 0)
        subprocess.run([str(initdb), '-D', str(data), '-U', 'prueba_aislada',
                        '--auth=scram-sha-256', '--pwfile', str(password_file),
                        '--encoding=UTF8', '--no-instructions'], check=True,
                       stdout=subprocess.DEVNULL, creationflags=hidden)
        password_file.unlink()
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0))
            port = sock.getsockname()[1]
        server = subprocess.Popen([str(postgres), '-D', str(data), '-h', '127.0.0.1', '-p', str(port)],
                                  stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                                  creationflags=hidden)
        try:
            import psycopg2
            deadline = time.monotonic() + 20
            while True:
                if server.poll() is not None:
                    raise RuntimeError('La instancia temporal de PostgreSQL no pudo arrancar.')
                try:
                    conn = psycopg2.connect(host='127.0.0.1', port=port, dbname='postgres',
                                            user='prueba_aislada', password=password, connect_timeout=1)
                    with conn.cursor() as cursor:
                        cursor.execute('SHOW data_directory')
                        if Path(cursor.fetchone()[0]).resolve() != data.resolve():
                            conn.close()
                            raise RuntimeError('El servidor no corresponde al directorio temporal.')
                    conn.close()
                    break
                except psycopg2.OperationalError:
                    if time.monotonic() > deadline:
                        raise RuntimeError('No se pudo conectar a la instancia temporal.')
                    time.sleep(.2)
            os.environ.update(DJANGO_SETTINGS_MODULE='condominioBACK.settings',
                DATABASE_URL=f'postgresql://prueba_aislada:{password}@127.0.0.1:{port}/postgres',
                SECRET_KEY='solo-pruebas-aisladas', PLATE_TOKEN='', LUXAND_TOKEN='',
                STRIPE_SECRET_KEY='', STRIPE_PUBLISHABLE_KEY='', FIREBASE_CREDENTIALS_JSON='{}')
            import django
            with patch('firebase_admin.credentials.Certificate'), patch('firebase_admin.initialize_app'), redirect_stdout(StringIO()):
                django.setup()
            from django.conf import settings
            from django.core.management import call_command
            from django.db import connection
            if connection.settings_dict['NAME'] != 'postgres' or str(connection.settings_dict['PORT']) != str(port):
                raise RuntimeError('La conexión no apunta a la instancia temporal.')
            settings.PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
            call_command('migrate', interactive=False, verbosity=0)
            from administracion.tests_device_postgres import DeviceRaceTests
            result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(DeviceRaceTests))
            connection.close()
            if not result.wasSuccessful():
                raise SystemExit(1)
        finally:
            if server.poll() is None:
                subprocess.run([str(pg_ctl), '-D', str(data), '-m', 'fast', '-w', 'stop'],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                               timeout=25, creationflags=hidden)
            try:
                server.wait(timeout=10)
            except subprocess.TimeoutExpired:
                server.terminate()
                server.wait(timeout=10)


if __name__ == '__main__':
    main()
