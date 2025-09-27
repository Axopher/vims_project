from django.contrib import admin
from django.core.exceptions import PermissionDenied
from django import forms
from .models import Institute

# Custom form for the InstituteAdmin to display the logo preview.
class InstituteAdminForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Check if an instance and a logo exist before trying to generate the URL.
        if self.instance and self.instance.logo:
            self.fields['logo'].help_text = f'Current logo: <img src="{self.instance.logo.url}" style="max-height: 100px; max-width: 100px;">'

    class Meta:
        model = Institute
        fields = '__all__'

@admin.register(Institute)
class InstituteAdmin(admin.ModelAdmin):
    """
    Admin interface for the Institute model.
    This allows a director to manage their school's details and logo.
    """
    list_display = ('institution_name', 'shortname', 'email')
    search_fields = ('institution_name', 'email')
    
    # Use the corrected custom form
    form = InstituteAdminForm

    def has_add_permission(self, request):
        # Prevent directors from creating a new Institute object.
        # There should only be one per tenant.
        return False

    def has_change_permission(self, request, obj=None):
        # Only allow a director or tenant admin to change this object.
        # This check is essential for a secure tenant admin panel.
        return request.user.is_authenticated and request.user.role in ['director', 'tenant_admin']

    def has_delete_permission(self, request, obj=None):
        # Prevent directors from deleting the Institute object.
        return False

    def has_view_permission(self, request, obj=None):
        # Allow any staff member to view the Institute details.
        return request.user.is_staff

