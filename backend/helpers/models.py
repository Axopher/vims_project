from django.db import models
from helpers.fields import IDXField


class BaseModel(models.Model):
    """
    An abstract base class for all models to inherit from.
    It provides a public IDX and common timestamps.
    """

    idx = IDXField()
    created_on = models.DateTimeField(auto_now_add=True, db_index=True)
    modified_on = models.DateTimeField(auto_now=True, db_index=True)
    is_obsolete = models.BooleanField(default=False)
    meta = models.JSONField(default=dict, blank=True)

    class Meta:
        abstract = True
        ordering = ["-created_on"]


class Gender(models.TextChoices):
    MALE = "male", "Male"
    FEMALE = "female", "Female"
    OTHERS = "others", "Others"