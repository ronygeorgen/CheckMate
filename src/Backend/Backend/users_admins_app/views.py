from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, LoginSerializer, MakerRegisterSerializer, MakerSerializer, EmployeeSerializer, EmployeeUpdateSerializer, FetchEmployeeSerializer
import logging
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import BasePermission
from .jwt_middleware import JWTAuthentication
from .models import Account, Employee, CustomerStatus
from rest_framework.parsers import MultiPartParser, FormParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

# Create your views here.

logger = logging.getLogger(__name__)

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    refresh['email'] = user.email

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            user_data = {
                "id": str(user.id),
                "email": user.email,
            }
            response_data = {
                "message": "Registration successful.",
                "user": user_data,
            }
            response = JsonResponse(response_data, status=status.HTTP_201_CREATED)
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            # Get the pre-authenticated user from serializer
            user = serializer.validated_data['user']
            
            tokens = get_tokens_for_user(user)
            user_data = {
                "id": str(user.id),
                "email": user.email,
                "is_maker": user.is_maker,
                "is_checker": user.is_checker,
            }
            response_data = {
                "message": "Login successful",
                "user": user_data,
                "tokens": tokens
            }
            response = JsonResponse(response_data, status=status.HTTP_200_OK)
            response.set_cookie('access_token', tokens['access'], httponly=True, secure=True, samesite='None')
            response.set_cookie('refresh_token', tokens['refresh'], httponly=True, secure=True, samesite='None')
            return response
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RefreshTokenView(APIView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        
        # Debug logging to verify refresh token retrieval
        if not refresh_token:
            return Response({"error": "Refresh token required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            refresh = RefreshToken(refresh_token)
            new_access_token = str(refresh.access_token)
            
            response = Response({
                'message': 'Token refreshed successfully',
                'access_token': new_access_token  # Send back access token if needed
            })
            response.set_cookie(
                'access_token',
                new_access_token,
                httponly=True,
                secure=True,
                samesite='Strict'
            )
            return response
            
        except Exception as e:
            logger.error(f"Invalid refresh token: {str(e)}")
            response = Response(
                {"error": "Invalid refresh token"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            return response

class IsChecker(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_checker

class MakerRegisterView(APIView):
    uthentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsChecker]

    def post(self, request, *args, **kwargs):
        print('request.user', request.user)
        # Verify that the authenticated user is a checker
        if not request.user.is_checker:
            return Response(
                {"error": "Only checkers can create maker accounts"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = MakerRegisterSerializer(
            data=request.data,
            context={'checker': request.user} 
        )
        
        if serializer.is_valid():
            maker = serializer.save()
            
            maker_data = {
                "id": str(maker.id),
                "email": maker.email,
                "created_by": {
                    "id": str(maker.created_by.id),
                    "email": maker.created_by.email
                }
            }
            response_data = {
                "message": "Maker registration successful.",
                "maker": maker_data,
            }
            return JsonResponse(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class GetCheckerMakers(APIView):
    def get(self, request):
        """Get all makers created by the logged-in checker."""
        try:
            # Get makers where created_by matches the current user
            makers = Account.objects(created_by=request.user.id, is_maker=True).all()
            serializer = MakerSerializer(makers, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class IsMaker(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_maker

# @method_decorator(csrf_exempt, name='dispatch')
class EmployeeUploadView(APIView):
    permission_classes = [IsAuthenticated, IsMaker]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        print('request data', request.data)
        print('request user', request.user.email)
        # Ensure only Makers can upload
        if not request.user.is_maker:
            return Response(
                {"error": "Only Makers can upload employees"}, 
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = EmployeeSerializer(
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmployeeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_checker:
            # Checkers see employees uploaded by their makers
            makers_under_checker = Account.objects(
                created_by=request.user, 
                is_maker=True
            )
            employees = Employee.objects(uploaded_by__in=makers_under_checker)
        elif request.user.is_maker:
            # Makers see their own uploaded employees
            employees = Employee.objects(uploaded_by=request.user)
        else:
            employees = Employee.objects.none()

        serializer = FetchEmployeeSerializer(employees, many=True)
        return Response(serializer.data)


class EmployeeStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, employee_id):
        # Ensure only Checkers can update status
        if not request.user.is_checker:
            return Response(
                {"error": "Only Checkers can update employee status"}, 
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return Response(
                {"error": "Employee not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Ensure the Checker can only update employees under their Makers
        makers_under_checker = Account.objects(
            created_by=request.user, 
            is_maker=True
        )
        if employee.uploaded_by not in makers_under_checker:
            return Response(
                {"error": "You are not authorized to update this employee's status"}, 
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = EmployeeUpdateSerializer(
            employee, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(EmployeeSerializer(employee).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        
        response.set_cookie(
            'access_token',
            value='',
            max_age=0,
            expires='Thu, 01 Jan 1970 00:00:00 GMT',
            secure=True,
            httponly=True,
            samesite='None',
            path='/'
        )
        response.set_cookie(
            'refresh_token',
            value='',
            max_age=0,
            expires='Thu, 01 Jan 1970 00:00:00 GMT',
            secure=True,
            httponly=True,
            samesite='None',
            path='/'
        )
        
        return response