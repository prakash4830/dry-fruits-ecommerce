"""
Order serializers for Nectar & Nut E-commerce.

Worker: Dev - API serialization for orders and payments
"""

from rest_framework import serializers
from .models import Order, OrderItem, OrderTimeline
from users.serializers import AddressSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Worker: Dev - Order item serializer
    """
    product_image = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product_name', 'product_sku', 'product_weight',
            'price', 'quantity', 'total', 'product_image'
        ]
    
    def get_product_image(self, obj):
        """Get primary image from related product"""
        if obj.product and hasattr(obj.product, 'images'):
            primary_image = obj.product.images.filter(is_primary=True).first()
            if primary_image and primary_image.image:
                return primary_image.image.url
        return None



class OrderTimelineSerializer(serializers.ModelSerializer):
    """
    Worker: Dev - Order status history
    Worker: BA - Customer order tracking
    """
    class Meta:
        model = OrderTimeline
        fields = ['id', 'status', 'message', 'created_at']


class OrderListSerializer(serializers.ModelSerializer):
    """
    Worker: Dev - Order list view (minimal data)
    """
    item_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_status',
            'total_amount', 'item_count', 'created_at'
        ]
    
    def get_item_count(self, obj):
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    """
    Worker: Dev - Order detail view (full data)
    Worker: BA - Complete order info for user
    """
    items = OrderItemSerializer(many=True, read_only=True)
    timeline = OrderTimelineSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_status',
            'shipping_name', 'shipping_phone',
            'shipping_address_line1', 'shipping_address_line2',
            'shipping_city', 'shipping_state', 'shipping_pincode',
            'billing_name', 'billing_phone',
            'billing_address_line1', 'billing_address_line2',
            'billing_city', 'billing_state', 'billing_pincode',
            'subtotal', 'tax', 'shipping_cost', 'discount_amount', 'coupon_code', 'total_amount',
            'tracking_number', 'tracking_url',
            'customer_notes',
            'items', 'timeline',
            'created_at', 'shipped_at', 'delivered_at'
        ]


class CreateOrderSerializer(serializers.Serializer):
    """
    Worker: Dev - Create order from cart
    Worker: BA - Maps to FR-O01, FR-O02
    """
    address_id = serializers.IntegerField(required=True)
    billing_address_id = serializers.IntegerField(required=False)
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    customer_notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_address_id(self, value):
        from users.models import Address
        user = self.context['request'].user
        
        try:
            Address.objects.get(id=value, user=user)
        except Address.DoesNotExist:
            raise serializers.ValidationError("Shipping address not found.")
        
        return value

    def validate_billing_address_id(self, value):
        if not value:
            return value
        from users.models import Address
        user = self.context['request'].user
        
        try:
            Address.objects.get(id=value, user=user)
        except Address.DoesNotExist:
            raise serializers.ValidationError("Billing address not found.")
        
        return value


class CreatePaymentSerializer(serializers.Serializer):
    """
    Worker: Dev - Create Razorpay payment order
    Worker: BA - Maps to FR-O03
    """
    order_id = serializers.IntegerField(required=True)
    
    def validate_order_id(self, value):
        user = self.context['request'].user
        
        try:
            order = Order.objects.get(id=value, user=user)
            if order.payment_status == 'paid':
                raise serializers.ValidationError("Order is already paid.")
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found.")
        
        return value


class VerifyPaymentSerializer(serializers.Serializer):
    """
    Worker: Dev - Verify Razorpay payment signature
    Worker: QA - Security critical - verify signature
    Worker: BA - Maps to FR-O05, FR-O06
    """
    razorpay_order_id = serializers.CharField(required=True)
    razorpay_payment_id = serializers.CharField(required=True)
    razorpay_signature = serializers.CharField(required=True)


class OrderAdminSerializer(serializers.ModelSerializer):
    """
    Worker: Dev - Admin order management
    Worker: BA - Maps to FR-OP01 through FR-OP05
    """
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = [
            'order_number', 'user', 'subtotal', 'tax', 
            'shipping_cost', 'total_amount', 'razorpay_order_id',
            'razorpay_payment_id', 'razorpay_signature'
        ]


class UpdateOrderStatusSerializer(serializers.Serializer):
    """
    Worker: Dev - Admin order status update
    Worker: PM - Status flow validation
    """
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    tracking_number = serializers.CharField(required=False, allow_blank=True)
    tracking_url = serializers.URLField(required=False, allow_blank=True)
    admin_notes = serializers.CharField(required=False, allow_blank=True)
