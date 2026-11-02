from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('administracion', '0005_rolpersonalizado_capacidadrolpersonalizado'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AsignacionRolPersonalizado',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rol', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='asignaciones', to='administracion.rolpersonalizado')),
                ('usuario', models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, related_name='asignacion_rol_personalizado', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
