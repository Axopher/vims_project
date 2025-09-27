# student/models.py
import datetime
import os

from django.db import models
from django.db.models import Q, UniqueConstraint
from django_tenants.utils import connection

from helpers.models import BaseModel
from .choices import EnrollmentStatus
from helpers.storage import CustomImageField
from helpers.upload_path import student_photo_upload_path
from helpers.models import Gender


class Student(BaseModel):
    family_name = models.CharField(
        max_length=150,
        verbose_name="Family Name",
        help_text="The student's last name or family name.",
    )
    first_name = models.CharField(
        max_length=150, verbose_name="First Name", help_text="The student's first name."
    )
    dob = models.DateField(
        verbose_name="Date of Birth", help_text="The student's date of birth."
    )
    photo = CustomImageField(
        upload_to=student_photo_upload_path,
        blank=True,
        null=True,
        help_text="An optional profile photo for the student.",
        private=True,
    )
    email = models.EmailField(unique=True)
    phone = models.CharField(
        max_length=64,
        blank=True,
        verbose_name="Phone Number",
        help_text="The student's phone number.",
    )
    gender = models.CharField(max_length=6, choices=Gender.choices, default=Gender.MALE)

    class Meta:
        verbose_name = "Student"
        verbose_name_plural = "Students"
        ordering = ["family_name", "first_name"]
        unique_together = ["family_name", "first_name", "dob"]

    @property
    def full_name(self):
        return f"{self.first_name} {self.family_name}"

    def __str__(self):
        return self.full_name


class Custodian(BaseModel):
    """Represents a custodian (e.g., parent or guardian) associated with a student."""

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="custodians",
        help_text="The student this custodian is associated with.",
    )
    name = models.CharField(max_length=255, help_text="The custodian's full name.")
    relation = models.CharField(
        max_length=64,
        help_text="The custodian's relationship to the student (e.g., Father, Mother).",
    )
    phone = models.CharField(
        max_length=64, blank=True, help_text="The custodian's phone number."
    )
    email = models.EmailField(blank=True, help_text="The custodian's email address.")

    class Meta:
        verbose_name = "Custodian"
        verbose_name_plural = "Custodians"
        ordering = ["student__family_name", "name"]
        # Ensures no duplicate custodians for the same student
        unique_together = ["student", "name", "relation"]

    def __str__(self):
        return f"{self.name} ({self.relation})"


class StudentStatus(BaseModel):
    """Tracks the enrollment status of a student in a course class."""

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="statuses",
        help_text="The student this status entry belongs to.",
    )
    course_class = models.ForeignKey(
        "course.CourseClass",
        on_delete=models.CASCADE,
        related_name="enrollments",
        blank=True,
        null=True,
        help_text="The specific class the student is enrolled in, if applicable.",
    )
    course = models.ForeignKey(
        "course.Course",
        on_delete=models.CASCADE,
        related_name="student_statuses",
        blank=True,
        null=True,
        help_text="The course the student is associated with.",
    )
    status = models.CharField(
        max_length=20,
        choices=EnrollmentStatus.choices,
        default=EnrollmentStatus.ENQUIRED,
        help_text="The current status of the student (e.g., Enquired, Active, Closed).",
    )
    term = models.ForeignKey(
        "course.Term",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        help_text="The academic term for this status entry.",
    )
    comment = models.TextField(
        blank=True, help_text="Additional comments or notes about the student's status."
    )

    class Meta:
        verbose_name = "Student Status"
        verbose_name_plural = "Student Statuses"
        # Database index for performance on common queries
        indexes = [
            models.Index(fields=["student", "status"]),
        ]
        # Enforces one active status per student per course_class
        constraints = [
            UniqueConstraint(
                fields=["student", "course_class", "status"],
                condition=Q(status=EnrollmentStatus.ACTIVE),
                name="unique_active_enrollment_per_class",
            ),
            UniqueConstraint(
                fields=["student", "course_class"],
                condition=Q(status=EnrollmentStatus.ENQUIRED),
                name="unique_enquired_enrollment_per_class",
            ),
        ]
        ordering = ["-created_on"]

    def __str__(self):
        return f"{self.student} — {self.get_status_display()} — {self.course_class or self.course}"
