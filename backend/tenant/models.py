from django.db import models
from django_tenants.models import TenantMixin, DomainMixin
from helpers.models import BaseModel


class Client(TenantMixin, BaseModel):
    """
    Records each institute as a tenant. Persists in public schema.
    """

    name = models.CharField(max_length=255, unique=True)
    short_name = models.CharField(max_length=15, unique=True)
    is_active = models.BooleanField(default=True)
    
    # Subscription fields
    paid_until = models.DateField(null=True, blank=True)
    on_trial = models.BooleanField(default=False)

    auto_create_schema = True

    def __str__(self):
        return self.name


class Domain(DomainMixin, BaseModel):
    pass
