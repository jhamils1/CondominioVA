from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('seguridad_IA', '0007_tipo_aviso_residente')]

    operations = [
        migrations.AddField(model_name='zonacamara', name='automatico', field=models.BooleanField(default=False)),
        migrations.AddField(model_name='historialzonacamara', name='automatico', field=models.BooleanField(default=False)),
    ]
