"""
Razorpay payment integration for Nectar & Nut E-commerce.

Worker: Dev - Payment gateway client
Worker: QA - Unit tests required for all methods
"""

import razorpay
import hmac
import hashlib
from django.conf import settings


class RazorpayClient:
    """
    Razorpay API client wrapper.
    
    Worker: Dev - Razorpay integration
    Worker: BA - Maps to FR-O03, FR-O04
    """
    
    def __init__(self):
        self.key_id = settings.RAZORPAY_KEY_ID
        self.key_secret = settings.RAZORPAY_KEY_SECRET
        
        if self.key_id and self.key_secret:
            self.client = razorpay.Client(
                auth=(self.key_id, self.key_secret)
            )
        else:
            self.client = None
    
    def create_order(self, amount, receipt, currency='INR'):
        """
        Create a Razorpay order.
        
        Worker: Dev - Order creation for payment
        Worker: QA - Test with various amounts
        
        Args:
            amount: Order amount in Rupees (will be converted to paise)
            receipt: Order reference number
            currency: Currency code (default: INR)
        
        Returns:
            Razorpay order object
        """
        if not self.client:
            raise Exception("Razorpay client not configured. Check API keys.")
        
        # Convert to paise (Razorpay uses smallest currency unit)
        amount_in_paise = int(float(amount) * 100)
        
        order_data = {
            'amount': amount_in_paise,
            'currency': currency,
            'receipt': receipt,
            'payment_capture': 1  # Auto-capture payment
        }
        
        return self.client.order.create(data=order_data)
    
    def verify_signature(self, order_id, payment_id, signature):
        """
        Verify Razorpay payment signature.
        
        Worker: Dev - Signature verification
        Worker: QA - Security critical - must test thoroughly
        
        Args:
            order_id: Razorpay order ID
            payment_id: Razorpay payment ID
            signature: Razorpay signature
        
        Returns:
            bool: True if signature is valid
        """
        if not self.key_secret:
            raise Exception("Razorpay key secret not configured.")
        
        # Generate expected signature
        message = f"{order_id}|{payment_id}"
        expected_signature = hmac.new(
            key=self.key_secret.encode('utf-8'),
            msg=message.encode('utf-8'),
            digestmod=hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
    
    def fetch_payment(self, payment_id):
        """
        Fetch payment details from Razorpay.
        
        Worker: Dev - Payment status check
        """
        if not self.client:
            raise Exception("Razorpay client not configured.")
        
        return self.client.payment.fetch(payment_id)
    
    def refund_payment(self, payment_id, amount=None):
        """
        Initiate refund for a payment.
        
        Worker: Dev - Refund processing
        Worker: PM - Refund logic for order cancellation
        
        Args:
            payment_id: Razorpay payment ID
            amount: Amount to refund in Rupees (None for full refund)
        
        Returns:
            Razorpay refund object
        """
        if not self.client:
            raise Exception("Razorpay client not configured.")
        
        refund_data = {}
        if amount:
            refund_data['amount'] = int(float(amount) * 100)
        
        return self.client.payment.refund(payment_id, refund_data)


# Singleton instance
razorpay_client = RazorpayClient()
