# backend/helpers/utils.py


def soft_delete_instance(instance):
    """
    Generic service to soft-delete any model instance with an `is_obsolete` flag.
    """
    if getattr(instance, "is_obsolete", False):
        return instance

    instance.is_obsolete = True
    instance.save()
    return instance
