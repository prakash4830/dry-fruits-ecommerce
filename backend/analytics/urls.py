"""
Analytics URL configuration.

Worker: Dev - Dashboard and reporting routes
"""

from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('reports/sales/', views.GenerateSalesReportView.as_view(), name='sales_report'),
    path('reports/inventory/', views.GenerateInventoryReportView.as_view(), name='inventory_report'),
]
