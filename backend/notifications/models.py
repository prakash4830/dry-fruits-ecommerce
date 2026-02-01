"""
Notifications models for Nectar & Nut E-commerce.

Worker: Dev - Email notification tracking
"""

from django.db import models
from django.conf import settings


class EmailLog(models.Model):
    """
    Log of all sent emails.
    
    Worker: Dev - Email delivery tracking
    Worker: QA - Debugging email issues
    """
    EMAIL_TYPES = (
        ('welcome', 'Welcome Email'),
        ('order_confirmation', 'Order Confirmation'),
        ('order_shipped', 'Order Shipped'),
        ('order_delivered', 'Order Delivered'),
        ('password_reset', 'Password Reset'),
        ('low_stock_alert', 'Low Stock Alert'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    )
    
    email_type = models.CharField(max_length=30, choices=EMAIL_TYPES)
    recipient_email = models.EmailField()
    recipient_name = models.CharField(max_length=100, blank=True)
    
    subject = models.CharField(max_length=255)
    
    # Resend tracking
    resend_id = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True, null=True)
    
    # Related objects (optional)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        verbose_name = "Email Log"
        verbose_name_plural = "Email Logs"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_email_type_display()} to {self.recipient_email}"
