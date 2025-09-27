from decouple import config

env = config("ENVIRONMENT", default="local")
try:
    print(f"*************** Using settings for environment: {env}  ***************")
    if env == "local":
        from .local import *
    elif env == "dev":
        from .dev import *
    else:
        from .prod import *
except ImportError:
    print("*************** No settings file found for the environment ***************")
