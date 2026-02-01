"""
Product models for Nectar & Nut E-commerce.

Worker: Dev - Product catalog management
Worker: BA - Maps to FR-P01 through FR-P08 in FRD
"""

from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    """
    Product categories for dry fruits and candies.
    
    Worker: BA - Pre-defined categories as per BRD
    """
    name = models.CharField(max_length=100, default='')
    slug = models.SlugField(unique=True, default='')
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ['display_order', 'name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    """
    Product model with variants and nutritional info.
    
    Worker: Dev - Core product entity
    Worker: BA - Supports multiple weight variants
    """
    category = models.ForeignKey(
        Category, 
        related_name='products', 
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=200, default='')
    slug = models.SlugField(unique=True, default='')
    description = models.TextField(default='')
    short_description = models.CharField(max_length=255, blank=True)
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    compare_at_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        help_text="Original price for showing discount"
    )
    
    # Inventory
    # Worker: PM - Stock management is critical for operations
    stock = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=10)
    sku = models.CharField(max_length=50, unique=True, blank=True, null=True)
    
    # Weight/Variant
    weight = models.CharField(
        max_length=50, 
        help_text="e.g., 100g, 250g, 500g, 1kg",
        default=''
    )
    
    # Nutritional Information (optional)
    # Worker: BA - Health-conscious customers want this info
    calories = models.PositiveIntegerField(blank=True, null=True, help_text="Per 100g")
    protein = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    carbs = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    fat = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    fiber = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    
    # Flags
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.weight})"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.name}-{self.weight}")
        super().save(*args, **kwargs)
    
    @property
    def is_in_stock(self):
        """Worker: Dev - Stock availability check"""
        return self.stock > 0
    
    @property
    def is_low_stock(self):
        """Worker: PM - Low stock alert trigger"""
        return 0 < self.stock <= self.low_stock_threshold
    
    @property
    def discount_percentage(self):
        """Worker: Dev - Calculate discount for display"""
        if self.compare_at_price and self.compare_at_price > self.price:
            discount = ((self.compare_at_price - self.price) / self.compare_at_price) * 100
            return round(discount)
        return 0


class ProductImage(models.Model):
    """
    Multiple images per product.
    
    Worker: Dev - Image gallery support
    Worker: BA - Maps to FR-P06
    """
    product = models.ForeignKey(
        Product, 
        related_name='images', 
        on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Product Image"
        verbose_name_plural = "Product Images"
        ordering = ['display_order']
    
    def __str__(self):
        return f"Image for {self.product.name}"
    
    def save(self, *args, **kwargs):
        # Worker: Dev - Ensure only one primary image per product
        if self.is_primary:
            ProductImage.objects.filter(
                product=self.product, 
                is_primary=True
            ).update(is_primary=False)
        super().save(*args, **kwargs)
