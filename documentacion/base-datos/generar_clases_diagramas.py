"""XMI 1.1 con diagramas EA, generado sin controlar ni abrir aplicaciones.

Estructura de serialización contrastada con un XMI exportado por EA 15.1
y con el patrón UML de herencia distribuido con esa aplicación.
La fuente de datos es esquema_verificado.json, obtenido de las migraciones.
"""
import json
import argparse
import ast
import re
import uuid
from pathlib import Path
import xml.etree.ElementTree as ET

OUT = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument('--sin-flechas', action='store_true')
args = parser.parse_args()
schema = json.loads((OUT / 'esquema_verificado.json').read_text(encoding='utf-8'))
tables = {t['table']: t for t in schema['tables']}
U = 'omg.org/UML1.3'
ET.register_namespace('UML', U)

def uid(key, prefix='EAID_'):
    version = 'condominio-clases-sin-flechas-v2/' if args.sin_flechas else 'condominio-clases-diagramas-v1/'
    return prefix + str(uuid.uuid5(uuid.NAMESPACE_URL, version + key)).upper().replace('-', '_')

def node(parent, kind, **attrs):
    return ET.SubElement(parent, '{' + U + '}' + kind, {k: str(v) for k, v in attrs.items()})

def tagged(parent, tags):
    container = node(parent, 'ModelElement.taggedValue')
    for key, value in tags.items():
        node(container, 'TaggedValue', tag=key, value=value)

def datatype(f):
    kind = f['django_type']
    if kind in ('BigAutoField', 'BigIntegerField', 'PositiveBigIntegerField'): return 'Long'
    if 'IntegerField' in kind or kind == 'AutoField': return 'Integer'
    return {'DecimalField': 'Decimal', 'FloatField': 'Double', 'BooleanField': 'Boolean',
            'DateTimeField': 'DateTime', 'DateField': 'Date', 'TimeField': 'Time'}.get(kind, 'String')

root = ET.Element('XMI', {'xmi.version': '1.1', 'timestamp': '2026-10-28 00:00:00'})
header = ET.SubElement(root, 'XMI.header')
documentation = ET.SubElement(header, 'XMI.documentation')
ET.SubElement(documentation, 'XMI.exporter').text = 'Condominio - formato de intercambio Enterprise Architect'
ET.SubElement(documentation, 'XMI.exporterVersion').text = '2.5'
content = ET.SubElement(root, 'XMI.content')
model = node(content, 'Model', name='EA Model', **{'xmi.id': uid('model', 'MX_')})
owned = node(model, 'Namespace.ownedElement')
main_id = uid('main', 'EAPK_')
main = node(owned, 'Package', name='Condominio_Clases_Sin_Flechas' if args.sin_flechas else 'Condominio_Clases_Con_Diagramas', visibility='public',
            isRoot='false', isLeaf='false', isAbstract='false', **{'xmi.id': main_id})
tagged(main, {'ea_package_id': 1, 'iscontrolled': 'FALSE', 'usedtd': 'FALSE', 'version': '1.0',
              'documentation': 'Modelo UML de clases persistentes del proyecto. Herencia declarada en Python y asociaciones FK/OneToOne con multiplicidades reales. FK expresadas como roles de asociaciones; no se duplican como atributos. Los tipos SQL, nombres de columnas, constraints y comportamiento ORM se conservan en notas. No se infiere composición ni agregación a partir de CASCADE. Fuente: modelos y migraciones revisados el 28-10-2026.',
              'gentype': 'Python', 'tpos': 0})
main_owned = node(main, 'Namespace.ownedElement')
labels = {'administracion': '01 Administracion', 'residencial': '02 Residencial',
          'finanzas': '03 Finanzas', 'seguridad_IA': '04 Seguridad IA',
          'auth': '05 Usuarios y permisos', 'contenttypes': '06 Tipos de contenido',
          'admin': '07 Auditoria', 'sessions': '08 Sesiones', 'token_blacklist': '09 Tokens JWT',
          'fcm_django': '10 Notificaciones', 'migrations': '11 Control de migraciones'}
packages = {}
for index, app in enumerate(sorted(labels, key=labels.get), 2):
    pkg_id = uid('package/' + app, 'EAPK_')
    pkg = node(main_owned, 'Package', name=labels[app], visibility='public', isRoot='false',
               isLeaf='false', isAbstract='false', **{'xmi.id': pkg_id})
    tagged(pkg, {'parent': main_id, 'ea_package_id': index, 'usedtd': 'FALSE', 'version': '1.0'})
    packages[app] = (pkg_id, node(pkg, 'Namespace.ownedElement'))

local_ids = {table: index for index, table in enumerate(tables, 100)}
attribute_count = 0
for table_name, table in tables.items():
    pkg_id, parent = packages[table['app']]
    cls = node(parent, 'Class', name=table['model'], visibility='public', namespace=pkg_id,
               isRoot='false', isLeaf='false', isAbstract='false', isActive='false',
               **{'xmi.id': uid('class/' + table_name)})
    notes = f"Modelo {table['app']}.{table['model']}. Tabla SQL: {table_name}."
    if table['implicit_join_table']:
        notes += ' Tabla puente generada por Django para una relación muchos a muchos.'
    for group in table['unique_together']:
        notes += ' UNIQUE SQL (' + ', '.join(group) + ').'
    tagged(cls, {'ea_stype': 'Class', 'ea_ntype': 0, 'package': pkg_id, 'version': '1.0',
                 'package_name': labels[table['app']], 'gentype': 'Python',
                 'ea_localid': local_ids[table_name], 'ea_eleType': 'element',
                 'documentation': notes, 'alias': table_name,
                 'style': 'BackColor=-1;BorderColor=-1;BorderWidth=-1;FontColor=-1;'})
    features = node(cls, 'Classifier.feature')
    for index, field in enumerate(f for f in table['fields'] if not f['foreign_key']):
        attribute_count += 1
        key = 'attribute/' + table_name + '/' + field['name']
        attr = node(features, 'Attribute', name=field['name'], visibility='public', changeable='none',
                    ownerScope='instance', targetScope='instance', **{'xmi.id': uid(key)})
        initial = node(attr, 'Attribute.initialValue')
        node(initial, 'Expression')
        fieldtype = node(attr, 'StructuralFeature.type')
        node(fieldtype, 'Classifier', **{'xmi.idref': uid('type/' + datatype(field))})
        info = f"Columna: {field['column']}; PostgreSQL: {field['type']}; NULL={field['null']}; UNIQUE={field['unique']}."
        if field['primary_key']: info += ' Clave primaria (PK).'
        if field['default'] is not None: info += ' Default ORM: ' + field['default'] + '.'
        if field['auto_now_add']: info += ' Fecha de creación automática en ORM.'
        if field['choices']: info += ' Choices ORM: ' + str(field['choices'])
        if field['check']: info += ' CHECK SQL: ' + field['check']
        tagged(attr, {'type': datatype(field), 'containment': 'Not Specified', 'ordered': 0,
                      'static': 0, 'collection': 'false', 'position': index,
                      'lowerBound': 0 if field['null'] else 1, 'upperBound': 1,
                      'ea_guid': '{' + uid(key)[5:].replace('_', '-') + '}',
                      'ea_localid': attribute_count, 'documentation': info})

relations = []
for table_name, table in tables.items():
    for field in table['fields']:
        fk = field['foreign_key']
        if not fk: continue
        index = len(relations) + 1
        key = 'relationship/' + table_name + '/' + field['name']
        rel_type = 'Generalization' if fk['parent_link'] else 'Association'
        source = uid('class/' + table_name)
        target = uid('class/' + fk['table'])
        attrs = {'xmi.id': uid(key), 'visibility': 'public'}
        if fk['parent_link']:
            attrs.update(subtype=source, supertype=target)
        else:
            attrs.update(isRoot='false', isLeaf='false', isAbstract='false')
        rel = node(packages[table['app']][1], rel_type, **attrs)
        notes = f"FK física: {table_name}.{field['column']} -> {fk['table']}.{fk['column']}. on_delete ORM: {fk['on_delete_orm']}."
        if fk['parent_link']:
            notes += ' Herencia Python; persona_ptr_id es PK/FK de la tabla hija.'
        else:
            notes += ' limit_choices_to ORM: ' + fk['limit_choices_to']
        source_card = '0..1' if field['unique'] else '0..*'
        target_card = '0..1' if field['null'] else '1'
        tags = {'style': 3, 'ea_type': rel_type,
                'direction': 'Source -> Destination' if fk['parent_link'] else 'Unspecified',
                'linemode': 3, 'linecolor': -1, 'linewidth': 0, 'seqno': 0,
                'ea_localid': index, 'ea_sourceName': table['model'],
                'ea_targetName': tables[fk['table']]['model'], 'ea_sourceType': 'Class',
                'ea_targetType': 'Class', 'ea_sourceID': local_ids[table_name],
                'ea_targetID': local_ids[fk['table']], 'documentation': notes}
        if not fk['parent_link']:
            tags.update(lb=source_card, rb=target_card, rt=field['name'])
        tagged(rel, tags)
        if not fk['parent_link']:
            ends = node(rel, 'Association.connection')
            for end_name, type_id, cardinality, role in [('source', source, source_card, ''),
                                                        ('target', target, target_card, field['name'])]:
                end = node(ends, 'AssociationEnd', name=role, visibility='public', multiplicity=cardinality,
                           aggregation='none', isOrdered='false', targetScope='instance',
                           changeable='none', isNavigable='false' if args.sin_flechas else 'true', type=type_id)
                style_key = 'sourcestyle' if end_name == 'source' else 'deststyle'
                tagged(end, {'containment': 'Unspecified', 'ea_end': end_name,
                             style_key: 'Union=0;Derived=0;AllowDuplicates=0;Owned=0;Navigable=Unspecified;'})
        relations.append({'id': uid(key), 'type': rel_type, 'source': table_name,
                          'target': fk['table'], 'field': field['name'],
                          'source_cardinality': source_card, 'target_cardinality': target_card})

for name in sorted({datatype(f) for t in tables.values() for f in t['fields'] if not f['foreign_key']}):
    node(owned, 'DataType', name=name, visibility='public', isRoot='false', isLeaf='false',
         isAbstract='false', **{'xmi.id': uid('type/' + name)})

diagrams = [
    ('00 General - modelo del negocio', {
        'cargo': (60,60), 'empleado': (540,60), 'auth_user': (1020,60), 'persona': (1500,60),
        'bloque': (60,580), 'unidad': (540,580), 'contrato': (1020,580),
        'inquilino': (1500,580), 'familiares': (1980,580), 'visitante': (2460,580),
        'expensa': (540,1100), 'multa': (1020,1100), 'incidente': (1500,1100),
        'visita': (1980,1100), 'mascota': (2460,1100),
        'residencial_areascomunes': (60,1620), 'reserva_area_comun': (540,1620),
        'residencial_objetoperdido': (1020,1620), 'vehiculo': (1500,1620), 'lectura_placa': (1980,1620)}),
    ('01 Personas - herencia y usuarios', {
        'persona': (570,60), 'auth_user': (1100,60),
        'inquilino': (60,560), 'familiares': (570,560), 'visitante': (1100,560)}),
    ('02 Administracion - empleados y cargos', {
        'cargo': (60,60), 'empleado': (570,60), 'auth_user': (1100,60)}),
    ('03 Viviendas - contratos expensas multas', {
        'persona': (60,60), 'contrato': (570,60), 'unidad': (1080,60), 'bloque': (1590,60),
        'incidente': (60,600), 'multa': (570,600), 'expensa': (1080,600)}),
    ('04 Convivencia - visitas mascotas y vehiculos', {
        'mascota': (60,60), 'persona': (600,60), 'vehiculo': (1140,60),
        'visita': (60,620), 'residencial_objetoperdido': (600,620), 'lectura_placa': (1140,620)}),
    ('05 Areas comunes y reservas', {
        'persona': (60,60), 'reserva_area_comun': (590,60), 'residencial_areascomunes': (1120,60)}),
]
infra = [name for name,t in tables.items() if t['app'] not in ('administracion','residencial','finanzas','seguridad_IA')]
diagrams.append(('06 Infraestructura - Django JWT y FCM',
                 {name:(60+510*(i%4), 60+480*(i//4)) for i,name in enumerate(infra)}))
diagram_stats = []
for diagram_index, (name, positions) in enumerate(diagrams, 1):
    diagram = node(content, 'Diagram', name=name, diagramType='ClassDiagram', owner=main_id,
                   toolName='Enterprise Architect 2.5', **{'xmi.id': uid('diagram/' + name)})
    tagged(diagram, {'version': '1.0', 'package': main_id, 'type': 'Logical', 'ea_localid': diagram_index,
        'EAStyle': 'ShowPrivate=1;ShowProtected=1;ShowPublic=1;HideRelationships=0;Locked=0;Border=1;HighlightForeign=0;PackageContents=1;ScalePrintImage=1;DocSize.cx=1654;DocSize.cy=2339;ShowDetails=0;Orientation=L;Zoom=70;ShowTags=0;ShowIcons=1;HideProps=0;HideParents=0;UseAlias=0;HideAtts=0;HideOps=1;HideStereo=0;HideElemStereo=0;ConnectorNotation=UML 2.1;ExplicitNavigability=0;ShowNotes=0;SuppressBrackets=0;SuppConnectorLabels=0;',
        'styleex': 'ExcludeRTF=0;DocAll=0;HideQuals=1;AttPkg=1;SuppressFOC=1;TConnectorNotation=UML 2.1;TExplicitNavigability=0;ShowNotes=0;VisibleAttributeDetail=0;ShowOpRetType=1;SuppressBrackets=0;SuppConnectorLabels=0;SuppressedCompartments=;Theme=:119;'})
    elements = node(diagram, 'Diagram.element')
    duids = {table: uid(name + '/' + table)[5:13] for table in positions}
    for index, (table, (left, top)) in enumerate(positions.items(), 1):
        fields = [f for f in tables[table]['fields'] if not f['foreign_key']]
        height = max(100, 65 + 22 * len(fields))
        node(elements, 'DiagramElement', subject=uid('class/' + table), seqno=index,
             geometry=f'Left={left};Top={top};Right={left+350};Bottom={top+height};',
             style=f'DUID={duids[table]};')
    visible_relations = [r for r in relations if r['source'] in positions and r['target'] in positions]
    for relation in visible_relations:
        node(elements, 'DiagramElement', subject=relation['id'],
             geometry='SX=0;SY=0;EX=0;EY=0;EDGE=2;$LLB=;LLT=;LMT=;LMB=;LRT=;LRB=;IRHS=;ILHS=;Path=;',
             style=f"Mode=3;EOID={duids[relation['target']]};SOID={duids[relation['source']]};Color=-1;LWidth=0;Hidden=0;")
    diagram_stats.append({'name': name, 'classes': len(positions), 'relationships': len(visible_relations)})

if args.sin_flechas:
    for diagram in content.findall('{' + U + '}Diagram'):
        tags = diagram.find('{' + U + '}ModelElement.taggedValue')
        node(tags, 'TaggedValue', tag='showforeign', value='0')
        for tag in tags:
            if tag.get('tag') == 'EAStyle':
                tag.set('value', tag.get('value') + 'ShowForeign=0;')
            elif tag.get('tag') == 'styleex':
                tag.set('value', tag.get('value') + 'NoFullScope=1;')

ET.SubElement(root, 'XMI.difference')
extensions = ET.SubElement(root, 'XMI.extensions', {'xmi.extender': 'Enterprise Architect 2.5'})
ET.SubElement(extensions, 'EAModel.paramSub')
ET.indent(root, space='  ')
target = OUT / ('condominio_clases_sin_flechas.xmi' if args.sin_flechas else 'condominio_clases_con_diagramas.xmi')
ET.ElementTree(root).write(target, encoding='utf-8', xml_declaration=True)

# Verificación de referencias, relaciones, cobertura de diagramas y geometría.
parsed = ET.parse(target)
all_ids = [e.get('xmi.id') for e in parsed.iter() if e.get('xmi.id')]
assert len(all_ids) == len(set(all_ids))
ids = set(all_ids)
for e in parsed.iter():
    for key in ('xmi.idref', 'namespace', 'owner', 'subject', 'subtype', 'supertype'):
        if e.get(key): assert e.get(key) in ids, (key, e.get(key))
    if e.tag == '{' + U + '}AssociationEnd': assert e.get('type') in ids
assert len(list(parsed.iter('{' + U + '}Class'))) == 32
assert len(list(parsed.iter('{' + U + '}Association'))) == 32
assert len(list(parsed.iter('{' + U + '}Generalization'))) == 3
assert len(list(parsed.iter('{' + U + '}Diagram'))) == 7
assert {r['source'] for r in relations if r['type'] == 'Generalization'} == {'inquilino','familiares','visitante'}
assert set().union(*(set(p) for _,p in diagrams)) == set(tables)
if args.sin_flechas:
    assert all(e.get('isNavigable') == 'false' for e in parsed.iter('{' + U + '}AssociationEnd'))
    backend = OUT.parents[1] / 'Condominio-Backend'
    business_apps = ('administracion', 'residencial', 'finanzas', 'seguridad_IA')
    for app in business_apps:
        actual = set()
        for file in (backend / app).glob('models*.py'):
            tree = ast.parse(file.read_text(encoding='utf-8-sig'))
            actual.update(n.name for n in tree.body if isinstance(n, ast.ClassDef))
        expected = {t['model'] for t in tables.values() if t['app'] == app}
        assert actual == expected, (app, actual, expected)
report = {'format': 'EA XMI 1.1', 'classes':32, 'attributes':attribute_count,
          'associations':32, 'generalizations':3, 'diagrams':diagram_stats,
          'xml_references_valid':True, 'live_import_verified':False,
          'source':'esquema_verificado.json', 'relationships':relations}
report['navigation_arrows'] = not args.sin_flechas
(OUT/('validacion_sin_flechas.json' if args.sin_flechas else 'validacion_diagramas_ea.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='relationships'},ensure_ascii=False,indent=2))
print(target)
