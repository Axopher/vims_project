# vims_project/backend/employee/serializers.py
from django.conf import settings
from django.db import transaction, IntegrityError
from django.db.models import Q
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import PasswordResetTokenGenerator

from employee.models import Employee, EmployeeFamily, CareerStep
from user.models import User
from user.serializers import UserSerializer
from user.mailers import send_employee_invite

from helpers.constants import (
    TENANT_SCHEMA_ROLES_VALUES,
    Role as ROLE,
)
from helpers.models import Gender

from user.tokens import invite_token_generator


class EmployeeSimpleSerializer(serializers.ModelSerializer):
    """
    A lightweight serializer exposing only minimal employee info.
    Useful when embedding employees (e.g. course instructor list).
    """

    email = serializers.EmailField(source="user.email", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)

    class Meta:
        model = Employee
        fields = ["idx", "first_name", "family_name", "photo", "email", "role"]


class EmployeeFamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeFamily
        fields = ["idx", "name", "relation"]
        read_only_fields = ["idx"]


class EmployeeCareerStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerStep
        fields = [
            "idx",
            "start_date",
            "end_date",
            "function",
            "salary",
            "competence_area",
        ]
        read_only_fields = ["idx"]

    def validate(self, attrs):
        """
        Validates start date is before end date and checks for career overlaps.
        """
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")

        # Find overlapping careers for this employee
        qs = CareerStep.objects.filter(
            employee=(
                self.instance.employee if self.instance else self.context["employee"]
            )
        )
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.filter(
            Q(end_date__isnull=True) | Q(end_date__gte=start_date),
            Q(start_date__lte=end_date or start_date),
        ).exists():
            raise serializers.ValidationError(
                "This career step overlaps with an existing one."
            )

        return attrs

    def validate_salary(self, value):
        if value < 0:
            raise serializers.ValidationError("Salary must be a positive number.")
        return value


class EmployeeSerializer(serializers.ModelSerializer):
    # Inputs used only at creation time
    email = serializers.EmailField(write_only=True)
    role = serializers.ChoiceField(choices=TENANT_SCHEMA_ROLES_VALUES, write_only=True)
    gender = serializers.ChoiceField(choices=Gender.choices, write_only=True)

    # Read-only nested data
    user = UserSerializer(read_only=True)
    family = EmployeeFamilySerializer(many=True, read_only=True)
    career = EmployeeCareerStepSerializer(many=True, read_only=True)

    # Add this field to read the is_active status from the user model
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)

    class Meta:
        model = Employee
        fields = [
            "idx",
            "code",
            "first_name",
            "family_name",
            "photo",
            "email",
            "role",
            "gender",
            "user",
            "family",
            "career",
            "is_active",
        ]
        read_only_fields = ["idx", "user", "family", "career"]

    def get_fields(self):
        fields = super().get_fields()
        view = self.context.get("view")
        if view and view.action != "create":
            fields.pop("email", None)
            fields.pop("role", None)
            fields.pop("gender", None)
        return fields

    def create(self, validated_data):
        email = validated_data.pop("email")
        role = validated_data.pop("role")
        gender = validated_data.pop("gender")

        # Guard the role (your Employee.save also validates—this is a friendlier error)
        # if role not in TENANT_SCHEMA_EMPLOYEE_ROLES_VALUES:
        #     raise serializers.ValidationError({"role": "Invalid role for an employee account."})

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                {"detail": "This email is already in use."}
            )
        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    email=email, role=role, is_active=False, gender=gender
                )
                user.set_unusable_password()
                user.save(update_fields=["password"])

                employee = Employee.objects.create(user=user, **validated_data)

                # Build activation link
                request = self.context.get("request")
                token = invite_token_generator.make_token(user)
                uidb64 = urlsafe_base64_encode(force_bytes(user.idx))
                scheme = request.scheme if request else "https"
                host = request.get_host() if request else "localhost"

                if "localhost" in host:
                    tenant_prefix = host.split(".")[0]
                    frontend_port = getattr(settings, "FRONTEND_PORT", 3000)
                    full_host = f"{tenant_prefix}.localhost:{frontend_port}"
                else:
                    # In production or staging, no port is needed.
                    full_host = host

                activation_url = (
                    f"{scheme}://{full_host}/activate?uid={uidb64}&token={token}"
                )

                # Fire the email (console backend locally) for now
                send_employee_invite(user, employee, activation_url)

                return employee

        except IntegrityError as e:
            if "duplicate key" in str(e).lower():
                return self._dup_key_error(e)
            raise serializers.ValidationError({"detail": "Integrity error."})

    def _dup_key_error(self, e):
        # You can refine per-field if you want
        raise serializers.ValidationError(
            {"code": "An employee with this code already exists."}
        )

    def update(self, instance, validated_data):
        # Only allow certain fields for updates through this serializer.
        # Admins (director/tenant_admin) may edit code; employees cannot.
        request = self.context.get("request")
        user = getattr(request, "user", None)

        allowed = {"first_name", "family_name", "photo"}
        if user and (user.is_director() or user.is_tenant_admin()):
            allowed |= {"code"}

        disallowed = set(validated_data.keys()) - allowed
        if disallowed:
            raise serializers.ValidationError(
                {"detail": f"You cannot change fields: {', '.join(sorted(disallowed))}"}
            )

        for f in allowed:
            if f in validated_data:
                setattr(instance, f, validated_data[f])

        instance.save()
        return instance


class EmployeeUpdateSerializer(serializers.ModelSerializer):
    """
    Use for PATCH/PUT; restrict fields by role in `validate` or `update`.
    """

    class Meta:
        model = Employee
        fields = ["code", "first_name", "family_name", "photo"]

    def validate(self, attrs):
        user = self.context["request"].user
        # If self-updating (not director/tenant_admin), restrict what can be changed
        if user.role not in [ROLE.DIRECTOR.value, ROLE.TENANT_ADMIN.value]:
            disallowed = {"code"} & set(attrs.keys())
            if disallowed:
                raise serializers.ValidationError(
                    {"code": "You cannot change this field."}
                )
        return attrs
