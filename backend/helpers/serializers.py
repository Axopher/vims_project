from rest_framework import serializers


class BaseModelSerializer(serializers.ModelSerializer):
    idx = serializers.CharField(read_only=True)

    class Meta:
        exclude = ("id", "modified_on", "is_obsolete")
        extra_kwargs = {
            "created_on": {"read_only": True},
            "idx": {"read_only": True},
        }
