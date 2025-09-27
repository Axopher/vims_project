from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django_tenants.utils import get_public_schema_name
from django.db import connection
from .models import User
from helpers.constants import (
    TENANT_SCHEMA_ROLES_VALUES,
    TENANT_SCHEMA_ROLES,
    Role as ROLE,
)


class TenantTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Disallow auth on public schema
        if connection.schema_name == get_public_schema_name():
            raise serializers.ValidationError(
                "Tenant authentication must be done on a tenant subdomain."
            )

        data = super().validate(attrs)

        # Optional: deny login for roles not allowed to authenticate
        if self.user.role.lower() not in TENANT_SCHEMA_ROLES_VALUES:
            raise serializers.ValidationError(
                "User role not permitted to authenticate on this tenant."
            )

        # data.update(
        #     {
        #         "user": {
        #             "idx": self.user.idx,
        #             "email": self.user.email,
        #             "role": self.user.role,
        #         }
        #     }
        # )
        return data


class CreateTenantUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=TENANT_SCHEMA_ROLES)

    class Meta:
        model = User
        fields = ("idx", "email", "password", "gender", "role", "is_active")

    def create(self, validated_data):
        pwd = validated_data.pop("password")
        user = User.objects.create(**validated_data)
        user.set_password(pwd)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["idx", "email", "gender", "role"]
