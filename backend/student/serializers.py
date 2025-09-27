# student/serializers.py
from django.db import transaction
from rest_framework import serializers
from student.models import Student, Custodian, StudentStatus
from course.models import CourseClass
from course.serializers import CourseClassSerializer
from helpers.serializers import BaseModelSerializer


class CustodianSerializer(BaseModelSerializer):
    """Handles read-only serialization for Custodian model."""

    class Meta:
        model = Custodian
        fields = ["idx", "name", "relation", "phone", "email"]
        read_only_fields = fields


class CustodianCreateUpdateSerializer(BaseModelSerializer):
    """Handles validation for creating and updating Custodians."""

    student_idx = serializers.CharField(max_length=20, write_only=True)

    class Meta:
        model = Custodian
        fields = ["student_idx", "name", "relation", "phone", "email"]

    def validate_student_idx(self, value):
        try:
            student = Student.objects.get(idx=value, is_obsolete=False)
        except Student.DoesNotExist:
            raise serializers.ValidationError(
                "Student with the given idx does not exist."
            )
        return student

    def create(self, validated_data):
        """
        Manually handles the creation to map `student_idx` to `student`.
        """

        # The validate_student_idx method has already returned the
        # Student object, so we can now access it directly and
        # remove it from the validated_data dictionary.
        student = validated_data.pop("student_idx")
        validated_data["student"] = student
        instance = super().create(validated_data)
        return instance

    def update(self, instance, validated_data):
        """
        Prevent student reassignment during updates.
        """
        if "student_idx" in validated_data:
            validated_data.pop(
                "student_idx"
            )  # 👈 discard, don’t allow changing student

        return super().update(instance, validated_data)


class StudentListSerializer(BaseModelSerializer):
    """
    A lightweight serializer for the list view of Student models.
    """

    # current_status = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "idx",
            "family_name",
            "first_name",
            "dob",
            "photo",
            "email",
            "phone",
            "gender",
            # "current_status",
        ]
        read_only_fields = ["idx", "created_on"]

    # def get_current_status(self, obj):
    #     # Fetches the active status from the prefetched data
    #     statuses = getattr(obj, "active_statuses", None)
    #     if not statuses:
    #         return "N/A"
    #     return statuses[0].get_status_display()


class StudentSerializer(StudentListSerializer):
    """
    Handles serialization for the detail view of Student models.
    Inherits all fields from StudentListSerializer and adds custodians.
    """

    custodians = CustodianSerializer(many=True, read_only=True)

    class Meta(StudentListSerializer.Meta):
        fields = StudentListSerializer.Meta.fields + ["custodians"]
        read_only_fields = StudentListSerializer.Meta.read_only_fields + ["custodians"]


class StudentCreateUpdateSerializer(BaseModelSerializer):
    class Meta:
        model = Student
        fields = [
            "family_name",
            "first_name",
            "dob",
            "photo",
            "email",
            "phone",
            "gender",
        ]
        read_only_fields = ["idx", "created_on"]


class StudentStatusSerializer(BaseModelSerializer):
    course_class = CourseClassSerializer()
    status = serializers.CharField(source="get_status_display")

    class Meta:
        model = StudentStatus
        fields = ["idx", "course_class", "status", "comment"]
        read_only_fields = fields


class EnrollmentResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentStatus
        fields = ["idx", "status", "comment"]
        read_only_fields = fields


class StudentEnrollmentSerializer(serializers.Serializer):
    """Validates the payload for assigning a student to a course class."""

    course_class_idx = serializers.CharField(max_length=20)
    status = serializers.CharField(required=False)
    comment = serializers.CharField(required=False, allow_blank=True)

    def validate_course_class_idx(self, value):
        if not CourseClass.objects.filter(idx=value, is_obsolete=False).exists():
            raise serializers.ValidationError(
                "Course class with the given idx does not exist."
            )
        return value


class StudentUnenrollmentSerializer(serializers.Serializer):
    """Validates the payload for unassigning a student."""

    course_class_idx = serializers.CharField(max_length=20)

    def validate_course_class_idx(self, value):
        if not CourseClass.objects.filter(idx=value, is_obsolete=False).exists():
            raise serializers.ValidationError(
                "Course class with the given idx does not exist."
            )
        return value
