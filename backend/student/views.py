# vims_project/backend/student/views.py
from django.utils import timezone
from django.db.models import Q

from django.db.models import Prefetch
from rest_framework import status, filters
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet

from helpers.api import BaseAPIMixin
from course.models import CourseInstructor
from student.models import Student, Custodian, StudentStatus
from student.services import (
    assign_student_to_course_class,
    unassign_student_from_course_class,
)
from student.serializers import (
    StudentListSerializer,
    StudentSerializer,
    StudentStatusSerializer,
    StudentCreateUpdateSerializer,
    CustodianSerializer,
    CustodianCreateUpdateSerializer,
    StudentEnrollmentSerializer,
    StudentUnenrollmentSerializer,
    EnrollmentResponseSerializer,
)


class StudentViewSet(BaseAPIMixin, ModelViewSet):
    """
    Student CRUD plus enroll/unenroll actions.
    Views are thin: all business logic lives in services/serializers.
    """

    filter_backends = [filters.SearchFilter]
    search_fields = [
        "first_name",
        "family_name",
        "email",
        "phone",
        "gender",
    ]

    def get_queryset(self):
        # Prefetch the student's latest status and all custodians
        return Student.objects.filter(is_obsolete=False).prefetch_related(
            # Prefetch(
            #     "statuses",
            #     queryset=StudentStatus.objects.filter(
            #         status=EnrollmentStatus.ACTIVE
            #     ).order_by("-created_on"),
            #     to_attr="active_statuses",
            # ),
            "custodians",  # Prefetch all custodians for the StudentSerializer
        )

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return StudentCreateUpdateSerializer
        if self.action == "enroll":
            return StudentEnrollmentSerializer
        if self.action == "unenroll":
            return StudentUnenrollmentSerializer
        if self.action == "list":
            return StudentListSerializer
        return StudentSerializer

    def destroy(self, request, *args, **kwargs):
        return self.api_error_response(
            "Delete Not Allowed.", status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=["post"], url_path="enroll")
    def enroll(self, request, *args, **kwargs):
        student = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        enrollment = assign_student_to_course_class(
            student=student, **serializer.validated_data
        )
        response = EnrollmentResponseSerializer(enrollment)
        return self.api_success_response(response.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="unenroll")
    def unenroll(self, request, *args, **kwargs):
        student = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        enrollment = unassign_student_from_course_class(
            student=student, **serializer.validated_data
        )
        response = EnrollmentResponseSerializer(enrollment)
        return self.api_success_response(response.data)

    @action(detail=True, methods=["get"], url_path="enrollments")
    def enrollments(self, request, *args, **kwargs):
        """
        Returns all enrollments for this student.
        Includes course, class, term, and active instructors.
        """
        student = self.get_object()

        today = timezone.now().date()
        active_instructor_qs = CourseInstructor.objects.filter(
            Q(exit_date__isnull=True) | Q(exit_date__gt=today)
        ).select_related("instructor__user")

        queryset = (
            StudentStatus.objects.filter(student=student)
            .select_related(
                "course", "term", "course_class__course", "course_class__term"
            )
            .prefetch_related(
                Prefetch(
                    "course_class__assignments",
                    queryset=active_instructor_qs,
                    to_attr="active_assignments",
                )
            )
            .order_by("-created_on")
        )

        serializer = StudentStatusSerializer(queryset, many=True)
        return self.api_success_response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="custodians")
    def custodians(self, request, *args, **kwargs):
        """
        Returns all custodians linked to this student.
        """
        student = self.get_object()
        custodians = Custodian.objects.filter(student=student, is_obsolete=False)
        serializer = CustodianSerializer(custodians, many=True)
        return self.api_success_response(serializer.data)


class CustodianViewSet(BaseAPIMixin, ModelViewSet):
    def get_queryset(self):
        return Custodian.objects.filter(is_obsolete=False).select_related("student")

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return CustodianCreateUpdateSerializer
        return CustodianSerializer
