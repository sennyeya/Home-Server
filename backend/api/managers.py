from django.db.models import Manager
from api.tasks import handle_metadata_create
from api.utils.processing import make_poster


class MediaBulkManager(Manager):
    def bulk_create(self, items, **kwargs):
        super(MediaBulkManager, self).bulk_create(items, **kwargs)
        for item in items:
            handle_metadata_create.delay(item.path)
