# enrollment/services.py
from django.db import transaction
from student.models import StudentStatus

def create_enrollment(student, course_class, status, comment=""):
    with transaction.atomic():
        ss = StudentStatus(student=student, course_class=course_class, course=course_class.course, term=course_class.term, status=status, comment=comment)
        ss.save()
        return ss

def update_enrollment(enrollment, course_class=None, status=None, comment=None):
    with transaction.atomic():
        if course_class:
            enrollment.course_class = course_class
            enrollment.course = course_class.course
            enrollment.term = course_class.term
        if status:
            enrollment.status = status
        if comment is not None:
            enrollment.comment = comment
        enrollment.save()
        return enrollment

def close_enrollment(enrollment, comment=None):
    with transaction.atomic():
        enrollment.status = "CLOSED"
        if comment is not None:
            enrollment.comment = comment
        enrollment.save()
        return enrollment
