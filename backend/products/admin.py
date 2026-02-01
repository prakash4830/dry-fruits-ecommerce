"""
Product admin configuration.

Worker: Dev - Django admin for products
"""

from django.contrib import admin
from .models import Category, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'display_order']
    list_filter = ['is_active']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['display_order', 'name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'category', 'weight', 'price', 
        'stock', 'is_active', 'is_featured', 'is_bestseller'
    ]
    list_filter = ['category', 'is_active', 'is_featured', 'is_bestseller']
    search_fields = ['name', 'sku', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]
    
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'category', 'description', 'short_description')
        }),
        ('Pricing', {
            'fields': ('price', 'compare_at_price', 'weight')
        }),
        ('Inventory', {
            'fields': ('stock', 'low_stock_threshold', 'sku')
        }),
        ('Nutrition', {
            'fields': ('calories', 'protein', 'carbs', 'fat', 'fiber'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured', 'is_bestseller')
        }),
    )
    
    # Worker: PM - Low stock alert action
    actions = ['mark_as_featured', 'mark_as_bestseller']
    
    def mark_as_featured(self, request, queryset):
        queryset.update(is_featured=True)
    mark_as_featured.short_description = "Mark selected products as featured"
    
    def mark_as_bestseller(self, request, queryset):
        queryset.update(is_bestseller=True)
    mark_as_bestseller.short_description = "Mark selected products as bestseller"
