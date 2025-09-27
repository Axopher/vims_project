# vims/backend/user/urls.py
from django.urls import path
from user.views import (
    TenantTokenObtainPairView,
    TenantTokenRefreshView,
    TenantCreateUserView,
    ActivateUserView,
    MyAPIView
)

urlpatterns = [
    path(
        "login/", TenantTokenObtainPairView.as_view(), name="login"
    ),
    path(
        "refresh_token/",
        TenantTokenRefreshView.as_view(),
        name="refresh_token",
    ),
    path("create-tenant-user/", TenantCreateUserView.as_view(), name="create-tenant-user"),
    path("activate/<str:uidb64>/<str:token>/", ActivateUserView.as_view(), name="activate"),
    path("my/", MyAPIView.as_view(),name="my")
]
