from os import listdir
from os.path import isfile, join, exists
from pathlib import Path
import cv2
from api.utils.config import FOLDER_PATH
from api.models import Media
from api.utils.video import open_video


def get_duration(filename):
    cap = open_video(filename)

    # OpenCV2 version 2 used "CV_CAP_PROP_FPS"
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = frame_count/fps
    cap.release()
    return duration


def batch_import():
    suffixes = ['.thumbnail', '.poster', '.m4s', '.mpd']

    files = [f'{FOLDER_PATH}/{f}' for f in listdir(FOLDER_PATH) if isfile(
        join(FOLDER_PATH, f)) and all(suffix not in suffixes for suffix in Path(f).suffixes)
        and not (exists(f'{FOLDER_PATH}/{f}.thumbnail.jpg') and exists(f'{FOLDER_PATH}/{f}.poster.mp4'))]
    to_create = []
    i = 0
    total_files = len(files)
    try:
        for file in files:
            if len(to_create) > 500:
                Media.objects.bulk_create(to_create)
                to_create = []

            to_create.append(
                Media(
                    title=Path(file).stem,
                    path=file,
                    duration=get_duration(file)
                )
            )
            i += 1
            print(f'Processed {i}/{total_files}')
    except Exception as e:
        print(e)

    Media.objects.bulk_create(to_create)
