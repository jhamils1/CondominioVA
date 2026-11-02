from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('administracion', '0006_asignacionrolpersonalizado')]
    operations = [migrations.AddField(model_name='sesionaplicacion', name='version_fcm',
                                      field=models.PositiveBigIntegerField(default=0))]
