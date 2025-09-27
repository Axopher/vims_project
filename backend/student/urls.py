# student/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"students", views.StudentViewSet, basename="student")
router.register(r"custodians", views.CustodianViewSet, basename="custodian")

urlpatterns = [
    path("", include(router.urls)),
]
