# course/views.py
from django.utils import timezone
from django.db.models import Prefetch, Q, Count
from django.shortcuts import get_object_or_404

from rest_framework import generics, viewsets, status, filters
from rest_framework.decorators import action


from course.models import Term, Course, CourseClass, CourseInstructor
from employee.models import Employee

from student.models import StudentStatus, EnrollmentStatus

from course.serializers import (
    TermSerializer,
    TermCreateUpdateSerializer,
    InstructorSerializer,
    CourseSerializer,
    CourseClassCreateUpdateSerializer,
    CourseCreateUpdateSerializer,
    CourseClassSerializer,
    CourseInstructorSerializer,
    CourseInstructorAssignSerializer,
    CourseInstructorUnassignSerializer,
    EnrolledStudentSerializer,
)

from helpers.api import BaseAPIMixin
from helpers.permissions import CoursePermission
from helpers.constants import Role as ROLE
from helpers.utils import soft_delete_instance

from .services import (
    create_term,
    update_term,
    create_course_class,
    update_course_class,
    assign_instructor_to_class,
    unassign_instructor_from_class,
)


class BaseModelViewSet(BaseAPIMixin, viewsets.ModelViewSet):
    """
    A base viewset that includes our custom API responses and soft delete.
    """

    permission_classes = [CoursePermission]

    def destroy(self, request, *args, **kwargs):
        return self.api_error_response(
            "Delete Not Allowed.", status=status.HTTP_400_BAD_REQUEST
        )

    # instance = self.get_object()
    # soft_delete_instance(instance)
    # return self.api_success_response(
    #     "Deleted successfully.", status=status.HTTP_204_NO_CONTENT
    # )


class TermViewSet(BaseModelViewSet):
    """
    Manages Terms (List, Create, Retrieve, Update, Delete).
    """

    queryset = Term.objects.filter(is_obsolete=False)
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return TermCreateUpdateSerializer
        return TermSerializer

    def perform_create(self, serializer):
        # Override to use our service layer
        instance = create_term(**serializer.validated_data)
        serializer.instance = instance  # Associate instance for response

    def perform_update(self, serializer):
        # Override to use our service layer
        update_term(
            serializer.instance,
            is_partial=self.action == "partial_update",
            **serializer.validated_data
        )


class CourseViewSet(BaseModelViewSet):
    """
    Manages Courses.
    """

    queryset = Course.objects.filter(is_obsolete=False)
    filter_backends = [filters.SearchFilter]
    search_fields = ["code", "name", "description"]

    def retrieve(self, request, *args, **kwargs):
        """
        Return a single course with aggregated counts.
        Counts are only calculated for the detail endpoint.
        """
        lookup_field = self.lookup_field
        lookup_value = kwargs.get(lookup_field)

        qs = self.filter_queryset(self.get_queryset())

        try:
            active_key = EnrollmentStatus.ACTIVE
            enquired_key = EnrollmentStatus.ENQUIRED
            enrollment_filter = Q(student_statuses__status=active_key) | Q(
                student_statuses__status=enquired_key
            )
        except Exception:
            enrollment_filter = Q(student_statuses__status__in=["active", "enquired"])

        qs = qs.filter(**{lookup_field: lookup_value}).annotate(
            classes_count=Count(
                "classes", filter=Q(classes__is_obsolete=False), distinct=True
            ),
            terms_count=Count("classes__term", distinct=True),
            enrolled_count=Count("student_statuses", filter=enrollment_filter),
        )

        instance = get_object_or_404(qs)
        serializer = self.get_serializer(instance)
        return self.api_success_response(serializer.data)

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return CourseCreateUpdateSerializer
        return CourseSerializer


class CourseClassViewSet(BaseModelViewSet):
    """
    Manages Course Classes and their instructor assignments.
    """

    filter_backends = [filters.SearchFilter]
    search_fields = ["code", "course__code", "course__name", "term__name"]

    def get_queryset(self):
        # treating exit_date==NULL or exit_date >= today as active
        today = timezone.now().date()
        active = Q(exit_date__isnull=True) | Q(exit_date__gt=today)
        queryset = (
            CourseClass.objects.filter(is_obsolete=False)
            .select_related("course", "term")
            .prefetch_related(
                Prefetch(
                    "assignments",
                    queryset=CourseInstructor.objects.filter(active).select_related(
                        "instructor__user", "instructor"
                    ),
                    to_attr="active_assignments",
                )
            )
        )

        return queryset

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return CourseClassCreateUpdateSerializer
        if self.action == "assign_instructor":
            return CourseInstructorAssignSerializer
        if self.action == "unassign_instructor":
            return CourseInstructorUnassignSerializer
        return CourseClassSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = create_course_class(**serializer.validated_data)
        response_serializer = CourseClassSerializer(instance)
        return self.api_success_response(
            response_serializer.data, status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        course_class = self.get_object()
        partial = kwargs.pop("partial", False)
        serializer = self.get_serializer(
            course_class, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        instance = update_course_class(
            course_class=course_class, **serializer.validated_data
        )
        response_serializer = CourseClassSerializer(instance)
        return self.api_success_response(response_serializer.data)

    @action(detail=True, methods=["post"], url_path="assign-instructor")
    def assign_instructor(self, request, *args, **kwargs):
        course_class = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = assign_instructor_to_class(
            course_class=course_class, **serializer.validated_data
        )
        response_serializer = CourseInstructorSerializer(instance)
        return self.api_success_response(response_serializer.data)

    @action(detail=True, methods=["post"], url_path="unassign-instructor")
    def unassign_instructor(self, request, *args, **kwargs):
        course_class = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = unassign_instructor_from_class(
            course_class=course_class, **serializer.validated_data
        )
        response_serializer = CourseInstructorSerializer(instance)
        return self.api_success_response(response_serializer.data)

    @action(detail=True, methods=["get"], url_path="enrolled-students")
    def enrolled_students(self, request, *args, **kwargs):
        course_class = self.get_object()
        enrollments = StudentStatus.objects.filter(
            course_class=course_class
        ).select_related("student")
        serializer = EnrolledStudentSerializer(enrollments, many=True)
        return self.api_success_response(serializer.data, status=status.HTTP_200_OK)


class InstructorListAPIView(BaseAPIMixin, generics.ListAPIView):
    permission_classes = [CoursePermission]
    serializer_class = InstructorSerializer
    queryset = Employee.objects.select_related("user").filter(
        is_obsolete=False, user__role=ROLE.INSTRUCTOR.value, user__is_active=True
    )
