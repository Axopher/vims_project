from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.utils.translation import gettext_lazy as _

from helpers.models import BaseModel
from helpers.roles import get_role_choices
from helpers.constants import Role as ROLE, TENANT_SCHEMA_EMPLOYEE_ROLES_VALUES
from helpers.models import Gender


class UserManager(BaseUserManager):
    """
    A custom user manager for our hybrid user model. It provides
    methods for creating both tenant-specific users and global admins.
    """

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        """Creates a global admin (superuser) for the platform."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("role", "global_admin")

        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("Superuser must have is_superuser=True."))

        return self.create_user(email, password, **extra_fields)

    # def create_tenant_user(
    #     self, email, password=None, tenant=None, role=None, **extra_fields
    # ):
    #     """
    #     Creates a regular user associated with a specific tenant and role.
    #     This is for all institution-specific users like students, teachers, etc.
    #     """
    #     if not tenant:
    #         raise ValueError("Tenant users must be assigned to a tenant.")
    #     if not role:
    #         raise ValueError("Tenant users must have a role.")

    #     extra_fields.setdefault("is_global_admin", False)
    #     # extra_fields.setdefault("tenant", tenant)
    #     # extra_fields.setdefault("role", role)

    #     return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, BaseModel):
    """
    Custom user model supporting both global admins and tenant-specific users.
    """

    email = models.EmailField(unique=True)
    gender = models.CharField(max_length=6, choices=Gender.choices, default=Gender.MALE)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    role = models.CharField(
        max_length=30, choices=get_role_choices(), default="student"
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

    def is_global_admin(self):
        return self.role == ROLE.GLOBAL_ADMIN.value

    def is_tenant_admin(self):
        return self.role == ROLE.TENANT_ADMIN.value

    def is_director(self):
        return self.role == ROLE.DIRECTOR.value

    def is_accountant(self):
        return self.role == ROLE.ACCOUNTANT.value

    def is_instructor(self):
        return self.role == ROLE.INSTRUCTOR.value

    def is_student(self):
        return self.role == ROLE.STUDENT.value

    def is_employee(self):
        return self.role in TENANT_SCHEMA_EMPLOYEE_ROLES_VALUES
