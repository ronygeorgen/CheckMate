import email
from rest_framework import serializers
from .models import Account, Employee, CustomerStatus
from django.contrib.auth import authenticate
from mongoengine.queryset.visitor import Q
from django.utils import timezone
from mongoengine import ValidationError
from django.conf import settings
import cloudinary
import cloudinary.uploader


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def create(self, validated_data):
        # Create a checker user directly using the Account class method
        user = Account.create_checker(
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    
    def validate_email(self, value):
        # Use MongoEngine query syntax
        if Account.objects(email=value).first():
            raise serializers.ValidationError("Email already exists.")
        return value
    

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        # Find the user by email
        user = Account.objects(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            raise serializers.ValidationError("Invalid credentials")
        
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")
        
        # Update last login
        user.last_login = timezone.now()
        user.save()
        
        return {
            'email': data['email'],
            'password': data['password'],
            'user': user
        }


class MakerRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def create(self, validated_data):
        # Get the checker from the context
        checker = self.context.get('checker')
        if not checker:
            raise serializers.ValidationError("Checker information is required")
            
        user = Account.create_maker(
            email=validated_data['email'],
            password=validated_data['password'],
            created_by=checker
        )
        return user
    
    def validate_email(self, value):
        if Account.objects(email=value).first():
            raise serializers.ValidationError("Email already exists.")
        return value

class MakerSerializer(serializers.Serializer):
    id = serializers.CharField()
    email = serializers.EmailField()
    is_active = serializers.BooleanField()

class EmployeeSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    photo = serializers.FileField(required=True, write_only=True)  
    resume = serializers.FileField(required=True, write_only=True)
    photo_url = serializers.CharField(read_only=True)
    resume_url = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True, default=CustomerStatus.PENDING.value)
    uploaded_by_email = serializers.SerializerMethodField(read_only=True)
    checked_by_email = serializers.SerializerMethodField(read_only=True)

    def get_uploaded_by_email(self, obj):
        return obj.uploaded_by.email if obj.uploaded_by else None

    def get_checked_by_email(self, obj):
        return obj.checked_by.email if obj.checked_by else None

    def create(self, validated_data):
        user = self.context['request'].user

        if not user.is_maker:
            raise serializers.ValidationError("Only Makers can upload employees")

        # Upload photo to Cloudinary
        photo_result = cloudinary.uploader.upload(
            validated_data['photo'],
            folder="employees/photos",
            resource_type="image"
        )

        # Upload resume to Cloudinary
        resume_result = cloudinary.uploader.upload(
            validated_data['resume'],
            folder="employees/resumes",
            resource_type="raw",
            type="upload",
            access_type="public"  # Use access_type instead of access_mode
        )

        employee = Employee(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            photo_url=photo_result['secure_url'],
            photo_public_id=photo_result['public_id'],
            resume_url=resume_result['secure_url'],
            resume_public_id=resume_result['public_id'],
            uploaded_by=user,
            status=CustomerStatus.PENDING
        )
        employee.save()
        return employee


class FetchEmployeeSerializer(serializers.Serializer):
    id = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    status = serializers.SerializerMethodField()
    uploaded_by = serializers.SerializerMethodField()
    checked_by = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()
    photo_url = serializers.CharField()
    resume_url = serializers.CharField()
    photo_public_id = serializers.CharField()
    resume_public_id = serializers.CharField()

    def get_status(self, obj):
        return obj.status.value

    def get_uploaded_by(self, obj):
        return obj.uploaded_by.email if obj.uploaded_by else None

    def get_checked_by(self, obj):
        return obj.checked_by.email if obj.checked_by else None


class EmployeeUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[
            (CustomerStatus.PENDING.value, CustomerStatus.PENDING.value),
            (CustomerStatus.APPROVED.value, CustomerStatus.APPROVED.value),
            (CustomerStatus.DECLINED.value, CustomerStatus.DECLINED.value)
        ]
    )

    def update(self, instance, validated_data):
        user = self.context['request'].user
        if not user.is_checker:
            raise serializers.ValidationError("Only Checkers can update employee status")
        
        # Convert string status to Enum
        status_value = validated_data['status']
        try:
            status_enum = CustomerStatus(status_value)
            instance.status = status_enum
            instance.checked_by = user
            instance.save()
            return instance
        except ValueError:
            raise serializers.ValidationError(f"Invalid status value: {status_value}")