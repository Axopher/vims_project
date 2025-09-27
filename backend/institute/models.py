# vims/project/backend/institute/models.py
from django.db import models
from django.core.exceptions import ValidationError
from helpers.models import BaseModel
from django_tenants.utils import connection
import os
import datetime

from helpers.storage import CustomImageField
from helpers.upload_path import institute_logo_upload_path


class Institute(BaseModel):
    """
    A tenant-specific model to store detailed information about the institute.
    This model resides in each tenant's isolated schema.
    """

    institution_name = models.CharField(max_length=255)
    shortname = models.CharField(max_length=50)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    # Use your custom field and set private=False for a public logo
    logo = CustomImageField(
        upload_to=institute_logo_upload_path, blank=True, null=True, private=False
    )
    post_office_box = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    county = models.CharField(max_length=100, blank=True)
    sub_county = models.CharField(max_length=100, blank=True)
    parish = models.CharField(max_length=100, blank=True)
    cell_village = models.CharField(max_length=100, blank=True)
    registration_number = models.CharField(max_length=100, blank=True)
    inst_nssf_nr = models.CharField(max_length=100, blank=True)
    inst_paye_number = models.CharField(max_length=100, blank=True)
    tax_flag = models.BooleanField(default=False)
    comments = models.TextField(blank=True)

    # Business year fields as requested. We use a DateField for simplicity.
    business_year_start_date = models.DateField(default="1900-01-01")
    business_year_end_date = models.DateField(blank=True, null=True)
    last_year_closure_date = models.DateField(default="1900-01-01")

    def __str__(self):
        return self.institution_name

    class Meta:
        verbose_name = "Institute Profile"
        verbose_name_plural = "Institute Profiles"

    def save(self, *args, **kwargs):
        if not self.pk and Institute.objects.exists():
            raise ValidationError(
                "There can be only one Institute instance per tenant."
            )
        return super().save(*args, **kwargs)
