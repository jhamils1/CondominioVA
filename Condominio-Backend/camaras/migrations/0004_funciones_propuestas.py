from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('camaras', '0003_monitorimou')]
    operations = [migrations.CreateModel(
        name='FuncionesPropuestasCamara',
        fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('lectura_placas', models.BooleanField(default=False)),
            ('incidencias_zona', models.BooleanField(default=False)),
            ('actualizado', models.DateTimeField(auto_now=True)),
            ('camara', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='funciones_propuestas', to='camaras.camara')),
        ],
    )]
