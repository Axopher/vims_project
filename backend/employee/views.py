# vims_project/backend/employee/views.py
from rest_framework import viewsets, permissions, filters
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

# from django_filters.rest_framework import DjangoFilterBackend
# from rest_framework import filters
from helpers.permissions import HasAnyRole
from helpers.constants import Role as ROLE
from employee.models import Employee, EmployeeFamily, CareerStep
from employee.serializers import (
    EmployeeSerializer,
    EmployeeFamilySerializer,
    EmployeeCareerStepSerializer,
)


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related("user").all()
    serializer_class = EmployeeSerializer
    # filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    # filterset_fields = ["code", "first_name", "family_name", "user__role"]
    # ordering_fields = ["code", "first_name", "family_name", "created_at"]
    filter_backends = [filters.SearchFilter]
    search_fields = ["code", "first_name", "family_name", "user__email"]
    lookup_field = "idx"

    def get_queryset(self):
        user = self.request.user
        if user.is_director() or user.is_tenant_admin():
            return self.queryset
        # Employees see only themselves
        return self.queryset.filter(user=user)

    def get_permissions(self):
        # Global IsAuthenticated is already set in settings; here we add *extra* when needed
        if self.action in ["create", "update", "partial_update"]:
            allowed_roles = [ROLE.DIRECTOR.value, ROLE.TENANT_ADMIN.value]
            return [permissions.IsAuthenticated(), HasAnyRole(roles=allowed_roles)]
        if self.action in ["destroy"]:
            raise PermissionDenied("Deleting employees is not allowed.")
        return [permissions.IsAuthenticated()]

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        user = request.user
        if (user.is_director() or user.is_tenant_admin()) or (obj.user_id == user.id):
            return super().retrieve(request, *args, **kwargs)
        raise PermissionDenied("You can only view your own profile.")


class EmployeeFamilyViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeFamilySerializer
    lookup_field = "idx"

    def get_queryset(self):
        # nested route: /employees/{employee_idx}/family/
        employee_idx = self.kwargs["employee_idx"]
        return EmployeeFamily.objects.filter(employee__idx=employee_idx)

    def _get_employee(self):
        return get_object_or_404(Employee, idx=self.kwargs["employee_idx"])

    def _assert_can_mutate(self, employee):
        user = self.request.user
        if user.is_director() or user.is_tenant_admin():
            return
        if employee.user_id != user.id:
            raise PermissionDenied("You can only manage your own family records.")

    def perform_create(self, serializer):
        employee = self._get_employee()
        self._assert_can_mutate(employee)
        serializer.save(employee=employee)

    def perform_update(self, serializer):
        employee = self._get_employee()
        self._assert_can_mutate(employee)
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        employee = self._get_employee()
        self._assert_can_mutate(employee)
        return super().destroy(request, *args, **kwargs)


class EmployeeCareerStepViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeCareerStepSerializer
    lookup_field = "idx"

    def get_queryset(self):
        employee_idx = self.kwargs["employee_idx"]
        return CareerStep.objects.filter(employee__idx=employee_idx)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Inject the Employee object into the context
        context["employee"] = self._get_employee()
        return context

    def _get_employee(self):
        return get_object_or_404(Employee, idx=self.kwargs["employee_idx"])

    def _assert_can_mutate(self, employee):
        u = self.request.user
        if u.is_director() or u.is_tenant_admin():
            return
        if employee.user_id != u.id:
            raise PermissionDenied("You can only manage your own career records.")

    def perform_create(self, serializer):
        employee = self._get_employee()
        self._assert_can_mutate(employee)
        serializer.save(employee=employee)

    def perform_update(self, serializer):
        employee = self._get_employee()
        self._assert_can_mutate(employee)
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        employee = self._get_employee()
        self._assert_can_mutate(employee)
        return super().destroy(request, *args, **kwargs)
