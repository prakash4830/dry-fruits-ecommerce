"""
Cart serializers for Nectar & Nut E-commerce.

Worker: Dev - API serialization for shopping cart
"""

from rest_framework import serializers
from .models import Cart, CartItem
from products.models import Product
from products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    """
    Worker: Dev - Cart item with product details
    """
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source='product',
        write_only=True
    )
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'total']
        read_only_fields = ['id', 'total']
    
    def validate_quantity(self, value):
        """
        Worker: QA - Validate quantity is positive
        """
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value
    
    def validate(self, attrs):
        """
        Worker: QA - Stock validation
        Worker: BA - Maps to FR-C07
        """
        product = attrs.get('product')
        quantity = attrs.get('quantity', 1)
        
        if product and quantity > product.stock:
            raise serializers.ValidationError({
                'quantity': f"Only {product.stock} items available in stock."
            })
        
        return attrs


class CartSerializer(serializers.ModelSerializer):
    """
    Worker: Dev - Full cart with all items and totals
    Worker: BA - Maps to FR-C06
    """
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    tax = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    shipping = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Cart
        fields = [
            'id', 'items', 'total_items', 
            'subtotal', 'tax', 'shipping', 'total',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AddToCartSerializer(serializers.Serializer):
    """
    Worker: Dev - Add item to cart input
    Worker: BA - Maps to FR-C01
    """
    product_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(required=True, min_value=1)
    
    def validate_product_id(self, value):
        try:
            product = Product.objects.get(id=value, is_active=True)
            if not product.is_in_stock:
                raise serializers.ValidationError("Product is out of stock.")
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found.")
        return value


class UpdateCartItemSerializer(serializers.Serializer):
    """
    Worker: Dev - Update cart item quantity
    Worker: BA - Maps to FR-C03
    """
    quantity = serializers.IntegerField(required=True, min_value=1)
