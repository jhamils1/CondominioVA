from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone

class Migration(migrations.Migration):
    dependencies = [('seguridad_IA', '0008_registro_automatico_camaras'), migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(name='ReglaPiscina', fields=[
            ('fuente', models.CharField(max_length=64, primary_key=True, serialize=False)),
            ('puntos', models.JSONField(default=list)), ('segundos', models.PositiveSmallIntegerField(default=10)),
            ('automatico', models.BooleanField(default=False)), ('actualizado', models.DateTimeField(default=django.utils.timezone.now)),
            ('actualizado_por', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.CreateModel(name='HistorialReglaPiscina', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('fuente', models.CharField(max_length=64)), ('puntos', models.JSONField(default=list)),
            ('segundos', models.PositiveSmallIntegerField(default=10)), ('automatico', models.BooleanField(default=False)),
            ('fecha', models.DateTimeField(default=django.utils.timezone.now)),
            ('actor', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
        ]),
    ]
