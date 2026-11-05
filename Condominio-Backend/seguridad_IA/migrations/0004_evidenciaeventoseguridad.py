import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('seguridad_IA', '0003_entregafcmseguridad')]

    operations = [
        migrations.CreateModel(
            name='EvidenciaEventoSeguridad',
            fields=[
                ('evento', models.OneToOneField(on_delete=django.db.models.deletion.PROTECT,
                                                primary_key=True, related_name='evidencia_privada',
                                                serialize=False, to='seguridad_IA.eventoseguridad')),
                ('imagen', models.BinaryField()),
                ('sha256', models.CharField(max_length=64)),
                ('creada', models.DateTimeField(default=django.utils.timezone.now)),
            ],
        ),
    ]
