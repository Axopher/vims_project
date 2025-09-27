from django.contrib import admin
from django_tenants.admin import TenantAdminMixin
from django import forms

from tenant.models import Client, Domain
from django.core.exceptions import PermissionDenied, ValidationError
from user.models import User
from institute.models import Institute
from django_tenants.utils import schema_context
from django.db import transaction, IntegrityError
from django.core.validators import RegexValidator

from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from user.tokens import invite_token_generator  # your token generator
from django.conf import settings
from user.mailers import send_director_invite  # new mailer


# Custom form to collect minimal data for tenant creation, including a user-defined domain.
class ClientAdminForm(forms.ModelForm):
    """
    Custom form for ClientAdmin to handle pre-save validation
    and extra fields for initial tenant setup.
    """
    short_name = forms.CharField(
        max_length=50,
        required=True,
        help_text="Short, unique name for the institution.",
        validators=[
            RegexValidator(
                r"^[a-z0-9_-]+$",
                "The short name can only contain lowercase letters, numbers, hyphens, and underscores.",
            )
        ],
    )
    # The domain_url is a user-defined subdomain for access.
    domain_url = forms.CharField(
        max_length=255,
        required=True,
        help_text="The full subdomain for the new tenant (e.g., must.vims.com or must.localhost).",
    )
    director_email = forms.EmailField(required=True, label="Director's Email")
    logo = forms.ImageField(required=False, help_text="Upload the institute's logo.")

    # extra Institute fields
    phone = forms.CharField(required=False)
    post_office_box = forms.CharField(required=False)
    district = forms.CharField(required=False)
    county = forms.CharField(required=False)
    sub_county = forms.CharField(required=False)
    parish = forms.CharField(required=False)
    cell_village = forms.CharField(required=False)
    registration_number = forms.CharField(required=False)
    inst_nssf_nr = forms.CharField(required=False)
    inst_paye_number = forms.CharField(required=False)
    tax_flag = forms.BooleanField(required=False)
    comments = forms.CharField(widget=forms.Textarea, required=False)
    business_year_start_date = forms.DateField(required=False)
    business_year_end_date = forms.DateField(required=False)
    last_year_closure_date = forms.DateField(required=False)

    class Meta:
        model = Client
        fields = ["name", "short_name"]

    

@admin.register(Client)
class ClientAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = (
        "name",
        "schema_name",
        "short_name",
        "is_active",
        "paid_until",
        "on_trial",
        "created_on",
        "modified_on",
    )
    search_fields = ("name", "schema_name")
    form = ClientAdminForm

    def has_change_permission(self, request, obj=None):
        return request.user.role == "global_admin"

    def has_add_permission(self, request):
        return request.user.role == "global_admin"

    def has_delete_permission(self, request, obj=None):
        return request.user.role == "global_admin"

    def _email_exists_across_tenants(email):
        """
        Optional helper — queries user.email across all tenant schemas.
        WARNING: this loops tenant-by-tenant and can be slow for many tenants.
        """
        from tenant.models import Client  # local import
        from django.db import connection

        for client in Client.objects.all():
            try:
                with schema_context(client.schema_name):
                    # Import User from tenant schema
                    from user.models import User as TenantUser

                    if TenantUser.objects.filter(email__iexact=email).exists():
                        return True
            except Exception:
                # If a tenant schema is broken or migrations incomplete, skip and raise later
                # Optionally log the exception
                continue
        return False

    def save_model(self, request, obj, form, change):
        if request.user.role != "global_admin":
            raise PermissionDenied("Only global admins can manage tenants.")

        # Collect input values
        short_name = form.cleaned_data["short_name"]
        domain_url = form.cleaned_data["domain_url"]
        tenant_name = form.cleaned_data["name"]
        director_email = form.cleaned_data["director_email"]

        # === PRE-CHECKS ===
        # 1) short_name/schema_name uniqueness (public schema)
        if Client.objects.filter(short_name__iexact=short_name).exists():
            raise ValidationError("Short name/schema already exists.")

        # 2) tenant name uniqueness (public Client.name is unique)
        if Client.objects.filter(name__iexact=tenant_name).exists():
            raise ValidationError("Tenant/Institution name already exists.")

        # 3) domain uniqueness (public Domain table)
        if Domain.objects.filter(domain__iexact=domain_url).exists():
            raise ValidationError("Domain already exists.")

        # 4) OPTIONAL: director email uniqueness across tenants (costly)
        # Enable this if you need email unique across all tenant users.
        # if _email_exists_across_tenants(director_email):
        #       raise ValidationError( "Director email already exists in another tenant.")
        #

        if not change:
            try:
                with transaction.atomic():
                    # IMPROVEMENT: Set schema_name on the object directly for saving.
                    # The unique validation is handled by the model field.
                    # assign schema_name and save -> this is the point migrations WILL start
                    obj.schema_name = short_name
                    obj.save()

                    # Step 2: Create a domain for the tenant using the provided URL.
                    Domain.objects.create(
                        domain=domain_url, tenant=obj, is_primary=True
                    )

                    # Step 3: Switch to the new tenant's schema and set up initial data.
                    with schema_context(obj.schema_name):
                        # Create the detailed Institute profile with a minimal set of fields.
                        institute = Institute.objects.create(
                            institution_name=tenant_name,
                            shortname=short_name,
                            email=director_email,
                            phone=form.cleaned_data.get("phone", ""),
                            logo=form.cleaned_data.get("logo"),
                            post_office_box=form.cleaned_data.get(
                                "post_office_box", ""
                            ),
                            district=form.cleaned_data.get("district", ""),
                            county=form.cleaned_data.get("county", ""),
                            sub_county=form.cleaned_data.get("sub_county", ""),
                            parish=form.cleaned_data.get("parish", ""),
                            cell_village=form.cleaned_data.get("cell_village", ""),
                            registration_number=form.cleaned_data.get(
                                "registration_number", ""
                            ),
                            inst_nssf_nr=form.cleaned_data.get("inst_nssf_nr", ""),
                            inst_paye_number=form.cleaned_data.get(
                                "inst_paye_number", ""
                            ),
                            tax_flag=form.cleaned_data.get("tax_flag", False),
                            comments=form.cleaned_data.get("comments", ""),
                            business_year_start_date=form.cleaned_data.get(
                                "business_year_start_date"
                            )
                            or "1900-01-01",
                            business_year_end_date=form.cleaned_data.get(
                                "business_year_end_date"
                            ),
                            last_year_closure_date=form.cleaned_data.get(
                                "last_year_closure_date"
                            )
                            or "1900-01-01",
                        )

                        # Step 2: Create director user with unusable password
                        user = User.objects.create_user(
                            email=director_email,
                            role="director",
                        )
                        user.set_unusable_password()
                        user.save()

                        # Step 3: Build activation link
                        token = invite_token_generator.make_token(user)
                        uidb64 = urlsafe_base64_encode(force_bytes(user.idx))
                        scheme = request.scheme if request else "https"
                        host = request.get_host() if request else "localhost"

                        if "localhost" in host:
                            tenant_prefix = domain_url.split(".")[0]
                            frontend_port = getattr(settings, "FRONTEND_PORT", 3000)
                            full_host = f"{tenant_prefix}.localhost:{frontend_port}"
                        else:
                            tenant_prefix = domain_url.split(".")[0]
                            full_host = f"{tenant_prefix}.{host}"

                        activation_url = f"{scheme}://{full_host}/activate?uid={uidb64}&token={token}"

                        # Step 4: Send invite email
                        send_director_invite(user, institute, activation_url)
                        # # TODO: Generate a secure, random password for the new user.
                        # # for now we are giving a temporary password hardcoded
                        # temp_password = "temp_password"

                        # # Create the director user directly in the new tenant's schema.
                        # User.objects.create_user(
                        #     email=form.cleaned_data["director_email"],
                        #     password=temp_password,
                        #     role="director",
                        # )

                        # # TODO: Trigger email invitation to director here with temp_password.

            except IntegrityError:
                self.message_user(
                    request,
                    "Error: A tenant with this short name already exists.",
                    level="error",
                )
                return

        else:
            obj.save()


@admin.register(Domain)
class DomainAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ("domain", "tenant", "is_primary")
