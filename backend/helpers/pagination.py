# /helpers/pagination.py
from rest_framework.pagination import PageNumberPagination
from helpers.api import BaseAPIMixin


class VIMSPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = "page_size"

    def get_paginated_response(self, data):
        api = BaseAPIMixin()
        response = {
            "total_pages": self.page.paginator.num_pages,
            "current_page": self.page.number,
            "page_size": self.get_page_size(self.request),
            "total_records": self.page.paginator.count,
            "next_page_url": self.get_next_link(),
            "previous_page_url": self.get_previous_link(),
            "data": data,
        }
        return api.api_success_response(response)
