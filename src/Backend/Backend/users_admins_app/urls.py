from django.urls import path
from .views import *

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('register/maker/', MakerRegisterView.as_view(), name='register-maker'),
    path('fetch-makers/', GetCheckerMakers.as_view(), name='register-maker'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh-token/', RefreshTokenView.as_view(), name='token_refresh'),
    path('employees/upload/', EmployeeUploadView.as_view(), name='employee-upload'),
    path('employees/', EmployeeListView.as_view(), name='employee-list'),
    path('employees/<str:employee_id>/status/', EmployeeStatusUpdateView.as_view(), name='employee-status-update'),
    path('logout/', LogoutView.as_view())
]