# enrollment/serializers.py
from rest_framework import serializers
from student.models import StudentStatus, Student
from course.models import CourseClass
from helpers.serializers import BaseModelSerializer


class EnrollmentSerializer(BaseModelSerializer):
    student = serializers.SerializerMethodField()
    course_class = serializers.SerializerMethodField()
    status = serializers.CharField(source="get_status_display")

    class Meta:
        model = StudentStatus
        fields = ["idx", "student", "course_class", "status", "comment", "created_on"]
        read_only_fields = fields

    def get_student(self, obj):
        from student.serializers import StudentListSerializer

        return StudentListSerializer(obj.student, context=self.context).data

    def get_course_class(self, obj):
        from course.serializers import CourseClassSerializer

        return CourseClassSerializer(obj.course_class, context=self.context).data


class EnrollmentCreateSerializer(serializers.Serializer):
    student_idx = serializers.CharField(max_length=20)
    course_class_idx = serializers.CharField(max_length=20)
    status = serializers.CharField(required=False)
    comment = serializers.CharField(required=False, allow_blank=True)

    def validate_student_idx(self, value):
        try:
            return Student.objects.get(idx=value, is_obsolete=False)
        except Student.DoesNotExist:
            raise serializers.ValidationError("Student not found")

    def validate_course_class_idx(self, value):
        try:
            return CourseClass.objects.get(idx=value, is_obsolete=False)
        except CourseClass.DoesNotExist:
            raise serializers.ValidationError("Course class not found")

    def validate_status(self, value):
        if value is None:
            return StudentStatus._meta.get_field("status").get_default()
        choices = {k for k, _ in StudentStatus._meta.get_field("status").choices}
        if value not in choices:
            raise serializers.ValidationError("Invalid status")
        return value

    def validate(self, attrs):
        attrs["student"] = attrs.pop("student_idx")
        attrs["course_class"] = attrs.pop("course_class_idx")
        status = attrs.get(
            "status", StudentStatus._meta.get_field("status").get_default()
        )
        if StudentStatus.objects.filter(
            student=attrs["student"], course_class=attrs["course_class"]
        ).exists():
            raise serializers.ValidationError(
                f"Student already has enrollment for this class"
            )
        return attrs


class EnrollmentUpdateSerializer(serializers.Serializer):
    course_class_idx = serializers.CharField(max_length=20, required=False)
    status = serializers.CharField(required=False)
    comment = serializers.CharField(required=False, allow_blank=True)

    def validate_course_class_idx(self, value):
        try:
            return CourseClass.objects.get(idx=value, is_obsolete=False)
        except CourseClass.DoesNotExist:
            raise serializers.ValidationError("Course class not found")

    def validate_status(self, value):
        value = value.strip().upper()
        choices = {k for k, _ in StudentStatus._meta.get_field("status").choices}
        if value not in choices:
            raise serializers.ValidationError("Invalid status")
        return value

    def validate(self, attrs):
        enrollment = self.instance
        attrs["course_class"] = attrs.pop("course_class_idx")
        status = attrs.get("status", enrollment.status)
        qs = StudentStatus.objects.filter(
            student=enrollment.student,
            course_class=attrs["course_class"],
            status=status,
        ).exclude(pk=enrollment.pk)
        if qs.exists():
            raise serializers.ValidationError(
                f"Duplicate {status.lower()} enrollment exists for this student & class"
            )
        return attrs
