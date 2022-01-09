from django.contrib.auth.models import AbstractUser
from django.db.models import Model, CharField, IntegerField, FloatField, ForeignKey, \
    RESTRICT, CASCADE, OneToOneField, EmailField, ManyToManyField
from api.managers import MediaBulkManager
# Create your models here.


class Profile(Model):
    name = CharField(max_length=100)
    email = EmailField(blank=True, null=True)


class User(AbstractUser):
    profile = OneToOneField(Profile, on_delete=RESTRICT,
                            blank=True,
                            null=True)
    USERNAME_FIELD = 'username'


class Media(Model):
    objects = MediaBulkManager()
    title = CharField(max_length=100)
    duration = FloatField()
    views = IntegerField(default=0)
    path = CharField(max_length=1000)
    playlists = ManyToManyField(Profile, related_name='Playlists')
    people = ManyToManyField(Profile)


class Comment(Model):
    content = CharField(max_length=1000)
    user = ForeignKey(User, on_delete=CASCADE)
    media = ForeignKey(Media, on_delete=CASCADE)


class Tag(Model):
    content = CharField(max_length=100)
    media = ForeignKey(Media, on_delete=RESTRICT)


class WatchData(Model):
    state = CharField(max_length=100)
    timestamp = FloatField()
    media = OneToOneField(Media, on_delete=CASCADE)
    user = OneToOneField(User, on_delete=CASCADE)


class History(Model):
    type = CharField(max_length=100)
    media = OneToOneField(Media, on_delete=CASCADE)
    user = OneToOneField(User, on_delete=CASCADE)
