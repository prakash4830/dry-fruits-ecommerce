"""
User serializers for Nectar & Nut E-commerce.

Worker: Dev - API serialization for user data
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Address

User = get_user_model()


class AddressSerializer(serializers.ModelSerializer):
    """
    Worker: Dev - Address CRUD serializer
    Worker: BA - Maps to FR-U06
    """
    class Meta:
        model = Address
        fields = [
            'id', 'address_type', 'full_name', 'phone',
            'address_line1', 'address_line2', 'city',
            'state', 'pincode', 'is_default', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    """
    Worker: Dev - User profile serializer
    """
    addresses = AddressSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'phone_number', 'addresses', 'date_joined'
        ]
        read_only_fields = ['id', 'email', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Worker: Dev - User registration with password validation
    Worker: QA - Password strength validation
    Worker: BA - Maps to FR-U01
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Passwords do not match."
            })
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        
        # Generate username from email
        email = validated_data['email']
        username = email.split('@')[0]
        
        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', '')
        )
        return user


class PasswordChangeSerializer(serializers.Serializer):
    """
    Worker: Dev - Password change serializer
    Worker: QA - Validate current password before change
    """
    current_password = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    
    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Worker: Dev - Password reset request
    Worker: BA - Maps to FR-U04
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            # Don't reveal if email exists or not for security
            pass
        return value
