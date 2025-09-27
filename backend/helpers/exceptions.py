# helpers/exceptions.py
from rest_framework import status
from rest_framework.exceptions import APIException


class VimsException(Exception):
    """Custom base exception for domain errors."""

    message = "Something went wrong."
    error_key = "vims_error"

    def __init__(self, message=None, error_key=None):
        self.message = message or self.message
        self.error_key = error_key or self.error_key
        super().__init__(self.message, self.error_key)


class ValidationError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid input."
    default_code = "invalid"
