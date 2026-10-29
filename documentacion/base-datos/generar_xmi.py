"""Exporta el estado de migraciones a UML/XMI sin abrir una base de datos.

Uso: python generar_xmi.py --deps RUTA_DEPENDENCIAS_OPCIONAL
Dependencias: Django 5.2.6, psycopg2, simplejwt 5.5.1, fcm-django 2.3.1.
No carga settings.py, credenciales, Firebase ni señales de la aplicación.
"""
import argparse
import html
import importlib
import inspect
import json
import sys
import uuid
from pathlib import Path
import xml.etree.ElementTree as ET

parser = argparse.ArgumentParser()
parser.add_argument('--deps', type=Path)
args = parser.parse_args()
if args.deps:
    sys.path.insert(0, str(args.deps))
OUT = Path(__file__).resolve().parent
BACKEND = OUT.parents[1] / 'Condominio-Backend'
sys.path.insert(0, str(BACKEND))

import django
from django.apps import AppConfig, apps
from django.conf import settings

class MigrationOnlyConfig(AppConfig):
    def import_models(self):
        self.models = self.apps.all_models[self.label]
        self.models_module = None

names = ['django.contrib.auth', 'django.contrib.contenttypes',
         'django.contrib.admin', 'django.contrib.sessions',
         'rest_framework_simplejwt.token_blacklist',
         'administracion', 'residencial', 'finanzas', 'seguridad_IA', 'fcm_django']
configs = []
for name in names:
    cls = MigrationOnlyConfig if name == 'fcm_django' else AppConfig
    config = cls(name, importlib.import_module(name))
    config.default_auto_field = ('django.db.models.BigAutoField' if name in
                                ['administracion', 'residencial', 'finanzas', 'seguridad_IA']
                                else 'django.db.models.AutoField')
    configs.append(config)
settings.configure(INSTALLED_APPS=configs, SECRET_KEY='offline-schema-export-only',
                   DATABASES={'default': {'ENGINE': 'django.db.backends.postgresql',
                                          'NAME': 'unused_no_connection'}},
                   DEFAULT_AUTO_FIELD='django.db.models.BigAutoField', USE_TZ=True)
django.setup()

from django.db import connection
from django.db.migrations.loader import MigrationLoader
from django.db.migrations.recorder import MigrationRecorder
from django.db.models import NOT_PROVIDED
loader = MigrationLoader(None, ignore_no_migrations=True)
state = loader.project_state()
models = list(state.apps.get_models(include_auto_created=True))
models.append(MigrationRecorder.Migration)
models.sort(key=lambda m: (m._meta.app_label, m._meta.db_table))
business = {'administracion', 'residencial', 'finanzas', 'seguridad_IA'}

def value(v):
    if callable(v):
        if hasattr(v, 'deconstruct'):
            return str(v.deconstruct())
        return f'{v.__module__}.{getattr(v, "__qualname__", type(v).__qualname__)}'
    return str(v)

def describe(m):
    o = m._meta
    fields = []
    for f in o.local_fields:
        data = {'name': f.name, 'column': f.column, 'type': f.db_type(connection),
                'django_type': f.get_internal_type(), 'null': f.null,
                'primary_key': f.primary_key, 'unique': f.unique,
                'index': bool(f.db_index), 'blank': f.blank,
                'default': None if f.default is NOT_PROVIDED else value(f.default),
                'auto_now_add': getattr(f, 'auto_now_add', False),
                'auto_now': getattr(f, 'auto_now', False),
                'choices': list(f.flatchoices) if f.choices else [],
                'check': f.db_parameters(connection).get('check'),
                'validators': [value(v) for v in getattr(f, '_validators', [])],
                'foreign_key': None}
        if f.is_relation:
            data['foreign_key'] = {
                'table': f.related_model._meta.db_table, 'column': f.target_field.column,
                'on_delete_orm': f.remote_field.on_delete.__name__,
                'parent_link': f.remote_field.parent_link,
                'limit_choices_to': str(f.remote_field.limit_choices_to),
                'one_to_one': f.one_to_one}
        fields.append(data)
    return {'app': o.app_label, 'model': o.object_name, 'table': o.db_table,
            'implicit_join_table': bool(o.auto_created), 'fields': fields,
            'unique_together': [[o.get_field(n).column for n in group] for group in o.unique_together],
            'indexes': [i.deconstruct() for i in o.indexes]}

tables = [describe(m) for m in models]
# Comparación contra los modelos actuales: detecta cambios no migrados en el negocio.
differences = []
for m in models:
    if m._meta.app_label in business:
        runtime = apps.get_model(m._meta.label)
        migrated = describe(m)
        current = describe(runtime)
        migrated['fields'].sort(key=lambda f: f['column'])
        current['fields'].sort(key=lambda f: f['column'])
        if migrated != current:
            differences.append(m._meta.label)
            for a, b in zip(migrated['fields'], current['fields']):
                if a != b:
                    print(m._meta.label, a['column'], {k: (a[k], b[k]) for k in a if a[k] != b[k]})
assert not differences, f'Modelos y migraciones difieren: {differences}'
assert len([t for t in tables if t['app'] in business]) == 19
assert connection.connection is None, 'No debe abrirse una conexión de base de datos'

XMI = 'http://schema.omg.org/spec/XMI/2.1'
UML = 'http://schema.omg.org/spec/UML/2.1'
ET.register_namespace('xmi', XMI)
ET.register_namespace('uml', UML)
def ident(key):
    return 'EAID_' + str(uuid.uuid5(uuid.NAMESPACE_URL, 'condominio-schema/' + key)).replace('-', '_').upper()

def element(parent, tag, key, kind=None, **attrs):
    attrs['{' + XMI + '}id'] = ident(key)
    if kind:
        attrs['{' + XMI + '}type'] = 'uml:' + kind
    return ET.SubElement(parent, tag, attrs)

def comment(parent, key, text):
    node = element(parent, 'ownedComment', key + '/comment', 'Comment')
    ET.SubElement(node, 'body').text = text

def multiplicity(parent, key, lower, upper):
    element(parent, 'lowerValue', key + '/lower', 'LiteralInteger', value=str(lower))
    element(parent, 'upperValue', key + '/upper', 'LiteralUnlimitedNatural', value=str(upper))

root = ET.Element('{' + XMI + '}XMI', {'{' + XMI + '}version': '2.1'})
ET.SubElement(root, '{' + XMI + '}Documentation', exporter='Condominio schema exporter', exporterVersion='1.0')
model = element(root, '{' + UML + '}Model', 'model', name='Base de datos del condominio', visibility='public')
main = element(model, 'packagedElement', 'root-package', 'Package', name='Condominio_BD', visibility='public')
comment(main, 'scope', 'Esquema definido en migraciones, 28-10-2026. Django 5.2.6. '
        'Tipos PostgreSQL según configuración de ejemplo; motor desplegado no consultado. '
        'Clases UML representan tablas; atributos representan columnas físicas. '
        'No incluye registros ni credenciales. on_delete describe el comportamiento del ORM, no SQL ON DELETE. '
        'No es un modelo DDL nativo de EA. Contiene asociaciones con cardinalidad y documentación de PK/FK/UNIQUE.')
packages = {}
labels = {'administracion': '01_Administracion', 'residencial': '02_Residencial',
          'finanzas': '03_Finanzas', 'seguridad_IA': '04_Seguridad_IA',
          'auth': '05_Usuarios_y_permisos', 'contenttypes': '06_Tipos_de_contenido',
          'admin': '07_Auditoria_Django', 'sessions': '08_Sesiones',
          'token_blacklist': '09_Tokens_JWT', 'fcm_django': '10_Notificaciones',
          'migrations': '11_Control_de_migraciones'}
for app in sorted({t['app'] for t in tables}, key=lambda a: labels[a]):
    packages[app] = element(main, 'packagedElement', 'package/' + app, 'Package', name=labels[app], visibility='public')
type_package = element(main, 'packagedElement', 'types', 'Package', name='12_Tipos_PostgreSQL')
for dtype in sorted({f['type'] for t in tables for f in t['fields']}):
    element(type_package, 'packagedElement', 'type/' + dtype, 'DataType', name=dtype, visibility='public')

relations = []
for t in tables:
    key = 'table/' + t['table']
    cls = element(packages[t['app']], 'packagedElement', key, 'Class', name=t['table'], visibility='public', isAbstract='false')
    note = f"Tabla {t['table']}; modelo {t['app']}.{t['model']}."
    if t['implicit_join_table']:
        note += ' Tabla intermedia generada por Django para una relación muchos a muchos.'
    for group in t['unique_together']:
        note += ' UNIQUE (' + ', '.join(group) + ').'
    if t['indexes']:
        note += ' Índices explícitos: ' + str(t['indexes'])
    comment(cls, key, note)
    for f in t['fields']:
        fk = key + '/' + f['column']
        attr = element(cls, 'ownedAttribute', fk, 'Property', name=f['column'], visibility='public', type=ident('type/' + f['type']), isUnique='true')
        multiplicity(attr, fk, 0 if f['null'] else 1, 1)
        flags = ['NULL' if f['null'] else 'NOT NULL']
        if f['primary_key']: flags.append('PK')
        if f['unique']: flags.append('UNIQUE SQL')
        if f['index']: flags.append('INDEX')
        if f['check']: flags.append('CHECK ' + f['check'])
        if f['default'] is not None: flags.append('Default ORM: ' + f['default'])
        if f['auto_now_add']: flags.append('Fecha automática de creación (ORM)')
        if f['auto_now']: flags.append('Fecha automática de actualización (ORM)')
        if f['choices']: flags.append('Choices (validación ORM): ' + str(f['choices']))
        if f['foreign_key']:
            ref = f['foreign_key']
            flags.append(f"FK -> {ref['table']}.{ref['column']}; on_delete ORM={ref['on_delete_orm']}")
            if ref['parent_link']: flags.append('Herencia multitabla: PK y FK compartida con Persona')
            flags.append('limit_choices_to ORM: ' + ref['limit_choices_to'])
            relations.append({'table': t['table'], 'app': t['app'], 'field': f})
        comment(attr, fk, '; '.join(flags))

for r in relations:
    f = r['field']
    ref = f['foreign_key']
    key = 'relation/' + r['table'] + '/' + f['column']
    assoc = element(packages[r['app']], 'packagedElement', key, 'Association',
                    name=f"{r['table']}.{f['column']} -> {ref['table']}",
                    memberEnd=ident(key + '/child') + ' ' + ident(key + '/parent'), visibility='public')
    child = element(assoc, 'ownedEnd', key + '/child', 'Property', name=r['table'],
                    type=ident('table/' + r['table']), association=ident(key), aggregation='none')
    multiplicity(child, key + '/child', 0, 1 if f['unique'] else '*')
    parent = element(assoc, 'ownedEnd', key + '/parent', 'Property', name=f['name'],
                     type=ident('table/' + ref['table']), association=ident(key), aggregation='none')
    multiplicity(parent, key + '/parent', 0 if f['null'] else 1, 1)
    comment(assoc, key, f"{r['table']}.{f['column']} referencia {ref['table']}.{ref['column']}. "
            f"on_delete ORM: {ref['on_delete_orm']}. "
            + ('Herencia multitabla, PK=FK.' if ref['parent_link'] else ''))

ET.indent(root, space='  ')
xmi_path = OUT / 'condominio_base_datos.xmi'
ET.ElementTree(root).write(xmi_path, encoding='utf-8', xml_declaration=True)
parsed = ET.parse(xmi_path)
ids = [n.get('{' + XMI + '}id') for n in parsed.iter() if n.get('{' + XMI + '}id')]
assert len(ids) == len(set(ids)), 'IDs duplicados'
idset = set(ids)
for n in parsed.iter():
    for attr in ['type', 'association', 'memberEnd']:
        for ref in n.get(attr, '').split():
            assert ref in idset, f'Referencia rota: {ref}'
assert len(relations) == sum(bool(f['foreign_key']) for t in tables for f in t['fields'])
assert connection.connection is None

summary = {'date': '2026-10-28', 'django': django.get_version(),
           'business_tables': sum(t['app'] in business for t in tables),
           'total_tables': len(tables), 'columns': sum(len(t['fields']) for t in tables),
           'relationships': len(relations), 'models_match_migrations': True,
           'database_connection_opened': False,
           'migration_leaves': loader.graph.leaf_nodes(), 'tables': tables}
(OUT / 'esquema_verificado.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2, default=str), encoding='utf-8')

esc = lambda v: html.escape(str(v))
parts = ['<!doctype html><html lang="es"><meta charset="utf-8"><title>Base de datos del condominio</title>',
         '<style>body{font:15px system-ui;max-width:1200px;margin:36px auto;padding:0 24px;color:#183047}h1,h2{color:#124e66}table{border-collapse:collapse;width:100%;margin:20px 0 36px}th,td{padding:8px;border:1px solid #d5e1e7;text-align:left;vertical-align:top}th{background:#e8f2f5}code{background:#edf3f5;padding:2px}nav a{display:inline-block;margin:5px 12px 5px 0}small{color:#526976}</style>',
         '<h1>Base de datos del condominio</h1>',
         f'<p>19 tablas de negocio · {len(tables)} tablas totales · {len(relations)} relaciones · {summary["columns"]} columnas. Revisión: 28 de octubre de 2026.</p>',
         '<p>Reconstrucción del esquema esperado a partir de las migraciones y modelos. No se consultó una base desplegada. Los tipos corresponden a PostgreSQL, indicado por la configuración de ejemplo.</p>',
         '<h2>Organización</h2><p><b>Administración:</b> persona, cargo y empleado. <b>Residencial:</b> habitantes, mascotas, visitas, objetos perdidos, áreas comunes, reservas, vehículos, bloques, unidades e incidentes. <b>Finanzas:</b> contratos, expensas y multas. <b>Seguridad IA:</b> lecturas de placas. Los paquetes restantes corresponden a infraestructura Django, JWT y FCM.</p>',
         '<h2>Cómo se relaciona</h2><ul><li>Un cargo tiene muchos empleados. Persona y empleado son tablas independientes; cada una puede enlazar opcionalmente con un usuario.</li><li>Inquilino, familiares y visitante heredan de persona: su persona_ptr_id es simultáneamente PK y FK. Una persona puede tener cero o una fila en cada subtipo. Inquilino tiene además un propietario; familiares tiene además una persona relacionada.</li><li>Un bloque contiene muchas unidades. Un contrato une una persona con una unidad; pueden existir varios contratos por persona y por unidad.</li><li>Una unidad tiene muchas expensas; una expensa tiene muchas multas. Un incidente puede apuntar a una persona y a una multa; ambos vínculos son opcionales.</li><li>Persona tiene vehículos y mascotas. Visita enlaza dos personas: visitante y quien recibe. Reserva enlaza persona y área común.</li><li>Lectura de placa puede vincularse a un vehículo; se admiten lecturas sin coincidencia. Objeto perdido puede vincularse a quien lo recibió.</li><li>Usuarios y grupos, usuarios y permisos, y grupos y permisos usan tablas intermedias para relaciones muchos a muchos.</li></ul>',
         '<h2>Detalles importantes del esquema</h2><ul><li>No hay tablas propietario ni condominio: propietario se representa con persona.tipo=P.</li><li>La relación persona–unidad se obtiene mediante contrato. Inquilino no tiene FK directa a unidad.</li><li>No se declara unicidad de vehículo.placa, ni un único contrato activo por unidad, ni una restricción SQL que impida solapamientos de reservas.</li><li>unidad.codigo es único; también es única la pareja (bloque_id, numero). CI es único por separado en persona y empleado.</li><li>choices y limit_choices_to son reglas del ORM; no equivalen a CHECK SQL. blank controla validación, null controla nulabilidad.</li><li>on_delete describe el borrado gestionado por Django: cargo usa PROTECT, entregado_a usa SET_NULL y la mayoría de vínculos del negocio usan CASCADE. No se afirma que sean cláusulas SQL ON DELETE.</li><li>No se duplican en las tablas hijas las columnas heredadas de persona. Las asociaciones de herencia se representan como PK/FK uno a uno para reflejar la estructura relacional.</li></ul>',
         '<h2>Importar en Enterprise Architect</h2><ol><li>Crear o abrir un proyecto y seleccionar un paquete nuevo en el Browser.</li><li>Usar <b>Publish → Model Exchange → Import → XMI File</b> (o <b>Ctrl+Alt+I</b>).</li><li>Seleccionar <code>condominio_base_datos.xmi</code> e importar.</li><li>Crear un diagrama de clases y arrastrar las clases de los paquetes; se mostrarán las asociaciones importadas. Aplicar distribución automática si hace falta.</li></ol><p>El archivo usa UML 2.1 / XMI 2.1. Representa tablas como clases con columnas, tipos, cardinalidades y notas PK/FK/UNIQUE. No incluye posiciones de diagramas ni un perfil DDL nativo de Enterprise Architect. La validación automática comprueba XML, referencias, conteos y coincidencia entre modelos de negocio y migraciones.</p>',
         '<p><a href="https://www.sparxsystems.org/enterprise_architect_user_guide/17.2/model_exchange/importxmi.html">Guía oficial de importación XMI</a></p>',
         '<h2>Diccionario de datos</h2><nav>' + ''.join(f'<a href="#{esc(t["table"])}">{esc(t["table"])}</a>' for t in tables) + '</nav>']
for t in tables:
    parts.append(f'<h2 id="{esc(t["table"])}">{esc(t["table"])}</h2><p>Modelo: {esc(t["app"])}.{esc(t["model"])}</p>')
    if t['unique_together']:
        parts.append('<p>UNIQUE compuesto: ' + esc(t['unique_together']) + '</p>')
    parts.append('<table><tr><th>Columna</th><th>Tipo PostgreSQL</th><th>Claves</th><th>NULL</th><th>Relación / detalles</th></tr>')
    for f in t['fields']:
        flags = [label for condition, label in [(f['primary_key'], 'PK'), (f['unique'], 'UNIQUE'), (f['foreign_key'], 'FK'), (f['index'], 'INDEX')] if condition]
        details = []
        if f['foreign_key']:
            r = f['foreign_key']
            details.append(f"{r['table']}.{r['column']} — on_delete ORM: {r['on_delete_orm']}")
        if f['default'] is not None: details.append('Default ORM: ' + f['default'])
        if f['choices']: details.append('Choices ORM: ' + str(f['choices']))
        if f['auto_now_add']: details.append('Fecha de creación automática ORM')
        if f['check']: details.append('CHECK: ' + f['check'])
        parts.append('<tr>' + ''.join('<td>' + esc(v) + '</td>' for v in [f['column'], f['type'], ', '.join(flags), 'Sí' if f['null'] else 'No', '; '.join(details)]) + '</tr>')
    parts.append('</table>')
parts.append('</html>')
(OUT / 'guia_base_datos.html').write_text('\n'.join(parts), encoding='utf-8')
print(json.dumps({k: v for k, v in summary.items() if k not in ['tables', 'migration_leaves']}, ensure_ascii=False, indent=2))
print(xmi_path)
