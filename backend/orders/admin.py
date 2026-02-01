"""
Order admin configuration.

Worker: Dev - Django admin for orders
"""

from django.contrib import admin
from .models import Order, OrderItem, OrderTimeline


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'product_name', 'product_sku', 'product_weight', 'price', 'quantity', 'total']


class OrderTimelineInline(admin.TabularInline):
    model = OrderTimeline
    extra = 0
    readonly_fields = ['status', 'message', 'created_at', 'created_by']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number', 'user', 'status', 'payment_status',
        'total_amount', 'created_at'
    ]
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['order_number', 'user__email', 'shipping_name']
    readonly_fields = [
        'order_number', 'user', 'subtotal', 'tax', 'shipping_cost',
        'total_amount', 'razorpay_order_id', 'razorpay_payment_id',
        'razorpay_signature', 'created_at', 'updated_at'
    ]
    inlines = [OrderItemInline, OrderTimelineInline]
    
    fieldsets = (
        ('Order Info', {
            'fields': ('order_number', 'user', 'status', 'payment_status')
        }),
        ('Shipping', {
            'fields': (
                'shipping_name', 'shipping_phone',
                'shipping_address_line1', 'shipping_address_line2',
                'shipping_city', 'shipping_state', 'shipping_pincode'
            )
        }),
        ('Totals', {
            'fields': ('subtotal', 'tax', 'shipping_cost', 'total_amount')
        }),
        ('Payment', {
            'fields': ('razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'),
            'classes': ('collapse',)
        }),
        ('Tracking', {
            'fields': ('tracking_number', 'tracking_url', 'shipped_at', 'delivered_at')
        }),
        ('Notes', {
            'fields': ('customer_notes', 'admin_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Worker: PM - Order status actions
    actions = ['mark_as_processing', 'mark_as_shipped', 'mark_as_delivered']
    
    def mark_as_processing(self, request, queryset):
        queryset.update(status='processing')
    mark_as_processing.short_description = "Mark selected orders as processing"
    
    def mark_as_shipped(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='shipped', shipped_at=timezone.now())
    mark_as_shipped.short_description = "Mark selected orders as shipped"
    
    def mark_as_delivered(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='delivered', delivered_at=timezone.now())
    mark_as_delivered.short_description = "Mark selected orders as delivered"
