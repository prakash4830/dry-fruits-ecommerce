"""
Unit tests for payment logic.

Worker: QA - Payment integration tests
"""

from decimal import Decimal
from unittest.mock import patch, MagicMock
import hmac
import hashlib

from django.test import TestCase
from django.contrib.auth import get_user_model

from orders.payments import RazorpayClient
from orders.models import Order

User = get_user_model()


class RazorpayClientTests(TestCase):
    """
    Worker: QA - Test Razorpay client methods
    """
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    @patch('orders.payments.settings')
    def test_client_initialization_with_keys(self, mock_settings):
        """Test client initializes with API keys"""
        mock_settings.RAZORPAY_KEY_ID = 'rzp_test_123'
        mock_settings.RAZORPAY_KEY_SECRET = 'secret_456'
        
        client = RazorpayClient()
        
        self.assertEqual(client.key_id, 'rzp_test_123')
        self.assertEqual(client.key_secret, 'secret_456')
    
    @patch('orders.payments.settings')
    def test_client_initialization_without_keys(self, mock_settings):
        """Test client handles missing API keys"""
        mock_settings.RAZORPAY_KEY_ID = ''
        mock_settings.RAZORPAY_KEY_SECRET = ''
        
        client = RazorpayClient()
        
        self.assertIsNone(client.client)
    
    @patch('orders.payments.razorpay.Client')
    @patch('orders.payments.settings')
    def test_create_order_success(self, mock_settings, mock_razorpay_client):
        """
        Worker: QA - Test order creation with Razorpay
        """
        mock_settings.RAZORPAY_KEY_ID = 'rzp_test_123'
        mock_settings.RAZORPAY_KEY_SECRET = 'secret_456'
        
        # Mock Razorpay response
        mock_client_instance = MagicMock()
        mock_client_instance.order.create.return_value = {
            'id': 'order_123',
            'amount': 100000,  # 1000 INR in paise
            'currency': 'INR',
            'receipt': 'NN-20260131-0001'
        }
        mock_razorpay_client.return_value = mock_client_instance
        
        client = RazorpayClient()
        result = client.create_order(
            amount=Decimal('1000.00'),
            receipt='NN-20260131-0001'
        )
        
        # Verify order creation was called with correct params
        mock_client_instance.order.create.assert_called_once()
        call_args = mock_client_instance.order.create.call_args[1]['data']
        
        self.assertEqual(call_args['amount'], 100000)  # Converted to paise
        self.assertEqual(call_args['currency'], 'INR')
        self.assertEqual(call_args['receipt'], 'NN-20260131-0001')
        
        self.assertEqual(result['id'], 'order_123')
    
    def test_verify_signature_valid(self):
        """
        Worker: QA - Test signature verification with valid signature
        """
        order_id = 'order_123'
        payment_id = 'pay_456'
        secret = 'secret_key'
        
        # Generate valid signature
        message = f"{order_id}|{payment_id}"
        expected_signature = hmac.new(
            key=secret.encode('utf-8'),
            msg=message.encode('utf-8'),
            digestmod=hashlib.sha256
        ).hexdigest()
        
        # Create client with mocked secret
        with patch('orders.payments.settings') as mock_settings:
            mock_settings.RAZORPAY_KEY_ID = 'rzp_test_123'
            mock_settings.RAZORPAY_KEY_SECRET = secret
            
            client = RazorpayClient()
            result = client.verify_signature(order_id, payment_id, expected_signature)
        
        self.assertTrue(result)
    
    def test_verify_signature_invalid(self):
        """
        Worker: QA - Test signature verification with invalid signature
        """
        order_id = 'order_123'
        payment_id = 'pay_456'
        secret = 'secret_key'
        invalid_signature = 'invalid_signature_here'
        
        with patch('orders.payments.settings') as mock_settings:
            mock_settings.RAZORPAY_KEY_ID = 'rzp_test_123'
            mock_settings.RAZORPAY_KEY_SECRET = secret
            
            client = RazorpayClient()
            result = client.verify_signature(order_id, payment_id, invalid_signature)
        
        self.assertFalse(result)
    
    def test_amount_conversion_to_paise(self):
        """
        Worker: QA - Test rupee to paise conversion
        """
        # Test various amounts
        test_cases = [
            (Decimal('100.00'), 10000),
            (Decimal('1.50'), 150),
            (Decimal('999.99'), 99999),
            (Decimal('0.01'), 1),
        ]
        
        for rupees, expected_paise in test_cases:
            paise = int(float(rupees) * 100)
            self.assertEqual(paise, expected_paise)


class PaymentIntegrationTests(TestCase):
    """
    Worker: QA - Test payment flow integration
    """
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.order = Order.objects.create(
            user=self.user,
            shipping_name='Test User',
            shipping_phone='9876543210',
            shipping_address_line1='123 Test St',
            shipping_city='Mumbai',
            shipping_state='Maharashtra',
            shipping_pincode='400001',
            subtotal=Decimal('500.00'),
            tax=Decimal('90.00'),
            shipping_cost=Decimal('50.00'),
            total_amount=Decimal('640.00'),
        )
    
    def test_order_number_generation(self):
        """Test that order numbers are generated correctly"""
        self.assertTrue(self.order.order_number.startswith('NN-'))
        self.assertEqual(len(self.order.order_number), 16)  # NN-YYYYMMDD-XXXX
    
    def test_order_default_status(self):
        """Test that new orders have pending status"""
        self.assertEqual(self.order.status, 'pending')
        self.assertEqual(self.order.payment_status, 'pending')
    
    def test_order_can_cancel(self):
        """Test order cancellation eligibility"""
        self.assertTrue(self.order.can_cancel)
        
        self.order.status = 'shipped'
        self.order.save()
        
        self.assertFalse(self.order.can_cancel)
    
    def test_order_is_paid(self):
        """Test payment status check"""
        self.assertFalse(self.order.is_paid)
        
        self.order.payment_status = 'paid'
        self.order.save()
        
        self.assertTrue(self.order.is_paid)
