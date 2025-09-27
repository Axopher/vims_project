# helpers/exception_handler.py
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from .exceptions import VimsException


def vims_exception_handler(exc, context):
    """Simple unified exception handler."""
    response = exception_handler(exc, context)
    if response is None and isinstance(exc, VimsException):
        data = {"detail": exc.message}
        return Response(data, status=status.HTTP_400_BAD_REQUEST)
    return response
