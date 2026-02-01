"""
Order URL configuration.

Worker: Dev - Order and payment routes
"""

from django.urls import path
from . import views

urlpatterns = [
    # Customer Endpoints
    path('', views.OrderListView.as_view(), name='order_list'),
    path('create/', views.CreateOrderView.as_view(), name='create_order'),
    path('validate-coupon/', views.ValidateCouponView.as_view(), name='validate_coupon'),
    path('<int:pk>/', views.OrderDetailView.as_view(), name='order_detail'),
    path('<int:pk>/invoice/', views.DownloadInvoiceView.as_view(), name='download_invoice'),
    
    # Payment Endpoints
    path('payments/create/', views.CreatePaymentView.as_view(), name='create_payment'),
    path('payments/verify/', views.VerifyPaymentView.as_view(), name='verify_payment'),
]

# Admin URLs
admin_urlpatterns = [
    path('', views.AdminOrderListView.as_view(), name='admin_order_list'),
    path('<int:pk>/', views.AdminOrderDetailView.as_view(), name='admin_order_detail'),
    path('<int:pk>/status/', views.AdminUpdateOrderStatusView.as_view(), name='admin_update_status'),
]
