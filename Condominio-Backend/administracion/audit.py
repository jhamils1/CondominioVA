"""Record minimal security actions in the existing Django admin log."""
from django.contrib.admin.models import LogEntry
from django.contrib.contenttypes.models import ContentType


def record_action(actor, instance, message, flag):
    LogEntry.objects.log_action(
        user_id=actor.pk,
        content_type_id=ContentType.objects.get_for_model(instance).pk,
        object_id=str(instance.pk),
        object_repr=instance._meta.verbose_name.title(),
        action_flag=flag,
        change_message=message,
    )
