from mongoengine import Document, EmailField, StringField, BooleanField, DateTimeField, ReferenceField, UUIDField, EnumField, FileField
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
import uuid
import enum

class Account(Document):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    email = EmailField(max_length=50, unique=True, required=True)
    first_name = StringField(max_length=50)
    last_name = StringField(max_length=50)
    username = StringField(max_length=50)
    phone_number = StringField(max_length=50)
    password = StringField(required=True)
    
    email_verified = BooleanField(default=False)
    created_by = ReferenceField('self')
    
    date_joined = DateTimeField(default=timezone.now)
    last_login = DateTimeField(default=timezone.now)
    
    is_maker = BooleanField(default=False)
    is_checker = BooleanField(default=False)
    is_active = BooleanField(default=True)
    is_staff = BooleanField(default=False)
    is_superuser = BooleanField(default=False)

    meta = {
        'collection': 'accounts',
        'indexes': ['email']
    }

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email
        return super().save(*args, **kwargs)

    @property
    def is_authenticated(self):
        return True

    @classmethod
    def create_user(cls, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        
        user = cls(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save()
        return user

    @classmethod
    def create_superuser(cls, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return cls.create_user(email, password, **extra_fields)

    @classmethod
    def create_maker(cls, email, password, created_by=None, **extra_fields):
        extra_fields['is_maker'] = True
        user = cls(email=email, created_by=created_by, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    @classmethod
    def create_checker(cls, email, password=None, **extra_fields):
        extra_fields['is_checker'] = True
        extra_fields['email_verified'] = True
        user = cls(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save()
        return user

    def __str__(self):
        return self.email

class CustomerStatus(enum.Enum):
    PENDING = 'pending'
    APPROVED = 'approved'
    DECLINED = 'declined'

class Employee(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = StringField(max_length=100, required=True)
    last_name = StringField(max_length=100, required=True)
    photo_url = StringField(required=True)
    photo_public_id = StringField(required=True)
    resume_url = StringField(required=True)
    resume_public_id = StringField(required=True)
    uploaded_by = ReferenceField(Account, required=True)  # Maker who uploaded
    checked_by = ReferenceField(Account, required=False)  # Checker who reviewed
    status = EnumField(CustomerStatus, default=CustomerStatus.PENDING)
    
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)
    
    meta = {
        'collection': 'employees',
        'indexes': [
            'uploaded_by',
            'checked_by',
            'status'
        ]
    }

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"