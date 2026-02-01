"""
Django signals for Nectar & Nut E-commerce.

Worker: Dev - Event-driven notifications
Worker: BA - Automated email triggers per FRD
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from orders.models import Order
from .services import email_service

User = get_user_model()


@receiver(post_save, sender=User)
def user_created_handler(sender, instance, created, **kwargs):
    """
    Send welcome email when user registers.
    
    Worker: Dev - Welcome email trigger
    Worker: BA - Maps to notification triggers
    """
    if created and instance.email:
        # Send welcome email
        email_service.send_welcome_email(instance)


@receiver(post_save, sender=Order)
def order_status_changed_handler(sender, instance, **kwargs):
    """
    Send notification emails on order status changes.
    
    Worker: Dev - Order notification triggers
    Worker: BA - Maps to FR-O07, FR-OH05
    """
    # Check if this is an update (not a new order)
    if not kwargs.get('created', False):
        # Check what status changed to
        if instance.status == 'confirmed' and instance.payment_status == 'paid':
            # Send order confirmation email
            email_service.send_order_confirmation(instance)
        
        elif instance.status == 'shipped':
            # Send shipping notification
            email_service.send_order_shipped(instance)
