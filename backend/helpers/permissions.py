from rest_framework.permissions import BasePermission, SAFE_METHODS


# For now we are working this way but this is not what I like to do for permissions instead we will
# more robust one for future when this project go super huge.


class ReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS


class IsTenantAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_tenant_admin()


class IsDirector(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_director()


class IsAccountant(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_accountant()


class IsInstructor(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_instructor()


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_student()


class IsEmployee(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_employee()


class HasAnyRole(BasePermission):
    """
    Allows access only to users with one of the specified roles.
    """

    def __init__(self, roles):
        self.roles = roles

    def has_permission(self, request, view):
        user_role = getattr(request.user, "role", None)
        return user_role in self.roles


class OrPermission(BasePermission):
    """
    A generic permission class that allows access if the user
    satisfies at least one of the provided permission classes.
    """

    def __init__(self, *permissions):
        self.permissions = permissions

    def __call__(self):
        # This is needed for DRF's internal permission instantiation.
        return self

    def has_permission(self, request, view):
        for permission_class in self.permissions:
            # Instantiate the permission class with no arguments
            has_permission_check = permission_class()
            if has_permission_check.has_permission(request, view):
                return True
        return False


class CoursePermission(BasePermission):
    """
    - Allow anyone authenticated to read (GET, HEAD, OPTIONS).
    - Allow only tenant_admin and director to write (POST, PUT, PATCH, DELETE).
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated

        return (
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_tenant_admin()
                or request.user.is_director()
                or request.user.is_instructor()
            )
        )
