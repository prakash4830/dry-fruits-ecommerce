"""
User models for Nectar & Nut E-commerce.

Worker: Dev - User authentication and profile management
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model for Nectar & Nut.
    
    Worker: Dev - Extended user with phone and profile info
    Worker: QA - Ensure email uniqueness validation
    """
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    
    # Use email as the username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
    
    def __str__(self):
        return self.email


class Address(models.Model):
    """
    User shipping addresses.
    
    Worker: Dev - Multiple addresses per user
    Worker: BA - Maps to FR-U06 in FRD
    """
    ADDRESS_TYPES = (
        ('home', 'Home'),
        ('office', 'Office'),
        ('other', 'Other'),
    )
    
    user = models.ForeignKey(User, related_name='addresses', on_delete=models.CASCADE)
    address_type = models.CharField(max_length=10, choices=ADDRESS_TYPES, default='home')
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Address"
        verbose_name_plural = "Addresses"
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.full_name} - {self.city}, {self.pincode}"
    
    def save(self, *args, **kwargs):
        # Worker: Dev - Ensure only one default address per user
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
