"""Inicia los puentes locales junto al servidor de desarrollo de Django."""
import atexit
from django.contrib.staticfiles.management.commands.runserver import Command as StaticRunserver
from camaras.supervisor_puentes import SupervisorPuentes


class Command(StaticRunserver):
    def inner_run(self, *args, **options):
        supervisor = SupervisorPuentes()
        atexit.register(supervisor.cerrar)
        supervisor.iniciar()
        try:
            return super().inner_run(*args, **options)
        finally:
            supervisor.cerrar()
            atexit.unregister(supervisor.cerrar)
