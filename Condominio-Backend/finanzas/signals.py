from django.db.models.signals import post_save
from django.dispatch import receiver
from fcm_django.models import FCMDevice
from firebase_admin.messaging import Message, Notification
from .models import expensa
from django.utils import timezone
from administracion.access import effective_role
import logging
from residencial.models import ObjetoPerdido

logger = logging.getLogger(__name__)

# Helper simple para meses en español (para evitar problemas de configuración de servidor)
MESES = {
    1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio",
    7: "Julio", 8: "Agosto", 9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"
}

@receiver(post_save, sender=expensa)
def enviar_notificacion_expensa(sender, instance, created, **kwargs):
    if created:
        try:
            # Usar la misma restricción de unidad que la API financiera.
            contratos = list(instance.unidad.contratos_unidad.filter(
                estado='A', fecha_contrato__lte=timezone.localdate()
            ).select_related('propietario__user').order_by('pk')[:2])
            if len(contratos) != 1:
                logger.warning('Notificacion de expensa omitida: contrato no verificable')
                return
            propietario = contratos[0].propietario
            if propietario.tipo != 'P' or propietario.estado != 'A' or not propietario.user_id:
                return
            usuario_dueno = propietario.user
            from .views import expensas_permitidas
            if (effective_role(usuario_dueno) not in ('propietario', 'administrador') or
                    not expensas_permitidas(usuario_dueno).filter(pk=instance.pk).exists()):
                logger.warning('Notificacion de expensa omitida: destinatario no autorizado')
                return
            
            # 2. Preparar datos para el mensaje personalizado
            nombre_persona = propietario.nombre.split()[0] # Tomamos solo el primer nombre
            nombre_unidad = str(instance.unidad) # Asumiendo que el __str__ de unidad dice algo como "A-101"
            
            # Obtener el nombre del mes actual o de la fecha de emisión
            mes_actual = MESES[instance.fecha_emision.month]
            
            # --- CREACIÓN DEL MENSAJE PERSONALIZADO ---
            titulo_msg = f"Expensa de {mes_actual} 📅"
            cuerpo_msg = f"Hola {nombre_persona}, se ha generado la cuota de tu unidad {nombre_unidad} por {instance.monto} {instance.currency}."

            # 3. Buscar dispositivos
            dispositivos = FCMDevice.objects.filter(user=usuario_dueno, active=True)

            if dispositivos.exists():
                dispositivos.send_message(
                    Message(
                        notification=Notification(
                            title=titulo_msg,
                            body=cuerpo_msg
                        ),
                        data={
                            "tipo": "nueva_expensa",
                            "expensa_id": str(instance.id),
                            "click_action": "FLUTTER_NOTIFICATION_CLICK"
                        }
                    )
                )
                logger.info('Notificacion de expensa procesada')

        except Exception:
            logger.warning('No se pudo enviar la notificacion de expensa')

@receiver(post_save, sender=ObjetoPerdido)
def notificar_objeto_encontrado(sender, instance, created, **kwargs):
    # Solo notificamos si es nuevo (created=True) y si el estado es 'Pendiente' ('P')
    if created and instance.estado == 'P':
        logger.info('Procesando notificacion de objeto encontrado')
        
        try:
            # 1. Obtenemos TODOS los dispositivos registrados en el sistema
            # (En un condominio real, esto le avisa a todos los vecinos)
            dispositivos = FCMDevice.objects.all()
            
            if dispositivos.exists():
                logger.info('Procesando difusion de objeto encontrado')

                # 2. Preparamos el mensaje
                # Usamos emojis para hacerlo visual
                titulo_msg = "🔍 Objeto Encontrado"
                cuerpo_msg = f"Se encontró '{instance.titulo}' en {instance.lugar_encontrado}. ¿Es tuyo?"

                # 3. Enviamos el mensaje a cada dispositivo
                # Nota: Para proyectos grandes (miles de usuarios) se usan "Topics", 
                # pero para tu examen este bucle o envío masivo funciona perfecto.
                dispositivos.send_message(
                    Message(
                        notification=Notification(
                            title=titulo_msg,
                            body=cuerpo_msg
                        ),
                        data={
                            "tipo": "objeto_perdido", # Para que Flutter sepa qué pantalla abrir
                            "objeto_id": str(instance.id),
                            "click_action": "FLUTTER_NOTIFICATION_CLICK"
                        }
                    )
                )
                logger.info('Notificacion de objeto encontrado procesada')
            else:
                logger.info('No hay dispositivos registrados para objeto encontrado')

        except Exception:
            logger.warning('No se pudo enviar la notificacion de objeto encontrado')
