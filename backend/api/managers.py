from django.db.models import Manager
from .tasks import handle_metadata_create


class MediaBulkManager(Manager):
    def bulk_create(self, items, **kwargs):
        super(MediaBulkManager, self).bulk_create(items, **kwargs)
        for item in items:
            handle_metadata_create.delay(item.path)
