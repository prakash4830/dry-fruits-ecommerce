"""
Cart admin configuration.

Worker: Dev - Django admin for carts
"""

from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['total']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'session_id', 'total_items', 'subtotal', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'session_id']
    readonly_fields = ['total_items', 'subtotal', 'tax', 'shipping', 'total']
    inlines = [CartItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'product', 'quantity', 'total']
    list_filter = ['created_at']
    search_fields = ['product__name', 'cart__user__email']
