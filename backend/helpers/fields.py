from datetime import date
from django.db import models, connection
from shortuuid import ShortUUID
from helpers.idx_prefixes import IDXPrefix


class IDXField(models.CharField):
    description = "A short IDX field."
    alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"

    def __init__(self, *args, **kwargs):
        self.length = kwargs.pop("length", 8)
        if "max_length" not in kwargs:
            kwargs["max_length"] = 16
        kwargs.update({"unique": True, "editable": False, "blank": True})
        super().__init__(*args, **kwargs)

    def _generate_uuid(self, _prefix):
        _year = str(date.today().year)[2:]
        _uuid = ShortUUID(alphabet=self.alphabet).random(length=self.length)
        return f"{_prefix}{_year}{_uuid}".upper()

    def pre_save(self, instance, add):
        value = super().pre_save(instance, add)
        if not value:
            _table_name = instance._meta.db_table
            model_prefix = IDXPrefix.get(_table_name)

            tenant_prefix = "0"
            if connection.schema_name != "public":
                from tenant.models import Client

                try:
                    client = Client.objects.get(schema_name=connection.schema_name)
                    tenant_prefix = str(client.id)
                except Client.DoesNotExist:
                    raise ValueError(
                        f"Client with schema '{connection.schema_name}' does not exist."
                    )
            full_prefix = f"{tenant_prefix}-{model_prefix}"
            value = self._generate_uuid(full_prefix)
        setattr(instance, self.attname, value)
        return value

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        kwargs["length"] = self.length
        kwargs.pop("default", None)
        return name, path, args, kwargs
