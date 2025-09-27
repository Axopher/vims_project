# vims_project/backend/user/views.py
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from user.serializers import TenantTokenObtainPairSerializer, CreateTenantUserSerializer
from helpers.permissions import IsDirector, IsTenantAdmin, OrPermission
from django.utils.http import urlsafe_base64_decode
from user.tokens import invite_token_generator
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from .ui_permissions import UI_ROLE_PERMISSIONS


class TenantTokenObtainPairView(TokenObtainPairView):
    serializer_class = TenantTokenObtainPairSerializer


class TenantTokenRefreshView(TokenRefreshView):
    pass


class TenantCreateUserView(generics.CreateAPIView):
    """
    Director can create tenant-local users without going through the standard process by directly supplying password.
    """

    serializer_class = CreateTenantUserSerializer
    # permission_classes = [OrPermission(IsDirector, IsTenantAdmin)] # Danger: May not want to give this type of permission to the employees
    permission_classes = [IsDirector]


class ActivateUserView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, uidb64, token, *args, **kwargs):
        password = request.data.get("password")

        if not (uidb64 and token and password):
            return Response(
                {"detail": "uid, token, and password are required."}, status=400
            )

        try:
            validate_password(password)
        except ValidationError as e:
            return Response({"detail": e.messages}, status=400)

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = get_user_model().objects.get(idx=uid)
        except Exception:
            return Response({"detail": "Invalid activation link."}, status=400)

        if not invite_token_generator.check_token(user, token):
            return Response({"detail": "Token invalid or expired."}, status=400)

        user.set_password(password)
        user.is_active = True
        user.save(update_fields=["password", "is_active"])
        return Response({"detail": "Account activated."}, status=200)


class MyAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = (user.role or "").lower()
        return Response(
            {
                "idx": user.idx,
                "email": user.email,
                "role": user.role,
                "gender": user.gender,
                "ui_permissions": UI_ROLE_PERMISSIONS.get(role, []),
                # optional: tenant info, theme, etc.
            }
        )
