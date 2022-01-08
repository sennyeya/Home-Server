import cv2
from numpy.random import randn
from .video import open_video
fourcc = cv2.VideoWriter_fourcc(*'MP4V')


def get_thumbnail_path(path):
    return f'{path}.thumbnail.jpg'


def get_poster_path(path):
    return f'{path}.poster.mp4'


def bound(low, high, value):
    return max(low, min(high, value))


def interpolate(num_frames):
    if num_frames > 1000:
        return int(bound(10, num_frames / 10000, 20))
    return 5


def rand_normal(num_frames):
    return (num_frames/4) * randn() + num_frames/2


def make_thumbnail(path):
    cap = open_video(path)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame = rand_normal(frame_count)
    cap.set(1, frame)
    _, frame = cap.read()
    error_count = 0
    while frame is None:
        if error_count > 10:
            return
        frame = rand_normal(frame_count)
        cap.set(1, frame)
        _, frame = cap.read()
        error_count += 1
    cv2.imwrite(get_thumbnail_path(path), frame)
    print(path)
    cap.release()
    cv2.destroyAllWindows()


def make_poster(path):
    cap = open_video(path)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    images = []
    frames = [rand_normal(frame_count)
              for _ in range(interpolate(frame_count))]
    frames.sort()

    fps = cap.get(cv2.CAP_PROP_FPS)

    for frame_num in frames:
        for i in range(bound(1, int(fps/1.5), 60)):
            if frame_num + i > frame_count - 1:
                break
            cap.set(1, frame_num+i)
            _, frame = cap.read()
            images.append(frame)

    height, width, _ = images[0].shape
    video = cv2.VideoWriter(get_poster_path(
        path), fourcc, fps, (width, height))

    for image in images:
        video.write(image)

    cv2.destroyAllWindows()
    cap.release()
    video.release()
