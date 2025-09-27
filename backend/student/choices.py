from django.db import models


class EnrollmentStatus(models.TextChoices):
    ENQUIRED = "enquired", "Enquired"
    ACTIVE = "active", "Active"
    CLOSED = "closed", "Closed"
