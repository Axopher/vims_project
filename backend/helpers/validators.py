# src/helpers/validators.py
from employee.models import Employee
from helpers.constants import Role as ROLE


def validate_instructor_employee_idx(idx):
    try:
        emp = Employee.objects.select_related("user").get(idx=idx)
    except Employee.DoesNotExist:
        raise ValueError("Instructor not found.")

    if emp.user.role != ROLE.INSTRUCTOR.value:
        raise ValueError("Employee is not a valid instructor.")
    return emp
