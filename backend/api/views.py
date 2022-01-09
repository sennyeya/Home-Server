from pathlib import Path
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import Group
from rest_framework import viewsets, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
import os
import re
import mimetypes
from wsgiref.util import FileWrapper
from django.http.response import FileResponse, StreamingHttpResponse
import mimetypes
from ffmpeg_streaming import Formats
import ffmpeg_streaming
from rest_framework_simplejwt.exceptions import InvalidToken
from api.utils.processing import get_poster_path, get_thumbnail_path
from api.serializers import StatusSerializer, UserSerializer, GroupSerializer, ProfileSerializer, MediaSerializer, TagSerializer
from api.models import Media, Tag, Profile
from api.utils.from_disk import batch_import
User = get_user_model()

JWT_authenticator = JWTAuthentication()


range_re = re.compile(r'bytes\s*=\s*(\d+)\s*-\s*(\d*)', re.I)


class RangeFileWrapper(object):
    def __init__(self, filelike, blksize=9192, offset=0, length=None):
        self.filelike = filelike
        self.filelike.seek(offset, os.SEEK_SET)
        self.remaining = length
        self.blksize = blksize

    def close(self):
        if hasattr(self.filelike, 'close'):
            self.filelike.close()

    def __iter__(self):
        return self

    def __next__(self):
        if self.remaining is None:
            # If remaining is None, we're reading the entire file.
            data = self.filelike.read(self.blksize)
            if data:
                return data
            raise StopIteration()
        else:
            if self.remaining <= 0:
                raise StopIteration()
            data = self.filelike.read(min(self.remaining, self.blksize))
            if not data:
                raise StopIteration()
            self.remaining -= len(data)
            return data


def get_media_content(request, path):
    # authenticate() verifies and decode the token
    # if token is invalid, it raises an exception and returns 401
    try:
        _ = JWT_authenticator.get_validated_token(
            request.GET.get('token', None))
        # get an open file handle (I'm just using a file attached to the model for this example):
        file_handle = open(path, 'rb')

        # send file
        range_header = request.META.get('HTTP_RANGE', '').strip()
        range_match = range_re.match(range_header)
        size = os.path.getsize(path)
        content_type, _ = mimetypes.guess_type(path)
        content_type = content_type or 'application/octet-stream'
        if range_match:
            first_byte, last_byte = range_match.groups()
            first_byte = int(first_byte) if first_byte else 0
            last_byte = int(last_byte) if last_byte else size
            if last_byte >= size:
                last_byte = size - 1
            length = last_byte - first_byte + 1
            print(first_byte, last_byte, size, length)
            resp = StreamingHttpResponse(
                RangeFileWrapper(
                    file_handle, offset=first_byte, length=length),
                status=206,
                content_type=content_type
            )
            resp['Content-Range'] = f'bytes {first_byte}-{last_byte}/{size}'
            resp['Content-Length'] = length
        else:
            resp = FileResponse(FileWrapper(file_handle),
                                content_type=content_type)
            resp['Content-Length'] = size
        filename = Path(path).name
        resp['Content-Disposition'] = f'inline; filename={filename}'
        resp['Accept-Ranges'] = 'bytes'
        return resp
    except InvalidToken as e:
        print(e)
        return Response('Unauthorized', status=401)


def get_video_stream(request, path, item_id):
    try:
        _ = JWT_authenticator.get_validated_token(
            request.GET.get('token', None))
        print(path)
        video = ffmpeg_streaming.input(path)
        dir_name = os.path.dirname(path)
        dash_path = f'{dir_name}/{item_id}.mpd'
        dash = video.dash(Formats.h264())
        dash.auto_generate_representations()
        dash.output(f'{path}.mpd')
        return get_media_content(request, dash_path)
    except InvalidToken as e:
        print(e)
        return Response('Unauthorized', status=401)


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser, permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def current(self, request):
        return Response(UserSerializer(request.user, context={'request': request}).data)


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class MediaViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Media.objects.all().order_by('title')
    serializer_class = MediaSerializer
    permission_classes = [permissions.IsAuthenticated]


class RawThumbnail(generics.RetrieveAPIView):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    """
    API endpoint that allows users to be viewed or edited.
    """

    def get(self, request, pk):
        instance = self.get_object()
        return get_media_content(request, get_thumbnail_path(instance.path))


class RawPoster(generics.RetrieveAPIView):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    """
    API endpoint that allows users to be viewed or edited.
    """

    def get(self, request, pk):
        instance = self.get_object()
        return get_media_content(request, get_poster_path(instance.path))


class RawContent(generics.RetrieveAPIView):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    """
    API endpoint that allows users to be viewed or edited.
    """

    def get(self, request, pk):
        instance = self.get_object()
        return get_media_content(request, instance.path)


class TagViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


class Batch(APIView):
    #permission_classes = [permissions.IsAdminUser, permissions.IsAuthenticated]
    """
    API endpoint that allows users to be viewed or edited.
    """

    def get(self, request):
        batch_import()
        return Response(StatusSerializer({'status': 'started'}).data)
