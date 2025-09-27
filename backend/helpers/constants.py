from enum import Enum, unique


@unique
class Role(Enum):
    """
    Defines the roles available in the system.
    The values correspond to the string stored in the database.
    """

    # Public schema roles
    GLOBAL_ADMIN = "global_admin"

    # Tenant schema roles
    TENANT_ADMIN = "tenant_admin"
    DIRECTOR = "director"
    ACCOUNTANT = "accountant"
    INSTRUCTOR = "instructor"

    @classmethod
    def values(cls):
        """Returns a list of all role values."""
        return [role.value for role in cls]


# Define role choices and sets using the Enum
PUBLIC_SCHEMA_ROLES = [(Role.GLOBAL_ADMIN.value, "GlobalAdmin")]

TENANT_SCHEMA_ROLES = [
    (Role.TENANT_ADMIN.value, "TenantAdmin"),
    (Role.DIRECTOR.value, "Director"),
    (Role.ACCOUNTANT.value, "Accountant"),
    (Role.INSTRUCTOR.value, "Instructor"),
]

TENANT_SCHEMA_EMPLOYEE_ROLES = [
    (Role.TENANT_ADMIN.value, "TenantAdmin"),
    (Role.ACCOUNTANT.value, "Accountant"),
    (Role.INSTRUCTOR.value, "Instructor"),
]

TENANT_SCHEMA_ROLES_VALUES = set(set(role[0] for role in TENANT_SCHEMA_ROLES))

TENANT_SCHEMA_EMPLOYEE_ROLES_VALUES = set(
    role[0] for role in TENANT_SCHEMA_EMPLOYEE_ROLES
)
