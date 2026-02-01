"""
User URL configuration.

Worker: Dev - Authentication and profile routes
"""

from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

urlpatterns = [
    # JWT Authentication
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Registration
    path('register/', views.RegisterView.as_view(), name='register'),
    
    # Profile
    path('me/', views.ProfileView.as_view(), name='profile'),
    
    # Password
    path('password/change/', views.PasswordChangeView.as_view(), name='password_change'),
    path('password/reset/', views.PasswordResetRequestView.as_view(), name='password_reset'),
    
    # Addresses
    path('addresses/', views.AddressListCreateView.as_view(), name='address_list'),
    path('addresses/<int:pk>/', views.AddressDetailView.as_view(), name='address_detail'),
]
