"""
Analytics models for Nectar & Nut E-commerce.

Worker: Dev - Business analytics and reporting
Worker: BA - Maps to FR-A01 through FR-R05 in FRD
"""

from django.db import models
from django.conf import settings


class DailySalesMetric(models.Model):
    """
    Daily aggregated sales metrics.
    
    Worker: Dev - Pre-computed metrics for dashboard performance
    Worker: PM - Critical for business decision making
    """
    date = models.DateField(unique=True)
    
    # Revenue Metrics
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_orders = models.PositiveIntegerField(default=0)
    total_items_sold = models.PositiveIntegerField(default=0)
    
    # Order Status Breakdown
    pending_orders = models.PositiveIntegerField(default=0)
    completed_orders = models.PositiveIntegerField(default=0)
    cancelled_orders = models.PositiveIntegerField(default=0)
    
    # Customer Metrics
    new_customers = models.PositiveIntegerField(default=0)
    returning_customers = models.PositiveIntegerField(default=0)
    
    # Average Metrics
    average_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Daily Sales Metric"
        verbose_name_plural = "Daily Sales Metrics"
        ordering = ['-date']
    
    def __str__(self):
        return f"Sales for {self.date}"


class ProductSalesMetric(models.Model):
    """
    Product-level sales tracking.
    
    Worker: Dev - Track best sellers and low performers
    Worker: BA - Maps to FR-A03
    """
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='sales_metrics'
    )
    date = models.DateField()
    
    quantity_sold = models.PositiveIntegerField(default=0)
    revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    class Meta:
        verbose_name = "Product Sales Metric"
        verbose_name_plural = "Product Sales Metrics"
        unique_together = ('product', 'date')
        ordering = ['-date', '-revenue']
    
    def __str__(self):
        return f"{self.product.name} - {self.date}"


class InventorySnapshot(models.Model):
    """
    Daily inventory snapshot for tracking stock levels.
    
    Worker: Dev - Historical inventory data
    Worker: PM - Inventory trend analysis
    """
    date = models.DateField()
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='inventory_snapshots'
    )
    stock_level = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = "Inventory Snapshot"
        verbose_name_plural = "Inventory Snapshots"
        unique_together = ('date', 'product')
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.product.name} - {self.date}: {self.stock_level} units"


class GeneratedReport(models.Model):
    """
    Track generated reports for download.
    
    Worker: Dev - Report generation history
    Worker: BA - Maps to FR-R01 through FR-R05
    """
    REPORT_TYPES = (
        ('sales', 'Sales Report'),
        ('products', 'Product Report'),
        ('inventory', 'Inventory Report'),
    )
    
    FORMAT_CHOICES = (
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
    )
    
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    
    # Date Range
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Generated File
    file = models.FileField(upload_to='reports/')
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(default=0)  # in bytes
    
    # Metadata
    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Generated Report"
        verbose_name_plural = "Generated Reports"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_report_type_display()} ({self.start_date} to {self.end_date})"
