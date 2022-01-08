import os

os.system("celery -A api worker -l DEBUG -P gevent")
