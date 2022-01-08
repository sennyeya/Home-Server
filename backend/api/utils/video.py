import cv2


def open_video(path):
    cap = cv2.VideoCapture(path, cv2.CAP_FFMPEG)
    while not cap.isOpened():
        cap = cv2.VideoCapture(path)
        cv2.waitKey(1000)
    return cap
