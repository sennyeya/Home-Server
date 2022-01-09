from pathlib import Path
from .tasks import handle_metadata_create
from .models import Media
from django.db.models.signals import post_save
from django.dispatch import receiver
from os import rename
from os.path import exists
from api.utils.processing import get_poster_path, get_thumbnail_path

from api.utils.config import FOLDER_PATH


@receiver(post_save, sender=Media)
def create_metadata(sender, instance, created, **kwargs):
    """Create metadata whenever a user object is created."""
    print(instance, created)
    if created:
        new_path = f'{FOLDER_PATH}/{instance.id}'
        rename(instance.path, new_path)
        if exists(get_thumbnail_path(instance.path)):
            rename(get_thumbnail_path(instance.path),
                   get_thumbnail_path(new_path))
        if exists(get_poster_path(instance.path)):
            rename(get_poster_path(instance.path), get_poster_path(new_path))
        handle_metadata_create.delay(new_path)
        instance.path = new_path
        instance.save()
