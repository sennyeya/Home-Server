from django.apps import AppConfig


class AppConfig(AppConfig):
    name = 'api'

    def ready(self):
        import api.signals  # noqa
