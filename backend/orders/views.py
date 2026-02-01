"""
Order views for Nectar & Nut E-commerce.

Worker: Dev - Order and payment APIs
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db import transaction
from django.utils import timezone

from .models import Order, OrderItem, OrderTimeline
from .serializers import (
    OrderListSerializer,
    OrderDetailSerializer,
    CreateOrderSerializer,
    CreatePaymentSerializer,
    VerifyPaymentSerializer,
    OrderAdminSerializer,
    UpdateOrderStatusSerializer,
)
from cart.models import Cart
from users.models import Address
from .payments import razorpay_client


class OrderListView(generics.ListAPIView):
    """
    List user's orders.
    
    Worker: Dev - Order history endpoint
    Worker: BA - Maps to FR-OH01
    """
    serializer_class = OrderListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    """
    Get order details.
    
    Worker: Dev - Order detail endpoint
    Worker: BA - Maps to FR-OH02
    """
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class CreateOrderView(APIView):
    """
    Create order from cart.
    
    Worker: Dev - Checkout flow - create order
    Worker: BA - Maps to FR-O01, FR-O02
    """
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = CreateOrderSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Get cart
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response(
                {'error': 'Cart is empty.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if cart.items.count() == 0:
            return Response(
                {'error': 'Cart is empty.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get shipping address
        address = Address.objects.get(id=serializer.validated_data['address_id'])

        # Get billing address (use shipping if not provided)
        billing_id = serializer.validated_data.get('billing_address_id') or serializer.validated_data['address_id']
        billing_address = Address.objects.get(id=billing_id)

        # Calculate Coupon Discount
        coupon_code = serializer.validated_data.get('coupon_code')
        discount_amount = 0
        
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code, is_active=True)
                now = timezone.now()
                if coupon.valid_from <= now <= coupon.valid_to:
                    # Check min purchase
                    if cart.subtotal >= coupon.min_purchase_amount:
                        if coupon.discount_type == 'percentage':
                            discount_amount = (cart.subtotal * coupon.discount_value) / 100
                            if coupon.max_discount_amount:
                                discount_amount = min(discount_amount, coupon.max_discount_amount)
                        else:
                            discount_amount = coupon.discount_value
                        
                        # Increment usage logic could go here
                        coupon.used_count += 1
                        coupon.save()
            except Coupon.DoesNotExist:
                pass # Ignore invalid coupons at this stage or raise error
        
        # Create order
        order = Order.objects.create(
            user=request.user,
            # Shipping
            shipping_name=address.full_name,
            shipping_phone=address.phone,
            shipping_address_line1=address.address_line1,
            shipping_address_line2=address.address_line2,
            shipping_city=address.city,
            shipping_state=address.state,
            shipping_pincode=address.pincode,
            # Billing
            billing_name=billing_address.full_name,
            billing_phone=billing_address.phone,
            billing_address_line1=billing_address.address_line1,
            billing_address_line2=billing_address.address_line2,
            billing_city=billing_address.city,
            billing_state=billing_address.state,
            billing_pincode=billing_address.pincode,
            # Totals
            subtotal=cart.subtotal,
            tax=cart.tax,
            shipping_cost=cart.shipping,
            discount_amount=discount_amount,
            coupon_code=coupon_code,
            total_amount=cart.total - discount_amount, # Recalculate total
            customer_notes=serializer.validated_data.get('customer_notes', '')
        )
        
        # Create order items
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                product_name=cart_item.product.name,
                product_sku=cart_item.product.sku,
                product_weight=cart_item.product.weight,
                price=cart_item.product.price,
                quantity=cart_item.quantity
            )
            
            # Worker: Dev - Decrease stock
            cart_item.product.stock -= cart_item.quantity
            cart_item.product.save()
        
        # Create timeline entry
        OrderTimeline.objects.create(
            order=order,
            status='pending',
            message='Order created successfully.'
        )
        
        # Clear cart
        cart.clear()
        
        return Response({
            'message': 'Order created successfully.',
            'order': OrderDetailSerializer(order).data
        }, status=status.HTTP_201_CREATED)


class ValidateCouponView(APIView):
    """
    Validate coupon code.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code')
        cart_total = request.data.get('total') # Pass current cart subtotal
        
        if not code:
            return Response({'error': 'Code is required'}, status=400)
            
        try:
            coupon = Coupon.objects.get(code=code, is_active=True)
            now = timezone.now()
            
            if not (coupon.valid_from <= now <= coupon.valid_to):
                return Response({'error': 'Coupon expired'}, status=400)
                
            if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
                return Response({'error': 'Coupon usage limit reached'}, status=400)

            # Calculate potential discount
            discount = 0
            if cart_total:
                amount = float(cart_total)
                if amount < float(coupon.min_purchase_amount):
                    return Response({
                        'error': f'Minimum purchase of ₹{coupon.min_purchase_amount} required'
                    }, status=400)
                
                if coupon.discount_type == 'percentage':
                    discount = (amount * float(coupon.discount_value)) / 100
                    if coupon.max_discount_amount:
                        discount = min(discount, float(coupon.max_discount_amount))
                else:
                    discount = float(coupon.discount_value)
            
            return Response({
                'valid': True,
                'code': coupon.code,
                'discount_amount': discount,
                'message': 'Coupon applied successfully'
            })
            
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid coupon code'}, status=400)


class CreatePaymentView(APIView):
    """
    Create Razorpay payment order.
    
    Worker: Dev - Payment initiation
    Worker: BA - Maps to FR-O03
    Worker: QA - Unit test required
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CreatePaymentSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        order = Order.objects.get(id=serializer.validated_data['order_id'])
        
        # Create Razorpay order
        try:
            razorpay_order = razorpay_client.create_order(
                amount=order.total_amount,
                receipt=order.order_number
            )
            
            # Save Razorpay order ID
            order.razorpay_order_id = razorpay_order['id']
            order.save()
            
            return Response({
                'order_id': razorpay_order['id'],
                'amount': razorpay_order['amount'],
                'currency': razorpay_order['currency'],
                'key_id': razorpay_client.key_id
            })
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyPaymentView(APIView):
    """
    Verify Razorpay payment signature.
    
    Worker: Dev - Payment verification
    Worker: QA - Security critical - signature verification
    Worker: BA - Maps to FR-O05, FR-O06
    Worker: QA - Unit test required
    """
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        razorpay_order_id = serializer.validated_data['razorpay_order_id']
        razorpay_payment_id = serializer.validated_data['razorpay_payment_id']
        razorpay_signature = serializer.validated_data['razorpay_signature']
        
        # Get order
        try:
            order = Order.objects.get(
                user=request.user,
                razorpay_order_id=razorpay_order_id
            )
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verify signature
        if razorpay_client.verify_signature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        ):
            # Update order
            order.razorpay_payment_id = razorpay_payment_id
            order.razorpay_signature = razorpay_signature
            order.payment_status = 'paid'
            order.status = 'confirmed'
            order.save()
            
            # Add timeline entry
            OrderTimeline.objects.create(
                order=order,
                status='confirmed',
                message='Payment received successfully.'
            )
            
            # Worker: Dev - Trigger order confirmation email via signals
            
            return Response({
                'success': True,
                'message': 'Payment verified successfully.',
                'order': OrderDetailSerializer(order).data
            })
        else:
            order.payment_status = 'failed'
            order.save()
            
            return Response({
                'success': False,
                'error': 'Payment verification failed.'
            }, status=status.HTTP_400_BAD_REQUEST)


# Admin Views


class AdminOrderListView(generics.ListAPIView):
    """
    Admin: List all orders.
    
    Worker: Dev - Admin order management
    Worker: BA - Maps to FR-OP01
    """
    queryset = Order.objects.all()
    serializer_class = OrderAdminSerializer
    permission_classes = [IsAdminUser]


class AdminOrderDetailView(generics.RetrieveAPIView):
    """
    Admin: Get order details.
    
    Worker: Dev - Admin order detail
    Worker: BA - Maps to FR-OP02
    """
    queryset = Order.objects.all()
    serializer_class = OrderAdminSerializer
    permission_classes = [IsAdminUser]


class AdminUpdateOrderStatusView(APIView):
    """
    Admin: Update order status.
    
    Worker: Dev - Admin status update
    Worker: PM - Status flow validation
    Worker: BA - Maps to FR-OP03, FR-OP04
    """
    permission_classes = [IsAdminUser]
    
    @transaction.atomic
    def put(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = UpdateOrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        new_status = serializer.validated_data['status']
        old_status = order.status
        
        order.status = new_status
        
        if serializer.validated_data.get('tracking_number'):
            order.tracking_number = serializer.validated_data['tracking_number']
        
        if serializer.validated_data.get('tracking_url'):
            order.tracking_url = serializer.validated_data['tracking_url']
        
        if serializer.validated_data.get('admin_notes'):
            order.admin_notes = serializer.validated_data['admin_notes']
        
        # Set timestamps
        if new_status == 'shipped' and old_status != 'shipped':
            order.shipped_at = timezone.now()
        elif new_status == 'delivered' and old_status != 'delivered':
            order.delivered_at = timezone.now()
        
        order.save()
        
        # Add timeline entry
        OrderTimeline.objects.create(
            order=order,
            status=new_status,
            message=f'Order status changed to {new_status}.',
            created_by=request.user
        )
        
        # Worker: Dev - Trigger status change email via signals
        
        return Response({
            'message': 'Order status updated.',
            'order': OrderAdminSerializer(order).data
        })


class DownloadInvoiceView(APIView):
    """
    Download order invoice as PDF.
    
    Worker: Dev - Invoice generation
    Worker: BA - Maps to FR-OH06
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generate PDF invoice
        from django.http import HttpResponse
        from .invoice import generate_invoice_pdf
        
        pdf = generate_invoice_pdf(order)
        
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="invoice-{order.order_number}.pdf"'
        
        return response

