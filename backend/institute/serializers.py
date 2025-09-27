# vims_project/backend/institute/serializers.py
from rest_framework import serializers
from institute.models import Institute

class InstituteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institute
        fields = "__all__"
        read_only_fields = ["idx", "created_at", "updated_at"]
