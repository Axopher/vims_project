# user/tokens.py
from django.contrib.auth.tokens import PasswordResetTokenGenerator

invite_token_generator = PasswordResetTokenGenerator()
