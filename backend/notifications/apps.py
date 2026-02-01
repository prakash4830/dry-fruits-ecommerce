"""
Notifications app configuration.

Worker: Dev - App config with signal connection
"""

from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notifications'
    
    def ready(self):
        # Import signals to register them
        import notifications.signals  # noqa
