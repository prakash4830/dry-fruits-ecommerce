"""
Resend email service for Nectar & Nut E-commerce.

Worker: Dev - Email notification service
"""

import resend
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone

from .models import EmailLog


class EmailService:
    """
    Email service using Resend API.
    
    Worker: Dev - Email sending functionality
    Worker: BA - Maps to notification triggers in FRD
    """
    
    def __init__(self):
        self.api_key = settings.RESEND_API_KEY
        self.from_email = settings.RESEND_FROM_EMAIL
        
        if self.api_key:
            resend.api_key = self.api_key
    
    def send_email(self, to_email, to_name, subject, html_content, email_type, user=None, order=None):
        """
        Send an email via Resend.
        
        Worker: Dev - Core email sending method
        
        Args:
            to_email: Recipient email
            to_name: Recipient name
            subject: Email subject
            html_content: HTML email body
            email_type: Type of email (for logging)
            user: Related user (optional)
            order: Related order (optional)
        
        Returns:
            EmailLog instance
        """
        # Create log entry
        email_log = EmailLog.objects.create(
            email_type=email_type,
            recipient_email=to_email,
            recipient_name=to_name,
            subject=subject,
            user=user,
            order=order,
            status='pending'
        )
        
        if not self.api_key:
            # Development mode - just log
            email_log.status = 'sent'
            email_log.sent_at = timezone.now()
            email_log.save()
            print(f"[DEV] Email would be sent to {to_email}: {subject}")
            return email_log
        
        try:
            response = resend.Emails.send({
                "from": f"Nectar & Nut <{self.from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content
            })
            
            email_log.resend_id = response.get('id')
            email_log.status = 'sent'
            email_log.sent_at = timezone.now()
            email_log.save()
            
        except Exception as e:
            email_log.status = 'failed'
            email_log.error_message = str(e)
            email_log.save()
        
        return email_log
    
    def send_welcome_email(self, user):
        """
        Send welcome email to new user.
        
        Worker: Dev - Welcome email trigger
        Worker: BA - Maps to notification triggers
        """
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                <h1 style="color: white; margin: 0;">Welcome to Nectar & Nut! 🥜</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
                <p>Hi {user.first_name or 'there'},</p>
                <p>Thank you for joining Nectar & Nut! We're excited to have you.</p>
                <p>Browse our collection of premium dry fruits and candies:</p>
                <ul>
                    <li>🥜 Premium Almonds & Cashews</li>
                    <li>🍇 Finest Dried Grapes & Fruits</li>
                    <li>🍬 Artisan Candies & Sweets</li>
                </ul>
                <p style="text-align: center;">
                    <a href="{settings.FRONTEND_URL}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Start Shopping
                    </a>
                </p>
            </div>
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                <p>Nectar & Nut - Premium Dry Fruits & Candies</p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(
            to_email=user.email,
            to_name=user.first_name or user.username,
            subject="Welcome to Nectar & Nut! 🥜",
            html_content=html_content,
            email_type='welcome',
            user=user
        )
    
    def send_order_confirmation(self, order):
        """
        Send order confirmation email.
        
        Worker: Dev - Order confirmation email
        Worker: BA - Maps to FR-O07
        """
        items_html = ""
        for item in order.items.all():
            items_html += f"""
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{item.product_name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">₹{item.price}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">₹{item.total}</td>
            </tr>
            """
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
                <h1 style="color: white; margin: 0;">Order Confirmed! ✓</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
                <p>Hi {order.shipping_name},</p>
                <p>Thank you for your order! We're preparing it for shipment.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Order #{order.order_number}</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f3f4f6;">
                                <th style="padding: 10px; text-align: left;">Item</th>
                                <th style="padding: 10px; text-align: left;">Qty</th>
                                <th style="padding: 10px; text-align: left;">Price</th>
                                <th style="padding: 10px; text-align: left;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items_html}
                        </tbody>
                    </table>
                    <div style="margin-top: 15px; text-align: right;">
                        <p>Subtotal: ₹{order.subtotal}</p>
                        <p>Tax: ₹{order.tax}</p>
                        <p>Shipping: ₹{order.shipping_cost}</p>
                        <p style="font-size: 18px; font-weight: bold;">Total: ₹{order.total_amount}</p>
                    </div>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px;">
                    <h3 style="margin-top: 0;">Shipping Address</h3>
                    <p style="margin: 0;">
                        {order.shipping_name}<br>
                        {order.shipping_address_line1}<br>
                        {order.shipping_address_line2 if order.shipping_address_line2 else ''}
                        {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}<br>
                        Phone: {order.shipping_phone}
                    </p>
                </div>
            </div>
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                <p>Nectar & Nut - Premium Dry Fruits & Candies</p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(
            to_email=order.user.email,
            to_name=order.shipping_name,
            subject=f"Order Confirmed - #{order.order_number}",
            html_content=html_content,
            email_type='order_confirmation',
            user=order.user,
            order=order
        )
    
    def send_order_shipped(self, order):
        """
        Send order shipped notification.
        
        Worker: Dev - Shipping notification email
        Worker: BA - Maps to FR-OH05
        """
        tracking_html = ""
        if order.tracking_url:
            tracking_html = f"""
            <p style="text-align: center;">
                <a href="{order.tracking_url}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Track Your Order
                </a>
            </p>
            """
        elif order.tracking_number:
            tracking_html = f"<p>Tracking Number: <strong>{order.tracking_number}</strong></p>"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px; text-align: center;">
                <h1 style="color: white; margin: 0;">Your Order is on its way! 📦</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
                <p>Hi {order.shipping_name},</p>
                <p>Great news! Your order <strong>#{order.order_number}</strong> has been shipped.</p>
                
                {tracking_html}
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                    <h3 style="margin-top: 0;">Delivery Address</h3>
                    <p style="margin: 0;">
                        {order.shipping_name}<br>
                        {order.shipping_address_line1}<br>
                        {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
                    </p>
                </div>
            </div>
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                <p>Nectar & Nut - Premium Dry Fruits & Candies</p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(
            to_email=order.user.email,
            to_name=order.shipping_name,
            subject=f"Your order is on its way! - #{order.order_number}",
            html_content=html_content,
            email_type='order_shipped',
            user=order.user,
            order=order
        )


# Singleton instance
email_service = EmailService()
