from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('camaras', '0002_camara_contrasena_cifrada_camara_ruta_rtsp_and_more')]
    operations = [migrations.CreateModel(name='MonitorImou', fields=[
        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
        ('actualizado', models.DateTimeField(auto_now=True)),
        ('camara', models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, related_name='monitor_imou', to='camaras.camara')),
    ], options={'verbose_name': 'Cámara del monitor Imou', 'constraints': [models.CheckConstraint(condition=models.Q(id=1), name='monitor_imou_unico')]})]
