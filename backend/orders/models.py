"""
Order models for Nectar & Nut E-commerce.

Worker: Dev - Order processing and payment tracking
Worker: BA - Maps to FR-O01 through FR-OH06 in FRD
"""

from django.db import models
from django.conf import settings
from products.models import Product
from users.models import Address


class Coupon(models.Model):
    """
    Coupon model for discounts.
    """
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=(('percentage', 'Percentage'), ('fixed', 'Fixed Amount')), default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    min_purchase_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    used_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.code

class Order(models.Model):
    """
    Order model with payment tracking.
    
    Worker: Dev - Core order entity
    Worker: PM - Order status flow must follow business rules
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    # Order Reference
    order_number = models.CharField(max_length=20, unique=True, editable=False, default='')
    
    # User & Address
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        related_name='orders', 
        on_delete=models.CASCADE
    )
    
    # Shipping Address (stored as JSON to preserve historical data)
    shipping_name = models.CharField(max_length=100, default='')
    shipping_phone = models.CharField(max_length=15, default='')
    shipping_address_line1 = models.CharField(max_length=255, default='')
    shipping_address_line2 = models.CharField(max_length=255, blank=True)
    shipping_city = models.CharField(max_length=100, default='')
    shipping_state = models.CharField(max_length=100, default='')
    shipping_pincode = models.CharField(max_length=10, default='')

    # Billing Address
    billing_name = models.CharField(max_length=100, default='')
    billing_phone = models.CharField(max_length=15, default='')
    billing_address_line1 = models.CharField(max_length=255, default='')
    billing_address_line2 = models.CharField(max_length=255, blank=True)
    billing_city = models.CharField(max_length=100, default='')
    billing_state = models.CharField(max_length=100, default='')
    billing_pincode = models.CharField(max_length=10, default='')
    
    # Order Totals
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    coupon_code = models.CharField(max_length=50, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(
        max_length=20, 
        choices=PAYMENT_STATUS_CHOICES, 
        default='pending'
    )
    
    # Razorpay Integration
    # Worker: Dev - Payment gateway IDs for tracking
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    
    # Shipping Tracking
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    tracking_url = models.URLField(blank=True, null=True)
    
    # Notes
    customer_notes = models.TextField(blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    shipped_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order {self.order_number} - {self.user.email}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            # Worker: Dev - Generate unique order number
            self.order_number = self._generate_order_number()
        super().save(*args, **kwargs)
    
    def _generate_order_number(self):
        """
        Worker: Dev - Generate unique order number
        Format: NN-YYYYMMDD-XXXX (e.g., NN-20260131-0001)
        """
        from django.utils import timezone
        import random
        import string
        
        date_str = timezone.now().strftime('%Y%m%d')
        random_str = ''.join(random.choices(string.digits, k=4))
        return f"NN-{date_str}-{random_str}"
    
    @property
    def can_cancel(self):
        """Worker: PM - Only pending/confirmed orders can be cancelled"""
        return self.status in ['pending', 'confirmed']
    
    @property
    def is_paid(self):
        """Worker: Dev - Payment status check"""
        return self.payment_status == 'paid'


class OrderItem(models.Model):
    """
    Individual item in an order.
    
    Worker: Dev - Order line items with price frozen at time of purchase
    """
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(
        Product, 
        related_name='order_items', 
        on_delete=models.SET_NULL,
        null=True
    )
    
    # Frozen product details (in case product changes later)
    product_name = models.CharField(max_length=200, default='')
    product_sku = models.CharField(max_length=50, blank=True, null=True)
    product_weight = models.CharField(max_length=50, default='')
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    quantity = models.PositiveIntegerField(default=1)
    
    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"
    
    def __str__(self):
        return f"{self.quantity} x {self.product_name}"
    
    @property
    def total(self):
        """Worker: Dev - Line item total"""
        return self.price * self.quantity


class OrderTimeline(models.Model):
    """
    Order status history for tracking.
    
    Worker: Dev - Audit trail for order status changes
    Worker: BA - Customer can see order progress
    """
    order = models.ForeignKey(Order, related_name='timeline', on_delete=models.CASCADE)
    status = models.CharField(max_length=20)
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = "Order Timeline"
        verbose_name_plural = "Order Timeline"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.status}"
