"""Run access tests in an isolated in-memory database without migrations.

Usage from the backend directory: python -B -m administracion.run_access_tests
This script does not connect to DATABASE_URL or send provider requests.
"""
import os
import sys
import unittest
from contextlib import redirect_stdout
from io import StringIO
from unittest.mock import patch

os.environ['DJANGO_SETTINGS_MODULE'] = 'condominioBACK.settings'
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['SECRET_KEY'] = 'clave-exclusiva-para-pruebas-locales'
os.environ['PLATE_TOKEN'] = ''
os.environ['LUXAND_TOKEN'] = ''
os.environ['STRIPE_SECRET_KEY'] = ''
os.environ['STRIPE_PUBLISHABLE_KEY'] = ''
os.environ['FIREBASE_CREDENTIALS_JSON'] = '{}'

import django
with patch('firebase_admin.credentials.Certificate'), patch('firebase_admin.initialize_app'), redirect_stdout(StringIO()):
    django.setup()
from django.conf import settings
settings.PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
from django.apps import apps
from django.db import connection

if connection.settings_dict['ENGINE'] != 'django.db.backends.sqlite3' or connection.settings_dict['NAME'] != ':memory:':
    raise RuntimeError('Las pruebas requieren una base SQLite aislada en memoria.')

with connection.schema_editor() as schema:
    for model in apps.get_models():
        if model._meta.managed and not model._meta.proxy and not model._meta.swapped:
            schema.create_model(model)

suite = unittest.defaultTestLoader.loadTestsFromName('administracion.tests_access')
result = unittest.TextTestRunner(verbosity=2).run(suite)
sys.exit(0 if result.wasSuccessful() else 1)
