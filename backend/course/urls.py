# course/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"terms", views.TermViewSet, basename="terms")
router.register(r"courses", views.CourseViewSet, basename="courses")
router.register(r"course-classes", views.CourseClassViewSet, basename="course-classes")

urlpatterns = [
    path("", include(router.urls)),
    path("instructors/", views.InstructorListAPIView.as_view(), name="instructor-list"),
]
