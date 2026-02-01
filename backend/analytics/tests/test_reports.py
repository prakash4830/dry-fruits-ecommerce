"""
Unit tests for report generation.

Worker: QA - Report generation tests
"""

from datetime import date, timedelta
from decimal import Decimal
from io import BytesIO

from django.test import TestCase
from django.contrib.auth import get_user_model

from analytics.services import ReportGenerator
from orders.models import Order, OrderItem
from products.models import Category, Product

User = get_user_model()


class ReportGeneratorTests(TestCase):
    """
    Worker: QA - Test report generation service
    """
    
    def setUp(self):
        # Create user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create category
        self.category = Category.objects.create(
            name='Premium Nuts',
            slug='premium-nuts'
        )
        
        # Create products
        self.product1 = Product.objects.create(
            category=self.category,
            name='Almonds',
            slug='almonds-250g',
            description='Premium almonds',
            price=Decimal('299.00'),
            stock=100,
            weight='250g'
        )
        
        self.product2 = Product.objects.create(
            category=self.category,
            name='Cashews',
            slug='cashews-250g',
            description='Premium cashews',
            price=Decimal('399.00'),
            stock=50,
            weight='250g'
        )
        
        # Create order
        self.order = Order.objects.create(
            user=self.user,
            shipping_name='Test User',
            shipping_phone='9876543210',
            shipping_address_line1='123 Test St',
            shipping_city='Mumbai',
            shipping_state='Maharashtra',
            shipping_pincode='400001',
            subtotal=Decimal('698.00'),
            tax=Decimal('125.64'),
            shipping_cost=Decimal('0.00'),
            total_amount=Decimal('823.64'),
            payment_status='paid',
            status='confirmed'
        )
        
        # Create order items
        OrderItem.objects.create(
            order=self.order,
            product=self.product1,
            product_name='Almonds',
            product_weight='250g',
            price=Decimal('299.00'),
            quantity=1
        )
        
        OrderItem.objects.create(
            order=self.order,
            product=self.product2,
            product_name='Cashews',
            product_weight='250g',
            price=Decimal('399.00'),
            quantity=1
        )
        
        self.report_generator = ReportGenerator()
    
    def test_get_sales_data(self):
        """
        Worker: QA - Test sales data retrieval
        """
        today = date.today()
        start_date = today - timedelta(days=7)
        end_date = today
        
        df, orders = self.report_generator.get_sales_data(start_date, end_date)
        
        # Should have 2 rows (2 order items)
        self.assertEqual(len(df), 2)
        
        # Check column names
        expected_columns = ['date', 'order_number', 'product', 'quantity', 'unit_price', 'total', 'status']
        self.assertListEqual(list(df.columns), expected_columns)
    
    def test_get_sales_data_empty(self):
        """
        Worker: QA - Test sales data with no orders in range
        """
        # Use dates in the past where no orders exist
        start_date = date(2020, 1, 1)
        end_date = date(2020, 1, 31)
        
        df, orders = self.report_generator.get_sales_data(start_date, end_date)
        
        self.assertEqual(len(df), 0)
    
    def test_get_summary_stats(self):
        """
        Worker: QA - Test summary statistics calculation
        """
        orders = Order.objects.filter(payment_status='paid')
        stats = self.report_generator.get_summary_stats(orders)
        
        self.assertEqual(stats['total_orders'], 1)
        self.assertEqual(stats['total_revenue'], Decimal('823.64'))
        self.assertEqual(stats['total_items'], 2)
    
    def test_get_summary_stats_empty(self):
        """
        Worker: QA - Test summary stats with no orders
        """
        orders = Order.objects.none()
        stats = self.report_generator.get_summary_stats(orders)
        
        self.assertEqual(stats['total_orders'], 0)
        self.assertEqual(stats['total_revenue'], Decimal('0.00'))
        self.assertEqual(stats['total_items'], 0)
    
    def test_generate_sales_pdf(self):
        """
        Worker: QA - Test PDF report generation
        """
        today = date.today()
        start_date = today - timedelta(days=7)
        end_date = today
        
        buffer = self.report_generator.generate_sales_pdf(start_date, end_date)
        
        # Check that we got a buffer with content
        self.assertIsInstance(buffer, BytesIO)
        content = buffer.getvalue()
        self.assertGreater(len(content), 0)
        
        # Check PDF header
        self.assertTrue(content.startswith(b'%PDF'))
    
    def test_generate_sales_excel(self):
        """
        Worker: QA - Test Excel report generation
        """
        today = date.today()
        start_date = today - timedelta(days=7)
        end_date = today
        
        buffer = self.report_generator.generate_sales_excel(start_date, end_date)
        
        # Check that we got a buffer with content
        self.assertIsInstance(buffer, BytesIO)
        content = buffer.getvalue()
        self.assertGreater(len(content), 0)
        
        # Check Excel header (XLSX files start with PK as they're ZIP archives)
        self.assertTrue(content.startswith(b'PK'))
    
    def test_generate_inventory_excel(self):
        """
        Worker: QA - Test inventory report generation
        """
        buffer = self.report_generator.generate_inventory_excel()
        
        # Check that we got a buffer with content
        self.assertIsInstance(buffer, BytesIO)
        content = buffer.getvalue()
        self.assertGreater(len(content), 0)
        
        # Check Excel header
        self.assertTrue(content.startswith(b'PK'))


class ReportDataValidationTests(TestCase):
    """
    Worker: QA - Test report data accuracy
    """
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.category = Category.objects.create(
            name='Test Category',
            slug='test-category'
        )
        
        self.report_generator = ReportGenerator()
    
    def test_revenue_calculation_accuracy(self):
        """
        Worker: QA - Verify revenue calculations match order totals
        """
        # Create multiple orders
        total_expected = Decimal('0.00')
        
        for i in range(5):
            order = Order.objects.create(
                user=self.user,
                shipping_name='Test User',
                shipping_phone='9876543210',
                shipping_address_line1='123 Test St',
                shipping_city='Mumbai',
                shipping_state='Maharashtra',
                shipping_pincode='400001',
                subtotal=Decimal('100.00') * (i + 1),
                tax=Decimal('18.00') * (i + 1),
                shipping_cost=Decimal('0.00'),
                total_amount=Decimal('118.00') * (i + 1),
                payment_status='paid'
            )
            total_expected += order.total_amount
        
        orders = Order.objects.filter(payment_status='paid')
        stats = self.report_generator.get_summary_stats(orders)
        
        self.assertEqual(stats['total_revenue'], total_expected)
        self.assertEqual(stats['total_orders'], 5)
    
    def test_low_stock_product_detection(self):
        """
        Worker: QA - Verify low stock detection in inventory reports
        """
        # Create products with various stock levels
        Product.objects.create(
            category=self.category,
            name='In Stock Product',
            slug='in-stock-product',
            description='Test',
            price=Decimal('100.00'),
            stock=50,
            weight='100g'
        )
        
        low_stock = Product.objects.create(
            category=self.category,
            name='Low Stock Product',
            slug='low-stock-product',
            description='Test',
            price=Decimal('100.00'),
            stock=5,
            low_stock_threshold=10,
            weight='100g'
        )
        
        out_of_stock = Product.objects.create(
            category=self.category,
            name='Out of Stock Product',
            slug='out-of-stock-product',
            description='Test',
            price=Decimal('100.00'),
            stock=0,
            weight='100g'
        )
        
        self.assertTrue(low_stock.is_low_stock)
        self.assertFalse(out_of_stock.is_in_stock)
