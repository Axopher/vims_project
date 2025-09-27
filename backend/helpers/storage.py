# backend/helpers/storage.py
from typing import Literal

from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage
from django.db.models import FileField, ImageField


class CustomS3Storage(S3Boto3Storage):
    PRIVATE_BUCKET = {
        "access_key": settings.AWS_PRIVATE_ACCESS_KEY_ID,
        "secret_key": settings.AWS_PRIVATE_SECRET_ACCESS_KEY,
        "bucket_name": settings.AWS_PRIVATE_STORAGE_BUCKET_NAME,
        "custom_domain": settings.AWS_PRIVATE_S3_CUSTOM_DOMAIN,
        "region_name": settings.AWS_PRIVATE_REGION,
        "default_acl": "private",
        "querystring_expire": 3600,
    }
    PUBLIC_BUCKET = {
        "access_key": settings.AWS_ACCESS_KEY_ID,
        "secret_key": settings.AWS_SECRET_ACCESS_KEY,
        "bucket_name": settings.AWS_STORAGE_BUCKET_NAME,
        "custom_domain": settings.AWS_S3_CUSTOM_DOMAIN,
        "region_name": settings.AWS_REGION,
        "default_acl": "public-read",
    }

    def __init__(
        self, bucket_type: Literal["private", "public"] = "public", **settings
    ):
        bucket_type_map = {
            "private": self.PRIVATE_BUCKET,
            "public": self.PUBLIC_BUCKET,
        }
        settings.update(bucket_type_map[bucket_type])
        super().__init__(**settings)


class CustomStorageMixin:
    def __init__(self, *args, **kwargs):
        if settings.LIVE:
            private = kwargs.pop("private", False)
            bucket_type = "private" if private else "public"
            kwargs["storage"] = CustomS3Storage(bucket_type=bucket_type)
        else:
            # In local dev, we don't need to specify storage.
            # It will automatically use the DEFAULT_FILE_STORAGE setting.
            kwargs.pop("private", None)

        super().__init__(*args, **kwargs)


class CustomFileField(CustomStorageMixin, FileField):
    pass


class CustomImageField(CustomStorageMixin, ImageField):
    pass
