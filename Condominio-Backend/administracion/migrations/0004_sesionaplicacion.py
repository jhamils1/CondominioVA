import uuid

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('administracion', '0003_empleado_user_persona_user'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SesionAplicacion',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('creada', models.DateTimeField(auto_now_add=True)),
                ('revocada', models.DateTimeField(blank=True, null=True)),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sesiones_aplicacion', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
