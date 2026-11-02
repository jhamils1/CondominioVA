from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('finanzas', '0002_initial'),
        ('administracion', '0007_sesion_version_fcm'),
        ('fcm_django', '0011_fcmdevice_fcm_django_registration_id_user_id_idx'),
    ]
    operations = [
        migrations.CreateModel(
            name='ProcedenciaFCM',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('proyecto', models.CharField(max_length=128)),
                ('token_hash', models.CharField(max_length=64)),
                ('validado_en', models.DateTimeField(auto_now=True)),
                ('sesion', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='dispositivos_fcm', to='administracion.sesionaplicacion')),
                ('dispositivo', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='procedencia_condominio', to='fcm_django.fcmdevice')),
            ],
        ),
    ]
