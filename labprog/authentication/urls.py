from django.urls import include, path
from django.views.generic import RedirectView
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegistroAPIView, CustomLoginView

urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='login'),
    path('register/', RegistroAPIView.as_view(), name='register'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]