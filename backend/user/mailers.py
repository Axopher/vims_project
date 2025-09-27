# user/mailers.py
from django.core.mail import send_mail
from django.conf import settings
from institute.models import Institute


def send_employee_invite(user, employee, activation_url):
    # Retrieve the institution name from the current tenant's schema
    institution_name = "VIMS"  # Default value
    try:
        # The current schema is active during this request, so we can query
        # the Institute model directly.
        institution = Institute.objects.get()
        institution_name = institution.institution_name
    except Institute.DoesNotExist:
        pass  # Fallback to default if not found

    subject = f"You're invited to {institution_name}"
    body = (
        f"Hello {employee.first_name},\n\n"
        f"You've been invited to join {institution_name}.\n"
        f"Activate your account and set your password here:\n{activation_url}\n\n"
        f"This link is time-limited."
    )
    send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [user.email])


def send_director_invite(user, institute, activation_url):
    institution_name = institute.institution_name or "VIMS"

    subject = f"Welcome to {institution_name}"
    body = (
        f"Hello,\n\n"
        f"You have been registered as the Director of {institution_name}.\n"
        f"Please activate your account and set your password here:\n{activation_url}\n\n"
        f"This link is time-limited.\n\n"
        f"Thank you."
    )
    send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [user.email])
