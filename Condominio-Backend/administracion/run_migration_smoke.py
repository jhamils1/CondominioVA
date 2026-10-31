"""Apply migrations only to an isolated, disposable SQLite in-memory database."""
import os
import sys
import unittest
from contextlib import redirect_stdout
from io import StringIO
from unittest.mock import patch

os.environ['DJANGO_SETTINGS_MODULE'] = 'condominioBACK.settings'
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['SECRET_KEY'] = 'prueba-aislada-de-migraciones'
os.environ['PLATE_TOKEN'] = ''
os.environ['LUXAND_TOKEN'] = ''
os.environ['STRIPE_SECRET_KEY'] = ''
os.environ['STRIPE_PUBLISHABLE_KEY'] = ''
os.environ['FIREBASE_CREDENTIALS_JSON'] = '{}'

import django
with patch('firebase_admin.credentials.Certificate'), patch('firebase_admin.initialize_app'), redirect_stdout(StringIO()):
    django.setup()

from django.conf import settings
from django.core.management import call_command
from django.db import connection
from django.db.migrations.recorder import MigrationRecorder

if connection.settings_dict['ENGINE'] != 'django.db.backends.sqlite3' or connection.settings_dict['NAME'] != ':memory:':
    raise RuntimeError('La prueba requiere una base SQLite aislada en memoria.')

settings.PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
call_command('migrate', interactive=False, verbosity=0)
applied = MigrationRecorder(connection).applied_migrations()
targets = {('seguridad_IA', '0002_eventoseguridad_historialeventoseguridad_and_more'),
           ('seguridad_IA', '0003_entregafcmseguridad')}
if not targets.issubset(applied):
    raise RuntimeError('Faltan migraciones de seguridad en la base de prueba.')
expected_tables = {'seguridad_IA_eventoseguridad', 'seguridad_IA_historialeventoseguridad',
                   'seguridad_IA_notificacionseguridad', 'seguridad_IA_entregafcmseguridad'}
if not expected_tables.issubset(connection.introspection.table_names()):
    raise RuntimeError('Faltan tablas esperadas en la base de prueba.')
from django.apps import apps
missing = {model._meta.db_table for model in apps.get_models()
           if model._meta.managed and not model._meta.proxy and not model._meta.swapped} - set(connection.introspection.table_names())
if missing:
    raise RuntimeError('Faltan migraciones para modelos actuales en la base de prueba: ' + ', '.join(sorted(missing)))
print('Migración y tablas verificadas en SQLite en memoria.', flush=True)
suite = unittest.defaultTestLoader.loadTestsFromName('administracion.tests_access')
result = unittest.TextTestRunner(verbosity=2).run(suite)
sys.exit(0 if result.wasSuccessful() else 1)
