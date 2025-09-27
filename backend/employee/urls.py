# vims_project/backend/employee/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import EmployeeViewSet, EmployeeFamilyViewSet, EmployeeCareerStepViewSet
from rest_framework_nested import routers

router = DefaultRouter()
router.register(r"employees", EmployeeViewSet, basename="employees")

nested = routers.NestedDefaultRouter(router, r"employees", lookup="employee")
nested.register(r"family", EmployeeFamilyViewSet, basename="employee-family")
nested.register(r"career", EmployeeCareerStepViewSet, basename="employee-career")

urlpatterns = [
    path("", include(router.urls)),
    path("", include(nested.urls)),
]
