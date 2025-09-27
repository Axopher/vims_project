# student/services.py
from django.shortcuts import get_object_or_404

from .models import Student, StudentStatus
from course.models import CourseClass
from .choices import EnrollmentStatus
from helpers.exceptions import VimsException


def assign_student_to_course_class(
    *,
    student: Student,
    course_class_idx: str,
    status: str = EnrollmentStatus.ACTIVE,
    **kwargs,
) -> StudentStatus:
    """
    Assigns a student to a CourseClass or updates an existing enrollment.
    Enforces a rule of only one active/enquired enrollment per student/class.
    """
    course_class = get_object_or_404(
        CourseClass, idx=course_class_idx, is_obsolete=False
    )

    if status not in [EnrollmentStatus.ACTIVE, EnrollmentStatus.ENQUIRED]:
        raise VimsException("Status must be either ACTIVE or ENQUIRED.")

    # Use update_or_create to handle both scenarios in one database hit
    enrollment, created = StudentStatus.objects.update_or_create(
        student=student,
        course_class=course_class,
        defaults={
            "status": status,
            "course": course_class.course,
            "term": course_class.term,
            **kwargs,
        },
    )

    return enrollment


def unassign_student_from_course_class(
    *,
    student: Student,
    course_class_idx: str,
) -> StudentStatus:
    """
    Changes a student's status for a course class to CLOSED.
    """
    course_class = get_object_or_404(
        CourseClass, idx=course_class_idx, is_obsolete=False
    )

    try:
        enrollment = StudentStatus.objects.get(
            student=student,
            course_class=course_class,
            status=EnrollmentStatus.ACTIVE,
        )
    except StudentStatus.DoesNotExist:
        raise VimsException(
            "This student does not have an active enrollment in this class."
        )

    enrollment.status = EnrollmentStatus.CLOSED
    enrollment.save()

    return enrollment
