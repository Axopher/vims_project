from django.urls import path
from django.contrib import admin


urlpatterns = [
    path("admin/", admin.site.urls),
]


admin.site.site_header = 'VIMS Admin'