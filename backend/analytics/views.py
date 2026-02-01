"""
Analytics views for Nectar & Nut E-commerce.

Worker: Dev - Dashboard and reporting APIs
Worker: BA - Maps to FR-A01 through FR-R05
"""

from datetime import datetime, timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.http import HttpResponse
from django.db.models import Sum, Count, Avg
from django.utils import timezone

from orders.models import Order, OrderItem
from products.models import Product
from .services import report_generator


class DashboardView(APIView):
    """
    Admin dashboard metrics.
    
    Worker: Dev - Dashboard API endpoint
    Worker: BA - Maps to FR-A01 through FR-A06
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Today's stats
        today_orders = Order.objects.filter(
            created_at__date=today,
            payment_status='paid'
        )
        today_revenue = today_orders.aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        # This week's stats
        week_orders = Order.objects.filter(
            created_at__date__gte=week_ago,
            payment_status='paid'
        )
        week_revenue = week_orders.aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        # This month's stats
        month_orders = Order.objects.filter(
            created_at__date__gte=month_ago,
            payment_status='paid'
        )
        month_stats = month_orders.aggregate(
            total_revenue=Sum('total_amount'),
            total_orders=Count('id'),
            avg_order_value=Avg('total_amount')
        )
        
        # Low stock products
        low_stock = Product.objects.filter(
            is_active=True,
            stock__lte=10
        ).count()
        
        out_of_stock = Product.objects.filter(
            is_active=True,
            stock=0
        ).count()
        
        # Top selling products (last 30 days)
        top_products = OrderItem.objects.filter(
            order__created_at__date__gte=month_ago,
            order__payment_status='paid'
        ).values('product_name').annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum('price')
        ).order_by('-total_quantity')[:5]
        
        # Recent orders
        recent_orders = Order.objects.all().order_by('-created_at')[:10]
        recent_orders_data = [
            {
                'id': o.id,
                'order_number': o.order_number,
                'customer': o.user.email,
                'total': float(o.total_amount),
                'status': o.status,
                'created_at': o.created_at.isoformat(),
            }
            for o in recent_orders
        ]
        
        # Daily revenue for chart (last 7 days)
        daily_revenue = []
        for i in range(7):
            date = today - timedelta(days=i)
            revenue = Order.objects.filter(
                created_at__date=date,
                payment_status='paid'
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            daily_revenue.append({
                'date': date.isoformat(),
                'revenue': float(revenue)
            })
        
        daily_revenue.reverse()  # Oldest to newest
        
        return Response({
            'today': {
                'revenue': float(today_revenue),
                'orders': today_orders.count(),
            },
            'week': {
                'revenue': float(week_revenue),
                'orders': week_orders.count(),
            },
            'month': {
                'revenue': float(month_stats['total_revenue'] or 0),
                'orders': month_stats['total_orders'] or 0,
                'avg_order_value': float(month_stats['avg_order_value'] or 0),
            },
            'inventory': {
                'low_stock': low_stock,
                'out_of_stock': out_of_stock,
            },
            'top_products': list(top_products),
            'recent_orders': recent_orders_data,
            'daily_revenue': daily_revenue,
        })


class GenerateSalesReportView(APIView):
    """
    Generate sales report (PDF/Excel).
    
    Worker: Dev - Report generation endpoint
    Worker: BA - Maps to FR-R01, FR-R04, FR-R05
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        # Get date range
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        format_type = request.data.get('format', 'pdf')
        
        if not start_date or not end_date:
            return Response({
                'error': 'start_date and end_date are required.'
            }, status=400)
        
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'error': 'Invalid date format. Use YYYY-MM-DD.'
            }, status=400)
        
        if format_type == 'excel':
            buffer = report_generator.generate_sales_excel(start_date, end_date)
            filename = f"sales_report_{start_date}_{end_date}.xlsx"
            content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        else:
            buffer = report_generator.generate_sales_pdf(start_date, end_date)
            filename = f"sales_report_{start_date}_{end_date}.pdf"
            content_type = 'application/pdf'
        
        response = HttpResponse(buffer.getvalue(), content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response


class GenerateInventoryReportView(APIView):
    """
    Generate inventory report (Excel).
    
    Worker: Dev - Inventory report endpoint
    Worker: BA - Maps to FR-R03
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        buffer = report_generator.generate_inventory_excel()
        
        today = timezone.now().strftime('%Y-%m-%d')
        filename = f"inventory_report_{today}.xlsx"
        
        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
