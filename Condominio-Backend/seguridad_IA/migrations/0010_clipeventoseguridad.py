from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    dependencies = [('seguridad_IA', '0009_regla_piscina')]
    operations = [
        migrations.CreateModel(name='ClipEventoSeguridad', fields=[
            ('evento', models.OneToOneField(on_delete=django.db.models.deletion.PROTECT,
                primary_key=True, related_name='clip_privado', serialize=False, to='seguridad_IA.eventoseguridad')),
            ('video', models.BinaryField()),
            ('sha256', models.CharField(max_length=64)),
            ('creado', models.DateTimeField(default=django.utils.timezone.now)),
        ]),
    ]
