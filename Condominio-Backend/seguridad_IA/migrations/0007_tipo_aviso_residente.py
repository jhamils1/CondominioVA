from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('seguridad_IA', '0006_zonas_por_camara')]
    operations = [migrations.AlterField(
        model_name='notificacionseguridad', name='tipo',
        field=models.CharField(max_length=30, choices=[('REVISION', 'Revisión'), ('CONFIRMADA', 'Confirmada'), ('AVISO_RESIDENTE', 'Aviso a residente')]),
    )]
