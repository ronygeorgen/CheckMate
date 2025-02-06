import mongoengine
from django.conf import settings

# Initialize MongoEngine
mongoengine.connect(
    db=settings.MONGODB_NAME,
    host=settings.MONGODB_HOST
)

default_app_config = 'users_admins_app.apps.UsersAdminsAppConfig'