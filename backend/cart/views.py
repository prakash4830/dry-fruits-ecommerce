"""
Cart views for Nectar & Nut E-commerce.

Worker: Dev - Shopping cart APIs
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from .models import Cart, CartItem
from .serializers import (
    CartSerializer,
    CartItemSerializer,
    AddToCartSerializer,
    UpdateCartItemSerializer,
)
from products.models import Product


def get_or_create_cart(request):
    """
    Worker: Dev - Get cart for user or session
    Supports both authenticated and guest users.
    """
    if request.user.is_authenticated:
        cart, created = Cart.objects.get_or_create(user=request.user)
        return cart
    else:
        session_id = request.session.session_key
        if not session_id:
            request.session.create()
            session_id = request.session.session_key
        
        cart, created = Cart.objects.get_or_create(session_id=session_id)
        return cart


class CartView(APIView):
    """
    Get current cart or clear it.
    
    Worker: Dev - Cart retrieval and clearing
    Worker: BA - Maps to FR-C02, FR-C05
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        cart = get_or_create_cart(request)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)
    
    def delete(self, request):
        cart = get_or_create_cart(request)
        cart.clear()
        return Response({'message': 'Cart cleared successfully.'})


class AddToCartView(APIView):
    """
    Add item to cart.
    
    Worker: Dev - Add product to cart
    Worker: BA - Maps to FR-C01
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']
        
        product = Product.objects.get(id=product_id)
        cart = get_or_create_cart(request)
        
        # Check if item already in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            # Update quantity if already exists
            new_quantity = cart_item.quantity + quantity
            if new_quantity > product.stock:
                return Response({
                    'error': f'Only {product.stock} items available. You have {cart_item.quantity} in cart.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            cart_item.quantity = new_quantity
            cart_item.save()
        
        return Response({
            'message': 'Item added to cart.',
            'cart': CartSerializer(cart, context={'request': request}).data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CartItemView(APIView):
    """
    Update or remove cart item.
    
    Worker: Dev - Cart item management
    Worker: BA - Maps to FR-C03, FR-C04
    """
    permission_classes = [AllowAny]
    
    def put(self, request, item_id):
        """Update cart item quantity"""
        cart = get_or_create_cart(request)
        
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        quantity = serializer.validated_data['quantity']
        
        if quantity > cart_item.product.stock:
            return Response({
                'error': f'Only {cart_item.product.stock} items available.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        cart_item.quantity = quantity
        cart_item.save()
        
        return Response({
            'message': 'Cart item updated.',
            'cart': CartSerializer(cart, context={'request': request}).data
        })
    
    def delete(self, request, item_id):
        """Remove cart item"""
        cart = get_or_create_cart(request)
        
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        cart_item.delete()
        
        return Response({
            'message': 'Item removed from cart.',
            'cart': CartSerializer(cart, context={'request': request}).data
        })


class MergeCartView(APIView):
    """
    Merge guest cart with user cart after login.
    
    Worker: Dev - Cart persistence across login
    Worker: BA - Guest cart preserved after registration
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        if not request.user.is_authenticated:
            return Response(
                {'error': 'User must be authenticated.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        session_id = request.session.session_key
        if not session_id:
            return Response({'message': 'No guest cart to merge.'})
        
        try:
            guest_cart = Cart.objects.get(session_id=session_id)
        except Cart.DoesNotExist:
            return Response({'message': 'No guest cart to merge.'})
        
        # Get or create user cart
        user_cart, _ = Cart.objects.get_or_create(user=request.user)
        
        # Merge items
        for item in guest_cart.items.all():
            user_item, created = CartItem.objects.get_or_create(
                cart=user_cart,
                product=item.product,
                defaults={'quantity': item.quantity}
            )
            
            if not created:
                user_item.quantity = min(
                    user_item.quantity + item.quantity,
                    item.product.stock
                )
                user_item.save()
        
        # Delete guest cart
        guest_cart.delete()
        
        return Response({
            'message': 'Cart merged successfully.',
            'cart': CartSerializer(user_cart, context={'request': request}).data
        })
