# employee/models.py
import os
from django.db import models
import datetime
from django.db import connection
from helpers.models import BaseModel
from user.models import User
from django.core.exceptions import ValidationError
from helpers.constants import TENANT_SCHEMA_EMPLOYEE_ROLES_VALUES
from helpers.storage import CustomImageField
from helpers.upload_path import employee_photo_upload_path


class Employee(BaseModel):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="employee_profile"
    )
    code = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=150)
    family_name = models.CharField(max_length=150)
    photo = CustomImageField(
        upload_to=employee_photo_upload_path, blank=True, null=True, private=True
    )

    def full_name(self):
        return f"{self.first_name} {self.family_name}"

    def save(self, *args, **kwargs):
        # Check if the associated User's role is in the allowed employee roles.
        if self.user.role not in TENANT_SCHEMA_EMPLOYEE_ROLES_VALUES:
            raise ValidationError(
                f"Cannot create an Employee profile for a user with the '{self.user.role}' role."
            )
        super().save(*args, **kwargs)


class EmployeeFamily(BaseModel):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="family"
    )
    name = models.CharField(max_length=255)
    relation = models.CharField(max_length=64)


class CareerStep(BaseModel):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="career"
    )
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    function = models.CharField(max_length=100)  # “Instructor”, “HR”, etc
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    competence_area = models.TextField(blank=True)

    def clean(self):
        if self.end_date and self.start_date >= self.end_date:
            raise ValidationError("End date must be later than start date.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ["-start_date"]
