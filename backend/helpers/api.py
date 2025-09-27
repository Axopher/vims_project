# helpers/api.py
from typing import Union

from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST


class BaseAPIMixin:
    lookup_field = "idx"

    def api_success_response(self, data: Union[dict, str], status: int = HTTP_200_OK):
        if isinstance(data, str):
            data = {"detail": data}

        return Response(data, status=status)

    def api_error_response(
        self, data: Union[dict, str], status: int = HTTP_400_BAD_REQUEST
    ):
        if isinstance(data, str):
            data = {"detail": data}

        return Response(data, status=status)
