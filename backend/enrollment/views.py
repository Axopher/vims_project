# enrollment/views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework import status, filters
from student.models import StudentStatus
from .serializers import (
    EnrollmentSerializer,
    EnrollmentCreateSerializer,
    EnrollmentUpdateSerializer,
)
from .services import create_enrollment, update_enrollment, close_enrollment
from helpers.api import BaseAPIMixin


class EnrollmentViewSet(BaseAPIMixin, ModelViewSet):
    queryset = StudentStatus.objects.select_related(
        "student", "course_class__course", "course_class__term"
    ).all()
    lookup_field = "idx"
    filter_backends = [filters.SearchFilter]
    search_fields = [
        "student__first_name",
        "student__family_name",
        "course_class__code",
        "course_class__course__name",
        "status",
    ]

    def get_serializer_class(self):
        if self.action == "create":
            return EnrollmentCreateSerializer
        if self.action in ["update", "partial_update"]:
            return EnrollmentUpdateSerializer
        return EnrollmentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        enrollment = create_enrollment(**serializer.validated_data)
        response = EnrollmentSerializer(enrollment).data
        return self.api_success_response(response, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        enrollment = self.get_object()
        serializer = self.get_serializer(enrollment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        enrollment = update_enrollment(enrollment, **serializer.validated_data)
        return self.api_success_response(EnrollmentSerializer(enrollment).data)

    def destroy(self, request, *args, **kwargs):
        return self.api_error_response(
            "Delete Not Allowed.", status=status.HTTP_400_BAD_REQUEST
        )

    # def destroy(self, request, *args, **kwargs):
    #     enrollment = self.get_object()
    #     comment = request.data.get("comment", None)
    #     enrollment = close_enrollment(enrollment, comment)
    #     return self.api_success_response(EnrollmentSerializer(enrollment).data)
