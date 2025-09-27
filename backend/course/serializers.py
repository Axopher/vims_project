# course/serializers.py
from django.utils import timezone
from django.db.models import Q
from rest_framework import serializers
from .models import Term, Course, CourseClass, CourseInstructor
from employee.models import Employee
from helpers.serializers import BaseModelSerializer
from student.models import StudentStatus


class InstructorSerializer(BaseModelSerializer):
    """
    Serializer for listing instructors in dropdowns.
    Assumes Employee has 'idx' and a method 'full_name'.
    """

    name = serializers.CharField(source="full_name")

    class Meta:
        model = Employee
        fields = ["idx", "name"]


class TermSerializer(BaseModelSerializer):
    """
    Handles serialization for Term model for GET requests.
    """

    class Meta:
        model = Term
        fields = ["idx", "name", "start_date", "end_date"]
        read_only_fields = fields


class TermCreateUpdateSerializer(BaseModelSerializer):
    """
    Handles validation for creating and updating Terms (PUT/PATCH).
    """

    class Meta:
        model = Term
        fields = ["name", "start_date", "end_date"]

    def validate(self, data):
        """
        Check that the start_date is before the end_date.
        """
        # On PATCH, one date might be present without the other.
        # We fetch the instance's dates to ensure a complete comparison.
        start_date = data.get("start_date", getattr(self.instance, "start_date", None))
        end_date = data.get("end_date", getattr(self.instance, "end_date", None))

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError(
                {"end_date": "End date must be after start date."}
            )
        return data


class CourseSerializer(BaseModelSerializer):
    """
    Handles serialization for Course model for GET requests.
    Exposes classes_count/terms_count/enrolled_count when the instance
    has been annotated by the view (detail endpoint). Otherwise returns None.
    """

    classes_count = serializers.IntegerField(read_only=True, required=False)
    terms_count = serializers.IntegerField(read_only=True, required=False)
    enrolled_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Course
        fields = [
            "idx",
            "name",
            "code",
            "description",
            "created_on",
            "classes_count",
            "terms_count",
            "enrolled_count",
        ]
        read_only_fields = fields

    def to_representation(self, instance):
        """
        Remove count fields if not present (e.g. in list endpoint).
        """
        rep = super().to_representation(instance)

        # Drop counts only if they weren’t annotated on the queryset
        if not hasattr(instance, "classes_count"):
            rep.pop("classes_count", None)
        if not hasattr(instance, "terms_count"):
            rep.pop("terms_count", None)
        if not hasattr(instance, "enrolled_count"):
            rep.pop("enrolled_count", None)

        return rep


class CourseCreateUpdateSerializer(BaseModelSerializer):
    """
    Handles validation for creating and updating Courses (PUT/PATCH).
    """

    class Meta:
        model = Course
        fields = ["name", "code", "description"]


class CourseClassSerializer(BaseModelSerializer):
    """
    Handles serialization for CourseClass model for GET requests.
    Includes nested data for course and term.
    """

    course = CourseSerializer(read_only=True)
    term = TermSerializer(read_only=True)
    instructors = serializers.SerializerMethodField()

    class Meta:
        model = CourseClass
        fields = ["idx", "code", "course", "term", "instructors", "created_on"]
        read_only_fields = fields

    # Approach 1: If you use this serializer in an endpoint that lists 50 course classes,
    # the serializer will run active_instructors().select_related(...) 50 times, resulting
    # in 50 extra database queries (the N+1 query problem).
    # def get_instructors(self, obj):
    #     assignments = getattr(obj, "active_assignments", None)
    #     if not assignments:
    #         return []
    #     instructors = [a.instructor for a in assignments]
    #     return InstructorSerializer(instructors, many=True, context=self.context).data

    # Approach 2: It works only on a queryset that has been explicitly prefetched. In your enroll API,
    # the enrollment object is a brand-new, standalone model instance that has not been processed by
    # StudentViewSet.get_queryset(). Therefore, it does not have the active_assignments attribute attached
    # to it. When the serializer tries to access it, it finds None, and the get_instructors method returns an empty list.
    # def get_instructors(self, obj):
    #     # We access the prefetched data from the course class object.
    #     # The related name on the through model is 'assignments'.
    #     # We get the list of CourseInstructor objects
    #     # We get the list of active assignments from the model manager.
    #     active_assignments = obj.active_instructors().select_related("instructor__user")

    #     return InstructorSerializer(
    #         [assignment.instructor for assignment in active_assignments],
    #         many=True,
    #     ).data

    # By comparing both of the above I reached a hybrid conclusion:
    def get_instructors(self, obj):
        # First, try to use the prefetched data if it exists.
        # The attribute name here MUST match the `to_attr` in the Prefetch object.
        assignments = getattr(obj, "active_assignments", None)
        if assignments is None:
            # Fallback: If no prefetched data is found, perform a direct query.
            # This handles detail views and custom actions like 'enroll'.
            today = timezone.now().date()
            assignments = CourseInstructor.objects.filter(
                Q(exit_date__isnull=True) | Q(exit_date__gt=today), course_class=obj
            ).select_related("instructor__user")

        instructors = [assignment.instructor for assignment in assignments]
        return InstructorSerializer(instructors, many=True).data


class CourseClassCreateUpdateSerializer(serializers.Serializer):
    """
    Handles validation for creating and updating CourseClasses.
    We use a plain Serializer to accept 'idx' fields for relationships.
    """

    course_idx = serializers.CharField(max_length=20)
    term_idx = serializers.CharField(max_length=20)
    code = serializers.CharField(max_length=50)

    def validate_course_idx(self, value):
        if not Course.objects.filter(idx=value, is_obsolete=False).exists():
            raise serializers.ValidationError(
                "Course with the given idx does not exist."
            )
        return value

    def validate_term_idx(self, value):
        if not Term.objects.filter(idx=value, is_obsolete=False).exists():
            raise serializers.ValidationError("Term with the given idx does not exist.")
        return value


class CourseInstructorSerializer(BaseModelSerializer):
    """
    For displaying instructor assignment details.
    """

    instructor = InstructorSerializer()

    class Meta:
        model = CourseInstructor
        fields = ["idx", "instructor", "assigned_on", "exit_date"]


class CourseInstructorAssignSerializer(serializers.Serializer):
    """
    Validates the payload for assigning an instructor.
    """

    instructor_idx = serializers.CharField(max_length=20)
    assigned_on = serializers.DateField(required=False, allow_null=True)

    def validate_instructor_idx(self, value):
        if not Employee.objects.filter(idx=value, is_obsolete=False).exists():
            raise serializers.ValidationError(
                "Instructor with the given idx does not exist."
            )
        return value


class CourseInstructorUnassignSerializer(serializers.Serializer):
    """
    Validates the payload for unassigning an instructor.
    """

    instructor_idx = serializers.CharField(max_length=20)

    def validate_instructor_idx(self, value):
        if not Employee.objects.filter(idx=value, is_obsolete=False).exists():
            raise serializers.ValidationError(
                "Instructor with the given idx does not exist."
            )
        return value


class EnrolledStudentSerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()

    class Meta:
        model = StudentStatus
        fields = ["idx", "student", "status", "comment"]
        read_only_fields = fields

    def get_student(self, obj):
        from student.serializers import StudentSerializer

        return StudentSerializer(obj.student).data
