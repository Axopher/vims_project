# course/models.py
import datetime
from django.db import models
from helpers.models import BaseModel
from employee.models import Employee
from django.db.models import Q, UniqueConstraint


class Term(BaseModel):
    """
    Represents an academic term or semester.
    """

    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Term Name",
        help_text="A unique name for the academic term (e.g., 'Fall 2025').",
    )
    start_date = models.DateField(
        verbose_name="Start Date", help_text="The official start date of the term."
    )
    end_date = models.DateField(
        verbose_name="End Date", help_text="The official end date of the term."
    )

    class Meta:
        verbose_name = "Term"
        verbose_name_plural = "Terms"
        ordering = ["-start_date"]

    def __str__(self):
        return self.name


class Course(BaseModel):
    """
    Abstract definition of a course (e.g., MATH101).
    Concrete offerings live in CourseClass tied to a Term.
    """

    name = models.CharField(
        max_length=200,
        verbose_name="Course Name",
        help_text="The full name of the course.",
    )
    code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Course Code",
        help_text="The unique identifier for the course (e.g., 'MATH101').",
    )
    description = models.TextField(
        blank=True,
        verbose_name="Description",
        help_text="A brief description of the course content.",
    )

    class Meta:
        verbose_name = "Course"
        verbose_name_plural = "Courses"
        ordering = ["code", "name"]

    def __str__(self):
        return f"{self.code} — {self.name}"


class CourseClass(BaseModel):
    """
    Concrete offering/section of a Course in a Term.
    Students enroll into CourseClass instances.
    """

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="classes",
        verbose_name="Course",
        help_text="The abstract course this class is an instance of.",
    )
    term = models.ForeignKey(
        Term,
        on_delete=models.PROTECT,
        verbose_name="Term",
        help_text="The academic term this class is offered in.",
    )
    code = models.CharField(
        max_length=50,
        verbose_name="Class Code",
        help_text="A unique code for the class (e.g., 'MATH101-FALL2025-01').",
    )
    instructors = models.ManyToManyField(
        Employee,
        through="CourseInstructor",
        related_name="course_classes",
        verbose_name="Instructors",
        help_text="The instructors assigned to this class.",
    )

    class Meta:
        verbose_name = "Course Class"
        verbose_name_plural = "Course Classes"
        # Enforces that a unique class code must be associated with a course and a term.
        constraints = [
            UniqueConstraint(
                fields=["course", "term", "code"],
                name="unique_class_code_per_term_and_course",
            )
        ]
        ordering = ["-created_on"]

    def __str__(self):
        return f"{self.code} ({self.course.code})"

    def active_instructors(self):
        """
        Convenience query for active CourseInstructor instances (not expired).
        Use .select_related('instructor__user') where appropriate to avoid N+1.
        For eg:- course_class.active_instructors().select_related('instructor__user')
        """
        return self.assignments.filter(
            Q(exit_date__isnull=True) | Q(exit_date__gte=datetime.date.today())
        )


class CourseInstructor(BaseModel):
    """
    Assignment of an Employee to a CourseClass with start/end dates.
    This acts as a through model for the many-to-many relationship.
    """

    course_class = models.ForeignKey(
        CourseClass,
        on_delete=models.CASCADE,
        related_name="assignments",
        verbose_name="Course Class",
        help_text="The course class assignment.",
    )
    instructor = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="assignments",
        verbose_name="Instructor",
        help_text="The employee assigned as an instructor.",
    )
    assigned_on = models.DateField(
        null=True,
        blank=True,
        verbose_name="Assigned On",
        help_text="The date the instructor was officially assigned.",
    )
    exit_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Exit Date",
        help_text="The date the instructor's assignment ended.",
    )

    class Meta:
        verbose_name = "Course Instructor"
        verbose_name_plural = "Course Instructors"
        ordering = ["-assigned_on", "-created_on"]
        constraints = [
            # Enforces that an instructor can only have one active assignment per class.
            UniqueConstraint(
                fields=["course_class", "instructor"],
                condition=Q(exit_date__isnull=True),
                name="unique_active_assignment_per_instructor_per_class",
            )
        ]

    def __str__(self):
        return f"{self.instructor} -> {self.course_class}"
