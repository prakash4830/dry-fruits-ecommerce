"""
Cart models for Nectar & Nut E-commerce.

Worker: Dev - Shopping cart functionality
Worker: BA - Maps to FR-C01 through FR-C08 in FRD
"""

from decimal import Decimal
from django.db import models
from django.conf import settings
from products.models import Product


class Cart(models.Model):
    """
    Shopping cart supporting both authenticated users and guests.
    
    Worker: Dev - Cart persistence strategy
    - Authenticated users: Cart linked to user account
    - Guest users: Cart linked to session ID
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        related_name='cart',
        on_delete=models.CASCADE,
        blank=True,
        null=True
    )
    session_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Cart"
        verbose_name_plural = "Carts"
    
    def __str__(self):
        if self.user:
            return f"Cart for {self.user.email}"
        return f"Guest Cart ({self.session_id[:8]}...)"
    
    @property
    def total_items(self):
        """Worker: Dev - Total quantity of all items"""
        return sum(item.quantity for item in self.items.all())
    
    @property
    def subtotal(self):
        """Worker: Dev - Sum of all item totals"""
        return sum(item.total for item in self.items.all())
    
    @property
    def tax(self):
        """
        Worker: PM - Tax calculation (18% GST for India)
        Worker: BA - Tax rules may vary by state
        """
        return round(self.subtotal * Decimal('0.18'), 2)
    
    @property
    def shipping(self):
        """
        Worker: PM - Shipping calculation
        Free shipping above ₹500
        """
        if self.subtotal >= 500:
            return 0
        return 50  # Flat ₹50 shipping
    
    @property
    def total(self):
        """Worker: Dev - Final total including tax and shipping"""
        return self.subtotal + self.tax + self.shipping
    
    def clear(self):
        """Worker: Dev - Remove all items from cart"""
        self.items.all().delete()


class CartItem(models.Model):
    """
    Individual item in the shopping cart.
    
    Worker: Dev - Cart item with quantity tracking
    Worker: QA - Validate stock before adding
    """
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Cart Item"
        verbose_name_plural = "Cart Items"
        unique_together = ('cart', 'product')
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
    
    @property
    def total(self):
        """Worker: Dev - Line item total"""
        return self.product.price * self.quantity
    
    def clean(self):
        """
        Worker: QA - Stock validation
        Worker: BA - Maps to FR-C07
        """
        from django.core.exceptions import ValidationError
        if self.quantity > self.product.stock:
            raise ValidationError(
                f"Only {self.product.stock} items available in stock."
            )
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
