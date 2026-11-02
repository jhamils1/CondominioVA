import uuid

from django.db import migrations, models
from django.db.models.functions import Lower, Trim
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('administracion', '0004_sesionaplicacion'),
    ]

    operations = [
        migrations.CreateModel(
            name='RolPersonalizado',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=100)),
                ('activo', models.BooleanField(default=False)),
                ('creado_en', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'constraints': [
                    models.CheckConstraint(condition=~models.Q(nombre=''), name='rol_personalizado_nombre_no_vacio'),
                    models.UniqueConstraint(Lower(Trim('nombre')), name='rol_personalizado_nombre_unico'),
                ],
            },
        ),
        migrations.CreateModel(
            name='CapacidadRolPersonalizado',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('codigo', models.CharField(max_length=100)),
                ('rol', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='capacidades', to='administracion.rolpersonalizado')),
            ],
            options={
                'constraints': [
                    models.CheckConstraint(condition=~models.Q(codigo=''), name='capacidad_rol_codigo_no_vacio'),
                    models.UniqueConstraint(fields=('rol', 'codigo'), name='capacidad_rol_codigo_unico'),
                ],
            },
        ),
    ]
