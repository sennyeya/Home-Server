from celery import shared_task
from os.path import exists
from .utils.processing import make_thumbnail, make_poster, get_poster_path, get_thumbnail_path


@shared_task
def handle_metadata_create(path):
    if not exists(get_thumbnail_path(path)):
        make_thumbnail(path)
    if not exists(get_poster_path(path)):
        make_poster(path)
