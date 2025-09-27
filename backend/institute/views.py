# # institute/views.py
# from rest_framework import generics, status
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from django_tenants.utils import schema_context, get_public_schema_name
# from tenant.models import Client, Domain
# from user.models import User
# from institute.models import Institute
# from django.db import connection


# class InstituteCreateView(generics.GenericAPIView):
#     """
#     A view for a global admin to create a new tenant (institute) and the
#     first user (the director) in that tenant's schema.
#     This view is only accessible on the public schema and is restricted to global admins.
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         # 1. Permission Check: Only allow global_admin to create a new tenant.
#         # This check is performed on the authenticated user from the public schema.
#         if request.user.role != 'global_admin':
#             return Response({"error": "You do not have permission to create a new institute."}, status=status.HTTP_403_FORBIDDEN)

#         name = request.data.get('name')
#         director_email = request.data.get('director_email')
#         domain_url = request.data.get('domain')
#         director_first_name = request.data.get('director_first_name', '')
#         director_last_name = request.data.get('director_last_name', '')

#         if not all([name, director_email, domain_url]):
#             return Response({"error": "Missing required fields: name, director_email, domain."}, status=status.HTTP_400_BAD_REQUEST)

#         # 2. Ensure we are in the public schema for the initial tenant creation.
#         connection.set_schema_to_public()

#         try:
#             # Step 1: Create the tenant and domain in the public schema.
#             # The schema_name is derived from the institute's name.
#             schema_name = name.replace(" ", "").lower()
#             tenant = Client.objects.create(name=name, short_name=schema_name)
#             Domain.objects.create(domain=domain_url, tenant=tenant, is_primary=True)
#         except Exception as e:
#             return Response({"error": f"Failed to create tenant or domain: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         # Step 2: Switch to the new tenant's schema to create the initial data.
#         with schema_context(tenant.schema_name):
#             try:
#                 # 2a. Create the detailed Institute profile.
#                 Institute.objects.create(name=name, short_name=name.replace(" ", "").upper())

#                 # 2b. Create the director user directly in the new tenant's schema.
#                 # The 'role' is a CharField on the User model.
#                 director = User.objects.create_user(
#                     email=director_email,
#                     password="temporary_password", # A temporary password that will be changed.
#                     first_name=director_first_name,
#                     last_name=director_last_name,
#                     is_active=True,
#                     is_staff=True,
#                     role='director'
#                 )

#                 # TODO: Send a secure invitation email with a password setup link to director_email.
#             except Exception as e:
#                 # If anything fails here, we need to clean up the public tenant and domain.
#                 connection.set_schema_to_public()
#                 tenant.delete()
#                 return Response({"error": f"Failed to set up tenant schema or create director user: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         return Response({
#             "message": "Institute and director created successfully. An invitation email will be sent.",
#             "tenant_id": str(tenant.pk),
#             "director_email": director_email,
#             "domain": domain_url,
#         }, status=status.HTTP_201_CREATED)
