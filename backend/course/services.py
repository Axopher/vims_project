# course/services.py
import datetime
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.db.models import Q

from course.models import Term, Course, CourseClass, CourseInstructor
from employee.models import Employee

from helpers.constants import Role as ROLE
from helpers.exceptions import VimsException


def create_term(*, name: str, start_date: str, end_date: str) -> Term:
    """
    Service to create a new Term.
    """
    try:
        term = Term.objects.create(name=name, start_date=start_date, end_date=end_date)
    except IntegrityError:  # Catches unique constraint violation on 'name'
        raise VimsException("A term with this name already exists.")
    return term


def update_term(term: Term, is_partial: bool, **data) -> Term:
    """
    Service to update an existing Term.
    """
    fields_to_update = ["name", "start_date", "end_date"]

    for field in fields_to_update:
        if field in data:
            setattr(term, field, data[field])

    try:
        term.full_clean()  # Run model-level validation
        term.save()
    except IntegrityError:
        raise VimsException("A term with this name already exists.")

    return term


def create_course_class(*, course_idx: str, term_idx: str, code: str) -> CourseClass:
    """
    Service to create a new CourseClass.
    """
    course = Course.objects.get(idx=course_idx)
    term = Term.objects.get(idx=term_idx)

    try:
        instance = CourseClass.objects.create(course=course, term=term, code=code)
    except IntegrityError:
        raise VimsException("This course class code is already in use for this course.")

    return instance


def update_course_class(course_class: CourseClass, **data) -> CourseClass:
    """
    Service to update a CourseClass.
    """
    course_idx = data.get("course_idx")
    term_idx = data.get("term_idx")

    if course_idx:
        course_class.course = Course.objects.get(idx=course_idx)
    if term_idx:
        course_class.term = Term.objects.get(idx=term_idx)
    if "code" in data:
        course_class.code = data["code"]

    try:
        course_class.save()
    except IntegrityError:
        raise VimsException("This course class code is already in use for this course.")

    return course_class


def assign_instructor_to_class(
    *, course_class: CourseClass, instructor_idx: str, assigned_on: str = None
) -> CourseInstructor:
    """
    Assigns an instructor to a course class.
    Prevents re-assigning an already active instructor.
    """
    # also check this role=ROLE.INSTRUCTOR.value in future
    instructor = get_object_or_404(Employee, idx=instructor_idx, is_obsolete=False)
    assigned_on = assigned_on or datetime.date.today()

    # Active	exit_date is NULL OR exit_date is after today.
    # Inactive	exit_date is NULL is false AND exit_date is today OR earlier.
    is_active_condition = Q(exit_date__isnull=True) | Q(
        exit_date__gt=datetime.date.today()
    )
    if CourseInstructor.objects.filter(
        Q(course_class=course_class) & Q(instructor=instructor) & is_active_condition
    ).exists():
        raise VimsException(
            "This instructor is already actively assigned to this class."
        )
    try:

        assignment = CourseInstructor.objects.create(
            course_class=course_class,
            instructor=instructor,
            assigned_on=assigned_on,
        )

    except IntegrityError:
        # This is a fallback if multiple active records somehow exist or another constraint fails
        raise VimsException(
            "This instructor is already actively assigned to this class."
        )

    return assignment


def unassign_instructor_from_class(
    *, course_class: CourseClass, instructor_idx: str
) -> CourseInstructor:
    """
    Unassigns an instructor by setting their exit_date on the active assignment.
    """
    instructor = get_object_or_404(Employee, idx=instructor_idx, is_obsolete=False)
    is_active_condition = Q(exit_date__isnull=True) | Q(
        exit_date__gte=datetime.date.today()
    )

    try:
        assignment = CourseInstructor.objects.get(
            Q(course_class=course_class)
            & Q(instructor=instructor)
            & is_active_condition
        )
    except CourseInstructor.DoesNotExist:
        raise VimsException(
            "This instructor does not have an active assignment in this class."
        )

    assignment.exit_date = datetime.date.today()
    assignment.save()
    return assignment
