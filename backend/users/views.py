"""
User views for Nectar & Nut E-commerce.

Worker: Dev - Authentication and profile APIs
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .models import Address
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    AddressSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint.
    
    Worker: Dev - Create new user accounts
    Worker: BA - Maps to FR-U01
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Worker: Dev - Trigger welcome email via signals
        # (handled in notifications app)
        
        return Response({
            'message': 'Registration successful. Please login.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    User profile endpoint.
    
    Worker: Dev - Get and update user profile
    Worker: BA - Maps to FR-U05
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class PasswordChangeView(APIView):
    """
    Change password endpoint.
    
    Worker: Dev - Password change for logged-in users
    Worker: QA - Requires current password verification
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully.'
        })


class PasswordResetRequestView(APIView):
    """
    Request password reset endpoint.
    
    Worker: Dev - Send password reset email
    Worker: BA - Maps to FR-U04
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Worker: Dev - Send reset email via notifications service
        # Always return success to prevent email enumeration
        
        return Response({
            'message': 'If an account exists with this email, you will receive a password reset link.'
        })


class AddressListCreateView(generics.ListCreateAPIView):
    """
    List and create addresses.
    
    Worker: Dev - Address management
    Worker: BA - Maps to FR-U06
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Address detail, update, delete.
    
    Worker: Dev - Single address operations
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
