from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import jwt
from django.conf import settings
from .models import Account

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # List of paths that don't require authentication
        exempt_paths = [
            '/user/register/', 
            '/user/login/',
            '/user/logout/',
            '/user/admin-login/',
            '/user/refresh-token/',
            '/user/google-auth/',
            '/user/verify-otp/',
            '/user/resend-otp/',
        ]

        # Skip authentication for exempt paths
        if any(request.path.endswith(path) for path in exempt_paths):
            return None

        # Get token from cookies
        token = request.COOKIES.get('access_token')
        if not token:
            raise AuthenticationFailed('No authentication token provided')

        try:
            # Decode token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get('user_id')
            
            if not user_id:
                raise AuthenticationFailed('Invalid token format')

            # Get user from database
            try:
                user = Account.objects.get(id=user_id)
                if not user.is_active:
                    raise AuthenticationFailed('User account is disabled')
                
                return (user, None)  # Authentication successful
                
            except Account.DoesNotExist:
                raise AuthenticationFailed('User not found')

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

    def authenticate_header(self, request):
        return 'Bearer'