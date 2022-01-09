"""api URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import include, path, re_path
from rest_framework import routers, parsers
from rest_framework.response import Response
from api import views
from rest_framework.views import APIView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'tags', views.TagViewSet)
router.register(r'media', views.MediaViewSet)
router.register(r'profiles', views.ProfileViewSet)


class FileUploadView(APIView):
    parser_classes = [parsers.FileUploadParser]

    def put(self, request, filename, format=None):
        file_obj = request.data['file']
        # ...
        # do some stuff with uploaded file
        # ...
        return Response(status=204)


# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/batch/', views.Batch.as_view()),
    path('api/raw/<int:pk>/content/', views.RawContent.as_view()),
    path('api/raw/<int:pk>/thumbnail/', views.RawThumbnail.as_view()),
    path('api/raw/<int:pk>/poster/', views.RawPoster.as_view()),
    re_path(r'^upload/(?P<filename>[^/]+)$', FileUploadView.as_view()),
    path('api/', include(router.urls)),
]
