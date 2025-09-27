from django_tenants.utils import get_public_schema_name
from django.db import connection
from helpers.constants import PUBLIC_SCHEMA_ROLES, TENANT_SCHEMA_ROLES


def get_role_choices():
    """Returns a list of role choices based on the current schema."""
    if connection.schema_name == get_public_schema_name():
        return PUBLIC_SCHEMA_ROLES
    else:
        return TENANT_SCHEMA_ROLES
