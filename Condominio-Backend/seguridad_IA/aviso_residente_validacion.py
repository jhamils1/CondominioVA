"""Comprueba que el aviso siga correspondiendo a la confirmación vigente."""
import json
from administracion.access import effective_role
from residencial.modelsVehiculo import Vehiculo
from .models import EventoSeguridad, HistorialEventoSeguridad


def aviso_residente_valido(aviso):
    evento = aviso.evento
    if aviso.tipo != 'AVISO_RESIDENTE' or evento.estado not in (EventoSeguridad.CONFIRMADO, EventoSeguridad.EN_ATENCION):
        return False
    placa = HistorialEventoSeguridad.objects.filter(evento=evento, accion='PLACA_REVISADA').order_by('-fecha', '-pk').first()
    verificado = HistorialEventoSeguridad.objects.filter(evento=evento, accion='DESTINATARIO_VERIFICADO').order_by('-fecha', '-pk').first()
    if not placa or not verificado or (verificado.fecha, verificado.pk) < (placa.fecha, placa.pk):
        return False
    try:
        datos = json.loads(verificado.observacion)
        if datos['placa'] != placa.observacion or datos['usuario_id'] != aviso.destinatario_id:
            return False
        vehiculos = list(Vehiculo.objects.filter(placa__iexact=placa.observacion).select_related('persona', 'persona__user')[:2])
        if len(vehiculos) != 1:
            return False
        vehiculo = vehiculos[0]
        persona = vehiculo.persona
        esperado = {'P': 'propietario', 'I': 'inquilino'}.get(persona.tipo)
        return bool(vehiculo.pk == datos['vehiculo_id'] and persona.pk == datos['persona_id'] and
                    persona.estado == 'A' and persona.user_id == aviso.destinatario_id and esperado and
                    effective_role(aviso.destinatario) == esperado)
    except (ValueError, TypeError, KeyError):
        return False
