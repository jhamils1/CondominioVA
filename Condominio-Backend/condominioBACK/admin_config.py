from django.contrib.admin.apps import AdminConfig


class TechnicalAdminConfig(AdminConfig):
    default_site = 'condominioBACK.admin_site.TechnicalAdminSite'
